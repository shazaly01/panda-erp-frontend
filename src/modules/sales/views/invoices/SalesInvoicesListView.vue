<!-- src/modules/sales/views/invoices/SalesInvoicesListView.vue -->
<template>
  <div class="space-y-6">
    <!-- ترويسة الصفحة وأزرار الإنشاء -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">إدارة فواتير المبيعات</h1>
        <p class="text-xs text-text-secondary mt-1">
          استعراض، تتبع، وفلترة حركة المبيعات ونقاط البيع ومراقبة تأثيرها اللحظي على الأرصدة.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <AppButton type="button" variant="secondary" @click="goToStandardCreatePage">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>فاتورة مبيعات قياسية</span>
          </span>
        </AppButton>

        <AppButton type="button" @click="goToPosCreatePage">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>إضافة فاتورة جديدة (POS)</span>
          </span>
        </AppButton>
      </div>
    </div>

    <!-- شريط الفلاتر التفاعلية -->
    <SalesInvoiceFilters
      v-model:searchQuery="searchQuery"
      v-model:postingStatusFilter="postingStatusFilter"
      v-model:paymentStatusFilter="paymentStatusFilter"
      v-model:channelFilter="channelFilter"
      v-model:warehouseFilter="warehouseFilter"
      v-model:partnerFilter="partnerFilter"
      v-model:fromDateFilter="fromDateFilter"
      v-model:toDateFilter="toDateFilter"
      @update:searchQuery="onSearch"
      @update:postingStatusFilter="handlePageChange(1)"
      @update:paymentStatusFilter="handlePageChange(1)"
      @update:channelFilter="handlePageChange(1)"
      @update:warehouseFilter="handlePageChange(1)"
      @update:partnerFilter="handlePageChange(1)"
      @update:fromDateFilter="handlePageChange(1)"
      @update:toDateFilter="handlePageChange(1)"
    />

    <!-- جدول عرض الفواتير -->
    <SalesInvoiceTable
      :invoices="invoices"
      :pagination="pagination || {}"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-invoice="goToEditPage"
      @delete-invoice="openDeleteDialog"
      @row-clicked="goToEditPage"
      @print-invoice="openPrintPage"
      @return-invoice="goToReturnPage"
      @preview-invoice="openPreviewModal"
      @send-whatsapp="sendInvoiceToWhatsApp"
      @post-invoice="handlePostInvoice"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء وحذف مستند المبيعات"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف وإلغاء الفاتورة رقم '${invoiceToDelete?.invoice_number || '#' + invoiceToDelete?.id}'؟ سيترتب على هذا الإجراء تراجع فوري وعكس الأثر المالي في حساب العميل وإعادة الكميات للمستودع.`"
      @confirmed="deleteSelectedInvoice"
    />

    <!-- نافذة المعاينة السريعة للقطات الشاشة -->
    <SalesInvoicePreviewModal v-model="isPreviewModalOpen" :sale="invoiceToPreview" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesInvoiceStore } from '@/modules/sales/stores/salesInvoiceStore'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import SalesInvoiceFilters from './components/SalesInvoiceFilters.vue'
import SalesInvoiceTable from './components/SalesInvoiceTable.vue'
import SalesInvoicePreviewModal from './components/SalesInvoicePreviewModal.vue'

const router = useRouter()
const toast = useToast()

const invoiceStore = useSalesInvoiceStore()
const warehouseStore = useWarehouseStore()
const customerStore = useCustomerStore()

const { invoices, loading, pagination } = storeToRefs(invoiceStore)

const searchQuery = ref('')
const postingStatusFilter = ref('')
const paymentStatusFilter = ref('')
const channelFilter = ref('')
const warehouseFilter = ref('')
const partnerFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
let searchTimeout = null

// قناة البث للمزامنة اللحظية مع شاشة الكاشير
let posChannel = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    posting_status: postingStatusFilter.value,
    payment_status: paymentStatusFilter.value,
    channel: channelFilter.value,
    warehouse_id: warehouseFilter.value,
    partner_id: partnerFilter.value,
    date_from: fromDateFilter.value,
    date_to: toDateFilter.value,
  }

  return invoiceStore.fetchInvoices(page, filters).catch(() => {
    toast.error('فشل النظام في جلب مستندات المبيعات المحدثة من الخادم.')
  })
}

// تحديث الجدول عند إعادة تركيز المستخدم على هذه النافذة بعد إغلاق الـ POS
const onWindowFocus = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

onMounted(async () => {
  handlePageChange(1)

  await Promise.all([
    warehouseStore.warehouses.length === 0
      ? warehouseStore.fetchWarehouses({ per_page: 1000 })
      : Promise.resolve(),
    customerStore
      .fetchCustomersSelector()
      .catch(() => customerStore.fetchCustomers(1, { per_page: 500 })),
  ])

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    posChannel = new BroadcastChannel('erp_pos_sales_channel')
    posChannel.onmessage = (event) => {
      if (event.data?.type === 'SALE_SAVED') {
        handlePageChange(1)
      }
    }
  }

  window.addEventListener('focus', onWindowFocus)
})

onBeforeUnmount(() => {
  if (posChannel) {
    posChannel.close()
  }
  window.removeEventListener('focus', onWindowFocus)
})

// فتح شاشة الكاشير في نافذة مستقلة خارج الإطار الحالي
const goToPosCreatePage = () => {
  window.open('/app/sales/pos', '_blank')
}

const goToStandardCreatePage = () => {
  router.push('/app/sales/invoices/create')
}

const goToEditPage = (invoice) => {
  router.push(`/app/sales/invoices/${invoice.id}/edit`)
}

// التوجيه الذكي لإصدار مرتجع من الفاتورة
const goToReturnPage = (invoice) => {
  router.push(`/app/sales/returns/create?invoice_id=${invoice.id}`)
}

const openPrintPage = (invoice) => {
  window.open(`/print/sales/invoices/${invoice.id}`, '_blank')
}

// فتح نافذة المعاينة السريعة مع جلب تفاصيل بنود الفاتورة
const isPreviewModalOpen = ref(false)
const invoiceToPreview = ref(null)

const openPreviewModal = async (invoice) => {
  try {
    const fullInvoice = await invoiceStore.fetchInvoice(invoice.id)
    invoiceToPreview.value = fullInvoice || invoice
    isPreviewModalOpen.value = true
  } catch {
    invoiceToPreview.value = invoice
    isPreviewModalOpen.value = true
  }
}

// اعتماد وترحيل فاتورة مسودة مباشرة
const handlePostInvoice = async (invoice) => {
  try {
    await invoiceStore.postInvoice(invoice.id)
    toast.success(`تم اعتماد وترحيل الفاتورة ${invoice.invoice_number || '#' + invoice.id} بنجاح.`)
    await handlePageChange(pagination.value?.current_page || 1)
  } catch {
    toast.error(invoiceStore.error || 'فشلت عملية ترحيل الفاتورة.')
  }
}

/**
 * فحص وتنسيق هاتف العميل لحظياً بصيغة الواتساب الدولية المعتمدة
 */
const parseSudanPhoneForWhatsApp = (rawPhone) => {
  if (!rawPhone) return { valid: false, reason: 'empty' }

  let clean = rawPhone.toString().replace(/[^0-9]/g, '')
  if (!clean) return { valid: false, reason: 'empty' }

  if (clean.startsWith('00249')) {
    clean = clean.substring(2)
  }

  if ((clean.startsWith('09') || clean.startsWith('01')) && clean.length === 10) {
    return { valid: true, phone: '249' + clean.substring(1) }
  }

  if ((clean.startsWith('9') || clean.startsWith('1')) && clean.length === 9) {
    return { valid: true, phone: '249' + clean }
  }

  if (
    clean.startsWith('249') &&
    clean.length === 12 &&
    (clean.startsWith('2499') || clean.startsWith('2491'))
  ) {
    return { valid: true, phone: clean }
  }

  if (clean.length >= 10 && clean.length <= 15 && !clean.startsWith('0')) {
    return { valid: true, phone: clean }
  }

  return { valid: false, reason: 'invalid_format' }
}

/**
 * إرسال الفاتورة عبر واتساب مباشرة باستخدام الرابط العام public_url
 */
const sendInvoiceToWhatsApp = (invoice) => {
  const shareUrl = invoice.public_url || invoice.pdf_url
  if (!shareUrl) {
    toast.error('عفواً، رابط الفاتورة العام غير متوفر.')
    return
  }

  const rawPhone = invoice.partner?.phone

  if (!rawPhone || !rawPhone.toString().trim()) {
    toast.warning('عفواً، لا يوجد رقم هاتف مسجل لهذا العميل لإرسال الفاتورة عبر واتساب.')
    return
  }

  const phoneResult = parseSudanPhoneForWhatsApp(rawPhone)

  if (!phoneResult.valid) {
    toast.error(
      `رقم الهاتف المسجل للعميل (${rawPhone}) غير صحيح، يجب أن يتكون من 10 أرقام (مثال: 0912345678 أو 0123456789).`,
    )
    return
  }

  const customerName = invoice.partner?.name || invoice.customer_name_text || 'عميلنا العزيز'
  const invoiceNumber = invoice.invoice_number || `#${invoice.id}`
  const message = `مرحباً ${customerName}،\nشكراً لتعاملكم معنا. تفضل رابط استعراض وتحميل الفاتورة رقم (${invoiceNumber}):\n${shareUrl}`
  const encodedText = encodeURIComponent(message)

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const targetUrl = isMobile
    ? `whatsapp://send?phone=${phoneResult.phone}&text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneResult.phone}&text=${encodedText}`

  window.open(targetUrl, '_blank')
}

const isDeleteDialogOpen = ref(false)
const invoiceToDelete = ref(null)

const openDeleteDialog = (invoice) => {
  invoiceToDelete.value = invoice
  isDeleteDialogOpen.value = true
}

const deleteSelectedInvoice = async () => {
  if (!invoiceToDelete.value) return

  try {
    await invoiceStore.deleteInvoice(invoiceToDelete.value.id)
    toast.success(
      `تم حذف وإلغاء مستند المبيعات رقم '${invoiceToDelete.value.invoice_number || '#' + invoiceToDelete.value.id}' وعكس أثره بنجاح.`,
    )

    if (invoices.value.length === 1 && pagination.value?.current_page > 1) {
      await handlePageChange(pagination.value.current_page - 1)
    } else {
      await handlePageChange(pagination.value?.current_page || 1)
    }
  } catch {
    const errorMessage = invoiceStore.error || 'فشلت عملية إلغاء وحذف مستند المبيعات من النظام.'
    toast.error(errorMessage)
  } finally {
    isDeleteDialogOpen.value = false
    invoiceToDelete.value = null
  }
}
</script>
