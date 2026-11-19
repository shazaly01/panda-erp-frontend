<!-- src/modules/hr/views/shift-overrides/ShiftOverridesList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>تبديل الورديات والتجاوزات الفردية</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('hr.shift_overrides.create')"
        size="sm"
        @click="openCreateModal"
        icon="plus"
      >
        تسجيل تجاوز جديد
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
          <label for="search-employee" class="text-[11px] font-bold text-text-secondary pr-1">
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
              id="search-employee"
              type="text"
              v-model="filters.search"
              @input="onFilterChange"
              placeholder="ابحث باسم الموظف أو الرقم الوظيفي..."
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

        <!-- 2. تاريخ التجاوز -->
        <div class="md:col-span-4 flex flex-col space-y-1">
          <label for="filter-date" class="text-[11px] font-bold text-text-secondary pr-1">
            تاريخ التجاوز
          </label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-xs"
          >
            <input
              id="filter-date"
              type="date"
              v-model="filters.date"
              @input="onFilterChange"
              class="block w-full h-full pr-3 pl-14 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
            />

            <button
              v-if="filters.date"
              type="button"
              @click="clearDate"
              class="absolute left-8 p-1 text-text-muted hover:text-danger rounded-md transition-colors cursor-pointer z-10"
              title="مسح التاريخ"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <span
              class="absolute left-3 text-text-muted pointer-events-none flex items-center z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- جدول التجاوزات -->
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

const clearSearch = () => {
  filters.search = ''
  handlePageChange(1)
}

const clearDate = () => {
  filters.date = ''
  handlePageChange(1)
}

// جلب البيانات
const handlePageChange = async (page = 1) => {
  try {
    await overrideStore.fetchOverrides({ page, ...filters })
  } catch {
    toast.error('حدث خطأ أثناء جلب سجل التجاوزات.')
  }
}

onMounted(async () => {
  handlePageChange(1)
  if (employeeStore.employees.length === 0) await employeeStore.fetchEmployees({ per_page: 500 })
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
  } catch {
    toast.error('فشل عملية الإلغاء.')
  } finally {
    isDeleteDialogOpen.value = false
    overrideToDelete.value = null
  }
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}
</style>
