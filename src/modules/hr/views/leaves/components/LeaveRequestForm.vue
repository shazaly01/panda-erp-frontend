<!-- src/modules/hr/views/leaves/components/LeaveRequestForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- 1. اختيار الموظف -->
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

      <!-- 2. نوع الإجازة -->
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

      <!-- 3. تاريخ البداية -->
      <div>
        <AppInput
          id="leave-start-date"
          type="date"
          label="تاريخ بداية الإجازة *"
          :model-value="modelValue.start_date"
          @update:model-value="updateField('start_date', $event)"
          required
        />
      </div>

      <!-- 4. تاريخ النهاية -->
      <div>
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

      <!-- 5. بطاقة إجمالي أيام الإجازة المحسوبة -->
      <div v-if="calculatedDays > 0" class="md:col-span-2">
        <div
          class="w-full bg-surface-card border border-primary/40 rounded-xl px-3.5 py-2.5 flex justify-between items-center shadow-2xs"
        >
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>إجمالي أيام الإجازة المطلوبة:</span>
          </span>
          <span
            class="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/25 text-primary font-mono font-black text-sm"
          >
            {{ calculatedDays }} يوم/أيام
          </span>
        </div>
      </div>
    </div>

    <!-- 6. سبب الإجازة -->
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
      <div class="flex justify-between items-center mt-1 px-1 text-[10px] text-text-muted">
        <span>الحد الأقصى 500 حرف</span>
        <span class="font-mono">{{ (modelValue.reason || '').length }} / 500</span>
      </div>
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

const calculatedDays = computed(() => {
  if (!props.modelValue.start_date || !props.modelValue.end_date) return 0

  const start = new Date(props.modelValue.start_date)
  const end = new Date(props.modelValue.end_date)

  if (end < start) return 0

  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays + 1
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
