<!-- src/modules/hr/views/shift-overrides/components/ShiftOverrideForm.vue -->
<template>
  <form
    @submit.prevent="handleSubmit"
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. اختيار الموظف والتاريخ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
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
      </div>

      <div>
        <AppInput
          id="override-date"
          type="date"
          label="تاريخ التجاوز *"
          v-model="form.date"
          :disabled="!!form.id"
          required
        />
      </div>
    </div>

    <!-- 2. اختيار الوردية الجديدة (أو إعفاء) -->
    <div>
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

    <!-- 3. رسالة توضيحية ذكية عند اختيار الإعفاء -->
    <div
      v-if="form.new_shift_id === null"
      class="p-3 rounded-xl border border-warning/40 bg-warning/10 flex items-start gap-2.5"
    >
      <svg
        class="w-4 h-4 text-warning mt-0.5 shrink-0"
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
      <div class="space-y-0.5">
        <h4 class="text-xs font-black text-warning">إعفاء من الدوام</h4>
        <p class="text-[11px] text-text-secondary leading-relaxed">
          باختيارك "إعفاء"، سيتم تحويل هذا اليوم للموظف إلى (يوم راحة). لن يُطالب بالبصمة، ولن يُسجل
          عليه غياب أو خصم.
        </p>
      </div>
    </div>

    <!-- 4. سبب التجاوز -->
    <div>
      <AppTextarea
        id="override-reason"
        label="سبب التجاوز (اختياري)"
        v-model="form.reason"
        placeholder="أدخل سبب تبديل الوردية أو الإعفاء..."
        rows="2"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

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

defineExpose({
  submit: handleSubmit,
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
