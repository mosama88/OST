<!doctype html>
<html lang="ar" dir="rtl" data-bs-theme="dark">

<head>

    @include('dashboard.layouts.head')

</head>

<body>
    <div class="container py-3">

        <!-- Combined Navbar & Header -->
        @include('dashboard.layouts.navbar')

 
        @yield('content')

        <!-- Footer -->

        @include('dashboard.layouts.footer')
    </div>


    @include('dashboard.layouts.scripts')
</body>

</html>
