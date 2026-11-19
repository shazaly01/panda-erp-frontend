<!--src/components/ui/AppBadge.vue-->
<template>
  <span
    :class="[
      'inline-flex items-center justify-center font-bold tracking-wide border transition-colors duration-150 select-none',
      sizeClasses,
      variantClasses,
      pill ? 'rounded-full' : 'rounded-md',
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full ml-1.5 shrink-0', dotClasses]"></span>
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'neutral', // success, danger, warning, info, primary, neutral
  },
  size: {
    type: String,
    default: 'sm', // xs, sm, md
  },
  pill: {
    type: Boolean,
    default: false,
  },
  dot: {
    type: Boolean,
    default: false,
  },
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-1.5 py-0.5 text-[10px]'
    case 'md':
      return 'px-2.5 py-1 text-xs'
    default: // sm
      return 'px-2 py-0.5 text-[11px]'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30'
    case 'danger':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/30'
    case 'warning':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30'
    case 'info':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-500/30'
    case 'primary':
      return 'bg-primary/10 text-primary border-primary/25 dark:bg-primary/15 dark:text-primary-light dark:border-primary/30'
    default: // neutral
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-surface-ground dark:text-text-secondary dark:border-surface-border'
  }
})

const dotClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-500'
    case 'danger':
      return 'bg-rose-500'
    case 'warning':
      return 'bg-amber-500'
    case 'info':
      return 'bg-sky-500'
    case 'primary':
      return 'bg-primary'
    default:
      return 'bg-slate-400'
  }
})
</script>
