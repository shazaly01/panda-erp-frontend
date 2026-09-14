<!--src/modules/purchasing/views/suppliers/SuppliersList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- رأس الصفحة وإجراء الإضافة -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة الموردين</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة سجلات الموردين وجهات التوريد، الحدود الائتمانية، والبيانات الضريبية والتجارية.
        </p>
      </div>
      <AppButton v-if="authStore.can('core.partners.create')" @click="openCreateModal" icon="plus">
        إضافة مورد جديد
      </AppButton>
    </div>

    <!-- شريط البحث والتصفية -->
    <SuppliersFilter
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- جدول عرض الموردين والترقيم -->
    <SuppliersTable
      :suppliers="suppliers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة الإضافة والتعديل المنبثقة -->
    <SupplierModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :supplier-to-edit="supplierToEdit"
      @saved="onSupplierSaved"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المورد"
      :message="`هل أنت متأكد من رغبتك في حذف المورد (${supplierToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء (لن يتم الحذف إذا كانت هناك فواتير، قيود، أو حركات شراء مرتبطة به).`"
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
import { useSupplierStore } from '@/modules/purchasing/stores/supplierStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import SuppliersFilter from './components/SuppliersFilter.vue'
import SuppliersTable from './components/SuppliersTable.vue'
import SupplierModal from './components/SupplierModal.vue'

// -- تهيئة الـ Stores والتنبيهات --
const authStore = useAuthStore()
const supplierStore = useSupplierStore()
const toast = useToast()

const { suppliers, pagination, loading } = storeToRefs(supplierStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات وإدارة التصفح (Pagination) --
const handlePageChange = async (page = 1) => {
  const filters = {
    search: searchQuery.value,
    type: typeFilter.value,
    status: statusFilter.value,
  }

  try {
    await supplierStore.fetchSuppliers(page, filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل قائمة الموردين.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const supplierToEdit = ref(null)

const openCreateModal = () => {
  supplierToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (supplier) => {
  supplierToEdit.value = supplier
  isModalOpen.value = true
}

const onSupplierSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const supplierToDelete = ref(null)

const openDeleteDialog = (supplier) => {
  supplierToDelete.value = supplier
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!supplierToDelete.value) return

  try {
    await supplierStore.deleteSupplier(supplierToDelete.value.id)
    toast.success('تم حذف المورد بنجاح.')

    const targetPage =
      suppliers.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(supplierStore.error || 'فشلت عملية حذف المورد.')
  } finally {
    isDeleteDialogOpen.value = false
    supplierToDelete.value = null
  }
}
</script>
