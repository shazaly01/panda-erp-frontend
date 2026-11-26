<!--src\modules\accounting\views\journal-entries\JournalEntryFormPage.vue-->
<template>
  <div class="space-y-5 max-w-7xl mx-auto pb-24 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة العلوية المدمجة -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-section p-4 rounded-xl border border-surface-border shadow-xs sticky top-0 z-20"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$router.push({ name: 'journal-entries.index' })"
          class="p-2 rounded-xl bg-surface-card text-text-secondary hover:text-primary border border-surface-border hover:border-primary/50 shadow-2xs transition-all cursor-pointer"
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
        </button>
        <div>
          <h1 class="text-base md:text-lg font-black text-text-primary flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-primary inline-block"></span>
            <span>{{
              isEditMode ? `تعديل القيد المحاسبي #${form.entry_number || ''}` : 'قيد يومية جديد'
            }}</span>
          </h1>
          <p class="text-xs text-text-muted mt-0.5">
            {{
              isEditMode
                ? 'تعديل بيانات وأطراف مسودة القيد المحددة'
                : 'إدخال عملية محاسبية مزدوجة بالبحث السطري السريع'
            }}
          </p>
        </div>
      </div>

      <!-- شارة حالة القيد العلوية -->
      <span
        class="px-3 py-1 rounded-full text-xs font-black border"
        :class="
          isBalanced && totalDebit > 0
            ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            : 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/30'
        "
      >
        {{ isBalanced && totalDebit > 0 ? 'متزن وجاهز للحفظ ✓' : 'قيد الإدخال والموازنة' }}
      </span>
    </div>

    <!-- حالة التحميل -->
    <div
      v-if="isLoadingData"
      class="flex flex-col justify-center items-center py-20 gap-3 bg-surface-section rounded-xl border border-surface-border shadow-xs"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted font-bold">جاري تحميل بيانات القيد المحاسبي...</span>
    </div>

    <template v-else>
      <JournalEntryHeader
        v-model="form"
        :currencies="currencyStore.currencies"
        :cost-centers="activeCostCenters"
        :fiscal-year-error="fiscalYearError"
      />

      <JournalEntryLines
        v-model:lines="form.details"
        :accounts="transactionalAccounts"
        :cost-centers="activeCostCenters"
      />
    </template>

    <!-- شريط الحفظ والإلغاء المثبت أسفل الشاشة -->
    <div
      class="fixed bottom-0 left-0 w-full bg-surface-section/95 backdrop-blur-md border-t border-surface-border p-3.5 shadow-[0_-6px_20px_-4px_rgba(15,23,42,0.12)] z-40"
    >
      <div
        class="max-w-7xl mx-auto flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        <!-- يمين: أزرار الإجراءات -->
        <div class="flex items-center gap-2.5 justify-start">
          <button
            type="button"
            @click="submitForm"
            :disabled="isSaving"
            class="px-7 py-2.5 bg-primary text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <span>{{ isSaving ? 'جاري الحفظ...' : isEditMode ? 'تحديث القيد' : 'حفظ القيد' }}</span>
          </button>

          <button
            type="button"
            @click="$router.push({ name: 'journal-entries.index' })"
            :disabled="isSaving"
            class="px-5 py-2.5 bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>

        <!-- يسار: مؤشر اكتمال البيانات والاتزان -->
        <div
          class="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold"
          :class="
            isBalanced && totalDebit > 0 && form.description
              ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/12 border-amber-500/30 text-amber-700 dark:text-amber-300'
          "
        >
          <span>
            {{
              isBalanced && totalDebit > 0 && form.description
                ? '✓ بيانات القيد مكتملة ومتزنة'
                : '⚠ تأكد من تعبئة البيان العام وموازنة الأطراف'
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'

import { useJournalEntryStore } from '@/modules/accounting/stores/journalEntryStore'
import { useAccountStore } from '@/modules/accounting/stores/accountStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'

import JournalEntryHeader from './components/JournalEntryHeader.vue'
import JournalEntryLines from './components/JournalEntryLines.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const journalStore = useJournalEntryStore()
const accountStore = useAccountStore()
const costCenterStore = useCostCenterStore()
const currencyStore = useCurrencyStore()
const fiscalYearStore = useFiscalYearStore()

const authStore = useAuthStore()
const isEditMode = computed(() => !!route.params.id)
const isSaving = ref(false)
const isLoadingData = ref(false)
const fiscalYearError = ref('')

const form = ref({
  id: null,
  entry_number: '',
  date: new Date().toISOString().split('T')[0],
  currency_id: '',
  reference_number: '',
  cost_center_id: '',
  description: '',
  details: [],
})

const transactionalAccounts = computed(() => accountStore.transactionalAccounts || [])
const activeCostCenters = computed(() => costCenterStore.activeCostCenters || [])

const fetchRequiredData = async () => {
  const promises = []
  if (accountStore.flatAccounts?.length === 0) promises.push(accountStore.fetchAccounts())
  if (costCenterStore.costCenters?.length === 0) promises.push(costCenterStore.fetchCostCenters())
  if (currencyStore.currencies?.length === 0) promises.push(currencyStore.fetchCurrencies())

  await Promise.all(promises)

  if (!isEditMode.value) {
    if (currencyStore.baseCurrency) {
      form.value.currency_id = currencyStore.baseCurrency.id
    }

    if (authStore.user && authStore.user.default_cost_center_id) {
      form.value.cost_center_id = authStore.user.default_cost_center_id
    }
  }
}

const loadEntryData = async () => {
  if (!isEditMode.value) return

  isLoadingData.value = true
  await journalStore.fetchEntry(route.params.id)

  if (journalStore.currentEntry) {
    const entry = journalStore.currentEntry
    if (entry.status === 'posted') {
      toast.warning('هذا القيد مُرحل ولا يمكن تعديله.')
      router.push({ name: 'journal-entries.index' })
      return
    }

    form.value = {
      id: entry.id,
      entry_number: entry.entry_number,
      date: entry.date,
      currency_id: entry.currency_id,
      reference_number: entry.reference_number || '',
      cost_center_id: entry.cost_center_id || '',
      description: entry.description,
      details: entry.details.map((d, i) => ({
        _key: Date.now() + i,
        account_id: d.account_id,
        cost_center_id: d.cost_center_id || '',
        debit: d.debit,
        credit: d.credit,
        description: d.description || '',
      })),
    }
  }
  isLoadingData.value = false
}

onMounted(async () => {
  await fetchRequiredData()
  await loadEntryData()
})

watch(
  () => form.value.date,
  async (newDate) => {
    if (!newDate) {
      fiscalYearError.value = ''
      return
    }

    const isOpen = await fiscalYearStore.checkDateStatus(newDate)
    if (form.value.date === newDate) {
      fiscalYearError.value = isOpen ? '' : 'هذا التاريخ يقع في سنة مالية مغلقة أو غير معرفة.'
    }
  },
  { immediate: true },
)

watch(
  () => form.value.cost_center_id,
  (newCostCenterId) => {
    form.value.details.forEach((line) => {
      line.cost_center_id = newCostCenterId
    })
  },
)

const totalDebit = computed(() =>
  form.value.details.reduce((sum, line) => sum + (Number(line.debit) || 0), 0),
)
const totalCredit = computed(() =>
  form.value.details.reduce((sum, line) => sum + (Number(line.credit) || 0), 0),
)
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.001)

const submitForm = async () => {
  if (fiscalYearError.value) {
    return toast.error('لا يمكن الحفظ: ' + fiscalYearError.value)
  }
  if (!form.value.date) {
    return toast.error('تاريخ القيد مطلوب.')
  }
  if (!form.value.currency_id) {
    return toast.error('الرجاء اختيار عملة القيد.')
  }
  if (!form.value.description) {
    return toast.error('الرجاء كتابة البيان العام للقيد.')
  }

  const cleanDetails = form.value.details
    .filter((line) => line.account_id && (Number(line.debit) > 0 || Number(line.credit) > 0))
    .map((line) => ({
      account_id: line.account_id,
      cost_center_id: line.cost_center_id || form.value.cost_center_id || null,
      debit: Number(line.debit),
      credit: Number(line.credit),
      description: line.description || null,
    }))

  if (cleanDetails.length < 2) {
    return toast.error('يجب أن يحتوي القيد على سطرين على الأقل لتكتمل العملية المزدوجة.')
  }

  if (totalDebit.value === 0) {
    return toast.error('إجمالي القيد لا يمكن أن يكون صفراً.')
  }

  if (!isBalanced.value) {
    const diff = Math.abs(totalDebit.value - totalCredit.value).toLocaleString()
    return toast.error(`القيد غير متزن! هناك فرق بقيمة ${diff} بين المدين والدائن.`)
  }

  const payload = {
    date: form.value.date,
    currency_id: form.value.currency_id,
    reference_number: form.value.reference_number,
    cost_center_id: form.value.cost_center_id || null,
    description: form.value.description,
    details: cleanDetails,
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await journalStore.updateEntry(form.value.id, payload)
      toast.success('تم تحديث القيد بنجاح.')
    } else {
      await journalStore.createEntry(payload)
      toast.success('تم حفظ القيد بنجاح كمسودة.')
    }
    router.push({ name: 'journal-entries.index' })
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم.')
  } finally {
    isSaving.value = false
  }
}
</script>
