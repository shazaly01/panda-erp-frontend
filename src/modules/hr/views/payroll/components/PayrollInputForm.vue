<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppDropdown
          id="input-employee"
          label="الموظف *"
          :model-value="modelValue.employee_id"
          @update:model-value="updateField('employee_id', $event)"
          :options="employeeStore.employees"
          option-label="full_name"
          option-value="id"
          placeholder="-- اختر الموظف --"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppDropdown
          id="input-type"
          label="نوع الحركة *"
          :model-value="modelValue.type"
          @update:model-value="updateField('type', $event)"
          :options="typeOptions"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="input-date"
          type="date"
          label="تاريخ الاستحقاق *"
          :model-value="modelValue.date"
          @update:model-value="updateField('date', $event)"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="input-amount"
          type="number"
          label="المبلغ *"
          :model-value="modelValue.amount"
          @update:model-value="updateField('amount', $event)"
          placeholder="0.00"
          step="0.01"
          required
        />
      </div>
    </div>

    <div>
      <AppTextarea
        id="input-reason"
        label="السبب / البيان *"
        :model-value="modelValue.reason"
        @update:model-value="updateField('reason', $event)"
        placeholder="اكتب تفاصيل الحركة (مثلاً: حافز الأداء المتميز لشهر مارس)..."
        rows="3"
        required
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const employeeStore = useEmployeeStore()

// جلب الموظفين إذا لم يتم جلبهم مسبقاً
onMounted(() => {
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ per_page: 100 })
  }
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// الأنواع المسموحة بناءً على StorePayrollInputRequest
const typeOptions = [
  { id: 'bonus', name: 'حافز (Bonus)' },
  { id: 'penalty', name: 'جزاء / خصم (Penalty)' },
  { id: 'allowance', name: 'بدل (Allowance)' },
  { id: 'deduction', name: 'استقطاع (Deduction)' },
]
</script>
