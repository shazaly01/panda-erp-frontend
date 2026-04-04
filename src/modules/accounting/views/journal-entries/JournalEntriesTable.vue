<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="journalEntries"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('view', $event)"
    >
      <template #cell-entry_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <div class="flex items-center gap-2">
            <span
              v-if="item.entry_number"
              class="font-mono font-bold text-sm bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 rounded tracking-wider"
            >
              #{{ item.entry_number }}
            </span>
            <span
              v-else
              class="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded"
            >
              مسودة (Draft)
            </span>
          </div>
          <div class="flex items-center gap-1 text-xs text-text-muted font-medium">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span dir="ltr">{{ item.date }}</span>
          </div>
        </div>
      </template>

      <template #cell-description="{ item }">
        <span
          class="text-sm font-medium text-text-primary line-clamp-2 max-w-[250px]"
          :title="item.description"
        >
          {{ item.description }}
        </span>
      </template>

      <template #cell-amount="{ item }">
        <div class="flex flex-col gap-1">
          <span class="font-mono font-bold text-text-primary text-sm">
            {{ formatNumber(item.total_debit) }}
          </span>
          <span class="text-[10px] text-text-muted"> إجمالي المدين/الدائن </span>
        </div>
      </template>

      <template #cell-source="{ item }">
        <span
          class="text-xs font-medium text-text-secondary bg-surface-bg border border-surface-border px-2 py-1 rounded"
        >
          {{ item.source_label || item.source }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5',
            item.status === 'posted'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-600 border-gray-200',
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full animate-pulse',
              item.status === 'posted' ? 'bg-emerald-500' : 'bg-gray-400',
            ]"
          ></span>
          {{ item.status_label || (item.status === 'posted' ? 'مُرحل' : 'مسودة') }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            @click.stop="$emit('view', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="عرض التفاصيل"
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
            v-if="item.status !== 'posted' && authStore.can('journal_entry.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل القيد"
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
            v-if="item.status !== 'posted' && authStore.can('journal_entry.post')"
            @click.stop="$emit('post', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="ترحيل القيد للاعتماد"
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
            v-if="authStore.can('journal_entry.delete')"
            @click.stop="item.status !== 'posted' ? $emit('delete', item) : null"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.status === 'posted'
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50',
            ]"
            :title="item.status === 'posted' ? 'لا يمكن حذف قيد مُرحل' : 'حذف القيد'"
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
  journalEntries: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['page-change', 'view', 'edit', 'post', 'delete'])

const authStore = useAuthStore()

// تنسيق الأرقام بفاصلة الألوف وعلامتين عشريتين
const formatNumber = (num) => {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const tableHeaders = computed(() => {
  const headers = [
    { key: 'entry_info', label: 'رقم وتاريخ القيد', class: 'min-w-[150px]' },
    { key: 'description', label: 'البيان', class: 'min-w-[200px]' },
    { key: 'amount', label: 'الإجمالي', class: 'text-left min-w-[120px]' },
    { key: 'source', label: 'المصدر', class: 'text-center min-w-[100px]' },
    { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  ]

  // إظهار عمود الإجراءات دائماً لوجود زر "عرض التفاصيل"
  headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[160px]' })

  return headers
})
</script>
