<!DOCTYPE html>
<html lang="ar" dir="rtl" class="scroll-smooth">

<head>
    @include('website.layouts.head')
</head>

<body class="antialiased selection:bg-blue-600 selection:text-white">

    <!-- Live Market Ticker Tape -->
    <div class="bg-slate-950 border-b border-slate-800/80 text-xs py-2.5 ticker-wrap select-none z-50 relative">
        <div class="ticker-move flex items-center space-x-12 space-x-reverse text-slate-300 font-semibold">
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">NVDA</span> 135.50 <span
                    class="text-emerald-400">+5.4% 📈</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">TSLA</span> 242.80 <span
                    class="text-red-400">-2.1% 📉</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">AAPL</span> 231.10 <span
                    class="text-emerald-400">+1.2% 📈</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">AMD</span> 162.40 <span
                    class="text-emerald-400">+3.8% 📈</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">AMZN</span> 194.20 <span
                    class="text-emerald-400">+2.4% 📈</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">PLTR</span> 48.90 <span
                    class="text-emerald-400">+7.9% 📈</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">META</span> 582.30 <span
                    class="text-emerald-400">+1.6% 📈</span></span>
            <span class="inline-flex items-center gap-2"><span
                    class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">MSFT</span> 428.00 <span
                    class="text-red-400">-0.4% 📉</span></span>
        </div>
    </div>

    <!-- Navigation Header -->

    @include('website.layouts.navbar')

    @yield('content')

   

    <!-- Modal Dialog (Login / Register) -->
    @include('website.layouts.login')

    <!-- Notification Toast -->
    <div id="toastNotification"
        class="fixed bottom-6 right-6 z-50 glass-panel bg-slate-900/95 border border-emerald-500/40 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transform translate-y-32 opacity-0 transition-all duration-300">
        <i class="fa-solid fa-circle-check text-emerald-400 text-xl"></i>
        <span id="toastText" class="text-sm font-bold">تمت العملية بنجاح</span>
    </div>

    <!-- Footer -->
    @include('website.layouts.footer')
    <!-- JavaScript Logic -->
    @include('website.layouts.scripts')
</body>

</html>
