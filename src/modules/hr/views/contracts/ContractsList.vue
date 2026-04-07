<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة العقود</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة عقود الموظفين، الرواتب الأساسية، وتحديد فترات سريان العقد.
        </p>
      </div>
      <AppButton v-if="authStore.can('contract.create')" @click="goToCreate" icon="plus">
        إبرام عقد جديد
      </AppButton>
    </div>

    <ContractsFilter
      v-model:searchQuery="filters.search"
      v-model:status="filters.status"
      @update:searchQuery="onFilterChange"
      @update:status="onFilterChange"
    />

    <ContractsTable
      :contracts="contracts"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف العقد"
      :message="`هل أنت متأكد من رغبتك في حذف العقد الخاص بالموظف (${contractToDelete?.employee?.full_name})؟ إذا كان العقد قد استخدم في مسيرات رواتب سابقة، فقد لا ينجح الحذف.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { useAuthStore } from '@/stores/authStore'
import { useContractStore } from '@/modules/hr/stores/contractStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import ContractsFilter from './components/ContractsFilter.vue'
import ContractsTable from './components/ContractsTable.vue'

// -- تهيئة --
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const contractStore = useContractStore()

const { contracts, pagination, loading } = storeToRefs(contractStore)

// -- الفلاتر --
const filters = reactive({
  search: '',
  status: '',
})

let searchTimeout = null

const onFilterChange = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  try {
    await contractStore.fetchContracts({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات العقود.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- التوجيه (Navigation) للـ Page --
const goToCreate = () => {
  router.push({ name: 'contracts.create' })
}

const goToEdit = (contract) => {
  router.push({ name: 'contracts.edit', params: { id: contract.id } })
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const contractToDelete = ref(null)

const openDeleteDialog = (contract) => {
  contractToDelete.value = contract
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!contractToDelete.value) return

  try {
    await contractStore.deleteContract(contractToDelete.value.id)
    toast.success('تم حذف العقد بنجاح.')

    const targetPage =
      contracts.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(contractStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    contractToDelete.value = null
  }
}
</script>
