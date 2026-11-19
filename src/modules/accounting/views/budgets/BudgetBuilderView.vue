<!--src/modules/accounting/views/budgets/BudgetBuilderView.vue-->
<template>
  <div class="space-y-5 text-right font-sans" dir="rtl">
    <!-- ترويسة علوية مدمجة لتوفير المساحة الرأسية -->
    <div class="flex items-center justify-between pb-2.5 border-b border-surface-border">
      <div class="flex items-center gap-3">
        <router-link
          :to="{ name: 'budgets.index' }"
          class="p-2 rounded-xl bg-surface-card text-text-secondary hover:text-primary border border-surface-border hover:border-primary/50 shadow-2xs transition-all"
          title="العودة للقائمة"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>
        <div>
          <h1 class="text-base md:text-lg font-black text-text-primary flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-primary inline-block"></span>
            <span>{{
              isEditMode ? `تعديل الموازنة التقديرية #${budgetId}` : 'بناء موازنة تقديرية جديدة'
            }}</span>
          </h1>
          <p class="text-xs text-text-muted mt-0.5">
            حدد بيانات الموازنة العامة، ثم ابحث وأضف الحسابات أو مراكز التكلفة مباشرة داخل المصفوفة.
          </p>
        </div>
      </div>
    </div>

    <!-- مؤشر التحميل -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-20 gap-3 bg-surface-section rounded-xl border border-surface-border shadow-xs"
    >
      <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted font-bold">
        جاري تحميل بيانات الموازنة ومراكز التكلفة...
      </span>
    </div>

    <div v-else class="space-y-5">
      <!-- 1. بطاقة الإعدادات والبيانات الأساسية للموازنة (متطابقة مع ترويسة المبيعات) -->
      <div
        class="budget-header-card bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-3.5 transition-all duration-200"
      >
        <!-- الصف الأول: اسم الموازنة + السنة المالية -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
          <!-- اسم الموازنة -->
          <div class="md:col-span-8">
            <label for="builder-name" class="block text-xs font-bold text-text-secondary mb-1.5">
              اسم الموازنة التقديرية *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
            >
              <span class="absolute right-3 text-primary pointer-events-none">
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
                placeholder="مثال: موازنة المصروفات التشغيلية 2026..."
                class="block w-full h-full pr-9 pl-3 bg-transparent text-text-primary focus:outline-none text-xs font-black placeholder:text-text-muted placeholder:font-normal"
                required
              />
            </div>
          </div>

          <!-- السنة المالية -->
          <div class="md:col-span-4">
            <label
              for="builder-fiscal-year"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              السنة المالية (اختياري)
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
            >
              <span class="absolute right-3 text-text-muted pointer-events-none">
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
                class="block w-full h-full pr-9 pl-7 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
              >
                <option :value="null" class="bg-surface-section text-text-muted">
                  -- بدون ربط بسنة محددة --
                </option>
                <option
                  v-for="year in fiscalYears"
                  :key="year.id"
                  :value="year.id"
                  class="bg-surface-section text-text-primary font-bold"
                >
                  {{ year.name }}
                </option>
              </select>

              <span class="absolute left-2.5 text-text-muted pointer-events-none text-[9px]"
                >▼</span
              >
            </div>
          </div>
        </div>

        <!-- الصف الثاني: نوع الدورية + نمط الرقابة + تاريخ البداية + تاريخ النهاية -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5 items-start">
          <!-- دورية الموازنة -->
          <div class="md:col-span-3">
            <label
              for="builder-period-type"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              دورية الموازنة *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
            >
              <span class="absolute right-3 text-text-muted pointer-events-none">
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
                class="block w-full h-full pr-9 pl-7 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
                required
              >
                <option
                  v-for="opt in periodTypeOptions"
                  :key="opt.id"
                  :value="opt.id"
                  class="bg-surface-section text-text-primary font-bold"
                >
                  {{ opt.name }}
                </option>
              </select>

              <span class="absolute left-2.5 text-text-muted pointer-events-none text-[9px]"
                >▼</span
              >
            </div>
          </div>

          <!-- نمط الرقابة والمنع -->
          <div class="md:col-span-3">
            <label
              for="builder-control-mode"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              نمط الرقابة والمنع *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
            >
              <span class="absolute right-3 text-primary pointer-events-none">
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
                class="block w-full h-full pr-9 pl-7 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
                required
              >
                <option
                  v-for="opt in controlModeOptions"
                  :key="opt.id"
                  :value="opt.id"
                  class="bg-surface-section text-text-primary font-bold"
                >
                  {{ opt.name }}
                </option>
              </select>

              <span class="absolute left-2.5 text-text-muted pointer-events-none text-[9px]"
                >▼</span
              >
            </div>
          </div>

          <!-- تاريخ البداية -->
          <div class="md:col-span-3">
            <label
              for="builder-start-date"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              من تاريخ *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
            >
              <input
                id="builder-start-date"
                type="date"
                v-model="form.start_date"
                class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold cursor-pointer"
                dir="ltr"
                required
              />
            </div>
          </div>

          <!-- تاريخ النهاية -->
          <div class="md:col-span-3">
            <label
              for="builder-end-date"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              إلى تاريخ *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
            >
              <input
                id="builder-end-date"
                type="date"
                v-model="form.end_date"
                class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold cursor-pointer"
                dir="ltr"
                required
              />
            </div>
          </div>
        </div>

        <!-- الصف الثالث: الملاحظات -->
        <div>
          <label for="builder-notes" class="block text-xs font-bold text-text-secondary mb-1.5">
            ملاحظات توجيهية (اختياري)
          </label>
          <div
            class="relative w-full h-10 bg-surface-card border border-surface-border hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg flex items-center transition-all shadow-2xs"
          >
            <span class="absolute right-3 text-text-muted pointer-events-none">
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
              placeholder="ملاحظات توجيهية أو تعليمات وأهداف خاصة بهذه الموازنة..."
              class="block w-full h-full pr-9 pl-3 bg-transparent text-text-primary focus:outline-none text-xs font-semibold placeholder:text-text-muted placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      <!-- 2. مصفوفة الشهور والبنود التفاعلية بالبحث السطري الذكي -->
      <BudgetMatrixGrid
        v-model="matrixRows"
        :periods="generatedPeriods"
        :cost-centers="activeCostCenters"
      />

      <!-- 3. شريط أزرار الحفظ والإلغاء في أسفل الصفحة بتدفق طبيعي من اليمين إلى اليسار -->
      <div
        class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-section p-4 rounded-xl border border-surface-border shadow-xs"
      >
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving || isLoading"
          class="w-full sm:w-auto px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

        <button
          type="button"
          @click="router.push({ name: 'budgets.index' })"
          :disabled="isSaving"
          class="w-full sm:w-auto px-5 py-2.5 bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          إلغاء والعودة للقائمة
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
.budget-header-card input[type='date'] {
  color-scheme: inherit;
}
</style>
