     <script src="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.11.0/browser/overlayscrollbars.browser.es6.min.js"
         crossorigin="anonymous"></script>
     <!--end::Third Party Plugin(OverlayScrollbars)--><!--begin::Required Plugin(popperjs for Bootstrap 5)-->
     <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" crossorigin="anonymous">
     </script>
     <!--end::Required Plugin(popperjs for Bootstrap 5)--><!--begin::Required Plugin(Bootstrap 5)-->
     <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
     <!--end::Required Plugin(Bootstrap 5)--><!--begin::Required Plugin(AdminLTE)-->
     <script src="{{ asset('admin') }}/js/adminlte.js"></script>
     <!--end::Required Plugin(AdminLTE)-->
     <!--begin::OverlayScrollbars Configure-->
     <script src="{{ asset('admin') }}/js/sidebar-wrapper.js"></script>

     <!--end::OverlayScrollbars Configure-->


     <!-- apexcharts -->
     <script src="https://cdn.jsdelivr.net/npm/apexcharts@3.37.1/dist/apexcharts.min.js"
         integrity="sha256-+vh8GkaU7C9/wbSLIcwq82tQ2wTf44aOHA8HlBMwRI8=" crossorigin="anonymous"></script>


     <!--begin::Theme Init (prevents flash of incorrect theme on load, #6043)-->
     <script src="{{ asset('admin') }}/js/color-mode.js"></script>

     </script>



     @stack('js')
