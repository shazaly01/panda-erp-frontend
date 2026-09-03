<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة طلبات الدعم والمنح</h1>
        <p class="text-sm text-text-muted mt-1">
          متابعة وإدارة كافة خطابات الاحتياجات الموجهة للوزارات والمؤسسات والمنظمات
        </p>
      </div>

      <AppButton
        v-if="authStore.can('grant_request.create')"
        @click="router.push({ name: 'GrantRequestCreate' })"
      >
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          إنشاء طلب جديد
        </span>
      </AppButton>
    </div>

    <AppCard>
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div class="relative w-full md:w-96">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث برقم الخطاب، الجهة، أو الموضوع..."
            class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all sm:text-sm"
            @input="onSearch"
          />
        </div>

        <div class="text-sm text-text-muted">إجمالي الخطابات: {{ pagination.total || 0 }}</div>
      </div>

      <AppTable :headers="tableHeaders" :items="grantRequests" :is-loading="loading">
        <template #cell-request_number="{ item }">
          <span class="font-mono font-bold text-primary">{{ item.request_number }}</span>
        </template>

        <template #cell-request_date="{ item }">
          <span class="text-text-secondary text-sm">{{ item.request_date }}</span>
        </template>

        <template #cell-status="{ item }">
          <span
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            :class="getStatusBadgeClass(item.status)"
          >
            {{ getStatusLabel(item.status) }}
          </span>
        </template>

        <template #cell-items_count="{ item }">
          <div class="flex flex-col text-xs">
            <span class="font-medium text-text-primary">
              {{ item.total_items_count || (item.items ? item.items.length : 0) }} بنود
            </span>
            <span class="text-text-muted"> إجمالي الكمية: {{ item.total_quantity || 0 }} </span>
          </div>
        </template>

        <template #cell-total_cost="{ item }">
          <span v-if="item.total_estimated_cost" class="font-bold text-text-primary text-sm">
            {{ formatCurrency(item.total_estimated_cost) }}
          </span>
          <span v-else class="text-text-muted text-xs">غير محدد</span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-2 space-x-reverse">
            <!-- زر الطباعة -->
            <button
              v-if="authStore.can('grant_request.print')"
              @click.stop="router.push({ name: 'GrantRequestPrint', params: { id: item.id } })"
              class="p-1 font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
              title="طباعة الخطاب الرسمي"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>

            <!-- زر التعديل -->
            <button
              v-if="authStore.can('grant_request.update')"
              @click.stop="router.push({ name: 'GrantRequestEdit', params: { id: item.id } })"
              class="p-1 font-medium text-sky-500 hover:text-sky-400 transition-colors"
              title="تعديل الخطاب"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100 2h12a1 1 0 100-2H3z"
                />
              </svg>
            </button>

            <!-- زر الحذف -->
            <button
              v-if="authStore.can('grant_request.delete')"
              @click.stop="openDeleteDialog(item)"
              class="p-1 font-medium text-rose-500 hover:text-rose-400 transition-colors"
              title="حذف الطلب"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف طلب الدعم"
      :message="`هل أنت متأكد من رغبتك في حذف الخطاب رقم '${requestToDelete?.request_number}' الموجه إلى '${requestToDelete?.target_organization}'؟`"
      @confirmed="deleteSelectedRequest"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGrantRequestStore } from '@/stores/grantRequestStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const router = useRouter()
const toast = useToast()

const grantRequestStore = useGrantRequestStore()
const authStore = useAuthStore()
const { grantRequests, loading, pagination } = storeToRefs(grantRequestStore)

const searchQuery = ref('')
let searchTimeout = null

const tableHeaders = computed(() => {
  const headers = [
    { key: 'request_number', label: 'رقم الخطاب' },
    { key: 'target_organization', label: 'الجهة الموجه إليها' },
    { key: 'title', label: 'موضوع الطلب' },
    { key: 'request_date', label: 'التاريخ' },
    { key: 'status', label: 'الحالة' },
    { key: 'items_count', label: 'البنود والكمية' },
    { key: 'total_cost', label: 'التكلفة التقديرية' },
  ]

  if (
    authStore.can('grant_request.update') ||
    authStore.can('grant_request.delete') ||
    authStore.can('grant_request.print')
  ) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left' })
  }

  return headers
})

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة',
    submitted: 'تم التقديم',
    under_review: 'قيد المراجعة',
    partially_approved: 'موافقة جزئية',
    approved: 'معتمد',
    rejected: 'مرفوض',
    completed: 'مكتمل',
  }
  return map[status] || status
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    under_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    partially_approved: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    completed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const formatCurrency = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handlePageChange = (page = 1) => {
  grantRequestStore.fetchGrantRequests(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء تحميل قائمة الطلبات.')
  })
}

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

onMounted(() => {
  handlePageChange()
})

const isDeleteDialogOpen = ref(false)
const requestToDelete = ref(null)

const openDeleteDialog = (item) => {
  requestToDelete.value = item
  isDeleteDialogOpen.value = true
}

const deleteSelectedRequest = async () => {
  if (!requestToDelete.value) return

  try {
    await grantRequestStore.deleteGrantRequest(requestToDelete.value.id)
    toast.success(`تم حذف الطلب '${requestToDelete.value.request_number}' بنجاح.`)

    const currentPage = pagination.value.current_page || 1
    if (grantRequests.value.length === 1 && currentPage > 1) {
      await handlePageChange(currentPage - 1)
    } else {
      await handlePageChange(currentPage)
    }
  } catch (error) {
    const message =
      grantRequestStore.error || error.response?.data?.message || 'حدث خطأ أثناء عملية الحذف.'
    toast.error(message)
  } finally {
    isDeleteDialogOpen.value = false
    requestToDelete.value = null
  }
}
</script>
