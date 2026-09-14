<!--src/modules/purchasing/views/orders/components/OrdersTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="orders"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- المعرف ورقم أمر الشراء -->
      <template #cell-order_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span class="font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded w-fit text-xs">
            {{ item.order_number || `#${item.id}` }}
          </span>
          <span v-if="item.requisition" class="text-[10px] text-sky-400">
            طلب احتياج: #{{ item.requisition.requisition_number || item.requisition_id }}
          </span>
          <span class="text-[10px] text-text-muted">
            المُنشئ: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- بيانات المورد والشريك التجاري -->
      <template #cell-supplier="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.supplier?.name || `مورد رقم #${item.supplier_id}` }}
          </span>
          <span v-if="item.supplier?.phone" class="text-[10px] font-mono text-text-muted">
            {{ item.supplier.phone }}
          </span>
        </div>
      </template>

      <!-- التواريخ وجدول التوريد -->
      <template #cell-dates="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right font-mono" dir="rtl">
          <div class="flex items-center gap-1.5 text-xs text-text-muted">
            <span class="text-gray-400 font-sans text-[11px]">تاريخ الأمر:</span>
            <span>{{ item.order_date || '-' }}</span>
          </div>
          <div
            v-if="item.expected_delivery_date"
            class="flex items-center gap-1.5 text-[11px] text-amber-400/90"
          >
            <span class="font-sans text-[10px]">التوريد المتوقع:</span>
            <span>{{ item.expected_delivery_date }}</span>
          </div>
        </div>
      </template>

      <!-- حالة أمر الشراء -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <span
            class="px-2.5 py-0.5 text-[10px] font-black rounded-full border"
            :class="getStatusBadgeClass(item.status?.value || item.status)"
          >
            {{ item.status?.label || getStatusLabel(item.status?.value || item.status) }}
          </span>
        </div>
      </template>

      <!-- المبالغ والبيانات المالية -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[140px] text-right font-mono" dir="rtl">
          <div class="flex justify-between text-xs font-bold text-text-primary">
            <span>الإجمالي:</span>
            <span class="text-emerald-400">{{ formatCurrency(item.total_amount) }}</span>
          </div>
          <div class="flex justify-between text-[10px] text-text-muted mt-0.5">
            <span>الضريبة:</span>
            <span class="text-sky-300">{{ formatCurrency(item.tax_amount || 0) }}</span>
          </div>
          <div
            v-if="parseFloat(item.discount_amount) > 0"
            class="flex justify-between text-[10px] text-amber-400"
          >
            <span>الخصم:</span>
            <span>-{{ formatCurrency(item.discount_amount) }}</span>
          </div>
        </div>
      </template>

      <!-- أزرار الإجراءات والعمليات المتاحة -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر اعتماد وتأكيد أمر الشراء: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('confirm-order', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="اعتماد وتأكيد أمر الشراء"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          <!-- زر طباعة أمر الشراء -->
          <button
            @click="$emit('print-order', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
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

          <!-- زر تعديل أمر الشراء: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('edit-order', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[140px]' },
])

const isDraft = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft'
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

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    confirmed: 'bg-blue-950/40 text-blue-400 border-blue-500/30',
    partially_received: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30',
    received: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    partially_billed: 'bg-purple-950/40 text-purple-400 border-purple-500/30',
    billed: 'bg-teal-950/40 text-teal-400 border-teal-500/30',
    closed: 'bg-gray-800 text-gray-300 border-gray-600',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
