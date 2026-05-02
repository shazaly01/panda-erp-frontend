<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="overrides" :is-loading="loading">
      <!-- الموظف -->
      <template #cell-employee="{ item }">
        <div class="flex flex-col py-1">
          <span class="font-bold text-sm text-text-primary">{{
            item.employee?.full_name || 'غير محدد'
          }}</span>
          <span class="text-xs font-mono text-text-muted"
            >#{{ item.employee?.employee_number }}</span
          >
        </div>
      </template>

      <!-- التاريخ -->
      <template #cell-date="{ item }">
        <span class="font-mono font-medium text-text-primary">
          {{ new Date(item.date).toLocaleDateString('ar-EG') }}
        </span>
      </template>

      <!-- الوردية الجديدة (القرار) -->
      <template #cell-new_shift="{ item }">
        <span
          v-if="!item.new_shift_id"
          class="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200"
        >
          إعفاء (يوم راحة)
        </span>
        <div v-else class="flex flex-col">
          <span class="text-sm font-bold text-blue-600">
            {{ item.newShift?.name }}
          </span>
          <span v-if="item.newShift" class="text-[10px] text-text-muted font-mono">
            {{ item.newShift.start_time?.substring(0, 5) }} -
            {{ item.newShift.end_time?.substring(0, 5) }}
          </span>
        </div>
      </template>

      <!-- السبب -->
      <template #cell-reason="{ item }">
        <span
          class="text-xs text-text-muted truncate max-w-[200px] inline-block"
          :title="item.reason"
        >
          {{ item.reason || '—' }}
        </span>
      </template>

      <!-- الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr.shift_overrides.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل التجاوز"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr.shift_overrides.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="إلغاء التجاوز"
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
  overrides: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف', class: 'min-w-[200px]' },
  { key: 'date', label: 'تاريخ التجاوز', class: 'min-w-[130px]' },
  { key: 'new_shift', label: 'القرار (الوردية)', class: 'min-w-[160px]' },
  { key: 'reason', label: 'السبب', class: 'min-w-[200px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
