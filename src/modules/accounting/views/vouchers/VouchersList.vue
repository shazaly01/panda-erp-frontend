<!--src\modules\accounting\views\vouchers\VouchersList.vue-->
<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">{{ pageTitle }}</h1>
        <p class="text-sm text-text-muted mt-1">
          {{ pageDescription }}
        </p>
      </div>
      <AppButton v-if="authStore.can(createPermission)" @click="goToCreatePage">
        إضافة {{ isReceipt ? 'سند قبض' : 'سند صرف' }} جديد
      </AppButton>
    </div>

    <VouchersFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <VouchersTable
      :vouchers="vouchers"
      :pagination="pagination"
      :loading="loading"
      :type="type"
      @page-change="handlePageChange"
      @view="openViewModal"
      @edit="goToEditPage"
      @approve="openApproveDialog"
      @post="openPostDialog"
      @delete="openDeleteDialog"
    />

    <VoucherViewModal
      v-if="isViewModalOpen"
      v-model="isViewModalOpen"
      :voucher-id="selectedVoucher?.id"
    />

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
      :message="`هل أنت متأكد من رغبتك في ترحيل السند رقم ${voucherToPost?.number}؟ سيتم إنشاء قيد يومية تلقائياً ولا يمكن التعديل عليه بعد الترحيل.`"
      confirm-text="ترحيل واعتماد"
      confirm-variant="primary"
      @confirmed="postSelectedVoucher"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف مسودة السند"
      :message="`هل أنت متأكد من رغبتك في حذف مسودة السند بشكل نهائي؟`"
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

// -- استقبال المتغير من المسارات (Router) --
const props = defineProps({
  type: {
    type: String,
    required: true, // سيكون إما 'receipt' أو 'payment'
  },
})

// -- إدارة الحالة --
const router = useRouter()
const authStore = useAuthStore()
const voucherStore = useVoucherStore()
const toast = useToast()

const { vouchers, pagination, loading } = storeToRefs(voucherStore)

// -- المتغيرات الديناميكية (التي تتغير حسب نوع الشاشة) --
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
const createRouteName = computed(() => (isReceipt.value ? 'receipts.create' : 'payments.create'))
const editRouteName = computed(() => (isReceipt.value ? 'receipts.edit' : 'payments.edit'))

// -- الفلاتر --
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    status: statusFilter.value,
    type: props.type, // إجبار الباك-إند على نوع السند الحالي
  }

  try {
    await voucherStore.fetchVouchers(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة السندات.')
  }
}

// تحديث البيانات تلقائياً إذا ضغط المستخدم على القائمة الجانبية للانتقال للنوع الآخر
watch(
  () => props.type,
  () => {
    searchQuery.value = ''
    statusFilter.value = ''
    handlePageChange(1)
  },
)

onMounted(() => {
  handlePageChange()
})

// -- التنقل لصفحات الإدخال والتعديل --
const goToCreatePage = () => {
  router.push({ name: createRouteName.value })
}

const goToEditPage = (voucher) => {
  if (voucher.status === 'posted') {
    toast.warning('السندات المُرحلة غير قابلة للتعديل.')
    return
  }
  router.push({ name: editRouteName.value, params: { id: voucher.id } })
}

// -- نافذة العرض السريعة --
const isViewModalOpen = ref(false)
const selectedVoucher = ref(null)

const openViewModal = (voucher) => {
  selectedVoucher.value = voucher
  isViewModalOpen.value = true
}

// -- إدارة الاعتماد (Approval) --
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
    } catch (error) {
      toast.error(voucherStore.error || 'حدث خطأ أثناء اعتماد السند.')
    } finally {
      isApproveDialogOpen.value = false
      voucherToApprove.value = null
    }
  }
}

// -- إدارة الترحيل (Posting) --
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

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const voucherToDelete = ref(null)

const openDeleteDialog = (voucher) => {
  if (voucher.status === 'posted') {
    toast.warning('لا يمكن حذف السندات المُرحلة.')
    return
  }
  voucherToDelete.value = voucher
  isDeleteDialogOpen.value = true
}

const deleteSelectedVoucher = async () => {
  if (voucherToDelete.value) {
    try {
      await voucherStore.deleteVoucher(voucherToDelete.value.id)
      toast.success('تم حذف مسودة السند بنجاح.')

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
