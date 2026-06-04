<!--src\modules\hr\views\leave-passes\components\LeavePassForm.vue-->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- اختيار الموظف (يظهر كمشرف يختار الموظف التابع له) -->
      <div class="md:col-span-2">
        <label for="lp-employee" class="block text-sm font-medium text-text-primary mb-1.5">
          اختار الموظف طالب الإذن *
        </label>
        <select
          id="lp-employee"
          :value="modelValue.employee_id"
          @change="
            updateField('employee_id', $event.target.value ? Number($event.target.value) : null)
          "
          class="w-full px-3 py-2 bg-surface-section text-text-primary border border-surface-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-surface-border/50 disabled:cursor-not-allowed transition-colors text-sm"
          :disabled="isEditMode || employeeLoading"
          required
        >
          <option :value="null">
            {{ employeeLoading ? 'جاري تحميل قائمة الموظفين...' : '-- اختر الموظف من القائمة --' }}
          </option>
          <option v-for="emp in activeEmployees" :key="emp.id" :value="emp.id">
            {{ emp.full_name }} (رقم: {{ emp.employee_number }})
          </option>
        </select>
      </div>

      <!-- تاريخ الإذن -->
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

      <!-- وقت الخروج المتوقع -->
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

      <!-- وقت العودة المتوقع -->
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

    <!-- سبب الخروج -->
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
import { ref, onMounted } from 'vue'
import apiClient from '@/services/apiClient' // أو استخدام useEmployeeStore حسب المتاح في مشروعك
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const activeEmployees = ref([])
const employeeLoading = ref(false)

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
