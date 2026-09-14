<!--src/modules/purchasing/views/issues/components/IssuesTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="issues"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- المعرف ورقم إذن الصرف -->
      <template #cell-issue_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span class="font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded w-fit text-xs">
            {{ item.issue_number || `#${item.id}` }}
          </span>
          <span v-if="item.requisition_id" class="text-[10px] text-sky-400">
            طلب احتياج: #{{ item.requisition?.requisition_number || item.requisition_id }}
          </span>
          <span class="text-[10px] text-text-muted">
            المُنشئ: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- جهة الصرف: القسم والموظف المستلم -->
      <template #cell-destination="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.department?.name || 'صرف عام / بدون قسم' }}
          </span>
          <span v-if="item.recipient?.name" class="text-[10px] text-gray-400">
            المستلم: {{ item.recipient.name }}
          </span>
        </div>
      </template>

      <!-- المستودع وتاريخ الصرف -->
      <template #cell-warehouse_and_date="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span
              class="px-2 py-0.5 text-[10px] font-black rounded border bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
            >
              {{ item.warehouse?.name || `مستودع #${item.warehouse_id}` }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-text-muted">
            <span>تاريخ: {{ item.issue_date || '-' }}</span>
          </div>
        </div>
      </template>

      <!-- حالة الإذن -->
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

      <!-- تكلفة الصرف الإجمالية -->
      <template #cell-total_cost="{ item }">
        <div class="flex flex-col justify-center min-w-[120px] text-right font-mono" dir="rtl">
          <div class="flex justify-between text-xs font-bold text-text-primary">
            <span>التكلفة:</span>
            <span class="text-emerald-400">{{ formatCurrency(item.total_cost || 0) }}</span>
          </div>
          <div
            v-if="item.items_count !== undefined"
            class="text-[10px] text-text-muted text-left mt-0.5"
          >
            <span>{{ item.items_count }} بند</span>
          </div>
        </div>
      </template>

      <!-- أزرار الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر تأكيد وترحيل الصرف: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('confirm-issue', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="تأكيد الصرف والخصم اللحظي من المخزن"
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

          <!-- زر طباعة إذن الصرف A4 -->
          <button
            @click="$emit('print-issue', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="طباعة إذن الصرف المخزني"
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

          <!-- زر تعديل الإذن: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('edit-issue', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
            title="تعديل بيانات إذن الصرف"
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

          <!-- زر حذف الإذن: للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('delete-issue', item)"
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف مسودة إذن الصرف"
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
  issues: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-issue',
  'delete-issue',
  'confirm-issue',
  'row-clicked',
  'print-issue',
])

const tableHeaders = computed(() => [
  { key: 'issue_number', label: 'رقم الإذن والمرجع' },
  { key: 'destination', label: 'جهة الصرف / المستلم' },
  { key: 'warehouse_and_date', label: 'المستودع وتاريخ الصرف' },
  { key: 'status', label: 'حالة الإذن', class: 'text-center' },
  { key: 'total_cost', label: 'إجمالي التكلفة' },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[130px]' },
])

const isDraft = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft'
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد التجهيز',
    confirmed: 'تم الصرف والخصم',
    cancelled: 'إذن ملغي',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    confirmed: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
