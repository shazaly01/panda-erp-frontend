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

    <!-- فلاتر البحث والحالة -->
    <VouchersFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- جدول عرض السندات -->
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
      @delete="openDeleteDialog"
    />

    <!-- نافذة الإنشاء والتعديل المنبثقة المحدثة -->
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

// استقبال النوع من الـ Router (receipt أو payment)
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

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

// الفلاتر والبحث
const searchQuery = ref('')
const statusFilter = ref('')
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
    handlePageChange(1)
  },
)

onMounted(() => {
  handlePageChange()
})

// إدارة النافذة المنبثقة للإنشاء والتعديل
const isFormModalOpen = ref(false)
const voucherToEditId = ref(null)

const openCreateModal = () => {
  voucherToEditId.value = null
  isFormModalOpen.value = true
}

const openEditModal = (voucher) => {
  if (voucher.status === 'posted') {
    toast.warning('السندات المُرحلة غير قابلة للتعديل.')
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

// حذف السند
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
