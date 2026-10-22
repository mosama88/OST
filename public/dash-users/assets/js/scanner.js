/* ============================================================================
   ULTRA MOMO PRO TERMINAL v7.0 (EVENTS + HEALTH + NBBO) (CRYSTAL WHITE TEXT & ROYAL GLOW EDITION)
   نصوص بيضاء فائقة الوضوح + ألوان متدرجة فخمة + نفس اللوجيك 100%
============================================================================ */
(function () {
  "use strict";

  var tbody = document.getElementById('scannerRows');
  var panelsEl = document.getElementById('scannerPanels');
  if (!tbody && !panelsEl) return;

  var scanBtn = document.getElementById('scannerBtn');
  var stopBtn = document.getElementById('scannerStop');
  var statusEl = document.getElementById('scannerStatus');
  var lastUpdate = document.getElementById('scannerLastUpdate');
  var countEl = document.getElementById('scannerCount');
  var autoEl = document.getElementById('scannerAuto');
  var soundEl = document.getElementById('scannerSound');

  var fPriceMin = document.getElementById('filterPriceMin');
  var fPriceMax = document.getElementById('filterPriceMax');
  var fVolumeMin = document.getElementById('filterVolumeMin');
  var fCapMin = document.getElementById('filterMarketCapMin');
  var fChangeMin = document.getElementById('filterChangeMin');
  var fRvolMin = document.getElementById('filterRvolMin');
  var fMarket = document.getElementById('filterMarket');
  var fLimit = document.getElementById('filterLimit');
  var fVerdict = document.getElementById('filterVerdict');
  var fSort = document.getElementById('filterSort');
  var fRows = document.getElementById('filterPanelRows');
  var resetBtn = document.getElementById('scannerReset');

  var K_FILTERS = 'scanner-filters-v5-ultra';
  var K_PINNED = 'scanner-pinned-v5';
  var K_UI = 'scanner-ui-v52';

  var lastScannedRows = [];
  var prevStockSnapshot = {};
  var prevPanelSyms = {};
  var liveFeedLogs = [];
  var pinnedSyms = [];
  var AUTO_MS = 8000;

  function getEl(id) {
    if (typeof window.$ === 'function') {
      try {
        var el = window.$(id);
        if (el) return el;
      } catch (e) {}
    }
    return document.getElementById(id);
  }

  var uiState = {
    theme: 'royal',       // 'royal' (أبيض ساطع مع خلفيات ملونة غنية) | 'oled' (أسود صريح)
    voice: false,
    maximized: null,
    search: '',
    highlightSym: null,
    colsPerRow: 6
  };

  function lsGet(k, def) { try { var v = localStorage.getItem(k); return v == null ? def : v; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  try { pinnedSyms = JSON.parse(lsGet(K_PINNED, '[]')) || []; } catch (e) { pinnedSyms = []; }
  try {
    var savedUi = JSON.parse(lsGet(K_UI, 'null'));
    if (savedUi) Object.assign(uiState, savedUi);
  } catch (e) { }

  function saveUiState() { lsSet(K_UI, JSON.stringify(uiState)); }

  /* ---------------- 1. حقن التصميم الفائق (Crystal White & Royal Colors) ---------------- */
  function injectUltraStyles() {
    var old = document.getElementById('ultra-momo-styles');
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = 'ultra-momo-styles';
    style.textContent = `
      #scannerPanels {
        display: block !important;
        font-family: 'Inter', 'Segoe UI', 'JetBrains Mono', Roboto, sans-serif;
        user-select: none;
        background: #060911 !important;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 10px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.85);
      }

      /* شريط التحكم العلوي */
      .momo-cmd-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
        padding: 7px 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        border: 1px solid #334155;
        color: #ffffff;
        font-size: 11.5px;
      }
      .momo-cmd-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .momo-btn {
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid #475569;
        border-radius: 5px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .momo-btn:hover { background: #334155; border-color: #94a3b8; color: #fff; }
      .momo-btn.active {
        background: linear-gradient(135deg, #0284c7, #2563eb);
        color: #fff;
        border-color: #38bdf8;
        box-shadow: 0 0 12px rgba(56,189,248,0.45);
      }
      .momo-search {
        background: #090d16;
        border: 1px solid #475569;
        color: #ffffff !important;
        padding: 4px 10px;
        border-radius: 5px;
        font-size: 11.5px;
        font-weight: 700;
        width: 130px;
        text-transform: uppercase;
      }
      .momo-search::placeholder { color: #94a3b8; }
      .momo-search:focus { outline: none; border-color: #38bdf8; width: 165px; box-shadow: 0 0 8px rgba(56,189,248,0.3); }

      /* شريط الأسهم المشتعلة */
      .momo-hot-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow-x: auto;
        padding: 6px 10px;
        background: #0b111e;
        border: 1px solid #1e293b;
        border-radius: 7px;
        margin-bottom: 10px;
        font-size: 11.5px;
        scrollbar-width: thin;
      }
      .momo-hot-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px;
        border-radius: 5px;
        font-weight: 800;
        cursor: pointer;
        white-space: nowrap;
        background: #1e293b;
        color: #ffffff;
        border: 1px solid #475569;
        transition: transform 0.12s;
      }
      .momo-hot-tag:hover { transform: translateY(-1px); border-color: #facc15; }
      .momo-hot-tag.hot-fire {
        background: linear-gradient(135deg, #dc2626, #ea580c);
        color: #ffffff;
        border-color: #fde047;
        box-shadow: 0 2px 8px rgba(234,88,12,0.4);
      }
      .momo-hot-tag.pinned {
        background: linear-gradient(135deg, #1d4ed8, #0284c7);
        color: #ffffff;
        border-color: #7dd3fc;
      }
      .momo-hot-tag .cnt { background: rgba(0,0,0,0.5); color: #fde047; padding: 0 5px; border-radius: 3px; font-size: 10px; }

      /* الشبكة (Grid) */
      .momo-grid-wrap {
        display: grid;
        grid-template-columns: repeat(var(--momo-cols, 6), minmax(200px, 1fr));
        gap: 6px;
      }
      @media (max-width: 1650px) { .momo-grid-wrap { grid-template-columns: repeat(4, minmax(195px, 1fr)); } }
      @media (max-width: 1150px) { .momo-grid-wrap { grid-template-columns: repeat(2, minmax(185px, 1fr)); } }
      @media (max-width: 640px)  { .momo-grid-wrap { grid-template-columns: 1fr; } }

      /* اللوحة الواحدة (Panel) */
      .sc-panel {
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255,255,255,0.14);
        border-top: 3px solid var(--pc, #38bdf8);
        border-radius: 6px;
        overflow: hidden;
        height: 245px;
        position: relative;
        box-shadow: 0 6px 18px rgba(0,0,0,0.55);
      }
      .sc-panel.maximized {
        grid-column: 1 / -1 !important;
        height: 540px !important;
        z-index: 20;
      }

      /* ترويسة اللوحة */
      .sc-ph {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(90deg, rgba(0,0,0,0.65), rgba(15,23,42,0.9)) !important;
        color: #ffffff !important;
        padding: 5px 7px;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.4px;
        border-bottom: 1px solid rgba(255,255,255,0.12);
        text-shadow: 0 1px 3px rgba(0,0,0,0.9);
      }
      .sc-ph-left { display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; }
      .sc-ph-num {
        background: var(--pc, #0ea5e9);
        color: #000000 !important;
        font-size: 9.5px;
        font-weight: 900;
        padding: 1px 5px;
        border-radius: 3px;
        text-shadow: none;
      }
      .sc-ph-right { display: flex; align-items: center; gap: 5px; }
      .sc-ph-cnt {
        background: rgba(255,255,255,0.18);
        color: #ffffff !important;
        font-size: 10px;
        font-weight: 800;
        padding: 0 6px;
        border-radius: 4px;
      }
      .sc-ph-btn {
        background: transparent;
        border: none;
        color: #cbd5e1;
        cursor: pointer;
        font-size: 12px;
        padding: 0 3px;
        line-height: 1;
      }
      .sc-ph-btn:hover { color: #ffffff; transform: scale(1.15); }

      /* جسم الجدول داخل اللوحة */
      .sc-pb {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
      }
      .sc-pt {
        width: 100%;
        border-collapse: collapse;
        font-size: 11.5px;
        line-height: 1.3;
      }
      .sc-pt thead th {
        position: sticky;
        top: 0;
        background: #090d16 !important;
        color: #cbd5e1 !important;
        font-size: 9.5px;
        font-weight: 800;
        text-transform: uppercase;
        padding: 4px 5px;
        text-align: right;
        border-bottom: 1px solid rgba(255,255,255,0.15);
        z-index: 2;
        letter-spacing: 0.3px;
      }
      .sc-pt thead th:first-child { text-align: left; color: #38bdf8 !important; }

      /* صفوف وأعمدة ناصعة البياض */
      .sc-pt tbody tr {
        cursor: pointer;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        transition: background 0.12s ease;
      }
      .sc-pt tbody td {
        padding: 3.5px 5px !important;
        text-align: right;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        color: #ffffff !important;
        font-weight: 700 !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.85);
        background: transparent !important;
      }
      .sc-pt tbody td.sy {
        text-align: left;
        font-weight: 900 !important;
        color: #ffffff !important;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 3px;
        border-left: 3px solid var(--pc, #38bdf8);
        padding-left: 5px !important;
      }

      /* ألوان مميزة للأعمدة الفرعية لسهولة القراءة */
      .sc-pt tbody td.col-price { color: #ffffff !important; font-weight: 800 !important; }
      .sc-pt tbody td.col-vol   { color: #f1f5f9 !important; }
      .sc-pt tbody td.col-flt   { color: #fde047 !important; }
      .sc-pt tbody td.col-rvol  { color: #7dd3fc !important; }

      /* كبسولات الصعود والهبوط المشعة */
      .sc-pt .up {
        color: #4ade80 !important;
        font-weight: 900 !important;
        background: rgba(22, 163, 74, 0.25);
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid rgba(74, 222, 128, 0.35);
      }
      .sc-pt .down {
        color: #fda4af !important;
        font-weight: 900 !important;
        background: rgba(225, 29, 72, 0.28);
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid rgba(251, 113, 133, 0.35);
      }

      /* ================= 1. ثيم ROYAL GLOW (ملون فخم + خط أبيض ناصع) ================= */
      .theme-royal .sc-panel {
        background: var(--rbg, linear-gradient(160deg, #0f172a 0%, #1e293b 100%)) !important;
      }
      .theme-royal .sc-pt tbody tr:nth-child(even) {
        background: rgba(255, 255, 255, 0.045) !important;
      }
      .theme-royal .sc-pt tbody tr:hover {
        background: rgba(255, 255, 255, 0.18) !important;
      }

      /* ================= 2. ثيم OLED CONTRAST (أسود حالك + خط أبيض ثلجي) ================= */
      .theme-oled .sc-panel {
        background: #070a12 !important;
      }
      .theme-oled .sc-pt tbody tr:nth-child(even) {
        background: #0d1322 !important;
      }
      .theme-oled .sc-pt tbody tr:hover {
        background: #1e293b !important;
      }

      /* تمييز السهم المحدد عبر كل اللوحات */
      .sc-pt tbody tr.sym-highlighted {
        background: #facc15 !important;
        box-shadow: inset 0 0 0 2px #000;
      }
      .sc-pt tbody tr.sym-highlighted td,
      .sc-pt tbody tr.sym-highlighted td span {
        color: #000000 !important;
        text-shadow: none !important;
        font-weight: 900 !important;
      }

      /* وميض الاختراق الجديد */
      @keyframes momoFlash {
        0%   { background-color: #38bdf8; }
        50%  { background-color: rgba(56, 189, 248, 0.4); }
        100% { background-color: transparent; }
      }
      .sc-new { animation: momoFlash 1.5s ease-out; }

      .halt-badge {
        background: #dc2626;
        color: #ffffff !important;
        font-size: 9px;
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: 900;
        letter-spacing: 0.3px;
        animation: pulseHalt 1s infinite;
      }
      @keyframes pulseHalt { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }

      /* شريط الأخبار السفلي */
      .momo-Squawk-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #050811;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 6px 12px;
        margin-top: 10px;
        color: #e2e8f0;
        font-size: 11.5px;
        overflow: hidden;
      }
      .squawk-label {
        background: linear-gradient(135deg, #ef4444, #b91c1c);
        color: #fff;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 7px;
        border-radius: 4px;
        white-space: nowrap;
      }
      .squawk-items {
        display: flex;
        align-items: center;
        gap: 16px;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
      }
      .squawk-item { cursor: pointer; color: #f8fafc; font-weight: 600; }
      .squawk-item:hover { color: #38bdf8; }
      .squawk-item b { color: #fde047; font-weight: 900; }

      /* بطاقة الفحص العائمة */
      #momoHoverHud {
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        background: rgba(10, 15, 28, 0.98);
        border: 1px solid #38bdf8;
        border-radius: 8px;
        padding: 10px 12px;
        color: #ffffff;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        width: 285px;
        box-shadow: 0 18px 40px rgba(0,0,0,0.9);
        display: none;
      }
      .hud-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-bottom: 6px; }
      .hud-sym { font-size: 15px; font-weight: 900; color: #38bdf8; }
      .hud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; font-size: 11.5px; margin-bottom: 6px; }
      .hud-grid span { color: #94a3b8; }
      .hud-grid b { color: #ffffff; float: right; }
      .hud-targets { display: flex; justify-content: space-between; background: #0f172a; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; border: 1px solid #1e293b; }
    `;
    document.head.appendChild(style);
  }
  injectUltraStyles();

  /* ---------------- 2. حفظ واسترجاع الفلاتر الأساسية ---------------- */
  var allFilterEls = [fPriceMin, fPriceMax, fVolumeMin, fCapMin, fChangeMin, fRvolMin, fMarket, fLimit, fVerdict, fSort, fRows];

  function saveFilters() {
    if (!fPriceMin) return;
    lsSet(K_FILTERS, JSON.stringify({
      priceMin: fPriceMin.value, priceMax: fPriceMax.value,
      volumeMin: fVolumeMin.value, capMin: fCapMin.value,
      changeMin: fChangeMin.value, rvolMin: fRvolMin.value,
      market: fMarket.value, limit: fLimit.value,
      verdict: fVerdict ? fVerdict.value : '',
      sort: fSort ? fSort.value : 'momo',
      panelRows: fRows ? fRows.value : '8'
    }));
  }

  function loadFilters() {
    try {
      var f = JSON.parse(lsGet(K_FILTERS, 'null'));
      if (!f || !fPriceMin) return;
      if (f.priceMin != null) fPriceMin.value = f.priceMin;
      if (f.priceMax != null) fPriceMax.value = f.priceMax;
      if (f.volumeMin != null) fVolumeMin.value = f.volumeMin;
      if (f.capMin != null) fCapMin.value = f.capMin;
      if (f.changeMin != null) fChangeMin.value = f.changeMin;
      if (f.rvolMin != null) fRvolMin.value = f.rvolMin;
      if (f.market != null) fMarket.value = f.market;
      if (f.limit != null) fLimit.value = f.limit;
      if (f.verdict != null && fVerdict) fVerdict.value = f.verdict;
      if (f.sort != null && fSort) fSort.value = f.sort;
      if (f.panelRows != null && fRows) fRows.value = f.panelRows;
    } catch (e) { }
  }
  loadFilters();

  document.querySelectorAll('.preset-price').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (fPriceMin) fPriceMin.value = btn.getAttribute('data-min');
      if (fPriceMax) fPriceMax.value = btn.getAttribute('data-max');
      saveFilters();
      doScan();
    });
  });

  /* ---------------- 3. دوال مساعدة (Helpers) ---------------- */
  function isNum(n) { return n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n)); }
  function num(v) { if (v === '' || v == null) return null; var n = Number(v); return Number.isFinite(n) ? n : null; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(n, d) {
    if (!isNum(n)) return '—';
    d = d == null ? 2 : d;
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtBig(n) {
    if (!isNum(n)) return '—';
    n = Number(n);
    var a = Math.abs(n);
    if (a >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (a >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toFixed(0);
  }
  function setStatus(msg, cls) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'fw-semibold ' + (cls || '');
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /* ---------------- 4. محرك حساب التسارع اللحظي والـ Delta ---------------- */
  function enrichStockMetrics(s) {
    var price = num(s.price) || 0;
    var vol = num(s.volume) || 0;
    var chg = num(s.changePct) || 0;
    var prev = prevStockSnapshot[s.symbol];

    if (prev) {
      s._volDelta = Math.max(0, vol - prev.vol);
      s._priceDelta = price - prev.price;
      s._chgDelta = chg - prev.chg;
    } else {
      s._volDelta = 0;
      s._priceDelta = 0;
      s._chgDelta = 0;
    }

    s._realSpread = false;
    if (s.bid && s.ask && s.ask > s.bid) {
      s._spread = s.ask - s.bid;
      s._realSpread = true;
    } else {
      s._spread = price < 1 ? 0.005 : (vol > 2e6 ? 0.01 : (vol > 500000 ? 0.02 : 0.05));
    }

    var rvol = (num(s.avgVolume3M) || 0) > 0 ? vol / num(s.avgVolume3M) : (num(s.relVol10D) || 0);
    s._isHaltCandidate = (Math.abs(chg) >= 35 && rvol >= 5) || (Math.abs(s._chgDelta) >= 4);
  }

  /* ---------------- 5. محرك MOMO Score & Verdict Engine ---------------- */
/* % النزول من أعلى سعر في اليوم. null لو الـ Worker مش بيرجّع high */
function offHigh(s) {
  var h = num(s.high), p = num(s.price);
  if (h && p && h > 0) return Math.max(0, (h - p) / h * 100);
  return null;
}

/* السهم "سليم" = فوق VWAP، قريب من قمة اليوم، وفوق الافتتاح */
function isHealthy(s) {
  var vw = num(s.vwapDiff);
  if (vw != null && vw < 0) return false;
  var oh = offHigh(s);
  if (oh != null && oh > 8) return false;
  var o = num(s.open), p = num(s.price);
  if (o && p && p < o) return false;
  return true;
}

function computeMomo(s) {
  var chg = num(s.changePct) || 0;
  var vol = num(s.volume) || 0;
  var price = num(s.price) || 0;
  var avg = num(s.avgVolume3M) || 0;
  var rvol = avg > 0 ? vol / avg : (num(s.relVol10D) || 0);
  var floatS = num(s.floatShares) || 0;
  var w52 = num(s.week52Pos);
  var vwapD = num(s.vwapDiff);
  var oh = offHigh(s);
  var o = num(s.open);

  var score = 40; // كان 50 — كان بيدّي نجاح مجاني

  // السيولة النسبية
  if (rvol >= 5) score += 22;
  else if (rvol >= 3) score += 16;
  else if (rvol >= 2) score += 10;
  else if (rvol >= 1.5) score += 4;
  else if (rvol < 1) score -= 15;

  // نسبة التغير
  if (chg >= 5 && chg <= 18) score += 14;
  else if (chg > 18 && chg <= 35) score += 10;
  else if (chg > 35 && chg <= 55) score += 2;
  else if (chg > 55) score -= 10;
  else if (chg >= 2 && chg < 5) score += 4;
  else if (chg < 0) score -= 20;

  // Float: شيلت مكافأة الـ float الصغير جداً (<5M) — ده فخ pump & dump
  var ffM = floatS / 1e6;
  if (ffM >= 5 && ffM <= 30) score += 8;
  else if (ffM > 30 && ffM <= 60) score += 3;
  else if (ffM > 120) score -= 10;

  if (w52 != null) {
    if (w52 >= 85) score += 6;
    else if (w52 >= 65) score += 3;
    else if (w52 <= 15) score -= 6;
  }

  // VWAP: العقوبة تحت VWAP بقت تقيلة
  if (vwapD != null) {
    if (vwapD > 2) score += 10;
    else if (vwapD > 0) score += 4;
    else if (vwapD < -2) score -= 25;
    else score -= 15;
  }

  // البعد عن قمة اليوم (أهم فلتر ضد الأسهم اللي بتفشل وبتنزل)
  if (oh != null) {
    if (oh <= 3) score += 8;
    else if (oh <= 8) score += 0;
    else if (oh <= 15) score -= 10;
    else score -= 22;
  }
  if (o && price && price < o) score -= 12;

  // تدفق السيولة اللحظي: شراء مقابل بيع بحجم
  if (s._volDelta > 25000) {
    if (s._priceDelta > 0) score += 5;
    else if (s._priceDelta < 0) score -= 8;
  }

  if (vol > 0 && vol < 100000) score -= 15;
  if (price > 0 && price < 1) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeVerdict(s) {
  if (s._v) return s._v;
  var price = num(s.price) || 0;
  var chg = num(s.changePct) || 0;
  var vol = num(s.volume) || 0;
  var avg30 = num(s.avgVolume3M) || 0;
  var rvol = avg30 > 0 ? vol / avg30 : (num(s.relVol10D) || 0);
  var momo = computeMomo(s);
  var floatS = num(s.floatShares) || 0;
  var w52 = num(s.week52Pos);
  var vwapD = num(s.vwapDiff);
  var oh = offHigh(s);
  var healthy = isHealthy(s);

  var type = 'wait';
  var signals = [];
  var risks = [];

  if (rvol >= 3) signals.push('🔥 RVOL ' + rvol.toFixed(1) + 'x');
  else if (rvol >= 2) signals.push('📈 RVOL ' + rvol.toFixed(1) + 'x');
  else if (rvol >= 1.5) signals.push('📊 RVOL نشط');

  if (chg >= 5 && chg <= 20) signals.push('✅ صعود ' + chg.toFixed(1) + '%');
  else if (chg > 20 && chg <= 40) signals.push('🚀 فوران ' + chg.toFixed(1) + '%');
  if (floatS > 0 && floatS <= 30e6 && floatS >= 5e6) signals.push('💎 Float ' + (floatS / 1e6).toFixed(1) + 'M');
  if (w52 != null && w52 >= 85) signals.push('🏔️ قمة 52W');
  if (vwapD != null && vwapD > 0) signals.push('📍 فوق VWAP');
  if (s._volDelta >= 50000 && s._priceDelta > 0) signals.push('⚡ شراء لحظي +' + fmtBig(s._volDelta));

  if (price > 0 && price < 1) risks.push('🪙 سهم سنتات (<$1)');
  if (floatS > 0 && floatS < 5e6) risks.push('🎯 Float ضيق جداً (فخ محتمل)');
  if (chg > 45) risks.push('⚡ متضخم جداً');
  if (chg < -5) risks.push('📉 هبوط حاد');
  if (rvol > 20) risks.push('🎰 مضاربة عنيفة');
  if (vol > 0 && vol < 100000) risks.push('💧 سيولة ضعيفة');
  if (floatS > 120e6) risks.push('🐘 Float ثقيل');
  if (vwapD != null && vwapD < 0) risks.push('⬇️ تحت VWAP');
  if (oh != null && oh > 8) risks.push('📉 نازل ' + oh.toFixed(0) + '% من القمة');
  if (s._volDelta >= 25000 && s._priceDelta < 0) risks.push('🩸 بيع بحجم');
  var spPct = (s._realSpread && price > 0) ? s._spread / price * 100 : null;
  if (spPct != null && spPct > 3) risks.push('↔️ سبريد واسع ' + spPct.toFixed(1) + '%');

  if (vol > 0 && vol < 80000) {
    type = 'danger';
  } else if (chg > 55 || chg < -8) {
    type = 'unstable';
  } else if (!healthy) {
    type = momo >= 45 ? 'wait' : 'weak';          // فاشل/بينزل: ممنوع enter و watch
  } else if (
    momo >= 75 && rvol >= 2 && chg >= 5 && chg <= 40 &&
    price >= 1 && vol >= 500000 && vwapD != null &&
    (spPct == null || spPct <= 3) &&
    (floatS === 0 || floatS <= 100e6)
  ) {
    type = 'enter';
  } else if (momo >= 62 && rvol >= 1.5 && price >= 1) {
    type = 'watch';
  } else if (momo >= 45) {
    type = 'wait';
  } else {
    type = 'weak';
  }

  // وقف الخسارة على VWAP (هيكلي) والأهداف بنسبة مخاطرة/عائد ثابتة 1.5R / 3R
  var tp1, tp2, sl;
  if (price > 0) {
    var risk;
    if (vwapD != null && vwapD > 0) {
      var vwapPrice = price / (1 + vwapD / 100);
      risk = price - vwapPrice * 0.995;
    } else {
      risk = price * 0.07;
    }
    risk = Math.min(price * 0.10, Math.max(price * 0.03, risk));
    sl = price - risk;
    tp1 = price + risk * 1.5;
    tp2 = price + risk * 3;
  }

  var labels = {
    enter: { txt: '🚀 ادخل فوراً', cls: 'enter' },
    watch: { txt: '👀 مراقبة', cls: 'watch' },
    wait: { txt: '⏸️ انتظر', cls: 'wait' },
    weak: { txt: '💤 ضعيف', cls: 'weak' },
    unstable: { txt: '⚡ غير مستقر', cls: 'unstable' },
    danger: { txt: '🛑 خطر', cls: 'danger' }
  };

  s._v = {
    type: type, label: labels[type].txt, cls: labels[type].cls,
    momo: momo, signals: signals, risks: risks,
    tp1: tp1, tp2: tp2, sl: sl, rvol: rvol
  };
  return s._v;
}

  /* ---------------- 6. تعريف الـ 19 لوحة بتدرجات لونية فخمة (Royal Gradients) ---------------- */
  function P(s) { return num(s.price) || 0; }
  function C(s) { return num(s.changePct) || 0; }
  function V(s) { return num(s.volume) || 0; }
  function F(s) { return num(s.floatShares) || 0; }
  function R(s) { return computeVerdict(s).rvol; }
  function M(s) { return computeVerdict(s).momo; }
  function W(s) { var w = num(s.week52Pos); return w == null ? -1 : w; }
  function VW(s) { var w = num(s.vwapDiff); return w == null ? -999 : w; }

  var PANELS = [
    { num: 13, id: 'under20', title: 'UNDER 20 MOVING UP FAST', color: '#38bdf8',
      rbg: 'linear-gradient(160deg, #082f49 0%, #0369a1 100%)', cols: ['price', 'vol', 'flt', 'chg'],
      test: function (s) { return P(s) > 0 && P(s) <= 20 && C(s) >= 4 && R(s) >= 1.5; },
      sort: function (a, b) { return (C(b) * R(b)) - (C(a) * R(a)); } },

    { num: 16, id: 'bounces', title: 'CATCH BOUNCES', color: '#a3e635',
      rbg: 'linear-gradient(160deg, #1a2e05 0%, #3f6212 100%)', cols: ['price', 'vol', 'flt', 'vwap'],
      test: function (s) { return VW(s) > 0 && C(s) > -4 && C(s) < 6 && R(s) >= 1.2; },
      sort: function (a, b) { return VW(b) - VW(a); } },

    { num: 9, id: 'sweetspot', title: 'SWEET SPOT', color: '#facc15',
      rbg: 'linear-gradient(160deg, #422006 0%, #854d0e 100%)', cols: ['price', 'vol', 'sprd', 'rvol'],
      test: function (s) { return P(s) >= 1 && P(s) <= 15 && C(s) >= 3 && R(s) >= 1.5 && (F(s) === 0 || F(s) <= 50e6); },
      sort: function (a, b) { return M(b) - M(a); } },

    { num: 3, id: 'gappers', title: 'GAPPERS', color: '#34d399',
      rbg: 'linear-gradient(160deg, #022c22 0%, #047857 100%)', cols: ['price', 'vol', 'flt', 'chg'],
      test: function (s) { return C(s) >= 4; },
      sort: function (a, b) { return C(b) - C(a); } },

    { num: 8, id: 'pop', title: 'POP', color: '#4ade80',
      rbg: 'linear-gradient(160deg, #052e16 0%, #15803d 100%)', cols: ['price', 'flt', 'vol', 'up'],
      test: function (s) { return C(s) >= 7 && R(s) >= 2.5; },
      sort: function (a, b) { return (b._priceDelta || C(b)) - (a._priceDelta || C(a)); } },

    { num: 19, id: 'momo1', title: 'MOMO 1', color: '#fbbf24',
      rbg: 'linear-gradient(160deg, #451a03 0%, #92400e 100%)', cols: ['price', 'vol', 'flt', 'rvol'],
      test: function (s) { return M(s) >= 68 && C(s) >= 3; },
      sort: function (a, b) { return R(b) - R(a); } },

    { num: 17, id: 'momo2', title: 'MOMO 2', color: '#22c55e',
      rbg: 'linear-gradient(160deg, #064e3b 0%, #115e59 100%)', cols: ['price', 'vol', 'flt', 'rvol'],
      test: function (s) { return M(s) >= 74 && R(s) >= 2 && (F(s) === 0 || F(s) <= 30e6); },
      sort: function (a, b) { return M(b) - M(a); } },

    { num: 1, id: 'topmovers', title: 'TOP MOVERS (1 MIN)', color: '#fb923c',
      rbg: 'linear-gradient(160deg, #431407 0%, #9a3412 100%)', cols: ['price', 'chg', 'vol', 'vchg'],
      test: function (s) { return V(s) > 100000 && Math.abs(C(s)) >= 3; },
      sort: function (a, b) { return (b._volDelta || V(b)) - (a._volDelta || V(a)); } },

    { num: 14, id: 'trending', title: 'TRENDING', color: '#c084fc',
      rbg: 'linear-gradient(160deg, #2e1065 0%, #581c87 100%)', cols: ['price', 'vol', 'rvol', 'chg'],
      test: function (s) { return V(s) >= 500000 && C(s) > 0; },
      sort: function (a, b) { return V(b) - V(a); } },

    { num: 5, id: 'penny', title: 'PENNY GAPPERS', color: '#2dd4bf',
      rbg: 'linear-gradient(160deg, #042f2e 0%, #0f766e 100%)', cols: ['price', 'vol', 'flt', 'chg'],
      test: function (s) { return P(s) > 0 && P(s) <= 1.5 && C(s) >= 4; },
      sort: function (a, b) { return C(b) - C(a); } },

    { num: 6, id: 'impgappers', title: 'IMPORTANT GAPPERS', color: '#10b981',
      rbg: 'linear-gradient(160deg, #064e3b 0%, #065f46 100%)', cols: ['price', 'vol', 'flt', 'chg'],
      test: function (s) { return C(s) >= 10 && V(s) >= 500000 && R(s) >= 2; },
      sort: function (a, b) { return C(b) - C(a); } },

    { num: 11, id: 'momo3', title: 'MOMO 3', color: '#06b6d4',
      rbg: 'linear-gradient(160deg, #083344 0%, #155e75 100%)', cols: ['price', 'vol', 'flt', 'rvol'],
      test: function (s) { return VW(s) >= 1 && R(s) >= 2.5 && C(s) >= 2; },
      sort: function (a, b) { return R(b) - R(a); } },

    { num: 2, id: 'momo4', title: 'MOMO 4', color: '#60a5fa',
      rbg: 'linear-gradient(160deg, #172554 0%, #1e40af 100%)', cols: ['price', 'vol', 'vchg', 'up'],
      test: function (s) { return C(s) > 0 && (s._volDelta > 0 || R(s) >= 2); },
      sort: function (a, b) { return (b._volDelta || R(b)) - (a._volDelta || R(a)); } },

    { num: 7, id: 'mainmomo', title: 'MAIN MOMO', color: '#22d3ee',
      rbg: 'linear-gradient(160deg, #0f172a 0%, #0e7490 100%)', cols: ['price', 'vol', 'flt', 'momo'],
      test: function (s) { var t = computeVerdict(s).type; return t === 'enter' || t === 'watch'; },
      sort: function (a, b) { return M(b) - M(a); } },

    { num: 18, id: 'postgappers', title: 'POST GAPPERS', color: '#84cc16',
      rbg: 'linear-gradient(160deg, #14532d 0%, #166534 100%)', cols: ['price', 'vol', 'chg', 'w52'],
      test: function (s) { return C(s) >= 5 && W(s) >= 75; },
      sort: function (a, b) { return W(b) - W(a); } },

    { num: 4, id: 'losers', title: 'LOSERS', color: '#fb7185',
      rbg: 'linear-gradient(160deg, #4c0519 0%, #881337 100%)', cols: ['price', 'vol', 'rvol', 'chg'],
      test: function (s) { return C(s) <= -3; },
      sort: function (a, b) { return C(a) - C(b); } },

    { num: 15, id: 'largecaps', title: 'MOMO LARGE CAPS HIGH', color: '#818cf8',
      rbg: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)', cols: ['price', 'vol', 'flt', 'mc'],
      test: function (s) { return (num(s.marketCap) || 0) >= 5e9; },
      sort: function (a, b) { return (num(b.marketCap) || 0) - (num(a.marketCap) || 0); } },

    { num: 12, id: 'newhighs', title: 'NEW DAILY HIGHS', color: '#34d399',
      rbg: 'linear-gradient(160deg, #022c22 0%, #0d9488 100%)', cols: ['price', 'vol', 'flt', 'w52'],
      test: function (s) { return W(s) >= 90 && C(s) > 0; },
      sort: function (a, b) { return W(b) - W(a) || C(b) - C(a); } },

    { num: 10, id: 'halt', title: 'HALT / EXTREME VOL', color: '#f43f5e',
      rbg: 'linear-gradient(160deg, #450a0a 0%, #7f1d1d 100%)', cols: ['price', 'chg', 'rvol', 'desc'],
      test: function (s) { return s._isHaltCandidate || Math.abs(C(s)) >= 25 || R(s) >= 8; },
      sort: function (a, b) { return Math.abs(C(b)) - Math.abs(C(a)); } }
  ];

  var COLS = {
    price: { h: 'PRICE', cls: 'col-price', f: function (s) { var p = num(s.price); return isNum(p) ? fmt(p, p < 1 ? 4 : 2) : '—'; } },
    chg:   { h: 'GAP%',  cls: 'col-chg',   f: function (s) { var c = num(s.changePct); return isNum(c) ? '<span class="' + (c >= 0 ? 'up' : 'down') + '">' + (c >= 0 ? '+' : '') + fmt(c, 0) + '%</span>' : '—'; } },
    vol:   { h: 'VOLUME',cls: 'col-vol',   f: function (s) { return fmtBig(s.volume); } },
    flt:   { h: 'FLOAT', cls: 'col-flt',   f: function (s) { return isNum(s.floatShares) && s.floatShares > 0 ? fmtBig(s.floatShares) : '—'; } },
    rvol:  { h: 'RVOL',  cls: 'col-rvol',  f: function (s) { var r = R(s); return r > 0 ? fmt(r, 2) : '—'; } },
    mc:    { h: 'M.CAP', cls: 'col-vol',   f: function (s) { return fmtBig(s.marketCap); } },
    w52:   { h: '52W%',  cls: 'col-rvol',  f: function (s) { return isNum(s.week52Pos) ? fmt(s.week52Pos, 0) + '%' : '—'; } },
    momo:  { h: 'MOMO',  cls: 'col-flt',   f: function (s) { return '<b>' + M(s) + '</b>'; } },
    vwap:  { h: 'VWAP%', cls: 'col-chg',   f: function (s) { var v = num(s.vwapDiff); return isNum(v) ? '<span class="' + (v >= 0 ? 'up' : 'down') + '">' + (v >= 0 ? '+' : '') + fmt(v, 1) + '%</span>' : '—'; } },
    sprd:  { h: 'SPREAD',cls: 'col-vol',   f: function (s) {
      var sp = s._spread || 0.01;
      var txt = sp >= 1 ? sp.toFixed(2) : '.' + String(Math.round(sp * 100)).padStart(2, '0');
      return s._realSpread ? txt : '<span style="opacity:.45">~' + txt + '</span>';
    } },
    vchg:  { h: 'VOL Δ', cls: 'col-rvol',  f: function (s) { return s._volDelta > 0 ? '+' + fmtBig(s._volDelta) : fmtBig(V(s) * 0.05); } },
    up:    { h: 'UP',    cls: 'col-chg',   f: function (s) {
      var d = s._priceDelta || (P(s) * (C(s) / 100) * 0.05);
      return '<span class="' + (d >= 0 ? 'up' : 'down') + '">' + (d >= 0 ? '+' : '') + fmt(d, 2) + '</span>';
    }},
    desc:  { h: 'DESC.', cls: 'col-vol',   f: function (s) {
      if (Math.abs(C(s)) >= 35) return '<span class="halt-badge">VOLATILE</span>';
      if (R(s) >= 10) return '<span class="halt-badge" style="background:#d97706">SURGE</span>';
      return 'Events';
    }}
  };

var HIST_MS = 15 * 60 * 1000;   // نحتفظ بآخر 15 دقيقة لكل سهم
var WIN_MS  = 3 * 60 * 1000;    // نافذة الحركة اللحظية
var EVT_MS  = 5 * 60 * 1000;    // الحدث يفضل ظاهر 5 دقايق
var MIN_AGE = 60 * 1000;        // أقل عمر بيانات مقبول لحساب 3 دقايق

var hist = {};      // sym -> [{t,p,v,w}]
var sessHigh = {};  // sym -> أعلى سعر اتشاف (أو high من الـ API لو موجود)
var evts = {};      // sym -> {brk, flush, vwapx} (أوقات آخر حدث)

function enrichHistory(s) {
  var sym = s.symbol;
  var now = Date.now();
  var p = num(s.price) || 0;
  var v = num(s.volume) || 0;
  var w = num(s.vwapDiff);
  var h = hist[sym] || (hist[sym] = []);
  var e = evts[sym] || (evts[sym] = {});
  var last = h.length ? h[h.length - 1] : null;
  var prevHigh = sessHigh[sym];

  // أقدم نقطة جوه نافذة الـ 3 دقايق
  var ref = null;
  for (var i = 0; i < h.length; i++) {
    if (now - h[i].t <= WIN_MS) { ref = h[i]; break; }
  }
  s._chg3m = null;
  s._vol3m = 0;
  if (ref && ref.p > 0 && now - ref.t >= MIN_AGE) {
    s._chg3m = (p - ref.p) / ref.p * 100;
    s._vol3m = Math.max(0, v - ref.v);
  }

  var established = h.length >= 6; // مفيش أحداث قبل ما يبقى فيه تاريخ كفاية
  function fresh(k) { return !e[k] || now - e[k] > EVT_MS; }

  // كسر قمة بحجم
  if (established && prevHigh && p > prevHigh && s._vol3m >= 30000 && fresh('brk')) e.brk = now;
  // Flush: نزول حاد بحجم
  if (established && s._chg3m != null && s._chg3m <= -3 && s._vol3m >= 50000 && fresh('flush')) e.flush = now;
  // عبور VWAP لفوق
  if (last && last.w != null && w != null && last.w <= 0 && w > 0 && fresh('vwapx')) e.vwapx = now;

  sessHigh[sym] = Math.max(prevHigh || 0, p, num(s.high) || 0);

  h.push({ t: now, p: p, v: v, w: w });
  while (h.length && h[0].t < now - HIST_MS) h.shift();
}

function evtActive(s, k) {
  var e = evts[s.symbol];
  return !!(e && e[k] && Date.now() - e[k] < EVT_MS);
}
function evtTime(s, k) { var e = evts[s.symbol]; return (e && e[k]) || 0; }
function lastEvtTime(s) {
  var e = evts[s.symbol] || {};
  return Math.max(e.brk || 0, e.flush || 0, e.vwapx || 0);
}

/* ---------------- أعمدة جديدة ---------------- */
COLS.chg3 = { h: '3M%', cls: 'col-chg', f: function (s) {
  var c = s._chg3m;
  return c == null ? '—' : '<span class="' + (c >= 0 ? 'up' : 'down') + '">' + (c >= 0 ? '+' : '') + fmt(c, 1) + '%</span>';
}};
COLS.vol3 = { h: 'VOL 3M', cls: 'col-rvol', f: function (s) {
  return s._vol3m > 0 ? fmtBig(s._vol3m) : '—';
}};
COLS.ago = { h: 'AGO', cls: 'col-flt', f: function (s) {
  var t = lastEvtTime(s);
  if (!t) return '—';
  var sec = Math.floor((Date.now() - t) / 1000);
  return Math.floor(sec / 60) + 'm' + pad2(sec % 60);
}};

/* ---------------- لوحات الأحداث ---------------- */
var EVENT_PANELS = [
  { num: 20, id: 'breakhigh', title: 'BREAKING HIGH WITH VOLUME', color: '#a3e635',
    rbg: 'linear-gradient(160deg, #1a2e05 0%, #3f6212 100%)', cols: ['price', 'ago', 'vol3', 'sprd'],
    test: function (s) { return evtActive(s, 'brk') && P(s) >= 1; },
    sort: function (a, b) { return evtTime(b, 'brk') - evtTime(a, 'brk'); } },

  { num: 21, id: 'possentry', title: 'POSSIBLE ENTRY', color: '#fdba74',
    rbg: 'linear-gradient(160deg, #431407 0%, #9a3412 100%)', cols: ['price', 'ago', 'rvol', 'sprd'],
    test: function (s) {
      return evtActive(s, 'brk') && isHealthy(s) && P(s) >= 1 && R(s) >= 1.5 && C(s) >= 3 && (s._spread || 0) <= Math.max(0.05, P(s) * 0.01);
    },
    sort: function (a, b) { return evtTime(b, 'brk') - evtTime(a, 'brk'); } },

  { num: 22, id: 'vwapcross', title: 'VWAP CROSS UP', color: '#22d3ee',
    rbg: 'linear-gradient(160deg, #083344 0%, #155e75 100%)', cols: ['price', 'ago', 'vwap', 'vol'],
    test: function (s) { return evtActive(s, 'vwapx') && P(s) >= 1; },
    sort: function (a, b) { return evtTime(b, 'vwapx') - evtTime(a, 'vwapx'); } },

  { num: 23, id: 'flush', title: 'FLUSH (تحذير)', color: '#fb7185',
    rbg: 'linear-gradient(160deg, #4c0519 0%, #881337 100%)', cols: ['price', 'ago', 'chg3', 'vol3'],
    test: function (s) { return evtActive(s, 'flush'); },
    sort: function (a, b) { return evtTime(b, 'flush') - evtTime(a, 'flush'); } },

  { num: 1, id: 'topmovers', title: 'TOP MOVERS (3 MIN)', color: '#fb923c',
    rbg: 'linear-gradient(160deg, #431407 0%, #9a3412 100%)', cols: ['price', 'chg3', 'vol', 'vol3'],
    test: function (s) { return s._chg3m != null && Math.abs(s._chg3m) >= 2 && s._vol3m >= 20000 && V(s) >= 250000; },
    sort: function (a, b) { return Math.abs(b._chg3m) - Math.abs(a._chg3m); } }
];

// الأحداث في الأول، واستبدال TOP MOVERS القديمة
PANELS = EVENT_PANELS.concat(PANELS.filter(function (p) { return p.id !== 'topmovers'; }));

  /* ---------------- 7. بناء اللوحات والرادار التفاعلي ---------------- */
  function renderPanels(rows) {
    if (!panelsEl) return;
    rows = rows || [];
    var limit = parseInt(fRows ? fRows.value : '8', 10) || 8;
    var q = (uiState.search || '').trim().toUpperCase();

    var symPanelCount = {};
    var panelOutputs = [];

    PANELS.forEach(function (p) {
      if (uiState.maximized && uiState.maximized !== p.id) return;

      var list = rows.filter(function (s) {
        if (!s || !s.symbol) return false;
        if (q && s.symbol.toUpperCase().indexOf(q) === -1) return false;
        var longOnly = ['losers', 'halt', 'largecaps', 'flush'].indexOf(p.id) === -1;
        if (longOnly && !isHealthy(s)) return false;
        return p.test(s);
      }).sort(p.sort);

      var total = list.length;
      var maxRows = uiState.maximized === p.id ? 40 : limit;
      var sliced = list.slice(0, maxRows);

      sliced.forEach(function (s) {
        if (p.id !== 'flush') symPanelCount[s.symbol] = (symPanelCount[s.symbol] || 0) + 1;
      });

      var prev = prevPanelSyms[p.id] || null;
      var syms = sliced.map(function (s) { return s.symbol; });
      if (rows.length > 0) prevPanelSyms[p.id] = syms;

      if (prev && rows.length > 0) {
        sliced.forEach(function (s) {
          if (prev.indexOf(s.symbol) === -1) {
            var now = new Date();
            var tStr = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
            liveFeedLogs.unshift({
              time: tStr,
              sym: s.symbol,
              panel: p.title,
              price: P(s),
              chg: C(s)
            });
          }
        });
        if (liveFeedLogs.length > 25) liveFeedLogs.length = 25;
      }

      var head = '<tr><th>SYMBOL</th>' + p.cols.map(function (c) { return '<th>' + COLS[c].h + '</th>'; }).join('') + '</tr>';
      var body = sliced.length ? sliced.map(function (s) {
        var isNew = prev && prev.indexOf(s.symbol) === -1;
        var isPinned = pinnedSyms.indexOf(s.symbol) !== -1;
        var isHi = uiState.highlightSym === s.symbol;
        var dirArrow = s._priceDelta > 0 ? '<span style="color:#4ade80;font-size:9px">▲</span>' : (s._priceDelta < 0 ? '<span style="color:#fb7185;font-size:9px">▼</span>' : '');

        var rowCls = [];
        if (isNew) rowCls.push('sc-new');
        if (isHi) rowCls.push('sym-highlighted');

        return '<tr data-symbol="' + esc(s.symbol) + '" class="' + rowCls.join(' ') + '">' +
          '<td class="sy">' +
            (isPinned ? '⭐' : '') +
            esc(s.symbol) +
            dirArrow +
          '</td>' +
          p.cols.map(function (c) { return '<td class="' + (COLS[c].cls || '') + '">' + COLS[c].f(s) + '</td>'; }).join('') +
          '</tr>';
      }).join('') : '<tr><td colspan="' + (p.cols.length + 1) + '" style="text-align:center;padding:22px;color:#94a3b8 !important">' + (rows.length ? 'لا توجد نتائج' : 'جاري التحميل...') + '</td></tr>';

      panelOutputs.push(
        '<div class="sc-panel' + (uiState.maximized === p.id ? ' maximized' : '') + '" style="--pc:' + p.color + ';--rbg:' + p.rbg + '">' +
          '<div class="sc-ph">' +
            '<div class="sc-ph-left">' +
              '<span class="sc-ph-num">' + p.num + '</span>' +
              '<span>' + esc(p.title) + '</span>' +
            '</div>' +
            '<div class="sc-ph-right">' +
              '<span class="sc-ph-cnt">' + total + '</span>' +
              '<button type="button" class="sc-ph-btn" data-max-panel="' + p.id + '" title="تكبير / تصغير">' + (uiState.maximized === p.id ? '🗗' : '⛶') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="sc-pb"><table class="sc-pt"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
        '</div>'
      );
    });

    var hotSyms = Object.keys(symPanelCount)
      .filter(function (sym) { return symPanelCount[sym] >= 3; })
      .sort(function (a, b) { return symPanelCount[b] - symPanelCount[a]; })
      .slice(0, 12);

    var cmdBarHtml =
      '<div class="momo-cmd-bar">' +
        '<div class="momo-cmd-group">' +
          '<span style="font-weight:900;color:#38bdf8;letter-spacing:0.5px;font-size:12.5px">⚡ MOMO PRO TERMINAL</span>' +
          '<input type="text" id="momoQuickSearch" class="momo-search" placeholder="🔍 ابحث عن سهم..." value="' + esc(uiState.search) + '">' +
          (uiState.highlightSym ? '<button type="button" class="momo-btn active" id="momoClearHi">إلغاء التمييز: ' + esc(uiState.highlightSym) + ' ✕</button>' : '') +
        '</div>' +
        '<div class="momo-cmd-group">' +
          '<button type="button" class="momo-btn ' + (uiState.theme === 'royal' ? 'active' : '') + '" data-ui-theme="royal">💎 Royal Glow (ملون واضح)</button>' +
          '<button type="button" class="momo-btn ' + (uiState.theme === 'oled' ? 'active' : '') + '" data-ui-theme="oled">🌑 OLED Contrast (داكن صريح)</button>' +
          '<button type="button" class="momo-btn ' + (uiState.voice ? 'active' : '') + '" id="momoVoiceBtn">🔊 نطق صوتي: ' + (uiState.voice ? 'مفعل' : 'مغلق') + '</button>' +
          '<button type="button" class="momo-btn" id="momoExportCsv">📥 CSV</button>' +
        '</div>' +
      '</div>';

    var hotBarHtml = '<div class="momo-hot-bar">' +
      '<span style="color:#cbd5e1;font-weight:800;white-space:nowrap">🔥 الأسهم المشتعلة (اضغط لتمييز السهم في كل اللوحات):</span>';

    pinnedSyms.forEach(function (sym) {
      hotBarHtml += '<span class="momo-hot-tag pinned" data-hi-sym="' + esc(sym) + '">⭐ ' + esc(sym) + '</span>';
    });

    if (hotSyms.length) {
      hotSyms.forEach(function (sym) {
        var rObj = rows.find(function (r) { return r.symbol === sym; });
        var chgTxt = rObj && isNum(rObj.changePct) ? (rObj.changePct >= 0 ? '+' : '') + fmt(rObj.changePct, 0) + '%' : '';
        hotBarHtml += '<span class="momo-hot-tag hot-fire" data-hi-sym="' + esc(sym) + '" title="يظهر في ' + symPanelCount[sym] + ' لوحات في نفس الوقت">' +
          '🔥 ' + esc(sym) + ' <small>' + chgTxt + '</small> <span class="cnt">' + symPanelCount[sym] + 'x</span></span>';
      });
    } else {
      hotBarHtml += '<span style="color:#94a3b8">بانتظار تقاطع السيولة...</span>';
    }
    hotBarHtml += '</div>';

    var squawkHtml = '<div class="momo-Squawk-bar">' +
      '<span class="squawk-label">LIVE SQUAWK</span>' +
      '<div class="squawk-items">' +
      (liveFeedLogs.length ? liveFeedLogs.map(function (item) {
        return '<span class="squawk-item" data-symbol="' + esc(item.sym) + '">' +
          '<small style="color:#94a3b8">[' + item.time + ']</small> ' +
          '<b>' + esc(item.sym) + '</b> تحرك في <u style="color:#38bdf8">' + esc(item.panel) + '</u> ($' + fmt(item.price, 2) + ' / ' + (item.chg >= 0 ? '+' : '') + fmt(item.chg, 1) + '%)' +
        '</span>';
      }).join(' • ') : '<span>رادار الاختراقات اللحظية يعمل الآن...</span>') +
      '</div></div>';

    panelsEl.className = 'sc-grid mb-3 theme-' + uiState.theme;
    panelsEl.innerHTML =
      cmdBarHtml +
      hotBarHtml +
      '<div class="momo-grid-wrap" style="--momo-cols:' + uiState.colsPerRow + '">' + panelOutputs.join('') + '</div>' +
      squawkHtml;

    var searchInp = document.getElementById('momoQuickSearch');
    if (searchInp) {
      searchInp.addEventListener('input', function () {
        uiState.search = searchInp.value;
        renderPanels(lastScannedRows);
        var newInp = document.getElementById('momoQuickSearch');
        if (newInp) { newInp.focus(); newInp.setSelectionRange(newInp.value.length, newInp.value.length); }
      });
    }
  }

  /* ---------------- 8. بطاقة الفحص العائمة (Hover HUD) ---------------- */
  function getOrCreateHud() {
    var hud = document.getElementById('momoHoverHud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'momoHoverHud';
      document.body.appendChild(hud);
    }
    return hud;
  }

  function showHoverHud(sym, ev) {
    var s = lastScannedRows.find(function (r) { return r.symbol === sym; });
    if (!s) return;
    var hud = getOrCreateHud();
    var v = computeVerdict(s);
    var price = num(s.price) || 0;
    var dec = price < 1 ? 4 : 2;
    var chg = num(s.changePct) || 0;

    hud.innerHTML =
      '<div class="hud-hdr">' +
        '<div><span class="hud-sym">' + esc(s.symbol) + '</span> <small style="color:#cbd5e1">' + esc((s.name || '').slice(0, 18)) + '</small></div>' +
        '<span class="v-pill v-' + v.cls + '" style="font-size:10.5px;padding:2px 6px;border-radius:4px;background:#1e293b;color:#fff;font-weight:800">' + esc(v.label) + '</span>' +
      '</div>' +
      '<div class="hud-grid">' +
        '<div><span>السعر:</span> <b>$' + fmt(price, dec) + ' (' + (chg >= 0 ? '+' : '') + fmt(chg, 1) + '%)</b></div>' +
        '<div><span>MOMO:</span> <b style="color:#fde047">' + v.momo + ' / 100</b></div>' +
        '<div><span>السيولة:</span> <b>' + fmtBig(s.volume) + '</b></div>' +
        '<div><span>RVOL:</span> <b style="color:#7dd3fc">' + fmt(v.rvol, 2) + 'x</b></div>' +
        '<div><span>Float:</span> <b style="color:#fde047">' + fmtBig(s.floatShares) + '</b></div>' +
        '<div><span>قمة 52W:</span> <b>' + (isNum(s.week52Pos) ? fmt(s.week52Pos, 0) + '%' : '—') + '</b></div>' +
      '</div>' +
      (v.tp1 ? (
        '<div class="hud-targets">' +
          '<span style="color:#4ade80">TP1: $' + fmt(v.tp1, dec) + '</span>' +
          '<span style="color:#38bdf8">TP2: $' + fmt(v.tp2, dec) + '</span>' +
          '<span style="color:#fb7185">SL: $' + fmt(v.sl, dec) + '</span>' +
        '</div>'
      ) : '') +
      '<div style="font-size:10.5px;color:#f1f5f9;margin-top:5px">' + v.signals.concat(v.risks).map(esc).join(' • ') + '</div>' +
      '<div style="font-size:9.5px;color:#94a3b8;margin-top:4px;text-align:right">كليك يسار: إرسال للحاسبة | كليك يمين: تثبيت ⭐</div>';

    hud.style.display = 'block';
    positionHud(ev);
  }

  function positionHud(ev) {
    var hud = document.getElementById('momoHoverHud');
    if (!hud || hud.style.display === 'none') return;
    var x = ev.clientX + 16;
    var y = ev.clientY + 16;
    if (x + 295 > window.innerWidth) x = ev.clientX - 300;
    if (y + 215 > window.innerHeight) y = ev.clientY - 215;
    hud.style.left = x + 'px';
    hud.style.top = y + 'px';
  }

  function hideHoverHud() {
    var hud = document.getElementById('momoHoverHud');
    if (hud) hud.style.display = 'none';
  }

  if (panelsEl) {
    panelsEl.addEventListener('mouseover', function (e) {
      var tr = e.target.closest('tr[data-symbol]');
      if (tr) showHoverHud(tr.getAttribute('data-symbol'), e);
    });
    panelsEl.addEventListener('mousemove', positionHud);
    panelsEl.addEventListener('mouseleave', hideHoverHud);
  }

  /* ---------------- 9. الجدول الرئيسي التفصيلي ---------------- */
  function momoBar(score) {
    var cls = score >= 72 ? 'hi' : score >= 55 ? 'mid' : score >= 35 ? 'lo' : 'vlo';
    return '<div class="momo-wrap">' +
      '<span class="momo-val ' + cls + '">' + score + '</span>' +
      '<i class="momo-bar"><em class="' + cls + '" style="width:' + score + '%"></em></i>' +
      '</div>';
  }

  function renderRow(s) {
    var v = computeVerdict(s);
    var price = num(s.price);
    var dec = (price != null && price < 1) ? 4 : 2;
    var chg = num(s.changePct);
    var chgCls = (chg || 0) >= 0 ? 'up' : 'down';

    var prevClose = num(s.previousClose || s.prevClose);
    if (prevClose == null && price != null && chg != null) {
      prevClose = price / (1 + (chg / 100));
    }

    var priceStr = isNum(price) ? '$' + fmt(price, dec) : '—';
    var pcStr = isNum(prevClose) ? '$' + fmt(prevClose, dec) : '—';
    var chgStr = isNum(chg) ? (chg >= 0 ? '+' : '') + fmt(chg, 2) + '%' : '—';
    var volStr = fmtBig(s.volume);
    var relVol = isNum(s.relVol10D) ? fmt(s.relVol10D, 2) + 'x' : '—';
    var rvolStr = v.rvol > 0 ? fmt(v.rvol, 2) + 'x' : '—';
    var mcStr = fmtBig(s.marketCap);
    var floatStr = isNum(s.floatShares) ? fmtBig(s.floatShares) + (isNum(s.floatPct) ? ' <small class="text-body-secondary">(' + fmt(s.floatPct, 0) + '%)</small>' : '') : '—';
    var w52Str = isNum(s.week52Pos) ? fmt(s.week52Pos, 0) + '%' : '—';
    var actStr = s.sector || s.industry || '';

    var tpSlHtml = '';
    if (v.tp1 && v.sl && (v.type === 'enter' || v.type === 'watch')) {
      tpSlHtml =
        '<div class="tp-sl">' +
        '<span class="tp">TP1: $' + fmt(v.tp1, dec) + '</span>' +
        '<span class="tp2">TP2: $' + fmt(v.tp2, dec) + '</span>' +
        '<span class="sl">SL: $' + fmt(v.sl, dec) + '</span>' +
        '</div>';
    } else if (v.type === 'danger' || v.type === 'unstable') {
      tpSlHtml = '<div class="tp-sl text-body-secondary">' + esc(v.risks[0] || '—') + '</div>';
    } else {
      tpSlHtml = '<div class="tp-sl text-body-secondary">—</div>';
    }

    var allNotes = v.signals.concat(v.risks);
    var noteHtml = allNotes.length ? '<div class="verdict-notes">' + allNotes.map(esc).join(' · ') + '</div>' : '';

    return '<tr data-symbol="' + esc(s.symbol) + '">' +
      '<td class="sym-col">' +
      '<div class="sym">' + (pinnedSyms.indexOf(s.symbol) !== -1 ? '⭐ ' : '') + esc(s.symbol) + '</div>' +
      '<div class="sname" title="' + esc(s.name) + '">' + esc(s.name || '') + '</div>' +
      (actStr ? '<span class="badge bg-secondary bg-opacity-25 text-body-secondary" style="font-size:0.65rem">' + esc(actStr) + '</span>' : '') +
      '</td>' +
      '<td class="num fw-bold">' + priceStr + '</td>' +
      '<td class="num fw-bold ' + chgCls + '">' + chgStr + '</td>' +
      '<td class="num text-body-secondary">' + pcStr + '</td>' +
      '<td class="num">' + volStr + '</td>' +
      '<td class="num">' + relVol + '</td>' +
      '<td class="num">' + rvolStr + '</td>' +
      '<td class="num text-warning">' + floatStr + '</td>' +
      '<td class="num">' + mcStr + '</td>' +
      '<td class="num">' + w52Str + '</td>' +
      '<td>' + momoBar(v.momo) + '</td>' +
      '<td><span class="v-pill v-' + v.cls + '">' + esc(v.label) + '</span>' + noteHtml + '</td>' +
      '<td>' + tpSlHtml + '</td>' +
      '</tr>';
  }

  function renderTable(rows) {
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="13" class="text-center py-4 text-body-secondary">لا توجد أسهم مطابقة حالياً — جرّب تقليل شرط الـ RVOL أو التغيّر%</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(renderRow).join('');
  }

  function mainSorter() {
    var k = fSort ? fSort.value : 'momo';
    if (k === 'change') return function (a, b) { return C(b) - C(a); };
    if (k === 'volume') return function (a, b) { return V(b) - V(a); };
    if (k === 'rvol') return function (a, b) { return R(b) - R(a); };
    if (k === 'marketCap') return function (a, b) { return (num(b.marketCap) || 0) - (num(a.marketCap) || 0); };
    return function (a, b) { return M(b) - M(a); };
  }

  /* ---------------- 10. التنبيهات الصوتية والـ Squawk Voice ---------------- */
  function beep() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.start();
      o.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.stop(ctx.currentTime + 0.3);
    } catch (e) { }
  }

  function speakAlert(symbols) {
    if (!uiState.voice || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var symSpelled = symbols.slice(0, 2).map(function (s) { return s.split('').join(' '); }).join(', and ');
      var u = new SpeechSynthesisUtterance('Momo Alert! ' + symSpelled + ' breaking out.');
      u.lang = 'en-US';
      u.rate = 1.15;
      window.speechSynthesis.speak(u);
    } catch (e) { }
  }

  function flashNewEnters(rows) {
    var prev = [];
    try { prev = JSON.parse(lsGet('scanner-prev-enters', '[]') || '[]'); } catch (e) { }
    var curr = rows.filter(function (s) { return computeVerdict(s).type === 'enter'; })
      .map(function (s) { return s.symbol; });
    var newOnes = curr.filter(function (sym) { return prev.indexOf(sym) === -1; });
    if (newOnes.length && prev.length) {
      if (soundEl && soundEl.checked) beep();
      if (uiState.voice) speakAlert(newOnes);
      setStatus('🚀 إشارة دخول جديدة: ' + newOnes.join(', '), 'text-success');
    }
    lsSet('scanner-prev-enters', JSON.stringify(curr));
  }

  /* ---------------- 11. الربط مع الحاسبة والتفاعلات ---------------- */
  function selectStockFromScanner(sym) {
    hideHoverHud();
    var row = lastScannedRows.find(function (r) { return r.symbol === sym; });
    var symInp = getEl('sym');
    if (symInp) symInp.value = sym;

    if (row) {
      var price = num(row.price);
      var chg = num(row.changePct);
      var pc = num(row.previousClose || row.prevClose);
      if (pc == null && price != null && chg != null) {
        pc = price / (1 + (chg / 100));
      }
      var v = computeVerdict(row);
      var stockData = {
        sym: row.symbol,
        name: row.name || '',
        activity: row.sector || row.industry || 'مدرج في الاسكانر',
        price: price,
        pc: pc,
        chg: chg,
        vol: num(row.volume),
        floatShares: num(row.floatShares),
        floatPct: num(row.floatPct),
        mc: num(row.marketCap),
        bid: num(row.bid) || null,
        ask: num(row.ask) || null
      };
      if (typeof window.renderQuoteCard === 'function') window.renderQuoteCard(stockData);
      if (typeof window.saveStockToCache === 'function') window.saveStockToCache(stockData);
      if (price > 0) {
        var buyInp = getEl('buy');
        var sellInp = getEl('sell');
        if (buyInp) buyInp.value = price;
        if (v.tp1 && sellInp) sellInp.value = Number(v.tp1.toFixed(price < 1 ? 4 : 2));
        if (typeof window.calc === 'function') window.calc();
      }
      var calcSec = getEl('calcSection');
      if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
      var getBtn = getEl('get');
      if (getBtn) getBtn.click();
    } else {
      var getBtn2 = getEl('get');
      if (getBtn2) getBtn2.click();
      var calcSec2 = getEl('calcSection');
      if (calcSec2) calcSec2.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function togglePinSymbol(sym) {
    var idx = pinnedSyms.indexOf(sym);
    if (idx === -1) pinnedSyms.push(sym);
    else pinnedSyms.splice(idx, 1);
    lsSet(K_PINNED, JSON.stringify(pinnedSyms));
    renderPanels(lastScannedRows);
    renderTable(lastScannedRows.slice(0, parseInt(fLimit ? fLimit.value : '50', 10) || 50));
  }

  function exportScannerCsv() {
    if (!lastScannedRows.length) return;
    var headers = ['Symbol', 'Name', 'Price', 'Change%', 'Volume', 'RVOL', 'Float', 'MarketCap', 'MOMO_Score', 'Verdict', 'TP1', 'SL'];
    var csvRows = [headers.join(',')];
    lastScannedRows.forEach(function (s) {
      var v = computeVerdict(s);
      csvRows.push([
        s.symbol,
        '"' + String(s.name || '').replace(/"/g, '""') + '"',
        num(s.price) || 0,
        num(s.changePct) || 0,
        num(s.volume) || 0,
        v.rvol ? v.rvol.toFixed(2) : 0,
        num(s.floatShares) || 0,
        num(s.marketCap) || 0,
        v.momo,
        '"' + v.label + '"',
        v.tp1 ? v.tp1.toFixed(2) : '',
        v.sl ? v.sl.toFixed(2) : ''
      ].join(','));
    });
    var blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'momo_scanner_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  }

  function onContainerClick(e) {
    var themeBtn = e.target.closest('[data-ui-theme]');
    if (themeBtn) {
      uiState.theme = themeBtn.getAttribute('data-ui-theme');
      saveUiState();
      renderPanels(lastScannedRows);
      return;
    }
    if (e.target.closest('#momoVoiceBtn')) {
      uiState.voice = !uiState.voice;
      saveUiState();
      renderPanels(lastScannedRows);
      if (uiState.voice) speakAlert(['MOMO']);
      return;
    }
    if (e.target.closest('#momoExportCsv')) {
      exportScannerCsv();
      return;
    }
    var maxBtn = e.target.closest('[data-max-panel]');
    if (maxBtn) {
      var pid = maxBtn.getAttribute('data-max-panel');
      uiState.maximized = uiState.maximized === pid ? null : pid;
      renderPanels(lastScannedRows);
      return;
    }
    var hiTag = e.target.closest('[data-hi-sym]');
    if (hiTag) {
      var hSym = hiTag.getAttribute('data-hi-sym');
      uiState.highlightSym = uiState.highlightSym === hSym ? null : hSym;
      renderPanels(lastScannedRows);
      return;
    }
    if (e.target.closest('#momoClearHi')) {
      uiState.highlightSym = null;
      renderPanels(lastScannedRows);
      return;
    }
    var symEl = e.target.closest('[data-symbol]');
    if (symEl) {
      selectStockFromScanner(symEl.getAttribute('data-symbol'));
    }
  }

  function onContextMenu(e) {
    var symEl = e.target.closest('[data-symbol], [data-hi-sym]');
    if (symEl) {
      e.preventDefault();
      var sym = symEl.getAttribute('data-symbol') || symEl.getAttribute('data-hi-sym');
      if (sym) togglePinSymbol(sym);
    }
  }

  if (tbody) {
    tbody.addEventListener('click', onContainerClick);
    tbody.addEventListener('contextmenu', onContextMenu);
  }
  if (panelsEl) {
    panelsEl.addEventListener('click', onContainerClick);
    panelsEl.addEventListener('contextmenu', onContextMenu);
  }

  /* ---------------- 12. الفلاتر والاتصال بالـ Worker (/scan) ---------------- */
  function baseFilters(opts) {
    opts = opts || {};
    var filters = [];
    var pMin = fPriceMin ? num(fPriceMin.value) : 0.01;
    var pMax = fPriceMax ? num(fPriceMax.value) : 25;
    var vMin = fVolumeMin ? num(fVolumeMin.value) : 250000;
    var cMin = fCapMin ? num(fCapMin.value) : 0;

    if (!opts.noPrice) {
      if (pMin != null && pMax != null) {
        filters.push({ left: 'close', operation: 'in_range', right: [pMin, pMax] });
      } else if (pMin != null) {
        filters.push({ left: 'close', operation: 'greater', right: pMin });
      } else if (pMax != null) {
        filters.push({ left: 'close', operation: 'less', right: pMax });
      }
    }
    if (vMin != null && vMin > 0) filters.push({ left: 'volume', operation: 'greater', right: vMin });
    if (cMin != null && cMin > 0) filters.push({ left: 'market_cap_basic', operation: 'greater', right: cMin });

    var market = fMarket ? fMarket.value : 'all';
    if (market === 'nasdaq') filters.push({ left: 'exchange', operation: 'equal', right: 'NASDAQ' });
    else if (market === 'nyse') filters.push({ left: 'exchange', operation: 'equal', right: 'NYSE' });
    else if (market === 'amex') filters.push({ left: 'exchange', operation: 'equal', right: 'AMEX' });

    filters.push({ left: 'type', operation: 'equal', right: 'stock' });
    return filters;
  }

  function largeCapFilters() {
    var filters = [
      { left: 'close', operation: 'greater', right: 0 },
      { left: 'market_cap_basic', operation: 'greater', right: 1e10 },
      { left: 'volume', operation: 'greater', right: 1000000 },
      { left: 'type', operation: 'equal', right: 'stock' }
    ];
    var market = fMarket ? fMarket.value : 'all';
    if (market === 'nasdaq') filters.push({ left: 'exchange', operation: 'equal', right: 'NASDAQ' });
    else if (market === 'nyse') filters.push({ left: 'exchange', operation: 'equal', right: 'NYSE' });
    else if (market === 'amex') filters.push({ left: 'exchange', operation: 'equal', right: 'AMEX' });
    return filters;
  }

  var scanning = false;
  var autoTimer = null;

  function getWorkerBase() {
    var apiInput = getEl('api');
    var b = (apiInput && apiInput.value ? apiInput.value : '').trim().replace(/\/+$/, '');
    if (!b) b = 'https://small-disk-18d3stock-proxy.osamaanit.workers.dev';
    if (!/^https?:\/\//i.test(b)) b = 'https://' + b;
    return b;
  }

  function postScan(base, filters, sortBy, sortOrder, limit) {
    return fetch(base + '/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: filters,
        sort: { sortBy: sortBy, sortOrder: sortOrder },
        range: [0, limit]
      })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || !j || !j.ok) throw new Error((j && j.error) || ('HTTP ' + r.status));
        return j.data || [];
      });
    });
  }

  /* ---------------- NBBO: bid/ask من Worker الـ Alpaca ---------------- */
  var QUOTE_BASE_DEFAULT = 'https://falling-wildflower-192ebid-ask.osamaanit.workers.dev';
  var quoteFeed = null;   // 'sip' | 'iex' | null (غير متاح)

  function getQuoteBase() {
    var b = '';
    try { b = localStorage.getItem('quoteBase') || ''; } catch (e) {}
    b = (b || QUOTE_BASE_DEFAULT).trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(b)) b = 'https://' + b;
    return b;
  }

  /* مبيرفضش أبداً: لو الـ Worker وقع أو اتأخر الاسكانر يكمل بسبريد تقديري */
  function fetchQuotes(symbols) {
    quoteFeed = null;
    if (!symbols.length) return Promise.resolve({});
    return new Promise(function (resolve) {
      var done = false;
      function finish(v) { if (!done) { done = true; clearTimeout(timer); resolve(v); } }
      var timer = setTimeout(function () { finish({}); }, 3500);
      fetch(getQuoteBase() + '/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: symbols })
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok && j.data) { if (!done) quoteFeed = j.feed || null; finish(j.data); }
          else finish({});
        })
        .catch(function () { finish({}); });
    });
  }

  function applyQuote(s, q) {
    if (!q) return;
    var b = num(q.bid), a = num(q.ask);
    if (b > 0 && a > 0 && a > b) { s.bid = b; s.ask = a; s._quoteTs = q.t || null; }
  }

  function doScan() {
    if (scanning) return;
    scanning = true;
    if (scanBtn) scanBtn.disabled = true;
    setStatus('⏳ جاري مسح السوق بالرادار الفائق...', 'text-warning');

    var base = getWorkerBase();
    var bf = baseFilters();
    var soft = function () { return []; };

    Promise.all([
      postScan(base, bf, 'change', 'desc', 150),
      postScan(base, bf, 'volume', 'desc', 150).catch(soft),
      postScan(base, bf, 'change', 'asc', 60).catch(soft),
      postScan(base, largeCapFilters(), 'market_cap_basic', 'desc', 30).catch(soft)
    ])
      .then(function (parts) {
        var qsyms = [], seen = {};
        parts.forEach(function (arr) {
          arr.forEach(function (s) {
            if (s && s.symbol && !seen[s.symbol]) { seen[s.symbol] = 1; qsyms.push(s.symbol); }
          });
        });
        return fetchQuotes(qsyms).then(function (qm) { return { parts: parts, qm: qm }; });
      })
      .then(function (res) {
        var parts = res.parts, qm = res.qm;
        var map = {};
        var all = [];
        parts.forEach(function (arr) {
          arr.forEach(function (s) {
            if (!s || !s.symbol || map[s.symbol]) return;
            map[s.symbol] = true;
            applyQuote(s, qm[s.symbol]);
            enrichStockMetrics(s);
            enrichHistory(s);
            all.push(s);
          });
        });

        var nextSnap = {};
        all.forEach(function (s) {
          nextSnap[s.symbol] = {
            price: num(s.price) || 0,
            vol: num(s.volume) || 0,
            chg: num(s.changePct) || 0
          };
        });
        prevStockSnapshot = nextSnap;
        lastScannedRows = all;

        renderPanels(all);

        var chgMin = fChangeMin ? num(fChangeMin.value) : null;
        var rvMin = fRvolMin ? num(fRvolMin.value) : null;
        var vFilter = fVerdict ? fVerdict.value : '';
        var pMin = fPriceMin ? num(fPriceMin.value) : null;
        var pMax = fPriceMax ? num(fPriceMax.value) : null;

        var main = all.filter(function (s) {
          var p = P(s);
          if (pMin != null && p < pMin) return false;
          if (pMax != null && p > pMax) return false;
          if (chgMin != null && C(s) < chgMin) return false;
          if (rvMin != null && rvMin > 0 && R(s) < rvMin) return false;
          if (vFilter && computeVerdict(s).type !== vFilter) return false;
          if (!isHealthy(s)) return false;
          if (P(s) < 1) return false;
          return true;
        });

        main.sort(mainSorter());
        var lim = parseInt(fLimit ? fLimit.value : '50', 10) || 50;
        var shown = main.slice(0, lim);
        renderTable(shown);
        flashNewEnters(all);

        var now = new Date();
        if (lastUpdate) lastUpdate.textContent = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
        if (countEl) countEl.textContent = shown.length + ' / ' + all.length;
        var nq = all.filter(function (s) { return s._realSpread; }).length;
        var nbboTxt = !quoteFeed ? ' · ⚠️ NBBO غير متاح (السبريد تقديري)'
          : (quoteFeed === 'sip' ? ' · NBBO SIP ' : ' · ⚠️ IEX فقط (تقريبي) ') + nq + '/' + all.length;
        setStatus('✅ تم تحليل ' + all.length + ' سهم بنجاح' + nbboTxt, 'text-success');
      })
      .catch(function (e) {
        console.error('Scanner Error:', e);
        setStatus('❌ ' + (e.message || 'فشل الاتصال بالـ Worker'), 'text-danger');
      })
      .finally(function () {
        scanning = false;
        if (scanBtn) scanBtn.disabled = false;
      });
  }

  function startAuto() {
    stopAuto();
    if (!autoEl || !autoEl.checked) return;
    autoTimer = setInterval(doScan, AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if (autoEl) autoEl.addEventListener('change', function () {
    if (autoEl.checked) startAuto(); else stopAuto();
  });

  if (scanBtn) scanBtn.addEventListener('click', doScan);
  if (stopBtn) stopBtn.addEventListener('click', function () {
    if (autoEl) autoEl.checked = false;
    stopAuto();
    setStatus('⏸️ متوقف', 'text-body-secondary');
  });

  allFilterEls.forEach(function (el) {
    if (!el) return;
    el.addEventListener('change', function () { saveFilters(); doScan(); });
  });

  if (resetBtn) resetBtn.addEventListener('click', function () {
    if (fPriceMin) fPriceMin.value = '0.01';
    if (fPriceMax) fPriceMax.value = '25';
    if (fVolumeMin) fVolumeMin.value = '250000';
    if (fCapMin) fCapMin.value = '0';
    if (fChangeMin) fChangeMin.value = '2';
    if (fRvolMin) fRvolMin.value = '1.2';
    if (fMarket) fMarket.value = 'all';
    if (fLimit) fLimit.value = '50';
    if (fVerdict) fVerdict.value = '';
    if (fSort) fSort.value = 'momo';
    if (fRows) fRows.value = '8';
    saveFilters();
    doScan();
  });

  renderPanels([]);
  doScan();
  if (autoEl && autoEl.checked) startAuto();
})();
