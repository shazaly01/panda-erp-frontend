<!--src/modules/purchasing/views/bills/components/BillsTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="bills"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- المعرف ورقم الفاتورة -->
      <template #cell-bill_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span class="font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded w-fit text-xs">
            {{ item.bill_number || `#${item.id}` }}
          </span>
          <span v-if="item.supplier_bill_number" class="text-[10px] text-gray-400">
            فاتورة مورد: {{ item.supplier_bill_number }}
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

      <!-- المسار والتوجيه المخزني والتواريخ -->
      <template #cell-route_and_date="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span
              class="px-2 py-0.5 text-[10px] font-black rounded border"
              :class="
                item.receipt_id
                  ? 'bg-sky-950/40 text-sky-400 border-sky-500/30'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
              "
            >
              {{ item.receipt_id ? `سند استلام #${item.receipt_id}` : 'شراء مباشر للمخزن' }}
            </span>
            <span v-if="item.warehouse" class="text-[10px] text-gray-400 font-semibold">
              {{ item.warehouse.name }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-text-muted">
            <span>تاريخ: {{ item.bill_date || '-' }}</span>
            <span v-if="item.due_date" class="text-[10px] text-amber-400/80">
              استحقاق: {{ item.due_date }}
            </span>
          </div>
        </div>
      </template>

      <!-- حالة الاعتماد والترحيل -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <span
            class="px-2.5 py-0.5 text-[10px] font-black rounded-full border"
            :class="getStatusBadgeClass(item.status?.value || item.status)"
          >
            {{ getStatusLabel(item.status?.value || item.status) }}
          </span>
        </div>
      </template>

      <!-- الأثر المالي والذمة -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[140px] text-right font-mono" dir="rtl">
          <div class="flex justify-between text-xs font-bold text-text-primary">
            <span>الإجمالي:</span>
            <span class="text-emerald-400">{{ formatCurrency(item.total_amount) }}</span>
          </div>
          <div class="flex justify-between text-[10px] text-text-muted mt-0.5">
            <span>المدفوع:</span>
            <span class="text-gray-300">{{ formatCurrency(item.paid_amount || 0) }}</span>
          </div>
          <div
            v-if="parseFloat(item.remaining_amount) > 0"
            class="flex justify-between text-[10px] border-t border-surface-border/50 pt-0.5 text-rose-400 font-bold"
          >
            <span>المتبقي:</span>
            <span>{{ formatCurrency(item.remaining_amount) }}</span>
          </div>
        </div>
      </template>

      <!-- أزرار الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر سداد دفعة مالية: يتاح للفواتير المرحلة أو المسددة جزئياً والتي يتبقى عليها رصيد -->
          <button
            v-if="canPay(item)"
            @click="$emit('pay-bill', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="سداد دفعة مالية فورية على الفاتورة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>

          <!-- زر ترحيل الفاتورة: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('post-bill', item)"
            class="p-1.5 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="ترحيل الفاتورة وتوليد القيد المحاسبي وحركة المخزون"
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

          <!-- زر طباعة الفاتورة A4 -->
          <button
            @click="$emit('print-bill', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="طباعة فاتورة الشراء الرسمية"
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

          <!-- زر تعديل الفاتورة: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('edit-bill', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
            title="تعديل بيانات الفاتورة"
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

          <!-- زر حذف الفاتورة: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('delete-bill', item)"
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف مسودة الفاتورة"
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
  bills: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-bill',
  'delete-bill',
  'post-bill',
  'pay-bill',
  'row-clicked',
  'print-bill',
])

const tableHeaders = computed(() => [
  { key: 'bill_number', label: 'رقم الفاتورة والمرجع' },
  { key: 'supplier', label: 'المورد التجاري' },
  { key: 'route_and_date', label: 'المسار وتاريخ السند' },
  { key: 'status', label: 'حالة الفاتورة', class: 'text-center' },
  { key: 'financials', label: 'المبالغ والذمة المالية' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[140px]' },
])

const isDraft = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft'
}

const canPay = (item) => {
  const status = item.status?.value || item.status
  const remaining = parseFloat(item.remaining_amount) || 0
  return (status === 'posted' || status === 'partially_paid') && remaining > 0.0001
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد المراجعة',
    posted: 'مرحلة دفترياً',
    partially_paid: 'مسددة جزئياً',
    paid: 'مدفوعة بالكامل',
    cancelled: 'ملغاة',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    posted: 'bg-blue-950/40 text-blue-400 border-blue-500/30',
    partially_paid: 'bg-amber-950/50 text-amber-300 border-amber-400/40',
    paid: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
