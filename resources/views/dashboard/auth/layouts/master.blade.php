<!DOCTYPE html>
<html lang="ar" dir="rtl" data-bs-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'OSInfoTrade')</title>
    <!-- Bootstrap 5 RTL -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset('dash-users') }}/assets/css/auth.css">
</head>

<body>

    <!-- Ticker -->


    @include('dashboard.auth.layouts.ticker')


    <!-- Navbar -->
    <nav class="navbar-custom">
        <div class="container d-flex justify-content-between align-items-center">
            <a href="/" class="navbar-brand">
                <div class="brand-icon">OS</div>
                <div>OSInfo<span>Trade</span>
                    <div style="font-size: 0.55rem; color: #94a3b8; letter-spacing: 1px; margin-top: -3px;">OSAMA
                        INFORMATION TRADE</div>
                </div>
            </a>
            <div class="d-none d-lg-flex">
                <a href="#" class="nav-link-custom">المميزات الرئيسية</a>
                <a href="#" class="nav-link-custom">القناص اللحظي</a>
                <a href="#" class="nav-link-custom">حاسبة RVOL & Float</a>
            </div>
            <div>
                <a href="{{ url('/') }}" class="btn-login-nav"><i class="fa-solid fa-house"></i> الرئيسية</a>
            </div>
        </div>
    </nav>

    <!-- المكان اللي هيتغير فيه المحتوى (لوجن أو تسجيل) -->
    <div class="auth-container">
        @yield('content')
    </div>

    <!-- Footer Stats -->
    @include('dashboard.auth.layouts.footer')

</body>

</html>
