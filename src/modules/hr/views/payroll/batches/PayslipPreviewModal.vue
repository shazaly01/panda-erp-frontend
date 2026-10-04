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
          class="bg-surface-section rounded-2xl shadow-2xl w-full max-w-4xl transform flex flex-col max-h-[95vh] overflow-hidden border border-surface-border"
          role="dialog"
        >
          <!-- شريط التحكم العلوي (يختفي عند الطباعة) -->
          <div
            class="flex justify-between items-center bg-surface-ground px-6 py-4 border-b border-surface-border shrink-0 hide-on-print"
          >
            <h3 class="text-base font-bold text-text-primary flex items-center gap-2">
              <span class="p-1.5 bg-primary/10 text-primary rounded-lg">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              معاينة قسيمة الراتب
            </h3>

            <div class="flex items-center gap-3">
              <AppButton
                variant="secondary"
                size="sm"
                @click="printDocument"
                :disabled="payrollStore.loading || !payrollStore.payslipPreview"
                class="text-xs text-primary hover:bg-primary/10 border-primary/20"
              >
                <svg class="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                طباعة القسيمة (A4)
              </AppButton>
              <button
                @click="close"
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
          </div>

          <!-- جسم القسيمة المستند الرسمي -->
          <div
            class="overflow-y-auto flex-1 bg-gray-100 dark:bg-gray-900 p-4 md:p-6 print-container"
          >
            <div
              v-if="payrollStore.loading"
              class="flex flex-col justify-center items-center py-24 hide-on-print text-center"
            >
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
              <span class="text-sm font-medium text-text-muted"
                >جاري احتساب استحقاقات الراتب...</span
              >
            </div>

            <div
              v-else-if="payrollStore.error"
              class="text-center py-8 text-rose-600 font-bold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl hide-on-print max-w-lg mx-auto"
            >
              {{ payrollStore.error }}
            </div>

            <!-- نموذج القسيمة المطبوعة -->
            <div
              v-else-if="payrollStore.payslipPreview"
              class="bg-white text-gray-900 rounded-xl shadow-sm p-8 mx-auto max-w-3xl border border-gray-200 printable-payslip"
              style="direction: rtl"
            >
              <!-- ترويسة القسيمة -->
              <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                  <h1 class="text-2xl font-black text-gray-900 tracking-tight">نظام Panda ERP</h1>
                  <p class="text-xs text-gray-500 mt-1">
                    إدارة الموارد البشرية - قسم الرواتب والأجور
                  </p>
                </div>
                <div class="text-left">
                  <h2 class="text-xl font-black text-gray-800 tracking-wider">PAYSLIP</h2>
                  <p
                    class="text-xs font-bold text-gray-700 mt-1 border border-gray-300 px-3 py-1 rounded bg-gray-50 inline-block font-mono"
                  >
                    {{ payPeriod?.name }} | {{ payPeriod?.start_date }} إلى
                    {{ payPeriod?.end_date }}
                  </p>
                  <div class="mt-1">
                    <span
                      v-if="runType === 'overtime_only'"
                      class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block"
                    >
                      نوع المسير: إضافي فقط (طوارئ وعطلات)
                    </span>
                    <span
                      v-else
                      class="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-block"
                    >
                      نوع المسير: راتب اعتيادي شامل
                    </span>
                  </div>
                </div>
              </div>

              <!-- بطاقة بيانات الموظف -->
              <div
                class="grid grid-cols-2 gap-4 mb-5 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs"
              >
                <div class="space-y-1.5">
                  <div class="flex">
                    <span class="w-24 text-gray-500">اسم الموظف:</span>
                    <span class="font-bold text-gray-900">{{ employee?.full_name }}</span>
                  </div>
                  <div class="flex">
                    <span class="w-24 text-gray-500">الرقم الوظيفي:</span>
                    <span class="font-bold font-mono text-gray-900"
                      >#{{ employee?.employee_number }}</span
                    >
                  </div>
                </div>
                <div class="space-y-1.5">
                  <div class="flex">
                    <span class="w-20 text-gray-500">الإدارة:</span>
                    <span class="font-bold text-gray-900">{{
                      employee?.department?.name || '---'
                    }}</span>
                  </div>
                  <div class="flex">
                    <span class="w-20 text-gray-500">الوظيفة:</span>
                    <span class="font-bold text-gray-900">{{
                      employee?.position?.name || '---'
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- شريط ملخص دوام الطوارئ وساعات العمل المنجزة (مقربة لخانتين عشريتين) -->
              <div
                v-if="rawContext"
                class="grid grid-cols-4 gap-2 mb-4 p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-center text-xs"
              >
                <div>
                  <span class="text-gray-500 block text-[11px]">أيام العمل الفعلية</span>
                  <span class="font-bold font-mono text-gray-800"
                    >{{ rawContext.WORKED_DAYS ?? '---' }} يوم</span
                  >
                </div>
                <div>
                  <span class="text-gray-500 block text-[11px]">أيام دوام الطوارئ</span>
                  <span class="font-bold font-mono text-amber-700"
                    >{{ rawContext.OT_HOLIDAY_DAYS ?? 0 }} يوم</span
                  >
                </div>
                <div>
                  <span class="text-gray-500 block text-[11px]">ساعات دوام الطوارئ المنفذة</span>
                  <span class="font-bold font-mono text-amber-800">
                    {{ totalHolidayHours.toFixed(2) }} س
                  </span>
                </div>
                <div>
                  <span class="text-gray-500 block text-[11px]">ساعات إضافي بعد الدوام</span>
                  <span class="font-bold font-mono text-emerald-700">
                    {{ totalRegularOtHours.toFixed(2) }} س
                  </span>
                </div>
              </div>

              <!-- بطاقة الشفافية وتفاصيل احتساب المستحقات بمسميات مبسطة ومباشرة -->
              <div
                v-if="hasOvertimeOrEmergency"
                class="mb-6 rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-amber-50/60 p-4 text-xs text-gray-800 shadow-sm"
              >
                <div
                  class="flex items-center justify-between border-b border-amber-200/80 pb-2.5 mb-3"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-800 font-bold"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <h3 class="font-bold text-amber-950 text-sm">
                      تفاصيل احتساب العمل الإضافي وبدل الطوارئ
                    </h3>
                  </div>
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-[11px] text-amber-900 border border-amber-300"
                  >
                    {{ formulaBadge }}
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <!-- 1. أساس احتساب أجر الساعة -->
                  <div
                    class="rounded-lg bg-white/95 p-3 border border-amber-100 shadow-2xs space-y-1.5"
                  >
                    <span class="text-gray-500 block text-[11px] font-medium"
                      >1. حساب أجر الساعة</span
                    >
                    <div class="flex justify-between items-baseline">
                      <span class="text-gray-600 text-[11px]">الراتب الأساسي:</span>
                      <span class="font-mono font-bold text-gray-900">{{
                        formatCurrency(contractBasicSalary)
                      }}</span>
                    </div>
                    <div class="flex justify-between items-baseline pt-1 border-t border-gray-100">
                      <span class="text-gray-600 text-[11px]">
                        {{
                          wageFactor !== 1.0
                            ? `الراتب المحسوب عليه (${Math.round(wageFactor * 100)}%):`
                            : 'الراتب المعتمد (100%):'
                        }}
                      </span>
                      <span class="font-mono font-bold text-gray-700">{{
                        formatCurrency(contractBasicSalary * wageFactor)
                      }}</span>
                    </div>
                    <div class="flex justify-between items-baseline pt-1 border-t border-gray-100">
                      <span class="text-gray-600 text-[11px]"
                        >أجر الساعة (÷ {{ standardMonthlyHours }} س):</span
                      >
                      <span class="font-mono font-bold text-amber-800 text-[12px]">{{
                        formatCurrency(normalHourRate)
                      }}</span>
                    </div>
                  </div>

                  <!-- 2. تفصيل ساعات الدوام والمضاعفات -->
                  <div
                    class="rounded-lg bg-white/95 p-3 border border-amber-100 shadow-2xs space-y-1.5"
                  >
                    <span class="text-gray-500 block text-[11px] font-medium"
                      >2. ساعات العمل والمضاعفات</span
                    >
                    <div class="flex justify-between items-baseline">
                      <span class="text-gray-600 text-[11px]"
                        >ساعة الطوارئ/العطلات ({{ holidayRateMultiplier }}x):</span
                      >
                      <span class="font-mono font-bold text-amber-900">{{
                        formatCurrency(holidayHourRate)
                      }}</span>
                    </div>
                    <div class="flex justify-between items-baseline pt-1 border-t border-gray-100">
                      <span class="text-gray-600 text-[11px]"
                        >ساعات الطوارئ ({{ totalHolidayHours.toFixed(2) }} س):</span
                      >
                      <span class="font-mono font-bold text-gray-900">{{
                        formatCurrency(holidayGrossEarnings)
                      }}</span>
                    </div>
                    <div
                      v-if="totalRegularOtHours > 0"
                      class="flex justify-between items-baseline pt-1 border-t border-gray-100"
                    >
                      <span class="text-gray-600 text-[11px]"
                        >إضافي عادي ({{ regularRateMultiplier }}x) ({{
                          totalRegularOtHours.toFixed(2)
                        }}
                        س):</span
                      >
                      <span class="font-mono font-bold text-blue-700"
                        >+ {{ formatCurrency(regularOtGrossEarnings) }}</span
                      >
                    </div>
                  </div>

                  <!-- 3. إجمالي الاستحقاق والضريبة والصافي -->
                  <div
                    class="rounded-lg bg-white/95 p-3 border border-amber-100 shadow-2xs space-y-1.5"
                  >
                    <span class="text-gray-500 block text-[11px] font-medium"
                      >3. الإجمالي والضريبة والصافي</span
                    >
                    <div class="flex justify-between items-baseline">
                      <span class="text-gray-600 text-[11px]">{{
                        hasTax ? 'إجمالي الاستحقاق قبل الضريبة:' : 'إجمالي بدل الإضافي:'
                      }}</span>
                      <span class="font-mono font-bold text-gray-900">{{
                        formatCurrency(grossOvertimeAmount)
                      }}</span>
                    </div>
                    <div
                      v-if="hasTax"
                      class="flex justify-between items-baseline pt-1 border-t border-gray-100"
                    >
                      <span class="text-gray-600 text-[11px]">
                        {{
                          isDailyWorker
                            ? 'ضريبة الإضافي (معفى - يومية):'
                            : `ضريبة الإضافي (${taxRate}%):`
                        }}
                      </span>
                      <span
                        class="font-mono font-bold"
                        :class="isDailyWorker ? 'text-gray-500' : 'text-rose-600'"
                      >
                        {{ isDailyWorker ? '0.00' : '- ' + formatCurrency(overtimeTaxAmount) }}
                      </span>
                    </div>
                    <div
                      class="flex justify-between items-baseline pt-1 border-t-2 border-amber-200"
                    >
                      <span class="text-gray-900 text-[11px] font-bold">الصافي المستحق:</span>
                      <span class="font-mono font-bold text-emerald-800 text-[13px]">{{
                        formatCurrency(netOvertimeAmount)
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- توضيح نصي مبسط ومباشر للموظف -->
                <div
                  class="rounded-lg bg-amber-100/70 p-2.5 text-[11px] text-amber-950 flex items-start gap-2 border border-amber-200/60 leading-relaxed"
                >
                  <svg
                    class="h-4 w-4 text-amber-700 shrink-0 mt-0.5"
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
                  <span>
                    <strong>طريقة الحساب:</strong>
                    أجر الساعة العادية = ({{ formatCurrency(contractBasicSalary)
                    }}{{ wageFactor !== 1.0 ? ` × ${wageFactor}` : '' }} ÷
                    {{ standardMonthlyHours }} س) =
                    <strong>{{ formatCurrency(normalHourRate) }}</strong
                    >. ساعة دوام الطوارئ تُحتسب بمعامل ({{ holidayRateMultiplier }}x =
                    {{ formatCurrency(holidayHourRate) }}). إجمالي ساعات الطوارئ ({{
                      totalHolidayHours.toFixed(2)
                    }}
                    س) = {{ formatCurrency(holidayGrossEarnings) }}.
                    <span v-if="totalRegularOtHours > 0">
                      بالإضافة إلى إضافي بعد الدوام ({{ totalRegularOtHours.toFixed(2) }} س ×
                      {{ regularRateMultiplier }}x) =
                      {{ formatCurrency(regularOtGrossEarnings) }}.</span
                    >
                    وبذلك يكون إجمالي الاستحقاق {{ hasTax ? 'قبل الضريبة' : '' }}
                    <strong>{{ formatCurrency(grossOvertimeAmount) }}</strong
                    >.
                    <template v-if="hasTax">
                      <span v-if="!isDailyWorker">
                        يُستقطع {{ taxRate }}% ضريبة إضافي ({{
                          formatCurrency(overtimeTaxAmount)
                        }})، ويكون الصافي المستحق
                        <strong>{{ formatCurrency(netOvertimeAmount) }}</strong
                        >.</span
                      >
                      <span v-else>
                        الموظف معفى من استقطاع الضريبة بصفته عاملاً باليومية، ويُصرف الإجمالي كاملاً
                        <strong>{{ formatCurrency(netOvertimeAmount) }}</strong
                        >.</span
                      >
                    </template>
                  </span>
                </div>
              </div>

              <!-- جدولا الاستحقاقات والاستقطاعات المتقابلان -->
              <div class="grid grid-cols-2 gap-6 mb-6">
                <!-- جدول الاستحقاقات -->
                <div>
                  <div class="border-b border-gray-300 pb-2 mb-2 flex justify-between items-center">
                    <span class="font-bold text-sm text-gray-800">الاستحقاقات (يُضاف)</span>
                    <span class="text-[10px] text-gray-400 font-mono">EARNINGS</span>
                  </div>
                  <table class="w-full text-xs">
                    <tbody>
                      <tr
                        v-for="(item, i) in displayedAllowances"
                        :key="'allowance-' + i"
                        class="border-b border-gray-100"
                      >
                        <td class="py-2 text-gray-700">{{ item.name }}</td>
                        <td class="py-2 text-left font-mono font-bold text-gray-900">
                          {{ formatCurrency(item.amount) }}
                        </td>
                      </tr>
                      <tr v-if="displayedAllowances.length === 0">
                        <td colspan="2" class="py-3 text-center text-gray-400 italic">
                          لا توجد استحقاقات
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- جدول الاستقطاعات -->
                <div>
                  <div class="border-b border-gray-300 pb-2 mb-2 flex justify-between items-center">
                    <span class="font-bold text-sm text-gray-800">الاستقطاعات (يُخصم)</span>
                    <span class="text-[10px] text-gray-400 font-mono">DEDUCTIONS</span>
                  </div>
                  <table class="w-full text-xs">
                    <tbody>
                      <tr
                        v-for="(item, i) in deductions"
                        :key="'deduction-' + i"
                        class="border-b border-gray-100"
                      >
                        <td class="py-2 text-gray-700">{{ item.name }}</td>
                        <td class="py-2 text-left font-mono font-bold text-rose-600">
                          {{ formatCurrency(item.amount) }}
                        </td>
                      </tr>
                      <tr v-if="deductions.length === 0">
                        <td colspan="2" class="py-3 text-center text-gray-400 italic">
                          لا توجد استقطاعات
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- الإجماليات الفرعية -->
              <div class="grid grid-cols-2 gap-6 mb-6 text-xs">
                <div
                  class="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-gray-800"
                >
                  <span>إجمالي الاستحقاقات:</span>
                  <span class="font-mono text-sm">{{
                    formatCurrency(totals.total_allowances)
                  }}</span>
                </div>
                <div
                  class="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-rose-700"
                >
                  <span>إجمالي الاستقطاعات:</span>
                  <span class="font-mono text-sm">{{
                    formatCurrency(totals.total_deductions)
                  }}</span>
                </div>
              </div>

              <!-- الصافي النهائي للدفع -->
              <div
                class="bg-gray-900 text-white rounded-xl p-4 flex justify-between items-center mb-10 print-exact-colors"
              >
                <div>
                  <span class="text-xs text-gray-400 block"
                    >صافي الراتب المستحق للصرف (Net Pay)</span
                  >
                  <span class="text-[11px] text-gray-300"
                    >يُحوّل إلى الحساب البنكي المعتمد للموظف.</span
                  >
                </div>
                <span class="text-2xl font-black font-mono tracking-wider text-emerald-400">
                  {{ formatCurrency(totals.net_salary) }}
                </span>
              </div>

              <!-- قسم التوقيعات الرسمي للطباعة -->
              <div class="grid grid-cols-3 gap-6 pt-6 border-t border-gray-300 text-center text-xs">
                <div>
                  <div class="border-b border-dashed border-gray-400 pb-8 mb-2"></div>
                  <span class="font-bold text-gray-600">إعداد (شؤون الموظفين)</span>
                </div>
                <div>
                  <div class="border-b border-dashed border-gray-400 pb-8 mb-2"></div>
                  <span class="font-bold text-gray-600">المراجعة والاعتماد المالي</span>
                </div>
                <div>
                  <div class="border-b border-dashed border-gray-400 pb-8 mb-2"></div>
                  <span class="font-bold text-gray-600">توقيع الموظف (استلام)</span>
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
  payPeriod: { type: Object, required: true },
  runType: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
const payrollStore = usePayrollStore()

// استدعاء الحساب التقديري فور فتح النافذة
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.employee && props.payPeriod) {
      await payrollStore.previewPayroll(props.employee.id, props.payPeriod.id, props.runType)
    } else {
      payrollStore.clearPreview()
    }
  },
  { immediate: true },
)

// استخراج البيانات الأولية وسياق الحساب المالي
const rawContext = computed(() => {
  return payrollStore.payslipPreview?.raw_inputs || null
})

// الراتب التعاقدي الأساسي
const contractBasicSalary = computed(() => {
  return Number(
    payrollStore.payslipPreview?.contract_basic || rawContext.value?.CONTRACT_BASIC || 0,
  )
})

// نسبة وعاء الأجر (من السياسة، الافتراضي 1.0)
const wageFactor = computed(() => {
  return Number(rawContext.value?.WAGE_FACTOR ?? 1.0)
})

// ساعات العمل المعيارية للشهر (من السياسة، الافتراضي 176 أو المحسوبة من الدوام)
const standardMonthlyHours = computed(() => {
  return Number(rawContext.value?.STANDARD_HOURS ?? 176)
})

// نسبة الضريبة المقررة في السياسة
const taxRate = computed(() => {
  return Number(rawContext.value?.TAX_RATE ?? 0)
})

const hasTax = computed(() => {
  return taxRate.value > 0
})

// نص الشارة التعريفية بالمعادلة
const formulaBadge = computed(() => {
  if (wageFactor.value !== 1.0) {
    return `طريقة الحساب: (المرتب × ${wageFactor.value} ÷ ${standardMonthlyHours.value} س)`
  }
  return `طريقة الحساب: (المرتب ÷ ${standardMonthlyHours.value} ساعة)`
})

// معامل ساعة الطوارئ
const holidayRateMultiplier = computed(() => {
  return Number(rawContext.value?.OT_HOL_RATE ?? 2.0)
})

// معامل ساعة الإضافي بعد الدوام
const regularRateMultiplier = computed(() => {
  return Number(rawContext.value?.OT_REG_RATE ?? 1.5)
})

// أجر الساعة العادية
const normalHourRate = computed(() => {
  if (rawContext.value?.NORMAL_HOUR_RATE) {
    return Number(rawContext.value.NORMAL_HOUR_RATE)
  }
  if (contractBasicSalary.value > 0 && standardMonthlyHours.value > 0) {
    return (contractBasicSalary.value * wageFactor.value) / standardMonthlyHours.value
  }
  return 0
})

// أجر ساعة الطوارئ والعطلات
const holidayHourRate = computed(() => {
  return Number(
    rawContext.value?.HOLIDAY_HOUR_RATE || normalHourRate.value * holidayRateMultiplier.value,
  )
})

// أجر ساعة الإضافي بعد الدوام
const regularOtHourRate = computed(() => {
  return Number(
    rawContext.value?.REGULAR_OT_HOUR_RATE || normalHourRate.value * regularRateMultiplier.value,
  )
})

// ساعات الطوارئ الفعلية المنفذة
const totalHolidayHours = computed(() => {
  return Number(rawContext.value?.OT_HOL_HOURS ?? rawContext.value?.OT_HOLIDAY_HOURS ?? 0)
})

// ساعات الإضافي العادي بعد انتهاء الدوام
const totalRegularOtHours = computed(() => {
  return Number(rawContext.value?.OT_REG_HOURS ?? rawContext.value?.OT_REGULAR_HOURS ?? 0)
})

// إجمالي استحقاق الطوارئ قبل الضريبة
const holidayGrossEarnings = computed(() => {
  return totalHolidayHours.value * holidayHourRate.value
})

// إجمالي استحقاق الإضافي العادي قبل الضريبة
const regularOtGrossEarnings = computed(() => {
  return totalRegularOtHours.value * regularOtHourRate.value
})

// إجمالي الاستحقاق قبل الضريبة (Gross)
const grossOvertimeAmount = computed(() => {
  if (rawContext.value?.OVERTIME_GROSS !== undefined) {
    return Number(rawContext.value.OVERTIME_GROSS)
  }
  return holidayGrossEarnings.value + regularOtGrossEarnings.value
})

// فحص عامل اليومية
const isDailyWorker = computed(() => {
  return Boolean(rawContext.value?.IS_DAILY_WORKER)
})

// مبلغ الضريبة
const overtimeTaxAmount = computed(() => {
  if (rawContext.value?.OVERTIME_TAX !== undefined) {
    return Number(rawContext.value.OVERTIME_TAX)
  }
  if (!hasTax.value || isDailyWorker.value) return 0
  return roundNumber(grossOvertimeAmount.value * (taxRate.value / 100.0))
})

// صافي الأجر الإضافي بعد الضريبة
const netOvertimeAmount = computed(() => {
  if (rawContext.value?.NET_OVERTIME !== undefined) {
    return Number(rawContext.value.NET_OVERTIME)
  }
  return grossOvertimeAmount.value - overtimeTaxAmount.value
})

// فحص وجود استحقاق طوارئ أو عمل إضافي لعرض بطاقة الشفافية
const hasOvertimeOrEmergency = computed(() => {
  if (!rawContext.value) return false
  return (
    totalHolidayHours.value > 0 ||
    totalRegularOtHours.value > 0 ||
    grossOvertimeAmount.value > 0 ||
    props.runType === 'overtime_only'
  )
})

// استخراج قائمة الاستحقاقات
const displayedAllowances = computed(() => {
  if (!payrollStore.payslipPreview) return []
  const lines = payrollStore.payslipPreview.lines || []
  return lines.filter((l) => l.category === 'allowance')
})

// استخراج قائمة الاستقطاعات
const deductions = computed(() => {
  if (!payrollStore.payslipPreview) return []
  const lines = payrollStore.payslipPreview.lines || []
  return lines.filter((l) => l.category === 'deduction')
})

// إجماليات الراتب
const totals = computed(() => {
  const t = payrollStore.payslipPreview?.totals
  return {
    total_allowances: Number(t?.total_allowances || 0),
    total_deductions: Number(t?.total_deductions || 0),
    net_salary: Number(t?.net_salary || 0),
  }
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

const roundNumber = (val) => {
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100
}
</script>

<style scoped>
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
