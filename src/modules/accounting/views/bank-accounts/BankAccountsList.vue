<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">الحسابات البنكية</h1>
        <p class="text-sm text-text-muted mt-1">إدارة حسابات الشركة في البنوك المختلفة</p>
      </div>
      <AppButton v-if="authStore.can('bank_account.create')" @click="openModal()">
        إضافة حساب بنكي
      </AppButton>
    </div>

    <BankAccountsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <BankAccountsTable
      :bank-accounts="bankAccounts"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openModal"
      @delete="openDeleteDialog"
      @row-clicked="openModal"
    />

    <BankAccountModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :bank-account="selectedAccount"
      :is-saving="isSaving"
      :currencies="currencyStore.currencies"
      :branches="branchStore?.branches || []"
      :transactional-accounts="allowedAccounts"
      @save="handleSave"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الحساب البنكي"
      :message="`هل أنت متأكد من رغبتك في حذف الحساب البنكي '${accountToDelete?.bank_name} - ${accountToDelete?.account_name}'؟`"
      @confirmed="deleteSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useBankAccountStore } from '@/modules/accounting/stores/bankAccountStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import BankAccountsFilter from './BankAccountsFilter.vue'
import BankAccountsTable from './BankAccountsTable.vue'
import BankAccountModal from './BankAccountModal.vue'

// -- إدارة الحالة --
const authStore = useAuthStore()
const bankAccountStore = useBankAccountStore()
const currencyStore = useCurrencyStore()
const branchStore = useCostCenterStore()
const toast = useToast()

// التعديل 1: استخراج allowedAccounts من الستور
const { bankAccounts, pagination, loading, allowedAccounts } = storeToRefs(bankAccountStore)

// -- حالة الفلاتر والبحث --
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  try {
    await bankAccountStore.fetchBankAccounts(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة الحسابات البنكية.')
  }
}

onMounted(async () => {
  handlePageChange()
  if (currencyStore.currencies?.length === 0) await currencyStore.fetchCurrencies()
  if (branchStore?.branches?.length === 0 && branchStore.fetchBranches) {
    await branchStore.fetchBranches()
  }

  // التعديل 2: جلب الحسابات المسموح بها الخاصة بالبنوك حصراً
  await bankAccountStore.fetchAllowedAccounts('default_bank_parent')
})

// -- إدارة المودال (الإضافة/التعديل) --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedAccount = ref(null)

const openModal = (account = null) => {
  if (account && !authStore.can('bank_account.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذا الحساب.')
    return
  }
  selectedAccount.value = account ? { ...account } : null
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await bankAccountStore.updateBankAccount(formData.id, formData)
      toast.success('تم تعديل بيانات الحساب البنكي بنجاح.')
    } else {
      await bankAccountStore.createBankAccount(formData)
      toast.success('تمت إضافة الحساب البنكي وربطه محاسبياً بنجاح.')
    }
    await handlePageChange(pagination.value?.current_page || 1)
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
const accountToDelete = ref(null)

const openDeleteDialog = (account) => {
  accountToDelete.value = account
  isDeleteDialogOpen.value = true
}

const deleteSelected = async () => {
  if (accountToDelete.value) {
    try {
      await bankAccountStore.deleteBankAccount(accountToDelete.value.id)
      toast.success('تم حذف الحساب البنكي بنجاح.')

      const targetPage =
        bankAccounts.value.length === 1 && pagination.value?.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(targetPage)
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'فشل الحذف، قد يكون الحساب مرتبطاً بعمليات مالية.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      accountToDelete.value = null
    }
  }
}
</script>
