<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="logs" :is-loading="loading">
      <template #cell-employee="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.employee_name }}
          </span>
          <span class="text-xs text-text-muted">
            التاريخ: <span class="font-mono">{{ item.date }}</span>
          </span>
        </div>
      </template>

      <template #cell-shift="{ item }">
        <span class="text-sm text-text-primary">
          {{ item.shift_name || '---' }}
        </span>
      </template>

      <template #cell-times="{ item }">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-text-primary">
            دخول:
            <span
              class="font-mono font-bold"
              :class="item.check_in ? 'text-primary' : 'text-text-muted'"
              >{{ item.check_in || '--:--' }}</span
            >
          </span>
          <span class="text-xs text-text-primary">
            خروج:
            <span
              class="font-mono font-bold"
              :class="item.check_out ? 'text-primary' : 'text-text-muted'"
              >{{ item.check_out || '--:--' }}</span
            >
          </span>
        </div>
      </template>

      <template #cell-calculations="{ item }">
        <div class="flex flex-col gap-1 text-[11px] font-mono">
          <span v-if="item.delay_minutes > 0" class="text-rose-600 font-bold">
            تأخير: {{ item.delay_minutes }} دقيقة
          </span>
          <span v-else class="text-text-muted">تأخير: 0</span>

          <span v-if="item.early_leave_minutes > 0" class="text-amber-600 font-bold">
            خروج مبكر: {{ item.early_leave_minutes }} دقيقة
          </span>

          <span v-if="item.overtime_minutes > 0" class="text-emerald-600 font-bold">
            إضافي: {{ item.overtime_minutes }} دقيقة
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-1 text-[11px] font-bold rounded-full inline-flex items-center gap-1.5"
          :class="getStatusClass(item.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.status)"></span>
          {{ getStatusLabel(item.status) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('attendance.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="تعديل السجل"
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
            v-if="authStore.can('attendance.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف السجل"
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
  logs: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف والتاريخ', class: 'min-w-[180px]' },
  { key: 'shift', label: 'الوردية', class: 'min-w-[120px]' },
  { key: 'times', label: 'البصمة (حضور / انصراف)', class: 'min-w-[160px]' },
  { key: 'calculations', label: 'تحليل الدقائق', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

// --- دوال مساعدة لتنسيق الحالة ---
const getStatusLabel = (status) => {
  const labels = {
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    on_leave: 'في إجازة',
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    present: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    absent: 'bg-rose-50 text-rose-700 border border-rose-100',
    late: 'bg-amber-50 text-amber-700 border border-amber-100',
    on_leave: 'bg-blue-50 text-blue-700 border border-blue-100',
  }
  return classes[status] || 'bg-surface-ground text-text-secondary border border-surface-border'
}

const getStatusDotClass = (status) => {
  const classes = {
    present: 'bg-emerald-500',
    absent: 'bg-rose-500',
    late: 'bg-amber-500',
    on_leave: 'bg-blue-500',
  }
  return classes[status] || 'bg-gray-400'
}
</script>
