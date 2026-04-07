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
          aria-modal="true"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
              <svg
                class="w-6 h-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              اعتماد وترحيل الرواتب
            </h3>
            <button
              @click="close"
              :disabled="payrollStore.isPosting"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
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

          <div
            class="bg-amber-50/50 border border-amber-200 p-4 rounded-lg mb-5 flex items-start gap-3"
          >
            <svg
              class="w-6 h-6 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p class="text-sm font-bold text-amber-800">تأكيد عملية الترحيل</p>
              <p class="text-xs text-amber-700 mt-1">
                سيتم ترحيل رواتب عدد (<strong>{{ employeeIds.length }}</strong
                >) موظف/موظفة. هذه العملية ستقوم بإنشاء القيود المحاسبية، وإغلاق السلف، ولن يمكن
                التراجع عنها إلا عبر الإدارة المالية.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <AppInput
              id="posting-date"
              type="date"
              label="تاريخ القيد المحاسبي (تاريخ الاستحقاق) *"
              v-model="form.date"
              required
            />

            <AppTextarea
              id="posting-desc"
              label="شرح القيد المحاسبي (سيظهر في دفتر الأستاذ) *"
              v-model="form.description"
              rows="3"
              required
            />
          </div>

          <div class="pt-5 mt-5 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="payrollStore.isPosting">
              إلغاء
            </AppButton>
            <AppButton
              @click="submit"
              :disabled="payrollStore.isPosting"
              class="bg-emerald-600 hover:bg-emerald-700 border-none text-white"
            >
              <span v-if="payrollStore.isPosting" class="flex items-center gap-2">
                <svg
                  class="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الترحيل...
              </span>
              <span v-else>تأكيد واعتماد الرواتب</span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employeeIds: { type: Array, required: true },
  month: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'posted'])

const toast = useToast()
const payrollStore = usePayrollStore()

// القيم الافتراضية
const form = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
})

// تعيين الوصف الافتراضي عند فتح النافذة بناءً على الشهر المختار
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.value.date = new Date().toISOString().split('T')[0]
      form.value.description = `إثبات مسير رواتب الموظفين لشهر ${props.month}`
    }
  },
)

const close = () => {
  if (payrollStore.isPosting) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.date) return toast.error('تاريخ القيد مطلوب.')
  if (!form.value.description.trim()) return toast.error('شرح القيد مطلوب.')

  try {
    await payrollStore.postPayrollBatch({
      employee_ids: props.employeeIds,
      date: form.value.date,
      description: form.value.description,
    })

    toast.success('تم اعتماد وترحيل الرواتب بنجاح.')
    emit('posted')
    close()
  } catch (error) {
    // تم التعامل مع إظهار الخطأ داخل الـ Store
  }
}
</script>
