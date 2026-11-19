<!-- src/modules/hr/views/contracts/ContractsList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>إدارة العقود</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton v-if="authStore.can('contract.create')" size="sm" @click="goToCreate" icon="plus">
        إبرام عقد جديد
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة -->
    <ContractsFilter
      v-model:searchQuery="filters.search"
      v-model:status="filters.status"
      @update:searchQuery="onFilterChange"
      @update:status="onFilterChange"
    />

    <!-- جدول بيانات العقود -->
    <ContractsTable
      :contracts="contracts"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <!-- نافذة تأكيد الحذف -->
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

// -- جلب البيانات مع ضبط المعلمات المطابقة للباك-إند --
const handlePageChange = async (page = 1) => {
  try {
    const params = {
      page,
      search: filters.search || undefined,
      status: filters.status || undefined,
      active_only: filters.status === 'active' ? 1 : undefined,
    }
    await contractStore.fetchContracts(params)
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
