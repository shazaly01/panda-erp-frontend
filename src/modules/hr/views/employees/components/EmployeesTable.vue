<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="employees" :is-loading="loading">
      <template #cell-employee_info="{ item }">
        <div class="flex items-center gap-3 py-1">
          <div
            class="w-10 h-10 rounded-full bg-surface-border flex-shrink-0 overflow-hidden flex items-center justify-center text-text-muted font-bold"
          >
            <img
              v-if="item.avatar"
              :src="item.avatar"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ item.full_name.charAt(0) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-sm text-text-primary">{{ item.full_name }}</span>
            <span class="text-xs font-mono text-text-muted">#{{ item.employee_number }}</span>
          </div>
        </div>
      </template>

      <template #cell-job_info="{ item }">
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium text-text-primary">
            {{ item.position?.name || 'غير محدد' }}
          </span>
          <span class="text-xs text-text-muted">
            {{ item.department?.name || 'بدون إدارة' }}
          </span>
        </div>
      </template>

      <template #cell-shift="{ item }">
        <div v-if="item.latest_shift?.shift" class="flex flex-col">
          <span class="text-sm font-bold text-blue-600">
            {{ item.latest_shift.shift.name }}
          </span>
          <span class="text-[10px] text-amber-600 font-mono">
            {{ item.latest_shift.shift.start_time?.substring(0, 5) }} -
            {{ item.latest_shift.shift.end_time?.substring(0, 5) }}
          </span>
        </div>
        <span v-else class="text-xs text-text-muted italic">لا توجد وردية</span>
      </template>

      <template #cell-contact="{ item }">
        <div class="flex flex-col gap-2 text-xs text-text-secondary">
          <div v-if="item.phone" class="flex items-center justify-start gap-1.5">
            <svg
              class="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span dir="ltr" class="mt-0.5">{{ item.phone }}</span>
          </div>

          <div v-if="item.email" class="flex items-center justify-start gap-1.5">
            <svg
              class="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span dir="ltr" class="truncate max-w-[130px] mt-0.5" :title="item.email">
              {{ item.email }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="getStatusClasses(item.status)"
        >
          {{ item.status_label }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            @click.stop="$emit('view-statement', item)"
            class="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="كشف الحساب المالي (Sub-Ledger)"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          <button
            @click.stop="$emit('manage-shift', item)"
            class="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="إدارة وردية الموظف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            @click.stop="$emit('print-card', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="طباعة بطاقة الهوية"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr.employees.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل ملف الموظف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr.employees.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف الموظف"
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
  employees: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete', 'view-statement', 'print-card', 'manage-shift'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee_info', label: 'الموظف', class: 'min-w-[220px]' },
  { key: 'job_info', label: 'المنصب والإدارة', class: 'min-w-[180px]' },
  { key: 'shift', label: 'الوردية', class: 'min-w-[150px]' }, // 🌟 أضفنا الهيدر هنا
  { key: 'contact', label: 'معلومات الاتصال', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[185px]' },
])

const getStatusClasses = (status) => {
  const map = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    probation: 'bg-sky-50 text-sky-700 border-sky-200',
    on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
    resigned: 'bg-gray-50 text-gray-700 border-gray-200',
    terminated: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  return map[status] || 'bg-surface-border text-text-muted'
}
</script>
