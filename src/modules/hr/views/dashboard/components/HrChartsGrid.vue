<!-- src/modules/hr/views/dashboard/components/HrChartsGrid.vue -->
<template>
  <section class="space-y-5">
    <!-- =========================================================
           الصف الأول: المنحنى الزمني لتكلفة الرواتب (7) + توزيع القوى العاملة حسب الأقسام (5)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-7">
        <DashboardChartCard
          title="المنحنى الزمني لتكلفة مسيرات الرواتب"
          subtitle="مقارنة شهرية للراتب الأساسي والبدلات والاستقطاعات وصافي الرواتب المعتمدة"
          :icon="BanknotesIcon"
          accent-rgb="16, 185, 129"
          :empty="!hasPayrollTrend"
          empty-title="لا توجد مسيرات رواتب معتمدة"
          empty-message="لم تُسجل مسيرات رواتب مرحّلة (Posted) ضمن النطاق الزمني المحدد."
          :stagger-index="3"
          height-class="h-80"
        >
          <template #default="{ theme }">
            <Bar :data="payrollTrendData" :options="getPayrollTrendOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-5">
        <DashboardChartCard
          title="توزيع القوى العاملة حسب الأقسام"
          subtitle="أعداد الموظفين النشطين وكتلة الرواتب الأساسية لكل إدارة أو قسم"
          :icon="BuildingOffice2Icon"
          accent-rgb="99, 102, 241"
          :empty="!hasEmployeesByDepartment"
          empty-title="لا توجد بيانات موظفين بالأقسام"
          empty-message="ستظهر حصص الأقسام من القوى العاملة بمجرد تسكين الموظفين على الإدارات."
          :stagger-index="4"
          height-class="h-80"
        >
          <template #default="{ theme }">
            <div class="relative h-full w-full flex items-center justify-center">
              <Doughnut
                :data="employeesByDepartmentData"
                :options="getEmployeesByDepartmentOptions(theme)"
              />
              <!-- إجمالي الموظفين في منتصف الحلقة -->
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7 text-center"
              >
                <span class="text-[11px] font-bold text-text-muted">إجمالي القوى العاملة</span>
                <span
                  class="mt-0.5 text-lg sm:text-xl font-black text-text-primary tabular-nums"
                  dir="ltr"
                >
                  {{ totalDepartmentEmployees }}
                </span>
                <span
                  class="mt-0.5 rounded-full bg-indigo-500/20 px-2.5 py-0.2 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300"
                >
                  موظف نشط
                </span>
              </div>
            </div>
          </template>
        </DashboardChartCard>
      </div>
    </div>

    <!-- =========================================================
           الصف الثاني: المنحنى اليومي لحركة الحضور (7) + القوى العاملة حسب الحالة الوظيفية (5)
           ========================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-7">
        <DashboardChartCard
          title="المنحنى اليومي لحركة الانضباط والحضور"
          subtitle="متابعة يومية لأعداد الحضور في الموعد، حالات التأخير، والغياب خلال الفترة"
          :icon="ClockIcon"
          accent-rgb="14, 165, 233"
          :empty="!hasAttendanceTrend"
          empty-title="لا توجد سجلات حضور مسجلة"
          empty-message="لم تُسجل حركات حضور أو غياب للموظفين ضمن النطاق الزمني المحدد."
          :stagger-index="5"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Bar :data="attendanceTrendData" :options="getAttendanceTrendOptions(theme)" />
          </template>
        </DashboardChartCard>
      </div>

      <div class="lg:col-span-5">
        <DashboardChartCard
          title="توزيع القوى العاملة حسب الحالة الوظيفية"
          subtitle="تصنيف الكوادر البشرية بين على رأس العمل، الإجازات، التدريب، والحالات الأخرى"
          :icon="UserGroupIcon"
          accent-rgb="168, 85, 247"
          :empty="!hasEmployeesByStatus"
          empty-title="لا توجد بيانات حالات وظيفية"
          empty-message="ستظهر إحصائيات الحالات الوظيفية بمجرد إضافة ملفات الموظفين."
          :stagger-index="6"
          height-class="h-72 sm:h-80"
        >
          <template #default="{ theme }">
            <Doughnut :data="employeesByStatusData" :options="getEmployeesByStatusOptions(theme)" />
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
  BanknotesIcon,
  BuildingOffice2Icon,
  ClockIcon,
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
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
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
// 1. المنحنى الزمني لتكلفة مسيرات الرواتب (payroll_trend)
// =========================================================
const payrollTrendChart = computed(() => props.charts?.payroll_trend || {})

const hasPayrollTrend = computed(() => {
  const labels = payrollTrendChart.value?.labels || []
  const net = payrollTrendChart.value?.net_series || []
  const basic = payrollTrendChart.value?.basic_series || []
  return (
    labels.length > 0 && (net.some((v) => Number(v) !== 0) || basic.some((v) => Number(v) !== 0))
  )
})

const payrollTrendData = computed(() => ({
  labels: payrollTrendChart.value?.labels || [],
  datasets: [
    {
      type: 'line',
      label: 'صافي الرواتب المعتمدة',
      data: payrollTrendChart.value?.net_series || [],
      borderColor: '#10b981',
      backgroundColor: (ctx) =>
        createVerticalGradient(
          ctx,
          'rgba(16, 185, 129, 0.34)',
          'rgba(5, 150, 105, 0.0)',
          'rgba(16, 185, 129, 0.18)',
        ),
      fill: true,
      borderWidth: 3.25,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6.5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#059669',
      pointBorderWidth: 2.5,
      order: 0,
    },
    {
      type: 'bar',
      label: 'الراتب الأساسي',
      data: payrollTrendChart.value?.basic_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#38bdf8', '#2563eb', '#0ea5e9'),
      hoverBackgroundColor: '#38bdf8',
      borderRadius: 6,
      maxBarThickness: 20,
      order: 1,
    },
    {
      type: 'bar',
      label: 'إجمالي البدلات',
      data: payrollTrendChart.value?.allowances_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fbbf24', '#ea580c', '#f59e0b'),
      hoverBackgroundColor: '#fbbf24',
      borderRadius: 6,
      maxBarThickness: 20,
      order: 1,
    },
    {
      type: 'bar',
      label: 'الاستقطاعات',
      data: payrollTrendChart.value?.deductions_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 6,
      maxBarThickness: 20,
      order: 1,
    },
  ],
}))

function getPayrollTrendOptions(theme) {
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
// 2. توزيع القوى العاملة حسب الأقسام (employees_by_department)
// =========================================================
const employeesByDeptChart = computed(() => props.charts?.employees_by_department || {})

const totalDepartmentEmployees = computed(() => {
  const series = employeesByDeptChart.value?.count_series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasEmployeesByDepartment = computed(() => {
  const series = employeesByDeptChart.value?.count_series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const employeesByDepartmentData = computed(() => ({
  labels: employeesByDeptChart.value?.labels || [],
  datasets: [
    {
      data: employeesByDeptChart.value?.count_series || [],
      backgroundColor: (ctx) => {
        const deptPairs = [
          ['#818cf8', '#4f46e5'],
          ['#38bdf8', '#1d4ed8'],
          ['#34d399', '#059669'],
          ['#fbbf24', '#ea580c'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
          ['#2dd4bf', '#0d9488'],
          ['#f472b6', '#db2777'],
        ]
        const pair = deptPairs[ctx.dataIndex % deptPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 10,
    },
  ],
}))

function getEmployeesByDepartmentOptions(theme) {
  const items = employeesByDeptChart.value?.items || []
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
            const total = totalDepartmentEmployees.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            const item = items[ctx.dataIndex]
            const lines = [` عدد الموظفين: ${formatNumber(val)} موظف (${pct}%)`]
            if (item && Number(item.total_basic_salary) > 0) {
              lines.push(` كتلة الرواتب الأساسية: ${formatAmount(item.total_basic_salary)}`)
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
// 3. المنحنى اليومي لحركة الحضور (attendance_trend)
// =========================================================
const attendanceTrendChart = computed(() => props.charts?.attendance_trend || {})

const hasAttendanceTrend = computed(() => {
  const present = attendanceTrendChart.value?.present_series || []
  const late = attendanceTrendChart.value?.late_series || []
  const absent = attendanceTrendChart.value?.absent_series || []
  return (
    present.some((v) => Number(v) > 0) ||
    late.some((v) => Number(v) > 0) ||
    absent.some((v) => Number(v) > 0)
  )
})

const attendanceTrendData = computed(() => ({
  labels: attendanceTrendChart.value?.labels || [],
  datasets: [
    {
      label: 'حضور في الموعد',
      data: attendanceTrendChart.value?.present_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#34d399', '#059669', '#10b981'),
      hoverBackgroundColor: '#34d399',
      borderRadius: 6,
      maxBarThickness: 20,
    },
    {
      label: 'تأخير',
      data: attendanceTrendChart.value?.late_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fbbf24', '#d97706', '#f59e0b'),
      hoverBackgroundColor: '#fbbf24',
      borderRadius: 6,
      maxBarThickness: 20,
    },
    {
      label: 'غياب',
      data: attendanceTrendChart.value?.absent_series || [],
      backgroundColor: (ctx) => createVerticalGradient(ctx, '#fb7185', '#e11d48', '#f43f5e'),
      hoverBackgroundColor: '#fb7185',
      borderRadius: 6,
      maxBarThickness: 20,
    },
  ],
}))

function getAttendanceTrendOptions(theme) {
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
          label: (ctx) => ` ${ctx.dataset.label}: ${formatNumber(ctx.parsed.y)} موظف`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: theme.textColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
        },
      },
      y: {
        stacked: true,
        grid: { color: theme.gridColor },
        border: { display: false },
        ticks: {
          color: theme.mutedColor,
          font: { family: 'Cairo, sans-serif', size: 11, weight: '600' },
          precision: 0,
        },
      },
    },
  }
}

// =========================================================
// 4. توزيع القوى العاملة حسب الحالة الوظيفية (employees_by_status)
// =========================================================
const employeesByStatusChart = computed(() => props.charts?.employees_by_status || {})

const totalStatusEmployees = computed(() => {
  const series = employeesByStatusChart.value?.series || []
  return series.reduce((acc, val) => acc + (Number(val) || 0), 0)
})

const hasEmployeesByStatus = computed(() => {
  const series = employeesByStatusChart.value?.series || []
  return series.length > 0 && series.some((v) => Number(v) > 0)
})

const employeesByStatusData = computed(() => ({
  labels: employeesByStatusChart.value?.labels || [],
  datasets: [
    {
      data: employeesByStatusChart.value?.series || [],
      backgroundColor: (ctx) => {
        const statusPairs = [
          ['#34d399', '#059669'],
          ['#fbbf24', '#ea580c'],
          ['#38bdf8', '#2563eb'],
          ['#c084fc', '#7c3aed'],
          ['#fb7185', '#e11d48'],
          ['#94a3b8', '#475569'],
        ]
        const pair = statusPairs[ctx.dataIndex % statusPairs.length]
        return createVerticalGradient(ctx, pair[0], pair[1], pair[0])
      },
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}))

function getEmployeesByStatusOptions(theme) {
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
            const total = totalStatusEmployees.value || 1
            const pct = ((val / total) * 100).toFixed(1)
            return ` ${ctx.label}: ${formatNumber(val)} موظف (${pct}%)`
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
</script>
