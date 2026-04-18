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
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
          class="bg-surface-section rounded-xl shadow-2xl p-6 w-full max-w-lg transform flex flex-col border border-surface-border"
          role="dialog"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-4 mb-5 shrink-0"
          >
            <h3 class="text-lg font-bold text-text-primary flex items-center gap-2">
              <span class="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              اعتماد وترحيل الرواتب
            </h3>
            <button
              @click="close"
              :disabled="payrollStore.isPosting"
              class="text-text-muted hover:text-rose-500 p-1.5 rounded-full hover:bg-surface-border transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-lg mb-5 flex items-start gap-3"
          >
            <svg
              class="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5"
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
              <p class="text-sm font-bold text-amber-800 dark:text-amber-400">
                تأكيد عملية الترحيل المالي
              </p>
              <p class="text-xs text-amber-700 dark:text-amber-500/80 mt-1">
                سيتم ترحيل رواتب عدد (<strong>{{ employeeIds.length }}</strong
                >) موظف. هذه العملية ستقوم بتوليد قيد محاسبي في دفتر الأستاذ بتاريخ نهاية الفترة
                <span v-if="runType === 'regular'">وسيتم إغلاق الفترة المالية.</span>
                ولن يمكن التراجع عنها إلا بقيد عكسي.
              </p>
            </div>
          </div>

          <div class="mb-5 bg-surface-ground p-4 rounded-lg border border-surface-border">
            <h4 class="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">
              ملخص القيد المحاسبي المتوقع
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="block text-xs text-text-muted mb-1">إجمالي الاستحقاقات (مدين)</span>
                <span class="font-mono font-bold text-sm text-text-primary">
                  {{ formatCurrency(payrollStore.batchSummary.total_allowances) }}
                </span>
              </div>
              <div>
                <span class="block text-xs text-text-muted mb-1">إجمالي الاستقطاعات (دائن)</span>
                <span class="font-mono font-bold text-sm text-rose-500">
                  {{ formatCurrency(payrollStore.batchSummary.total_deductions) }}
                </span>
              </div>
              <div class="col-span-2 pt-3 border-t border-surface-border mt-1">
                <span class="block text-xs text-text-muted mb-1">صافي المستحق للموظفين (دائن)</span>
                <span class="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-500">
                  {{ formatCurrency(payrollStore.batchSummary.total_net) }}
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <AppTextarea
              id="posting-desc"
              label="البيان (يظهر في الدفتر المحاسبي) *"
              v-model="form.description"
              rows="2"
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
              class="bg-emerald-600 hover:bg-emerald-700 border-none text-white min-w-[140px]"
            >
              <span
                v-if="payrollStore.isPosting"
                class="flex items-center justify-center gap-2 w-full"
              >
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
              <span v-else>اعتماد وترحيل</span>
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
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employeeIds: { type: Array, required: true },
  // 🚀 التعديل: استقبال كائن الفترة بالكامل ونوع المسير
  payPeriod: { type: Object, required: true },
  runType: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'posted'])

const toast = useToast()
const payrollStore = usePayrollStore()

const form = ref({
  description: '',
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.payPeriod) {
      // 🚀 التعديل: وصف ذكي يعتمد على نوع التنفيذ واسم الفترة
      const typeLabel = props.runType === 'overtime_only' ? 'الإضافية (Overtime)' : 'الأساسية'
      form.value.description = `إثبات مسير الرواتب ${typeLabel} للموظفين لفترة: ${props.payPeriod.name}`
    }
  },
)

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const close = () => {
  if (payrollStore.isPosting) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.description.trim()) return toast.error('شرح القيد المحاسبي مطلوب.')

  try {
    // 🚀 التعديل: إرسال الـ IDs الجديدة بدلاً من التواريخ
    await payrollStore.postPayrollBatch({
      employee_ids: props.employeeIds,
      pay_period_id: props.payPeriod.id,
      run_type: props.runType,
      description: form.value.description,
    })

    toast.success('تم الترحيل بنجاح وتم إنشاء القيد المحاسبي.')
    emit('posted')
    close()
  } catch (error) {
    // الأخطاء تتم معالجتها في الـ Store
  }
}
</script>
