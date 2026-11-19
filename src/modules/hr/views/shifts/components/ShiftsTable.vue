<!-- src/modules/hr/views/shifts/components/ShiftsTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="shifts" :is-loading="loading">
      <!-- 1. اسم الوردية -->
      <template #cell-name="{ item }">
        <div class="flex items-center gap-2 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.name }}
          </span>
        </div>
      </template>

      <!-- 2. أوقات الدوام (من - إلى) -->
      <template #cell-times="{ item }">
        <div class="flex items-center justify-center gap-1.5 font-mono text-xs" dir="rtl">
          <span
            class="px-2 py-0.5 rounded-lg bg-success/10 border border-success/25 font-bold text-success"
          >
            {{ item.start_time }}
          </span>
          <span class="text-text-muted text-[10px] font-sans font-bold">إلى</span>
          <span
            class="px-2 py-0.5 rounded-lg bg-danger/10 border border-danger/25 font-bold text-danger"
          >
            {{ item.end_time }}
          </span>
        </div>
      </template>

      <!-- 3. فترة السماح -->
      <template #cell-grace="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge variant="info" size="xs" class="font-mono">
            {{ item.grace_period_minutes ?? 0 }} دقيقة
          </AppBadge>
        </div>
      </template>

      <!-- 4. الحالة -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.is_active ? 'success' : 'danger'" size="xs" pill>
            {{ item.is_active ? 'مفعلة' : 'غير مفعلة' }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.shifts.update')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الوردية"
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
            v-if="authStore.can('hr.shifts.delete')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الوردية"
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

    <AppPagination :meta="pagination || {}" @page-change="$emit('page-change', $event)" />
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
  shifts: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'الوردية', class: 'min-w-[160px]' },
  { key: 'times', label: 'أوقات الدوام (من - إلى)', class: 'min-w-[170px] text-center' },
  { key: 'grace', label: 'فترة السماح', class: 'min-w-[130px] text-center' },
  { key: 'status', label: 'الحالة', class: 'min-w-[110px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])
</script>
