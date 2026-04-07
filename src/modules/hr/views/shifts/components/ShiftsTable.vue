<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="shifts" :is-loading="loading">
      <template #cell-name="{ item }">
        <span class="font-bold text-sm text-text-primary">
          {{ item.name }}
        </span>
      </template>

      <template #cell-times="{ item }">
        <div class="flex items-center gap-2 font-mono text-sm">
          <span class="text-emerald-600">{{ item.start_time }}</span>
          <span class="text-text-muted">-</span>
          <span class="text-rose-600">{{ item.end_time }}</span>
        </div>
      </template>

      <template #cell-grace="{ item }">
        <span class="text-sm text-text-secondary"> {{ item.grace_period_minutes }} دقيقة </span>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-1 text-[11px] font-bold rounded-full inline-flex items-center gap-1.5"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-surface-ground text-text-muted border border-surface-border'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_active ? 'bg-emerald-500' : 'bg-gray-400'"
          ></span>
          {{ item.is_active ? 'مفعلة' : 'غير مفعلة' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.shifts.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل الوردية"
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
            v-if="authStore.can('hr.shifts.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف الوردية"
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
  shifts: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'الوردية', class: 'min-w-[150px]' },
  { key: 'times', label: 'أوقات الدوام (من - إلى)', class: 'min-w-[150px]' },
  { key: 'grace', label: 'فترة السماح', class: 'min-w-[120px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
