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
      class="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
      @click.self="close"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="modelValue" :class="['w-full', size]">
          <AppCard>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-text-primary">{{ title }}</h3>
            </div>
            <div>
              <slot />
            </div>
          </AppCard>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import AppCard from './AppCard.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  // إضافة استقبال الحجم (size) مع وضع max-w-2xl كقيمة افتراضية
  // لكي لا تتأثر باقي شاشات النظام التي تستخدم هذا المكون القديم
  size: { type: String, default: 'max-w-2xl' },
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>
