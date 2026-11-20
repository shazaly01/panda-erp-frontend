<!-- src/modules/accounting/views/dashboard/components/AccountingChartsGrid.vue -->
<template>
  <section class="space-y-5">
    <!-- الصف الأول: التدفق المالي الشهري (8 أعمدة) + توزيع السيولة (4 أعمدة) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8">
        <DashboardChartCard
          title="التدفق المالي الشهري"
          subtitle="مقارنة الإيرادات والمصروفات وصافي الربح خلال الفترة"
          :icon="PresentationChartLineIcon"
          accent-rgb="255, 125, 20"
          :empty="!hasMonthlyCashflow"
          empty-title="لا توجد حركات إيرادات أو مصروفات"
          empty-message="لم تُسجل قيود إيرادات أو مصروفات مرحّلة ضمن النطاق الزمني المحدد."
          :stagger-index="3"
          height-class="h-80"
        >
          <template #default="{ theme }">
            <Bar :data="monthlyCashflowData" :options="getMonthlyCashflowOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-4">
        <DashboardChartCard
          title="توزيع السيولة النقدية"
          subtitle="نسبة الخزائن النقدية مقابل الحسابات البنكية"
          :icon="ChartPieIcon"
          accent-rgb="14, 165, 233"
          :empty="!hasTreasuryDistribution"
          empty-title="لا توجد أرصدة نقدية مسجلة"
          empty-message="ستظهر نسب توزيع السيولة فور تسجيل حركات على الخزائن أو البنوك."
          :stagger-index="4"
          height-class="h-80"
        >
          <template #default="{ theme }">
            <div class="relative h-full w-full flex items-center justify-center">
              <Doughnut
                :data="treasuryDistributionData"
                :options="getTreasuryDoughnutOptions(theme)"
              />
              <!-- إجمالي السيولة في منتصف الحلقة -->
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7 text-center"
              >
                <span class="text-[11px] font-bold text-text-muted">إجمالي السيولة</span>
                <span
                  class="mt-0.5 text-base sm:text-lg font-black text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ formatCompactNumber(totalTreasuryValue) }}
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

    <!-- الصف الثاني: أعلى 6 حسابات مصروفات (6 أعمدة) + مصادر القيود المرحّلة (6 أعمدة) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          title="أعلى 6 حسابات مصروفات"
          subtitle="البنود الأكثر استهلاكاً للنفقات خلال الفترة"
          :icon="FireIcon"
          accent-rgb="244, 63, 94"
          :empty="!hasTopExpenses"
          empty-title="لا توجد مصروفات مرحّلة"
          empty-message="لم تُسجل أي قيود مصروفات خلال الفترة المحددة."
          :stagger-index="5"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="topExpensesData" :options="getTopExpensesOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="تحليل مصادر القيود المرحّلة"
          subtitle="توزيع الحجم المالي وعدد القيود حسب مصدر العملية"
          :icon="Squares2X2Icon"
          accent-rgb="168, 85, 247"
          :empty="!hasEntriesBySource"
          empty-title="لا توجد قيود مرحّلة"
          empty-message="ستظهر إحصائيات مصادر القيود بمجرد ترحيل القيود اليومية."
          :stagger-index="6"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Doughnut :data="entriesBySourceData" :options="getEntriesSourceOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- الصف الثالث: تنفيذ الموازنة التقديرية (6 أعمدة) + مقارنة أداء الفروع (6 أعمدة) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-6">
        <DashboardChartCard
          :title="
            budgetChart?.budget_name
              ? `تنفيذ الموازنة: ${budgetChart.budget_name}`
              : 'مؤشر تنفيذ الموازنة التقديرية'
          "
          subtitle="مقارنة المبالغ المخططة مع الصرف الفعلي"
          :icon="ScaleIcon"
          accent-rgb="16, 185, 129"
          :empty="!hasActiveBudget"
          empty-title="لا توجد موازنة تقديرية نشطة"
          empty-message="قم بتفعيل أو اعتماد موازنة للسنة المالية الحالية لمتابعة نسب الانحراف والتنفيذ."
          :stagger-index="7"
          height-class="h-72"
        >
          <template #header-extra v-if="hasActiveBudget">
            <span
              class="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-extrabold tabular-nums"
              :class="budgetStatusBadgeClass"
              dir="ltr"
            >
              {{ Number(budgetChart.execution_percentage || 0).toFixed(1) }}%
            </span>
          </template>

          <template #default="{ theme }">
            <Bar :data="budgetExecutionData" :options="getBudgetExecutionOptions(theme)" />
          </template>

          <template #footer v-if="hasActiveBudget">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span>
                  المخطط:
                  <strong class="text-text-primary tabular-nums" dir="ltr">
                    {{ formatAmount(budgetChart.planned_total) }}
                  </strong>
                </span>
                <span>
                  الفعلي:
                  <strong class="text-primary tabular-nums" dir="ltr">
                    {{ formatAmount(budgetChart.actual_total) }}
                  </strong>
                </span>
                <span>
                  المتبقي:
                  <strong
                    class="tabular-nums"
                    :class="
                      Number(budgetChart.remaining_total) >= 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    "
                    dir="ltr"
                  >
                    {{ formatAmount(budgetChart.remaining_total) }}
                  </strong>
                </span>
              </div>

              <!-- شريط التقدم الإجمالي للموازنة بتدرج لامع -->
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-surface-ground p-0.5">
                <div
                  class="h-full rounded-full transition-all duration-700 shadow-sm"
                  :class="budgetProgressBarClass"
                  :style="{
                    width: `${Math.min(100, Math.max(0, Number(budgetChart.execution_percentage || 0)))}%`,
                  }"
                ></div>
              </div>
            </div>
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-6">
        <DashboardChartCard
          title="مقارنة أداء الفروع"
          subtitle="الإيرادات والمصروفات وصافي الربح لكل فرع نشط"
          :icon="BuildingOffice2Icon"
          accent-rgb="99, 102, 241"
          :empty="!hasBranchesComparison"
          empty-title="لا توجد بيانات مقارنة للفروع"
          empty-message="تأكد من تفعيل خاصية الفرع في مراكز التكلفة وتسجيل حركات مالية عليها."
          :stagger-index="8"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="branchesComparisonData" :options="getBranchesComparisonOptions(theme)" />
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
  FireIcon,
  Squares2X2Icon,
  ScaleIcon,
  BuildingOffice2Icon,
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

// --- أدوات تنسيق الأرقام داخل الرسوم البيانية ---
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
// 1. التدفق المالي الشهري (Monthly Cashflow)
// =========================================================
const monthlyChart = computed(() => props.charts?.monthly_cashflow || {})

const hasMonthlyCashflow = computed(() => {
  const labels = monthlyChart.value?.labels || []
  const rev = monthlyChart.value?.revenues || []
  const exp = monthlyChart.value?.expenses || []
  return labels.length > 0 && (rev.some((v) => v !== 0) || exp.some((v) => v !== 0))
})

const monthlyCashflowData = computed(() => ({
  labels: monthlyChart.value?.labels || [],
  datasets: [
    {
      type: 'line',
      label: 'صافي الربح',
      data: monthlyChart.value?.profits || [],
      borderColor: '#ff9e2c',
      backgroundColor: (ctx) =>
        createVerticalGradient(
          ctx,
          'rgba(255, 145, 36, 0.36)',
          'rgba(255, 125, 20, 0.0)',
          'rgba(255, 125, 20, 0.2)',
        ),
      fill: true,
      borderWidth: 3.5,
      tension: 0.4,
      pointRadius: 4.5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#ff7d14',
      pointBorderWidth: 2.5,
      order: 0,
    },
    {
      type: 'bar',
      label: 'الإيرادات',
      data: monthlyChart.value?.revenues || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 7,
      maxBarThickness: 24,
      order: 1,
    },
    {
      type: 'bar',
      label: 'المصروفات',
      data: monthlyChart.value?.expenses || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 7,
      maxBarThickness: 24,
      order: 1,
    },
  ],
}))

function getMonthlyCashflowOptions(theme) {
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
          padding: 16,
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
// 2. توزيع السيولة النقدية (Treasury Distribution)
// =========================================================
const treasuryChart = computed(() => props.charts?.treasury_distribution || {})

const totalTreasuryValue = computed(() => {
  const series = treasuryChart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasTreasuryDistribution = computed(() => {
  const series = treasuryChart.value?.series || []
  return series.some((v) => Number(v) > 0)
})

const treasuryDistributionData = computed(() => ({
  labels: treasuryChart.value?.labels || ['الخزائن النقدية', 'الحسابات البنكية'],
  datasets: [
    {
      data: treasuryChart.value?.series || [0, 0],
      backgroundColor: (ctx) => {
        if (ctx.dataIndex === 0) {
          return createVerticalGradient(ctx, '#fbbf24', '#ea580c', '#ff7d14')
        }
        return createVerticalGradient(ctx, '#38bdf8', '#1d4ed8', '#0ea5e9')
      },
      hoverBackgroundColor: ['#fbbf24', '#38bdf8'],
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
}))

function getTreasuryDoughnutOptions(theme) {
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
          padding: 18,
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
        },
      },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed) || 0
            const total = totalTreasuryValue.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            return ` ${ctx.label}: ${formatAmount(val)} (${pct}%)`
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
// 3. أعلى 6 حسابات مصروفات (Top Expenses)
// =========================================================
const topExpensesChart = computed(() => props.charts?.top_expenses || {})

const hasTopExpenses = computed(() => {
  const series = topExpensesChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const topExpensesData = computed(() => ({
  labels: topExpensesChart.value?.labels || [],
  datasets: [
    {
      label: 'المصروفات',
      data: topExpensesChart.value?.series || [],
      backgroundColor: (ctx) => {
        const palettes = [
          ['#fb7185', '#ff7d14'],
          ['#f43f5e', '#fb923c'],
          ['#fb923c', '#f59e0b'],
          ['#f59e0b', '#eab308'],
          ['#38bdf8', '#6366f1'],
          ['#a855f7', '#ec4899'],
        ]
        const pair = palettes[ctx.dataIndex % palettes.length]
        return createHorizontalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderRadius: 8,
      maxBarThickness: 26,
    },
  ],
}))

function getTopExpensesOptions(theme) {
  const items = topExpensesChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        ...buildBaseTooltip(theme),
        callbacks: {
          label: (ctx) => {
            const item = items[ctx.dataIndex]
            const pctText = item?.percentage !== undefined ? ` (${item.percentage}%)` : ''
            return ` المبلغ: ${formatAmount(ctx.parsed.x)}${pctText}`
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
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
        },
      },
    },
  }
}

// =========================================================
// 4. مصادر القيود المرحّلة (Entries By Source)
// =========================================================
const entriesSourceChart = computed(() => props.charts?.entries_by_source || {})

const hasEntriesBySource = computed(() => {
  const series = entriesSourceChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const entriesBySourceData = computed(() => ({
  labels: entriesSourceChart.value?.labels || [],
  datasets: [
    {
      data: entriesSourceChart.value?.series || [],
      backgroundColor: (ctx) => {
        const jewelPairs = [
          ['#ffb703', '#ff7d14'],
          ['#34d399', '#059669'],
          ['#38bdf8', '#2563eb'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
          ['#2dd4bf', '#0d9488'],
          ['#818cf8', '#4f46e5'],
        ]
        const pair = jewelPairs[ctx.dataIndex % jewelPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}))

function getEntriesSourceOptions(theme) {
  const items = entriesSourceChart.value?.items || []
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
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
            const item = items[ctx.dataIndex]
            const count = item?.entries_count ?? 0
            return [` الحجم المالي: ${formatAmount(ctx.parsed)}`, ` عدد القيود: ${count} قيد`]
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
// 5. تنفيذ الموازنة التقديرية (Budget Execution)
// =========================================================
const budgetChart = computed(() => props.charts?.budget_execution || {})

const hasActiveBudget = computed(() => {
  return (
    Boolean(budgetChart.value?.has_active_budget) && (budgetChart.value?.labels || []).length > 0
  )
})

const budgetStatusBadgeClass = computed(() => {
  const pct = Number(budgetChart.value?.execution_percentage || 0)
  if (pct > 100) {
    return 'bg-rose-500/20 text-rose-600 border border-rose-500/40 dark:bg-rose-400/25 dark:text-rose-200'
  }
  if (pct >= 85) {
    return 'bg-amber-500/20 text-amber-600 border border-amber-500/40 dark:bg-amber-400/25 dark:text-amber-200'
  }
  return 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 dark:bg-emerald-400/25 dark:text-emerald-200'
})

const budgetProgressBarClass = computed(() => {
  const pct = Number(budgetChart.value?.execution_percentage || 0)
  if (pct > 100) return 'bg-gradient-to-r from-rose-500 to-pink-500'
  if (pct >= 85) return 'bg-gradient-to-r from-amber-400 to-orange-500'
  return 'bg-gradient-to-r from-emerald-400 to-teal-500'
})

const budgetExecutionData = computed(() => ({
  labels: budgetChart.value?.labels || [],
  datasets: [
    {
      label: 'المخصص بالموازنة',
      data: budgetChart.value?.planned_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#38bdf8', '#2563eb', '#0ea5e9'),
      hoverBackgroundColor: '#38bdf8',
      borderRadius: 7,
      maxBarThickness: 22,
    },
    {
      label: 'المنفّذ فعلياً',
      data: budgetChart.value?.actual_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fbbf24', '#ea580c', '#ff7d14'),
      hoverBackgroundColor: '#fbbf24',
      borderRadius: 7,
      maxBarThickness: 22,
    },
  ],
}))

function getBudgetExecutionOptions(theme) {
  const items = budgetChart.value?.items || []
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
          afterBody: (tooltipItems) => {
            const idx = tooltipItems[0]?.dataIndex
            const item = items[idx]
            if (!item) return ''
            return `نسبة التنفيذ: ${item.percentage}%`
          },
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
          callback: (val) => formatCompactNumber(val),
        },
      },
    },
  }
}

// =========================================================
// 6. مقارنة أداء الفروع (Branches Comparison)
// =========================================================
const branchesChart = computed(() => props.charts?.branches_comparison || {})

const hasBranchesComparison = computed(() => {
  const labels = branchesChart.value?.labels || []
  return labels.length > 0
})

const branchesComparisonData = computed(() => ({
  labels: branchesChart.value?.labels || [],
  datasets: [
    {
      label: 'الإيرادات',
      data: branchesChart.value?.revenues || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 7,
      maxBarThickness: 22,
    },
    {
      label: 'المصروفات',
      data: branchesChart.value?.expenses || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 7,
      maxBarThickness: 22,
    },
    {
      label: 'صافي الربح',
      data: branchesChart.value?.profits || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fbbf24', '#ea580c', '#ff7d14'),
      hoverBackgroundColor: '#fbbf24',
      borderRadius: 7,
      maxBarThickness: 22,
    },
  ],
}))

function getBranchesComparisonOptions(theme) {
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
          label: (ctx) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.textColor,
          font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
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
