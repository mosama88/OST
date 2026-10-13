    <aside class="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
        <!--begin::Sidebar Brand-->
        <div class="sidebar-brand">
            <!--begin::Brand Link-->
            <a href="{{url('/')}}" class="brand-link">
                <!--begin::Brand Image-->
                <img src="{{ asset('front') }}/assets/img/info-os-logo.png" alt="AdminLTE Logo"
                    class="brand-image opacity-75 shadow" />
                <!--end::Brand Image-->
                <!--begin::Brand Text-->
                <span class="brand-text fw-light">OsInfoTrade</span>
                <!--end::Brand Text-->
            </a>
            <!--end::Brand Link-->
        </div>
        <!--end::Sidebar Brand-->
        <!--begin::Sidebar Search-->
        <div class="sidebar-search" role="search">
            <label for="sidebar-search-input" class="visually-hidden">Filter menu</label>
            <input type="search" id="sidebar-search-input" class="form-control form-control-sm"
                placeholder="Filter menu…" autocomplete="off" data-lte-toggle="sidebar-search"
                data-lte-target="#navigation" />
            <p class="fs-7 text-secondary mt-2 mb-0" data-lte-search-empty role="status" hidden>
                No matching pages.
            </p>
        </div>
        <!--end::Sidebar Search-->
        <!--begin::Sidebar Wrapper-->
        <div class="sidebar-wrapper">
            <nav class="mt-2" aria-label="Main navigation">
                <!--begin::Sidebar Menu-->
                <ul class="nav sidebar-menu flex-column" data-lte-toggle="treeview" data-accordion="false"
                    id="navigation">


                    <li class="nav-item">
                        <a href="{{ route('dashboard.index') }}" class="nav-link @yield('home-active')">
                            <i class="nav-icon bi bi-speedometer"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>

                    <li class="nav-item">
                        <a href="#" class="nav-link">
                            <i class="nav-icon bi bi-box-seam-fill"></i>
                            <p>
                                Widgets
                                <i class="nav-arrow bi bi-chevron-right"></i>
                            </p>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item">
                                <a href="./widgets/small-box.html" class="nav-link">
                                    <i class="nav-icon bi bi-circle"></i>
                                    <p>Small Box</p>
                                </a>
                            </li>

                        </ul>
                    </li>
                </ul>
                <!--end::Sidebar Menu-->

                <!-- Docs CTA (bottom of sidebar) -->
                <div class="p-3 mt-3 border-top border-secondary border-opacity-25">
                    <a href="{{ route('home') }}" target="_blank"
                        class="btn btn-sm btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2">
                        <i class="bi bi-book" aria-hidden="true"></i>
                        View Website
                    </a>
                </div>
            </nav>
        </div>
        <!--end::Sidebar Wrapper-->
    </aside>
