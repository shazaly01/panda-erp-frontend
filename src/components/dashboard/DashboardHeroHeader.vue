<!-- src/components/dashboard/DashboardHeroHeader.vue -->
<template>
  <section
    class="dashboard-enter dashboard-glass-hero p-4 sm:p-6 transition-all duration-300"
    style="--stagger-index: 0; --accent-rgb: 255, 125, 20"
  >
    <div class="relative z-10 flex flex-col gap-5">
      <!-- الصف العلوي: الهوية البصرية وأزرار التحكم -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div
            v-if="icon"
            class="dashboard-icon-gem flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl"
          >
            <component :is="icon" class="h-6 w-6 sm:h-7 sm:w-7" stroke-width="1.85" />
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
                {{ title }}
              </h1>
              <span
                v-if="badge"
                class="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-0.5 text-xs font-bold text-primary shadow-sm dark:bg-primary/25 dark:text-primary-light"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                {{ badge }}
              </span>
            </div>
            <p v-if="subtitle" class="mt-1 text-xs sm:text-sm text-text-secondary">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <!-- شارات المعلومات السريعة + أزرار التحديث وإعادة الضبط -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <slot name="meta-badges" />

          <button
            v-if="showReset"
            type="button"
            @click="$emit('reset')"
            :disabled="loading"
            class="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-card/90 px-3.5 py-2 text-xs font-bold text-text-secondary hover:text-primary disabled:opacity-50 cursor-pointer shadow-sm"
            title="إعادة ضبط الفلاتر الافتراضية"
          >
            <ArrowUturnRightIcon class="h-4 w-4" />
            <span>إعادة ضبط</span>
          </button>

          <button
            type="button"
            @click="$emit('refresh')"
            :disabled="loading"
            class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
            <span>{{ loading ? 'جاري التحديث...' : 'تحديث البيانات' }}</span>
          </button>

          <slot name="actions" />
        </div>
      </div>

      <!-- شريط الفلاتر التفاعلي -->
      <div v-if="$slots.filters" class="border-t border-primary/20 dark:border-white/10 pt-4">
        <slot name="filters" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ArrowPathIcon, ArrowUturnRightIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  badge: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showReset: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['refresh', 'reset'])
</script>
