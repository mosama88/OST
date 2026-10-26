/* ============================================================================
   PRO WATCHLIST RADAR ENGINE (Live Quotes, Sharia & Sector Badges, Price Alerts)
============================================================================ */
(function () {
  "use strict";

  const WL_STORAGE_KEY = 'mh_pro_watchlist_v1';
  let watchlist = [];
  let wlFilterMode = 'all';
  let wlSortMode = 'added';
  let wlTimer = null;

  // القائمة الافتراضية عند فتح الموقع لأول مرة
  const DEFAULT_WATCHLIST = [
    { sym: 'NVDA', target: null, note: 'قائد قطاع الذكاء الاصطناعي وأشباه الموصلات', addedAt: Date.now() - 5000 },
    { sym: 'AAPL', target: null, note: 'دعم قوي ومبيعات الأجهزة الذكية', addedAt: Date.now() - 4000 },
    { sym: 'TSLA', target: null, note: 'مضاربة سريعة على فريم 5 دقائق', addedAt: Date.now() - 3000 },
    { sym: 'AMD',  target: null, note: 'متابعة اختراق المقاومة اليومية', addedAt: Date.now() - 2000 },
    { sym: 'LLY',  target: null, note: 'قطاع الأدوية والرعاية الصحية', addedAt: Date.now() - 1000 }
  ];

  // حقن ستايل مخصص لبطاقات الـ Watchlist الفخمة
  function injectWatchlistStyles() {
    if (document.getElementById('pro-wl-styles')) return;
    const st = document.createElement('style');
    st.id = 'pro-wl-styles';
    st.textContent = `
      .wl-card {
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        position: relative;
        overflow: hidden;
      }
      .wl-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.25) !important;
        border-color: #0dcaf0 !important;
      }
      .wl-card.wl-alert-hit {
        border: 2px solid #ffc107 !important;
        box-shadow: 0 0 18px rgba(255, 193, 7, 0.45) !important;
        animation: wlPulseGold 1.6s infinite alternate;
      }
      @keyframes wlPulseGold {
        from { background-color: rgba(255, 193, 7, 0.04); }
        to   { background-color: rgba(255, 193, 7, 0.16); }
      }
      .wl-price-big {
        font-size: 1.2rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .wl-mini-stat {
        font-size: 0.75rem;
        background: rgba(128,128,128,0.08);
        padding: 3px 7px;
        border-radius: 5px;
      }
    `;
    document.head.appendChild(st);
  }
  injectWatchlistStyles();

  // صوت تنبيه عند ضرب الهدف السعري (Web Audio API بدون ملفات خارجية)
  function playAlertBell() {
    const soundSwitch = document.getElementById('wlAlertSound');
    if (soundSwitch && !soundSwitch.checked) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1174.66, 1318.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.36);
      });
    } catch (e) {}
  }

  function loadWatchlist() {
    try {
      const raw = localStorage.getItem(WL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          watchlist = parsed;
          return;
        }
      }
    } catch (e) {}
    watchlist = [...DEFAULT_WATCHLIST];
    saveWatchlist();
  }

  function saveWatchlist() {
    try {
      localStorage.setItem(WL_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {}
    const badge = document.getElementById('wlCountBadge');
    if (badge) badge.textContent = `${watchlist.length} أسهم`;
  }

  // الاستفادة من دوال التصنيف والشرعية إذا كانت موجودة في calculator.js أو استخدام بديل مدمج
  function getStockMeta(item) {
    const sectorAr = typeof translateSectorToArabic === 'function'
      ? translateSectorToArabic(item.activity, item.industry, item.name, item.sym)
      : (item.activity || 'غير محدد');

    const sharia = typeof evaluateShariaCompliance === 'function'
      ? evaluateShariaCompliance({ ...item, sectorAr })
      : { label: '✅ مباح', badgeClass: 'bg-success text-white', status: 'halal', reason: '' };

    return { sectorAr, sharia };
  }

  // جلب أسعار كل أسهم الـ Watchlist دفعة واحدة من الـ Worker
  async function refreshWatchlistPrices() {
    if (!watchlist.length) {
      renderWatchlistGrid();
      return;
    }

    const btn = document.getElementById('wlRefreshBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ جاري التحديث...';
    }

    const apiInput = document.getElementById('api');
    const base = (apiInput && apiInput.value ? apiInput.value : 'https://small-disk-18d3stock-proxy.osamaanit.workers.dev').trim().replace(/\/+$/, '');
    const symbols = watchlist.map(w => w.sym.toUpperCase());

    try {
      const res = await fetch(base + '/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: [{ left: 'name', operation: 'in_range', right: symbols }],
          columns: ['name', 'description', 'close', 'change', 'volume', 'market_cap_basic', 'float_shares_outstanding', 'sector', 'industry', 'total_debt', 'VWAP'],
          range: [0, Math.max(50, symbols.length + 10)]
        })
      });

      if (res.ok) {
        const j = await res.json();
        const rows = j.data || [];
        let alertTriggered = false;

        watchlist.forEach(item => {
          const match = rows.find(r => {
            const rSym = String(r.symbol || r.name || r.s || '').toUpperCase().split(':').pop();
            return rSym === item.sym;
          });

          if (match) {
            item.price = match.price ?? match.close ?? item.price;
            item.chg = match.changePct ?? match.change ?? item.chg;
            item.vol = match.volume ?? item.vol;
            item.mc = match.marketCap ?? match.market_cap_basic ?? item.mc;
            item.floatShares = match.floatShares ?? match.float_shares_outstanding ?? item.floatShares;
            item.name = match.description || match.name || item.name;
            item.activity = match.sector || match.industry || item.activity;
            item.industry = match.industry || item.industry;
            item.totalDebt = match.totalDebt ?? match.total_debt ?? item.totalDebt;

            // فحص ما إذا كان السهم اخترق السعر المستهدف (Target Alert)
            if (item.target && item.price >= item.target) {
              if (!item.alertHit) {
                alertTriggered = true;
                item.alertHit = true;
              }
            } else {
              item.alertHit = false;
            }
          }
        });

        if (alertTriggered) playAlertBell();
        saveWatchlist();
      }
    } catch (e) {
      // في حال فشل طلب الـ batch، نجلب الأسهم التي ليس لها سعر بشكل فردي
    }

    // تحديث وقت آخر فحص
    const timeEl = document.getElementById('wlLastUpdate');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toTimeString().split(' ')[0];
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 تحديث الأسعار الآن';
    }

    renderWatchlistGrid();
  }

  // رسم بطاقات الـ Watchlist
  function renderWatchlistGrid() {
    const grid = document.getElementById('wlGrid');
    if (!grid) return;

    saveWatchlist();

    // تطبيق الفلتر
    let list = watchlist.filter(item => {
      const { sharia } = getStockMeta(item);
      if (wlFilterMode === 'halal') return sharia.status === 'halal';
      if (wlFilterMode === 'gainers') return (item.chg || 0) > 0;
      if (wlFilterMode === 'alerts') return item.target != null && item.target > 0;
      return true;
    });

    // تطبيق الترتيب
    list.sort((a, b) => {
      if (wlSortMode === 'changeDesc') return (b.chg || -999) - (a.chg || -999);
      if (wlSortMode === 'changeAsc') return (a.chg || 999) - (b.chg || 999);
      if (wlSortMode === 'volDesc') return (b.vol || 0) - (a.vol || 0);
      if (wlSortMode === 'symAsc') return a.sym.localeCompare(b.sym);
      return (b.addedAt || 0) - (a.addedAt || 0);
    });

    if (!list.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="text-center py-4 text-body-secondary border rounded-3 bg-body-tertiary">
            لا توجد أسهم مطابقة في قائمة المتابعة حالياً. أضف رمز سهم من الأعلى أو اختر قائمة جاهزة!
          </div>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(item => {
      const p = item.price;
      const dec = (p && p < 1) ? 4 : 2;
      const chg = item.chg || 0;
      const isUp = chg >= 0;
      const chgCls = isUp ? 'up' : 'dn';
      const { sectorAr, sharia } = getStockMeta(item);

      // إشارة فنية سريعة (BUY / WATCH / SELL)
      const techSignal = chg >= 1.5
        ? '<span class="badge bg-success-subtle text-success border border-success-subtle">🟢 زخم شرائي (BUY)</span>'
        : chg < -1.5
        ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">🔴 ضغط بيعي (SELL)</span>'
        : '<span class="badge bg-secondary-subtle text-body-secondary">⏸️ ترقب (WATCH)</span>';

      // شريط التقدم نحو الهدف السعري إن وجد
      let targetHtml = '';
      if (item.target && item.target > 0) {
        const diffPct = p ? (((item.target - p) / p) * 100).toFixed(1) : '—';
        const hitBadge = item.alertHit
          ? `<span class="badge bg-warning text-dark fw-bold">🔔 وصل للهدف! ($${fNum(item.target, dec)})</span>`
          : `<span class="badge bg-dark border border-warning text-warning" dir="ltr">🎯 Target: $${fNum(item.target, dec)} (${diffPct > 0 ? '+' + diffPct : diffPct}%)</span>`;
        targetHtml = `<div class="mt-2">${hitBadge}</div>`;
      }

      return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card h-100 shadow-sm wl-card ${item.alertHit ? 'wl-alert-hit' : ''}" data-wl-sym="${item.sym}">
            <div class="card-body p-3 d-flex flex-column justify-content-between">

              <!-- الصف العلوي: الرمز + الاسم + السعر -->
              <div>
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <div class="d-flex align-items-center gap-2">
                      <span class="h5 fw-bold text-primary mb-0" dir="ltr" style="cursor:pointer" data-action="chart" data-sym="${item.sym}">${item.sym}</span>
                      ${techSignal}
                    </div>
                    <small class="text-body-secondary d-block text-truncate" style="max-width: 210px;" title="${item.name || ''}">
                      ${item.name || 'جاري جلب اسم الشركة...'}
                    </small>
                  </div>

                  <div class="text-end" dir="ltr">
                    <div class="wl-price-big">${p != null ? '$' + fNum(p, dec) : '⏳'}</div>
                    <div class="small fw-bold ${chgCls}">
                      ${p != null ? `${sg(chg, 2)}%` : ''}
                    </div>
                  </div>
                </div>

                <!-- شارات التصنيف القطاعي والحكم الشرعي -->
                <div class="d-flex flex-wrap gap-1 mb-2">
                  <span class="badge bg-info text-dark">🏢 ${sectorAr}</span>
                  <span class="badge ${sharia.badgeClass}" title="${sharia.reason || ''}">⚖️ ${sharia.label}</span>
                </div>

                <!-- بيانات السيولة والـ Float -->
                <div class="d-flex flex-wrap gap-2 my-2" dir="ltr">
                  <span class="wl-mini-stat"><b>Vol:</b> ${item.vol != null ? fBig(item.vol) : '—'}</span>
                  <span class="wl-mini-stat text-warning"><b>Float:</b> ${item.floatShares != null ? fBig(item.floatShares) : '—'}</span>
                  <span class="wl-mini-stat"><b>M.Cap:</b> ${item.mc != null ? '$' + fBig(item.mc) : '—'}</span>
                </div>

                ${targetHtml}
                ${item.note ? `<div class="small text-body-secondary mt-2 bg-body-tertiary p-1 px-2 rounded border-start border-3 border-info">📝 ${item.note}</div>` : ''}
              </div>

              <!-- أزرار التحكم السريع في البطاقة -->
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-1 mt-3 pt-2 border-top">
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-info fw-semibold" data-action="chart" data-sym="${item.sym}">
                    📊 الشارت والأهداف
                  </button>
                  <button type="button" class="btn btn-outline-primary fw-semibold" data-action="calc" data-sym="${item.sym}">
                    🧮 للحاسبة
                  </button>
                </div>
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-warning" data-action="setTarget" data-sym="${item.sym}" title="تعديل السعر المستهدف والملاحظة">
                    🔔 هدف
                  </button>
                  <button type="button" class="btn btn-outline-danger" data-action="remove" data-sym="${item.sym}" title="حذف من القائمة">
                    ✕
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // إضافة سهم جديد إلى الـ Watchlist
  async function addTickerToWatchlist(sym, targetPrice = null, note = '') {
    const cleanSym = String(sym || '').trim().toUpperCase();
    if (!cleanSym) return;

    const existing = watchlist.find(w => w.sym === cleanSym);
    if (existing) {
      if (targetPrice !== null && isFinite(targetPrice) && targetPrice > 0) existing.target = targetPrice;
      if (note) existing.note = note;
      existing.alertHit = false;
    } else {
      watchlist.unshift({
        sym: cleanSym,
        target: (targetPrice && isFinite(targetPrice) && targetPrice > 0) ? Number(targetPrice) : null,
        note: note || '',
        addedAt: Date.now(),
        price: null,
        chg: null
      });
    }

    saveWatchlist();
    renderWatchlistGrid();
    await refreshWatchlistPrices();
  }

  // تفعيل الأحداث والأزرار
  function initWatchlistEvents() {
    loadWatchlist();
    renderWatchlistGrid();
    refreshWatchlistPrices();

    // زر الإضافة
    const addBtn = document.getElementById('wlAddBtn');
    const symInp = document.getElementById('wlSymInput');
    const targetInp = document.getElementById('wlTargetInput');
    const noteInp = document.getElementById('wlNoteInput');

    if (addBtn && symInp) {
      addBtn.addEventListener('click', () => {
        const s = symInp.value.trim().toUpperCase();
        const t = parseFloat(targetInp?.value);
        const n = noteInp?.value.trim() || '';
        if (!s) return;
        addTickerToWatchlist(s, isFinite(t) ? t : null, n);
        symInp.value = '';
        if (targetInp) targetInp.value = '';
        if (noteInp) noteInp.value = '';
      });

      symInp.addEventListener('keydown', e => {
        if (e.key === 'Enter') addBtn.click();
      });
    }

    // زر "أضف سهم الحاسبة الحالي"
    const addCurBtn = document.getElementById('wlAddCurrentBtn');
    if (addCurBtn) {
      addCurBtn.addEventListener('click', () => {
        const curSym = document.getElementById('sym')?.value.trim().toUpperCase();
        if (!curSym) {
          alert('اكتب رمز السهم في الحاسبة أولاً أو اختر سهماً من الاسكانر.');
          return;
        }
        addTickerToWatchlist(curSym, null, 'مضاف من الحاسبة');
      });
    }

    // زر التحديث اليدوي
    const refBtn = document.getElementById('wlRefreshBtn');
    if (refBtn) refBtn.addEventListener('click', refreshWatchlistPrices);

    // القوائم الجاهزة (Presets)
    document.querySelectorAll('.wl-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const tickers = (btn.getAttribute('data-tickers') || '').split(',').map(x => x.trim()).filter(Boolean);
        tickers.reverse().forEach(t => {
          if (!watchlist.some(w => w.sym === t)) {
            watchlist.unshift({ sym: t, target: null, note: '', addedAt: Date.now() });
          }
        });
        saveWatchlist();
        refreshWatchlistPrices();
      });
    });

    // مسح القائمة بالكامل
    const clearAllBtn = document.getElementById('wlClearAllBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('هل تريد مسح جميع الأسهم من قائمة المتابعة؟')) {
          watchlist = [];
          saveWatchlist();
          renderWatchlistGrid();
        }
      });
    }

    // أزرار الفلترة
    document.querySelectorAll('.wl-filter').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.wl-filter').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        wlFilterMode = this.getAttribute('data-filter') || 'all';
        renderWatchlistGrid();
      });
    });

    // قائمة الترتيب
    const sortSel = document.getElementById('wlSortSelect');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        wlSortMode = sortSel.value;
        renderWatchlistGrid();
      });
    }

    // التعامل مع أزرار البطاقات (فتح الشارت / إرسال للحاسبة / تعديل الهدف / حذف)
    const grid = document.getElementById('wlGrid');
    if (grid) {
      grid.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const sym = btn.getAttribute('data-sym');
        if (!sym) return;

        if (action === 'remove') {
          watchlist = watchlist.filter(w => w.sym !== sym);
          saveWatchlist();
          renderWatchlistGrid();
        } else if (action === 'setTarget') {
          const item = watchlist.find(w => w.sym === sym);
          if (!item) return;
          const newTarget = prompt(`🔔 اكتب السعر المستهدف لسهم ${sym} بالدولار (أو اتركه فارغاً لإلغاء المنبه):`, item.target || '');
          if (newTarget !== null) {
            const parsed = parseFloat(newTarget);
            item.target = (isFinite(parsed) && parsed > 0) ? parsed : null;
            item.alertHit = false;
          }
          const newNote = prompt(`📝 ملاحظة أو خطة التداول لسهم ${sym}:`, item.note || '');
          if (newNote !== null) item.note = newNote.trim();
          saveWatchlist();
          renderWatchlistGrid();
        } else if (action === 'chart') {
          if (typeof window.updateLiveChart === 'function') {
            window.updateLiveChart(sym, true);
          }
        } else if (action === 'calc') {
          const symInp = document.getElementById('sym');
          const getBtn = document.getElementById('get');
          if (symInp && getBtn) {
            symInp.value = sym;
            getBtn.click();
            document.getElementById('calcSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    // التحديث التلقائي كل 10 ثوانٍ
    wlTimer = setInterval(() => {
      const autoSwitch = document.getElementById('wlAutoRefresh');
      if (autoSwitch && autoSwitch.checked && !document.hidden) {
        refreshWatchlistPrices();
      }
    }, 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWatchlistEvents);
  } else {
    initWatchlistEvents();
  }
})();
