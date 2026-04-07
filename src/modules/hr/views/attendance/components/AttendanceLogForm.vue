<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppDropdown
          id="attendance-employee"
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

      <div class="md:col-span-2">
        <AppInput
          id="attendance-date"
          type="date"
          label="التاريخ *"
          :model-value="modelValue.date"
          @update:model-value="updateField('date', $event)"
          :max="today"
          help-text="لا يمكن تسجيل حضور لتاريخ مستقبلي."
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="attendance-check-in"
          type="time"
          label="وقت الحضور (اختياري في حال الغياب)"
          :model-value="modelValue.check_in"
          @update:model-value="updateField('check_in', $event)"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="attendance-check-out"
          type="time"
          label="وقت الانصراف (اختياري)"
          :model-value="modelValue.check_out"
          @update:model-value="updateField('check_out', $event)"
          :min="modelValue.check_in"
        />
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="attendance-status"
          label="حالة الحركة *"
          :model-value="modelValue.status"
          @update:model-value="updateField('status', $event)"
          :options="statusOptions"
          option-label="name"
          option-value="id"
          required
        />
        <p class="text-xs text-text-muted mt-1">
          ملاحظة: سيقوم النظام بمراجعة وردية الموظف وحساب دقائق التأخير أو العمل الإضافي آلياً عند
          الحفظ.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const employeeStore = useEmployeeStore()

// تحديد تاريخ اليوم كحد أقصى لمنع تسجيل المستقبل
const today = new Date().toISOString().split('T')[0]

// خيارات الحالة (بناءً على الـ Request)
const statusOptions = [
  { id: 'present', name: 'حاضر' },
  { id: 'absent', name: 'غائب' },
  { id: 'late', name: 'متأخر' },
  { id: 'on_leave', name: 'في إجازة' },
]

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
</script>
