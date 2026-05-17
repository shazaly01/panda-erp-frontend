<template>
  <div class="relative w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>

    <MultiSelect
      :id="id"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :filter="true"
      :loading="loading"
      :required="required"
      :placeholder="placeholder"
      :show-clear="showClear"
      display="chip"
      appendTo="body"
      class="w-full"
      :pt="{
        root: {
          class: [
            'w-full inline-flex relative cursor-pointer select-none',
            'bg-gray-50 border-2 border-gray-300 transition-colors duration-200 rounded-md shadow-sm',
            'dark:bg-surface-ground dark:border-surface-border',
            'hover:border-blue-500 dark:hover:border-primary',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'dark:focus:ring-primary dark:focus:border-primary',
          ],
        },
        labelContainer: {
          class: 'overflow-hidden flex flex-auto cursor-pointer p-1 items-center',
        },
        label: {
          class:
            'block w-full text-gray-900 dark:text-text-primary bg-transparent border-0 focus:outline-none p-1 flex flex-wrap gap-1',
        },
        token: {
          class:
            'inline-flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-0.5 text-xs font-medium',
        },
        trigger: {
          class:
            'flex items-center justify-center shrink-0 w-12 rounded-r-md text-gray-500 dark:text-gray-400',
        },
        clearIcon: {
          class: 'text-gray-500 dark:text-gray-400 mr-2',
        },
        panel: {
          class: [
            'bg-white dark:bg-[#1f2937]',
            'border border-gray-300 dark:border-gray-600',
            'rounded-md shadow-2xl',
            'mt-1',
            'overflow-hidden',
          ],
        },
        header: {
          class:
            'p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2',
        },
        filterInput: {
          class:
            'w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-500',
        },
        closeButton: {
          class: 'hidden', // إخفاء زر الإغلاق الافتراضي لـ PrimeVue للاعتماد على النقر الخارجي
        },
        list: {
          class: [
            'p-1 pb-6 max-h-60 overflow-y-auto custom-scrollbar',
            'bg-white dark:bg-[#1f2937]',
            'relative z-10',
          ],
        },
        item: {
          class: [
            'p-2 rounded-md cursor-pointer overflow-hidden whitespace-nowrap flex items-center gap-2',
            'text-gray-700 dark:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors duration-150',
          ],
        },
        checkboxContainer: {
          class:
            'flex items-center justify-center shrink-0 w-4 h-4 rounded border border-gray-300 dark:border-gray-600',
        },
        checkbox: {
          class:
            'flex items-center justify-center w-full h-full rounded text-white bg-transparent peer-checked:bg-primary',
        },
      }"
    />
  </div>
</template>

<script setup>
import MultiSelect from 'primevue/multiselect'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: Array, default: () => [] }, // هنا يستقبل مصفوفة إجبارياً
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'name' },
  optionValue: { type: String, default: 'id' },
  placeholder: { type: String, default: 'اختر المجموعات...' },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  showClear: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
