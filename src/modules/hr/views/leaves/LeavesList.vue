<!-- src/modules/hr/views/leaves/LeavesList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>إدارة الإجازات</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('leave.create')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        تقديم طلب إجازة
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة -->
    <LeavesFilter
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- جدول طلبات الإجازات -->
    <LeavesTable
      :leaves="leaves"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
      @approve="openApproveDialog"
      @reject="handleReject"
    />

    <!-- نافذة تقديم / تعديل طلب إجازة -->
    <LeaveRequestModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :request-to-edit="requestToEdit"
      @saved="onLeaveSaved"
    />

    <!-- نافذة تأكيد اعتماد الإجازة -->
    <AppConfirmDialog
      v-model="isApproveDialogOpen"
      title="تأكيد اعتماد الإجازة"
      :message="`هل أنت متأكد من رغبتك في اعتماد إجازة الموظف (${requestToApprove?.employee_name}) لمدة ${requestToApprove?.total_days} يوم؟ سيتم خصم الأيام من رصيده تلقائياً.`"
      confirm-text="تأكيد الاعتماد"
      confirm-variant="primary"
      @confirmed="confirmApprove"
    />

    <!-- نافذة تأكيد إلغاء الطلب -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء طلب الإجازة"
      :message="`هل أنت متأكد من رغبتك في إلغاء طلب الإجازة الخاص بالموظف (${requestToDelete?.employee_name})؟`"
      confirm-text="إلغاء الطلب"
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
import { useLeaveStore } from '@/modules/hr/stores/leaveStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import LeavesFilter from './components/LeavesFilter.vue'
import LeavesTable from './components/LeavesTable.vue'
import LeaveRequestModal from './components/LeaveRequestModal.vue'

const authStore = useAuthStore()
const leaveStore = useLeaveStore()
const toast = useToast()

const { leaves, pagination, loading } = storeToRefs(leaveStore)

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

// -- جلب البيانات وإدارة التصفح --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    leave_type_id: typeFilter.value,
    status: statusFilter.value,
  }

  try {
    await leaveStore.fetchLeaves(filters)
  } catch {
    toast.error('حدث خطأ أثناء جلب قائمة الإجازات.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (إضافة / تعديل) --
const isModalOpen = ref(false)
const requestToEdit = ref(null)

const openCreateModal = () => {
  requestToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (request) => {
  if (request.status !== 'pending') {
    return toast.warning('لا يمكن تعديل طلب تمت معالجته مسبقاً.')
  }
  requestToEdit.value = request
  isModalOpen.value = true
}

const onLeaveSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الاعتماد (Approve) --
const isApproveDialogOpen = ref(false)
const requestToApprove = ref(null)

const openApproveDialog = (request) => {
  requestToApprove.value = request
  isApproveDialogOpen.value = true
}

const confirmApprove = async () => {
  if (!requestToApprove.value) return

  try {
    await leaveStore.approveLeave(requestToApprove.value.id)
    toast.success('تم اعتماد الإجازة وخصم الرصيد بنجاح.')
  } catch {
    toast.error(leaveStore.error || 'فشل الاعتماد. قد يكون الرصيد غير كافٍ.')
  } finally {
    isApproveDialogOpen.value = false
    requestToApprove.value = null
  }
}

// -- إدارة الرفض (Reject) --
const handleReject = () => {
  toast.info('دالة رفض الإجازة غير مرتبطة بالمتجر حالياً. يمكنك إضافتها لاحقاً.')
}

// -- إدارة الحذف (إلغاء الطلب) --
const isDeleteDialogOpen = ref(false)
const requestToDelete = ref(null)

const openDeleteDialog = (request) => {
  if (request.status !== 'pending') {
    return toast.warning('لا يمكن إلغاء طلب تمت معالجته.')
  }
  requestToDelete.value = request
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!requestToDelete.value) return

  try {
    await leaveStore.deleteLeave(requestToDelete.value.id)
    toast.success('تم إلغاء طلب الإجازة بنجاح.')

    const targetPage =
      leaves.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch {
    toast.error(leaveStore.error || 'فشل عملية الإلغاء.')
  } finally {
    isDeleteDialogOpen.value = false
    requestToDelete.value = null
  }
}
</script>
