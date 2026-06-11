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
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      v-model:departmentId="departmentId"
      v-model:positionId="positionId"
      v-model:employmentType="employmentType"
      v-model:presentOnly="presentOnly"
      :departmentOptions="departmentOptions"
      :positionOptions="positionOptions"
      @update:searchQuery="onSearch"
      @update:startDate="handlePageChange(1)"
      @update:endDate="handlePageChange(1)"
      @update:departmentId="handlePageChange(1)"
      @update:positionId="handlePageChange(1)"
      @update:employmentType="handlePageChange(1)"
      @update:presentOnly="handlePageChange(1)"
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

    <AttendanceSummaryTable
      v-else
      :summary-logs="summaryLogs"
      :loading="summaryLoading"
      :date-filter="startDate"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import axios from 'axios'
useAuthStore
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore'

// 🌟 حقن مخزن الإدارات الجديد للاستفادة من القائمة المسطحة الجاهزة
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AttendanceFilter from './components/AttendanceFilter.vue'
import AttendanceTable from './components/AttendanceTable.vue'
import AttendanceLogModal from './components/AttendanceLogModal.vue'
import attendanceLogService from '@/modules/hr/services/attendanceLog.service'
import AttendanceSummaryTable from './AttendanceSummaryTable.vue'

const router = useRouter()
const authStore = useAuthStore()
const attendanceStore = useAttendanceLogStore()
const departmentStore = useDepartmentStore() // تهيئة الـ Store
const toast = useToast()

const { logs, pagination, loading } = storeToRefs(attendanceStore)

// -- إدارة وضع العرض والبيانات التجميعية --
const viewMode = ref('detailed')
const summaryLogs = ref([])
const summaryLoading = ref(false)

// -- متغيرات الفلاتر --
const searchQuery = ref('')
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const departmentId = ref('')
const positionId = ref('')
const employmentType = ref('')
const presentOnly = ref(false)

// 🌟 تعبئة خيارات الأقسام بشكل ديناميكي شجري بربطها مباشرة مع الـ flatDepartments المحسوبة في الـ Store
const departmentOptions = computed(() => {
  return departmentStore.flatDepartments.map((dept) => ({
    id: dept.id,
    name: dept.dropdownName, // حقل التنسيق الجمالي الهرمي المتوفر في الـ Store الخاص بك
  }))
})

const positionOptions = ref([])
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const switchView = (mode) => {
  viewMode.value = mode
  handlePageChange(1)
}

const handlePageChange = async (page = 1) => {
  if (viewMode.value === 'detailed') {
    const filters = {
      page,
      search: searchQuery.value,
      date: startDate.value,
      department_id: departmentId.value || null,
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
    const summaryFilters = {
      start_date: startDate.value,
      end_date: endDate.value,
      search: searchQuery.value,
      department_id: departmentId.value || null,
      position_id: positionId.value || null,
      employment_type: employmentType.value || null,
      present_only: presentOnly.value ? 1 : 0,
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

// 🌟 استدعاء دالة جلب الأقسام الرسمية من الـ Store وجلب المسميات الوظيفية بشكل آمن
const loadFiltersLookupData = async () => {
  try {
    await departmentStore.fetchDepartments()

    // جلب المسميات الوظيفية بشكل مؤقت لحين تزويدي بالـ Store الخاص بها إذا لزم الأمر
    const posRes = await axios.get('/api/hr/positions').catch(() => ({ data: [] }))
    positionOptions.value = posRes.data?.data || posRes.data || []
  } catch (e) {
    console.error('فشل تحميل بيانات الفلاتر المساعدة:', e)
  }
}

onMounted(async () => {
  await loadFiltersLookupData()
  handlePageChange(1)
})

const goToKiosk = () => {
  const routeData = router.resolve({ name: 'attendance.kiosk' })
  window.open(routeData.href, '_blank')
}

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
