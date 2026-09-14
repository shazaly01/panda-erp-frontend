<!--src/modules/purchasing/views/issues/PurchaseIssuesList.vue-->
<template>
  <div class="space-y-6 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة وإجراءات الإنشاء -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-black text-white flex items-center gap-2">
          <span class="w-2.5 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <span>أذونات صرف المواد والمستلزمات المخزنية</span>
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          إدارة ومتابعة أذونات الصرف المخزني الداخلي، صرف طلبات الاحتياج، وخصم الكميات من المستودعات
          دفترياً
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleCreateIssue"
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
          <span>إنشاء إذن صرف جديد</span>
        </button>
      </div>
    </div>

    <!-- شبكة الفلاتر التفاعلية -->
    <IssuesFilter
      v-model:search-query="searchQuery"
      v-model:warehouse-filter="warehouseFilter"
      v-model:status-filter="statusFilter"
      v-model:from-date-filter="fromDateFilter"
      v-model:to-date-filter="toDateFilter"
    />

    <!-- جدول عرض أذونات الصرف -->
    <IssuesTable
      :issues="issueStore.issues"
      :pagination="issueStore.pagination || {}"
      :loading="issueStore.loading"
      @page-change="handlePageChange"
      @edit-issue="handleEditIssue"
      @delete-issue="handleDeleteIssue"
      @confirm-issue="handleConfirmIssue"
      @row-clicked="handleRowClicked"
      @print-issue="handlePrintIssue"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { usePurchaseIssueStore } from '@/modules/purchasing/stores/purchaseIssueStore'

import IssuesFilter from './components/IssuesFilter.vue'
import IssuesTable from './components/IssuesTable.vue'

const router = useRouter()
const toast = useToast()
const issueStore = usePurchaseIssueStore()

// ==========================================
// 1. متغيرات الفلاتر والبحث
// ==========================================
const searchQuery = ref('')
const warehouseFilter = ref('')
const statusFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
const currentPage = ref(1)

// ==========================================
// 2. دوال جلب البيانات وتطبيق الفلاتر
// ==========================================
const loadIssues = async (page = 1) => {
  currentPage.value = page
  const filters = {
    search: searchQuery.value,
    warehouse_id: warehouseFilter.value,
    status: statusFilter.value,
    date_from: fromDateFilter.value,
    date_to: toDateFilter.value,
  }

  await issueStore.fetchIssues(page, filters)
}

let searchDebounceTimeout = null
watch(
  [searchQuery, warehouseFilter, statusFilter, fromDateFilter, toDateFilter],
  () => {
    clearTimeout(searchDebounceTimeout)
    searchDebounceTimeout = setTimeout(() => {
      loadIssues(1)
    }, 350)
  },
  { deep: true },
)

const handlePageChange = (page) => {
  loadIssues(page)
}

// ==========================================
// 3. إجراءات التنقل وإدارة أذونات الصرف
// ==========================================
const handleCreateIssue = () => {
  router.push('/app/purchasing/issues/create')
}

const handleEditIssue = (issue) => {
  if (issue.status?.value !== 'draft' && issue.status !== 'draft') {
    toast.warning('يمكن تعديل مسودات أذونات الصرف فقط.')
    return
  }
  router.push(`/app/purchasing/issues/${issue.id}/edit`)
}

const handleRowClicked = (issue) => {
  router.push(`/app/purchasing/issues/${issue.id}`)
}

const handlePrintIssue = (issue) => {
  window.open(`/app/purchasing/issues/${issue.id}/print`, '_blank')
}

const handleConfirmIssue = async (issue) => {
  if (
    !confirm(
      `هل أنت متأكد من تأكيد وترحيل إذن الصرف رقم (${issue.issue_number})؟ سيتم خصم الكميات من أرصدة المستودع فوراً.`,
    )
  ) {
    return
  }

  try {
    await issueStore.confirmIssue(issue.id)
    toast.success(`تم تأكيد إذن الصرف رقم ${issue.issue_number} وخصم الكميات بنجاح.`)
    await loadIssues(currentPage.value)
  } catch {
    toast.error(issueStore.error || 'فشلت عملية تأكيد وترحيل إذن الصرف.')
  }
}

const handleDeleteIssue = async (issue) => {
  if (!confirm(`هل أنت متأكد من حذف مسودة إذن الصرف رقم (${issue.issue_number}) نهائياً؟`)) {
    return
  }

  try {
    await issueStore.deleteIssue(issue.id)
    toast.success('تم حذف مسودة إذن الصرف بنجاح.')
    await loadIssues(currentPage.value)
  } catch {
    toast.error(issueStore.error || 'فشلت عملية حذف إذن الصرف.')
  }
}

onMounted(() => {
  loadIssues()
})
</script>
