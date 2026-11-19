<!-- src/modules/sales/views/invoices/components/SalesInvoiceTable.vue -->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="invoices"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. المعرف ورقم الفاتورة -->
      <template #cell-id="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="sm">
            {{ item.invoice_number || `#${item.id}` }}
          </AppBadge>
          <span class="text-[10px] font-mono text-text-muted">#{{ item.id }}</span>
        </div>
      </template>

      <!-- 2. طبيعة وتاريخ السند -->
      <template #cell-invoice_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2 flex-wrap">
            <AppBadge :variant="getPostingBadgeVariant(item)" size="xs">
              {{ getPostingLabel(item) }}
            </AppBadge>
            <span class="text-xs text-text-secondary font-mono font-semibold">
              {{ item.invoice_date ? String(item.invoice_date).substring(0, 10) : '-' }}
            </span>
          </div>
          <span v-if="item.notes" class="text-xs text-text-muted max-w-[200px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <!-- 3. الجهات ذات الصلة (العميل والمستودع) -->
      <template #cell-entities="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            العميل: {{ item.partner?.name || '-' }}
          </span>
          <span v-if="item.customer_name_text" class="font-bold text-xs text-primary mt-0.5">
            {{ item.customer_name_text }}
          </span>
          <span v-if="item.warehouse?.name" class="text-[10px] text-text-muted mt-0.5">
            المستودع: {{ item.warehouse.name }}
          </span>
        </div>
      </template>

      <!-- 4. قناة ونوع البيع -->
      <template #cell-channel="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="item.channel === 'pos' ? 'info' : 'warning'" size="xs" pill>
            {{ item.channel === 'pos' ? 'POS كاشير' : 'فاتورة قياسية' }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. طريقة وتوزيع السداد -->
      <template #cell-payment_type="{ item }">
        <div class="flex flex-col items-center justify-center gap-1" dir="rtl">
          <AppBadge :variant="getPaymentVariant(item)" size="xs" pill>
            {{ getPaymentLabel(item) }}
          </AppBadge>
          <span
            v-if="getInvoicePaymentParts(item).length > 1"
            class="text-[10px] leading-relaxed text-text-muted text-center max-w-[180px]"
          >
            {{ getPaymentBreakdown(item) }}
          </span>
        </div>
      </template>

      <!-- 6. الحساب المالي والتدقيق -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[140px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>الصافي الفعلي:</span>
            <span class="font-mono font-bold text-success">
              {{ formatCurrency(item.total_amount || 0) }}
            </span>
          </div>
          <div
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border pt-0.5"
          >
            <span>الخصم الممنوح:</span>
            <span class="font-mono font-bold text-danger">
              {{ formatCurrency(item.discount_amount || 0) }}
            </span>
          </div>
        </div>
      </template>

      <!-- 7. إجراءات تخصصية -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر ترحيل الفاتورة إذا كانت غير مرحّلة (مسودة) -->
          <button
            v-if="item.posting_status !== 'posted' && item.status !== 'cancelled'"
            @click="$emit('post-invoice', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="اعتماد وترحيل الفاتورة مخزنياً ومحاسبياً"
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

          <!-- زر إرسال الفاتورة عبر واتساب -->
          <button
            @click="$emit('send-whatsapp', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="مشاركة الفاتورة للعميل عبر واتساب"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.705 0-3.32-.428-4.743-1.185l-5.257 1.376 1.4-5.122c-.832-1.482-1.3-3.195-1.3-5.011 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z"
              />
            </svg>
          </button>

          <!-- زر معاينة الفاتورة السريعة -->
          <button
            @click="$emit('preview-invoice', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="معاينة الفاتورة للقطة الشاشة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <!-- زر مردود المبيعات -->
          <button
            v-if="item.posting_status === 'posted' && item.status !== 'cancelled'"
            @click="$emit('return-invoice', item)"
            class="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
            title="إصدار مستند مردود مبيعات لهذه الفاتورة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>

          <!-- زر الطباعة -->
          <button
            @click="$emit('print-invoice', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة الفاتورة للعميل"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <!-- زر التعديل -->
          <button
            v-if="item.status !== 'cancelled'"
            @click="$emit('edit-invoice', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل الفاتورة بالكامل"
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

          <!-- زر الحذف -->
          <button
            @click="$emit('delete-invoice', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="إلغاء وحذف المستند ماليًا ومخزنيًا"
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

    <AppPagination :meta="pagination || {}" @page-change="$emit('page-change', $event)" />
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
  invoices: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-invoice',
  'delete-invoice',
  'row-clicked',
  'print-invoice',
  'return-invoice',
  'preview-invoice',
  'send-whatsapp',
  'post-invoice',
])

const tableHeaders = computed(() => [
  { key: 'id', label: 'المعرف المالي' },
  { key: 'invoice_info', label: 'طبيعة وتاريخ السند' },
  { key: 'entities', label: 'الجهات ذات الصلة' },
  { key: 'channel', label: 'قناة البيع', class: 'text-center' },
  { key: 'payment_type', label: 'طريقة الدفع', class: 'text-center' },
  { key: 'financials', label: 'الحساب المالي والتدقيق' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[180px]' },
])

const getPostingLabel = (item) => {
  if (item.status === 'cancelled') return 'ملغاة'
  if (item.posting_status === 'posted') return 'فاتورة مرحّلة'
  return 'مسودة غير مرحّلة'
}

const getPostingBadgeVariant = (item) => {
  if (item.status === 'cancelled') return 'danger'
  if (item.posting_status === 'posted') return 'success'
  return 'warning'
}

const getInvoicePaymentParts = (item) => {
  const cashAmount = Number(item.cash_amount) || 0
  const bankAmount = Number(item.bank_amount) || 0
  const remainingAmount = Number(item.remaining_amount) || 0

  const parts = []
  if (cashAmount > 0) parts.push({ label: 'نقدي', amount: cashAmount })
  if (bankAmount > 0) parts.push({ label: 'بنكي', amount: bankAmount })
  if (remainingAmount > 0) parts.push({ label: 'آجل', amount: remainingAmount })

  return parts
}

const getPaymentLabel = (item) => {
  const parts = getInvoicePaymentParts(item)
  if (parts.length > 1) return 'مقسّم'
  if (parts.length === 1) return parts[0].label
  return item.payment_summary_lbl || 'مدفوع'
}

const getPaymentVariant = (item) => {
  const parts = getInvoicePaymentParts(item)
  if (parts.length > 1) return 'warning'
  if (parts.length === 0) return 'success'
  if (parts[0].label === 'نقدي') return 'success'
  if (parts[0].label === 'بنكي') return 'info'
  return 'warning'
}

const formatPaymentAmount = (amount) => {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

const getPaymentBreakdown = (item) => {
  return getInvoicePaymentParts(item)
    .map((part) => `${part.label} ${formatPaymentAmount(part.amount)}`)
    .join(' · ')
}
</script>
