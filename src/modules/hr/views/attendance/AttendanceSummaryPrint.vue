<template>
  <div class="print-landscape-container bg-white text-black p-6 font-sans mx-auto" dir="rtl">
    <div
      class="print:hidden flex justify-end gap-3 mb-6 bg-gray-50 border border-gray-200 p-3 rounded-xl"
    >
      <button
        @click="printReport"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors text-sm"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
          />
        </svg>
        طباعة التقرير الفورية
      </button>
    </div>

    <div class="flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
      <div class="flex items-center gap-4">
        <img src="/MainLogo2.png" alt="Logo" class="w-14 h-14 object-contain" />
        <div>
          <h1 class="text-xl font-black text-gray-900 tracking-tight">
            نظام إدارة الموارد البشرية
          </h1>
          <p class="text-sm font-bold text-gray-600">
            تقرير خلاصة الحضور والانصراف وإجمالي الساعات
          </p>
        </div>
      </div>
      <div class="text-left text-xs font-medium text-gray-500 border-r-2 border-gray-200 pr-4">
        <p>تاريخ النطاق المفلتر: {{ filterPeriodText }}</p>
        <p>تاريخ الاستخراج: {{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>

    <div class="w-full mb-8">
      <table class="w-full text-right border-collapse table-auto text-xs">
        <thead>
          <tr class="bg-gray-100 text-gray-900 font-bold border-b-2 border-gray-400">
            <th class="p-2 border border-gray-300 w-16 text-center">كود</th>
            <th class="p-2 border border-gray-300">اسم الموظف</th>
            <th class="p-2 border border-gray-300">القسم</th>
            <th class="p-2 border border-gray-300 text-center text-emerald-800 font-bold">
              أيام الحضور
            </th>
            <th class="p-2 border border-gray-300 text-center text-amber-700 font-bold">
              أيام التأخير
            </th>
            <th class="p-2 border border-gray-300 text-center text-rose-800 font-bold">
              أيام الغياب
            </th>
            <th class="p-2 border border-gray-300 text-center text-blue-800 font-bold">الإجازات</th>
            <th class="p-2 border border-gray-300 text-center font-black">
              إجمالي الساعات الفعلية
            </th>
            <th class="p-2 border border-gray-300 text-center text-amber-900">
              إجمالي دقائق التأخير
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in reportData"
            :key="row.employee_id"
            class="border-b border-gray-300 break-inside-avoid"
          >
            <td class="p-2 border border-gray-300 text-center font-mono font-bold bg-gray-50">
              {{ row.employee_number }}
            </td>
            <td class="p-2 border border-gray-300 font-bold text-gray-900">
              {{ row.full_name }}
            </td>
            <td class="p-2 border border-gray-300 text-gray-600">
              {{ row.department_name }}
            </td>
            <td class="p-2 border border-gray-300 text-center font-bold text-emerald-700">
              {{ row.summary.present_days }}
            </td>
            <td class="p-2 border border-gray-300 text-center font-bold text-amber-600">
              {{ row.summary.late_days }}
            </td>
            <td class="p-2 border border-gray-300 text-center font-bold text-rose-700">
              {{ row.summary.absent_days }}
            </td>
            <td class="p-2 border border-gray-300 text-center font-bold text-blue-700">
              {{ row.summary.leave_days }}
            </td>
            <td
              class="p-2 border border-gray-300 text-center font-black text-gray-900 bg-gray-50/50"
            >
              {{ row.hours.total_work_hours_formatted }}
              <span class="text-[10px] text-gray-500 block font-normal font-mono">
                ({{ row.hours.total_work_hours_decimal }} ساعة)
              </span>
            </td>
            <td class="p-2 border border-gray-300 text-center font-mono text-amber-800">
              {{ row.hours.total_delay_formatted }}
            </td>
          </tr>
          <tr v-if="!reportData || !reportData.length">
            <td colspan="9" class="p-4 text-center text-gray-500">
              لا توجد بيانات حضور مجمعة للطباعة.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="mt-12 grid grid-cols-3 gap-6 text-center pt-6 border-t border-gray-200 break-inside-avoid"
    >
      <div class="space-y-10">
        <p class="font-bold text-gray-800 text-xs">مسؤول إدارة الوقت والحضور</p>
        <div class="border-b border-gray-400 w-36 mx-auto"></div>
      </div>
      <div class="space-y-10">
        <p class="font-bold text-gray-800 text-xs">مدير الموارد البشرية</p>
        <div class="border-b border-gray-400 w-36 mx-auto"></div>
      </div>
      <div class="space-y-10">
        <p class="font-bold text-gray-800 text-xs">اعتماد الإدارة العامة</p>
        <div class="border-b border-gray-400 w-36 mx-auto"></div>
      </div>
    </div>

    <div
      class="print-footer fixed bottom-0 left-0 w-full text-center text-[10px] text-gray-400 border-t border-gray-200 pt-1 bg-white hidden print:block"
    >
      صفحة <span class="page-number"></span> | Panda ERP
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// --- الحالة (State) ---
const reportData = ref([])
const filterPeriodText = ref('')

// --- بيانات الوقت الحالية الاستخراج ---
const currentDate = new Date().toLocaleDateString('ar-EG')
const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

const printReport = () => {
  window.print()
}

// --- استرجاع وتجهيز البيانات المؤقتة عند التحميل ---
onMounted(() => {
  const savedData = sessionStorage.getItem('printAttendanceSummaryData')
  const savedFilters = sessionStorage.getItem('printAttendanceFilters')

  if (savedData) {
    try {
      reportData.value = JSON.parse(savedData)

      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters)
        filterPeriodText.value = `من ${parsedFilters.start_date} إلى ${parsedFilters.end_date}`
      } else {
        filterPeriodText.value = 'اليوم الحالي'
      }

      // تأخير فتح شاشة طباعة المتصفح لضمان اكتمال بناء الـ DOM
      setTimeout(() => {
        window.print()
      }, 800)
    } catch (e) {
      console.error('خطأ أثناء معالجة بيانات الحضور المخزنة للطباعة', e)
    }
  }
})
</script>
<style scoped>
/* ==========================================================================
   1. التنسيق على الشاشة (Screen View Only)
   ========================================================================== */
.print-landscape-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white !important;
  color: black !important;
  z-index: 999999;
  overflow-y: auto;
  padding: 24px;
}

/* ==========================================================================
   2. الحل الهندسي الجذري للطباعة (Ultimate Print Isolation)
   ========================================================================== */
@media print {
  @page {
    size: A4 landscape; /* فرض أبعاد الورقة العريضة القياسية */
    margin: 8mm;
  }

  /* أ- تصفير كلي لخلفيات الحاويات العليا للمشروع مهما كانت مسمياتها */
  :global(html),
  :global(body),
  :global(#app),
  :global(main) {
    background: white !important;
    background-color: white !important;
    color: black !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  /* ب- إخفاء كافة القوائم، الترويسات، والجنبات الخاصة بالـ ERP كلياً وبقوة */
  :global(nav),
  :global(aside),
  :global(header),
  :global([class*='sidebar']),
  :global([class*='navbar']),
  :global([class*='layout']) {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
  }

  /* ج- إخفاء كل عنصر داخل الـ body لحماية الورقة من التسريب */
  :global(body *) {
    visibility: hidden !important;
  }

  /* د- إجبار حاوية التقرير الحالية وعناصرها الداخلية فقط على العودة للظهور */
  .print-landscape-container,
  .print-landscape-container * {
    visibility: visible !important;
  }

  /* هـ- نزع الحاوية وتثبيتها في النقطة صفر المطلقة للورقة الفيزيائية وتمديدها */
  .print-landscape-container {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }

  /* و- إخفاء أزرار التحكم الداخلية أثناء الطباعة */
  .print\:hidden {
    display: none !important;
  }
}

/* ==========================================================================
   3. تنسيقات الجداول والصفحات
   ========================================================================== */
table {
  border-spacing: 0;
  width: 100%;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
