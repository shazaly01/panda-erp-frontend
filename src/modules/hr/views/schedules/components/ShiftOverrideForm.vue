<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <!-- اختيار الموظف والتاريخ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="override-employee"
          label="الموظف *"
          v-model="form.employee_id"
          :options="employees"
          option-label="full_name"
          option-value="id"
          placeholder="ابحث عن موظف..."
          :disabled="!!form.id"
          required
        />

        <AppInput
          id="override-date"
          type="date"
          label="تاريخ التجاوز *"
          v-model="form.date"
          :disabled="!!form.id"
          required
        />
      </div>

      <!-- اختيار الوردية الجديدة (أو إعفاء) -->
      <div class="grid grid-cols-1 gap-5">
        <AppDropdown
          id="override-new-shift"
          label="الوردية الجديدة *"
          v-model="form.new_shift_id"
          :options="[
            { id: null, dropdownName: 'إعفاء من الدوام (تحويل ليوم راحة)' },
            ...formattedShifts,
          ]"
          option-label="dropdownName"
          option-value="id"
          placeholder="اختر الوردية"
          required
        />
      </div>

      <!-- رسالة توضيحية ذكية بناءً على الاختيار -->
      <div
        v-if="form.new_shift_id === null"
        class="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start space-x-3 space-x-reverse"
      >
        <svg
          class="w-5 h-5 text-amber-500 mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 class="text-sm font-bold text-amber-800">إعفاء من الدوام</h4>
          <p class="text-xs text-amber-600 mt-1">
            باختيارك "إعفاء"، سيتم تحويل هذا اليوم للموظف إلى (يوم راحة). لن يُطالب بالبصمة، ولن
            يُسجل عليه غياب أو خصم.
          </p>
        </div>
      </div>

      <!-- سبب التجاوز -->
      <AppTextarea
        id="override-reason"
        label="سبب التجاوز (اختياري)"
        v-model="form.reason"
        placeholder="أدخل سبب تبديل الوردية أو الإعفاء..."
        rows="2"
      />
    </div>

    <!-- أزرار الحفظ -->
    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث البيانات' : 'اعتماد التجاوز' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  employees: { type: Array, default: () => [] },
  shifts: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  employee_id: '',
  date: new Date().toISOString().split('T')[0],
  new_shift_id: '',
  reason: '',
})

const form = ref(createFreshForm())

// تهيئة أسماء الورديات لتظهر بشكل أفضل في القائمة المنسدلة
const formattedShifts = computed(() => {
  return props.shifts.map((shift) => ({
    ...shift,
    dropdownName: `${shift.name} (${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)})`,
  }))
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        employee_id: newData.employee_id || newData.employee?.id || '',
        date: newData.date,
        new_shift_id: newData.new_shift_id || null,
        reason: newData.reason || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
