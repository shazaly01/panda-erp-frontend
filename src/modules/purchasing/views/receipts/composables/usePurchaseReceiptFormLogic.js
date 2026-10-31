// src/modules/purchasing/views/receipts/composables/usePurchaseReceiptFormLogic.js
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseReceiptStore } from '@/modules/purchasing/stores/purchaseReceiptStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function usePurchaseReceiptFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const receiptStore = usePurchaseReceiptStore()
  const productStore = useProductStore()
  const departmentStore = useDepartmentStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => Boolean(route.params.id))
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)
  const activeReceiptId = ref(null)

  // ربط مباشر مع القائمة المسطحة الهرمية للأقسام
  const departmentsList = computed(() => departmentStore.flatDepartments)

  // =========================================================
  // 1. نموذج بيانات رأس سند الاستلام المخزني
  // =========================================================
  const form = ref({
    receipt_number: '',
    supplier_id: '',
    warehouse_id: '',
    department_id: '',
    purchase_order_id: null,
    receipt_date: new Date().toISOString().substring(0, 10),
    supplier_delivery_note: '',
    waybill_number: '',
    status: 'draft',
    notes: '',
  })

  const items = ref([])

  // =========================================================
  // 2. الذكاء التكيفي لحالة السند والشارات التوضيحية
  // =========================================================
  const isOrderLinked = computed(() => Boolean(form.value.purchase_order_id))

  const routeBadgeText = computed(() => {
    if (isOrderLinked.value) {
      return `مرتبط بأمر شراء رقم #${form.value.purchase_order_id} (مطابقة تلقائية للكميات)`
    }
    return 'استلام مباشر حر - سيتم إثبات الكميات الواردة في رصيد المخزن مباشرة'
  })

  const routeBadgeClass = computed(() => {
    if (isOrderLinked.value) {
      return 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
    }
    return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
  })

  // =========================================================
  // 3. سكيما تفاصيل البنود اللوجستية (مع عمود الكمية الحالية)
  // =========================================================
  const detailSchema = computed(() => [
    {
      key: 'product_id',
      extractFromItem: (item) => item.product_id || item.id,
    },
    {
      key: 'available_units',
      defaultValue: [],
      extractFromItem: (item) => item.available_units || item.units || [],
    },
    {
      key: 'purchase_order_item_id',
      defaultValue: null,
      extractFromItem: (item) => item.purchase_order_item_id || null,
    },
    {
      key: 'product_id_display',
      label: 'كود الصنف',
      widthClass: 'w-[10%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.product_id ? `PRD-${item.product_id}` : ''),
    },
    {
      key: 'product_name',
      label: 'الصنف التجاري',
      widthClass: 'w-[22%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.product_name || item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'الوحدة',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[11%]',
      type: 'text',
      extractFromItem: (item) => item.product_unit_id || item.units?.[0]?.id || '',
    },
    {
      key: 'current_quantity',
      label: 'الكمية الحالية',
      type: 'number',
      readonly: true,
      defaultValue: null,
      widthClass: 'w-[10%]',
      slot: 'cell-current_quantity',
      extractFromItem: (item) => toNumberOrNull(item.current_quantity),
    },
    {
      key: 'quantity_received',
      label: 'الكمية المستلمة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[11%]',
      slot: 'cell-quantity_received',
      extractFromItem: (item) => parseFloat(item.quantity_received ?? 1),
    },
    {
      key: 'quantity_accepted',
      label: 'الكمية المقبولة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[11%]',
      slot: 'cell-quantity_accepted',
      extractFromItem: (item) => parseFloat(item.quantity_accepted ?? item.quantity_received ?? 1),
    },
    {
      key: 'quantity_rejected',
      label: 'المرفوض',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[9%]',
      slot: 'cell-quantity_rejected',
      extractFromItem: (item) => parseFloat(item.quantity_rejected ?? 0),
    },
    {
      key: 'unit_cost',
      label: 'تكلفة الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[10%]',
      slot: 'cell-unit_cost',
      extractFromItem: (item) => parseFloat(item.unit_cost ?? 0),
    },
    {
      key: 'total_cost',
      label: 'إجمالي التكلفة',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[11%]',
      formula: (row) => {
        const acceptedQty = parseFloat(row.quantity_accepted) || 0
        const cost = parseFloat(row.unit_cost) || 0
        return parseFloat((acceptedQty * cost).toFixed(4))
      },
      slot: 'cell-total_cost',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // =========================================================
  // 4. إدارة سطور البنود وإدخال الأصناف
  // =========================================================
  const createEmptyRow = () => {
    return {
      id: undefined,
      product_id_display: '',
      product_name: '',
      product_id: null,
      product_unit_id: null,
      unit_name: '',
      purchase_order_item_id: null,
      location_id: null,
      batch_id: null,
      ...emptyInventoryQuantities(),
      quantity_received: 1,
      quantity_accepted: 1,
      quantity_rejected: 0,
      unit_cost: 0,
      total_cost: 0,
      rejection_reason: '',
      notes: '',
      available_units: [],
      tracking_type: null,
      serials: [],
    }
  }

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const removeRow = (index) => {
    if (items.value.length === 1) {
      items.value[0] = createEmptyRow()
      return
    }
    items.value.splice(index, 1)
  }

  const toNumberOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
  }

  const warehouseKey = (value) => {
    const number = toNumberOrNull(value)
    return Number.isInteger(number) && number > 0 ? number : null
  }

  const emptyInventoryQuantities = () => ({
    current_quantity: null,
    quantity_warehouse_id: null,
    gas_stock_kg: null,
    gas_reserved_kg: null,
    gas_available_kg: null,
    cylinders_count: null,
    cylinders_by_status: null,
    inventory_quantities_loading: false,
  })

  const clearRowInventory = (row, loading = false) => {
    Object.assign(row, emptyInventoryQuantities())
    row.inventory_quantities_loading = loading
  }

  const hasCurrentWarehouseScope = (product) => {
    const selectedWarehouse = warehouseKey(form.value.warehouse_id)
    return (
      selectedWarehouse !== null &&
      warehouseKey(product?.quantity_warehouse_id) === selectedWarehouse
    )
  }

  const applyInventoryQuantities = (row, product) => {
    clearRowInventory(row)
    if (!product || !hasCurrentWarehouseScope(product)) return

    row.quantity_warehouse_id = warehouseKey(product.quantity_warehouse_id)
    if (row.tracking_type === 'by_weight_serial') {
      row.gas_stock_kg = toNumberOrNull(product.gas_stock_kg)
      row.gas_reserved_kg = toNumberOrNull(product.gas_reserved_kg)
      row.gas_available_kg = toNumberOrNull(product.gas_available_kg)
      const count = toNumberOrNull(product.cylinders_count)
      row.cylinders_count = Number.isInteger(count) && count >= 0 ? count : null
      row.cylinders_by_status = product.cylinders_by_status ?? null
      row.current_quantity = row.cylinders_count
    } else {
      row.current_quantity = toNumberOrNull(
        product.available_quantity ??
          product.current_stock ??
          product.stock ??
          product.quantity ??
          product.current_quantity,
      )
    }
  }

  let inventoryRefreshId = 0
  let lastRequestedWarehouse = undefined
  const refreshInventoryForWarehouse = async (warehouseId = form.value.warehouse_id) => {
    const requestId = ++inventoryRefreshId
    const selectedWarehouse = warehouseKey(warehouseId)
    lastRequestedWarehouse = selectedWarehouse
    items.value.forEach((row) =>
      clearRowInventory(row, Boolean(row.product_id && selectedWarehouse)),
    )
    productStore.clearProducts()
    if (selectedWarehouse === null) return null

    const loadedProducts = await productStore.fetchProducts({
      is_active: 1,
      store_id: selectedWarehouse,
      all: true,
    })

    if (
      requestId !== inventoryRefreshId ||
      warehouseKey(form.value.warehouse_id) !== selectedWarehouse
    ) {
      return null
    }

    if (!Array.isArray(loadedProducts)) {
      items.value.forEach((row) => {
        row.inventory_quantities_loading = false
      })
      return null
    }

    const productsById = new Map(loadedProducts.map((product) => [String(product.id), product]))
    items.value.forEach((row) => {
      const matchedProduct = productsById.get(String(row.product_id))
      if (matchedProduct) {
        if (!row.tracking_type) row.tracking_type = matchedProduct.tracking_type || null
        row.available_units =
          matchedProduct.units || matchedProduct.available_units || row.available_units
      }
      applyInventoryQuantities(row, matchedProduct)
    })
    return loadedProducts
  }

  const selectProductForRow = (row, selectedProduct, currentRowIndex = null) => {
    if (!selectedProduct) return false

    const existingIndex = items.value.findIndex(
      (it, idx) =>
        it.product_id === selectedProduct.id &&
        (currentRowIndex !== null ? idx !== currentRowIndex : it !== row),
    )

    if (existingIndex !== -1) {
      toast.warning(
        `الصنف "${selectedProduct.name}" مضاف مسبقاً في السطر رقم (${existingIndex + 1}).`,
      )
      return false
    }

    const matchedUnit = selectedProduct.unit || selectedProduct.units?.[0] || null
    const resolvedCost =
      matchedUnit?.cost_price !== undefined && matchedUnit?.cost_price !== null
        ? parseFloat(matchedUnit.cost_price)
        : parseFloat(selectedProduct.cost_price || 0)

    row.product_id = selectedProduct.id
    row.product_id_display = `PRD-${selectedProduct.id}`
    row.product_name = selectedProduct.name || ''
    row.product_unit_id = matchedUnit?.id || null
    row.unit_name = matchedUnit?.unit_name || matchedUnit?.name || ''
    row.available_units = selectedProduct.units || selectedProduct.available_units || []
    row.unit_cost = resolvedCost
    row.tracking_type = selectedProduct.tracking_type || null
    const inventoryProduct = hasCurrentWarehouseScope(selectedProduct)
      ? selectedProduct
      : productStore.products?.find(
          (product) =>
            String(product.id) === String(selectedProduct.id) && hasCurrentWarehouseScope(product),
        )
    applyInventoryQuantities(row, inventoryProduct)
    row.inventory_quantities_loading = !inventoryProduct && productStore.loading
    row.serials = []

    if (row.tracking_type === 'by_weight_serial') {
      row.quantity_received = 0
      row.quantity_accepted = 0
      row.quantity_rejected = 0
    } else {
      if (!row.quantity_received || row.quantity_received <= 0) {
        row.quantity_received = 1
      }
      row.quantity_accepted = row.quantity_received
      row.quantity_rejected = 0
    }

    row.total_cost = parseFloat((row.quantity_accepted * row.unit_cost).toFixed(4))

    return true
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    let targetRow = items.value[items.value.length - 1]
    if (!targetRow || targetRow.product_id) {
      targetRow = createEmptyRow()
      items.value.push(targetRow)
    }
    const targetIndex = items.value.indexOf(targetRow)
    selectProductForRow(targetRow, selectedItem, targetIndex)
  }

  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      row.unit_name = matchedUnit.unit_name || matchedUnit.name || ''
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.unit_cost = parseFloat(matchedUnit.cost_price) || 0
      }
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  const handleQuantityReceivedChange = (row, val) => {
    const received = Math.max(0, parseFloat(val) || 0)
    row.quantity_received = received
    const rejected = parseFloat(row.quantity_rejected) || 0

    if (rejected > received) {
      row.quantity_rejected = 0
      row.quantity_accepted = received
    } else {
      row.quantity_accepted = Math.max(0, received - rejected)
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  const handleQuantityAcceptedChange = (row, val) => {
    const accepted = Math.max(0, parseFloat(val) || 0)
    const received = parseFloat(row.quantity_received) || 0

    if (accepted > received) {
      row.quantity_received = accepted
      row.quantity_accepted = accepted
      row.quantity_rejected = 0
    } else {
      row.quantity_accepted = accepted
      row.quantity_rejected = Math.max(0, received - accepted)
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  const handleQuantityRejectedChange = (row, val) => {
    const rejected = Math.max(0, parseFloat(val) || 0)
    const received = parseFloat(row.quantity_received) || 0

    if (rejected > received) {
      row.quantity_received = rejected
      row.quantity_rejected = rejected
      row.quantity_accepted = 0
    } else {
      row.quantity_rejected = rejected
      row.quantity_accepted = Math.max(0, received - rejected)
    }
    row.total_cost = parseFloat(
      ((parseFloat(row.quantity_accepted) || 0) * (parseFloat(row.unit_cost) || 0)).toFixed(4),
    )
  }

  const incrementQuantity = (row, key = 'quantity_received') => {
    const current = parseFloat(row[key]) || 0
    const nextVal = current + 1
    if (key === 'quantity_received') {
      handleQuantityReceivedChange(row, nextVal)
    } else if (key === 'quantity_accepted') {
      handleQuantityAcceptedChange(row, nextVal)
    } else if (key === 'quantity_rejected') {
      handleQuantityRejectedChange(row, nextVal)
    } else {
      row[key] = nextVal
    }
  }

  const decrementQuantity = (row, key = 'quantity_received') => {
    const current = parseFloat(row[key]) || 0
    if (current > 1 || (key === 'quantity_rejected' && current > 0)) {
      const nextVal = current - 1
      if (key === 'quantity_received') {
        handleQuantityReceivedChange(row, nextVal)
      } else if (key === 'quantity_accepted') {
        handleQuantityAcceptedChange(row, nextVal)
      } else if (key === 'quantity_rejected') {
        handleQuantityRejectedChange(row, nextVal)
      } else {
        row[key] = nextVal
      }
    }
  }

  // =========================================================
  // 5. الإجماليات التشغيلية والكمية
  // =========================================================
  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const totalReceivedQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity_received) || 0), 0)
  })

  const totalAcceptedQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity_accepted) || 0), 0)
  })

  const totalRejectedQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity_rejected) || 0), 0)
  })

  const totalEstimatedCost = computed(() => {
    return items.value.reduce((sum, row) => {
      const acceptedQty = parseFloat(row.quantity_accepted) || 0
      const cost = parseFloat(row.unit_cost) || 0
      return sum + acceptedQty * cost
    }, 0)
  })

  // =========================================================
  // 6. مراقبة المستودع لتحديث قائمة الأصناف والأرصدة
  // =========================================================
  watch(
    () => form.value.warehouse_id,
    async (newWarehouseId) => {
      if (!isFormLoaded.value) return
      await refreshInventoryForWarehouse(newWarehouseId)
    },
    { immediate: false },
  )

  const getValidationError = (path) => {
    return receiptStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 7. تحميل البيانات المرجعية وبيانات التعديل
  // =========================================================
  const loadDepartments = async () => {
    if (departmentStore.flatDepartments.length === 0) {
      await departmentStore.fetchDepartments()
    }
  }

  onMounted(async () => {
    isFormLoaded.value = false
    try {
      const startupRequests = [loadDepartments()]

      if (isEdit.value) {
        activeReceiptId.value = route.params.id
        startupRequests.push(receiptStore.fetchReceipt(route.params.id))
      }

      await Promise.all(startupRequests)

      if (isEdit.value && receiptStore.currentReceipt) {
        const cur = receiptStore.currentReceipt

        form.value = {
          receipt_number: cur.receipt_number || '',
          supplier_id: cur.supplier_id || '',
          warehouse_id: cur.warehouse_id || '',
          department_id: cur.department_id || (cur.purchase_order?.department_id ?? ''),
          purchase_order_id: cur.purchase_order_id || null,
          receipt_date: cur.receipt_date
            ? cur.receipt_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
          supplier_delivery_note: cur.supplier_delivery_note || '',
          waybill_number: cur.waybill_number || '',
          status: cur.status?.value || cur.status || 'draft',
          notes: cur.notes || '',
        }

        items.value = (cur.items || []).map((it) => {
          const cost = parseFloat(it.unit_cost) || 0
          const acceptedQty = parseFloat(it.quantity_accepted) || 0

          const mappedSerials = Array.isArray(it.serials)
            ? it.serials.map((s) => ({
                id: s.id,
                serial_id: s.serial_id,
                serial_number: s.serial_number || s.serial?.serial_number || '',
                replaced_serial_id: s.replaced_serial_id || null,
                tare_weight:
                  s.tare_weight !== null && s.tare_weight !== undefined
                    ? parseFloat(s.tare_weight)
                    : s.serial?.tare_weight !== null && s.serial?.tare_weight !== undefined
                      ? parseFloat(s.serial.tare_weight)
                      : null,
                gross_weight:
                  s.gross_weight !== null && s.gross_weight !== undefined
                    ? parseFloat(s.gross_weight)
                    : null,
                net_weight:
                  s.net_weight !== null && s.net_weight !== undefined
                    ? parseFloat(s.net_weight)
                    : 0,
                notes: s.notes || '',
              }))
            : []

          return {
            ...createEmptyRow(),
            id: it.id,
            product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
            product_name: it.product?.name || it.product_name || '',
            product_id: it.product_id,
            product_unit_id: it.product_unit_id,
            unit_name: it.product_unit?.unit?.name || it.unit_name || '',
            purchase_order_item_id: it.purchase_order_item_id || null,
            location_id: it.location_id || null,
            batch_id: it.batch_id || null,
            current_quantity: null,
            quantity_received: toNumberOrNull(it.quantity_received) ?? 1,
            quantity_accepted: acceptedQty,
            quantity_rejected: parseFloat(it.quantity_rejected) || 0,
            unit_cost: cost,
            total_cost: parseFloat(it.total_cost) || parseFloat((acceptedQty * cost).toFixed(4)),
            rejection_reason: it.rejection_reason || '',
            notes: it.notes || '',
            available_units: it.product?.units || [],
            tracking_type: it.product?.tracking_type || null,
            serials: mappedSerials,
          }
        })

        await refreshInventoryForWarehouse(form.value.warehouse_id)
      } else {
        if (authStore.user) {
          form.value.warehouse_id = authStore.user.warehouse_id || authStore.user.store_id || ''
          if (authStore.user.department_id) {
            form.value.department_id = authStore.user.department_id
          }
        }
        items.value = [createEmptyRow()]
        await refreshInventoryForWarehouse(form.value.warehouse_id)
      }
    } catch (err) {
      console.error('فشل في تحميل بيانات سند الاستلام:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات السند.')
    } finally {
      isFormLoaded.value = true
      if (warehouseKey(form.value.warehouse_id) !== lastRequestedWarehouse) {
        await refreshInventoryForWarehouse(form.value.warehouse_id)
      }
    }
  })

  // =========================================================
  // 8. الحفظ والترحيل مع التحقق الصارم من الأرقام التسلسلية والأوزان
  // =========================================================
  const handleSubmit = async (receiveDirectly = false) => {
    if (!form.value.supplier_id) {
      toast.error('يجب اختيار المورد أولاً.')
      return
    }

    if (!form.value.warehouse_id) {
      toast.error('المستودع المستلم إلزامي لتحديد وجهة تخزين البضاعة.')
      return
    }

    // التحقق الميداني الصارم والتكيفي بحسب سياسة التتبع للصنف
    for (let i = 0; i < items.value.length; i++) {
      const row = items.value[i]
      if (!row.product_id) continue

      const isWeightSerial = row.tracking_type === 'by_weight_serial'
      const isStandardSerial = row.tracking_type === 'by_serial' || Boolean(row.is_serial_tracked)
      const acceptedQty = parseFloat(row.quantity_accepted) || 0

      // 1. الأصناف المتبعة بالسيريال العددي (1 قطعة = 1 سيريال)
      if (isStandardSerial && acceptedQty > 0) {
        const serialsCount = Array.isArray(row.serials) ? row.serials.length : 0
        const expectedCount = parseInt(acceptedQty, 10)

        if (serialsCount !== expectedCount) {
          toast.error(
            `الصنف "${row.product_name}" يتطلب استيفاء كامل الأرقام التسلسلية لكامل الكمية المقبولة (${expectedCount} قطعة). المستوفى حالياً: (${serialsCount}).`,
          )
          return
        }

        for (let sIdx = 0; sIdx < row.serials.length; sIdx++) {
          const s = row.serials[sIdx]
          if (!s.serial_number && !s.serial_id) {
            toast.error(`يرجى مسح أو إدخال الرقم التسلسلي لجميع وحدات الصنف "${row.product_name}".`)
            return
          }
        }
      }

      // 2. الأصناف المتبعة بالسيريال الوزني (أسطوانات غاز الكلور)
      if (isWeightSerial && acceptedQty > 0) {
        const serials = Array.isArray(row.serials) ? row.serials : []
        if (serials.length === 0) {
          toast.error(
            `الصنف "${row.product_name}" يتم تتبعه بالسيريال الوزني؛ يجب إرفاق أرقام الأسطوانات وقراءات الميزان.`,
          )
          return
        }

        let totalNetGasWeight = 0.0

        for (let sIdx = 0; sIdx < serials.length; sIdx++) {
          const s = serials[sIdx]
          const tare = parseFloat(s.tare_weight) || 0
          const gross = parseFloat(s.gross_weight) || 0

          if (!s.serial_number && !s.serial_id) {
            toast.error(
              `يرجى مسح أو كتابة الرقم التسلسلي لجميع أسطوانات الصنف "${row.product_name}".`,
            )
            return
          }

          if (tare <= 0) {
            toast.error(
              `الوزن الفارغ للأسطوانة (${s.serial_number || sIdx + 1}) غير مدخل أو غير صحيح.`,
            )
            return
          }

          if (gross <= 0) {
            toast.error(
              `الوزن الإجمالي بالميزان للأسطوانة (${s.serial_number || sIdx + 1}) غير مدخل أو غير صحيح.`,
            )
            return
          }

          if (gross <= tare) {
            toast.error(
              `الوزن الإجمالي للأسطوانة (${s.serial_number || sIdx + 1}) لا يمكن أن يكون أقل من أو مساوياً لوزنها الفارغ.`,
            )
            return
          }

          const net = Math.max(0, parseFloat((gross - tare).toFixed(4)))
          totalNetGasWeight += net
        }

        // مطابقة صافي وزن الغاز الإجمالي مع كمية السند بالكيلوجرام (بهامش سماحية 1.0 كجم لموازين المحطة)
        if (Math.abs(totalNetGasWeight - acceptedQty) > 1.0) {
          toast.error(
            `الكمية المقبولة في السند (${acceptedQty} كجم) يجب أن تطابق مجموع صافي أوزان غاز الأسطوانات على الميزان (${totalNetGasWeight.toFixed(2)} كجم) بهامش سماحية معقول.`,
          )
          return
        }
      }
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const qtyReceived = parseFloat(row.quantity_received) || 0
        const qtyAccepted = parseFloat(row.quantity_accepted) || 0
        const qtyRejected = parseFloat(row.quantity_rejected) || 0
        const cost = parseFloat(row.unit_cost) || 0

        const formattedSerials = Array.isArray(row.serials)
          ? row.serials.map((s) => ({
              serial_id: s.serial_id ? Number(s.serial_id) : null,
              serial_number: s.serial_number ? String(s.serial_number).trim() : null,
              replaced_serial_id: s.replaced_serial_id ? Number(s.replaced_serial_id) : null,
              tare_weight:
                s.tare_weight !== null && s.tare_weight !== undefined
                  ? parseFloat(s.tare_weight)
                  : null,
              gross_weight:
                s.gross_weight !== null && s.gross_weight !== undefined
                  ? parseFloat(s.gross_weight)
                  : null,
              net_weight:
                s.net_weight !== null && s.net_weight !== undefined
                  ? parseFloat(s.net_weight)
                  : null,
              notes: s.notes ? String(s.notes).trim() : null,
            }))
          : []

        return {
          id: row.id || undefined,
          purchase_order_item_id: row.purchase_order_item_id || null,
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
          location_id: row.location_id ? Number(row.location_id) : null,
          batch_id: row.batch_id ? Number(row.batch_id) : null,
          quantity_received: qtyReceived,
          quantity_accepted: qtyAccepted,
          quantity_rejected: qtyRejected,
          unit_cost: cost,
          rejection_reason: qtyRejected > 0 ? row.rejection_reason || null : null,
          notes: row.notes || null,
          serials: formattedSerials,
        }
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل سند الاستلام مع تحديد الوحدة والكمية.')
      return
    }

    const finalPayload = {
      supplier_id: Number(form.value.supplier_id),
      warehouse_id: Number(form.value.warehouse_id),
      department_id: form.value.department_id ? Number(form.value.department_id) : null,
      purchase_order_id: form.value.purchase_order_id ? Number(form.value.purchase_order_id) : null,
      receipt_date: form.value.receipt_date,
      supplier_delivery_note: form.value.supplier_delivery_note || null,
      waybill_number: form.value.waybill_number || null,
      notes: form.value.notes || null,
      items: dynamicItemsPayload,
    }

    isSubmitting.value = true

    try {
      if (isEdit.value) {
        await receiptStore.updateReceipt(route.params.id, finalPayload)
        toast.success('تم تحديث مسودة سند الاستلام بنجاح.')

        if (receiveDirectly) {
          await receiptStore.receiveReceipt(route.params.id)
          toast.success('تم تأكيد استلام البضاعة وإثبات حركة المخزون بنجاح.')
        }
      } else {
        const savedReceipt = await receiptStore.createReceipt(finalPayload)
        const receiptData = savedReceipt?.data || receiptStore.currentReceipt || {}
        const createdId = receiptData.id

        if (receiveDirectly && createdId) {
          await receiptStore.receiveReceipt(createdId)
          toast.success('تم إنشاء سند الاستلام وإثبات حركة المخزون فوراً بنجاح.')
        } else {
          toast.success('تم حفظ مسودة سند الاستلام بنجاح.')
        }
      }

      router.push('/app/purchasing/receipts')
    } catch {
      toast.error(receiptStore.error || 'فشلت عملية حفظ سند الاستلام المخزني.')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/receipts')
  }

  // =========================================================
  // 9. دوال التنسيق
  // =========================================================
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const num = Number(value)
    if (isNaN(num)) return ''
    const options = {
      style: 'decimal',
      maximumFractionDigits: 4,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    }
    return new Intl.NumberFormat('en-US', options).format(num)
  }

  const unformatNumber = (text) => {
    if (!text) return 0
    const cleaned = text.toString().replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  return {
    isFormLoaded,
    isSubmitting,
    isEdit,
    form,
    items,
    departmentsList,
    detailSchema,
    visibleTableSchema,
    isOrderLinked,
    routeBadgeText,
    routeBadgeClass,
    totalItemsCount,
    totalReceivedQuantity,
    totalAcceptedQuantity,
    totalRejectedQuantity,
    totalEstimatedCost,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    syncUnitDetails,
    handleQuantityReceivedChange,
    handleQuantityAcceptedChange,
    handleQuantityRejectedChange,
    incrementQuantity,
    decrementQuantity,
    createEmptyRow,
    removeRow,
    triggerAddNewEmptyLine,
    selectProductForRow,
    handleGlobalItemSelect,
    receiptStore,
    productStore,
    departmentStore,
    authStore,
  }
}
