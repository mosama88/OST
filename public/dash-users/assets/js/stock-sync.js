/* ============================================================================
   stock-sync.js — Global Stock Selection Sync Orchestrator
   يربط: Calculator + Chart + Watchlist + Scanner + News في مكان واحد
============================================================================ */
(function () {
  'use strict';

  let currentSym = null;
  let syncInProgress = false;

  /* العناصر التي لها سلوك خاص ولا نتدخل فيه */
  const SKIP_SELECTOR = [
    '.source-link-btn',
    '.copy-pine-btn',
    '[data-max-panel]',
    '[data-hi-sym]',
    '[data-ui-theme]',
    '#momoVoiceBtn',
    '#momoExportCsv',
    '#momoClearHi',
    '.chart-tf',
    '.chart-tf-btn',
    '#closeNewsChartBtn',
    '.wl-filter',
    '.wl-preset',
    '[data-b]',
    '.mkt-tab',
    '#carouselNextBtn',
    '#carouselPrevBtn',
    '#sendToMainCalcBtn',
    '.preset-price',
    '.sc-ph-btn',
    'summary',
    'details'
  ].join(',');

  /* تلوين بطاقة السهم في الـ Watchlist */
  function highlightWatchlist(sym) {
    const grid = document.getElementById('wlGrid');
    if (!grid) return;
    grid.querySelectorAll('.wl-card').forEach(card => {
      card.style.border = '';
      card.style.boxShadow = '';
      if (card.getAttribute('data-wl-sym') === sym) {
        card.style.border = '2px solid #38bdf8';
        card.style.boxShadow = '0 0 15px rgba(56,189,248,0.6)';
      }
    });
  }

  /* تلوين صف السهم في الاسكانر */
  function highlightScanner(sym) {
    document
      .querySelectorAll('#scannerPanels tr[data-symbol], #scannerRows tr[data-symbol]')
      .forEach(tr => tr.classList.toggle('sym-highlighted', tr.getAttribute('data-symbol') === sym));
  }

  /* ============ دالة الربط المركزية ============ */
  async function syncStock(sym, opts) {
    sym = String(sym || '').trim().toUpperCase();
    if (!sym) return;
    if (syncInProgress && currentSym === sym) return;

    syncInProgress = true;
    currentSym = sym;
    opts = opts || {};
    const fromScanner  = !!opts.fromScanner;
    const scroll       = !!opts.scroll;
    const scrollToCalc = !!opts.scrollToCalc;

    try {
      /* 1) خانة رمز السهم في الحاسبة */
      const symInput = document.getElementById('sym');
      if (symInput && symInput.value.toUpperCase() !== sym) symInput.value = sym;

      /* 2) حفظ في الكاش */
      try { localStorage.setItem('mh_cached_symbol', sym); } catch (e) {}

      /* 3) تحديث الشارت الرئيسي (chart.js) */
      if (typeof window.updateLiveChart === 'function') {
        window.updateLiveChart(sym, scroll);
      }

      /* 4) جلب البيانات + تحديث كارت السهم + الحاسبة
            (نتخطاها لو الكليك جاي من الاسكانر لأنه بيعمل الـ fetch بنفسه) */
      if (!fromScanner) {
        const getBtn = document.getElementById('get');
        if (getBtn) {
          setTimeout(function () {
            const stillSym = (document.getElementById('sym')?.value || '').trim().toUpperCase();
            if (stillSym === sym) getBtn.click();
          }, 50);
        }
      }

      /* 5) تلوين في كل مكان */
      highlightWatchlist(sym);
      highlightScanner(sym);

      /* 6) التمرير للحاسبة لو مطلوب */
      if (scrollToCalc) {
        setTimeout(function () {
          document.getElementById('calcSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    } catch (e) {
      console.error('[syncStock]', e);
    } finally {
      setTimeout(() => { syncInProgress = false; }, 800);
    }
  }

  /* كشف الدالة عالمياً للاستخدام الخارجي */
  window.syncStock = syncStock;

  /* ============================================================================
     هاندلر واحد يمسك كل الكليكات في مرحلة الـ Capture (قبل أي هاندلر تاني)
     ============================================================================ */
  document.addEventListener('click', function (e) {

    /* A) أزرار الشارت والحاسبة في الـ Watchlist — نمسكها ونعمل Full Sync */
    const actionBtn = e.target.closest('[data-action="chart"], [data-action="calc"]');
    if (actionBtn) {
      e.stopPropagation(); // نلغي هاندلر watchlist.js عشان ما يكررش
      const action = actionBtn.getAttribute('data-action');
      const sym = actionBtn.getAttribute('data-sym');
      if (sym) {
        syncStock(sym, {
          fromScanner: false,
          scroll: action === 'chart',
          scrollToCalc: action === 'calc'
        });
      }
      return;
    }

    /* B) عناصر تفاعلية لها سلوك خاص (Tabs, Timeframes, Presets…) */
    if (e.target.closest(SKIP_SELECTOR)) return;

    /* C) أي زر data-action تاني (setTarget / remove) — يشتغل مع watchlist.js */
    if (e.target.closest('[data-action]')) return;

    /* D) أي عنصر فيه data-symbol أو data-wl-sym */
    const symEl = e.target.closest('[data-symbol], [data-wl-sym]');
    if (!symEl) return;

    const sym = symEl.getAttribute('data-symbol') || symEl.getAttribute('data-wl-sym');
    if (!sym) return;

    const fromScanner = !!symEl.closest('#scannerPanels, #scannerRows');

    /* ملاحظة: لا نستخدم stopPropagation هنا — عشان نسمح لـ chart.js و scanner.js و news.js
       يشتغلوا كمان. الشغل بتاعنا إضافي (تحديث الحاسبة + التلوين) لكن مابنمنعش سلوكهم. */
    syncStock(sym, { fromScanner: fromScanner, scroll: !fromScanner });
  }, true); // ← capture phase

  /* ============================================================================
     زر "هات السعر" اليدوي — كمان يحدّث الشارت والتلوين
     ============================================================================ */
  const getBtn = document.getElementById('get');
  if (getBtn) {
    getBtn.addEventListener('click', function () {
      const sym = (document.getElementById('sym')?.value || '').trim().toUpperCase();
      if (!sym) return;
      // لو الشارت شغّال على نفس السهم بالفعل → ما نكررش
      const badge = document.getElementById('chartSymbolBadge');
      if (badge && badge.textContent.trim().toUpperCase() === sym) return;

      setTimeout(function () {
        if (typeof window.updateLiveChart === 'function') window.updateLiveChart(sym, false);
        highlightWatchlist(sym);
        highlightScanner(sym);
      }, 350);
    });
  }

  /* ============================================================================
     استرجاع السهم المحفوظ عند تحميل الصفحة
     ============================================================================ */
  window.addEventListener('load', function () {
    try {
      const saved = localStorage.getItem('mh_cached_symbol');
      if (!saved) return;
      const symInput = document.getElementById('sym');
      if (symInput && !symInput.value) {
        setTimeout(function () { syncStock(saved, { scroll: false }); }, 1000);
      }
    } catch (e) {}
  });

})();
