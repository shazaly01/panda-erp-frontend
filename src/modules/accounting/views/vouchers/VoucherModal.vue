<template>
  <AppDialog
    :is-open="isOpen"
    :title="isEditMode ? 'تعديل السند' : 'إنشاء سند جديد'"
    max-width="5xl"
    @close="handleClose"
  >
    <VoucherForm
      v-if="!isLoadingData"
      :initial-data="initialData"
      :branches="branches"
      :currencies="currencyStore.currencies"
      :boxes="boxStore.boxes"
      :banks="bankAccountStore.bankAccounts"
      :accounts="accountStore.accounts"
      :cost-centers="costCenterStore.costCenters"
      :errors="validationErrors"
      :is-submitting="isSubmitting"
      @submit="saveVoucher"
      @cancel="handleClose"
    />
    <div v-else class="flex justify-center p-10">
      <span>جاري تحميل البيانات الأساسية...</span>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VoucherForm from './VoucherForm.vue'

// استيراد كافة الـ Stores المطلوبة
import { useVoucherStore } from '../../stores/voucherStore'
import { useCurrencyStore } from '../../stores/currencyStore'
import { useBoxStore } from '../../stores/boxStore'
import { useBankAccountStore } from '../../stores/bankAccountStore'
import { useAccountStore } from '../../stores/accountStore'
import { useCostCenterStore } from '../../stores/costCenterStore'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  voucherId: { type: [Number, String], default: null },
})

const emit = defineEmits(['close', 'saved'])

const voucherStore = useVoucherStore()
const currencyStore = useCurrencyStore()
const boxStore = useBoxStore()
const bankAccountStore = useBankAccountStore()
const accountStore = useAccountStore()
const costCenterStore = useCostCenterStore()

const isSubmitting = ref(false)
const isLoadingData = ref(true)
const validationErrors = ref({})
const initialData = ref({})

const isEditMode = computed(() => !!props.voucherId)

// تصفية مراكز التكلفة لاستخراج الفروع فقط
const branches = computed(() => {
  return costCenterStore.costCenters.filter((cc) => cc.is_branch)
})

onMounted(async () => {
  isLoadingData.value = true
  try {
    // جلب كل البيانات المطلوبة للقوائم المنسدلة بالتوازي (Promise.all) لسرعة الأداء
    await Promise.all([
      currencyStore.currencies.length === 0 ? currencyStore.fetchCurrencies() : Promise.resolve(),
      boxStore.boxes.length === 0 ? boxStore.fetchBoxes() : Promise.resolve(),
      bankAccountStore.bankAccounts.length === 0
        ? bankAccountStore.fetchBankAccounts()
        : Promise.resolve(),
      accountStore.accounts.length === 0 ? accountStore.fetchAccounts() : Promise.resolve(),
      costCenterStore.costCenters.length === 0
        ? costCenterStore.fetchCostCenters()
        : Promise.resolve(),
    ])

    if (isEditMode.value) {
      await fetchVoucherDetails()
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تحميل بيانات السند', error)
  } finally {
    isLoadingData.value = false
  }
})

const fetchVoucherDetails = async () => {
  try {
    await voucherStore.fetchVoucher(props.voucherId)
    initialData.value = voucherStore.currentVoucher
  } catch (error) {
    console.error('فشل جلب تفاصيل السند', error)
  }
}

const saveVoucher = async (formData) => {
  isSubmitting.value = true
  validationErrors.value = {}

  try {
    if (isEditMode.value) {
      await voucherStore.updateVoucher(props.voucherId, formData)
    } else {
      await voucherStore.createVoucher(formData)
    }

    emit('saved')
    handleClose()
  } catch (error) {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  validationErrors.value = {}
  initialData.value = {}
  emit('close')
}
</script>
