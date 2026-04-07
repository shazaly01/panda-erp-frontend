<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform flex flex-col"
          role="dialog"
        >
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
            <h3 class="text-lg font-semibold text-text-primary">تعيين وردية عمل للموظف</h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
              :disabled="isSaving"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-5 pb-2">
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

            <div class="grid grid-cols-2 gap-4">
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

            <div class="space-y-2 pt-2 border-t border-surface-border">
              <label class="block text-sm font-medium text-text-primary mb-2">
                أيام العطلة الأسبوعية (اختياري)
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  v-for="day in weekDays"
                  :key="day.value"
                  class="flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors"
                  :class="
                    form.weekend_days.includes(day.value)
                      ? 'bg-primary-50 border-primary text-primary'
                      : 'bg-surface-ground border-surface-border text-text-secondary hover:bg-surface-border'
                  "
                >
                  <input
                    type="checkbox"
                    :value="day.value"
                    v-model="form.weekend_days"
                    class="hidden"
                  />
                  <span class="text-sm font-medium">{{ day.label }}</span>
                </label>
              </div>
            </div>

            <div
              class="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex gap-2 mt-2"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span
                >ملاحظة: عند الحفظ، سيقوم النظام تلقائياً بإغلاق أي وردية سابقة نشطة للموظف لتبدأ
                هذه الوردية في تاريخها المحدد.</span
              >
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-surface-border flex justify-end gap-3">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>تعيين الوردية</span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

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

// أيام الأسبوع حسب ما عرفناه في الـ Backend (باللغة الإنجليزية للبرمجة، وعربي للعرض)
const weekDays = [
  { value: 'Sunday', label: 'الأحد' },
  { value: 'Monday', label: 'الإثنين' },
  { value: 'Tuesday', label: 'الثلاثاء' },
  { value: 'Wednesday', label: 'الأربعاء' },
  { value: 'Thursday', label: 'الخميس' },
  { value: 'Friday', label: 'الجمعة' },
  { value: 'Saturday', label: 'السبت' },
]

// جلب الورديات المفعلة فقط للاختيار منها
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
  weekend_days: ['Friday', 'Saturday'], // عطلة افتراضية لتسهيل الإدخال
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
      // تنظيف البيانات إذا كان حقل الانتهاء فارغاً
      end_date: form.value.end_date || null,
    }

    await shiftStore.assignEmployeeToShift(payload)
    toast.success('تم تعيين الوردية للموظف بنجاح.')

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(shiftStore.error || 'حدث خطأ أثناء التعيين.')
  } finally {
    isSaving.value = false
  }
}
</script>
