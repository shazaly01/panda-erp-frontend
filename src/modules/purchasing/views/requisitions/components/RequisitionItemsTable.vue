<!-- src/modules/purchasing/views/requisitions/components/RequisitionItemsTable.vue -->
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

    <!-- جدول إدخال وتعديل البنود المباشر -->
    <div class="overflow-x-auto rounded-2xl border border-[#3e414c] bg-[#1a1d24] shadow-lg">
      <table class="w-full text-right border-collapse text-xs">
        <thead>
          <tr class="bg-[#121316] text-gray-300 border-b border-[#3e414c] font-bold select-none">
            <th class="p-3 text-center w-12">#</th>
            <th class="p-3 min-w-[280px]">بيان الصنف أو مسح الباركود</th>
            <th class="p-3 min-w-[140px]">وحدة القياس</th>
            <th class="p-3 text-center min-w-[150px]">الكمية</th>
            <th class="p-3 min-w-[240px]">المواصفات الفنية أو ملاحظات البند</th>
            <th class="p-3 text-center w-12">إجراء</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-[#2a2e39]">
          <tr
            v-for="(row, index) in items"
            :key="row.id || index"
            class="hover:bg-[#20232c] transition-colors"
          >
            <!-- تسلسل السطر وشارة تمييزه -->
            <td class="p-3 text-center font-mono text-gray-400 align-middle">
              <div class="flex flex-col items-center justify-center gap-1">
                <span class="font-bold">{{ index + 1 }}</span>
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded font-sans font-bold"
                  :class="
                    row.product_id
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  "
                >
                  {{ row.product_id ? 'مخزني' : 'حر' }}
                </span>
              </div>
            </td>

            <!-- 1. بيان الصنف ومسح الباركود -->
            <td class="p-3 align-top">
              <div class="flex flex-col gap-1">
                <div class="relative w-full">
                  <input
                    :ref="(el) => setCellRef(el, index, 'name')"
                    type="text"
                    v-model="row.item_name"
                    @input="onItemNameChange(row, index, $event)"
                    @focus="openSearchDropdown(index, $event)"
                    @blur="closeSearchDropdownDelayed"
                    @keydown="handleItemNameKeydown($event, row, index)"
                    placeholder="امسح الباركود أو اكتب اسم الصنف / الكود..."
                    class="w-full h-9 px-3 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-[#e05e2b]/40 transition-all"
                  />

                  <span
                    v-if="row.product_id"
                    class="absolute left-2.5 top-2 text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 pointer-events-none"
                  >
                    PRD-{{ row.product_id }}
                  </span>
                </div>

                <p
                  v-if="getValidationError(`items.${index}.item_name`)"
                  class="text-rose-400 text-[10px] font-bold pr-1"
                >
                  {{ getValidationError(`items.${index}.item_name`) }}
                </p>
              </div>
            </td>

            <!-- 2. وحدة القياس -->
            <td class="p-3 align-top">
              <div class="flex flex-col gap-1">
                <div v-if="row.product_id && row.available_units && row.available_units.length > 0">
                  <select
                    :ref="(el) => setCellRef(el, index, 'unit')"
                    v-model="row.product_unit_id"
                    @change="syncUnitDetails(row)"
                    @keydown="handleUnitKeydown($event, row, index)"
                    style="color-scheme: dark"
                    class="w-full h-9 px-2 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-bold outline-none text-right cursor-pointer"
                  >
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

                <div v-else>
                  <input
                    :ref="(el) => setCellRef(el, index, 'unit')"
                    type="text"
                    v-model="row.unit_name"
                    @keydown="handleUnitKeydown($event, row, index)"
                    placeholder="مثال: حبة، كرتونة، كيس..."
                    class="w-full h-9 px-3 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-white text-xs font-semibold outline-none text-right"
                  />
                </div>

                <p
                  v-if="getValidationError(`items.${index}.unit_name`)"
                  class="text-rose-400 text-[10px] font-bold pr-1"
                >
                  {{ getValidationError(`items.${index}.unit_name`) }}
                </p>
              </div>
            </td>

            <!-- 3. الكمية المطلوبة -->
            <td class="p-3 align-top">
              <div class="flex flex-col items-center gap-1">
                <div
                  class="flex items-center w-full max-w-[130px] bg-[#16171b] border border-[#3e414c] rounded-lg overflow-hidden focus-within:border-[#e05e2b] focus-within:ring-1 focus-within:ring-[#e05e2b]/40"
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
                    :value="formatNumber(row.quantity_requested)"
                    @input="row.quantity_requested = unformatNumber($event.target.value)"
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
                  v-if="getValidationError(`items.${index}.quantity_requested`)"
                  class="text-rose-400 text-[10px] font-bold text-center"
                >
                  {{ getValidationError(`items.${index}.quantity_requested`) }}
                </p>
              </div>
            </td>

            <!-- 4. المواصفات الفنية -->
            <td class="p-3 align-top">
              <div class="flex flex-col gap-1">
                <input
                  :ref="(el) => setCellRef(el, index, 'spec')"
                  type="text"
                  v-model="row.specifications"
                  @keydown="handleSpecificationsKeydown($event, row, index)"
                  placeholder="المواصفات (ماركة محددة، مقاس، سعة، لون...)"
                  class="w-full h-9 px-3 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded-lg text-gray-200 text-xs outline-none focus:ring-1 focus:ring-[#e05e2b]/40 transition-all"
                />
              </div>
            </td>

            <!-- 5. حذف السطر -->
            <td class="p-3 text-center align-middle">
              <button
                type="button"
                tabindex="-1"
                @click="handleRemoveRowWithFocus(index)"
                class="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
            <td colspan="6" class="p-8 text-center text-gray-400 text-xs font-medium">
              لم تسجل أي بند حتى الآن. انقر على الزر أدناه لإضافة البند الأول.
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
        <span>+ إضافة بند احتياج آخر (Ctrl + Enter)</span>
      </button>

      <span class="text-xs text-gray-400 font-mono">
        إجمالي البنود المضافة: <strong class="text-white">{{ items.length }}</strong>
      </span>
    </div>

    <!-- قائمة الاقتراحات الطافية السريعة والذكية التموضع -->
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
                  :class="product.available_quantity > 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  المتاح: {{ formatNumber(product.available_quantity) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span v-if="product.price > 0" class="text-xs font-mono font-bold text-emerald-400">
                {{ formatNumber(product.price) }}
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
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import productService from '@/modules/inventory/services/product.service'

const props = defineProps({
  items: { type: Array, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  selectProductForRow: { type: Function, required: true },
  handleItemNameInput: { type: Function, required: true },
  syncUnitDetails: { type: Function, required: true },
  incrementQuantity: { type: Function, required: true },
  decrementQuantity: { type: Function, required: true },
})

// =========================================================
// 1. نظام إدارة التركيز الشبكي الذكي والتمرير التلقائي
// =========================================================
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const columnsOrder = ['name', 'unit', 'qty', 'spec']
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
    focusCell(rowIndex - 1, 'spec', false)
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
// 2. إدارة البحث فائق السرعة وتموضع القائمة الذكي
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

// تنفيذ البحث السريع مع دعم التنفيذ الفوري للمسح الضوئي (immediate = true)
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

      const results = response.data?.data || response.data || []

      // إذا كان الإدخال ناتجاً عن مسح باركود مباشر وتطابق صنف واحد بالضبط
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
      console.error('فشل في تنفيذ البحث السريع:', err)
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

// عند الـ Focus: نقوم فقط بضبط موضع القائمة وتجهيزها دون تنفيذ أي استعلام على السيرفر
const openSearchDropdown = (index, event) => {
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
}

// تنفيذ البحث يحدث حصراً عند الكتابة وتغيير القيمة المدخلة
const onItemNameChange = (row, index, event) => {
  props.handleItemNameInput(row)
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(row.item_name, index, false)
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
  // تمرير رقم السطر الحالي للتأكد من منع التكرار مع سطر آخر
  const isSuccess = props.selectProductForRow(row, product, index)
  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []

  if (isSuccess) {
    focusCell(index, 'qty', false)
  } else {
    // في حال تكرار الصنف يبقى المؤشر في نفس الخلية لتعديل الإدخال
    focusCell(index, 'name', false)
  }
}

// =========================================================
// 3. معالجة أحداث لوحة المفاتيح والتنقل الشبكي
// =========================================================

// 1. حقل الصنف ومسح الباركود
const handleItemNameKeydown = async (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  const isDropdownOpen =
    activeDropdownIndex.value === index && searchResults.value.length > 0 && !isSearching.value

  // التنقل داخل القائمة المنسدلة
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

  // ضغط Enter في حقل الاسم (مسح الباركود أو التقدم السريع)
  if (event.key === 'Enter') {
    event.preventDefault()

    if (!row.product_id && row.item_name && row.item_name.trim().length > 0) {
      await executeFastSearch(row.item_name, index, true)
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

  // سهم لأسفل: انتقال للسطر التالي أو إنشاء سطر جديد مع توسيطه
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

  // سهم لأعلى
  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      activeDropdownIndex.value = null
      focusCell(index - 1, 'name', true)
    }
    return
  }

  // سهم يسار -> الوحدة
  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el) || !row.item_name) {
      event.preventDefault()
      activeDropdownIndex.value = null
      navigateHorizontal(index, 'name', 1)
    }
    return
  }

  // سهم يمين -> الخلية السابقة
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

// 2. حقل الوحدة
const handleUnitKeydown = (event, row, index) => {
  if (checkCommonRowShortcuts(event, index)) return

  if (event.key === 'ArrowDown') {
    if (!row.product_id || event.ctrlKey) {
      event.preventDefault()
      if (index < props.items.length - 1) {
        focusCell(index + 1, 'unit', true)
      } else {
        handleAddNewLineWithFocus()
      }
      return
    }
  }

  if (event.key === 'ArrowUp') {
    if (!row.product_id || event.ctrlKey) {
      if (index > 0) {
        event.preventDefault()
        focusCell(index - 1, 'unit', true)
      }
      return
    }
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (row.product_id || isTextFullySelected(el) || isCursorAtEnd(el) || !row.unit_name) {
      event.preventDefault()
      navigateHorizontal(index, 'unit', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (row.product_id || isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'unit', -1)
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusCell(index, 'qty', false)
  }
}

// 3. حقل الكمية
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
    focusCell(index, 'spec', false)
  }
}

// 4. حقل المواصفات
const handleSpecificationsKeydown = (event, row, index) => {
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
      focusCell(index - 1, 'spec', true)
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el) || !row.specifications) {
      event.preventDefault()
      navigateHorizontal(index, 'spec', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateHorizontal(index, 'spec', -1)
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

kbd {
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
