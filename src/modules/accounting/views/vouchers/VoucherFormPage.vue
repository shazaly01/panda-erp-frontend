<!--src\modules\accounting\views\vouchers\VoucherFormPage.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-24">
    <div v-if="isLoadingData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <template v-else>
      <VoucherHeader
        v-model="form"
        :is-edit-mode="isEditMode"
        :branches="branches"
        :boxes="boxes"
        :bank-accounts="bankAccounts"
        :currencies="currencies"
        :fiscal-year-error="fiscalYearError"
        :type="type"
      />

      <VoucherLines
        v-model:lines="form.details"
        :header-amount="form.amount"
        :accounts="transactionalAccounts"
        :cost-centers="activeCostCenters"
        :validation-errors="lineErrors"
        :type="type"
      />
    </template>

    <div
      class="fixed bottom-0 left-0 w-full bg-surface-section border-t border-surface-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div
          class="hidden md:block text-xs font-medium"
          :class="isBalanced ? 'text-emerald-500' : 'text-amber-500'"
        >
          {{
            isBalanced
              ? '✓ السند متوازن وجاهز للحفظ'
              : '⚠ يجب أن يتساوى إجمالي السند مع مجموع مبالغ الأسطر'
          }}
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <AppButton variant="secondary" @click="$router.push({ name: listRouteName })">
            إلغاء
          </AppButton>
          <AppButton @click="submitForm" :disabled="isSaving">
            <span v-if="isSaving">جاري الحفظ...</span>
            <span v-else>حفظ {{ voucherTypeName }}</span>
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

import { useVoucherStore } from '@/modules/accounting/stores/voucherStore'
import { useBoxStore } from '@/modules/accounting/stores/boxStore'
import { useBankAccountStore } from '@/modules/accounting/stores/bankAccountStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'
import { useAccountStore } from '@/modules/accounting/stores/accountStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'
import { useAuthStore } from '@/stores/authStore'
import AppButton from '@/components/ui/AppButton.vue'
import VoucherHeader from './components/VoucherHeader.vue'
import VoucherLines from './components/VoucherLines.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const voucherStore = useVoucherStore()
const boxStore = useBoxStore()
const bankAccountStore = useBankAccountStore()
const currencyStore = useCurrencyStore()
const accountStore = useAccountStore()
const costCenterStore = useCostCenterStore()
const fiscalYearStore = useFiscalYearStore()
const authStore = useAuthStore()

const isEditMode = computed(() => !!route.params.id)
const isSaving = ref(false)
const isLoadingData = ref(false)
const fiscalYearError = ref('')
const lineErrors = ref({})

const voucherTypeName = computed(() => (props.type === 'receipt' ? 'سند القبض' : 'سند الصرف'))
const listRouteName = computed(() =>
  props.type === 'receipt' ? 'receipts.index' : 'payments.index',
)

const form = ref({
  id: null,
  number: '',
  type: props.type,
  date: new Date().toISOString().split('T')[0],
  branch_id: '',
  box_id: '',
  bank_account_id: null,
  currency_id: '',
  amount: 0,
  payee_name: '',
  description: '',
  details: [],
})

// الفروع هي نفسها مراكز التكلفة النشطة
const activeCostCenters = computed(() => costCenterStore.activeCostCenters || [])
const branches = computed(() => activeCostCenters.value)

const boxes = computed(() => boxStore.boxes || [])
const bankAccounts = computed(() => bankAccountStore.bankAccounts || [])
const currencies = computed(() => currencyStore.currencies || [])
const transactionalAccounts = computed(() => accountStore.transactionalAccounts || [])

const fetchRequiredData = async () => {
  const promises = []
  if (boxes.value.length === 0) promises.push(boxStore.fetchBoxes())
  if (bankAccounts.value.length === 0) promises.push(bankAccountStore.fetchBankAccounts())
  if (currencies.value.length === 0) promises.push(currencyStore.fetchCurrencies())
  if (accountStore.flatAccounts?.length === 0) promises.push(accountStore.fetchAccounts())
  if (costCenterStore.costCenters?.length === 0) promises.push(costCenterStore.fetchCostCenters())

  await Promise.all(promises)

  if (!isEditMode.value) {
    // 1. العملة الافتراضية
    if (currencyStore.baseCurrency) {
      form.value.currency_id = currencyStore.baseCurrency.id
    }

    // 2. 🌟 حقن الافتراضيات الذكية من بيانات المستخدم
    if (authStore.user) {
      // حقن مركز التكلفة (الفرع) الافتراضي
      if (authStore.user.default_cost_center_id) {
        form.value.branch_id = authStore.user.default_cost_center_id
        // تعيينه للسطر الأول الافتراضي أيضاً
        if (form.value.details.length > 0) {
          form.value.details[0].cost_center_id = authStore.user.default_cost_center_id
        }
      } else if (branches.value.length > 0) {
        // حالة احتياطية: إذا لم يكن لديه فرع افتراضي، اختر الأول
        form.value.branch_id = branches.value[0].id
      }

      // حقن الخزينة الافتراضية
      if (authStore.user.default_box_id) {
        form.value.box_id = authStore.user.default_box_id
      }

      // حقن الحساب البنكي الافتراضي
      if (authStore.user.default_bank_account_id) {
        form.value.bank_account_id = authStore.user.default_bank_account_id
      }
    }
  }
}

const loadVoucherData = async () => {
  if (!isEditMode.value) return

  isLoadingData.value = true
  await voucherStore.fetchVoucher(route.params.id)

  if (voucherStore.currentVoucher) {
    const v = voucherStore.currentVoucher
    if (v.status === 'posted') {
      toast.warning('هذا السند مُرحل ولا يمكن تعديله.')
      router.push({ name: listRouteName.value })
      return
    }

    form.value = {
      id: v.id,
      number: v.number,
      type: v.type,
      date: v.date,
      branch_id: v.branch?.id || v.branch_id,
      box_id: v.payment_method?.type === 'box' ? v.payment_method.id : null,
      bank_account_id: v.payment_method?.type === 'bank' ? v.payment_method.id : null,
      currency_id: v.currency?.id || v.currency_id,
      amount: Number(v.amount),
      payee_name: v.payee_name || '',
      description: v.description || '',
      details: v.details.map((d, i) => ({
        _key: Date.now() + i,
        account_id: d.account?.id || d.account_id,
        cost_center_id: d.cost_center?.id || d.cost_center_id || '',
        amount: Number(d.amount),
        description: d.description || '',
      })),
    }
  }
  isLoadingData.value = false
}

onMounted(async () => {
  await fetchRequiredData()
  await loadVoucherData()
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

const isBalanced = computed(() => {
  const headerAmount = Number(form.value.amount) || 0
  const linesTotal = form.value.details.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)
  return headerAmount > 0 && Math.abs(headerAmount - linesTotal) < 0.001
})

const submitForm = async () => {
  if (fiscalYearError.value) return toast.error('لا يمكن الحفظ: ' + fiscalYearError.value)
  if (!form.value.date) return toast.error('تاريخ السند مطلوب.')
  if (!form.value.currency_id) return toast.error('الرجاء اختيار العملة.')
  if (!form.value.branch_id) return toast.error('الرجاء اختيار الفرع.')
  if (!form.value.box_id && !form.value.bank_account_id)
    return toast.error('الرجاء اختيار الخزينة أو الحساب البنكي.')
  if (!form.value.payee_name)
    return toast.error(`الرجاء كتابة اسم ${props.type === 'receipt' ? 'الدافع' : 'المستفيد'}.`)
  if (!isBalanced.value)
    return toast.error('يجب أن يتساوى الإجمالي في أعلى السند مع مجموع مبالغ الأسطر.')

  lineErrors.value = {}
  let hasErrors = false

  const cleanDetails = form.value.details
    .filter((line) => Number(line.amount) > 0)
    .map((line, index) => {
      if (!line.account_id) {
        lineErrors.value[index] = { account: true }
        hasErrors = true
      }
      return {
        account_id: line.account_id,
        cost_center_id: line.cost_center_id || null,
        amount: Number(line.amount),
        description: line.description || null,
      }
    })

  if (hasErrors || cleanDetails.length === 0) {
    return toast.error('يرجى اختيار الحسابات لجميع الأسطر وتأكيد المبالغ.')
  }

  const selectedCurrency = currencies.value.find((c) => c.id === form.value.currency_id)
  const exchangeRate = selectedCurrency ? selectedCurrency.exchange_rate : 1

  const payload = {
    type: props.type,
    branch_id: form.value.branch_id,
    date: form.value.date,
    payee_name: form.value.payee_name,
    description: form.value.description,
    box_id: form.value.box_id || null,
    bank_account_id: form.value.bank_account_id || null,
    currency_id: form.value.currency_id,
    exchange_rate: exchangeRate,
    amount: Number(form.value.amount),
    details: cleanDetails,
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await voucherStore.updateVoucher(form.value.id, payload)
      toast.success('تم تحديث السند بنجاح.')
    } else {
      await voucherStore.createVoucher(payload)
      toast.success('تم حفظ السند بنجاح كمسودة.')
    }
    router.push({ name: listRouteName.value })
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ السند.')
  } finally {
    isSaving.value = false
  }
}
</script>
