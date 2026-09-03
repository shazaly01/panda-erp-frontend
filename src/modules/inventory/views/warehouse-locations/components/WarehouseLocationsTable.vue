<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="locations" :is-loading="loading">
      <template #cell-location_info="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span
            v-if="item.code"
            class="text-xs font-mono font-bold text-primary bg-primary/10 w-fit px-1.5 py-0.5 rounded tracking-wider"
          >
            {{ item.code }}
          </span>
        </div>
      </template>

      <template #cell-warehouse="{ item }">
        <span class="text-sm text-text-primary font-medium">
          {{ item.warehouse?.name || '---' }}
        </span>
      </template>

      <template #cell-type="{ item }">
        <span
          class="px-2.5 py-0.5 text-xs font-semibold rounded-full border w-fit"
          :class="getTypeBadgeClass(item.type)"
        >
          {{ getTypeLabel(item.type) }}
        </span>
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
            v-if="authStore.can('warehouse_location.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="تعديل الموقع"
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
            v-if="authStore.can('warehouse_location.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف الموقع"
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
  locations: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'location_info', label: 'الموقع والكود', class: 'min-w-[180px]' },
  { key: 'warehouse', label: 'المستودع', class: 'min-w-[150px]' },
  { key: 'type', label: 'نوع الموقع', class: 'min-w-[130px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

const getTypeLabel = (type) => {
  const map = {
    aisle: 'ممر (Aisle)',
    rack: 'صف رفوف (Rack)',
    shelf: 'رف (Shelf)',
    bin: 'صندوق (Bin)',
  }
  return map[type] || type || 'عام'
}

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'aisle':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400'
    case 'rack':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400'
    case 'shelf':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
    case 'bin':
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400'
  }
}
</script>
