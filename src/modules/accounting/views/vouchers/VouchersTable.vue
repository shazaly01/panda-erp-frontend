<!--src\modules\accounting\views\vouchers\VouchersTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="vouchers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('view', $event)"
    >
      <template #cell-voucher_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                (item.type || type) === 'receipt'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200',
              ]"
            >
              {{ item.type_label || (type === 'receipt' ? 'سند قبض' : 'سند صرف') }}
            </span>
            <span class="font-mono font-bold text-sm text-text-primary tracking-wider">
              {{ item.number }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-text-muted">
            <span dir="ltr">{{ item.date }}</span>
            <span
              v-if="item.branch?.name"
              class="px-1.5 bg-surface-border rounded-sm truncate max-w-[120px]"
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
        <div v-else class="text-xs text-rose-500 font-medium">غير محدد</div>
      </template>

      <template #cell-amount="{ item }">
        <div class="flex flex-col gap-1">
          <span
            class="font-mono font-bold text-sm"
            :class="(item.type || type) === 'receipt' ? 'text-emerald-600' : 'text-rose-600'"
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
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : item.status === 'approved'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-600 border-gray-200',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              item.status === 'posted'
                ? 'bg-emerald-500'
                : item.status === 'approved'
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-gray-400',
            ]"
          ></span>
          {{ item.status_label || item.status }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            @click.stop="$emit('view', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
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

          <button
            v-if="item.status === 'draft' && authStore.can(`${type}.approve`)"
            @click.stop="$emit('approve', item)"
            class="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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

          <button
            v-if="item.status !== 'posted' && authStore.can(`${type}.update`)"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل"
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

          <button
            v-if="item.status !== 'posted' && authStore.can(`${type}.post`)"
            @click.stop="$emit('post', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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

          <button
            v-if="authStore.can(`${type}.delete`)"
            @click.stop="item.status !== 'posted' ? $emit('delete', item) : null"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.status === 'posted'
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50',
            ]"
            :title="item.status === 'posted' ? 'مُرحل (لا يمكن حذفه)' : 'حذف'"
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

const props = defineProps({
  vouchers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  // التعديل هنا: استقبال النوع من الشاشة الأب
  type: { type: String, required: true },
})

const emit = defineEmits(['page-change', 'view', 'edit', 'post', 'delete', 'approve'])

const authStore = useAuthStore()

const formatNumber = (num) => {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const tableHeaders = computed(() => {
  const headers = [
    { key: 'voucher_info', label: 'رقم وتاريخ السند', class: 'min-w-[160px]' }, // عدلت المسمى قليلاً ليكون أدق
    { key: 'payment_info', label: 'وسيلة الدفع', class: 'min-w-[180px]' },
    { key: 'amount', label: 'المبلغ الإجمالي', class: 'text-left min-w-[120px]' },
    { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
    { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[150px]' },
  ]
  return headers
})
</script>
