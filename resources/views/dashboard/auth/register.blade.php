@extends('dashboard.auth.layouts.master')

@section('title', 'إنشاء حساب | OSInfoTrade')

@section('content')
<div class="auth-card">
    <h2 class="auth-title">انضم إلينا الآن</h2>
    <p class="auth-subtitle">أنشئ حسابك وابدأ في تحليل السوق الأمريكي بدقة</p>

    <form method="POST" action="{{ route('register') }}">
        @csrf

        <!-- الاسم -->
        <div class="mb-3">
            <label class="form-label">الاسم الكامل</label>
            <input type="text" name="name" class="form-control form-control-custom" placeholder="أدخل اسمك" value="{{ old('name') }}" required autofocus>
            @error('name') <span class="text-danger small">{{ $message }}</span> @enderror
        </div>

        <!-- البريد الإلكتروني -->
        <div class="mb-3">
            <label class="form-label">البريد الإلكتروني</label>
            <input type="email" name="email" class="form-control form-control-custom" placeholder="name@example.com" dir="ltr" value="{{ old('email') }}" required>
            @error('email') <span class="text-danger small">{{ $message }}</span> @enderror
        </div>

        <!-- كلمة المرور -->
        <div class="mb-3">
            <label class="form-label">كلمة المرور</label>
            <input type="password" name="password" class="form-control form-control-custom" placeholder="••••••••" dir="ltr" required>
            @error('password') <span class="text-danger small">{{ $message }}</span> @enderror
        </div>

        <!-- تأكيد كلمة المرور -->
        <div class="mb-4">
            <label class="form-label">تأكيد كلمة المرور</label>
            <input type="password" name="password_confirmation" class="form-control form-control-custom" placeholder="••••••••" dir="ltr" required>
        </div>

        <button type="submit" class="btn-submit">
            إنشاء الحساب <i class="fas fa-user-plus me-1"></i>
        </button>
    </form>

    <div class="divider">أو</div>

    <div class="switch-auth">
        لديك حساب بالفعل؟ <a href="{{ route('login') }}">تسجيل الدخول</a>
    </div>
</div>
@endsection
