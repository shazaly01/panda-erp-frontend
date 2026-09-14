<!--src/modules/purchasing/views/bills/PurchaseBillsList.vue-->
<template>
  <div class="space-y-6 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة وإجراءات الإنشاء -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-black text-white flex items-center gap-2">
          <span class="w-2.5 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <span>فواتير المشتريات والذمم الدائنة</span>
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          إدارة فواتير الشراء المباشرة والآجلة، ترحيل القيود الدفترية، وإصدار سندات الصرف المالي
          الرسمية
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleCreateBill"
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
          <span>إنشاء فاتورة شراء جديدة</span>
        </button>
      </div>
    </div>

    <!-- شبكة الفلاتر التفاعلية -->
    <BillsFilter
      v-model:search-query="searchQuery"
      v-model:warehouse-filter="warehouseFilter"
      v-model:status-filter="statusFilter"
      v-model:supplier-filter="supplierFilter"
      v-model:from-date-filter="fromDateFilter"
      v-model:to-date-filter="toDateFilter"
    />

    <!-- جدول عرض الفواتير -->
    <BillsTable
      :bills="billStore.bills"
      :pagination="billStore.pagination || {}"
      :loading="billStore.loading"
      @page-change="handlePageChange"
      @edit-bill="handleEditBill"
      @delete-bill="handleDeleteBill"
      @post-bill="handlePostBill"
      @pay-bill="handleOpenPayModal"
      @row-clicked="handleRowClicked"
      @print-bill="handlePrintBill"
    />

    <!-- نافذة سند الصرف المالي الموحد للتسوية -->
    <VoucherModal
      v-if="isVoucherModalOpen"
      v-model="isVoucherModalOpen"
      type="payment"
      :prefill-data="voucherPrefillData"
      @saved="handleVoucherSaved"
      @close="handleCloseVoucherModal"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { usePurchaseBillStore } from '@/modules/purchasing/stores/purchaseBillStore'

import BillsFilter from './components/BillsFilter.vue'
import BillsTable from './components/BillsTable.vue'
import VoucherModal from '@/modules/accounting/views/vouchers/components/VoucherModal.vue'

const router = useRouter()
const toast = useToast()
const billStore = usePurchaseBillStore()

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
// 2. حالة نافذة سند الصرف وبيانات التسوية
// ==========================================
const isVoucherModalOpen = ref(false)
const voucherPrefillData = ref(null)
const selectedBillForPayment = ref(null)

// ==========================================
// 3. دوال جلب البيانات وتطبيق الفلاتر
// ==========================================
const loadBills = async (page = 1) => {
  currentPage.value = page
  const filters = {
    search: searchQuery.value,
    warehouse_id: warehouseFilter.value,
    status: statusFilter.value,
    supplier_id: supplierFilter.value,
    date_from: fromDateFilter.value,
    date_to: toDateFilter.value,
  }

  await billStore.fetchBills(page, filters)
}

let searchDebounceTimeout = null
watch(
  [searchQuery, warehouseFilter, statusFilter, supplierFilter, fromDateFilter, toDateFilter],
  () => {
    clearTimeout(searchDebounceTimeout)
    searchDebounceTimeout = setTimeout(() => {
      loadBills(1)
    }, 350)
  },
  { deep: true },
)

const handlePageChange = (page) => {
  loadBills(page)
}

// ==========================================
// 4. إجراءات التنقل وإدارة الفواتير
// ==========================================
const handleCreateBill = () => {
  router.push('/app/purchasing/bills/create')
}

const handleEditBill = (bill) => {
  if (bill.status?.value !== 'draft' && bill.status !== 'draft') {
    toast.warning('يمكن تعديل مسودات الفواتير فقط.')
    return
  }
  router.push(`/app/purchasing/bills/${bill.id}/edit`)
}

const handleRowClicked = (bill) => {
  router.push(`/app/purchasing/bills/${bill.id}`)
}

const handlePrintBill = (bill) => {
  window.open(`/app/purchasing/bills/${bill.id}/print`, '_blank')
}

const handlePostBill = async (bill) => {
  if (
    !confirm(
      `هل أنت متأكد من ترحيل فاتورة الشراء رقم (${bill.bill_number})؟ سيتم توليد القيد الدفتري وإثبات حركة المخزون فوراً.`,
    )
  ) {
    return
  }

  try {
    await billStore.postBill(bill.id)
    toast.success(`تم ترحيل الفاتورة رقم ${bill.bill_number} بنجاح.`)
    await loadBills(currentPage.value)
  } catch {
    toast.error(billStore.error || 'فشلت عملية ترحيل الفاتورة.')
  }
}

const handleDeleteBill = async (bill) => {
  if (!confirm(`هل أنت متأكد من حذف مسودة فاتورة الشراء رقم (${bill.bill_number}) نهائياً؟`)) {
    return
  }

  try {
    await billStore.deleteBill(bill.id)
    toast.success('تم حذف مسودة الفاتورة بنجاح.')
    await loadBills(currentPage.value)
  } catch {
    toast.error(billStore.error || 'فشلت عملية حذف الفاتورة.')
  }
}

// ==========================================
// 5. ربط سداد الفاتورة بسند الصرف الموحد
// ==========================================
const handleOpenPayModal = (bill) => {
  selectedBillForPayment.value = bill
  const remaining = parseFloat(bill.remaining_amount || 0)

  if (remaining <= 0) {
    toast.info('هذه الفاتورة مسددة بالكامل ولا يوجد متبقي للسداد.')
    return
  }

  // استخراج معرّف الحساب المالي للمورد مع التغطية الشاملة للبدائل
  const supplierAccountId =
    bill.supplier?.account_id ||
    bill.supplier?.payable_account_id ||
    bill.supplier?.account?.id ||
    null

  if (!supplierAccountId) {
    toast.error('المورد غير مرتبط بحساب مراقبة مالي في شجرة الحسابات. يرجى مراجعة بيانات المورد.')
    return
  }

  voucherPrefillData.value = {
    payee_name: bill.supplier?.name || '',
    description: `سداد فاتورة مشتريات رقم: ${bill.bill_number}`,
    amount: remaining,
    currency_id: bill.currency_id || bill.currency?.id || '',
    reference_label: `فاتورة: ${bill.bill_number}`,
    details: [
      {
        account_id: supplierAccountId,
        account_code: bill.supplier?.account?.code || '',
        account_name: bill.supplier?.account?.name || bill.supplier?.name || '',
        amount: remaining,
        description: `دفعة سداد على فاتورة رقم: ${bill.bill_number}`,
        party_type: 'App\\Modules\\Core\\Models\\Partner',
        party_id: bill.supplier_id ? Number(bill.supplier_id) : null,
        reference_type: 'App\\Modules\\Purchasing\\Models\\PurchaseBill',
        reference_id: Number(bill.id),
        reference_label: `فاتورة #${bill.bill_number}`,
      },
    ],
  }

  isVoucherModalOpen.value = true
}

const handleVoucherSaved = async () => {
  toast.success('تم تسجيل سند الصرف وتحديث مبالغ الفاتورة بنجاح.')
  isVoucherModalOpen.value = false
  voucherPrefillData.value = null
  selectedBillForPayment.value = null
  await loadBills(currentPage.value)
}

const handleCloseVoucherModal = () => {
  isVoucherModalOpen.value = false
  voucherPrefillData.value = null
  selectedBillForPayment.value = null
}

onMounted(() => {
  loadBills()
})
</script>
