<!--src/modules/accounting/views/vouchers/VouchersTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="vouchers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('edit', $event)"
    >
      <template #cell-voucher_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                (item.type || type) === 'receipt'
                  ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/30',
              ]"
            >
              {{ item.type_label || (type === 'receipt' ? 'سند قبض' : 'سند صرف') }}
            </span>
            <span class="font-mono font-bold text-sm text-text-primary tracking-wider">
              {{ item.number }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-text-muted">
            <span dir="ltr" class="font-mono">{{ item.date }}</span>
            <span
              v-if="item.branch?.name"
              class="px-2 py-0.5 bg-surface-card border border-surface-border text-text-secondary font-semibold rounded-md truncate max-w-[130px]"
            >
              فرع: {{ item.branch.name }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-payment_info="{ item }">
        <div v-if="item.payment_method" class="flex items-center gap-2">
          <span class="text-lg" title="وسيلة الدفع">
            {{ item.payment_method.type === 'bank' ? '🏦' : '💵' }}
          </span>
          <div class="flex flex-col">
            <span class="text-[10px] text-text-muted uppercase">
              {{ item.payment_method.type === 'bank' ? 'حساب بنكي' : 'خزينة نقدية' }}
            </span>
            <span class="text-xs font-semibold text-text-primary truncate max-w-[180px]">
              {{ item.payment_method.name }}
            </span>
          </div>
        </div>
        <div v-else class="text-xs text-danger font-bold">غير محدد</div>
      </template>

      <template #cell-amount="{ item }">
        <div class="flex flex-col gap-1">
          <span
            class="font-mono font-bold text-sm"
            :class="
              (item.type || type) === 'receipt'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            "
          >
            {{ (item.type || type) === 'payment' ? '-' : '+' }} {{ formatNumber(item.amount) }}
          </span>
          <span class="text-[10px] text-text-muted font-bold tracking-widest uppercase">
            {{ item.currency?.code || '---' }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5',
            item.status === 'posted'
              ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : item.status === 'approved'
                ? 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30'
                : 'bg-surface-card text-text-secondary border-surface-border',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              item.status === 'posted'
                ? 'bg-emerald-500'
                : item.status === 'approved'
                  ? 'bg-sky-500 animate-pulse'
                  : 'bg-text-muted',
            ]"
          ></span>
          {{ item.status_label || item.status }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <!-- زر الطباعة المباشرة للسند -->
          <button
            @click.stop="$emit('print', item)"
            class="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة السند الورقي"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <!-- زر عرض السند -->
          <button
            @click.stop="$emit('view', item)"
            class="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
            title="عرض السند"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <!-- زر اعتماد السند -->
          <button
            v-if="item.status === 'draft' && authStore.can(`${type}.approve`)"
            @click.stop="$emit('approve', item)"
            class="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
            title="اعتماد السند"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </button>

          <!-- زر تعديل السند (مباشر للمسودات والسندات المُرحّلة حسب الصلاحية) -->
          <button
            v-if="item.status !== 'void' && authStore.can(`${type}.update`)"
            @click.stop="$emit('edit', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              item.status === 'posted'
                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10',
            ]"
            :title="item.status === 'posted' ? 'تعديل مباشر للسند المُرحّل' : 'تعديل'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <!-- زر ترحيل السند -->
          <button
            v-if="item.status !== 'posted' && authStore.can(`${type}.post`)"
            @click.stop="$emit('post', item)"
            class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
            title="ترحيل وتحويل لقيد يومية"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- زر حذف السند (مباشر للمسودات والسندات المُرحّلة حسب الصلاحية) -->
          <button
            v-if="authStore.can(`${type}.delete`)"
            @click.stop="$emit('delete', item)"
            class="p-1.5 rounded-lg transition-colors text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
            :title="item.status === 'posted' ? 'حذف السند المُرحّل وقيده المحاسبي' : 'حذف'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

defineProps({
  vouchers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  type: { type: String, required: true },
})

defineEmits(['page-change', 'view', 'edit', 'post', 'unpost', 'delete', 'approve', 'print'])

const authStore = useAuthStore()

const formatNumber = (num) => {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const tableHeaders = computed(() => {
  const headers = [
    { key: 'voucher_info', label: 'رقم وتاريخ السند', class: 'min-w-[160px]' },
    { key: 'payment_info', label: 'وسيلة الدفع', class: 'min-w-[180px]' },
    { key: 'amount', label: 'المبلغ الإجمالي', class: 'text-left min-w-[120px]' },
    { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
    { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[170px]' },
  ]
  return headers
})
</script>
