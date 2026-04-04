<!--src\modules\accounting\views\journal-entries\JournalEntryFormPage.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-24">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-4 rounded-xl border border-surface-border sticky top-0 z-10 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <button
          @click="$router.push({ name: 'journal-entries.index' })"
          class="p-2 text-text-muted hover:text-text-primary hover:bg-surface-border rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-xl font-bold text-text-primary">
            {{ isEditMode ? `تعديل القيد #${form.entry_number || ''}` : 'قيد يومية جديد' }}
          </h1>
          <p class="text-xs text-text-muted mt-0.5">
            {{
              isEditMode ? 'تعديل مسودة القيد المحددة' : 'إدخال عملية محاسبية يدوية بنظام الكاشير'
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="isLoadingData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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

    <div
      class="fixed bottom-0 left-0 w-full bg-surface-section border-t border-surface-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div
          class="hidden md:block text-xs font-medium"
          :class="
            isBalanced && totalDebit > 0 && form.description ? 'text-emerald-500' : 'text-amber-500'
          "
        >
          {{
            isBalanced && totalDebit > 0 && form.description
              ? '✓ بيانات القيد مكتملة ومتزنة'
              : '⚠ تأكد من تعبئة البيان وموازنة الأطراف'
          }}
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <AppButton variant="secondary" @click="$router.push({ name: 'journal-entries.index' })">
            إلغاء
          </AppButton>
          <AppButton @click="submitForm" :disabled="isSaving">
            <span v-if="isSaving">جاري الحفظ...</span>
            <span v-else>حفظ القيد</span>
          </AppButton>
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

import AppButton from '@/components/ui/AppButton.vue'
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
  details: [], // شبكة فارغة افتراضياً لنظام الكاشير
})

const transactionalAccounts = computed(() => accountStore.transactionalAccounts || [])
const activeCostCenters = computed(() => costCenterStore.activeCostCenters || [])

const fetchRequiredData = async () => {
  const promises = []
  if (accountStore.flatAccounts?.length === 0) promises.push(accountStore.fetchAccounts())
  if (costCenterStore.costCenters?.length === 0) promises.push(costCenterStore.fetchCostCenters())
  if (currencyStore.currencies?.length === 0) promises.push(currencyStore.fetchCurrencies())

  await Promise.all(promises)

  // حالة "إنشاء قيد جديد" (ليس تعديلاً)
  if (!isEditMode.value) {
    // 1. العملة الافتراضية
    if (currencyStore.baseCurrency) {
      form.value.currency_id = currencyStore.baseCurrency.id
    }

    // 2. 🌟 السحر هنا: مركز التكلفة الافتراضي للمستخدم
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
    if (newDate) {
      const isOpen = await fiscalYearStore.checkDateStatus(newDate)
      if (!isOpen) {
        fiscalYearError.value = 'هذا التاريخ يقع في سنة مالية مغلقة أو غير معرفة.'
      } else {
        fiscalYearError.value = ''
      }
    }
  },
)

watch(
  () => form.value.cost_center_id,
  (newCostCenterId) => {
    form.value.details.forEach((line) => {
      line.cost_center_id = newCostCenterId
    })
  },
)

// حساب المجاميع
const totalDebit = computed(() =>
  form.value.details.reduce((sum, line) => sum + (Number(line.debit) || 0), 0),
)
const totalCredit = computed(() =>
  form.value.details.reduce((sum, line) => sum + (Number(line.credit) || 0), 0),
)
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.001)

const submitForm = async () => {
  // 1. التحقق من صحة البيانات وإصدار تنبيهات واضحة للمستخدم
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

  // تصفية الأسطر الصالحة (التي بها حساب ومبلغ)
  const cleanDetails = form.value.details
    .filter((line) => line.account_id && (Number(line.debit) > 0 || Number(line.credit) > 0))
    .map((line) => ({
      account_id: line.account_id,
      cost_center_id: form.value.cost_center_id || null, // التوريث الافتراضي
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

  // 2. تجهيز البيانات للإرسال
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
