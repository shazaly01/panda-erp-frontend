<!-- src/modules/hr/views/employees/components/AssignEmployeeShiftModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    title="تعيين وردية عمل للموظف"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <div
      class="-m-3 p-4 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
      dir="rtl"
    >
      <!-- 1. اختيار الوردية -->
      <div>
        <AppDropdown
          id="shift-select"
          label="الوردية *"
          v-model="form.shift_id"
          :options="activeShifts"
          option-label="name"
          option-value="id"
          placeholder="-- اختر الوردية --"
          required
        />
      </div>

      <!-- 2. تواريخ الوردية -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AppInput
          id="shift-start-date"
          type="date"
          label="تاريخ بدء الوردية *"
          v-model="form.start_date"
          required
        />
        <AppInput
          id="shift-end-date"
          type="date"
          label="تاريخ الانتهاء (اختياري)"
          v-model="form.end_date"
          :min="form.start_date"
          help-text="اتركه فارغاً إذا كانت الوردية مستمرة."
        />
      </div>

      <!-- 3. أيام العطلة الأسبوعية -->
      <div class="space-y-2 pt-1 border-t border-primary/15">
        <label class="block text-[11px] font-bold text-text-secondary pr-1">
          أيام العطلة الأسبوعية (اختياري)
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <label
            v-for="day in weekDays"
            :key="day.value"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all select-none text-xs font-bold"
            :class="
              form.weekend_days.includes(day.value)
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-2xs'
                : 'bg-surface-card border-surface-border text-text-secondary hover:border-primary/50 hover:text-primary'
            "
          >
            <input type="checkbox" :value="day.value" v-model="form.weekend_days" class="hidden" />
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0"
              :class="
                form.weekend_days.includes(day.value)
                  ? 'bg-primary border-primary'
                  : 'bg-surface-ground border-surface-border'
              "
            >
              <svg
                v-if="form.weekend_days.includes(day.value)"
                class="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span>{{ day.label }}</span>
          </label>
        </div>
      </div>

      <!-- 4. تنبيه إغلاق الوردية السابقة -->
      <div
        class="p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-[11px] font-bold flex items-start gap-2 leading-relaxed"
      >
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          ملاحظة: عند الحفظ، سيقوم النظام تلقائياً بإغلاق أي وردية سابقة نشطة للموظف لتبدأ هذه
          الوردية في تاريخها المحدد.
        </span>
      </div>
    </div>

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>تعيين الوردية</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employeeId: { type: [Number, String], required: true },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const shiftStore = useShiftStore()

const isSaving = ref(false)

const weekDays = [
  { value: 'Sunday', label: 'الأحد' },
  { value: 'Monday', label: 'الإثنين' },
  { value: 'Tuesday', label: 'الثلاثاء' },
  { value: 'Wednesday', label: 'الأربعاء' },
  { value: 'Thursday', label: 'الخميس' },
  { value: 'Friday', label: 'الجمعة' },
  { value: 'Saturday', label: 'السبت' },
]

const activeShifts = computed(() => {
  return shiftStore.shifts.filter((s) => s.is_active)
})

onMounted(() => {
  if (shiftStore.shifts.length === 0) {
    shiftStore.fetchShifts({ per_page: 100 })
  }
})

const getTodayDate = () => new Date().toISOString().split('T')[0]

const defaultForm = () => ({
  shift_id: null,
  start_date: getTodayDate(),
  end_date: '',
  weekend_days: ['Friday', 'Saturday'],
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.value = defaultForm()
    }
  },
)

const close = () => {
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.shift_id) return toast.error('يرجى اختيار الوردية.')
  if (!form.value.start_date) return toast.error('تاريخ بدء الوردية مطلوب.')

  if (form.value.end_date && new Date(form.value.end_date) < new Date(form.value.start_date)) {
    return toast.error('تاريخ الانتهاء يجب أن يكون مساوياً أو بعد تاريخ البدء.')
  }

  isSaving.value = true
  try {
    const payload = {
      ...form.value,
      employee_id: props.employeeId,
      end_date: form.value.end_date || null,
    }

    await shiftStore.assignEmployeeToShift(payload)
    toast.success('تم تعيين الوردية للموظف بنجاح.')

    emit('update:modelValue', false)
    emit('saved')
  } catch {
    toast.error(shiftStore.error || 'حدث خطأ أثناء التعيين.')
  } finally {
    isSaving.value = false
  }
}
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
