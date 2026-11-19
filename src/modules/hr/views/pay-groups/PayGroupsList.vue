<!-- src/modules/hr/views/pay-groups/PayGroupsList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>إدارة مجموعات الدفع</span>
        </h1>
        <span
          v-if="groups?.length !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ groups.length }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr.pay_groups.manage')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        إضافة مجموعة جديدة
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة -->
    <PayGroupsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- جدول مجموعات الدفع -->
    <PayGroupsTable
      :groups="groups"
      :loading="loading"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة إضافة / تعديل مجموعة دفع -->
    <PayGroupModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :group-to-edit="groupToEdit"
      @saved="onGroupSaved"
    />

    <!-- نافذة تأكيد الحذف -->
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
  } catch {
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
  } catch {
    toast.error(payGroupStore.error || 'فشل عملية الحذف. قد تكون مرتبطة بعقود نشطة.')
  } finally {
    isDeleteDialogOpen.value = false
    groupToDelete.value = null
  }
}
</script>
