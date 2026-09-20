<!-- src/modules/purchasing/views/bills/components/BillItemsTable.vue -->
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

    <!-- شريط التحكم العلوي: تخصيص الأعمدة المتقدمة وإجمالي البنود -->
    <div class="flex items-center justify-between px-1 py-1">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-400">تخصيص العرض:</span>

        <!-- زر تبديل إظهار عمود الخصم على مستوى البند -->
        <button
          type="button"
          tabindex="-1"
          @click="toggleLineDiscount"
          class="h-7 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 shadow-sm"
          :class="[
            showLineDiscount
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-amber-950/30'
              : 'bg-[#1b1e26] text-gray-400 border-gray-700/60 hover:text-gray-200 hover:border-gray-500',
          ]"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="showLineDiscount ? 'bg-amber-400' : 'bg-gray-600'"
          ></span>
          <span>خصم البنود %</span>
        </button>

        <!-- زر تبديل إظهار عمود الضريبة على مستوى البند -->
        <button
          type="button"
          tabindex="-1"
          @click="toggleLineTax"
          class="h-7 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 shadow-sm"
          :class="[
            showLineTax
              ? 'bg-sky-950/60 text-sky-300 border-sky-500/50 shadow-sky-950/30'
              : 'bg-[#1b1e26] text-gray-400 border-gray-700/60 hover:text-gray-200 hover:border-gray-500',
          ]"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="showLineTax ? 'bg-sky-400' : 'bg-gray-600'"
          ></span>
          <span>ضريبة البنود %</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 font-mono">
          إجمالي البنود: <strong class="text-white">{{ items.length }}</strong>
        </span>
      </div>
    </div>

    <!-- جدول إدخال وتعديل بنود فاتورة المشتريات -->
    <div class="overflow-x-auto rounded-2xl border border-[#3e414c] bg-[#1a1d24] shadow-lg">
      <table class="w-full text-right border-collapse text-xs">
        <thead>
          <tr class="bg-[#121316] text-gray-300 border-b border-[#3e414c] font-bold select-none">
            <th class="py-3 px-2 text-center w-14">#</th>
            <th class="py-3 px-3 min-w-[260px]">بيان الصنف أو مسح الباركود</th>
            <th class="py-3 px-2 min-w-[125px] w-32">وحدة القياس</th>
            <th class="py-3 px-2 text-center min-w-[105px] w-28 text-sky-400">الكمية الحالية</th>
            <th class="py-3 px-2 text-center min-w-[125px] w-32">الكمية المفوترة</th>
            <th class="py-3 px-2 text-center min-w-[110px] w-28">سعر الوحدة</th>
            <th
              v-if="showLineDiscount"
              class="py-3 px-2 text-center min-w-[85px] w-20 text-amber-400"
            >
              خصم %
            </th>
            <th v-if="showLineTax" class="py-3 px-2 text-center min-w-[85px] w-20 text-sky-400">
              ضريبة %
            </th>
            <th
              v-if="showLineDiscount || showLineTax"
              class="py-3 px-2 text-center min-w-[105px] w-28"
            >
              قبل الضريبة
            </th>
            <th class="py-3 px-2 text-center min-w-[115px] w-32">الإجمالي الصافي</th>
            <th class="py-3 px-2 text-center w-12">إجراء</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-[#2a2e39]">
          <tr
            v-for="(row, index) in items"
            :key="row.id || index"
            class="hover:bg-[#20232c] transition-colors"
          >
            <!-- تسلسل السطر وشارة الصنف -->
            <td class="py-2.5 px-2 text-center font-mono text-gray-400 align-middle">
              <div class="flex flex-col items-center justify-center gap-1">
                <span class="font-bold text-xs text-gray-300">{{ index + 1 }}</span>
                <span
                  v-if="row.product_id"
                  class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 whitespace-nowrap shadow-sm"
                >
                  PRD-{{ row.product_id }}
                </span>
                <span
                  v-else
                  class="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 whitespace-nowrap shadow-sm"
                >
                  جديد
                </span>
              </div>
            </td>

            <!-- 1. بيان الصنف ومسح الباركود -->
            <td class="py-2.5 px-3 align-middle">
              <div class="flex flex-col justify-center gap-1">
                <div class="relative w-full">
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
                  class="text-rose-400 text-[10px] font-bold pr-1"
                >
                  {{ getValidationError(`items.${index}.product_id`) }}
                </p>
              </div>
            </td>

            <!-- 2. وحدة القياس -->
            <td class="py-2.5 px-2 align-middle">
              <div class="flex flex-col justify-center gap-1">
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

                <p
                  v-if="getValidationError(`items.${index}.product_unit_id`)"
                  class="text-rose-400 text-[10px] font-bold pr-1"
                >
                  {{ getValidationError(`items.${index}.product_unit_id`) }}
                </p>
              </div>
            </td>

            <!-- 3. الكمية الحالية (عمود مستقل يضمن المحاذاة التامة) -->
            <td class="py-2.5 px-2 text-center align-middle">
              <div class="inline-flex items-center justify-center">
                <span
                  class="font-mono font-black text-xs px-2.5 py-1 rounded-lg border inline-block min-w-[55px] tracking-wide transition-all shadow-inner select-none"
                  :class="[
                    row.current_quantity > 0
                      ? 'bg-sky-950/50 text-sky-300 border-sky-500/40 shadow-sky-950/30'
                      : row.current_quantity < 0
                        ? 'bg-rose-950/50 text-rose-400 border-rose-500/40'
                        : 'bg-[#1b1e26] text-gray-400 border-gray-700/50',
                  ]"
                  title="الكمية المتوفرة حالياً في المستودع المختار"
                >
                  {{ formatNumber(row.current_quantity) }}
                </span>
              </div>
            </td>

            <!-- 4. الكمية المفوترة -->
            <td class="py-2.5 px-2 align-middle">
              <div class="flex flex-col items-center justify-center gap-1">
                <div
                  class="flex items-center w-full max-w-[125px] bg-[#16171b] border border-[#3e414c] rounded-lg overflow-hidden focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/40"
                >
                  <button
                    type="button"
                    tabindex="-1"
                    @click="decrementQuantity(row)"
                    class="w-8 h-9 bg-[#21242e] hover:bg-[#2c303d] text-gray-300 flex items-center justify-center font-bold text-sm select-none transition-colors"
                  >
                    -
                  </button>

                  <input
                    :ref="(el) => setCellRef(el, index, 'qty')"
                    type="text"
                    inputmode="decimal"
                    :value="formatNumber(row.quantity)"
                    @input="onQtyInput(row, $event)"
                    @keydown="handleQuantityKeydown($event, row, index)"
                    class="w-full h-9 bg-transparent text-white text-xs font-mono font-black text-center outline-none"
                    placeholder="1"
                  />

                  <button
                    type="button"
                    tabindex="-1"
                    @click="incrementQuantity(row)"
                    class="w-8 h-9 bg-[#21242e] hover:bg-[#2c303d] text-gray-300 flex items-center justify-center font-bold text-sm select-none transition-colors"
                  >
                    +
                  </button>
                </div>

                <p
                  v-if="getValidationError(`items.${index}.quantity`)"
                  class="text-rose-400 text-[10px] font-bold text-center"
                >
                  {{ getValidationError(`items.${index}.quantity`) }}
                </p>
              </div>
            </td>

            <!-- 5. سعر الوحدة -->
            <td class="py-2.5 px-2 align-middle">
              <div class="flex flex-col items-center justify-center gap-1">
                <input
                  :ref="(el) => setCellRef(el, index, 'price')"
                  type="text"
                  inputmode="decimal"
                  :value="formatNumber(row.unit_price)"
                  @input="onPriceInput(row, $event)"
                  @keydown="handlePriceKeydown($event, row, index)"
                  class="w-full max-w-[105px] h-9 px-2 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-[#e05e2b]/40 transition-all"
                  placeholder="0.00"
                />

                <p
                  v-if="getValidationError(`items.${index}.unit_price`)"
                  class="text-rose-400 text-[10px] font-bold text-center"
                >
                  {{ getValidationError(`items.${index}.unit_price`) }}
                </p>
              </div>
            </td>

            <!-- 6. نسبة الخصم % (مشروط) -->
            <td v-if="showLineDiscount" class="py-2.5 px-2 align-middle">
              <div class="flex flex-col items-center justify-center gap-1">
                <input
                  :ref="(el) => setCellRef(el, index, 'discount')"
                  type="text"
                  inputmode="decimal"
                  :value="formatNumber(row.discount_percentage)"
                  @input="onDiscountInput(row, $event)"
                  @keydown="handleDiscountKeydown($event, row, index)"
                  class="w-full max-w-[80px] h-9 px-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-amber-400 rounded-lg text-amber-300 text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                  placeholder="0"
                />
              </div>
            </td>

            <!-- 7. نسبة الضريبة % (مشروط) -->
            <td v-if="showLineTax" class="py-2.5 px-2 align-middle">
              <div class="flex flex-col items-center justify-center gap-1">
                <input
                  :ref="(el) => setCellRef(el, index, 'tax')"
                  type="text"
                  inputmode="decimal"
                  :value="formatNumber(row.tax_rate)"
                  @input="onTaxInput(row, $event)"
                  @keydown="handleTaxKeydown($event, row, index)"
                  class="w-full max-w-[80px] h-9 px-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-sky-400 rounded-lg text-sky-300 text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-sky-400/30 transition-all"
                  placeholder="15"
                />
              </div>
            </td>

            <!-- 8. قبل الضريبة (مشروط بظهور الخصم أو الضريبة) -->
            <td
              v-if="showLineDiscount || showLineTax"
              class="py-2.5 px-2 text-center align-middle font-mono font-bold text-xs text-gray-300"
            >
              {{ formatNumber(row.subtotal) }}
            </td>

            <!-- 9. الإجمالي الصافي -->
            <td
              class="py-2.5 px-2 text-center align-middle font-mono font-black text-xs text-emerald-400"
            >
              {{ formatNumber(row.total) }}
            </td>

            <!-- 10. حذف السطر -->
            <td class="py-2.5 px-2 text-center align-middle">
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
            </td>
          </tr>

          <!-- حالة القائمة الفارغة -->
          <tr v-if="items.length === 0">
            <td
              :colspan="
                6 +
                (showLineDiscount ? 1 : 0) +
                (showLineTax ? 1 : 0) +
                (showLineDiscount || showLineTax ? 1 : 0) +
                2
              "
              class="p-8 text-center text-gray-400 text-xs font-medium"
            >
              لم تسجل أي بند بالفاتورة حتى الآن. انقر على الزر أدناه لإضافة البند الأول.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- زر إضافة بند جديد -->
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
        <span>+ إضافة بند فاتورة آخر (Ctrl + Enter)</span>
      </button>
    </div>

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
              </div>

              <div class="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                <span>كود: PRD-{{ product.id }}</span>
                <span v-if="product.sku">SKU: {{ product.sku }}</span>
                <span v-if="product.unit?.name" class="text-gray-300 font-sans">
                  الوحدة: {{ product.unit.name }}
                </span>
                <span
                  class="font-sans font-bold"
                  :class="
                    product.available_quantity > 0 || product.current_stock > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  "
                >
                  الكمية الحالية:
                  {{
                    formatNumber(
                      product.available_quantity !== undefined &&
                        product.available_quantity !== null
                        ? product.available_quantity
                        : product.current_stock !== undefined && product.current_stock !== null
                          ? product.current_stock
                          : product.stock !== undefined && product.stock !== null
                            ? product.stock
                            : 0,
                    )
                  }}
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
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import productService from '@/modules/inventory/services/product.service'
import { useProductStore } from '@/modules/inventory/stores/productStore'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  showLineDiscount: { type: Boolean, default: false },
  showLineTax: { type: Boolean, default: false },
  toggleLineDiscount: { type: Function, default: () => {} },
  toggleLineTax: { type: Function, default: () => {} },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  syncUnitDetails: { type: Function, required: true },
  recalculateLine: { type: Function, required: true },
  incrementQuantity: { type: Function, required: true },
  decrementQuantity: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  selectProductForRow: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  isFormLoaded: { type: Boolean, default: false },
})

const productStore = useProductStore()

// =========================================================
// 1. نظام إدارة التركيز الشبكي الذكي التكيفي
// =========================================================
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const activeTargetInput = ref(null)

// مصفوفة التنقل التكيفية: لا تشمل حقل الكمية الحالية لأنه للقراءة فقط
const activeColumnsOrder = computed(() => {
  const order = ['name', 'unit', 'qty', 'price']
  if (props.showLineDiscount) {
    order.push('discount')
  }
  if (props.showLineTax) {
    order.push('tax')
  }
  return order
})

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
  const order = activeColumnsOrder.value
  const currentIdx = order.indexOf(currentColKey)
  if (currentIdx === -1) return

  const targetIdx = currentIdx + direction

  if (targetIdx >= 0 && targetIdx < order.length) {
    focusCell(rowIndex, order[targetIdx], false)
  } else if (targetIdx >= order.length) {
    if (rowIndex === props.items.length - 1) {
      handleAddNewLineWithFocus()
    } else {
      focusCell(rowIndex + 1, 'name', true)
    }
  } else if (targetIdx < 0 && rowIndex > 0) {
    const prevOrder = activeColumnsOrder.value
    focusCell(rowIndex - 1, prevOrder[prevOrder.length - 1], false)
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
// 2. إدارة البحث فائق السرعة
// =========================================================
const activeDropdownIndex = ref(null)
const highlightedProductIndex = ref(0)
const searchResults = ref([])
const isSearching = ref(false)
let debounceTimer = null

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

  const cleanQuery = queryText ? queryText.trim() : ''
  if (!cleanQuery) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  const performRequest = async () => {
    isSearching.value = true
    try {
      const response = await productService.fastSearch({
        query: cleanQuery,
        store_id: props.form.warehouse_id || undefined,
        limit: 10,
      })

      let results = response.data?.data || response.data || []

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
      console.error('فشل في تنفيذ البحث السريع للأصناف بالفاتورة:', err)
      searchResults.value = []
    } finally {
      isSearching.value = false
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
    row.current_quantity = 0
  }
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(row.product_name, index, false)
}

const closeSearchDropdownDelayed = () => {
  setTimeout(() => {
    activeDropdownIndex.value = null
    activeTargetInput.value = null
    searchResults.value = []
    dropdownItemRefs.value = []
  }, 200)
}

const handleSelectProduct = (row, product, index) => {
  const isSuccess = props.selectProductForRow(row, product, index)
  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []

  if (isSuccess) {
    focusCell(index, 'qty', false)
  } else {
    focusCell(index, 'name', false)
  }
}

// =========================================================
// 3. معالجة تحديثات المدخلات
// =========================================================
const onQtyInput = (row, event) => {
  row.quantity = props.unformatNumber(event.target.value)
  props.recalculateLine(row)
}

const onPriceInput = (row, event) => {
  row.unit_price = props.unformatNumber(event.target.value)
  props.recalculateLine(row)
}

const onDiscountInput = (row, event) => {
  row.discount_percentage = props.unformatNumber(event.target.value)
  props.recalculateLine(row)
}

const onTaxInput = (row, event) => {
  row.tax_rate = props.unformatNumber(event.target.value)
  props.recalculateLine(row)
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
      focusCell(index, 'qty', false)
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
    focusCell(index, 'qty', false)
  }
}

const handleQuantityKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    props.incrementQuantity(row)
    return
  }

  if (event.key === '-') {
    event.preventDefault()
    props.decrementQuantity(row)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'qty', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'qty', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'qty', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'qty', -1)
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'price', false)
  }
}

const handlePriceKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'price', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'price', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'price', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'price', -1)
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (props.showLineDiscount) {
      focusCell(index, 'discount', false)
    } else if (props.showLineTax) {
      focusCell(index, 'tax', false)
    } else {
      if (index < props.items.length - 1) {
        focusCell(index + 1, 'name', true)
      } else {
        handleAddNewLineWithFocus()
      }
    }
  }
}

const handleDiscountKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusCell(index + 1, 'discount', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      focusCell(index - 1, 'discount', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'discount', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'discount', -1)
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (props.showLineTax) {
      focusCell(index, 'tax', false)
    } else {
      if (index < props.items.length - 1) {
        focusCell(index + 1, 'name', true)
      } else {
        handleAddNewLineWithFocus()
      }
    }
  }
}

const handleTaxKeydown = (event, row, index) => {
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
      focusCell(index - 1, 'tax', true)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'tax', -1)
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
  clearTimeout(debounceTimer)
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
