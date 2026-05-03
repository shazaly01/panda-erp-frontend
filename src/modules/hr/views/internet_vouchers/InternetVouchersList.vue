<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الرأس والأزرار -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">أكواد الإنترنت</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة مخزون أكواد الإنترنت، رفع الملفات، ومتابعة سجلات الصرف للموظفين.
        </p>
      </div>
      <div class="flex gap-3">
        <!-- زر الصرف اليدوي -->
        <AppButton
          v-if="authStore.can('internet_vouchers.assign')"
          @click="openAssignModal"
          variant="secondary"
          icon="user"
        >
          صرف كود يدوي
        </AppButton>
        <!-- زر استيراد CSV -->
        <AppButton
          v-if="authStore.can('internet_vouchers.import')"
          @click="openImportModal"
          icon="upload"
        >
          رفع ملف أكواد (CSV)
        </AppButton>
      </div>
    </div>

    <!-- مكون الفلترة (سنبنيه في الرد القادم) -->
    <VouchersFilter
      v-model:searchQuery="filters.search"
      v-model:status="filters.status"
      @update:searchQuery="onFilterChange"
      @update:status="onFilterChange"
    />

    <!-- مكون الجدول -->
    <VouchersTable
      :vouchers="vouchers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
    />

    <!-- مكون شاشة الرفع المنبثقة الكاملة (سنبنيه في الرد القادم) -->
    <VoucherImportModal v-model="isImportModalOpen" @imported="handleImportSuccess" />

    <!-- مكون شاشة الصرف اليدوي (سنبنيه في الرد القادم) -->
    <VoucherAssignModal v-model="isAssignModalOpen" @assigned="handleAssignSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { useAuthStore } from '@/stores/authStore'
import { useInternetVoucherStore } from '@/modules/hr/stores/internetVoucherStore'

import AppButton from '@/components/ui/AppButton.vue'
import VouchersFilter from './components/VouchersFilter.vue'
import VouchersTable from './components/VouchersTable.vue'
import VoucherImportModal from './components/VoucherImportModal.vue'
import VoucherAssignModal from './components/VoucherAssignModal.vue'

// -- تهيئة --
const toast = useToast()
const authStore = useAuthStore()
const voucherStore = useInternetVoucherStore()

const { vouchers, pagination, loading } = storeToRefs(voucherStore)

// -- الفلاتر --
const filters = reactive({
  search: '',
  status: '',
})

let searchTimeout = null

const onFilterChange = () => {
  voucherStore.loading = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  try {
    await voucherStore.fetchVouchers({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات الأكواد.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة شاشات الرفع والصرف --
const isImportModalOpen = ref(false)
const isAssignModalOpen = ref(false)

const openImportModal = () => {
  isImportModalOpen.value = true
}

const openAssignModal = () => {
  isAssignModalOpen.value = true
}

const handleImportSuccess = async () => {
  toast.success('تم استيراد الأكواد بنجاح!')
  isImportModalOpen.value = false
  await handlePageChange(1) // تحديث الجدول
}

const handleAssignSuccess = async () => {
  toast.success('تم صرف الكود للموظف بنجاح!')
  isAssignModalOpen.value = false
  await handlePageChange(1) // تحديث الجدول
}
</script>
