<template>
  <div class="space-y-4 printable-section">
    <div v-if="summaryLogs.length > 0 && !loading" class="flex justify-end print:hidden">
      <button
        type="button"
        @click="printReport"
        class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:bg-amber-400 active:scale-95 transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
          />
        </svg>
        طباعة التقرير (A4)
      </button>
    </div>

    <div
      class="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl print:border-none print:bg-white print:shadow-none"
    >
      <div
        v-if="loading"
        class="p-20 flex flex-col items-center justify-center space-y-4 print:hidden"
      >
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div
            class="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          ></div>
        </div>
        <p class="text-sm font-medium text-slate-400 animate-pulse">
          جاري تجميع وحساب التقارير الزمنية...
        </p>
      </div>

      <div v-else-if="summaryLogs.length === 0" class="p-16 text-center print:hidden">
        <div
          class="w-16 h-16 bg-slate-800/50 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-750"
        >
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-1">لا توجد سجلات مجمعة</h3>
        <p class="text-sm text-slate-400 max-w-sm mx-auto">
          لم يتم العثور على أي حركات بصمة للموظفين في النطاق الزمني المحدد.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <div class="hidden print:block text-center mb-6 border-b-2 border-slate-900 pb-4">
          <h2 class="text-2xl font-bold text-slate-900">تقرير خلاصة الحضور والانصراف للموظفين</h2>
          <p class="text-sm text-slate-600 mt-1">نظام Panda ERP - موديول الموارد البشرية</p>
        </div>

        <table class="w-full text-right border-collapse print:text-slate-900">
          <thead>
            <tr
              class="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-xs font-bold uppercase tracking-wider print:bg-slate-100 print:text-slate-900 print:border-slate-400"
            >
              <th class="py-4 px-6">الموظف</th>
              <th class="py-4 px-4 text-center">أيام الحضور</th>
              <th class="py-4 px-4 text-center">أيام التأخير</th>
              <th class="py-4 px-4 text-center">أيام الغياب</th>
              <th class="py-4 px-4 text-center">الإجازات</th>
              <th class="py-4 px-6 text-center">إجمالي ساعات العمل</th>
              <th class="py-4 px-6 text-center">إجمالي دقائق التأخير</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-sm print:divide-slate-300">
            <tr
              v-for="row in summaryLogs"
              :key="row.employee_id"
              class="hover:bg-slate-800/30 transition-colors duration-150 group print:bg-transparent print:text-slate-900 page-break-inside-avoid"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div
                    class="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-xs rounded-lg shrink-0 whitespace-nowrap shadow-sm group-hover:border-blue-500/40 transition-colors print:bg-slate-100 print:text-slate-900 print:border-slate-300"
                  >
                    {{ row.employee_number }}
                  </div>
                  <div>
                    <h4
                      class="font-bold text-white group-hover:text-blue-400 transition-colors print:text-slate-900"
                    >
                      {{ row.full_name }}
                    </h4>
                    <span class="text-xs text-slate-400 mt-0.5 block print:text-slate-600">{{
                      row.department_name
                    }}</span>
                  </div>
                </div>
              </td>

              <td class="py-4 px-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:bg-transparent print:text-emerald-700 print:border-none"
                >
                  {{ row.summary.present_days }} أيام
                </span>
              </td>

              <td class="py-4 px-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 print:bg-transparent print:text-amber-700 print:border-none"
                >
                  {{ row.summary.late_days }} أيام
                </span>
              </td>

              <td class="py-4 px-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 print:bg-transparent print:text-rose-700 print:border-none"
                >
                  {{ row.summary.absent_days }} أيام
                </span>
              </td>

              <td class="py-4 px-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 print:bg-transparent print:text-blue-700 print:border-none"
                >
                  {{ row.summary.leave_days }} أيام
                </span>
              </td>

              <td class="py-4 px-6 text-center font-medium text-white print:text-slate-900">
                <div class="flex flex-col items-center">
                  <span
                    class="text-sm font-bold text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.15)] print:text-slate-900 print:drop-shadow-none"
                  >
                    {{ row.hours.total_work_hours_formatted }}
                  </span>
                  <span class="text-[11px] text-slate-500 font-mono mt-0.5 print:text-slate-600">
                    ({{ row.hours.total_work_hours_decimal }} ساعة)
                  </span>
                </div>
              </td>

              <td class="py-4 px-6 text-center font-mono font-medium">
                <span
                  :class="
                    row.counters.total_delay_minutes > 0
                      ? 'text-amber-400 font-bold print:text-amber-700'
                      : 'text-slate-500 print:text-slate-400'
                  "
                >
                  {{ row.hours.total_delay_formatted }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  summaryLogs: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    required: true,
    default: false,
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  departmentName: {
    type: String,
    default: null,
  },
})

const printReport = () => {
  sessionStorage.setItem('printAttendanceSummaryData', JSON.stringify(props.summaryLogs))

  const filters = {
    start_date: props.startDate,
    end_date: props.endDate,
    department_name: props.departmentName,
  }
  sessionStorage.setItem('printAttendanceFilters', JSON.stringify(filters))

  const routeData = router.resolve({ name: 'hr.attendance.summary.print' })
  window.open(routeData.href, '_blank')
}
</script>

<style scoped>
@media print {
  :deep(body),
  html {
    background: #ffffff !important;
    color: #000000 !important;
  }

  :global(#app > div:not(.printable-section)),
  nav,
  aside,
  header {
    display: none !important;
  }

  .page-break-inside-avoid {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
