@extends('website.layouts.master')
@section('content')
    <!-- Hero Section -->
    <section class="relative pt-20 pb-28 overflow-hidden">
        <!-- Glow background effects -->
        <div
            class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none">
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div
                class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6 shadow-sm">
                <i class="fa-solid fa-bolt-lightning text-amber-400"></i> نظام متكامل لمتداولي السوق الأمريكي
                (السكالبينج والزخم)
            </div>
            <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight sm:leading-none mb-6">
                قوة المعلومة الفورية لتصيد الصفقات مع <br>
                <span class="gradient-text">OSInfoTrade</span>
            </h1>
            <p class="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                منصة <strong class="text-slate-200">OSInfoTrade</strong> (ابتكار أسامة لمعلومات التداول) توفر لك فاحصاً
                لحظياً، وحاسبة متقدمة للـ Free Float والسيولة، وتنبيهات أوتوماتيكية للزخم السعري بأعلى دقة.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
                <button onclick="openModal('register')"
                    class="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-base shadow-xl shadow-blue-600/30 transition flex items-center gap-2">
                    <span>انضم مجاناً وابدأ التداول</span>
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <a href="#screener"
                    class="px-8 py-4 glass-panel hover:bg-slate-800 text-white font-bold rounded-2xl text-base border border-slate-700 transition flex items-center gap-2">
                    <i class="fa-solid fa-chart-line text-blue-400"></i> استعراض الفاحص المباشر
                </a>
            </div>

            <!-- Quick Stats Bar -->
            <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                <div class="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
                    <div class="text-2xl sm:text-3xl font-black text-white mb-1">&lt; 50ms</div>
                    <div class="text-xs text-slate-400 font-semibold">سرعة تحديث البيانات اللحظية</div>
                </div>
                <div class="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
                    <div class="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">+94.2%</div>
                    <div class="text-xs text-slate-400 font-semibold">دقة توصيات الزخم والسهم (Momo)</div>
                </div>
                <div class="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
                    <div class="text-2xl sm:text-3xl font-black text-blue-400 mb-1">10,000+</div>
                    <div class="text-xs text-slate-400 font-semibold">متداول نشط يومياً في المنصة</div>
                </div>
                <div class="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
                    <div class="text-2xl sm:text-3xl font-black text-amber-400 mb-1">24/7</div>
                    <div class="text-xs text-slate-400 font-semibold">متابعة ما قبل افتتاح السوق (Pre-Market)</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-slate-950/50 border-t border-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
                <span
                    class="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">مميزات
                    منصة OSInfoTrade</span>
                <h2 class="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">كل ما تحتاجه للسيطرة على السوق الأمريكي
                    في مكان واحد</h2>
                <p class="text-slate-400 text-sm sm:text-base">تم تصميم المنصة خصيصاً لمضاربي الزخم والسكالبينج عبر
                    تقديم مؤشرات دقيقة ومعالجة فائقة السرعة للبيانات.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div
                    class="glass-panel p-8 rounded-3xl border border-slate-800/80 hover:border-blue-500/40 transition group">
                    <div
                        class="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl mb-6 group-hover:scale-110 transition">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">فاحص أسهم لحظي متطور (Screener)</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">فلترة الأسهم بسرعة فائقة بناءً على السعر، حجم
                        التداول، نسب التغير، والـ RVOL اللحظي لتصيد الأسهم المشتعلة.</p>
                </div>

                <!-- Feature 2 -->
                <div
                    class="glass-panel p-8 rounded-3xl border border-slate-800/80 hover:border-blue-500/40 transition group">
                    <div
                        class="w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-6 group-hover:scale-110 transition">
                        <i class="fa-solid fa-calculator"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">حاسبة الـ Float والـ Rotation</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">احسب عدد الأسهم الحرة (Free Float) بدقة وتتبع معدل
                        دوران الأسهم (Float Rotation) لمعرفة مدى قوة الانفجار السعري القادم.</p>
                </div>

                <!-- Feature 3 -->
                <div
                    class="glass-panel p-8 rounded-3xl border border-slate-800/80 hover:border-blue-500/40 transition group">
                    <div
                        class="w-14 h-14 rounded-2xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl mb-6 group-hover:scale-110 transition">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">توصيات تقييم المخاطر الذكية</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">خوارزميات ذكية تصنف لك كل سهم مباشرة إلى (ادخل
                        فوراً، صفقة خطر، مراقبة بحذر) لتجنب الفخاخ السعرية.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Interactive Stock Screener Section -->
    <section id="screener" class="py-20 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <span
                        class="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">منصة
                        المحطة الحية</span>
                    <h2 class="text-3xl font-black text-white mt-3">الفاحص اللحظي للأسهم (OSInfoTrade Terminal)</h2>
                </div>
                <!-- Search & Filters -->
                <div class="flex flex-wrap gap-3">
                    <input type="text" id="searchInput" onkeyup="filterTable()"
                        placeholder="ابحث برمز السهم (مثل NVDA)..."
                        class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full sm:w-64">
                    <button onclick="filterByRvol()"
                        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition">RVOL
                        العالي فقط ⚡</button>
                </div>
            </div>

            <!-- Terminal Table Box -->
            <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-right border-collapse" id="stockTable">
                        <thead>
                            <tr
                                class="bg-slate-900/90 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                                <th class="p-4">الرمز (Symbol)</th>
                                <th class="p-4">اسم الشركة</th>
                                <th class="p-4">السعر ($)</th>
                                <th class="p-4">التغير (%)</th>
                                <th class="p-4">الحجم</th>
                                <th class="p-4">الـ RVOL</th>
                                <th class="p-4">نقاط الزخم (Momo)</th>
                                <th class="p-4 text-center">قرار التداول (OSInfo)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 text-sm font-medium">
                            <tr class="hover:bg-slate-800/40 transition">
                                <td class="p-4 font-bold text-white flex items-center gap-2"><span
                                        class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>NVDA</td>
                                <td class="p-4 text-slate-300">NVIDIA Corporation</td>
                                <td class="p-4 text-white font-mono">135.50</td>
                                <td class="p-4 text-emerald-400 font-mono">+5.4%</td>
                                <td class="p-4 text-slate-300 font-mono">84.2M</td>
                                <td class="p-4 text-emerald-400 font-bold font-mono">4.8x</td>
                                <td class="p-4 text-white font-mono">92/100</td>
                                <td class="p-4 text-center"><span
                                        class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ادخل
                                        فوراً 🚀</span></td>
                            </tr>
                            <tr class="hover:bg-slate-800/40 transition">
                                <td class="p-4 font-bold text-white flex items-center gap-2"><span
                                        class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>PLTR</td>
                                <td class="p-4 text-slate-300">Palantir Technologies</td>
                                <td class="p-4 text-white font-mono">48.90</td>
                                <td class="p-4 text-emerald-400 font-mono">+7.9%</td>
                                <td class="p-4 text-slate-300 font-mono">62.1M</td>
                                <td class="p-4 text-emerald-400 font-bold font-mono">6.2x</td>
                                <td class="p-4 text-white font-mono">96/100</td>
                                <td class="p-4 text-center"><span
                                        class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">صفقة
                                        ذهبية 💎</span></td>
                            </tr>
                            <tr class="hover:bg-slate-800/40 transition">
                                <td class="p-4 font-bold text-white flex items-center gap-2"><span
                                        class="w-2 h-2 rounded-full bg-red-500"></span>TSLA</td>
                                <td class="p-4 text-slate-300">Tesla Inc.</td>
                                <td class="p-4 text-white font-mono">242.80</td>
                                <td class="p-4 text-red-400 font-mono">-2.1%</td>
                                <td class="p-4 text-slate-300 font-mono">45.0M</td>
                                <td class="p-4 text-amber-400 font-bold font-mono">1.9x</td>
                                <td class="p-4 text-white font-mono">44/100</td>
                                <td class="p-4 text-center"><span
                                        class="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">صفقة
                                        خطر ⚠️</span></td>
                            </tr>
                            <tr class="hover:bg-slate-800/40 transition">
                                <td class="p-4 font-bold text-white flex items-center gap-2"><span
                                        class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>AMD</td>
                                <td class="p-4 text-slate-300">Advanced Micro Devices</td>
                                <td class="p-4 text-white font-mono">162.40</td>
                                <td class="p-4 text-emerald-400 font-mono">+3.8%</td>
                                <td class="p-4 text-slate-300 font-mono">31.5M</td>
                                <td class="p-4 text-emerald-400 font-bold font-mono">3.1x</td>
                                <td class="p-4 text-white font-mono">78/100</td>
                                <td class="p-4 text-center"><span
                                        class="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">مراقبة
                                        بحذر 👁️</span></td>
                            </tr>
                            <tr class="hover:bg-slate-800/40 transition">
                                <td class="p-4 font-bold text-white flex items-center gap-2"><span
                                        class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>AMZN</td>
                                <td class="p-4 text-slate-300">Amazon.com Inc.</td>
                                <td class="p-4 text-white font-mono">194.20</td>
                                <td class="p-4 text-emerald-400 font-mono">+2.4%</td>
                                <td class="p-4 text-slate-300 font-mono">28.4M</td>
                                <td class="p-4 text-emerald-400 font-bold font-mono">2.5x</td>
                                <td class="p-4 text-white font-mono">81/100</td>
                                <td class="p-4 text-center"><span
                                        class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ادخل
                                        فوراً 🚀</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="p-4 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
                    يتم تحديث البيانات مباشرة من خوادم السوق الأمريكي - جميع الحقوق محفوظة لـ OSInfoTrade 2026
                </div>
            </div>
        </div>
    </section>

    <!-- Free Float & RVOL Calculator Widget -->
    <section id="calculator" class="py-20 bg-slate-950/50 border-t border-slate-900">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <span
                    class="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">أداة
                    تفاعلية</span>
                <h2 class="text-3xl font-black text-white mt-4 mb-2">حاسبة الـ Free Float ومعدل الدوران (OSInfo Calc)
                </h2>
                <p class="text-slate-400 text-sm">أدخل بيانات السهم لحساب مدى سهولة انفجاره سعرياً بناءً على الأسهم
                    الحرة.</p>
            </div>

            <div class="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label class="block text-xs font-bold text-slate-300 mb-2">إجمالي الأسهم المصدرة (Total
                            Shares)</label>
                        <input type="number" id="totalShares" value="50000000"
                            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-300 mb-2">نسبة الأسهم المقيدة (%) (Insider /
                            Institutional)</label>
                        <input type="number" id="lockedPercent" value="65"
                            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-300 mb-2">حجم التداول اليومي الحالي
                            (Volume)</label>
                        <input type="number" id="dailyVolume" value="25000000"
                            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-300 mb-2">متوسط حجم 30 يوم (Avg Volume
                            30D)</label>
                        <input type="number" id="avgVolume" value="5000000"
                            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono">
                    </div>
                </div>

                <button onclick="calculateMetrics()"
                    class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition text-base mb-8">احسب
                    النتائج فوراً 📊</button>

                <!-- Results Output Box -->
                <div id="calcResults"
                    class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center">
                    <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                        <div class="text-xs text-slate-400 mb-1">الأسهم الحرة (Free Float)</div>
                        <div id="resFloat" class="text-xl font-black text-blue-400 font-mono">17.5M</div>
                    </div>
                    <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                        <div class="text-xs text-slate-400 mb-1">معدل دوران الـ Float</div>
                        <div id="resRotation" class="text-xl font-black text-emerald-400 font-mono">142.8%</div>
                    </div>
                    <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                        <div class="text-xs text-slate-400 mb-1">حجم التداول النسبي (RVOL)</div>
                        <div id="resRvol" class="text-xl font-black text-amber-400 font-mono">5.0x</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Database & Architecture Section -->
    <section id="architecture" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
                <span
                    class="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">هندسة
                    البيانات والنظام</span>
                <h2 class="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">هيكل قاعدة البيانات والربط التقني في
                    OSInfoTrade</h2>
                <p class="text-slate-400 text-sm sm:text-base">نظام مصمم بأعلى معايير الأداء لمعالجة ملايين البيانات
                    اللحظية دون تأخير.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Schema Box 1 -->
                <div class="glass-panel p-6 rounded-3xl border border-slate-800">
                    <div
                        class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black mb-4">
                        01</div>
                    <h3 class="text-lg font-bold text-white mb-2">جدول الأسهم (Stocks)</h3>
                    <ul class="text-xs text-slate-400 space-y-2 font-mono">
                        <li>• symbol (PK)</li>
                        <li>• company_name</li>
                        <li>• total_shares</li>
                        <li>• free_float</li>
                        <li>• sector & market_cap</li>
                    </ul>
                </div>

                <!-- Schema Box 2 -->
                <div class="glass-panel p-6 rounded-3xl border border-slate-800">
                    <div
                        class="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black mb-4">
                        02</div>
                    <h3 class="text-lg font-bold text-white mb-2">البيانات اللحظية (Market Data)</h3>
                    <ul class="text-xs text-slate-400 space-y-2 font-mono">
                        <li>• price, change_pct</li>
                        <li>• current_volume</li>
                        <li>• rvol_multiplier</li>
                        <li>• float_rotation_rate</li>
                        <li>• timestamp (Indexed)</li>
                    </ul>
                </div>

                <!-- Schema Box 3 -->
                <div class="glass-panel p-6 rounded-3xl border border-slate-800">
                    <div
                        class="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black mb-4">
                        03</div>
                    <h3 class="text-lg font-bold text-white mb-2">قواعد التوصيات (Rules)</h3>
                    <ul class="text-xs text-slate-400 space-y-2 font-mono">
                        <li>• momo_score (0-100)</li>
                        <li>• risk_level (ENUM)</li>
                        <li>• trigger_alert (BOOL)</li>
                        <li>• min_rvol_threshold</li>
                    </ul>
                </div>

                <!-- Schema Box 4 -->
                <div class="glass-panel p-6 rounded-3xl border border-slate-800">
                    <div
                        class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black mb-4">
                        04</div>
                    <h3 class="text-lg font-bold text-white mb-2">إعدادات المستخدمين (Users)</h3>
                    <ul class="text-xs text-slate-400 space-y-2 font-mono">
                        <li>• user_id (UUID)</li>
                        <li>• email & password_hash</li>
                        <li>• subscription_tier</li>
                        <li>• custom_watchlist</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 bg-slate-950/50 border-t border-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
                <span
                    class="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">خطط
                    الاشتراك</span>
                <h2 class="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">اختر الباقة المناسبة لطموحك في التداول
                </h2>
                <p class="text-slate-400 text-sm">أسعار مرنة تناسب المبتدئين والمحترفين مع إمكانية الإلغاء في أي وقت.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <!-- Plan 1 -->
                <div class="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
                    <div>
                        <div class="text-slate-400 font-bold text-sm mb-2">الباقة الأساسية</div>
                        <div class="text-4xl font-black text-white mb-4">$29 <span
                                class="text-sm text-slate-400 font-normal">/ شهرياً</span></div>
                        <p class="text-slate-400 text-sm mb-6">مثالية للمتداولين المبتدئين للتعرف على فرص السوق والـ
                            Screener الأساسي.</p>
                        <ul class="space-y-3 text-sm text-slate-300 mb-8">
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> فاحص
                                الأسهم اللحظي بـ تأخير 3 ثوانٍ</li>
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> حاسبة
                                الـ Float الأساسية</li>
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> دعم
                                فني عبر البريد الإلكتروني</li>
                        </ul>
                    </div>
                    <button onclick="openModal('register')"
                        class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-sm border border-slate-700">اختر
                        الأساسية</button>
                </div>

                <!-- Plan 2 -->
                <div
                    class="glass-panel p-8 rounded-3xl border-2 border-blue-500 flex flex-col justify-between relative shadow-2xl shadow-blue-500/10">
                    <div
                        class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                        الأكثر طلباً للأحتراف</div>
                    <div>
                        <div class="text-blue-400 font-bold text-sm mb-2">باقة المحترفين (PRO VIP)</div>
                        <div class="text-4xl font-black text-white mb-4">$79 <span
                                class="text-sm text-slate-400 font-normal">/ شهرياً</span></div>
                        <p class="text-slate-400 text-sm mb-6">بيانات لحظية مباشرة بدون أي تأخير، تنبيهات سريعة،
                            وتوصيات الزخم الفورية.</p>
                        <ul class="space-y-3 text-sm text-slate-300 mb-8">
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> بيانات
                                لحظية فائقة السرعة (&lt;50ms)</li>
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> فاحص
                                أسهم متقدم مع تنبيهات صوتية</li>
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> تقييم
                                المخاطر وتوصيات "ادخل فوراً"</li>
                            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-blue-500"></i> دعم
                                مباشر عبر تيليجرام 24/7</li>
                        </ul>
                    </div>
                    <button onclick="openModal('register')"
                        class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-blue-600/30">اشترك
                        الآن في PRO VIP</button>
                </div>
            </div>
        </div>
    </section>
@endsection
