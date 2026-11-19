<!-- src/modules/hr/views/internet_vouchers/InternetVouchersList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>أكواد الإنترنت</span>
        </h1>
        <span
          v-if="pagination?.total !== undefined"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          {{ pagination.total }}
        </span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- زر الصرف اليدوي -->
        <AppButton
          v-if="authStore.can('internet_vouchers.assign')"
          variant="secondary"
          size="sm"
          @click="openAssignModal"
          icon="user"
        >
          صرف كود يدوي
        </AppButton>

        <!-- زر استيراد CSV -->
        <AppButton
          v-if="authStore.can('internet_vouchers.import')"
          size="sm"
          @click="openImportModal"
          icon="upload"
        >
          رفع ملف أكواد (CSV)
        </AppButton>
      </div>
    </div>

    <!-- شريط البحث والفلترة -->
    <VouchersFilter
      v-model:searchQuery="filters.search"
      v-model:status="filters.status"
      @update:searchQuery="onFilterChange"
      @update:status="onFilterChange"
    />

    <!-- جدول بيانات الأكواد -->
    <VouchersTable
      :vouchers="vouchers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
    />

    <!-- نافذة رفع واستيراد ملف الأكواد -->
    <VoucherImportModal v-model="isImportModalOpen" @imported="handleImportSuccess" />

    <!-- نافذة الصرف اليدوي للموظف -->
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
  } catch {
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
  await handlePageChange(1)
}

const handleAssignSuccess = async () => {
  toast.success('تم صرف الكود للموظف بنجاح!')
  isAssignModalOpen.value = false
  await handlePageChange(1)
}
</script>
