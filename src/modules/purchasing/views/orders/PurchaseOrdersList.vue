<!--src/modules/purchasing/views/orders/PurchaseOrdersList.vue-->
<template>
  <div class="space-y-6 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة وإجراءات الإنشاء -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-black text-white flex items-center gap-2">
          <span class="w-2.5 h-6 bg-[#e05e2b] rounded-full inline-block"></span>
          <span>أوامر الشراء والتوريد</span>
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          إدارة أوامر الشراء الصادرة للموردين، متابعة حالات التوريد والفوترة، واعتماد أوامر الشراء
          الرسمية
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleCreateOrder"
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
          <span>إنشاء أمر شراء جديد</span>
        </button>
      </div>
    </div>

    <!-- شبكة الفلاتر التفاعلية -->
    <OrdersFilter
      v-model:search-query="searchQuery"
      v-model:supplier-filter="supplierFilter"
      v-model:status-filter="statusFilter"
      v-model:from-date-filter="fromDateFilter"
      v-model:to-date-filter="toDateFilter"
    />

    <!-- جدول عرض أوامر الشراء -->
    <OrdersTable
      :orders="orderStore.orders"
      :pagination="orderStore.pagination || {}"
      :loading="orderStore.loading"
      @page-change="handlePageChange"
      @edit-order="handleEditOrder"
      @delete-order="handleDeleteOrder"
      @confirm-order="handleConfirmOrder"
      @cancel-order="handleCancelOrder"
      @row-clicked="handleRowClicked"
      @print-order="handlePrintOrder"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { usePurchaseOrderStore } from '@/modules/purchasing/stores/purchaseOrderStore'

import OrdersFilter from './components/OrdersFilter.vue'
import OrdersTable from './components/OrdersTable.vue'

const router = useRouter()
const toast = useToast()
const orderStore = usePurchaseOrderStore()

// ==========================================
// 1. متغيرات الفلاتر والبحث
// ==========================================
const searchQuery = ref('')
const supplierFilter = ref('')
const statusFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
const currentPage = ref(1)

// ==========================================
// 2. دوال جلب البيانات وتطبيق الفلاتر
// ==========================================
const loadOrders = async (page = 1) => {
  currentPage.value = page
  const filters = {
    search: searchQuery.value,
    supplier_id: supplierFilter.value,
    status: statusFilter.value,
    date_from: fromDateFilter.value,
    date_to: toDateFilter.value,
  }

  await orderStore.fetchOrders(page, filters)
}

let searchDebounceTimeout = null
watch(
  [searchQuery, supplierFilter, statusFilter, fromDateFilter, toDateFilter],
  () => {
    clearTimeout(searchDebounceTimeout)
    searchDebounceTimeout = setTimeout(() => {
      loadOrders(1)
    }, 350)
  },
  { deep: true },
)

const handlePageChange = (page) => {
  loadOrders(page)
}

// ==========================================
// 3. إجراءات التنقل وإدارة أوامر الشراء
// ==========================================
const handleCreateOrder = () => {
  router.push('/app/purchasing/orders/create')
}

const handleEditOrder = (order) => {
  const status = order.status?.value || order.status
  if (status !== 'draft') {
    toast.warning('يمكن تعديل مسودات أوامر الشراء فقط.')
    return
  }
  router.push(`/app/purchasing/orders/${order.id}/edit`)
}

const handleRowClicked = (order) => {
  router.push(`/app/purchasing/orders/${order.id}`)
}

const handlePrintOrder = (order) => {
  window.open(`/app/purchasing/orders/${order.id}/print`, '_blank')
}

const handleConfirmOrder = async (order) => {
  if (
    !confirm(
      `هل أنت متأكد من اعتماد وتأكيد أمر الشراء رقم (${order.order_number || '#' + order.id})؟ سيتحول الأمر إلى مؤكد وجاهز للاستلام والفوترة.`,
    )
  ) {
    return
  }

  try {
    await orderStore.confirmOrder(order.id)
    toast.success(`تم اعتماد وتأكيد أمر الشراء رقم ${order.order_number || '#' + order.id} بنجاح.`)
    await loadOrders(currentPage.value)
  } catch {
    toast.error(orderStore.error || 'فشلت عملية اعتماد أمر الشراء.')
  }
}

const handleCancelOrder = async (order) => {
  if (!confirm(`هل أنت متأكد من إلغاء أمر الشراء رقم (${order.order_number || '#' + order.id})؟`)) {
    return
  }

  try {
    await orderStore.cancelOrder(order.id)
    toast.success(`تم إلغاء أمر الشراء رقم ${order.order_number || '#' + order.id} بنجاح.`)
    await loadOrders(currentPage.value)
  } catch {
    toast.error(orderStore.error || 'فشلت عملية إلغاء أمر الشراء.')
  }
}

const handleDeleteOrder = async (order) => {
  if (
    !confirm(
      `هل أنت متأكد من حذف مسودة أمر الشراء رقم (${order.order_number || '#' + order.id}) نهائياً؟`,
    )
  ) {
    return
  }

  try {
    await orderStore.deleteOrder(order.id)
    toast.success('تم حذف مسودة أمر الشراء بنجاح.')
    await loadOrders(currentPage.value)
  } catch {
    toast.error(orderStore.error || 'فشلت عملية حذف أمر الشراء.')
  }
}

onMounted(() => {
  loadOrders()
})
</script>
