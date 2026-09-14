<!-- src/modules/purchasing/views/requisitions/PurchaseRequisitionsList.vue -->
<template>
  <div class="space-y-6 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة وإجراء الإنشاء -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-black text-white flex items-center gap-2">
          <span class="w-2.5 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <span>طلبات الشراء الداخلية للموظفين</span>
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          متابعة احتياجات الأقسام والمستودعات، مراجعة واعتماد بنود الشراء، والتحويل لأوامر شراء
          رسمية
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleCreateRequisition"
          class="h-10 px-4 bg-[#e05e2b] hover:bg-[#d05322] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(224,94,43,0.3)] flex items-center justify-center gap-2 active:scale-95"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>إنشاء طلب شراء جديد</span>
        </button>
      </div>
    </div>

    <!-- شبكة الفلاتر التفاعلية -->
    <RequisitionsFilter
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:priority-filter="priorityFilter"
      v-model:department-filter="departmentFilter"
      v-model:from-date-filter="fromDateFilter"
      v-model:to-date-filter="toDateFilter"
      :departments="departmentsList"
    />

    <!-- جدول عرض طلبات الشراء -->
    <RequisitionsTable
      :requisitions="requisitionStore.requisitions"
      :pagination="requisitionStore.pagination || {}"
      :loading="requisitionStore.loading"
      @page-change="handlePageChange"
      @edit-requisition="handleEditRequisition"
      @delete-requisition="handleDeleteRequisition"
      @submit-requisition="handleSubmitRequisition"
      @approve-requisition="handleApproveRequisition"
      @reject-requisition="handleOpenRejectModal"
      @triage-requisition="handleOpenTriageModal"
      @row-clicked="handleRowClicked"
    />

    <!-- نافذة فرز وتوجيه بنود الطلب -->
    <TriageRequisitionModal
      v-model="isTriageModalOpen"
      :requisition="selectedRequisitionForTriage"
      @triage-completed="handleTriageCompleted"
      @close="handleCloseTriageModal"
    />

    <!-- نافذة تأكيد وإدخال سبب الرفض -->
    <RejectRequisitionModal
      v-model="isRejectModalOpen"
      :requisition="selectedRequisitionForAction"
      :is-submitting="requisitionStore.loading"
      :validation-error="rejectionError"
      @confirm="handleConfirmReject"
      @close="handleCloseRejectModal"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { usePurchaseRequisitionStore } from '@/modules/purchasing/stores/purchaseRequisitionStore'
import apiClient from '@/services/apiClient'

import RequisitionsFilter from './components/RequisitionsFilter.vue'
import RequisitionsTable from './components/RequisitionsTable.vue'
import RejectRequisitionModal from './components/RejectRequisitionModal.vue'
import TriageRequisitionModal from './components/TriageRequisitionModal.vue'

const router = useRouter()
const toast = useToast()
const requisitionStore = usePurchaseRequisitionStore()

// ==========================================
// 1. متغيرات البحث والتصفية
// ==========================================
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const departmentFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
const currentPage = ref(1)

const departmentsList = ref([])

// ==========================================
// 2. إدارة نافذة الفرز والتوجيه (Triage)
// ==========================================
const isTriageModalOpen = ref(false)
const selectedRequisitionForTriage = ref(null)

const handleOpenTriageModal = (item) => {
  selectedRequisitionForTriage.value = item
  isTriageModalOpen.value = true
}

const handleCloseTriageModal = () => {
  isTriageModalOpen.value = false
  selectedRequisitionForTriage.value = null
}

const handleTriageCompleted = async () => {
  await loadRequisitions(currentPage.value)
}

// ==========================================
// 3. إدارة نافذة الرفض
// ==========================================
const isRejectModalOpen = ref(false)
const selectedRequisitionForAction = ref(null)
const rejectionError = ref(null)

// ==========================================
// 4. دوال جلب البيانات
// ==========================================
const loadRequisitions = async (page = 1) => {
  currentPage.value = page
  const filters = {
    search: searchQuery.value,
    status: statusFilter.value,
    priority: priorityFilter.value,
    department_id: departmentFilter.value,
    date_from: fromDateFilter.value,
    date_to: toDateFilter.value,
  }

  await requisitionStore.fetchRequisitions(page, filters)
}

const loadDepartments = async () => {
  try {
    const response = await apiClient.get('/hr/departments')
    departmentsList.value = response.data.data || response.data || []
  } catch (error) {
    console.error('فشل في جلب قائمة الأقسام:', error)
  }
}

let debounceTimer = null
watch(
  [searchQuery, statusFilter, priorityFilter, departmentFilter, fromDateFilter, toDateFilter],
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      loadRequisitions(1)
    }, 350)
  },
  { deep: true },
)

const handlePageChange = (page) => {
  loadRequisitions(page)
}

// ==========================================
// 5. إجراءات التنقل وإدارة الطلبات
// ==========================================
const handleCreateRequisition = () => {
  router.push('/app/purchasing/requisitions/create')
}

const handleEditRequisition = (item) => {
  const status = item.status?.value || item.status
  if (status !== 'draft') {
    toast.warning('يمكن تعديل مسودات طلبات الشراء فقط.')
    return
  }
  router.push(`/app/purchasing/requisitions/${item.id}/edit`)
}

const handleRowClicked = (item) => {
  router.push(`/app/purchasing/requisitions/${item.id}`)
}

const handleSubmitRequisition = async (item) => {
  if (
    !confirm(
      `هل أنت متأكد من تقديم طلب الشراء رقم (${item.requisition_number || item.id}) للاعتماد؟`,
    )
  ) {
    return
  }

  try {
    await requisitionStore.submitRequisition(item.id)
    toast.success('تم تقديم طلب الشراء للاعتماد بنجاح.')
    await loadRequisitions(currentPage.value)
  } catch {
    toast.error(requisitionStore.error || 'فشلت عملية تقديم الطلب.')
  }
}

const handleApproveRequisition = async (item) => {
  if (!confirm(`هل أنت متأكد من اعتماد طلب الشراء رقم (${item.requisition_number || item.id})؟`)) {
    return
  }

  try {
    await requisitionStore.approveRequisition(item.id)
    toast.success('تم اعتماد طلب الشراء بنجاح.')
    await loadRequisitions(currentPage.value)
  } catch {
    toast.error(requisitionStore.error || 'فشلت عملية اعتماد الطلب.')
  }
}

const handleOpenRejectModal = (item) => {
  selectedRequisitionForAction.value = item
  rejectionError.value = null
  isRejectModalOpen.value = true
}

const handleCloseRejectModal = () => {
  isRejectModalOpen.value = false
  selectedRequisitionForAction.value = null
  rejectionError.value = null
}

const handleConfirmReject = async (reason) => {
  if (!selectedRequisitionForAction.value) return

  try {
    await requisitionStore.rejectRequisition(selectedRequisitionForAction.value.id, reason)
    toast.success('تم رفض طلب الشراء وتسجيل السبب بنجاح.')
    handleCloseRejectModal()
    await loadRequisitions(currentPage.value)
  } catch {
    rejectionError.value =
      requisitionStore.validationErrors?.rejection_reason?.[0] ||
      requisitionStore.error ||
      'فشلت عملية رفض الطلب.'
  }
}

const handleDeleteRequisition = async (item) => {
  if (
    !confirm(
      `هل أنت متأكد من حذف مسودة طلب الشراء رقم (${item.requisition_number || item.id}) نهائياً؟`,
    )
  ) {
    return
  }

  try {
    await requisitionStore.deleteRequisition(item.id)
    toast.success('تم حذف طلب الشراء بنجاح.')
    await loadRequisitions(currentPage.value)
  } catch {
    toast.error(requisitionStore.error || 'فشلت عملية حذف الطلب.')
  }
}

onMounted(async () => {
  await Promise.all([loadRequisitions(), loadDepartments()])
})
</script>
