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
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4"
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
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-3xl transform flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 class="text-lg font-semibold text-text-primary">
              معاينة قسيمة الراتب - {{ employee?.full_name }}
              <span class="text-sm font-normal text-text-muted mr-2">(شهر {{ month }})</span>
            </h3>
            <button
              @click="close"
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

          <div class="overflow-y-auto flex-1 pb-2 px-1">
            <div v-if="payrollStore.loading" class="flex justify-center items-center py-12">
              <svg
                class="animate-spin h-8 w-8 text-primary"
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
            </div>

            <div
              v-else-if="payrollStore.error"
              class="text-center py-8 text-rose-500 font-bold bg-rose-50 rounded-lg"
            >
              {{ payrollStore.error }}
            </div>

            <div v-else-if="payrollStore.payslipPreview" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                  <h4 class="font-bold text-emerald-800 mb-3 border-b border-emerald-200 pb-2">
                    الاستحقاقات (يُضاف)
                  </h4>
                  <ul class="space-y-2 text-sm text-text-primary">
                    <li
                      v-for="(allowance, i) in payrollStore.payslipPreview.allowances"
                      :key="i"
                      class="flex justify-between"
                    >
                      <span>{{ allowance.name }}</span>
                      <span class="font-mono font-bold text-emerald-700">{{
                        allowance.amount
                      }}</span>
                    </li>
                  </ul>
                  <div
                    class="mt-4 pt-2 border-t border-emerald-200 flex justify-between font-bold text-emerald-900"
                  >
                    <span>إجمالي الاستحقاقات:</span>
                    <span class="font-mono">{{
                      payrollStore.payslipPreview.total_allowances
                    }}</span>
                  </div>
                </div>

                <div class="bg-rose-50/50 border border-rose-100 rounded-lg p-4">
                  <h4 class="font-bold text-rose-800 mb-3 border-b border-rose-200 pb-2">
                    الاستقطاعات (يُخصم)
                  </h4>
                  <ul class="space-y-2 text-sm text-text-primary">
                    <li
                      v-for="(deduction, i) in payrollStore.payslipPreview.deductions"
                      :key="i"
                      class="flex justify-between"
                    >
                      <span>{{ deduction.name }}</span>
                      <span class="font-mono font-bold text-rose-700">{{ deduction.amount }}</span>
                    </li>
                  </ul>
                  <div
                    class="mt-4 pt-2 border-t border-rose-200 flex justify-between font-bold text-rose-900"
                  >
                    <span>إجمالي الاستقطاعات:</span>
                    <span class="font-mono">{{
                      payrollStore.payslipPreview.total_deductions
                    }}</span>
                  </div>
                </div>
              </div>

              <div
                class="bg-primary/10 border border-primary/20 rounded-xl p-5 flex justify-between items-center"
              >
                <span class="text-lg font-bold text-text-primary">صافي الراتب المستحق:</span>
                <span class="text-2xl font-bold font-mono text-primary">
                  {{ payrollStore.payslipPreview.net_salary }}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end shrink-0">
            <AppButton variant="secondary" @click="close">إغلاق المعاينة</AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { watch } from 'vue'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employee: { type: Object, default: null },
  month: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
const payrollStore = usePayrollStore()

// استدعاء المعاينة بمجرد فتح النافذة
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.employee) {
      await payrollStore.previewPayroll(props.employee.id, props.month)
    } else {
      payrollStore.clearPreview()
    }
  },
  { immediate: true },
)

const close = () => {
  emit('update:modelValue', false)
  payrollStore.clearPreview()
}
</script>
