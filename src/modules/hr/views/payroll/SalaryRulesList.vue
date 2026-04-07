<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">قواعد الرواتب</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة عناصر الاستحقاق والاستقطاع (مثل الأساسي، البدلات، التأمينات) وكيفية حسابها برمجياً.
        </p>
      </div>
      <AppButton v-if="authStore.can('salary_rule.create')" @click="openCreateModal" icon="plus">
        إضافة قاعدة راتب
      </AppButton>
    </div>

    <SalaryRulesFilter
      v-model:searchQuery="searchQuery"
      v-model:categoryFilter="categoryFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:categoryFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <SalaryRulesTable
      :rules="rules"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <SalaryRuleModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :rule-to-edit="ruleToEdit"
      @saved="onRuleSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف قاعدة الراتب"
      :message="`هل أنت متأكد من رغبتك في حذف قاعدة (${ruleToDelete?.name})؟ قد يؤثر ذلك على الهياكل المرتبطة بها.`"
      confirm-text="حذف نهائي"
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
import { useSalaryRuleStore } from '@/modules/hr/stores/salaryRuleStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import SalaryRulesFilter from './components/SalaryRulesFilter.vue'
import SalaryRulesTable from './components/SalaryRulesTable.vue'
import SalaryRuleModal from './components/SalaryRuleModal.vue'

// -- تهيئة الـ Stores --
const authStore = useAuthStore()
const salaryRuleStore = useSalaryRuleStore()
const toast = useToast()

const { rules, pagination, loading } = storeToRefs(salaryRuleStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
const categoryFilter = ref('')
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
    category: categoryFilter.value,
    is_active: statusFilter.value,
  }

  try {
    await salaryRuleStore.fetchRules(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قواعد الرواتب.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const ruleToEdit = ref(null)

const openCreateModal = () => {
  ruleToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (rule) => {
  ruleToEdit.value = rule
  isModalOpen.value = true
}

const onRuleSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const ruleToDelete = ref(null)

const openDeleteDialog = (rule) => {
  ruleToDelete.value = rule
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!ruleToDelete.value) return

  try {
    await salaryRuleStore.deleteRule(ruleToDelete.value.id)
    toast.success('تم حذف قاعدة الراتب بنجاح.')

    const targetPage =
      rules.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(salaryRuleStore.error || 'فشل عملية الحذف (القاعدة مرتبطة بهياكل رواتب).')
  } finally {
    isDeleteDialogOpen.value = false
    ruleToDelete.value = null
  }
}
</script>
