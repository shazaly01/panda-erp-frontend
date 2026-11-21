<!-- src/modules/hr/views/dashboard/HRDashboardView.vue -->
<template>
  <div class="space-y-6 pb-8">
    <!-- =========================================================
           1. الترويسة الزجاجية وشريط الفلاتر التفاعلي
           ========================================================= -->
    <DashboardHeroHeader
      title="لوحة تحكم الموارد البشرية وشؤون الموظفين"
      subtitle="متابعة شاملة للقوى العاملة، مسيرات الرواتب المعتمدة، انضباط الحضور، والتواجد الميداني اللحظي"
      :badge="heroStatusBadge"
      :icon="UserGroupIcon"
      :loading="loading"
      :show-reset="hasCustomFilters"
      @refresh="loadDashboardData"
      @reset="resetFilters"
    >
      <!-- شارات المعلومات السريعة في الرأس -->
      <template #meta-badges>
        <div
          v-if="meta.date_from && meta.date_to"
          class="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card px-3 py-1.5 text-xs font-bold text-text-secondary"
        >
          <CalendarDaysIcon class="h-4 w-4 text-primary" />
          <span dir="ltr">{{ meta.date_from }} → {{ meta.date_to }}</span>
        </div>

        <div
          class="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card px-3 py-1.5 text-xs font-extrabold text-text-primary"
        >
          <CurrencyDollarIcon class="h-4 w-4 text-emerald-500" />
          <span>{{ baseCurrency.name }} ({{ baseCurrency.code }})</span>
        </div>
      </template>

      <!-- شريط الفلاتر الثلاثة -->
      <template #filters>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <!-- فلتر الإدارة / القسم (يدعم التصفية الهرمية) -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">الإدارة / القسم</label>
            <select
              v-model="filters.department_id"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع الإدارات والأقسام</option>
              <option
                v-for="dept in departmentStore.flatDepartments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.dropdownName || dept.name }}
              </option>
            </select>
          </div>

          <!-- فلتر من تاريخ -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">من تاريخ</label>
            <input
              v-model="filters.date_from"
              type="date"
              @change="onDateFilterChange"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            />
          </div>

          <!-- فلتر إلى تاريخ -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">إلى تاريخ</label>
            <input
              v-model="filters.date_to"
              type="date"
              :min="filters.date_from || undefined"
              @change="onDateFilterChange"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            />
          </div>
        </div>
      </template>
    </DashboardHeroHeader>

    <!-- =========================================================
           2. حالة التحميل الأولي (Skeleton) أو حالة الخطأ
           ========================================================= -->
    <DashboardSkeleton v-if="initialLoading" />

    <div
      v-else-if="errorMessage && !hasLoadedOnce"
      class="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-8 text-center space-y-4"
    >
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500"
      >
        <ExclamationTriangleIcon class="h-7 w-7" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-extrabold text-text-primary">
          تعذر تحميل بيانات لوحة تحكم الموارد البشرية
        </h3>
        <p class="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
          {{ errorMessage }}
        </p>
      </div>
      <button
        type="button"
        @click="loadDashboardData"
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white cursor-pointer"
      >
        <ArrowPathIcon class="h-4 w-4" />
        <span>إعادة المحاولة</span>
      </button>
    </div>

    <!-- =========================================================
           3. المحتوى التحليلي والرقابي الكامل للوحة تحكم الموارد البشرية
           ========================================================= -->
    <template v-else>
      <!-- أ. صف بطاقات المؤشرات الرئيسية الأربعة (Primary KPIs) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardKpiCard
          title="القوى العاملة النشطة"
          :subtitle="`على رأس العمل: ${kpis.workforce?.in_service_count || 0} • في إجازة: ${kpis.workforce?.on_leave_count || 0}`"
          :value="kpis.workforce?.total_active_employees || 0"
          suffix="موظف"
          variant="indigo"
          :icon="UsersIcon"
          :stagger-index="1"
        />

        <DashboardKpiCard
          title="صافي مسيرات الرواتب"
          :subtitle="`أساسي العقود السارية: ${formatCompactAmount(kpis.payroll?.active_contracts_basic_total || 0)} ${baseCurrency.code}`"
          :value="kpis.payroll?.total_net_salary || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.payroll?.growth_percentage"
          variant="emerald"
          :icon="BanknotesIcon"
          :stagger-index="2"
        />

        <DashboardKpiCard
          title="معدل انضباط الحضور"
          :subtitle="`إضافي: ${kpis.attendance?.overtime_hours || 0} س • تأخير: ${kpis.attendance?.delay_hours || 0} س`"
          :value="kpis.attendance?.compliance_rate ?? 100"
          suffix="%"
          :sparkline="kpis.attendance?.sparkline || []"
          variant="sky"
          :icon="ClockIcon"
          :stagger-index="3"
        />

        <DashboardKpiCard
          title="رصيد السلف القائمة"
          :subtitle="`${kpis.loans_and_leaves?.active_loans_count || 0} سلفة نشطة • إجازات: ${kpis.loans_and_leaves?.approved_leave_days || 0} يوم`"
          :value="kpis.loans_and_leaves?.outstanding_loans_balance || 0"
          :suffix="baseCurrency.code"
          variant="amber"
          :icon="WalletIcon"
          :stagger-index="4"
        />
      </section>

      <!-- ب. شبكة التنبيهات الإدارية والرقابية (6 بطاقات تفاعلية 3×2) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardAlertPill
          title="طلبات إجازة معلقة"
          :count="alerts.pending_leave_requests_count || 0"
          active-description="طلبات إجازة بانتظار المراجعة والاعتماد"
          empty-description="لا توجد طلبات إجازة معلقة حالياً"
          variant="amber"
          :icon="CalendarIcon"
          :stagger-index="2"
          @click="handleAlertNavigation('LeavesList', 'طلبات الإجازات')"
        />

        <DashboardAlertPill
          title="طلبات سلف معلقة"
          :count="alerts.pending_loans_count || 0"
          active-description="طلبات سلف مالية بانتظار الموافقة"
          empty-description="لا توجد طلبات سلف معلقة حالياً"
          variant="primary"
          :icon="CurrencyDollarIcon"
          :stagger-index="3"
          @click="handleAlertNavigation('LoansList', 'السلف والعهد')"
        />

        <DashboardAlertPill
          title="عقود تنتهي خلال 30 يوماً"
          :count="alerts.expiring_contracts_count || 0"
          active-description="عقود عمل سارية تقترب من تاريخ الانتهاء"
          empty-description="لا توجد عقود منتهية أو قريبة الانتهاء"
          variant="rose"
          :icon="DocumentTextIcon"
          :stagger-index="4"
          @click="handleAlertNavigation('ContractsList', 'العقود والتوظيف')"
        />

        <DashboardAlertPill
          title="طلبات تدريب بانتظار الفرز"
          :count="alerts.pending_intern_applications_count || 0"
          active-description="طلبات تدريب أكاديمي جديدة للمراجعة"
          empty-description="لا توجد طلبات تدريب معلقة"
          variant="sky"
          :icon="AcademicCapIcon"
          :stagger-index="5"
          @click="handleAlertNavigation('InternshipApplicationsList', 'برنامج التدريب الأكاديمي')"
        />

        <DashboardAlertPill
          title="متدربون أتموا فترة التدريب"
          :count="alerts.completed_interns_count || 0"
          active-description="متدربون انتهت فترتهم وجاهزون للتقييم أو التثبيت"
          empty-description="لا يوجد متدربون بانتظار إنهاء التدريب"
          variant="amber"
          :icon="CheckBadgeIcon"
          :stagger-index="6"
          @click="handleAlertNavigation('InternshipApplicationsList', 'برنامج التدريب الأكاديمي')"
        />

        <DashboardAlertPill
          title="تعديلات يدوية على الحضور"
          :count="alerts.manual_attendance_overrides_count || 0"
          active-description="سجلات حضور تم تعديلها يدوياً خلال الفترة"
          empty-description="لا توجد تعديلات يدوية على سجلات الحضور"
          variant="sky"
          :icon="PencilSquareIcon"
          :stagger-index="7"
          @click="handleAlertNavigation('AttendanceList', 'سجلات الحضور')"
        />
      </section>

      <!-- ج. شبكة الرسوم البيانية الأربعة (4 Core Charts) -->
      <HrChartsGrid :charts="charts" :currency-code="baseCurrency.code" />

      <!-- د. التواجد الميداني اللحظي، الاعتمادات المعلقة، وأحدث مسيرات الرواتب -->
      <HrOperationsAndPresence
        :live-presence="kpis.live_presence"
        :pending-approvals="pendingApprovals"
        :recent-payroll-batches="recentPayrollBatches"
        :base-currency="baseCurrency"
        @view-emergency-muster="navigateToRoute('EmergencyMuster')"
        @view-visitors="navigateToRoute('VisitorsList')"
        @view-leaves="navigateToRoute('LeavesList')"
        @view-loans="navigateToRoute('LoansList')"
        @open-approval="handleOpenApproval"
        @view-payroll-batches="navigateToRoute('PayrollBatchesList')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import hrDashboardService from '@/modules/hr/services/hrDashboard.service'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import DashboardHeroHeader from '@/components/dashboard/DashboardHeroHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardAlertPill from '@/components/dashboard/DashboardAlertPill.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import HrChartsGrid from './components/HrChartsGrid.vue'
import HrOperationsAndPresence from './components/HrOperationsAndPresence.vue'
import {
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  WalletIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const departmentStore = useDepartmentStore()

// --- حالة الفلاتر ---
const filters = reactive({
  department_id: null,
  date_from: '',
  date_to: '',
})

const defaultDates = reactive({
  date_from: '',
  date_to: '',
})

// --- حالة البيانات والتحميل ---
const loading = ref(false)
const hasLoadedOnce = ref(false)
const errorMessage = ref('')
let activeAbortController = null

const dashboardData = ref({
  meta: {},
  kpis: {},
  charts: {},
  alerts: {
    pending_leave_requests_count: 0,
    pending_loans_count: 0,
    expiring_contracts_count: 0,
    pending_intern_applications_count: 0,
    completed_interns_count: 0,
    manual_attendance_overrides_count: 0,
  },
  recent_payroll_batches: [],
  pending_approvals: [],
})

const initialLoading = computed(() => loading.value && !hasLoadedOnce.value)

// --- استخراج أقسام البيانات بأمان ---
const meta = computed(() => dashboardData.value.meta || {})
const kpis = computed(() => dashboardData.value.kpis || {})
const charts = computed(() => dashboardData.value.charts || {})
const alerts = computed(() => dashboardData.value.alerts || {})
const recentPayrollBatches = computed(() => dashboardData.value.recent_payroll_batches || [])
const pendingApprovals = computed(() => dashboardData.value.pending_approvals || [])

const baseCurrency = computed(() => {
  return (
    meta.value.base_currency || {
      id: null,
      code: 'SDG',
      name: 'العملة الأساسية',
      symbol: '',
    }
  )
})

const heroStatusBadge = computed(() => {
  const contractsCount = Number(kpis.value?.workforce?.active_contracts_count || 0)
  if (contractsCount > 0) {
    return `${contractsCount} عقد عمل ساري`
  }
  return 'الموارد البشرية'
})

const hasCustomFilters = computed(() => {
  return Boolean(
    filters.department_id !== null ||
      (defaultDates.date_from &&
        filters.date_from &&
        filters.date_from !== defaultDates.date_from) ||
      (defaultDates.date_to && filters.date_to && filters.date_to !== defaultDates.date_to),
  )
})

// --- جلب بيانات لوحة التحكم من الخادم ---
async function loadDashboardData() {
  if (activeAbortController) {
    activeAbortController.abort()
  }
  activeAbortController = new AbortController()

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await hrDashboardService.getDashboardData(
      {
        department_id: filters.department_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
      },
      activeAbortController.signal,
    )

    const payload = response.data?.data || {}
    dashboardData.value = {
      meta: payload.meta || {},
      kpis: payload.kpis || {},
      charts: payload.charts || {},
      alerts: payload.alerts || {},
      recent_payroll_batches: payload.recent_payroll_batches || [],
      pending_approvals: payload.pending_approvals || [],
    }

    if (payload.meta?.date_from) {
      filters.date_from = payload.meta.date_from
      if (!defaultDates.date_from) {
        defaultDates.date_from = payload.meta.date_from
      }
    }
    if (payload.meta?.date_to) {
      filters.date_to = payload.meta.date_to
      if (!defaultDates.date_to) {
        defaultDates.date_to = payload.meta.date_to
      }
    }

    hasLoadedOnce.value = true
  } catch (err) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      return
    }

    const msg =
      err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم لجلب إحصائيات الموارد البشرية.'
    errorMessage.value = msg

    if (hasLoadedOnce.value) {
      toast.error(msg)
    }
  } finally {
    loading.value = false
  }
}

function onDateFilterChange() {
  if (filters.date_from && filters.date_to && filters.date_to < filters.date_from) {
    filters.date_to = filters.date_from
  }
  loadDashboardData()
}

function resetFilters() {
  filters.department_id = null
  filters.date_from = ''
  filters.date_to = ''
  defaultDates.date_from = ''
  defaultDates.date_to = ''
  loadDashboardData()
}

// --- التنقل السريع الآمن ---
function navigateToRoute(routeName) {
  if (router.hasRoute(routeName)) {
    router.push({ name: routeName })
  }
}

function handleAlertNavigation(routeName, fallbackTitle) {
  if (router.hasRoute(routeName)) {
    router.push({ name: routeName })
  } else {
    toast.info(`واجهة "${fallbackTitle}" غير مفعّلة في مسارات التوجيه الحالية.`)
  }
}

function handleOpenApproval(item) {
  if (!item) return

  if (item.type === 'leave') {
    navigateToRoute('LeavesList')
    return
  }

  if (item.type === 'loan') {
    navigateToRoute('LoansList')
  }
}

function formatCompactAmount(value) {
  const num = Number(value) || 0
  const hasDecimals = num % 1 !== 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(num)
}

onMounted(async () => {
  const tasks = [loadDashboardData()]

  if (!departmentStore.flatDepartments.length) {
    tasks.push(departmentStore.fetchDepartments())
  }

  await Promise.allSettled(tasks)
})

onBeforeUnmount(() => {
  if (activeAbortController) {
    activeAbortController.abort()
  }
})
</script>
