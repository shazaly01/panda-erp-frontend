<!--src/modules/accounting/views/budgets/BudgetsList.vue-->
<template>
  <div class="space-y-6">
    <!-- الشريط العلوي والعنوان -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">الموازنات التقديرية (Budgets)</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة ومتابعة خطط الإنفاق التشغيلية، ومراقبة الانحرافات والرقابة المالية اللحظية
        </p>
      </div>
      <AppButton v-if="authStore.can('budget.create')" @click="navigateToCreate">
        + إنشاء موازنة جديدة
      </AppButton>
    </div>

    <!-- فلاتر البحث والحالة -->
    <BudgetsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      v-model:controlModeFilter="controlModeFilter"
      v-model:fiscalYearFilter="fiscalYearFilter"
      :fiscal-years="fiscalYears"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
      @update:controlModeFilter="handlePageChange(1)"
      @update:fiscalYearFilter="handlePageChange(1)"
    />

    <!-- جدول عرض الموازنات -->
    <BudgetsTable
      :budgets="budgets"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @view-report="openVarianceModal"
      @edit="navigateToEdit"
      @approve="openApproveDialog"
      @activate="openActivateDialog"
      @close="openCloseDialog"
      @delete="openDeleteDialog"
    />

    <!-- نافذة تقرير الانحراف والمقارنة اللحظية -->
    <BudgetVarianceModal
      v-if="isVarianceModalOpen"
      v-model="isVarianceModalOpen"
      :budget="selectedBudget"
    />

    <!-- نوافذ التأكيد لدورة حياة الموازنة -->
    <AppConfirmDialog
      v-model="isApproveDialogOpen"
      title="تأكيد اعتماد الموازنة"
      :message="`هل أنت متأكد من رغبتك في اعتماد الموازنة '${budgetToApprove?.name}'؟ ستصبح جاهزة للتفعيل.`"
      confirm-text="اعتماد الموازنة"
      confirm-variant="warning"
      @confirmed="approveSelectedBudget"
    />

    <AppConfirmDialog
      v-model="isActivateDialogOpen"
      title="تأكيد تفعيل الموازنة"
      :message="`هل أنت متأكد من تفعيل الموازنة '${budgetToActivate?.name}'؟ سيتم تطبيق قواعد الرقابة والمنع الميداني على المعاملات المالية فوراً.`"
      confirm-text="تفعيل وبدء الرقابة"
      confirm-variant="primary"
      @confirmed="activateSelectedBudget"
    />

    <AppConfirmDialog
      v-model="isCloseDialogOpen"
      title="تأكيد إغلاق الموازنة"
      :message="`هل أنت متأكد من رغبتك في إغلاق الموازنة '${budgetToClose?.name}'؟ لن يتم تطبيق أي قيود رقابية عليها بعد الإغلاق.`"
      confirm-text="إغلاق نهائي"
      confirm-variant="secondary"
      @confirmed="closeSelectedBudget"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف مسودة الموازنة"
      :message="`هل أنت متأكد من حذف مسودة الموازنة '${budgetToDelete?.name}' وبنودها بشكل نهائي؟`"
      confirm-text="حذف"
      confirm-variant="danger"
      @confirmed="deleteSelectedBudget"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useBudgetStore } from '@/modules/accounting/stores/budgetStore'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import BudgetsFilter from './BudgetsFilter.vue'
import BudgetsTable from './BudgetsTable.vue'
import BudgetVarianceModal from './components/BudgetVarianceModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const budgetStore = useBudgetStore()
const fiscalYearStore = useFiscalYearStore()
const toast = useToast()

const { budgets, pagination, loading } = storeToRefs(budgetStore)

const fiscalYears = computed(() => fiscalYearStore.fiscalYears || [])

// فلاتر البحث
const searchQuery = ref('')
const statusFilter = ref('')
const controlModeFilter = ref('')
const fiscalYearFilter = ref('')
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
    control_mode: controlModeFilter.value,
    fiscal_year_id: fiscalYearFilter.value,
  }

  try {
    await budgetStore.fetchBudgets(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة الموازنات.')
  }
}

onMounted(async () => {
  if (fiscalYearStore.fiscalYears?.length === 0 && fiscalYearStore.fetchFiscalYears) {
    fiscalYearStore.fetchFiscalYears()
  }
  handlePageChange()
})

// التوجيه إلى صفحة البناء (إنشاء وتعديل)
const navigateToCreate = () => {
  router.push({ name: 'budgets.create' })
}

const navigateToEdit = (budget) => {
  if (budget.status?.value !== 'draft') {
    toast.warning('الموازنات المعتمدة أو النشطة غير قابلة للتعديل.')
    return
  }
  router.push({ name: 'budgets.edit', params: { id: budget.id } })
}

// نافذة تقرير الانحراف
const isVarianceModalOpen = ref(false)
const selectedBudget = ref(null)

const openVarianceModal = (budget) => {
  selectedBudget.value = budget
  isVarianceModalOpen.value = true
}

// اعتماد الموازنة
const isApproveDialogOpen = ref(false)
const budgetToApprove = ref(null)

const openApproveDialog = (budget) => {
  budgetToApprove.value = budget
  isApproveDialogOpen.value = true
}

const approveSelectedBudget = async () => {
  if (budgetToApprove.value) {
    try {
      await budgetStore.approveBudget(budgetToApprove.value.id)
      toast.success('تم اعتماد الموازنة التقديرية بنجاح وهي الآن جاهزة للتفعيل.')
      await handlePageChange(pagination.value?.currentPage || 1)
    } catch (error) {
      toast.error(budgetStore.error || 'حدث خطأ أثناء اعتماد الموازنة.')
    } finally {
      isApproveDialogOpen.value = false
      budgetToApprove.value = null
    }
  }
}

// تفعيل الموازنة
const isActivateDialogOpen = ref(false)
const budgetToActivate = ref(null)

const openActivateDialog = (budget) => {
  budgetToActivate.value = budget
  isActivateDialogOpen.value = true
}

const activateSelectedBudget = async () => {
  if (budgetToActivate.value) {
    try {
      await budgetStore.activateBudget(budgetToActivate.value.id)
      toast.success('تم تفعيل الموازنة وبدء تطبيق الرقابة الميدانية بنجاح.')
      await handlePageChange(pagination.value?.currentPage || 1)
    } catch (error) {
      toast.error(budgetStore.error || 'حدث خطأ أثناء تفعيل الموازنة.')
    } finally {
      isActivateDialogOpen.value = false
      budgetToActivate.value = null
    }
  }
}

// إغلاق الموازنة
const isCloseDialogOpen = ref(false)
const budgetToClose = ref(null)

const openCloseDialog = (budget) => {
  budgetToClose.value = budget
  isCloseDialogOpen.value = true
}

const closeSelectedBudget = async () => {
  if (budgetToClose.value) {
    try {
      await budgetStore.closeBudget(budgetToClose.value.id)
      toast.success('تم إغلاق الموازنة بنجاح.')
      await handlePageChange(pagination.value?.currentPage || 1)
    } catch (error) {
      toast.error(budgetStore.error || 'حدث خطأ أثناء إغلاق الموازنة.')
    } finally {
      isCloseDialogOpen.value = false
      budgetToClose.value = null
    }
  }
}

// حذف الموازنة المسودة
const isDeleteDialogOpen = ref(false)
const budgetToDelete = ref(null)

const openDeleteDialog = (budget) => {
  if (budget.status?.value !== 'draft') {
    toast.warning('لا يمكن حذف الموازنات غير المسودة.')
    return
  }
  budgetToDelete.value = budget
  isDeleteDialogOpen.value = true
}

const deleteSelectedBudget = async () => {
  if (budgetToDelete.value) {
    try {
      await budgetStore.deleteBudget(budgetToDelete.value.id)
      toast.success('تم حذف مسودة الموازنة بنجاح.')

      const targetPage =
        budgets.value.length === 1 && pagination.value?.currentPage > 1
          ? pagination.value.currentPage - 1
          : pagination.value.currentPage

      await handlePageChange(targetPage)
    } catch (error) {
      toast.error(budgetStore.error || 'فشل حذف الموازنة.')
    } finally {
      isDeleteDialogOpen.value = false
      budgetToDelete.value = null
    }
  }
}
</script>
