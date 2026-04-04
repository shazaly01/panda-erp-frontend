<template>
  <AppSearchableSelect
    :id="id"
    :label="label"
    placeholder="اختر مركز التكلفة..."
    :model-value="modelValue"
    api-url="/accounting/cost-centers"
    :api-params="{ active_only: 1 }"
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
  id: { type: String, default: 'cost-center-select' },
  modelValue: { type: [String, Number], default: null },
  label: { type: String, default: 'مركز التكلفة' },
  required: { type: Boolean, default: false },
  error: { type: String, default: null },
})

defineEmits(['update:modelValue'])
</script>
