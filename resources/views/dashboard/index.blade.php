@extends('dashboard.layouts.master')
@section('content')
    <!-- Hero Clock Section -->
    <section class="card shadow-sm mb-3 hero-card" id="hero">
        <div class="card-body">
            <div class="row g-4 align-items-center">
                <div class="col-md-6 border-end-md">
                    <div class="text-body-secondary small">
                        القاهرة <span id="tzc"></span>
                    </div>
                    <div class="big-clock my-1" id="clockC">--:--:--</div>
                    <div class="text-body-secondary small" id="dateC"></div>
                    <div class="text-body-secondary small mt-2">
                        نيويورك: <b id="clockN" dir="ltr">--:--</b>
                        <span id="tzn"></span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="h5 fw-bold d-flex align-items-center gap-2 mb-1">
                        <span class="dot"></span><span id="stName">—</span>
                    </div>
                    <p class="text-body-secondary small mb-2" id="stDesc"></p>
                    <div class="text-body-secondary small" id="cdLabel"></div>
                    <div class="cd-clock text-primary" id="cd">--:--:--</div>
                </div>
            </div>
        </div>
    </section>

    <!-- 24H Map -->
    <section class="card shadow-sm mb-3">
        <div class="card-body">
            <h2 class="h6 fw-bold mb-2">
                🗺️ خريطة اليوم بتوقيت القاهرة (24 ساعة)
            </h2>
            <div class="tl" id="tl" role="img" aria-label="الجلسات الأمريكية على مدار اليوم بتوقيت القاهرة">
            </div>
            <div class="d-flex justify-content-between text-body-secondary small mt-1" dir="ltr">
                <span>00</span><span>03</span><span>06</span><span>09</span><span>12</span><span>15</span><span>18</span><span>21</span><span>24</span>
            </div>
            <div class="lg d-flex flex-wrap gap-3 mt-2 small">
                <span style="--c: var(--pre)">Pre-Market</span>
                <span style="--c: var(--reg)">Official session</span>
                <span style="--c: var(--post)">After Hour</span>
                <span style="--c: var(--bs-emphasis-color)">Now</span>
            </div>
        </div>
    </section>


    <!-- PRO WATCHLIST & PRICE ALERTS SECTION -->
    <section class="card shadow-sm mb-3 border-warning border-opacity-50" id="watchlistSection">
        <div class="card-header bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center gap-2">
                <h2 class="h5 fw-bold mb-0">⭐ رادار المتابعة الذكي (Pro Watchlist)</h2>
                <span class="badge bg-warning text-dark fw-bold" id="wlCountBadge">0 أسهم</span>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-3">
                <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" id="wlAutoRefresh" checked />
                    <label class="form-check-label small" for="wlAutoRefresh">تحديث حي (10ث)</label>
                </div>
                <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" id="wlAlertSound" checked />
                    <label class="form-check-label small" for="wlAlertSound">🔔 جرس اختراق السعر</label>
                </div>
                <button type="button" class="btn btn-sm btn-outline-warning fw-semibold" id="wlRefreshBtn">
                    🔄 تحديث الأسعار الآن
                </button>
            </div>
        </div>

        <div class="card-body">
            <!-- شريط الإضافة السريعة + المنبه السعري + القوائم الجاهزة -->
            <div class="row g-2 align-items-end mb-3 pb-3 border-bottom">
                <div class="col-6 col-sm-4 col-md-2">
                    <label class="form-label small text-body-secondary mb-1">رمز السهم (Ticker)</label>
                    <input type="text" class="form-control form-control-sm text-uppercase fw-bold" id="wlSymInput"
                        placeholder="مثال: NVDA" dir="ltr"
                        oninput="this.value = this.value.replace(/[^a-zA-Z0-9.]/g, '')" />
                </div>
                <div class="col-6 col-sm-4 col-md-2">
                    <label class="form-label small text-body-secondary mb-1">🔔 منبه عند سعر (\$)</label>
                    <input type="number" class="form-control form-control-sm" id="wlTargetInput"
                        placeholder="اختياري (مثلاً 150)" step="any" min="0" dir="ltr" />
                </div>
                <div class="col-12 col-sm-4 col-md-3">
                    <label class="form-label small text-body-secondary mb-1">📝 ملاحظة / خطة التداول</label>
                    <input type="text" class="form-control form-control-sm" id="wlNoteInput"
                        placeholder="مثال: دخول بعد اختراق القمة..." />
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-sm btn-warning fw-bold px-3" id="wlAddBtn">
                        ➕ أضف للرادار
                    </button>
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-sm btn-outline-info fw-semibold" id="wlAddCurrentBtn"
                        title="إضافة السهم الموجود حالياً في الحاسبة">
                        📌 أضف سهم الحاسبة الحالي
                    </button>
                </div>

                <!-- قوائم جاهزة سريعة -->
                <div class="col-12 col-md-auto ms-md-auto d-flex flex-wrap align-items-center gap-1 mt-2 mt-md-0">
                    <span class="small text-body-secondary me-1">قوائم جاهزة:</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary wl-preset"
                        data-tickers="NVDA,AAPL,MSFT,AMD,TSLA,PLTR">
                        🚀 عمالقة التكنولوجيا
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-success wl-preset"
                        data-tickers="LLY,NVO,PFE,MRNA,ABBV,VRTX">
                        💊 الأدوية والبيوتك
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" id="wlClearAllBtn"
                        title="مسح القائمة بالكامل">
                        🗑️ مسح الكل
                    </button>
                </div>
            </div>

            <!-- شريط الفلترة والترتيب -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div class="btn-group btn-group-sm" role="group" aria-label="فلترة المفضلة">
                    <button type="button" class="btn btn-outline-secondary active wl-filter" data-filter="all">
                        الكل
                    </button>
                    <button type="button" class="btn btn-outline-success wl-filter" data-filter="halal">
                        ✅ الحلال فقط
                    </button>
                    <button type="button" class="btn btn-outline-info wl-filter" data-filter="gainers">
                        🟢 الصاعدة اليوم
                    </button>
                    <button type="button" class="btn btn-outline-warning wl-filter" data-filter="alerts">
                        🔔 بها منبه سعري
                    </button>
                </div>

                <div class="d-flex align-items-center gap-2 small">
                    <span class="text-body-secondary">ترتيب حسب:</span>
                    <select class="form-select form-select-sm w-auto" id="wlSortSelect">
                        <option value="added">الأحدث إضافة</option>
                        <option value="changeDesc">الأعلى صعوداً (%)</option>
                        <option value="changeAsc">الأكثر هبوطاً (%)</option>
                        <option value="volDesc">الأعلى سيولة (Volume)</option>
                        <option value="symAsc">الأبجدية (A-Z)</option>
                    </select>
                    <span class="text-body-secondary ms-2">آخر تحديث: <b id="wlLastUpdate"
                            dir="ltr">--:--:--</b></span>
                </div>
            </div>

            <!-- شبكة بطاقات الأسهم (Cards Grid) -->
            <div id="wlGrid" class="row g-2"></div>
        </div>
    </section>

    <!-- LIVE INTERACTIVE CHART SECTION -->
    <section class="card shadow-sm mb-3 border-info border-opacity-50" id="chartSection" hidden>
        <div class="card-header bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center gap-2">
                <h2 class="h5 fw-bold mb-0">📊 الشارت اللحظي المباشر</h2>
                <span class="badge bg-info text-dark fs-6" id="chartSymbolBadge" dir="ltr">AAPL</span>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
                <!-- Timeframe Quick Selector -->
                <div class="btn-group btn-group-sm" role="group" aria-label="الفريم الزمني" dir="ltr">
                    <button type="button" class="btn btn-outline-secondary chart-tf" data-tf="1">
                        1m
                    </button>
                    <button type="button" class="btn btn-outline-secondary chart-tf active" data-tf="5">
                        5m
                    </button>
                    <button type="button" class="btn btn-outline-secondary chart-tf" data-tf="15">
                        15m
                    </button>
                    <button type="button" class="btn btn-outline-secondary chart-tf" data-tf="60">
                        1H
                    </button>
                    <button type="button" class="btn btn-outline-secondary chart-tf" data-tf="D">
                        1D
                    </button>
                </div>
                <a href="#" id="tvExternalLink" target="_blank" rel="noopener"
                    class="btn btn-sm btn-outline-info">🔗
                    فتح في
                    TradingView</a>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="toggleChartBtn">
                    🔼 طي الشارت
                </button>
            </div>
        </div>
        <div class="card-body p-0" id="chartCardBody">
            <div id="tv_chart_container" style="height: 520px; width: 100%"></div>
        </div>
    </section>

    <!-- Calculator & Cached Stock Data Section -->
    <section class="card shadow-sm mb-3 border-primary border-opacity-50" id="calcSection">
        <div class="card-header bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h2 class="h5 fw-bold mb-0">
                🧮 حاسبة الأرباح وبيانات السهم (محفوظة في الكاش)
            </h2>
            <div hidden>

                <span class="badge bg-secondary" id="cacheBadge">💾 محفوظ في الكاش</span>
            </div>
        </div>
        <div class="card-body">
            <!-- Search & Clear Row -->
            <div class="row g-2 align-items-end mb-3">
                <div class="col-sm-6 col-md-5">
                    <label for="sym" class="form-label small text-body-secondary mb-1">رمز السهم (يبقى في
                        الكاش حتى تضغط
                        مسح)</label>
                    <input type="text" class="form-control text-uppercase fs-6 fw-bold" id="sym"
                        placeholder="EX: AAPL أو MULN" dir="ltr" pattern="[A-Za-z0-9]+"
                        oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')"
                        style="background-color: #287a74; color: #e0d5cc" />
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-primary fw-semibold" id="get">
                        🔍 هات السعر والبيانات
                    </button>
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-outline-danger fw-semibold" id="clearCache">
                        🗑️ مسح بيانات السهم (Clear)
                    </button>
                </div>
                <div class="col-12 mt-2" hidden>
                    <details>
                        <summary class="small text-body-secondary" style="cursor: pointer">
                            ⚙️ إعدادات رابط الـ Worker API
                        </summary>
                        <div class="mt-2">
                            <input type="text" class="form-control form-control-sm" id="api"
                                value="https://small-disk-18d3stock-proxy.osamaanit.workers.dev" dir="ltr"
                                readonly />
                        </div>
                    </details>
                </div>
            </div>

            <!-- Stock Info Display Card -->
            <div id="q" class="alert alert-secondary d-none mb-3 p-3"></div>

            <!-- Calculator Inputs -->
            <div class="row g-3 mb-3">
                <div class="col-6 col-md-3">
                    <label for="buy" class="form-label small text-body-secondary">سعر الشراء ($)</label>
                    <input type="number" class="form-control" id="buy" step="any" min="0"
                        dir="ltr" />
                </div>
                <div class="col-6 col-md-3">
                    <label for="sell" class="form-label small text-body-secondary">سعر البيع ($)</label>
                    <input type="number" class="form-control" id="sell" step="any" min="0"
                        dir="ltr" />
                </div>
                <div class="col-6 col-md-3">
                    <label for="mode" class="form-label small text-body-secondary">احسب على أساس</label>
                    <select id="mode" class="form-select">
                        <option value="budget">مبلغ أستثمره</option>
                        <option value="shares">عدد أسهم</option>
                    </select>
                </div>
                <div class="col-6 col-md-3" id="bw">
                    <label for="budget" class="form-label small text-body-secondary">المبلغ ($)</label>
                    <input type="number" class="form-control" id="budget" step="any" min="0"
                        value="100" dir="ltr" />
                </div>
                <div class="col-6 col-md-3" id="sw" hidden>
                    <label for="shares" class="form-label small text-body-secondary">عدد الأسهم</label>
                    <input type="number" class="form-control" id="shares" step="any" min="0"
                        value="10" dir="ltr" />
                </div>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span class="small text-body-secondary">مبالغ سريعة:</span>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-b="50">
                    $50
                </button>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-b="100">
                    $100
                </button>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-b="500">
                    $500
                </button>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-b="1000">
                    $1000
                </button>
                <div class="form-check ms-auto">
                    <input class="form-check-input" type="checkbox" id="frac" checked />
                    <label class="form-check-label small" for="frac">أسهم كسرية</label>
                </div>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-6 col-md-3">
                    <label for="fbf" class="form-label small text-body-secondary">عمولة الشراء ثابتة
                        ($)</label>
                    <input type="number" class="form-control form-control-sm" id="fbf" step="any"
                        min="0" value="0" dir="ltr" />
                </div>
                <div class="col-6 col-md-3">
                    <label for="fbp" class="form-label small text-body-secondary">عمولة الشراء (%)</label>
                    <input type="number" class="form-control form-control-sm" id="fbp" step="any"
                        min="0" value="0" dir="ltr" />
                </div>
                <div class="col-6 col-md-3">
                    <label for="fsf" class="form-label small text-body-secondary">عمولة البيع ثابتة
                        ($)</label>
                    <input type="number" class="form-control form-control-sm" id="fsf" step="any"
                        min="0" value="0" dir="ltr" />
                </div>
                <div class="col-6 col-md-3">
                    <label for="fsp" class="form-label small text-body-secondary">عمولة البيع (%)</label>
                    <input type="number" class="form-control form-control-sm" id="fsp" step="any"
                        min="0" value="0" dir="ltr" />
                </div>
            </div>

            <div id="msg" class="text-danger small fw-semibold mb-2"></div>
            <div class="row g-2 mb-3" id="res"></div>

            <div class="table-responsive">
                <table class="table table-sm table-hover table-bordered align-middle mb-0" id="scen" hidden>
                    <thead class="table-light">
                        <tr>
                            <th>لو البيع بسعر</th>
                            <th>التغيّر</th>
                            <th>صافي الربح/الخسارة</th>
                            <th>العائد</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- PRO GLOBAL SCANNER ($0.01 to $25) -->
    <!-- PRO GLOBAL SCANNER (Advanced Search & Clean UI) -->
    <section class="card shadow-sm mb-3 border-success border-opacity-50" id="scannerSection">
        <div class="card-header bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
                <h2 class="h5 fw-bold mb-0">
                    📡 رادار الأسهم الذكي (Advanced Scanner)
                </h2>
                <small class="text-body-secondary">ابحث عن أفضل الفرص بناءً على السعر، السيولة، الـ Float، والبلد</small>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-3">
                <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" id="scannerAuto" checked />
                    <label class="form-check-label small" for="scannerAuto">تحديث تلقائي (8ث)</label>
                </div>
                <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" id="scannerSound" checked />
                    <label class="form-check-label small" for="scannerSound">🔔 تنبيه صوتي</label>
                </div>
            </div>
        </div>

        <div class="card-body">
            <!-- Advanced Search Form -->
            <div class="bg-body-tertiary p-3 rounded-3 mb-4 border">
                <div class="row g-3 align-items-end">
                    <!-- 1. Price Range -->
                    <div class="col-12 col-md-6 col-xl-3">
                        <label class="form-label small text-body-secondary mb-1 fw-bold">💰 نطاق السعر ($)</label>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="filterPriceMin" placeholder="من"
                                value="0.01" step="0.01" dir="ltr" />
                            <span class="input-group-text">-</span>
                            <input type="number" class="form-control" id="filterPriceMax" placeholder="إلى"
                                value="25" step="0.5" dir="ltr" />
                        </div>
                    </div>

                    <!-- 2. Volume Range -->
                    <div class="col-12 col-md-6 col-xl-3">
                        <label class="form-label small text-body-secondary mb-1 fw-bold">📊 نطاق الفوليوم (Volume)</label>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="filterVolumeMin" placeholder="من"
                                value="100000" step="50000" dir="ltr" />
                            <span class="input-group-text">-</span>
                            <input type="number" class="form-control" id="filterVolumeMax" placeholder="إلى"
                                step="100000" dir="ltr" />
                        </div>
                    </div>

                    <!-- 3. Free Float Range -->
                    <div class="col-12 col-md-6 col-xl-3">
                        <label class="form-label small text-body-secondary mb-1 fw-bold">💎 نطاق الـ Free Float
                            (أسهم)</label>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="filterFloatMin" placeholder="من (مليون)"
                                step="1000000" dir="ltr" />
                            <span class="input-group-text">-</span>
                            <input type="number" class="form-control" id="filterFloatMax" placeholder="إلى (مليون)"
                                step="1000000" dir="ltr" />
                        </div>
                    </div>

                    <!-- 4. Country & Exchange -->
                    <div class="col-12 col-md-6 col-xl-3">
                        <label class="form-label small text-body-secondary mb-1 fw-bold">🌍 البلد / البورصة</label>
                        <div class="input-group input-group-sm">
                            <select class="form-select" id="filterCountry">
                                <option value="all">كل البلدان</option>
                                <option value="usa" selected>الولايات المتحدة (USA)</option>
                                <option value="china">الصين (China)</option>
                                <option value="saudi">السعودية (Saudi)</option>
                                <option value="uk">بريطانيا (UK)</option>
                                <option value="canada">كندا (Canada)</option>
                            </select>
                            <select class="form-select" id="filterMarket">
                                <option value="all">كل البورصات</option>
                                <option value="nasdaq">NASDAQ</option>
                                <option value="nyse">NYSE</option>
                                <option value="amex">AMEX</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Row 2: Extras -->
                <div class="row g-3 align-items-end mt-2 pt-2 border-top border-secondary border-opacity-25">
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-body-secondary mb-1">أقل تغيّر (%)</label>
                        <input type="number" class="form-control form-control-sm" id="filterChangeMin" value="2"
                            step="0.5" dir="ltr" />
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-body-secondary mb-1">أقل RVOL</label>
                        <input type="number" class="form-control form-control-sm" id="filterRvolMin" value="1.2"
                            step="0.1" dir="ltr" />
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-body-secondary mb-1">فلتر القرار</label>
                        <select class="form-select form-select-sm" id="filterVerdict">
                            <option value="">الكل</option>
                            <option value="enter">🚀 ادخل فوراً</option>
                            <option value="watch">👀 مراقبة</option>
                            <option value="danger">🛑 خطر</option>
                        </select>
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-body-secondary mb-1">عدد الصفوف</label>
                        <select class="form-select form-select-sm" id="filterLimit">
                            <option value="50" selected>50 سهم</option>
                            <option value="100">100 سهم</option>
                            <option value="200">200 سهم</option>
                        </select>
                    </div>
                    <div class="col-12 col-md-4 text-end">
                        <button type="button" class="btn btn-sm btn-outline-secondary fw-semibold" id="scannerReset">
                            🔄 استعادة الافتراضي
                        </button>
                        <button type="button" class="btn btn-success btn-sm fw-bold px-4" id="scannerBtn">
                            🚀 ابحث الآن
                        </button>
                    </div>
                </div>
            </div>

            <!-- View Toggle & Status -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary active" id="btnViewTable"
                        onclick="document.getElementById('scannerPanels').style.display='none'; document.getElementById('tableContainer').style.display='block'; this.classList.add('active'); document.getElementById('btnViewPanels').classList.remove('active');">📋
                        عرض الجدول التفصيلي</button>
                    <button type="button" class="btn btn-outline-primary" id="btnViewPanels"
                        onclick="document.getElementById('scannerPanels').style.display='block'; document.getElementById('tableContainer').style.display='none'; this.classList.add('active'); document.getElementById('btnViewTable').classList.remove('active');">🧩
                        عرض اللوحات (Momo)</button>
                </div>
                <div class="d-flex align-items-center gap-3 small">
                    <span id="scannerStatus" class="fw-semibold text-success">جاهز للمسح</span>
                    <span class="text-body-secondary">النتائج: <b id="scannerCount">0</b></span>
                    <span class="text-body-secondary">آخر تحديث: <b id="scannerLastUpdate"
                            dir="ltr">--:--:--</b></span>
                </div>
            </div>

            <!-- 1. Momo Panels (Hidden by Default) -->
            <div id="scannerPanels" class="sc-grid mb-3" dir="ltr" style="display: none;"></div>

            <!-- 2. Detailed Table View -->
            <div id="tableContainer" class="table-responsive" style="max-height: 650px;">
                <table class="table table-sm table-hover table-striped align-middle mb-0 scanner-table text-center">
                    <thead class="sticky-top bg-body-tertiary shadow-sm" style="z-index: 10;">
                        <tr>
                            <th>السهم (Symbol)</th>
                            <th>السعر (Price)</th>
                            <th>التغيّر (%)</th>
                            <th>الفوليوم (Volume)</th>
                            <th>RVOL</th>
                            <th>Free Float</th>
                            <th>البلد / القطاع</th>
                            <th>MOMO Score</th>
                            <th>القرار (Verdict)</th>
                            <th>الأهداف (TP / SL)</th>
                        </tr>
                    </thead>
                    <tbody id="scannerRows">
                        <tr>
                            <td colspan="10" class="text-center py-5 text-body-secondary">
                                <div class="spinner-border text-success mb-3" role="status"></div>
                                <p class="mb-0">جاري مسح السوق وجلب أفضل الفرص...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- US Sessions & World Markets -->
    <div class="row g-3 mb-3">
        <div class="col-lg-6">
            <section class="card shadow-sm h-100">
                <div class="card-body">
                    <h2 class="h6 fw-bold mb-2">
                        🇺🇸 الجلسات الأمريكية
                        <span class="text-body-secondary fw-normal small" id="usDay"></span>
                    </h2>
                    <div class="table-responsive">
                        <table class="table table-sm align-middle mb-2">
                            <thead>
                                <tr>
                                    <th>الجلسة</th>
                                    <th>نيويورك (ET)</th>
                                    <th>القاهرة</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody id="usRows"></tbody>
                        </table>
                    </div>
                    <p class="text-body-secondary small mb-0">
                        Intraday يعني التداول جوه اليوم الواحد: بتشتري وتبيع قبل ما
                        اليوم يخلص.
                    </p>
                </div>
            </section>
        </div>

        <div class="col-lg-6">
            <section class="card shadow-sm h-100">
                <div class="card-body">
                    <h2 class="h6 fw-bold mb-2">
                        🌍 الأسواق العالمية بتوقيت القاهرة
                    </h2>
                    <div class="table-responsive">
                        <table class="table table-sm align-middle mb-2">
                            <thead>
                                <tr>
                                    <th>السوق</th>
                                    <th>الأيام</th>
                                    <th>من – إلى (القاهرة)</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody id="mkRows"></tbody>
                        </table>
                    </div>
                    <p class="text-body-secondary small mb-0">
                        الأوقات للجلسة الأساسية فقط بدون احتساب استراحات الغداء
                        الآسيوية.
                    </p>
                </div>
            </section>
        </div>
    </div>

    <!-- Volatility Times -->
    <section class="card shadow-sm mb-3">
        <div class="card-body">
            <h2 class="h6 fw-bold mb-3">
                🔥 إمتى الحركة والأرباح العالية؟ (وإمتى الخطر)
            </h2>
            <div class="row g-2">
                <div class="col-md-4">
                    <div class="p-3 border border-success rounded-3 h-100">
                        <h3 class="h6 fw-bold mb-1">أول ساعة بعد الافتتاح</h3>
                        <b class="small text-success" data-et="9:30-10:30"></b>
                        <p class="small text-body-secondary mb-0 mt-1">
                            أعلى حجم تداول وحركة في اليوم. فرص أكبر، وخسارة أسرع كمان.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border border-success rounded-3 h-100">
                        <h3 class="h6 fw-bold mb-1">تداخل لندن ونيويورك</h3>
                        <b class="small text-success" data-et="9:30-11:30"></b>
                        <p class="small text-body-secondary mb-0 mt-1">
                            سيولة قوية لأن سوقين كبار شغالين مع بعض.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border border-success rounded-3 h-100">
                        <h3 class="h6 fw-bold mb-1">آخر ساعة قبل الإغلاق</h3>
                        <b class="small text-success" data-et="15:00-16:00"></b>
                        <p class="small text-body-secondary mb-0 mt-1">
                            الحجم بيرجع يزيد والمؤسسات بتقفل مراكزها، فالسعر بيتحرك بقوة.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border rounded-3 h-100">
                        <h3 class="h6 fw-bold mb-1">منتصف اليوم (هدوء)</h3>
                        <b class="small text-body-secondary" data-et="11:30-14:00"></b>
                        <p class="small text-body-secondary mb-0 mt-1">
                            الحركة ضعيفة وغالباً مفيش اتجاه واضح. مش وقت مناسب للمبتدئ.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border border-danger rounded-3 h-100">
                        <h3 class="h6 fw-bold mb-1">Pre-Market</h3>
                        <b class="small text-danger" data-et="4:00-9:30"></b>
                        <p class="small text-body-secondary mb-0 mt-1">
                            الأخبار بتحرك السهم، بس السيولة قليلة والـ Spread واسع. استخدم
                            Limit بس.
                        </p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 border border-danger rounded-3 h-100">
                        <h3 class="h6 fw-bold mb-1">After Hour</h3>
                        <b class="small text-danger" data-et="16:00-20:00"></b>
                        <p class="small text-body-secondary mb-0 mt-1">
                            نتايج الشركات بتنزل هنا غالباً فالسهم ممكن يقفز أو ينزل فجأة.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Beginner Guide Accordion -->
    <section class="card shadow-sm mb-3">
        <div class="card-body">
            <h2 class="h6 fw-bold mb-3">📚 شرح للمبتدئ</h2>
            <div class="accordion accordion-flush" id="faqAcc">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#f1">
                            يعني إيه بورصة وسهم و Free Float؟
                        </button>
                    </h2>
                    <div id="f1" class="accordion-collapse collapse show" data-bs-parent="#faqAcc">
                        <div class="accordion-body small text-body-secondary">
                            البورصة سوق بيتباع فيه أجزاء من شركات.
                            <b>الـ Free Float</b> هو عدد الأسهم الحرة المتاحة للتداول في
                            السوق للجمهور (بدون أسهم المؤسسين المقيدة). لما يكون الـ Float
                            صغير (أقل من 20 مليون سهم) ودخلت سيولة عالية، السهم بيتحرك
                            بسرعة صاروخية.
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#f2">
                            الجلسات الأمريكية: Pre-Market وRegular وAfter-Hours
                        </button>
                    </h2>
                    <div id="f2" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                        <div class="accordion-body small text-body-secondary">
                            <ul>
                                <li>
                                    <b>Pre-Market:</b> من 4:00 لـ 9:30 صباحاً بتوقيت نيويورك.
                                    فيها أخبار وسيولة قليلة.
                                </li>
                                <li>
                                    <b>Regular:</b> من 9:30 لـ 4:00 العصر. هي الجلسة الرئيسية
                                    وأعلى سيولة.
                                </li>
                                <li>
                                    <b>After-Hours:</b> من 4:00 لـ 8:00 مساءً. بعد الإغلاق،
                                    وتقارير الأرباح بتنزل فيها.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#f3">
                            سعر الشراء Ask وسعر البيع Bid والـ Spread
                        </button>
                    </h2>
                    <div id="f3" class="accordion-collapse collapse" data-bs-parent="#faqAcc">
                        <div class="accordion-body small text-body-secondary">
                            Ask هو أقل سعر حد مستعد يبيعلك بيه، وBid هو أعلى سعر حد مستعد
                            يشتري منك بيه. الفرق بينهم هو الـ Spread وهو تكلفة مخفية بتزيد
                            في أسهم السنتات وخارج الجلسة الرسمية.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
