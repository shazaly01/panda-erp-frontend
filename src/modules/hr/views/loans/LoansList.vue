<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة السلف</h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة طلبات السلف، الموافقة عليها، وعرض خطط السداد والأقساط.
        </p>
      </div>
      <AppButton v-if="authStore.can('loan.create')" @click="openCreateModal" icon="plus">
        طلب سلفة جديدة
      </AppButton>
    </div>

    <LoansFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <LoansTable
      :loans="loans"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <LoanModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :loan-to-edit="loanToEdit"
      @saved="onLoanSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء طلب السلفة"
      :message="`هل أنت متأكد من رغبتك في إلغاء طلب السلفة الخاص بالموظف (${loanToDelete?.employee_name}) بقيمة (${loanToDelete?.amount})؟`"
      confirm-text="إلغاء الطلب"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useLoanStore } from '@/modules/hr/stores/loanStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import LoansFilter from './components/LoansFilter.vue'
import LoansTable from './components/LoansTable.vue'
import LoanModal from './components/LoanModal.vue'

const authStore = useAuthStore()
const loanStore = useLoanStore()
const toast = useToast()

const { loans, pagination, loading } = storeToRefs(loanStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات وإدارة التصفح --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    status: statusFilter.value,
  }

  try {
    await loanStore.fetchLoans(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة السلف.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (إضافة / تعديل) --
const isModalOpen = ref(false)
const loanToEdit = ref(null)

const openCreateModal = () => {
  loanToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (loan) => {
  if (loan.status !== 'pending') {
    return toast.warning('لا يمكن تعديل سلفة تمت معالجتها.')
  }
  loanToEdit.value = loan
  isModalOpen.value = true
}

const onLoanSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (إلغاء الطلب) --
const isDeleteDialogOpen = ref(false)
const loanToDelete = ref(null)

const openDeleteDialog = (loan) => {
  if (loan.status !== 'pending') {
    return toast.warning('لا يمكن حذف سلفة تمت معالجتها.')
  }
  loanToDelete.value = loan
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!loanToDelete.value) return

  try {
    await loanStore.deleteLoan(loanToDelete.value.id)
    toast.success('تم إلغاء طلب السلفة بنجاح.')

    // تحديث الصفحة الحالية أو العودة للخلف
    const targetPage =
      loans.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(loanStore.error || 'فشل عملية الإلغاء.')
  } finally {
    isDeleteDialogOpen.value = false
    loanToDelete.value = null
  }
}
</script>
