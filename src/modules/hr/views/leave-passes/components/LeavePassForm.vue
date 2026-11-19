<!-- src/modules/hr/views/leave-passes/components/LeavePassForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- 1. اختيار الموظف -->
      <div class="md:col-span-2">
        <AppDropdown
          id="lp-employee"
          label="الموظف طالب الإذن *"
          :model-value="modelValue.employee_id"
          @update:model-value="updateField('employee_id', $event)"
          :options="mappedEmployees"
          option-label="display_name"
          option-value="id"
          :loading="employeeLoading"
          placeholder="-- ابحث باسم الموظف أو الرقم الوظيفي --"
          :show-clear="false"
          :required="true"
          :disabled="isEditMode"
        />
      </div>

      <!-- 2. تاريخ الخروج المؤقت -->
      <div class="md:col-span-2">
        <AppInput
          id="lp-date"
          type="date"
          label="تاريخ الخروج المؤقت *"
          :model-value="modelValue.date"
          @update:model-value="updateField('date', $event)"
          required
        />
      </div>

      <!-- 3. وقت المغادرة المتوقع -->
      <div>
        <AppInput
          id="lp-leave-at"
          type="time"
          label="وقت المغادرة المتوقع *"
          :model-value="modelValue.requested_leave_at"
          @update:model-value="updateField('requested_leave_at', $event)"
          required
        />
      </div>

      <!-- 4. وقت العودة المتوقع -->
      <div>
        <AppInput
          id="lp-return-at"
          type="time"
          label="وقت العودة المتوقع *"
          :model-value="modelValue.requested_return_at"
          @update:model-value="updateField('requested_return_at', $event)"
          required
        />
      </div>
    </div>

    <!-- 5. سبب الإذن -->
    <div>
      <AppTextarea
        id="lp-reason"
        label="سبب الإذن بالتفصيل *"
        :model-value="modelValue.reason"
        @update:model-value="updateField('reason', $event)"
        placeholder="اكتب تبرير المشرف لإصدار الإذن الطارئ للموظف..."
        rows="3"
        required
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/services/apiClient'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const activeEmployees = ref([])
const employeeLoading = ref(false)

const mappedEmployees = computed(() => {
  return activeEmployees.value.map((emp) => ({
    id: emp.id,
    display_name: `${emp.full_name} (رقم: ${emp.employee_number})`,
  }))
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const fetchActiveEmployeesList = async () => {
  employeeLoading.value = true
  try {
    const response = await apiClient.get('/hr/employees', {
      params: { is_active: 1, per_page: 500 },
    })
    activeEmployees.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch employees list for leave pass form.', error)
  } finally {
    employeeLoading.value = false
  }
}

onMounted(() => {
  fetchActiveEmployeesList()
})
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator),
:global(.dark input[type='time']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator,
input[type='time']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}
</style>
