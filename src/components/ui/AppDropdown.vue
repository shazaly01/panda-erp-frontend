<!--src\components\ui\AppDropdown.vue-->
<template>
  <div class="relative w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>

    <Dropdown
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
      appendTo="body"
      class="w-full"
      :pt="{
        root: ({ state }) => ({
          class: [
            'w-full inline-flex relative cursor-pointer select-none',
            'bg-gray-50 border-2 transition-all duration-200 rounded-xl shadow-sm',
            'dark:bg-surface-ground',
            'hover:border-blue-500 dark:hover:border-sky-400/60',
            // التمييز والوهج الديناميكي الموحد باللون السماوي والأزرق عند التركيز
            state.focused
              ? 'border-blue-500 ring-2 ring-blue-500 dark:border-sky-400 dark:ring-sky-400/50 dark:shadow-[0_0_15px_rgba(56,189,248,0.12)] outline-none'
              : 'border-gray-300 dark:border-blue-500/40',
          ],
        }),
        input: {
          class:
            'w-full p-2.5 text-sm text-gray-900 dark:text-text-primary bg-transparent border-0 focus:outline-none',
        },
        trigger: {
          class:
            'flex items-center justify-center shrink-0 w-12 rounded-l-xl text-gray-500 dark:text-gray-400',
        },
        clearIcon: {
          class: 'text-gray-500 dark:text-gray-400 mr-2',
        },
        panel: {
          class: [
            'bg-white dark:bg-[#1f2937]',
            'border border-gray-300 dark:border-gray-700',
            'rounded-xl shadow-2xl',
            'mt-1',
            'overflow-hidden',
          ],
        },
        header: {
          class: 'p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60',
        },
        filterInput: {
          class:
            'w-full p-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-sky-400',
        },
        list: {
          class: [
            'p-1 max-h-60 overflow-y-auto custom-scrollbar',
            'bg-white dark:bg-[#1f2937]',
            'relative z-10',
          ],
        },
        item: ({ context }) => ({
          class: [
            'p-2.5 text-sm rounded-lg cursor-pointer overflow-hidden whitespace-nowrap',
            'transition-colors duration-150',
            // الحالة العادية (لا تركيز ولا تحديد)
            !context.focused && !context.selected
              ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
              : '',
            // حالة التركيز والتنقل باستخدام أسهم لوحة المفاتيح
            context.focused && !context.selected
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              : '',
            // حالة التحديد الفعلي الموحدة بالكامل باللون الأزرق والسماوي الناصع
            context.selected
              ? 'bg-blue-50 dark:bg-sky-500/10 text-blue-700 dark:text-sky-400 font-bold'
              : '',
          ],
        }),
        itemGroup: {
          class: 'p-2 font-bold text-gray-500 dark:text-gray-400 text-xs',
        },
      }"
    />
  </div>
</template>

<script setup>
import Dropdown from 'primevue/dropdown'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'name' },
  optionValue: { type: String, default: 'id' },
  placeholder: { type: String, default: 'اختر...' },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  showClear: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* تحسين شكل شريط التمرير المخصص للقائمة */
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
