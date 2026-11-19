<!-- src/modules/sales/views/invoices/components/SalesInvoiceItemsTable.vue -->
<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'
import productService from '@/modules/inventory/services/product.service'

const props = defineProps({
  items: { type: Array, required: true },
  form: { type: Object, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  isFormLoaded: { type: Boolean, default: false },
})

const productStore = useProductStore()
const customerStore = useCustomerStore()

const tableWrapperRef = ref(null)

// ----------------------------------------------------
// 1. تجهيز بيانات الأصناف للبحث والمسح الفوري
// ----------------------------------------------------
const extractProductBarcodes = (product) => {
  const directBarcodes = Array.isArray(product.barcodes)
    ? product.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
    : product.barcode
      ? [product.barcode]
      : []

  const unitBarcodes = Array.isArray(product.units)
    ? product.units.flatMap((u) =>
        Array.isArray(u.barcodes)
          ? u.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
          : u.barcode
            ? [u.barcode]
            : [],
      )
    : []

  return [...new Set([...directBarcodes, ...unitBarcodes])].filter(Boolean).map(String)
}

const resolveProductStock = (product) => {
  if (product.available_quantity !== undefined && product.available_quantity !== null) {
    return parseFloat(product.available_quantity) || 0
  }
  if (product.current_stock !== undefined && product.current_stock !== null) {
    return parseFloat(product.current_stock) || 0
  }
  if (product.stock !== undefined && product.stock !== null) {
    return parseFloat(product.stock) || 0
  }
  return 0
}

const searchableProducts = computed(() => {
  if (!Array.isArray(productStore.products)) return []
  return productStore.products.map((product) => {
    const allBarcodes = extractProductBarcodes(product)
    const defaultUnit = product.units?.[0] || null
    const defaultPrice = defaultUnit?.price ?? product.price ?? product.selling_price ?? 0

    return {
      ...product,
      id_display: `PRD-${product.id}`,
      name: product.name || '',
      price_display: `${parseFloat(defaultPrice || 0).toFixed(2)}`,
      stock_value: resolveProductStock(product),
      all_barcodes: allBarcodes,
    }
  })
})

const formatSmartNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(num)
}

// مزامنة الأصناف والمخزون عند تغير المستودع المختار
watch(
  () => props.form.warehouse_id,
  async (newWarehouseId) => {
    if (!newWarehouseId) {
      productStore.clearProducts()
      return
    }

    const fetched = await productStore.fetchProducts({
      is_active: 1,
      warehouse_id: newWarehouseId,
      store_id: newWarehouseId,
      per_page: 1000,
    })

    if (Array.isArray(fetched) && props.items.length > 0) {
      props.items.forEach((row) => {
        if (!row.product_id) return
        const matched = fetched.find((p) => p.id === row.product_id)
        if (matched) {
          row.base_stock = resolveProductStock(matched)
          if (Array.isArray(matched.units) && matched.units.length > 0) {
            row.available_units = matched.units
          }
        } else {
          row.base_stock = 0
        }
      })
    }
  },
  { immediate: true },
)

// مزامنة أسعار الأصناف عند تغيير العميل وفئته السعرية
watch(
  () => props.form.partner_id,
  () => {
    if (!props.isFormLoaded) return

    props.items?.forEach((row) => {
      if (row.product_id && row.unit_id) {
        syncUnitSalePrice(row)
      }
    })
  },
)

const updateRowTotal = (row) => {
  const q = parseFloat(row.quantity) || 0
  const p = parseFloat(row.unit_price) || 0
  const gross = parseFloat((q * p).toFixed(4))

  const discVal = parseFloat(row.discount_value) || 0
  const discAmount =
    row.discount_type === 'percentage'
      ? parseFloat((gross * (discVal / 100)).toFixed(4))
      : Math.min(gross, discVal)

  const sub = parseFloat((gross - discAmount).toFixed(4))
  const taxRate = parseFloat(row.tax_rate) || 0
  const taxAmt = parseFloat((sub * (taxRate / 100)).toFixed(4))

  row.discount_amount = discAmount
  row.subtotal = sub
  row.tax_amount = taxAmt
  row.total_amount = parseFloat((sub + taxAmt).toFixed(4))
}

const getSelectedPartnerPriceListId = () => {
  const partnerId = Number(props.form.partner_id)
  if (!partnerId) return null

  const partner =
    customerStore.selectorCustomers?.find((c) => c.id === partnerId) ||
    customerStore.customers?.find((c) => c.id === partnerId)

  return partner?.price_list_id || null
}

const getCustomerPriceForUnit = (productOrUnits, unitRowId) => {
  const units = Array.isArray(productOrUnits) ? productOrUnits : productOrUnits?.units || []
  const matchedUnit = units.find((u) => u.id === unitRowId || u.unit_id === unitRowId)
  if (!matchedUnit) return 0

  const priceListId = getSelectedPartnerPriceListId()

  const matchedPriceEntry =
    priceListId && Array.isArray(matchedUnit.prices)
      ? matchedUnit.prices.find((p) => Number(p.price_list_id) === Number(priceListId))
      : null

  if (
    matchedPriceEntry &&
    matchedPriceEntry.price !== null &&
    matchedPriceEntry.price !== undefined
  ) {
    return Number(matchedPriceEntry.price) || 0
  }

  return Number(matchedUnit.price) || 0
}

const syncUnitSalePrice = (row) => {
  if (row.is_price_overridden) {
    updateRowTotal(row)
    return
  }

  if (row.available_units && row.unit_id) {
    row.unit_price = getCustomerPriceForUnit(row.available_units, row.unit_id)
  }
  updateRowTotal(row)
}

const getMinAllowedPrice = (row) => {
  if (!row.available_units || !row.unit_id) return 0
  const matchedUnit = row.available_units.find(
    (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
  )
  return matchedUnit && matchedUnit.min_allowed_price !== undefined
    ? Number(matchedUnit.min_allowed_price) || 0
    : 0
}

const isPriceBelowMin = (row) => {
  const minPrice = getMinAllowedPrice(row)
  if (minPrice <= 0) return false
  const currentPrice = Number(row.unit_price) || 0
  return currentPrice < minPrice
}

const getRowAvailableStock = (row) => {
  if (row.base_stock === null || row.base_stock === undefined) return 0
  const matchedUnit = row.available_units?.find(
    (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
  )
  const factor = matchedUnit ? parseFloat(matchedUnit.conversion_factor) || 1 : 1
  return parseFloat((row.base_stock / factor).toFixed(2))
}

// ----------------------------------------------------
// 2. دوال وإجراءات البحث السطري والباركود السريع
// ----------------------------------------------------
const cellRefs = ref({})
const dropdownItemRefs = ref([])
const modernColumnsOrder = ['name', 'unit', 'qty', 'price']
const activeTargetInput = ref(null)

const activePriceIndex = ref(null)
const activeQtyIndex = ref(null)
const activeMultiplier = ref(1)
const isDropdownManuallyNavigated = ref(false)

const parseMultiplierQuery = (input) => {
  if (!input) return { multiplier: 1, cleanQuery: '' }
  const match = input.trim().match(/^(\d+(\.\d+)?)\s*[*xX×]\s*(.*)$/)
  if (match) {
    return {
      multiplier: parseFloat(match[1]) || 1,
      cleanQuery: match[3]?.trim() || '',
    }
  }
  return { multiplier: 1, cleanQuery: input.trim() }
}

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

const focusModernCell = (rowIndex, colKey, shouldScroll = true) => {
  nextTick(() => {
    const target = cellRefs.value[rowIndex]?.[colKey]
    if (target) {
      target.focus()
      nextTick(() => {
        if (typeof target.select === 'function') {
          target.select()
        }
      })
      if (shouldScroll && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }
  })
}

const handleFieldFocus = (event) => {
  const el = event.target
  if (el) {
    if (typeof el.select === 'function') {
      el.select()
    }
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }
}

const onNameInputFocus = (index, event) => {
  handleFieldFocus(event)
  openSearchDropdown(index, event)
}

const getQtyDisplayValue = (row, index) => {
  if (activeQtyIndex.value === index) {
    return row.quantity === 0 || row.quantity === null ? '' : row.quantity
  }
  return formatSmartNumber(row.quantity)
}

const onQtyFocus = (index, event) => {
  activeQtyIndex.value = index
  nextTick(() => {
    handleFieldFocus(event)
  })
}

const onQtyBlur = (row, index, event) => {
  activeQtyIndex.value = null
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.quantity = val === '' ? 0 : Number(val)
  updateRowTotal(row)
}

const onQuantityChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.quantity = val === '' ? 0 : Number(val)
  updateRowTotal(row)
}

const getPriceDisplayValue = (row, index) => {
  if (activePriceIndex.value === index) {
    return row.unit_price === 0 || row.unit_price === null ? '' : row.unit_price
  }
  return formatSmartNumber(row.unit_price)
}

const onPriceFocus = (index, event) => {
  activePriceIndex.value = index
  nextTick(() => {
    handleFieldFocus(event)
  })
}

const onPriceBlur = (row, index, event) => {
  activePriceIndex.value = null
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.unit_price = val === '' ? 0 : Number(val)
  row.is_price_overridden = true
  updateRowTotal(row)
}

const onPriceChange = (row, event) => {
  const val = event.target.value.replace(/[^0-9.-]/g, '')
  row.unit_price = val === '' ? 0 : Number(val)
  row.is_price_overridden = true
  updateRowTotal(row)
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

const navigateModernHorizontal = (rowIndex, currentColKey, direction) => {
  const currentRow = props.items[rowIndex]
  if (currentRow && !currentRow.product_id && currentColKey === 'name') {
    if (direction < 0 && rowIndex > 0) {
      const prevRow = props.items[rowIndex - 1]
      focusModernCell(rowIndex - 1, prevRow?.product_id ? 'price' : 'name', true)
    }
    return
  }

  const currentIdx = modernColumnsOrder.indexOf(currentColKey)
  const targetIdx = currentIdx + direction

  if (targetIdx >= 0 && targetIdx < modernColumnsOrder.length) {
    focusModernCell(rowIndex, modernColumnsOrder[targetIdx], true)
  } else if (targetIdx >= modernColumnsOrder.length) {
    if (rowIndex === props.items.length - 1) {
      handleAddNewLineWithFocus()
    } else {
      focusModernCell(rowIndex + 1, 'name', true)
    }
  } else if (targetIdx < 0 && rowIndex > 0) {
    const prevRow = props.items[rowIndex - 1]
    focusModernCell(rowIndex - 1, prevRow?.product_id ? 'price' : 'name', true)
  }
}

const handleAddNewLineWithFocus = async () => {
  props.triggerAddNewEmptyLine()
  await nextTick()
  const newIndex = props.items.length - 1
  focusModernCell(newIndex, 'name', true)
}

const handleRemoveRowWithFocus = async (index) => {
  props.removeRow(index)
  await nextTick()
  const targetIndex = Math.max(0, Math.min(index, props.items.length - 1))
  focusModernCell(targetIndex, 'name', true)
}

const checkModernShortcuts = (event, index) => {
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

// قائمة المقترحات الطافية
const activeDropdownIndex = ref(null)
const highlightedProductIndex = ref(0)
const searchResults = ref([])
const isRemoteSearching = ref(false)
let remoteSearchTimer = null

const dropdownStyle = ref({
  top: 'auto',
  bottom: 'auto',
  right: '0px',
  width: '520px',
})

const updateDropdownPosition = (targetElement) => {
  if (!targetElement) return
  activeTargetInput.value = targetElement
  const rect = targetElement.getBoundingClientRect()
  const dropdownEstimatedHeight = 260
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const shouldOpenUpwards = spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow

  const preferredWidth = Math.max(rect.width, 520)
  const maxWidth = Math.min(preferredWidth, window.innerWidth - 20)
  const rightOffset = Math.max(10, window.innerWidth - rect.right)

  if (shouldOpenUpwards) {
    dropdownStyle.value = {
      top: 'auto',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      right: `${rightOffset}px`,
      width: `${maxWidth}px`,
    }
  } else {
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      bottom: 'auto',
      right: `${rightOffset}px`,
      width: `${maxWidth}px`,
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

const onDropdownItemHover = (pIndex) => {
  highlightedProductIndex.value = pIndex
  isDropdownManuallyNavigated.value = true
}

const executeFastSearch = async (queryText, rowIndex, immediate = false) => {
  clearTimeout(remoteSearchTimer)
  isDropdownManuallyNavigated.value = false
  const { multiplier, cleanQuery } = parseMultiplierQuery(queryText)
  activeMultiplier.value = multiplier
  const clean = cleanQuery ? cleanQuery.toLowerCase() : ''

  if (!clean) {
    searchResults.value = []
    return
  }

  // 1. البحث الفوري في القائمة المحلية للمستودع
  const localResults = []
  for (const it of searchableProducts.value) {
    const matchedBarcode = it.all_barcodes?.find((b) => b && b.toLowerCase() === clean)
    const isNameMatch = it.name && it.name.toLowerCase().includes(clean)
    const isIdMatch = `prd-${it.id}`.includes(clean) || String(it.id) === clean
    const isCodeMatch =
      (it.code && it.code.toLowerCase().includes(clean)) ||
      (it.sku && it.sku.toLowerCase().includes(clean))

    if (matchedBarcode) {
      localResults.unshift({ ...it, matched_barcode: matchedBarcode })
    } else if (isNameMatch || isIdMatch || isCodeMatch) {
      localResults.push(it)
    }

    if (localResults.length >= 10) break
  }

  const exactBarcodeMatch = localResults.find((r) => r.matched_barcode)
  if (immediate) {
    if (exactBarcodeMatch) {
      onSelectModernProduct(props.items[rowIndex], exactBarcodeMatch, rowIndex, multiplier, true)
      return
    }
    if (localResults.length === 1) {
      const isBarcodeMatch = Boolean(localResults[0].matched_barcode)
      onSelectModernProduct(
        props.items[rowIndex],
        localResults[0],
        rowIndex,
        multiplier,
        isBarcodeMatch,
      )
      return
    }
  }

  searchResults.value = localResults
  highlightedProductIndex.value = 0
  dropdownItemRefs.value = []

  if (activeTargetInput.value) {
    updateDropdownPosition(activeTargetInput.value)
  }

  // 2. إذا لم توجد نتائج محلياً (أو في حال المسح المباشر للباركود)، نستعلم من الخادم via fastSearch
  if (localResults.length === 0) {
    const runRemoteSearch = async () => {
      isRemoteSearching.value = true
      try {
        const params = { query: cleanQuery, limit: 10 }
        if (props.form?.warehouse_id) {
          params.warehouse_id = props.form.warehouse_id
          params.store_id = props.form.warehouse_id
        }
        const response = await productService.fastSearch(params)
        const remoteList = response.data?.data || response.data || []

        if (immediate && remoteList.length === 1) {
          onSelectModernProduct(props.items[rowIndex], remoteList[0], rowIndex, multiplier, true)
          return
        }

        searchResults.value = remoteList
        highlightedProductIndex.value = 0
        dropdownItemRefs.value = []
        if (activeTargetInput.value) {
          updateDropdownPosition(activeTargetInput.value)
        }
      } catch (err) {
        console.error('فشل البحث السريع عن الأصناف:', err)
      } finally {
        isRemoteSearching.value = false
      }
    }

    if (immediate) {
      await runRemoteSearch()
    } else {
      remoteSearchTimer = setTimeout(runRemoteSearch, 200)
    }
  }
}

const openSearchDropdown = (index, event) => {
  isDropdownManuallyNavigated.value = false
  activeDropdownIndex.value = index
  updateDropdownPosition(event.target)
  executeFastSearch(props.items[index]?.product_name || '', index, false)
}

const onItemNameInput = (row, index, event) => {
  isDropdownManuallyNavigated.value = false
  if (row.product_id) {
    row.product_id = null
    row.unit_id = ''
    row.available_units = []
    row.unit_price = 0
    updateRowTotal(row)
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
    isDropdownManuallyNavigated.value = false
  }, 200)
}

const triggerRowFeedback = (targetRow, withFlash = true) => {
  if (withFlash) {
    targetRow._flashing = false
    nextTick(() => {
      targetRow._flashing = true
    })
    setTimeout(() => {
      targetRow._flashing = false
    }, 800)
  }

  targetRow._popping = false
  nextTick(() => {
    targetRow._popping = true
  })
  setTimeout(() => {
    targetRow._popping = false
  }, 400)
}

/**
 * تسكين واختيار الصنف مع دمج التكرار التلقائي والتوجيه الذكي للمؤشر
 */
const onSelectModernProduct = async (row, product, index, initialQty = 1, isBarcode = false) => {
  if (!row || props.items[index] !== row) return

  const productUnits = Array.isArray(product.units) ? product.units : []
  const defaultUnit = productUnits.find((u) => u.is_sale_unit) || productUnits[0] || null
  const defaultUnitRowId = defaultUnit?.id || ''
  const addQty = Number(initialQty) > 0 ? Number(initialQty) : 1

  // 1. فحص التكرار التلقائي والدمج الفوري للكمية
  const existingIndex = props.items.findIndex(
    (it, idx) =>
      idx !== index &&
      it.product_id === product.id &&
      String(it.unit_id) === String(defaultUnitRowId),
  )

  if (existingIndex !== -1) {
    const existingRow = props.items[existingIndex]
    existingRow.quantity = (parseFloat(existingRow.quantity) || 0) + addQty
    updateRowTotal(existingRow)
    triggerRowFeedback(existingRow, true)

    // تصفير السطر الحالي ليبقى فارغاً وجاهزاً لقراءة الصنف التالي
    row.product_id = null
    row.product_id_display = ''
    row.product_name = ''
    row.available_units = []
    row.unit_id = ''
    row.unit_name = ''
    row.unit_price = 0
    row.quantity = 1
    row.subtotal = 0
    row.total_amount = 0
    updateRowTotal(row)

    activeDropdownIndex.value = null
    activeTargetInput.value = null
    searchResults.value = []
    dropdownItemRefs.value = []
    activeMultiplier.value = 1
    isDropdownManuallyNavigated.value = false

    focusModernCell(index, 'name', true)
    return
  }

  // 2. تسكين صنف جديد في السطر
  row.product_id = product.id
  row.product_id_display = `PRD-${product.id}`
  row.product_name = product.name || ''
  row.available_units = productUnits
  row.unit_id = defaultUnitRowId
  row.unit_name = defaultUnit?.unit_name || defaultUnit?.unit?.name || ''
  row.base_stock = resolveProductStock(product)
  row.is_price_overridden = false

  if (defaultUnitRowId) {
    row.unit_price = getCustomerPriceForUnit(productUnits, defaultUnitRowId)
  } else {
    row.unit_price = Number(defaultUnit?.price ?? product.price ?? 0) || 0
  }

  row.quantity = addQty
  updateRowTotal(row)
  triggerRowFeedback(row, false)

  activeDropdownIndex.value = null
  activeTargetInput.value = null
  searchResults.value = []
  dropdownItemRefs.value = []
  activeMultiplier.value = 1
  isDropdownManuallyNavigated.value = false

  // 3. توجيه المؤشر حسب نوع العملية
  if (isBarcode) {
    const nextEmptyIndex = props.items.findIndex((r, idx) => idx > index && !r.product_id)
    if (nextEmptyIndex !== -1) {
      focusModernCell(nextEmptyIndex, 'name', true)
    } else {
      await handleAddNewLineWithFocus()
    }
  } else {
    focusModernCell(index, 'qty', true)
  }
}

const onModernUnitSelectChange = (row) => {
  const matchedUnit = row.available_units?.find(
    (u) => u.id === row.unit_id || u.unit_id === row.unit_id,
  )
  row.unit_name = matchedUnit?.unit_name || matchedUnit?.unit?.name || ''
  syncUnitSalePrice(row)
}

const handleModernNameKeydown = async (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  const isDropdownOpen = activeDropdownIndex.value === index && searchResults.value.length > 0

  if (isDropdownOpen) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      isDropdownManuallyNavigated.value = true
      highlightedProductIndex.value =
        (highlightedProductIndex.value + 1) % searchResults.value.length
      scrollHighlightedDropdownItemIntoView()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      isDropdownManuallyNavigated.value = true
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
        const isBarcode = Boolean(selected.matched_barcode && !isDropdownManuallyNavigated.value)
        await onSelectModernProduct(row, selected, index, activeMultiplier.value, isBarcode)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      activeDropdownIndex.value = null
      searchResults.value = []
      isDropdownManuallyNavigated.value = false
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
      focusModernCell(index, 'qty', true)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeDropdownIndex.value = null
    if (index < props.items.length - 1) {
      focusModernCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      activeDropdownIndex.value = null
      if (!row.product_name || row.product_name.trim() === '') {
        const prevRow = props.items[index - 1]
        focusModernCell(index - 1, prevRow?.product_id ? 'qty' : 'name', true)
      } else {
        focusModernCell(index - 1, 'name', true)
      }
    }
    return
  }

  if (event.key === 'ArrowLeft') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtEnd(el) || !row.product_name) {
      event.preventDefault()
      activeDropdownIndex.value = null
      navigateModernHorizontal(index, 'name', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    const el = event.target
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      if (index > 0) {
        event.preventDefault()
        activeDropdownIndex.value = null
        navigateModernHorizontal(index, 'name', -1)
      }
    }
  }
}

const handleModernUnitKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigateModernHorizontal(index, 'unit', 1)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateModernHorizontal(index, 'unit', -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    focusModernCell(index, 'qty', true)
  }
}

const handleModernQtyKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    focusModernCell(index, 'price', true)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      const nextRow = props.items[index + 1]
      focusModernCell(index + 1, nextRow?.product_id ? 'qty' : 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      const prevRow = props.items[index - 1]
      focusModernCell(index - 1, prevRow?.product_id ? 'qty' : 'name', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      event.preventDefault()
      navigateModernHorizontal(index, 'qty', 1)
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateModernHorizontal(index, 'qty', -1)
    }
  }
}

const handleModernPriceKeydown = (event, row, index) => {
  if (checkModernShortcuts(event, index)) return

  if (event.key === 'Enter') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      focusModernCell(index + 1, 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (index < props.items.length - 1) {
      const nextRow = props.items[index + 1]
      focusModernCell(index + 1, nextRow?.product_id ? 'price' : 'name', true)
    } else {
      handleAddNewLineWithFocus()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    if (index > 0) {
      event.preventDefault()
      const prevRow = props.items[index - 1]
      focusModernCell(index - 1, prevRow?.product_id ? 'price' : 'name', true)
    }
    return
  }

  const el = event.target
  if (event.key === 'ArrowLeft') {
    if (isTextFullySelected(el) || isCursorAtEnd(el)) {
      if (index < props.items.length - 1) {
        event.preventDefault()
        focusModernCell(index + 1, 'name', true)
      } else {
        event.preventDefault()
        handleAddNewLineWithFocus()
      }
    }
    return
  }

  if (event.key === 'ArrowRight') {
    if (isTextFullySelected(el) || isCursorAtStart(el)) {
      event.preventDefault()
      navigateModernHorizontal(index, 'price', -1)
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

  if (props.items.length === 0) {
    props.triggerAddNewEmptyLine()
  }
  nextTick(() => {
    focusModernCell(0, 'name', true)
  })
})

onBeforeUnmount(() => {
  clearTimeout(remoteSearchTimer)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<template>
  <div ref="tableWrapperRef" class="p-0 bg-transparent space-y-2.5 font-sans" dir="rtl">
    <!-- رسائل التحقق العامة للأصناف -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-danger/10 text-danger border border-danger/30 rounded-lg text-xs font-bold shadow-sm"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- منصة جدول الأصناف المجسّمة (3D Elevated Stage) -->
    <div
      class="invoice-stage-3d rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200"
    >
      <!-- مساحة الجدول بارتفاع متوازن يبرز الأصناف دون فراغ زائد -->
      <div class="overflow-x-auto min-h-[195px] flex flex-col justify-between">
        <table class="w-full border-collapse text-right text-xs">
          <thead class="invoice-thead-3d select-none h-11 tracking-tight">
            <tr>
              <th class="px-3 py-2.5 w-16 text-center text-slate-400 dark:text-slate-600 font-mono">
                #
              </th>
              <th
                class="px-3 py-2.5 min-w-[290px] text-right font-black text-white dark:text-slate-900 text-[13px]"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  بيان الصنف أو مسح الباركود
                </span>
              </th>
              <th
                class="px-3 py-2.5 min-w-[130px] w-36 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                وحدة البيع
              </th>
              <th
                class="px-3 py-2.5 min-w-[110px] w-32 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                الكمية المباعة
              </th>
              <th
                class="px-3 py-2.5 min-w-[130px] w-36 text-center font-bold text-slate-200 dark:text-slate-800"
              >
                سعر الوحدة
              </th>
              <th
                class="px-3 py-2.5 min-w-[130px] w-36 text-center font-black text-primary-light dark:text-primary-dark text-[13px]"
              >
                الإجمالي
              </th>
              <th
                class="px-3 py-2.5 min-w-[100px] w-28 text-center font-bold text-slate-300 dark:text-slate-700"
              >
                المخزون
              </th>
              <th class="px-3 py-2.5 w-14 text-center font-bold text-slate-400 dark:text-slate-600">
                إجراء
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/70">
            <tr
              v-for="(row, index) in items"
              :key="index"
              class="invoice-row-3d animate-row-enter h-13"
              :class="[
                row.product_id ? 'invoice-row-filled' : 'invoice-row-empty',
                { 'animate-flash-merge': row._flashing },
              ]"
            >
              <!-- 1. تسلسل السطر وشارة الكود -->
              <td class="px-3 py-2 text-center font-mono align-middle">
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
                    مسح
                  </span>
                </div>
              </td>

              <!-- 2. بيان الصنف والبحث والباركود المباشر -->
              <td class="px-3 py-2 align-middle">
                <div class="relative w-full h-10 flex items-center">
                  <input
                    :ref="(el) => setCellRef(el, index, 'name')"
                    type="text"
                    v-model="row.product_name"
                    @focus="onNameInputFocus(index, $event)"
                    @input="onItemNameInput(row, index, $event)"
                    @blur="closeSearchDropdownDelayed"
                    @keydown="handleModernNameKeydown($event, row, index)"
                    placeholder="امسح الباركود أو اكتب اسم الصنف..."
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
                  class="text-danger text-[10px] font-bold mt-1 pr-1"
                >
                  {{ getValidationError(`items.${index}.product_id`) }}
                </p>
              </td>

              <!-- 3. وحدة البيع -->
              <td class="px-3 py-2 text-center align-middle">
                <template v-if="row.product_id">
                  <div class="relative inline-flex items-center justify-center h-9 max-w-full">
                    <select
                      :ref="(el) => setCellRef(el, index, 'unit')"
                      v-model="row.unit_id"
                      @focus="handleFieldFocus($event)"
                      @change="onModernUnitSelectChange(row)"
                      @keydown="handleModernUnitKeydown($event, row, index)"
                      :disabled="!row.available_units || row.available_units.length === 0"
                      class="invoice-pill-editable h-9 min-w-[92px] max-w-[136px] pr-3 pl-6 border rounded-xl text-text-secondary text-xs font-bold outline-none appearance-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-all"
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
                        {{ u.unit_name || u.unit?.name || 'وحدة' }}
                      </option>
                    </select>
                    <span
                      class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                    >
                      ▼
                    </span>
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.unit_id`)"
                    class="text-danger text-[10px] font-bold mt-1"
                  >
                    {{ getValidationError(`items.${index}.unit_id`) }}
                  </p>
                </template>
                <span v-else class="text-text-muted/35 font-mono select-none">—</span>
              </td>

              <!-- 4. الكمية المباعة -->
              <td class="px-3 py-2 align-middle">
                <template v-if="row.product_id">
                  <div class="h-9 flex items-center justify-center">
                    <input
                      :ref="(el) => setCellRef(el, index, 'qty')"
                      type="text"
                      inputmode="decimal"
                      :value="getQtyDisplayValue(row, index)"
                      @focus="onQtyFocus(index, $event)"
                      @blur="onQtyBlur(row, index, $event)"
                      @input="onQuantityChange(row, $event)"
                      @keydown="handleModernQtyKeydown($event, row, index)"
                      placeholder="0"
                      :class="[
                        'invoice-pill-editable w-full h-9 px-2 text-center font-mono font-black text-sm border rounded-xl text-text-primary outline-none transition-all',
                        { 'animate-qty-pop !border-primary !text-primary': row._popping },
                      ]"
                    />
                  </div>

                  <p
                    v-if="getValidationError(`items.${index}.quantity`)"
                    class="text-danger text-[10px] font-bold mt-1 text-center"
                  >
                    {{ getValidationError(`items.${index}.quantity`) }}
                  </p>
                </template>
                <div
                  v-else
                  class="h-9 flex items-center justify-center text-text-muted/35 font-mono select-none"
                >
                  —
                </div>
              </td>

              <!-- 5. سعر الوحدة -->
              <td class="px-3 py-2 align-middle">
                <template v-if="row.product_id">
                  <div class="h-9 flex flex-col items-center justify-center">
                    <input
                      :ref="(el) => setCellRef(el, index, 'price')"
                      type="text"
                      inputmode="decimal"
                      :value="getPriceDisplayValue(row, index)"
                      @focus="onPriceFocus(index, $event)"
                      @blur="onPriceBlur(row, index, $event)"
                      @input="onPriceChange(row, $event)"
                      @keydown="handleModernPriceKeydown($event, row, index)"
                      placeholder="0"
                      :class="[
                        'w-full h-9 px-2 text-center font-mono font-bold text-xs rounded-xl outline-none transition-all',
                        isPriceBelowMin(row)
                          ? 'bg-danger/10 text-danger border border-danger/50 focus:border-danger shadow-sm'
                          : 'invoice-pill-editable border text-text-primary',
                      ]"
                    />
                    <span
                      v-if="isPriceBelowMin(row)"
                      class="text-[9px] text-danger font-bold mt-0.5 whitespace-nowrap animate-pulse"
                    >
                      الأدنى: {{ formatSmartNumber(getMinAllowedPrice(row)) }}
                    </span>
                  </div>
                  <p
                    v-if="getValidationError(`items.${index}.unit_price`)"
                    class="text-danger text-[10px] font-bold mt-1 text-center"
                  >
                    {{ getValidationError(`items.${index}.unit_price`) }}
                  </p>
                </template>
                <div
                  v-else
                  class="h-9 flex items-center justify-center text-text-muted/35 font-mono select-none"
                >
                  —
                </div>
              </td>

              <!-- 6. الإجمالي -->
              <td class="px-3 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <div
                    v-if="row.product_id"
                    :class="[
                      'inline-flex items-center justify-center min-w-[92px] h-9 px-3 rounded-xl border transition-all',
                      Number(row.total_amount) > 0
                        ? 'bg-primary/12 border-primary/35 text-primary shadow-2xs'
                        : 'bg-surface-ground/80 border-surface-border/60 text-text-secondary',
                      { 'animate-qty-pop !bg-primary/20': row._popping },
                    ]"
                  >
                    <span class="font-mono font-black text-sm">
                      {{ formatSmartNumber(row.total_amount) }}
                    </span>
                  </div>
                  <span v-else class="text-text-muted/35 font-mono">—</span>
                </div>
              </td>

              <!-- 7. المخزون المتاح -->
              <td class="px-3 py-2 text-center align-middle select-none">
                <div class="h-9 flex items-center justify-center">
                  <span
                    v-if="row.product_id"
                    class="font-mono font-bold text-xs px-2.5 py-1 rounded-lg text-text-secondary bg-surface-ground/80"
                  >
                    {{ formatSmartNumber(getRowAvailableStock(row)) }}
                  </span>
                  <span v-else class="text-text-muted/35 font-mono">—</span>
                </div>
              </td>

              <!-- 8. زر الحذف -->
              <td class="px-3 py-2 text-center align-middle">
                <div class="h-9 flex items-center justify-center">
                  <button
                    type="button"
                    tabindex="-1"
                    @click="handleRemoveRowWithFocus(index)"
                    class="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                    title="حذف هذا السطر (Alt + Delete)"
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

            <!-- الحالة الافتراضية إذا فرغ الجدول -->
            <tr v-if="items.length === 0">
              <td colspan="8" class="py-10 text-center text-text-muted font-medium text-xs">
                لا توجد أصناف مضافة حالياً. انقر على الزر أدناه لإضافة سطر صنف جديد.
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
          <span>إضافة سطر صنف جديد (Ctrl + Enter)</span>
        </button>

        <div class="flex items-center gap-3 text-xs text-text-secondary">
          <span class="hidden sm:inline text-[11px] text-text-muted">
            تلميح: استخدم
            <kbd
              class="px-1.5 py-0.5 bg-surface-card border border-surface-border rounded text-[10px] font-mono"
              >2*</kbd
            >
            قبل الباركود لمضاعفة الكمية تلقائياً
          </span>
          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono shadow-2xs"
          >
            الأصناف المدرجة:
            <strong class="text-primary font-black text-sm mr-1">{{
              items.filter((r) => r.product_id).length
            }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- قائمة المقترحات الطافية الذكية عبر Teleport -->
    <Teleport to="body">
      <div
        v-if="
          activeDropdownIndex !== null && items[activeDropdownIndex] && searchResults.length > 0
        "
        :style="dropdownStyle"
        class="fixed bg-surface-section border border-surface-border rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto divide-y divide-surface-border/60 text-right font-sans transition-all"
        dir="rtl"
      >
        <div
          v-for="(product, pIndex) in searchResults"
          :key="product.id"
          :ref="(el) => setDropdownItemRef(el, pIndex)"
          @mousedown.prevent="
            onSelectModernProduct(
              items[activeDropdownIndex],
              product,
              activeDropdownIndex,
              activeMultiplier,
              false,
            )
          "
          @mouseenter="onDropdownItemHover(pIndex)"
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
              <span
                v-if="activeMultiplier > 1"
                class="text-[9px] bg-warning/15 text-warning px-1.5 py-0.5 rounded font-mono font-black border border-warning/30"
              >
                × {{ activeMultiplier }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[10px] text-text-muted font-mono">
              <span>كود: PRD-{{ product.id }}</span>
              <span
                v-if="product.units?.[0]?.unit_name || product.units?.[0]?.unit?.name"
                class="font-sans text-text-secondary"
              >
                الوحدة:
                {{ product.units[0].unit_name || product.units[0].unit?.name }}
              </span>
              <span class="font-sans font-bold text-info">
                الرصيد: {{ formatSmartNumber(resolveProductStock(product)) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 pl-1">
            <span
              v-if="product.units?.[0]?.price || product.price"
              class="text-xs font-mono font-bold text-success whitespace-nowrap"
            >
              {{ formatSmartNumber(product.units?.[0]?.price ?? product.price) }}
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
      </div>
    </Teleport>
  </div>
</template>
