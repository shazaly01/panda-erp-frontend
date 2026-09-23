<template>
  <div class="space-y-5" dir="rtl">
    <!-- تنبيه في حال عدم اختيار قسم -->
    <div
      v-if="!departmentId"
      class="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
    >
      <div
        class="w-14 h-14 bg-slate-800 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-750"
      >
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-200 mb-1">يرجى تحديد القسم الإداري</h3>
      <p class="text-xs text-slate-400 max-w-sm mx-auto">
        لعرض كشف الحضور الأسبوعي لموظفي القسم، يرجى اختيار القسم من قائمة الفلاتر أعلاه.
      </p>
    </div>

    <!-- مؤشر التحميل -->
    <div
      v-else-if="loading"
      class="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center space-y-4"
    >
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div
          class="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        ></div>
      </div>
      <p class="text-xs font-medium text-slate-400 animate-pulse">
        جاري تجميع الخريطة الزمنية لحضور موظفي القسم...
      </p>
    </div>

    <!-- لا توجد نتائج -->
    <div
      v-else-if="filteredEmployees.length === 0"
      class="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
    >
      <div
        class="w-14 h-14 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3"
      >
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-200 mb-1">لا يوجد موظفون</h3>
      <p class="text-xs text-slate-400">
        لم يتم العثور على أي موظفين نشطين مطابقين لمعايير البحث في هذا القسم.
      </p>
    </div>

    <!-- عرض بطاقات الموظفين وأشرطة التقرير -->
    <div v-else class="space-y-5">
      <!-- شريط إجمالي القسم السريع مع محول الفترة وأدوات التحكم -->
      <div
        class="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md"
      >
        <div class="flex flex-wrap items-center gap-2.5">
          <span
            class="w-2.5 h-2.5 rounded-full animate-pulse"
            :class="isWeekly ? 'bg-indigo-500' : 'bg-emerald-500'"
          ></span>
          <span class="text-xs font-bold text-slate-300">
            القسم: <strong class="text-white">{{ reportData?.department?.name }}</strong>
          </span>
          <span class="text-slate-600">|</span>
          <span class="text-xs text-slate-400 font-mono">
            إجمالي الموظفين: {{ filteredEmployees.length }}
          </span>
          <span class="text-slate-600">|</span>
          <span
            class="text-[11px] font-bold px-2.5 py-0.5 rounded-md font-sans"
            :class="
              isWeekly
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            "
          >
            {{ isWeekly ? 'كشف أسبوعي (افتراضي)' : 'كشف شهري' }}
          </span>
          <span class="text-slate-600">|</span>
          <span class="text-xs text-slate-300 font-medium">
            {{ displayPeriodTitle }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- محوّل الفترة السريع المباشر (أسبوعي افتراضي / شهري اختياري) -->
          <div class="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              @click="setWeeklyRange"
              :class="
                isWeekly
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              "
              class="px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150"
            >
              📅 الأسبوع الحالي
            </button>
            <button
              type="button"
              @click="setMonthlyRange"
              :class="
                !isWeekly
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              "
              class="px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150"
            >
              🗓️ الشهر الحالي
            </button>
          </div>

          <!-- زر طباعة التقرير الفني المستقل -->
          <button
            type="button"
            @click="openPrintReport"
            class="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-150 active:scale-95"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z"
              />
            </svg>
            <span>طباعة كشف القسم (A4)</span>
          </button>

          <!-- تحديد عدد الموظفين في الصفحة -->
          <div class="flex items-center gap-1 text-xs text-slate-400">
            <span>عرض:</span>
            <select
              v-model.number="perPage"
              class="bg-slate-950 border border-slate-750 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
            </select>
          </div>

          <button
            type="button"
            @click="toggleAllEmployees"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
          >
            {{ allExpanded ? 'طي الجداول' : 'توسيع الكل' }}
          </button>
        </div>
      </div>

      <!-- بطاقات الموظفين (المحدودة بالصفحة الحالية فقط) -->
      <div
        v-for="item in paginatedEmployees"
        :key="item.employee.id"
        class="bg-slate-900/60 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg transition-all duration-200"
      >
        <!-- رأس البطاقة: بيانات الموظف + الملخص الزمني السريع -->
        <div
          class="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm font-mono shrink-0"
            >
              {{ item.employee.full_name.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-white text-sm">
                  {{ item.employee.full_name }}
                </h4>
                <span
                  class="px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-mono rounded border border-slate-700"
                >
                  {{ item.employee.employee_number }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ item.employee.position || 'غير محدد' }}
              </p>
            </div>
          </div>

          <!-- شارات الملخص الزمني بالأرقام -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span
              class="px-2.5 py-1 rounded-lg font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              حضور: {{ item.summary.present_days }}
            </span>
            <span
              class="px-2.5 py-1 rounded-lg font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"
            >
              تأخير: {{ item.summary.late_days }} ({{ item.summary.total_delay_minutes }} د)
            </span>
            <span
              class="px-2.5 py-1 rounded-lg font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
            >
              غياب: {{ item.summary.absent_days }}
            </span>
            <span
              class="px-2.5 py-1 rounded-lg font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"
            >
              إجازة: {{ item.summary.leave_days }}
            </span>
            <span
              class="px-2.5 py-1 rounded-lg font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono"
            >
              {{ item.summary.total_work_hours }} س
            </span>

            <button
              type="button"
              @click="toggleEmployeeDetails(item.employee.id)"
              class="mr-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="عرض/إخفاء جدول البصمات اليومي"
            >
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-180': expandedEmployees[item.employee.id] }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- الشريط الأفقي لأيام الفترة (أسبوعي افتراضياً أو شهري) -->
        <div class="p-3.5 bg-slate-900/30 overflow-x-auto scrollbar-thin">
          <table class="w-full text-center border-collapse">
            <thead>
              <tr class="text-[10px] text-slate-400 font-bold border-b border-slate-800">
                <th
                  class="p-1.5 border border-slate-800 min-w-[65px] bg-slate-950 text-slate-300 sticky right-0 z-10"
                >
                  اليوم
                </th>
                <th
                  v-for="day in getPeriodDays(item.records)"
                  :key="day.date"
                  :class="[
                    'p-1.5 border border-slate-800',
                    isWeekly ? 'min-w-[65px] sm:min-w-[80px]' : 'min-w-[36px]',
                    isWeekend(day.date) ? 'bg-rose-950/20 text-rose-400' : 'bg-slate-950/40',
                  ]"
                >
                  <span :class="isWeekly ? 'text-[10px] font-bold' : 'text-[8px]'" class="block">
                    {{ day.shortDayName }}
                  </span>
                  <span :class="isWeekly ? 'text-xs font-bold' : 'text-[11px]'" class="font-mono">
                    {{ day.dayNumber }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="text-xs font-mono">
              <!-- صف الحالات -->
              <tr>
                <td
                  class="p-1.5 border border-slate-800 font-sans font-bold text-slate-300 bg-slate-950 sticky right-0 z-10 text-[10px]"
                >
                  الحالة
                </td>
                <td
                  v-for="day in getPeriodDays(item.records)"
                  :key="'status-' + day.date"
                  class="p-1 border border-slate-800/80"
                >
                  <span
                    v-if="day.record"
                    :class="[
                      'mx-auto rounded-md flex items-center justify-center font-bold',
                      isWeekly ? 'w-7 h-7 text-[10px]' : 'w-6 h-6 text-[9px]',
                      day.record.status === 'present'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : day.record.status === 'late'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : day.record.status === 'absent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                    ]"
                    :title="formatStatusTooltip(day.record)"
                  >
                    {{ getStatusAbbr(day.record.status) }}
                  </span>
                  <span v-else class="text-slate-600 text-[10px]">-</span>
                </td>
              </tr>

              <!-- صف ساعات العمل -->
              <tr>
                <td
                  class="p-1.5 border border-slate-800 font-sans font-bold text-slate-300 bg-slate-950 sticky right-0 z-10 text-[10px]"
                >
                  الساعات
                </td>
                <td
                  v-for="day in getPeriodDays(item.records)"
                  :key="'hours-' + day.date"
                  class="p-1 border border-slate-800/80 text-[10px]"
                >
                  <span
                    v-if="day.record && day.record.work_hours > 0"
                    class="text-sky-400 font-bold"
                  >
                    {{ day.record.work_hours }}
                  </span>
                  <span v-else class="text-slate-600">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- جدول الحركات اليومية التفصيلي للموظف (ينسدل عند الطلب) -->
        <div
          v-show="expandedEmployees[item.employee.id]"
          class="border-t border-slate-800 bg-slate-950/60 p-4"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/60">
                  <th class="py-2.5 px-3">التاريخ</th>
                  <th class="py-2.5 px-3">اليوم</th>
                  <th class="py-2.5 px-3">الوردية</th>
                  <th class="py-2.5 px-3 text-center">وقت الدخول</th>
                  <th class="py-2.5 px-3 text-center">وقت الخروج</th>
                  <th class="py-2.5 px-3 text-center">الحالة</th>
                  <th class="py-2.5 px-3 text-center">التأخير (دقيقة)</th>
                  <th class="py-2.5 px-3 text-center">انصراف مبكر</th>
                  <th class="py-2.5 px-3 text-center">ساعات العمل</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr
                  v-for="record in item.records"
                  :key="record.id"
                  class="hover:bg-slate-800/20 transition-colors"
                >
                  <td class="py-2 px-3 font-mono text-slate-300">{{ record.date }}</td>
                  <td class="py-2 px-3 text-slate-400">{{ record.day_name }}</td>
                  <td class="py-2 px-3 text-slate-400">{{ record.shift_name || 'الأساسية' }}</td>
                  <td class="py-2 px-3 text-center font-mono text-slate-200">
                    {{ record.check_in || '--:--' }}
                  </td>
                  <td class="py-2 px-3 text-center font-mono text-slate-200">
                    {{ record.check_out_formatted || '--:--' }}
                  </td>
                  <td class="py-2 px-3 text-center">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="getStatusBadgeClass(record.status)"
                    >
                      {{ formatStatus(record.status) }}
                    </span>
                  </td>
                  <td
                    class="py-2 px-3 text-center font-mono"
                    :class="
                      record.delay_minutes > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'
                    "
                  >
                    {{ record.delay_minutes > 0 ? record.delay_minutes : '-' }}
                  </td>
                  <td
                    class="py-2 px-3 text-center font-mono"
                    :class="
                      record.early_leave_minutes > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'
                    "
                  >
                    {{ record.early_leave_minutes > 0 ? record.early_leave_minutes : '-' }}
                  </td>
                  <td class="py-2 px-3 text-center font-mono font-bold text-sky-400">
                    {{ record.work_hours }} س
                  </td>
                </tr>

                <tr v-if="!item.records || item.records.length === 0">
                  <td colspan="9" class="py-4 text-center text-slate-500">
                    لا توجد حركات مسجلة لهذا الموظف خلال هذه الفترة.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- شريط ترقيم الصفحات (Pagination Controls) -->
      <div
        v-if="totalPages > 1"
        class="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
      >
        <div class="text-xs text-slate-400">
          عرض الموظفين من
          <span class="font-bold text-white font-mono">{{ startIndex + 1 }}</span>
          إلى
          <span class="font-bold text-white font-mono">{{ endIndex }}</span>
          من أصل
          <span class="font-bold text-white font-mono">{{ filteredEmployees.length }}</span>
          موظف
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            السابق
          </button>

          <template v-for="p in totalPages" :key="p">
            <button
              v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              type="button"
              @click="currentPage = p"
              :class="[
                'w-8 h-8 rounded-lg text-xs font-bold font-mono transition-colors',
                currentPage === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300',
              ]"
            >
              {{ p }}
            </button>
            <span
              v-else-if="p === currentPage - 2 || p === currentPage + 2"
              class="text-slate-500 px-1 text-xs"
            >
              ...
            </span>
          </template>

          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import attendanceLogService from '@/modules/hr/services/attendanceLog.service'

const props = defineProps({
  departmentId: {
    type: [Number, String],
    default: '',
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:startDate', 'update:endDate'])

const router = useRouter()
const toast = useToast()
const loading = ref(false)
const reportData = ref(null)
const expandedEmployees = reactive({})
const allExpanded = ref(false)

// إعدادات الصفحات
const currentPage = ref(1)
const perPage = ref(5) // 5 موظفين في الصفحة

/**
 * معرفة هل التقرير أسبوعي بناءً على رد الباك إند أو عدد الأيام (<= 7)، والافتراضي هو true
 */
const isWeekly = computed(() => {
  if (reportData.value?.filter?.report_type) {
    return reportData.value.filter.report_type === 'weekly'
  }
  if (props.startDate && props.endDate) {
    const [sY, sM, sD] = props.startDate.split('-').map(Number)
    const [eY, eM, eD] = props.endDate.split('-').map(Number)
    const start = new Date(sY, sM - 1, sD)
    const end = new Date(eY, eM - 1, eD)
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    return diffDays <= 7
  }
  return true // افتراضي
})

const displayPeriodTitle = computed(() => {
  return (
    reportData.value?.filter?.period_title ||
    reportData.value?.filter?.month_title ||
    (props.startDate && props.endDate
      ? `${props.startDate} إلى ${props.endDate}`
      : 'الأسبوع الحالي')
  )
})

// تنسيق التاريخ المحلي
const formatLocalDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// التبديل السريع إلى الأسبوع الحالي (يبدأ من الأحد إلى السبت)
const setWeeklyRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = الأحد

  const currentSunday = new Date(now)
  currentSunday.setDate(now.getDate() - dayOfWeek)

  const currentSaturday = new Date(currentSunday)
  currentSaturday.setDate(currentSunday.getDate() + 6)

  emit('update:startDate', formatLocalDate(currentSunday))
  emit('update:endDate', formatLocalDate(currentSaturday))
}

// التبديل السريع إلى الشهر الحالي (من اليوم الأول إلى الأخير)
const setMonthlyRange = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  emit('update:startDate', formatLocalDate(firstDay))
  emit('update:endDate', formatLocalDate(lastDay))
}

// التأكد من تطبيق الأسبوع الحالي إذا لم يتم تمرير تواريخ عند التحميل
onMounted(() => {
  if (!props.startDate || !props.endDate || props.startDate === props.endDate) {
    setWeeklyRange()
  }
})

// فتح صفحة الطباعة المستقلة
const openPrintReport = () => {
  if (!reportData.value) return

  // تخزين بيانات القسم المجلوبة للطباعة بالكامل
  sessionStorage.setItem('printDepartmentMonthlyData', JSON.stringify(reportData.value))

  const routeData = router.resolve({ name: 'hr.attendance.department-monthly.print' })
  window.open(routeData.href, '_blank')
}

// تصفية الموظفين بالاسم أو الرقم الوظيفي محلياً عند البحث
const filteredEmployees = computed(() => {
  if (!reportData.value?.employees) return []
  const query = props.searchQuery ? props.searchQuery.trim().toLowerCase() : ''
  if (!query) return reportData.value.employees

  return reportData.value.employees.filter((item) => {
    const fullName = item.employee.full_name?.toLowerCase() || ''
    const empNum = item.employee.employee_number?.toLowerCase() || ''
    return fullName.includes(query) || empNum.includes(query)
  })
})

// إجمالي عدد الصفحات
const totalPages = computed(() => {
  return Math.ceil(filteredEmployees.value.length / perPage.value) || 1
})

const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => {
  return Math.min(startIndex.value + perPage.value, filteredEmployees.value.length)
})

// الموظفون المقتطعون للصفحة الحالية فقط
const paginatedEmployees = computed(() => {
  return filteredEmployees.value.slice(startIndex.value, endIndex.value)
})

// إعادة ضبط الصفحة إلى الأولى عند تغيير أي فلتر
watch(
  [
    () => props.searchQuery,
    () => props.departmentId,
    () => props.startDate,
    () => props.endDate,
    perPage,
  ],
  () => {
    currentPage.value = 1
  },
)

const fetchReport = async () => {
  if (!props.departmentId) {
    reportData.value = null
    return
  }

  loading.value = true
  try {
    const params = {
      department_id: props.departmentId,
      start_date: props.startDate || null,
      end_date: props.endDate || null,
      report_type: isWeekly.value ? 'weekly' : 'monthly',
    }

    const response = await attendanceLogService.getDepartmentMonthlyReport(params)
    reportData.value = response.data
    currentPage.value = 1
  } catch (error) {
    const message = error.response?.data?.message || 'تعذر تحميل كشف حضور القسم.'
    toast.error(message)
    reportData.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.departmentId, props.startDate, props.endDate],
  () => {
    fetchReport()
  },
  { immediate: true },
)

const toggleEmployeeDetails = (employeeId) => {
  expandedEmployees[employeeId] = !expandedEmployees[employeeId]
}

const toggleAllEmployees = () => {
  allExpanded.value = !allExpanded.value
  filteredEmployees.value.forEach((item) => {
    expandedEmployees[item.employee.id] = allExpanded.value
  })
}

// توليد مصفوفة أيام الفترة لإنشاء الشريط الأفقي للموظف
const getPeriodDays = (records = []) => {
  if (!props.startDate || !props.endDate) return []

  const days = []
  const [sY, sM, sD] = props.startDate.split('-').map(Number)
  const [eY, eM, eD] = props.endDate.split('-').map(Number)

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
      shortDayName: current.toLocaleDateString('ar-EG', {
        weekday: isWeekly.value ? 'short' : 'narrow',
      }),
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
  return map[status] || status
}

const formatStatusTooltip = (record) => {
  return `${formatStatus(record.status)} | دخول: ${record.check_in || '--'} | خروج: ${record.check_out || '--'}`
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    case 'late':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    case 'absent':
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    case 'on_leave':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    default:
      return 'bg-slate-800 text-slate-400'
  }
}
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
