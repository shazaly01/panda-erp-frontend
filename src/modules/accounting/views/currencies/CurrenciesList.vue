<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">العملات وأسعار الصرف</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة العملات المستخدمة في النظام وتحديث أسعار صرفها
        </p>
      </div>
      <AppButton v-if="authStore.can('currency.create')" @click="openModal()">
        إضافة عملة جديدة
      </AppButton>
    </div>

    <CurrenciesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="fetchData"
    />

    <CurrenciesTable
      :currencies="currencies"
      :loading="loading"
      @edit="openModal"
      @delete="openDeleteDialog"
      @row-clicked="openModal"
    />

    <CurrencyModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :currency="selectedCurrency"
      :is-saving="isSaving"
      @save="handleSave"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف العملة"
      :message="`هل أنت متأكد من رغبتك في حذف العملة '${currencyToDelete?.name}'؟ لا يمكن التراجع عن هذه العملية.`"
      @confirmed="deleteSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import CurrenciesFilter from './CurrenciesFilter.vue'
import CurrenciesTable from './CurrenciesTable.vue'
import CurrencyModal from './CurrencyModal.vue'

// -- إدارة الحالة --
const authStore = useAuthStore()
const currencyStore = useCurrencyStore()
const toast = useToast()

const { currencies, loading } = storeToRefs(currencyStore)

// -- الفلاتر --
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 500)
}

const fetchData = async () => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  try {
    await currencyStore.fetchCurrencies(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة العملات.')
  }
}

onMounted(() => {
  fetchData()
})

// -- إدارة المودال --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedCurrency = ref(null)

const openModal = (currency = null) => {
  if (currency && !authStore.can('currency.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذه العملة.')
    return
  }
  selectedCurrency.value = currency ? { ...currency } : null
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await currencyStore.updateCurrency(formData.id, formData)
      toast.success(`تم تحديث بيانات العملة '${formData.name}' بنجاح.`)
    } else {
      await currencyStore.createCurrency(formData)
      toast.success(`تمت إضافة العملة '${formData.name}' بنجاح.`)
    }
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء الحفظ.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const currencyToDelete = ref(null)

const openDeleteDialog = (currency) => {
  if (currency.is_base) {
    toast.warning('لا يمكن حذف العملة الأساسية للنظام.')
    return
  }
  currencyToDelete.value = currency
  isDeleteDialogOpen.value = true
}

const deleteSelected = async () => {
  if (currencyToDelete.value) {
    try {
      await currencyStore.deleteCurrency(currencyToDelete.value.id)
      toast.success('تم حذف العملة بنجاح.')
    } catch (error) {
      const errorMessage = currencyStore.error || 'فشل الحذف.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      currencyToDelete.value = null
    }
  }
}
</script>
