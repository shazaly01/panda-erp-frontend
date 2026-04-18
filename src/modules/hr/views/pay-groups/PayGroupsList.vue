<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة مجموعات الدفع</h1>
        <p class="text-sm text-text-muted mt-1">
          إعداد مجموعات الموظفين ودورات صرف الرواتب الخاصة بهم (شهري، أسبوعي، إلخ).
        </p>
      </div>
      <AppButton v-if="authStore.can('hr.pay_groups.manage')" @click="openCreateModal" icon="plus">
        إضافة مجموعة جديدة
      </AppButton>
    </div>

    <PayGroupsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <PayGroupsTable
      :groups="groups"
      :loading="loading"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <PayGroupModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :group-to-edit="groupToEdit"
      @saved="onGroupSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف مجموعة الدفع"
      :message="`هل أنت متأكد من رغبتك في حذف المجموعة (${groupToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء.`"
      confirm-text="حذف المجموعة"
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
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import PayGroupsFilter from './components/PayGroupsFilter.vue'
import PayGroupsTable from './components/PayGroupsTable.vue'
import PayGroupModal from './components/PayGroupModal.vue'

const authStore = useAuthStore()
const payGroupStore = usePayGroupStore()
const toast = useToast()

const { groups, loading } = storeToRefs(payGroupStore)

// -- الفلاتر والبحث --
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
const handlePageChange = async () => {
  const filters = {
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  try {
    await payGroupStore.fetchPayGroups(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب مجموعات الدفع.')
  }
}

onMounted(() => {
  handlePageChange()
})

// -- إدارة النافذة المنبثقة (إضافة / تعديل) --
const isModalOpen = ref(false)
const groupToEdit = ref(null)

const openCreateModal = () => {
  groupToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (group) => {
  groupToEdit.value = group
  isModalOpen.value = true
}

const onGroupSaved = () => {
  handlePageChange()
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const groupToDelete = ref(null)

const openDeleteDialog = (group) => {
  groupToDelete.value = group
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!groupToDelete.value) return

  try {
    await payGroupStore.deletePayGroup(groupToDelete.value.id)
    toast.success('تم حذف مجموعة الدفع بنجاح.')
    await handlePageChange()
  } catch (error) {
    toast.error(payGroupStore.error || 'فشل عملية الحذف. قد تكون مرتبطة بعقود نشطة.')
  } finally {
    isDeleteDialogOpen.value = false
    groupToDelete.value = null
  }
}
</script>
