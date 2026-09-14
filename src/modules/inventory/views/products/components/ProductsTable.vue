<!--src\modules\inventory\views\products\components\ProductsTable.vue--->
<template>
  <AppCard class="overflow-hidden">
    <AppTable :headers="tableHeaders" :items="products" :is-loading="loading">
      <!-- الخلية الأولى: بيانات الصنف والـ SKU والأسماء البديلة -->
      <template #cell-product_info="{ item }">
        <div class="py-1 space-y-1">
          <div class="font-bold text-sm text-text-primary">
            {{ item.name }}
          </div>

          <!-- عرض الأسماء البديلة إن وجدت -->
          <div v-if="item.aliases" class="text-xs text-text-muted flex items-center gap-1.5">
            <span
              class="px-1.5 py-0.5 rounded bg-surface-border/60 text-text-secondary font-medium text-[10px]"
            >
              بدائل:
            </span>
            <span class="truncate max-w-[240px]" :title="item.aliases">
              {{ item.aliases }}
            </span>
          </div>

          <div class="flex items-center gap-2 mt-0.5">
            <span
              v-if="item.sku"
              class="text-xs font-mono font-semibold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 px-2 py-0.5 rounded"
            >
              SKU: {{ item.sku }}
            </span>
            <span class="text-xs text-text-muted">
              {{ getTypeLabel(item.type) }}
            </span>
          </div>
        </div>
      </template>

      <!-- القسم / التصنيف -->
      <template #cell-category="{ item }">
        <span
          class="text-xs font-medium text-text-secondary bg-surface-ground px-2.5 py-1 rounded-lg border border-surface-border"
        >
          {{ item.category?.name || 'غير محدد' }}
        </span>
      </template>

      <!-- طريقة التقييم والخصم -->
      <template #cell-policy="{ item }">
        <div class="text-xs space-y-0.5">
          <div class="font-semibold text-text-primary">
            تقييم: {{ item.valuation_method?.toUpperCase() }}
          </div>
          <div class="text-text-muted">تتبع: {{ getTrackingLabel(item.tracking_type) }}</div>
        </div>
      </template>

      <!-- التكلفة المعيارية -->
      <template #cell-cost_price="{ item }">
        <span class="font-mono font-bold text-sm text-text-primary">
          {{ Number(item.cost_price || 0).toFixed(2) }}
        </span>
      </template>

      <!-- الحالة -->
      <template #cell-status="{ item }">
        <span
          class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1.5"
          :class="
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="item.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>
          {{ item.is_active ? 'نشط' : 'موقوف' }}
        </span>
      </template>

      <!-- الإجراءات (مربوطة بأسماء صلاحيات Spatie المطابقة للـ Seeder) -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('inventory.products.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-blue-600 dark:text-sky-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
            title="تعديل الصنف"
            type="button"
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
            v-if="authStore.can('inventory.products.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="حذف الصنف"
            type="button"
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
useAuthStore
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

defineProps({
  products: { type: Array, required: true },
  pagination: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

defineEmits(['page-change', 'edit', 'delete'])

const authStore = useAuthStore()

const tableHeaders = computed(() => [
  { key: 'product_info', label: 'اسم الصنف والكود', class: 'min-w-[240px]' },
  { key: 'category', label: 'التصنيف', class: 'min-w-[140px]' },
  { key: 'policy', label: 'التقييم والتتبع', class: 'min-w-[150px]' },
  { key: 'cost_price', label: 'التكلفة المعيارية', class: 'min-w-[120px]' },
  { key: 'status', label: 'الحالة', class: 'min-w-[100px]' },
  { key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' },
])

const getTypeLabel = (type) => {
  const map = {
    storable: 'منتج مخزني',
    raw_material: 'مادة خام',
    composite: 'منتج تجميعي',
    service: 'خدمة',
  }
  return map[type] || type
}

const getTrackingLabel = (tracking) => {
  const map = {
    none: 'بدون',
    by_batch: 'تشغيلة/دفعة',
    by_serial: 'رقم تسلسلي',
  }
  return map[tracking] || tracking
}
</script>
