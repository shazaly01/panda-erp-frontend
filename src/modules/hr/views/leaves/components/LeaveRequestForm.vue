<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppDropdown
          id="leave-employee"
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
        <AppDropdown
          id="leave-type"
          label="نوع الإجازة *"
          :model-value="modelValue.leave_type_id"
          @update:model-value="updateField('leave_type_id', $event)"
          :options="leaveTypes"
          option-label="name"
          option-value="id"
          placeholder="-- اختر نوع الإجازة --"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="leave-start-date"
          type="date"
          label="تاريخ بداية الإجازة *"
          :model-value="modelValue.start_date"
          @update:model-value="updateField('start_date', $event)"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="leave-end-date"
          type="date"
          label="تاريخ نهاية الإجازة *"
          :model-value="modelValue.end_date"
          @update:model-value="updateField('end_date', $event)"
          :min="modelValue.start_date"
          required
        />
      </div>

      <div class="md:col-span-2 flex items-end pb-1" v-if="calculatedDays > 0">
        <div
          class="w-full bg-sky-50/50 border border-sky-100 rounded-lg p-3 flex justify-between items-center text-sky-800"
        >
          <span class="text-sm font-bold">إجمالي أيام الإجازة المطلوبة:</span>
          <span class="text-lg font-bold">{{ calculatedDays }} يوم/أيام</span>
        </div>
      </div>
    </div>

    <div>
      <AppTextarea
        id="leave-reason"
        label="سبب الإجازة (اختياري)"
        :model-value="modelValue.reason"
        @update:model-value="updateField('reason', $event)"
        placeholder="اكتب تفاصيل أو مبرر الإجازة إن وجد..."
        rows="3"
        maxlength="500"
      />
      <div class="text-left mt-1 text-[10px] text-text-muted">الحد الأقصى 500 حرف</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
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
// قائمة مؤقتة لأنواع الإجازات حتى نقوم بربطها بـ Store خاص بها إذا لزم الأمر
const leaveTypes = ref([
  { id: 1, name: 'إجازة سنوية' },
  { id: 2, name: 'إجازة مرضية' },
  { id: 3, name: 'إجازة طارئة' },
])

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

// حساب الأيام بشكل مبدئي (تاريخ النهاية - تاريخ البداية + 1)
const calculatedDays = computed(() => {
  if (!props.modelValue.start_date || !props.modelValue.end_date) return 0

  const start = new Date(props.modelValue.start_date)
  const end = new Date(props.modelValue.end_date)

  if (end < start) return 0

  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays + 1 // إضافة يوم البداية كجزء من الإجازة
})
</script>
