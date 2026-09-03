<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">{{ pageTitle }}</h1>
        <p class="text-xs text-text-secondary mt-1">
          {{ pageSubtitle }}
        </p>
      </div>
      <AppButton
        type="button"
        @click="goToCreatePage"
        class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.25)]"
      >
        إصدار أمر تحويل جديد
      </AppButton>
    </div>

    <TransferFilters
      v-model:searchQuery="searchQuery"
      v-model:fromWarehouseFilter="fromWarehouseFilter"
      v-model:toWarehouseFilter="toWarehouseFilter"
      v-model:statusFilter="statusFilter"
      v-model:fromDateFilter="fromDateFilter"
      v-model:toDateFilter="toDateFilter"
      @update:searchQuery="onSearch"
      @update:fromWarehouseFilter="handlePageChange(1)"
      @update:toWarehouseFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
      @update:fromDateFilter="handlePageChange(1)"
      @update:toDateFilter="handlePageChange(1)"
    />

    <TransferTable
      :transfers="transfers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-transfer="goToEditPage"
      @delete-transfer="openDeleteDialog"
      @complete-transfer="openCompleteDialog"
      @row-clicked="goToEditPage"
      @print-transfer="openPrintPage"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف وإلغاء مسودة التحويل"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف أمر التحويل رقم '${transferToDelete?.transfer_number || transferToDelete?.id}'؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirmed="deleteSelectedTransfer"
    />

    <AppConfirmDialog
      v-model="isCompleteDialogOpen"
      title="تأكيد اعتماد وترحيل أمر التحويل المخزني"
      :message="`هل أنت متأكد من اعتماد وترحيل أمر التحويل رقم '${transferToComplete?.transfer_number || transferToComplete?.id}'؟ سيتم نقل الكميات بين المستودعين وتوليد القيد المحاسبي المباشر لحظياً.`"
      @confirmed="confirmCompleteTransfer"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTransferStore } from '@/modules/inventory/stores/transferStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import TransferFilters from './components/TransferFilters.vue'
import TransferTable from './components/TransferTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const transferStore = useTransferStore()
const { transfers, loading, pagination } = storeToRefs(transferStore)

const searchQuery = ref('')
const fromWarehouseFilter = ref('')
const toWarehouseFilter = ref('')
const statusFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
let searchTimeout = null

const pageTitle = computed(() => {
  return route.meta.pageTitle || 'إدارة أوامر التحويل بين المستودعات'
})

const pageSubtitle = computed(() => {
  return 'متابعة وتدقيق حركات نقل الأصناف بين الفروع والمخازن وترحيل الأثر المخزني والمالي.'
})

// مراقبة المسار لتحديث البيانات
watch(
  () => route.fullPath,
  () => {
    handlePageChange(1)
  },
)

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    from_warehouse_id: fromWarehouseFilter.value,
    to_warehouse_id: toWarehouseFilter.value,
    status: statusFilter.value,
    from_date: fromDateFilter.value,
    to_date: toDateFilter.value,
  }

  transferStore.fetchTransfers(page, filters).catch(() => {
    toast.error('فشل النظام في جلب بيانات أوامر التحويل من الخادم.')
  })
}

onMounted(() => {
  handlePageChange(1)
})

const goToCreatePage = () => {
  router.push('/app/inventory/transfers/create')
}

const goToEditPage = (transfer) => {
  if (transfer.status === 'approved' || transfer.status === 'completed') {
    router.push(`/app/inventory/transfers/${transfer.id}`)
  } else {
    router.push(`/app/inventory/transfers/${transfer.id}/edit`)
  }
}

const openPrintPage = (transfer) => {
  window.open(`/print/inventory/transfers/${transfer.id}`, '_blank')
}

// منطق تأكيد الحذف
const isDeleteDialogOpen = ref(false)
const transferToDelete = ref(null)

const openDeleteDialog = (transfer) => {
  transferToDelete.value = transfer
  isDeleteDialogOpen.value = true
}

const deleteSelectedTransfer = async () => {
  if (transferToDelete.value) {
    try {
      await transferStore.deleteTransfer(transferToDelete.value.id)
      toast.success(
        `تم حذف أمر التحويل رقم '${transferToDelete.value.transfer_number || transferToDelete.value.id}' بنجاح.`,
      )

      if (transfers.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = transferStore.error || 'فشلت عملية حذف أمر التحويل.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      transferToDelete.value = null
    }
  }
}

// منطق تأكيد الاعتماد المباشر من القائمة
const isCompleteDialogOpen = ref(false)
const transferToComplete = ref(null)

const openCompleteDialog = (transfer) => {
  transferToComplete.value = transfer
  isCompleteDialogOpen.value = true
}

const confirmCompleteTransfer = async () => {
  if (transferToComplete.value) {
    try {
      await transferStore.completeTransfer(transferToComplete.value.id)
      toast.success(
        `تم اعتماد وترحيل أمر التحويل رقم '${transferToComplete.value.transfer_number || transferToComplete.value.id}' وتحديث الأرصدة بنجاح.`,
      )
      await handlePageChange(pagination.value?.current_page || 1)
    } catch {
      const errorMessage = transferStore.error || 'فشلت عملية اعتماد وترحيل أمر التحويل.'
      toast.error(errorMessage)
    } finally {
      isCompleteDialogOpen.value = false
      transferToComplete.value = null
    }
  }
}
</script>
