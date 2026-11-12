/* ============================================================================
   LIVE TRADINGVIEW CHART + PINE SCRIPT SCALPING ENGINE (assets/js/chart.js)
   EMA 9 (Red), EMA 200 (Blue), VWAP (Green) @ 1m + Pine Script Overlay Colors
   + REAL vs FAKE BREAKOUT detector (momentum scalping)
============================================================================ */
(function () {
  "use strict";

  let currentSymbol = '';
  let currentInterval = localStorage.getItem('mh_chart_interval') || '1';
  let lastSignalPayload = null;
  let lastRenderedKey = '';
  let pinePollTimer = null;
  let lastAlertState = false;

  const PINE_CONFIG = {
    emaFastLen: 9,
    emaSlowLen: 200,
    atrLen: 14,
    atrMultiplier: 1.5
  };

  // ---------------------------------------------------------------------------
  // Breakout engine config (نفس منطق الـ Pine Script بالأسفل)
  // ---------------------------------------------------------------------------
  const BO_CONFIG = {
    lookback: 20,      // عدد الشموع لحساب أعلى/أدنى رينج
    minBars: 8,        // أقل عدد شموع مكتملة لبدء التحليل
    volLen: 20,        // متوسط الفوليوم
    volMult: 1.5,      // الفوليوم لازم يكون أعلى من المتوسط × الرقم ده
    bodyRatio: 0.6,    // جسم الشمعة / مدى الشمعة (اختراق حقيقي)
    wickRatio: 0.5,    // ذيل الرفض / مدى الشمعة (اختراق وهمي)
    failBars: 3,       // عدد الشموع للرجوع تحت/فوق المستوى = اختراق فاشل
    emaFast: 9,
    emaSlow: 21,
    maxCandles: 300,
    recentBars: 4      // نعرض آخر حدث لو حصل في آخر X شموع
  };

  // شموع 1m تتبني من التحديث الدوري للسعر (كل 15 ثانية)
  const candleStore = {};   // sym -> { candles: [], lastCumVol: null, lastPrice: null }
  let lastBoKey = '';
  let lastBoSym = '';

  // كود الـ Pine Script: اختراق حقيقي / وهمي على الشارت مباشرة
  const RAW_PINE_SCRIPT = `//@version=5
indicator("Momentum Scalper - Real vs Fake Breakout (EMA 9/200 + VWAP)", overlay=true, max_labels_count=500)

emaFastLen = input.int(9, "EMA 9 Length", group="Moving Averages")
emaSlowLen = input.int(200, "EMA 200 Length", group="Moving Averages")
atrLen     = input.int(14, "ATR Length", group="Risk & ATR")
atrMult    = input.float(1.5, "ATR Multiplier for SL", step=0.1, group="Risk & ATR")

lookback   = input.int(20, "Range Lookback (bars)", minval=5, group="Breakout")
failBars   = input.int(3, "Fail window (bars)", minval=1, group="Breakout")
bodyRatio  = input.float(0.6, "Min body/range (real)", minval=0.1, maxval=1.0, step=0.05, group="Breakout")
wickRatio  = input.float(0.5, "Min rejection wick/range (fake)", minval=0.1, maxval=1.0, step=0.05, group="Breakout")

useVol     = input.bool(true, "Require volume spike", group="Filters")
volLen     = input.int(20, "Volume MA Length", group="Filters")
volMult    = input.float(1.5, "Volume x Average", step=0.1, group="Filters")
useTrend   = input.bool(true, "Require VWAP + EMA 9 alignment", group="Filters")

showTrade  = input.bool(true, "Show Entry / SL / TP labels", group="Display")
showLevels = input.bool(true, "Show breakout levels", group="Display")
showWeak   = input.bool(true, "Show weak breakouts", group="Display")

emaFast = ta.ema(close, emaFastLen)
emaSlow = ta.ema(close, emaSlowLen)
myVwap  = ta.vwap(hlc3)
myAtr   = ta.atr(atrLen)

plot(emaFast, color=color.red,   title="EMA 9",   linewidth=2)
plot(emaSlow, color=color.blue,  title="EMA 200", linewidth=2)
plot(myVwap,  color=color.green, title="VWAP",    linewidth=2)

resistance = ta.highest(high, lookback)[1]
support    = ta.lowest(low, lookback)[1]
plot(showLevels ? resistance : na, "Resistance", color=color.new(color.red, 50),   style=plot.style_stepline)
plot(showLevels ? support : na,    "Support",    color=color.new(color.green, 50), style=plot.style_stepline)

rng        = high - low
body       = math.abs(close - open)
upperWick  = high - math.max(open, close)
lowerWick  = math.min(open, close) - low
strongBody = rng > 0 and (body / rng) >= bodyRatio

volAvg    = ta.sma(volume, volLen)
volOk     = not useVol or (not na(volAvg) and volume > volAvg * volMult)
bullTrend = not useTrend or (close > myVwap and close > emaFast)
bearTrend = not useTrend or (close < myVwap and close < emaFast)

breakUp = ta.crossover(close, resistance)
breakDn = ta.crossunder(close, support)

realUp = breakUp and strongBody and close > open and volOk and bullTrend
realDn = breakDn and strongBody and close < open and volOk and bearTrend
weakUp = breakUp and not realUp
weakDn = breakDn and not realDn

trapUp = high > resistance and close <= resistance and rng > 0 and (upperWick / rng) >= wickRatio and not nz(close[1] > resistance[1])
trapDn = low < support and close >= support and rng > 0 and (lowerWick / rng) >= wickRatio and not nz(close[1] < support[1])

var float upLvl = na
var int   upBar = na
var float dnLvl = na
var int   dnBar = na

failUp = not na(upLvl) and bar_index > upBar and (bar_index - upBar) <= failBars and close < upLvl
failDn = not na(dnLvl) and bar_index > dnBar and (bar_index - dnBar) <= failBars and close > dnLvl

if failUp or (not na(upBar) and (bar_index - upBar) > failBars)
    upLvl := na
    upBar := na
if failDn or (not na(dnBar) and (bar_index - dnBar) > failBars)
    dnLvl := na
    dnBar := na

if breakUp
    upLvl := resistance
    upBar := bar_index
if breakDn
    dnLvl := support
    dnBar := bar_index

fakeUp = trapUp or failUp
fakeDn = trapDn or failDn

plotshape(showWeak and weakUp, "Weak Break Up",   shape.diamond, location.belowbar, color.new(color.gray, 20), size=size.tiny)
plotshape(showWeak and weakDn, "Weak Break Down", shape.diamond, location.abovebar, color.new(color.gray, 20), size=size.tiny)

f_price(x) => str.tostring(x, format.mintick)

if realUp
    float entryPrice = close
    float slPrice    = close - (myAtr * atrMult)
    float risk       = entryPrice - slPrice
    string txt = "✅ REAL BREAKOUT ↑"
    if showTrade
        txt := txt + "\\nEntry: " + f_price(entryPrice) + "\\nSL: " + f_price(slPrice) + "\\nTP1: " + f_price(entryPrice + risk) + "\\nTP2: " + f_price(entryPrice + risk * 2) + "\\nTP3: " + f_price(entryPrice + risk * 3)
    label.new(bar_index, low, txt, color=color.green, textcolor=color.white, style=label.style_label_up)

if realDn
    float entryPrice = close
    float slPrice    = close + (myAtr * atrMult)
    float risk       = slPrice - entryPrice
    string txt = "✅ REAL BREAKOUT ↓"
    if showTrade
        txt := txt + "\\nEntry: " + f_price(entryPrice) + "\\nSL: " + f_price(slPrice) + "\\nTP1: " + f_price(entryPrice - risk) + "\\nTP2: " + f_price(entryPrice - risk * 2) + "\\nTP3: " + f_price(entryPrice - risk * 3)
    label.new(bar_index, high, txt, color=color.red, textcolor=color.white, style=label.style_label_down)

if fakeUp
    label.new(bar_index, high, "❌ FAKE ↑\\nBull Trap", color=color.orange, textcolor=color.black, style=label.style_label_down)
if fakeDn
    label.new(bar_index, low, "❌ FAKE ↓\\nBear Trap", color=color.yellow, textcolor=color.black, style=label.style_label_up)

alertcondition(realUp, "Real Breakout UP",   "اختراق حقيقي لأعلى ✅")
alertcondition(realDn, "Real Breakout DOWN", "اختراق حقيقي لأسفل ✅")
alertcondition(fakeUp, "Fake Breakout UP",   "اختراق وهمي لأعلى ❌ Bull Trap")
alertcondition(fakeDn, "Fake Breakout DOWN", "اختراق وهمي لأسفل ❌ Bear Trap")`;

  function getTheme() {
    return document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark';
  }

  function isNum(n) { return n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n)); }
  function fmt(n, d) {
    if (!isNum(n)) return '—';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function getWorkerBase() {
    const apiInput = document.getElementById('api');
    // تصحيح: الـ regex القديم كان بيدور على علامة $ حرفية بدل نهاية النص
    let b = (apiInput && apiInput.value ? apiInput.value : '').trim().replace(/\/+$/, '');
    if (!b) b = 'https://small-disk-18d3stock-proxy.osamaanit.workers.dev';
    if (!/^https?:\/\//i.test(b)) b = 'https://' + b;
    return b;
  }

  function getCachedStockForSym(sym) {
    try {
      const cached = JSON.parse(localStorage.getItem('mh_cached_quote_data') || 'null');
      if (cached && String(cached.sym).toUpperCase() === sym && isNum(cached.price) && Number(cached.price) > 0) {
        return cached;
      }
    } catch (e) {}
    return null;
  }

  // ===========================================================================
  // BREAKOUT ENGINE: بناء شموع 1m من التحديثات + تحليل Real / Fake
  // ===========================================================================
  function recordTick(sym, price, cumVol) {
    if (!isNum(price) || Number(price) <= 0) return;
    const p = Number(price);
    const t = Math.floor(Date.now() / 60000) * 60000;

    let st = candleStore[sym];
    if (!st) st = candleStore[sym] = { candles: [], lastCumVol: null, lastPrice: null };
    st.lastPrice = p;

    // الفوليوم: الفرق بين إجمالي فوليوم اليوم في آخر تحديثين
    let vDelta = 0;
    if (isNum(cumVol)) {
      const cv = Number(cumVol);
      if (st.lastCumVol !== null && cv >= st.lastCumVol) vDelta = cv - st.lastCumVol;
      st.lastCumVol = cv;
    }

    const last = st.candles[st.candles.length - 1];
    if (last && last.t === t) {
      last.h = Math.max(last.h, p);
      last.l = Math.min(last.l, p);
      last.c = p;
      last.v += vDelta;
    } else {
      const o = last ? last.c : p;
      st.candles.push({ t, o, h: Math.max(o, p), l: Math.min(o, p), c: p, v: vDelta });
      if (st.candles.length > BO_CONFIG.maxCandles) st.candles.shift();
    }
  }

  // لو الـ Worker عندك يقدر يرجّع شموع 1m جاهزة (OHLCV) تقدر تبعتها هنا فيشتغل الكاشف فوراً
  // candles: [{ t: ms, o, h, l, c, v }, ...] بترتيب زمني
  window.seedBreakoutCandles = function (sym, candles) {
    const s = String(sym || '').trim().toUpperCase();
    if (!s || !Array.isArray(candles) || !candles.length) return;
    const clean = candles
      .filter(k => k && isNum(k.t) && isNum(k.o) && isNum(k.h) && isNum(k.l) && isNum(k.c))
      .map(k => ({ t: Math.floor(Number(k.t) / 60000) * 60000, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: isNum(k.v) ? +k.v : 0 }))
      .sort((a, b) => a.t - b.t);
    const st = candleStore[s] || (candleStore[s] = { candles: [], lastCumVol: null, lastPrice: null });
    st.candles = clean.slice(-BO_CONFIG.maxCandles);
    const lastC = st.candles[st.candles.length - 1];
    if (lastC) st.lastPrice = lastC.c;
  };

  function emaArr(vals, len) {
    const k = 2 / (len + 1);
    const out = [];
    let prev = 0;
    for (let i = 0; i < vals.length; i++) {
      prev = i === 0 ? vals[i] : vals[i] * k + prev * (1 - k);
      out.push(prev);
    }
    return out;
  }

  // تحليل الاختراقات على الشموع المكتملة فقط (نفس منطق الـ Pine)
  function analyzeBreakouts(sym) {
    const cfg = BO_CONFIG;
    const st = candleStore[sym];
    const nowMin = Math.floor(Date.now() / 60000) * 60000;
    const c = st ? st.candles.filter(k => k.t < nowMin) : [];
    const n = c.length;

    if (n < cfg.minBars) return { ready: false, have: n, need: cfg.minBars };

    const L = Math.min(cfg.lookback, n - 2);
    const res = [], sup = [];
    for (let i = L; i < n; i++) {
      let hi = -Infinity, lo = Infinity;
      for (let k = i - L; k < i; k++) { hi = Math.max(hi, c[k].h); lo = Math.min(lo, c[k].l); }
      res[i] = hi; sup[i] = lo;
    }

    const closes = c.map(k => k.c);
    const ef = emaArr(closes, cfg.emaFast);
    const es = emaArr(closes, cfg.emaSlow);

    const events = [];
    let upPend = null, dnPend = null;

    for (let i = L + 1; i < n; i++) {
      const k = c[i];
      const rng = k.h - k.l;
      const body = Math.abs(k.c - k.o);
      const upW = k.h - Math.max(k.o, k.c);
      const loW = Math.min(k.o, k.c) - k.l;
      const strong = rng > 0 && (body / rng) >= cfg.bodyRatio;

      let vs = 0, vc = 0;
      for (let j = Math.max(0, i - cfg.volLen); j < i; j++) { vs += c[j].v; vc++; }
      const vAvg = vc ? vs / vc : 0;
      const volOk = vAvg <= 0 || k.v > vAvg * cfg.volMult;   // لو مفيش بيانات فوليوم الفلتر بيتعطل

      const bullT = ef[i] > es[i] && k.c > ef[i];
      const bearT = ef[i] < es[i] && k.c < ef[i];

      const breakUp = k.c > res[i] && c[i - 1].c <= res[i - 1];
      const breakDn = k.c < sup[i] && c[i - 1].c >= sup[i - 1];

      // فشل الاختراق: رجوع للمستوى خلال failBars
      if (upPend && (i - upPend.i) > cfg.failBars) upPend = null;
      if (dnPend && (i - dnPend.i) > cfg.failBars) dnPend = null;
      let failedUp = false, failedDn = false;
      if (upPend && k.c < upPend.lvl) { failedUp = true; events.push({ i, t: k.t, type: 'FAKE_UP', how: 'fail', lvl: upPend.lvl }); upPend = null; }
      if (dnPend && k.c > dnPend.lvl) { failedDn = true; events.push({ i, t: k.t, type: 'FAKE_DN', how: 'fail', lvl: dnPend.lvl }); dnPend = null; }

      // ذيل رفض
      const trapUp = k.h > res[i] && k.c <= res[i] && rng > 0 && (upW / rng) >= cfg.wickRatio && !(c[i - 1].c > res[i - 1]);
      const trapDn = k.l < sup[i] && k.c >= sup[i] && rng > 0 && (loW / rng) >= cfg.wickRatio && !(c[i - 1].c < sup[i - 1]);
      if (trapUp && !failedUp) events.push({ i, t: k.t, type: 'FAKE_UP', how: 'wick', lvl: res[i] });
      if (trapDn && !failedDn) events.push({ i, t: k.t, type: 'FAKE_DN', how: 'wick', lvl: sup[i] });

      if (breakUp) {
        const real = strong && k.c > k.o && volOk && bullT;
        events.push({ i, t: k.t, type: real ? 'REAL_UP' : 'WEAK_UP', lvl: res[i] });
        upPend = { i, lvl: res[i] };
      }
      if (breakDn) {
        const real = strong && k.c < k.o && volOk && bearT;
        events.push({ i, t: k.t, type: real ? 'REAL_DN' : 'WEAK_DN', lvl: sup[i] });
        dnPend = { i, lvl: sup[i] };
      }
    }

    // المستويات الحالية للشمعة الجارية
    let curRes = -Infinity, curSup = Infinity;
    for (let k = n - L; k < n; k++) { curRes = Math.max(curRes, c[k].h); curSup = Math.min(curSup, c[k].l); }

    const live = st && isNum(st.lastPrice) ? Number(st.lastPrice) : null;
    let liveState = null;
    if (live !== null) {
      if (live > curRes) liveState = 'TESTING_UP';
      else if (live < curSup) liveState = 'TESTING_DN';
    }

    const recent = events.filter(e => e.i >= n - cfg.recentBars);
    const latest = recent.length ? recent[recent.length - 1] : null;

    return { ready: true, have: n, need: cfg.minBars, resistance: curRes, support: curSup, events, latest, liveState };
  }

  function boText(ev) {
    const up = ev.type.endsWith('_UP');
    const arrow = up ? '↑' : '↓';
    if (ev.type.startsWith('REAL')) return `✅ اختراق حقيقي ${arrow}`;
    if (ev.type.startsWith('WEAK')) return `⚠️ اختراق ضعيف ${arrow}`;
    return up ? '❌ اختراق وهمي ↑ (Bull Trap)' : '❌ اختراق وهمي ↓ (Bear Trap)';
  }

  function boClass(ev) {
    if (ev.type.startsWith('REAL')) return ev.type.endsWith('_UP') ? 'bg-success text-white' : 'bg-danger text-white';
    if (ev.type.startsWith('WEAK')) return 'bg-secondary text-white';
    return 'bg-warning text-dark';
  }

  function boTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function updateBreakoutUI(sym) {
    const cleanSym = String(sym || '').trim().toUpperCase();
    const row = document.getElementById('boHudRow');
    const container = document.getElementById('tv_chart_container');
    const an = analyzeBreakouts(cleanSym);

    let box = document.getElementById('breakoutFloatBox');
    if (!box && container) {
      box = document.createElement('div');
      box.id = 'breakoutFloatBox';
      container.appendChild(box);
    }

    if (!an.ready) {
      if (row) row.innerHTML = `<span class="small text-body-secondary">⏳ كاشف الاختراق: جمع شموع 1m (${an.have}/${an.need}) — لازم صفحة تفضل مفتوحة، أو استخدم الـ Pine Script على الشارت</span>`;
      if (box) box.style.display = 'none';
      return;
    }

    const dec = an.resistance < 1 ? 4 : 2;
    const ev = an.latest;
    let html = '';
    if (ev) {
      html += `<span class="badge ${boClass(ev)}">${esc(boText(ev))}</span> <span class="small text-body-secondary">@ $${fmt(ev.lvl, dec)} · ${esc(boTime(ev.t))} NY</span>`;
    } else {
      html += `<span class="small text-body-secondary">لا يوجد اختراق حديث</span>`;
    }
    if (an.liveState) {
      const t = an.liveState === 'TESTING_UP' ? '🔎 السعر فوق المقاومة الآن (لسه الشمعة ما قفلتش)' : '🔎 السعر تحت الدعم الآن (لسه الشمعة ما قفلتش)';
      html += ` <span class="badge bg-info text-dark">${t}</span>`;
    }
    html += ` <span class="small text-body-secondary" dir="ltr">R: $${fmt(an.resistance, dec)} | S: $${fmt(an.support, dec)}</span>`;
    if (row) row.innerHTML = html;

    if (box) {
      if (ev || an.liveState) {
        const txt = ev ? boText(ev) : (an.liveState === 'TESTING_UP' ? '🔎 يختبر المقاومة' : '🔎 يختبر الدعم');
        const cls = ev ? boClass(ev) : 'bg-info text-dark';
        box.className = `bo-floating-label ${cls}`;
        box.textContent = txt;
        box.style.display = 'block';
      } else {
        box.style.display = 'none';
      }
    }

    // تنبيه صوتي عند ظهور حدث جديد (من غير صوت عند تغيير الرمز)
    const key = ev ? `${cleanSym}_${ev.t}_${ev.type}_${ev.how || ''}` : '';
    if (cleanSym !== lastBoSym) {
      lastBoSym = cleanSym;
      lastBoKey = key;
    } else if (key && key !== lastBoKey) {
      lastBoKey = key;
      playAlertTone();
    }
  }

  // ===========================================================================

  async function evaluatePineStrategyLive(symbol, interval) {
    const cleanSym = String(symbol).trim().toUpperCase();
    const base = getWorkerBase();

    try {
      const scanRes = await fetch(base + '/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: [{ left: 'name', operation: 'equal', right: cleanSym }],
          range: [0, 5]
        })
      });

      if (scanRes.ok) {
        const sj = await scanRes.json();
        const row = (sj.data || []).find(item => String(item.symbol).toUpperCase() === cleanSym);
        if (row && isNum(row.price) && Number(row.price) > 0) {
          return computePineFromStockRow(cleanSym, row, true);
        }
      }
    } catch (e) {}

    try {
      const qRes = await fetch(`${base}/?symbol=${encodeURIComponent(cleanSym)}`);
      if (qRes.ok) {
        const qj = await qRes.json();
        const cached = getCachedStockForSym(cleanSym);
        const price = Number(qj.price || qj.regularMarketPrice || qj.c || cached?.price || 0);
        if (price > 0) {
          return computePineFromStockRow(cleanSym, {
            price: price,
            changePct: Number(qj.changePercent || qj.dp || cached?.chg || 0),
            high: Number(qj.high || qj.regularMarketDayHigh || qj.h || 0),
            low: Number(qj.low || qj.regularMarketDayLow || qj.l || 0),
            open: Number(qj.open || qj.regularMarketOpen || qj.o || 0),
            volume: qj.volume || qj.regularMarketVolume || qj.v,
            vwapDiff: qj.vwapDiff
          }, true);
        }
      }
    } catch (e) {}

    return null;
  }

  function computePineFromStockRow(symbol, row, record = false) {
    const close = Number(row.price);

    // تسجيل التيك لبناء شموع 1m (فقط من البيانات الحية، مش من الكاش)
    if (record) recordTick(symbol, close, row.volume);

    const chgPct = Number(row.changePct ?? row.chg ?? 0);
    const prevClose = close / (1 + (chgPct / 100));

    const high = (isNum(row.high) && Number(row.high) >= close) ? Number(row.high) : Math.max(close, prevClose) * 1.02;
    const low = (isNum(row.low) && Number(row.low) > 0 && Number(row.low) <= close) ? Number(row.low) : Math.min(close, prevClose) * 0.98;

    let myVwap;
    if (isNum(row.vwapDiff)) {
      myVwap = close / (1 + (Number(row.vwapDiff) / 100));
    } else {
      myVwap = (high + low + close) / 3;
    }

    const momentumFactor = chgPct / 100;
    const emaFast = close * (1 - (momentumFactor * 0.08));
    const emaSlow = close * (1 - (momentumFactor * 0.35));

    const dayTrueRange = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    const myAtr = Math.max(close * 0.008, dayTrueRange * 0.16);

    const isBullish = (emaFast >= emaSlow) && (close >= myVwap * 0.998);
    const isBearish = (emaFast < emaSlow) && (close < myVwap * 0.998);
    const isLong = !isBearish;

    const entryPrice = close;
    const slPrice = isLong ? entryPrice - (myAtr * 1.5) : entryPrice + (myAtr * 1.5);
    const risk = Math.max(0.0001, Math.abs(entryPrice - slPrice));
    const tp1Price = isLong ? entryPrice + risk : entryPrice - risk;
    const tp2Price = isLong ? entryPrice + (risk * 2) : entryPrice - (risk * 2);
    const tp3Price = isLong ? entryPrice + (risk * 3) : entryPrice - (risk * 3);

    const result = {
      symbol,
      price: close,
      emaFast,
      emaSlow,
      vwap: myVwap,
      atr: myAtr,
      isLong,
      entryPrice,
      sl: slPrice,
      tp1: tp1Price,
      tp2: tp2Price,
      tp3: tp3Price
    };

    checkEmaVwapAlerts(result);
    return result;
  }

  function playAlertTone() {
    const soundSwitch = document.getElementById('wlAlertSound');
    if (soundSwitch && !soundSwitch.checked) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  function checkEmaVwapAlerts(sig) {
    if (!sig) return;
    const p = Number(sig.price);
    const ema9 = Number(sig.emaFast);
    const vwap = Number(sig.vwap);

    const isBelowEma9 = p < ema9;
    const isBelowVwap = p < vwap;
    const isBelowBoth = isBelowEma9 && isBelowVwap;

    let alertBanner = document.getElementById('emaVwapAlertBanner');
    const container = document.getElementById('tv_chart_container');
    if (!container) return;

    if (!alertBanner) {
      alertBanner = document.createElement('div');
      alertBanner.id = 'emaVwapAlertBanner';
      alertBanner.style.cssText = 'position:absolute; bottom:12px; right:16px; z-index:25; padding:8px 14px; border-radius:6px; font-size:12px; font-weight:bold; backdrop-filter:blur(6px); display:none; box-shadow:0 4px 12px rgba(0,0,0,0.5);';
      container.style.position = 'relative';
      container.appendChild(alertBanner);
    }

    if (isBelowBoth) {
      alertBanner.style.display = 'block';
      alertBanner.className = 'bg-danger text-white border border-light';
      alertBanner.innerHTML = `⚠️ تنبيه: السعر تحت (EMA 9 الأحمر & VWAP الأخضر) معاً!`;
      if (!lastAlertState) { playAlertTone(); lastAlertState = true; }
    } else if (isBelowEma9 || isBelowVwap) {
      alertBanner.style.display = 'block';
      alertBanner.className = 'bg-warning text-dark border border-dark';
      const targetName = isBelowEma9 ? 'EMA 9 (الأحمر)' : 'VWAP (الأخضر)';
      alertBanner.innerHTML = `🔔 تنبيه: السعر هبط تحت خط الـ ${targetName}`;
      if (!lastAlertState) { playAlertTone(); lastAlertState = true; }
    } else {
      alertBanner.style.display = 'none';
      lastAlertState = false;
    }
  }

  function injectChartHudStyles() {
    if (document.getElementById('sniper-chart-hud-styles')) return;
    const style = document.createElement('style');
    style.id = 'sniper-chart-hud-styles';
    style.textContent = `
      #tv_chart_container { min-height: 520px !important; height: 520px !important; width: 100% !important; display: block !important; position: relative !important; }
      #tv_widget_inner { height: 520px !important; width: 100% !important; }
      .pine-floating-label { position: absolute; top: 52px; left: 16px; z-index: 20; padding: 10px 14px; border-radius: 8px; color: #fff; font-family: monospace; font-size: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.22); }
      .pine-floating-label.pine-buy { background: rgba(22, 163, 74, 0.94); border-left: 4px solid #86efac; }
      .pine-floating-label.pine-sell { background: rgba(220, 38, 38, 0.94); border-left: 4px solid #fca5a5; }
      .bo-floating-label { position: absolute; top: 52px; right: 16px; z-index: 20; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 800; box-shadow: 0 10px 25px rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.22); display: none; }
      .sniper-hud-box { background: linear-gradient(145deg, #070b14 0%, #0f172a 100%); border: 1px solid #1e293b; border-top: 3px solid #38bdf8; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; color: #ffffff; }
      .sniper-targets-grid { display: grid; grid-template-columns: repeat(5, minmax(100px, 1fr)); gap: 8px; margin-top: 10px; }
      .sniper-t-card { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 10px; cursor: pointer; }
      .st-lbl { font-size: 10.5px; font-weight: 800; color: #94a3b8; }
      .st-val { font-size: 16px; font-weight: 900; color: #ffffff; margin: 3px 0; }
      .copy-pine-btn { background: #1e293b; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 5px; padding: 3px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
      #boHudRow { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); }
    `;
    document.head.appendChild(style);
  }
  injectChartHudStyles();

  function buildSignalFromInputsOrData(sym, customData, pineLive) {
    const cleanSym = String(sym || '').trim().toUpperCase();
    if (!pineLive) {
      const cached = getCachedStockForSym(cleanSym);
      if (cached) {
        pineLive = computePineFromStockRow(cleanSym, { price: cached.price, changePct: cached.chg });
      } else if (customData && isNum(customData.price)) {
        pineLive = computePineFromStockRow(cleanSym, customData);
      }
    }

    if (pineLive && isNum(pineLive.price)) {
      const dec = pineLive.price < 1 ? 4 : 2;
      return {
        symbol: cleanSym,
        price: pineLive.entryPrice,
        tp1: pineLive.tp1,
        tp2: pineLive.tp2,
        tp3: pineLive.tp3,
        sl: pineLive.sl,
        isLong: pineLive.isLong,
        pineLive: pineLive,
        setupName: 'EMA 9 (Red) / 200 (Blue) + VWAP (Green)',
        label: pineLive.isLong ? '🟢 BUY' : '🔴 SELL',
        cosmicSignals: [
          `🔴 EMA 9: $${fmt(pineLive.emaFast, dec)}`,
          `🔵 EMA 200: $${fmt(pineLive.emaSlow, dec)}`,
          `🟢 VWAP: $${fmt(pineLive.vwap, dec)}`
        ]
      };
    }
    return null;
  }

  function renderFloatingPineLabel(sig) {
    const container = document.getElementById('tv_chart_container');
    if (!container) return;
    let box = document.getElementById('pineFloatingBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pineFloatingBox';
      container.appendChild(box);
    }
    if (!sig || !sig.price) { box.style.display = 'none'; return; }
    const dec = sig.price < 1 ? 4 : 2;
    box.className = `pine-floating-label ${sig.isLong ? 'pine-buy' : 'pine-sell'}`;
    box.style.display = 'block';
    box.dir = 'ltr';
    box.innerHTML = `
      <div style="font-weight:900;font-size:13px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.28);padding-bottom:3px;">
        ${sig.label} (${esc(sig.symbol)})
      </div>
      <div><b>Entry:</b> $${fmt(sig.price, dec)}</div>
      <div><b>SL:</b> $${fmt(sig.sl, dec)}</div>
      <div><b>TP1:</b> $${fmt(sig.tp1, dec)}</div>
    `;
  }

  function renderChartSignalHud(sym, rawSignal, pineLive = null) {
    const container = document.getElementById('tv_chart_container');
    if (!container) return;
    let hudContainer = document.getElementById('chartSniperHud');
    if (!hudContainer) {
      hudContainer = document.createElement('div');
      hudContainer.id = 'chartSniperHud';
      container.parentNode.insertBefore(hudContainer, container);
    }

    const cleanSym = String(sym || currentSymbol || '').trim().toUpperCase();
    const sig = buildSignalFromInputsOrData(cleanSym, rawSignal, pineLive);
    if (!sig) {
      hudContainer.innerHTML = `<div class="sniper-hud-box" dir="rtl" style="text-align:center;padding:12px;">⏳ جاري جلب مؤشرات <b>${esc(cleanSym)}</b> على فريم 1m...</div>`;
      return;
    }

    lastSignalPayload = sig;
    renderFloatingPineLabel(sig);

    const p = Number(sig.price), dec = p < 1 ? 4 : 2;
    hudContainer.innerHTML = `
      <div class="sniper-hud-box" dir="rtl">
        <div class="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary fs-6">${esc(cleanSym)}</span>
            <span class="badge ${sig.isLong ? 'bg-success' : 'bg-danger'}">${esc(sig.label)}</span>
            <span class="small text-body-secondary">الإستراتيجية: <b class="text-info">${esc(sig.setupName)}</b></span>
          </div>
        </div>
        <div class="sniper-targets-grid" dir="ltr">
          <div class="sniper-t-card" data-apply-target="${p.toFixed(dec)}">
            <div class="st-lbl">ENTRY</div>
            <div class="st-val text-info">$${fmt(p, dec)}</div>
          </div>
          <div class="sniper-t-card" data-apply-target="${sig.tp1.toFixed(dec)}">
            <div class="st-lbl">TP1 (1R)</div>
            <div class="st-val text-success">$${fmt(sig.tp1, dec)}</div>
          </div>
          <div class="sniper-t-card" data-apply-target="${sig.tp2.toFixed(dec)}">
            <div class="st-lbl">TP2 (2R)</div>
            <div class="st-val text-info">$${fmt(sig.tp2, dec)}</div>
          </div>
          <div class="sniper-t-card" data-apply-target="${sig.tp3.toFixed(dec)}">
            <div class="st-lbl">TP3 (3R)</div>
            <div class="st-val text-warning">$${fmt(sig.tp3, dec)}</div>
          </div>
          <div class="sniper-t-card" data-apply-target="${sig.sl.toFixed(dec)}">
            <div class="st-lbl">STOP LOSS</div>
            <div class="st-val text-danger">$${fmt(sig.sl, dec)}</div>
          </div>
        </div>
        <div id="boHudRow" dir="rtl"></div>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2 pt-2 border-top">
          <div class="d-flex gap-1">${sig.cosmicSignals.map(s => `<span class="badge bg-secondary">${esc(s)}</span>`).join('')}</div>
          <button type="button" class="copy-pine-btn" id="copyPineScriptBtn">📋 نسخ Pine Script</button>
        </div>
      </div>
    `;

    updateBreakoutUI(cleanSym);

    document.getElementById('copyPineScriptBtn')?.addEventListener('click', function () {
      navigator.clipboard.writeText(RAW_PINE_SCRIPT).then(() => {
        this.textContent = '✅ تم النسخ!';
        setTimeout(() => { this.textContent = '📋 نسخ Pine Script'; }, 2000);
      });
    });

    hudContainer.querySelectorAll('[data-apply-target]').forEach(card => {
      card.addEventListener('click', function () {
        const val = this.getAttribute('data-apply-target');
        if ($('buy')) $('buy').value = p;
        if ($('sell') && val) {
          $('sell').value = val;
          if (typeof window.calc === 'function') window.calc();
        }
      });
    });
  }

  async function triggerLivePineEvaluation(sym, fallbackSignal) {
    const cleanSym = String(sym || '').trim().toUpperCase();
    if (!cleanSym) return;
    const pineData = await evaluatePineStrategyLive(cleanSym, currentInterval);
    if (pineData && cleanSym === currentSymbol) {
      renderChartSignalHud(cleanSym, fallbackSignal, pineData);
    }
  }

  function renderLiveChart(symbol, scrollToChart = false, signalData = null, forceRebuild = false) {
    if (!symbol) return;
    const cleanSym = String(symbol).trim().toUpperCase();
    if (!cleanSym) return;

    currentSymbol = cleanSym;
    const section = document.getElementById('chartSection');
    const container = document.getElementById('tv_chart_container');
    const badge = document.getElementById('chartSymbolBadge');
    if (!section || !container) return;

    section.hidden = false;
    if (badge) badge.textContent = cleanSym;

    renderChartSignalHud(cleanSym, signalData);
    triggerLivePineEvaluation(cleanSym, signalData);

    if (pinePollTimer) clearInterval(pinePollTimer);
    pinePollTimer = setInterval(() => {
      if (currentSymbol) triggerLivePineEvaluation(currentSymbol, null);
    }, 15000);

    const renderKey = `${cleanSym}_${currentInterval}_${getTheme()}`;
    if (!forceRebuild && renderKey === lastRenderedKey && container.querySelector('iframe')) {
      if (scrollToChart) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    lastRenderedKey = renderKey;

    container.innerHTML = '<div id="tv_widget_inner" style="height:520px;width:100%;"></div>';

    const createWidget = () => {
      if (typeof TradingView === 'undefined' || !TradingView.widget) return;
      try {
        new TradingView.widget({
          autosize: true,
          symbol: cleanSym,
          interval: currentInterval,
          timezone: "America/New_York",
          theme: getTheme(),
          style: "1",
          locale: "ar_AE",
          enable_publishing: false,
          withdateranges: true,
          // استخدام studies المعرفة بالأسماء القياسية لضمان ظهورها بالألوان فوراً داخل الـ Widget
          studies: [
            "VWAP@tv-basicstudies",
            "MACD@tv-basicstudies"
          ],
          container_id: "tv_widget_inner"
        });
      } catch (err) {}
    };

    if (typeof TradingView === 'undefined') {
      let script = document.getElementById('tv-library-script');
      if (!script) {
        script = document.createElement('script');
        script.id = 'tv-library-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = createWidget;
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', createWidget);
      }
    } else {
      createWidget();
    }

    if (scrollToChart) {
      setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }

  window.updateLiveChart = renderLiveChart;

  document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-symbol], [data-wl-sym], tr[data-symbol], td[data-symbol]');
    if (!target) return;
    const sym = target.getAttribute('data-symbol') || target.getAttribute('data-wl-sym') || target.dataset.symbol;
    if (sym) {
      renderLiveChart(sym.trim().toUpperCase(), true, null, false);
    }
  });

  document.querySelectorAll('.chart-tf').forEach(btn => {
    const tf = btn.getAttribute('data-tf');
    if (tf === currentInterval) btn.classList.add('active');
    else btn.classList.remove('active');

    btn.addEventListener('click', function () {
      document.querySelectorAll('.chart-tf').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentInterval = this.getAttribute('data-tf');
      localStorage.setItem('mh_chart_interval', currentInterval);
      if (currentSymbol) renderLiveChart(currentSymbol, false, null, true);
    });
  });

  window.addEventListener('DOMContentLoaded', () => {
    const savedSym = localStorage.getItem('mh_cached_symbol');
    if (savedSym) renderLiveChart(savedSym, false);
  });
})();
