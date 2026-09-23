<template>
  <div
    class="print-landscape-container bg-slate-50 text-slate-900 p-4 sm:p-6 font-sans mx-auto print:p-0 print:m-0 print:w-full print:bg-white"
    dir="rtl"
  >
    <!-- شريط أدوات الطباعة (يختفي تماماً عند الطباعة) -->
    <div
      class="print:hidden flex justify-between items-center mb-5 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm"
    >
      <div class="flex items-center gap-2 text-xs text-slate-600">
        <span class="font-bold text-slate-800">تلميح الطباعة:</span>
        <span>
          تم تفعيل نظام <strong>توفير الحبر والورق الذكي</strong>؛ تم ضغط السجلات لتوفير عدد الصفحات
          وظهور الكشف بأعلى دقة رسمية.
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
          طباعة كشف الحضور {{ isWeekly ? 'الأسبوعي' : 'الشهري' }}
        </button>
      </div>
    </div>

    <!-- الترويسة الفنية (داكنة على الشاشة - بيضاء رسمية موفرة للحبر على الورق) -->
    <div
      class="artistic-header-banner bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 rounded-2xl shadow-xl mb-4 flex justify-between items-center gap-6 border border-blue-900/40"
    >
      <!-- اللوجو واسم المنشأة -->
      <div class="flex items-center gap-3.5 whitespace-nowrap">
        <div
          class="w-16 h-16 bg-white rounded-xl shadow-lg border border-white/20 flex-shrink-0 flex items-center justify-center p-1.5 header-logo-box"
        >
          <img
            :src="brandingStore.logoMiniUrl || '/MainLogo2.png'"
            :alt="brandingStore.appName"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 class="text-lg font-black tracking-tight text-white drop-shadow-sm header-title">
            {{ brandingStore.appName || 'محطة مياه المنارة' }}
          </h1>
          <p class="text-[10px] text-blue-200/80 mt-0.5 header-subtitle">
            نظام إدارة الموارد البشرية والوقت (Panda HR)
          </p>
        </div>
      </div>

      <!-- عنوان التقرير الأوسط -->
      <div class="text-center px-6 py-1 border-r border-l border-white/10 header-center-divider">
        <h2 class="text-lg font-black text-white tracking-tight drop-shadow-md header-doc-title">
          كشف الحضور والانصراف {{ isWeekly ? 'الأسبوعي' : 'الشهري' }} المفصل
        </h2>
        <p class="text-[11px] font-medium text-blue-200/80 mt-0.5 header-doc-desc">
          خريطة التواجد الزمني وحركات البصمة لموظفي القسم
        </p>
      </div>

      <!-- بيانات القسم والفترة والتاريخ -->
      <div class="flex flex-col gap-1 items-end min-w-[260px] whitespace-nowrap text-xs">
        <div
          class="header-badge flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg"
        >
          <span class="text-blue-200 text-[10px] font-medium badge-label">القسم:</span>
          <span class="font-black text-amber-300 badge-value">{{
            departmentInfo.name || '---'
          }}</span>
        </div>

        <div
          class="header-badge flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg"
        >
          <span class="text-blue-200 text-[10px] font-medium badge-label">الفترة:</span>
          <span class="font-black text-white font-mono badge-value">{{
            filterInfo.period_title ||
            filterInfo.month_title ||
            `${filterInfo.start_date} إلى ${filterInfo.end_date}`
          }}</span>
        </div>

        <div
          class="header-badge-sub flex items-center gap-1.5 bg-slate-950/40 border border-white/5 px-2 py-0.5 rounded text-[9px] text-slate-300"
        >
          <span>تاريخ الطباعة:</span>
          <span class="font-mono text-white font-bold">{{ currentDate }}</span>
          <span class="text-white/20">|</span>
          <span class="font-mono text-white font-bold">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- بطاقات إحصائيات القسم المجمعة (رشيقة الارتفاع) -->
    <div
      v-if="departmentSummary"
      class="grid grid-cols-6 gap-2 mb-3 bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-sm print-summary-grid"
    >
      <div class="border-l border-slate-100">
        <span class="text-[9px] text-slate-500 font-bold block">إجمالي الموظفين</span>
        <span class="text-sm font-black text-slate-900 font-mono">{{
          departmentSummary.total_employees
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[9px] text-slate-500 font-bold block">أيام الحضور</span>
        <span class="text-sm font-black text-emerald-700 font-mono">{{
          departmentSummary.present_days
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[9px] text-slate-500 font-bold block">أيام التأخير</span>
        <span class="text-sm font-black text-amber-600 font-mono">{{
          departmentSummary.late_days
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[9px] text-slate-500 font-bold block">أيام الغياب</span>
        <span class="text-sm font-black text-rose-600 font-mono">{{
          departmentSummary.absent_days
        }}</span>
      </div>
      <div class="border-l border-slate-100">
        <span class="text-[9px] text-slate-500 font-bold block">أيام الإجازات</span>
        <span class="text-sm font-black text-blue-600 font-mono">{{
          departmentSummary.leave_days
        }}</span>
      </div>
      <div>
        <span class="text-[9px] text-slate-500 font-bold block">ساعات العمل</span>
        <span class="text-sm font-black text-indigo-900 font-mono"
          >{{ departmentSummary.total_work_hours }} س</span
        >
      </div>
    </div>

    <!-- كشوفات الموظفين المدمجة لتوفير الورق -->
    <div class="space-y-2 print:space-y-1.5">
      <div
        v-for="item in employeesList"
        :key="item.employee.id"
        class="employee-print-card bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm"
      >
        <!-- رأس بطاقة الموظف المدمج والمضغوط -->
        <div
          class="bg-slate-100/90 border-b border-slate-300 px-3 py-1 flex justify-between items-center text-xs employee-card-header leading-tight"
        >
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-[11px]">{{ item.employee.full_name }}</span>
            <span
              class="px-1.5 py-0.2 bg-white border border-slate-300 font-mono font-bold text-[9px] text-slate-700 rounded"
            >
              {{ item.employee.employee_number }}
            </span>
            <span class="text-slate-500 text-[9px]"
              >({{ item.employee.position || 'غير محدد' }})</span
            >
          </div>

          <div class="flex items-center gap-2 font-mono text-[9px]">
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
              class="text-slate-950 font-black font-sans bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200"
            >
              {{ item.summary.total_work_hours }} س
            </span>
          </div>
        </div>

        <!-- 🌟 النمط الأسبوعي: جدول مضغوط وأنيق جداً يجمع البيانات في مساحة رأسية صغيرة -->
        <div v-if="isWeekly" class="p-1">
          <table class="w-full text-center border-collapse print-table">
            <thead>
              <tr class="bg-slate-100 text-slate-700 font-bold text-[9px]">
                <th
                  v-for="day in getPeriodDays(item.records)"
                  :key="day.date"
                  :class="[
                    'border border-slate-300 px-1 py-0.5 w-[14.28%]',
                    isWeekend(day.date) ? 'bg-rose-50 text-rose-800 font-black' : '',
                  ]"
                >
                  <div class="flex items-center justify-center gap-1 leading-tight">
                    <span class="font-black">{{ day.dayName }}</span>
                    <span class="font-mono text-[8px] text-slate-500 font-normal"
                      >({{ day.formattedDate }})</span
                    >
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  v-for="day in getPeriodDays(item.records)"
                  :key="'cell-' + day.date"
                  class="border border-slate-300 px-1 py-1 text-[9px] align-middle"
                  :class="isWeekend(day.date) && !day.record ? 'bg-slate-50/40' : 'bg-white'"
                >
                  <div
                    v-if="day.record"
                    class="flex flex-col items-center justify-center gap-0.5 leading-tight"
                  >
                    <!-- سطر الحالة + الساعات -->
                    <div class="flex items-center justify-between w-full px-1">
                      <span
                        class="px-1 py-0.2 rounded text-[8px] font-black inline-block"
                        :class="getStatusBadgeClass(day.record.status)"
                      >
                        {{ formatStatus(day.record.status) }}
                      </span>
                      <span class="text-[8.5px] font-black font-mono text-indigo-900">
                        {{ day.record.work_hours > 0 ? `${day.record.work_hours}س` : '-' }}
                      </span>
                    </div>

                    <!-- وقت الدخول والخروج مضغوط وأنيق -->
                    <div
                      class="text-[8.5px] font-mono text-slate-700 w-full flex items-center justify-between px-1 border-t border-slate-100 pt-0.5"
                    >
                      <span>{{ day.record.check_in || '--:--' }}</span>
                      <span class="text-slate-300 text-[7px]">→</span>
                      <span>{{ day.record.check_out || '--:--' }}</span>
                    </div>

                    <!-- إشعار التأخير إن وجد -->
                    <div
                      v-if="day.record.delay_minutes > 0"
                      class="text-[7.5px] font-bold text-amber-700 bg-amber-50 rounded px-1 w-full text-center leading-tight"
                    >
                      تأخير {{ day.record.delay_minutes }}د
                    </div>
                  </div>

                  <div v-else class="py-1 text-center text-slate-400 text-[8.5px] font-medium">
                    {{ isWeekend(day.date) ? 'عطلة' : '-' }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 🌟 النمط الشهري: جدول مصغر ومضغوط للأيام الـ 30/31 -->
        <div v-else class="p-1 overflow-x-auto">
          <table class="w-full text-center border-collapse text-[9px] print-table">
            <thead>
              <tr class="bg-slate-200/70 text-slate-700 font-bold">
                <th class="border border-slate-300 p-0.5 w-10 bg-slate-200 text-[8px]">اليوم</th>
                <th
                  v-for="day in getPeriodDays(item.records)"
                  :key="day.date"
                  :class="[
                    'border border-slate-300 p-0.5 min-w-[22px]',
                    isWeekend(day.date) ? 'bg-rose-100 text-rose-800 font-bold' : '',
                  ]"
                >
                  <span class="block text-[7.5px] leading-tight">{{ day.shortDayName }}</span>
                  <span class="font-mono text-[8.5px] block">{{ day.dayNumber }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="font-mono text-[8.5px]">
              <tr>
                <td
                  class="border border-slate-300 p-0.5 font-sans font-bold bg-slate-100 text-slate-700 text-[8px]"
                >
                  الحالة
                </td>
                <td
                  v-for="day in getPeriodDays(item.records)"
                  :key="'status-' + day.date"
                  class="border border-slate-300 p-0.5 font-bold"
                  :class="getStatusCellClass(day.record?.status)"
                >
                  {{ getStatusAbbr(day.record?.status) }}
                </td>
              </tr>
              <tr>
                <td
                  class="border border-slate-300 p-0.5 font-sans font-bold bg-slate-100 text-slate-700 text-[8px]"
                >
                  الساعات
                </td>
                <td
                  v-for="day in getPeriodDays(item.records)"
                  :key="'hours-' + day.date"
                  class="border border-slate-300 p-0.5 text-slate-700"
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
        class="text-center py-8 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs"
      >
        لا توجد بيانات حضور مسجلة للطباعة.
      </div>
    </div>

    <!-- قسم التوقيعات والاعتمادات الرسمية الرباعية (مرتبة من اليمين إلى اليسار) -->
    <div
      class="official-signatures mt-5 grid grid-cols-4 gap-4 text-center pt-3 border-t-2 border-slate-300"
    >
      <div class="space-y-3">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">مشرف الموارد البشرية</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-28 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>

      <div class="space-y-3">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">مدير / مشرف القسم</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-28 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>

      <div class="space-y-3">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">مدير الإدارة</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-28 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>

      <div class="space-y-3">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">المدير العام</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-28 mx-auto"></div>
          <p>الاعتماد والختم: ........................</p>
        </div>
      </div>
    </div>

    <!-- تذييل الصفحة الثابت للطباعة -->
    <div
      class="print-footer mt-2 text-center text-[8px] text-slate-400 border-t border-slate-200 pt-1 hidden print:block"
    >
      {{ brandingStore.appName || 'Panda ERP' }} | كشف الحضور
      {{ isWeekly ? 'الأسبوعي' : 'الشهري' }} للأقسام | تاريخ الاستخراج: {{ currentDate }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const isWeekly = computed(() => {
  if (filterInfo.value?.report_type === 'weekly') return true
  const startDate = filterInfo.value?.start_date
  const endDate = filterInfo.value?.end_date
  if (startDate && endDate) {
    const [sY, sM, sD] = startDate.split('-').map(Number)
    const [eY, eM, eD] = endDate.split('-').map(Number)
    const diff =
      Math.round((new Date(eY, eM - 1, eD) - new Date(sY, sM - 1, sD)) / (1000 * 60 * 60 * 24)) + 1
    return diff <= 7
  }
  return false
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

      setTimeout(() => {
        window.print()
      }, 500)
    } catch (e) {
      console.error('فشل معالجة بيانات طباعة كشف القسم:', e)
    }
  }
})

const getPeriodDays = (records = []) => {
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
      dayName: current.toLocaleDateString('ar-EG', { weekday: 'long' }),
      shortDayName: current.toLocaleDateString('ar-EG', { weekday: 'narrow' }),
      formattedDate: `${current.getMonth() + 1}/${current.getDate()}`,
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

const formatStatus = (status) => {
  const map = {
    present: 'حاضر',
    late: 'متأخر',
    absent: 'غائب',
    on_leave: 'إجازة',
  }
  return map[status] || status || '-'
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-100 text-emerald-800'
    case 'late':
      return 'bg-amber-100 text-amber-800'
    case 'absent':
      return 'bg-rose-100 text-rose-800'
    case 'on_leave':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
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

<style>
/* =========================================================
   قواعد CSS عامة غير معزولة لإلغاء السواد تماماً وفك قيود الصفحات المتعددة
   ========================================================= */
@media print {
  @page {
    size: A4 landscape;
    margin: 6mm 6mm 6mm 6mm;
  }

  /* 1. إجبار كامل العناصر على خلفية بيضاء صريحة لإلغاء أي سواد في الأجناب */
  html,
  body,
  #app,
  main {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* 2. فك قيود الارتفاع والتمرير عن جميع الحاويات لضمان طباعة جميع الصفحات */
  html,
  body,
  #app,
  #app > div,
  main,
  div {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
    position: static !important;
  }

  /* 3. إخفاء أي شريط تمرير داخلي قد يظهر في نافذة الطباعة */
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  nav,
  aside,
  header,
  [class*='sidebar'],
  [class*='navbar'] {
    display: none !important;
  }
}
</style>

<style scoped>
.print-landscape-container {
  width: 100%;
}

.employee-print-card {
  page-break-inside: avoid;
  break-inside: avoid;
}

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print\:hidden {
    display: none !important;
  }

  .print-landscape-container {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    background: #ffffff !important;
  }

  .employee-print-card {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 4px !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  .official-signatures {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .artistic-header-banner {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #94a3b8 !important;
    border-top: 4px solid #1e3a8a !important;
    box-shadow: none !important;
    padding: 8px 12px !important;
    margin-bottom: 6px !important;
  }

  .header-logo-box {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    width: 48px !important;
    height: 48px !important;
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
    color: #1e3a8a !important;
  }

  .employee-card-header {
    background: #f1f5f9 !important;
    border-bottom: 1px solid #cbd5e1 !important;
    padding-top: 2px !important;
    padding-bottom: 2px !important;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #94a3b8 !important;
    padding: 2px !important;
  }

  .print-summary-grid {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    margin-bottom: 6px !important;
    padding: 5px !important;
  }
}
</style>
