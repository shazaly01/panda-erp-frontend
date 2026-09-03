<!---src\modules\inventory\views\units\components\UnitsTable.vue--->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="units" :is-loading="loading">
      <template #cell-unit_info="{ item }">
        <div class="flex items-center gap-2 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span
            v-if="item.symbol"
            class="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-wider"
          >
            {{ item.symbol }}
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>
          {{ item.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('unit.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="تعديل وحدة القياس"
            type="button"
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
            v-if="authStore.can('unit.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف وحدة القياس"
            type="button"
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
  units: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'unit_info', label: 'وحدة القياس والرمز', class: 'min-w-[200px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
