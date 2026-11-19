<!-- src/modules/hr/views/employees/components/EmployeeStatementModal.vue -->
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
      class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 hide-on-print"
      dir="rtl"
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
          class="bg-surface-section border border-surface-border rounded-2xl shadow-2xl w-full max-w-5xl transform flex flex-col max-h-[95vh] overflow-hidden font-sans text-right"
          role="dialog"
        >
          <!-- شريط التحكم العلوي (خارج كادر الطباعة) -->
          <div
            class="bg-slate-900 text-white px-4 sm:px-6 py-3 flex justify-between items-center border-b border-slate-800 shrink-0 hide-on-print"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <h3 class="text-xs sm:text-sm font-black tracking-wide text-slate-100">
                كشف حساب موظف (Sub-Ledger)
              </h3>
            </div>

            <div class="flex items-center gap-2">
              <AppButton
                size="sm"
                @click="printDocument"
                :disabled="employeeStore.isStatementLoading || !employeeStore.financialStatement"
              >
                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span>طباعة الكشف</span>
                </span>
              </AppButton>

              <button
                type="button"
                @click="close"
                class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="إغلاق"
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
          </div>

          <!-- مساحة معاينة الكشف -->
          <div class="overflow-y-auto flex-1 bg-surface-ground p-3 sm:p-6 print-container">
            <div
              v-if="employeeStore.isStatementLoading"
              class="flex flex-col justify-center items-center py-20 gap-3 hide-on-print"
            >
              <div
                class="w-9 h-9 border-3 border-primary/25 border-t-primary rounded-full animate-spin"
              ></div>
              <span class="text-xs font-bold text-text-secondary">
                جاري استخراج كشف الحساب من الدفاتر المحاسبية...
              </span>
            </div>

            <!-- ورقة الكشف القياسية (A4) -->
            <div
              v-else-if="employeeStore.financialStatement"
              class="bg-white text-slate-900 rounded-xl shadow-md p-6 sm:p-8 mx-auto max-w-4xl border border-slate-300 printable-statement space-y-6"
              style="direction: rtl"
            >
              <!-- 1. ترويسة المستند -->
              <div
                class="flex flex-wrap justify-between items-center gap-4 border-b-2 border-orange-500 pb-4"
              >
                <div>
                  <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    نظام Panda ERP
                  </h1>
                  <span
                    class="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 mt-1"
                  >
                    الإدارة المالية - كشف حساب موظف تفصيلي
                  </span>
                </div>
                <div class="text-left">
                  <h2
                    class="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wide"
                  >
                    STATEMENT OF ACCOUNT
                  </h2>
                  <p
                    class="text-xs font-bold text-slate-600 mt-1 border border-slate-300 px-3 py-1 rounded-lg inline-block bg-slate-50"
                  >
                    تاريخ الطباعة:
                    <span dir="ltr" class="font-mono text-slate-900">{{
                      new Date().toLocaleDateString('en-GB')
                    }}</span>
                  </p>
                </div>
              </div>

              <!-- 2. بطاقة بيانات الموظف والرصيد الحالي -->
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gradient-to-r from-orange-50/50 via-white to-slate-50 p-4 rounded-xl border border-slate-200 border-t-2 border-t-orange-500 border-r-4 border-r-orange-500"
              >
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 text-xs font-bold w-28">اسم الموظف:</span>
                    <span class="font-black text-sm text-slate-900">{{
                      employeeStore.financialStatement.employee.name
                    }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 text-xs font-bold w-28">الرقم الوظيفي:</span>
                    <span
                      class="font-mono font-bold text-xs px-2 py-0.5 rounded bg-orange-100/80 text-orange-700 border border-orange-200"
                    >
                      #{{ employeeStore.financialStatement.employee.employee_number }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-col sm:items-end justify-center">
                  <span class="text-[11px] text-slate-500 font-bold mb-1">
                    الرصيد الحالي (المستحق للموظف)
                  </span>
                  <span
                    class="text-2xl sm:text-3xl font-mono font-black"
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

              <!-- 3. جدول الحركات المالية -->
              <div class="border border-slate-300 rounded-lg overflow-hidden">
                <table class="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr
                      class="bg-slate-900 text-white border-b-2 border-orange-500 font-bold select-none"
                    >
                      <th class="py-2.5 px-3 w-28">التاريخ</th>
                      <th class="py-2.5 px-3 w-24">رقم القيد</th>
                      <th class="py-2.5 px-3">البيان (الوصف)</th>
                      <th class="py-2.5 px-3 text-emerald-300 w-32">استحقاق (له)</th>
                      <th class="py-2.5 px-3 text-rose-300 w-32">صرف/خصم (عليه)</th>
                      <th class="py-2.5 px-3 bg-slate-800 text-orange-300 w-32">الرصيد التراكمي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="employeeStore.financialStatement.statement.length === 0">
                      <td
                        colspan="6"
                        class="py-8 text-center text-slate-500 italic border-b border-slate-200"
                      >
                        لا توجد أي حركات مالية مسجلة لهذا الموظف حتى الآن.
                      </td>
                    </tr>
                    <tr
                      v-for="(row, index) in employeeStore.financialStatement.statement"
                      :key="index"
                      class="border-b border-slate-200 hover:bg-orange-50/30 transition-colors"
                    >
                      <td class="py-2.5 px-3 text-slate-600 font-mono">
                        {{ formatDate(row.date) }}
                      </td>
                      <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        #{{ row.entry_number }}
                      </td>
                      <td class="py-2.5 px-3 text-slate-800 font-medium">{{ row.description }}</td>
                      <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">
                        {{ row.credit > 0 ? formatCurrency(row.credit) : '-' }}
                      </td>
                      <td class="py-2.5 px-3 font-mono font-bold text-rose-600">
                        {{ row.debit > 0 ? formatCurrency(row.debit) : '-' }}
                      </td>
                      <td
                        class="py-2.5 px-3 font-mono font-black bg-slate-50 text-slate-900"
                        dir="ltr"
                      >
                        {{ formatCurrency(row.balance) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="bg-slate-900 text-white font-black">
                      <td colspan="3" class="py-2.5 px-3 text-left">
                        إجمالي الحركات والرصيد النهائي:
                      </td>
                      <td class="py-2.5 px-3 font-mono text-emerald-400">
                        {{ formatCurrency(totalCredits) }}
                      </td>
                      <td class="py-2.5 px-3 font-mono text-rose-400">
                        {{ formatCurrency(totalDebits) }}
                      </td>
                      <td class="py-2.5 px-3 font-mono bg-orange-600 text-white" dir="ltr">
                        {{
                          formatCurrency(employeeStore.financialStatement.employee.current_balance)
                        }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- 4. التوقيعات الرسمية -->
              <div class="grid grid-cols-2 gap-4 pt-10 mt-6 border-t border-slate-300 text-center">
                <div>
                  <div class="border-b border-dashed border-slate-400 w-48 mx-auto pb-6 mb-2"></div>
                  <span class="text-xs font-bold text-slate-700">اعتماد الإدارة المالية</span>
                </div>
                <div>
                  <div class="border-b border-dashed border-slate-400 w-48 mx-auto pb-6 mb-2"></div>
                  <span class="text-xs font-bold text-slate-700">توقيع الموظف (بالمطابقة)</span>
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

const totalCredits = computed(() => {
  if (!employeeStore.financialStatement) return 0
  return employeeStore.financialStatement.statement.reduce((sum, row) => sum + row.credit, 0)
})

const totalDebits = computed(() => {
  if (!employeeStore.financialStatement) return 0
  return employeeStore.financialStatement.statement.reduce((sum, row) => sum + row.debit, 0)
})

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

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
