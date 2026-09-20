// src/modules/inventory/views/transfers/composables/useTransferFormLogic.js
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTransferStore } from '@/modules/inventory/stores/transferStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function useTransferFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const transferStore = useTransferStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)

  // نموذج بيانات رأس وثيقة التحويل
  const form = ref({
    transfer_number: `TR-${Date.now().toString().slice(-6)}`,
    from_warehouse_id: '',
    to_warehouse_id: '',
    transfer_date: new Date().toISOString().substring(0, 10),
    status: 'draft',
    notes: '',
  })

  const items = ref([])

  // =========================================================
  // 1. سكيما تفاصيل بنود أمر التحويل المخزني (للتوافق المستمر)
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
      widthClass: 'w-[28%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.product_name || item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'وحدة القياس',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[14%]',
      type: 'text',
      extractFromItem: (item) => item.product_unit_id || item.units?.[0]?.id || '',
    },
    {
      key: 'current_quantity',
      label: 'الرصيد المتاح بالمصدر',
      type: 'number',
      readonly: true,
      defaultValue: 0,
      widthClass: 'w-[12%]',
      slot: 'cell-current_quantity',
      extractFromItem: (item) => parseFloat(item.current_quantity ?? item.current_stock ?? 0),
    },
    {
      key: 'quantity',
      label: 'الكمية المحولة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[12%]',
      slot: 'cell-quantity',
      extractFromItem: (item) => parseFloat(item.quantity ?? 1),
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
      label: 'إجمالي القيمة',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[13%]',
      formula: (row) => row.total_cost,
      slot: 'cell-total_cost',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // =========================================================
  // 2. إدارة السطور والعمليات الحسابية للبند
  // =========================================================
  const recalculateLine = (row) => {
    const qty = parseFloat(row.quantity) || 0
    const cost = parseFloat(row.unit_cost) || 0
    row.total_cost = parseFloat((qty * cost).toFixed(4))
  }

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
      quantity: 1,
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

    const resolvedStock =
      selectedProduct.current_stock !== undefined
        ? parseFloat(selectedProduct.current_stock)
        : selectedProduct.stock !== undefined
          ? parseFloat(selectedProduct.stock)
          : 0

    row.product_id = selectedProduct.id
    row.product_id_display = `PRD-${selectedProduct.id}`
    row.product_name = selectedProduct.name || ''
    row.product_unit_id = matchedUnit?.id || null
    row.unit_name = matchedUnit?.unit_name || matchedUnit?.name || ''
    row.available_units = selectedProduct.units || selectedProduct.available_units || []
    row.current_quantity = resolvedStock
    row.unit_cost = resolvedCost

    if (!row.quantity || row.quantity <= 0) {
      row.quantity = 1
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
    const current = parseFloat(row.quantity) || 0
    row.quantity = current + 1
    recalculateLine(row)
  }

  const decrementQuantity = (row) => {
    const current = parseFloat(row.quantity) || 0
    if (current > 1) {
      row.quantity = current - 1
      recalculateLine(row)
    }
  }

  // =========================================================
  // 3. مراقبة المستودع المصدر لتحديث الأصناف والأرصدة
  // =========================================================
  watch(
    () => form.value.from_warehouse_id,
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
            }
          })
        } catch (err) {
          console.error('فشل في مزامنة الرصيد المتاح مع المستودع المصدر:', err)
        }
      }
    },
  )

  // =========================================================
  // 4. العمليات الحسابية والإجماليات
  // =========================================================
  const totalTransferCost = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.total_cost) || 0), 0)
  })

  const totalTransferQuantity = computed(() => {
    return items.value.reduce((sum, row) => sum + (parseFloat(row.quantity) || 0), 0)
  })

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const getValidationError = (path) => {
    return transferStore.validationErrors?.[path]?.[0] || null
  }

  const getRedirectRoute = () => {
    return '/app/inventory/transfers'
  }

  // =========================================================
  // 5. تحميل البيانات عند الفتح
  // =========================================================
  onMounted(async () => {
    isFormLoaded.value = false
    try {
      if (isEdit.value) {
        await transferStore.fetchTransfer(route.params.id)
        if (transferStore.currentTransfer) {
          const cur = transferStore.currentTransfer

          form.value = {
            transfer_number: cur.transfer_number,
            from_warehouse_id: cur.from_warehouse_id || '',
            to_warehouse_id: cur.to_warehouse_id || '',
            transfer_date: cur.transfer_date
              ? cur.transfer_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            status: cur.status || 'draft',
            notes: cur.notes || '',
          }

          items.value = (cur.items || []).map((it) => {
            const matchedUnit = it.product?.units?.find((u) => u.id === it.product_unit_id)
            const cost = parseFloat(
              matchedUnit?.cost_price || it.product?.cost_price || it.unit_cost || 0,
            )
            const qty = parseFloat(it.quantity) || 0

            return {
              id: it.id,
              product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
              product_name: it.product?.name || it.product_name || '',
              product_id: it.product_id,
              product_unit_id: it.product_unit_id,
              unit_name:
                it.product_unit?.unit?.name || matchedUnit?.unit_name || it.unit_name || '',
              batch_id: it.batch_id || null,
              current_quantity: 0,
              quantity: qty,
              unit_cost: cost,
              total_cost: parseFloat((qty * cost).toFixed(4)),
              available_units: it.product?.units || (it.product_unit ? [it.product_unit] : []),
              notes: it.notes || '',
            }
          })

          if (cur.from_warehouse_id) {
            await productStore.fetchProducts({
              is_active: 1,
              store_id: cur.from_warehouse_id,
              all: true,
            })

            items.value.forEach((row) => {
              const matchedStoreItem = productStore.products?.find((p) => p.id === row.product_id)
              if (matchedStoreItem) {
                row.available_units = matchedStoreItem.units || []
                row.current_quantity = parseFloat(
                  matchedStoreItem.current_stock ?? matchedStoreItem.stock ?? 0,
                )
              }
            })
          }
        }
      } else {
        if (authStore.user) {
          form.value.from_warehouse_id =
            authStore.user.warehouse_id || authStore.user.store_id || ''
        }
        if (form.value.from_warehouse_id) {
          await productStore.fetchProducts({
            is_active: 1,
            store_id: form.value.from_warehouse_id,
            all: true,
          })
        }
        items.value = [createEmptyRow()]
      }
    } catch (err) {
      console.error('فشل في تحميل بيانات أمر التحويل:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات أمر التحويل المخزني.')
    } finally {
      isFormLoaded.value = true
    }
  })

  // =========================================================
  // 6. تجهيز وحفظ البيانات
  // =========================================================
  const handleSubmit = async (completeDirectly = false) => {
    if (!form.value.from_warehouse_id) {
      toast.error('يرجى تحديد المستودع المصدر.')
      return
    }

    if (!form.value.to_warehouse_id) {
      toast.error('يرجى تحديد المستودع الوجهة.')
      return
    }

    if (form.value.from_warehouse_id === form.value.to_warehouse_id) {
      toast.error('لا يمكن التحويل إلى نفس المستودع المصدر.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => ({
        id: row.id || undefined,
        product_id: Number(row.product_id),
        product_unit_id: Number(row.product_unit_id),
        batch_id: row.batch_id ? Number(row.batch_id) : null,
        quantity: parseFloat(row.quantity) || 0,
        unit_cost: parseFloat(row.unit_cost) || 0,
        notes: row.notes || null,
      }))

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل أمر التحويل.')
      return
    }

    const invalidQuantities = dynamicItemsPayload.some((item) => item.quantity <= 0)
    if (invalidQuantities) {
      toast.error('يجب أن تكون كميات كافة البنود أكبر من الصفر.')
      return
    }

    const finalPayload = {
      transfer_number: form.value.transfer_number,
      from_warehouse_id: Number(form.value.from_warehouse_id),
      to_warehouse_id: Number(form.value.to_warehouse_id),
      transfer_date: form.value.transfer_date,
      status: form.value.status,
      notes: form.value.notes || null,
      items: dynamicItemsPayload,
    }

    isSubmitting.value = true

    try {
      let savedTransferId = route.params.id

      if (isEdit.value) {
        const response = await transferStore.updateTransfer(route.params.id, finalPayload)
        savedTransferId = response?.data?.id || route.params.id
      } else {
        const response = await transferStore.createTransfer(finalPayload)
        savedTransferId = response?.data?.id || transferStore.currentTransfer?.id
      }

      if (completeDirectly && savedTransferId) {
        await transferStore.completeTransfer(savedTransferId)
        form.value.status = 'completed'
        toast.success('تم حفظ واعتماد أمر التحويل وتحديث أرصدة المستودعات فوراً.')
      } else {
        toast.success(
          isEdit.value ? 'تم تحديث مسودة أمر التحويل بنجاح.' : 'تم حفظ مسودة أمر التحويل بنجاح.',
        )
      }

      router.push(getRedirectRoute())
    } catch {
      toast.error('فشلت عملية حفظ أمر التحويل، يرجى مراجعة الحقول المطلوبة والأخطاء.')
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
    totalTransferCost,
    totalTransferQuantity,
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
    transferStore,
    productStore,
  }
}
