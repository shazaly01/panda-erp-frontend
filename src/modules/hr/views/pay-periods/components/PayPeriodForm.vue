<!-- src/modules/hr/views/pay-periods/components/PayPeriodForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- 1. مجموعة الدفع -->
      <div class="md:col-span-2">
        <AppDropdown
          id="payperiod-group"
          label="مجموعة الدفع *"
          :model-value="modelValue.pay_group_id"
          @update:model-value="updateField('pay_group_id', $event)"
          :options="payGroupStore.groups"
          option-label="name"
          option-value="id"
          placeholder="-- اختر مجموعة الدفع --"
          :disabled="isEditMode"
          required
        />
      </div>

      <!-- 2. اسم الفترة -->
      <div class="md:col-span-2">
        <AppInput
          id="payperiod-name"
          type="text"
          label="اسم الفترة *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: شهر أبريل 2026، الأسبوع 14"
          required
        />
      </div>

      <!-- 3. تاريخ البداية -->
      <div>
        <AppInput
          id="payperiod-start-date"
          type="date"
          label="تاريخ البداية *"
          :model-value="modelValue.start_date"
          @update:model-value="updateField('start_date', $event)"
          required
        />
      </div>

      <!-- 4. تاريخ النهاية -->
      <div>
        <AppInput
          id="payperiod-end-date"
          type="date"
          label="تاريخ النهاية *"
          :model-value="modelValue.end_date"
          @update:model-value="updateField('end_date', $event)"
          :min="modelValue.start_date"
          required
        />
      </div>

      <!-- 5. حالة الفترة المالية (عند التعديل) -->
      <div v-if="isEditMode" class="md:col-span-2 space-y-2">
        <AppDropdown
          id="payperiod-status"
          label="حالة الفترة المالية"
          :model-value="modelValue.status"
          @update:model-value="updateField('status', $event)"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          required
        />

        <div
          v-if="modelValue.status === 'closed'"
          class="p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-[11px] font-bold flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>تنبيه: إغلاق الفترة يمنع صرف رواتب جديدة عليها.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const payGroupStore = usePayGroupStore()

const statusOptions = [
  { label: 'مفتوحة (متاحة للصرف)', value: 'open' },
  { label: 'مغلقة (مرحّلة بالكامل)', value: 'closed' },
]

onMounted(() => {
  if (payGroupStore.groups.length === 0) {
    payGroupStore.fetchPayGroups({ is_active: 1 })
  }
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}
</style>
