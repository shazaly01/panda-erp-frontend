<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة الفترات المالية</h1>
        <p class="text-sm text-text-muted mt-1">
          توليد الفترات المالية لمجموعات الدفع، وإدارة حالاتها (مجدولة، مفتوحة، مغلقة).
        </p>
      </div>

      <AppButton
        v-if="authStore.can('hr.pay_periods.manage')"
        @click="openGenerateModal"
        icon="plus"
      >
        توليد فترات جديدة
      </AppButton>
    </div>

    <PayPeriodsFilter
      v-model:searchQuery="searchQuery"
      v-model:payGroupFilter="payGroupFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:payGroupFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <PayPeriodsTable
      :periods="periods"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <PayPeriodGenerateModal
      v-if="isGenerateModalOpen"
      v-model="isGenerateModalOpen"
      @saved="onPeriodsChanged"
    />

    <PayPeriodModal
      v-if="isEditModalOpen"
      v-model="isEditModalOpen"
      :period-to-edit="periodToEdit"
      @saved="onPeriodsChanged"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الفترة المالية"
      :message="`هل أنت متأكد من رغبتك في حذف الفترة (${periodToDelete?.name})؟`"
      confirm-text="حذف الفترة"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { usePayPeriodStore } from '@/modules/hr/stores/payPeriodStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import PayPeriodsFilter from './components/PayPeriodsFilter.vue'
import PayPeriodsTable from './components/PayPeriodsTable.vue'
import PayPeriodGenerateModal from './components/PayPeriodGenerateModal.vue'
import PayPeriodModal from './components/PayPeriodModal.vue'

const authStore = useAuthStore()
const payPeriodStore = usePayPeriodStore()
const toast = useToast()

// إضافة pagination مع الـ state من المتجر
const { periods, pagination, loading } = storeToRefs(payPeriodStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
const payGroupFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات وإدارة التصفح (Pagination) --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    pay_group_id: payGroupFilter.value,
    status: statusFilter.value,
  }

  try {
    await payPeriodStore.fetchPayPeriods(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب الفترات المالية.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة نافذة التوليد التلقائي --
const isGenerateModalOpen = ref(false)

const openGenerateModal = () => {
  isGenerateModalOpen.value = true
}

// -- إدارة نافذة التعديل الفردي --
const isEditModalOpen = ref(false)
const periodToEdit = ref(null)

const openEditModal = (period) => {
  if (period.status === 'closed') {
    return toast.warning('لا يمكن تعديل فترة مالية تم إغلاقها.')
  }
  periodToEdit.value = period
  isEditModalOpen.value = true
}

// دالة مشتركة لتحديث الجدول بعد التوليد أو التعديل
const onPeriodsChanged = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const periodToDelete = ref(null)

const openDeleteDialog = (period) => {
  if (period.status !== 'open' && period.status !== 'pending') {
    return toast.warning('لا يمكن حذف هذه الفترة بسبب حالتها الحالية.')
  }
  periodToDelete.value = period
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!periodToDelete.value) return

  try {
    await payPeriodStore.deletePayPeriod(periodToDelete.value.id)
    toast.success('تم حذف الفترة بنجاح.')

    // التعامل مع الترقيم عند حذف عنصر
    const targetPage =
      periods.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(payPeriodStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    periodToDelete.value = null
  }
}
</script>
