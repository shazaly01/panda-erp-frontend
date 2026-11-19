<!-- src/modules/hr/views/pay-periods/components/PayPeriodsTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="periods" :is-loading="loading">
      <!-- 1. اسم الفترة -->
      <template #cell-name="{ item }">
        <div class="flex flex-col items-start gap-0.5 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span class="text-[11px] text-text-muted">
            تاريخ التوليد:
            <span class="font-mono font-semibold text-text-secondary">
              {{ item.created_at?.split(' ')[0] || '---' }}
            </span>
          </span>
        </div>
      </template>

      <!-- 2. مجموعة الدفع -->
      <template #cell-group="{ item }">
        <div class="flex flex-col items-start gap-0.5 text-right" dir="rtl">
          <AppBadge variant="primary" size="xs">
            {{ item.pay_group?.name || '---' }}
          </AppBadge>
          <span class="text-[10px] text-text-muted">دورة الصرف المرتبطة</span>
        </div>
      </template>

      <!-- 3. النطاق الزمني -->
      <template #cell-range="{ item }">
        <div class="flex flex-col gap-1 text-xs text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px] w-7">من:</span>
            <span
              class="font-mono font-bold text-text-primary bg-surface-ground px-2 py-0.5 rounded-md border border-surface-border"
            >
              {{ item.start_date }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px] w-7">إلى:</span>
            <span
              class="font-mono font-bold text-text-secondary bg-surface-ground px-2 py-0.5 rounded-md border border-surface-border"
            >
              {{ item.end_date }}
            </span>
          </div>
        </div>
      </template>

      <!-- 4. الحالة -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="getStatusVariant(item.status)" size="xs" pill>
            {{ getStatusLabel(item.status) }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.pay_periods.manage') && item.status !== 'closed'"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الفترة (لتفعيلها أو تأجيلها)"
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
            v-if="
              authStore.can('hr.pay_periods.manage') &&
              (item.status === 'open' || item.status === 'pending')
            "
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الفترة"
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

          <span v-if="item.status === 'closed'" class="text-[11px] text-text-muted italic px-2">
            مؤرشفة
          </span>
        </div>
      </template>
    </AppTable>

    <AppPagination
      v-if="pagination"
      :meta="pagination"
      @page-change="$emit('page-change', $event)"
    />
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
  periods: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'page-change'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'name', label: 'اسم الفترة', class: 'min-w-[180px]' },
  { key: 'group', label: 'مجموعة الدفع', class: 'min-w-[160px]' },
  { key: 'range', label: 'النطاق الزمني', class: 'min-w-[180px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[130px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])

const getStatusLabel = (status) => {
  const labels = {
    pending: 'مجدولة',
    open: 'مفتوحة للصرف',
    processing: 'قيد المعالجة',
    closed: 'مغلقة ومرحّلة',
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const map = {
    pending: 'info',
    open: 'success',
    processing: 'warning',
    closed: 'secondary',
  }
  return map[status] || 'secondary'
}
</script>
