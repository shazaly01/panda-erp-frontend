<!--src/modules/purchasing/views/receipts/components/ReceiptsTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="receipts"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- المعرف ورقم سند الاستلام ومستندات الشحن -->
      <template #cell-receipt_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span
            class="font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded w-fit text-xs border border-sky-500/30"
          >
            {{ item.receipt_number || `#${item.id}` }}
          </span>
          <span v-if="item.supplier_delivery_note" class="text-[10px] text-gray-300">
            إذن تسليم مورد: {{ item.supplier_delivery_note }}
          </span>
          <span v-if="item.waybill_number" class="text-[10px] text-gray-400">
            بوليصة شحن: {{ item.waybill_number }}
          </span>
          <span class="text-[10px] text-text-muted">
            المُنشئ: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- بيانات المورد التجاري -->
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

      <!-- المستودع المستلم وأمر الشراء المرجعي -->
      <template #cell-warehouse_and_order="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span
              class="px-2 py-0.5 text-[10px] font-black rounded border bg-[#16171b] text-emerald-400 border-emerald-500/30"
            >
              {{ item.warehouse?.name || `مستودع #${item.warehouse_id}` }}
            </span>
          </div>
          <div
            v-if="item.purchase_order || item.purchase_order_id"
            class="flex items-center gap-1 text-[10px] font-mono text-text-muted"
          >
            <span class="text-gray-400">أمر شراء:</span>
            <span class="text-[#e05e2b] font-bold">
              #{{ item.purchase_order?.order_number || item.purchase_order_id }}
            </span>
          </div>
          <div v-else class="text-[10px] text-gray-500">استلام مباشر بدون أمر شراء</div>
        </div>
      </template>

      <!-- تاريخ الاستلام ومسؤول الاستلام الفعلي -->
      <template #cell-dates_and_receiver="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <div class="text-xs text-text-primary">
            <span>تاريخ: </span>
            <span class="font-bold">{{ item.receipt_date || '-' }}</span>
          </div>
          <div class="text-[10px] text-text-muted">
            <span>المستلم: </span>
            <span class="text-gray-300">{{ item.receiver?.name || 'لم يحدد' }}</span>
          </div>
        </div>
      </template>

      <!-- تفاصيل الكميات والتكلفة الإجمالية -->
      <template #cell-items_summary="{ item }">
        <div class="flex flex-col justify-center min-w-[120px] text-right font-mono" dir="rtl">
          <div class="flex justify-between text-xs font-bold text-text-primary">
            <span>عدد البنود:</span>
            <span class="text-sky-400"
              >{{
                item.items_count !== undefined ? item.items_count : item.items?.length || 0
              }}
              صنف</span
            >
          </div>
          <div
            v-if="item.total_cost > 0"
            class="flex justify-between text-[10px] text-text-muted mt-0.5"
          >
            <span>التكلفة التقديرية:</span>
            <span class="text-emerald-400 font-bold">{{ formatCurrency(item.total_cost) }}</span>
          </div>
        </div>
      </template>

      <!-- شارة حالة الاستلام المخزني -->
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

      <!-- أزرار الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر تأكيد الاستلام الفعلي وترحيل حركة المخزون: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('receive-receipt', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="تأكيد الاستلام الفعلي وإدخال البضاعة للمخزن فوراً"
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

          <!-- زر طباعة إذن الاستلام A4 -->
          <button
            @click="$emit('print-receipt', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
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

          <!-- زر تعديل السند: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('edit-receipt', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة',
    received: 'تم الاستلام',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    received:
      'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
