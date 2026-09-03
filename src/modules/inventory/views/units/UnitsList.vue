<!--src\modules\inventory\views\units\UnitsList.vue---->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">وحدات القياس</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة قائمة وحدات القياس المعتمدة للمواد والأصناف داخل المخازن (مثل: كيلو جرام، قطعة، متر،
          كرتونة).
        </p>
      </div>
      <AppButton v-if="authStore.can('unit.create')" @click="openCreateModal" icon="plus">
        إضافة وحدة قياس
      </AppButton>
    </div>

    <UnitsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <UnitsTable
      :units="units"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <UnitModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :unit-to-edit="unitToEdit"
      @saved="onUnitSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف وحدة القياس"
      :message="`هل أنت متأكد من رغبتك في حذف وحدة القياس (${unitToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء.`"
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
import { useUnitStore } from '@/modules/inventory/stores/unitStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import UnitsFilter from './components/UnitsFilter.vue'
import UnitsTable from './components/UnitsTable.vue'
import UnitModal from './components/UnitModal.vue'

// -- تهيئة الـ Stores --
const authStore = useAuthStore()
const unitStore = useUnitStore()
const toast = useToast()

const { units, pagination, loading } = storeToRefs(unitStore)

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
    await unitStore.fetchUnits(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب وحدات القياس.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const unitToEdit = ref(null)

const openCreateModal = () => {
  unitToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (unit) => {
  unitToEdit.value = unit
  isModalOpen.value = true
}

const onUnitSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const unitToDelete = ref(null)

const openDeleteDialog = (unit) => {
  unitToDelete.value = unit
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!unitToDelete.value) return

  try {
    await unitStore.deleteUnit(unitToDelete.value.id)
    toast.success('تم حذف وحدة القياس بنجاح.')

    const targetPage =
      units.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(unitStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    unitToDelete.value = null
  }
}
</script>
