<!-- src/modules/purchasing/views/orders/components/OrdersTable.vue -->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="orders"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. المعرف ورقم أمر الشراء -->
      <template #cell-order_number="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="sm">
            {{ item.order_number || `#${item.id}` }}
          </AppBadge>
          <span v-if="item.requisition" class="text-[10px] font-mono text-info font-bold">
            طلب احتياج: #{{ item.requisition.requisition_number || item.requisition_id }}
          </span>
          <span class="text-[10px] text-text-muted">
            المُنشئ: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- 2. بيانات المورد والشريك التجاري -->
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

      <!-- 3. التواريخ وجدول التوريد -->
      <template #cell-dates="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div
            class="flex items-center gap-1.5 text-xs text-text-secondary font-mono font-semibold"
          >
            <span class="text-text-muted font-sans font-normal text-[11px]">تاريخ الأمر:</span>
            <span>{{ item.order_date ? String(item.order_date).substring(0, 10) : '-' }}</span>
          </div>
          <div
            v-if="item.expected_delivery_date"
            class="flex items-center gap-1.5 text-[11px] font-mono text-warning font-bold"
          >
            <span class="font-sans text-[10px]">التوريد المتوقع:</span>
            <span>{{ String(item.expected_delivery_date).substring(0, 10) }}</span>
          </div>
        </div>
      </template>

      <!-- 4. حالة أمر الشراء -->
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

      <!-- 5. المبالغ والبيانات المالية -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[140px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>الإجمالي:</span>
            <span class="font-mono font-bold text-success">
              {{ formatCurrency(item.total_amount || 0) }}
            </span>
          </div>
          <div class="flex justify-between text-[10px] text-text-muted mt-0.5">
            <span>الضريبة:</span>
            <span class="font-mono font-semibold text-info">
              {{ formatCurrency(item.tax_amount || 0) }}
            </span>
          </div>
          <div
            v-if="parseFloat(item.discount_amount) > 0"
            class="flex justify-between text-[10px] border-t border-surface-border pt-0.5 mt-0.5 text-danger font-bold"
          >
            <span>الخصم:</span>
            <span class="font-mono">-{{ formatCurrency(item.discount_amount) }}</span>
          </div>
        </div>
      </template>

      <!-- 6. أزرار الإجراءات والعمليات المتاحة -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر اعتماد وتأكيد أمر الشراء: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('confirm-order', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="اعتماد وتأكيد أمر الشراء"
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

          <!-- زر طباعة أمر الشراء -->
          <button
            @click="$emit('print-order', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة أمر الشراء الرسمي"
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

          <!-- زر تعديل أمر الشراء: متاح للمسودات ولأوامر الشراء المؤكدة -->
          <button
            v-if="canEdit(item)"
            @click="$emit('edit-order', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل بيانات أمر الشراء"
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

          <!-- زر إلغاء أمر الشراء: متاح إذا لم يكن ملغياً أو مغلقاً -->
          <button
            v-if="canCancel(item)"
            @click="$emit('cancel-order', item)"
            class="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
            title="إلغاء أمر الشراء"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </button>

          <!-- زر حذف أمر الشراء: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('delete-order', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف مسودة أمر الشراء"
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
  orders: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-order',
  'delete-order',
  'confirm-order',
  'cancel-order',
  'row-clicked',
  'print-order',
])

const tableHeaders = computed(() => [
  { key: 'order_number', label: 'رقم الأمر والمرجع' },
  { key: 'supplier', label: 'المورد التجاري' },
  { key: 'dates', label: 'التواريخ وموعد التوريد' },
  { key: 'status', label: 'حالة الأمر', class: 'text-center' },
  { key: 'financials', label: 'المبالغ الإجمالية' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[150px]' },
])

const isDraft = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft'
}

const canEdit = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft' || status === 'confirmed'
}

const canCancel = (item) => {
  const status = item.status?.value || item.status
  return status !== 'cancelled' && status !== 'closed'
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة',
    confirmed: 'مؤكد',
    partially_received: 'مستلم جزئياً',
    received: 'مستلم بالكامل',
    partially_billed: 'مفوتر جزئياً',
    billed: 'مفوتر بالكامل',
    closed: 'مغلق',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeVariant = (status) => {
  const map = {
    draft: 'warning',
    confirmed: 'info',
    partially_received: 'info',
    received: 'success',
    partially_billed: 'warning',
    billed: 'success',
    closed: 'secondary',
    cancelled: 'danger',
  }
  return map[status] || 'secondary'
}
</script>
