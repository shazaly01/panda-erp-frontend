<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="leaves" :is-loading="loading">
      <template #cell-employee="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.employee_name }}
          </span>
          <span class="text-xs text-text-muted">
            تاريخ الطلب: {{ item.requested_at?.split(' ')[0] || '---' }}
          </span>
        </div>
      </template>

      <template #cell-leave_details="{ item }">
        <div class="flex flex-col gap-1">
          <span class="font-bold text-sm text-primary">
            {{ item.leave_type_name }}
          </span>
          <span class="text-xs font-medium text-text-muted">
            المدة: {{ item.total_days }} يوم/أيام
          </span>
        </div>
      </template>

      <template #cell-period="{ item }">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-text-primary">
            من: <span class="font-mono">{{ item.start_date }}</span>
          </span>
          <span class="text-xs text-text-primary">
            إلى: <span class="font-mono">{{ item.end_date }}</span>
          </span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="flex flex-col gap-1 items-start">
          <span
            class="px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5"
            :class="getStatusClass(item.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.status)"></span>
            {{ getStatusLabel(item.status) }}
          </span>
          <span v-if="item.approved_by_name" class="text-[10px] text-text-muted">
            بواسطة: {{ item.approved_by_name }}
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <template v-if="item.status === 'pending'">
            <button
              v-if="authStore.can('leave.approve')"
              @click.stop="$emit('approve', item)"
              class="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-500 rounded-lg transition-colors"
              title="اعتماد الإجازة"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>

            <button
              v-if="authStore.can('leave.approve')"
              @click.stop="$emit('reject', item)"
              class="p-1.5 text-rose-600 hover:text-white hover:bg-rose-500 rounded-lg transition-colors"
              title="رفض الإجازة"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div
              v-if="authStore.can('leave.approve')"
              class="w-px h-5 bg-surface-border mx-1"
            ></div>

            <button
              v-if="authStore.can('leave.update')"
              @click.stop="$emit('edit', item)"
              class="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              title="تعديل الطلب"
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
              v-if="authStore.can('leave.delete')"
              @click.stop="$emit('delete', item)"
              class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="إلغاء الطلب"
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
          </template>
          <span v-else class="text-[10px] text-text-muted italic px-2"> تمت المعالجة </span>
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
  leaves: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

// أضفنا أحداث الاعتماد والرفض لترتبط بالشاشة الرئيسية
defineEmits(['page-change', 'edit', 'delete', 'approve', 'reject'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف والتقديم', class: 'min-w-[180px]' },
  { key: 'leave_details', label: 'نوع الإجازة والمدة', class: 'min-w-[150px]' },
  { key: 'period', label: 'فترة الإجازة', class: 'min-w-[160px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[140px]' },
])

// --- دوال مساعدة لتنسيق حالة الطلب ---
const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد الانتظار',
    approved: 'معتمدة',
    rejected: 'مرفوضة',
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
  }
  return classes[status] || 'bg-surface-ground text-text-secondary border border-surface-border'
}

const getStatusDotClass = (status) => {
  const classes = {
    pending: 'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-rose-500',
  }
  return classes[status] || 'bg-gray-400'
}
</script>
