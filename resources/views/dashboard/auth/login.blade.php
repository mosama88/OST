<!doctype html>
<html lang="ar" dir="rtl" id="htmlRoot">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title id="pageTitle">OSINFOTRAD | تسجيل الدخول</title>

    <!-- Bootstrap CSS (Dynamic Link) rtl -->
    <link id="bootstrapStyle" rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css">

    {{-- <!-- Bootstrap CSS (Dynamic Link) ltr -->
    <link id="bootstrapStyle" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"> --}}

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">

    <style>
        * {
            font-family: 'Cairo', sans-serif;
        }

        /* زر تغيير اللغة العائم */
        .lang-switch-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(20, 30, 48, 0.75);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 8px 16px;
            border-radius: 30px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        html[dir="ltr"] .lang-switch-btn {
            right: auto;
            left: 20px;
        }

        .lang-switch-btn:hover {
            background: #0072ff;
            color: #fff;
            border-color: #0072ff;
        }

        /* خلفية بطول وعرض الشاشة مع تغطية كاملة */
        body.login-page {
            background: url("{{ asset('admin/assets/img/trade-login.jpg') }}") no-repeat center center fixed;
            background-size: cover;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            position: relative;
        }

        /* طبقة حماية متدرجة لتظليل الخلفية وإبراز الكارت */
        body.login-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 15, 30, 0.45);
            z-index: 1;
        }

        .login-box {
            width: 100%;
            max-width: 420px;
            padding: 15px;
            position: relative;
            z-index: 2;
        }

        /* تصميم الكارت الزجاجي (Glassmorphism) */
        .glass-card {
            background: rgba(20, 30, 48, 0.55);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6),
                0 0 15px rgba(0, 162, 255, 0.15);
            color: #ffffff;
        }

        /* حقول الإدخال الشفافة */
        .form-control-glass {
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            border-radius: 10px !important;
        }

        .form-control-glass:focus {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: #00a2ff !important;
            box-shadow: 0 0 12px rgba(0, 162, 255, 0.4) !important;
        }

        .form-control-glass::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .input-group-text-glass {
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: rgba(255, 255, 255, 0.7) !important;
            border-radius: 10px !important;
        }

        /* زر تسجيل الدخول التفاعلي الأزرق */
        .btn-glow {
            background: linear-gradient(135deg, #0072ff, #00c6ff);
            border: none;
            color: #ffffff;
            font-weight: 700;
            padding: 12px;
            border-radius: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 114, 255, 0.4);
        }

        .btn-glow:hover {
            background: linear-gradient(135deg, #005bb5, #00a2ff);
            box-shadow: 0 6px 20px rgba(0, 162, 255, 0.6);
            transform: translateY(-1px);
            color: #fff;
        }

        /* تخصيص زر "تذكرني" والروابط */
        .form-check-input {
            background-color: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            cursor: pointer;
        }

        .form-check-input:checked {
            background-color: #0072ff;
            border-color: #0072ff;
        }

        .login-link {
            color: rgba(255, 255, 255, 0.75);
            text-decoration: none;
            transition: color 0.2s;
        }

        .login-link:hover {
            color: #00c6ff;
        }
    </style>
</head>

<body class="login-page">

    <!-- زر تغيير اللغة -->
    <button class="lang-switch-btn" id="langToggleBtn" onclick="toggleLanguage()">
        <i class="bi bi-globe me-1"></i> <span id="langText">English</span>
    </button>

    <main class="login-box">
        <div class="card glass-card p-4">

            <!-- عنوان الهيدر -->
            <div class="text-center mb-4">
                <h2 class="fw-bold mb-1" id="mainTitle" style="letter-spacing: 1px;">تسجيل الدخول</h2>
                <p class="text-white-50 small" id="subTitle">إلى مركز التداول الخاص بك</p>
            </div>

            <!-- نموذج تسجيل الدخول -->
            <form action="{{ route('dashboard.login') }}" method="post">
                @csrf
                <!-- اسم المستخدم / البريد -->
                <div class="mb-3">
                    <div class="input-group">
                        <span class="input-group-text input-group-text-glass">
                            <i class="bi bi-person-fill"></i>
                        </span>
                        <input type="text" name="username" id="usernameInput"
                            class="form-control form-control-glass @error('username') is-invalid @enderror"
                            value="{{ old('username') }}" placeholder="اسم المستخدم" required>
                    </div>
                    <!-- تم نقل ديف الخطأ ليصبح خارج الـ input-group مباشرة -->
                    @error('username')
                        <div class="invalid-feedback d-block text-danger small mt-1">
                            {{ $message }}
                        </div>
                    @enderror
                </div>

                <!-- كلمة المرور -->
                <div class="mb-3">
                    <div class="input-group">
                        <span class="input-group-text input-group-text-glass">
                            <i class="bi bi-lock-fill"></i>
                        </span>
                        <input type="password" name="password" id="passwordInput"
                            class="form-control form-control-glass" placeholder="كلمة المرور" required>
                      @error('password')
                        <div class="invalid-feedback d-block text-danger small mt-1">
                            {{ $message }}
                        </div>
                    @enderror
                    </div>
                </div>

                <!-- خيار تذكرني -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="rememberMe">
                        <label class="form-check-label small text-white-50" for="rememberMe" id="rememberText">
                            تذكرني
                        </label>
                    </div>
                </div>

                <!-- زر الدخول -->
                <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-glow" id="submitBtn">تسجيل الدخول</button>
                </div>

                <!-- روابط نسيت كلمة المرور -->
                <div class="text-center mt-3 pt-2 border-top border-white-10">
                    <p class="mb-1">
                        <a href="#" class="login-link small" id="forgotText">نسيت كلمة المرور؟</a>
                    </p>
                </div>

            </form>
        </div>
    </main>

    <!-- جافاسكريبت لتبديل اللغة والاتجاه -->
    <script>
        let currentLang = 'ar';

        function toggleLanguage() {
            const htmlRoot = document.getElementById('htmlRoot');
            const bootstrapStyle = document.getElementById('bootstrapStyle');
            const langText = document.getElementById('langText');

            // عناصر النصوص
            const pageTitle = document.getElementById('pageTitle');
            const mainTitle = document.getElementById('mainTitle');
            const subTitle = document.getElementById('subTitle');
            const usernameInput = document.getElementById('usernameInput');
            const passwordInput = document.getElementById('passwordInput');
            const rememberText = document.getElementById('rememberText');
            const submitBtn = document.getElementById('submitBtn');
            const forgotText = document.getElementById('forgotText');

            if (currentLang === 'ar') {
                // التحويل إلى الإنجليزية (LTR)
                currentLang = 'en';
                htmlRoot.setAttribute('dir', 'ltr');
                htmlRoot.setAttribute('lang', 'en');
                bootstrapStyle.setAttribute('href',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');

                langText.textContent = 'العربية';
                pageTitle.textContent = 'OSINFOTRAD | Login';
                mainTitle.textContent = 'Sign In';
                subTitle.textContent = 'To your trading center';
                usernameInput.setAttribute('placeholder', 'Username');
                passwordInput.setAttribute('placeholder', 'Password');
                rememberText.textContent = 'Remember me';
                submitBtn.textContent = 'Sign In';
                forgotText.textContent = 'Forgot password?';
            } else {
                // التحويل إلى العربية (RTL)
                currentLang = 'ar';
                htmlRoot.setAttribute('dir', 'rtl');
                htmlRoot.setAttribute('lang', 'ar');
                bootstrapStyle.setAttribute('href',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css');

                langText.textContent = 'English';
                pageTitle.textContent = 'OSINFOTRAD | تسجيل الدخول';
                mainTitle.textContent = 'تسجيل الدخول';
                subTitle.textContent = 'إلى مركز التداول الخاص بك';
                usernameInput.setAttribute('placeholder', 'اسم المستخدم');
                passwordInput.setAttribute('placeholder', 'كلمة المرور');
                rememberText.textContent = 'تذكرني';
                submitBtn.textContent = 'تسجيل الدخول';
                forgotText.textContent = 'نسيت كلمة المرور؟';
            }
        }
    </script>
</body>

</html>
