<!-- src/components/ui/AppDropdown.vue -->
<template>
  <div class="relative w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-text-secondary mb-1">
      {{ label }}
    </label>

    <div class="relative w-full flex items-center">
      <!-- أيقونة جانبية في أقصى اليمين مع توسيط رأسي دقيق -->
      <span
        v-if="$slots.icon"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-text-muted pointer-events-none flex items-center justify-center"
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
              'transition-all duration-200 rounded-md shadow-sm text-right',
              props.variant === 'sales'
                ? 'bg-transparent border-0 shadow-none outline-none ring-0'
                : 'bg-surface-section border border-surface-border hover:border-primary',
              state.focused && props.variant !== 'sales'
                ? 'border-primary ring-2 ring-primary/20 outline-none'
                : '',
              disabled
                ? 'opacity-60 cursor-not-allowed pointer-events-none bg-surface-ground'
                : 'cursor-pointer',
            ],
          }),
          input: () => ({
            class: [
              'w-full py-1 text-xs font-bold leading-normal bg-transparent border-0 focus:outline-none flex items-center text-ellipsis overflow-hidden text-text-primary placeholder:text-text-muted',
              hasIcon ? '!pr-10 pl-2' : props.variant === 'sales' ? 'p-0 pr-1' : 'px-3',
            ],
          }),
          trigger: {
            class: [
              'flex items-center justify-center shrink-0 text-text-muted text-xs',
              props.variant === 'sales' ? 'w-6 h-full' : 'w-8 pl-1.5',
            ],
          },
          clearIcon: {
            class:
              'text-text-muted hover:text-danger ml-1 cursor-pointer transition-colors text-xs',
          },
          panel: {
            class: [
              'bg-surface-section border border-surface-border text-text-primary',
              'rounded-xl shadow-2xl mt-1 overflow-hidden z-50 text-right font-sans',
            ],
          },
          header: {
            class: ['p-2 border-b border-surface-border bg-surface-ground'],
          },
          filterInput: {
            class: [
              'w-full p-2 text-xs border border-surface-border rounded-md bg-surface-section text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-right font-sans font-medium',
            ],
          },
          list: {
            class: [
              'p-1 max-h-60 overflow-y-auto custom-scrollbar bg-surface-section relative z-10',
            ],
          },
          item: ({ context }) => ({
            class: [
              'p-2 text-xs font-bold rounded-lg cursor-pointer overflow-hidden whitespace-nowrap transition-colors duration-150 text-right',
              !context.focused && !context.selected
                ? 'text-text-primary hover:bg-surface-ground'
                : '',
              context.focused && !context.selected ? 'bg-surface-ground text-text-primary' : '',
              context.selected ? 'bg-primary/10 text-primary font-extrabold' : '',
            ],
          }),
          itemGroup: {
            class: 'p-2 font-bold text-text-muted text-xs text-right',
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
  variant: { type: String, default: 'default' },
})

defineEmits(['update:modelValue'])

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
  background-color: rgb(var(--color-surface-border));
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-text-muted));
}
</style>
