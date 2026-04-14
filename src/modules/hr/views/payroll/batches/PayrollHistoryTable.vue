<template>
  <AppCard class="overflow-hidden">
    <div
      class="p-4 border-b border-surface-border flex justify-between items-center bg-surface-section"
    >
      <div>
        <h2 class="text-lg font-bold text-text-primary">سجل المسيرات السابقة</h2>
        <p class="text-xs text-text-muted mt-1">
          قائمة بالرواتب التي تم اعتمادها وترحيلها محاسبياً
        </p>
      </div>

      <AppButton variant="secondary" size="sm" @click="fetchData" :disabled="payrollStore.loading">
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          :class="{ 'animate-spin': payrollStore.loading }"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        تحديث
      </AppButton>
    </div>

    <AppTable
      :headers="tableHeaders"
      :items="payrollStore.batchesHistory"
      :is-loading="payrollStore.loading"
    >
      <template #cell-date="{ item }">
        <div class="font-bold text-text-primary flex items-center gap-2">
          <svg
            class="w-4 h-4 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {{ formatDateMonth(item.date) }}
        </div>
      </template>

      <template #cell-description="{ item }">
        <span class="text-sm text-text-muted">{{ item.description }}</span>
      </template>

      <template #cell-total_amount="{ item }">
        <span class="font-mono font-bold text-emerald-600">
          {{ formatCurrency(item.total_amount) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
        >
          مرحل ومعتمد
        </span>
      </template>

      <template #cell-journal_entry="{ item }">
        <div v-if="item.journal_entry" class="flex items-center gap-1">
          <span class="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
            #{{ item.journal_entry.entry_number }}
          </span>
        </div>
        <span v-else class="text-xs text-text-muted">---</span>
      </template>

      <template #cell-creator="{ item }">
        <span class="text-xs text-text-muted flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {{ item.creator?.name || 'النظام' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end">
          <AppButton
            size="sm"
            variant="secondary"
            @click="downloadBankFile(item)"
            :disabled="downloadingBatchId === item.id"
            class="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 border-primary/20"
            title="تحميل ملف البنك (WPS)"
          >
            <svg
              v-if="downloadingBatchId === item.id"
              class="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            ملف البنك
          </AppButton>
        </div>
      </template>
    </AppTable>
  </AppCard>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import payrollService from '@/modules/hr/services/payroll.service'
import { useToast } from 'vue-toastification'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const payrollStore = usePayrollStore()
const toast = useToast()

const tableHeaders = computed(() => [
  { key: 'date', label: 'شهر الاستحقاق', class: 'min-w-[120px]' },
  { key: 'description', label: 'البيان', class: 'min-w-[180px]' },
  { key: 'total_amount', label: 'إجمالي المسير', class: 'text-left min-w-[120px]' },
  { key: 'status', label: 'الحالة', class: 'text-center min-w-[100px]' },
  { key: 'journal_entry', label: 'رقم القيد', class: 'min-w-[100px]' },
  { key: 'creator', label: 'بواسطة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[120px]' }, // 🌟 العمود الجديد
])

const fetchData = () => {
  payrollStore.fetchBatchesHistory()
}

onMounted(() => {
  if (payrollStore.batchesHistory.length === 0) {
    fetchData()
  }
})

// 🌟 الجديد: دالة تحميل ملف البنك
const downloadingBatchId = ref(null)

const downloadBankFile = async (batch) => {
  try {
    downloadingBatchId.value = batch.id

    // استدعاء الخدمة لتحميل الملف كـ Blob
    const response = await payrollService.exportBankFile(batch.id)

    // إنشاء رابط وهمي في المتصفح لتحميل الملف
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    // تسمية الملف المحمل
    link.setAttribute('download', `Bank_Transfer_Batch_${batch.id}.csv`)
    document.body.appendChild(link)
    link.click()

    // تنظيف الرابط بعد التحميل
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('تم تحميل ملف البنك بنجاح')
  } catch (err) {
    toast.error('فشل تحميل ملف البنك، يرجى المحاولة لاحقاً')
    console.error('Download error:', err)
  } finally {
    downloadingBatchId.value = null
  }
}

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDateMonth = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
}
</script>
