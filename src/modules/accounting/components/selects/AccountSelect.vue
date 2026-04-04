<template>
  <AppSearchableSelect
    :id="id"
    :label="label"
    :placeholder="placeholder"
    :model-value="modelValue"
    api-url="/accounting/accounts"
    :api-params="{ type: type, transactional_only: onlyTransactional ? 1 : 0 }"
    option-label="name_ar"
    option-value="id"
    :required="required"
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import AppSearchableSelect from '@/components/ui/AppSearchableSelect.vue'

defineProps({
  id: { type: String, default: 'account-select' },
  modelValue: { type: [String, Number], default: null },
  label: { type: String, default: 'الحساب' },
  placeholder: { type: String, default: 'ابحث عن الحساب...' },
  required: { type: Boolean, default: false },
  error: { type: String, default: null },

  // فلاتر إضافية
  onlyTransactional: { type: Boolean, default: true }, // افتراضياً نريد الحسابات التي يقيد عليها فقط
  type: { type: String, default: null }, // (اختياري) لفلترة الأصول فقط مثلاً
})

defineEmits(['update:modelValue'])
</script>
