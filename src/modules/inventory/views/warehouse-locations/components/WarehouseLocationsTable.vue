<!-- src/modules/inventory/views/warehouse-locations/components/WarehouseLocationsTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="locations" :is-loading="loading">
      <!-- 1. اسم الموقع والكود -->
      <template #cell-location_info="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.name }}
          </span>
          <AppBadge v-if="item.code" variant="primary" size="sm" class="font-mono tracking-wider">
            {{ item.code }}
          </AppBadge>
        </div>
      </template>

      <!-- 2. المستودع التابع له -->
      <template #cell-warehouse="{ item }">
        <div class="text-right" dir="rtl">
          <span v-if="item.warehouse?.name" class="text-xs font-bold text-text-primary">
            {{ item.warehouse.name }}
          </span>
          <span v-else class="text-xs text-text-muted font-mono">---</span>
        </div>
      </template>

      <!-- 3. نوع الموقع -->
      <template #cell-type="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="getTypeBadgeVariant(item.type)" size="xs" pill>
            {{ getTypeLabel(item.type) }}
          </AppBadge>
        </div>
      </template>

      <!-- 4. حالة الموقع -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.is_active ? 'success' : 'danger'" size="xs" pill>
            {{ item.is_active ? 'نشط' : 'موقوف' }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('warehouse_location.update')"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الموقع"
            type="button"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الموقع"
            type="button"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import AppBadge from '@/components/ui/AppBadge.vue'

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
  { key: 'type', label: 'نوع الموقع', class: 'min-w-[130px] text-center' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
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

const getTypeBadgeVariant = (type) => {
  switch (type) {
    case 'aisle':
      return 'primary'
    case 'rack':
      return 'info'
    case 'shelf':
      return 'warning'
    case 'bin':
      return 'success'
    default:
      return 'secondary'
  }
}
</script>
