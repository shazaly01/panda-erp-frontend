<!---src\modules\hr\views\leave-passes\components\LeavePassesTable.vue-->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="leavePasses" :is-loading="loading">
      <template #cell-employee_info="{ item }">
        <div class="flex flex-col gap-0.5 py-1">
          <span class="font-bold text-sm text-text-primary">
            {{ item.employee?.full_name || '---' }}
          </span>
          <span class="text-xs text-text-muted flex items-center gap-2">
            <span>رقم: {{ item.employee?.employee_number || '---' }}</span>
            <span class="text-surface-border">|</span>
            <span>{{ item.employee?.phone || '---' }}</span>
          </span>
        </div>
      </template>

      <template #cell-time_window="{ item }">
        <div class="flex items-center gap-1.5 text-xs font-medium text-text-primary py-1">
          <span class="bg-surface-border/50 px-2 py-0.5 rounded text-text-secondary">
            {{ item.requested_leave_at }}
          </span>
          <span class="text-text-muted text-[10px]">إلى</span>
          <span class="bg-surface-border/50 px-2 py-0.5 rounded text-text-secondary">
            {{ item.requested_return_at }}
          </span>
        </div>
      </template>

      <template #cell-actual_time="{ item }">
        <div class="flex flex-col gap-0.5 text-[11px] py-1">
          <div v-if="item.actual_leave_at" class="text-amber-600 dark:text-amber-400 font-mono">
            خروج: {{ item.actual_leave_at.substring(11, 16) }}
          </div>
          <div v-if="item.actual_return_at" class="text-blue-600 dark:text-blue-400 font-mono">
            عودة: {{ item.actual_return_at.substring(11, 16) }}
          </div>
          <span v-if="!item.actual_leave_at && !item.actual_return_at" class="text-text-muted">
            ---
          </span>
        </div>
      </template>

      <template #cell-pass_code="{ item }">
        <span
          class="text-xs font-mono font-bold text-primary bg-primary/10 w-fit px-2 py-0.5 rounded tracking-wider"
        >
          {{ item.pass_code }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="{
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400':
              item.status === 'approved',
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400':
              item.status === 'out',
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400':
              item.status === 'returned',
            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400':
              item.status === 'rejected',
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="{
              'bg-emerald-500': item.status === 'approved',
              'bg-amber-500': item.status === 'out',
              'bg-blue-500': item.status === 'returned',
              'bg-rose-500': item.status === 'rejected',
            }"
          ></span>
          {{
            item.status === 'approved'
              ? 'معتمد للعبور'
              : item.status === 'out'
                ? 'خارج المنشأة'
                : item.status === 'returned'
                  ? 'عاد للمنشأة'
                  : 'مرفوض'
          }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('hr_leave_passes.update')"
            @click.stop="$emit('edit', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.status === 'out' || item.status === 'returned'
                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
            ]"
            :title="
              item.status === 'out' || item.status === 'returned'
                ? 'لا يمكن التعديل بعد التحرك الفعلي'
                : 'تعديل الإذن'
            "
            :disabled="item.status === 'out' || item.status === 'returned'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24 " stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('hr_leave_passes.delete')"
            @click.stop="$emit('delete', item)"
            :class="[
              'p-1.5 rounded-lg transition-colors',
              item.status === 'out' || item.status === 'returned'
                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10',
            ]"
            :title="
              item.status === 'out' || item.status === 'returned'
                ? 'لا يمكن الحذف بعد توثيق الحركة أمنياً'
                : 'إلغاء الإذن نهائياً'
            "
            :disabled="item.status === 'out' || item.status === 'returned'"
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

defineProps({
  leavePasses: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

// مصفوفة العناوين المطابقة لخصائص ومخرجات موديول أذونات الخروج
const tableHeaders = computed(() => [
  { key: 'employee_info', label: 'الموظف', class: 'min-w-[220px]' },
  { key: 'time_window', label: 'الوقت المخطط اليوم', class: 'min-w-[150px]' },
  { key: 'actual_time', label: 'الحركة الفعلية (البوابة)', class: 'min-w-[150px]' },
  { key: 'pass_code', label: 'رمز الإذن (QR)', class: 'min-w-[120px]' },
  { key: 'status', label: 'الحالة الحركية', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])
</script>
