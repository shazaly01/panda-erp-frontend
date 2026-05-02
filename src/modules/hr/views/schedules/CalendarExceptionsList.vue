<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الترويسة -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">العطلات والطوارئ</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة العطلات الرسمية، الأعياد، وحالات الطوارئ العامة وتأثيرها على الدوام والأوفرتايم.
        </p>
      </div>
      <AppButton
        v-if="authStore.can('hr.calendar_exceptions.create')"
        @click="openCreateModal"
        icon="plus"
      >
        تسجيل حالة جديدة
      </AppButton>
    </div>

    <!-- الفلتر (مدمج) -->
    <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="search-exception"
          v-model="filters.search"
          placeholder="ابحث باسم الحالة (مثال: عيد الفطر)..."
          @update:model-value="onFilterChange"
          clearable
        />
        <AppDropdown
          id="filter-type"
          v-model="filters.type"
          :options="typeOptions"
          option-label="name"
          option-value="id"
          placeholder="كل الأنواع"
          @update:model-value="onFilterChange"
        />
      </div>
    </div>

    <!-- الجدول -->
    <CalendarExceptionsTable
      :exceptions="exceptions"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة الإضافة والتعديل المنبثقة -->
    <CalendarExceptionModal
      v-model="isModalOpen"
      :exception="selectedException"
      :is-saving="isSaving"
      @save="saveException"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الحالة"
      :message="`هل أنت متأكد من رغبتك في حذف حالة (${exceptionToDelete?.name})؟ سيؤثر هذا على سجلات حضور الموظفين في تلك الفترة.`"
      confirm-text="حذف نهائي"
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
import { useCalendarExceptionStore } from '@/modules/hr/stores/calendarExceptionStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

import CalendarExceptionsTable from './components/CalendarExceptionsTable.vue'
import CalendarExceptionModal from './components/CalendarExceptionModal.vue'

const toast = useToast()
const authStore = useAuthStore()
const exceptionStore = useCalendarExceptionStore()

const { exceptions, pagination, loading } = storeToRefs(exceptionStore)

const typeOptions = [
  { id: '', name: 'كل الأنواع' },
  { id: 'holiday', name: 'عطلة رسمية' },
  { id: 'emergency', name: 'طوارئ عامة' },
  { id: 'other', name: 'أخرى' },
]

// الفلاتر
const filters = reactive({
  search: '',
  type: '',
})

let searchTimeout = null
const onFilterChange = () => {
  exceptionStore.loading = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// جلب البيانات
const handlePageChange = async (page = 1) => {
  try {
    await exceptionStore.fetchExceptions({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب العطلات والطوارئ.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// إدارة الـ Modal (الإضافة والتعديل)
const isModalOpen = ref(false)
const selectedException = ref(null)
const isSaving = ref(false)

const openCreateModal = () => {
  selectedException.value = null
  isModalOpen.value = true
}

const openEditModal = (exception) => {
  selectedException.value = exception
  isModalOpen.value = true
}

const saveException = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await exceptionStore.updateException(formData.id, formData)
      toast.success('تم تحديث بيانات الحالة بنجاح.')
    } else {
      await exceptionStore.createException(formData)
      toast.success('تم تسجيل الحالة الجديدة بنجاح.')
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
const exceptionToDelete = ref(null)

const openDeleteDialog = (exception) => {
  exceptionToDelete.value = exception
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!exceptionToDelete.value) return

  try {
    await exceptionStore.deleteException(exceptionToDelete.value.id)
    toast.success('تم حذف الحالة بنجاح.')

    const targetPage =
      exceptions.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error('فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    exceptionToDelete.value = null
  }
}
</script>
