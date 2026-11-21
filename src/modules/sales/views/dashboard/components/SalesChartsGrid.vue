<!-- src/modules/sales/views/dashboard/components/SalesChartsGrid.vue -->
<template>
  <section class="space-y-5">
    <!-- =========================================================
           الصف الأول: المنحنى الزمني للمبيعات والأرباح (8) + قنوات البيع (4)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8">
        <DashboardChartCard
          title="المنحنى الزمني للمبيعات والأرباح"
          :subtitle="salesTrendSubtitle"
          :icon="PresentationChartLineIcon"
          accent-rgb="255, 125, 20"
          :empty="!hasSalesTrend"
          empty-title="لا توجد حركات مبيعات مسجلة"
          empty-message="لم تُسجل فواتير مبيعات أو مرتجعات مؤكدة ضمن النطاق الزمني المحدد."
          :stagger-index="3"
          height-class="h-80"
        >
          <template #header-extra v-if="hasSalesTrend">
            <span
              class="inline-flex items-center rounded-xl border border-primary/35 bg-primary/15 px-2.5 py-1 text-[11px] font-extrabold text-primary dark:text-primary-light"
            >
              {{ salesTrendChart.granularity === 'monthly' ? 'تجميع شهري' : 'تجميع يومي' }}
            </span>
          </template>

          <template #default="{ theme }">
            <Bar :data="salesTrendData" :options="getSalesTrendOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-4">
        <DashboardChartCard
          title="المبيعات حسب قناة البيع"
          subtitle="توزيع الإيرادات وعدد الفواتير بين نقاط البيع والفواتير المباشرة"
          :icon="ChartPieIcon"
          accent-rgb="14, 165, 233"
          :empty="!hasSalesByChannel"
          empty-title="لا توجد مبيعات مصنفة حسب القناة"
          empty-message="ستظهر نسب توزيع قنوات البيع بمجرد إصدار فواتير أو عمليات كاشير."
          :stagger-index="4"
          height-class="h-80"
        >
          <template #default="{ theme }">
            <div class="relative h-full w-full flex items-center justify-center">
              <Doughnut :data="salesByChannelData" :options="getSalesByChannelOptions(theme)" />
              <!-- إجمالي مبيعات القنوات في منتصف الحلقة -->
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7 text-center"
              >
                <span class="text-[11px] font-bold text-text-muted">إجمالي القنوات</span>
                <span
                  class="mt-0.5 text-base sm:text-lg font-black text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ formatCompactNumber(totalChannelsAmount) }}
                </span>
                <span
                  class="mt-0.5 rounded-full bg-sky-500/20 px-2 py-0.2 text-[10px] font-extrabold text-sky-600 dark:text-sky-300"
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
           الصف الثاني: وسائل الدفع (6) + أعلى 6 أصناف مبيعاً وربحية (6)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="توزيع التحصيلات حسب وسيلة الدفع"
          subtitle="المقبوضات الفعلية موزعة بين النقدي والشبكة والتحويلات البنكية"
          :icon="CreditCardIcon"
          accent-rgb="16, 185, 129"
          :empty="!hasPaymentMethods"
          empty-title="لا توجد تحصيلات مسجلة"
          empty-message="لم تُسجل دفعات أو سندات قبض على فواتير المبيعات خلال الفترة المحددة."
          :stagger-index="5"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Doughnut :data="paymentMethodsData" :options="getPaymentMethodsOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أعلى 6 أصناف مبيعاً وربحية"
          subtitle="مقارنة إجمالي الإيراد ومجمل الربح المحقق للأصناف الأكثر طلباً"
          :icon="CubeIcon"
          accent-rgb="245, 158, 11"
          :empty="!hasTopProducts"
          empty-title="لا توجد بيانات أصناف مباعة"
          empty-message="ستظهر أعلى الأصناف مبيعاً وهامش ربحها فور تأكيد فواتير المبيعات."
          :stagger-index="6"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="topProductsData" :options="getTopProductsOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- =========================================================
           الصف الثالث: أعلى 6 عملاء شراءً (6) + أداء الموظفين والكاشيرين (6)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أعلى 6 عملاء شراءً"
          subtitle="العملاء الأكثر مساهمة في المبيعات وموقف الأرصدة الآجلة غير المسددة"
          :icon="UsersIcon"
          accent-rgb="99, 102, 241"
          :empty="!hasTopCustomers"
          empty-title="لا توجد بيانات عملاء مسجلين"
          empty-message="لم تُسجل فواتير مرتبطة بعملاء مسجلين ضمن الفلاتر المحددة."
          :stagger-index="7"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="topCustomersData" :options="getTopCustomersOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أداء الموظفين والكاشيرين"
          subtitle="حجم المبيعات المحققة وعدد الفواتير المنجزة لكل موظف"
          :icon="UserGroupIcon"
          accent-rgb="168, 85, 247"
          :empty="!hasCashierPerformance"
          empty-title="لا توجد بيانات أداء للموظفين"
          empty-message="ستظهر إحصائيات الموظفين والكاشيرين بمجرد إصدار فواتير مؤكدة."
          :stagger-index="8"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="cashierPerformanceData" :options="getCashierPerformanceOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
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
  ChartPieIcon,
  CreditCardIcon,
  CubeIcon,
  UsersIcon,
  UserGroupIcon,
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
// 1. المنحنى الزمني للمبيعات والأرباح (sales_trend)
// =========================================================
const salesTrendChart = computed(() => props.charts?.sales_trend || {})

const salesTrendSubtitle = computed(() => {
  return salesTrendChart.value?.granularity === 'monthly'
    ? 'مقارنة شهرية لإجمالي المبيعات والمرتجعات وصافي المبيعات ومجمل الربح'
    : 'مقارنة يومية لإجمالي المبيعات والمرتجعات وصافي المبيعات ومجمل الربح'
})

const hasSalesTrend = computed(() => {
  const labels = salesTrendChart.value?.labels || []
  const sales = salesTrendChart.value?.sales || []
  const returns = salesTrendChart.value?.returns || []
  return (
    labels.length > 0 &&
    (sales.some((v) => Number(v) !== 0) || returns.some((v) => Number(v) !== 0))
  )
})

const salesTrendData = computed(() => ({
  labels: salesTrendChart.value?.labels || [],
  datasets: [
    {
      type: 'line',
      label: 'صافي المبيعات',
      data: salesTrendChart.value?.net_sales || [],
      borderColor: '#ff9e2c',
      backgroundColor: (ctx) =>
        createVerticalGradient(
          ctx,
          'rgba(255, 145, 36, 0.34)',
          'rgba(255, 125, 20, 0.0)',
          'rgba(255, 125, 20, 0.18)',
        ),
      fill: true,
      borderWidth: 3.25,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6.5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#ff7d14',
      pointBorderWidth: 2.5,
      order: 0,
    },
    {
      type: 'line',
      label: 'مجمل الربح',
      data: salesTrendChart.value?.profit || [],
      borderColor: '#38bdf8',
      backgroundColor: 'transparent',
      fill: false,
      borderWidth: 2.75,
      borderDash: [5, 4],
      tension: 0.4,
      pointRadius: 3.5,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#0ea5e9',
      pointBorderWidth: 2,
      order: 0,
    },
    {
      type: 'bar',
      label: 'إجمالي المبيعات',
      data: salesTrendChart.value?.sales || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 7,
      maxBarThickness: 22,
      order: 1,
    },
    {
      type: 'bar',
      label: 'المرتجعات',
      data: salesTrendChart.value?.returns || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 7,
      maxBarThickness: 22,
      order: 1,
    },
  ],
}))

function getSalesTrendOptions(theme) {
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
// 2. المبيعات حسب قناة البيع (sales_by_channel)
// =========================================================
const salesByChannelChart = computed(() => props.charts?.sales_by_channel || {})

const totalChannelsAmount = computed(() => {
  const series = salesByChannelChart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasSalesByChannel = computed(() => {
  const series = salesByChannelChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const salesByChannelData = computed(() => ({
  labels: salesByChannelChart.value?.labels || [],
  datasets: [
    {
      data: salesByChannelChart.value?.series || [],
      backgroundColor: (ctx) => {
        const channelPairs = [
          ['#fbbf24', '#ea580c'],
          ['#38bdf8', '#1d4ed8'],
          ['#34d399', '#059669'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
        ]
        const pair = channelPairs[ctx.dataIndex % channelPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
}))

function getSalesByChannelOptions(theme) {
  const items = salesByChannelChart.value?.items || []
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
          padding: 16,
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed) || 0
            const total = totalChannelsAmount.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            const item = items[ctx.dataIndex]
            const countText =
              item?.invoices_count !== undefined ? ` (${item.invoices_count} فاتورة)` : ''
            return ` ${ctx.label}: ${formatAmount(val)} — ${pct}%${countText}`
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
// 3. توزيع التحصيلات حسب وسيلة الدفع (payment_methods)
// =========================================================
const paymentMethodsChart = computed(() => props.charts?.payment_methods || {})

const totalPaymentsAmount = computed(() => {
  const series = paymentMethodsChart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasPaymentMethods = computed(() => {
  const series = paymentMethodsChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const paymentMethodsData = computed(() => ({
  labels: paymentMethodsChart.value?.labels || [],
  datasets: [
    {
      data: paymentMethodsChart.value?.series || [],
      backgroundColor: (ctx) => {
        const methodPairs = [
          ['#34d399', '#059669'],
          ['#38bdf8', '#2563eb'],
          ['#ffb703', '#ff7d14'],
          ['#c084fc', '#7c3aed'],
          ['#2dd4bf', '#0d9488'],
        ]
        const pair = methodPairs[ctx.dataIndex % methodPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}))

function getPaymentMethodsOptions(theme) {
  const items = paymentMethodsChart.value?.items || []
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
            const total = totalPaymentsAmount.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            const item = items[ctx.dataIndex]
            const txCount = item?.transactions_count ?? 0
            return [
              ` المبلغ المحصّل: ${formatAmount(val)} (${pct}%)`,
              ` عدد العمليات: ${txCount} عملية`,
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
// 4. أعلى 6 أصناف مبيعاً وربحية (top_products)
// =========================================================
const topProductsChart = computed(() => props.charts?.top_products || {})

const hasTopProducts = computed(() => {
  const rev = topProductsChart.value?.revenue_series || []
  return rev.length > 0 && rev.some((v) => Number(v) > 0)
})

const topProductsData = computed(() => ({
  labels: topProductsChart.value?.labels || [],
  datasets: [
    {
      label: 'إجمالي الإيراد',
      data: topProductsChart.value?.revenue_series || [],
      backgroundColor: (ctx) => createHorizontalGradient(ctx, '#fbbf24', '#ea580c', '#ff7d14'),
      hoverBackgroundColor: '#fbbf24',
      borderRadius: 7,
      maxBarThickness: 18,
    },
    {
      label: 'مجمل الربح',
      data: topProductsChart.value?.profit_series || [],
      backgroundColor: (ctx) => createHorizontalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 7,
      maxBarThickness: 18,
    },
  ],
}))

function getTopProductsOptions(theme) {
  const items = topProductsChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
          label: (ctx) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.x)}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            return [` الكمية المباعة: ${item.quantity}`, ` هامش الربح: ${item.margin}%`]
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
// 5. أعلى 6 عملاء شراءً (top_customers)
// =========================================================
const topCustomersChart = computed(() => props.charts?.top_customers || {})

const hasTopCustomers = computed(() => {
  const series = topCustomersChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const topCustomersData = computed(() => ({
  labels: topCustomersChart.value?.labels || [],
  datasets: [
    {
      label: 'إجمالي المشتريات',
      data: topCustomersChart.value?.series || [],
      backgroundColor: (ctx) => {
        const palettes = [
          ['#818cf8', '#4f46e5'],
          ['#38bdf8', '#2563eb'],
          ['#34d399', '#059669'],
          ['#fbbf24', '#d97706'],
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

function getTopCustomersOptions(theme) {
  const items = topCustomersChart.value?.items || []
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
            const lines = [` عدد الفواتير: ${item.invoices_count} فاتورة`]
            if (Number(item.unpaid_balance) > 0) {
              lines.push(` رصيد آجل غير مسدد: ${formatAmount(item.unpaid_balance)}`)
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
// 6. أداء الموظفين والكاشيرين (cashier_performance)
// =========================================================
const cashierPerformanceChart = computed(() => props.charts?.cashier_performance || {})

const hasCashierPerformance = computed(() => {
  const series = cashierPerformanceChart.value?.sales_series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const cashierPerformanceData = computed(() => ({
  labels: cashierPerformanceChart.value?.labels || [],
  datasets: [
    {
      label: 'إجمالي المبيعات',
      data: cashierPerformanceChart.value?.sales_series || [],
      backgroundColor: (ctx) => {
        const palettes = [
          ['#c084fc', '#7c3aed'],
          ['#fbbf24', '#ea580c'],
          ['#38bdf8', '#2563eb'],
          ['#34d399', '#059669'],
          ['#fb7185', '#e11d48'],
          ['#818cf8', '#4f46e5'],
        ]
        const pair = palettes[ctx.dataIndex % palettes.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderRadius: 8,
      maxBarThickness: 32,
    },
  ],
}))

function getCashierPerformanceOptions(theme) {
  const items = cashierPerformanceChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => ` إجمالي المبيعات: ${formatAmount(ctx.parsed.y)}`,
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return []
            const count = Number(item.invoices_count) || 0
            const avg = count > 0 ? Number(item.total_sales) / count : 0
            return [
              ` عدد الفواتير المنجزة: ${count} فاتورة`,
              ` متوسط قيمة الفاتورة: ${formatAmount(avg)}`,
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
