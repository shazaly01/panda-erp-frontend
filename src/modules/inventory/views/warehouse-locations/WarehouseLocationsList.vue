<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">مواقع المستودعات</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة الخريطة المكانية والمواقع الفرعية داخل المستودعات (الممرات، الرفوف، الحاويات).
        </p>
      </div>
      <AppButton
        v-if="authStore.can('warehouse_location.create')"
        @click="openCreateModal"
        icon="plus"
      >
        إضافة موقع جديد
      </AppButton>
    </div>

    <WarehouseLocationsFilter
      v-model:searchQuery="searchQuery"
      v-model:warehouseFilter="warehouseFilter"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      :warehouses="warehousesList"
      @update:searchQuery="onSearch"
      @update:warehouseFilter="handlePageChange(1)"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <WarehouseLocationsTable
      :locations="locations"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <WarehouseLocationModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :location-to-edit="locationToEdit"
      :warehouses="warehousesList"
      @saved="onLocationSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف موقع المستودع"
      :message="`هل أنت متأكد من رغبتك في حذف موقع (${locationToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء (لن يتم الحذف إذا كانت هناك أصناف مرتبطة به).`"
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
import { useWarehouseLocationStore } from '@/modules/inventory/stores/warehouseLocationStore'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import WarehouseLocationsFilter from './components/WarehouseLocationsFilter.vue'
import WarehouseLocationsTable from './components/WarehouseLocationsTable.vue'
import WarehouseLocationModal from './components/WarehouseLocationModal.vue'

// -- تهيئة الـ Stores --
const authStore = useAuthStore()
const warehouseLocationStore = useWarehouseLocationStore()
const warehouseStore = useWarehouseStore()
const toast = useToast()

const { locations, pagination, loading } = storeToRefs(warehouseLocationStore)
const { warehouses: warehousesList } = storeToRefs(warehouseStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
const warehouseFilter = ref('')
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
    page,
    search: searchQuery.value,
    warehouse_id: warehouseFilter.value,
    type: typeFilter.value,
    is_active: statusFilter.value,
  }

  try {
    await warehouseLocationStore.fetchLocations(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب مواقع المستودعات.')
  }
}

onMounted(async () => {
  // جلب المستودعات لتغذية الخيارات في الفلتر والنموذج
  if (warehouseStore.fetchWarehouses) {
    await warehouseStore.fetchWarehouses()
  }
  await handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const locationToEdit = ref(null)

const openCreateModal = () => {
  locationToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (location) => {
  locationToEdit.value = location
  isModalOpen.value = true
}

const onLocationSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const locationToDelete = ref(null)

const openDeleteDialog = (location) => {
  locationToDelete.value = location
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!locationToDelete.value) return

  try {
    await warehouseLocationStore.deleteLocation(locationToDelete.value.id)
    toast.success('تم حذف موقع المستودع بنجاح.')

    const targetPage =
      locations.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(warehouseLocationStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    locationToDelete.value = null
  }
}
</script>
