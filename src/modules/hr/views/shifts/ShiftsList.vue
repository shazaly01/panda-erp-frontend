<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إعدادات الورديات</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة أوقات الدوام الأساسية وفترات السماح ليتم تطبيقها على الموظفين.
        </p>
      </div>
      <AppButton v-if="authStore.can('hr.shifts.create')" @click="openCreateModal" icon="plus">
        إضافة وردية جديدة
      </AppButton>
    </div>

    <ShiftsTable
      :shifts="shifts"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <ShiftModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :shift-to-edit="shiftToEdit"
      @saved="onShiftSaved"
    />

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
  } catch (error) {
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
  } catch (error) {
    toast.error(shiftStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    shiftToDelete.value = null
  }
}
</script>
