<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppDropdown
          id="lp-employee"
          label="اختار الموظف طالب الإذن *"
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

    <div>
      <AppTextarea
        id="lp-reason"
        label="سبب الإذن بالتفصيل *"
        :model-value="modelValue.reason"
        @update:model-value="updateField('reason', $event)"
        placeholder="اكتب تبرير المشرف لإصدار الإذن الطارئ للموظف..."
        rows="4"
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

// مواءمة ومعالجة البيانات لدمج الاسم والرقم الوظيفي ليتعرف عليها محرك البحث داخل الـ Dropdown
const mappedEmployees = computed(() => {
  return activeEmployees.value.map((emp) => ({
    id: emp.id,
    display_name: `${emp.full_name} (رقم: ${emp.employee_number})`,
  }))
})

// تحديث الحقول بشكل مرن وإرسال المخرجات للأب (V-Model)
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// جلب قائمة الموظفين النشطين تلقائياً عند تحميل الاستمارة لملء القائمة المنسدلة للمشرف
const fetchActiveEmployeesList = async () => {
  employeeLoading.value = true
  try {
    // جلب الموظفين النشطين فقط والذين هم على رأس العمل
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
