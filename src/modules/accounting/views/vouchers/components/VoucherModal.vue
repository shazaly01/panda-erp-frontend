<!--src/modules/accounting/views/vouchers/components/VoucherModal.vue-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="dialogTitle"
    size="5xl"
    :border-color="dialogBorderColor"
    :loading="isSubmitting"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <!-- حالة التحميل -->
    <div v-if="isLoadingData" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted">جاري تحميل بيانات السند والحسابات...</span>
    </div>

    <!-- نموذج السند الموحد -->
    <VoucherForm
      v-else
      :initial-data="initialData"
      :type="type"
      :is-saving="isSubmitting"
      :branches="branches"
      :boxes="boxes"
      :bank-accounts="bankAccounts"
      :currencies="currencies"
      :accounts="transactionalAccounts"
      :cost-centers="activeCostCenters"
      :fiscal-year-error="fiscalYearError"
      @submit="saveVoucher"
      @cancel="handleClose"
    />
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'

import AppDialog from '@/components/ui/AppDialog.vue'
import VoucherForm from './VoucherForm.vue'

import { useVoucherStore } from '@/modules/accounting/stores/voucherStore'
import { useBoxStore } from '@/modules/accounting/stores/boxStore'
import { useBankAccountStore } from '@/modules/accounting/stores/bankAccountStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'
import { useAccountStore } from '@/modules/accounting/stores/accountStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  voucherId: { type: [Number, String], default: null },
  type: { type: String, required: true }, // 'receipt' أو 'payment'
  prefillData: { type: Object, default: null }, // بيانات التعبئة المسبقة من الفاتورة المرجعية
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const voucherStore = useVoucherStore()
const boxStore = useBoxStore()
const bankAccountStore = useBankAccountStore()
const currencyStore = useCurrencyStore()
const accountStore = useAccountStore()
const costCenterStore = useCostCenterStore()
const fiscalYearStore = useFiscalYearStore()
const authStore = useAuthStore()

const isSubmitting = ref(false)
const isLoadingData = ref(false)
const initialData = ref(null)
const fiscalYearError = ref('')

const isEditMode = computed(() => !!props.voucherId)
const isReceipt = computed(() => props.type === 'receipt')

const dialogTitle = computed(() => {
  const actionText = isEditMode.value ? 'تعديل' : 'إنشاء'
  const typeText = isReceipt.value ? 'سند قبض' : 'سند صرف'
  const numberText =
    isEditMode.value && initialData.value?.number ? ` #${initialData.value.number}` : ''
  const refText = props.prefillData?.reference_label
    ? ` (${props.prefillData.reference_label})`
    : ''
  return `${actionText} ${typeText}${numberText}${refText}`
})

const dialogBorderColor = computed(() =>
  isReceipt.value ? 'border-emerald-500' : 'border-rose-500',
)

const activeCostCenters = computed(
  () => costCenterStore.activeCostCenters || costCenterStore.costCenters || [],
)
const branches = computed(() => activeCostCenters.value)
const boxes = computed(() => boxStore.boxes || [])
const bankAccounts = computed(() => bankAccountStore.bankAccounts || [])
const currencies = computed(() => currencyStore.currencies || [])
const transactionalAccounts = computed(
  () => accountStore.transactionalAccounts || accountStore.accounts || [],
)

// جلب البيانات التأسيسية بالتوازي
const fetchDependencies = async () => {
  const promises = []
  if (boxes.value.length === 0) promises.push(boxStore.fetchBoxes())
  if (bankAccounts.value.length === 0) promises.push(bankAccountStore.fetchBankAccounts())
  if (currencies.value.length === 0) promises.push(currencyStore.fetchCurrencies())
  if (accountStore.flatAccounts?.length === 0 || transactionalAccounts.value.length === 0) {
    promises.push(accountStore.fetchAccounts())
  }
  if (costCenterStore.costCenters?.length === 0) promises.push(costCenterStore.fetchCostCenters())

  await Promise.all(promises)
}

// تهيئة البيانات سواء في وضع الإنشاء أو التعديل مع دعم التعبئة المسبقة
const initFormData = async () => {
  if (isEditMode.value) {
    await voucherStore.fetchVoucher(props.voucherId)
    if (voucherStore.currentVoucher) {
      const v = voucherStore.currentVoucher
      if (v.status === 'posted') {
        toast.warning('السندات المُرحلة غير قابلة للتعديل.')
        handleClose(true)
        return
      }
      initialData.value = { ...v }
    }
  } else {
    // القيم الافتراضية الذكية للمستخدم الحالي
    const defaultData = {
      currency_id: currencyStore.baseCurrency?.id || (currencies.value[0]?.id ?? ''),
      date: new Date().toISOString().split('T')[0],
      branch_id: '',
      box_id: '',
      bank_account_id: null,
      payee_name: '',
      description: '',
      amount: 0,
      exchange_rate: 1,
      details: [],
    }

    if (authStore.user) {
      if (authStore.user.default_cost_center_id) {
        defaultData.branch_id = authStore.user.default_cost_center_id
      } else if (branches.value.length > 0) {
        defaultData.branch_id = branches.value[0].id
      }

      if (authStore.user.default_box_id) {
        defaultData.box_id = authStore.user.default_box_id
      }
      if (authStore.user.default_bank_account_id) {
        defaultData.bank_account_id = authStore.user.default_bank_account_id
      }
    }

    // دمج بيانات الفاتورة المرجعية إذا تم فتح النافذة لغرض سداد فاتورة
    if (props.prefillData) {
      initialData.value = {
        ...defaultData,
        ...props.prefillData,
        details: props.prefillData.details?.length
          ? props.prefillData.details
          : defaultData.details,
      }
    } else {
      initialData.value = defaultData
    }
  }
}

// مراقبة فتح النافذة لتحميل البيانات
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      isLoadingData.value = true
      fiscalYearError.value = ''
      try {
        await fetchDependencies()
        await initFormData()
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل البيانات الأساسية.')
      } finally {
        isLoadingData.value = false
      }
    } else {
      initialData.value = null
      fiscalYearError.value = ''
    }
  },
  { immediate: true },
)

const saveVoucher = async (formData) => {
  isSubmitting.value = true
  try {
    let result = null
    if (isEditMode.value) {
      result = await voucherStore.updateVoucher(props.voucherId, formData)
      toast.success('تم تحديث السند بنجاح.')
    } else {
      result = await voucherStore.createVoucher(formData)
      toast.success('تم حفظ السند بنجاح كمسودة.')
    }

    // في حال تفعيل خيار الحفظ والترحيل المباشر
    const createdId = result?.data?.id || result?.id || voucherStore.currentVoucher?.id
    if (formData.post_after_save && createdId) {
      await voucherStore.postVoucherAction(createdId)
      toast.success('تم ترحيل السند وتسوية الفاتورة بنجاح.')
    }

    emit('saved', result)
    handleClose(true)
  } catch (error) {
    toast.error(error.response?.data?.message || voucherStore.error || 'حدث خطأ أثناء حفظ السند.')
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = (force = false) => {
  if (isSubmitting.value && !force) return
  emit('update:modelValue', false)
  emit('close')
}
</script>
