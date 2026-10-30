@extends('dashboard.auth.layouts.master')

@section('title', 'تسجيل الدخول | OSInfoTrade')

@section('content')
    <div class="auth-card">
        <h2 class="auth-title">مرحباً بعودتك</h2>
        <p class="auth-subtitle">سجل الدخول للوصول إلى لوحة التحكم والقناص اللحظي</p>

        <form method="POST" action="{{ route('login') }}">
            @csrf
            <div class="mb-3">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" name="email" class="form-control form-control-custom" placeholder="name@example.com"
                    dir="ltr" required autofocus>
            </div>

            <div class="mb-3">
                <label class="form-label">كلمة المرور</label>
                <input type="password" name="password" class="form-control form-control-custom" placeholder="••••••••"
                    dir="ltr" required>
            </div>

            <div class="auth-links">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="remember" id="remember">
                    <label class="form-check-label text-secondary" for="remember">تذكرني</label>
                </div>
                <a href="{{ route('password.request') }}">نسيت كلمة المرور؟</a>
            </div>

            <button type="submit" class="btn-submit">
                انضم مجاناً وابدأ التداول <i class="fas fa-arrow-left me-1"></i>
            </button>
        </form>

        <div class="divider">أو</div>

        <div class="switch-auth">
            ليس لديك حساب؟ <a href="{{ route('register') }}">إنشاء حساب جديد</a>
        </div>
    </div>
@endsection
