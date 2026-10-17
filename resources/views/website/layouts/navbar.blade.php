<nav class="sticky top-0 z-40 glass-panel border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <!-- Brand Logo -->
        <div class="flex items-center space-x-3 space-x-reverse cursor-pointer"
            onclick="window.scrollTo({top:0, behavior:'smooth'})">
            <div
                class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/30">
                OS
            </div>
            <div>
                <span class="text-2xl font-black tracking-tight text-white">OSInfo<span
                        class="text-blue-500">Trade</span></span>
                <span class="text-[9px] block text-slate-400 font-bold tracking-widest -mt-1">OSAMA INFORMATION
                    TRADE</span>
            </div>
        </div>

        <!-- Nav Links -->
        <div class="hidden lg:flex items-center space-x-8 space-x-reverse text-sm font-semibold text-slate-300">
            <a href="#features" class="hover:text-blue-400 transition">المميزات الرئيسية</a>
            <a href="#screener" class="hover:text-blue-400 transition">الفاحص اللحظي</a>
            <a href="#calculator" class="hover:text-blue-400 transition">حاسبة Float & RVOL</a>
            <a href="#architecture" class="hover:text-blue-400 transition">البنية وقاعدة البيانات</a>
            <a href="#pricing" class="hover:text-blue-400 transition">الاشتراكات</a>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center space-x-3 space-x-reverse">
            @auth
                <a href="{{ route('dashboard.home') }}"
                    class="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition">
                    لوحة التحكم </a>
            @endauth
            @guest
                <button onclick="openModal('register')"
                    class="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition">
                    دخول 🚀</button>
            @endguest

        </div>
    </div>
</nav>
