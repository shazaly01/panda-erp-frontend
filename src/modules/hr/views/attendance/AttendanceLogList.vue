<!---src\modules\hr\views\attendance\AttendanceLogList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">سجلات الحضور والانصراف</h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة حركات البصمة اليومية للموظفين، ومراجعة التأخير والغياب والعمل الإضافي.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <AppButton
          variant="secondary"
          @click="goToKiosk"
          class="border-primary/20 text-primary hover:bg-primary/10"
        >
          <svg class="w-5 h-5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          شاشة الباركود (Kiosk)
        </AppButton>

        <AppButton v-if="authStore.can('attendance.create')" @click="openCreateModal" icon="plus">
          تسجيل حركة يدوية
        </AppButton>
      </div>
    </div>

    <AttendanceFilter
      v-model:searchQuery="searchQuery"
      v-model:dateFilter="dateFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:dateFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <AttendanceTable
      :logs="logs"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <AttendanceLogModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :log-to-edit="logToEdit"
      @saved="onLogSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السجل"
      :message="`هل أنت متأكد من رغبتك في حذف سجل الحضور الخاص بالموظف (${logToDelete?.employee_name}) ليوم (${logToDelete?.date})؟`"
      confirm-text="حذف السجل"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router' // 🌟 استيراد موجه المسارات
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AttendanceFilter from './components/AttendanceFilter.vue'
import AttendanceTable from './components/AttendanceTable.vue'
import AttendanceLogModal from './components/AttendanceLogModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceLogStore()
const toast = useToast()

const { logs, pagination, loading } = storeToRefs(attendanceStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
const dateFilter = ref(new Date().toISOString().split('T')[0]) // عرض سجلات اليوم افتراضياً
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
    date: dateFilter.value,
    status: statusFilter.value,
  }

  try {
    await attendanceStore.fetchLogs(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب سجلات الحضور.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- 🌟 فتح شاشة الاستقبال في تبويب جديد --
const goToKiosk = () => {
  const routeData = router.resolve({ name: 'attendance.kiosk' })
  window.open(routeData.href, '_blank')
}

// -- إدارة النافذة المنبثقة (إضافة / تعديل) --
const isModalOpen = ref(false)
const logToEdit = ref(null)

const openCreateModal = () => {
  logToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (log) => {
  logToEdit.value = log
  isModalOpen.value = true
}

const onLogSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const logToDelete = ref(null)

const openDeleteDialog = (log) => {
  logToDelete.value = log
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!logToDelete.value) return

  try {
    await attendanceStore.deleteLog(logToDelete.value.id)
    toast.success('تم حذف سجل الحضور بنجاح.')

    const targetPage =
      logs.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(attendanceStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    logToDelete.value = null
  }
}
</script>
