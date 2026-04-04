<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="currencies"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-currency_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.name }}
          </span>
          <div class="flex items-center gap-2">
            <span
              class="text-[11px] font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded tracking-wider"
            >
              {{ item.code }}
            </span>
            <span
              class="text-xs font-medium text-text-muted bg-surface-border px-1.5 py-0.5 rounded"
            >
              الرمز: {{ item.symbol }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-exchange_rate="{ item }">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-text-primary">
            {{ formatExchangeRate(item.exchange_rate) }}
          </span>
        </div>
      </template>

      <template #cell-properties="{ item }">
        <div class="flex flex-col gap-2 items-start">
          <span
            v-if="item.is_base"
            class="px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            العملة الأساسية
          </span>

          <span
            :class="[
              'px-2 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1',
              item.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-600 border-gray-200',
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                item.is_active ? 'bg-emerald-500' : 'bg-gray-400',
              ]"
            ></span>
            {{ item.is_active ? 'نشطة' : 'غير نشطة' }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('currency.update')"
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
            v-if="authStore.can('currency.delete')"
            @click.stop="$emit('delete', item)"
            :disabled="item.is_base"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.is_base
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50',
            ]"
            :title="item.is_base ? 'لا يمكن حذف العملة الأساسية' : 'حذف'"
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

    <AppPagination
      v-if="pagination && pagination.total"
      :meta="pagination"
      @page-change="$emit('page-change', $event)"
    />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  currencies: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['page-change', 'edit', 'delete', 'row-clicked'])

const authStore = useAuthStore()

// دالة لتنسيق سعر الصرف ليكون دائماً بـ 6 خانات عشرية (مثل 1.000000 أو 4.850000)
const formatExchangeRate = (rate) => {
  if (!rate) return '0.000000'
  return Number(rate).toFixed(6)
}

const tableHeaders = computed(() => {
  const headers = [
    { key: 'currency_info', label: 'تفاصيل العملة', class: 'min-w-[200px]' },
    { key: 'exchange_rate', label: 'سعر الصرف' },
    { key: 'properties', label: 'الخصائص', class: 'min-w-[150px]' },
  ]

  if (authStore.can('currency.update') || authStore.can('currency.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
