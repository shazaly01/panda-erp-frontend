<!--src\modules\accounting\views\journal-entries\components\JournalEntryAutocomplete.vue-->
<template>
  <div class="relative w-full h-full">
    <Dropdown
      v-model="internalValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :filter="true"
      :placeholder="placeholder"
      :disabled="disabled"
      appendTo="body"
      :virtualScrollerOptions="{ itemSize: 45 }"
      :pt="{
        // تنسيق الحقل نفسه (الخلية)
        root: {
          class:
            'w-full h-full flex items-center border-none shadow-none bg-transparent focus:ring-0',
        },
        input: { class: 'text-sm p-2 text-text-primary font-medium w-full truncate' },
        trigger: { class: 'w-8 text-text-muted flex items-center justify-center' },

        // تنسيق القائمة العائمة (التي كانت شفافة)
        panel: {
          class:
            'bg-surface-section border border-surface-border shadow-2xl rounded-xl z-[9999] overflow-hidden',
        },

        // تنسيق رأس القائمة (مكان مربع البحث)
        header: { class: 'p-3 bg-surface-bg border-b border-surface-border' },

        // تنسيق مربع البحث نفسه
        filterInput: {
          class:
            'w-full px-3 py-2 text-sm bg-surface-section border border-surface-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-primary placeholder-text-muted transition-colors',
        },
        filterIcon: { class: 'hidden' }, // إخفاء أيقونة البحث الافتراضية لمنع التداخل

        // تنسيق العناصر (الأسطر)
        list: { class: 'py-1 max-h-60 overflow-y-auto' },
        item: ({ context }) => ({
          class: [
            'px-4 py-2 cursor-pointer transition-colors border-b border-surface-border/30 last:border-0',
            context.selected
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-surface-border/50 text-text-primary',
          ],
        }),
      }"
      @change="onChange"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="truncate text-xs font-bold text-primary">
          {{ getDisplayLabel(slotProps.value) }}
        </div>
        <span v-else class="text-text-muted text-xs">
          {{ placeholder }}
        </span>
      </template>

      <template #option="slotProps">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs font-bold font-mono text-primary">{{ slotProps.option.code }}</span>
          <span class="text-xs text-text-muted">{{ slotProps.option.name }}</span>
        </div>
      </template>

      <template #empty>
        <div class="p-4 text-xs text-text-muted text-center font-medium">
          لا توجد نتائج مطابقة لبحثك
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Dropdown from 'primevue/dropdown'

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'name' },
  optionValue: { type: String, default: 'id' },
  placeholder: { type: String, default: 'ابحث...' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const onChange = (event) => {
  emit('change', event.value)
}

const getDisplayLabel = (val) => {
  const selected = props.options.find((opt) => opt[props.optionValue] === val)
  if (selected) {
    return `${selected.code} - ${selected.name}`
  }
  return val
}
</script>

<style scoped>
/* إزالة أي إطارات إضافية من PrimeVue */
:deep(.p-dropdown:not(.p-disabled).p-focus) {
  box-shadow: none !important;
  border-color: transparent !important;
}
</style>
