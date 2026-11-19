<!-- src/modules/purchasing/views/issues/components/IssuesTable.vue -->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="issues"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. المعرف ورقم إذن الصرف -->
      <template #cell-issue_number="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="sm">
            {{ item.issue_number || `#${item.id}` }}
          </AppBadge>
          <span v-if="item.requisition_id" class="text-[10px] font-mono text-info font-bold">
            طلب احتياج: #{{ item.requisition?.requisition_number || item.requisition_id }}
          </span>
          <span class="text-[10px] text-text-muted">
            المُنشئ: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- 2. جهة الصرف: القسم والموظف المستلم -->
      <template #cell-destination="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.department?.name || 'صرف عام / بدون قسم' }}
          </span>
          <span v-if="item.recipient?.name" class="text-[10px] text-text-muted mt-0.5">
            المستلم: {{ item.recipient.name }}
          </span>
        </div>
      </template>

      <!-- 3. المستودع وتاريخ الصرف -->
      <template #cell-warehouse_and_date="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <AppBadge variant="success" size="xs">
            {{ item.warehouse?.name || `مستودع #${item.warehouse_id}` }}
          </AppBadge>
          <div
            class="flex items-center gap-1.5 text-xs font-mono text-text-secondary font-semibold"
          >
            <span class="font-sans text-text-muted font-normal text-[11px]">تاريخ:</span>
            <span>{{ item.issue_date ? String(item.issue_date).substring(0, 10) : '-' }}</span>
          </div>
        </div>
      </template>

      <!-- 4. حالة الإذن -->
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

      <!-- 5. تكلفة الصرف الإجمالية -->
      <template #cell-total_cost="{ item }">
        <div class="flex flex-col justify-center min-w-[125px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-secondary font-medium">
            <span>التكلفة:</span>
            <span class="font-mono font-bold text-success">
              {{ formatCurrency(item.total_cost || 0) }}
            </span>
          </div>
          <div
            v-if="item.items_count !== undefined"
            class="text-[10px] font-mono text-text-muted text-left mt-0.5"
          >
            <span>{{ item.items_count }} بند</span>
          </div>
        </div>
      </template>

      <!-- 6. أزرار الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر تأكيد وترحيل الصرف: متاح للمسودات فقط -->
          <button
            v-if="isDraft(item)"
            @click="$emit('confirm-issue', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="تأكيد الصرف والخصم اللحظي من المخزن"
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

          <!-- زر طباعة إذن الصرف A4 -->
          <button
            @click="$emit('print-issue', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
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

          <!-- زر تعديل الإذن: متاح للمسودات والأذونات المؤكدة -->
          <button
            v-if="canEdit(item)"
            @click="$emit('edit-issue', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
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
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
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
import AppBadge from '@/components/ui/AppBadge.vue'
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

const canEdit = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft' || status === 'confirmed' || status === 'issued'
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد التجهيز',
    confirmed: 'تم الصرف والخصم',
    issued: 'تم الصرف والخصم',
    cancelled: 'إذن ملغي',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeVariant = (status) => {
  const map = {
    draft: 'warning',
    confirmed: 'success',
    issued: 'success',
    cancelled: 'danger',
  }
  return map[status] || 'secondary'
}
</script>
