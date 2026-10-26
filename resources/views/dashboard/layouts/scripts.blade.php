  <!-- Bootstrap 5.3.3 Bundle JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- 1. Constants & helpers (لازم أول حاجة) -->
  <script src="{{ asset('dash-users') }}/assets/js/config.js"></script>

  <!-- 2. Time utilities (لازم قبل clocks) -->
  <script src="{{ asset('dash-users') }}/assets/js/time-utils.js"></script>

  <!-- 3. Theme (IIFE - مستقل) -->
  <script src="{{ asset('dash-users') }}/assets/js/theme.js"></script>

  <!-- 4. Clocks & market sessions -->
  <script src="{{ asset('dash-users') }}/assets/js/clocks.js"></script>

  <!-- 5. Calculator + stock fetching -->
  <script src="{{ asset('dash-users') }}/assets/js/calculator.js"></script>

  <!-- 6. Scanner -->
  <script src="{{ asset('dash-users') }}/assets/js/scanner.js"></script>

  <!-- 7. Live Chart (ملف الشارت المنفصل) -->
  <script src="{{ asset('dash-users') }}/assets/js/chart.js"></script>

  <!-- 7. Watch list (ملف الشارت المنفصل) -->
  <script src="{{ asset('dash-users') }}/assets/js/watchlist.js"></script>

  @stack('js')
