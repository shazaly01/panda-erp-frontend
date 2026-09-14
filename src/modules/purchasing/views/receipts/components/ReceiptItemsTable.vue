<!--src/modules/purchasing/views/receipts/components/ReceiptItemsTable.vue-->
<template>
  <div class="p-0 bg-transparent space-y-4 font-sans text-right" dir="rtl">
    <!-- شريط البحث الذكي بنمط الكاشير السريع (باركود / كود / اسم) -->
    <div
      class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
    >
      <SmartSearchGrid
        :data="searchableProducts"
        :columns="[
          { key: 'id_display', label: 'كود الصنف', class: 'text-right' },
          { key: 'name', label: 'اسم الصنف التجاري', class: 'text-right font-bold' },
          { key: 'cost_display', label: 'تكلفة الشراء التقديرية', class: 'text-center' },
          { key: 'stock_display', label: 'الرصيد الحالي بالمستودع', class: 'text-center' },
        ]"
        :search-keys="['id', 'name', 'code', 'all_barcodes']"
        placeholder="ابحث باسم الصنف، الكود، أو امسح الباركود لإدراج صنف الاستلام فوراً..."
        @select="handleGlobalItemSelect"
      />
    </div>

    <!-- تنبيه خطأ التحقق العام لقائمة بنود الاستلام -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/50"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- جدول بنود وتفاصيل الاستلام المخزني -->
    <InvoiceDetailTable
      :items="items"
      :schema="visibleTableSchema"
      @remove-row="removeRow"
      @add-row-request="triggerAddNewEmptyLine"
    >
      <!-- 1. خلية اختيار وحدة القياس -->
      <template #cell-product_unit_id="{ row, index }">
        <div class="flex flex-col w-full">
          <select
            v-model="row.product_unit_id"
            @change="syncUnitDetails(row)"
            :disabled="!row.available_units || row.available_units.length === 0"
            style="color-scheme: dark"
            class="w-full p-1 bg-transparent text-white border border-transparent hover:border-gray-500 focus:border-[#e05e2b] rounded-md text-xs font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right appearance-none"
          >
            <option value="" class="bg-[#16171b] text-gray-400">اختر الوحدة...</option>
            <option
              v-for="u in row.available_units"
              :key="u.id"
              :value="u.id"
              class="bg-[#16171b] text-white"
            >
              {{ u.unit_name || u.name || 'وحدة غير معرفة' }}
            </option>
          </select>
          <p
            v-if="getValidationError(`items.${index}.product_unit_id`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5"
          >
            {{ getValidationError(`items.${index}.product_unit_id`) }}
          </p>
        </div>
      </template>

      <!-- 2. خلية الكمية المستلمة فعلياً -->
      <template #cell-quantity_received="{ row, index, col }">
        <div class="flex flex-col w-full">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.quantity_received)"
            @input="handleQuantityReceivedChange(row, unformatNumber($event.target.value))"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-sky-500 focus:border-sky-400 rounded transition-all text-xs text-center font-mono text-sky-400 font-bold outline-none focus:ring-1 focus:ring-sky-400/30"
            placeholder="1"
          />
          <p
            v-if="getValidationError(`items.${index}.quantity_received`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5 text-center"
          >
            {{ getValidationError(`items.${index}.quantity_received`) }}
          </p>
        </div>
      </template>

      <!-- 3. خلية الكمية المقبولة (تُحدث الرصيد المخزني) -->
      <template #cell-quantity_accepted="{ row, index, col }">
        <div class="flex flex-col w-full">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.quantity_accepted)"
            @input="handleQuantityAcceptedChange(row, unformatNumber($event.target.value))"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-emerald-500 focus:border-emerald-400 rounded transition-all text-xs text-center font-mono text-emerald-400 font-bold outline-none focus:ring-1 focus:ring-emerald-400/30"
            placeholder="1"
          />
          <p
            v-if="getValidationError(`items.${index}.quantity_accepted`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5 text-center"
          >
            {{ getValidationError(`items.${index}.quantity_accepted`) }}
          </p>
        </div>
      </template>

      <!-- 4. خلية الكمية المرفوضة مع سبب الرفض التفاعلي -->
      <template #cell-quantity_rejected="{ row, index, col }">
        <div class="flex flex-col w-full gap-1">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.quantity_rejected)"
            @input="handleQuantityRejectedChange(row, unformatNumber($event.target.value))"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-rose-500 focus:border-rose-400 rounded transition-all text-xs text-center font-mono font-bold outline-none focus:ring-1 focus:ring-rose-400/30"
            :class="
              parseFloat(row.quantity_rejected) > 0
                ? 'text-rose-400 border-rose-500/50'
                : 'text-gray-400'
            "
            placeholder="0"
          />

          <!-- يظهر حقل سبب الرفض عند وجود كمية مرفوضة تلقائياً -->
          <input
            v-if="parseFloat(row.quantity_rejected) > 0"
            type="text"
            v-model="row.rejection_reason"
            placeholder="سبب الرفض (تالف، كسر...)"
            class="w-full p-1 text-[10px] bg-rose-950/20 border border-rose-800/40 rounded text-rose-300 placeholder-rose-500/60 outline-none focus:border-rose-500"
          />

          <p
            v-if="getValidationError(`items.${index}.quantity_rejected`)"
            class="text-rose-500 text-[9px] font-bold text-center"
          >
            {{ getValidationError(`items.${index}.quantity_rejected`) }}
          </p>
          <p
            v-if="getValidationError(`items.${index}.rejection_reason`)"
            class="text-rose-500 text-[9px] font-bold text-center"
          >
            {{ getValidationError(`items.${index}.rejection_reason`) }}
          </p>
        </div>
      </template>

      <!-- 5. خلية تكلفة الوحدة -->
      <template #cell-unit_cost="{ row, index, col }">
        <div class="flex flex-col w-full">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.unit_cost)"
            @input="row.unit_cost = unformatNumber($event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="0.00"
          />
          <p
            v-if="getValidationError(`items.${index}.unit_cost`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5 text-center"
          >
            {{ getValidationError(`items.${index}.unit_cost`) }}
          </p>
        </div>
      </template>

      <!-- 6. خلية إجمالي التكلفة المقبولة -->
      <template #cell-total_cost="{ row }">
        <div class="w-full flex justify-center items-center">
          <span class="font-mono font-bold text-xs text-emerald-400">
            {{ formatNumber(row.total_cost || row.quantity_accepted * row.unit_cost) }}
          </span>
        </div>
      </template>
    </InvoiceDetailTable>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProductStore } from '@/modules/inventory/stores/productStore'

import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  visibleTableSchema: { type: Array, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  syncUnitDetails: { type: Function, required: true },
  handleQuantityReceivedChange: { type: Function, required: true },
  handleQuantityAcceptedChange: { type: Function, required: true },
  handleQuantityRejectedChange: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  isFormLoaded: { type: Boolean, default: false },
})

const productStore = useProductStore()

// استخراج البيانات وتجهيز مصفوفة البحث بالباركودات الشاملة
const searchableProducts = computed(() => {
  if (!productStore.products) return []

  return productStore.products.map((item) => {
    const directBarcodes = Array.isArray(item.barcodes)
      ? item.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
      : []

    const unitBarcodes = Array.isArray(item.units)
      ? item.units.flatMap((u) =>
          Array.isArray(u.barcodes)
            ? u.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
            : [],
        )
      : []

    const allBarcodes = [...new Set([...directBarcodes, ...unitBarcodes])].filter(Boolean)

    return {
      ...item,
      id_display: `PRD-${item.id}`,
      name: item.name || '',
      cost_display: item.units?.[0]
        ? `${parseFloat(item.units[0].cost_price || item.cost_price || 0).toFixed(2)}`
        : '0.00',
      stock_display:
        item.current_stock !== undefined
          ? `${item.current_stock}`
          : item.stock !== undefined
            ? `${item.stock}`
            : '0',
      all_barcodes: allBarcodes,
    }
  })
})
</script>

<style scoped>
select option {
  background-color: #16171b !important;
  color: #f8fafc !important;
}
</style>
