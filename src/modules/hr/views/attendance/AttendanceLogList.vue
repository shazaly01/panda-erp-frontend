<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">سجلات الحضور والانصراف</h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة حركات البصمة اليومية للموظفين، ومراجعة التأخير والغياب والعمل الإضافي.
        </p>
      </div>

      <div
        class="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner"
      >
        <button
          type="button"
          @click="switchView('detailed')"
          :class="
            viewMode === 'detailed'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          "
          class="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        >
          سجلات تفصيلية
        </button>
        <button
          type="button"
          @click="switchView('summary')"
          :class="
            viewMode === 'summary'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          "
          class="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
        >
          خلاصة تجميعية
        </button>
      </div>

      <div class="flex items-center gap-3">
        <AppButton
          @click="goToKiosk"
          class="bg-slate-800 text-amber-400 border border-amber-500/30 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all duration-200"
        >
          <svg class="w-5 h-5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          شاشة الباركود
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
      v-if="viewMode === 'detailed'"
      :logs="logs"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <AttendanceSummaryTable v-else :summary-logs="summaryLogs" :loading="summaryLoading" />

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
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
useAuthStore
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AttendanceFilter from './components/AttendanceFilter.vue'
import AttendanceTable from './components/AttendanceTable.vue'
import AttendanceLogModal from './components/AttendanceLogModal.vue'
import attendanceLogService from '@/modules/hr/services/attendanceLog.service'

// استيراد المكون الجديد المخصص لعرض البيانات التجميعية والخلاصة
import AttendanceSummaryTable from './AttendanceSummaryTable.vue'

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceLogStore()
const toast = useToast()

const { logs, pagination, loading } = storeToRefs(attendanceStore)

// -- إدارة وضع العرض والبيانات التجميعية --
const viewMode = ref('detailed') // يمكن أن تكون 'detailed' أو 'summary'
const summaryLogs = ref([])
const summaryLoading = ref(false)

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

// -- التبديل الآمن بين وضعيات العرض وإعادة جلب البيانات --
const switchView = (mode) => {
  viewMode.value = mode
  handlePageChange(1)
}

// -- جلب البيانات الموحد بناءً على الفلاتر النشطة ووضع العرض --
const handlePageChange = async (page = 1) => {
  if (viewMode.value === 'detailed') {
    // 1. وضع السجلات التفصيلية اليومية: يعتمد على الـ Store
    const filters = {
      page,
      search: searchQuery.value,
      date: dateFilter.value,
      status: statusFilter.value,
    }

    loading.value = true
    try {
      await attendanceStore.fetchLogs(filters)
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب سجلات الحضور التفصيلية.')
    } finally {
      loading.value = false
    }
  } else {
    // 2. وضع التقرير المجمع: استدعاء مباشر من الخدمة لتوفير الذاكرة والأكواد
    const summaryFilters = {
      start_date: dateFilter.value,
      end_date: dateFilter.value,
      search: searchQuery.value,
    }

    summaryLoading.value = true
    try {
      const response = await attendanceLogService.getSummaryReport(summaryFilters)
      summaryLogs.value = response.data.data
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب خلاصة البيانات التجميعية.')
    } finally {
      summaryLoading.value = false
    }
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- فتح شاشة الاستقبال في تبويب جديد --
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
