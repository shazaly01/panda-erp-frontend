<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الترويسة -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">تبديل الورديات والتجاوزات الفردية</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة الاستثناءات، إعفاء الموظفين من الدوام، وتغيير الورديات ليوم محدد.
        </p>
      </div>
      <AppButton
        v-if="authStore.can('hr.shift_overrides.create')"
        @click="openCreateModal"
        icon="plus"
      >
        تسجيل تجاوز جديد
      </AppButton>
    </div>

    <!-- الفلتر (مدمج لسرعة وسهولة الاستخدام) -->
    <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppInput
          id="search-employee"
          v-model="filters.search"
          placeholder="ابحث باسم الموظف..."
          @update:model-value="onFilterChange"
          clearable
        />
        <AppInput
          id="filter-date"
          type="date"
          label="تاريخ التجاوز"
          v-model="filters.date"
          @update:model-value="onFilterChange"
          clearable
        />
      </div>
    </div>

    <!-- الجدول -->
    <ShiftOverridesTable
      :overrides="overrides"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة الإضافة والتعديل المنبثقة -->
    <ShiftOverrideModal
      v-model="isModalOpen"
      :override="selectedOverride"
      :is-saving="isSaving"
      :employees="employeeStore.employees"
      :shifts="shiftStore.shifts"
      @save="saveOverride"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد إلغاء التجاوز"
      :message="`هل أنت متأكد من رغبتك في إلغاء التجاوز للموظف (${overrideToDelete?.employee?.full_name}) بتاريخ (${overrideToDelete?.date})؟ سيعود الموظف لورديته الافتراضية.`"
      confirm-text="إلغاء التجاوز"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { useAuthStore } from '@/stores/authStore'
import { useShiftOverrideStore } from '@/modules/hr/stores/shiftOverrideStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

import ShiftOverridesTable from './components/ShiftOverridesTable.vue'
import ShiftOverrideModal from './components/ShiftOverrideModal.vue'

const toast = useToast()
const authStore = useAuthStore()

// Stores
const overrideStore = useShiftOverrideStore()
const employeeStore = useEmployeeStore()
const shiftStore = useShiftStore()

const { overrides, pagination, loading } = storeToRefs(overrideStore)

// الفلاتر
const filters = reactive({
  search: '',
  date: '',
})

let searchTimeout = null
const onFilterChange = () => {
  overrideStore.loading = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// جلب البيانات
const handlePageChange = async (page = 1) => {
  try {
    await overrideStore.fetchOverrides({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب سجل التجاوزات.')
  }
}

onMounted(async () => {
  handlePageChange(1)
  // جلب البيانات المساعدة للـ Modal إذا لم تكن موجودة
  if (employeeStore.employees.length === 0) await employeeStore.fetchEmployees({ per_page: 500 }) // جلب لغرض الـ Dropdown
  if (shiftStore.shifts.length === 0) await shiftStore.fetchShifts({ per_page: 100 })
})

// إدارة الـ Modal (الإضافة والتعديل)
const isModalOpen = ref(false)
const selectedOverride = ref(null)
const isSaving = ref(false)

const openCreateModal = () => {
  selectedOverride.value = null
  isModalOpen.value = true
}

const openEditModal = (override) => {
  selectedOverride.value = override
  isModalOpen.value = true
}

const saveOverride = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await overrideStore.updateOverride(formData.id, formData)
      toast.success('تم تحديث التجاوز بنجاح.')
    } else {
      await overrideStore.createOverride(formData)
      toast.success('تم اعتماد التجاوز الجديد بنجاح.')
    }
    isModalOpen.value = false
    handlePageChange(pagination.value?.current_page || 1)
  } catch (error) {
    toast.error(error.response?.data?.message || 'فشل الحفظ، يرجى التحقق من البيانات.')
  } finally {
    isSaving.value = false
  }
}

// إدارة الحذف
const isDeleteDialogOpen = ref(false)
const overrideToDelete = ref(null)

const openDeleteDialog = (override) => {
  overrideToDelete.value = override
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!overrideToDelete.value) return

  try {
    await overrideStore.deleteOverride(overrideToDelete.value.id)
    toast.success('تم إلغاء التجاوز بنجاح.')

    const targetPage =
      overrides.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error('فشل عملية الإلغاء.')
  } finally {
    isDeleteDialogOpen.value = false
    overrideToDelete.value = null
  }
}
</script>
