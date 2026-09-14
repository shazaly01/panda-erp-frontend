<!--src/modules/purchasing/views/bills/components/BillItemsTable.vue-->
<template>
  <div class="p-0 bg-transparent space-y-4">
    <!-- شريط البحث الذكي بنمط الكاشير السريع (باركود / كود / اسم) -->
    <div
      class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
    >
      <SmartSearchGrid
        :data="searchableProducts"
        :columns="[
          { key: 'id_display', label: 'كود الصنف', class: 'text-right' },
          { key: 'name', label: 'اسم الصنف التجاري', class: 'text-right font-bold' },
          { key: 'cost_display', label: 'سعر الشراء الافتراضي', class: 'text-center' },
          { key: 'stock_display', label: 'الرصيد المتاح بالمستودع', class: 'text-center' },
        ]"
        :search-keys="['id', 'name', 'code', 'all_barcodes']"
        placeholder="ابحث بالاسم، كود الصنف، أو امسح الباركود لإدراج بند الشراء فوراً..."
        @select="handleGlobalItemSelect"
      />
    </div>

    <!-- تنبيه خطأ التحقق العام لقائمة البنود -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/50"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- جدول بنود وتفاصيل الفاتورة -->
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

      <!-- خلية الكمية المفوترة -->
      <template #cell-quantity="{ row, index, col }">
        <div class="flex flex-col w-full">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.quantity)"
            @input="handleQtyInput(row, $event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="1"
          />
          <p
            v-if="getValidationError(`items.${index}.quantity`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5 text-center"
          >
            {{ getValidationError(`items.${index}.quantity`) }}
          </p>
        </div>
      </template>

      <!-- خلية سعر الوحدة -->
      <template #cell-unit_price="{ row, index, col }">
        <div class="flex flex-col w-full">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.unit_price)"
            @input="handleUnitPriceInput(row, $event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-white font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="0.00"
          />
          <p
            v-if="getValidationError(`items.${index}.unit_price`)"
            class="text-rose-500 text-[9px] font-bold mt-0.5 text-center"
          >
            {{ getValidationError(`items.${index}.unit_price`) }}
          </p>
        </div>
      </template>

      <!-- خلية نسبة الخصم للبند -->
      <template #cell-discount_percentage="{ row, index, col }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.discount_percentage)"
            @input="handleDiscountInput(row, $event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-amber-300 font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="0"
          />
        </div>
      </template>

      <!-- خلية نسبة الضريبة -->
      <template #cell-tax_rate="{ row, index, col }">
        <div class="w-full flex justify-center items-center">
          <input
            type="text"
            inputmode="decimal"
            :value="formatNumber(row.tax_rate)"
            @input="handleTaxInput(row, $event.target.value)"
            :data-row="index"
            :data-col="col.key"
            class="w-full p-1 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded transition-all text-xs text-center font-mono text-sky-300 font-bold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
            placeholder="15"
          />
        </div>
      </template>

      <!-- خلية الإجمالي قبل الضريبة -->
      <template #cell-subtotal="{ row }">
        <div class="w-full flex justify-center items-center">
          <span class="font-mono font-bold text-xs text-gray-300">
            {{ formatNumber(row.subtotal) }}
          </span>
        </div>
      </template>

      <!-- خلية الإجمالي النهائي للبند (شامل الضريبة والخصم) -->
      <template #cell-total="{ row }">
        <div class="w-full flex justify-center items-center">
          <span class="font-mono font-black text-xs text-emerald-400">
            {{ formatNumber(row.total) }}
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

const handleQtyInput = (row, value) => {
  row.quantity = props.unformatNumber(value)
}

const handleUnitPriceInput = (row, value) => {
  row.unit_price = props.unformatNumber(value)
}

const handleDiscountInput = (row, value) => {
  row.discount_percentage = props.unformatNumber(value)
}

const handleTaxInput = (row, value) => {
  row.tax_rate = props.unformatNumber(value)
}
</script>

<style scoped>
select option {
  background-color: #16171b !important;
  color: #f8fafc !important;
}
</style>
