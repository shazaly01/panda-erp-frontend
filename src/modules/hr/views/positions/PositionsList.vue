<!--src\modules\hr\views\positions\PositionsList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">المسميات الوظيفية</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة قائمة المسميات الوظيفية (الوظائف) في المنشأة، والتي سيتم ربطها بالموظفين لاحقاً.
        </p>
      </div>
      <AppButton v-if="authStore.can('position.create')" @click="openCreateModal" icon="plus">
        إضافة مسمى وظيفي
      </AppButton>
    </div>

    <PositionsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <PositionsTable
      :positions="positions"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <PositionModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :position-to-edit="positionToEdit"
      @saved="onPositionSaved"
    />

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
  // تأخير البحث بمقدار 500 ملي ثانية لتخفيف الضغط على الخادم (Debounce)
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
  } catch (error) {
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
  // الـ Modal ستقوم بإغلاق نفسها، والـ Store يقوم بتحديث البيانات تلقائياً
  // يمكننا وضع المنطق الخاص بالبقاء في نفس الصفحة بدلاً من العودة للصفحة الأولى
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const positionToDelete = ref(null)

const openDeleteDialog = (position) => {
  // كحماية إضافية (تم تنفيذها في الجدول، لكن نؤكد عليها هنا)
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

    // إذا حذفنا العنصر الوحيد في الصفحة (وكانت ليست الصفحة الأولى)، نعود للصفحة السابقة
    const targetPage =
      positions.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(positionStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    positionToDelete.value = null
  }
}
</script>
