    <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top px-3 py-2 shadow-sm">
            <div class="container-fluid p-0 d-flex flex-column gap-2">

                <!-- Top Row: Brand, Main Links & User Dropdown -->
                <div class="d-flex align-items-center justify-content-between w-100">

                    <!-- Brand / Logo -->
                    <a class="navbar-brand fw-bold me-3" href="{{ url('/') }}">OS Trading Info</a>

                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse justify-content-between" id="navbarNavAltMarkup">
                        <!-- Nav Links -->
                        <div class="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
                            <a class="nav-link active fw-medium" aria-current="page" href="#">الصفحة الرئيسية</a>
                            <a class="nav-link fw-medium" href="{{ route('dashboard.news') }}">
                                أهم الأخبار <span
                                    style="background: #000; color: #fde047; font-size: 10px; padding: 1px 5px; border-radius: 4px;">LIVE</span>
                            </a>
                        </div>

                        <!-- User Dropdown & Theme Toggle (Far Left) -->
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" id="themeToggle" class="btn btn-sm btn-secondary"
                                title="تبديل المظهر">
                                🌓
                            </button>

                            <div class="dropdown">
                                <button class="btn btn-outline-secondary dropdown-toggle btn-sm px-3 py-1"
                                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    👤 {{ Auth::user()->name }}
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                                    <li><a class="dropdown-item" href="#">الملف الشخصي</a></li>
                                    <li><a class="dropdown-item" href="#">الإعدادات</a></li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li>
                                        <form method="POST" action="{{ route('logout') }}">
                                            @csrf
                                            <button type="submit" class="dropdown-item text-danger">تسجيل
                                                الخروج</button>
                                        </form>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Row: Header Info & Quick Action Buttons -->
                <div
                    class="w-100 pt-2 border-top d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">

                    <!-- Left Group: Logo icon & Title Info -->
                    <div class="d-flex align-items-center gap-3">
                        <img src="{{ asset('dash-users') }}/assets/img/logo.png" alt="Logo" width="40"
                            height="40" class="flex-shrink-0 rounded-circle border" />
                        <div>
                            <div class="d-flex flex-wrap align-items-center gap-2 mb-0">
                                <h3 class="h6 fw-bold mb-0 text-primary">مرحباً بك، {{ Auth::user()->name }}</h3>
                                <span class="text-muted d-none d-sm-inline">|</span>
                                <h1 class="h6 fw-bold mb-0">
                                    ⏰ مواعيد البورصات + حاسبة الأرباح + اسكانر الأسهم
                                </h1>
                            </div>
                            <p class="text-body-secondary small mb-0 d-none d-md-block">
                                تحديث تلقائي للتوقيت، حفظ السهم في الكاش، مع ماسح فوري للأسهم من سنتات إلى 25 دولار.
                            </p>
                        </div>
                    </div>

                    <!-- Right Group: Quick Action Buttons -->
                    <div class="d-flex flex-wrap align-items-center gap-2 pb-2 pb-lg-0">
                        <a href="#chartSection" class="btn btn-sm btn-outline-info fw-semibold">📊 الشارت</a>
                        <a href="#calcSection" class="btn btn-sm btn-outline-primary fw-semibold">🧮 الحاسبة</a>
                        <a href="#scannerSection" class="btn btn-sm btn-primary fw-semibold">📡 الاسكانر</a>
                    </div>

                </div>

            </div>
        </nav>
