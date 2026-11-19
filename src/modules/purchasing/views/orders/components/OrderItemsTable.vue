<!-- src/modules/purchasing/views/orders/components/OrderItemsTable.vue -->
<template>
  <div class="p-0 bg-transparent space-y-2.5 font-sans text-right" dir="rtl">
    <!-- تنبيه خطأ التحقق العام لقائمة البنود إن وجد -->
    <div
      v-if="getValidationError('items')"
      class="p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-bold border border-danger/30 shadow-sm flex items-center gap-2"
    >
      <svg
        class="w-4 h-4 shrink-0 text-danger"
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

    <!-- منصة جدول إدخال وتعديل بنود أمر الشراء المجسّمة (3D Elevated Stage) -->
    <div
      class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      <div class="overflow-x-auto min-h-[195px] flex flex-col justify-between">
        <table class="w-full text-right border-collapse text-xs">
          <thead class="invoice-thead-3d select-none h-11 tracking-tight">
            <tr>
              <th class="px-3 py-2.5 w-24 text-center text-slate-400 dark:text-slate-600 font-mono">
                #
              </th>
              <th
                class="px-3 py-2.5 min-w-[240px] text-right font-black text-white dark:text-slate-900 text-[13px]"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  بيان الصنف أو مسح الباركود
                </span>
              </th>
              <th
                class="px-2.5 py-2.5 min-w-[130px] w-36 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                وحدة القياس
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[110px] w-28 font-bold text-sky-300 dark:text-sky-700"
              >
                الكمية الحالية
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[135px] w-36 font-bold text-slate-200 dark:text-slate-800"
              >
                الكمية
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[115px] w-32 font-bold text-slate-200 dark:text-slate-800"
              >
                سعر الوحدة
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[85px] w-24 font-bold text-amber-300 dark:text-amber-700"
              >
                خصم %
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[85px] w-24 font-bold text-sky-300 dark:text-sky-700"
              >
                ضريبة %
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[110px] w-28 font-bold text-slate-200 dark:text-slate-800"
              >
                قبل الضريبة
              </th>
              <th
                class="px-2.5 py-2.5 text-center min-w-[125px] w-36 font-black text-primary-light dark:text-primary-dark text-[13px]"
              >
                الإجمالي الصافي
              </th>
              <th
                class="px-2.5 py-2.5 text-center w-14 font-bold text-slate-400 dark:text-slate-600"
              >
                إجراء
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/70">
            <tr
              v-for="(row, index) in items"
              :key="row.id || index"
              class="invoice-row-3d animate-row-enter h-13"
              :class="[row.product_id ? 'invoice-row-filled' : 'invoice-row-empty']"
            >
              <!-- تسلسل السطر وشارة كود الصنف -->
              <td class="px-2.5 py-2 text-center font-mono align-middle">
                <div class="flex items-center justify-center gap-1.5">
                  <span
                    class="w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px]"
                    :class="
                      row.product_id
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-surface-ground text-text-muted border border-surface-border'
                    "
                  >
                    {{ index + 1 }}
                  </span>
                  <span
                    v-if="row.product_id"
                    class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25 whitespace-nowrap"
                  >
                    PRD-{{ row.product_id }}
                  </span>
                  <span
                    v-else
                    class="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold bg-warning/15 text-warning border border-warning/30 whitespace-nowrap"
                  >
                    جديد
                  </span>
                </div>
              </td>

              <!-- 1. بيان الصنف ومسح الباركود -->
              <td class="px-3 py-2 align-middle">
                <div class="flex flex-col justify-center gap-1">
                  <div class="relative w-full h-10 flex items-center">
                    <input
                      :ref="(el) => setCellRef(el, index, 'name')"
                      type="text"
                      v-model="row.product_name"
                      @input="onItemNameChange(row, index, $event)"
                      @focus="openSearchDropdown(index, $event)"
                      @blur="closeSearchDropdownDelayed"
                      @keydown="handleItemNameKeydown($event, row, index)"
                      placeholder="امسح الباركود أو اكتب اسم الصنف / الكود..."
                      :class="[
                        'w-full h-10 pl-3 rounded-xl text-text-primary outline-none transition-all placeholder:text-text-muted placeholder:font-normal',
                        row.product_id
                          ? 'invoice-input-seamless pr-3.5 border text-sm font-black'
                          : 'invoice-cell-input-3d pr-9 bg-surface-card border border-primary/45 hover:border-primary focus:border-primary text-[13px] font-bold',
                      ]"
                    />

                    <span
                      v-if="!row.product_id"
                      class="absolute right-3 inset-y-0 flex items-center text-primary/80 pointer-events-none"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                    </span>
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.product_id`)"
                    class="text-danger text-[10px] font-bold pr-1"
                  >
                    {{ getValidationError(`items.${index}.product_id`) }}
                  </p>
                </div>
              </td>

              <!-- 2. وحدة القياس -->
              <td class="px-2.5 py-2 text-center align-middle">
                <div class="flex flex-col items-center justify-center gap-1">
                  <div class="relative inline-flex items-center justify-center h-9 max-w-full">
                    <select
                      :ref="(el) => setCellRef(el, index, 'unit')"
                      v-model="row.product_unit_id"
                      @change="syncUnitDetails(row)"
                      @keydown="handleUnitKeydown($event, row, index)"
                      :disabled="!row.available_units || row.available_units.length === 0"
                      class="invoice-pill-editable h-9 min-w-[96px] max-w-[140px] pr-3 pl-6 border rounded-xl text-text-secondary text-xs font-bold outline-none appearance-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-all"
                    >
                      <option value="" class="bg-surface-section text-text-muted">
                        اختر الوحدة...
                      </option>
                      <option
                        v-for="u in row.available_units"
                        :key="u.id"
                        :value="u.id"
                        class="bg-surface-section text-text-primary font-bold"
                      >
                        {{ u.unit_name || u.name || 'وحدة مسجلة' }}
                      </option>
                    </select>
                    <span
                      class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                    >
                      ▼
                    </span>
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.product_unit_id`)"
                    class="text-danger text-[10px] font-bold"
                  >
                    {{ getValidationError(`items.${index}.product_unit_id`) }}
                  </p>
                </div>
              </td>

              <!-- 3. الكمية الحالية -->
              <td class="px-2.5 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    class="font-mono font-black text-xs px-2.5 py-1 rounded-xl border inline-flex items-center justify-center min-w-[60px] h-8 tracking-wide transition-all"
                    :class="[
                      row.current_quantity > 0
                        ? 'bg-info/12 text-info border-info/35 shadow-2xs'
                        : row.current_quantity < 0
                          ? 'bg-danger/12 text-danger border-danger/35'
                          : 'bg-surface-ground/80 text-text-secondary border-surface-border/70',
                    ]"
                    title="الكمية المتوفرة حالياً في المستودعات"
                  >
                    {{ formatNumber(row.current_quantity) }}
                  </span>
                </div>
              </td>

              <!-- 4. الكمية المطلوبة -->
              <td class="px-2.5 py-2 align-middle">
                <div class="flex flex-col items-center justify-center gap-1">
                  <div
                    class="invoice-pill-editable flex items-center w-full max-w-[132px] h-9 border rounded-xl overflow-hidden transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25"
                  >
                    <button
                      type="button"
                      tabindex="-1"
                      @click="decrementQuantity(row)"
                      class="w-8 h-full hover:bg-primary/10 text-text-secondary hover:text-primary flex items-center justify-center font-black text-sm select-none transition-colors cursor-pointer border-l border-surface-border/50"
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
                      class="w-full h-full bg-transparent text-text-primary text-sm font-mono font-black text-center outline-none"
                      placeholder="1"
                    />

                    <button
                      type="button"
                      tabindex="-1"
                      @click="incrementQuantity(row)"
                      class="w-8 h-full hover:bg-primary/10 text-text-secondary hover:text-primary flex items-center justify-center font-black text-sm select-none transition-colors cursor-pointer border-r border-surface-border/50"
                    >
                      +
                    </button>
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.quantity`)"
                    class="text-danger text-[10px] font-bold text-center"
                  >
                    {{ getValidationError(`items.${index}.quantity`) }}
                  </p>
                </div>
              </td>

              <!-- 5. سعر الوحدة -->
              <td class="px-2.5 py-2 align-middle">
                <div class="flex flex-col items-center justify-center gap-1">
                  <input
                    :ref="(el) => setCellRef(el, index, 'price')"
                    type="text"
                    inputmode="decimal"
                    :value="formatNumber(row.unit_price)"
                    @input="onPriceInput(row, $event)"
                    @keydown="handlePriceKeydown($event, row, index)"
                    class="invoice-pill-editable w-full max-w-[110px] h-9 px-2 border rounded-xl text-text-primary text-xs font-mono font-bold text-center outline-none transition-all"
                    placeholder="0.00"
                  />

                  <p
                    v-if="getValidationError(`items.${index}.unit_price`)"
                    class="text-danger text-[10px] font-bold text-center"
                  >
                    {{ getValidationError(`items.${index}.unit_price`) }}
                  </p>
                </div>
              </td>

              <!-- 6. نسبة الخصم % -->
              <td class="px-2.5 py-2 align-middle">
                <div class="flex flex-col items-center justify-center gap-1">
                  <input
                    :ref="(el) => setCellRef(el, index, 'discount')"
                    type="text"
                    inputmode="decimal"
                    :value="formatNumber(row.discount_percentage)"
                    @input="onDiscountInput(row, $event)"
                    @keydown="handleDiscountKeydown($event, row, index)"
                    class="invoice-pill-editable w-full max-w-[82px] h-9 px-1.5 border rounded-xl text-warning text-xs font-mono font-bold text-center outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </td>

              <!-- 7. نسبة الضريبة % -->
              <td class="px-2.5 py-2 align-middle">
                <div class="flex flex-col items-center justify-center gap-1">
                  <input
                    :ref="(el) => setCellRef(el, index, 'tax')"
                    type="text"
                    inputmode="decimal"
                    :value="formatNumber(row.tax_rate)"
                    @input="onTaxInput(row, $event)"
                    @keydown="handleTaxKeydown($event, row, index)"
                    class="invoice-pill-editable w-full max-w-[82px] h-9 px-1.5 border rounded-xl text-info text-xs font-mono font-bold text-center outline-none transition-all"
                    placeholder="15"
                  />
                </div>
              </td>

              <!-- 8. قبل الضريبة -->
              <td class="px-2.5 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    class="font-mono font-bold text-xs px-2.5 py-1 rounded-lg text-text-secondary bg-surface-ground/80 border border-surface-border/60"
                  >
                    {{ formatNumber(row.subtotal) }}
                  </span>
                </div>
              </td>

              <!-- 9. الإجمالي الصافي -->
              <td class="px-2.5 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <div
                    class="inline-flex items-center justify-center min-w-[92px] h-9 px-3 rounded-xl border transition-all"
                    :class="
                      Number(row.total) > 0
                        ? 'bg-primary/12 border-primary/35 text-primary shadow-2xs'
                        : 'bg-surface-ground/80 border-surface-border/60 text-text-secondary'
                    "
                  >
                    <span class="font-mono font-black text-sm">
                      {{ formatNumber(row.total) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- 10. حذف السطر -->
              <td class="px-2.5 py-2 text-center align-middle">
                <div class="h-9 flex items-center justify-center">
                  <button
                    type="button"
                    tabindex="-1"
                    @click="handleRemoveRowWithFocus(index)"
                    class="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
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
              <td colspan="11" class="py-10 text-center text-text-muted text-xs font-medium">
                لم تسجل أي بند بأمر الشراء حتى الآن. انقر على الزر أدناه لإضافة البند الأول.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- شريط الإضافة السريع ومؤشر عدد البنود المدمج أسفل المنصة -->
      <div
        class="px-4 py-2 bg-surface-ground/60 border-t border-surface-border/80 flex flex-wrap items-center justify-between gap-2"
      >
        <button
          type="button"
          tabindex="-1"
          @click="handleAddNewLineWithFocus"
          class="h-8 px-3.5 bg-surface-card hover:bg-primary hover:text-white text-primary border border-primary/45 hover:border-primary text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>إضافة بند أمر شراء آخر (Ctrl + Enter)</span>
        </button>

        <span
          class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border text-xs text-text-secondary font-mono shadow-2xs"
        >
          إجمالي البنود:
          <strong class="text-primary font-black text-sm mr-1">{{ items.length }}</strong>
        </span>
      </div>
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
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto divide-y divide-surface-border/60 text-right font-sans transition-all"
        dir="rtl"
      >
        <div
          v-if="isSearching"
          class="p-3 text-center text-text-muted text-xs flex items-center justify-center gap-2 font-semibold"
        >
          <span
            class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"
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
                ? 'bg-primary/10 border-r-4 border-primary'
                : 'hover:bg-surface-ground'
            "
          >
            <div class="flex flex-col gap-1 pr-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-text-primary">{{ product.name }}</span>
                <span
                  v-if="product.matched_barcode"
                  class="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono font-bold border border-primary/25"
                >
                  باركود: {{ product.matched_barcode }}
                </span>
              </div>

              <div class="flex items-center gap-3 text-[10px] text-text-muted font-mono">
                <span>كود: PRD-{{ product.id }}</span>
                <span v-if="product.sku">SKU: {{ product.sku }}</span>
                <span v-if="product.unit?.name" class="text-text-secondary font-sans">
                  الوحدة: {{ product.unit.name }}
                </span>
                <span
                  class="font-sans font-bold"
                  :class="
                    product.available_quantity > 0 || product.current_stock > 0
                      ? 'text-info'
                      : 'text-danger'
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

            <div class="flex items-center gap-3 pl-1">
              <span
                v-if="product.cost_price || product.price"
                class="text-xs font-mono font-bold text-success whitespace-nowrap"
              >
                {{ formatNumber(product.cost_price || product.price) }}
              </span>
              <span
                class="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shadow-sm"
                :class="
                  highlightedProductIndex === pIndex
                    ? 'bg-primary text-white'
                    : 'text-primary bg-primary/10 border border-primary/20'
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
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import productService from '@/modules/inventory/services/product.service'
import { useProductStore } from '@/modules/inventory/stores/productStore'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
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
// 1. نظام إدارة التركيز الشبكي الذكي
// =========================================================
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const columnsOrder = ['name', 'unit', 'qty', 'price', 'discount', 'tax']
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
    focusCell(rowIndex - 1, 'tax', false)
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
      console.error('فشل في تنفيذ البحث السريع للأصناف:', err)
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
    focusCell(index, 'discount', false)
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
    focusCell(index, 'tax', false)
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
