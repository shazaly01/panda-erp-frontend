<!--src/modules/accounting/views/budgets/BudgetBuilderView.vue-->
<template>
  <div class="space-y-5 text-right font-sans" dir="rtl">
    <!-- ترويسة علوية مدمجة وصغيرة لتوفير المساحة الرأسية -->
    <div class="flex items-center justify-between pb-2 border-b border-[#3e414c]">
      <div class="flex items-center gap-3">
        <router-link
          :to="{ name: 'budgets.index' }"
          class="p-1.5 rounded-lg bg-[#16171b] text-gray-400 hover:text-[#e05e2b] border border-[#3e414c] hover:border-[#e05e2b]/50 transition-all"
          title="العودة للقائمة"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>
        <div>
          <h1 class="text-base md:text-lg font-black text-white flex items-center gap-2">
            <span>{{
              isEditMode ? `تعديل الموازنة التقديرية #${budgetId}` : 'بناء موازنة تقديرية جديدة'
            }}</span>
          </h1>
          <p class="text-[11px] text-gray-400">
            حدد بيانات الموازنة العامة، ثم وزّع اعتمادات الحسابات ومراكز التكلفة عبر المصفوفة.
          </p>
        </div>
      </div>
    </div>

    <!-- مؤشر التحميل -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20 gap-3 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl"
    >
      <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-[#e05e2b]"></div>
      <span class="text-xs text-gray-400 font-bold"
        >جاري تحميل بيانات الموازنة ومراكز التكلفة...</span
      >
    </div>

    <div v-else class="space-y-5">
      <!-- 1. بطاقة الإعدادات والبيانات الأساسية للموازنة -->
      <div
        class="p-4 bg-[#23252e] rounded-xl border-2 border-[#5d6170] shadow-2xl space-y-3.5 text-right font-sans"
      >
        <!-- الصف الأول: اسم الموازنة + السنة المالية -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- اسم الموازنة -->
          <div class="relative w-full md:col-span-2">
            <div
              class="relative w-full h-10 bg-[#16171b] border border-[#e05e2b] rounded-lg flex items-center shadow-[0_0_10px_rgba(224,94,43,0.15)]"
            >
              <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>

              <input
                id="builder-name"
                type="text"
                v-model="form.name"
                placeholder="اسم الموازنة التقديرية (مثال: موازنة المصروفات التشغيلية 2026)... *"
                class="block w-full h-full pr-9 pl-4 bg-transparent text-white focus:outline-none text-xs font-bold placeholder-gray-500"
                required
              />
            </div>
          </div>

          <!-- السنة المالية -->
          <div class="relative w-full">
            <div
              class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] focus-within:border-[#e05e2b] rounded-lg flex items-center transition-all duration-200"
            >
              <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>

              <select
                id="builder-fiscal-year"
                v-model="form.fiscal_year_id"
                style="color-scheme: dark"
                class="block w-full h-full pr-9 pl-8 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
              >
                <option :value="null" class="bg-[#16171b] text-gray-400">
                  اختر السنة المالية (اختياري)...
                </option>
                <option
                  v-for="year in fiscalYears"
                  :key="year.id"
                  :value="year.id"
                  class="bg-[#16171b] text-white"
                >
                  {{ year.name }}
                </option>
              </select>

              <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>
        </div>

        <!-- الصف الثاني: نوع الدورية + نمط الرقابة + تاريخ البداية + تاريخ النهاية -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <!-- دورية الموازنة -->
          <div class="relative w-full">
            <div
              class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] focus-within:border-[#e05e2b] rounded-lg flex items-center transition-all duration-200"
            >
              <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </span>

              <select
                id="builder-period-type"
                v-model="form.period_type"
                style="color-scheme: dark"
                class="block w-full h-full pr-9 pl-8 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
                required
              >
                <option
                  v-for="opt in periodTypeOptions"
                  :key="opt.id"
                  :value="opt.id"
                  class="bg-[#16171b] text-white"
                >
                  الدورية: {{ opt.name }}
                </option>
              </select>

              <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>

          <!-- نمط الرقابة والمنع -->
          <div class="relative w-full">
            <div
              class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] focus-within:border-[#e05e2b] rounded-lg flex items-center transition-all duration-200"
            >
              <span class="absolute right-3 text-[#e05e2b] pointer-events-none z-10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </span>

              <select
                id="builder-control-mode"
                v-model="form.control_mode"
                style="color-scheme: dark"
                class="block w-full h-full pr-9 pl-8 bg-transparent text-white focus:outline-none text-xs font-bold appearance-none cursor-pointer"
                required
              >
                <option
                  v-for="opt in controlModeOptions"
                  :key="opt.id"
                  :value="opt.id"
                  class="bg-[#16171b] text-white"
                >
                  الرقابة: {{ opt.name }}
                </option>
              </select>

              <span class="absolute left-3 text-gray-500 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>

          <!-- تاريخ البداية -->
          <div class="relative w-full">
            <div
              class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] rounded-lg flex items-center transition-all duration-200"
            >
              <input
                id="builder-start-date"
                type="date"
                v-model="form.start_date"
                class="block w-full h-full pr-3 pl-14 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
                required
              />

              <span
                class="absolute left-2.5 text-gray-400 pointer-events-none flex items-center gap-1 text-xs z-10"
              >
                <span class="text-gray-400 font-medium text-[10px]">من</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <!-- تاريخ النهاية -->
          <div class="relative w-full">
            <div
              class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] rounded-lg flex items-center transition-all duration-200"
            >
              <input
                id="builder-end-date"
                type="date"
                v-model="form.end_date"
                class="block w-full h-full pr-3 pl-14 bg-transparent text-white focus:outline-none text-xs font-mono font-bold text-right"
                required
              />

              <span
                class="absolute left-2.5 text-gray-400 pointer-events-none flex items-center gap-1 text-xs z-10"
              >
                <span class="text-gray-400 font-medium text-[10px]">إلى</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <!-- الصف الثالث: الملاحظات -->
        <div class="relative w-full">
          <div
            class="relative w-full h-10 bg-[#16171b] border border-[#3e414c] hover:border-[#e05e2b] focus-within:border-[#e05e2b] rounded-lg flex items-center transition-all duration-200"
          >
            <span class="absolute right-3 text-gray-400 pointer-events-none z-10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </span>

            <input
              id="builder-notes"
              type="text"
              v-model="form.notes"
              placeholder="ملاحظات توجيهية أو تعليمات وأهداف خاصة بهذه الموازنة (اختياري)..."
              class="block w-full h-full pr-9 pl-4 bg-transparent text-white focus:outline-none text-xs font-medium placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <!-- 2. مصفوفة الشهور والبنود التفاعلية -->
      <BudgetMatrixGrid
        v-model="matrixRows"
        :periods="generatedPeriods"
        :cost-centers="activeCostCenters"
      />

      <!-- 3. شريط أزرار الحفظ والإلغاء في أسفل الصفحة -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#23252e] p-4 rounded-xl border-2 border-[#5d6170] shadow-2xl"
      >
        <button
          type="button"
          @click="router.push({ name: 'budgets.index' })"
          :disabled="isSaving"
          class="w-full sm:w-auto px-5 py-2.5 bg-[#16171b] border border-[#3e414c] text-gray-300 hover:text-white hover:border-gray-500 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء والعودة للقائمة
        </button>

        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving || isLoading"
          class="w-full sm:w-auto px-8 py-2.5 bg-[#e05e2b] hover:bg-[#e05e2b]/90 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(224,94,43,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="isSaving"
            class="animate-spin h-4 w-4 text-white"
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
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{
            isSaving ? 'جاري الحفظ...' : isEditMode ? 'تحديث الموازنة' : 'حفظ الموازنة كمسودة'
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import BudgetMatrixGrid from './components/BudgetMatrixGrid.vue'

import { useBudgetStore } from '@/modules/accounting/stores/budgetStore'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const budgetStore = useBudgetStore()
const fiscalYearStore = useFiscalYearStore()
const costCenterStore = useCostCenterStore()

const budgetId = computed(() => route.params.id)
const isEditMode = computed(() => !!budgetId.value)

const isLoading = ref(false)
const isSaving = ref(false)
const matrixRows = ref([])

const periodTypeOptions = [
  { id: 'monthly', name: 'شهري' },
  { id: 'quarterly', name: 'ربع سنوي' },
  { id: 'annually', name: 'سنوي' },
  { id: 'custom', name: 'مخصص / مشاريع' },
]

const controlModeOptions = [
  { id: 'advisory', name: 'استرشادي / تقارير فقط' },
  { id: 'warning', name: 'تحذير عند التجاوز' },
  { id: 'strict_stop', name: 'منع صارم عند التجاوز' },
]

const form = ref({
  name: '',
  fiscal_year_id: null,
  period_type: 'monthly',
  control_mode: 'advisory',
  start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
  end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
  notes: '',
})

const fiscalYears = computed(() => fiscalYearStore.fiscalYears || [])
const activeCostCenters = computed(
  () => costCenterStore.activeCostCenters || costCenterStore.costCenters || [],
)

// تنسيق التاريخ محلياً
const formatLocalDate = (year, month, day) => {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

const generatedPeriods = computed(() => {
  const periods = []
  if (!form.value.start_date || !form.value.end_date) return periods

  const [sYear, sMonth, sDay] = form.value.start_date.split('-').map(Number)
  const [eYear, eMonth, eDay] = form.value.end_date.split('-').map(Number)

  const startDate = new Date(sYear, sMonth - 1, sDay)
  const endDate = new Date(eYear, eMonth - 1, eDay)

  if (startDate > endDate) return periods

  if (form.value.period_type === 'annually') {
    periods.push({
      key: `${sYear}`,
      label: `سنة ${sYear}`,
      shortDate: `${form.value.start_date} إلى ${form.value.end_date}`,
      startDate: form.value.start_date,
      endDate: form.value.end_date,
    })
    return periods
  }

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

  let currentYear = sYear
  let currentMonth = sMonth - 1

  while (currentYear < eYear || (currentYear === eYear && currentMonth <= eMonth - 1)) {
    const isFirstMonth = currentYear === sYear && currentMonth === sMonth - 1
    const isLastMonth = currentYear === eYear && currentMonth === eMonth - 1

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const pStartDay = isFirstMonth ? sDay : 1
    const pEndDay = isLastMonth ? eDay : daysInMonth

    const pStartStr = formatLocalDate(currentYear, currentMonth + 1, pStartDay)
    const pEndStr = formatLocalDate(currentYear, currentMonth + 1, pEndDay)
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

    periods.push({
      key,
      label: `${arabicMonths[currentMonth]} ${currentYear}`,
      shortDate: key,
      startDate: pStartStr,
      endDate: pEndStr,
    })

    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
  }

  return periods
})

// جلب البيانات التأسيسية
const initData = async () => {
  isLoading.value = true
  try {
    const promises = []
    if (fiscalYears.value.length === 0 && fiscalYearStore.fetchFiscalYears) {
      promises.push(fiscalYearStore.fetchFiscalYears())
    }
    if (costCenterStore.costCenters?.length === 0) {
      promises.push(costCenterStore.fetchCostCenters())
    }
    await Promise.all(promises)

    if (isEditMode.value) {
      const budget = await budgetStore.fetchBudget(budgetId.value)
      if (budget.status?.value !== 'draft') {
        toast.warning('الموازنات المعتمدة أو النشطة غير قابلة للتعديل.')
        router.push({ name: 'budgets.index' })
        return
      }

      form.value = {
        name: budget.name || '',
        fiscal_year_id: budget.fiscal_year?.id || budget.fiscal_year_id || null,
        period_type: budget.period_type?.value || budget.period_type || 'monthly',
        control_mode: budget.control_mode?.value || budget.control_mode || 'advisory',
        start_date: budget.start_date || '',
        end_date: budget.end_date || '',
        notes: budget.notes || '',
      }

      hydrateMatrixFromBudgetLines(budget.lines || [])
    }
  } catch (err) {
    toast.error('حدث خطأ أثناء تحميل بيانات الموازنة.')
  } finally {
    isLoading.value = false
  }
}

// تحويل البنود إلى مصفوفة
const hydrateMatrixFromBudgetLines = (lines) => {
  const rowMap = new Map()

  lines.forEach((line) => {
    const accountId = line.account_id || line.account?.id || null
    const costCenterId = line.cost_center_id || line.cost_center?.id || null
    const groupKey = `${accountId}_${costCenterId}`

    if (!rowMap.has(groupKey)) {
      const initialPeriods = {}
      generatedPeriods.value.forEach((p) => {
        initialPeriods[p.key] = ''
      })

      rowMap.set(groupKey, {
        _key: Date.now() + Math.random(),
        account_id: accountId,
        account_code: line.account?.code || (accountId ? '' : 'مركز تكلفة'),
        account_name:
          line.account?.name ||
          (line.costCenter?.name
            ? `موازنة مجمعة (${line.costCenter.name})`
            : 'موازنة مركز تكلفة مجمعة'),
        account_type: line.account?.type?.value || line.account?.type || 'expense',
        cost_center_id: costCenterId,
        periods: initialPeriods,
      })
    }

    const row = rowMap.get(groupKey)
    const lineStart = line.period_start?.split('T')[0] || line.period_start
    const matchingPeriod = generatedPeriods.value.find((p) => p.startDate === lineStart)
    if (matchingPeriod) {
      row.periods[matchingPeriod.key] = Number(line.planned_amount) || ''
    }
  })

  matrixRows.value = Array.from(rowMap.values())
}

onMounted(() => {
  initData()
})

// حفظ الموازنة
const handleSubmit = async () => {
  if (!form.value.name) return toast.error('اسم الموازنة مطلوب.')
  if (!form.value.start_date || !form.value.end_date) {
    return toast.error('تاريخي البداية والنهاية مطلوبان.')
  }
  if (form.value.end_date < form.value.start_date) {
    return toast.error('تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.')
  }
  if (matrixRows.value.length === 0) {
    return toast.error('يرجى إضافة بند موازنة (حساب أو مركز تكلفة) في المصفوفة.')
  }

  const flatLines = []
  matrixRows.value.forEach((row) => {
    if (!row.account_id && !row.cost_center_id) return

    generatedPeriods.value.forEach((period) => {
      const amount = Number(row.periods[period.key]) || 0
      if (amount > 0) {
        flatLines.push({
          account_id: row.account_id || null,
          cost_center_id: row.cost_center_id || null,
          period_start: period.startDate,
          period_end: period.endDate,
          planned_amount: amount,
          notes: null,
        })
      }
    })
  })

  if (flatLines.length === 0) {
    return toast.error('يرجى كتابة مبالغ معتمدة في خلايا الشهور قبل الحفظ.')
  }

  const payload = {
    name: form.value.name,
    fiscal_year_id: form.value.fiscal_year_id || null,
    period_type: form.value.period_type,
    control_mode: form.value.control_mode,
    start_date: form.value.start_date,
    end_date: form.value.end_date,
    notes: form.value.notes || null,
    lines: flatLines,
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await budgetStore.updateBudget(budgetId.value, payload)
      toast.success('تم تحديث الموازنة التقديرية بنجاح.')
    } else {
      await budgetStore.createBudget(payload)
      toast.success('تم إنشاء الموازنة التقديرية كمسودة بنجاح.')
    }
    router.push({ name: 'budgets.index' })
  } catch (err) {
    toast.error(err.response?.data?.message || budgetStore.error || 'فشل حفظ الموازنة.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}
</style>
