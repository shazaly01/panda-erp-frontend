<!-- src/modules/inventory/views/dashboard/components/InventoryChartsGrid.vue -->
<template>
  <section class="space-y-5">
    <!-- =========================================================
           الصف الأول: المنحنى الزمني للحركات المخزنية (8) + تقييم المستودعات (4)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8">
        <DashboardChartCard
          title="المنحنى الزمني لقيمة الوارد والمنصرف"
          :subtitle="movementsTrendSubtitle"
          :icon="PresentationChartLineIcon"
          accent-rgb="14, 165, 233"
          :empty="!hasMovementsTrend"
          empty-title="لا توجد حركات مخزنية مسجلة"
          empty-message="لم تُسجل حركات وارد أو منصرف مخزني ضمن النطاق الزمني المحدد."
          :stagger-index="3"
          height-class="h-80"
        >
          <template #header-extra v-if="hasMovementsTrend">
            <span
              class="inline-flex items-center rounded-xl border border-sky-500/35 bg-sky-500/15 px-2.5 py-1 text-[11px] font-extrabold text-sky-700 dark:text-sky-300"
            >
              {{ movementsTrendChart.granularity === 'monthly' ? 'تجميع شهري' : 'تجميع يومي' }}
            </span>
          </template>

          <template #default="{ theme }">
            <Bar :data="movementsTrendData" :options="getMovementsTrendOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-4">
        <DashboardChartCard
          title="توزيع تقييم المخزون حسب المستودعات"
          subtitle="نسبة القيمة الدفترية للمخزون المتاح في كل مستودع"
          :icon="BuildingOffice2Icon"
          accent-rgb="16, 185, 129"
          :empty="!hasValuationByWarehouse"
          empty-title="لا توجد أرصدة مقيمة بالمستودعات"
          empty-message="ستظهر نسب توزيع تقييم المخزون بمجرد توفر كميات وتكاليف للأصناف."
          :stagger-index="4"
          height-class="h-80"
        >
          <template #default="{ theme }">
            <div class="relative h-full w-full flex items-center justify-center">
              <Doughnut
                :data="valuationByWarehouseData"
                :options="getValuationByWarehouseOptions(theme)"
              />
              <!-- إجمالي التقييم في منتصف الحلقة -->
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7 text-center"
              >
                <span class="text-[11px] font-bold text-text-muted">إجمالي التقييم</span>
                <span
                  class="mt-0.5 text-base sm:text-lg font-black text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ formatCompactNumber(totalWarehouseValuation) }}
                </span>
                <span
                  class="mt-0.5 rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300"
                >
                  {{ currencyCode }}
                </span>
              </div>
            </div>
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- =========================================================
           الصف الثاني: تقييم المخزون حسب التصنيفات (6) + الحركات حسب النوع (6)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="توزيع تقييم المخزون حسب التصنيفات"
          subtitle="تركّز القيمة المالية للمخزون عبر مجموعات وتصنيفات الأصناف"
          :icon="FolderIcon"
          accent-rgb="99, 102, 241"
          :empty="!hasValuationByCategory"
          empty-title="لا توجد بيانات تقييم للتصنيفات"
          empty-message="ستظهر حصص التصنيفات بمجرد توفر أرصدة مخزنية للأصناف المصنفة."
          :stagger-index="5"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Doughnut
              :data="valuationByCategoryData"
              :options="getValuationByCategoryOptions(theme)"
            />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="تحليل الحركات المخزنية حسب النوع"
          subtitle="إجمالي التكلفة وعدد العمليات لكل نوع حركة (مشتريات، مبيعات، تحويلات، تسويات)"
          :icon="ArrowsRightLeftIcon"
          accent-rgb="255, 125, 20"
          :empty="!hasMovementsByType"
          empty-title="لا توجد حركات مصنفة خلال الفترة"
          empty-message="لم تُسجل حركات مخزنية مطابقة للفلاتر والنطاق الزمني المحدد."
          :stagger-index="6"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="movementsByTypeData" :options="getMovementsByTypeOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- =========================================================
           الصف الثالث: حالات الأرقام التسلسلية والأسطوانات (6) + أعلى 6 أصناف حركةً (6)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="التوزيع الحي لحالات الأرقام التسلسلية والأسطوانات"
          subtitle="متابعة أعداد الأسطوانات وأوزان الغاز الحية حسب الحالة التشغيلية"
          :icon="QrCodeIcon"
          accent-rgb="168, 85, 247"
          :empty="!hasSerialsByStatus"
          empty-title="لا توجد أرقام تسلسلية أو أسطوانات مسجلة"
          empty-message="ستظهر إحصائيات حالات الأسطوانات وأوزانها بمجرد تسجيل أرقام تسلسلية في النظام."
          :stagger-index="7"
          height-class="h-72 sm:h-80"
        >
          <template #header-extra v-if="hasSerialsByStatus">
            <div
              class="inline-flex items-center rounded-lg border border-surface-border bg-surface-ground/80 p-0.5 shadow-inner"
            >
              <button
                type="button"
                @click="activeSerialMetric = 'count'"
                class="rounded-md px-2.5 py-1 text-[11px] font-extrabold transition-all cursor-pointer"
                :class="
                  activeSerialMetric === 'count'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                "
              >
                العدد
              </button>
              <button
                type="button"
                @click="activeSerialMetric = 'weight'"
                class="rounded-md px-2.5 py-1 text-[11px] font-extrabold transition-all cursor-pointer"
                :class="
                  activeSerialMetric === 'weight'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                "
              >
                الوزن (كجم)
              </button>
            </div>
          </template>

          <template #default="{ theme }">
            <Bar :data="serialsByStatusData" :options="getSerialsByStatusOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أعلى 6 أصناف حركةً واستهلاكاً"
          subtitle="الأصناف الأعلى من حيث قيمة المنصرف المخزني ومقارنتها بالرصيد المتاح حالياً"
          :icon="FireIcon"
          accent-rgb="245, 158, 11"
          :empty="!hasTopMovedProducts"
          empty-title="لا توجد حركات صرف للأصناف"
          empty-message="ستظهر الأصناف الأكثر حركة واستهلاكاً فور تسجيل عمليات صرف أو مبيعات."
          :stagger-index="8"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="topMovedProductsData" :options="getTopMovedProductsOptions(theme)" />
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
  BuildingOffice2Icon,
  FolderIcon,
  ArrowsRightLeftIcon,
  QrCodeIcon,
  FireIcon,
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

function formatNumber(value) {
  const num = Number(value) || 0
  const hasDecimals = num % 1 !== 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(num)
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
// 1. المنحنى الزمني لقيمة الوارد والمنصرف (movements_trend)
// =========================================================
const movementsTrendChart = computed(() => props.charts?.movements_trend || {})

const movementsTrendSubtitle = computed(() => {
  return movementsTrendChart.value?.granularity === 'monthly'
    ? 'مقارنة شهرية لقيمة الوارد المخزني مقابل المنصرف وصافي الحركة'
    : 'مقارنة يومية لقيمة الوارد المخزني مقابل المنصرف وصافي الحركة'
})

const hasMovementsTrend = computed(() => {
  const labels = movementsTrendChart.value?.labels || []
  const inflow = movementsTrendChart.value?.inflow || []
  const outflow = movementsTrendChart.value?.outflow || []
  return (
    labels.length > 0 &&
    (inflow.some((v) => Number(v) !== 0) || outflow.some((v) => Number(v) !== 0))
  )
})

const movementsTrendData = computed(() => ({
  labels: movementsTrendChart.value?.labels || [],
  datasets: [
    {
      type: 'line',
      label: 'صافي الحركة',
      data: movementsTrendChart.value?.net || [],
      borderColor: '#38bdf8',
      backgroundColor: (ctx) =>
        createVerticalGradient(
          ctx,
          'rgba(56, 189, 248, 0.34)',
          'rgba(14, 165, 233, 0.0)',
          'rgba(14, 165, 233, 0.18)',
        ),
      fill: true,
      borderWidth: 3.25,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6.5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#0ea5e9',
      pointBorderWidth: 2.5,
      order: 0,
    },
    {
      type: 'bar',
      label: 'قيمة الوارد',
      data: movementsTrendChart.value?.inflow || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 7,
      maxBarThickness: 22,
      order: 1,
    },
    {
      type: 'bar',
      label: 'قيمة المنصرف',
      data: movementsTrendChart.value?.outflow || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 7,
      maxBarThickness: 22,
      order: 1,
    },
  ],
}))

function getMovementsTrendOptions(theme) {
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
// 2. توزيع تقييم المخزون حسب المستودعات (valuation_by_warehouse)
// =========================================================
const warehouseValuationChart = computed(() => props.charts?.valuation_by_warehouse || {})

const totalWarehouseValuation = computed(() => {
  const series = warehouseValuationChart.value?.valuation_series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasValuationByWarehouse = computed(() => {
  const series = warehouseValuationChart.value?.valuation_series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const valuationByWarehouseData = computed(() => ({
  labels: warehouseValuationChart.value?.labels || [],
  datasets: [
    {
      data: warehouseValuationChart.value?.valuation_series || [],
      backgroundColor: (ctx) => {
        const warehousePairs = [
          ['#34d399', '#059669'],
          ['#38bdf8', '#1d4ed8'],
          ['#fbbf24', '#ea580c'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
          ['#2dd4bf', '#0d9488'],
        ]
        const pair = warehousePairs[ctx.dataIndex % warehousePairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
}))

function getValuationByWarehouseOptions(theme) {
  const items = warehouseValuationChart.value?.items || []
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
            const val = Number(ctx.parsed) || 0
            const total = totalWarehouseValuation.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            const item = items[ctx.dataIndex]
            const lines = [` القيمة: ${formatAmount(val)} (${pct}%)`]
            if (item) {
              lines.push(` عدد الأصناف: ${item.products_count} صنف`)
              lines.push(` إجمالي الكميات: ${formatNumber(item.total_quantity)}`)
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
// 3. توزيع تقييم المخزون حسب التصنيفات (valuation_by_category)
// =========================================================
const categoryValuationChart = computed(() => props.charts?.valuation_by_category || {})

const totalCategoryValuation = computed(() => {
  const series = categoryValuationChart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasValuationByCategory = computed(() => {
  const series = categoryValuationChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const valuationByCategoryData = computed(() => ({
  labels: categoryValuationChart.value?.labels || [],
  datasets: [
    {
      data: categoryValuationChart.value?.series || [],
      backgroundColor: (ctx) => {
        const categoryPairs = [
          ['#818cf8', '#4f46e5'],
          ['#38bdf8', '#2563eb'],
          ['#ffb703', '#ff7d14'],
          ['#34d399', '#059669'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
          ['#2dd4bf', '#0d9488'],
          ['#f472b6', '#db2777'],
        ]
        const pair = categoryPairs[ctx.dataIndex % categoryPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}))

function getValuationByCategoryOptions(theme) {
  const items = categoryValuationChart.value?.items || []
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
            const total = totalCategoryValuation.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            const item = items[ctx.dataIndex]
            const lines = [` القيمة: ${formatAmount(val)} (${pct}%)`]
            if (item) {
              lines.push(` عدد الأصناف: ${item.products_count} صنف`)
              lines.push(` إجمالي الكميات: ${formatNumber(item.total_quantity)}`)
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
// 4. تحليل الحركات المخزنية حسب النوع (movements_by_type)
// =========================================================
const movementsByTypeChart = computed(() => props.charts?.movements_by_type || {})

const hasMovementsByType = computed(() => {
  const series = movementsByTypeChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const movementsByTypeData = computed(() => {
  const items = movementsByTypeChart.value?.items || []
  return {
    labels: movementsByTypeChart.value?.labels || [],
    datasets: [
      {
        label: 'تكلفة الحركات',
        data: movementsByTypeChart.value?.series || [],
        backgroundColor: (ctx) => {
          const item = items[ctx.dataIndex]
          if (item?.direction === 'in') {
            return createHorizontalGradient(ctx, '#34d399', '#059669', '#10b981')
          }
          return createHorizontalGradient(ctx, '#fb923c', '#e11d48', '#ff7d14')
        },
        borderRadius: 8,
        maxBarThickness: 24,
      },
    ],
  }
})

function getMovementsByTypeOptions(theme) {
  const items = movementsByTypeChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` إجمالي التكلفة: ${formatAmount(ctx.parsed.x)}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            return [
              ` الاتجاه: ${item.direction === 'in' ? 'وارد مخزني (+)' : 'منصرف مخزني (-)'}`,
              ` عدد الحركات: ${item.movements_count} حركة`,
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
// 5. التوزيع الحي لحالات الأرقام التسلسلية والأسطوانات (serials_by_status)
// =========================================================
const activeSerialMetric = ref('count') // 'count' | 'weight'
const serialsByStatusChart = computed(() => props.charts?.serials_by_status || {})

const hasSerialsByStatus = computed(() => {
  const counts = serialsByStatusChart.value?.count_series || []
  const weights = serialsByStatusChart.value?.weight_series || []
  return counts.some((v) => Number(v) > 0) || weights.some((v) => Number(v) > 0)
})

const serialsByStatusData = computed(() => {
  const isCount = activeSerialMetric.value === 'count'
  return {
    labels: serialsByStatusChart.value?.labels || [],
    datasets: [
      {
        label: isCount ? 'عدد الأسطوانات / السيريالات' : 'وزن الغاز الحي (كجم)',
        data: isCount
          ? serialsByStatusChart.value?.count_series || []
          : serialsByStatusChart.value?.weight_series || [],
        backgroundColor: (ctx) => {
          const palettes = isCount
            ? [
                ['#c084fc', '#7c3aed'],
                ['#38bdf8', '#2563eb'],
                ['#34d399', '#059669'],
                ['#fbbf24', '#ea580c'],
                ['#fb7185', '#e11d48'],
              ]
            : [
                ['#38bdf8', '#0284c7'],
                ['#34d399', '#059669'],
                ['#818cf8', '#4f46e5'],
                ['#fbbf24', '#d97706'],
                ['#2dd4bf', '#0d9488'],
              ]
          const pair = palettes[ctx.dataIndex % palettes.length]
          return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
        },
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  }
})

function getSerialsByStatusOptions(theme) {
  const items = serialsByStatusChart.value?.items || []
  const isCount = activeSerialMetric.value === 'count'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => {
            if (isCount) {
              return ` العدد: ${formatNumber(ctx.parsed.y)} وحدة`
            }
            return ` وزن الغاز: ${formatNumber(ctx.parsed.y)} كجم`
          },
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            return isCount
              ? [` إجمالي وزن الغاز: ${formatNumber(item.gas_weight_kg)} كجم`]
              : [` عدد الوحدات: ${formatNumber(item.count)} وحدة`]
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

// =========================================================
// 6. أعلى 6 أصناف حركةً واستهلاكاً (top_moved_products)
// =========================================================
const topMovedProductsChart = computed(() => props.charts?.top_moved_products || {})

const hasTopMovedProducts = computed(() => {
  const series = topMovedProductsChart.value?.cost_series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const topMovedProductsData = computed(() => ({
  labels: topMovedProductsChart.value?.labels || [],
  datasets: [
    {
      label: 'تكلفة المنصرف',
      data: topMovedProductsChart.value?.cost_series || [],
      backgroundColor: (ctx) => {
        const palettes = [
          ['#fbbf24', '#ea580c'],
          ['#fb7185', '#e11d48'],
          ['#38bdf8', '#2563eb'],
          ['#818cf8', '#4f46e5'],
          ['#34d399', '#059669'],
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

function getTopMovedProductsOptions(theme) {
  const items = topMovedProductsChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` تكلفة المنصرف: ${formatAmount(ctx.parsed.x)}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            const lines = [
              ` الكمية المنصرفة: ${formatNumber(item.out_quantity)}`,
              ` عدد الحركات: ${item.movements_count} حركة`,
              ` الرصيد المتاح حالياً: ${formatNumber(item.available_stock)}`,
            ]
            if (item.sku) {
              lines.unshift(` رمز الصنف (SKU): ${item.sku}`)
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
</script>
