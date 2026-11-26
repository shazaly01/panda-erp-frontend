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
              <span
                class="p-1.5 rounded-lg"
                :class="
                  isEditMode ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'
                "
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <span v-if="isEditMode">
                تحديث مسير الرواتب المعتمد ({{ activeBatch?.number }})
              </span>
              <span v-else>اعتماد وترحيل الرواتب</span>
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
            class="p-4 rounded-lg mb-5 flex items-start gap-3 border"
            :class="
              isEditMode
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
            "
          >
            <svg
              class="w-6 h-6 shrink-0 mt-0.5"
              :class="
                isEditMode
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-600 dark:text-amber-500'
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p
                class="text-sm font-bold"
                :class="
                  isEditMode
                    ? 'text-blue-800 dark:text-blue-300'
                    : 'text-amber-800 dark:text-amber-400'
                "
              >
                {{
                  isEditMode
                    ? 'تحديث رأس وتفاصيل المسير والقيد المحاسبي'
                    : 'تأكيد عملية الاعتماد وإثبات الاستحقاق'
                }}
              </p>
              <p
                class="text-xs mt-1 leading-relaxed"
                :class="
                  isEditMode
                    ? 'text-blue-700 dark:text-blue-400/80'
                    : 'text-amber-700 dark:text-amber-500/80'
                "
              >
                <template v-if="isEditMode">
                  سيتم تحديث بيانات رأس المسير (<strong>{{ activeBatch?.number }}</strong
                  >) والقيد المحاسبي المرتبط به بنفس رقمه، وحذف التفاصيل القديمة وإعادة إدراجها لعدد
                  (<strong>{{ employeeIds.length }}</strong
                  >) موظف.
                </template>
                <template v-else>
                  سيتم إثبات كامل استحقاق رواتب عدد (<strong>{{ employeeIds.length }}</strong
                  >) موظف في دفتر الأستاذ، مع تسجيل المتبقي غير المصروف كمديونية في حساب كل موظف.
                </template>
              </p>
            </div>
          </div>

          <div class="mb-5 bg-surface-ground p-4 rounded-lg border border-surface-border">
            <h4 class="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">
              ملخص القيد المحاسبي وتوزيع الصرف
            </h4>
            <div class="grid grid-cols-2 gap-3.5">
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
              <div class="col-span-2 pt-2.5 border-t border-surface-border">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-text-muted">إجمالي صافي الرواتب المثبتة (100%):</span>
                  <span class="font-mono font-bold text-base text-text-primary">
                    {{ formatCurrency(payrollStore.batchSummary.total_net) }}
                  </span>
                </div>
              </div>
              <div class="pt-2 border-t border-surface-border">
                <span class="block text-[11px] text-text-muted mb-0.5">
                  المقرر صرفه حالياً ({{ payrollStore.disbursementPercentage }}%)
                </span>
                <span class="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(payrollStore.disbursedAmount) }}
                </span>
              </div>
              <div class="pt-2 border-t border-surface-border">
                <span class="block text-[11px] text-text-muted mb-0.5">
                  المتبقي (مديونية للموظفين)
                </span>
                <span class="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                  {{ formatCurrency(remainingTotal) }}
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
              class="border-none text-white min-w-[155px]"
              :class="
                isEditMode
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              "
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
                {{ isEditMode ? 'جاري التحديث...' : 'جاري الترحيل...' }}
              </span>
              <span v-else>
                {{ isEditMode ? 'حفظ وتحديث المسير' : 'اعتماد وترحيل' }}
              </span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employeeIds: { type: Array, required: true },
  payPeriod: { type: Object, required: true },
  runType: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'posted'])

const toast = useToast()
const payrollStore = usePayrollStore()

const isEditMode = computed(() => Boolean(payrollStore.editingBatchId))
const activeBatch = computed(() => payrollStore.activeBatch)

const remainingTotal = computed(() => {
  const net = Number(payrollStore.batchSummary.total_net || 0)
  const disbursed = Number(payrollStore.disbursedAmount || 0)
  return Math.max(0, Math.round((net - disbursed + Number.EPSILON) * 100) / 100)
})

const form = ref({
  description: '',
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.payPeriod) {
      if (isEditMode.value && activeBatch.value?.name) {
        form.value.description = activeBatch.value.name
      } else {
        const typeLabel = props.runType === 'overtime_only' ? 'الإضافية (Overtime)' : 'الأساسية'
        form.value.description = `إثبات مسير الرواتب ${typeLabel} للموظفين لفترة: ${props.payPeriod.name}`
      }
    }
  },
  { immediate: true },
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
    const payload = {
      employee_ids: props.employeeIds,
      pay_period_id: props.payPeriod.id,
      run_type: props.runType,
      description: form.value.description.trim(),
      disbursed_amount: Number(payrollStore.disbursedAmount || 0),
      disbursement_percentage: Number(payrollStore.disbursementPercentage ?? 100),
    }

    if (payrollStore.editingBatchId) {
      payload.batch_id = payrollStore.editingBatchId
    }

    const res = await payrollStore.postPayrollBatch(payload)

    toast.success(
      res?.message ||
        (isEditMode.value
          ? 'تم تحديث مسير الرواتب والقيد المحاسبي بنجاح.'
          : 'تم الترحيل بنجاح وتم إنشاء القيد المحاسبي.'),
    )
    emit('posted')
    close()
  } catch (error) {
    // الأخطاء تتم معالجتها في الـ Store
  }
}
</script>
