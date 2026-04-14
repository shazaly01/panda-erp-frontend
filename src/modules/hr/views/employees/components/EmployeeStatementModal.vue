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
          class="bg-surface-section rounded-xl shadow-2xl w-full max-w-5xl transform flex flex-col max-h-[95vh] overflow-hidden"
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              كشف حساب موظف (Sub-Ledger)
            </h3>
            <div class="flex items-center gap-3">
              <AppButton
                variant="secondary"
                size="sm"
                @click="printDocument"
                :disabled="employeeStore.isStatementLoading || !employeeStore.financialStatement"
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
                طباعة الكشف
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
              v-if="employeeStore.isStatementLoading"
              class="flex justify-center items-center py-20 hide-on-print"
            >
              <span class="animate-pulse text-lg font-bold text-primary"
                >جاري استخراج كشف الحساب من الدفاتر المحاسبية...</span
              >
            </div>

            <div
              v-else-if="employeeStore.financialStatement"
              class="bg-white text-gray-900 rounded-lg shadow-sm p-8 mx-auto max-w-4xl border border-gray-200 printable-statement"
              style="direction: rtl"
            >
              <div class="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                  <h1 class="text-2xl font-black text-gray-900 tracking-tight">نظام Panda ERP</h1>
                  <p class="text-sm text-gray-500 mt-1">الإدارة المالية - كشف حساب موظف تفصيلي</p>
                </div>
                <div class="text-left">
                  <h2 class="text-xl font-bold text-primary uppercase">STATEMENT OF ACCOUNT</h2>
                  <p
                    class="text-sm font-bold text-gray-600 mt-1 border border-gray-300 px-3 py-1 rounded inline-block bg-gray-50"
                  >
                    تاريخ الطباعة:
                    <span dir="ltr">{{ new Date().toLocaleDateString('en-GB') }}</span>
                  </p>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-4 mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100"
              >
                <div class="space-y-2">
                  <div class="flex">
                    <span class="w-32 text-gray-500 text-sm">اسم الموظف:</span>
                    <span class="font-bold text-sm">{{
                      employeeStore.financialStatement.employee.name
                    }}</span>
                  </div>
                  <div class="flex">
                    <span class="w-32 text-gray-500 text-sm">الرقم المالي (الرقم الوظيفي):</span>
                    <span class="font-bold text-sm font-mono">{{
                      employeeStore.financialStatement.employee.employee_number
                    }}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end justify-center">
                  <span class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1"
                    >الرصيد الحالي (المستحق للموظف)</span
                  >
                  <span
                    class="text-3xl font-mono font-bold"
                    :class="
                      employeeStore.financialStatement.employee.current_balance >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    "
                  >
                    {{ formatCurrency(employeeStore.financialStatement.employee.current_balance) }}
                  </span>
                </div>
              </div>

              <table class="w-full text-sm text-right border-collapse">
                <thead>
                  <tr class="bg-gray-100 text-gray-700 border-b-2 border-gray-300">
                    <th class="py-3 px-4 font-bold w-28">التاريخ</th>
                    <th class="py-3 px-4 font-bold w-24">رقم القيد</th>
                    <th class="py-3 px-4 font-bold">البيان (الوصف)</th>
                    <th class="py-3 px-4 font-bold text-emerald-700 w-32">استحقاق (له)</th>
                    <th class="py-3 px-4 font-bold text-rose-700 w-32">صرف/خصم (عليه)</th>
                    <th class="py-3 px-4 font-bold bg-gray-200 w-32">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="employeeStore.financialStatement.statement.length === 0">
                    <td
                      colspan="6"
                      class="py-8 text-center text-gray-500 italic border-b border-gray-200"
                    >
                      لا توجد أي حركات مالية مسجلة لهذا الموظف حتى الآن.
                    </td>
                  </tr>
                  <tr
                    v-for="(row, index) in employeeStore.financialStatement.statement"
                    :key="index"
                    class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td class="py-3 px-4 text-gray-600 font-mono">{{ formatDate(row.date) }}</td>
                    <td class="py-3 px-4 text-gray-500 font-mono text-xs">
                      #{{ row.entry_number }}
                    </td>
                    <td class="py-3 px-4 text-gray-800">{{ row.description }}</td>
                    <td class="py-3 px-4 font-mono font-bold text-emerald-600">
                      {{ row.credit > 0 ? formatCurrency(row.credit) : '-' }}
                    </td>
                    <td class="py-3 px-4 font-mono font-bold text-rose-600">
                      {{ row.debit > 0 ? formatCurrency(row.debit) : '-' }}
                    </td>
                    <td class="py-3 px-4 font-mono font-bold bg-gray-50 text-gray-900" dir="ltr">
                      {{ formatCurrency(row.balance) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-gray-800 text-white font-bold">
                    <td colspan="3" class="py-3 px-4 text-left">إجمالي الحركات والرصيد النهائي:</td>
                    <td class="py-3 px-4 font-mono text-emerald-400">
                      {{ formatCurrency(totalCredits) }}
                    </td>
                    <td class="py-3 px-4 font-mono text-rose-400">
                      {{ formatCurrency(totalDebits) }}
                    </td>
                    <td class="py-3 px-4 font-mono bg-gray-900" dir="ltr">
                      {{
                        formatCurrency(employeeStore.financialStatement.employee.current_balance)
                      }}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div class="grid grid-cols-2 gap-4 pt-16 mt-8 border-t border-gray-300 text-center">
                <div>
                  <div class="border-b border-gray-400 w-48 mx-auto pb-6 mb-2"></div>
                  <span class="text-xs font-bold text-gray-600">اعتماد الإدارة المالية</span>
                </div>
                <div>
                  <div class="border-b border-gray-400 w-48 mx-auto pb-6 mb-2"></div>
                  <span class="text-xs font-bold text-gray-600">توقيع الموظف (بالمطابقة)</span>
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
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  employeeId: { type: [Number, String], required: false },
})

const emit = defineEmits(['update:modelValue'])
const employeeStore = useEmployeeStore()

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.employeeId) {
      await employeeStore.fetchFinancialStatement(props.employeeId)
    } else {
      employeeStore.clearFinancialStatement()
    }
  },
  { immediate: true },
)

const close = () => {
  emit('update:modelValue', false)
  employeeStore.clearFinancialStatement()
}

const printDocument = () => {
  window.print()
}

// حساب إجمالي الدائن والمدين للتذييل
const totalCredits = computed(() => {
  if (!employeeStore.financialStatement) return 0
  return employeeStore.financialStatement.statement.reduce((sum, row) => sum + row.credit, 0)
})

const totalDebits = computed(() => {
  if (!employeeStore.financialStatement) return 0
  return employeeStore.financialStatement.statement.reduce((sum, row) => sum + row.debit, 0)
})

// دوال التنسيق
const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}
</script>

<style scoped>
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
  .printable-statement,
  .printable-statement * {
    visibility: visible;
  }
  .printable-statement {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* طباعة الألوان بدقة للمحافظة على التنسيق */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
