<!-- src/components/dashboard/DashboardChartCard.vue -->
<template>
  <article
    class="dashboard-enter dashboard-luminous-card relative flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-5 transition-all duration-300 hover:border-primary/55"
    :style="{
      '--stagger-index': staggerIndex,
      '--accent-rgb': accentRgb,
    }"
  >
    <!-- رأس بطاقة الرسم البياني -->
    <div class="relative z-10 flex items-start justify-between gap-3 mb-4">
      <div class="flex items-start gap-3 min-w-0">
        <div
          v-if="icon"
          class="dashboard-icon-gem flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        >
          <component :is="icon" class="h-5 w-5" stroke-width="1.85" />
        </div>

        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-extrabold text-text-primary truncate">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="mt-0.5 text-xs text-text-muted truncate">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div v-if="$slots['header-extra']" class="shrink-0">
        <slot name="header-extra" />
      </div>
    </div>

    <!-- منطقة الرسم البياني أو الحالة الفارغة -->
    <div class="relative z-10 w-full flex-1 flex items-center justify-center" :class="heightClass">
      <div
        v-if="empty"
        class="flex flex-col items-center justify-center text-center px-4 py-8 rounded-xl border border-dashed border-surface-border/80 bg-surface-ground/40 w-full h-full"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-section text-text-muted mb-3 ring-1 ring-surface-border"
        >
          <ChartBarSquareIcon class="h-6 w-6" />
        </div>
        <p class="text-sm font-bold text-text-secondary">
          {{ emptyTitle }}
        </p>
        <p v-if="emptyMessage" class="mt-1 text-xs text-text-muted max-w-xs">
          {{ emptyMessage }}
        </p>
      </div>

      <div v-else class="relative w-full h-full">
        <slot :theme="chartTheme" :is-dark="isDark" />
      </div>
    </div>

    <!-- ذيل البطاقة الاختياري -->
    <div
      v-if="$slots.footer"
      class="relative z-10 mt-4 pt-3 border-t border-surface-border/60 text-xs text-text-secondary"
    >
      <slot name="footer" />
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { ChartBarSquareIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  accentRgb: {
    type: String,
    default: '255, 125, 20',
  },
  heightClass: {
    type: String,
    default: 'h-72 sm:h-80',
  },
  empty: {
    type: Boolean,
    default: false,
  },
  emptyTitle: {
    type: String,
    default: 'لا توجد بيانات كافية للعرض',
  },
  emptyMessage: {
    type: String,
    default: 'ستظهر المؤشرات الرسومية تلقائياً بمجرد توفر حركات مطابقة للفلاتر المحددة.',
  },
  staggerIndex: {
    type: Number,
    default: 2,
  },
})

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.currentTheme === 'dark')

// لوحة ألوان وإعدادات موحدة تتكيف لحظياً مع تبديل الوضع الليلي والنهاري
const chartTheme = computed(() => {
  if (isDark.value) {
    return {
      isDark: true,
      textColor: '#f1f5f9',
      mutedColor: '#a8bad6',
      gridColor: 'rgba(148, 163, 184, 0.14)',
      tooltipBg: 'rgba(17, 25, 44, 0.96)',
      tooltipTitle: '#f8fafc',
      tooltipBody: '#e2eaf6',
      tooltipBorder: 'rgba(255, 125, 20, 0.5)',
      doughnutBorder: '#18233c',
    }
  }

  return {
    isDark: false,
    textColor: '#334155',
    mutedColor: '#64748b',
    gridColor: 'rgba(148, 163, 184, 0.22)',
    tooltipBg: 'rgba(15, 23, 42, 0.94)',
    tooltipTitle: '#f8fafc',
    tooltipBody: '#e2e8f0',
    tooltipBorder: 'rgba(234, 88, 12, 0.45)',
    doughnutBorder: '#ffffff',
  }
})
</script>
