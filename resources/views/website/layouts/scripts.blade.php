   <script>
       function openModal(type) {
           document.getElementById('authModal').classList.remove('hidden');
           const title = document.getElementById('modalTitle');
           const nameField = document.getElementById('nameField');
           if (type === 'register') {
               title.innerText = 'إنشاء حساب جديد في OSInfoTrade';
               nameField.classList.remove('hidden');
           }
       }

       function closeModal() {
           document.getElementById('authModal').classList.add('hidden');
       }

       function showNotification(msg) {
           const toast = document.getElementById('toastNotification');
           document.getElementById('toastText').innerText = msg;
           toast.classList.remove('translate-y-32', 'opacity-0');
           setTimeout(() => {
               toast.classList.add('translate-y-32', 'opacity-0');
           }, 3500);
       }

       // Screener search filter
       function filterTable() {
           let input = document.getElementById('searchInput').value.toUpperCase();
           let table = document.getElementById('stockTable');
           let tr = table.getElementsByTagName('tr');
           for (let i = 1; i < tr.length; i++) {
               let td = tr[i].getElementsByTagName('td')[0];
               if (td) {
                   let txtValue = td.textContent || td.innerText;
                   if (txtValue.toUpperCase().indexOf(input) > -1) {
                       tr[i].style.display = "";
                   } else {
                       tr[i].style.display = "none";
                   }
               }
           }
       }

       function filterByRvol() {
           let table = document.getElementById('stockTable');
           let tr = table.getElementsByTagName('tr');
           for (let i = 1; i < tr.length; i++) {
               let rvolTd = tr[i].getElementsByTagName('td')[5];
               if (rvolTd) {
                   let rvolVal = parseFloat(rvolTd.textContent);
                   if (rvolVal >= 3.0) {
                       tr[i].style.display = "";
                   } else {
                       tr[i].style.display = "none";
                   }
               }
           }
           showNotification('تم تصفية الأسهم ذات الـ RVOL العالي (>= 3.0x)');
       }

       // Calculator function
       function calculateMetrics() {
           let total = parseFloat(document.getElementById('totalShares').value) || 0;
           let locked = parseFloat(document.getElementById('lockedPercent').value) || 0;
           let vol = parseFloat(document.getElementById('dailyVolume').value) || 0;
           let avgVol = parseFloat(document.getElementById('avgVolume').value) || 1;

           let freeFloat = total * (1 - (locked / 100));
           let rotation = (vol / (freeFloat || 1)) * 100;
           let rvol = vol / avgVol;

           document.getElementById('resFloat').innerText = (freeFloat / 1000000).toFixed(1) + 'M';
           document.getElementById('resRotation').innerText = rotation.toFixed(1) + '%';
           document.getElementById('resRvol').innerText = rvol.toFixed(1) + 'x';

           showNotification('تم حساب الـ Free Float و الـ RVOL بنجاح!');
       }
   </script>


   <script src="{{ asset('front/assets/js/tailwind.config.js') }}"></script>
