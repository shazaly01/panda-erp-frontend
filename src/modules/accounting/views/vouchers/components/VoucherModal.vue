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
    <!-- حالة التحميل تظهر فقط في أول فتح إذا لم تكن البيانات الأساسية في الذاكرة -->
    <div v-if="isLoadingData" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted">جاري تحميل بيانات السند...</span>
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
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  voucherId: { type: [Number, String], default: null },
  type: { type: String, required: true },
  prefillData: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const voucherStore = useVoucherStore()
const boxStore = useBoxStore()
const bankAccountStore = useBankAccountStore()
const currencyStore = useCurrencyStore()
const costCenterStore = useCostCenterStore()
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
  const statusText = isEditMode.value && initialData.value?.status === 'posted' ? ' (مُرحّل)' : ''
  const refText = props.prefillData?.reference_label
    ? ` (${props.prefillData.reference_label})`
    : ''
  return `${actionText} ${typeText}${numberText}${statusText}${refText}`
})

const dialogBorderColor = computed(() => 'border-primary')

const activeCostCenters = computed(
  () => costCenterStore.activeCostCenters || costCenterStore.costCenters || [],
)
const branches = computed(() => activeCostCenters.value)
const boxes = computed(() => boxStore.boxes || [])
const bankAccounts = computed(() => bankAccountStore.bankAccounts || [])
const currencies = computed(() => currencyStore.currencies || [])

const buildDefaultFormData = () => {
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

  if (props.prefillData) {
    return {
      ...defaultData,
      ...props.prefillData,
      details: props.prefillData.details?.length ? props.prefillData.details : defaultData.details,
    }
  }

  return defaultData
}

// تحميل البيانات بالتوازي وبدون حجب الواجهة إذا كانت البيانات موجودة في Pinia
const openModalData = async () => {
  const blockingPromises = []

  // الخزائن والبنوك: ننتظرها فقط إذا كانت فارغة تماماً، وإلا نحدث أرصدتها في الخلفية بصمت
  if (boxes.value.length === 0) {
    blockingPromises.push(boxStore.fetchBoxes())
  } else {
    boxStore.fetchBoxes().catch(() => {})
  }

  if (bankAccounts.value.length === 0) {
    blockingPromises.push(bankAccountStore.fetchBankAccounts())
  } else {
    bankAccountStore.fetchBankAccounts().catch(() => {})
  }

  if (currencies.value.length === 0) {
    blockingPromises.push(currencyStore.fetchCurrencies())
  }
  if (costCenterStore.costCenters?.length === 0) {
    blockingPromises.push(costCenterStore.fetchCostCenters())
  }

  let cachedVoucher = null
  if (isEditMode.value) {
    cachedVoucher =
      voucherStore.vouchers.find((v) => String(v.id) === String(props.voucherId)) || null

    if (!cachedVoucher || !Array.isArray(cachedVoucher.details)) {
      blockingPromises.push(voucherStore.fetchVoucher(props.voucherId))
    }
  }

  // إذا كانت جميع البيانات متوفرة في الذاكرة نفتح النموذج فوراً (0ms) بدون شاشة انتظار
  if (blockingPromises.length === 0) {
    initialData.value = isEditMode.value ? { ...cachedVoucher } : buildDefaultFormData()
    isLoadingData.value = false
    return
  }

  isLoadingData.value = true
  try {
    await Promise.all(blockingPromises)
    if (isEditMode.value) {
      const resolvedVoucher = cachedVoucher || voucherStore.currentVoucher
      if (resolvedVoucher) {
        initialData.value = { ...resolvedVoucher }
      }
    } else {
      initialData.value = buildDefaultFormData()
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات الأساسية.')
  } finally {
    isLoadingData.value = false
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      fiscalYearError.value = ''
      await openModalData()
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
    const wasAlreadyPosted = isEditMode.value && initialData.value?.status === 'posted'

    if (isEditMode.value) {
      result = await voucherStore.updateVoucher(props.voucherId, formData)
      if (wasAlreadyPosted) {
        toast.success('تم تحديث السند المُرحّل والقيد المحاسبي المرتبط به بنجاح.')
      } else if (!formData.post_after_save) {
        toast.success('تم تحديث السند بنجاح.')
      }
    } else {
      result = await voucherStore.createVoucher(formData)
      if (!formData.post_after_save) {
        toast.success('تم حفظ السند بنجاح كمسودة.')
      }
    }

    const targetVoucherId =
      props.voucherId ||
      result?.data?.data?.id ||
      result?.data?.id ||
      result?.id ||
      voucherStore.currentVoucher?.id

    if (!wasAlreadyPosted && formData.post_after_save && targetVoucherId) {
      await voucherStore.postVoucherAction(targetVoucherId)
      toast.success('تم ترحيل السند وإنشاء القيد المحاسبي بنجاح.')
    }

    // تحديث أرصدة الخزائن والبنوك في الخلفية بعد الحفظ دون إبطاء إغلاق النافذة
    Promise.all([boxStore.fetchBoxes(), bankAccountStore.fetchBankAccounts()]).catch(() => {})

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
