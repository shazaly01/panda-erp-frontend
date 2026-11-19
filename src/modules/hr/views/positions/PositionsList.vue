<!-- src/modules/hr/views/positions/PositionsList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>المسميات الوظيفية</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('position.create')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        إضافة مسمى وظيفي
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة -->
    <PositionsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- جدول المسميات الوظيفية -->
    <PositionsTable
      :positions="positions"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة إضافة / تعديل مسمى وظيفي -->
    <PositionModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :position-to-edit="positionToEdit"
      @saved="onPositionSaved"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المسمى الوظيفي"
      :message="`هل أنت متأكد من رغبتك في حذف وظيفة (${positionToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء.`"
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
import { usePositionStore } from '@/modules/hr/stores/positionStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import PositionsFilter from './components/PositionsFilter.vue'
import PositionsTable from './components/PositionsTable.vue'
import PositionModal from './components/PositionModal.vue'

// -- تهيئة الـ Stores --
const authStore = useAuthStore()
const positionStore = usePositionStore()
const toast = useToast()

const { positions, pagination, loading } = storeToRefs(positionStore)

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
    await positionStore.fetchPositions(filters)
  } catch {
    toast.error('حدث خطأ أثناء جلب المسميات الوظيفية.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const positionToEdit = ref(null)

const openCreateModal = () => {
  positionToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (position) => {
  positionToEdit.value = position
  isModalOpen.value = true
}

const onPositionSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const positionToDelete = ref(null)

const openDeleteDialog = (position) => {
  if (position.employees_count > 0) {
    toast.warning('لا يمكن حذف مسمى وظيفي مرتبط بموظفين.')
    return
  }
  positionToDelete.value = position
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!positionToDelete.value) return

  try {
    await positionStore.deletePosition(positionToDelete.value.id)
    toast.success('تم حذف المسمى الوظيفي بنجاح.')

    const targetPage =
      positions.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch {
    toast.error(positionStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    positionToDelete.value = null
  }
}
</script>
