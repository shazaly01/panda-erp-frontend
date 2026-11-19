<!-- src/modules/inventory/views/warehouses/components/WarehousesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="warehouses" :is-loading="loading">
      <!-- 1. اسم المستودع والكود -->
      <template #cell-warehouse_info="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.name }}
          </span>
          <AppBadge v-if="item.code" variant="primary" size="sm" class="font-mono tracking-wider">
            {{ item.code }}
          </AppBadge>
        </div>
      </template>

      <!-- 2. مدير / مسؤول المستودع -->
      <template #cell-manager="{ item }">
        <div class="text-right" dir="rtl">
          <span v-if="item.manager?.name" class="text-xs font-bold text-text-primary">
            {{ item.manager.name }}
          </span>
          <span v-else class="text-xs text-text-muted font-mono">---</span>
        </div>
      </template>

      <!-- 3. بيانات الاتصال والعنوان -->
      <template #cell-contact="{ item }">
        <div class="flex flex-col text-xs text-text-muted gap-0.5 max-w-xs text-right" dir="rtl">
          <span v-if="item.phone" class="font-mono font-semibold text-text-secondary">
            {{ item.phone }}
          </span>
          <span v-if="item.address" class="truncate" :title="item.address">
            {{ item.address }}
          </span>
          <span v-if="!item.phone && !item.address" class="font-mono">---</span>
        </div>
      </template>

      <!-- 4. حالة المستودع -->
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
            v-if="authStore.can('warehouse.update')"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل بيانات المستودع"
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
            v-if="authStore.can('warehouse.delete')"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف المستودع"
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
  warehouses: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'warehouse_info', label: 'المستودع والكود', class: 'min-w-[180px]' },
  { key: 'manager', label: 'المسؤول', class: 'min-w-[150px]' },
  { key: 'contact', label: 'الاتصال والعنوان', class: 'min-w-[200px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])
</script>
