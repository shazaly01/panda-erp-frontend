<template>
  <div
    class="print-landscape-container bg-slate-50 text-slate-900 p-6 font-sans mx-auto relative overflow-hidden"
    dir="rtl"
  >
    <!-- شريط أدوات الطباعة (يختفي تماماً عند الطباعة) -->
    <div
      class="print:hidden flex justify-between items-center mb-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative z-10"
    >
      <div class="flex items-center gap-2 text-xs text-slate-600">
        <span class="font-bold text-slate-800">تلميح الطباعة:</span>
        <span>
          تم تفعيل نظام <strong>توفير الحبر الذكي</strong>؛ ستظهر الترويسة باللون الأبيض الرسمي على
          الورق مع خطوط دقيقة لتوفير 100% من حبر الخلفيات.
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="closeWindow"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          إغلاق النافذة
        </button>

        <button
          type="button"
          @click="printReport"
          class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all text-xs shadow-md shadow-blue-500/10 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
            />
          </svg>
          طباعة كشف الحضور الشهري
        </button>
      </div>
    </div>

    <!-- الترويسة الفنية (داكنة على الشاشة - بيضاء رسمية موفرة للحبر على الورق) -->
    <div
      class="artistic-header-banner relative z-10 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl mb-6 flex justify-between items-center gap-6 overflow-hidden border border-blue-900/40"
    >
      <!-- اللوجو واسم المنشأة -->
      <div class="flex items-center gap-4 z-10 whitespace-nowrap">
        <div
          class="w-20 h-20 bg-white rounded-2xl shadow-lg border border-white/20 flex-shrink-0 flex items-center justify-center p-1.5 header-logo-box"
        >
          <img
            :src="brandingStore.logoMiniUrl || '/MainLogo2.png'"
            :alt="brandingStore.appName"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 class="text-xl font-black tracking-tight text-white drop-shadow-sm header-title">
            {{ brandingStore.appName || 'محطة مياه المنارة' }}
          </h1>
          <p class="text-[11px] text-blue-200/80 mt-0.5 header-subtitle">
            نظام إدارة الموارد البشرية والوقت (Panda HR)
          </p>
        </div>
      </div>

      <!-- عنوان التقرير الأوسط -->
      <div
        class="text-center z-10 px-6 py-1 border-r border-l border-white/10 header-center-divider"
      >
        <h2 class="text-xl font-black text-white tracking-tight drop-shadow-md header-doc-title">
          كشف الحضور والانصراف الشهري المفصل
        </h2>
        <p class="text-xs font-medium text-blue-200/80 mt-1 header-doc-desc">
          خريطة التواجد الزمني وحركات البصمة لموظفي القسم
        </p>
      </div>

      <!-- بيانات القسم والفترة والتاريخ -->
      <div class="flex flex-col gap-1.5 items-end z-10 min-w-[280px] whitespace-nowrap text-xs">
        <div
          class="header-badge flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl"
        >
          <span class="text-blue-200 text-[10px] font-medium badge-label">القسم الإداري:</span>
          <span class="font-black text-amber-300 badge-value">{{
            departmentInfo.name || '---'
          }}</span>
        </div>

        <div
          class="header-badge flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl"
        >
          <span class="text-blue-200 text-[10px] font-medium badge-label">الفترة الزمنية:</span>
          <span class="font-black text-white font-mono badge-value">{{
            filterInfo.month_title || `${filterInfo.start_date} إلى ${filterInfo.end_date}`
          }}</span>
        </div>

        <div
          class="header-badge-sub flex items-center gap-2 bg-slate-950/40 border border-white/5 px-2.5 py-0.5 rounded-lg text-[10px] text-slate-300"
        >
          <span>تاريخ الطباعة:</span>
          <span class="font-mono text-white font-bold">{{ currentDate }}</span>
          <span class="text-white/20">|</span>
          <span class="font-mono text-white font-bold">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- بطاقات إحصائيات القسم المجمعة -->
    <div
      v-if="departmentSummary"
      class="relative z-10 grid grid-cols-6 gap-3 mb-6 bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm print-summary-grid"
    >
      <div class="border-l border-slate-100">
        <span class="text-[10px] text-slate-500 font-bold block mb-0.5">إجمالي الموظفين</span>
        <span class="text-base font-black text-slate-900 font-mono">{{
          departmentSummary.total_employees
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[10px] text-slate-500 font-bold block mb-0.5">أيام الحضور الكلية</span>
        <span class="text-base font-black text-emerald-700 font-mono">{{
          departmentSummary.present_days
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[10px] text-slate-500 font-bold block mb-0.5">أيام التأخير</span>
        <span class="text-base font-black text-amber-600 font-mono">{{
          departmentSummary.late_days
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[10px] text-slate-500 font-bold block mb-0.5">أيام الغياب</span>
        <span class="text-base font-black text-rose-600 font-mono">{{
          departmentSummary.absent_days
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[10px] text-slate-500 font-bold block mb-0.5">أيام الإجازات</span>
        <span class="text-base font-black text-blue-600 font-mono">{{
          departmentSummary.leave_days
        }}</span>
      </div>
      <div>
        <span class="text-[10px] text-slate-500 font-bold block mb-0.5">ساعات العمل الفعلية</span>
        <span class="text-base font-black text-indigo-900 font-mono"
          >{{ departmentSummary.total_work_hours }} س</span
        >
      </div>
    </div>

    <!-- كشوفات الموظفين (شريط الشهر لكل موظف) -->
    <div class="space-y-4">
      <div
        v-for="item in employeesList"
        :key="item.employee.id"
        class="employee-print-card bg-white border border-slate-300 rounded-xl overflow-hidden break-inside-avoid shadow-sm"
      >
        <!-- رأس بطاقة الموظف -->
        <div
          class="bg-slate-100/90 border-b border-slate-300 px-3.5 py-2 flex justify-between items-center text-xs employee-card-header"
        >
          <div class="flex items-center gap-3">
            <span class="font-bold text-slate-900 text-[13px]">{{ item.employee.full_name }}</span>
            <span
              class="px-2 py-0.5 bg-white border border-slate-300 font-mono font-bold text-[11px] text-slate-700 rounded"
            >
              {{ item.employee.employee_number }}
            </span>
            <span class="text-slate-500 text-[11px]"
              >({{ item.employee.position || 'غير محدد' }})</span
            >
          </div>

          <div class="flex items-center gap-3 font-mono text-[11px]">
            <span class="text-emerald-800 font-bold">حضور: {{ item.summary.present_days }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-amber-700 font-bold"
              >تأخير: {{ item.summary.late_days }} ({{ item.summary.total_delay_minutes }}د)</span
            >
            <span class="text-slate-300">|</span>
            <span class="text-rose-700 font-bold">غياب: {{ item.summary.absent_days }}</span>
            <span class="text-slate-300">|</span>
            <span class="text-blue-800 font-bold">إجازة: {{ item.summary.leave_days }}</span>
            <span class="text-slate-300">|</span>
            <span
              class="text-slate-950 font-black font-sans bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
            >
              {{ item.summary.total_work_hours }} س عمل
            </span>
          </div>
        </div>

        <!-- جدول أيام الشهر المصغر والمضبوط بالعرض -->
        <div class="p-2 overflow-x-auto">
          <table class="w-full text-center border-collapse text-[10px] print-table">
            <thead>
              <tr class="bg-slate-200/70 text-slate-700 font-bold">
                <th class="border border-slate-300 p-1 w-12 bg-slate-200">اليوم</th>
                <th
                  v-for="day in getMonthDays(item.records)"
                  :key="day.date"
                  :class="[
                    'border border-slate-300 p-0.5 min-w-[24px]',
                    isWeekend(day.date) ? 'bg-rose-100 text-rose-800 font-bold' : '',
                  ]"
                >
                  <span class="block text-[8px] leading-tight">{{ day.shortDayName }}</span>
                  <span class="font-mono text-[9px] block">{{ day.dayNumber }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="font-mono">
              <!-- سطر الحالة اليومية -->
              <tr>
                <td
                  class="border border-slate-300 p-1 font-sans font-bold bg-slate-100 text-slate-700 text-[9px]"
                >
                  الحالة
                </td>
                <td
                  v-for="day in getMonthDays(item.records)"
                  :key="'status-' + day.date"
                  class="border border-slate-300 p-0.5 text-[9px] font-bold"
                  :class="getStatusCellClass(day.record?.status)"
                >
                  {{ getStatusAbbr(day.record?.status) }}
                </td>
              </tr>
              <!-- سطر الساعات المنجزة -->
              <tr>
                <td
                  class="border border-slate-300 p-1 font-sans font-bold bg-slate-100 text-slate-700 text-[9px]"
                >
                  الساعات
                </td>
                <td
                  v-for="day in getMonthDays(item.records)"
                  :key="'hours-' + day.date"
                  class="border border-slate-300 p-0.5 text-[8px] text-slate-700"
                >
                  {{ day.record && day.record.work_hours > 0 ? day.record.work_hours : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="!employeesList.length"
        class="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs"
      >
        لا توجد بيانات حضور مسجلة للطباعة.
      </div>
    </div>

    <!-- قسم التوقيعات والاعتمادات الرسمية الثلاثية -->
    <div
      class="relative z-10 mt-10 grid grid-cols-3 gap-8 text-center pt-6 border-t-2 border-slate-300 break-inside-avoid"
    >
      <div class="space-y-8">
        <p class="font-bold text-slate-800 text-xs tracking-wide">مسؤول وحدة الوقت والحضور</p>
        <div class="space-y-1 text-[11px] text-slate-400">
          <div class="border-b border-slate-300 w-40 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>

      <div class="space-y-8">
        <p class="font-bold text-slate-800 text-xs tracking-wide">مدير القسم الإداري</p>
        <div class="space-y-1 text-[11px] text-slate-400">
          <div class="border-b border-slate-300 w-40 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>

      <div class="space-y-8">
        <p class="font-bold text-slate-800 text-xs tracking-wide">اعتماد مدير الموارد البشرية</p>
        <div class="space-y-1 text-[11px] text-slate-400">
          <div class="border-b border-slate-300 w-40 mx-auto"></div>
          <p>الختم الرسمي: ........................</p>
        </div>
      </div>
    </div>

    <!-- تذييل الصفحة الثابت للطباعة -->
    <div
      class="print-footer fixed bottom-0 left-0 w-full text-center text-[9px] text-slate-400 border-t border-slate-200 pt-1.5 bg-white hidden print:block"
    >
      {{ brandingStore.appName || 'Panda ERP' }} | كشف الحضور الشهري للأقسام | تاريخ الاستخراج:
      {{ currentDate }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBrandingStore } from '@/stores/brandingStore'

const brandingStore = useBrandingStore()

const departmentInfo = ref({})
const filterInfo = ref({})
const departmentSummary = ref(null)
const employeesList = ref([])

const currentDate = new Date().toLocaleDateString('ar-EG', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const currentTime = new Date().toLocaleTimeString('ar-EG', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

const printReport = () => {
  window.print()
}

const closeWindow = () => {
  window.close()
}

onMounted(() => {
  if (!brandingStore.isLoaded) {
    brandingStore.fetchBranding()
  }

  const storedData = sessionStorage.getItem('printDepartmentMonthlyData')
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      departmentInfo.value = parsed.department || {}
      filterInfo.value = parsed.filter || {}
      departmentSummary.value = parsed.department_summary || null
      employeesList.value = parsed.employees || []

      // تشغيل نافذة الطباعة بعد تمام جاهزية الصفحة
      setTimeout(() => {
        window.print()
      }, 700)
    } catch (e) {
      console.error('فشل معالجة بيانات طباعة كشف القسم:', e)
    }
  }
})

const getMonthDays = (records = []) => {
  const startDate = filterInfo.value.start_date
  const endDate = filterInfo.value.end_date
  if (!startDate || !endDate) return []

  const days = []
  const [sY, sM, sD] = startDate.split('-').map(Number)
  const [eY, eM, eD] = endDate.split('-').map(Number)

  const start = new Date(sY, sM - 1, sD)
  const end = new Date(eY, eM - 1, eD)

  const current = new Date(start)
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    const record = records.find((r) => r.date === dateStr) || null

    days.push({
      date: dateStr,
      dayNumber: current.getDate(),
      shortDayName: current.toLocaleDateString('ar-EG', { weekday: 'narrow' }),
      record,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
}

const isWeekend = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.getDay() === 5 // الجمعة
}

const getStatusAbbr = (status) => {
  const map = {
    present: 'ح',
    late: 'ت',
    absent: 'غ',
    on_leave: 'إ',
  }
  return map[status] || '-'
}

const getStatusCellClass = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-50 text-emerald-800'
    case 'late':
      return 'bg-amber-50 text-amber-800'
    case 'absent':
      return 'bg-rose-50 text-rose-800'
    case 'on_leave':
      return 'bg-blue-50 text-blue-800'
    default:
      return 'text-slate-300'
  }
}
</script>

<style scoped>
.print-landscape-container {
  min-height: 100vh;
  width: 100%;
}

.employee-print-card {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* =========================================================
   قواعد الطباعة الذكية لتوفير الحبر وضمان جودة الوثيقة الورقية
   ========================================================= */
@media print {
  @page {
    size: A4 landscape;
    margin: 8mm 6mm 10mm 6mm;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  :global(html),
  :global(body),
  :global(#app),
  :global(main) {
    background: #ffffff !important;
    color: #0f172a !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  :global(nav),
  :global(aside),
  :global(header),
  :global([class*='sidebar']),
  :global([class*='navbar']) {
    display: none !important;
  }

  .print\:hidden {
    display: none !important;
  }

  .print-landscape-container {
    padding: 0 !important;
    background: #ffffff !important;
  }

  /* 🌟 تحويل الترويسة من داكنة إلى بيضاء رسمية موفرة للحبر بنسبة 100% */
  .artistic-header-banner {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #94a3b8 !important;
    border-top: 5px solid #1e3a8a !important; /* شريط كحلي نحيف وراقٍ جداً */
    box-shadow: none !important;
    padding: 12px 16px !important;
    margin-bottom: 12px !important;
  }

  .header-logo-box {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
  }

  .header-title,
  .header-doc-title {
    color: #0f172a !important;
    text-shadow: none !important;
  }

  .header-subtitle,
  .header-doc-desc {
    color: #475569 !important;
  }

  .header-center-divider {
    border-color: #cbd5e1 !important;
  }

  /* تحويل صناديق المعلومات الجانبية لخلفيات رمادية فاتحة بدون حبر */
  .header-badge {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    backdrop-filter: none !important;
  }

  .header-badge-sub {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
  }

  .badge-label {
    color: #475569 !important;
  }

  .badge-value {
    color: #0f172a !important;
  }

  .header-badge .text-amber-300 {
    color: #1e3a8a !important; /* تحويل اللون الأصفر إلى كحلي غامق واضح جداً على الورق */
  }

  .employee-card-header {
    background: #f1f5f9 !important;
    border-bottom: 1px solid #cbd5e1 !important;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #94a3b8 !important;
  }

  .print-summary-grid {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
  }
}
</style>
