// src/modules/purchasing/views/issues/composables/usePurchaseIssueFormLogic.js
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseIssueStore } from '@/modules/purchasing/stores/purchaseIssueStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export function usePurchaseIssueFormLogic() {
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()

  const issueStore = usePurchaseIssueStore()
  const productStore = useProductStore()
  const authStore = useAuthStore()

  const isEdit = computed(() => !!route.params.id)
  const isFormLoaded = ref(false)
  const isSubmitting = ref(false)
  const activeIssueId = ref(null)

  // =========================================================
  // 1. نموذج بيانات رأس إذن الصرف المخزني
  // =========================================================
  const form = ref({
    issue_number: '',
    requisition_id: null,
    warehouse_id: '',
    department_id: null,
    recipient_id: null,
    issue_date: new Date().toISOString().substring(0, 10),
    status: 'draft',
    total_cost: 0,
    notes: '',
  })

  const items = ref([])

  // =========================================================
  // 2. الذكاء التكيفي لمسار الصرف
  // =========================================================
  const isRequisitionLinked = computed(() => Boolean(form.value.requisition_id))

  const routeBadgeText = computed(() => {
    if (isRequisitionLinked.value) {
      return `صرف مرتبط بطلب احتياج داخلي رقم #${form.value.requisition_id}`
    }
    return 'إذن صرف مخزني مباشر - سيتم خصم الكميات من رصيد المستودع فورياً عند التأكيد'
  })

  const routeBadgeClass = computed(() => {
    if (isRequisitionLinked.value) {
      return 'bg-sky-950/40 text-sky-400 border border-sky-500/30'
    }
    return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
  })

  // =========================================================
  // 3. سكيما تفاصيل بنود الصرف المخزني (مع عمود الكمية الحالية)
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
      key: 'requisition_item_id',
      defaultValue: null,
      extractFromItem: (item) => item.requisition_item_id || null,
    },
    {
      key: 'location_id',
      defaultValue: null,
      extractFromItem: (item) => item.location_id || null,
    },
    {
      key: 'batch_id',
      defaultValue: null,
      extractFromItem: (item) => item.batch_id || null,
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
      label: 'اسم الصنف التجاري',
      widthClass: 'w-[24%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.product_name || item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'الوحدة',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[12%]',
      type: 'text',
      extractFromItem: (item) => item.product_unit_id || item.units?.[0]?.id || '',
    },
    {
      key: 'current_quantity',
      label: 'الكمية الحالية',
      widthClass: 'w-[10%]',
      readonly: true,
      type: 'text',
      slot: 'cell-current_quantity',
      extractFromItem: (item) => parseFloat(item.current_quantity ?? item.current_stock ?? 0),
    },
    {
      key: 'quantity',
      label: 'الكمية المنصرفة',
      type: 'number',
      defaultValue: 1,
      widthClass: 'w-[11%]',
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
      label: 'إجمالي التكلفة',
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[12%]',
      formula: (row) => row.total_cost,
      slot: 'cell-total_cost',
    },
    {
      key: 'notes',
      label: 'ملاحظات البند',
      type: 'text',
      defaultValue: '',
      widthClass: 'w-[10%]',
      slot: 'cell-notes',
      extractFromItem: (item) => item.notes || '',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // =========================================================
  // 4. إدارة سطور البنود وإدخال الأصناف
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
      requisition_item_id: null,
      location_id: null,
      batch_id: null,
      current_quantity: 0,
      current_stock: 0,
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
      notes: '',
      available_units: [],
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

  // اختيار صنف مع استخراج الكمية الحالية المتوفرة بدقة
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

    // استخراج رصيد الصنف المتوفر مع دعم كافة أسماء الحقول المرتجعة
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
    row.current_stock = resolvedStock
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
  // 5. العمليات الحسابية التلقائية
  // =========================================================
  const calculatedTotalCost = computed(() => {
    return items.value.reduce((sum, row) => {
      const qty = parseFloat(row.quantity) || 0
      const cost = parseFloat(row.unit_cost) || 0
      return sum + qty * cost
    }, 0)
  })

  const totalItemsCount = computed(() => {
    return items.value.filter((row) => row.product_id && row.product_unit_id).length
  })

  const totalQuantitySum = computed(() => {
    return items.value.reduce((sum, row) => {
      return sum + (parseFloat(row.quantity) || 0)
    }, 0)
  })

  // =========================================================
  // 6. مراقبة المستودع لتحديث قائمة الأصناف والأرصدة
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
              const val = parseFloat(stockMap[row.product_id]) || 0
              row.current_quantity = val
              row.current_stock = val
            }
          })
        } catch (err) {
          console.error('فشل في مزامنة الرصيد مع المستودع الجديد:', err)
        }
      }
    },
    { immediate: false },
  )

  const getValidationError = (path) => {
    return issueStore.validationErrors?.[path]?.[0] || null
  }

  // =========================================================
  // 7. تحميل البيانات عند الفتح
  // =========================================================
  onMounted(async () => {
    isFormLoaded.value = false
    try {
      if (isEdit.value) {
        activeIssueId.value = route.params.id
        await issueStore.fetchIssue(route.params.id)

        if (issueStore.currentIssue) {
          const cur = issueStore.currentIssue

          form.value = {
            issue_number: cur.issue_number || '',
            requisition_id: cur.requisition_id || null,
            warehouse_id: cur.warehouse_id || '',
            department_id: cur.department_id || null,
            recipient_id: cur.recipient_id || null,
            issue_date: cur.issue_date
              ? cur.issue_date.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            status: cur.status?.value || cur.status || 'draft',
            total_cost: parseFloat(cur.total_cost) || 0,
            notes: cur.notes || '',
          }

          items.value = (cur.items || []).map((it) => {
            const qty = parseFloat(it.quantity) || 1
            const cost = parseFloat(it.unit_cost) || 0
            const stock =
              it.current_quantity !== undefined && it.current_quantity !== null
                ? it.current_quantity
                : it.current_stock !== undefined && it.current_stock !== null
                  ? it.current_stock
                  : it.product?.available_quantity !== undefined &&
                      it.product?.available_quantity !== null
                    ? it.product.available_quantity
                    : it.product?.current_stock !== undefined
                      ? it.product.current_stock
                      : it.product?.stock !== undefined
                        ? it.product.stock
                        : 0

            const stockVal = parseFloat(stock) || 0

            return {
              id: it.id,
              product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
              product_name: it.product?.name || it.product_name || '',
              product_id: it.product_id,
              product_unit_id: it.product_unit_id,
              unit_name: it.product_unit?.unit?.name || it.unit_name || '',
              requisition_item_id: it.requisition_item_id || null,
              location_id: it.location_id || null,
              batch_id: it.batch_id || null,
              current_quantity: stockVal,
              current_stock: stockVal,
              quantity: qty,
              unit_cost: cost,
              total_cost: parseFloat(it.total_cost) || parseFloat((qty * cost).toFixed(4)),
              available_units: it.product?.units || [],
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
                if (!row.current_quantity) {
                  const sVal = parseFloat(
                    matchedStoreItem.available_quantity ||
                      matchedStoreItem.current_stock ||
                      matchedStoreItem.stock ||
                      0,
                  )
                  row.current_quantity = sVal
                  row.current_stock = sVal
                }
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
      console.error('فشل في تحميل بيانات إذن الصرف المخزني:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات إذن الصرف.')
    } finally {
      isFormLoaded.value = true
    }
  })

  // =========================================================
  // 8. تجهيز حمولة الإرسال والحفظ
  // =========================================================
  const handleSubmit = async (confirmDirectly = false) => {
    if (!form.value.warehouse_id) {
      toast.error('يجب تحديد المستودع المراد الصرف منه أولاً.')
      return
    }

    const dynamicItemsPayload = items.value
      .filter((row) => row.product_id && row.product_unit_id)
      .map((row) => {
        const qty = parseFloat(row.quantity) || 0
        const cost = parseFloat(row.unit_cost) || 0
        const lineTotal = qty * cost

        return {
          id: row.id || undefined,
          requisition_item_id: row.requisition_item_id || null,
          product_id: Number(row.product_id),
          product_unit_id: Number(row.product_unit_id),
          location_id: row.location_id ? Number(row.location_id) : null,
          batch_id: row.batch_id ? Number(row.batch_id) : null,
          quantity: qty,
          unit_cost: cost,
          total_cost: parseFloat(lineTotal.toFixed(4)),
          notes: row.notes || null,
        }
      })

    if (dynamicItemsPayload.length === 0) {
      toast.error('يجب إضافة صنف واحد على الأقل داخل إذن الصرف مع تحديد الوحدة والكمية.')
      return
    }

    const finalPayload = {
      warehouse_id: Number(form.value.warehouse_id),
      requisition_id: form.value.requisition_id ? Number(form.value.requisition_id) : null,
      department_id: form.value.department_id ? Number(form.value.department_id) : null,
      recipient_id: form.value.recipient_id ? Number(form.value.recipient_id) : null,
      issue_date: form.value.issue_date,
      notes: form.value.notes || null,
      items: dynamicItemsPayload,
    }

    isSubmitting.value = true

    try {
      if (isEdit.value) {
        await issueStore.updateIssue(route.params.id, finalPayload)
        activeIssueId.value = route.params.id
        toast.success('تم تحديث مسودة إذن الصرف المخزني بنجاح.')

        if (confirmDirectly) {
          await issueStore.confirmIssue(route.params.id)
          form.value.status = 'confirmed'
          toast.success('تم تأكيد وترحيل إذن الصرف وخصم الكميات من المستودع بنجاح.')
        }
      } else {
        const savedIssue = await issueStore.createIssue(finalPayload)
        const issueData = savedIssue?.data || issueStore.currentIssue || {}
        activeIssueId.value = issueData.id
        form.value.issue_number = issueData.issue_number || ''

        if (confirmDirectly && issueData.id) {
          await issueStore.confirmIssue(issueData.id)
          form.value.status = 'confirmed'
          toast.success('تم إنشاء وتأكيد إذن الصرف وخصم الكميات من المستودع بنجاح.')
        } else {
          toast.success('تم حفظ مسودة إذن الصرف المخزني بنجاح.')
        }
      }

      router.push('/app/purchasing/issues')
    } catch {
      toast.error(issueStore.error || 'فشلت عملية حفظ إذن الصرف المخزني.')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    router.push('/app/purchasing/issues')
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
    detailSchema,
    visibleTableSchema,
    isRequisitionLinked,
    routeBadgeText,
    routeBadgeClass,
    calculatedTotalCost,
    totalItemsCount,
    totalQuantitySum,
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
    issueStore,
    productStore,
    authStore,
  }
}
