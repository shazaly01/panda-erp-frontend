<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة الإجازات</h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة طلبات إجازات الموظفين، مراجعة الأرصدة، واعتماد أو رفض الطلبات.
        </p>
      </div>
      <AppButton v-if="authStore.can('leave.create')" @click="openCreateModal" icon="plus">
        تقديم طلب إجازة
      </AppButton>
    </div>

    <LeavesFilter
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

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

    <LeaveRequestModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :request-to-edit="requestToEdit"
      @saved="onLeaveSaved"
    />

    <AppConfirmDialog
      v-model="isApproveDialogOpen"
      title="تأكيد اعتماد الإجازة"
      :message="`هل أنت متأكد من رغبتك في اعتماد إجازة الموظف (${requestToApprove?.employee_name}) لمدة ${requestToApprove?.total_days} يوم؟ سيتم خصم الأيام من رصيده تلقائياً.`"
      confirm-text="تأكيد الاعتماد"
      confirm-variant="primary"
      @confirmed="confirmApprove"
    />

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
  } catch (error) {
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
  } catch (error) {
    toast.error(leaveStore.error || 'فشل الاعتماد. قد يكون الرصيد غير كافٍ.')
  } finally {
    isApproveDialogOpen.value = false
    requestToApprove.value = null
  }
}

// -- إدارة الرفض (Reject) --
const handleReject = (request) => {
  // ملاحظة: يمكنك لاحقاً إضافة دالة rejectLeave في الـ Store وإظهار نافذة مشابهة للاعتماد
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
  } catch (error) {
    toast.error(leaveStore.error || 'فشل عملية الإلغاء.')
  } finally {
    isDeleteDialogOpen.value = false
    requestToDelete.value = null
  }
}
</script>
