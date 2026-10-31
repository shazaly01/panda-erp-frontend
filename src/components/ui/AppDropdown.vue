<!-- src/components/ui/AppDropdown.vue -->
<template>
  <div class="relative w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
    >
      {{ label }}
    </label>

    <div class="relative w-full flex items-center">
      <!-- أيقونة جانبية في أقصى اليمين مع توسيط رأسي دقيق -->
      <span
        v-if="$slots.icon"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 pointer-events-none flex items-center justify-center"
      >
        <slot name="icon" />
      </span>

      <Dropdown
        :id="id"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :options="options"
        :option-label="optionLabel"
        :option-value="optionValue"
        :filter="filter"
        :filter-placeholder="filterPlaceholder"
        :loading="loading"
        :required="required"
        :disabled="disabled"
        :placeholder="placeholder"
        :show-clear="showClear"
        appendTo="body"
        class="w-full"
        :class="[hasIcon ? '[&_.p-dropdown-label]:!pr-10' : '']"
        :pt="{
          root: ({ state }) => ({
            class: [
              'w-full inline-flex relative select-none min-h-[38px] h-[38px] items-center',
              'transition-all duration-200 rounded-xl shadow-sm text-right',
              disabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer',
              isOrange
                ? [
                    disabled
                      ? 'bg-[#131417]/80 border border-[#2d303b]'
                      : 'bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b]',
                    state.focused
                      ? 'border-[#e05e2b] ring-1 ring-[#e05e2b]/40 shadow-[0_0_12px_rgba(224,94,43,0.2)] outline-none'
                      : '',
                  ]
                : [
                    disabled
                      ? 'bg-gray-100 dark:bg-surface-ground/50 border-2 border-gray-300 dark:border-gray-700'
                      : 'bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 hover:border-blue-500 dark:hover:border-sky-400/60',
                    state.focused
                      ? 'border-blue-500 ring-2 ring-blue-500 dark:border-sky-400 dark:ring-sky-400/50 dark:shadow-[0_0_15px_rgba(56,189,248,0.12)] outline-none'
                      : '',
                  ],
            ],
          }),
          input: () => ({
            class: [
              'w-full py-1 text-xs font-bold leading-normal bg-transparent border-0 focus:outline-none flex items-center text-ellipsis overflow-hidden',
              hasIcon ? '!pr-10 pl-2' : 'px-3',
              isOrange ? 'text-white' : 'text-gray-900 dark:text-text-primary',
            ],
          }),
          trigger: {
            class: 'flex items-center justify-center shrink-0 w-7 pl-1.5 text-gray-400 text-xs',
          },
          clearIcon: {
            class:
              'text-gray-400 hover:text-rose-400 ml-1 cursor-pointer transition-colors text-xs',
          },
          panel: {
            class: [
              isOrange
                ? 'bg-[#1c1e24] border border-[#3e414c] text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
                : 'bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-700',
              'rounded-xl shadow-2xl mt-1 overflow-hidden z-50 text-right font-sans',
            ],
          },
          header: {
            class: [
              'p-2 border-b',
              isOrange
                ? 'border-[#3e414c] bg-[#16171b]'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60',
            ],
          },
          filterInput: {
            class: [
              'w-full p-2 text-xs border rounded-lg focus:outline-none text-right font-sans',
              isOrange
                ? 'bg-[#121316] border-[#3e414c] text-white focus:border-[#e05e2b] focus:ring-1 focus:ring-[#e05e2b]/30'
                : 'border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:border-blue-500 dark:focus:border-sky-400',
            ],
          },
          list: {
            class: [
              'p-1 max-h-60 overflow-y-auto custom-scrollbar',
              isOrange ? 'bg-[#1c1e24]' : 'bg-white dark:bg-[#1f2937]',
              'relative z-10',
            ],
          },
          item: ({ context }) => ({
            class: [
              'p-2 text-xs font-bold rounded-lg cursor-pointer overflow-hidden whitespace-nowrap transition-colors duration-150 text-right',
              !context.focused && !context.selected
                ? isOrange
                  ? 'text-gray-300 hover:bg-[#282a33] hover:text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                : '',
              context.focused && !context.selected
                ? isOrange
                  ? 'bg-[#282a33] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : '',
              context.selected
                ? isOrange
                  ? 'bg-[#e05e2b]/20 text-[#e05e2b] font-black'
                  : 'bg-blue-50 dark:bg-sky-500/10 text-blue-700 dark:text-sky-400 font-bold'
                : '',
            ],
          }),
          itemGroup: {
            class: 'p-2 font-bold text-gray-500 dark:text-gray-400 text-xs text-right',
          },
        }"
      >
        <template v-if="$slots.value" #value="slotProps">
          <slot name="value" :value="slotProps.value" :placeholder="slotProps.placeholder" />
        </template>
        <template v-if="$slots.option" #option="slotProps">
          <slot name="option" :option="slotProps.option" />
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import Dropdown from 'primevue/dropdown'

const slots = useSlots()

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: [String, Number, Object], default: null },
  options: { type: Array, default: () => [] },
  optionLabel: { type: [String, Function], default: 'name' },
  optionValue: { type: [String, Function], default: 'id' },
  placeholder: { type: String, default: 'اختر...' },
  filterPlaceholder: { type: String, default: 'بحث...' },
  loading: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showClear: { type: Boolean, default: true },
  filter: { type: Boolean, default: true },
  accentColor: { type: String, default: 'blue' },
})

defineEmits(['update:modelValue'])

const isOrange = computed(() => props.accentColor === 'orange')
const hasIcon = computed(() => Boolean(slots.icon))
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
