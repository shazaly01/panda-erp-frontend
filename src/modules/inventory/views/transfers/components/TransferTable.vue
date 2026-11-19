<!-- src/modules/inventory/views/transfers/components/TransferTable.vue -->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="transfers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. رقم أمر التحويل ومُنشئ السند -->
      <template #cell-transfer_number="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="sm">
            {{ item.transfer_number || `#${item.id}` }}
          </AppBadge>
          <span class="text-[10px] text-text-muted">
            مُنشئ السند: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- 2. تاريخ التحويل والملاحظات -->
      <template #cell-transfer_date="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="text-xs text-text-secondary font-mono font-semibold">
            {{ item.transfer_date ? String(item.transfer_date).substring(0, 10) : '-' }}
          </span>
          <span
            v-if="item.notes"
            class="text-xs text-text-muted max-w-[200px] truncate"
            :title="item.notes"
          >
            {{ item.notes }}
          </span>
        </div>
      </template>

      <!-- 3. مسار التحويل (المستودع المصدر -> المستودع الوجهة) -->
      <template #cell-warehouses_route="{ item }">
        <div class="flex items-center gap-2.5 text-right text-xs" dir="rtl">
          <!-- المستودع المصدر -->
          <div class="flex flex-col">
            <span class="font-bold text-text-primary flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-warning shrink-0"></span>
              <span>{{ item.from_warehouse?.name || 'مستودع المصدر' }}</span>
            </span>
            <span
              v-if="item.from_warehouse?.code"
              class="text-[10px] font-mono text-text-muted pr-3 mt-0.5"
            >
              {{ item.from_warehouse.code }}
            </span>
          </div>

          <!-- أيقونة اتجاه التحويل -->
          <div class="text-primary px-1 shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </div>

          <!-- المستودع الوجهة -->
          <div class="flex flex-col">
            <span class="font-bold text-text-primary flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-success shrink-0"></span>
              <span>{{ item.to_warehouse?.name || 'مستودع الوجهة' }}</span>
            </span>
            <span
              v-if="item.to_warehouse?.code"
              class="text-[10px] font-mono text-text-muted pr-3 mt-0.5"
            >
              {{ item.to_warehouse.code }}
            </span>
          </div>
        </div>
      </template>

      <!-- 4. حالة الاعتماد والتأثير المخزني -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="getStatusBadgeVariant(item.status)" size="xs" pill>
            {{ getStatusLabel(item.status) }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. عدد البنود والاعتماد -->
      <template #cell-summary="{ item }">
        <div class="flex flex-col justify-center min-w-[120px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>عدد البنود:</span>
            <span class="font-mono font-bold text-text-primary">
              {{ item.items ? item.items.length : '-' }} صنف
            </span>
          </div>
          <div
            v-if="item.approver"
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border pt-0.5"
          >
            <span>المعتمد:</span>
            <span class="text-text-secondary font-bold truncate max-w-[85px]">
              {{ item.approver.name }}
            </span>
          </div>
        </div>
      </template>

      <!-- 6. الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر اعتماد وإكمال التحويل: يظهر فقط إذا كان المستند مسودة -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('complete-transfer', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="اعتماد وترحيل التحويل وتحديث الأرصدة فورياً"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- زر طباعة السند -->
          <button
            @click="$emit('print-transfer', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة إذن التحويل المخزني A4"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <!-- زر التعديل: يتاح للمسودات فقط -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('edit-transfer', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل بيانات أمر التحويل"
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

          <!-- زر الحذف: يتاح للمسودات فقط -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('delete-transfer', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف أمر التحويل"
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
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

defineProps({
  transfers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-transfer',
  'delete-transfer',
  'complete-transfer',
  'row-clicked',
  'print-transfer',
])

const tableHeaders = computed(() => [
  { key: 'transfer_number', label: 'رقم أمر التحويل' },
  { key: 'transfer_date', label: 'تاريخ التحويل والملاحظات' },
  { key: 'warehouses_route', label: 'مسار التحويل (من ← إلى)' },
  { key: 'status', label: 'حالة الاعتماد', class: 'text-center' },
  { key: 'summary', label: 'ملخص البنود' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[140px]' },
])

const getStatusLabel = (status) => {
  if (status === 'approved' || status === 'completed') return 'معتمد ومُرحّل'
  if (status === 'cancelled') return 'ملغي'
  if (status === 'in_transit') return 'قيد النقل'
  return 'مسودة قيد المراجعة'
}

const getStatusBadgeVariant = (status) => {
  if (status === 'approved' || status === 'completed') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'in_transit') return 'info'
  return 'warning'
}
</script>
