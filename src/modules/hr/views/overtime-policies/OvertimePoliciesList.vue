<!-- src/modules/hr/views/overtime-policies/OvertimePoliciesList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>إدارة سياسات العمل الإضافي</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('overtime_policy.create')"
        size="sm"
        @click="goToCreate"
        icon="plus"
      >
        إضافة سياسة جديدة
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة -->
    <OvertimePoliciesFilter
      v-model:searchQuery="filters.search"
      v-model:status="filters.status"
      @update:searchQuery="onFilterChange"
      @update:status="onFilterChange"
    />

    <!-- جدول سياسات العمل الإضافي -->
    <OvertimePoliciesTable
      :policies="policies"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <!-- نافذة تأكيد الحذف -->
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
  status: '',
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
  } catch {
    toast.error('حدث خطأ أثناء جلب بيانات سياسات العمل الإضافي.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- التوجيه (Navigation) --
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
  } catch {
    toast.error(policyStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    policyToDelete.value = null
  }
}
</script>
