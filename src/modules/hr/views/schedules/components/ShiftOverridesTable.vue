<!-- src/modules/hr/views/shift-overrides/components/ShiftOverridesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="overrides" :is-loading="loading">
      <!-- 1. الموظف -->
      <template #cell-employee="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.employee?.full_name || 'غير محدد' }}
          </span>
          <AppBadge
            v-if="item.employee?.employee_number"
            variant="primary"
            size="xs"
            class="font-mono"
          >
            #{{ item.employee.employee_number }}
          </AppBadge>
        </div>
      </template>

      <!-- 2. التاريخ -->
      <template #cell-date="{ item }">
        <div class="text-center" dir="rtl">
          <span class="font-mono font-bold text-xs text-text-primary">
            {{ new Date(item.date).toLocaleDateString('ar-EG') }}
          </span>
        </div>
      </template>

      <!-- 3. الوردية الجديدة (القرار) -->
      <template #cell-new_shift="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge v-if="!item.new_shift_id" variant="warning" size="xs" pill>
            إعفاء (يوم راحة)
          </AppBadge>

          <div v-else class="flex flex-col items-center gap-0.5">
            <span class="text-xs font-black text-info">
              {{ item.newShift?.name }}
            </span>
            <span v-if="item.newShift" class="text-[11px] text-text-secondary font-mono">
              {{ item.newShift.start_time?.substring(0, 5) }} -
              {{ item.newShift.end_time?.substring(0, 5) }}
            </span>
          </div>
        </div>
      </template>

      <!-- 4. السبب -->
      <template #cell-reason="{ item }">
        <div class="text-right" dir="rtl">
          <span
            class="text-xs text-text-secondary truncate max-w-[220px] inline-block"
            :title="item.reason"
          >
            {{ item.reason || '—' }}
          </span>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.shift_overrides.update')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل التجاوز"
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
            v-if="authStore.can('hr.shift_overrides.delete')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="إلغاء التجاوز"
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
  overrides: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف', class: 'min-w-[200px]' },
  { key: 'date', label: 'تاريخ التجاوز', class: 'min-w-[130px] text-center' },
  { key: 'new_shift', label: 'القرار (الوردية)', class: 'min-w-[170px] text-center' },
  { key: 'reason', label: 'السبب', class: 'min-w-[200px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])
</script>
