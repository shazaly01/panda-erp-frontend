<!-- src/modules/hr/views/internet_vouchers/components/VouchersTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="vouchers" :is-loading="loading">
      <!-- 1. رقم الكود -->
      <template #cell-code="{ item }">
        <div class="flex items-center gap-2 py-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="sm" class="font-mono tracking-widest select-all">
            {{ item.code }}
          </AppBadge>
        </div>
      </template>

      <!-- 2. السعة -->
      <template #cell-capacity="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge variant="info" size="xs" class="font-mono">
            {{ item.capacity || '-' }}
          </AppBadge>
        </div>
      </template>

      <!-- 3. الحالة -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.status === 'available' ? 'success' : 'secondary'" size="xs" pill>
            {{ item.status === 'available' ? 'متاح' : 'مصروف' }}
          </AppBadge>
        </div>
      </template>

      <!-- 4. الموظف المُستلم -->
      <template #cell-employee_name="{ item }">
        <div class="text-right" dir="rtl">
          <span v-if="item.employee_name" class="text-xs sm:text-sm font-bold text-text-primary">
            {{ item.employee_name }}
          </span>
          <span v-else class="text-xs text-text-muted/50 font-mono">—</span>
        </div>
      </template>

      <!-- 5. تاريخ الصرف -->
      <template #cell-assigned_at="{ item }">
        <div class="text-center" dir="ltr">
          <span v-if="item.assigned_at" class="text-xs font-mono font-semibold text-text-secondary">
            {{ item.assigned_at }}
          </span>
          <span v-else class="text-xs text-text-muted/50 font-mono">—</span>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination || {}" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

defineProps({
  vouchers: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['page-change'])

const tableHeaders = computed(() => [
  { key: 'code', label: '# الكود', class: 'min-w-[160px]' },
  { key: 'capacity', label: 'السعة', class: 'min-w-[110px] text-center' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px] text-center' },
  { key: 'employee_name', label: 'الموظف المُستلم', class: 'min-w-[200px]' },
  { key: 'assigned_at', label: 'تاريخ الصرف', class: 'min-w-[150px] text-center' },
])
</script>
