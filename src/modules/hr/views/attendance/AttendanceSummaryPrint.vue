<!---src\modules\hr\views\attendance\AttendanceSummaryPrint.vue--->
<template>
  <div
    class="print-landscape-container bg-slate-50 text-slate-900 p-8 font-sans mx-auto relative overflow-hidden"
    dir="rtl"
  >
    <div class="absolute bottom-0 right-0 w-full h-24 pointer-events-none hidden print:block z-0">
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" class="w-full h-full">
        <path
          fill="url(#footer-wave-smooth)"
          fill-opacity="1"
          d="M0,256L120,240C240,224,480,192,720,192C960,192,1200,224,1320,240L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
        <defs>
          <linearGradient id="footer-wave-smooth" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1e40af" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#312e81" stop-opacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <div
      class="print:hidden flex justify-end gap-3 mb-8 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative z-10"
    >
      <button
        @click="printReport"
        class="bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all text-sm shadow-md shadow-blue-500/10 hover:scale-[1.01]"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
          />
        </svg>
        تصدير وطباعة التقرير الفنية
      </button>
    </div>

    <div
      class="artistic-header-banner relative z-10 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl mb-8 flex justify-between items-center gap-6 overflow-hidden border border-blue-800/40"
    >
      <div class="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div class="flex items-center gap-5 z-10 whitespace-nowrap">
        <div
          class="w-24 h-24 bg-white rounded-2xl shadow-xl border border-white/30 flex-shrink-0 flex items-center justify-center logo-holder p-1"
        >
          <img
            :src="brandingStore.logoMiniUrl || '/MainLogo2.png'"
            :alt="brandingStore.appName"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 class="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            {{ brandingStore.appName || 'محطة مياه المنارة' }}
          </h1>
        </div>
      </div>

      <div class="text-center z-10 px-6 py-1 border-r border-l border-white/10">
        <h2 class="text-2xl font-black text-white tracking-tight drop-shadow-md">
          تقرير الحضور والانصراف
        </h2>
        <p class="text-xs font-medium text-blue-200/70 mt-1">
          سجل الحركات الإجمالية وساعات العمل الفعلية للموظفين
        </p>
      </div>

      <div class="flex flex-col gap-1.5 items-end z-10 min-w-[320px] whitespace-nowrap">
        <div class="flex flex-row gap-1.5 flex-wrap justify-end">
          <div
            v-if="activeFilters.department_name"
            class="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg text-[10px]"
          >
            <span class="text-blue-200 font-normal">القسم:</span>
            <span class="font-bold text-white">{{ activeFilters.department_name }}</span>
          </div>

          <div
            v-if="activeFilters.position_name"
            class="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg text-[10px]"
          >
            <span class="text-blue-200 font-normal">الوظيفة:</span>
            <span class="font-bold text-white">{{ activeFilters.position_name }}</span>
          </div>

          <div
            v-if="activeFilters.search"
            class="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg text-[10px]"
          >
            <span class="text-blue-200 font-normal">بحث عن:</span>
            <span class="font-bold text-amber-300 font-mono">"{{ activeFilters.search }}"</span>
          </div>
        </div>

        <div
          class="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl shadow-inner"
        >
          <span class="text-blue-200 text-[10px] font-medium">نطاق الفلترة:</span>
          <span class="font-black text-amber-300 font-mono text-[11px] tracking-wide">
            {{ filterPeriodText }}
          </span>
        </div>

        <div
          class="flex items-center gap-2 bg-slate-950/40 border border-white/5 px-3 py-0.5 rounded-lg text-[10px] text-slate-300"
        >
          <span>تاريخ التصدير:</span>
          <span class="font-mono text-white font-bold">{{ currentDate }}</span>
          <span class="text-white/20">|</span>
          <span class="font-mono text-white font-bold">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <div
      class="relative z-10 w-full mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white"
    >
      <table class="w-full text-right border-collapse table-auto text-xs print-table">
        <thead>
          <tr
            class="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white font-bold text-[11px] uppercase tracking-wide border-none"
          >
            <th class="p-3.5 text-center w-24 font-bold border-l border-slate-800/40">كود</th>
            <th class="p-3.5 text-right font-bold border-l border-slate-800/40">
              اسم الموظف الفني
            </th>
            <th class="p-3.5 text-right font-bold border-l border-slate-800/40">القسم الإداري</th>
            <th class="p-3.5 text-center font-bold bg-blue-950/40 border-l border-slate-800/40">
              أيام الحضور
            </th>
            <th class="p-3.5 text-center font-bold border-l border-slate-800/40">أيام التأخير</th>
            <th class="p-3.5 text-center font-bold bg-blue-950/40 border-l border-slate-800/40">
              أيام الغياب
            </th>
            <th class="p-3.5 text-center font-bold border-l border-slate-800/40">الإجازات</th>
            <th
              class="p-3.5 text-center font-black bg-gradient-to-b from-blue-950/60 to-blue-900/60 w-44 border-l border-slate-800/40"
            >
              إجمالي الساعات الفعلية
            </th>
            <th class="p-3.5 text-center font-bold">إجمالي دقائق التأخير</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in reportData"
            :key="row.employee_id"
            class="border-b border-slate-200 odd:bg-slate-50/30 hover:bg-slate-100/40 transition-colors break-inside-avoid"
          >
            <td
              class="p-3 border-l border-slate-200 text-center font-mono font-bold bg-slate-50 text-slate-800 whitespace-nowrap"
            >
              {{ row.employee_number }}
            </td>
            <td class="p-3 border-l border-slate-200 font-bold text-slate-900 text-[13px]">
              {{ row.full_name }}
            </td>
            <td class="p-3 border-l border-slate-200 text-slate-600 font-semibold text-xs">
              {{ row.department_name }}
            </td>
            <td
              class="p-3 border-l border-slate-200 text-center font-bold text-emerald-700 bg-emerald-50/10 text-sm"
            >
              {{ row.summary.present_days }}
            </td>
            <td class="p-3 border-l border-slate-200 text-center font-bold text-amber-600">
              {{ row.summary.late_days }}
            </td>
            <td
              class="p-3 border-l border-slate-200 text-center font-bold text-rose-600 bg-rose-50/10 text-sm"
            >
              {{ row.summary.absent_days }}
            </td>
            <td class="p-3 border-l border-slate-200 text-center font-bold text-blue-600">
              {{ row.summary.leave_days }}
            </td>
            <td
              class="p-3 border-l border-slate-200 text-center font-black text-slate-950 bg-blue-50/20"
            >
              <span class="text-sm block text-blue-900 tracking-tight font-mono">{{
                row.hours.total_work_hours_formatted
              }}</span>
              <span class="text-[9px] text-slate-400 font-normal font-mono block mt-0.5">
                ({{ row.hours.total_work_hours_decimal }} ساعة)
              </span>
            </td>
            <td class="p-3 text-center font-mono text-amber-900 font-bold text-sm bg-amber-50/10">
              {{ row.hours.total_delay_formatted }}
            </td>
          </tr>
          <tr v-if="!reportData || !reportData.length">
            <td colspan="9" class="p-8 text-center text-slate-400 font-medium bg-slate-50 text-sm">
              لا توجد بيانات حضور مجمعة للطباعة حالياً.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="relative z-10 mt-16 grid grid-cols-3 gap-8 text-center pt-8 border-t border-slate-200 break-inside-avoid"
    >
      <div class="space-y-10">
        <p class="font-bold text-slate-800 text-xs tracking-wide">مسؤول إدارة الوقت والحضور</p>
        <div class="space-y-1 text-[11px] text-slate-400">
          <div class="border-b border-slate-200 w-44 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>
      <div class="space-y-10">
        <p class="font-bold text-slate-800 text-xs tracking-wide">مدير الموارد البشرية</p>
        <div class="space-y-1 text-[11px] text-slate-400">
          <div class="border-b border-slate-200 w-44 mx-auto"></div>
          <p>التوقيع: ........................</p>
        </div>
      </div>
      <div class="space-y-10">
        <p class="font-bold text-slate-800 text-xs tracking-wide">اعتماد الإدارة العامة</p>
        <div class="space-y-1 text-[11px] text-slate-400">
          <div class="border-b border-slate-200 w-44 mx-auto"></div>
          <p>الختم الرسمي: ........................</p>
        </div>
      </div>
    </div>

    <div
      class="print-footer fixed bottom-0 left-0 w-full text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2 bg-white hidden print:block"
    >
      صفحة <span class="page-number"></span> | {{ brandingStore.appName || 'Panda ERP' }} - نظام
      إدارة الوقت الموحد
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
   1. التنسيق الخارجي وعرض الشاشة السلس
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
  padding: 40px;
}

.artistic-header-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e1b4b 100%) !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.logo-holder {
  box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.25);
}

/* ==========================================================================
   2. قواعد هندسة الـ PDF لفرض التدرجات اللونية والأشكال
   ========================================================================== */
@media print {
  @page {
    size: A4 landscape;
    margin: 12mm 10mm 15mm 10mm;
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

  .artistic-header-banner {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e1b4b 100%) !important;
  }

  .print-table th {
    background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #1e1b4b 100%) !important;
    color: #ffffff !important;
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
