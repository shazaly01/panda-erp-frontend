<!-- src/modules/hr/views/employees/components/EmployeesTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="employees" :is-loading="loading">
      <!-- 1. بيانات الموظف -->
      <template #cell-employee_info="{ item }">
        <div class="flex items-center gap-3 py-1 text-right" dir="rtl">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 text-primary flex-shrink-0 overflow-hidden flex items-center justify-center font-black text-sm shadow-2xs"
          >
            <img
              v-if="item.profile_photo?.url || item.avatar"
              :src="item.profile_photo?.url || item.avatar"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ item.full_name?.charAt(0) || '?' }}</span>
          </div>

          <div class="flex flex-col items-start gap-1">
            <span class="font-bold text-xs sm:text-sm text-text-primary">
              {{ item.full_name }}
            </span>
            <AppBadge variant="primary" size="xs" class="font-mono">
              #{{ item.employee_number }}
            </AppBadge>
          </div>
        </div>
      </template>

      <!-- 2. المنصب والإدارة -->
      <template #cell-job_info="{ item }">
        <div class="flex flex-col gap-0.5 text-right" dir="rtl">
          <span class="text-xs sm:text-sm font-bold text-text-primary">
            {{ item.position?.name || 'غير محدد' }}
          </span>
          <span class="text-[11px] text-text-muted font-medium">
            {{ item.department?.name || 'بدون إدارة' }}
          </span>
        </div>
      </template>

      <!-- 3. الوردية -->
      <template #cell-shift="{ item }">
        <div v-if="item.latest_shift?.shift" class="flex flex-col gap-0.5 text-right" dir="rtl">
          <span class="text-xs font-bold text-primary">
            {{ item.latest_shift.shift.name }}
          </span>
          <span class="text-[11px] text-text-secondary font-mono">
            {{ item.latest_shift.shift.start_time?.substring(0, 5) }} -
            {{ item.latest_shift.shift.end_time?.substring(0, 5) }}
          </span>
        </div>
        <span v-else class="text-xs text-text-muted italic">لا توجد وردية</span>
      </template>

      <!-- 4. معلومات الاتصال -->
      <template #cell-contact="{ item }">
        <div class="flex flex-col gap-1.5 text-xs text-text-secondary text-right" dir="rtl">
          <div v-if="item.phone" class="flex items-center justify-start gap-1.5">
            <svg
              class="w-3.5 h-3.5 text-primary flex-shrink-0"
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
            <span dir="ltr" class="font-mono font-bold text-text-primary">{{ item.phone }}</span>
          </div>

          <div v-if="item.email" class="flex items-center justify-start gap-1.5">
            <svg
              class="w-3.5 h-3.5 text-text-muted flex-shrink-0"
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
            <span dir="ltr" class="truncate max-w-[140px] text-[11px]" :title="item.email">
              {{ item.email }}
            </span>
          </div>

          <span v-if="!item.phone && !item.email" class="text-text-muted/50 font-mono">—</span>
        </div>
      </template>

      <!-- 5. الحالة الوظيفية -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <AppBadge :variant="getStatusVariant(item.status)" size="xs" pill>
            {{ item.status_label }}
          </AppBadge>
        </div>
      </template>

      <!-- 6. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- الأرشيف الإلكتروني -->
          <button
            type="button"
            @click="$emit('manage-documents', item)"
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="الأرشيف الإلكتروني وإدارة الوثائق الثبوتية"
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
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              />
            </svg>
          </button>

          <!-- كشف الحساب المالي -->
          <button
            type="button"
            @click="$emit('view-statement', item)"
            class="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer"
            title="كشف الحساب المالي (Sub-Ledger)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          <!-- إدارة الوردية -->
          <button
            type="button"
            @click="$emit('manage-shift', item)"
            class="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
            title="إدارة وردية الموظف"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- طباعة بطاقة الهوية -->
          <button
            type="button"
            @click="$emit('print-card', item)"
            class="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
            title="طباعة بطاقة الهوية"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
          </button>

          <!-- تعديل ملف الموظف -->
          <button
            v-if="authStore.can('hr.employees.update')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل ملف الموظف"
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

          <!-- حذف الموظف -->
          <button
            v-if="authStore.can('hr.employees.delete')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف الموظف"
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
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

defineProps({
  employees: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit',
  'delete',
  'view-statement',
  'print-card',
  'manage-shift',
  'manage-documents',
])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee_info', label: 'الموظف', class: 'min-w-[220px]' },
  { key: 'job_info', label: 'المنصب والإدارة', class: 'min-w-[180px]' },
  { key: 'shift', label: 'الوردية', class: 'min-w-[150px]' },
  { key: 'contact', label: 'معلومات الاتصال', class: 'min-w-[150px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[120px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[220px]' },
])

const getStatusVariant = (status) => {
  const map = {
    active: 'success',
    probation: 'info',
    on_leave: 'warning',
    resigned: 'secondary',
    terminated: 'danger',
  }
  return map[status] || 'secondary'
}
</script>
