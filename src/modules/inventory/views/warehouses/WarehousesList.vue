<!--src\modules\inventory\views\warehouses\WarehousesList.vue--->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة المستودعات</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة مستودعات المنشأة والمقرات التخزينية وتحديد المسئولين عن كل مستودع.
        </p>
      </div>
      <AppButton v-if="authStore.can('warehouse.create')" @click="openCreateModal" icon="plus">
        إضافة مستودع
      </AppButton>
    </div>

    <WarehousesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <WarehousesTable
      :warehouses="warehouses"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <WarehouseModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :warehouse-to-edit="warehouseToEdit"
      :users="usersList"
      @saved="onWarehouseSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المستودع"
      :message="`هل أنت متأكد من رغبتك في حذف مستودع (${warehouseToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء (لن يتم الحذف إذا كانت هناك حركة مخزنية أو مواقع مرتبطة بالمستودع).`"
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
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import WarehousesFilter from './components/WarehousesFilter.vue'
import WarehousesTable from './components/WarehousesTable.vue'
import WarehouseModal from './components/WarehouseModal.vue'

// -- تهيئة الـ Stores --
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const toast = useToast()

const { warehouses, pagination, loading } = storeToRefs(warehouseStore)

// قائمة المستخدمين لاختيار مدير المستودع
const usersList = ref([])

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

// -- جلب البيانات وإدارة التصفح (Pagination) --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  try {
    await warehouseStore.fetchWarehouses(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب المستودعات.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const warehouseToEdit = ref(null)

const openCreateModal = () => {
  warehouseToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (warehouse) => {
  warehouseToEdit.value = warehouse
  isModalOpen.value = true
}

const onWarehouseSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const warehouseToDelete = ref(null)

const openDeleteDialog = (warehouse) => {
  warehouseToDelete.value = warehouse
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!warehouseToDelete.value) return

  try {
    await warehouseStore.deleteWarehouse(warehouseToDelete.value.id)
    toast.success('تم حذف المستودع بنجاح.')

    const targetPage =
      warehouses.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(warehouseStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    warehouseToDelete.value = null
  }
}
</script>
