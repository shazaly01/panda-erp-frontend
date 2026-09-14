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
      <!-- رقم الطلب والمُنشئ -->
      <template #cell-requisition_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span class="font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded w-fit text-xs">
            {{ item.requisition_number || `#${item.id}` }}
          </span>
          <span class="text-[10px] text-text-muted">
            بواسطة: {{ item.creator?.name || item.requester?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- القسم ومقدم الطلب -->
      <template #cell-department_and_requester="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.department?.name || 'القسم العام' }}
          </span>
          <span class="text-[10px] text-gray-400">
            مقدم الطلب: {{ item.requester?.name || '-' }}
          </span>
        </div>
      </template>

      <!-- التواريخ (تاريخ الطلب وتاريخ الحاجة) -->
      <template #cell-dates="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right font-mono" dir="rtl">
          <div class="text-xs text-text-muted">
            <span>طلب: {{ item.request_date || '-' }}</span>
          </div>
          <div v-if="item.required_date" class="text-[10px] text-amber-400/90 font-semibold">
            <span>احتياج: {{ item.required_date }}</span>
          </div>
        </div>
      </template>

      <!-- مستوى الأولوية -->
      <template #cell-priority="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <span
            class="px-2.5 py-0.5 text-[10px] font-black rounded-full border"
            :class="getPriorityBadgeClass(item.priority?.value || item.priority)"
          >
            {{ getPriorityLabel(item.priority?.value || item.priority) }}
          </span>
        </div>
      </template>

      <!-- حالة الطلب -->
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

      <!-- عدد البنود المسجلة -->
      <template #cell-items_count="{ item }">
        <div
          class="flex justify-center items-center font-mono text-xs font-bold text-gray-300"
          dir="rtl"
        >
          <span class="bg-[#181d28] px-2.5 py-1 rounded-lg border border-[#374158]">
            {{ item.items_count ?? (item.items ? item.items.length : 0) }} بنود
          </span>
        </div>
      </template>

      <!-- أزرار الإجراءات التخصصية -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر فرز وتوجيه الطلب (للطلبات المعتمدة فقط) -->
          <button
            v-if="canTriage(item)"
            @click="$emit('triage-requisition', item)"
            class="p-1.5 text-[#e05e2b] hover:text-[#f06e3b] hover:bg-[#e05e2b]/15 rounded-lg transition-colors"
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
            class="p-1.5 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
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
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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

const getStatusBadgeClass = (status) => {
  const map = {
    draft: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    pending_approval: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    pending: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    submitted: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    approved: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    ordered: 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30',
    rejected: 'bg-rose-950/40 text-rose-400 border-rose-500/30',
    cancelled: 'bg-gray-800 text-gray-400 border-gray-600',
  }
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600'
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

const getPriorityBadgeClass = (priority) => {
  const map = {
    low: 'bg-slate-900/60 text-slate-400 border-slate-700/50',
    medium: 'bg-blue-950/40 text-blue-400 border-blue-500/30',
    high: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    urgent: 'bg-rose-950/50 text-rose-400 border-rose-500/40 font-black animate-pulse',
  }
  return map[priority] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
