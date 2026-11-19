<!-- src/modules/purchasing/views/suppliers/components/SuppliersTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="suppliers" :is-loading="loading">
      <!-- 1. بيانات المورد والكود -->
      <template #cell-supplier_info="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-xs sm:text-sm text-text-primary">
              {{ item.name }}
            </span>
            <AppBadge
              v-if="item.partner_code"
              variant="primary"
              size="sm"
              class="font-mono tracking-wider"
            >
              {{ item.partner_code }}
            </AppBadge>
          </div>
          <span v-if="item.commercial_name" class="text-[11px] text-text-muted">
            {{ item.commercial_name }}
          </span>
        </div>
      </template>

      <!-- 2. نوع الكيان -->
      <template #cell-type="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.type === 'company' ? 'info' : 'secondary'" size="xs" pill>
            {{ item.type === 'company' ? 'شركة / منشأة' : 'فرد' }}
          </AppBadge>
        </div>
      </template>

      <!-- 3. بيانات الاتصال والعنوان -->
      <template #cell-contact="{ item }">
        <div class="flex flex-col text-xs text-text-muted gap-0.5 max-w-xs text-right" dir="rtl">
          <span
            v-if="item.phone"
            class="font-mono font-semibold text-text-secondary w-fit"
            dir="ltr"
          >
            {{ item.phone }}
          </span>
          <span v-if="item.email" class="font-mono text-text-muted truncate" :title="item.email">
            {{ item.email }}
          </span>
          <span v-if="item.address" class="truncate text-[11px]" :title="item.address">
            {{ item.address }}
          </span>
          <span v-if="!item.phone && !item.email && !item.address" class="font-mono">---</span>
        </div>
      </template>

      <!-- 4. البيانات المالية والائتمانية -->
      <template #cell-financial="{ item }">
        <div class="flex flex-col text-xs gap-0.5 text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px]">الحد:</span>
            <span class="font-mono font-bold text-text-primary">
              {{ Number(item.credit_limit || 0).toLocaleString() }}
            </span>
            <span v-if="item.currency?.symbol" class="text-[10px] font-bold text-primary">
              {{ item.currency.symbol }}
            </span>
          </div>
          <div v-if="item.credit_period_days" class="text-[10px] font-medium text-text-muted">
            فترة السداد: <span class="font-mono font-bold">{{ item.credit_period_days }}</span> يوم
          </div>
        </div>
      </template>

      <!-- 5. الحالة -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="getStatusBadgeVariant(item.status)" size="xs" pill>
            {{ getStatusLabel(item.status) }}
          </AppBadge>
        </div>
      </template>

      <!-- 6. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('core.partners.update')"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل بيانات المورد"
            type="button"
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
            v-if="authStore.can('core.partners.delete')"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف المورد"
            type="button"
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

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
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
  suppliers: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'supplier_info', label: 'المورد والاسم التجاري', class: 'min-w-[200px]' },
  { key: 'type', label: 'النوع', class: 'min-w-[115px] text-center' },
  { key: 'contact', label: 'الاتصال والعنوان', class: 'min-w-[200px]' },
  { key: 'financial', label: 'الائتمان والسداد', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[110px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

const getStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return 'نشط'
    case 'inactive':
      return 'غير نشط'
    case 'blocked':
      return 'محظور'
    default:
      return status || '---'
  }
}

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'warning'
    case 'blocked':
      return 'danger'
    default:
      return 'secondary'
  }
}
</script>
