<!-- src/modules/accounting/views/dashboard/AccountingDashboardView.vue -->
<template>
  <div class="space-y-6 pb-8">
    <!-- =========================================================
           1. الترويسة الزجاجية وشريط الفلاتر التفاعلي
           ========================================================= -->
    <DashboardHeroHeader
      title="لوحة تحكم الإدارة المالية والمحاسبة"
      subtitle="نظرة تحليلية شاملة على التدفقات النقدية، الربحية، الخزائن، والذمم"
      :badge="activeFiscalYearBadge"
      :icon="BanknotesIcon"
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

      <!-- شريط الفلاتر -->
      <template #filters>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <!-- فلتر السنة المالية -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">السنة المالية</label>
            <select
              v-model="filters.fiscal_year_id"
              @change="onFiscalYearChange"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">السنة المالية الحالية (تلقائي)</option>
              <option v-for="fy in fiscalYearStore.fiscalYears" :key="fy.id" :value="fy.id">
                {{ fy.name }} ({{ fy.status === 'open' ? 'مفتوحة' : 'مغلقة' }})
              </option>
            </select>
          </div>

          <!-- فلتر الفرع -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">الفرع / مركز التكلفة</label>
            <select
              v-model="filters.branch_id"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع الفروع والمراكز</option>
              <option
                v-for="branch in costCenterStore.branches"
                :key="branch.id"
                :value="branch.id"
              >
                {{ branch.code ? `${branch.code} - ` : '' }}{{ branch.name }}
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
          تعذر تحميل بيانات لوحة تحكم المحاسبة
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
           3. المحتوى التحليلي الكامل للوحة التحكم
           ========================================================= -->
    <template v-else>
      <!-- أ. صف بطاقات المؤشرات الرئيسية الأربعة (Primary KPIs + Sparklines) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardKpiCard
          title="إجمالي السيولة النقدية"
          subtitle="رصيد الخزائن والبنوك المتاح"
          :value="kpis.liquidity?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.liquidity?.growth_percentage"
          :sparkline="kpis.liquidity?.sparkline || []"
          variant="sky"
          :icon="WalletIcon"
          :stagger-index="1"
        />

        <DashboardKpiCard
          title="إجمالي الإيرادات"
          subtitle="الإيرادات التشغيلية المرحّلة"
          :value="kpis.revenue?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.revenue?.growth_percentage"
          :sparkline="kpis.revenue?.sparkline || []"
          variant="emerald"
          :icon="ArrowTrendingUpIcon"
          :stagger-index="2"
        />

        <DashboardKpiCard
          title="إجمالي المصروفات"
          subtitle="النفقات والتكاليف التشغيلية"
          :value="kpis.expenses?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.expenses?.growth_percentage"
          :invert-growth-color="true"
          :sparkline="kpis.expenses?.sparkline || []"
          variant="rose"
          :icon="ArrowTrendingDownIcon"
          :stagger-index="3"
        />

        <DashboardKpiCard
          title="صافي الربح / الخسارة"
          subtitle="الفرق بين الإيرادات والمصروفات"
          :value="kpis.net_profit?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.net_profit?.growth_percentage"
          :sparkline="kpis.net_profit?.sparkline || []"
          :variant="Number(kpis.net_profit?.value || 0) >= 0 ? 'primary' : 'rose'"
          :icon="ChartBarIcon"
          :stagger-index="4"
        />
      </section>

      <!-- ب. شريط المؤشرات المالية الهيكلية (هامش الربح، الأصول، الالتزامات) + اختصارات سريعة -->
      <section
        class="dashboard-enter grid grid-cols-1 md:grid-cols-3 gap-4"
        style="--stagger-index: 2"
      >
        <!-- هامش صافي الربح -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300"
            >
              <ReceiptPercentIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">هامش صافي الربح</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums" dir="ltr">
                {{ Number(kpis.profit_margin?.value || 0).toFixed(2) }}%
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums"
            :class="
              Number(kpis.profit_margin?.growth_percentage || 0) >= 0
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            "
            dir="ltr"
          >
            {{ Number(kpis.profit_margin?.growth_percentage || 0) > 0 ? '+' : ''
            }}{{ Number(kpis.profit_margin?.growth_percentage || 0).toFixed(2) }}%
          </span>
        </div>

        <!-- إجمالي الأصول -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300"
            >
              <ShieldCheckIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">إجمالي الأصول (تراكمي)</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.total_assets?.value || 0) }}
                <span class="text-xs font-bold text-text-muted">{{ baseCurrency.code }}</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums"
            :class="
              Number(kpis.total_assets?.growth_percentage || 0) >= 0
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            "
            dir="ltr"
          >
            {{ Number(kpis.total_assets?.growth_percentage || 0) > 0 ? '+' : ''
            }}{{ Number(kpis.total_assets?.growth_percentage || 0).toFixed(1) }}%
          </span>
        </div>

        <!-- إجمالي الالتزامات -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary-light"
            >
              <ScaleIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">إجمالي الالتزامات (تراكمي)</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.total_liabilities?.value || 0) }}
                <span class="text-xs font-bold text-text-muted">{{ baseCurrency.code }}</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums"
            :class="
              Number(kpis.total_liabilities?.growth_percentage || 0) <= 0
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            "
            dir="ltr"
          >
            {{ Number(kpis.total_liabilities?.growth_percentage || 0) > 0 ? '+' : ''
            }}{{ Number(kpis.total_liabilities?.growth_percentage || 0).toFixed(1) }}%
          </span>
        </div>
      </section>

      <!-- ج. شريط التنبيهات الإجرائية (3 بطاقات تفاعلية) -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardAlertPill
          title="قيود يومية مسودة"
          :count="alerts.draft_entries_count || 0"
          active-description="قيود غير مرحّلة بانتظار المراجعة والترحيل"
          empty-description="جميع القيود اليومية مرحّلة بالكامل"
          variant="amber"
          :icon="DocumentTextIcon"
          :stagger-index="3"
          @click="navigateToRoute('journal-entries.index')"
        />

        <DashboardAlertPill
          title="سندات بانتظار الاعتماد"
          :count="alerts.pending_vouchers_count || 0"
          active-description="سندات قبض أو صرف تنتظر موافقة المشرف"
          empty-description="لا توجد سندات معلقة للاعتماد"
          variant="rose"
          :icon="ClipboardDocumentCheckIcon"
          :stagger-index="4"
          @click="navigateToRoute('receipts.index')"
        />

        <DashboardAlertPill
          title="سندات غير مرحّلة"
          :count="alerts.unposted_vouchers_count || 0"
          active-description="سندات مسودة أو معتمدة لم تُرحّل للدفاتر بعد"
          empty-description="كافة السندات مرحّلة ومتوازنة"
          variant="sky"
          :icon="QueueListIcon"
          :stagger-index="5"
          @click="navigateToRoute('payments.index')"
        />
      </section>

      <!-- د. شبكة الرسوم البيانية الستة (6 Charts) -->
      <AccountingChartsGrid :charts="charts" :currency-code="baseCurrency.code" />

      <!-- هـ. الخزائن والبنوك وأعلى الأطراف وآخر 8 قيود مرحّلة -->
      <AccountingTreasuryAndParties
        :treasury-accounts="treasuryAccounts"
        :liquidity-by-currency="liquidityByCurrency"
        :top-parties="topParties"
        :recent-activities="recentActivities"
        :base-currency="baseCurrency"
        @open-entry="handleOpenEntry"
        @view-all-entries="navigateToRoute('journal-entries.index')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import accountingDashboardService from '@/modules/accounting/services/accountingDashboard.service'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import DashboardHeroHeader from '@/components/dashboard/DashboardHeroHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardAlertPill from '@/components/dashboard/DashboardAlertPill.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import AccountingChartsGrid from './components/AccountingChartsGrid.vue'
import AccountingTreasuryAndParties from './components/AccountingTreasuryAndParties.vue'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  ScaleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  QueueListIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const fiscalYearStore = useFiscalYearStore()
const costCenterStore = useCostCenterStore()

// --- حالة الفلاتر ---
const filters = reactive({
  fiscal_year_id: null,
  branch_id: null,
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
  treasury_accounts: [],
  liquidity_by_currency: [],
  top_parties: { top_debtors: [], top_creditors: [] },
  alerts: {
    draft_entries_count: 0,
    pending_vouchers_count: 0,
    unposted_vouchers_count: 0,
  },
  recent_activities: [],
})

const initialLoading = computed(() => loading.value && !hasLoadedOnce.value)

// --- استخراج أقسام البيانات بأمان ---
const meta = computed(() => dashboardData.value.meta || {})
const kpis = computed(() => dashboardData.value.kpis || {})
const charts = computed(() => dashboardData.value.charts || {})
const treasuryAccounts = computed(() => dashboardData.value.treasury_accounts || [])
const liquidityByCurrency = computed(() => dashboardData.value.liquidity_by_currency || [])
const topParties = computed(
  () => dashboardData.value.top_parties || { top_debtors: [], top_creditors: [] },
)
const alerts = computed(() => dashboardData.value.alerts || {})
const recentActivities = computed(() => dashboardData.value.recent_activities || [])

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

const activeFiscalYearBadge = computed(() => {
  const fy = meta.value.fiscal_year
  if (!fy) return ''
  return `${fy.name} • ${fy.status === 'open' ? 'سنة مفتوحة' : 'سنة مغلقة'}`
})

const hasCustomFilters = computed(() => {
  return Boolean(
    filters.fiscal_year_id !== null ||
      filters.branch_id !== null ||
      (filters.date_from && meta.value.fiscal_year?.start_date !== filters.date_from) ||
      (filters.date_to && meta.value.fiscal_year?.end_date !== filters.date_to),
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
    const response = await accountingDashboardService.getDashboardData(
      {
        fiscal_year_id: filters.fiscal_year_id,
        branch_id: filters.branch_id,
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
      treasury_accounts: payload.treasury_accounts || [],
      liquidity_by_currency: payload.liquidity_by_currency || [],
      top_parties: payload.top_parties || { top_debtors: [], top_creditors: [] },
      alerts: payload.alerts || {},
      recent_activities: payload.recent_activities || [],
    }

    // مزامنة التواريخ المعروضة في حقول الفلترة مع النطاق المحتسب من السيرفر
    if (payload.meta?.date_from) {
      filters.date_from = payload.meta.date_from
    }
    if (payload.meta?.date_to) {
      filters.date_to = payload.meta.date_to
    }

    hasLoadedOnce.value = true
  } catch (err) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      return
    }

    const msg =
      err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم لجلب إحصائيات المحاسبة.'
    errorMessage.value = msg

    if (hasLoadedOnce.value) {
      toast.error(msg)
    }
  } finally {
    loading.value = false
  }
}

function onFiscalYearChange() {
  // عند اختيار سنة مالية جديدة نُفرّغ التواريخ ليعيد السيرفر نطاق تلك السنة تلقائياً
  filters.date_from = ''
  filters.date_to = ''
  loadDashboardData()
}

function onDateFilterChange() {
  if (filters.date_from && filters.date_to && filters.date_to < filters.date_from) {
    filters.date_to = filters.date_from
  }
  loadDashboardData()
}

function resetFilters() {
  filters.fiscal_year_id = null
  filters.branch_id = null
  filters.date_from = ''
  filters.date_to = ''
  loadDashboardData()
}

// --- التنقل السريع ---
function navigateToRoute(routeName) {
  router.push({ name: routeName })
}

function handleOpenEntry(activity) {
  if (activity?.id) {
    router.push({ name: 'journal-entries.index' })
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
  // تحميل بيانات الفلاتر المرجعية بالتوازي مع جلب بيانات لوحة التحكم
  const tasks = [loadDashboardData()]

  if (!fiscalYearStore.fiscalYears.length) {
    tasks.push(fiscalYearStore.fetchFiscalYears())
  }
  if (!costCenterStore.costCenters.length) {
    tasks.push(costCenterStore.fetchCostCenters())
  }

  await Promise.allSettled(tasks)
})

onBeforeUnmount(() => {
  if (activeAbortController) {
    activeAbortController.abort()
  }
})
</script>
