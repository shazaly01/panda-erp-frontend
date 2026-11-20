<!-- src/components/dashboard/DashboardKpiCard.vue -->
<template>
  <article
    class="dashboard-kpi-card dashboard-luminous-card dashboard-enter relative overflow-hidden rounded-xl p-5 flex flex-col justify-between gap-4 select-none transition-all duration-300"
    :style="{
      '--accent-rgb': palette.rgb,
      '--stagger-index': staggerIndex,
    }"
  >
    <!-- رأس البطاقة: العنوان والأيقونة الجوهرية المشبعة -->
    <div class="relative z-10 flex items-start justify-between gap-3 pt-0.5">
      <div class="min-w-0">
        <p class="text-xs sm:text-sm font-extrabold text-text-primary truncate">
          {{ title }}
        </p>
        <p v-if="subtitle" class="mt-0.5 text-[11px] font-medium text-text-muted truncate">
          {{ subtitle }}
        </p>
      </div>

      <div
        v-if="icon"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-105 ring-1 ring-white/45"
        :class="palette.iconGem"
      >
        <component :is="icon" class="h-5 w-5 drop-shadow-sm" stroke-width="2" />
      </div>
    </div>

    <!-- القيمة الرقمية عالية التباين مع شارة العملة -->
    <div class="relative z-10 flex items-center gap-2 flex-wrap" dir="ltr">
      <span
        class="text-2xl sm:text-[28px] font-black tracking-tight text-text-primary tabular-nums drop-shadow-sm"
      >
        {{ formattedAnimatedValue }}
      </span>
      <span
        v-if="suffix"
        class="rounded-md px-2 py-0.5 text-[11px] font-extrabold tracking-wide"
        :class="palette.currencyBadge"
      >
        {{ suffix }}
      </span>
    </div>

    <!-- ذيل البطاقة: شارة النمو + الرسم الخطي المتوهج -->
    <div
      class="relative z-10 flex items-end justify-between gap-3 pt-2.5 border-t border-surface-border/70 min-h-[44px]"
    >
      <div class="flex flex-col gap-1">
        <div
          v-if="growthPercentage !== null && growthPercentage !== undefined"
          class="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-extrabold w-fit shadow-sm"
          :class="growthBadgeClass"
        >
          <ArrowTrendingUpIcon v-if="Number(growthPercentage) > 0" class="h-3.5 w-3.5" />
          <ArrowTrendingDownIcon v-else-if="Number(growthPercentage) < 0" class="h-3.5 w-3.5" />
          <MinusIcon v-else class="h-3.5 w-3.5" />
          <span dir="ltr">
            {{ Number(growthPercentage) > 0 ? '+' : '' }}{{ Number(growthPercentage).toFixed(1) }}%
          </span>
        </div>
        <span v-if="comparisonLabel" class="text-[11px] font-medium text-text-muted">
          {{ comparisonLabel }}
        </span>
      </div>

      <!-- الرسم المصغر المتوهج Sparkline -->
      <div v-if="hasSparkline" class="w-24 sm:w-28 h-11 shrink-0">
        <svg viewBox="0 0 120 42" class="w-full h-full overflow-visible">
          <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="palette.strokeHex" stop-opacity="0.52" />
              <stop offset="75%" :stop-color="palette.strokeHex" stop-opacity="0.12" />
              <stop offset="100%" :stop-color="palette.strokeHex" stop-opacity="0.0" />
            </linearGradient>

            <filter :id="glowId" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="2.2"
                :flood-color="palette.strokeHex"
                flood-opacity="0.65"
              />
            </filter>
          </defs>

          <!-- مساحة التدرج أسفل المنحنى -->
          <path :d="sparklineAreaPath" :fill="`url(#${gradientId})`" />

          <!-- خط المنحنى المتوهج -->
          <path
            :d="sparklineLinePath"
            fill="none"
            :stroke="palette.strokeHex"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            :filter="`url(#${glowId})`"
          />

          <!-- هالة ونقطة النهاية المضيئة -->
          <g v-if="lastPoint">
            <circle
              :cx="lastPoint.x"
              :cy="lastPoint.y"
              r="5.5"
              :fill="palette.strokeHex"
              fill-opacity="0.3"
              class="animate-ping"
            />
            <circle
              :cx="lastPoint.x"
              :cy="lastPoint.y"
              r="3.5"
              fill="#ffffff"
              :stroke="palette.strokeHex"
              stroke-width="2.2"
            />
          </g>
        </svg>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  value: {
    type: Number,
    default: 0,
  },
  suffix: {
    type: String,
    default: '',
  },
  decimals: {
    type: Number,
    default: null,
  },
  growthPercentage: {
    type: [Number, null],
    default: null,
  },
  invertGrowthColor: {
    type: Boolean,
    default: false,
  },
  comparisonLabel: {
    type: String,
    default: 'عن الفترة السابقة',
  },
  sparkline: {
    type: Array,
    default: () => [],
  },
  variant: {
    type: String,
    default: 'primary', // primary | emerald | rose | sky | indigo | amber
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  staggerIndex: {
    type: Number,
    default: 1,
  },
})

const paletteMap = {
  primary: {
    rgb: '255, 125, 20',
    strokeHex: '#ff8a1e',
    iconGem:
      'bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/40',
    currencyBadge:
      'bg-orange-500/15 text-orange-700 border border-orange-500/35 dark:bg-orange-400/20 dark:text-orange-200 dark:border-orange-400/40',
  },
  emerald: {
    rgb: '16, 185, 129',
    strokeHex: '#10b981',
    iconGem:
      'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/40',
    currencyBadge:
      'bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 dark:bg-emerald-400/20 dark:text-emerald-200 dark:border-emerald-400/40',
  },
  rose: {
    rgb: '244, 63, 94',
    strokeHex: '#fb7185',
    iconGem:
      'bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 shadow-lg shadow-rose-500/40',
    currencyBadge:
      'bg-rose-500/15 text-rose-700 border border-rose-500/35 dark:bg-rose-400/20 dark:text-rose-200 dark:border-rose-400/40',
  },
  sky: {
    rgb: '14, 165, 233',
    strokeHex: '#38bdf8',
    iconGem: 'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 shadow-lg shadow-sky-500/40',
    currencyBadge:
      'bg-sky-500/15 text-sky-700 border border-sky-500/35 dark:bg-sky-400/20 dark:text-sky-200 dark:border-sky-400/40',
  },
  indigo: {
    rgb: '99, 102, 241',
    strokeHex: '#818cf8',
    iconGem:
      'bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40',
    currencyBadge:
      'bg-indigo-500/15 text-indigo-700 border border-indigo-500/35 dark:bg-indigo-400/20 dark:text-indigo-200 dark:border-indigo-400/40',
  },
  amber: {
    rgb: '245, 158, 11',
    strokeHex: '#fbbf24',
    iconGem:
      'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/40',
    currencyBadge:
      'bg-amber-500/15 text-amber-700 border border-amber-500/35 dark:bg-amber-400/20 dark:text-amber-200 dark:border-amber-400/40',
  },
}

const palette = computed(() => paletteMap[props.variant] || paletteMap.primary)
const uid = Math.random().toString(36).slice(2, 9)
const gradientId = `spark-grad-${uid}`
const glowId = `spark-glow-${uid}`

// --- عداد الأرقام المتحرك (Animated Counter) ---
const displayedValue = ref(0)
let rafId = null

function animateValue(target) {
  if (rafId) cancelAnimationFrame(rafId)

  const startValue = displayedValue.value
  const endValue = Number(target) || 0
  const duration = 750
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    displayedValue.value = startValue + (endValue - startValue) * eased

    if (progress < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      displayedValue.value = endValue
    }
  }

  rafId = requestAnimationFrame(step)
}

watch(
  () => props.value,
  (newVal) => {
    animateValue(newVal)
  },
)

onMounted(() => {
  animateValue(props.value)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

const formattedAnimatedValue = computed(() => {
  const num = Number(displayedValue.value) || 0
  const targetNum = Number(props.value) || 0

  let fractionDigits = 0
  if (props.decimals !== null) {
    fractionDigits = props.decimals
  } else if (targetNum % 1 !== 0) {
    fractionDigits = 2
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num)
})

// --- تنسيق شارة النمو ---
const growthBadgeClass = computed(() => {
  const val = Number(props.growthPercentage) || 0
  if (Math.abs(val) < 0.05) {
    return 'bg-slate-500/20 text-text-secondary border border-slate-400/30'
  }

  const isPositive = props.invertGrowthColor ? val < 0 : val > 0
  return isPositive
    ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 dark:bg-emerald-400/25 dark:text-emerald-200 dark:border-emerald-400/40'
    : 'bg-rose-500/20 text-rose-700 border border-rose-500/40 dark:bg-rose-400/25 dark:text-rose-200 dark:border-rose-400/40'
})

// --- حساب إحداثيات الرسم المصغر Sparkline ---
const hasSparkline = computed(() => Array.isArray(props.sparkline) && props.sparkline.length >= 2)

const sparklinePoints = computed(() => {
  if (!hasSparkline.value) return []

  const values = props.sparkline.map((v) => Number(v) || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 120
  const height = 36
  const paddingY = 5

  return values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * width
    const normalized = (val - min) / range
    const y = height - paddingY - normalized * (height - paddingY * 2)
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
  })
})

const sparklineLinePath = computed(() => {
  if (!sparklinePoints.value.length) return ''
  return sparklinePoints.value
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ')
})

const sparklineAreaPath = computed(() => {
  if (!sparklinePoints.value.length) return ''
  const first = sparklinePoints.value[0]
  const last = sparklinePoints.value[sparklinePoints.value.length - 1]
  return `${sparklineLinePath.value} L ${last.x} 42 L ${first.x} 42 Z`
})

const lastPoint = computed(() => {
  if (!sparklinePoints.value.length) return null
  return sparklinePoints.value[sparklinePoints.value.length - 1]
})
</script>
