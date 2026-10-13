  (() => {
            'use strict';
            const root = document.documentElement;

            // Applications with their own theming opt out of AdminLTE's color mode
            // entirely, here as well as in the bundle.
            if (root.getAttribute('data-lte-color-mode') === 'off') {
                return;
            }

            const STORAGE_KEY = 'lte-theme';
            let stored = null;
            try {
                stored = localStorage.getItem(STORAGE_KEY);
            } catch {
                // localStorage may be unavailable (private mode, sandboxed iframe).
            }
            // Mirror the precedence in color-mode.ts: the visitor's stored choice
            // wins, then a theme this page declared itself, then the OS preference.
            const authored = root.getAttribute('data-bs-theme');
            let resolved = 'light';
            if (stored === 'dark' || stored === 'light') {
                resolved = stored;
            } else if (authored === 'dark' || authored === 'light') {
                resolved = authored;
            } else if (globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
                resolved = 'dark';
            }
            root.setAttribute('data-bs-theme', resolved);
            root.style.colorScheme = resolved;
            // Flag values computed here, so the bundle does not mistake them for a
            // theme the page declared and stop following the OS preference.
            if (resolved !== authored) {
                root.setAttribute('data-lte-theme-resolved', '');
            }
        })();




          // ApexCharts draws light-theme tooltips and axis text unless told otherwise,
         // which is unreadable in dark mode (#6105). Give it the page's colour mode as
         // a global default before any chart is created — this runs before the chart
         // pages' own scripts — and keep every chart that has a `chart.id` in step
         // when the mode changes (ColorMode, the OS in auto mode, or your own code).
         (() => {
             'use strict';
             const mode = () =>
                 document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
             // `Apex` is ApexCharts' global-options object; it must exist before the library loads.
             // theme.mode also sets a dark chart background — keep the card's instead.
             // eslint-disable-next-line unicorn/no-global-object-property-assignment
             globalThis.Apex ||= {};
             const apex = globalThis.Apex;
             apex.theme = {
                 mode: mode()
             };
             apex.chart = Object.assign(apex.chart || {}, {
                 background: 'transparent'
             });
             new MutationObserver(() => {
                 const next = mode();
                 apex.theme = {
                     mode: next
                 };
                 const instances = apex._chartInstances || [];
                 for (const {
                         chart
                     }
                     of instances) {
                     chart.updateOptions({
                         theme: {
                             mode: next
                         }
                     }, false, false);
                 }
             }).observe(document.documentElement, {
                 attributes: true,
                 attributeFilter: ['data-bs-theme'],
             });
         })();
