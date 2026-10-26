/* ============================================================================
   LIVE TRADINGVIEW CHART + PINE SCRIPT SCALPING ENGINE (assets/js/chart.js)
   EMA 9 (Red), EMA 200 (Blue), VWAP (Green) @ 1m + Pine Script Overlay Colors
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

  // كود الـ Pine Script المحدث لضمان رسم الخطوط بالألوان المخصصة فوق الشموع مباشرة
  const RAW_PINE_SCRIPT = `//@version=5
indicator("Professional Scalping Strategy (EMA 9/200 + VWAP)", overlay=true, max_labels_count=500)
emaFastLen = input.int(9, title="EMA 9 Length")
emaSlowLen = input.int(200, title="EMA 200 Length")
atrLen = input.int(14, title="ATR Length")
atrMultiplier = input.float(1.5, title="ATR Multiplier")

emaFast = ta.ema(close, emaFastLen)
emaSlow = ta.ema(close, emaSlowLen)
myVwap = ta.vwap(hlc3)
myAtr = ta.atr(atrLen)

plot(emaFast, color=color.red, title="EMA 9", linewidth=2)
plot(emaSlow, color=color.blue, title="EMA 200", linewidth=2)
plot(myVwap, color=color.green, title="VWAP", linewidth=2)

longCondition = ta.crossover(emaFast, emaSlow) and (close > myVwap)
shortCondition = ta.crossunder(emaFast, emaSlow) and (close < myVwap)

if longCondition
    float entryPrice = close
    float slPrice = close - (myAtr * atrMultiplier)
    float risk = entryPrice - slPrice
    label.new(bar_index, low, text=str.format("🟢 BUY\\nEntry: {0,number,#.##}\\nSL: {1,number,#.##}\\nTP1: {2,number,#.##}", entryPrice, slPrice, entryPrice + risk), color=color.green, textcolor=color.white, style=label.style_label_up)

if shortCondition
    float entryPrice = close
    float slPrice = close + (myAtr * atrMultiplier)
    float risk = slPrice - entryPrice
    label.new(bar_index, high, text=str.format("🔴 SELL\\nEntry: {0,number,#.##}\\nSL: {1,number,#.##}\\nTP1: {2,number,#.##}", entryPrice, slPrice, entryPrice - risk), color=color.red, textcolor=color.white, style=label.style_label_down)`;

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
    let b = (apiInput && apiInput.value ? apiInput.value : '').trim().replace(/\/+\$/, '');
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
          return computePineFromStockRow(cleanSym, row);
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
            vwapDiff: qj.vwapDiff
          });
        }
      }
    } catch (e) {}

    return null;
  }

  function computePineFromStockRow(symbol, row) {
    const close = Number(row.price);
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
      .sniper-hud-box { background: linear-gradient(145deg, #070b14 0%, #0f172a 100%); border: 1px solid #1e293b; border-top: 3px solid #38bdf8; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; color: #ffffff; }
      .sniper-targets-grid { display: grid; grid-template-columns: repeat(5, minmax(100px, 1fr)); gap: 8px; margin-top: 10px; }
      .sniper-t-card { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 10px; cursor: pointer; }
      .st-lbl { font-size: 10.5px; font-weight: 800; color: #94a3b8; }
      .st-val { font-size: 16px; font-weight: 900; color: #ffffff; margin: 3px 0; }
      .copy-pine-btn { background: #1e293b; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 5px; padding: 3px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
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
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2 pt-2 border-top">
          <div class="d-flex gap-1">${sig.cosmicSignals.map(s => `<span class="badge bg-secondary">${esc(s)}</span>`).join('')}</div>
          <button type="button" class="copy-pine-btn" id="copyPineScriptBtn">📋 نسخ Pine Script</button>
        </div>
      </div>
    `;

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
