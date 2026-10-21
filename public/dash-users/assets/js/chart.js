/* ============================================================================
   LIVE TRADINGVIEW CHART + PINE SCRIPT SCALPING ENGINE (assets/js/chart.js)
   دمج استراتيجية: EMA 9 + EMA 21 + VWAP + ATR (1.5x SL & 1R/2R/3R Targets)
============================================================================ */
(function () {
  "use strict";

  let currentSymbol = '';
  let currentInterval = localStorage.getItem('mh_chart_interval') || '5';
  let lastSignalPayload = null;
  let lastRenderedKey = '';
  let pinePollTimer = null;

  // إعدادات استراتيجية الـ Pine Script
  const PINE_CONFIG = {
    emaFastLen: 9,
    emaSlowLen: 21,
    atrLen: 14,
    atrMultiplier: 1.5
  };

  // النص الأصلي للاسكربت لسهولة نسخه بضغطة زر
  const RAW_PINE_SCRIPT = `//@version=5
indicator("Professional Scalping Strategy (EMA + VWAP + TP/SL)", overlay=true, max_labels_count=500)
emaFastLen = input.int(9, title="Fast EMA Length", group="Moving Averages")
emaSlowLen = input.int(21, title="Slow EMA Length", group="Moving Averages")
atrLen = input.int(14, title="ATR Length", group="Risk & ATR")
atrMultiplier = input.float(1.5, title="ATR Multiplier for SL", group="Risk & ATR")
emaFast = ta.ema(close, emaFastLen)
emaSlow = ta.ema(close, emaSlowLen)
myVwap = ta.vwap(hlc3)
myAtr = ta.atr(atrLen)
plot(emaFast, color=color.blue, title="EMA 9", linewidth=1)
plot(emaSlow, color=color.orange, title="EMA 21", linewidth=1)
plot(myVwap, color=color.purple, title="VWAP", linewidth=2)
longCondition = ta.crossover(emaFast, emaSlow) and (close > myVwap)
shortCondition = ta.crossunder(emaFast, emaSlow) and (close < myVwap)
if longCondition
    float entryPrice = close
    float slPrice = close - (myAtr * atrMultiplier)
    float risk = entryPrice - slPrice
    label.new(bar_index, low, text=str.format("🟢 BUY\\nEntry: {0,number,#.##}\\nSL: {1,number,#.##}\\nTP1: {2,number,#.##}\\nTP2: {3,number,#.##}\\nTP3: {4,number,#.##}", entryPrice, slPrice, entryPrice + risk, entryPrice + risk*2, entryPrice + risk*3), color=color.green, textcolor=color.white, style=label.style_label_up)
if shortCondition
    float entryPrice = close
    float slPrice = close + (myAtr * atrMultiplier)
    float risk = slPrice - entryPrice
    label.new(bar_index, high, text=str.format("🔴 SELL\\nEntry: {0,number,#.##}\\nSL: {1,number,#.##}\\nTP1: {2,number,#.##}\\nTP2: {3,number,#.##}\\nTP3: {4,number,#.##}", entryPrice, slPrice, entryPrice - risk, entryPrice - risk*2, entryPrice - risk*3), color=color.red, textcolor=color.white, style=label.style_label_down)`;

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

  /* ==========================================================================
     1. محرك حسابات Pine Script في الجافاسكربت (EMA 9/21 + VWAP + ATR 14)
     ========================================================================== */
  function calcEMAArray(values, length) {
    const k = 2 / (length + 1);
    const emaArr = [];
    let prev = values[0];
    emaArr.push(prev);
    for (let i = 1; i < values.length; i++) {
      const val = (values[i] * k) + (prev * (1 - k));
      emaArr.push(val);
      prev = val;
    }
    return emaArr;
  }

  function calcATRArray(highs, lows, closes, length) {
    const tr = [highs[0] - lows[0]];
    for (let i = 1; i < closes.length; i++) {
      const hl = highs[i] - lows[i];
      const hc = Math.abs(highs[i] - closes[i - 1]);
      const lc = Math.abs(lows[i] - closes[i - 1]);
      tr.push(Math.max(hl, hc, lc));
    }
    // RMA (Wilder's Smoothing) المستخدم في ta.atr في Pine Script
    const atr = [];
    let sum = 0;
    for (let i = 0; i < tr.length; i++) {
      if (i < length) {
        sum += tr[i];
        atr.push(sum / (i + 1));
      } else {
        const prevAtr = atr[i - 1];
        atr.push(((prevAtr * (length - 1)) + tr[i]) / length);
      }
    }
    return atr;
  }

  function calcSessionVWAPArray(timestamps, highs, lows, closes, volumes) {
    const vwapArr = [];
    let cumVol = 0;
    let cumPV = 0;
    let currentDay = null;

    for (let i = 0; i < closes.length; i++) {
      const d = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
      if (d !== currentDay) {
        currentDay = d;
        cumVol = 0;
        cumPV = 0;
      }
      const hlc3 = (highs[i] + lows[i] + closes[i]) / 3;
      const vol = volumes[i] || 0;
      cumPV += hlc3 * vol;
      cumVol += vol;
      vwapArr.push(cumVol > 0 ? (cumPV / cumVol) : closes[i]);
    }
    return vwapArr;
  }

  // جلب الشموع الحية وتشغيل معادلات الـ Pine Script عليها
  async function evaluatePineStrategyLive(symbol, interval) {
    const yfIntervalMap = { '1': '1m', '5': '5m', '15': '15m', '60': '60m', 'D': '1d' };
    const yfRangeMap = { '1': '1d', '5': '5d', '15': '5d', '60': '1mo', 'D': '6mo' };
    const yfInt = yfIntervalMap[interval] || '5m';
    const yfRng = yfRangeMap[interval] || '5d';

    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${yfInt}&range=${yfRng}&includePrePost=false`;
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    for (const url of proxies) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result || !result.timestamp) continue;

        const q = result.indicators?.quote?.[0] || {};
        const ts = [], h = [], l = [], c = [], v = [];

        for (let i = 0; i < result.timestamp.length; i++) {
          if (q.close?.[i] != null && q.high?.[i] != null && q.low?.[i] != null) {
            ts.push(result.timestamp[i]);
            h.push(Number(q.high[i]));
            l.push(Number(q.low[i]));
            c.push(Number(q.close[i]));
            v.push(Number(q.volume?.[i] || 0));
          }
        }

        if (c.length < 25) return null;

        const emaFastArr = calcEMAArray(c, PINE_CONFIG.emaFastLen);
        const emaSlowArr = calcEMAArray(c, PINE_CONFIG.emaSlowLen);
        const atrArr = calcATRArray(h, l, c, PINE_CONFIG.atrLen);
        const vwapArr = calcSessionVWAPArray(ts, h, l, c, v);

        const lastIdx = c.length - 1;
        const close = c[lastIdx];
        const emaFast = emaFastArr[lastIdx];
        const emaSlow = emaSlowArr[lastIdx];
        const myVwap = vwapArr[lastIdx];
        const myAtr = atrArr[lastIdx];

        // البحث عن أحدث إشارة تقاطع (Crossover / Crossunder) مطابقة لشروط الاسكربت
        let lastSignal = null;
        for (let i = Math.max(1, lastIdx - 25); i <= lastIdx; i++) {
          const crossover = emaFastArr[i - 1] <= emaSlowArr[i - 1] && emaFastArr[i] > emaSlowArr[i];
          const crossunder = emaFastArr[i - 1] >= emaSlowArr[i - 1] && emaFastArr[i] < emaSlowArr[i];

          const longCond = crossover && (c[i] > vwapArr[i]);
          const shortCond = crossunder && (c[i] < vwapArr[i]);

          if (longCond || shortCond) {
            const entryPrice = c[i];
            const atrVal = atrArr[i];
            const isLong = longCond;
            const slPrice = isLong
              ? entryPrice - (atrVal * PINE_CONFIG.atrMultiplier)
              : entryPrice + (atrVal * PINE_CONFIG.atrMultiplier);
            const risk = Math.max(0.0001, Math.abs(entryPrice - slPrice));

            lastSignal = {
              type: isLong ? 'LONG' : 'SHORT',
              barsAgo: lastIdx - i,
              entryPrice: entryPrice,
              slPrice: slPrice,
              risk: risk,
              tp1Price: isLong ? entryPrice + (risk * 1.0) : entryPrice - (risk * 1.0),
              tp2Price: isLong ? entryPrice + (risk * 2.0) : entryPrice - (risk * 2.0),
              tp3Price: isLong ? entryPrice + (risk * 3.0) : entryPrice - (risk * 3.0)
            };
          }
        }

        // الحالة الحالية إذا لم يحدث تقاطع في آخر الشموع
        const isBullishBias = (emaFast > emaSlow) && (close > myVwap);
        const isBearishBias = (emaFast < emaSlow) && (close < myVwap);

        const activeEntry = lastSignal ? lastSignal.entryPrice : close;
        const activeIsLong = lastSignal ? (lastSignal.type === 'LONG') : !isBearishBias;
        const activeSl = lastSignal
          ? lastSignal.slPrice
          : (activeIsLong ? close - (myAtr * PINE_CONFIG.atrMultiplier) : close + (myAtr * PINE_CONFIG.atrMultiplier));
        const activeRisk = Math.max(0.0001, Math.abs(activeEntry - activeSl));

        return {
          symbol,
          price: close,
          emaFast,
          emaSlow,
          vwap: myVwap,
          atr: myAtr,
          isLong: activeIsLong,
          lastSignal,
          isBullishBias,
          isBearishBias,
          entryPrice: activeEntry,
          sl: activeSl,
          tp1: activeIsLong ? activeEntry + (activeRisk * 1.0) : activeEntry - (activeRisk * 1.0),
          tp2: activeIsLong ? activeEntry + (activeRisk * 2.0) : activeEntry - (activeRisk * 2.0),
          tp3: activeIsLong ? activeEntry + (activeRisk * 3.0) : activeEntry - (activeRisk * 3.0),
          rr: '3.0'
        };
      } catch (e) {
        // جرب البروكسي التالي في حال الفشل
      }
    }
    return null;
  }

  /* ---------------- 2. حقن تصميم لوحة التوصيات + صندوق الشارت العائم ---------------- */
  function injectChartHudStyles() {
    if (document.getElementById('sniper-chart-hud-styles')) return;
    const style = document.createElement('style');
    style.id = 'sniper-chart-hud-styles';
    style.textContent = `
      #tv_chart_container {
        min-height: 520px !important;
        height: 520px !important;
        width: 100% !important;
        display: block !important;
        position: relative !important;
      }
      #tv_widget_inner {
        height: 520px !important;
        width: 100% !important;
      }

      /* صندوق إشارة الـ Pine Script العائم فوق الشارت (يحاكي label.new) */
      .pine-floating-label {
        position: absolute;
        top: 52px;
        left: 16px;
        z-index: 20;
        padding: 10px 14px;
        border-radius: 8px;
        color: #fff;
        font-family: 'Inter', monospace, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        box-shadow: 0 10px 25px rgba(0,0,0,0.65);
        pointer-events: auto;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.2);
        max-width: 220px;
      }
      .pine-floating-label.pine-buy {
        background: rgba(22, 163, 74, 0.92);
        border-left: 4px solid #86efac;
      }
      .pine-floating-label.pine-sell {
        background: rgba(220, 38, 38, 0.92);
        border-left: 4px solid #fca5a5;
      }
      .pine-floating-label.pine-neutral {
        background: rgba(15, 23, 42, 0.9);
        border-left: 4px solid #38bdf8;
      }

      /* تصميم لوحة القناص (TP1 / TP2 / TP3 / SL) */
      .sniper-hud-box {
        background: linear-gradient(145deg, #070b14 0%, #0f172a 100%);
        border: 1px solid #1e293b;
        border-top: 3px solid #38bdf8;
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 12px;
        color: #ffffff;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        box-shadow: 0 12px 32px rgba(0,0,0,0.65);
      }
      .sniper-hud-box.grade-s { border-top-color: #facc15; box-shadow: 0 0 25px rgba(250, 204, 21, 0.18); }
      .sniper-hud-box.grade-a { border-top-color: #4ade80; }
      .sniper-hud-box.grade-danger { border-top-color: #f43f5e; }

      .sniper-top-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.09);
      }
      .sniper-title-grp { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .sniper-sym-badge {
        font-size: 18px;
        font-weight: 900;
        color: #ffffff;
        background: #1e293b;
        padding: 3px 10px;
        border-radius: 6px;
        border: 1px solid #38bdf8;
        letter-spacing: 0.5px;
      }
      .sniper-verdict-badge {
        font-size: 13px;
        font-weight: 900;
        padding: 4px 12px;
        border-radius: 6px;
        letter-spacing: 0.3px;
      }
      .sv-sniper { background: linear-gradient(135deg, #f59e0b, #dc2626); color: #fff; box-shadow: 0 0 14px rgba(245,158,11,0.5); }
      .sv-enter  { background: linear-gradient(135deg, #16a34a, #059669); color: #fff; }
      .sv-watch  { background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; }
      .sv-wait   { background: #334155; color: #e2e8f0; }
      .sv-danger { background: linear-gradient(135deg, #be123c, #991b1b); color: #fff; }

      .sniper-power-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #090d16;
        padding: 5px 12px;
        border-radius: 6px;
        border: 1px solid #1e293b;
      }
      .sniper-power-bar {
        width: 90px;
        height: 8px;
        background: #1e293b;
        border-radius: 4px;
        overflow: hidden;
      }
      .sniper-power-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .sniper-targets-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(120px, 1fr));
        gap: 8px;
        margin-top: 10px;
      }
      @media (max-width: 1100px) { .sniper-targets-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 640px)  { .sniper-targets-grid { grid-template-columns: repeat(2, 1fr); } }

      .sniper-t-card {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        transition: transform 0.12s, border-color 0.12s;
      }
      .sniper-t-card:hover { transform: translateY(-2px); border-color: #38bdf8; }
      .sniper-t-card.c-entry { border-left: 3px solid #38bdf8; }
      .sniper-t-card.c-tp1   { border-left: 3px solid #4ade80; cursor: pointer; }
      .sniper-t-card.c-tp2   { border-left: 3px solid #22d3ee; cursor: pointer; }
      .sniper-t-card.c-tp3   { border-left: 3px solid #facc15; background: linear-gradient(160deg, rgba(66,32,6,0.45), rgba(15,23,42,0.9)); cursor: pointer; }
      .sniper-t-card.c-sl    { border-left: 3px solid #fb7185; cursor: pointer; }
      .sniper-t-card.c-rr    { border-left: 3px solid #c084fc; }

      .st-lbl { font-size: 10.5px; font-weight: 800; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; }
      .st-val { font-size: 16px; font-weight: 900; color: #ffffff; margin: 3px 0; font-variant-numeric: tabular-nums; }
      .st-pct { font-size: 11px; font-weight: 800; }
      .st-apply-hint { font-size: 9.5px; color: #38bdf8; opacity: 0.9; }

      .sniper-signals-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px dashed rgba(255,255,255,0.1);
      }
      .cosmic-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 5px;
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid #334155;
      }
      .cosmic-pill.sig-gold {
        background: linear-gradient(135deg, #422006, #713f12);
        color: #fde047;
        border-color: #eab308;
      }
      .cosmic-pill.sig-bull {
        background: rgba(22, 163, 74, 0.22);
        color: #4ade80;
        border-color: rgba(74, 222, 128, 0.4);
      }
      .cosmic-pill.sig-warn {
        background: rgba(225, 29, 72, 0.22);
        color: #fda4af;
        border-color: rgba(251, 113, 133, 0.4);
      }
      .copy-pine-btn {
        background: #1e293b;
        color: #38bdf8;
        border: 1px solid #38bdf8;
        border-radius: 5px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.15s;
      }
      .copy-pine-btn:hover { background: #38bdf8; color: #0f172a; }
    `;
    document.head.appendChild(style);
  }
  injectChartHudStyles();

  /* ---------------- 3. بناء بيانات التوصية (معادلة ATR 1.5x أو البديل التلقائي) ---------------- */
  function buildSignalFromInputsOrData(sym, customData, pineLive) {
    // إذا توفرت بيانات الشموع الحية من محرك الـ Pine Script نعتمد عليها فوراً
    if (pineLive && isNum(pineLive.price)) {
      const dec = pineLive.price < 1 ? 4 : 2;
      const sigInfo = pineLive.lastSignal;
      let label = '⏳ انتظار تقاطع EMA 9/21 مع VWAP';
      let cls = 'watch';
      let momo = 68;

      if (sigInfo) {
        const whenTxt = sigInfo.barsAgo === 0 ? 'الآن على الشمعة الحالية!' : `منذ ${sigInfo.barsAgo} شمعة`;
        if (sigInfo.type === 'LONG') {
          label = `🟢 BUY SIGNAL (${whenTxt})`;
          cls = sigInfo.barsAgo <= 2 ? 'sniper' : 'enter';
          momo = sigInfo.barsAgo <= 2 ? 92 : 82;
        } else {
          label = `🔴 SELL SIGNAL (${whenTxt})`;
          cls = 'danger';
          momo = 85;
        }
      } else if (pineLive.isBullishBias) {
        label = '🟢 مسار صاعد (EMA9 > EMA21 & Above VWAP)';
        cls = 'enter';
        momo = 78;
      } else if (pineLive.isBearishBias) {
        label = '🔴 مسار هابط (EMA9 < EMA21 & Below VWAP)';
        cls = 'danger';
        momo = 40;
      }

      return {
        symbol: sym,
        price: pineLive.entryPrice,
        currentPrice: pineLive.price,
        entryZone: `${fmt(pineLive.entryPrice * 0.997, dec)} - ${fmt(pineLive.entryPrice, dec)}`,
        tp1: pineLive.tp1,
        tp2: pineLive.tp2,
        tp3: pineLive.tp3,
        sl: pineLive.sl,
        rr: '3.0',
        momo: momo,
        isLong: pineLive.isLong,
        pineLive: pineLive,
        setupName: 'Pine: EMA(9/21) + VWAP + ATR(1.5x)',
        label: label,
        cls: cls,
        cosmicSignals: [
          `🔵 EMA 9: $${fmt(pineLive.emaFast, dec)}`,
          `🟠 EMA 21: $${fmt(pineLive.emaSlow, dec)}`,
          `🟣 VWAP: $${fmt(pineLive.vwap, dec)}`,
          `📐 ATR(14): $${fmt(pineLive.atr, dec)} (SL = 1.5x ATR)`
        ],
        risks: !pineLive.isLong ? ['⚠️ إشارة بيع / مسار هابط أسفل VWAP'] : []
      };
    }

    if (customData && isNum(customData.tp1) && isNum(customData.price)) return customData;

    const buyEl = document.getElementById('buy');
    const price = (customData && isNum(customData.price)) ? Number(customData.price) : (buyEl ? parseFloat(buyEl.value) : 0);
    if (!price || price <= 0) return null;

    // حساب احتياطي بمعادلة 1R / 2R / 3R لحين جلب بيانات الـ ATR
    const estimatedAtr = price * 0.025;
    const sl = price - (estimatedAtr * PINE_CONFIG.atrMultiplier);
    const risk = Math.max(0.0001, price - sl);
    const tp1 = price + (risk * 1.0);
    const tp2 = price + (risk * 2.0);
    const tp3 = price + (risk * 3.0);
    const dec = price < 1 ? 4 : 2;

    return {
      symbol: sym,
      price: price,
      entryZone: `${fmt(price * 0.995, dec)} - ${fmt(price, dec)}`,
      tp1: tp1,
      tp2: tp2,
      tp3: tp3,
      sl: sl,
      rr: '3.0',
      momo: customData?.momo || 75,
      isLong: true,
      setupName: 'Professional Scalping (EMA 9/21 + VWAP + ATR)',
      label: '🎯 جاري فحص تقاطع EMA 9/21 + VWAP...',
      cls: 'enter',
      cosmicSignals: [
        '📈 الأهداف محسوبة بنظام 1R / 2R / 3R طبقاً للاسكربت',
        '🟢 جاري تحميل قيم EMA 9, EMA 21, VWAP, ATR(14) الحية...'
      ],
      risks: []
    };
  }

  /* ---------------- 4. رسم صندوق الإشارة العائم فوق الشارت (Label Box) ---------------- */
  function renderFloatingPineLabel(sig) {
    const container = document.getElementById('tv_chart_container');
    if (!container) return;

    let box = document.getElementById('pineFloatingBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pineFloatingBox';
      container.appendChild(box);
    }

    if (!sig || !sig.price) {
      box.style.display = 'none';
      return;
    }

    const dec = sig.price < 1 ? 4 : 2;
    const isLong = sig.isLong !== false;
    const stateClass = isLong ? 'pine-buy' : 'pine-sell';
    const headerTitle = sig.pineLive?.lastSignal
      ? (isLong ? '🟢 BUY (Pine Crossover)' : '🔴 SELL (Pine Crossunder)')
      : (isLong ? '🟢 BUY BIAS (Above VWAP)' : '🔴 SELL BIAS (Below VWAP)');

    box.className = `pine-floating-label ${stateClass}`;
    box.style.display = 'block';
    box.innerHTML = `
      <div style="font-weight:900;font-size:13px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.25);padding-bottom:3px;">
        ${headerTitle}
      </div>
      <div><b>Entry:</b> $${fmt(sig.price, dec)}</div>
      <div><b>SL (1.5x ATR):</b> $${fmt(sig.sl, dec)}</div>
      <div><b>TP1 (1R):</b> $${fmt(sig.tp1, dec)}</div>
      <div><b>TP2 (2R):</b> $${fmt(sig.tp2, dec)}</div>
      <div><b>TP3 (3R):</b> $${fmt(sig.tp3, dec)}</div>
    `;
  }

  /* ---------------- 5. عرض لوحة التوصيات الكاملة أعلى الشارت ---------------- */
  function renderChartSignalHud(sym, rawSignal, pineLive = null) {
    const section = document.getElementById('chartSection');
    const container = document.getElementById('tv_chart_container');
    if (!section || !container) return;

    let hudContainer = document.getElementById('chartSniperHud');
    if (!hudContainer) {
      hudContainer = document.createElement('div');
      hudContainer.id = 'chartSniperHud';
      container.parentNode.insertBefore(hudContainer, container);
    }

    const sourceSig = rawSignal || (window.__lastScannerSignal && window.__lastScannerSignal[sym]) || null;
    const sig = buildSignalFromInputsOrData(sym, sourceSig, pineLive);
    if (!sig || !sig.price) {
      hudContainer.innerHTML = '';
      renderFloatingPineLabel(null);
      return;
    }
    lastSignalPayload = sig;
    renderFloatingPineLabel(sig);

    const p = Number(sig.price);
    const dec = p < 1 ? 4 : 2;
    const tp1 = Number(sig.tp1 || p * 1.03);
    const tp2 = Number(sig.tp2 || p * 1.06);
    const tp3 = Number(sig.tp3 || p * 1.09);
    const sl  = Number(sig.sl  || p * 0.97);

    const tp1Pct = (Math.abs((tp1 - p) / p) * 100).toFixed(1);
    const tp2Pct = (Math.abs((tp2 - p) / p) * 100).toFixed(1);
    const tp3Pct = (Math.abs((tp3 - p) / p) * 100).toFixed(1);
    const slPct  = (Math.abs((p - sl) / p) * 100).toFixed(1);
    const signPrefix = sig.isLong === false ? '-' : '+';

    const badgeCls = sig.cls === 'sniper' ? 'sv-sniper' :
                     sig.cls === 'enter'  ? 'sv-enter' :
                     sig.cls === 'watch'  ? 'sv-watch' :
                     (sig.cls === 'danger' || sig.cls === 'unstable') ? 'sv-danger' : 'sv-wait';

    const boxCls = sig.cls === 'sniper' ? 'grade-s' :
                   sig.cls === 'enter'  ? 'grade-a' :
                   sig.cls === 'danger' ? 'grade-danger' : '';

    const momoScore = Number(sig.momo) || 70;
    const barColor = momoScore >= 80 ? '#facc15' : momoScore >= 68 ? '#4ade80' : momoScore >= 50 ? '#38bdf8' : '#fb7185';

    const cosmicList = sig.cosmicSignals || sig.signals || [];
    const cosmicHtml = cosmicList.map((s, idx) =>
      `<span class="cosmic-pill ${idx === 0 && momoScore >= 78 ? 'sig-gold' : 'sig-bull'}">${esc(s)}</span>`
    ).join('');

    const risksHtml = (sig.risks || []).map(r =>
      `<span class="cosmic-pill sig-warn">${esc(r)}</span>`
    ).join('');

    hudContainer.innerHTML = `
      <div class="sniper-hud-box ${boxCls}" dir="rtl">
        <div class="sniper-top-row">
          <div class="sniper-title-grp">
            <span class="sniper-sym-badge">${esc(sym)}</span>
            <span class="sniper-verdict-badge ${badgeCls}">${esc(sig.label || '🎯 إشارة نشطة')}</span>
            <span style="font-size:12px;color:#cbd5e1;font-weight:700">
              الاستراتيجية: <b style="color:#38bdf8">${esc(sig.setupName || 'EMA 9/21 + VWAP + ATR')}</b>
            </span>
          </div>
          <div class="sniper-power-wrap">
            <span style="font-size:11px;color:#94a3b8;font-weight:800">قوة التوافق الفني:</span>
            <div class="sniper-power-bar">
              <div class="sniper-power-fill" style="width:${momoScore}%;background:${barColor}"></div>
            </div>
            <b style="color:${barColor};font-size:13px">${momoScore}%</b>
          </div>
        </div>

        <div class="sniper-targets-grid" dir="ltr">
          <div class="sniper-t-card c-entry">
            <div class="st-lbl"><span>⚡ ENTRY PRICE</span><span>سعر الإشارة</span></div>
            <div class="st-val">$${fmt(p, dec)}</div>
            <div class="st-pct" style="color:#38bdf8">Zone: $${esc(sig.entryZone || fmt(p, dec))}</div>
          </div>

          <div class="sniper-t-card c-tp1" data-apply-target="${tp1.toFixed(dec)}" title="اضغط لإرسال TP1 إلى الحاسبة">
            <div class="st-lbl"><span>🎯 TP1 (1.0 R)</span><span class="st-apply-hint">تطبيق ↵</span></div>
            <div class="st-val" style="color:#4ade80">$${fmt(tp1, dec)}</div>
            <div class="st-pct" style="color:#4ade80">${signPrefix}${tp1Pct}% (Risk x1)</div>
          </div>

          <div class="sniper-t-card c-tp2" data-apply-target="${tp2.toFixed(dec)}" title="اضغط لإرسال TP2 إلى الحاسبة">
            <div class="st-lbl"><span>🚀 TP2 (2.0 R)</span><span class="st-apply-hint">تطبيق ↵</span></div>
            <div class="st-val" style="color:#22d3ee">$${fmt(tp2, dec)}</div>
            <div class="st-pct" style="color:#22d3ee">${signPrefix}${tp2Pct}% (Risk x2)</div>
          </div>

          <div class="sniper-t-card c-tp3" data-apply-target="${tp3.toFixed(dec)}" title="اضغط لإرسال TP3 إلى الحاسبة">
            <div class="st-lbl"><span style="color:#fde047">🌌 TP3 (3.0 R)</span><span class="st-apply-hint">تطبيق ↵</span></div>
            <div class="st-val" style="color:#facc15">$${fmt(tp3, dec)}</div>
            <div class="st-pct" style="color:#fde047">${signPrefix}${tp3Pct}% (Risk x3)</div>
          </div>

          <div class="sniper-t-card c-sl" data-apply-target="${sl.toFixed(dec)}" title="اضغط لتجربة وقف الخسارة في الحاسبة">
            <div class="st-lbl"><span>🛡️ STOP LOSS (1.5x ATR)</span><span class="st-apply-hint">تطبيق ↵</span></div>
            <div class="st-val" style="color:#fb7185">$${fmt(sl, dec)}</div>
            <div class="st-pct" style="color:#fda4af">-${slPct}% (ATR Multiplier 1.5)</div>
          </div>

          <div class="sniper-t-card c-rr">
            <div class="st-lbl"><span>⚖️ RISK / REWARD</span><span>العائد للمخاطرة</span></div>
            <div class="st-val" style="color:#c084fc">1 : 1 / 2 / 3</div>
            <div class="st-pct" style="color:#e2e8f0">ارفع الوقف للدخول بعد TP1</div>
          </div>
        </div>

        <div class="sniper-signals-row">
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
            <span style="font-size:11px;color:#94a3b8;font-weight:800">⚡ قراءات المؤشر الحية:</span>
            ${cosmicHtml}
            ${risksHtml}
          </div>
          <button type="button" class="copy-pine-btn" id="copyPineScriptBtn" title="نسخ كود Pine Script للصقه في TradingView">
            📋 نسخ كود Pine Script
          </button>
        </div>
      </div>
    `;

    const copyBtn = document.getElementById('copyPineScriptBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(RAW_PINE_SCRIPT).then(() => {
          this.textContent = '✅ تم نسخ الاسكربت!';
          setTimeout(() => { this.textContent = '📋 نسخ كود Pine Script'; }, 2000);
        });
      });
    }

    hudContainer.querySelectorAll('[data-apply-target]').forEach(card => {
      card.addEventListener('click', function () {
        const targetVal = this.getAttribute('data-apply-target');
        const buyInp = document.getElementById('buy');
        const sellInp = document.getElementById('sell');
        if (buyInp && (!buyInp.value || parseFloat(buyInp.value) <= 0)) {
          buyInp.value = p;
        }
        if (sellInp && targetVal) {
          sellInp.value = targetVal;
          if (typeof window.calc === 'function') window.calc();
          sellInp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  /* ---------------- 6. تشغيل الفحص الحي للاسكربت وتحديث الشارت ---------------- */
  async function triggerLivePineEvaluation(sym, fallbackSignal) {
    const pineData = await evaluatePineStrategyLive(sym, currentInterval);
    if (pineData && sym === currentSymbol) {
      renderChartSignalHud(sym, fallbackSignal, pineData);
    }
  }

  function renderLiveChart(symbol, scrollToChart = false, signalData = null, forceRebuild = false) {
    if (!symbol) return;
    const cleanSym = String(symbol).trim().toUpperCase();
    if (!cleanSym) return;

    currentSymbol = cleanSym;

    const section = document.getElementById('chartSection');
    const chartBody = document.getElementById('chartCardBody');
    const container = document.getElementById('tv_chart_container');
    const badge = document.getElementById('chartSymbolBadge');
    const tvLink = document.getElementById('tvExternalLink');
    const toggleBtn = document.getElementById('toggleChartBtn');

    if (!section || !container) return;

    section.hidden = false;
    section.style.display = '';
    if (chartBody && chartBody.hidden) {
      chartBody.hidden = false;
      if (toggleBtn) toggleBtn.textContent = '🔼 طي الشارت';
    }

    if (badge) badge.textContent = cleanSym;
    if (tvLink) tvLink.href = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(cleanSym)}`;

    // عرض مبدئي سريع ثم جلب حسابات الـ Pine Script الحية (EMA 9/21 + VWAP + ATR)
    renderChartSignalHud(cleanSym, signalData);
    triggerLivePineEvaluation(cleanSym, signalData);

    if (pinePollTimer) clearInterval(pinePollTimer);
    pinePollTimer = setInterval(() => {
      if (currentSymbol) triggerLivePineEvaluation(currentSymbol, lastSignalPayload);
    }, 20000);

    const renderKey = `${cleanSym}_${currentInterval}_${getTheme()}`;
    const hasIframe = container.querySelector('iframe');
    if (!forceRebuild && renderKey === lastRenderedKey && hasIframe) {
      if (scrollToChart) {
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
      return;
    }
    lastRenderedKey = renderKey;

    container.innerHTML = '<div id="tv_widget_inner" style="height:520px;width:100%;"></div>';
    if (lastSignalPayload) renderFloatingPineLabel(lastSignalPayload);

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
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          withdateranges: true,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: true,
          details: true,
          hotlist: false,
          calendar: false,
          // إضافة خطوط الـ Pine Script على الشارت مباشرة (VWAP + EMA 9 + EMA 21 + ATR)
          studies: [
            "VWAP@tv-basicstudies",
            {
              id: "MAExp@tv-basicstudies",
              inputs: { length: 9 }
            },
            {
              id: "MAExp@tv-basicstudies",
              inputs: { length: 21 }
            },
            {
              id: "ATR@tv-basicstudies",
              inputs: { length: 14 }
            }
          ],
          studies_overrides: {
            "moving average exponential.ma.color": "#2563eb",
            "moving average exponential.ma.linewidth": 2,
            "vwap.vwap.color": "#9333ea",
            "vwap.vwap.linewidth": 2
          },
          container_id: "tv_widget_inner"
        });
      } catch (err) {
        console.error('TradingView Widget Error:', err);
      }
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
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  window.updateLiveChart = renderLiveChart;
  window.updateChartSignals = renderChartSignalHud;

  // تفعيل أزرار الفريمات الزمنية (1m, 5m, 15m, 1H, D)
  document.querySelectorAll('.chart-tf').forEach(btn => {
    if (btn.getAttribute('data-tf') === currentInterval) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', function () {
      document.querySelectorAll('.chart-tf').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentInterval = this.getAttribute('data-tf');
      localStorage.setItem('mh_chart_interval', currentInterval);
      if (currentSymbol) renderLiveChart(currentSymbol, false, lastSignalPayload, true);
    });
  });

  // زر إخفاء/طي الشارت
  const toggleBtn = document.getElementById('toggleChartBtn');
  const chartBody = document.getElementById('chartCardBody');
  if (toggleBtn && chartBody) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = chartBody.hidden;
      chartBody.hidden = !isHidden;
      toggleBtn.textContent = isHidden ? '🔼 طي الشارت' : '🔽 إظهار الشارت';
    });
  }

  // تحديث مظهر الشارت تلقائياً عند الضغط على زر تبديل الثيم
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (currentSymbol) renderLiveChart(currentSymbol, false, lastSignalPayload, true);
      }, 50);
    });
  }

  // الاستماع لحدث البحث في الحاسبة
  const getBtn = document.getElementById('get');
  if (getBtn) {
    getBtn.addEventListener('click', () => {
      const sym = document.getElementById('sym')?.value.trim().toUpperCase();
      if (sym) {
        const sigData = window.__lastScannerSignal ? window.__lastScannerSignal[sym] : null;
        renderLiveChart(sym, false, sigData, false);
        setTimeout(() => triggerLivePineEvaluation(sym, window.__lastScannerSignal?.[sym] || null), 600);
      }
    });
  }

  // الاستماع لحدث مسح الكاش لإخفاء الشارت
  const clearBtn = document.getElementById('clearCache');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentSymbol = '';
      lastSignalPayload = null;
      lastRenderedKey = '';
      if (pinePollTimer) clearInterval(pinePollTimer);
      const section = document.getElementById('chartSection');
      const container = document.getElementById('tv_chart_container');
      const hud = document.getElementById('chartSniperHud');
      if (section) section.hidden = true;
      if (container) container.innerHTML = '';
      if (hud) hud.innerHTML = '';
    });
  }

  // الاستماع المباشر للنقر على أي سهم في الاسكانر
  const scannerSection = document.getElementById('scannerSection');
  if (scannerSection) {
    scannerSection.addEventListener('click', (e) => {
      const tr = e.target.closest('[data-symbol]');
      if (tr) {
        const sym = tr.getAttribute('data-symbol');
        if (sym) {
          const sigData = window.__lastScannerSignal ? window.__lastScannerSignal[sym] : null;
          renderLiveChart(sym, true, sigData, false);
        }
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    const savedSym = localStorage.getItem('mh_cached_symbol');
    if (savedSym) {
      renderLiveChart(savedSym, false);
    }
  });
})();
