<!-- src/modules/hr/views/leaves/components/LeavesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="leaves" :is-loading="loading">
      <!-- 1. الموظف وتاريخ التقديم -->
      <template #cell-employee="{ item }">
        <div class="flex flex-col items-start gap-0.5 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.employee_name }}
          </span>
          <span class="text-[11px] text-text-muted">
            تاريخ الطلب:
            <span class="font-mono font-semibold text-text-secondary">
              {{ item.requested_at?.split(' ')[0] || '---' }}
            </span>
          </span>
        </div>
      </template>

      <!-- 2. نوع الإجازة والمدة -->
      <template #cell-leave_details="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="xs">
            {{ item.leave_type_name }}
          </AppBadge>
          <span class="text-xs font-medium text-text-secondary">
            المدة:
            <strong class="font-mono font-black text-text-primary">{{ item.total_days }}</strong>
            يوم/أيام
          </span>
        </div>
      </template>

      <!-- 3. فترة الإجازة -->
      <template #cell-period="{ item }">
        <div class="flex flex-col gap-1 text-xs text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px] w-7">من:</span>
            <span class="font-mono font-bold text-text-primary">{{ item.start_date }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px] w-7">إلى:</span>
            <span class="font-mono font-bold text-text-secondary">{{ item.end_date }}</span>
          </div>
        </div>
      </template>

      <!-- 4. الحالة والمعتمد -->
      <template #cell-status="{ item }">
        <div class="flex flex-col items-center justify-center gap-1" dir="rtl">
          <AppBadge :variant="getStatusVariant(item.status)" size="xs" pill>
            {{ getStatusLabel(item.status) }}
          </AppBadge>
          <span v-if="item.approved_by_name" class="text-[10px] text-text-muted text-center">
            بواسطة: {{ item.approved_by_name }}
          </span>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <template v-if="item.status === 'pending'">
            <button
              v-if="authStore.can('leave.approve')"
              type="button"
              @click="$emit('approve', item)"
              class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
              title="اعتماد الإجازة"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>

            <button
              v-if="authStore.can('leave.approve')"
              type="button"
              @click="$emit('reject', item)"
              class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="رفض الإجازة"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div
              v-if="authStore.can('leave.approve')"
              class="w-px h-4 bg-surface-border mx-1"
            ></div>

            <button
              v-if="authStore.can('leave.update')"
              type="button"
              @click="$emit('edit', item)"
              class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              title="تعديل الطلب"
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
              v-if="authStore.can('leave.delete')"
              type="button"
              @click="$emit('delete', item)"
              class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="إلغاء الطلب"
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
          </template>

          <span v-else class="text-[11px] text-text-muted italic px-2">تمت المعالجة</span>
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
  leaves: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete', 'approve', 'reject'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف والتقديم', class: 'min-w-[190px]' },
  { key: 'leave_details', label: 'نوع الإجازة والمدة', class: 'min-w-[160px]' },
  { key: 'period', label: 'فترة الإجازة', class: 'min-w-[160px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[130px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[150px]' },
])

const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد الانتظار',
    approved: 'معتمدة',
    rejected: 'مرفوضة',
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'secondary'
}
</script>
