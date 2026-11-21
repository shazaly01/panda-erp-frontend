<!-- src/modules/purchasing/views/dashboard/PurchasingDashboardView.vue -->
<template>
  <div class="space-y-6 pb-8">
    <!-- =========================================================
           1. الترويسة الزجاجية وشريط الفلاتر التفاعلي
           ========================================================= -->
    <DashboardHeroHeader
      title="لوحة تحكم المشتريات وسلسلة الإمداد"
      subtitle="نظرة تحليلية شاملة على المشتريات، الموردين، أوامر التوريد، الصرف الداخلي، وجودة الاستلام"
      :badge="heroStatusBadge"
      :icon="ShoppingCartIcon"
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
          <!-- فلتر المستودع -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">المستودع / المخزن</label>
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

          <!-- فلتر الإدارة / القسم -->
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

          <!-- فلتر المورد -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">المورد</label>
            <select
              v-model="filters.supplier_id"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع الموردين</option>
              <option
                v-for="supplier in supplierStore.selectorSuppliers"
                :key="supplier.id"
                :value="supplier.id"
              >
                {{ supplier.name }}
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
          تعذر تحميل بيانات لوحة تحكم المشتريات
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
           3. المحتوى التحليلي الكامل للوحة تحكم المشتريات
           ========================================================= -->
    <template v-else>
      <!-- أ. صف بطاقات المؤشرات الرئيسية الأربعة (Primary KPIs + Sparklines) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardKpiCard
          title="إجمالي المشتريات"
          :subtitle="`عدد الفواتير المرحّلة: ${kpis.gross_purchases?.bills_count || 0} فاتورة`"
          :value="kpis.gross_purchases?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.gross_purchases?.growth_percentage"
          :sparkline="kpis.gross_purchases?.sparkline || []"
          variant="indigo"
          :icon="ShoppingCartIcon"
          :stagger-index="1"
        />

        <DashboardKpiCard
          title="مردودات المشتريات"
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
          title="صافي المشتريات"
          subtitle="المشتريات بعد خصم المردودات"
          :value="kpis.net_purchases?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.net_purchases?.growth_percentage"
          :sparkline="kpis.net_purchases?.sparkline || []"
          variant="sky"
          :icon="TruckIcon"
          :stagger-index="3"
        />

        <DashboardKpiCard
          title="الصرف الداخلي للأقسام"
          :subtitle="`عدد أذونات الصرف: ${kpis.internal_issues_cost?.issues_count || 0} إذن`"
          :value="kpis.internal_issues_cost?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.internal_issues_cost?.growth_percentage"
          :invert-growth-color="true"
          :sparkline="kpis.internal_issues_cost?.sparkline || []"
          variant="amber"
          :icon="ClipboardDocumentListIcon"
          :stagger-index="4"
        />
      </section>

      <!-- ب. شريط المؤشرات التشغيلية والمالية الثانوية (المستحقات، المدفوعات، جودة التوريد) -->
      <section
        class="dashboard-enter grid grid-cols-1 md:grid-cols-3 gap-4"
        style="--stagger-index: 2"
      >
        <!-- مستحقات الموردين الآجلة -->
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
              <p class="text-xs font-bold text-text-muted">مستحقات الموردين (تراكمي)</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.payables?.value || 0) }}
                <span class="text-xs font-bold text-text-muted">{{ baseCurrency.code }}</span>
              </p>
            </div>
          </div>

          <div class="text-left shrink-0">
            <span
              class="inline-block rounded-lg px-2.5 py-1 text-[11px] font-extrabold tabular-nums"
              :class="
                Number(kpis.payables?.overdue_amount || 0) > 0
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              "
              dir="ltr"
            >
              {{
                Number(kpis.payables?.overdue_amount || 0) > 0
                  ? `متأخر: ${formatCompactAmount(kpis.payables.overdue_amount)}`
                  : 'لا توجد متأخرات'
              }}
            </span>
          </div>
        </div>

        <!-- المدفوعات المسددة للموردين -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300"
            >
              <BanknotesIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">المدفوعات المسددة للموردين</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.payments_made?.value || 0) }}
                <span class="text-xs font-bold text-text-muted">{{ baseCurrency.code }}</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums shrink-0"
            :class="
              Number(kpis.payments_made?.growth_percentage || 0) >= 0
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                : 'bg-slate-500/15 text-text-secondary'
            "
            dir="ltr"
          >
            {{ Number(kpis.payments_made?.growth_percentage || 0) > 0 ? '+' : ''
            }}{{ Number(kpis.payments_made?.growth_percentage || 0).toFixed(1) }}%
          </span>
        </div>

        <!-- مؤشر جودة الاستلام المخزني -->
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
              <p class="text-xs font-bold text-text-muted">
                معدل جودة الاستلام
                <span
                  v-if="Number(kpis.quality_acceptance?.rejected_quantity || 0) > 0"
                  class="text-[11px] font-semibold text-rose-600 dark:text-rose-400"
                >
                  (مرفوض: {{ kpis.quality_acceptance.rejected_quantity }})
                </span>
              </p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums" dir="ltr">
                {{ Number(kpis.quality_acceptance?.acceptance_rate ?? 100).toFixed(1) }}%
                <span class="text-xs font-bold text-text-muted">مطابق</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold tabular-nums shrink-0"
            :class="
              Number(kpis.quality_acceptance?.acceptance_rate ?? 100) >= 95
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            "
            dir="ltr"
          >
            مقبول: {{ kpis.quality_acceptance?.accepted_quantity || 0 }}
          </span>
        </div>
      </section>

      <!-- ج. شبكة التنبيهات التشغيلية (9 بطاقات تفاعلية مقسمة بانتظام) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardAlertPill
          title="طلبات شراء بانتظار الاعتماد"
          :count="alerts.pending_requisitions_count || 0"
          active-description="طلبات احتياج مرفوعة تنتظر الموافقة"
          empty-description="لا توجد طلبات شراء معلقة للاعتماد"
          variant="amber"
          :icon="ClipboardDocumentCheckIcon"
          :stagger-index="3"
          @click="handleAlertNavigation('purchasing.requisitions.index', 'طلبات الشراء الداخلية')"
        />

        <DashboardAlertPill
          title="طلبات احتياج عاجلة"
          :count="alerts.urgent_requisitions_count || 0"
          active-description="طلبات ذات أولوية قصوى تتطلب معالجة فورية"
          empty-description="لا توجد طلبات عاجلة مفتوحة حالياً"
          variant="rose"
          :icon="FireIcon"
          :stagger-index="4"
          @click="handleAlertNavigation('purchasing.requisitions.index', 'طلبات الشراء الداخلية')"
        />

        <DashboardAlertPill
          title="أوامر شراء متأخرة التوريد"
          :count="alerts.overdue_orders_count || 0"
          active-description="تجاوزت تاريخ التسليم المتوقع من المورد"
          empty-description="جميع أوامر التوريد ضمن الجدول الزمني"
          variant="rose"
          :icon="ExclamationCircleIcon"
          :stagger-index="5"
          @click="handleAlertNavigation('purchasing.orders.index', 'أوامر الشراء والتوريد')"
        />

        <DashboardAlertPill
          title="أوامر شراء مسودة"
          :count="alerts.draft_orders_count || 0"
          active-description="أوامر شراء غير مؤكدة بانتظار الإرسال"
          empty-description="لا توجد مسودات أوامر شراء حالياً"
          variant="sky"
          :icon="DocumentTextIcon"
          :stagger-index="6"
          @click="handleAlertNavigation('purchasing.orders.index', 'أوامر الشراء والتوريد')"
        />

        <DashboardAlertPill
          title="سندات استلام مسودة"
          :count="alerts.draft_receipts_count || 0"
          active-description="شحنات واردة بانتظار تأكيد الاستلام المخزني"
          empty-description="كافة سندات الاستلام مؤكدة ومرحّلة"
          variant="amber"
          :icon="ArchiveBoxArrowDownIcon"
          :stagger-index="7"
          @click="handleAlertNavigation('purchasing.receipts.index', 'سندات الاستلام المخزني')"
        />

        <DashboardAlertPill
          title="أذونات صرف مسودة"
          :count="alerts.draft_issues_count || 0"
          active-description="أذونات صرف للأقسام بانتظار التأكيد والخصم"
          empty-description="جميع أذونات الصرف المخزني مؤكدة"
          variant="sky"
          :icon="QueueListIcon"
          :stagger-index="8"
          @click="handleAlertNavigation('purchasing.issues.index', 'أذونات الصرف المخزني')"
        />

        <DashboardAlertPill
          title="فواتير مشتريات مسودة"
          :count="alerts.draft_bills_count || 0"
          active-description="فواتير شراء غير مرحّلة محاسبياً بعد"
          empty-description="كافة فواتير المشتريات مرحّلة للدفاتر"
          variant="amber"
          :icon="DocumentDuplicateIcon"
          :stagger-index="9"
          @click="handleAlertNavigation('purchasing.bills.index', 'فواتير الشراء المباشر')"
        />

        <DashboardAlertPill
          title="فواتير موردين متأخرة السداد"
          :count="alerts.overdue_bills_count || 0"
          active-description="فواتير آجلة تجاوزت تاريخ الاستحقاق"
          empty-description="لا توجد مستحقات متأخرة السداد للموردين"
          variant="rose"
          :icon="BanknotesIcon"
          :stagger-index="10"
          @click="handleAlertNavigation('purchasing.bills.index', 'فواتير الشراء المباشر')"
        />

        <DashboardAlertPill
          title="عُهد وأسطوانات لدى الموردين"
          :count="alerts.pending_vendor_serials_count || 0"
          active-description="سيريالات وعُهد قيد التعبئة أو الاستبدال لدى المورد"
          empty-description="لا توجد عُهد معلقة لدى الموردين حالياً"
          variant="primary"
          :icon="ArrowPathRoundedSquareIcon"
          :stagger-index="11"
          @click="handleAlertNavigation('purchasing.receipts.index', 'سندات الاستلام المخزني')"
        />
      </section>

      <!-- د. شبكة الرسوم البيانية الستة (6 Charts) -->
      <PurchasingChartsGrid :charts="charts" :currency-code="baseCurrency.code" />

      <!-- هـ. متابعة أوامر الشراء المفتوحة وأحدث 8 فواتير مشتريات -->
      <PurchasingOrdersAndBills
        :open-purchase-orders="openPurchaseOrders"
        :recent-bills="recentBills"
        :base-currency="baseCurrency"
        @open-order="handleOpenOrder"
        @view-all-orders="navigateToRoute('purchasing.orders.index')"
        @open-bill="handleOpenBill"
        @view-all-bills="navigateToRoute('purchasing.bills.index')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import purchasingDashboardService from '@/modules/purchasing/services/purchasingDashboard.service'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useSupplierStore } from '@/modules/purchasing/stores/supplierStore'
import DashboardHeroHeader from '@/components/dashboard/DashboardHeroHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardAlertPill from '@/components/dashboard/DashboardAlertPill.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import PurchasingChartsGrid from './components/PurchasingChartsGrid.vue'
import PurchasingOrdersAndBills from './components/PurchasingOrdersAndBills.vue'
import {
  ShoppingCartIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowUturnLeftIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  FireIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ArchiveBoxArrowDownIcon,
  QueueListIcon,
  DocumentDuplicateIcon,
  ArrowPathRoundedSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const warehouseStore = useWarehouseStore()
const departmentStore = useDepartmentStore()
const supplierStore = useSupplierStore()

// --- حالة الفلاتر ---
const filters = reactive({
  warehouse_id: null,
  department_id: null,
  supplier_id: null,
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
    pending_requisitions_count: 0,
    urgent_requisitions_count: 0,
    draft_orders_count: 0,
    overdue_orders_count: 0,
    draft_receipts_count: 0,
    draft_issues_count: 0,
    draft_bills_count: 0,
    overdue_bills_count: 0,
    pending_vendor_serials_count: 0,
  },
  open_purchase_orders: [],
  recent_bills: [],
})

const initialLoading = computed(() => loading.value && !hasLoadedOnce.value)

// --- استخراج أقسام البيانات بأمان ---
const meta = computed(() => dashboardData.value.meta || {})
const kpis = computed(() => dashboardData.value.kpis || {})
const charts = computed(() => dashboardData.value.charts || {})
const alerts = computed(() => dashboardData.value.alerts || {})
const openPurchaseOrders = computed(() => dashboardData.value.open_purchase_orders || [])
const recentBills = computed(() => dashboardData.value.recent_bills || [])

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
  const openCount = openPurchaseOrders.value.length
  if (openCount > 0) {
    return `${openCount} أمر توريد نشط`
  }
  return 'المشتريات وسلسلة الإمداد'
})

const hasCustomFilters = computed(() => {
  return Boolean(
    filters.warehouse_id !== null ||
      filters.department_id !== null ||
      filters.supplier_id !== null ||
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
    const response = await purchasingDashboardService.getDashboardData(
      {
        warehouse_id: filters.warehouse_id,
        department_id: filters.department_id,
        supplier_id: filters.supplier_id,
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
      open_purchase_orders: payload.open_purchase_orders || [],
      recent_bills: payload.recent_bills || [],
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
      err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم لجلب إحصائيات المشتريات.'
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
  filters.warehouse_id = null
  filters.department_id = null
  filters.supplier_id = null
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

function handleOpenOrder(order) {
  if (!order?.id) return

  if (order.status === 'draft' && router.hasRoute('purchasing.orders.edit')) {
    router.push({ name: 'purchasing.orders.edit', params: { id: order.id } })
    return
  }

  if (router.hasRoute('purchasing.orders.show')) {
    router.push({ name: 'purchasing.orders.show', params: { id: order.id } })
  }
}

function handleOpenBill(bill) {
  if (!bill?.id) return

  if (bill.status === 'draft' && router.hasRoute('purchasing.bills.edit')) {
    router.push({ name: 'purchasing.bills.edit', params: { id: bill.id } })
    return
  }

  if (router.hasRoute('purchasing.bills.show')) {
    router.push({ name: 'purchasing.bills.show', params: { id: bill.id } })
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

  if (!warehouseStore.warehouses.length) {
    tasks.push(warehouseStore.fetchWarehouses())
  }
  if (!departmentStore.flatDepartments.length) {
    tasks.push(departmentStore.fetchDepartments())
  }
  if (!supplierStore.selectorSuppliers.length) {
    tasks.push(supplierStore.fetchSuppliersSelector())
  }

  await Promise.allSettled(tasks)
})

onBeforeUnmount(() => {
  if (activeAbortController) {
    activeAbortController.abort()
  }
})
</script>
