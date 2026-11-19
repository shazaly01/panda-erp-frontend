<!-- src/modules/hr/views/contracts/components/ContractsTable.vue -->
<template>
  <AppCard>
    <AppTable :headers="tableHeaders" :items="contracts" :is-loading="loading">
      <!-- 1. بيانات الموظف -->
      <template #cell-employee="{ item }">
        <div class="flex flex-col items-start gap-1 py-1 text-right" dir="rtl">
          <span class="font-bold text-xs sm:text-sm text-text-primary">
            {{ item.employee?.full_name || 'موظف غير محدد' }}
          </span>
          <AppBadge variant="primary" size="xs" class="font-mono">
            #{{ item.employee?.employee_number || '---' }}
          </AppBadge>
        </div>
      </template>

      <!-- 2. تفاصيل الراتب وقالب الجدولة -->
      <template #cell-salary_details="{ item }">
        <div class="flex flex-col gap-1.5 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs sm:text-sm font-mono font-black text-success">
              {{ formatCurrency(item.basic_salary || 0) }}
            </span>
            <AppBadge variant="info" size="xs">
              {{ item.pay_group?.name || 'مجموعة غير محددة' }}
            </AppBadge>
          </div>

          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-text-secondary font-medium">
              هيكل الراتب:
              <strong class="text-text-primary font-bold">
                {{ item.salary_structure?.name || 'غير محدد' }}
              </strong>
            </span>

            <span class="text-[11px] text-primary font-bold flex items-center gap-1">
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>جدولة: {{ item.working_schedule?.name || 'بدون جدولة' }}</span>
            </span>
          </div>
        </div>
      </template>

      <!-- 3. مدة العقد -->
      <template #cell-duration="{ item }">
        <div class="flex flex-col gap-1 text-xs text-right" dir="rtl">
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px] w-7">من:</span>
            <span class="font-mono font-bold text-text-primary">
              {{ item.start_date ? String(item.start_date).substring(0, 10) : '-' }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-text-muted text-[11px] w-7">إلى:</span>
            <span v-if="item.end_date" class="font-mono font-bold text-text-secondary">
              {{ String(item.end_date).substring(0, 10) }}
            </span>
            <span v-else class="text-[11px] font-bold text-info"> مفتوح المدة </span>
          </div>
        </div>
      </template>

      <!-- 4. الحالة ونمط الحضور والمرفقات -->
      <template #cell-status_attachment="{ item }">
        <div class="flex items-center justify-center gap-2 flex-wrap" dir="rtl">
          <AppBadge :variant="item.is_active ? 'success' : 'danger'" size="xs" pill>
            {{ item.is_active ? 'ساري' : 'منتهي' }}
          </AppBadge>

          <AppBadge
            :variant="item.attendance_mode === 'auto' ? 'warning' : 'secondary'"
            size="xs"
            pill
            :title="item.attendance_mode === 'auto' ? 'تسجيل حضور تلقائي' : 'يتطلب بصمة يدوية'"
          >
            <span class="inline-flex items-center gap-1">
              <svg
                v-if="item.attendance_mode === 'auto'"
                class="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ item.attendance_mode === 'auto' ? 'تلقائي' : 'يدوي' }}</span>
            </span>
          </AppBadge>

          <a
            v-if="item.attachment_url"
            :href="item.attachment_url"
            target="_blank"
            @click.stop
            class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
            title="عرض نسخة العقد المرفقة"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </a>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <button
            v-if="authStore.can('hr.contracts.manage')"
            type="button"
            @click="$emit('edit', item)"
            class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="تعديل العقد"
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

          <button
            v-if="authStore.can('hr.contracts.manage')"
            type="button"
            @click="$emit('delete', item)"
            class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            title="حذف العقد"
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
import { formatCurrency } from '@/utils/formatters'

defineProps({
  contracts: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف', class: 'min-w-[200px]' },
  { key: 'salary_details', label: 'الراتب والجدولة', class: 'min-w-[250px]' },
  { key: 'duration', label: 'مدة العقد', class: 'min-w-[160px]' },
  { key: 'status_attachment', label: 'الحالة والمرفقات', class: 'min-w-[190px] text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[110px]' },
])
</script>
