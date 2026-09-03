<!--src/modules/accounting/views/budgets/components/BudgetVarianceModal.vue-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="`تقرير انحراف ومتابعة الموازنة: ${budget?.name || ''}`"
    size="5xl"
    border-color="border-sky-500"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
  >
    <!-- حالة التحميل -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted">جاري تحليل القيود واحتساب الفعلي والانحرافات...</span>
    </div>

    <div v-else-if="reportData" class="space-y-6">
      <!-- 1. بطاقات المؤشرات التنفيذية (KPIs Summary) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- بطاقة المصروفات -->
        <div class="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-text-muted">المصروفات التشغيلية</span>
            <span
              :class="[
                'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                reportData.summary.expenses.burn_rate_percentage > 100
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200',
              ]"
            >
              استهلاك {{ reportData.summary.expenses.burn_rate_percentage }}%
            </span>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-baseline text-xs">
              <span class="text-text-muted">المعتمد:</span>
              <span class="font-mono font-bold text-text-primary">
                {{ formatNumber(reportData.summary.expenses.planned) }}
              </span>
            </div>
            <div class="flex justify-between items-baseline text-xs">
              <span class="text-text-muted">المنصرف الفعلي:</span>
              <span class="font-mono font-bold text-rose-600">
                {{ formatNumber(reportData.summary.expenses.actual) }}
              </span>
            </div>
            <div
              class="flex justify-between items-baseline text-xs pt-1 border-t border-surface-border"
            >
              <span class="font-bold text-text-primary">المتبقي المتاح:</span>
              <span
                class="font-mono font-bold"
                :class="
                  reportData.summary.expenses.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                "
              >
                {{ formatNumber(reportData.summary.expenses.variance) }}
              </span>
            </div>
          </div>

          <!-- شريط تقدم نسبة الاستهلاك -->
          <div class="w-full bg-surface-ground h-2 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :class="
                reportData.summary.expenses.burn_rate_percentage > 100
                  ? 'bg-rose-500'
                  : reportData.summary.expenses.burn_rate_percentage > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              "
              :style="{
                width: `${Math.min(reportData.summary.expenses.burn_rate_percentage, 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <!-- بطاقة الإيرادات -->
        <div class="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-text-muted">الإيرادات المحصلة</span>
            <span
              class="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200"
            >
              إنجاز {{ reportData.summary.revenues.achievement_rate_percentage }}%
            </span>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-baseline text-xs">
              <span class="text-text-muted">المستهدف:</span>
              <span class="font-mono font-bold text-text-primary">
                {{ formatNumber(reportData.summary.revenues.planned) }}
              </span>
            </div>
            <div class="flex justify-between items-baseline text-xs">
              <span class="text-text-muted">المحقق الفعلي:</span>
              <span class="font-mono font-bold text-emerald-600">
                {{ formatNumber(reportData.summary.revenues.actual) }}
              </span>
            </div>
            <div
              class="flex justify-between items-baseline text-xs pt-1 border-t border-surface-border"
            >
              <span class="font-bold text-text-primary">فارق المستهدف:</span>
              <span
                class="font-mono font-bold"
                :class="
                  reportData.summary.revenues.variance >= 0 ? 'text-emerald-600' : 'text-amber-600'
                "
              >
                {{ formatNumber(reportData.summary.revenues.variance) }}
              </span>
            </div>
          </div>

          <!-- شريط تقدم نسبة تحقيق الإيراد -->
          <div class="w-full bg-surface-ground h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-sky-500 transition-all duration-500"
              :style="{
                width: `${Math.min(reportData.summary.revenues.achievement_rate_percentage, 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <!-- بطاقة صافي الأداء التقديري -->
        <div
          class="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col justify-between"
        >
          <div>
            <span class="text-xs font-bold text-text-muted">صافي الأداء المالي</span>
            <div class="mt-3 space-y-2">
              <div class="flex justify-between items-baseline text-xs">
                <span class="text-text-muted">صافي الفارق المخطط:</span>
                <span class="font-mono font-bold text-text-primary">
                  {{ formatNumber(reportData.summary.net_planned) }}
                </span>
              </div>
              <div class="flex justify-between items-baseline text-xs">
                <span class="text-text-muted">صافي الفارق الفعلي:</span>
                <span
                  class="font-mono font-bold"
                  :class="reportData.summary.net_actual >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                >
                  {{ formatNumber(reportData.summary.net_actual) }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="pt-3 border-t border-surface-border text-[11px] text-text-muted flex justify-between items-center"
          >
            <span>نمط الرقابة الميداني:</span>
            <span class="font-bold text-text-primary uppercase">{{
              reportData.budget.control_mode
            }}</span>
          </div>
        </div>
      </div>

      <!-- 2. تفاصيل ومقارنة البنود -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-sm font-bold text-text-primary">
            تفاصيل بنود الموازنة ومعدلات الاستهلاك
          </h3>
          <span class="text-xs text-text-muted font-mono"
            >{{ reportData.lines.length }} بنود مدرجة</span
          >
        </div>

        <div
          v-if="reportData.lines.length === 0"
          class="p-8 text-center bg-surface-ground rounded-xl text-text-muted text-xs"
        >
          لا توجد بنود موازنة مدرجة للعرض.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="line in reportData.lines"
            :key="line.line_id"
            class="p-4 rounded-xl bg-surface-ground border border-surface-border transition-all hover:border-primary/40 space-y-3"
          >
            <!-- ترويسة البند -->
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div class="flex items-center gap-2.5 flex-wrap">
                <!-- شارة الفترة الزمنية / اسم الشهر -->
                <span
                  class="px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center gap-1.5 shadow-sm"
                >
                  <svg
                    class="w-3.5 h-3.5 text-sky-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{{ formatPeriod(line.period_start, line.period_end) }}</span>
                </span>

                <!-- في حال وجود حساب مالي محدد -->
                <template v-if="line.account">
                  <span
                    class="px-2 py-0.5 text-xs font-mono font-bold rounded bg-surface-card border border-surface-border text-primary"
                  >
                    {{ line.account.code }}
                  </span>
                  <span class="font-bold text-sm text-text-primary">{{ line.account.name }}</span>
                </template>

                <!-- في حال كانت الموازنة مجمعة لمركز التكلفة -->
                <template v-else>
                  <span
                    class="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/10 border border-amber-500/30 text-amber-500"
                  >
                    موازنة مجمعة
                  </span>
                  <span class="font-bold text-sm text-text-primary">
                    {{
                      line.cost_center ? `كافة مصروفات (${line.cost_center.name})` : 'مصروفات عامة'
                    }}
                  </span>
                </template>

                <!-- مركز التكلفة إن وجد مع الحساب المالي -->
                <span
                  v-if="line.cost_center && line.account"
                  class="text-[11px] px-2 py-0.5 rounded bg-surface-border text-text-muted truncate max-w-[150px]"
                >
                  {{ line.cost_center.name }}
                </span>
              </div>

              <!-- شارة حالة البند والتجاوز -->
              <span
                :class="[
                  'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1.5',
                  line.is_over_budget
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                ]"
              >
                <span
                  :class="[
                    'w-1.5 h-1.5 rounded-full',
                    line.is_over_budget ? 'bg-rose-500 animate-ping' : 'bg-emerald-500',
                  ]"
                ></span>
                {{ line.is_over_budget ? 'تجاوز في الموازنة' : 'ضمن الحدود المعتمدة' }}
              </span>
            </div>

            <!-- أرقام البند المقارنة -->
            <div
              class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-surface-card/60 border border-surface-border text-center"
            >
              <div>
                <span class="text-[10px] text-text-muted block">المعتمد المخطط</span>
                <span class="font-mono font-bold text-xs sm:text-sm text-text-primary">
                  {{ formatNumber(line.planned_amount) }}
                </span>
              </div>
              <div>
                <span class="text-[10px] text-text-muted block">المنصرف الفعلي</span>
                <span class="font-mono font-bold text-xs sm:text-sm text-rose-600">
                  {{ formatNumber(line.actual_amount) }}
                </span>
              </div>
              <div>
                <span class="text-[10px] text-text-muted block">المتبقي للصرف</span>
                <span class="font-mono font-bold text-xs sm:text-sm text-emerald-600">
                  {{ formatNumber(line.remaining_amount) }}
                </span>
              </div>
              <div>
                <span class="text-[10px] text-text-muted block">نسبة الاستهلاك</span>
                <span
                  class="font-mono font-bold text-xs sm:text-sm"
                  :class="line.burn_rate_percentage > 100 ? 'text-rose-600' : 'text-primary'"
                >
                  {{ line.burn_rate_percentage }}%
                </span>
              </div>
            </div>

            <!-- شريط تقدم استهلاك البند -->
            <div class="w-full bg-surface-border h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                :class="line.burn_rate_percentage > 100 ? 'bg-rose-500' : 'bg-primary'"
                :style="{ width: `${Math.min(line.burn_rate_percentage, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useBudgetStore } from '@/modules/accounting/stores/budgetStore'
import AppDialog from '@/components/ui/AppDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  budget: { type: Object, default: null },
})

defineEmits(['update:modelValue', 'close'])

const toast = useToast()
const budgetStore = useBudgetStore()

const isLoading = ref(false)
const reportData = ref(null)

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// تحويل تاريخ البداية والنهاية إلى اسم الشهر والسنة بالعربية أو نطاق التاريخ
const formatPeriod = (startDate, endDate) => {
  if (!startDate) return ''

  const [sYear, sMonth] = startDate.split('-').map(Number)
  const arabicMonths = [
    'يناير',
    'فبراير',
    'مارس',
    'إبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ]

  const monthName = arabicMonths[sMonth - 1]
  if (monthName && sYear) {
    return `${monthName} ${sYear}`
  }

  return `${startDate} إلى ${endDate}`
}

const loadReport = async () => {
  if (!props.budget?.id) return
  isLoading.value = true
  try {
    reportData.value = await budgetStore.fetchVarianceReport(props.budget.id)
  } catch (err) {
    toast.error('حدث خطأ أثناء استخراج تقرير انحرافات الموازنة.')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadReport()
    } else {
      reportData.value = null
    }
  },
  { immediate: true },
)
</script>
