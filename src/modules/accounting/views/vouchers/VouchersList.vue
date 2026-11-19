<!--src/modules/accounting/views/vouchers/VouchersList.vue-->
<template>
  <div class="space-y-6">
    <!-- الشريط العلوي والعنوان -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">{{ pageTitle }}</h1>
        <p class="text-sm text-text-muted mt-1">
          {{ pageDescription }}
        </p>
      </div>
      <AppButton v-if="authStore.can(createPermission)" @click="openCreateModal">
        إضافة {{ isReceipt ? 'سند قبض' : 'سند صرف' }} جديد
      </AppButton>
    </div>

    <!-- فلاتر البحث والحالة والتواريخ مع زر طباعة التقرير (تم تمرير نوع السند) -->
    <VouchersFilter
      :type="type"
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      v-model:dateFrom="dateFrom"
      v-model:dateTo="dateTo"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
      @update:dateFrom="handlePageChange(1)"
      @update:dateTo="handlePageChange(1)"
      @print-expenses="openExpensesReport"
    />

    <!-- جدول عرض السندات مع استقبال الأحداث -->
    <VouchersTable
      :vouchers="vouchers"
      :pagination="pagination"
      :loading="loading"
      :type="type"
      @page-change="handlePageChange"
      @view="openViewModal"
      @edit="openEditModal"
      @approve="openApproveDialog"
      @post="openPostDialog"
      @unpost="openUnpostDialog"
      @delete="openDeleteDialog"
      @print="openPrintModal"
    />

    <!-- نافذة الإنشاء والتعديل المنبثقة -->
    <VoucherModal
      v-if="isFormModalOpen"
      v-model="isFormModalOpen"
      :voucher-id="voucherToEditId"
      :type="type"
      @saved="handleVoucherSaved"
    />

    <!-- نافذة العرض السريع لتفاصيل السند -->
    <VoucherViewModal
      v-if="isViewModalOpen"
      v-model="isViewModalOpen"
      :voucher-id="selectedVoucher?.id"
    />

    <!-- نوافذ التأكيد -->
    <AppConfirmDialog
      v-model="isApproveDialogOpen"
      title="تأكيد اعتماد السند"
      :message="`هل أنت متأكد من رغبتك في اعتماد السند رقم ${voucherToApprove?.number}؟ سيصبح السند جاهزاً للترحيل.`"
      confirm-text="اعتماد"
      confirm-variant="warning"
      @confirmed="approveSelectedVoucher"
    />

    <AppConfirmDialog
      v-model="isPostDialogOpen"
      title="تأكيد ترحيل السند"
      :message="`هل أنت متأكد من رغبتك في ترحيل السند رقم ${voucherToPost?.number}؟ سيتم إنشاء قيد يومية تلقائياً وتحديث أرصدة الحسابات.`"
      confirm-text="ترحيل واعتماد"
      confirm-variant="primary"
      @confirmed="postSelectedVoucher"
    />

    <AppConfirmDialog
      v-model="isUnpostDialogOpen"
      title="تأكيد إلغاء الترحيل وإعادة الفتح للتعديل"
      :message="`هل أنت متأكد من رغبتك في إلغاء ترحيل السند رقم ${voucherToUnpost?.number}؟ سيتم حذف القيد المحاسبي المرتبط نهائياً وإعادة السند إلى مسودة.`"
      confirm-text="إلغاء الترحيل"
      confirm-variant="warning"
      @confirmed="unpostSelectedVoucher"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      :title="
        voucherToDelete?.status === 'posted' ? 'تأكيد حذف السند المُرحّل' : 'تأكيد حذف مسودة السند'
      "
      :message="
        voucherToDelete?.status === 'posted'
          ? `هل أنت متأكد من رغبتك في حذف السند المُرحّل رقم ${voucherToDelete?.number} نهائياً؟ سيتم حذف القيد المحاسبي المرتبط به وعكس أي تسويات مالية مرتبطة.`
          : `هل أنت متأكد من رغبتك في حذف مسودة السند رقم ${voucherToDelete?.number} بشكل نهائي؟`
      "
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="deleteSelectedVoucher"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useVoucherStore } from '@/modules/accounting/stores/voucherStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import VouchersFilter from './VouchersFilter.vue'
import VouchersTable from './VouchersTable.vue'
import VoucherViewModal from './components/VoucherViewModal.vue'
import VoucherModal from './components/VoucherModal.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const authStore = useAuthStore()
const voucherStore = useVoucherStore()
const toast = useToast()

const { vouchers, pagination, loading } = storeToRefs(voucherStore)

const isReceipt = computed(() => props.type === 'receipt')

const pageTitle = computed(() =>
  isReceipt.value ? 'سندات القبض (Receipts)' : 'سندات الصرف (Payments)',
)
const pageDescription = computed(() =>
  isReceipt.value
    ? 'إدارة المبالغ المحصلة والمقبوضات النقدية والبنكية'
    : 'إدارة المبالغ المدفوعة والمصروفات النقدية والبنكية',
)
const createPermission = computed(() => (isReceipt.value ? 'receipt.create' : 'payment.create'))
const updatePermission = computed(() => (isReceipt.value ? 'receipt.update' : 'payment.update'))
const deletePermission = computed(() => (isReceipt.value ? 'receipt.delete' : 'payment.delete'))

// الفلاتر والبحث والتواريخ
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    status: statusFilter.value,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    type: props.type,
  }

  try {
    await voucherStore.fetchVouchers(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة السندات.')
  }
}

watch(
  () => props.type,
  () => {
    searchQuery.value = ''
    statusFilter.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    handlePageChange(1)
  },
)

onMounted(() => {
  handlePageChange()
})

// فتح تقرير المصروفات / الإيرادات في نافذة مستقلة مع تمرير نوع السند الحالي
const openExpensesReport = () => {
  const query = {
    type: props.type,
  }
  if (dateFrom.value) query.date_from = dateFrom.value
  if (dateTo.value) query.date_to = dateTo.value
  if (statusFilter.value) query.status = statusFilter.value
  if (searchQuery.value) query.search = searchQuery.value

  const routeUrl = router.resolve({
    name: 'ExpensesReportPrint',
    query,
  }).href

  window.open(routeUrl, '_blank')
}

// فتح طباعة السند المنفرد
const openPrintModal = (voucher) => {
  if (!voucher?.id) return
  const routeUrl = router.resolve({
    name: 'VoucherPrint',
    params: { id: voucher.id },
  }).href
  window.open(routeUrl, '_blank')
}

// إدارة النافذة المنبثقة للإنشاء والتعديل
const isFormModalOpen = ref(false)
const voucherToEditId = ref(null)

const openCreateModal = () => {
  voucherToEditId.value = null
  isFormModalOpen.value = true
}

const openEditModal = (voucher) => {
  if (voucher.status === 'void' || !authStore.can(updatePermission.value)) {
    openViewModal(voucher)
    return
  }
  voucherToEditId.value = voucher.id
  isFormModalOpen.value = true
}

const handleVoucherSaved = async () => {
  await handlePageChange(pagination.value?.current_page || 1)
}

// نافذة العرض السريع
const isViewModalOpen = ref(false)
const selectedVoucher = ref(null)

const openViewModal = (voucher) => {
  selectedVoucher.value = voucher
  isViewModalOpen.value = true
}

// اعتماد السند
const isApproveDialogOpen = ref(false)
const voucherToApprove = ref(null)

const openApproveDialog = (voucher) => {
  voucherToApprove.value = voucher
  isApproveDialogOpen.value = true
}

const approveSelectedVoucher = async () => {
  if (voucherToApprove.value) {
    try {
      await voucherStore.approveVoucherAction(voucherToApprove.value.id)
      toast.success('تم اعتماد السند بنجاح وهو الآن بانتظار الترحيل.')
      await handlePageChange(pagination.value?.current_page || 1)
    } catch (error) {
      toast.error(voucherStore.error || 'حدث خطأ أثناء اعتماد السند.')
    } finally {
      isApproveDialogOpen.value = false
      voucherToApprove.value = null
    }
  }
}

// ترحيل السند
const isPostDialogOpen = ref(false)
const voucherToPost = ref(null)

const openPostDialog = (voucher) => {
  voucherToPost.value = voucher
  isPostDialogOpen.value = true
}

const postSelectedVoucher = async () => {
  if (voucherToPost.value) {
    try {
      await voucherStore.postVoucherAction(voucherToPost.value.id)
      toast.success('تم ترحيل السند وإنشاء القيد المحاسبي بنجاح.')
      await handlePageChange(pagination.value?.current_page || 1)
    } catch (error) {
      toast.error(voucherStore.error || 'حدث خطأ أثناء ترحيل السند.')
    } finally {
      isPostDialogOpen.value = false
      voucherToPost.value = null
    }
  }
}

// إلغاء ترحيل السند وإعادته لمسودة
const isUnpostDialogOpen = ref(false)
const voucherToUnpost = ref(null)

const openUnpostDialog = (voucher) => {
  if (!authStore.can(updatePermission.value)) {
    toast.warning('لا تملك صلاحية إلغاء ترحيل هذا السند.')
    return
  }
  voucherToUnpost.value = voucher
  isUnpostDialogOpen.value = true
}

const unpostSelectedVoucher = async () => {
  if (voucherToUnpost.value) {
    try {
      await voucherStore.unpostVoucherAction(voucherToUnpost.value.id)
      toast.success('تم إلغاء ترحيل السند وحذف القيد المحاسبي المرتبط بنجاح.')
      await handlePageChange(pagination.value?.current_page || 1)
    } catch (error) {
      toast.error(voucherStore.error || 'حدث خطأ أثناء إلغاء ترحيل السند.')
    } finally {
      isUnpostDialogOpen.value = false
      voucherToUnpost.value = null
    }
  }
}

// حذف السند (مسودة أو مُرحّل حسب الصلاحية)
const isDeleteDialogOpen = ref(false)
const voucherToDelete = ref(null)

const openDeleteDialog = (voucher) => {
  if (!authStore.can(deletePermission.value)) {
    toast.warning('لا تملك صلاحية حذف هذا السند.')
    return
  }
  voucherToDelete.value = voucher
  isDeleteDialogOpen.value = true
}

const deleteSelectedVoucher = async () => {
  if (voucherToDelete.value) {
    try {
      const wasPosted = voucherToDelete.value.status === 'posted'
      await voucherStore.deleteVoucher(voucherToDelete.value.id)
      toast.success(
        wasPosted
          ? 'تم حذف السند المُرحّل والقيد المحاسبي المرتبط به بنجاح.'
          : 'تم حذف مسودة السند بنجاح.',
      )

      const targetPage =
        vouchers.value.length === 1 && pagination.value?.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(targetPage)
    } catch (error) {
      toast.error(voucherStore.error || 'فشل الحذف.')
    } finally {
      isDeleteDialogOpen.value = false
      voucherToDelete.value = null
    }
  }
}
</script>
