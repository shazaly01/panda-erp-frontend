<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="visitors" :is-loading="loading">
      <template #cell-visitor_info="{ item }">
        <div class="flex flex-col gap-0.5 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </span>
          <span class="text-xs text-text-muted font-mono">
            {{ item.phone }}
          </span>
          <span
            v-if="item.national_id"
            class="text-[10px] font-mono font-bold text-text-muted bg-gray-100 dark:bg-gray-800 w-fit px-1.5 py-0.5 rounded mt-1"
          >
            بطاقة/جواز: {{ item.national_id }}
          </span>
        </div>
      </template>

      <template #cell-visit_details="{ item }">
        <div class="flex flex-col gap-1 py-1">
          <span class="text-xs font-bold text-primary">
            {{ item.visit_date || '---' }}
          </span>
          <span class="text-xs text-text-muted max-w-xs truncate" :title="item.purpose">
            {{ item.purpose || 'بدون سبب محدد' }}
          </span>
        </div>
      </template>

      <template #cell-host_employee="{ item }">
        <div v-if="item.employee" class="flex flex-col gap-0.5 py-1">
          <span class="font-medium text-xs text-text-primary">
            {{ item.employee.name }}
          </span>
          <span v-if="item.employee.department" class="text-[11px] text-text-muted">
            ({{ item.employee.department.name }})
          </span>
        </div>
        <span v-else class="text-xs text-text-muted">---</span>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="statusClasses(item.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClasses(item.status)"></span>
          {{ statusLabel(item.status) }}
        </span>
      </template>

      <template #cell-gate_actions="{ item }">
        <div class="flex items-center gap-2">
          <button
            v-if="item.status === 'pending' && authStore.can('hr_visitors.check_in')"
            @click.stop="$emit('check-in', item)"
            class="px-2.5 py-1 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded shadow-sm transition-colors flex items-center gap-1"
            title="إثبات دخول المنشأة الآن"
          >
            تسجيل دخول
          </button>

          <button
            v-if="item.status === 'checked_in' && authStore.can('hr_visitors.check_out')"
            @click.stop="$emit('check-out', item)"
            class="px-2.5 py-1 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm transition-colors flex items-center gap-1"
            title="إثبات مغادرة المنشأة الآن"
          >
            تسجيل خروج
          </button>

          <span v-if="item.status === 'checked_out'" class="text-[11px] text-text-muted italic">
            غادر المنشأة
          </span>
          <span v-if="item.status === 'canceled'" class="text-[11px] text-rose-400 italic">
            ملغية
          </span>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr_visitors.update') && item.status !== 'checked_out'"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل بيانات الزائر"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr_visitors.delete')"
            @click.stop="$emit('delete', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.status === 'checked_in'
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50',
            ]"
            :title="
              item.status === 'checked_in' ? 'لا يمكن الحذف لتواجد الزائر داخل المنشأة' : 'حذف'
            "
            :disabled="item.status === 'checked_in'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  visitors: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete', 'check-in', 'check-out'])

const authStore = useAuthStore()

// تعيين ترويسات الجدول المتوافقة مع معطيات الزوار والبوابات
const tableHeaders = computed(() => [
  { key: 'visitor_info', label: 'بيانات الزائر', class: 'min-w-[180px]' },
  { key: 'visit_details', label: 'تاريخ وسبب الزيارة', class: 'min-w-[180px]' },
  { key: 'host_employee', label: 'الموظف المستضيف', class: 'min-w-[160px]' },
  { key: 'status', label: 'الحالة الإدارية', class: 'min-w-[100px]' },
  { key: 'gate_actions', label: 'حركة الحرس (الأمن)', class: 'min-w-[140px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[90px]' },
])

// القواميس المساعدة لترجمة الحالات وتلوينها حركياً بالتوافق مع الـ Tailwind
const statusLabel = (status) => {
  const labels = {
    pending: 'انتظار الوصول',
    approved: 'تم الاعتماد',
    checked_in: 'داخل المنشأة',
    checked_out: 'غادر المنشأة',
    canceled: 'ملغية',
  }
  return labels[status] || status
}

const statusClasses = (status) => {
  const classes = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-sky-50 text-sky-700 border-sky-200',
    checked_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    checked_out: 'bg-gray-50 text-gray-600 border-gray-200',
    canceled: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  return classes[status] || 'bg-gray-50 text-gray-700'
}

const statusDotClasses = (status) => {
  const classes = {
    pending: 'bg-amber-500',
    approved: 'bg-sky-500',
    checked_in: 'bg-emerald-500',
    checked_out: 'bg-gray-400',
    canceled: 'bg-rose-500',
  }
  return classes[status] || 'bg-gray-500'
}
</script>
