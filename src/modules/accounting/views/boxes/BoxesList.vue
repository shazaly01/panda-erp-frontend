<!--src\modules\accounting\views\boxes\BoxesList.vue-->
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">الخزائن (الصناديق)</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة الخزائن النقدية وربطها بالدليل المحاسبي والفروع
        </p>
      </div>
      <AppButton v-if="authStore.can('box.create')" @click="openModal()">
        إضافة خزينة جديدة
      </AppButton>
    </div>

    <BoxesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <BoxesTable
      :boxes="boxes"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openModal"
      @delete="openDeleteDialog"
      @row-clicked="openModal"
    />

    <BoxModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :box="selectedBox"
      :is-saving="isSaving"
      :currencies="currencyStore.currencies"
      :branches="branchStore?.branches || []"
      :transactional-accounts="allowedAccounts"
      @save="handleSave"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الخزينة"
      :message="`هل أنت متأكد من رغبتك في حذف الخزينة '${boxToDelete?.name}'؟`"
      @confirmed="deleteSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useBoxStore } from '@/modules/accounting/stores/boxStore'
import { useCurrencyStore } from '@/modules/accounting/stores/currencyStore'
// تأكد من مسار ستور الفروع الصحيح في مشروعك
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import BoxesFilter from './BoxesFilter.vue'
import BoxesTable from './BoxesTable.vue'
import BoxModal from './BoxModal.vue'

// -- إدارة الحالة والمخازن --
const authStore = useAuthStore()
const boxStore = useBoxStore()
const currencyStore = useCurrencyStore()
const branchStore = useCostCenterStore()
const toast = useToast()

// التعديل هنا: استخراج allowedAccounts من الستور
const { boxes, pagination, loading, allowedAccounts } = storeToRefs(boxStore)

// -- حالة الفلاتر --
const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

// البحث مع تأخير (Debounce)
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات الأساسية --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    searchQuery: searchQuery.value, // ✅ تعديل الاسم
    statusFilter: statusFilter.value, // ✅ تعديل الاسم
  }

  try {
    await boxStore.fetchBoxes(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة الخزائن.')
  }
}

onMounted(async () => {
  // 1. جلب الخزائن
  handlePageChange()

  // 2. جلب العملات إذا لم تكن موجودة
  if (currencyStore.currencies?.length === 0) {
    await currencyStore.fetchCurrencies()
  }

  // 3. جلب الفروع
  if (branchStore?.branches?.length === 0 && branchStore.fetchBranches) {
    await branchStore.fetchBranches()
  }

  // 4. جلب الحسابات "الحركية المسموح بها فقط" من الشجرة (حسب الخريطة)
  await boxStore.fetchAllowedAccounts('default_box_parent')
})

// -- إدارة المودال (إضافة / تعديل) --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedBox = ref(null)

const openModal = (box = null) => {
  if (box && !authStore.can('box.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذه الخزينة.')
    return
  }

  selectedBox.value = box ? { ...box } : null
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await boxStore.updateBox(formData.id, formData)
      toast.success('تم تعديل بيانات الخزينة بنجاح.')
    } else {
      await boxStore.createBox(formData)
      toast.success('تمت إضافة الخزينة وربطها محاسبياً بنجاح.')
    }

    await handlePageChange(pagination.value?.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.error || 'حدث خطأ أثناء الحفظ.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const boxToDelete = ref(null)

const openDeleteDialog = (box) => {
  boxToDelete.value = box
  isDeleteDialogOpen.value = true
}

const deleteSelected = async () => {
  if (boxToDelete.value) {
    try {
      await boxStore.deleteBox(boxToDelete.value.id)
      toast.success('تم حذف الخزينة بنجاح.')

      const targetPage =
        boxes.value.length === 1 && pagination.value?.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(targetPage)
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'لا يمكن حذف الخزينة؛ قد تكون مرتبطة بحركات مالية.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      boxToDelete.value = null
    }
  }
}

watch(
  [searchQuery, statusFilter],
  () => {
    boxStore.fetchBankAccounts({
      searchQuery: searchQuery.value,
      statusFilter: statusFilter.value,
    })
  },
  { debounce: 500 },
)
</script>
