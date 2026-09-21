<!---src\modules\hr\views\attendance\AttendanceSummaryPrint.vue--->
<template>
  <div
    class="print-landscape-container bg-slate-50 text-slate-900 p-6 font-sans mx-auto relative overflow-hidden"
    dir="rtl"
  >
    <!-- شريط الإجراءات العلوي (يختفي عند الطباعة) -->
    <div
      class="print:hidden flex justify-between items-center mb-5 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm relative z-10"
    >
      <div class="flex items-center gap-2 text-xs text-slate-600">
        <span class="font-bold text-slate-800">تلميح الطباعة:</span>
        <span>
          تم تقليص ارتفاع الأسطر وتنسيق ساعات العمل رقمياً لمنع التشتت وتوفير الحبر والورق.
        </span>
      </div>

      <button
        @click="printReport"
        class="bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 transition-all text-xs shadow-md shadow-blue-500/10 hover:scale-[1.01]"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
          />
        </svg>
        تصدير وطباعة التقرير
      </button>
    </div>

    <!-- الترويسة الفنية (داكنة على الشاشة - بيضاء رسمية مدمجة عند الطباعة) -->
    <div
      class="artistic-header-banner relative z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-4 rounded-xl shadow-lg mb-4 flex justify-between items-center gap-4 overflow-hidden border border-blue-800/40"
    >
      <div class="flex items-center gap-3.5 z-10 whitespace-nowrap">
        <div
          class="w-16 h-16 bg-white rounded-xl shadow-md border border-white/30 flex-shrink-0 flex items-center justify-center logo-holder p-1"
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

      <div
        class="text-center z-10 px-5 py-0.5 border-r border-l border-white/10 header-center-divider"
      >
        <h2 class="text-lg font-black text-white tracking-tight drop-shadow-md header-doc-title">
          تقرير الحضور والانصراف التجميعي
        </h2>
        <p class="text-[10px] font-medium text-blue-200/70 mt-0.5 header-doc-desc">
          سجل الحركات الإجمالية وساعات العمل الفعلية للموظفين
        </p>
      </div>

      <div class="flex flex-col gap-1 items-end z-10 min-w-[280px] whitespace-nowrap text-xs">
        <div class="flex flex-row gap-1 flex-wrap justify-end">
          <div
            v-if="activeFilters.department_name"
            class="filter-badge flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg text-[10px]"
          >
            <span class="text-blue-200 font-normal badge-label">القسم:</span>
            <span class="font-bold text-white">{{ activeFilters.department_name }}</span>
          </div>

          <div
            v-if="activeFilters.position_name"
            class="filter-badge flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg text-[10px]"
          >
            <span class="text-blue-200 font-normal badge-label">الوظيفة:</span>
            <span class="font-bold text-white">{{ activeFilters.position_name }}</span>
          </div>

          <div
            v-if="activeFilters.search"
            class="filter-badge flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg text-[10px]"
          >
            <span class="text-blue-200 font-normal badge-label">بحث عن:</span>
            <span class="font-bold text-amber-300 font-mono">"{{ activeFilters.search }}"</span>
          </div>
        </div>

        <div
          class="filter-badge flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg shadow-inner"
        >
          <span class="text-blue-200 text-[10px] font-medium badge-label">نطاق الفلترة:</span>
          <span class="font-black text-amber-300 font-mono text-[10px] tracking-wide badge-value">
            {{ filterPeriodText }}
          </span>
        </div>

        <div
          class="export-time-badge flex items-center gap-1.5 bg-slate-950/40 border border-white/5 px-2 py-0.5 rounded text-[9px] text-slate-300"
        >
          <span>تاريخ التصدير:</span>
          <span class="font-mono text-white font-bold">{{ currentDate }}</span>
          <span class="text-white/20">|</span>
          <span class="font-mono text-white font-bold">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- جدول البيانات التجميعية المضغوط والمرتب -->
    <div
      class="relative z-10 w-full mb-6 rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white"
    >
      <table class="w-full text-right border-collapse table-auto text-xs print-table">
        <thead>
          <tr
            class="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white font-bold text-[10.5px] uppercase tracking-wide border-none table-head-row"
          >
            <th class="py-2 px-2 text-center w-28 font-bold border-l border-slate-800/40">كود</th>
            <th class="py-2 px-3 text-right font-bold border-l border-slate-800/40">
              اسم الموظف الفني
            </th>
            <th class="py-2 px-2 text-right font-bold border-l border-slate-800/40">
              القسم الإداري
            </th>
            <th
              class="py-2 px-2 text-center font-bold bg-blue-950/40 border-l border-slate-800/40 w-16"
            >
              أيام الحضور
            </th>
            <th class="py-2 px-2 text-center font-bold border-l border-slate-800/40 w-16">
              أيام التأخير
            </th>
            <th
              class="py-2 px-2 text-center font-bold bg-blue-950/40 border-l border-slate-800/40 w-16"
            >
              أيام الغياب
            </th>
            <th class="py-2 px-2 text-center font-bold border-l border-slate-800/40 w-16">
              الإجازات
            </th>
            <th
              class="py-2 px-2 text-center font-black bg-gradient-to-b from-blue-950/60 to-blue-900/60 w-32 border-l border-slate-800/40"
            >
              إجمالي الساعات
            </th>
            <th class="py-2 px-2 text-center font-bold w-28">إجمالي التأخير</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in reportData"
            :key="row.employee_id"
            class="border-b border-slate-200 odd:bg-slate-50/30 hover:bg-slate-100/40 transition-colors break-inside-avoid"
          >
            <td
              class="py-1 px-2 border-l border-slate-200 text-center font-mono font-bold bg-slate-50/80 text-slate-800 whitespace-nowrap text-[11px]"
            >
              {{ row.employee_number }}
            </td>
            <td class="py-1 px-3 border-l border-slate-200 font-bold text-slate-900 text-xs">
              {{ row.full_name }}
            </td>
            <td
              class="py-1 px-2 border-l border-slate-200 text-slate-600 font-semibold text-[11px]"
            >
              {{ row.department_name }}
            </td>
            <td
              class="py-1 px-2 border-l border-slate-200 text-center font-bold text-emerald-700 bg-emerald-50/10 text-xs font-mono"
            >
              {{ row.summary.present_days }}
            </td>
            <td
              class="py-1 px-2 border-l border-slate-200 text-center font-bold text-amber-600 font-mono text-xs"
            >
              {{ row.summary.late_days }}
            </td>
            <td
              class="py-1 px-2 border-l border-slate-200 text-center font-bold text-rose-600 bg-rose-50/10 text-xs font-mono"
            >
              {{ row.summary.absent_days }}
            </td>
            <td
              class="py-1 px-2 border-l border-slate-200 text-center font-bold text-blue-600 font-mono text-xs"
            >
              {{ row.summary.leave_days }}
            </td>

            <!-- عمود ساعات العمل المحسن والواضح بنظام الأرقام المريحة للعين -->
            <td
              class="py-1 px-2 border-l border-slate-200 text-center font-mono font-bold whitespace-nowrap bg-blue-50/20"
            >
              <span
                v-if="Number(row.hours?.total_work_hours_decimal) > 0"
                class="text-blue-900 text-xs"
              >
                {{ Number(row.hours.total_work_hours_decimal).toFixed(2) }}
                <span class="text-[10px] font-sans text-slate-500 font-normal">س</span>
              </span>
              <span v-else class="text-slate-300 font-normal">-</span>
            </td>

            <!-- عمود دقائق التأخير المنظم -->
            <td
              class="py-1 px-2 text-center font-mono font-bold text-[11px] whitespace-nowrap bg-amber-50/10"
            >
              <span
                v-if="
                  row.hours?.total_delay_formatted && row.hours.total_delay_formatted !== '0 دقيقة'
                "
                class="text-amber-900"
              >
                {{ row.hours.total_delay_formatted }}
              </span>
              <span v-else class="text-slate-300 font-normal">-</span>
            </td>
          </tr>
          <tr v-if="!reportData || !reportData.length">
            <td colspan="9" class="py-6 text-center text-slate-400 font-medium bg-slate-50 text-xs">
              لا توجد بيانات حضور مجمعة للطباعة حالياً.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- التوقيعات والاعتمادات الرسمية الثلاثية -->
    <div
      class="relative z-10 mt-6 grid grid-cols-3 gap-6 text-center pt-4 border-t border-slate-300 break-inside-avoid"
    >
      <div class="space-y-6">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">مسؤول إدارة الوقت والحضور</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-36 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>
      <div class="space-y-6">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">مدير الموارد البشرية</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-36 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>
      <div class="space-y-6">
        <p class="font-bold text-slate-800 text-[11px] tracking-wide">اعتماد الإدارة العامة</p>
        <div class="space-y-0.5 text-[10px] text-slate-400">
          <div class="border-b border-slate-300 w-36 mx-auto"></div>
          <p>الختم الرسمي: ........................</p>
        </div>
      </div>
    </div>

    <div
      class="print-footer fixed bottom-0 left-0 w-full text-center text-[9px] text-slate-400 border-t border-slate-200 pt-1 bg-white hidden print:block"
    >
      {{ brandingStore.appName || 'Panda ERP' }} - كشف الحضور والانصراف التجميعي | تاريخ الاستخراج:
      {{ currentDate }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBrandingStore } from '@/stores/brandingStore'

const brandingStore = useBrandingStore()

const reportData = ref([])
const filterPeriodText = ref('')

const activeFilters = ref({
  department_name: null,
  position_name: null,
  employment_type: null,
  search: null,
})

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

onMounted(() => {
  const savedData = sessionStorage.getItem('printAttendanceSummaryData')
  const savedFilters = sessionStorage.getItem('printAttendanceFilters')

  if (savedData) {
    try {
      reportData.value = JSON.parse(savedData)

      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters)
        filterPeriodText.value = `من ${parsedFilters.start_date} إلى ${parsedFilters.end_date}`

        activeFilters.value = {
          department_name: parsedFilters.department_name || null,
          position_name: parsedFilters.position_name || null,
          employment_type: parsedFilters.employment_type || null,
          search: parsedFilters.search || null,
        }
      } else {
        filterPeriodText.value = 'اليوم الحالي'
      }

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
   1. التنسيق الخارجي على الشاشة
   ========================================================================== */
.print-landscape-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc !important;
  color: #0f172a !important;
  z-index: 999999;
  overflow-y: auto;
  padding: 24px;
}

.artistic-header-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e1b4b 100%) !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.logo-holder {
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.2);
}

/* ==========================================================================
   2. قواعد الطباعة الذكية (توفير الحبر وضغط السطور لتوفير الورق)
   ========================================================================== */
@media print {
  @page {
    size: A4 landscape;
    margin: 8mm 6mm 8mm 6mm;
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
    background-color: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  :global(nav),
  :global(aside),
  :global(header),
  :global([class*='sidebar']),
  :global([class*='navbar']),
  :global([class*='layout']) {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  :global(body *) {
    visibility: hidden !important;
  }

  .print-landscape-container,
  .print-landscape-container * {
    visibility: visible !important;
  }

  .print-landscape-container {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
  }

  .print\:hidden {
    display: none !important;
  }

  /* تحويل الترويسة إلى بيضاء رسمية بدون إهدار حبر */
  .artistic-header-banner {
    background: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #94a3b8 !important;
    border-top: 4px solid #1e3a8a !important;
    box-shadow: none !important;
    padding: 8px 14px !important;
    margin-bottom: 10px !important;
    border-radius: 8px !important;
  }

  .logo-holder {
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    width: 48px !important;
    height: 48px !important;
  }

  .header-title,
  .header-doc-title {
    color: #0f172a !important;
    text-shadow: none !important;
    font-size: 14px !important;
  }

  .header-subtitle,
  .header-doc-desc {
    color: #475569 !important;
    font-size: 9px !important;
  }

  .header-center-divider {
    border-color: #cbd5e1 !important;
    padding: 0 12px !important;
  }

  .filter-badge {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    backdrop-filter: none !important;
    padding: 1px 6px !important;
  }

  .filter-badge span {
    color: #0f172a !important;
  }

  .filter-badge .badge-label {
    color: #475569 !important;
  }

  .filter-badge .badge-value {
    color: #1e3a8a !important;
  }

  .export-time-badge {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
    padding: 1px 6px !important;
  }

  .export-time-badge span {
    color: #0f172a !important;
  }

  /* ضغط رؤوس وخلايا الجدول لأدنى ارتفاع لاستهلاك أقل عدد من الصفحات */
  .table-head-row {
    background: #f1f5f9 !important;
  }

  .print-table th {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    border: 1px solid #94a3b8 !important;
    padding: 3px 4px !important;
    font-size: 9.5px !important;
    height: 22px !important;
  }

  .print-table td {
    border: 1px solid #cbd5e1 !important;
    padding: 1.5px 4px !important;
    font-size: 9.5px !important;
    line-height: 1.1 !important;
    height: 20px !important;
  }
}

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
