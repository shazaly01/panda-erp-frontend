<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">السنوات المالية</h1>
        <p class="text-sm text-text-muted mt-1">إدارة الفترات المحاسبية وحالة الإغلاق والفتح</p>
      </div>
      <AppButton v-if="authStore.can('fiscal_year.create')" @click="openModal()">
        فتح سنة مالية جديدة
      </AppButton>
    </div>

    <FiscalYearsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <FiscalYearsTable
      :fiscal-years="fiscalYears"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openModal"
      @delete="openDeleteDialog"
      @row-clicked="openModal"
    />

    <FiscalYearModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :fiscal-year="selectedFiscalYear"
      :is-saving="isSaving"
      @save="handleSave"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السنة المالية"
      :message="`هل أنت متأكد من رغبتك في حذف السنة '${fiscalYearToDelete?.name}'؟ لا يمكن التراجع عن هذه العملية.`"
      @confirmed="deleteSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import FiscalYearsFilter from './FiscalYearsFilter.vue'
import FiscalYearsTable from './FiscalYearsTable.vue'
import FiscalYearModal from './FiscalYearModal.vue'

// -- إدارة الحالة --
const authStore = useAuthStore()
const fiscalYearStore = useFiscalYearStore()
const toast = useToast()

const { fiscalYears, pagination, loading } = storeToRefs(fiscalYearStore)

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
    status: statusFilter.value,
  }

  try {
    await fiscalYearStore.fetchFiscalYears(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة السنوات المالية.')
  }
}

onMounted(() => {
  handlePageChange()
})

// -- إدارة المودال --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedFiscalYear = ref(null)

const openModal = (fiscalYear = null) => {
  if (fiscalYear && !authStore.can('fiscal_year.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذه السنة المالية.')
    return
  }
  selectedFiscalYear.value = fiscalYear ? { ...fiscalYear } : null
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await fiscalYearStore.updateFiscalYear(formData.id, formData)
      toast.success(`تم تحديث بيانات السنة '${formData.name}' بنجاح.`)
    } else {
      await fiscalYearStore.createFiscalYear(formData)
      toast.success(`تمت إضافة السنة '${formData.name}' بنجاح.`)
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
const fiscalYearToDelete = ref(null)

const openDeleteDialog = (fiscalYear) => {
  if (fiscalYear.status !== 'planned') {
    // كإجراء وقائي إضافي في الواجهة
    toast.warning('لا يمكن حذف سنة مالية مفتوحة أو مغلقة. يمكن حذف السنوات المستقبلية فقط.')
    // العودة لمنع الحذف إلا إذا كانت إرادتك البرمجية تسمح بذلك
    // return;
  }
  fiscalYearToDelete.value = fiscalYear
  isDeleteDialogOpen.value = true
}

const deleteSelected = async () => {
  if (fiscalYearToDelete.value) {
    try {
      await fiscalYearStore.deleteFiscalYear(fiscalYearToDelete.value.id)
      toast.success('تم حذف السنة المالية بنجاح.')

      const targetPage =
        fiscalYears.value.length === 0 && pagination.value?.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(targetPage)
    } catch (error) {
      const errorMessage = fiscalYearStore.error || 'فشل الحذف، قد تكون السنة مرتبطة بعمليات.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      fiscalYearToDelete.value = null
    }
  }
}
</script>
