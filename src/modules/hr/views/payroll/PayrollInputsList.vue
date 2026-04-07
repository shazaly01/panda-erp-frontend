<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">المدخلات المالية</h1>
        <p class="text-sm text-text-muted mt-1">
          تسجيل الحوافز، الجزاءات، والبدلات الاستثنائية التي تؤثر على مسير رواتب الموظفين.
        </p>
      </div>
      <AppButton v-if="authStore.can('payroll_input.create')" @click="openCreateModal" icon="plus">
        إضافة مدخل مالي
      </AppButton>
    </div>

    <PayrollInputsFilter
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:processedFilter="processedFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
      @update:processedFilter="handlePageChange(1)"
    />

    <PayrollInputsTable
      :inputs="inputs"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <PayrollInputModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :input-to-edit="inputToEdit"
      @saved="onInputSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المدخل المالي"
      :message="`هل أنت متأكد من رغبتك في حذف حركة الموظف (${inputToDelete?.employee_name}) بقيمة (${inputToDelete?.amount})؟`"
      confirm-text="حذف نهائي"
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
import { usePayrollInputStore } from '@/modules/hr/stores/payrollInputStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import PayrollInputsFilter from './components/PayrollInputsFilter.vue'
import PayrollInputsTable from './components/PayrollInputsTable.vue'
import PayrollInputModal from './components/PayrollInputModal.vue'

const authStore = useAuthStore()
const payrollInputStore = usePayrollInputStore()
const toast = useToast()

const { inputs, pagination, loading } = storeToRefs(payrollInputStore)

const searchQuery = ref('')
const typeFilter = ref('')
const processedFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    type: typeFilter.value,
    is_processed: processedFilter.value,
  }

  try {
    await payrollInputStore.fetchInputs(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب المدخلات المالية.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// إدارة المودال
const isModalOpen = ref(false)
const inputToEdit = ref(null)

const openCreateModal = () => {
  inputToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (input) => {
  if (input.is_processed) return toast.warning('لا يمكن تعديل حركة تم ترحيلها بالفعل.')
  inputToEdit.value = input
  isModalOpen.value = true
}

const onInputSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// إدارة الحذف
const isDeleteDialogOpen = ref(false)
const inputToDelete = ref(null)

const openDeleteDialog = (input) => {
  if (input.is_processed) return toast.warning('لا يمكن حذف حركة تم ترحيلها بالفعل.')
  inputToDelete.value = input
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!inputToDelete.value) return

  try {
    await payrollInputStore.deleteInput(inputToDelete.value.id)
    toast.success('تم حذف الحركة بنجاح.')
    handlePageChange(pagination.value?.current_page || 1)
  } catch (error) {
    toast.error('فشل حذف الحركة.')
  } finally {
    isDeleteDialogOpen.value = false
    inputToDelete.value = null
  }
}
</script>
