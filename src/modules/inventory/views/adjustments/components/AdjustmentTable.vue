<!--src/modules/inventory/views/adjustments/components/AdjustmentTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="adjustments"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- المعرف ورقم طلب التسوية -->
      <template #cell-adjustment_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span class="font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded w-fit text-xs">
            {{ item.adjustment_number || `#${item.id}` }}
          </span>
          <span class="text-[10px] text-text-muted">
            مُنشئ السند: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- طبيعة وتاريخ السند والنوع -->
      <template #cell-type_info="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <div class="flex items-center gap-2">
            <span
              v-if="!currentType"
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded border',
                getTypeBadgeClass(item.type),
              ]"
            >
              {{ getTypeLabel(item.type) }}
            </span>
            <span class="text-xs text-text-muted font-mono">
              {{ item.adjustment_date ? item.adjustment_date.substr(0, 10) : '-' }}
            </span>
          </div>
          <span v-if="item.notes" class="text-xs text-text-muted max-w-[220px] truncate">
            {{ item.notes }}
          </span>
        </div>
      </template>

      <!-- المستودع -->
      <template #cell-warehouse="{ item }">
        <div class="flex flex-col justify-center text-right" dir="rtl">
          <span class="font-bold text-xs text-text-primary">
            {{ item.warehouse?.name || 'مستودع غير محدد' }}
          </span>
          <span v-if="item.warehouse?.code" class="text-[10px] font-mono text-text-muted">
            كود: {{ item.warehouse.code }}
          </span>
        </div>
      </template>

      <!-- حالة الاعتماد والتأثير المخزني -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <span
            :class="[
              'px-2.5 py-0.5 text-[10px] font-black rounded-full border',
              item.status === 'approved'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-950/40 text-amber-400 border-amber-500/30',
            ]"
          >
            {{ item.status === 'approved' ? 'معتمد ومرحل' : 'مسودة قيد المراجعة' }}
          </span>
        </div>
      </template>

      <!-- الأثر المالي الإجمالي المتكيف بحسب النوع -->
      <template #cell-financials="{ item }">
        <div class="flex flex-col justify-center min-w-[130px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-muted">
            <span>{{ getFinancialLabel(item.type) }}:</span>
            <span class="font-mono font-bold" :class="getFinancialValueClass(item)">
              {{ getFormattedFinancialValue(item) }}
            </span>
          </div>
          <div
            v-if="item.approved_by"
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border/50 pt-0.5"
          >
            <span>المعتمد:</span>
            <span class="text-text-secondary font-bold truncate max-w-[90px]">
              {{ item.approver?.name || '-' }}
            </span>
          </div>
        </div>
      </template>

      <!-- الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر اعتماد التسوية: يظهر فقط إذا كان المستند مسودة -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('approve-adjustment', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="اعتماد وترحيل التسوية وتطبيق الأثر المخزني"
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

          <!-- زر طباعة السند -->
          <button
            @click="$emit('print-adjustment', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="طباعة محضر التسوية الجردية A4"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>

          <!-- زر التعديل: يتاح للمسودات فقط -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('edit-adjustment', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
            title="تعديل بيانات التسوية"
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

          <!-- زر الحذف: يتاح للمسودات فقط -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('delete-adjustment', item)"
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف طلب التسوية"
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
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  adjustments: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  currentType: { type: String, default: '' },
})

defineEmits([
  'page-change',
  'edit-adjustment',
  'delete-adjustment',
  'approve-adjustment',
  'row-clicked',
  'print-adjustment',
])

const tableHeaders = computed(() => [
  { key: 'adjustment_number', label: 'رقم السند والمعرف' },
  {
    key: 'type_info',
    label: props.currentType ? 'تاريخ السند والتوثيق' : 'طبيعة وتاريخ التسوية',
  },
  { key: 'warehouse', label: 'المستودع الخاضع للجرد' },
  { key: 'status', label: 'حالة الاعتماد', class: 'text-center' },
  {
    key: 'financials',
    label: getColumnFinancialHeader(props.currentType),
  },
  { key: 'actions', label: 'إجراءات تخصصية', class: 'text-left min-w-[110px]' },
])

const getColumnFinancialHeader = (type) => {
  switch (type) {
    case 'damage':
      return 'إجمالي خسائر الإتلاف'
    case 'loss':
      return 'إجمالي خسائر العجز'
    case 'opening_balance':
      return 'قيمة الرصيد الافتتاحي'
    default:
      return 'الأثر المالي للتسوية'
  }
}

const getFinancialLabel = (type) => {
  switch (type) {
    case 'damage':
      return 'قيمة التالف'
    case 'loss':
      return 'قيمة الفاقد'
    case 'opening_balance':
      return 'القيمة'
    default:
      return 'صافي الأثر'
  }
}

const getFinancialValueClass = (item) => {
  if (item.type === 'damage' || item.type === 'loss') {
    return 'text-rose-400'
  }
  if (item.type === 'opening_balance') {
    return 'text-purple-400'
  }
  const cost = parseFloat(item.total_cost) || 0
  return cost > 0 ? 'text-emerald-400' : cost < 0 ? 'text-rose-400' : 'text-text-primary'
}

const getFormattedFinancialValue = (item) => {
  const cost = parseFloat(item.total_cost) || 0
  if (item.type === 'damage' || item.type === 'loss') {
    return formatCurrency(cost)
  }
  if (item.type === 'opening_balance') {
    return formatCurrency(cost)
  }
  return `${cost > 0 ? '+' : ''}${formatCurrency(cost)}`
}

const getTypeLabel = (type) => {
  const map = {
    physical_count: 'جرد دوري / فعلي',
    opening_balance: 'رصيد افتتاحي',
    general_adjustment: 'تسوية عامة',
    damage: 'تسوية تالف',
    loss: 'تسوية عجز وفاقد',
  }
  return map[type] || type || 'تسوية مخزنية'
}

const getTypeBadgeClass = (type) => {
  const map = {
    physical_count: 'bg-blue-950/50 text-blue-400 border-blue-500/30',
    opening_balance: 'bg-purple-950/50 text-purple-400 border-purple-500/30',
    general_adjustment: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30',
    damage: 'bg-rose-950/50 text-rose-400 border-rose-500/30',
    loss: 'bg-amber-950/50 text-amber-400 border-amber-500/30',
  }
  return map[type] || 'bg-gray-800 text-gray-300 border-gray-600'
}
</script>
