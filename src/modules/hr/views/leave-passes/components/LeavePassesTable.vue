<!-- src/modules/hr/views/leave-passes/components/LeavePassesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="leavePasses" :is-loading="loading">
      <!-- 1. بيانات الموظف -->
      <template #cell-employee_info="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.employee?.full_name || '---' }}
          </span>
          <div class="flex items-center gap-1.5 flex-wrap text-xs text-text-muted">
            <AppBadge variant="secondary" size="xs" class="font-mono">
              #{{ item.employee?.employee_number || '---' }}
            </AppBadge>
            <span v-if="item.employee?.phone" dir="ltr" class="font-mono text-[11px]">
              {{ item.employee.phone }}
            </span>
          </div>
        </div>
      </template>

      <!-- 2. الوقت المخطط اليوم -->
      <template #cell-time_window="{ item }">
        <div class="flex items-center justify-center gap-1.5 text-xs py-1" dir="rtl">
          <span
            class="px-2 py-0.5 rounded-lg bg-surface-ground border border-surface-border font-mono font-bold text-text-primary"
          >
            {{ item.requested_leave_at }}
          </span>
          <span class="text-text-muted text-[10px] font-bold">إلى</span>
          <span
            class="px-2 py-0.5 rounded-lg bg-surface-ground border border-surface-border font-mono font-bold text-text-primary"
          >
            {{ item.requested_return_at }}
          </span>
        </div>
      </template>

      <!-- 3. الحركة الفعلية (البوابة) -->
      <template #cell-actual_time="{ item }">
        <div class="flex flex-col items-center gap-0.5 text-[11px] py-1" dir="rtl">
          <div v-if="item.actual_leave_at" class="text-warning font-mono font-bold">
            خروج: {{ item.actual_leave_at.substring(11, 16) }}
          </div>
          <div v-if="item.actual_return_at" class="text-info font-mono font-bold">
            عودة: {{ item.actual_return_at.substring(11, 16) }}
          </div>
          <span
            v-if="!item.actual_leave_at && !item.actual_return_at"
            class="text-text-muted/50 font-mono"
          >
            —
          </span>
        </div>
      </template>

      <!-- 4. رمز الإذن (QR) -->
      <template #cell-pass_code="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge variant="primary" size="sm" class="font-mono tracking-wider select-all">
            {{ item.pass_code }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. الحالة الحركية -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="getStatusVariant(item.status)" size="xs" pill>
            {{ getStatusLabel(item.status) }}
          </AppBadge>
        </div>
      </template>

      <!-- 6. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr_leave_passes.update')"
            type="button"
            @click="$emit('edit', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              isLocked(item)
                ? 'text-text-muted/35 cursor-not-allowed'
                : 'text-primary hover:bg-primary/10 cursor-pointer',
            ]"
            :title="isLocked(item) ? 'لا يمكن التعديل بعد التحرك الفعلي' : 'تعديل الإذن'"
            :disabled="isLocked(item)"
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
            v-if="authStore.can('hr_leave_passes.delete')"
            type="button"
            @click="$emit('delete', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              isLocked(item)
                ? 'text-text-muted/35 cursor-not-allowed'
                : 'text-danger hover:bg-danger/10 cursor-pointer',
            ]"
            :title="
              isLocked(item) ? 'لا يمكن الحذف بعد توثيق الحركة أمنياً' : 'إلغاء الإذن نهائياً'
            "
            :disabled="isLocked(item)"
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
  leavePasses: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee_info', label: 'الموظف', class: 'min-w-[210px]' },
  { key: 'time_window', label: 'الوقت المخطط اليوم', class: 'min-w-[160px] text-center' },
  { key: 'actual_time', label: 'الحركة الفعلية (البوابة)', class: 'min-w-[150px] text-center' },
  { key: 'pass_code', label: 'رمز الإذن (QR)', class: 'min-w-[130px] text-center' },
  { key: 'status', label: 'الحالة الحركية', class: 'min-w-[130px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])

const isLocked = (item) => item.status === 'out' || item.status === 'returned'

const getStatusVariant = (status) => {
  const map = {
    approved: 'success',
    out: 'warning',
    returned: 'info',
    rejected: 'danger',
  }
  return map[status] || 'secondary'
}

const getStatusLabel = (status) => {
  const map = {
    approved: 'معتمد للعبور',
    out: 'خارج المنشأة',
    returned: 'عاد للمنشأة',
    rejected: 'مرفوض',
  }
  return map[status] || status
}
</script>
