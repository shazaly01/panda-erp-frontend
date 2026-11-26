<template>
  <AppCard class="overflow-hidden border border-surface-border rounded-2xl shadow-sm">
    <div
      class="p-5 border-b border-surface-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-section"
    >
      <div>
        <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
          <span class="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </span>
          سجل مسيرات الرواتب
        </h2>
        <p class="text-xs text-text-muted mt-1">
          قائمة بمسيرات الرواتب المعتمدة والملغاة وقيودها المحاسبية؛ يمكنك تعديل أحدث مسير مباشرة
          طالما لم يُعتمد شهر أحدث منه.
        </p>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        @click="fetchData"
        :disabled="payrollStore.loading"
        class="text-xs"
      >
        <svg
          class="w-4 h-4 ml-1.5"
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
        تحديث السجل
      </AppButton>
    </div>

    <AppTable
      :headers="tableHeaders"
      :items="payrollStore.batchesHistory"
      :is-loading="payrollStore.loading"
    >
      <!-- خلية الرقم والتاريخ -->
      <template #cell-batch_info="{ item }">
        <div class="flex flex-col py-1" :class="{ 'opacity-65': isCancelled(item) }">
          <div class="flex items-center gap-1.5">
            <span
              class="font-mono font-bold text-xs bg-surface-ground px-2 py-0.5 rounded border border-surface-border"
              :class="isCancelled(item) ? 'text-text-muted line-through' : 'text-primary'"
            >
              {{ item.number || `#BATCH-${item.id}` }}
            </span>
          </div>
          <span class="text-xs text-text-muted mt-1 flex items-center gap-1">
            <svg
              class="w-3.5 h-3.5 text-text-muted"
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
            {{ formatFullDate(item.approved_at || item.created_at) }}
          </span>
        </div>
      </template>

      <!-- خلية البيان والفترة -->
      <template #cell-description="{ item }">
        <div class="flex flex-col py-1" :class="{ 'opacity-65': isCancelled(item) }">
          <span
            class="font-medium text-sm"
            :class="isCancelled(item) ? 'text-text-muted line-through' : 'text-text-primary'"
          >
            {{ item.name || 'مسير رواتب موظفين' }}
          </span>
          <span v-if="item.pay_period || item.payPeriod" class="text-xs text-text-muted mt-0.5">
            الفترة: {{ (item.pay_period || item.payPeriod)?.name }}
          </span>
        </div>
      </template>

      <!-- خلية نوع المسير -->
      <template #cell-run_type="{ item }">
        <span
          v-if="item.run_type === 'overtime_only'"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          إضافي / طوارئ
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          راتب اعتيادي
        </span>
      </template>

      <!-- خلية حالة المسير ونسبة الصرف -->
      <template #cell-status="{ item }">
        <div class="flex flex-col items-start gap-1">
          <span
            v-if="isCancelled(item)"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            ملغى
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            معتمد ومُرحّل
          </span>

          <span
            v-if="!isCancelled(item)"
            class="text-[11px] font-mono px-2 py-0.5 rounded border"
            :class="
              Number(item.disbursement_percentage ?? 100) < 100
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 font-bold'
                : 'bg-surface-ground text-text-muted border-surface-border'
            "
          >
            صرف: {{ Number(item.disbursement_percentage ?? 100) }}%
          </span>
        </div>
      </template>

      <!-- خلية عدد الموظفين -->
      <template #cell-employees_count="{ item }">
        <span
          class="font-mono text-xs font-bold text-text-primary px-2.5 py-1 rounded-lg bg-surface-ground border border-surface-border"
          :class="{ 'opacity-65': isCancelled(item) }"
        >
          {{ item.employees_count || item.payslips_count || 0 }} موظف
        </span>
      </template>

      <!-- خلية إجمالي المبلغ المالي والمصروف والمتبقي -->
      <template #cell-total_amount="{ item }">
        <div class="flex flex-col items-end" :class="{ 'opacity-65': isCancelled(item) }">
          <span
            class="font-mono font-bold text-sm"
            :class="
              isCancelled(item)
                ? 'text-text-muted line-through'
                : 'text-emerald-600 dark:text-emerald-400'
            "
          >
            {{ formatCurrency(item.total_amount) }}
          </span>
          <span
            v-if="!isCancelled(item) && Number(item.total_remaining || 0) > 0"
            class="text-[11px] font-mono text-amber-600 dark:text-amber-400"
          >
            متبقي: {{ formatCurrency(item.total_remaining) }}
          </span>
        </div>
      </template>

      <!-- خلية رقم القيد المحاسبي -->
      <template #cell-journal_entry="{ item }">
        <div v-if="item.journal_entry || item.journalEntry" class="flex items-center gap-1">
          <span
            class="text-xs font-mono font-bold px-2 py-0.5 rounded border"
            :class="
              isCancelled(item)
                ? 'text-text-muted bg-surface-ground border-surface-border line-through'
                : 'text-primary bg-primary/10 border-primary/20'
            "
          >
            #{{ (item.journal_entry || item.journalEntry)?.entry_number }}
          </span>
        </div>
        <span v-else class="text-xs text-text-muted">---</span>
      </template>

      <!-- خلية الإجراءات (تصدير البنك + التعديل المباشر للمسير المفتوح زمنياً) -->
      <template #cell-actions="{ item }">
        <div v-if="isCancelled(item)" class="flex items-center justify-end">
          <span
            class="text-[11px] font-medium text-text-muted bg-surface-ground border border-surface-border px-2.5 py-1 rounded-lg"
          >
            مسير ملغى
          </span>
        </div>

        <div v-else class="flex items-center justify-end gap-2">
          <AppButton
            size="sm"
            variant="secondary"
            @click="downloadBankFile(item)"
            :disabled="
              downloadingBatchId === item.id ||
              Number(item.disbursed_amount ?? item.total_amount) <= 0
            "
            class="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/10 border-primary/20"
            :title="
              Number(item.disbursed_amount ?? item.total_amount) <= 0
                ? 'نسبة الصرف 0% (لا يوجد مبلغ للتحويل البنكي)'
                : 'تحميل ملف التحويلات البنكية للمبالغ المقرر صرفها (CSV)'
            "
          >
            <svg
              v-if="downloadingBatchId === item.id"
              class="animate-spin w-3.5 h-3.5"
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
            <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            ملف البنك
          </AppButton>

          <AppButton
            v-if="item.can_edit && authStore.can('hr.payroll.post')"
            size="sm"
            variant="secondary"
            @click="emit('edit-batch', item)"
            class="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
            title="فتح المسير لتحديث بياناته أو تعديل نسبة الصرف والموظفين"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            تعديل
          </AppButton>

          <span
            v-else-if="!item.can_edit"
            class="text-[11px] font-medium text-text-muted bg-surface-ground border border-surface-border px-2.5 py-1 rounded-lg"
            title="لا يمكن التعديل لوجود شهر أحدث معتمد"
          >
            مقفل
          </span>
        </div>
      </template>
    </AppTable>
  </AppCard>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import payrollService from '@/modules/hr/services/payroll.service'
import { useToast } from 'vue-toastification'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const emit = defineEmits(['edit-batch'])

const authStore = useAuthStore()
const payrollStore = usePayrollStore()
const toast = useToast()

const isCancelled = (batch) => batch?.status === 'cancelled'

const tableHeaders = computed(() => [
  { key: 'batch_info', label: 'المسير / تاريخ الاعتماد', class: 'min-w-[165px]' },
  { key: 'description', label: 'البيان والفترة المالية', class: 'min-w-[200px]' },
  { key: 'run_type', label: 'نوع المسير', class: 'min-w-[125px]' },
  { key: 'status', label: 'الحالة والصرف', class: 'min-w-[135px]' },
  { key: 'employees_count', label: 'الموظفين', class: 'text-center min-w-[95px]' },
  { key: 'total_amount', label: 'إجمالي الصافي', class: 'text-left min-w-[140px]' },
  { key: 'journal_entry', label: 'رقم القيد', class: 'min-w-[105px]' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[195px]' },
])

const fetchData = () => {
  return payrollStore.fetchBatchesHistory()
}

onMounted(() => {
  if (payrollStore.batchesHistory.length === 0) {
    fetchData()
  }
})

const downloadingBatchId = ref(null)

const downloadBankFile = async (batch) => {
  if (isCancelled(batch)) return

  try {
    downloadingBatchId.value = batch.id
    const response = await payrollService.exportBankFile(batch.id)

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'text/csv;charset=utf-8;' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Bank_Transfer_Batch_${batch.number || batch.id}.csv`)
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('تم تصدير ملف البنك بنجاح.')
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'فشل تحميل ملف البنك، يرجى المحاولة لاحقاً.'
    toast.error(errorMsg)
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

const formatFullDate = (dateString) => {
  if (!dateString) return '---'
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
