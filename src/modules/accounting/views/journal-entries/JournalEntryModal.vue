<template>
  <AppDialog
    :is-open="isOpen"
    :title="isEditMode ? 'تعديل قيد يومية' : 'إنشاء قيد يومية جديد'"
    max-width="6xl"
    @close="handleClose"
  >
    <JournalEntryForm
      v-if="!isLoadingData"
      :initial-data="initialData"
      :currencies="currencyStore.currencies"
      :accounts="accountStore.accounts"
      :cost-centers="costCenterStore.costCenters"
      :errors="validationErrors"
      :is-submitting="isSubmitting"
      @submit="saveJournalEntry"
      @cancel="handleClose"
    />
    <div v-else class="flex justify-center p-10">
      <span>جاري تحميل الحسابات والبيانات الأساسية...</span>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import JournalEntryForm from './JournalEntryForm.vue'

import { useJournalEntryStore } from '../../stores/journalEntryStore' // الذي قمنا بتعديله سابقاً
import { useCurrencyStore } from '../../stores/currencyStore'
import { useAccountStore } from '../../stores/accountStore'
import { useCostCenterStore } from '../../stores/costCenterStore'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  journalEntryId: { type: [Number, String], default: null },
})

const emit = defineEmits(['close', 'saved'])

const journalEntryStore = useJournalEntryStore()
const currencyStore = useCurrencyStore()
const accountStore = useAccountStore()
const costCenterStore = useCostCenterStore()

const isSubmitting = ref(false)
const isLoadingData = ref(true)
const validationErrors = ref({})
const initialData = ref({})

const isEditMode = computed(() => !!props.journalEntryId)

onMounted(async () => {
  isLoadingData.value = true
  try {
    // جلب القوائم المنسدلة المطلوبة لسطور القيد
    await Promise.all([
      currencyStore.currencies.length === 0 ? currencyStore.fetchCurrencies() : Promise.resolve(),
      accountStore.accounts.length === 0 ? accountStore.fetchAccounts() : Promise.resolve(),
      costCenterStore.costCenters.length === 0
        ? costCenterStore.fetchCostCenters()
        : Promise.resolve(),
    ])

    if (isEditMode.value) {
      await fetchJournalEntryDetails()
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تحميل بيانات القيد', error)
  } finally {
    isLoadingData.value = false
  }
})

const fetchJournalEntryDetails = async () => {
  try {
    await journalEntryStore.fetchEntry(props.journalEntryId)
    initialData.value = journalEntryStore.currentEntry
  } catch (error) {
    console.error('فشل جلب تفاصيل القيد', error)
  }
}

const saveJournalEntry = async (formData) => {
  isSubmitting.value = true
  validationErrors.value = {}

  try {
    if (isEditMode.value) {
      await journalEntryStore.updateEntry(props.journalEntryId, formData)
    } else {
      await journalEntryStore.createEntry(formData)
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
