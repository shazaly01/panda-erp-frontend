<!--src\modules\hr\views\payroll\batches\PayrollSummaryCards.vue-->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div
      class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm relative overflow-hidden"
    >
      <div class="absolute -right-4 -top-4 bg-emerald-500/10 w-16 h-16 rounded-full blur-xl"></div>
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-sm font-medium text-text-muted">إجمالي الصافي (للدفع)</h3>
        <div class="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-lg">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="payrollStore.isSummaryLoading"
          class="animate-pulse h-8 w-24 bg-surface-border rounded"
        ></span>
        <span v-else class="text-2xl font-bold font-mono text-emerald-600">
          {{ formatCurrency(payrollStore.batchSummary.total_net) }}
        </span>
      </div>
    </div>

    <div
      class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm relative overflow-hidden"
    >
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-sm font-medium text-text-muted">إجمالي الاستحقاقات</h3>
        <div class="p-2 bg-primary/10 text-primary rounded-lg">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="payrollStore.isSummaryLoading"
          class="animate-pulse h-8 w-24 bg-surface-border rounded"
        ></span>
        <span v-else class="text-2xl font-bold font-mono text-text-primary">
          {{ formatCurrency(payrollStore.batchSummary.total_allowances) }}
        </span>
      </div>
    </div>

    <div
      class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm relative overflow-hidden"
    >
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-sm font-medium text-text-muted">إجمالي الاستقطاعات</h3>
        <div class="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-lg">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="payrollStore.isSummaryLoading"
          class="animate-pulse h-8 w-24 bg-surface-border rounded"
        ></span>
        <span v-else class="text-2xl font-bold font-mono text-rose-600">
          {{ formatCurrency(payrollStore.batchSummary.total_deductions) }}
        </span>
      </div>
    </div>

    <div
      class="bg-surface-section border border-surface-border rounded-xl p-5 shadow-sm relative overflow-hidden"
    >
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-sm font-medium text-text-muted">الموظفين المحددين</h3>
        <div
          class="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="payrollStore.isSummaryLoading"
          class="animate-pulse h-8 w-12 bg-surface-border rounded"
        ></span>
        <span v-else class="text-2xl font-bold font-mono text-text-primary">
          {{ payrollStore.batchSummary.employee_count }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'

const payrollStore = usePayrollStore()

// دالة لتنسيق الأرقام بشكل محاسبي (فواصل الآلاف)
const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
