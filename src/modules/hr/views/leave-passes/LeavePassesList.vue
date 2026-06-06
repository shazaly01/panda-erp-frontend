<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">أذونات الخروج المؤقت</h1>
        <p class="text-sm text-text-muted mt-1">
          إصدار وإدارة أذونات الخروج المؤقت للموظفين أثناء ساعات الدوام الرسمي وتوثيق الحركات
          اللحظية للبوابة.
        </p>
      </div>
      <AppButton
        v-if="authStore.can('hr_leave_passes.create')"
        @click="openCreateModal"
        icon="plus"
      >
        إصدار إذن خروج مباشر
      </AppButton>
    </div>

    <LeavePassesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <LeavePassesTable
      :leave-passes="leavePasses"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <LeavePassModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :leave-pass-to-edit="leavePassToEdit"
      @saved="onLeavePassSaved"
    />

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
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  // تأخير البحث بمقدار 500 ملي ثانية لتخفيف الضغط على السيرفر (Debounce)
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
  // حماية: لا يمكن تعديل إذن تم استغلاله حركياً بالخروج الفعلي
  if (leavePass.status === 'out' || leavePass.status === 'returned') {
    toast.warning('لا يمكن تعديل إذن خروج تم استخدامه وتوثيقه عند البوابة.')
    return
  }
  leavePassToEdit.value = leavePass
  isModalOpen.value = true
}

const onLeavePassSaved = () => {
  // المزامنة التلقائية والبقاء في نفس الصفحة الحالية بعد الحفظ
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة حركة الإلغاء والحذف (Delete / Cancel State) --
const isDeleteDialogOpen = ref(false)
const leavePassToDelete = ref(null)

const openDeleteDialog = (leavePass) => {
  // حماية جنائية: منع حذف الأذونات التي دخلت حيز التنفيذ الفعلي لحماية سلامة التقارير
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

    // حساب الصفحة المستهدفة في حال حذف العنصر الأخير بالصفحة الحالية
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
