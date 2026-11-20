<!-- src/components/dashboard/DashboardAlertPill.vue -->
<template>
  <button
    type="button"
    @click="$emit('click')"
    class="dashboard-enter dashboard-luminous-pill group relative flex items-center justify-between gap-3.5 rounded-xl border p-4 text-right transition-all duration-200 cursor-pointer w-full"
    :class="[
      hasAlerts
        ? `${palette.activeBorder} dashboard-alert-beacon hover:-translate-y-0.5`
        : 'border-surface-border hover:border-emerald-500/50',
    ]"
    :style="{
      '--accent-rgb': hasAlerts ? palette.rgb : '16, 185, 129',
      '--alert-rgb': palette.rgb,
      '--stagger-index': staggerIndex,
    }"
  >
    <div class="relative z-10 flex items-center gap-3.5 min-w-0">
      <!-- أيقونة التنبيه الجوهرية المشبعة -->
      <div
        class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-200 group-hover:scale-105"
        :class="
          hasAlerts
            ? 'dashboard-icon-gem'
            : 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-md shadow-emerald-500/35 ring-1 ring-white/40'
        "
      >
        <component
          :is="hasAlerts ? icon : CheckCircleIcon"
          class="h-5 w-5 drop-shadow-sm"
          stroke-width="2"
        />
        <span v-if="hasAlerts" class="absolute -top-1 -right-1 flex h-3 w-3">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-80"
            :class="palette.pingDot"
          ></span>
          <span
            class="relative inline-flex rounded-full h-3 w-3 ring-2 ring-white"
            :class="palette.solidDot"
          ></span>
        </span>
      </div>

      <!-- النص التوضيحي -->
      <div class="min-w-0">
        <p class="text-xs sm:text-sm font-extrabold text-text-primary truncate">
          {{ title }}
        </p>
        <p class="mt-0.5 text-[11px] sm:text-xs font-medium text-text-muted truncate">
          {{ hasAlerts ? activeDescription : emptyDescription }}
        </p>
      </div>
    </div>

    <!-- العداد الرقمي المشبع وسهم الانتقال -->
    <div class="relative z-10 flex items-center gap-2.5 shrink-0">
      <span
        class="inline-flex min-w-[2.35rem] items-center justify-center rounded-xl px-2.5 py-1 text-sm font-black tabular-nums"
        :class="
          hasAlerts
            ? palette.countBadge
            : 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40 dark:bg-emerald-400/25 dark:text-emerald-200 dark:border-emerald-400/40'
        "
      >
        {{ count }}
      </span>

      <ArrowLeftIcon
        class="h-4 w-4 text-text-muted transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-primary"
      />
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { BellAlertIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  activeDescription: {
    type: String,
    default: 'تتطلب مراجعة وإجراء فوري',
  },
  emptyDescription: {
    type: String,
    default: 'لا توجد عناصر معلقة حالياً',
  },
  variant: {
    type: String,
    default: 'amber', // amber | rose | sky | primary
  },
  icon: {
    type: [Object, Function],
    default: () => BellAlertIcon,
  },
  staggerIndex: {
    type: Number,
    default: 2,
  },
})

defineEmits(['click'])

const hasAlerts = computed(() => Number(props.count) > 0)

const palettes = {
  amber: {
    rgb: '245, 158, 11',
    activeBorder: 'border-amber-500/65 dark:border-amber-400/65',
    countBadge:
      'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/40 ring-1 ring-white/30',
    pingDot: 'bg-amber-300',
    solidDot: 'bg-amber-500',
  },
  rose: {
    rgb: '244, 63, 94',
    activeBorder: 'border-rose-500/65 dark:border-rose-400/65',
    countBadge:
      'bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/40 ring-1 ring-white/30',
    pingDot: 'bg-rose-300',
    solidDot: 'bg-rose-500',
  },
  sky: {
    rgb: '14, 165, 233',
    activeBorder: 'border-sky-500/65 dark:border-sky-400/65',
    countBadge:
      'bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/40 ring-1 ring-white/30',
    pingDot: 'bg-sky-300',
    solidDot: 'bg-sky-500',
  },
  primary: {
    rgb: '255, 125, 20',
    activeBorder: 'border-primary/65',
    countBadge:
      'bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/40 ring-1 ring-white/30',
    pingDot: 'bg-orange-300',
    solidDot: 'bg-primary',
  },
}

const palette = computed(() => palettes[props.variant] || palettes.amber)
</script>
