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
          سجل مسيرات الرواتب المعتمدة
        </h2>
        <p class="text-xs text-text-muted mt-1">
          قائمة بمسيرات الرواتب التي تم اعتمادها وترحيل قيودها المحاسبية لدفتر الأستاذ.
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
        <div class="flex flex-col py-1">
          <div class="flex items-center gap-1.5">
            <span
              class="font-mono font-bold text-xs bg-surface-ground px-2 py-0.5 rounded border border-surface-border text-primary"
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
        <div class="flex flex-col py-1">
          <span class="font-medium text-sm text-text-primary">
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

      <!-- خلية عدد الموظفين -->
      <template #cell-employees_count="{ item }">
        <span
          class="font-mono text-xs font-bold text-text-primary px-2.5 py-1 rounded-lg bg-surface-ground border border-surface-border"
        >
          {{ item.employees_count || item.payslips_count || 0 }} موظف
        </span>
      </template>

      <!-- خلية إجمالي المبلغ المالي -->
      <template #cell-total_amount="{ item }">
        <span class="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(item.total_amount) }}
        </span>
      </template>

      <!-- خلية رقم القيد المحاسبي -->
      <template #cell-journal_entry="{ item }">
        <div v-if="item.journal_entry || item.journalEntry" class="flex items-center gap-1">
          <span
            class="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
          >
            #{{ (item.journal_entry || item.journalEntry)?.entry_number }}
          </span>
        </div>
        <span v-else class="text-xs text-text-muted">---</span>
      </template>

      <!-- خلية المعتمد -->
      <template #cell-creator="{ item }">
        <span class="text-xs text-text-muted flex items-center gap-1">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {{ item.creator?.name || 'النظام' }}
        </span>
      </template>

      <!-- خلية الإجراءات (تصدير البنك + التراجع) -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-2">
          <AppButton
            size="sm"
            variant="secondary"
            @click="downloadBankFile(item)"
            :disabled="downloadingBatchId === item.id || payrollStore.isRollingBack"
            class="flex items-center gap-1.5 text-xs text-primary hover:bg-primary/10 border-primary/20"
            title="تحميل ملف التحويلات البنكية للمصارف (CSV)"
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
            v-if="authStore.can('hr.payroll.post')"
            size="sm"
            variant="secondary"
            @click="openRollbackModal(item)"
            :disabled="payrollStore.isRollingBack"
            class="flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
            title="إلغاء المسير والتراجع عن القيد المحاسبي"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            تراجع
          </AppButton>
        </div>
      </template>
    </AppTable>

    <!-- نافذة تأكيد التراجع وعكس القيد المحاسبي -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isRollbackModalOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeRollbackModal"
      >
        <Transition
          appear
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="bg-surface-section rounded-xl shadow-2xl p-6 w-full max-w-lg transform flex flex-col border border-surface-border"
            role="dialog"
          >
            <div
              class="flex justify-between items-center border-b border-surface-border pb-4 mb-5 shrink-0"
            >
              <h3 class="text-lg font-bold text-text-primary flex items-center gap-2">
                <span class="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </span>
                التراجع عن مسير الرواتب المعتمد
              </h3>
              <button
                @click="closeRollbackModal"
                :disabled="payrollStore.isRollingBack"
                class="text-text-muted hover:text-rose-500 p-1.5 rounded-full hover:bg-surface-border transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div
              class="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-lg mb-5 flex items-start gap-3"
            >
              <svg
                class="w-6 h-6 text-rose-600 dark:text-rose-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p class="text-sm font-bold text-rose-800 dark:text-rose-400">
                  هل أنت متأكد من إلغاء المسير ({{
                    selectedBatchForRollback?.number || `#BATCH-${selectedBatchForRollback?.id}`
                  }})؟
                </p>
                <p class="text-xs text-rose-700 dark:text-rose-500/80 mt-1 leading-relaxed">
                  هذا الإجراء سيقوم تلقائياً بتوليد قيد محاسبي عكسي في دفتر الأستاذ لإلغاء الأثر
                  المالي، وإعادة فتح الفترة المالية، وإعادة أقساط السلف والمدخلات المالية لحالة غير
                  معالجة حتى تتمكن من تصحيح ومعاينة المسير من جديد.
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <AppTextarea
                id="rollback-reason"
                label="سبب التراجع والإلغاء (يُسجل في بيان القيد العكسي) *"
                v-model="rollbackReason"
                placeholder="مثال: تصحيح ساعات غياب أو تعديل مكافآت للموظفين..."
                rows="3"
                required
              />
            </div>

            <div class="pt-5 mt-5 border-t border-surface-border flex justify-end gap-3 shrink-0">
              <AppButton
                variant="secondary"
                @click="closeRollbackModal"
                :disabled="payrollStore.isRollingBack"
              >
                إلغاء
              </AppButton>
              <AppButton
                @click="confirmRollback"
                :disabled="payrollStore.isRollingBack"
                class="bg-rose-600 hover:bg-rose-700 border-none text-white min-w-[140px]"
              >
                <span
                  v-if="payrollStore.isRollingBack"
                  class="flex items-center justify-center gap-2 w-full"
                >
                  <svg
                    class="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
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
                  جاري التراجع...
                </span>
                <span v-else class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  تأكيد التراجع
                </span>
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
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
import AppTextarea from '@/components/ui/AppTextarea.vue'

const authStore = useAuthStore()
const payrollStore = usePayrollStore()
const toast = useToast()

const tableHeaders = computed(() => [
  { key: 'batch_info', label: 'المسير / تاريخ الاعتماد', class: 'min-w-[170px]' },
  { key: 'description', label: 'البيان والفترة المالية', class: 'min-w-[200px]' },
  { key: 'run_type', label: 'نوع المسير', class: 'min-w-[130px]' },
  { key: 'employees_count', label: 'الموظفين', class: 'text-center min-w-[100px]' },
  { key: 'total_amount', label: 'إجمالي الصافي', class: 'text-left min-w-[130px]' },
  { key: 'journal_entry', label: 'رقم القيد', class: 'min-w-[110px]' },
  { key: 'creator', label: 'المعتمد', class: 'min-w-[120px]' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[210px]' },
])

const fetchData = () => {
  payrollStore.fetchBatchesHistory()
}

onMounted(() => {
  if (payrollStore.batchesHistory.length === 0) {
    fetchData()
  }
})

const downloadingBatchId = ref(null)

const downloadBankFile = async (batch) => {
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
    toast.error('فشل تحميل ملف البنك، يرجى المحاولة لاحقاً.')
    console.error('Download error:', err)
  } finally {
    downloadingBatchId.value = null
  }
}

// التحكم بنافذة التراجع وعكس القيد
const isRollbackModalOpen = ref(false)
const selectedBatchForRollback = ref(null)
const rollbackReason = ref('')

const openRollbackModal = (batch) => {
  selectedBatchForRollback.value = batch
  rollbackReason.value = ''
  isRollbackModalOpen.value = true
}

const closeRollbackModal = () => {
  if (payrollStore.isRollingBack) return
  isRollbackModalOpen.value = false
  selectedBatchForRollback.value = null
  rollbackReason.value = ''
}

const confirmRollback = async () => {
  if (!rollbackReason.value.trim()) {
    return toast.error('يرجى كتابة سبب التراجع والإلغاء.')
  }

  try {
    const res = await payrollStore.rollbackPayrollBatch(
      selectedBatchForRollback.value.id,
      rollbackReason.value.trim(),
    )
    toast.success(res?.message || 'تم التراجع عن مسير الرواتب بنجاح.')
    closeRollbackModal()
    fetchData()
  } catch (err) {
    // الخطأ يتم عرضه تلقائياً من الـ Store
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
