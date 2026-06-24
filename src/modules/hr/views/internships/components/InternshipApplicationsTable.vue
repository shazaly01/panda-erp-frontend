<template>
  <AppCard
    class="overflow-hidden bg-slate-900/20 border border-slate-800/80 shadow-xl rounded-2xl text-right"
    dir="rtl"
  >
    <AppTable
      :headers="tableHeaders"
      :items="applications"
      :is-loading="loading"
      class="cursor-pointer hover:[&_tbody_tr]:bg-slate-800/30 transition-all text-xs"
      @row-click="$emit('row-click', $event)"
    >
      <template #cell-applicant_info="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 py-1">
          <span class="font-extrabold text-sm text-slate-100 tracking-wide">
            {{ item.full_name }}
          </span>
          <span class="text-slate-600 font-bold">|</span>
          <span class="text-xs text-slate-400 font-mono font-semibold">
            {{ item.phone }}
          </span>

          <span
            v-if="item.national_id"
            class="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md shadow-sm"
          >
            هوية/إقامة: {{ item.national_id }}
          </span>
        </div>
      </template>

      <template #cell-tracking_code="{ item }">
        <div class="py-1">
          <span
            v-if="item.tracking_code"
            class="inline-block font-mono font-black text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-800/50 px-3 py-1 rounded-lg tracking-widest shadow-inner"
          >
            {{ item.tracking_code }}
          </span>
          <span v-else class="text-slate-600 font-bold italic font-sans text-[11px]">لا يوجد</span>
        </div>
      </template>

      <template #cell-academic_info="{ item }">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 py-1">
          <span class="font-bold text-xs text-slate-300">
            {{ item.academic_institution }}
          </span>
          <span class="text-slate-700 font-bold">-</span>
          <span class="text-[11px] text-slate-400 font-medium">
            {{ item.academic_major }}
          </span>
          <span
            v-if="item.required_training_hours"
            class="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/25 shadow-inner"
          >
            المطلوب: {{ item.required_training_hours }} ساعة
          </span>
        </div>
      </template>

      <template #cell-duration_details="{ item }">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 py-1 text-xs font-semibold">
          <div class="flex items-center gap-1.5">
            <span class="text-slate-500 font-bold text-[11px]">من:</span>
            <span
              class="font-mono text-emerald-400 font-bold tracking-wide bg-emerald-500/5 px-1.5 py-0.5 rounded"
              >{{ item.internship_start_date }}</span
            >
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-slate-500 font-bold text-[11px]">إلى:</span>
            <span
              class="font-mono text-rose-400 font-bold tracking-wide bg-rose-500/5 px-1.5 py-0.5 rounded"
              >{{ item.internship_end_date }}</span
            >
          </div>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="py-1">
          <span
            class="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border flex items-center w-fit gap-1.5 shadow-md"
            :class="statusClasses(item.status || currentStatus)"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="statusDotClasses(item.status || currentStatus)"
            ></span>
            {{ statusLabel(item.status || currentStatus) }}
          </span>
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
  applications: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  currentStatus: { type: String, default: 'pending' },
})

defineEmits(['page-change', 'row-click'])

// ترويسات الجدول المعمارية النظيفة بعد إضافة عمود كود المتابعة المستقل
const tableHeaders = computed(() => [
  { key: 'applicant_info', label: 'بيانات المتدرب الشخصية', class: 'min-w-[240px]' },
  { key: 'tracking_code', label: 'كود المتابعة', class: 'min-w-[130px]' }, // 🌟 العمود المخصص الجديد
  { key: 'academic_info', label: 'المنشأة والتخصص الأكاديمي', class: 'min-w-[260px]' },
  { key: 'duration_details', label: 'فترة التدريب المعتمدة', class: 'min-w-[200px]' },
  { key: 'status', label: 'حالة السجل', class: 'min-w-[100px]' },
])

// قواميس الترجمة والتسميات العربية
const statusLabel = (status) => {
  const labels = {
    pending: 'انتظار المراجعة',
    approved: 'متدرب نشط',
    rejected: 'طلب مرفوض',
  }
  return labels[status] || status
}

// التنسيق المطور لبطاقات الحالة ليتناسب مع الثيم المظلم لنظام Panda ERP
const statusClasses = (status) => {
  const classes = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  return classes[status] || 'bg-slate-800 text-slate-400 border-slate-700'
}

const statusDotClasses = (status) => {
  const classes = {
    pending: 'bg-amber-400 shadow-sm shadow-amber-400/50',
    approved: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
    rejected: 'bg-rose-400 shadow-sm shadow-rose-400/50',
  }
  return classes[status] || 'bg-slate-500'
}
</script>
