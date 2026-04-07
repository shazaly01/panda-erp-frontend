<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      <div class="md:col-span-1">
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

      <div class="md:col-span-1">
        <AppInput
          id="loan-installments"
          type="number"
          label="عدد الأقساط (بالأشهر) *"
          :model-value="modelValue.installments_count"
          @update:model-value="updateField('installments_count', $event)"
          min="1"
          max="60"
          placeholder="مثلاً: 12"
          required
        />
      </div>

      <div class="md:col-span-1">
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

      <div class="md:col-span-1 flex items-end pb-1">
        <div
          class="w-full bg-primary/10 border border-primary/20 rounded-lg p-3 flex justify-between items-center"
        >
          <span class="text-sm font-bold text-text-primary">القسط الشهري التقديري:</span>
          <span class="text-lg font-bold font-mono text-primary">{{ estimatedInstallment }}</span>
        </div>
      </div>
    </div>

    <div>
      <AppTextarea
        id="loan-reason"
        label="سبب السلفة / المبرر *"
        :model-value="modelValue.reason"
        @update:model-value="updateField('reason', $event)"
        placeholder="اكتب مبرر طلب السلفة..."
        rows="2"
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

// جلب الموظفين إذا لم يتم جلبهم مسبقاً
onMounted(() => {
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ per_page: 500, is_active: 1 })
  }
})

// دالة لتحديث البيانات دون كسر قاعدة One-Way Data Flow
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// حساب القسط التقديري لحظياً بناءً على المبلغ وعدد الأقساط
const estimatedInstallment = computed(() => {
  const amount = parseFloat(props.modelValue.amount)
  const count = parseInt(props.modelValue.installments_count, 10)

  if (isNaN(amount) || isNaN(count) || count <= 0) {
    return '0.00'
  }

  return (amount / count).toFixed(2)
})
</script>
