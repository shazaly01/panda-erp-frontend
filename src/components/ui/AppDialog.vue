<!---src\components\ui\AppDialog.vue--->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="modelValue"
          :class="[
            'w-full bg-surface-section rounded-xl shadow-2xl transform flex flex-col overflow-hidden max-h-[90vh] border-t-4 transition-all',
            sizeClass,
            borderColorClass,
          ]"
          role="dialog"
          aria-modal="true"
        >
          <!-- الشريط العلوي (Header) -->
          <div
            class="flex justify-between items-center px-6 py-4 border-b border-surface-border shrink-0 bg-surface-card/40"
          >
            <h3 class="text-lg font-bold text-text-primary flex items-center gap-2">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-border transition-colors flex items-center justify-center"
              aria-label="Close"
              :disabled="loading"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- محتوى النافذة (Body) -->
          <div class="p-6 overflow-y-auto flex-1">
            <slot />
          </div>

          <!-- الفوتر (Footer) - اختياري -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-surface-border bg-surface-card/20 flex justify-end items-center gap-3 shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  // إمكانية اختيار أبعاد محددة جاهزة أو تمرير كلاس Tailwind مباشر
  // الخيارات: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', 'full'
  size: {
    type: String,
    default: '3xl',
  },
  // تخصيص لون الحافة العلوية المميزة للمديول (مثال: 'border-blue-500', 'border-emerald-500', 'border-indigo-500')
  borderColor: {
    type: String,
    default: 'border-primary',
  },
  // تعطيل أزرار الإغلاق في حالة الحفظ
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

// تحويل قيمة size إلى كلاسات Tailwind المناسبة
const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full mx-4',
  }
  return sizes[props.size] || props.size
})

const borderColorClass = computed(() => {
  return props.borderColor || 'border-primary'
})

const close = () => {
  if (props.loading) return
  emit('update:modelValue', false)
  emit('close')
}
</script>
