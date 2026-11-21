<!-- src/modules/purchasing/views/dashboard/components/PurchasingChartsGrid.vue -->
<template>
  <section class="space-y-5">
    <!-- =========================================================
           الصف الأول: المنحنى الزمني للمشتريات والصرف الداخلي (8) + قمع دورة الشراء (4)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8">
        <DashboardChartCard
          title="المنحنى الزمني للمشتريات والصرف الداخلي"
          :subtitle="purchasingTrendSubtitle"
          :icon="PresentationChartLineIcon"
          accent-rgb="99, 102, 241"
          :empty="!hasPurchasingTrend"
          empty-title="لا توجد حركات مشتريات أو صرف مسجلة"
          empty-message="لم تُسجل فواتير مشتريات مرحّلة أو أذونات صرف مخزني ضمن النطاق الزمني المحدد."
          :stagger-index="3"
          height-class="h-80"
        >
          <template #header-extra v-if="hasPurchasingTrend">
            <span
              class="inline-flex items-center rounded-xl border border-indigo-500/35 bg-indigo-500/15 px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300"
            >
              {{ purchasingTrendChart.granularity === 'monthly' ? 'تجميع شهري' : 'تجميع يومي' }}
            </span>
          </template>

          <template #default="{ theme }">
            <Bar :data="purchasingTrendData" :options="getPurchasingTrendOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-4">
        <DashboardChartCard
          title="قمع دورة الشراء والاعتمادات"
          subtitle="توزيع الحالات لطلبات الاحتياج الداخلي وأوامر الشراء"
          :icon="FunnelIcon"
          accent-rgb="14, 165, 233"
          :empty="!hasActiveFunnelData"
          empty-title="لا توجد طلبات أو أوامر شراء"
          empty-message="لم تُسجل طلبات احتياج أو أوامر شراء ضمن الفلاتر المحددة."
          :stagger-index="4"
          height-class="h-80"
        >
          <template #header-extra>
            <div
              class="inline-flex items-center rounded-lg border border-surface-border bg-surface-ground/80 p-0.5 shadow-inner"
            >
              <button
                type="button"
                @click="activeFunnelTab = 'purchase_orders'"
                class="rounded-md px-2 py-1 text-[11px] font-extrabold transition-all cursor-pointer"
                :class="
                  activeFunnelTab === 'purchase_orders'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                "
              >
                الأوامر
              </button>
              <button
                type="button"
                @click="activeFunnelTab = 'requisitions'"
                class="rounded-md px-2 py-1 text-[11px] font-extrabold transition-all cursor-pointer"
                :class="
                  activeFunnelTab === 'requisitions'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                "
              >
                الطلبات
              </button>
            </div>
          </template>

          <template #default="{ theme }">
            <div class="relative h-full w-full flex items-center justify-center">
              <Doughnut
                :data="procurementFunnelData"
                :options="getProcurementFunnelOptions(theme)"
              />
              <!-- إجمالي العدد في منتصف الحلقة -->
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7 text-center"
              >
                <span class="text-[11px] font-bold text-text-muted">
                  {{ activeFunnelTab === 'purchase_orders' ? 'إجمالي الأوامر' : 'إجمالي الطلبات' }}
                </span>
                <span
                  class="mt-0.5 text-lg sm:text-xl font-black text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ totalFunnelCount }}
                </span>
                <span
                  class="mt-0.5 rounded-full bg-sky-500/20 px-2 py-0.2 text-[10px] font-extrabold text-sky-700 dark:text-sky-300"
                >
                  {{ activeFunnelTab === 'purchase_orders' ? 'أمر شراء' : 'طلب احتياج' }}
                </span>
              </div>
            </div>
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- =========================================================
           الصف الثاني: أعلى 6 موردين تعاملاً (6) + أعلى 6 أصناف شراءً (6)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أعلى 6 موردين من حيث حجم التعامل"
          subtitle="الموردون الأكثر توريداً خلال الفترة وموقف المستحقات الآجلة غير المسددة"
          :icon="UserGroupIcon"
          accent-rgb="255, 125, 20"
          :empty="!hasTopSuppliers"
          empty-title="لا توجد فواتير موردين مرحّلة"
          empty-message="ستظهر إحصائيات كبار الموردين فور ترحيل فواتير المشتريات."
          :stagger-index="5"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="topSuppliersData" :options="getTopSuppliersOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أعلى 6 أصناف شراءً وتكلفة"
          subtitle="الأصناف الأكثر استحواذاً على تكلفة المشتريات ومتوسط سعر الوحدة"
          :icon="CubeIcon"
          accent-rgb="245, 158, 11"
          :empty="!hasTopPurchasedProducts"
          empty-title="لا توجد بيانات أصناف مشتراة"
          empty-message="ستظهر أعلى الأصناف شراءً وتكلفتها فور ترحيل فواتير المشتريات."
          :stagger-index="6"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar
              :data="topPurchasedProductsData"
              :options="getTopPurchasedProductsOptions(theme)"
            />
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- =========================================================
           الصف الثالث: استهلاك الأقسام للصرف الداخلي (6) + جودة التوريد للموردين (6)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="توزيع الصرف الداخلي حسب الأقسام"
          subtitle="تكلفة المواد والمستلزمات المنصرفة من المستودعات لكل إدارة أو قسم"
          :icon="BuildingOffice2Icon"
          accent-rgb="168, 85, 247"
          :empty="!hasDepartmentConsumption"
          empty-title="لا توجد أذونات صرف مخزني مؤكدة"
          empty-message="لم تُسجل عمليات صرف داخلي للأقسام ضمن النطاق الزمني المحدد."
          :stagger-index="7"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Doughnut
              :data="departmentConsumptionData"
              :options="getDepartmentConsumptionOptions(theme)"
            />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="تقييم جودة التوريد للموردين"
          subtitle="مقارنة الكميات المقبولة مقابل المرفوضة عند الفحص والاستلام المخزني"
          :icon="ShieldCheckIcon"
          accent-rgb="16, 185, 129"
          :empty="!hasSupplierQuality"
          empty-title="لا توجد بيانات فحص واستلام مخزني"
          empty-message="ستظهر مؤشرات قبول ورفض الكميات الموردة بمجرد تأكيد سندات الاستلام."
          :stagger-index="8"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="supplierQualityData" :options="getSupplierQualityOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  LineController,
  BarController,
  DoughnutController,
  Filler,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import DashboardChartCard from '@/components/dashboard/DashboardChartCard.vue'
import {
  PresentationChartLineIcon,
  FunnelIcon,
  UserGroupIcon,
  CubeIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  LineController,
  BarController,
  DoughnutController,
  Filler,
)

const props = defineProps({
  charts: {
    type: Object,
    default: () => ({}),
  },
  currencyCode: {
    type: String,
    default: 'SDG',
  },
})

// --- دوال إنشاء تدرجات Canvas اللامعة ---
function createVerticalGradient(context, topColor, bottomColor, fallback) {
  const chart = context.chart
  const { ctx, chartArea } = chart
  if (!chartArea) return fallback
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  gradient.addColorStop(0, topColor)
  gradient.addColorStop(1, bottomColor)
  return gradient
}

function createHorizontalGradient(context, startColor, endColor, fallback) {
  const chart = context.chart
  const { ctx, chartArea } = chart
  if (!chartArea) return fallback
  const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
  gradient.addColorStop(0, startColor)
  gradient.addColorStop(1, endColor)
  return gradient
}

// --- أدوات تنسيق الأرقام والتلميحات الموحدة ---
function formatAmount(value) {
  const num = Number(value) || 0
  const hasDecimals = num % 1 !== 0
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(num)

  return `${formatted} ${props.currencyCode}`
}

function formatCompactNumber(value) {
  const num = Number(value) || 0
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(num) >= 10_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(num)
}

function buildBaseTooltip(theme) {
  return {
    backgroundColor: theme.tooltipBg,
    titleColor: theme.tooltipTitle,
    bodyColor: theme.tooltipBody,
    borderColor: theme.tooltipBorder,
    borderWidth: 1,
    padding: 12,
    cornerRadius: 10,
    rtl: true,
    textDirection: 'rtl',
    titleFont: { family: 'Cairo, sans-serif', size: 13, weight: 'bold' },
    bodyFont: { family: 'Cairo, sans-serif', size: 12 },
  }
}

// =========================================================
// 1. المنحنى الزمني للمشتريات والصرف الداخلي (purchasing_trend)
// =========================================================
const purchasingTrendChart = computed(() => props.charts?.purchasing_trend || {})

const purchasingTrendSubtitle = computed(() => {
  return purchasingTrendChart.value?.granularity === 'monthly'
    ? 'مقارنة شهرية لإجمالي المشتريات والمرتجعات وصافي المشتريات والصرف الداخلي'
    : 'مقارنة يومية لإجمالي المشتريات والمرتجعات وصافي المشتريات والصرف الداخلي'
})

const hasPurchasingTrend = computed(() => {
  const labels = purchasingTrendChart.value?.labels || []
  const purchases = purchasingTrendChart.value?.purchases || []
  const returns = purchasingTrendChart.value?.returns || []
  const issues = purchasingTrendChart.value?.internal_issues || []
  return (
    labels.length > 0 &&
    (purchases.some((v) => Number(v) !== 0) ||
      returns.some((v) => Number(v) !== 0) ||
      issues.some((v) => Number(v) !== 0))
  )
})

const purchasingTrendData = computed(() => ({
  labels: purchasingTrendChart.value?.labels || [],
  datasets: [
    {
      type: 'line',
      label: 'صافي المشتريات',
      data: purchasingTrendChart.value?.net_purchases || [],
      borderColor: '#818cf8',
      backgroundColor: (ctx) =>
        createVerticalGradient(
          ctx,
          'rgba(129, 140, 248, 0.34)',
          'rgba(99, 102, 241, 0.0)',
          'rgba(99, 102, 241, 0.18)',
        ),
      fill: true,
      borderWidth: 3.25,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6.5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#6366f1',
      pointBorderWidth: 2.5,
      order: 0,
    },
    {
      type: 'line',
      label: 'الصرف الداخلي للأقسام',
      data: purchasingTrendChart.value?.internal_issues || [],
      borderColor: '#ff9e2c',
      backgroundColor: 'transparent',
      fill: false,
      borderWidth: 2.75,
      borderDash: [5, 4],
      tension: 0.4,
      pointRadius: 3.5,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#ff7d14',
      pointBorderWidth: 2,
      order: 0,
    },
    {
      type: 'bar',
      label: 'إجمالي المشتريات',
      data: purchasingTrendChart.value?.purchases || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#38bdf8', '#2563eb', '#0ea5e9'),
      hoverBackgroundColor: '#38bdf8',
      borderRadius: 7,
      maxBarThickness: 22,
      order: 1,
    },
    {
      type: 'bar',
      label: 'مردودات المشتريات',
      data: purchasingTrendChart.value?.returns || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 7,
      maxBarThickness: 22,
      order: 1,
    },
  ],
}))

function getPurchasingTrendOptions(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        rtl: true,
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.textColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
        },
      },
      y: {
        grid: { color: theme.gridColor },
        border: { display: false },
        ticks: {
          color: theme.mutedColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
          callback: (value) => formatCompactNumber(value),
        },
      },
    },
  }
}

// =========================================================
// 2. قمع دورة الشراء والاعتمادات (procurement_funnel)
// =========================================================
const activeFunnelTab = ref('purchase_orders')
const funnelChart = computed(() => props.charts?.procurement_funnel || {})

const activeFunnelSubchart = computed(() => {
  return funnelChart.value?.[activeFunnelTab.value] || { labels: [], series: [], items: [] }
})

const totalFunnelCount = computed(() => {
  const series = activeFunnelSubchart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasActiveFunnelData = computed(() => {
  const series = activeFunnelSubchart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const procurementFunnelData = computed(() => ({
  labels: activeFunnelSubchart.value?.labels || [],
  datasets: [
    {
      data: activeFunnelSubchart.value?.series || [],
      backgroundColor: (ctx) => {
        const statusPairs = [
          ['#38bdf8', '#2563eb'],
          ['#34d399', '#059669'],
          ['#fbbf24', '#ea580c'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
          ['#94a3b8', '#475569'],
        ]
        const pair = statusPairs[ctx.dataIndex % statusPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
}))

function getProcurementFunnelOptions(theme) {
  const items = activeFunnelSubchart.value?.items || []
  const isOrders = activeFunnelTab.value === 'purchase_orders'

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        rtl: true,
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { family: 'Cairo, sans-serif', size: 11, weight: 'bold' },
        },
      },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => {
            const count = Number(ctx.parsed) || 0
            const total = totalFunnelCount.value || 1
            const pct = ((count / total) * 100).toFixed(1)
            const unit = isOrders ? 'أمر شراء' : 'طلب احتياج'
            const lines = [` ${ctx.label}: ${count} ${unit} (${pct}%)`]
            const item = items[ctx.dataIndex]
            if (isOrders && item?.total_amount !== undefined) {
              lines.push(` إجمالي القيمة: ${formatAmount(item.total_amount)}`)
            }
            return lines
          },
        },
      },
    },
    elements: {
      arc: {
        borderColor: theme.doughnutBorder,
      },
    },
  }
}

// =========================================================
// 3. أعلى 6 موردين من حيث حجم التعامل (top_suppliers)
// =========================================================
const topSuppliersChart = computed(() => props.charts?.top_suppliers || {})

const hasTopSuppliers = computed(() => {
  const series = topSuppliersChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const topSuppliersData = computed(() => ({
  labels: topSuppliersChart.value?.labels || [],
  datasets: [
    {
      label: 'إجمالي المشتريات',
      data: topSuppliersChart.value?.series || [],
      backgroundColor: (ctx) => {
        const palettes = [
          ['#fbbf24', '#ea580c'],
          ['#818cf8', '#4f46e5'],
          ['#38bdf8', '#2563eb'],
          ['#34d399', '#059669'],
          ['#c084fc', '#7e22ce'],
          ['#fb7185', '#e11d48'],
        ]
        const pair = palettes[ctx.dataIndex % palettes.length]
        return createHorizontalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderRadius: 8,
      maxBarThickness: 24,
    },
  ],
}))

function getTopSuppliersOptions(theme) {
  const items = topSuppliersChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` إجمالي المشتريات: ${formatAmount(ctx.parsed.x)}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            const lines = [` عدد الفواتير: ${item.bills_count} فاتورة`]
            if (Number(item.unpaid_balance) > 0) {
              lines.push(` مستحقات غير مسددة: ${formatAmount(item.unpaid_balance)}`)
            }
            return lines
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: theme.gridColor },
        border: { display: false },
        ticks: {
          color: theme.mutedColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
          callback: (val) => formatCompactNumber(val),
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: theme.textColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: 'bold' },
        },
      },
    },
  }
}

// =========================================================
// 4. أعلى 6 أصناف شراءً وتكلفة (top_purchased_products)
// =========================================================
const topProductsChart = computed(() => props.charts?.top_purchased_products || {})

const hasTopPurchasedProducts = computed(() => {
  const series = topProductsChart.value?.cost_series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const topPurchasedProductsData = computed(() => ({
  labels: topProductsChart.value?.labels || [],
  datasets: [
    {
      label: 'التكلفة الإجمالية',
      data: topProductsChart.value?.cost_series || [],
      backgroundColor: (ctx) => {
        const palettes = [
          ['#f59e0b', '#d97706'],
          ['#38bdf8', '#0284c7'],
          ['#818cf8', '#4f46e5'],
          ['#34d399', '#059669'],
          ['#fb7185', '#e11d48'],
          ['#c084fc', '#7e22ce'],
        ]
        const pair = palettes[ctx.dataIndex % palettes.length]
        return createHorizontalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderRadius: 8,
      maxBarThickness: 24,
    },
  ],
}))

function getTopPurchasedProductsOptions(theme) {
  const items = topProductsChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` التكلفة الإجمالية: ${formatAmount(ctx.parsed.x)}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            return [
              ` الكمية المشتراة: ${item.quantity}`,
              ` متوسط سعر الوحدة: ${formatAmount(item.avg_unit_price)}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: theme.gridColor },
        border: { display: false },
        ticks: {
          color: theme.mutedColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
          callback: (val) => formatCompactNumber(val),
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: theme.textColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: 'bold' },
        },
      },
    },
  }
}

// =========================================================
// 5. توزيع الصرف الداخلي حسب الأقسام (department_consumption)
// =========================================================
const departmentChart = computed(() => props.charts?.department_consumption || {})

const totalDepartmentConsumption = computed(() => {
  const series = departmentChart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasDepartmentConsumption = computed(() => {
  const series = departmentChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const departmentConsumptionData = computed(() => ({
  labels: departmentChart.value?.labels || [],
  datasets: [
    {
      data: departmentChart.value?.series || [],
      backgroundColor: (ctx) => {
        const deptPairs = [
          ['#c084fc', '#7c3aed'],
          ['#38bdf8', '#2563eb'],
          ['#ffb703', '#ff7d14'],
          ['#34d399', '#059669'],
          ['#fb7185', '#e11d48'],
          ['#818cf8', '#4f46e5'],
          ['#2dd4bf', '#0d9488'],
          ['#f472b6', '#db2777'],
        ]
        const pair = deptPairs[ctx.dataIndex % deptPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}))

function getDepartmentConsumptionOptions(theme) {
  const items = departmentChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'right',
        rtl: true,
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed) || 0
            const total = totalDepartmentConsumption.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            const item = items[ctx.dataIndex]
            const issuesCount = item?.issues_count ?? 0
            return [
              ` تكلفة الصرف: ${formatAmount(val)} (${pct}%)`,
              ` عدد أذونات الصرف: ${issuesCount} إذن`,
            ]
          },
        },
      },
    },
    elements: {
      arc: {
        borderColor: theme.doughnutBorder,
      },
    },
  }
}

// =========================================================
// 6. تقييم جودة التوريد للموردين (supplier_quality)
// =========================================================
const supplierQualityChart = computed(() => props.charts?.supplier_quality || {})

const hasSupplierQuality = computed(() => {
  const acc = supplierQualityChart.value?.accepted_series || []
  const rej = supplierQualityChart.value?.rejected_series || []
  return acc.length > 0 && (acc.some((v) => Number(v) > 0) || rej.some((v) => Number(v) > 0))
})

const supplierQualityData = computed(() => ({
  labels: supplierQualityChart.value?.labels || [],
  datasets: [
    {
      label: 'الكمية المقبولة',
      data: supplierQualityChart.value?.accepted_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 7,
      maxBarThickness: 24,
    },
    {
      label: 'الكمية المرفوضة',
      data: supplierQualityChart.value?.rejected_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 7,
      maxBarThickness: 24,
    },
  ],
}))

function getSupplierQualityOptions(theme) {
  const items = supplierQualityChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        rtl: true,
        labels: {
          color: theme.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            return [
              ` إجمالي المستلم: ${item.quantity_received}`,
              ` نسبة القبول والجودة: ${item.acceptance_rate}%`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.textColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: 'bold' },
        },
      },
      y: {
        grid: { color: theme.gridColor },
        border: { display: false },
        ticks: {
          color: theme.mutedColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
          callback: (val) => formatCompactNumber(val),
        },
      },
    },
  }
}
</script>
