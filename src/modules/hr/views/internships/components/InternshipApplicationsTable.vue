<!--src\modules\hr\views\internships\components\InternshipApplicationsTable.vue--->
<template>
  <AppCard
    class="overflow-hidden bg-slate-900/20 border border-slate-800/80 shadow-xl rounded-2xl text-right"
    dir="rtl"
  >
    <!-- شريط الترقيم العلوي مع موازنة الهامش العلوي والسفلي -->
    <AppPagination
      class="-mt-3 mb-2"
      :meta="pagination"
      @page-change="$emit('page-change', $event)"
    />

    <AppTable
      :headers="tableHeaders"
      :items="applications"
      :is-loading="loading"
      class="cursor-pointer hover:[&_tbody_tr]:bg-slate-800/30 transition-all text-xs"
      @row-click="$emit('row-click', $event)"
    >
      <template #cell-applicant_info="{ item }">
        <div class="flex items-center gap-3 py-1">
          <!-- صورة المتقدم الشخصية (Avatar) -->
          <div
            class="w-10 h-10 rounded-full overflow-hidden border border-slate-700/80 bg-slate-800 shrink-0 shadow-sm relative group"
          >
            <img
              v-if="item.photo_url"
              :src="item.photo_url"
              class="w-full h-full object-cover transform -scale-x-100"
              alt="صورة المتقدم"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 bg-slate-900/80"
            >
              {{ item.application_type === 'employment' ? '💼' : 'HR' }}
            </div>
          </div>

          <!-- التفاصيل النصية للمتقدم -->
          <div class="flex flex-col gap-1 justify-center">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span class="font-extrabold text-sm text-slate-100 tracking-wide">
                {{ item.full_name }}
              </span>
              <span class="text-slate-700 font-bold">|</span>
              <span class="text-xs text-slate-400 font-mono font-semibold">
                {{ item.phone }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
              <!-- شارة نوع الطلب -->
              <span
                :class="[
                  'inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded border',
                  item.application_type === 'employment'
                    ? 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
                ]"
              >
                {{ item.application_type === 'employment' ? '💼 توظيف' : '🎓 تدريب' }}
              </span>

              <!-- شارة مصدر الطلب (إلكتروني / يدوي) -->
              <span
                v-if="item.source"
                :class="[
                  'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border',
                  item.source === 'manual'
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                    : 'bg-slate-900 text-slate-400 border-slate-800',
                ]"
              >
                {{ item.source === 'manual' ? 'إدخال يدوي' : 'إلكتروني' }}
              </span>

              <span
                v-if="item.national_id"
                class="inline-block text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded shadow-sm"
              >
                هوية: {{ item.national_id }}
              </span>
            </div>
          </div>
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

      <!-- خلية تاريخ التقديم -->
      <template #cell-created_at="{ item }">
        <div class="py-1">
          <span
            v-if="item.created_at"
            class="inline-block font-mono text-xs font-extrabold text-amber-300/90 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 rounded-lg shadow-sm"
          >
            {{ formatDate(item.created_at) }}
          </span>
          <span v-else class="text-slate-600 font-bold italic text-[11px]">غير محدد</span>
        </div>
      </template>

      <!-- خلية التفاصيل الأكاديمية (للتدريب) أو المهنية (للتوظيف) -->
      <template #cell-academic_info="{ item }">
        <!-- حالة طلب التوظيف -->
        <div
          v-if="item.application_type === 'employment'"
          class="flex flex-wrap items-center gap-x-2.5 gap-y-1 py-1"
        >
          <span
            v-if="item.position?.title || item.position?.name"
            class="font-extrabold text-xs text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20"
          >
            {{ item.position?.title || item.position?.name }}
          </span>
          <span v-if="item.qualification" class="font-bold text-xs text-slate-300">
            {{ item.qualification }}
          </span>
          <span
            v-if="item.experience_years !== null && item.experience_years !== undefined"
            class="text-[11px] text-slate-400 font-semibold"
          >
            ({{ item.experience_years }} سنوات خبرة)
          </span>
          <a
            v-if="item.cv_url"
            :href="item.cv_url"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
            class="text-[10px] font-black text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 px-2 py-0.5 rounded-md border border-indigo-500/30 transition-colors"
          >
            📄 السيرة الذاتية
          </a>
          <span
            v-if="
              !item.position?.title && !item.position?.name && !item.qualification && !item.cv_url
            "
            class="text-slate-500 text-[11px] italic"
          >
            طلب توظيف مباشر
          </span>
        </div>

        <!-- حالة التدريب الأكاديمي -->
        <div v-else class="flex flex-wrap items-center gap-x-3 gap-y-1 py-1">
          <span class="font-bold text-xs text-slate-300">
            {{ item.academic_institution || 'غير محدد' }}
          </span>
          <template v-if="item.academic_major">
            <span class="text-slate-700 font-bold">-</span>
            <span class="text-[11px] text-slate-400 font-medium">
              {{ item.academic_major }}
            </span>
          </template>
          <span
            v-if="item.required_training_hours"
            class="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/25 shadow-inner"
          >
            المطلوب: {{ item.required_training_hours }} ساعة
          </span>
        </div>
      </template>

      <template #cell-duration_details="{ item }">
        <!-- عرض موعد المعاينة إذا كان في مرحلة المعاينة -->
        <div
          v-if="getEffectiveStatus(item) === 'interview'"
          class="flex items-center gap-1.5 py-1 text-xs font-semibold"
        >
          <span class="text-slate-500 font-bold text-[11px]">المعاينة:</span>
          <span
            class="font-mono text-sky-400 font-bold tracking-wide bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20"
            dir="ltr"
          >
            {{ item.interview_date || 'قيد التحديد' }}
          </span>
        </div>

        <!-- عرض تواريخ التدريب إذا كانت محددة -->
        <div
          v-else-if="item.internship_start_date || item.internship_end_date"
          class="flex flex-wrap items-center gap-x-4 gap-y-1 py-1 text-xs font-semibold"
        >
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

        <span v-else class="text-slate-600 text-[11px] italic">لم تُحدد الفترة بعد</span>
      </template>

      <template #cell-status="{ item }">
        <div class="py-1">
          <span
            class="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border flex items-center w-fit gap-1.5 shadow-md"
            :class="statusClasses(item)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClasses(item)"></span>
            {{ statusLabel(item) }}
          </span>
        </div>
      </template>

      <!-- عمود الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end px-2">
          <button
            v-if="item.status === 'approved' || item.status === 'training' || item.approved_barcode"
            @click.stop="$emit('print-card', item)"
            class="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 rounded-xl border border-indigo-800/30 transition-all flex items-center justify-center shadow-sm hover:scale-105"
            title="عرض وطباعة بطاقة الهوية الرسمية"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
          </button>
          <span
            v-else-if="getEffectiveStatus(item) === 'interview'"
            class="text-sky-400 text-[10px] font-bold pl-2"
            >قيد المعاينة</span
          >
          <span v-else class="text-slate-600 text-[10px] font-medium pl-2 italic"
            >بانتظار الإجراء</span
          >
        </div>
      </template>
    </AppTable>

    <!-- شريط الترقيم السفلي -->
    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  applications: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  currentStatus: { type: String, default: 'pending' },
})

defineEmits(['page-change', 'row-click', 'print-card'])

// ترويسات الجدول المعمارية
const tableHeaders = computed(() => [
  { key: 'applicant_info', label: 'بيانات المتقدم والنوع', class: 'min-w-[290px]' },
  { key: 'tracking_code', label: 'رقم المتابعة', class: 'min-w-[125px]' },
  { key: 'created_at', label: 'تاريخ التقديم', class: 'min-w-[125px]' },
  { key: 'academic_info', label: 'التفاصيل الأكاديمية / الوظيفية', class: 'min-w-[260px]' },
  { key: 'duration_details', label: 'المعاينة / فترة التدريب', class: 'min-w-[200px]' },
  { key: 'status', label: 'حالة السجل', class: 'min-w-[115px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

// تنسيق التاريخ واستخراج جزء التاريخ YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0]
}

// دالة مساعدة لتحديد مفتاح الحالة الفعلي بناءً على تفاصيل السجل
const getEffectiveStatus = (item) => {
  if (typeof item === 'string') return item
  if (item?.internship_status) {
    return item.internship_status
  }
  return item?.status || props.currentStatus
}

// قواميس الترجمة والتسميات العربية
const statusLabel = (item) => {
  const status = getEffectiveStatus(item)
  const labels = {
    pending: 'انتظار المراجعة',
    interview: 'قيد المعاينة',
    approved: 'تحت التدريب',
    training: 'تحت التدريب',
    active: 'تحت التدريب',
    completed: 'منتهي الفترة',
    converted: 'تم التثبيت',
    rejected: 'طلب مرفوض',
  }
  return labels[status] || status
}

// التنسيق المطور لبطاقات الحالة
const statusClasses = (item) => {
  const status = getEffectiveStatus(item)
  const classes = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    interview: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    training: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    converted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  return classes[status] || 'bg-slate-800 text-slate-400 border-slate-700'
}

const statusDotClasses = (item) => {
  const status = getEffectiveStatus(item)
  const classes = {
    pending: 'bg-amber-400 shadow-sm shadow-amber-400/50',
    interview: 'bg-sky-400 shadow-sm shadow-sky-400/50',
    approved: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
    training: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
    active: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
    completed: 'bg-rose-400 shadow-sm shadow-rose-400/50',
    converted: 'bg-indigo-400 shadow-sm shadow-indigo-400/50',
    rejected: 'bg-rose-400 shadow-sm shadow-rose-400/50',
  }
  return classes[status] || 'bg-slate-500'
}
</script>

<style scoped>
table {
  border-spacing: 0;
  width: 100%;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
