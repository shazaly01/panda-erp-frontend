<!-- src/modules/hr/views/calendar-exceptions/CalendarExceptionsList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>العطلات والطوارئ</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr.calendar_exceptions.create')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        تسجيل حالة جديدة
      </AppButton>
    </div>

    <!-- شريط البحث والفلترة المدمج -->
    <div
      class="p-4 sm:p-5 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200 mb-4"
      dir="rtl"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- 1. البحث السريع -->
        <div class="md:col-span-8 flex flex-col space-y-1">
          <label for="search-exception" class="text-[11px] font-bold text-text-secondary pr-1">
            البحث السريع
          </label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
          >
            <span class="absolute right-3 text-text-muted pointer-events-none z-10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>

            <input
              id="search-exception"
              type="text"
              v-model="filters.search"
              @input="onFilterChange"
              placeholder="ابحث باسم الحالة (مثال: عيد الفطر)..."
              class="block w-full h-full pr-10 pl-9 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
            />

            <button
              v-if="filters.search"
              type="button"
              @click="clearSearch"
              class="absolute left-2.5 p-1 text-text-muted hover:text-danger rounded-md transition-colors cursor-pointer"
              title="مسح البحث"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- 2. نوع الحالة -->
        <div class="md:col-span-4 flex flex-col space-y-1">
          <label for="filter-type" class="text-[11px] font-bold text-text-secondary pr-1">
            نوع الحالة
          </label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
          >
            <span class="absolute right-3 text-primary pointer-events-none z-10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>

            <select
              id="filter-type"
              v-model="filters.type"
              @change="onFilterChange"
              class="block w-full h-full pr-10 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            >
              <option
                v-for="opt in typeOptions"
                :key="opt.id"
                :value="opt.id"
                class="bg-surface-section text-text-primary"
              >
                {{ opt.name }}
              </option>
            </select>

            <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
          </div>
        </div>
      </div>
    </div>

    <!-- جدول العطلات والطوارئ -->
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

const clearSearch = () => {
  filters.search = ''
  handlePageChange(1)
}

// جلب البيانات
const handlePageChange = async (page = 1) => {
  try {
    await exceptionStore.fetchExceptions({ page, ...filters })
  } catch {
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
  } catch {
    toast.error('فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    exceptionToDelete.value = null
  }
}
</script>
