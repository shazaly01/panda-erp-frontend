<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة سياسات العمل الإضافي</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة سياسات ومعدلات احتساب الساعات والأيام الإضافية لربطها بعقود الموظفين.
        </p>
      </div>
      <AppButton v-if="authStore.can('overtime_policy.create')" @click="goToCreate" icon="plus">
        إضافة سياسة جديدة
      </AppButton>
    </div>

    <OvertimePoliciesFilter
      v-model:searchQuery="filters.search"
      v-model:status="filters.status"
      @update:searchQuery="onFilterChange"
      @update:status="onFilterChange"
    />

    <OvertimePoliciesTable
      :policies="policies"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السياسة"
      :message="`هل أنت متأكد من رغبتك في حذف سياسة العمل الإضافي (${policyToDelete?.name})؟ إذا كانت هذه السياسة مستخدمة في عقود موظفين حالية، فلن ينجح الحذف.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { useAuthStore } from '@/stores/authStore'
import { useOvertimePolicyStore } from '@/modules/hr/stores/overtimePolicyStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import OvertimePoliciesFilter from './components/OvertimePoliciesFilter.vue'
import OvertimePoliciesTable from './components/OvertimePoliciesTable.vue'

// -- تهيئة --
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const policyStore = useOvertimePolicyStore()

const { policies, pagination, loading } = storeToRefs(policyStore)

// -- الفلاتر --
const filters = reactive({
  search: '',
  status: '', // يمكن إزالته لاحقاً إذا لم يكن للسياسات حالات (Status)
})

let searchTimeout = null

const onFilterChange = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  try {
    await policyStore.fetchPolicies({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات سياسات العمل الإضافي.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- التوجيه (Navigation) للـ Page --
const goToCreate = () => {
  router.push({ name: 'overtime-policies.create' })
}

const goToEdit = (policy) => {
  router.push({ name: 'overtime-policies.edit', params: { id: policy.id } })
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const policyToDelete = ref(null)

const openDeleteDialog = (policy) => {
  policyToDelete.value = policy
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!policyToDelete.value) return

  try {
    await policyStore.deletePolicy(policyToDelete.value.id)
    toast.success('تم حذف السياسة بنجاح.')

    const targetPage =
      policies.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(policyStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    policyToDelete.value = null
  }
}
</script>
