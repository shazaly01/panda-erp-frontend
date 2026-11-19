<!-- src/modules/hr/views/loans/components/LoanForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- 1. اختيار الموظف -->
      <div class="md:col-span-2">
        <AppDropdown
          id="loan-employee"
          label="الموظف *"
          :model-value="modelValue.employee_id"
          @update:model-value="updateField('employee_id', $event)"
          :options="employeeStore.employees"
          option-label="full_name"
          option-value="id"
          placeholder="-- اختر الموظف --"
          :disabled="isEditMode"
          required
        />
      </div>

      <!-- 2. مبلغ السلفة الإجمالي -->
      <div>
        <AppInput
          id="loan-amount"
          type="number"
          label="مبلغ السلفة الإجمالي *"
          :model-value="modelValue.amount"
          @update:model-value="updateField('amount', $event)"
          min="1"
          step="0.01"
          placeholder="0.00"
          class="font-mono text-left"
          dir="ltr"
          required
        />
      </div>

      <!-- 3. عدد الأقساط -->
      <div>
        <AppInput
          id="loan-installments"
          type="number"
          label="عدد الأقساط (بالأشهر) *"
          :model-value="modelValue.installments_count"
          @update:model-value="updateField('installments_count', $event)"
          min="1"
          max="60"
          placeholder="مثلاً: 12"
          class="font-mono text-left"
          dir="ltr"
          required
        />
      </div>

      <!-- 4. تاريخ بدء الخصم -->
      <div>
        <AppInput
          id="loan-start-date"
          type="date"
          label="تاريخ بدء الخصم *"
          :model-value="modelValue.deduction_start_date"
          @update:model-value="updateField('deduction_start_date', $event)"
          help-text="الشهر الذي سيبدأ فيه مسير الرواتب بخصم القسط."
          required
        />
      </div>

      <!-- 5. بطاقة القسط الشهري التقديري -->
      <div class="flex items-end pb-1">
        <div
          class="w-full bg-surface-card border border-primary/40 rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-2xs"
        >
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>القسط الشهري التقديري:</span>
          </span>
          <span
            class="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/25 text-primary font-mono font-black text-sm"
          >
            {{ estimatedInstallment }}
          </span>
        </div>
      </div>
    </div>

    <!-- 6. سبب السلفة -->
    <div>
      <AppTextarea
        id="loan-reason"
        label="سبب السلفة / المبرر *"
        :model-value="modelValue.reason"
        @update:model-value="updateField('reason', $event)"
        placeholder="اكتب مبرر طلب السلفة..."
        rows="3"
        required
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const employeeStore = useEmployeeStore()

onMounted(() => {
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ per_page: 500, is_active: 1 })
  }
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const estimatedInstallment = computed(() => {
  const amount = parseFloat(props.modelValue.amount)
  const count = parseInt(props.modelValue.installments_count, 10)

  if (isNaN(amount) || isNaN(count) || count <= 0) {
    return '0.00'
  }

  return (amount / count).toFixed(2)
})
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
