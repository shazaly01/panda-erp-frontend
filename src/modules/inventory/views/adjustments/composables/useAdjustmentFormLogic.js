// src/modules/inventory/views/adjustments/composables/useAdjustmentFormLogic.js
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdjustmentStore } from '@/modules/inventory/stores/adjustmentStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function useAdjustmentFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const adjustmentStore = useAdjustmentStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)

  // تحديد النوع الافتراضي من بيانات المسار الوصفية (Route Meta)
  const routeDefaultType = computed(() => {
    return route.meta?.defaultType || route.query?.type || 'physical_count'
  })

  // نموذج بيانات رأس وثيقة التسوية الجردية
  const form = ref({
    adjustment_number: `ADJ-${Date.now().toString().slice(-6)}`,
    warehouse_id: '',
    adjustment_date: new Date().toISOString().substring(0, 10),
    type: routeDefaultType.value,
    status: 'draft',
    auto_approve: false,
    notes: '',
  })

  const items = ref([])

  // التسميات الديناميكية بحسب نوع العملية
  const quantityInputLabel = computed(() => {
    switch (form.value.type) {
      case 'damage':
        return 'الكمية التالفة'
      case 'loss':
        return 'الكمية المفقودة / العجز'
      case 'opening_balance':
        return 'الكمية الافتتاحية'
      default:
        return 'الجرد الفعلي'
    }
  })

  const totalCostColumnLabel = computed(() => {
    switch (form.value.type) {
      case 'damage':
        return 'إجمالي خسارة التالف'
      case 'loss':
        return 'إجمالي خسارة العجز'
      case 'opening_balance':
        return 'إجمالي القيمة الافتتاحية'
      default:
        return 'إجمالي الفرق'
    }
  })

  // سكيما تفاصيل بنود التسوية الجردية المتكيفة ديناميكياً (للتوافق المستمر)
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
      key: 'batch_id',
      defaultValue: null,
      extractFromItem: (item) => item.batch_id || null,
    },
    {
      key: 'product_id_display',
      label: 'رقم الصنف',
      widthClass: 'w-[10%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.product_id ? `PRD-${item.product_id}` : ''),
    },
    {
      key: 'product_name',
      label: 'اسم الصنف التجاري المعتمد',
      widthClass: form.value.type === 'opening_balance' ? 'w-[35%]' : 'w-[25%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.product_name || item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'وحدة القياس',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[13%]',
      type: 'text',
      extractFromItem: (item) => item.product_unit_id || item.units?.[0]?.id || '',
    },
    {
      key: 'current_quantity',
      label: 'الكمية الحالية',
      type: 'number',
      readonly: true,
      defaultValue: 0,
      widthClass: 'w-[11%]',
      slot: 'cell-current_quantity',
      hidden: form.value.type === 'opening_balance',
      extractFromItem: (item) => parseFloat(item.current_quantity ?? 0),
    },
    {
      key: 'actual_quantity',
      label: quantityInputLabel.value,
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[12%]',
      slot: 'cell-actual_quantity',
      extractFromItem: (item) => parseFloat(item.actual_quantity ?? 0),
    },
    {
      key: 'quantity_difference',
      label: 'فرق الكمية',
      type: 'calculated',
      readonly: true,
      widthClass: 'w-[10%]',
      hidden:
        form.value.type === 'opening_balance' ||
        form.value.type === 'damage' ||
        form.value.type === 'loss',
      formula: (row) => row.quantity_difference,
      slot: 'cell-quantity_difference',
    },
    {
      key: 'unit_cost',
      label: 'تكلفة الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[11%]',
      slot: 'cell-unit_cost',
      extractFromItem: (item) => parseFloat(item.unit_cost ?? 0),
    },
    {
      key: 'total_cost',
      label: totalCostColumnLabel.value,
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[14%]',
      formula: (row) => row.total_cost,
      slot: 'cell-total_cost',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // =========================================================
  // 1. إعادة الاحتساب المالي والكمي التلقائي للبند
  // =========================================================
  const recalculateLine = (row) => {
    const actual = parseFloat(row.actual_quantity) || 0
    const current = parseFloat(row.current_quantity) || 0
    const cost = parseFloat(row.unit_cost) || 0

    let diff = 0
    let lineTotal = 0

    if (form.value.type === 'damage' || form.value.type === 'loss') {
      diff = -1 * actual
      lineTotal = actual * cost
    } else if (form.value.type === 'opening_balance') {
      diff = actual
      lineTotal = actual * cost
    } else {
      diff = actual - current
      lineTotal = diff * cost
    }

    row.quantity_difference = parseFloat(diff.toFixed(4))
    row.total_cost = parseFloat(lineTotal.toFixed(4))
  }

  // =========================================================
  // 2. إدارة سطور البنود
  // =========================================================
  const createEmptyRow = () => {
    return {
      id: undefined,
      product_id_display: '',
      product_name: '',
      product_id: null,
      product_unit_id: null,
      unit_name: '',
      batch_id: null,
      current_quantity: 0,
      actual_quantity: 0,
      quantity_difference: 0,
      unit_cost: 0,
      total_cost: 0,
      available_units: [],
      notes: '',
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

  // اختيار صنف مع منع تكرار نفس الصنف في أكثر من سطر
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
        : parseFloat(selectedProduct.cost_price || selectedProduct.price || 0)

    // استخراج رصيد الصنف المتوفر بدقة مع دعم كافة أسماء الحقول المرتجعة من البحث أو المتجر
    const rawStock =
      selectedProduct.available_quantity !== undefined &&
      selectedProduct.available_quantity !== null
        ? selectedProduct.available_quantity
        : selectedProduct.current_stock !== undefined && selectedProduct.current_stock !== null
          ? selectedProduct.current_stock
          : selectedProduct.stock !== undefined && selectedProduct.stock !== null
            ? selectedProduct.stock
            : selectedProduct.quantity !== undefined && selectedProduct.quantity !== null
              ? selectedProduct.quantity
              : selectedProduct.current_quantity !== undefined &&
                  selectedProduct.current_quantity !== null
                ? selectedProduct.current_quantity
                : 0

    const resolvedStock = parseFloat(rawStock) || 0

    row.product_id = selectedProduct.id
    row.product_id_display = `PRD-${selectedProduct.id}`
    row.product_name = selectedProduct.name || ''
    row.product_unit_id = matchedUnit?.id || null
    row.unit_name = matchedUnit?.unit_name || matchedUnit?.name || ''
    row.available_units = selectedProduct.units || selectedProduct.available_units || []
    row.current_quantity = resolvedStock
    row.unit_cost = resolvedCost

    if (form.value.type === 'damage' || form.value.type === 'loss') {
      row.actual_quantity = 0
    } else if (form.value.type === 'opening_balance') {
      row.actual_quantity = row.actual_quantity || 1
    } else {
      row.actual_quantity = resolvedStock
    }

    recalculateLine(row)
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
    recalculateLine(row)
  }

  const incrementQuantity = (row) => {
    const current = parseFloat(row.actual_quantity) || 0
    row.actual_quantity = current + 1
    recalculateLine(row)
  }

  const decrementQuantity = (row) => {
    const current = parseFloat(row.actual_quantity) || 0
    if (current > 0) {
      row.actual_quantity = current - 1
      recalculateLine(row)
    }
  }

  // =========================================================
  // 3. مراقبة المستودع لتحديث قائمة الأصناف والأرصدة الدفترية
  // =========================================================
  watch(
    () => form.value.warehouse_id,
    async (newWarehouseId) => {
      if (!newWarehouseId) {
        productStore.products = []
        return
      }

      await productStore.fetchProducts({ is_active: 1, store_id: newWarehouseId, all: true })

      const activeProductIds = items.value.map((row) => row.product_id).filter(Boolean)

      if (activeProductIds.length > 0 && typeof productStore.refreshItemsStock === 'function') {
        try {
          const stockMap = await productStore.refreshItemsStock({
            store_id: newWarehouseId,
            item_ids: activeProductIds,
          })

          items.value.forEach((row) => {
            if (row.product_id && stockMap[row.product_id] !== undefined) {
              row.current_quantity = parseFloat(stockMap[row.product_id]) || 0
              recalculateLine(row)
            }
          })
        } catch (err) {
          console.error('فشل في مزامنة الرصيد الدفتري مع المستودع الجديد:', err)
        }
      }
    },
  )

  // =========================================================
  // 4. الإجماليات الحسابية
  // =========================================================
  const totalDifferenceCost = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.total_cost) || 0), 0)
  })

  const totalSurplusCost = computed(() => {
    if (form.value.type === 'damage' || form.value.type === 'loss') return 0
    if (form.value.type === 'opening_balance') return totalDifferenceCost.value

    return items.value.reduce((sum, row) => {
      const val = parseFloat(row.total_cost) || 0
      return val > 0 ? sum + val : sum
    }, 0)
  })

  const totalDeficitCost = computed(() => {
    if (form.value.type === 'damage' || form.value.type === 'loss') return totalDifferenceCost.value
    if (form.value.type === 'opening_balance') return 0

    return items.value.reduce((sum, row) => {
      const val = parseFloat(row.total_cost) || 0
      return val < 0 ? sum + Math.abs(val) : sum
    }, 0)
  })

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const getValidationError = (path) => {
    return adjustmentStore.validationErrors?.[path]?.[0] || null
  }

  // مسار العودة الذكي بناءً على نوع العملية
  const getRedirectRoute = () => {
    switch (form.value.type) {
      case 'damage':
        return '/app/inventory/adjustments/damage'
      case 'loss':
        return '/app/inventory/adjustments/loss'
      case 'opening_balance':
        return '/app/inventory/adjustments/opening-balance'
      case 'physical_count':
        return '/app/inventory/adjustments/physical-count'
      case 'general_adjustment':
        return '/app/inventory/adjustments/general'
      default:
        return '/app/inventory/adjustments'
    }
  }

  // =========================================================
  // 5. تحميل البيانات عند الفتح
  // =========================================================
  onMounted(async () => {
    isFormLoaded.value = false
    try {
      if (isEdit.value) {
        await adjustmentStore.fetchAdjustment(route.params.id)
        if (adjustmentStore.currentAdjustment) {
          const cur = adjustmentStore.currentAdjustment

          form.value = {
            adjustment_number: cur.adjustment_number,
            warehouse_id: cur.warehouse_id || '',
            adjustment_date: cur.adjustment_date
              ? cur.adjustment_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            type: cur.type || routeDefaultType.value,
            status: cur.status || 'draft',
            auto_approve: false,
            notes: cur.notes || '',
          }

          items.value = (cur.items || []).map((it) => {
            const actual = parseFloat(it.actual_quantity) || 0
            const current = parseFloat(it.current_quantity) || 0
            const cost = parseFloat(it.unit_cost) || 0
            let diff = parseFloat(it.quantity_difference) || 0
            let total = parseFloat(it.total_cost) || 0

            if (it.quantity_difference === undefined || it.total_cost === undefined) {
              if (cur.type === 'damage' || cur.type === 'loss') {
                diff = -1 * actual
                total = actual * cost
              } else if (cur.type === 'opening_balance') {
                diff = actual
                total = actual * cost
              } else {
                diff = actual - current
                total = diff * cost
              }
            }

            return {
              id: it.id,
              product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
              product_name: it.product?.name || it.product_name || '',
              product_id: it.product_id,
              product_unit_id: it.product_unit_id,
              unit_name: it.product_unit?.unit?.name || it.unit_name || '',
              batch_id: it.batch_id || null,
              current_quantity: current,
              actual_quantity: actual,
              quantity_difference: diff,
              unit_cost: cost,
              total_cost: total,
              available_units: it.product?.units || it.available_units || [],
              notes: it.notes || '',
            }
          })

          if (cur.warehouse_id) {
            await productStore.fetchProducts({
              is_active: 1,
              store_id: cur.warehouse_id,
              all: true,
            })

            items.value.forEach((row) => {
              const matchedStoreItem = productStore.products?.find((p) => p.id === row.product_id)
              if (matchedStoreItem) {
                row.available_units = matchedStoreItem.units || []
              }
            })
          }
        }
      } else {
        if (authStore.user) {
          form.value.warehouse_id = authStore.user.warehouse_id || authStore.user.store_id || ''
        }
        if (form.value.warehouse_id) {
          await productStore.fetchProducts({
            is_active: 1,
            store_id: form.value.warehouse_id,
            all: true,
          })
        }
        items.value = [createEmptyRow()]
      }
    } catch (err) {
      console.error('فشل في تحميل بيانات وثيقة التسوية:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات وثيقة التسوية.')
    } finally {
      isFormLoaded.value = true
    }
  })

  // =========================================================
  // 6. تجهيز وحفظ البيانات
  // =========================================================
  const handleSubmit = async (approveDirectly = false) => {
    if (!form.value.warehouse_id) {
      toast.error('يجب اختيار المستودع أولاً.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const actual = parseFloat(row.actual_quantity) || 0
        const current = parseFloat(row.current_quantity) || 0
        let diff = actual - current

        if (form.value.type === 'damage' || form.value.type === 'loss') {
          diff = -1 * actual
        } else if (form.value.type === 'opening_balance') {
          diff = actual
        }

        return {
          id: row.id || undefined,
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
          batch_id: row.batch_id ? Number(row.batch_id) : null,
          current_quantity: current,
          actual_quantity: actual,
          quantity_difference: diff,
          unit_cost: parseFloat(row.unit_cost) || 0,
          notes: row.notes || null,
        }
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل وثيقة التسوية.')
      return
    }

    const finalPayload = {
      ...form.value,
      status: approveDirectly ? 'approved' : form.value.status,
      auto_approve: approveDirectly,
      items: dynamicItemsPayload,
    }

    isSubmitting.value = true

    try {
      if (isEdit.value) {
        await adjustmentStore.updateAdjustment(route.params.id, finalPayload)
        toast.success('تم تحديث وثيقة التسوية الجردية بنجاح.')
      } else {
        await adjustmentStore.createAdjustment(finalPayload)
        toast.success(
          approveDirectly
            ? 'تم حفظ واعتماد وثيقة التسوية وتطبيق الأثر المخزني والمالي بنجاح.'
            : 'تم حفظ مسودة وثيقة التسوية الجردية بنجاح.',
        )
      }
      router.push(getRedirectRoute())
    } catch {
      toast.error('فشلت عملية حفظ وثيقة التسوية، يرجى مراجعة الحقول المطلوبة والأخطاء.')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    router.push(getRedirectRoute())
  }

  // =========================================================
  // 7. دوال التنسيق
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
    detailSchema,
    visibleTableSchema,
    quantityInputLabel,
    totalCostColumnLabel,
    totalDifferenceCost,
    totalSurplusCost,
    totalDeficitCost,
    totalItemsCount,
    getValidationError,
    handleSubmit,
    handleCancel,
    formatNumber,
    unformatNumber,
    syncUnitDetails,
    recalculateLine,
    incrementQuantity,
    decrementQuantity,
    createEmptyRow,
    removeRow,
    triggerAddNewEmptyLine,
    selectProductForRow,
    handleGlobalItemSelect,
    adjustmentStore,
    productStore,
  }
}
