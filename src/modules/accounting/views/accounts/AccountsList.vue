<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">دليل الحسابات</h1>
        <p class="text-sm text-text-muted mt-1">إدارة الشجرة المحاسبية وتصنيف الحسابات</p>
      </div>
      <AppButton v-if="authStore.can('account.create')" @click="openAccountModal()">
        إضافة حساب رئيسي
      </AppButton>
    </div>

    <AccountsFilter
      v-model:searchQuery="searchQuery"
      v-model:natureFilter="natureFilter"
      @update:searchQuery="onSearch"
      @update:natureFilter="fetchData"
    />

    <AccountsTreeView
      :accounts="accountTree"
      :loading="loading"
      @add-child="openAddChildModal"
      @edit="openAccountModal"
      @delete="openDeleteDialog"
    />

    <AccountModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :account="selectedAccount"
      :is-saving="isSaving"
      :currencies="currencyStore.currencies"
      :parent-accounts="flatAccounts"
      :account-type-options="accountTypes"
      @save="handleSaveAccount"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الحساب"
      :message="`هل أنت متأكد من رغبتك في حذف حساب '${accountToDelete?.name}'؟ لا يمكن التراجع عن هذه العملية.`"
      @confirmed="deleteSelectedAccount"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAccountStore } from '@/modules/accounting/stores/accountStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'
import { useAuthStore } from '@/stores/authStore'

// استيراد المكونات
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AccountsFilter from './AccountsFilter.vue'
import AccountsTreeView from './AccountsTreeView.vue'
import AccountModal from './AccountModal.vue'

// --- إدارة الحالة ---
const accountStore = useAccountStore()
const currencyStore = useCurrencyStore()
const authStore = useAuthStore()
const toast = useToast()

const { accountTree, flatAccounts, accountTypes, loading } = storeToRefs(accountStore)

const searchQuery = ref('')
const natureFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 500)
}

const fetchData = async () => {
  try {
    await accountStore.fetchAccounts({
      search: searchQuery.value,
      nature: natureFilter.value,
    })

    // جلب البيانات المساعدة في الخلفية إذا لزم الأمر
    if (accountTypes.value.length === 0) accountStore.fetchAccountTypes()
    if (currencyStore.currencies.length === 0) currencyStore.fetchCurrencies()
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات دليل الحسابات.')
  }
}

onMounted(() => {
  fetchData()
})

// --- إدارة المودال ---
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedAccount = ref(null)

const openAccountModal = (account = null) => {
  if (account && !authStore.can('account.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذا الحساب.')
    return
  }
  selectedAccount.value = account ? { ...account } : null
  isModalOpen.value = true
}

/**
 * تحسين ذكي: عند إضافة ابن، نرث طبيعة الحساب وتصنيفه من الأب
 */
const openAddChildModal = (parentAccount) => {
  selectedAccount.value = {
    parent_id: parentAccount.id,
    type: parentAccount.type, // توريث النوع (أصول/خصوم...)
    nature: parentAccount.nature, // توريث الطبيعة (مدين/دائن)
  }
  isModalOpen.value = true
}

const handleSaveAccount = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await accountStore.updateAccount(formData.id, formData)
      toast.success(`تم تحديث الحساب بنجاح.`)
    } else {
      await accountStore.createAccount(formData)
      toast.success(`تمت إضافة الحساب بنجاح.`)
    }
    isModalOpen.value = false
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}

// --- إدارة الحذف ---
const isDeleteDialogOpen = ref(false)
const accountToDelete = ref(null)

const openDeleteDialog = (account) => {
  accountToDelete.value = account
  isDeleteDialogOpen.value = true
}

const deleteSelectedAccount = async () => {
  if (!accountToDelete.value) return
  try {
    await accountStore.deleteAccount(accountToDelete.value.id)
    toast.success('تم حذف الحساب بنجاح.')
  } catch (error) {
    toast.error(error.response?.data?.message || 'فشل حذف الحساب.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}
</script>
