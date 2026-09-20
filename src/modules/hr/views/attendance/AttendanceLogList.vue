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
          سجلات تجميعية
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- 🌟 زر استعلام حضور لفتح الصفحة العامة في تبويب جديد -->
        <AppButton
          @click="goToPublicReport"
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm transition-all duration-200"
        >
          <svg class="w-5 h-5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          استعلام حضور
        </AppButton>

        <AppButton
          v-if="authStore.can('hr.attendance.manage')"
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

        <AppButton
          v-if="authStore.can('hr.attendance.manage')"
          @click="openCreateModal"
          icon="plus"
        >
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
      v-model:payGroupId="payGroupId"
      v-model:employmentType="employmentType"
      v-model:presentOnly="presentOnly"
      :departmentOptions="departmentOptions"
      :positionOptions="positionOptions"
      :payGroupOptions="payGroupOptions"
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
      :start-date="startDate"
      :end-date="endDate"
      :department-name="selectedDepartmentName"
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'

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
const departmentStore = useDepartmentStore()
const payGroupStore = usePayGroupStore()
const toast = useToast()

const { logs, pagination, loading } = storeToRefs(attendanceStore)

const viewMode = ref('detailed')
const summaryLogs = ref([])
const summaryLoading = ref(false)

const searchQuery = ref('')
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const departmentId = ref('')
const positionId = ref('')
const payGroupId = ref('')
const employmentType = ref('')
const presentOnly = ref(false)

const departmentOptions = computed(() => {
  return departmentStore.flatDepartments.map((dept) => ({
    id: dept.id,
    name: dept.dropdownName,
  }))
})

const selectedDepartmentName = computed(() => {
  const matched = departmentOptions.value.find((dept) => dept.id === departmentId.value)
  return matched ? matched.name : null
})

const positionOptions = ref([])
const payGroupOptions = ref([])
let searchTimeout = null

// مراقبة التغيرات في فلاتر التواريخ والأقسام وطريقة الدفع لإعادة جلب البيانات تلقائياً
watch(
  [startDate, endDate, departmentId, positionId, payGroupId, employmentType, presentOnly],
  () => {
    handlePageChange(1)
  },
)

// مراقبة حقل البحث بالاسم مع تطبيق تأخير (Debounce 500ms)
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
})

const switchView = (mode) => {
  viewMode.value = mode
  handlePageChange(1)
}

const handlePageChange = async (page = 1) => {
  if (viewMode.value === 'detailed') {
    const filters = {
      page,
      search: searchQuery.value,
      start_date: startDate.value,
      end_date: endDate.value,
      department_id: departmentId.value || null,
      pay_group_id: payGroupId.value || null,
      employment_type: employmentType.value || 'all',
    }

    loading.value = true
    try {
      await attendanceStore.fetchLogs(filters)
    } catch {
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
      pay_group_id: payGroupId.value || null,
      employment_type: employmentType.value || null,
      present_only: presentOnly.value ? 1 : 0,
    }

    summaryLoading.value = true
    try {
      const response = await attendanceLogService.getSummaryReport(summaryFilters)
      summaryLogs.value = response.data.data
    } catch {
      toast.error('حدث خطأ أثناء جلب خلاصة البيانات التجميعية.')
    } finally {
      summaryLoading.value = false
    }
  }
}

const loadFiltersLookupData = async () => {
  // 1. جلب الأقسام
  try {
    await departmentStore.fetchDepartments()
  } catch (e) {
    console.error('فشل تحميل الأقسام:', e)
  }

  // 2. جلب الوظائف
  try {
    const posRes = await axios.get('/api/hr/positions').catch(() => ({ data: [] }))
    positionOptions.value = posRes.data?.data || posRes.data || []
  } catch (e) {
    console.error('فشل تحميل الوظائف:', e)
  }

  // 3. جلب مجموعات الدفع وتوحيد مسمى الحقل لـ name لضمان مقروءيتها بـ AppDropdown
  try {
    await payGroupStore.fetchPayGroups({ is_active: 1 }).catch(() => {})
    const rawGroups = payGroupStore.groups || payGroupStore.payGroups || []
    payGroupOptions.value = rawGroups.map((group) => ({
      id: group.id,
      name: group.name || group.title || group.label || group.name_ar || `مجموعة #${group.id}`,
    }))
  } catch (e) {
    console.error('فشل تحميل بيانات طرق الدفع:', e)
  }
}

onMounted(() => {
  // تنفيذ جلب جدول الحضور فوراً لمنع تجمد البيانات
  handlePageChange(1)
  // تحميل الخيارات المساعدة في الخلفية
  loadFiltersLookupData()
})

const goToKiosk = () => {
  const routeData = router.resolve({ name: 'attendance.kiosk' })
  window.open(routeData.href, '_blank')
}

// 🌟 فتح صفحة استعلام الحضور العامة في تبويب جديد
const goToPublicReport = () => {
  const routeData = router.resolve({ name: 'PublicEmployeeAttendanceReport' })
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
  } catch {
    toast.error(attendanceStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    logToDelete.value = null
  }
}
</script>
