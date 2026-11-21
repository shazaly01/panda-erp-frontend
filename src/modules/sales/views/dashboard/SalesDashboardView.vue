<!-- src/modules/sales/views/dashboard/SalesDashboardView.vue -->
<template>
  <div class="space-y-6 pb-8">
    <!-- =========================================================
           1. الترويسة الزجاجية وشريط الفلاتر التفاعلي
           ========================================================= -->
    <DashboardHeroHeader
      title="لوحة تحكم المبيعات ونقاط البيع"
      subtitle="متابعة حية لحركة المبيعات، الأرباح، التحصيلات، وأداء الكاشيرين والورديات"
      :badge="heroStatusBadge"
      :icon="ReceiptPercentIcon"
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

      <!-- شريط الفلاتر الخمسة -->
      <template #filters>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <!-- فلتر الفرع -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">الفرع / مركز التكلفة</label>
            <select
              v-model="filters.branch_id"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع الفروع</option>
              <option
                v-for="branch in costCenterStore.branches"
                :key="branch.id"
                :value="branch.id"
              >
                {{ branch.code ? `${branch.code} - ` : '' }}{{ branch.name }}
              </option>
            </select>
          </div>

          <!-- فلتر المستودع -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">المستودع / المعرض</label>
            <select
              v-model="filters.warehouse_id"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع المستودعات</option>
              <option
                v-for="warehouse in warehouseStore.warehouses"
                :key="warehouse.id"
                :value="warehouse.id"
              >
                {{ warehouse.code ? `${warehouse.code} - ` : '' }}{{ warehouse.name }}
              </option>
            </select>
          </div>

          <!-- فلتر قناة البيع -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">قناة البيع</label>
            <select
              v-model="filters.channel"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع القنوات</option>
              <option v-for="ch in channelOptions" :key="ch.value" :value="ch.value">
                {{ ch.label }}
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
          تعذر تحميل بيانات لوحة تحكم المبيعات
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
           3. المحتوى التحليلي الكامل للوحة تحكم المبيعات
           ========================================================= -->
    <template v-else>
      <!-- أ. صف بطاقات المؤشرات الرئيسية الأربعة (Primary KPIs + Sparklines) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardKpiCard
          title="إجمالي المبيعات"
          subtitle="إجمالي الفواتير المؤكدة خلال الفترة"
          :value="kpis.gross_sales?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.gross_sales?.growth_percentage"
          :sparkline="kpis.gross_sales?.sparkline || []"
          variant="primary"
          :icon="BanknotesIcon"
          :stagger-index="1"
        />

        <DashboardKpiCard
          title="مرتجعات المبيعات"
          :subtitle="`نسبة المرتجع: ${Number(kpis.total_returns?.return_rate || 0).toFixed(1)}%`"
          :value="kpis.total_returns?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.total_returns?.growth_percentage"
          :invert-growth-color="true"
          :sparkline="kpis.total_returns?.sparkline || []"
          variant="rose"
          :icon="ArrowUturnLeftIcon"
          :stagger-index="2"
        />

        <DashboardKpiCard
          title="صافي المبيعات"
          subtitle="المبيعات بعد خصم المرتجعات"
          :value="kpis.net_sales?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.net_sales?.growth_percentage"
          :sparkline="kpis.net_sales?.sparkline || []"
          variant="sky"
          :icon="ShoppingBagIcon"
          :stagger-index="3"
        />

        <DashboardKpiCard
          title="مجمل الربح المحقق"
          :subtitle="`هامش الربح: ${Number(kpis.gross_profit?.profit_margin || 0).toFixed(1)}%`"
          :value="kpis.gross_profit?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.gross_profit?.growth_percentage"
          :sparkline="kpis.gross_profit?.sparkline || []"
          :variant="Number(kpis.gross_profit?.value || 0) >= 0 ? 'emerald' : 'rose'"
          :icon="ArrowTrendingUpIcon"
          :stagger-index="4"
        />
      </section>

      <!-- ب. شريط المؤشرات التشغيلية الثانوية (التحصيلات، الذمم الآجلة، عدد ومتوسط الفواتير) -->
      <section
        class="dashboard-enter grid grid-cols-1 md:grid-cols-3 gap-4"
        style="--stagger-index: 2"
      >
        <!-- صافي التحصيلات الفعلية -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300"
            >
              <WalletIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">صافي التحصيلات الفعلية</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.collections?.value || 0) }}
                <span class="text-xs font-bold text-text-muted">{{ baseCurrency.code }}</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums shrink-0"
            :class="
              Number(kpis.collections?.growth_percentage || 0) >= 0
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            "
            dir="ltr"
          >
            {{ Number(kpis.collections?.growth_percentage || 0) > 0 ? '+' : ''
            }}{{ Number(kpis.collections?.growth_percentage || 0).toFixed(1) }}%
          </span>
        </div>

        <!-- الذمم الآجلة غير المحصلة -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300"
            >
              <ClockIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">الذمم الآجلة (تراكمي)</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.receivables?.value || 0) }}
                <span class="text-xs font-bold text-text-muted">{{ baseCurrency.code }}</span>
              </p>
            </div>
          </div>

          <div class="text-left shrink-0">
            <span
              class="inline-block rounded-lg px-2.5 py-1 text-[11px] font-extrabold tabular-nums"
              :class="
                Number(kpis.receivables?.overdue_amount || 0) > 0
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              "
              dir="ltr"
            >
              {{
                Number(kpis.receivables?.overdue_amount || 0) > 0
                  ? `متأخر: ${formatCompactAmount(kpis.receivables.overdue_amount)}`
                  : 'لا توجد متأخرات'
              }}
            </span>
          </div>
        </div>

        <!-- عدد الفواتير ومتوسط قيمة الفاتورة -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300"
            >
              <DocumentDuplicateIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">
                عدد الفواتير
                <span class="text-[11px] font-semibold text-primary">
                  (متوسط: {{ formatCompactAmount(kpis.invoices_count?.average_order_value || 0) }})
                </span>
              </p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums" dir="ltr">
                {{ kpis.invoices_count?.value || 0 }}
                <span class="text-xs font-bold text-text-muted">فاتورة</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums shrink-0"
            :class="
              Number(kpis.invoices_count?.growth_percentage || 0) >= 0
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            "
            dir="ltr"
          >
            {{ Number(kpis.invoices_count?.growth_percentage || 0) > 0 ? '+' : ''
            }}{{ Number(kpis.invoices_count?.growth_percentage || 0).toFixed(1) }}%
          </span>
        </div>
      </section>

      <!-- ج. التنبيهات التشغيلية والإجراءات المعلقة (مفصولة بصرياً عن المؤشرات المالية) -->
      <section class="pt-4 border-t border-surface-border/80 space-y-3.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
            <h2 class="text-xs sm:text-sm font-extrabold text-text-secondary">
              التنبيهات التشغيلية والإجراءات المعلقة
            </h2>
          </div>
          <span class="hidden sm:inline text-[11px] font-semibold text-text-muted">
            انقر على أي بطاقة للانتقال المباشر إلى شاشتها
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardAlertPill
            title="فواتير مسودة"
            :count="alerts.draft_invoices_count || 0"
            active-description="فواتير غير مؤكدة بانتظار المراجعة"
            empty-description="لا توجد فواتير مسودة حالياً"
            variant="amber"
            :icon="DocumentTextIcon"
            :stagger-index="3"
            @click="handleAlertNavigation('sales.invoices.index', 'سجل فواتير المبيعات')"
          />

          <DashboardAlertPill
            title="فواتير غير مرحّلة"
            :count="alerts.unposted_invoices_count || 0"
            active-description="مؤكدة بانتظار الترحيل المحاسبي"
            empty-description="جميع الفواتير مرحّلة للدفاتر"
            variant="sky"
            :icon="QueueListIcon"
            :stagger-index="4"
            @click="handleAlertNavigation('sales.invoices.index', 'سجل فواتير المبيعات')"
          />

          <DashboardAlertPill
            title="فواتير آجلة متأخرة"
            :count="alerts.overdue_invoices_count || 0"
            active-description="تجاوزت تاريخ الاستحقاق للتحصيل"
            empty-description="لا توجد فواتير متأخرة السداد"
            variant="rose"
            :icon="ExclamationCircleIcon"
            :stagger-index="5"
            @click="handleAlertNavigation('sales.invoices.index', 'سجل فواتير المبيعات')"
          />

          <DashboardAlertPill
            title="مرتجعات غير مرحّلة"
            :count="alerts.unposted_returns_count || 0"
            active-description="إشعارات مرتجع بانتظار الترحيل"
            empty-description="كافة المرتجعات مرحّلة ومتوازنة"
            variant="primary"
            :icon="ArrowUturnLeftIcon"
            :stagger-index="6"
            @click="handleAlertNavigation('sales.returns.index', 'شاشة مرتجعات المبيعات')"
          />

          <DashboardAlertPill
            title="فروقات ورديات الكاشير"
            :count="alerts.shifts_with_variance_count || 0"
            active-description="ورديات مغلقة آخر 7 أيام بعجز أو زيادة"
            empty-description="لا توجد فروقات نقدية في الورديات"
            variant="rose"
            :icon="CalculatorIcon"
            :stagger-index="7"
            @click="handleAlertNavigation('sales.shifts.index', 'سجل ورديات نقاط البيع')"
          />
        </div>
      </section>

      <!-- د. شبكة الرسوم البيانية الستة (6 Charts) -->
      <SalesChartsGrid :charts="charts" :currency-code="baseCurrency.code" />

      <!-- هـ. المراقبة الحية لورديات الكاشير وأحدث 8 فواتير مبيعات -->
      <SalesShiftsAndInvoices
        :pos-shifts="posShifts"
        :recent-invoices="recentInvoices"
        :base-currency="baseCurrency"
        @open-invoice="handleOpenInvoice"
        @view-all-invoices="navigateToRoute('sales.invoices.index')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import salesDashboardService from '@/modules/sales/services/salesDashboard.service'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'
import DashboardHeroHeader from '@/components/dashboard/DashboardHeroHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardAlertPill from '@/components/dashboard/DashboardAlertPill.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import SalesChartsGrid from './components/SalesChartsGrid.vue'
import SalesShiftsAndInvoices from './components/SalesShiftsAndInvoices.vue'
import {
  ReceiptPercentIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowUturnLeftIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  QueueListIcon,
  ExclamationCircleIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const costCenterStore = useCostCenterStore()
const warehouseStore = useWarehouseStore()

const channelOptions = [
  { value: 'pos', label: 'نقاط البيع (POS)' },
  { value: 'standard', label: 'فواتير المبيعات المباشرة' },
  { value: 'online', label: 'المتجر الإلكتروني' },
  { value: 'whatsapp', label: 'طلبات واتساب' },
  { value: 'delivery', label: 'التوصيل' },
]

// --- حالة الفلاتر ---
const filters = reactive({
  branch_id: null,
  warehouse_id: null,
  channel: null,
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
  pos_shifts: {
    open_shifts_count: 0,
    open_shifts: [],
    recent_closed_shifts: [],
  },
  alerts: {
    draft_invoices_count: 0,
    unposted_invoices_count: 0,
    overdue_invoices_count: 0,
    unposted_returns_count: 0,
    shifts_with_variance_count: 0,
  },
  recent_invoices: [],
})

const initialLoading = computed(() => loading.value && !hasLoadedOnce.value)

// --- استخراج أقسام البيانات بأمان ---
const meta = computed(() => dashboardData.value.meta || {})
const kpis = computed(() => dashboardData.value.kpis || {})
const charts = computed(() => dashboardData.value.charts || {})
const posShifts = computed(
  () =>
    dashboardData.value.pos_shifts || {
      open_shifts_count: 0,
      open_shifts: [],
      recent_closed_shifts: [],
    },
)
const alerts = computed(() => dashboardData.value.alerts || {})
const recentInvoices = computed(() => dashboardData.value.recent_invoices || [])

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
  const openCount = Number(posShifts.value?.open_shifts_count || 0)
  if (openCount > 0) {
    return `${openCount} وردية كاشير نشطة الآن`
  }
  return 'مبيعات ونقاط بيع'
})

const hasCustomFilters = computed(() => {
  return Boolean(
    filters.branch_id !== null ||
      filters.warehouse_id !== null ||
      filters.channel !== null ||
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
    const response = await salesDashboardService.getDashboardData(
      {
        branch_id: filters.branch_id,
        warehouse_id: filters.warehouse_id,
        channel: filters.channel,
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
      pos_shifts: payload.pos_shifts || {
        open_shifts_count: 0,
        open_shifts: [],
        recent_closed_shifts: [],
      },
      alerts: payload.alerts || {},
      recent_invoices: payload.recent_invoices || [],
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
      err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم لجلب إحصائيات المبيعات.'
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
  filters.branch_id = null
  filters.warehouse_id = null
  filters.channel = null
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

function handleOpenInvoice(invoice) {
  if (!invoice?.id) return

  if (invoice.status === 'draft' && router.hasRoute('sales.invoices.edit')) {
    router.push({ name: 'sales.invoices.edit', params: { id: invoice.id } })
    return
  }

  if (router.hasRoute('sales.invoices.show')) {
    router.push({ name: 'sales.invoices.show', params: { id: invoice.id } })
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

  if (!costCenterStore.costCenters.length) {
    tasks.push(costCenterStore.fetchCostCenters())
  }
  if (!warehouseStore.warehouses.length) {
    tasks.push(warehouseStore.fetchWarehouses())
  }

  await Promise.allSettled(tasks)
})

onBeforeUnmount(() => {
  if (activeAbortController) {
    activeAbortController.abort()
  }
})
</script>
