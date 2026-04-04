<template>
  <div class="bg-surface-section p-5 rounded-xl border border-surface-border mb-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <AppInput
          id="journal-date"
          type="date"
          label="تاريخ القيد *"
          :model-value="modelValue.date"
          @update:model-value="updateField('date', $event)"
          class="text-center font-mono"
          dir="ltr"
          required
        />
        <p v-if="fiscalYearError" class="mt-1 text-xs text-rose-500 font-medium">
          {{ fiscalYearError }}
        </p>
      </div>

      <div>
        <AppDropdown
          id="journal-currency"
          label="عملة القيد *"
          :model-value="modelValue.currency_id"
          @update:model-value="updateField('currency_id', $event)"
          :options="formattedCurrencies"
          option-label="displayName"
          option-value="id"
          placeholder="اختر العملة..."
          required
        />
      </div>

      <div>
        <AppDropdown
          id="journal-cost-center"
          label="الفرع / التاق (الافتراضي)"
          :model-value="modelValue.cost_center_id"
          @update:model-value="updateField('cost_center_id', $event)"
          :options="costCenters"
          option-label="name"
          option-value="id"
          placeholder="قيد عام (بدون فرع)"
        />
      </div>

      <div>
        <AppInput
          id="journal-reference"
          type="text"
          label="رقم المرجع / المستند"
          :model-value="modelValue.reference_number"
          @update:model-value="updateField('reference_number', $event)"
          placeholder="مثال: INV-1024"
          class="font-mono text-left"
          dir="ltr"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div>
        <AppTextarea
          id="journal-description"
          label="البيان العام للقيد *"
          :model-value="modelValue.description"
          @update:model-value="updateField('description', $event)"
          placeholder="شرح عام لسبب إدخال هذا القيد المحاسبي..."
          rows="2"
          required
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    // تمت إضافة cost_center_id هنا
    // يتوقع { date: '', currency_id: '', reference_number: '', cost_center_id: '', description: '' }
  },
  currencies: { type: Array, required: true },
  costCenters: { type: Array, required: true }, // جلبنا مراكز التكلفة للهيدر
  fiscalYearError: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const formattedCurrencies = computed(() => {
  return props.currencies.map((c) => ({
    ...c,
    displayName: `${c.code} - ${c.name}`,
  }))
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
