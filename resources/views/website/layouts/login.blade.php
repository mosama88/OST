  <div id="authModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md hidden p-4">
      <div class="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-700 relative shadow-2xl">
          <button onclick="closeModal()"
              class="absolute top-5 left-5 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>

          <div class="text-center mb-6">
              <div
                  class="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-black mx-auto mb-3">
                  OS</div>
              <h3 id="modalTitle" class="text-2xl font-black text-white">تسجيل الدخول</h3>
              <p class="text-xs text-slate-400 mt-1">بوابتك للوصول إلى أدوات تحليل OSInfoTrade</p>
          </div>

          <form class="space-y-4"
              onsubmit="event.preventDefault(); showNotification('تمت العملية بنجاح! مرحباً بك في OSInfoTrade'); closeModal();">
              <div id="nameField" class="hidden">
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل</label>
                  <input type="text"
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                      placeholder="اسمك الكريم">
              </div>
              <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" required
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="name@example.com">
              </div>
              <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور</label>
                  <input type="password" required
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="••••••••">
              </div>
              <button type="submit"
                  class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-blue-600/30 mt-2">متابعة
                  الدخول</button>
          </form>
      </div>
  </div>
