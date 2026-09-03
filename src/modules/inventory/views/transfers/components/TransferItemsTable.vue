<!--src/modules/inventory/views/transfers/components/TransferItemsTable.vue-->
<template>
  <div class="p-0 bg-transparent space-y-4">
    <!-- شريط البحث الذكي عن الأصناف للتحويل الفوري -->
    <div
      class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
    >
      <SmartSearchGrid
        :data="searchableItems"
        :columns="[
          { key: 'id_display', label: 'رقم الصنف', class: 'text-right' },
          { key: 'name', label: 'اسم الصنف التجاري المعتمد', class: 'text-right font-bold' },
          { key: 'stock_display', label: 'الرصيد المتاح بالمصدر', class: 'text-center' },
          { key: 'cost_display', label: 'متوسط التكلفة', class: 'text-center' },
        ]"
        :search-keys="['id', 'name', 'code', 'all_barcodes']"
        placeholder="ابحث باسم المنتج، الكود، أو امسح الباركود لإضافة الصنف للتحويل المخزني..."
        @select="handleGlobalItemSelect"
      />
    </div>

    <!-- خطأ عام في قائمة البنود -->
    <p
      v-if="getValidationError('items')"
      class="p-2 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/50"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- جدول بنود أمر التحويل المخزني -->
    <InvoiceDetailTable
      :items="items"
      :schema="visibleTableSchema"
      @remove-row="removeRow"
      @add-row-request="triggerAddNewEmptyLine"
    >
      <!-- خلية اختيار وحدة القياس -->
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
              {{ u.unit_name || u.name || u.unit?.name || 'وحدة قياس' }}
            </option>
          </select>
          <p
            v-if="getValidationError(`items.${index}.product_unit_id`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5"
          >
            الوحدة مطلوبة أو مكررة
          </p>
        </div>
      </template>

      <!-- خلية الرصيد المتاح بالمستودع المصدر -->
      <template #cell-current_quantity="{ row }">
        <div class="w-full flex justify-center items-center">
          <span
            class="font-mono font-bold text-xs px-2 py-0.5 rounded"
            :class="[
              row.current_quantity > 0
                ? 'text-gray-300'
                : 'text-rose-400 bg-rose-950/30 border border-rose-500/20',
            ]"
          >
            {{ formatNumber(row.current_quantity) }}
          </span>
        </div>
      </template>

      <!-- خلية الكمية المطلوب تحويلها -->
      <template #cell-quantity="{ row, index, col }">
        <div class="w-full flex flex-col justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.quantity)"
            @input="handleQuantityInput(row, $event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border rounded transition-all text-xs text-center font-mono font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            :class="[
              parseFloat(row.quantity) > parseFloat(row.current_quantity) &&
              row.current_quantity > 0
                ? 'border-amber-500 text-amber-300'
                : 'border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] text-white',
            ]"
            placeholder="1"
          />
          <p
            v-if="getValidationError(`items.${index}.quantity`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5"
          >
            {{ getValidationError(`items.${index}.quantity`) }}
          </p>
        </div>
      </template>

      <!-- خلية تكلفة الوحدة -->
      <template #cell-unit_cost="{ row, index, col }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.unit_cost)"
            @input="handleUnitCostInput(row, $event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="0.00"
          />
        </div>
      </template>

      <!-- خلية إجمالي قيمة البند المحول -->
      <template #cell-total_cost="{ row }">
        <div class="w-full flex justify-center items-center">
          <span class="font-mono font-black text-xs text-emerald-400">
            {{ formatNumber(row.total_cost) }}
          </span>
        </div>
      </template>
    </InvoiceDetailTable>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
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
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  isFormLoaded: { type: Boolean, default: false },
})

const productStore = useProductStore()

const searchableItems = computed(() => {
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

// مراقبة المستودع المصدر لتحديث الأصناف والأرصدة
watch(
  () => props.form.from_warehouse_id,
  async (newWarehouseId) => {
    if (!newWarehouseId) {
      productStore.products = []
      return
    }

    await productStore.fetchProducts({ is_active: 1, store_id: newWarehouseId, all: true })

    const activeProductIds = props.items.map((row) => row.product_id).filter(Boolean)

    if (activeProductIds.length > 0 && typeof productStore.refreshItemsStock === 'function') {
      try {
        const stockMap = await productStore.refreshItemsStock({
          store_id: newWarehouseId,
          item_ids: activeProductIds,
        })

        props.items.forEach((row) => {
          if (row.product_id && stockMap[row.product_id] !== undefined) {
            row.current_quantity = parseFloat(stockMap[row.product_id]) || 0
          }
        })
      } catch (err) {
        console.error('فشل في مزامنة الأرصدة المتاحة مع المستودع المصدر الجديد:', err)
      }
    }
  },
  { immediate: true },
)

const handleQuantityInput = (row, value) => {
  row.quantity = props.unformatNumber(value)
}

const handleUnitCostInput = (row, value) => {
  row.unit_cost = props.unformatNumber(value)
}
</script>
