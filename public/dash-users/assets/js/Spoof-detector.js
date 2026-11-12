// server.js
require('dotenv').config();
const { Live } = require('@databento/databento');
const WebSocket = require('ws');

const PX = 1e9;
const UNDEF_PRICE = BigInt("9223372036854775807");
const LIVE_WINDOW_NS = 5000000000n;
const REPLACE_FLUSH_SECS = 0.3;

// إعداد خادم WebSocket للتواصل مع المتصفح
const wss = new WebSocket.Server({ port: 8080 });
let browserClient = null;

wss.on('connection', (ws) => {
    browserClient = ws;
    console.log("✅ المتصفح اتصل بالسيرفر بنجاح!");
});

// ---------------------------------------------------------
// منطق الكشف (مترجم من البايثون)
// ---------------------------------------------------------
class Order {
    constructor(oid, side, px, size, born) {
        this.oid = oid; this.side = side; this.px = px; this.size = size;
        this.orig = size; this.born = born; this.exec = 0n; this.replaces = 0;
        this.fill_seq = -1n; this.min_dist = Infinity; this.tracked = false;
        this.eaten_alerted = false; this.new_alerted = false;
    }
}

class Book {
    constructor(sym, config) {
        this.sym = sym; this.config = config;
        this.orders = new Map(); this.tracked = new Map();
        this.pending = null; this.last_px = null; this.size_ema = null;
    }

    thr() { return Math.max(this.config.min_shares, this.config.wall_mult * (this.size_ema || 0)); }

    dist(o) {
        if (!this.last_px) return null;
        return Math.abs(Number(o.px) / PX - this.last_px) / this.last_px;
    }

    onRecord(rec, now_ns) {
        let seq = rec.sequence;
        let live = (now_ns - BigInt(rec.ts_recv)) < LIVE_WINDOW_NS;

        if (this.pending !== null && this.pending.seq !== seq) this.finalizePending(live);

        if (rec.action === 'A') this._add(rec, rec.side, rec.ts_event, seq, live);
        else if (rec.action === 'C') this._cancel(rec, rec.ts_event, seq, live);
        else if (rec.action === 'F') this._fill(rec, seq);
        else if (rec.action === 'T') this._trade(rec);
        else if (rec.action === 'M') this._modify(rec);
        else if (rec.action === 'R') this.reset();
    }

    _trade(rec) {
        if (BigInt(rec.price) === UNDEF_PRICE) return;
        this.last_px = Number(rec.price) / PX;
        for (let o of this.tracked.values()) {
            let d = this.dist(o);
            if (d !== null && d < o.min_dist) o.min_dist = d;
        }
    }

    _fill(rec, seq) {
        let o = this.orders.get(rec.order_id);
        if (!o) return;
        o.exec += BigInt(rec.size); o.fill_seq = seq;
    }

    _modify(rec) {
        let o = this.orders.get(rec.order_id);
        if (!o) return;
        o.px = rec.price; o.size = rec.size;
        o.orig = Math.max(o.orig, o.size);
    }

    _add(rec, side, ts, seq, live) {
        if ((side !== 'A' && side !== 'B') || BigInt(rec.price) === UNDEF_PRICE) return;
        let sz = rec.size, px = rec.price;
        let o = new Order(rec.order_id, side, px, sz, ts);

        if (this.pending !== null && this.pending.seq === seq) {
            let old = this.pending.order;
            this.pending = null;
            o.born = old.born; o.replaces = old.replaces + 1;
            o.exec = old.exec; o.orig = Math.max(old.orig, sz);
            o.tracked = old.tracked; o.min_dist = old.min_dist;
        }

        this.orders.set(o.oid, o);
        if (this.size_ema === null) this.size_ema = Math.min(sz, 1000);
        else this.size_ema += 0.01 * (Math.min(sz, 20 * this.size_ema) - this.size_ema);

        if (!o.tracked && sz >= this.thr() && (sz * (Number(px) / PX)) >= this.config.min_notional) {
            o.tracked = true;
        }

        if (o.tracked) {
            this.tracked.set(o.oid, o);
            let d = this.dist(o);
            if (d !== null && d < o.min_dist) o.min_dist = d;
            if (this.config.alert_new && !o.new_alerted) {
                o.new_alerted = true;
                this._emit("NEW", o, ts, live);
            }
        }
    }

    _cancel(rec, ts, seq, live) {
        let o = this.orders.get(rec.order_id);
        if (!o) return;
        let qty = BigInt(Math.min(rec.size, o.size));
        let is_exec = (o.fill_seq === seq);

        o.size -= qty;
        if (o.size > 0n) {
            if (!o.tracked) return;
            if (is_exec) this._afterExec(o, ts, live);
            else if (o.size < 0.5 * this.thr()) {
                this.tracked.delete(o.oid);
                this._final(o, ts, "pulled", live);
            }
            return;
        }

        this.orders.delete(o.oid);
        if (is_exec) {
            if (o.tracked) { this.tracked.delete(o.oid); this._final(o, ts, "executed", live); }
        } else {
            this.tracked.delete(o.oid);
            this.pending = { seq, order: o, ts, wallTime: Date.now() / 1000 };
        }
    }

    _afterExec(o, ts, live) {
        if (o.eaten_alerted || !o.orig) return;
        if (Number(o.exec) / Number(o.orig) >= 0.5) {
            o.eaten_alerted = true;
            this._emit("EATEN", o, ts, live);
        }
    }

    finalizePending(live) {
        let p = this.pending; this.pending = null;
        if (!p) return;
        if (p.order.tracked) { this._final(p.order, p.ts, "cancel", live); p.order.tracked = false; }
    }

    _final(o, ts_end, how, live) {
        let life = Math.max(0, (Number(ts_end - o.born)) / 1e9);
        let frac = o.orig ? Math.min(1, Number(o.exec) / Number(o.orig)) : 0;

        if (how === "executed" || frac >= this.config.real_frac) {
            this._emit("REAL", o, ts_end, live, Math.round(frac * 100)); return;
        }

        let thr_d = this.config.approach_pct / 100.0;
        let d_end = this.dist(o);
        let score = 45.0 * (1.0 - frac);

        if (d_end !== null && d_end <= thr_d) score += 25;
        else if (o.min_dist <= thr_d) score += 10;
        if (life < 5) score += 20;
        else if (life < 30) score += 10;
        if (o.replaces >= 2) score += 10;
        if (life > 120) score -= 25;

        score = Math.max(0, Math.min(100, Math.round(score)));
        let kind = (frac < 0.15 && score >= this.config.fake_score) ? "FAKE" : "MIXED";
        this._emit(kind, o, ts_end, live, score, how);
    }

    _emit(kind, o, ts, live, score = null, how = "") {
        if (kind === "MIXED") return; // تجاهل غير المحسوم لتخفيف الضغط
        if (!live) return; // فقط الأحداث المباشرة

        let d_end = this.dist(o);
        let life = Math.max(0, (Number(ts - o.born)) / 1e9);
        let frac = o.orig ? Math.min(1, Number(o.exec) / Number(o.orig)) : 0;

        let alertData = {
            kind: kind, symbol: this.sym, side: o.side,
            price: Number(o.px) / PX, size: Number(o.orig), remaining: Number(o.size),
            exec_pct: frac * 100, life_s: life, replaces: o.replaces, score: score, how: how,
            dist_end_pct: d_end === null ? null : d_end * 100,
            time_et: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })
        };

        // إرسال التنبيه للمتصفح
        if (browserClient && browserClient.readyState === WebSocket.OPEN) {
            browserClient.send(JSON.stringify(alertData));
        }
        console.log(`[${kind}] ${this.sym} ${o.side} Size: ${o.orig}`);
    }
}

// ---------------------------------------------------------
// تشغيل الاتصال بـ Databento
// ---------------------------------------------------------
async function start() {
    // حط مفتاحك الجديد هنا
    const API_KEY = process.env.DATABENTO_API_KEY || "YOUR_NEW_API_KEY_HERE";

    const config = {
        min_shares: 5000, min_notional: 10000.0, wall_mult: 8.0,
        approach_pct: 0.8, fake_score: 60, real_frac: 0.7, alert_new: true
    };

    const books = new Map();
    const client = new Live({ key: API_KEY });

    console.log("⏳ جاري الاتصال بـ Databento (Nasdaq TotalView)...");

    client.subscribe({
        dataset: 'XNAS.ITCH',
        schema: 'mbo',
        symbols: ['AAPL', 'TSLA'], // ضع الأسهم اللي تريدها هنا
        stype_in: 'raw_symbol'
    });

    // مؤقت لتنظيف الأوامر القديمة
    setInterval(() => {
        let now = Date.now() / 1000;
        for (let b of books.values()) {
            if (b.pending !== null && (now - b.pending.wallTime) > REPLACE_FLUSH_SECS) {
                b.finalizePending(true);
            }
        }
    }, 250);

    // استقبال البيانات
    for await (const record of client) {
        if (record.action) {
            let iid = record.instrument_id;
            if (!books.has(iid)) {
                books.set(iid, new Book(record.stype_in_symbol || 'STK', config));
            }
            books.get(iid).onRecord(record, BigInt(Date.now()) * 1000000n);
        }
    }
}

start().catch(console.error);
