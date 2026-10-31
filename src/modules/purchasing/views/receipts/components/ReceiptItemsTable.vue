<!-- src/modules/purchasing/views/receipts/components/ReceiptItemsTable.vue -->
<template>
  <div class="p-0 bg-transparent space-y-3 font-sans text-right" dir="rtl">
    <!-- تنبيه خطأ التحقق العام لقائمة البنود إن وجد -->
    <div
      v-if="getValidationError('items')"
      class="p-3 bg-rose-950/40 text-rose-400 rounded-xl text-xs font-bold border border-rose-900/50 flex items-center gap-2"
    >
      <svg
        class="w-4 h-4 shrink-0 text-rose-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>{{ getValidationError('items') }}</span>
    </div>

    <!-- جدول إدخال وتعديل بنود الاستلام مع فصل عدد الأسطوانات عن وزن الغاز -->
    <div class="overflow-x-auto rounded-2xl border border-[#3e414c] bg-[#1a1d24] shadow-lg">
      <table class="w-full text-right border-collapse text-xs">
        <thead>
          <tr
            class="bg-[#121316] text-gray-300 border-b border-[#3e414c] font-bold select-none h-11"
          >
            <th class="py-3 px-2 text-center min-w-[70px] w-16">#</th>
            <th class="py-3 px-3 min-w-[260px]">بيان الصنف أو مسح الباركود</th>
            <th class="py-3 px-2 min-w-[120px] w-32">وحدة القياس</th>
            <th class="py-3 px-2 text-center min-w-[190px] w-48 text-sky-400">الرصيد الحالي</th>
            <th class="py-3 px-2 text-center min-w-[190px] w-48 text-emerald-400">
              الكمية المستلمة
            </th>
            <th class="py-3 px-2 text-center min-w-[110px] w-28">تكلفة الوحدة</th>
            <th class="py-3 px-2 text-center min-w-[120px] w-32">إجمالي التكلفة</th>
            <th class="py-3 px-2 text-center w-12">إجراء</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-[#2a2e39]">
          <tr
            v-for="(row, index) in items"
            :key="row.id || index"
            class="hover:bg-[#20232c] transition-colors h-14"
          >
            <!-- تسلسل السطر وشارة كود الصنف -->
            <td class="py-2.5 px-2 text-center font-mono text-gray-400 align-middle">
              <div class="flex items-center justify-center gap-1.5 h-9">
                <span class="font-bold text-xs text-gray-300">{{ index + 1 }}</span>
                <span
                  v-if="row.product_id"
                  class="text-[10px] px-2 py-0.5 rounded font-sans font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 whitespace-nowrap shadow-sm"
                >
                  PRD-{{ row.product_id }}
                </span>
                <span
                  v-else
                  class="text-[10px] px-2 py-0.5 rounded font-sans font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 whitespace-nowrap shadow-sm"
                >
                  جديد
                </span>
              </div>
            </td>

            <!-- 1. بيان الصنف ومسح الباركود -->
            <td class="py-2.5 px-3 align-middle">
              <div class="relative w-full h-9 flex items-center">
                <input
                  :ref="(el) => setCellRef(el, index, 'name')"
                  type="text"
                  v-model="row.product_name"
                  @input="onItemNameChange(row, index, $event)"
                  @focus="openSearchDropdown(index, $event)"
                  @blur="closeSearchDropdownDelayed"
                  @keydown="handleItemNameKeydown($event, row, index)"
                  placeholder="امسح الباركود أو اكتب اسم الصنف / الكود..."
                  class="w-full h-9 px-3 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-[#e05e2b]/40 transition-all"
                />
              </div>

              <p
                v-if="getValidationError(`items.${index}.product_id`)"
                class="text-rose-400 text-[10px] font-bold pr-1 mt-0.5"
              >
                {{ getValidationError(`items.${index}.product_id`) }}
              </p>
            </td>

            <!-- 2. وحدة القياس -->
            <td class="py-2.5 px-2 align-middle">
              <div class="h-9 flex items-center">
                <select
                  :ref="(el) => setCellRef(el, index, 'unit')"
                  v-model="row.product_unit_id"
                  @change="syncUnitDetails(row)"
                  @keydown="handleUnitKeydown($event, row, index)"
                  :disabled="!row.available_units || row.available_units.length === 0"
                  style="color-scheme: dark"
                  class="w-full h-9 px-2 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-bold outline-none text-right cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" class="bg-[#16171b] text-gray-400">اختر الوحدة...</option>
                  <option
                    v-for="u in row.available_units"
                    :key="u.id"
                    :value="u.id"
                    class="bg-[#16171b] text-white"
                  >
                    {{ u.unit_name || u.name || 'وحدة مسجلة' }}
                  </option>
                </select>
              </div>

              <p
                v-if="getValidationError(`items.${index}.product_unit_id`)"
                class="text-rose-400 text-[10px] font-bold pr-1 mt-0.5"
              >
                {{ getValidationError(`items.${index}.product_unit_id`) }}
              </p>
            </td>

            <!-- 3. رصيد المخزن: عدد الأسطوانات منفصل عن الغاز المتاح بالكيلوجرام -->
            <td class="py-2.5 px-2 text-center align-middle">
              <div
                v-if="row.tracking_type === 'by_weight_serial'"
                class="flex flex-col gap-1 min-w-[175px]"
                :aria-busy="Boolean(row.inventory_quantities_loading)"
                aria-live="polite"
              >
                <div
                  class="flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                  :class="inventoryValueClass(row, 'cylinders_count')"
                  :title="cylinderBalanceTitle(row)"
                >
                  <span class="text-[10px] font-sans">الأسطوانات</span>
                  <span class="font-mono font-bold whitespace-nowrap">
                    {{ inventoryValueText(row, 'cylinders_count') }}
                    <span
                      v-if="hasInventoryNumber(row, 'cylinders_count')"
                      class="font-sans text-[10px]"
                      >أسطوانة</span
                    >
                  </span>
                </div>
                <div
                  class="flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                  :class="inventoryValueClass(row, 'gas_available_kg')"
                  :title="gasBalanceTitle(row)"
                >
                  <span class="text-[10px] font-sans">الغاز المتاح</span>
                  <span class="font-mono font-bold whitespace-nowrap">
                    {{ inventoryValueText(row, 'gas_available_kg') }}
                    <span
                      v-if="hasInventoryNumber(row, 'gas_available_kg')"
                      class="font-sans text-[10px]"
                      >كجم</span
                    >
                  </span>
                </div>
              </div>
              <div v-else class="h-9 flex items-center justify-center" aria-live="polite">
                <span
                  class="font-mono font-bold text-xs px-2.5 py-1 rounded-lg border inline-flex items-center justify-center tracking-wide"
                  :class="inventoryValueClass(row, 'current_quantity')"
                  title="الرصيد المسجل للصنف في المخزن المختار، بوحدة الصنف الأساسية"
                >
                  {{ inventoryValueText(row, 'current_quantity') }}
                </span>
              </div>
            </td>

            <!-- 4. الكمية المستلمة (الخيار الأول: دمج أفقي بارتفاع موحد 36px) -->
            <td class="py-2.5 px-2 align-middle">
              <div class="h-9 flex items-center justify-center">
                <!-- أ) للأصناف العادية: تحكم يدوي وأزرار الزيادة والنقصان -->
                <div
                  v-if="row.tracking_type !== 'by_weight_serial'"
                  class="flex items-center w-full max-w-[140px] bg-[#16171b] border border-[#3e414c] rounded-lg overflow-hidden focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/40 h-9"
                >
                  <button
                    type="button"
                    tabindex="-1"
                    @click="decrementQuantity(row, 'quantity_received')"
                    class="w-8 h-9 bg-[#21242e] hover:bg-[#2c303d] text-gray-300 flex items-center justify-center font-bold text-sm select-none transition-colors"
                  >
                    -
                  </button>

                  <input
                    :ref="(el) => setCellRef(el, index, 'qtyReceived')"
                    type="text"
                    inputmode="decimal"
                    :value="formatNumber(row.quantity_received)"
                    @input="handleUnifiedQuantityChange(row, unformatNumber($event.target.value))"
                    @keydown="handleQtyKeydown($event, row, index)"
                    class="w-full h-9 bg-transparent text-emerald-400 text-xs font-mono font-black text-center outline-none"
                    placeholder="1"
                  />

                  <button
                    type="button"
                    tabindex="-1"
                    @click="incrementQuantity(row, 'quantity_received')"
                    class="w-8 h-9 bg-[#21242e] hover:bg-[#2c303d] text-gray-300 flex items-center justify-center font-bold text-sm select-none transition-colors"
                  >
                    +
                  </button>
                </div>

                <!-- ب) لأسطوانات الكلور: حاوية أفقية موحدة (36px) تحوي الرقم والزر المدمج -->
                <div
                  v-else
                  @click="openSerialsModal(row)"
                  class="flex items-center justify-between w-full max-w-[190px] h-9 px-2 bg-[#141820] border border-emerald-500/40 hover:border-emerald-400 rounded-lg cursor-pointer transition-all shadow-inner group"
                  title="انقر لفتح نافذة الميزان ومسح الأسطوانات"
                >
                  <span class="font-mono font-black text-xs text-emerald-400 select-none">
                    {{ formatNumber(row.quantity_accepted ?? row.quantity_received ?? 0) }}
                    <span class="font-sans text-[10px]">كجم</span>
                  </span>

                  <span
                    class="h-6 px-2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0 group-hover:bg-emerald-500/30 transition-colors"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="
                        isSerialsComplete(row) ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                      "
                    ></span>
                    <span>{{ (row.serials || []).length }} أسطوانة</span>
                  </span>
                </div>
              </div>

              <p
                v-if="
                  getValidationError(`items.${index}.quantity_received`) ||
                  getValidationError(`items.${index}.quantity_accepted`)
                "
                class="text-rose-400 text-[10px] font-bold text-center mt-0.5"
              >
                {{
                  getValidationError(`items.${index}.quantity_received`) ||
                  getValidationError(`items.${index}.quantity_accepted`)
                }}
              </p>
            </td>

            <!-- 5. تكلفة الوحدة -->
            <td class="py-2.5 px-2 align-middle">
              <div class="h-9 flex items-center justify-center">
                <input
                  :ref="(el) => setCellRef(el, index, 'cost')"
                  type="text"
                  inputmode="decimal"
                  :value="formatNumber(row.unit_cost)"
                  @input="onUnitCostInput(row, $event)"
                  @keydown="handleCostKeydown($event, row, index)"
                  class="w-full max-w-[100px] h-9 px-2 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-[#e05e2b]/40 transition-all"
                  placeholder="0.00"
                />
              </div>

              <p
                v-if="getValidationError(`items.${index}.unit_cost`)"
                class="text-rose-400 text-[10px] font-bold text-center mt-0.5"
              >
                {{ getValidationError(`items.${index}.unit_cost`) }}
              </p>
            </td>

            <!-- 6. إجمالي التكلفة -->
            <td class="py-2.5 px-2 text-center align-middle">
              <div class="h-9 flex items-center justify-center">
                <span class="font-mono font-black text-xs text-emerald-400">
                  {{ formatNumber(row.total_cost || row.quantity_accepted * row.unit_cost) }}
                </span>
              </div>
            </td>

            <!-- 7. حذف السطر -->
            <td class="py-2.5 px-2 text-center align-middle">
              <div class="h-9 flex items-center justify-center">
                <button
                  type="button"
                  tabindex="-1"
                  @click="handleRemoveRowWithFocus(index)"
                  class="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center justify-center"
                  title="حذف هذا البند (Alt + Delete)"
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
            </td>
          </tr>

          <!-- حالة القائمة الفارغة -->
          <tr v-if="items.length === 0">
            <td colspan="8" class="p-8 text-center text-gray-400 text-xs font-medium">
              لم تسجل أي بند استلام حتى الآن. انقر على الزر أدناه لإضافة البند الأول.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- شريط الإضافة ومؤشر عدد البنود -->
    <div class="flex items-center justify-between pt-1">
      <button
        type="button"
        tabindex="-1"
        @click="handleAddNewLineWithFocus"
        class="h-10 px-4 bg-[#23252e] hover:bg-[#2c303c] text-[#e05e2b] border border-[#e05e2b]/40 hover:border-[#e05e2b] text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>+ إضافة بند استلام آخر (Ctrl + Enter)</span>
      </button>

      <span class="text-xs text-gray-400 font-mono">
        إجمالي بنود الاستلام: <strong class="text-white">{{ items.length }}</strong>
      </span>
    </div>

    <!-- نافذة مسح وتوثيق ومطابقة سيريالات الأسطوانات وقراءات الميزان -->
    <ItemSerialsModal
      v-model="isSerialsModalOpen"
      :item="selectedSerialRow"
      :supplier-id="form.supplier_id"
      @save="onSerialsSaved"
    />

    <!-- قائمة الاقتراحات الطافية الذكية عبر Teleport -->
    <Teleport to="body">
      <div
        v-if="
          activeDropdownIndex !== null &&
          items[activeDropdownIndex] &&
          (isSearching || searchResults.length > 0)
        "
        :style="dropdownStyle"
        class="fixed bg-[#1e222b] border border-[#484e60] rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto divide-y divide-[#2d3240] text-right font-sans"
        dir="rtl"
      >
        <div
          v-if="isSearching"
          class="p-3 text-center text-gray-400 text-xs flex items-center justify-center gap-2"
        >
          <span
            class="w-3.5 h-3.5 border-2 border-[#e05e2b] border-t-transparent rounded-full animate-spin"
          ></span>
          <span>جاري البحث الفوري...</span>
        </div>

        <template v-else>
          <div
            v-for="(product, pIndex) in searchResults"
            :key="product.id"
            :ref="(el) => setDropdownItemRef(el, pIndex)"
            @mousedown.prevent="
              handleSelectProduct(items[activeDropdownIndex], product, activeDropdownIndex)
            "
            @mouseenter="highlightedProductIndex = pIndex"
            class="p-2.5 cursor-pointer flex items-center justify-between transition-colors"
            :class="
              highlightedProductIndex === pIndex
                ? 'bg-[#2b303e] border-r-2 border-[#e05e2b]'
                : 'hover:bg-[#242834]'
            "
          >
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">{{ product.name }}</span>
                <span
                  v-if="product.matched_barcode"
                  class="text-[9px] bg-sky-950/60 text-sky-400 px-1 rounded font-mono border border-sky-500/20"
                >
                  باركود: {{ product.matched_barcode }}
                </span>
                <span
                  v-if="product.tracking_type === 'by_weight_serial'"
                  class="text-[9px] bg-sky-950/60 text-sky-400 px-1.5 py-0.2 rounded font-sans font-bold border border-sky-500/30"
                >
                  سيريال وزني (غاز الكلور)
                </span>
                <span
                  v-else-if="product.tracking_type === 'by_serial'"
                  class="text-[9px] bg-amber-950/60 text-amber-400 px-1.5 py-0.2 rounded font-sans font-bold border border-amber-500/30"
                >
                  تتبع بالسيريال
                </span>
              </div>

              <div
                class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 font-mono"
              >
                <span>كود: PRD-{{ product.id }}</span>
                <span v-if="product.sku">SKU: {{ product.sku }}</span>
                <span v-if="product.unit?.name" class="text-gray-300 font-sans">
                  الوحدة: {{ product.unit.name }}
                </span>
                <template v-if="product.tracking_type === 'by_weight_serial'">
                  <span
                    class="font-sans font-bold text-sky-300"
                    :title="cylinderBalanceTitle(product)"
                  >
                    الأسطوانات: {{ inventoryValueText(product, 'cylinders_count') }}
                  </span>
                  <span
                    class="font-sans font-bold text-emerald-400"
                    :title="gasBalanceTitle(product)"
                  >
                    الغاز المتاح: {{ inventoryValueText(product, 'gas_available_kg') }}
                    <span v-if="hasInventoryNumber(product, 'gas_available_kg')">كجم</span>
                  </span>
                </template>
                <span v-else class="font-sans font-bold text-sky-300">
                  الرصيد:
                  {{ inventoryValueText(product, 'available_quantity', 'current_stock', 'stock') }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                v-if="product.cost_price || product.price"
                class="text-xs font-mono font-bold text-emerald-400"
              >
                {{ formatNumber(product.cost_price || product.price) }}
              </span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded transition-all"
                :class="
                  highlightedProductIndex === pIndex
                    ? 'bg-[#e05e2b] text-white shadow-sm'
                    : 'text-[#e05e2b] bg-[#e05e2b]/10'
                "
              >
                اختيار ↵
              </span>
            </div>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import productService from '@/modules/inventory/services/product.service'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import ItemSerialsModal from './ItemSerialsModal.vue'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  syncUnitDetails: { type: Function, required: true },
  handleQuantityReceivedChange: { type: Function, required: true },
  handleQuantityAcceptedChange: { type: Function, required: true },
  handleQuantityRejectedChange: { type: Function, required: true },
  incrementQuantity: { type: Function, required: true },
  decrementQuantity: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  selectProductForRow: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  isFormLoaded: { type: Boolean, default: false },
})

const productStore = useProductStore()

// قيم العرض لا تُستنتج من الغاز أو سيريالات السند، ولا تُظهر رصيد مخزن سابق.
const numericInventoryValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const warehouseKey = (value) => {
  const number = numericInventoryValue(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

const hasInventoryScope = (item) => {
  const warehouse = warehouseKey(props.form?.warehouse_id)
  return warehouse !== null && warehouseKey(item.quantity_warehouse_id) === warehouse
}

const inventoryNumber = (item, ...keys) => {
  if (item.inventory_quantities_loading || !hasInventoryScope(item)) return null
  for (const key of keys) {
    const number = numericInventoryValue(item[key])
    if (number !== null) return number
  }
  return null
}

const hasInventoryNumber = (item, ...keys) => inventoryNumber(item, ...keys) !== null

const inventoryValueText = (item, ...keys) => {
  if (!item.product_id && !item.id) return '—'
  if (item.inventory_quantities_loading) return 'جارٍ التحديث…'
  const number = inventoryNumber(item, ...keys)
  return number === null ? 'غير متاح' : props.formatNumber(number)
}

const inventoryValueClass = (item, key) => {
  const number = inventoryNumber(item, key)
  if (number !== null && number > 0) return 'bg-sky-950/50 text-sky-300 border-sky-500/40'
  if (number !== null && number < 0) return 'bg-rose-950/50 text-rose-400 border-rose-500/40'
  return 'bg-[#1b1e26] text-gray-400 border-gray-700/50'
}

const cylinderBalanceTitle = (item) => {
  const description =
    'عدد الأسطوانات وفق سجلات المخزن المختار؛ يشمل المخزون والتشغيل والفارغ والصيانة، ولا يشمل ما لدى المورد أو المستبدل أو التالف. ليس جرداً فعلياً أو إجمالي ملكية الشركة.'
  if (!hasInventoryScope(item) || item.inventory_quantities_loading || !item.cylinders_by_status)
    return description
  const labels = {
    in_stock: 'بالمخزن',
    in_service: 'قيد التشغيل',
    empty: 'فارغة',
    in_maintenance: 'تحت الصيانة',
  }
  const details = Object.entries(labels).map(([key, label]) => {
    const value = numericInventoryValue(item.cylinders_by_status[key])
    return `${label}: ${value === null ? 'غير متاح' : props.formatNumber(value)}`
  })
  return `${description}\n${details.join(' | ')}`
}

const gasBalanceTitle = (item) => {
  return `رصيد الغاز من دفتر المخزون بالكيلوجرام، وليس قراءة الأسطوانات الحالية.\nالإجمالي: ${inventoryValueText(item, 'gas_stock_kg')} كجم | المحجوز: ${inventoryValueText(item, 'gas_reserved_kg')} كجم | المتاح: ${inventoryValueText(item, 'gas_available_kg')} كجم`
}

// =========================================================
// 1. نظام إدارة النافذة المنبثقة للأرقام التسلسلية وقراءات الميزان
// =========================================================
const isSerialsModalOpen = ref(false)
const selectedSerialRow = ref(null)

const isSerialTracked = (row) => {
  return (
    row.tracking_type === 'by_serial' ||
    row.tracking_type === 'by_weight_serial' ||
    Boolean(row.is_serial_tracked) ||
    (Array.isArray(row.serials) && row.serials.length > 0)
  )
}

const isSerialsComplete = (row) => {
  if (!Array.isArray(row.serials) || row.serials.length === 0) return false

  if (row.tracking_type === 'by_weight_serial') {
    const totalNetWeight = row.serials.reduce((sum, s) => sum + (parseFloat(s.net_weight) || 0), 0)
    const acceptedQty = parseFloat(row.quantity_accepted ?? row.quantity_received) || 0
    return totalNetWeight > 0 && Math.abs(totalNetWeight - acceptedQty) <= 0.05
  }

  const target = Math.max(0, parseInt(row.quantity_accepted ?? row.quantity_received ?? 0, 10))
  return target > 0 && row.serials.length === target
}

const openSerialsModal = (row) => {
  selectedSerialRow.value = row
  isSerialsModalOpen.value = true
}

// تحديث متزامن للكمية المستلمة والمقبولة معاً
const handleUnifiedQuantityChange = (row, val) => {
  props.handleQuantityReceivedChange(row, val)
  props.handleQuantityAcceptedChange(row, val)
}

// استقبال السيريالات وتحديث الكمية بصافي وزن الغاز آلياً
const onSerialsSaved = (serialsPayload, calculatedNetGasWeight) => {
  if (selectedSerialRow.value) {
    selectedSerialRow.value.serials = serialsPayload

    if (
      selectedSerialRow.value.tracking_type === 'by_weight_serial' &&
      calculatedNetGasWeight !== undefined &&
      calculatedNetGasWeight > 0
    ) {
      handleUnifiedQuantityChange(selectedSerialRow.value, calculatedNetGasWeight)
    }
  }
}

// =========================================================
// 2. نظام إدارة التركيز الشبكي الذكي
// =========================================================
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const columnsOrder = ['name', 'unit', 'qtyReceived', 'cost']
const activeTargetInput = ref(null)

const setCellRef = (el, rowIndex, colKey) => {
  if (!cellRefs.value[rowIndex]) {
    cellRefs.value[rowIndex] = {}
  }
  if (el) {
    cellRefs.value[rowIndex][colKey] = el
  }
}

const setDropdownItemRef = (el, index) => {
  if (el) {
    dropdownItemRefs.value[index] = el
  }
}

const focusCell = (rowIndex, colKey, shouldScroll = true) => {
  nextTick(() => {
    const target = cellRefs.value[rowIndex]?.[colKey]
    if (target) {
      target.focus()
      if (typeof target.select === 'function') {
        target.select()
      }

      if (shouldScroll && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        })
      }
    }
  })
}

const isCursorAtStart = (el) => {
  if (!el || el.selectionStart === undefined) return true
  return el.selectionStart === 0
}

const isCursorAtEnd = (el) => {
  if (!el || el.selectionEnd === undefined) return true
  return el.selectionEnd >= el.value.length
}

const isTextFullySelected = (el) => {
  if (!el || el.selectionStart === undefined) return false
  return el.selectionStart === 0 && el.selectionEnd === el.value.length
}

const navigateHorizontal = (rowIndex, currentColKey, direction) => {
  const currentIdx = columnsOrder.indexOf(currentColKey)
  const targetIdx = currentIdx + direction

  if (targetIdx >= 0 && targetIdx < columnsOrder.length) {
    focusCell(rowIndex, columnsOrder[targetIdx], false)
  } else if (targetIdx >= columnsOrder.length) {
    if (rowIndex === props.items.length - 1) {
      handleAddNewLineWithFocus()
    } else {
      focusCell(rowIndex + 1, 'name', true)
    }
  } else if (targetIdx < 0 && rowIndex > 0) {
    focusCell(rowIndex - 1, 'cost', false)
  }
}

const handleAddNewLineWithFocus = async () => {
  props.triggerAddNewEmptyLine()
  await nextTick()
  const newIndex = props.items.length - 1
  focusCell(newIndex, 'name', true)
}

const handleRemoveRowWithFocus = async (index) => {
  props.removeRow(index)
  await nextTick()
  const targetIndex = Math.max(0, Math.min(index, props.items.length - 1))
  focusCell(targetIndex, 'name', true)
}

const checkCommonRowShortcuts = (event, index) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleAddNewLineWithFocus()
    return true
  }

  if (
    (event.altKey && event.key === 'Delete') ||
    (event.ctrlKey && (event.key === 'Delete' || event.key === 'Backspace'))
  ) {
    event.preventDefault()
    handleRemoveRowWithFocus(index)
    return true
  }

  return false
}

// =========================================================
// 3. إدارة البحث فائق السرعة
// =========================================================
const activeDropdownIndex = ref(null)
const highlightedProductIndex = ref(0)
const searchResults = ref([])
const isSearching = ref(false)
let debounceTimer = null
let searchRequestId = 0

const invalidateSearch = () => {
  searchRequestId += 1
  clearTimeout(debounceTimer)
  searchResults.value = []
  isSearching.value = false
  dropdownItemRefs.value = []
}

watch(
  () => props.form?.warehouse_id,
  () => {
    invalidateSearch()
    activeDropdownIndex.value = null
    activeTargetInput.value = null
  },
  { flush: 'sync' },
)

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  left: '0px',
  width: '0px',
})

const updateDropdownPosition = (targetElement) => {
  if (!targetElement) return
  activeTargetInput.value = targetElement
  const rect = targetElement.getBoundingClientRect()
  const dropdownEstimatedHeight = 240
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const shouldOpenUpwards = spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow

  if (shouldOpenUpwards) {
    dropdownStyle.value = {
      top: 'auto',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  } else {
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      bottom: 'auto',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
}

const scrollHighlightedDropdownItemIntoView = () => {
  nextTick(() => {
    const el = dropdownItemRefs.value[highlightedProductIndex.value]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
  })
}

const executeFastSearch = async (queryText, rowIndex, immediate = false) => {
  clearTimeout(debounceTimer)
  const requestId = ++searchRequestId
  const requestedWarehouse = warehouseKey(props.form?.warehouse_id)
  const requestedRow = props.items[rowIndex]
  const isCurrentSearch = () =>
    requestId === searchRequestId &&
    requestedWarehouse === warehouseKey(props.form?.warehouse_id) &&
    requestedRow === props.items[rowIndex]
  searchResults.value = []

  const cleanQuery = queryText ? queryText.trim() : ''
  if (!cleanQuery) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  const performRequest = async () => {
    if (!isCurrentSearch()) return
    isSearching.value = true
    try {
      const params = { query: cleanQuery, limit: 10 }
      if (requestedWarehouse !== null) {
        params.store_id = requestedWarehouse
      }

      const response = await productService.fastSearch(params)
      if (!isCurrentSearch()) return
      let results = response.data?.data || response.data || []
      if (!Array.isArray(results)) results = []

      if (results.length === 0 && productStore.products?.length > 0) {
        const q = cleanQuery.toLowerCase()
        results = productStore.products
          .filter(
            (p) =>
              (p.name && p.name.toLowerCase().includes(q)) ||
              (p.sku && p.sku.toLowerCase().includes(q)) ||
              (p.id && `prd-${p.id}`.includes(q)),
          )
          .slice(0, 10)
      }

      if (immediate && results.length === 1) {
        handleSelectProduct(props.items[rowIndex], results[0], rowIndex)
        return
      }

      searchResults.value = results
      highlightedProductIndex.value = 0
      dropdownItemRefs.value = []

      if (activeTargetInput.value) {
        updateDropdownPosition(activeTargetInput.value)
      }
    } catch (err) {
      if (!isCurrentSearch()) return
      console.error('فشل في تنفيذ البحث السريع للأصناف:', err)
      searchResults.value = []
    } finally {
      if (isCurrentSearch()) isSearching.value = false
    }
  }

  if (immediate) {
    await performRequest()
  } else {
    isSearching.value = true
    debounceTimer = setTimeout(performRequest, 250)
  }
}

const openSearchDropdown = (index, event) => {
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
}

const onItemNameChange = (row, index, event) => {
  if (row.product_id) {
    row.product_id = null
    row.available_units = []
    row.product_unit_id = null
    row.current_quantity = null
    row.quantity_warehouse_id = null
    row.gas_stock_kg = null
    row.gas_reserved_kg = null
    row.gas_available_kg = null
    row.cylinders_count = null
    row.cylinders_by_status = null
    row.inventory_quantities_loading = false
    row.tracking_type = null
    row.serials = []
  }
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(row.product_name, index, false)
}

const closeSearchDropdownDelayed = () => {
  setTimeout(() => {
    activeDropdownIndex.value = null
    activeTargetInput.value = null
    invalidateSearch()
  }, 200)
}

const handleSelectProduct = (row, product, index) => {
  if (!row || props.items[index] !== row) return
  invalidateSearch()
  const isSuccess = props.selectProductForRow(row, product, index)
  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []

  if (isSuccess) {
    if (row.tracking_type === 'by_weight_serial') {
      openSerialsModal(row)
    } else {
      focusCell(index, 'qtyReceived', false)
    }
  } else {
    focusCell(index, 'name', false)
  }
}

const onUnitCostInput = (row, event) => {
  row.unit_cost = props.unformatNumber(event.target.value)
  row.total_cost = parseFloat(
    (
      (parseFloat(row.quantity_accepted || row.quantity_received) || 0) *
      (parseFloat(row.unit_cost) || 0)
    ).toFixed(4),
  )
}

// =========================================================
// 4. معالجة أحداث لوحة المفاتيح
// =========================================================
const handleItemNameKeydown = async (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  const isDropdownOpen =
    activeDropdownIndex.value === index && searchResults.value.length > 0 && !isSearching.value

  if (isDropdownOpen) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      highlightedProductIndex.value =
        (highlightedProductIndex.value + 1) % searchResults.value.length
      scrollHighlightedDropdownItemIntoView()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      highlightedProductIndex.value =
        (highlightedProductIndex.value - 1 + searchResults.value.length) %
        searchResults.value.length
      scrollHighlightedDropdownItemIntoView()
      return
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      const selected = searchResults.value[highlightedProductIndex.value]
      if (selected) {
        handleSelectProduct(row, selected, index)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      activeDropdownIndex.value = null
      searchResults.value = []
      return
    }
  }

  if (event.key === 'Enter') {
    event.preventDefault()

    if (!row.product_id && row.product_name && row.product_name.trim().length > 0) {
      await executeFastSearch(row.product_name, index, true)
      return
    }

    activeDropdownIndex.value = null
    if (row.product_id) {
      if (row.tracking_type === 'by_weight_serial') {
        openSerialsModal(row)
      } else {
        focusCell(index, 'qtyReceived', false)
      }
    } else {
      focusCell(index, 'unit', false)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeDropdownIndex.value = null
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      activeDropdownIndex.value = null
      focusCell(index - 1, 'name', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el) || !row.product_name) {
      event.preventDefault()
      activeDropdownIndex.value = null
      navigateHorizontal(index, 'name', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      if (index > 0) {
        event.preventDefault()
        activeDropdownIndex.value = null
        navigateHorizontal(index, 'name', -1)
      }
    }
  }
}

const handleUnitKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'ArrowDown' && event.ctrlKey) {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'unit', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp' && event.ctrlKey) {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'unit', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigateHorizontal(index, 'unit', 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateHorizontal(index, 'unit', -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'qtyReceived', false)
  }
}

const handleQtyKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (row.tracking_type === 'by_weight_serial') {
    if (event.key === 'Enter') {
      event.preventDefault()
      openSerialsModal(row)
      return
    }
  }

  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    if (row.tracking_type !== 'by_weight_serial') {
      props.incrementQuantity(row, 'quantity_received')
      props.incrementQuantity(row, 'quantity_accepted')
    }
    return
  }

  if (event.key === '-') {
    event.preventDefault()
    if (row.tracking_type !== 'by_weight_serial') {
      props.decrementQuantity(row, 'quantity_received')
      props.decrementQuantity(row, 'quantity_accepted')
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'qtyReceived', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'qtyReceived', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'qtyReceived', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'qtyReceived', -1)
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'cost', false)
  }
}

const handleCostKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'ArrowDown' || event.key === 'Enter') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'cost', true)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'cost', -1)
    }
  }
}

const handleScrollOrResize = () => {
  if (activeDropdownIndex.value !== null && activeTargetInput.value) {
    updateDropdownPosition(activeTargetInput.value)
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)

  nextTick(() => {
    if (props.items.length > 0) {
      focusCell(0, 'name', false)
    }
  })
})

onBeforeUnmount(() => {
  invalidateSearch()
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
select option {
  background-color: #16171b !important;
  color: #f8fafc !important;
}
</style>
