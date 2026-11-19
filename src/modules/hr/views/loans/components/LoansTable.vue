<!-- src/modules/hr/views/loans/components/LoansTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="loans" :is-loading="loading">
      <!-- 1. الموظف وتاريخ الطلب -->
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

      <!-- 2. المبلغ والمبرر -->
      <template #cell-loan_info="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-mono font-black text-xs sm:text-sm text-primary">
            {{ formatCurrency(item.amount || 0) }}
          </span>
          <span class="text-xs text-text-secondary truncate max-w-[220px]" :title="item.reason">
            {{ item.reason || '---' }}
          </span>
        </div>
      </template>

      <!-- 3. خطة السداد -->
      <template #cell-installments="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="text-xs font-medium text-text-primary">
            <strong class="font-mono font-black">{{ item.installments_count }}</strong>
            أشهر (بواقع
            <strong class="font-mono font-bold text-success">
              {{ formatCurrency(item.estimated_installment || 0) }}
            </strong>
            شهرياً)
          </span>
          <span class="text-[11px] text-text-muted">
            يبدأ الخصم:
            <span class="font-mono font-semibold text-text-secondary">
              {{ item.deduction_start_date || '---' }}
            </span>
          </span>
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
              v-if="authStore.can('loan.update')"
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
              v-if="authStore.can('loan.delete')"
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
import { formatCurrency } from '@/utils/formatters'

defineProps({
  loans: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف والتاريخ', class: 'min-w-[190px]' },
  { key: 'loan_info', label: 'المبلغ والمبرر', class: 'min-w-[180px]' },
  { key: 'installments', label: 'خطة السداد', class: 'min-w-[220px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[130px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])

const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد الانتظار',
    approved: 'معتمدة / نشطة',
    rejected: 'مرفوضة',
    paid: 'مسددة بالكامل',
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    paid: 'info',
  }
  return map[status] || 'secondary'
}
</script>
