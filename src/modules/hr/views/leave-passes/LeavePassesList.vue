<!-- src/modules/hr/views/leave-passes/LeavePassesList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>أذونات الخروج المؤقت</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr_leave_passes.create')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        إصدار إذن خروج مباشر
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة -->
    <LeavePassesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      v-model:dateFilter="dateFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
      @update:dateFilter="handlePageChange(1)"
    />

    <!-- جدول بيانات أذونات الخروج -->
    <LeavePassesTable
      :leave-passes="leavePasses"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة إصدار / تعديل إذن الخروج -->
    <LeavePassModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :leave-pass-to-edit="leavePassToEdit"
      @saved="onLeavePassSaved"
    />

    <!-- نافذة تأكيد الإلغاء -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء إذن الخروج"
      :message="`هل أنت متأكد من رغبتك في إلغاء إذن الخروج الخاص بالموظف (${leavePassToDelete?.employee?.full_name})؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`"
      confirm-text="إلغاء الإذن نهائياً"
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
import { useLeavePassStore } from '@/modules/hr/stores/leavePassStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import LeavePassesFilter from './components/LeavePassesFilter.vue'
import LeavePassesTable from './components/LeavePassesTable.vue'
import LeavePassModal from './components/LeavePassModal.vue'

// -- تهيئة الـ Stores المركزية --
const authStore = useAuthStore()
const leavePassStore = useLeavePassStore()
const toast = useToast()

const { leavePasses, pagination, loading } = storeToRefs(leavePassStore)

// -- الفلاتر والبحث اللحظي --
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات وإدارة التصفح (Pagination) من السيرفر --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    status: statusFilter.value,
    date: dateFilter.value,
  }

  try {
    await leavePassStore.fetchLeavePasses(filters)
  } catch {
    toast.error('حدث خطأ أثناء جلب قائمة أذونات الخروج.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة حالة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const leavePassToEdit = ref(null)

const openCreateModal = () => {
  leavePassToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (leavePass) => {
  if (leavePass.status === 'out' || leavePass.status === 'returned') {
    toast.warning('لا يمكن تعديل إذن خروج تم استخدامه وتوثيقه عند البوابة.')
    return
  }
  leavePassToEdit.value = leavePass
  isModalOpen.value = true
}

const onLeavePassSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة حركة الإلغاء والحذف (Delete / Cancel State) --
const isDeleteDialogOpen = ref(false)
const leavePassToDelete = ref(null)

const openDeleteDialog = (leavePass) => {
  if (leavePass.status === 'out' || leavePass.status === 'returned') {
    toast.warning('حماية أمنية: لا يمكن إلغاء إذن خروج مسجل كحركة فعلية في المنشأة.')
    return
  }
  leavePassToDelete.value = leavePass
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!leavePassToDelete.value) return

  try {
    await leavePassStore.deleteLeavePass(leavePassToDelete.value.id)
    toast.success('تم إلغاء وحذف إذن الخروج بنجاح.')

    const targetPage =
      leavePasses.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch {
    toast.error('فشلت عملية إلغاء إذن الخروج، يرجى المحاولة لاحقاً.')
  } finally {
    isDeleteDialogOpen.value = false
    leavePassToDelete.value = null
  }
}
</script>
