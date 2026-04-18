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
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 hide-on-print"
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
          class="bg-surface-section rounded-xl shadow-2xl w-full max-w-4xl transform flex flex-col max-h-[95vh] overflow-hidden"
          role="dialog"
        >
          <div
            class="flex justify-between items-center bg-surface-ground px-6 py-4 border-b border-surface-border shrink-0 hide-on-print"
          >
            <h3 class="text-lg font-bold text-text-primary flex items-center gap-2">
              <svg
                class="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              مستند قسيمة الراتب
            </h3>
            <div class="flex items-center gap-3">
              <AppButton
                variant="secondary"
                size="sm"
                @click="printDocument"
                :disabled="payrollStore.loading || !payrollStore.payslipPreview"
                class="text-primary hover:bg-primary/10 border-primary/20"
              >
                <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                طباعة المستند
              </AppButton>
              <button
                @click="close"
                class="text-text-muted hover:text-rose-500 p-1 transition-colors rounded-full hover:bg-rose-50"
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
          </div>

          <div class="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900 p-6 print-container">
            <div
              v-if="payrollStore.loading"
              class="flex justify-center items-center py-20 hide-on-print"
            >
              <span class="animate-pulse text-lg font-bold text-primary"
                >جاري احتساب الراتب...</span
              >
            </div>

            <div
              v-else-if="payrollStore.error"
              class="text-center py-8 text-rose-500 font-bold bg-rose-50 rounded-lg hide-on-print"
            >
              {{ payrollStore.error }}
            </div>

            <div
              v-else-if="payrollStore.payslipPreview"
              class="bg-white text-gray-900 rounded-lg shadow-sm p-8 mx-auto max-w-3xl border border-gray-200 printable-payslip"
              style="direction: rtl"
            >
              <div class="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                  <h1 class="text-2xl font-black text-gray-900 tracking-tight">نظام Panda ERP</h1>
                  <p class="text-sm text-gray-500 mt-1">
                    إدارة الموارد البشرية - قسم مسيرات الرواتب
                  </p>
                </div>
                <div class="text-left">
                  <h2 class="text-xl font-bold text-primary uppercase">PAYSLIP</h2>
                  <p
                    class="text-xs font-bold text-gray-600 mt-1 border border-gray-300 px-3 py-1 rounded inline-block bg-gray-50"
                  >
                    {{ payPeriod?.name }} | <span dir="ltr">{{ payPeriod?.start_date }}</span> إلى
                    <span dir="ltr">{{ payPeriod?.end_date }}</span>
                  </p>
                  <p
                    v-if="runType === 'overtime_only'"
                    class="text-xs font-bold text-amber-600 mt-1 border border-amber-200 px-3 py-1 rounded inline-block bg-amber-50"
                  >
                    نوع المسير: إضافي فقط (Overtime)
                  </p>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-4 mb-8 bg-blue-50/50 p-4 rounded-lg border border-blue-100"
              >
                <div class="space-y-2">
                  <div class="flex">
                    <span class="w-32 text-gray-500 text-sm">اسم الموظف:</span>
                    <span class="font-bold text-sm">{{ employee?.full_name }}</span>
                  </div>
                  <div class="flex">
                    <span class="w-32 text-gray-500 text-sm">الرقم الوظيفي:</span>
                    <span class="font-bold text-sm font-mono">{{ employee?.employee_number }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex">
                    <span class="w-24 text-gray-500 text-sm">الإدارة:</span>
                    <span class="font-bold text-sm">{{ employee?.department?.name || '---' }}</span>
                  </div>
                  <div class="flex">
                    <span class="w-24 text-gray-500 text-sm">الوظيفة:</span>
                    <span class="font-bold text-sm">{{ employee?.position?.name || '---' }}</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6 mb-8 relative">
                <div
                  class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"
                ></div>

                <div>
                  <h4
                    class="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 flex justify-between"
                  >
                    <span>الاستحقاقات (يُضاف)</span>
                    <span class="text-xs text-gray-400 font-normal">Allowances</span>
                  </h4>
                  <table class="w-full text-sm">
                    <tbody>
                      <tr class="border-b border-gray-100">
                        <td class="py-2 text-gray-600">الراتب الأساسي للفترة</td>
                        <td class="py-2 text-left font-mono font-bold">
                          {{ formatCurrency(payrollStore.payslipPreview.contract_basic || 0) }}
                        </td>
                      </tr>
                      <tr
                        v-for="(allowance, i) in allowances"
                        :key="'a-' + i"
                        class="border-b border-gray-100"
                      >
                        <td class="py-2 text-gray-600">
                          {{ allowance.name || allowance.description }}
                        </td>
                        <td class="py-2 text-left font-mono font-bold">
                          {{ formatCurrency(allowance.amount) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4
                    class="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 flex justify-between"
                  >
                    <span>الاستقطاعات (يُخصم)</span>
                    <span class="text-xs text-gray-400 font-normal">Deductions</span>
                  </h4>
                  <table class="w-full text-sm">
                    <tbody>
                      <tr
                        v-for="(deduction, i) in deductions"
                        :key="'d-' + i"
                        class="border-b border-gray-100"
                      >
                        <td class="py-2 text-gray-600">
                          {{ deduction.name || deduction.description }}
                        </td>
                        <td class="py-2 text-left font-mono font-bold text-rose-600">
                          {{ formatCurrency(deduction.amount) }}
                        </td>
                      </tr>
                      <tr v-if="deductions.length === 0">
                        <td class="py-2 text-gray-400 italic">لا توجد استقطاعات</td>
                        <td class="py-2 text-left font-mono">0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6 mb-6">
                <div
                  class="flex justify-between py-2 border-t border-gray-300 font-bold text-gray-800"
                >
                  <span>إجمالي الاستحقاقات:</span>
                  <span class="font-mono">{{
                    formatCurrency(
                      payrollStore.payslipPreview.totals?.total_allowances ||
                        payrollStore.payslipPreview.total_allowances,
                    )
                  }}</span>
                </div>
                <div
                  class="flex justify-between py-2 border-t border-gray-300 font-bold text-rose-700"
                >
                  <span>إجمالي الاستقطاعات:</span>
                  <span class="font-mono">{{
                    formatCurrency(
                      payrollStore.payslipPreview.totals?.total_deductions ||
                        payrollStore.payslipPreview.total_deductions,
                    )
                  }}</span>
                </div>
              </div>

              <div
                class="bg-gray-800 text-white rounded-lg p-4 flex justify-between items-center mb-12 print-exact-colors"
              >
                <div class="flex flex-col">
                  <span class="text-sm text-gray-300">صافي الراتب المستحق (Net Pay)</span>
                  <span class="text-xs text-gray-400 mt-1"
                    >يُصرف للموظف بنهاية فترة الاستحقاق.</span
                  >
                </div>
                <span class="text-2xl md:text-3xl font-bold font-mono tracking-wider">
                  {{
                    formatCurrency(
                      payrollStore.payslipPreview.totals?.net_salary ||
                        payrollStore.payslipPreview.net_salary,
                    )
                  }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-4 pt-12 border-t border-gray-200 text-center">
                <div>
                  <div class="border-b border-gray-400 pb-8 mb-2"></div>
                  <span class="text-xs font-bold text-gray-600">توقيع المُعِد (HR)</span>
                </div>
                <div>
                  <div class="border-b border-gray-400 pb-8 mb-2"></div>
                  <span class="text-xs font-bold text-gray-600">الاعتماد المالي</span>
                </div>
                <div>
                  <div class="border-b border-gray-400 pb-8 mb-2"></div>
                  <span class="text-xs font-bold text-gray-600">توقيع الموظف (استلام)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch } from 'vue'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employee: { type: Object, default: null },
  // 🚀 التعديل: استقبال كائن الفترة بالكامل ونوع المسير
  payPeriod: { type: Object, required: true },
  runType: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
const payrollStore = usePayrollStore()

// استدعاء المعاينة بمجرد الفتح
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.employee && props.payPeriod) {
      // 🚀 التعديل: تمرير المعرفات بدلاً من التواريخ
      await payrollStore.previewPayroll(props.employee.id, props.payPeriod.id, props.runType)
    } else {
      payrollStore.clearPreview()
    }
  },
  { immediate: true },
)

const allowances = computed(() => {
  if (!payrollStore.payslipPreview) return []
  const lines = payrollStore.payslipPreview.lines || payrollStore.payslipPreview.allowances || []
  return lines.filter((line) => line.category === 'allowance' || line.type === 'allowance')
})

const deductions = computed(() => {
  if (!payrollStore.payslipPreview) return []
  const lines = payrollStore.payslipPreview.lines || payrollStore.payslipPreview.deductions || []
  return lines.filter((line) => line.category === 'deduction' || line.type === 'deduction')
})

const close = () => {
  emit('update:modelValue', false)
  payrollStore.clearPreview()
}

const printDocument = () => {
  window.print()
}

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped>
/* نفس التنسيقات السابقة دون تغيير */
.print-exact-colors {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  body * {
    visibility: hidden;
  }
  .hide-on-print {
    display: none !important;
  }
  .printable-payslip,
  .printable-payslip * {
    visibility: visible;
  }
  .printable-payslip {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
