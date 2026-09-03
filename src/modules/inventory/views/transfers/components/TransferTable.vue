<!--src/modules/inventory/views/transfers/components/TransferTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="transfers"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <!-- 1. رقم أمر التحويل ومُنشئ السند -->
      <template #cell-transfer_number="{ item }">
        <div class="flex flex-col gap-1 text-right font-mono" dir="rtl">
          <span class="font-bold text-[#e05e2b] bg-[#e05e2b]/10 px-2 py-0.5 rounded w-fit text-xs">
            {{ item.transfer_number || `#${item.id}` }}
          </span>
          <span class="text-[10px] text-text-muted">
            مُنشئ السند: {{ item.creator?.name || 'النظام' }}
          </span>
        </div>
      </template>

      <!-- 2. تاريخ التحويل والملاحظات -->
      <template #cell-transfer_date="{ item }">
        <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
          <span class="text-xs text-text-muted font-mono font-bold">
            {{ item.transfer_date ? item.transfer_date.substr(0, 10) : '-' }}
          </span>
          <span
            v-if="item.notes"
            class="text-xs text-text-muted max-w-[200px] truncate"
            :title="item.notes"
          >
            {{ item.notes }}
          </span>
        </div>
      </template>

      <!-- 3. مسار التحويل (المستودع المصدر -> المستودع الوجهة) -->
      <template #cell-warehouses_route="{ item }">
        <div class="flex items-center gap-2 text-right text-xs" dir="rtl">
          <!-- المستودع المصدر -->
          <div class="flex flex-col">
            <span class="font-bold text-amber-300">
              {{ item.from_warehouse?.name || 'مستودع المصدر' }}
            </span>
            <span v-if="item.from_warehouse?.code" class="text-[10px] font-mono text-gray-500">
              {{ item.from_warehouse.code }}
            </span>
          </div>

          <!-- أيقونة اتجاه التحويل -->
          <div class="text-gray-500 px-1">
            <svg
              class="w-4 h-4 text-[#e05e2b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </div>

          <!-- المستودع الوجهة -->
          <div class="flex flex-col">
            <span class="font-bold text-emerald-300">
              {{ item.to_warehouse?.name || 'مستودع الوجهة' }}
            </span>
            <span v-if="item.to_warehouse?.code" class="text-[10px] font-mono text-gray-500">
              {{ item.to_warehouse.code }}
            </span>
          </div>
        </div>
      </template>

      <!-- 4. حالة الاعتماد والتأثير المخزني -->
      <template #cell-status="{ item }">
        <div class="flex justify-center items-center" dir="rtl">
          <span
            :class="[
              'px-2.5 py-0.5 text-[10px] font-black rounded-full border',
              item.status === 'approved' || item.status === 'completed'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                : item.status === 'cancelled'
                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                  : 'bg-amber-950/40 text-amber-400 border-amber-500/30',
            ]"
          >
            {{
              item.status === 'approved' || item.status === 'completed'
                ? 'معتمد ومرحل'
                : item.status === 'cancelled'
                  ? 'ملغي'
                  : 'مسودة قيد المراجعة'
            }}
          </span>
        </div>
      </template>

      <!-- 5. عدد البنود والاعتماد -->
      <template #cell-summary="{ item }">
        <div class="flex flex-col justify-center min-w-[110px] text-right" dir="rtl">
          <div class="flex justify-between text-[11px] text-text-muted">
            <span>عدد البنود:</span>
            <span class="font-mono font-bold text-white">
              {{ item.items ? item.items.length : '-' }} صنف
            </span>
          </div>
          <div
            v-if="item.approver"
            class="flex justify-between text-[10px] text-text-muted mt-0.5 border-t border-surface-border/50 pt-0.5"
          >
            <span>المعتمد:</span>
            <span class="text-text-secondary font-bold truncate max-w-[80px]">
              {{ item.approver.name }}
            </span>
          </div>
        </div>
      </template>

      <!-- 6. الإجراءات والعمليات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse" @click.stop>
          <!-- زر اعتماد وإكمال التحويل: يظهر فقط إذا كان المستند مسودة -->
          <button
            v-if="item.status === 'draft'"
            @click="$emit('complete-transfer', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="اعتماد وترحيل التحويل وتحديث الأرصدة فورياً"
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
            @click="$emit('print-transfer', item)"
            class="p-1.5 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="طباعة إذن التحويل المخزني A4"
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
            @click="$emit('edit-transfer', item)"
            class="p-1.5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
            title="تعديل بيانات أمر التحويل"
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
            @click="$emit('delete-transfer', item)"
            class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف أمر التحويل"
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
  transfers: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits([
  'page-change',
  'edit-transfer',
  'delete-transfer',
  'complete-transfer',
  'row-clicked',
  'print-transfer',
])

const tableHeaders = computed(() => [
  { key: 'transfer_number', label: 'رقم أمر التحويل' },
  { key: 'transfer_date', label: 'تاريخ التحويل والملاحظات' },
  { key: 'warehouses_route', label: 'مسار التحويل (من ← إلى)' },
  { key: 'status', label: 'حالة الاعتماد', class: 'text-center' },
  { key: 'summary', label: 'ملخص البنود' },
  { key: 'actions', label: 'الإجراءات', class: 'text-left min-w-[110px]' },
])
</script>
