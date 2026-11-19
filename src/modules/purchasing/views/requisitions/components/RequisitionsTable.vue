<!-- src/modules/purchasing/views/requisitions/components/RequisitionsTable.vue -->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="requisitions"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. رقم الطلب والمُنشئ -->
      <template #cell-requisition_number="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge variant="primary" size="sm">
            {{ item.requisition_number || `#${item.id}` }}
          </AppBadge>
          <span class="text-[10px] text-text-muted">
            بواسطة: {{ item.creator?.name || item.requester?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- 2. القسم ومقدم الطلب -->
      <template #cell-department_and_requester="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.department?.name || 'القسم العام' }}
          </span>
          <span class="text-[10px] text-text-muted mt-0.5">
            مقدم الطلب: {{ item.requester?.name || '-' }}
          </span>
        </div>
      </template>

      <!-- 3. التواريخ (تاريخ الطلب وتاريخ الحاجة) -->
      <template #cell-dates="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="text-xs text-text-secondary font-mono font-semibold">
            طلب: {{ item.request_date ? String(item.request_date).substring(0, 10) : '-' }}
          </span>
          <span v-if="item.required_date" class="text-[10px] font-mono text-warning font-bold">
            احتياج: {{ String(item.required_date).substring(0, 10) }}
          </span>
        </div>
      </template>

      <!-- 4. مستوى الأولوية -->
      <template #cell-priority="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge
            :variant="getPriorityBadgeVariant(item.priority?.value || item.priority)"
            size="xs"
            pill
            :class="{
              'font-black animate-pulse': (item.priority?.value || item.priority) === 'urgent',
            }"
          >
            {{ getPriorityLabel(item.priority?.value || item.priority) }}
          </AppBadge>
        </div>
      </template>

      <!-- 5. حالة الطلب -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge
            :variant="getStatusBadgeVariant(item.status?.value || item.status)"
            size="xs"
            pill
          >
            {{ getStatusLabel(item.status?.value || item.status) }}
          </AppBadge>
        </div>
      </template>

      <!-- 6. عدد البنود المسجلة -->
      <template #cell-items_count="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <span
            class="px-2.5 py-0.5 rounded-lg bg-surface-ground/80 border border-surface-border text-xs font-mono font-bold text-text-primary shadow-2xs"
          >
            {{ item.items_count ?? (item.items ? item.items.length : 0) }} بنود
          </span>
        </div>
      </template>

      <!-- 7. أزرار الإجراءات التخصصية -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر فرز وتوجيه الطلب (للطلبات المعتمدة فقط) -->
          <button
            v-if="canTriage(item)"
            @click="$emit('triage-requisition', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="فرز وتوجيه البنود للمخزن أو الشراء"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>

          <!-- زر تقديم الطلب للاعتماد (للمسودات فقط) -->
          <button
            v-if="isDraft(item)"
            @click="$emit('submit-requisition', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="تقديم طلب الشراء للاعتماد"
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

          <!-- زر اعتماد الطلب (للطلبات بانتظار الاعتماد) -->
          <button
            v-if="canApproveOrReject(item)"
            @click="$emit('approve-requisition', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="اعتماد طلب الشراء"
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

          <!-- زر رفض الطلب مع السبب (للطلبات بانتظار الاعتماد) -->
          <button
            v-if="canApproveOrReject(item)"
            @click="$emit('reject-requisition', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="رفض طلب الشراء وتوضيح السبب"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- زر تعديل الطلب (للمسودات فقط) -->
          <button
            v-if="isDraft(item)"
            @click="$emit('edit-requisition', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل مسودة الطلب"
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

          <!-- زر حذف الطلب (للمسودات فقط) -->
          <button
            v-if="isDraft(item)"
            @click="$emit('delete-requisition', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف مسودة الطلب"
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
  requisitions: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-requisition',
  'delete-requisition',
  'submit-requisition',
  'approve-requisition',
  'reject-requisition',
  'triage-requisition',
  'row-clicked',
])

const tableHeaders = computed(() => [
  { key: 'requisition_number', label: 'رقم الطلب' },
  { key: 'department_and_requester', label: 'القسم ومقدم الطلب' },
  { key: 'dates', label: 'التواريخ' },
  { key: 'priority', label: 'الأولوية', class: 'text-center' },
  { key: 'status', label: 'الحالة', class: 'text-center' },
  { key: 'items_count', label: 'عدد البنود', class: 'text-center' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[150px]' },
])

const isDraft = (item) => {
  const status = item.status?.value || item.status
  return status === 'draft'
}

const canApproveOrReject = (item) => {
  const status = item.status?.value || item.status
  return status === 'pending_approval' || status === 'pending' || status === 'submitted'
}

const canTriage = (item) => {
  const status = item.status?.value || item.status
  return status === 'approved'
}

const getStatusLabel = (status) => {
  const map = {
    draft: 'مسودة قيد الإعداد',
    pending_approval: 'بانتظار الاعتماد',
    pending: 'بانتظار الاعتماد',
    submitted: 'بانتظار الاعتماد',
    approved: 'معتمد',
    ordered: 'تم إصدار أمر شراء',
    rejected: 'مرفوض',
    cancelled: 'ملغي',
  }
  return map[status] || status || 'غير محدد'
}

const getStatusBadgeVariant = (status) => {
  const map = {
    draft: 'warning',
    pending_approval: 'info',
    pending: 'info',
    submitted: 'info',
    approved: 'success',
    ordered: 'primary',
    rejected: 'danger',
    cancelled: 'secondary',
  }
  return map[status] || 'secondary'
}

const getPriorityLabel = (priority) => {
  const map = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عاجلة',
    urgent: 'طارئة جداً',
  }
  return map[priority] || priority || 'عادية'
}

const getPriorityBadgeVariant = (priority) => {
  const map = {
    low: 'secondary',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  }
  return map[priority] || 'secondary'
}
</script>
