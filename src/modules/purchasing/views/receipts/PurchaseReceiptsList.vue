<!--src/modules/purchasing/views/receipts/PurchaseReceiptsList.vue-->
<template>
  <div class="space-y-6 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة وإجراءات الإنشاء -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-black text-white flex items-center gap-2">
          <span class="w-2.5 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <span>سندات استلام المخزون والواردات</span>
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          إدارة أذونات استلام البضائع، فحص الكميات الموردة، وإثبات حركات الإدخال المخزني في
          المستودعات
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleCreateReceipt"
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
          <span>إنشاء سند استلام جديد</span>
        </button>
      </div>
    </div>

    <!-- شبكة الفلاتر التفاعلية -->
    <ReceiptsFilter
      v-model:search-query="searchQuery"
      v-model:warehouse-filter="warehouseFilter"
      v-model:status-filter="statusFilter"
      v-model:supplier-filter="supplierFilter"
      v-model:from-date-filter="fromDateFilter"
      v-model:to-date-filter="toDateFilter"
    />

    <!-- جدول عرض سندات الاستلام -->
    <ReceiptsTable
      :receipts="receiptStore.receipts"
      :pagination="receiptStore.pagination || {}"
      :loading="receiptStore.loading"
      @page-change="handlePageChange"
      @edit-receipt="handleEditReceipt"
      @delete-receipt="handleDeleteReceipt"
      @receive-receipt="handleReceiveReceipt"
      @row-clicked="handleRowClicked"
      @print-receipt="handlePrintReceipt"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { usePurchaseReceiptStore } from '@/modules/purchasing/stores/purchaseReceiptStore'

import ReceiptsFilter from './components/ReceiptsFilter.vue'
import ReceiptsTable from './components/ReceiptsTable.vue'

const router = useRouter()
const toast = useToast()
const receiptStore = usePurchaseReceiptStore()

// ==========================================
// 1. متغيرات الفلاتر والبحث
// ==========================================
const searchQuery = ref('')
const warehouseFilter = ref('')
const statusFilter = ref('')
const supplierFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
const currentPage = ref(1)

// ==========================================
// 2. دوال جلب البيانات وتطبيق الفلاتر
// ==========================================
const loadReceipts = async (page = 1) => {
  currentPage.value = page
  const filters = {
    search: searchQuery.value,
    warehouse_id: warehouseFilter.value,
    status: statusFilter.value,
    supplier_id: supplierFilter.value,
    date_from: fromDateFilter.value,
    date_to: toDateFilter.value,
  }

  await receiptStore.fetchReceipts(page, filters)
}

let searchDebounceTimeout = null
watch(
  [searchQuery, warehouseFilter, statusFilter, supplierFilter, fromDateFilter, toDateFilter],
  () => {
    clearTimeout(searchDebounceTimeout)
    searchDebounceTimeout = setTimeout(() => {
      loadReceipts(1)
    }, 350)
  },
  { deep: true },
)

const handlePageChange = (page) => {
  loadReceipts(page)
}

// ==========================================
// 3. إجراءات التنقل وإدارة السندات
// ==========================================
const handleCreateReceipt = () => {
  router.push('/app/purchasing/receipts/create')
}

const handleEditReceipt = (receipt) => {
  const status = receipt.status?.value || receipt.status
  if (status !== 'draft') {
    toast.warning('يمكن تعديل مسودات سندات الاستلام فقط.')
    return
  }
  router.push(`/app/purchasing/receipts/${receipt.id}/edit`)
}

const handleRowClicked = (receipt) => {
  router.push(`/app/purchasing/receipts/${receipt.id}`)
}

const handlePrintReceipt = (receipt) => {
  window.open(`/app/purchasing/receipts/${receipt.id}/print`, '_blank')
}

const handleReceiveReceipt = async (receipt) => {
  if (
    !confirm(
      `هل أنت متأكد من تأكيد استلام البضائع للسند رقم (${receipt.receipt_number || receipt.id})؟ سيتم إثبات الأثر المخزني وإدخال الكميات المقبولة إلى رصيد المستودع فوراً.`,
    )
  ) {
    return
  }

  try {
    await receiptStore.receiveReceipt(receipt.id)
    toast.success(
      `تم تأكيد استلام السند رقم ${receipt.receipt_number || receipt.id} وإدخال البضاعة للمخزن بنجاح.`,
    )
    await loadReceipts(currentPage.value)
  } catch {
    toast.error(receiptStore.error || 'فشلت عملية تأكيد الاستلام وترحيل المخزون.')
  }
}

const handleDeleteReceipt = async (receipt) => {
  if (
    !confirm(
      `هل أنت متأكد من حذف مسودة سند الاستلام رقم (${receipt.receipt_number || receipt.id}) نهائياً؟`,
    )
  ) {
    return
  }

  try {
    await receiptStore.deleteReceipt(receipt.id)
    toast.success('تم حذف مسودة سند الاستلام بنجاح.')
    await loadReceipts(currentPage.value)
  } catch {
    toast.error(receiptStore.error || 'فشلت عملية حذف سند الاستلام.')
  }
}

onMounted(() => {
  loadReceipts()
})
</script>
