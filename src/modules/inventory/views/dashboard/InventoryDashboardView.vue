<!-- src/modules/inventory/views/dashboard/InventoryDashboardView.vue -->
<template>
  <div class="space-y-6 pb-8">
    <!-- =========================================================
           1. الترويسة الزجاجية وشريط الفلاتر التفاعلي
           ========================================================= -->
    <DashboardHeroHeader
      title="لوحة تحكم المخازن والمستودعات"
      subtitle="رقابة حية على تقييم المخزون، حركات الوارد والمنصرف، حدود إعادة الطلب، وصلاحيات التشغيلات"
      :badge="heroStatusBadge"
      :icon="CubeIcon"
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

      <!-- شريط الفلاتر الأربعة -->
      <template #filters>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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

          <!-- فلتر التصنيف -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-text-secondary">تصنيف الأصناف</label>
            <select
              v-model="filters.category_id"
              @change="loadDashboardData"
              class="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            >
              <option :value="null">جميع التصنيفات</option>
              <option v-for="cat in categoryStore.flatCategories" :key="cat.id" :value="cat.id">
                {{ cat.dropdownName || cat.name }}
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
          تعذر تحميل بيانات لوحة تحكم المخازن
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
           3. المحتوى التحليلي والرقابي الكامل للوحة تحكم المخازن
           ========================================================= -->
    <template v-else>
      <!-- أ. صف بطاقات المؤشرات الرئيسية الأربعة (Primary KPIs + Sparklines) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardKpiCard
          title="إجمالي تقييم المخزون"
          :subtitle="`${kpis.total_valuation?.active_products_count || 0} صنف نشط • ${kpis.total_valuation?.warehouses_count || 0} مستودع`"
          :value="kpis.total_valuation?.value || 0"
          :suffix="baseCurrency.code"
          variant="primary"
          :icon="BanknotesIcon"
          :stagger-index="1"
        />

        <DashboardKpiCard
          title="قيمة الوارد المخزني"
          :subtitle="`عدد حركات الوارد: ${kpis.inflow_value?.movements_count || 0} حركة`"
          :value="kpis.inflow_value?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.inflow_value?.growth_percentage"
          :sparkline="kpis.inflow_value?.sparkline || []"
          variant="emerald"
          :icon="ArrowDownTrayIcon"
          :stagger-index="2"
        />

        <DashboardKpiCard
          title="قيمة المنصرف المخزني"
          :subtitle="`عدد حركات الصرف: ${kpis.outflow_value?.movements_count || 0} حركة`"
          :value="kpis.outflow_value?.value || 0"
          :suffix="baseCurrency.code"
          :growth-percentage="kpis.outflow_value?.growth_percentage"
          :sparkline="kpis.outflow_value?.sparkline || []"
          variant="sky"
          :icon="ArrowUpTrayIcon"
          :stagger-index="3"
        />

        <DashboardKpiCard
          title="صافي فروقات التسويات"
          :subtitle="`تالف وفاقد: ${formatCompactAmount(kpis.adjustments_variance?.damage_and_loss_cost || 0)} ${baseCurrency.code}`"
          :value="kpis.adjustments_variance?.net_variance_cost || 0"
          :suffix="baseCurrency.code"
          :variant="
            Number(kpis.adjustments_variance?.net_variance_cost || 0) >= 0 ? 'indigo' : 'rose'
          "
          :icon="ScaleIcon"
          :stagger-index="4"
        />
      </section>

      <!-- ب. شريط المؤشرات التشغيلية الثانوية (الكميات المخزنية، الأسطوانات والأوزان، نواقص إعادة الطلب) -->
      <section
        class="dashboard-enter grid grid-cols-1 md:grid-cols-3 gap-4"
        style="--stagger-index: 2"
      >
        <!-- موقف الكميات المخزنية (الإجمالي / المتاح / المحجوز) -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300"
            >
              <ArchiveBoxIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">الكمية المتاحة للصرف والبيع</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.stock_quantities?.available_quantity || 0) }}
                <span class="text-xs font-bold text-text-muted">وحدة</span>
              </p>
            </div>
          </div>

          <div class="text-left shrink-0 space-y-0.5">
            <span
              class="block rounded-lg bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 tabular-nums"
              dir="ltr"
            >
              محجوز: {{ formatCompactAmount(kpis.stock_quantities?.reserved_quantity || 0) }}
            </span>
            <span class="block text-[10px] font-semibold text-text-muted tabular-nums" dir="ltr">
              الإجمالي: {{ formatCompactAmount(kpis.stock_quantities?.total_quantity || 0) }}
            </span>
          </div>
        </div>

        <!-- ملخص أسطوانات الغاز والأوزان الحية -->
        <div
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:bg-purple-400/20 dark:text-purple-300"
            >
              <FireIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">وزن الغاز الحي بالأسطوانات</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums truncate" dir="ltr">
                {{ formatCompactAmount(kpis.gas_cylinders?.total_gas_weight_kg || 0) }}
                <span class="text-xs font-bold text-text-muted">كجم</span>
              </p>
            </div>
          </div>

          <div class="text-left shrink-0 space-y-0.5">
            <span
              class="block rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums"
            >
              ممتلئ:
              {{
                (kpis.gas_cylinders?.in_stock_count || 0) +
                (kpis.gas_cylinders?.in_service_count || 0)
              }}
            </span>
            <span class="block text-[10px] font-semibold text-text-muted tabular-nums">
              فارغ: {{ kpis.gas_cylinders?.empty_count || 0 }} • لدى المورد:
              {{ kpis.gas_cylinders?.with_vendor_count || 0 }}
            </span>
          </div>
        </div>

        <!-- مؤشر أصناف حد إعادة الطلب -->
        <div
          @click="navigateToRoute('InventoryReportReorderAlerts')"
          class="rounded-xl border border-surface-border bg-surface-card px-5 py-4 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              :class="
                Number(kpis.reorder_alerts?.count || 0) > 0
                  ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300'
                  : 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300'
              "
            >
              <BellAlertIcon class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-text-muted">أصناف دون حد إعادة الطلب</p>
              <p class="text-lg font-extrabold text-text-primary tabular-nums" dir="ltr">
                {{ kpis.reorder_alerts?.count || 0 }}
                <span class="text-xs font-bold text-text-muted">صنف</span>
              </p>
            </div>
          </div>

          <span
            class="rounded-lg px-2.5 py-1 text-xs font-extrabold shrink-0"
            :class="
              Number(kpis.reorder_alerts?.count || 0) > 0
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            "
          >
            {{ Number(kpis.reorder_alerts?.count || 0) > 0 ? 'يتطلب طلب شراء' : 'مخزون آمن' }}
          </span>
        </div>
      </section>

      <!-- ج. شبكة التنبيهات الرقابية (8 بطاقات تفاعلية مقسمة بانتظام 4×2) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardAlertPill
          title="نواقص حد إعادة الطلب"
          :count="alerts.reorder_alerts_count || 0"
          active-description="أصناف بلغت أو انخفضت عن الحد الأدنى"
          empty-description="جميع الأصناف فوق حدود إعادة الطلب"
          variant="amber"
          :icon="BellAlertIcon"
          :stagger-index="3"
          @click="handleAlertNavigation('InventoryReportReorderAlerts', 'نواقص وحدود إعادة الطلب')"
        />

        <DashboardAlertPill
          title="أرصدة مخزنية سالبة"
          :count="alerts.negative_stock_count || 0"
          active-description="أصناف مسجلة بكميات سالبة تتطلب تسوية"
          empty-description="لا توجد أرصدة سالبة في المستودعات"
          variant="rose"
          :icon="ExclamationTriangleIcon"
          :stagger-index="4"
          @click="handleAlertNavigation('InventoryReportStockBalance', 'أرصدة وتقييم المخزون')"
        />

        <DashboardAlertPill
          title="تحويلات مخزنية معلقة"
          :count="alerts.pending_transfers_count || 0"
          active-description="أوامر نقل بين المستودعات بانتظار الاستلام"
          empty-description="جميع التحويلات المخزنية مكتملة"
          variant="sky"
          :icon="ArrowsRightLeftIcon"
          :stagger-index="5"
          @click="handleAlertNavigation('InventoryTransfersList', 'التحويل بين المستودعات')"
        />

        <DashboardAlertPill
          title="تسويات جردية مسودة"
          :count="alerts.draft_adjustments_count || 0"
          active-description="محاضر جرد أو تسويات بانتظار الاعتماد"
          empty-description="كافة التسويات المخزنية معتمدة"
          variant="primary"
          :icon="ClipboardDocumentCheckIcon"
          :stagger-index="6"
          @click="handleAlertNavigation('InventoryAdjustmentsList', 'سجل كافة التسويات')"
        />

        <DashboardAlertPill
          title="تشغيلات منتهية الصلاحية"
          :count="alerts.expired_batches_count || 0"
          active-description="دفعات برصيد قائم تجاوزت تاريخ الصلاحية"
          empty-description="لا توجد تشغيلات منتهية الصلاحية"
          variant="rose"
          :icon="ClockIcon"
          :stagger-index="7"
          @click="handleAlertNavigation('InventoryReportBatchExpiry', 'صلاحيات ودفعات التشغيل')"
        />

        <DashboardAlertPill
          title="تشغيلات قريبة الانتهاء"
          :count="alerts.near_expiry_batches_count || 0"
          active-description="دفعات تنتهي صلاحيتها خلال 60 يوماً"
          empty-description="لا توجد تشغيلات قريبة الانتهاء"
          variant="amber"
          :icon="ClockIcon"
          :stagger-index="8"
          @click="handleAlertNavigation('InventoryReportBatchExpiry', 'صلاحيات ودفعات التشغيل')"
        />

        <DashboardAlertPill
          title="أسطوانات فارغة بالمستودع"
          :count="alerts.empty_cylinders_count || 0"
          active-description="أسطوانات فارغة جاهزة للإرسال للتعبئة"
          empty-description="لا توجد أسطوانات فارغة متراكمة"
          variant="sky"
          :icon="QrCodeIcon"
          :stagger-index="9"
          @click="handleAlertNavigation('InventoryReportSerialTracking', 'تتبع الأرقام التسلسلية')"
        />

        <DashboardAlertPill
          title="أسطوانات عهدة لدى الموردين"
          :count="alerts.with_vendor_cylinders_count || 0"
          active-description="أسطوانات مرسلة للموردين قيد التعبئة"
          empty-description="لا توجد أسطوانات معلقة لدى الموردين"
          variant="primary"
          :icon="TruckIcon"
          :stagger-index="10"
          @click="handleAlertNavigation('InventoryReportSerialTracking', 'تتبع الأرقام التسلسلية')"
        />
      </section>

      <!-- د. شبكة الرسوم البيانية الستة (6 Charts) -->
      <InventoryChartsGrid :charts="charts" :currency-code="baseCurrency.code" />

      <!-- هـ. الرقابة الاستباقية (نواقص إعادة الطلب + صلاحيات التشغيلات + أحدث 8 حركات) -->
      <InventoryAlertsAndMovements
        :reorder-alerts-list="reorderAlertsList"
        :expiring-batches="expiringBatches"
        :recent-movements="recentMovements"
        :base-currency="baseCurrency"
        @view-reorder-report="navigateToRoute('InventoryReportReorderAlerts')"
        @view-expiry-report="navigateToRoute('InventoryReportBatchExpiry')"
        @view-stock-card="navigateToRoute('InventoryReportStockCard')"
        @open-movement="handleOpenMovement"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import inventoryDashboardService from '@/modules/inventory/services/inventoryDashboard.service'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'
import { useCategoryStore } from '@/modules/inventory/stores/categoryStore'
import DashboardHeroHeader from '@/components/dashboard/DashboardHeroHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardAlertPill from '@/components/dashboard/DashboardAlertPill.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import InventoryChartsGrid from './components/InventoryChartsGrid.vue'
import InventoryAlertsAndMovements from './components/InventoryAlertsAndMovements.vue'
import {
  CubeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ScaleIcon,
  ArchiveBoxIcon,
  FireIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  QrCodeIcon,
  TruckIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toast = useToast()
const warehouseStore = useWarehouseStore()
const categoryStore = useCategoryStore()

// --- حالة الفلاتر ---
const filters = reactive({
  warehouse_id: null,
  category_id: null,
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
    reorder_alerts_count: 0,
    negative_stock_count: 0,
    pending_transfers_count: 0,
    draft_adjustments_count: 0,
    expired_batches_count: 0,
    near_expiry_batches_count: 0,
    empty_cylinders_count: 0,
    with_vendor_cylinders_count: 0,
  },
  reorder_alerts_list: [],
  expiring_batches: [],
  recent_movements: [],
})

const initialLoading = computed(() => loading.value && !hasLoadedOnce.value)

// --- استخراج أقسام البيانات بأمان ---
const meta = computed(() => dashboardData.value.meta || {})
const kpis = computed(() => dashboardData.value.kpis || {})
const charts = computed(() => dashboardData.value.charts || {})
const alerts = computed(() => dashboardData.value.alerts || {})
const reorderAlertsList = computed(() => dashboardData.value.reorder_alerts_list || [])
const expiringBatches = computed(() => dashboardData.value.expiring_batches || [])
const recentMovements = computed(() => dashboardData.value.recent_movements || [])

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
  const warehousesCount = Number(kpis.value?.total_valuation?.warehouses_count || 0)
  if (warehousesCount > 0) {
    return `${warehousesCount} مستودع نشط`
  }
  return 'المخازن والمستودعات'
})

const hasCustomFilters = computed(() => {
  return Boolean(
    filters.warehouse_id !== null ||
      filters.category_id !== null ||
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
    const response = await inventoryDashboardService.getDashboardData(
      {
        warehouse_id: filters.warehouse_id,
        category_id: filters.category_id,
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
      reorder_alerts_list: payload.reorder_alerts_list || [],
      expiring_batches: payload.expiring_batches || [],
      recent_movements: payload.recent_movements || [],
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
      err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم لجلب إحصائيات المخازن.'
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
  filters.category_id = null
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

function handleOpenMovement() {
  navigateToRoute('InventoryReportStockCard')
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
  if (!categoryStore.flatCategories.length) {
    tasks.push(categoryStore.fetchCategories())
  }

  await Promise.allSettled(tasks)
})

onBeforeUnmount(() => {
  if (activeAbortController) {
    activeAbortController.abort()
  }
})
</script>
