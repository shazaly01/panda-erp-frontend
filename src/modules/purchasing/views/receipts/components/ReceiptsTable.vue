<!-- src/modules/purchasing/views/receipts/components/ReceiptsTable.vue -->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="receipts"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. المعرف ورقم سند الاستلام ومستندات الشحن -->
      <template #cell-receipt_number="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge variant="info" size="sm">
            {{ item.receipt_number || `#${item.id}` }}
          </AppBadge>
          <span
            v-if="item.supplier_delivery_note"
            class="text-[10px] font-mono text-text-secondary"
          >
            إذن تسليم مورد: {{ item.supplier_delivery_note }}
          </span>
          <span v-if="item.waybill_number" class="text-[10px] font-mono text-text-muted">
            بوليصة شحن: {{ item.waybill_number }}
          </span>
          <span class="text-[10px] text-text-muted">
            المُنشئ: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- 2. بيانات المورد التجاري -->
      <template #cell-supplier="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.supplier?.name || `مورد رقم #${item.supplier_id}` }}
          </span>
          <span v-if="item.supplier?.phone" class="text-[10px] font-mono text-text-muted mt-0.5">
            {{ item.supplier.phone }}
          </span>
        </div>
      </template>

      <!-- 3. المستودع المستلم وأمر الشراء المرجعي -->
      <template #cell-warehouse_and_order="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <AppBadge variant="success" size="xs">
            {{ item.warehouse?.name || `مستودع #${item.warehouse_id}` }}
          </AppBadge>
          <div
            v-if="item.purchase_order || item.purchase_order_id"
            class="flex items-center gap-1 text-[10px] font-mono text-text-secondary"
          >
            <span class="font-sans text-text-muted">أمر شراء:</span>
            <span class="text-primary font-bold">
              #{{ item.purchase_order?.order_number || item.purchase_order_id }}
            </span>
          </div>
          <span v-else class="text-[10px] text-text-muted">استلام مباشر بدون أمر شراء</span>
        </div>
      </template>

      <!-- 4. تاريخ الاستلام ومسؤول الاستلام الفعلي -->
      <template #cell-dates_and_receiver="{ item }">
        <div class="flex flex-col gap-1 text-right" dir="rtl">
          <div class="text-xs text-text-secondary font-mono font-semibold">
            <span class="font-sans text-text-muted font-normal">تاريخ: </span>
            <span>{{ item.receipt_date ? String(item.receipt_date).substring(0, 10) : '-' }}</span>
          </div>
          <div class="text-[10px] text-text-muted">
            <span>المستلم: </span>
            <span class="text-text-secondary font-bold">
              {{ item.receiver?.name || 'لم يحدد' }}
            </span>
          </div>
        </div>
      </template>

      <!-- 5. تفاصيل الكميات والتكلفة الإجمالية -->
      <template #cell-items_summary="{ item }">
        <div class="flex flex-col justify-center min-w-[130px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>عدد البنود:</span>
            <span class="font-mono font-bold text-info">
              {{ item.items_count !== undefined ? item.items_count : item.items?.length || 0 }}
              صنف
            </span>
          </div>
          <div
            v-if="item.total_cost > 0"
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border pt-0.5"
          >
            <span>التكلفة التقديرية:</span>
            <span class="font-mono text-success font-bold">
              {{ formatCurrency(item.total_cost) }}
            </span>
          </div>
        </div>
      </template>

      <!-- 6. شارة حالة الاستلام المخزني -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge
            :variant="getStatusBadgeVariant(item.status?.value || item.status)"
            size="xs"
            pill
          >
            {{ item.status?.label || getStatusLabel(item.status?.value || item.status) }}
          </AppBadge>
        </div>
      </template>

      <!-- 7. أزرار الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر تأكيد الاستلام الفعلي وترحيل حركة المخزون: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('receive-receipt', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="تأكيد الاستلام الفعلي وإدخال البضاعة للمخزن فوراً"
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

          <!-- زر طباعة إذن الاستلام A4 -->
          <button
            @click="$emit('print-receipt', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة سند الاستلام المخزني الرسمي"
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

          <!-- زر تعديل السند: متاح للمسودات والسندات المستلمة -->
          <button
            v-if="canEdit(item)"
            @click="$emit('edit-receipt', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل بيانات سند الاستلام"
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

          <!-- زر حذف السند: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('delete-receipt', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف مسودة سند الاستلام"
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
import { formatCurrency } from '@/utils/formatters'

defineProps({
  receipts: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-receipt',
  'delete-receipt',
  'receive-receipt',
  'row-clicked',
  'print-receipt',
])

const tableHeaders = computed(() => [
  { key: 'receipt_number', label: 'رقم السند والوثائق' },
  { key: 'supplier', label: 'المورد التجاري' },
  { key: 'warehouse_and_order', label: 'المستودع وأمر الشراء' },
  { key: 'dates_and_receiver', label: 'التاريخ ومسؤول الاستلام' },
  { key: 'items_summary', label: 'ملخص البنود والتكلفة' },
  { key: 'status', label: 'حالة الاستلام', class: 'text-center' },
  { key: 'actions', label: 'إجراءات تشغيلية', class: 'text-left min-w-[130px]' },
])

const isDraft = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft'
}

const canEdit = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft' || status === 'received'
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة',
    received: 'تم الاستلام',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeVariant = (status) => {
  const map = {
    draft: 'warning',
    received: 'success',
    cancelled: 'danger',
  }
  return map[status] || 'secondary'
}
</script>
