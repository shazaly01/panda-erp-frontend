<!-- src/modules/hr/views/payroll/PayrollInputsTable.vue -->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="inputs" :is-loading="loading">
      <!-- 1. اسم الموظف -->
      <template #cell-employee="{ item }">
        <div class="flex flex-col text-right" dir="rtl">
          <span class="font-black text-xs sm:text-[13px] text-text-primary">
            {{ item.employee_name || '-' }}
          </span>
        </div>
      </template>

      <!-- 2. نوع الحركة والمبلغ -->
      <template #cell-details="{ item }">
        <div class="flex flex-col items-start gap-1.5 text-right" dir="rtl">
          <div class="flex items-center gap-1.5 flex-wrap">
            <AppBadge :variant="getTypeBadgeVariant(item.type)" size="xs" pill>
              {{ getTypeLabel(item.type) }}
            </AppBadge>

            <!-- شارة الربط بالجزاء اللائحي (قابلة للنقر لعرض تفاصيل الجزاء والتدقيق) -->
            <button
              v-if="item.disciplinary_action_id"
              type="button"
              @click.stop="openDisciplinaryDetails(item.disciplinary_action_id)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-primary/12 text-primary border border-primary/30 hover:bg-primary hover:text-white transition-colors cursor-pointer"
              :title="getDisciplinaryTooltip(item)"
            >
              <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>
                جزاء لائحي
                {{ item.disciplinary_action?.number || `#${item.disciplinary_action_id}` }}
              </span>
            </button>
          </div>

          <span
            class="text-xs sm:text-sm font-black font-mono"
            :class="isAdditionType(item.type) ? 'text-success' : 'text-danger'"
          >
            {{ isAdditionType(item.type) ? '+' : '-' }} {{ formatCurrency(item.amount || 0) }}
          </span>
        </div>
      </template>

      <!-- 3. التاريخ والسبب -->
      <template #cell-reason="{ item }">
        <div class="flex flex-col gap-1 text-right" dir="rtl">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-mono font-bold text-text-secondary">
              {{ item.date || '-' }}
            </span>
            <span
              v-if="item.created_by_name"
              class="text-[10px] text-text-muted bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border"
            >
              بواسطة: {{ item.created_by_name }}
            </span>
          </div>
          <span
            class="text-xs text-text-primary font-medium truncate max-w-xs"
            :title="item.reason"
          >
            {{ item.reason || '—' }}
          </span>
        </div>
      </template>

      <!-- 4. حالة الترحيل -->
      <template #cell-status="{ item }">
        <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
          <AppBadge :variant="item.is_processed ? 'info' : 'warning'" size="xs" pill>
            {{ item.is_processed ? 'تم الترحيل' : 'بانتظار الترحيل' }}
          </AppBadge>
          <span
            v-if="item.is_processed && item.payroll_batch_id"
            class="text-[10px] font-mono text-text-muted"
          >
            مسير #{{ item.payroll_batch_id }}
          </span>
        </div>
      </template>

      <!-- 5. الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-1" @click.stop>
          <!-- الحالة 1: الحركة مرحّلة في مسير رواتب -->
          <span
            v-if="item.is_processed"
            class="text-[11px] font-bold text-text-muted px-2 py-1 rounded-lg bg-surface-ground border border-surface-border select-none"
          >
            مغلق (مُرحّل)
          </span>

          <!-- الحالة 2: الحركة ناتجة عن جزاء تأديبي (مقفلة عن التعديل والحذف المباشر) -->
          <template v-else-if="item.disciplinary_action_id">
            <button
              type="button"
              @click="openDisciplinaryDetails(item.disciplinary_action_id)"
              class="p-1.5 text-info hover:bg-info/10 rounded-lg transition-colors cursor-pointer"
              title="عرض تفاصيل الجزاء التأديبي المرتبط"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <span
              class="text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-1 rounded-lg select-none whitespace-nowrap"
              title="هذا الاستقطاع مرتبط بجزاء لائحي؛ لإلغائه انتقل إلى سجل المخالفات والجزاءات"
            >
              مقفل — جزاء لائحي
            </span>
          </template>

          <!-- الحالة 3: حركة يدوية غير مرحّلة (متاح التعديل والحذف حسب الصلاحية) -->
          <template v-else>
            <button
              v-if="authStore.can('payroll_input.update')"
              type="button"
              @click="$emit('edit', item)"
              class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              title="تعديل الحركة المالية"
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
              v-if="authStore.can('payroll_input.delete')"
              type="button"
              @click="$emit('delete', item)"
              class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="حذف الحركة المالية"
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
          </template>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />

    <!-- نافذة تفاصيل الجزاء التأديبي عند النقر على شارة الجزاء اللائحي -->
    <DisciplinaryActionDetailsModal
      v-if="isDisciplinaryModalOpen"
      v-model="isDisciplinaryModalOpen"
      :action-id="selectedDisciplinaryActionId"
      @updated="handleDisciplinaryActionUpdated"
    />
  </AppCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePayrollInputStore } from '@/modules/hr/stores/payrollInputStore'
import { useDisciplinaryActionStore } from '@/modules/hr/stores/disciplinaryActionStore'
import { formatCurrency } from '@/utils/formatters'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import DisciplinaryActionDetailsModal from '@/modules/hr/views/disciplinary/components/DisciplinaryActionDetailsModal.vue'

defineProps({
  inputs: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()
const payrollInputStore = usePayrollInputStore()
const disciplinaryStore = useDisciplinaryActionStore()

const tableHeaders = computed(() => [
  { key: 'employee', label: 'الموظف', class: 'min-w-[180px]' },
  { key: 'details', label: 'النوع والمبلغ', class: 'min-w-[170px]' },
  { key: 'reason', label: 'السبب والتاريخ', class: 'min-w-[220px]' },
  { key: 'status', label: 'حالة الحركة', class: 'min-w-[120px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[140px]' },
])

const isAdditionType = (type) => type === 'bonus' || type === 'allowance'

const getTypeLabel = (type) => {
  const labels = {
    bonus: 'حافز',
    penalty: 'جزاء',
    allowance: 'بدل',
    deduction: 'استقطاع',
  }
  return labels[type] || type
}

const getTypeBadgeVariant = (type) => {
  const variants = {
    bonus: 'success',
    penalty: 'danger',
    allowance: 'info',
    deduction: 'warning',
  }
  return variants[type] || 'secondary'
}

const getDisciplinaryTooltip = (item) => {
  const da = item.disciplinary_action
  if (!da) return 'انقر لاستعراض تفاصيل الجزاء التأديبي'
  return `جزاء لائحي ${da.number} - الدرجة (${da.step_order}): ${da.action_type_label} (انقر للتفاصيل)`
}

// إدارة نافذة تفاصيل الجزاء التأديبي
const isDisciplinaryModalOpen = ref(false)
const selectedDisciplinaryActionId = ref(null)

const openDisciplinaryDetails = (actionId) => {
  if (!actionId) return
  selectedDisciplinaryActionId.value = actionId
  isDisciplinaryModalOpen.value = true
}

const handleDisciplinaryActionUpdated = () => {
  const updatedAction = disciplinaryStore.singleAction
  if (updatedAction?.status === 'cancelled' && Array.isArray(payrollInputStore.inputs)) {
    payrollInputStore.inputs = payrollInputStore.inputs.filter(
      (row) => Number(row.disciplinary_action_id) !== Number(updatedAction.id),
    )
    if (payrollInputStore.pagination.total > 0) {
      payrollInputStore.pagination.total -= 1
    }
  }
}
</script>
