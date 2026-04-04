<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">مراكز التكلفة</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة الشجرة الهرمية لمراكز التكلفة والمشاريع والفروع
        </p>
      </div>
      <AppButton v-if="authStore.can('cost_center.create')" @click="openModal()">
        إضافة مركز رئيسي
      </AppButton>
    </div>

    <CostCentersFilter
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="fetchData"
      @update:statusFilter="fetchData"
    />

    <CostCentersTreeView
      :cost-centers="costCenterTree"
      :loading="loading"
      @add-child="openAddChildModal"
      @edit="openModal"
      @delete="openDeleteDialog"
    />

    <CostCenterModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :cost-center="selectedCostCenter"
      :is-saving="isSaving"
      :parent-cost-centers="flatCostCenters"
      @save="handleSave"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف مركز التكلفة"
      :message="`هل أنت متأكد من رغبتك في حذف المركز '${costCenterToDelete?.name}'؟`"
      @confirmed="deleteSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import CostCentersFilter from './CostCentersFilter.vue'
import CostCentersTreeView from './CostCentersTreeView.vue'
import CostCenterModal from './CostCenterModal.vue'

// -- إدارة الحالة --
const authStore = useAuthStore()
const costCenterStore = useCostCenterStore()
const toast = useToast()

const { costCenterTree, flatCostCenters, loading } = storeToRefs(costCenterStore)

// -- الفلاتر --
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 500)
}

const fetchData = async () => {
  const filters = {
    search: searchQuery.value,
    type: typeFilter.value,
    is_active: statusFilter.value,
  }

  try {
    // جلب البيانات دفعة واحدة لأنها شجرة (لا يوجد Pagination)
    await costCenterStore.fetchCostCenters(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب دليل مراكز التكلفة.')
  }
}

onMounted(() => {
  fetchData()
})

// -- إدارة المودال --
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedCostCenter = ref(null)

const openModal = (costCenter = null) => {
  if (costCenter && !authStore.can('cost_center.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذا المركز.')
    return
  }
  selectedCostCenter.value = costCenter ? { ...costCenter } : null
  isModalOpen.value = true
}

// دالة ذكية لإضافة مركز فرعي وتعبئة "المركز الأب" تلقائياً
const openAddChildModal = (parentCostCenter) => {
  selectedCostCenter.value = { parent_id: parentCostCenter.id }
  isModalOpen.value = true
}

const handleSave = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await costCenterStore.updateCostCenter(formData.id, formData)
      toast.success(`تم تحديث مركز '${formData.name}' بنجاح.`)
    } else {
      await costCenterStore.createCostCenter(formData)
      toast.success(`تمت إضافة المركز '${formData.name}' بنجاح.`)
    }
    isModalOpen.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء الحفظ.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const costCenterToDelete = ref(null)

const openDeleteDialog = (costCenter) => {
  costCenterToDelete.value = costCenter
  isDeleteDialogOpen.value = true
}

const deleteSelected = async () => {
  if (costCenterToDelete.value) {
    try {
      await costCenterStore.deleteCostCenter(costCenterToDelete.value.id)
      toast.success('تم حذف مركز التكلفة بنجاح.')
    } catch (error) {
      const errorMessage = costCenterStore.error || 'فشل الحذف.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      costCenterToDelete.value = null
    }
  }
}
</script>
