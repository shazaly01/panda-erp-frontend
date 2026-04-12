<!--src\modules\hr\views\payroll\SalaryStructuresList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">هياكل الرواتب</h1>
        <p class="text-sm text-text-muted mt-1">
          تصميم القوالب التي تجمع قواعد الاستحقاق والاستقطاع ليتم تخصيصها للموظفين.
        </p>
      </div>
      <AppButton v-if="authStore.can('salary_structure.create')" @click="goToCreate" icon="plus">
        إنشاء هيكل جديد
      </AppButton>
    </div>

    <SalaryStructuresFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
    />

    <SalaryStructuresTable
      :structures="structures"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف هيكل الراتب"
      :message="`هل أنت متأكد من رغبتك في حذف هيكل (${structureToDelete?.name})؟ سيؤدي هذا لإزالته من كافة السجلات المرتبطة.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useSalaryStructureStore } from '@/modules/hr/stores/salaryStructureStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import SalaryStructuresFilter from './components/SalaryStructuresFilter.vue'
import SalaryStructuresTable from './components/SalaryStructuresTable.vue'

// -- تهيئة الأدوات والـ Stores --
const router = useRouter()
const authStore = useAuthStore()
const structureStore = useSalaryStructureStore()
const toast = useToast()

const { structures, pagination, loading } = storeToRefs(structureStore)

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

// -- جلب البيانات وإدارة التصفح (Pagination) --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    is_active: statusFilter.value,
  }

  try {
    await structureStore.fetchStructures(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب هياكل الرواتب.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- الملاحة (Navigation) --
const goToCreate = () => {
  router.push({ name: 'salary-structures.create' })
}

const goToEdit = (structure) => {
  router.push({ name: 'salary-structures.edit', params: { id: structure.id } })
}

// -- إدارة الحذف (Delete Logic) --
const isDeleteDialogOpen = ref(false)
const structureToDelete = ref(null)

const openDeleteDialog = (structure) => {
  // حماية إضافية قبل فتح الحوار
  if (structure.employees_count > 0) {
    toast.warning('لا يمكن حذف هيكل مرتبط بموظفين حاليين.')
    return
  }
  structureToDelete.value = structure
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!structureToDelete.value) return

  try {
    await structureStore.deleteStructure(structureToDelete.value.id)
    toast.success('تم حذف هيكل الراتب بنجاح.')

    // تحديث الصفحة الحالية أو العودة للخلف إذا فرغت الصفحة
    const targetPage =
      structures.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(structureStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    structureToDelete.value = null
  }
}
</script>
