<!--src/modules/accounting/views/journal-entries/components/JournalEntryHeader.vue-->
<template>
  <div
    class="journal-header-grid bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-3.5 transition-all duration-200 font-sans text-right"
    dir="rtl"
  >
    <!-- شريط عنوان مصغر -->
    <div class="flex items-center justify-between pb-2 border-b border-primary/15">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary"></span>
        <span class="text-xs font-black text-text-primary">
          بيانات رأس القيد المحاسبي والمرجع
        </span>
      </div>
      <span class="text-[11px] font-bold text-text-muted">قيد يومية مزدوج</span>
    </div>

    <!-- السطر الأول: التاريخ + العملة + الفرع + رقم المرجع -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5 items-start">
      <div class="md:col-span-3">
        <label for="journal-date" class="block text-xs font-bold text-text-secondary mb-1.5">
          تاريخ القيد *
        </label>
        <AppInput
          id="journal-date"
          type="date"
          :model-value="modelValue.date"
          @update:model-value="updateField('date', $event)"
          class="bg-surface-card font-mono font-bold"
          dir="ltr"
          required
        />
        <p v-if="fiscalYearError" class="mt-1 text-xs text-danger font-bold">
          {{ fiscalYearError }}
        </p>
      </div>

      <div class="md:col-span-3">
        <label for="journal-currency" class="block text-xs font-bold text-text-secondary mb-1.5">
          عملة القيد *
        </label>
        <AppDropdown
          id="journal-currency"
          :model-value="modelValue.currency_id"
          @update:model-value="updateField('currency_id', $event)"
          :options="formattedCurrencies"
          option-label="displayName"
          option-value="id"
          placeholder="اختر العملة..."
          class="bg-surface-card"
          required
        />
      </div>

      <div class="md:col-span-3">
        <label for="journal-cost-center" class="block text-xs font-bold text-text-secondary mb-1.5">
          الفرع / التاق (الافتراضي)
        </label>
        <AppDropdown
          id="journal-cost-center"
          :model-value="modelValue.cost_center_id"
          @update:model-value="updateField('cost_center_id', $event)"
          :options="costCenters"
          option-label="name"
          option-value="id"
          placeholder="قيد عام (بدون فرع)"
          class="bg-surface-card"
        />
      </div>

      <div class="md:col-span-3">
        <label for="journal-reference" class="block text-xs font-bold text-text-secondary mb-1.5">
          رقم المرجع / المستند
        </label>
        <AppInput
          id="journal-reference"
          type="text"
          :model-value="modelValue.reference_number"
          @update:model-value="updateField('reference_number', $event)"
          placeholder="مثال: INV-1024"
          class="bg-surface-card font-mono text-left font-bold"
          dir="ltr"
        />
      </div>
    </div>

    <!-- السطر الثاني: البيان العام للقيد -->
    <div>
      <label for="journal-description" class="block text-xs font-bold text-text-secondary mb-1.5">
        البيان العام للقيد *
      </label>
      <AppInput
        id="journal-description"
        type="text"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="شرح عام لسبب إدخال هذا القيد المحاسبي..."
        class="bg-surface-card"
        required
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  currencies: { type: Array, required: true },
  costCenters: { type: Array, required: true },
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

<style scoped>
.journal-header-grid :deep(input),
.journal-header-grid :deep(.p-dropdown),
.journal-header-grid :deep([data-pc-name='dropdown']),
.journal-header-grid :deep([data-pc-section='root']) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 0.5rem !important;
  box-sizing: border-box !important;
}

.journal-header-grid :deep(input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
}

.journal-header-grid :deep(input[type='date']) {
  color-scheme: inherit;
}

.journal-header-grid :deep(.p-dropdown),
.journal-header-grid :deep([data-pc-name='dropdown']) {
  display: inline-flex !important;
  align-items: center !important;
}

.journal-header-grid :deep(.p-dropdown-label),
.journal-header-grid :deep([data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
}
</style>
