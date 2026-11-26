<!--src/modules/hr/views/payroll/batches/PayrollSummaryCards.vue-->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
    <!-- 1. إجمالي صافي الاستحقاق (100%) -->
    <div
      class="bg-surface-section border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between"
    >
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-xs font-bold text-text-muted">إجمالي صافي الرواتب (100%)</span>
        <span class="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </div>
      <div>
        <span
          v-if="payrollStore.isSummaryLoading"
          class="animate-pulse inline-block h-7 w-28 bg-surface-border rounded"
        ></span>
        <span v-else class="text-xl font-bold font-mono text-text-primary">
          {{ formatCurrency(payrollStore.batchSummary.total_net) }}
        </span>
      </div>
    </div>

    <!-- 2. المبلغ المستلم للصرف (باستخدام AppCurrencyInput للتنسيق الفوري بالفواصل) -->
    <div
      class="bg-surface-section border border-primary/30 rounded-xl p-4 shadow-sm flex flex-col justify-between"
    >
      <div class="flex justify-between items-center gap-2 mb-1.5">
        <label for="disbursed-amount-input" class="text-xs font-bold text-text-primary">
          المبلغ المستلم للصرف
        </label>
        <div class="flex items-center gap-1.5">
          <span
            class="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
            :class="
              Number(payrollStore.disbursementPercentage) < 100
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            "
          >
            {{ payrollStore.disbursementPercentage }}%
          </span>
          <button
            v-if="payrollStore.hasCustomDisbursedAmount && !isDisabled"
            type="button"
            @click="payrollStore.resetDisbursedToFull()"
            class="text-[11px] text-primary hover:underline font-bold"
            title="إعادة المبلغ ليغطي 100% من الرواتب"
          >
            كامل
          </button>
        </div>
      </div>

      <div class="space-y-1.5">
        <AppCurrencyInput
          id="disbursed-amount-input"
          :model-value="payrollStore.disbursedAmount"
          @update:model-value="payrollStore.setDisbursedAmount"
          :disabled="isDisabled"
          symbol=""
          placeholder="0"
          input-class="!py-1.5 !text-base !text-emerald-600 dark:!text-emerald-400 !bg-surface-ground !rounded-lg"
        />

        <div
          v-if="remainingTotal > 0"
          class="flex justify-between items-center text-[11px] text-amber-600 dark:text-amber-400 font-medium"
        >
          <span>المتبقي (مديونية للموظفين):</span>
          <span class="font-mono font-bold">{{ formatCurrency(remainingTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- 3. الاستحقاقات والاستقطاعات -->
    <div
      class="bg-surface-section border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between"
    >
      <div class="flex justify-between items-center text-xs mb-2">
        <span class="text-text-muted font-medium">إجمالي الاستحقاقات</span>
        <span class="font-mono font-bold text-sm text-text-primary">
          <span
            v-if="payrollStore.isSummaryLoading"
            class="animate-pulse inline-block h-4 w-20 bg-surface-border rounded"
          ></span>
          <template v-else>{{
            formatCurrency(payrollStore.batchSummary.total_allowances)
          }}</template>
        </span>
      </div>

      <div class="pt-2 border-t border-surface-border flex justify-between items-center text-xs">
        <span class="text-text-muted font-medium">إجمالي الاستقطاعات</span>
        <span class="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
          <span
            v-if="payrollStore.isSummaryLoading"
            class="animate-pulse inline-block h-4 w-20 bg-surface-border rounded"
          ></span>
          <template v-else>{{
            formatCurrency(payrollStore.batchSummary.total_deductions)
          }}</template>
        </span>
      </div>
    </div>

    <!-- 4. الموظفين المحددين -->
    <div
      class="bg-surface-section border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between"
    >
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-xs font-bold text-text-muted">الموظفين المحددين</span>
        <span class="p-1.5 bg-primary/10 text-primary rounded-lg">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span
          v-if="payrollStore.isSummaryLoading"
          class="animate-pulse inline-block h-7 w-12 bg-surface-border rounded"
        ></span>
        <template v-else>
          <span class="text-xl font-bold font-mono text-text-primary">
            {{ payrollStore.batchSummary.employee_count }}
          </span>
          <span class="text-xs text-text-muted">موظف</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePayrollStore } from '@/modules/hr/stores/payrollStore'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const payrollStore = usePayrollStore()

const isDisabled = computed(() => {
  return payrollStore.isCurrentBatchLocked || payrollStore.isSummaryLoading
})

const remainingTotal = computed(() => {
  const net = Number(payrollStore.batchSummary.total_net || 0)
  const disbursed = Number(payrollStore.disbursedAmount || 0)
  return Math.max(0, Math.round((net - disbursed + Number.EPSILON) * 100) / 100)
})

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
