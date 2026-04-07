<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="loans" :is-loading="loading">
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

      <template #cell-loan_info="{ item }">
        <div class="flex flex-col gap-1">
          <span class="font-bold font-mono text-sm text-primary">
            {{ item.amount }}
          </span>
          <span class="text-xs text-text-muted truncate max-w-[200px]" :title="item.reason">
            {{ item.reason }}
          </span>
        </div>
      </template>

      <template #cell-installments="{ item }">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-text-primary">
            {{ item.installments_count }} أشهر (بواقع {{ item.estimated_installment }} شهرياً)
          </span>
          <span class="text-[10px] text-text-muted">
            يبدأ الخصم: <span class="font-mono">{{ item.deduction_start_date }}</span>
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
              v-if="authStore.can('loan.update')"
              @click.stop="$emit('edit', item)"
              class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
              v-if="authStore.can('loan.delete')"
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
  loans: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف والتاريخ', class: 'min-w-[180px]' },
  { key: 'loan_info', label: 'المبلغ والمبرر', class: 'min-w-[150px]' },
  { key: 'installments', label: 'خطة السداد', class: 'min-w-[200px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

// --- دوال مساعدة لتنسيق حالة السلفة ---
const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد الانتظار',
    approved: 'معتمدة / نشطة',
    rejected: 'مرفوضة',
    paid: 'مسددة بالكامل',
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-100',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
    paid: 'bg-blue-50 text-blue-700 border border-blue-100',
  }
  return classes[status] || 'bg-surface-ground text-text-secondary border border-surface-border'
}

const getStatusDotClass = (status) => {
  const classes = {
    pending: 'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-rose-500',
    paid: 'bg-blue-500',
  }
  return classes[status] || 'bg-gray-400'
}
</script>
