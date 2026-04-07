<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="inputs" :is-loading="loading">
      <template #cell-employee="{ item }">
        <span class="font-bold text-sm text-text-primary">
          {{ item.employee_name }}
        </span>
      </template>

      <template #cell-details="{ item }">
        <div class="flex flex-col">
          <span
            class="px-2 py-0.5 text-[10px] font-bold rounded w-fit mb-1"
            :class="getTypeClass(item.type)"
          >
            {{ getTypeLabel(item.type) }}
          </span>
          <span class="text-sm font-bold font-mono">
            {{ item.amount }}
          </span>
        </div>
      </template>

      <template #cell-reason="{ item }">
        <div class="flex flex-col">
          <span class="text-xs text-text-muted">{{ item.date }}</span>
          <span class="text-xs text-text-primary truncate max-w-xs" :title="item.reason">
            {{ item.reason }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center w-fit gap-1.5"
          :class="
            item.is_processed
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_processed ? 'bg-blue-500' : 'bg-amber-500'"
          ></span>
          {{ item.is_processed ? 'تم الترحيل' : 'انتظار' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <template v-if="!item.is_processed">
            <button
              v-if="authStore.can('payroll_input.update')"
              @click.stop="$emit('edit', item)"
              class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
              v-if="authStore.can('payroll_input.delete')"
              @click.stop="$emit('delete', item)"
              class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          </template>
          <span v-else class="text-[10px] text-text-muted italic px-2">مغلق (تم الترحيل)</span>
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
  inputs: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف', class: 'min-w-[180px]' },
  { key: 'details', label: 'النوع والمبلغ', class: 'min-w-[120px]' },
  { key: 'reason', label: 'السبب والتاريخ', class: 'min-w-[200px]' },
  { key: 'status', label: 'حالة الحركة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

const getTypeLabel = (type) => {
  const labels = { bonus: 'حافز', penalty: 'جزاء', allowance: 'بدل', deduction: 'استقطاع' }
  return labels[type] || type
}

const getTypeClass = (type) => {
  const classes = {
    bonus: 'bg-emerald-50 text-emerald-700',
    penalty: 'bg-rose-50 text-rose-700',
    allowance: 'bg-sky-50 text-sky-700',
    deduction: 'bg-amber-50 text-amber-700',
  }
  return classes[type] || ''
}
</script>
