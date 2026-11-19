<!-- src/modules/hr/views/shifts/ShiftsList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>إعدادات الورديات</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr.shifts.create')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        إضافة وردية جديدة
      </AppButton>
    </div>

    <!-- جدول الورديات -->
    <ShiftsTable
      :shifts="shifts"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة إضافة / تعديل وردية -->
    <ShiftModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :shift-to-edit="shiftToEdit"
      @saved="onShiftSaved"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الوردية"
      :message="`هل أنت متأكد من رغبتك في حذف الوردية (${shiftToDelete?.name})؟ لا يمكن إتمام العملية إذا كان هناك موظفون مرتبطون بها حالياً.`"
      confirm-text="حذف الوردية"
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
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import ShiftsTable from './components/ShiftsTable.vue'
import ShiftModal from './components/ShiftModal.vue'

const authStore = useAuthStore()
const shiftStore = useShiftStore()
const toast = useToast()

const { shifts, pagination, loading } = storeToRefs(shiftStore)

// -- جلب البيانات وإدارة التصفح --
const handlePageChange = async (page = 1) => {
  try {
    await shiftStore.fetchShifts({ page })
  } catch {
    toast.error('حدث خطأ أثناء جلب قائمة الورديات.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (إضافة / تعديل) --
const isModalOpen = ref(false)
const shiftToEdit = ref(null)

const openCreateModal = () => {
  shiftToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (shift) => {
  shiftToEdit.value = shift
  isModalOpen.value = true
}

const onShiftSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const shiftToDelete = ref(null)

const openDeleteDialog = (shift) => {
  shiftToDelete.value = shift
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!shiftToDelete.value) return

  try {
    await shiftStore.deleteShift(shiftToDelete.value.id)
    toast.success('تم حذف الوردية بنجاح.')

    const targetPage =
      shifts.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch {
    toast.error(shiftStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    shiftToDelete.value = null
  }
}
</script>
