<!-- src\modules\accounting\components\selects\FiscalYearSelect.vue -->
<template>
  <AppSearchableSelect
    :id="id"
    :label="label"
    placeholder="السنة المالية"
    :model-value="modelValue"
    api-url="/accounting/fiscal-years"
    option-label="name"
    option-value="id"
    :required="required"
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import AppSearchableSelect from '@/components/ui/AppSearchableSelect.vue'

defineProps({
  id: { type: String, default: 'fiscal-year-select' },
  modelValue: { type: [String, Number], default: null },
  label: { type: String, default: 'السنة المالية' },
  required: { type: Boolean, default: false },
  error: { type: String, default: null },
})

defineEmits(['update:modelValue'])
</script>
