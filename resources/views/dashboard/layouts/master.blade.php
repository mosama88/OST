<!doctype html>
<html lang="en">
<!--begin::Head-->

<head>


    @include('dashboard.layouts.head')

</head>

<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
    <!--begin::App Wrapper-->
    <div class="app-wrapper">
        <!--begin::Header-->
        @include('dashboard.layouts.navbar')
        <!--end::Header-->
        <!--begin::Sidebar-->
        @include('dashboard.layouts.sidebar')
        <!--end::Sidebar-->
        <!--begin::App Main-->
        <main class="app-main">



            @include('dashboard.layouts.breadcrumb')

            <div class="app-content">
                <!--begin::Container-->
                <div class="container-fluid">
                    <!--begin::Row-->
                @yield('content')
                    <!--end::Row-->
                </div>
                <!--end::Container-->
            </div>
            <!--end::App Content-->
        </main>
        <!--end::App Main-->
        <!--begin::Footer-->
        @include('dashboard.layouts.footser')
        <!--end::Footer-->
    </div>
    <!--end::App Wrapper-->
    <!--begin::Script-->
    <!--begin::Third Party Plugin(OverlayScrollbars)-->

    @include('dashboard.layouts.scripts')
    <!--end::Script-->
</body>
<!--end::Body-->

</html>
