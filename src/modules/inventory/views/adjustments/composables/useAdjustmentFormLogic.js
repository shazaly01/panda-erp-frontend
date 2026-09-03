// src/modules/inventory/views/adjustments/composables/useAdjustmentFormLogic.js
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdjustmentStore } from '@/modules/inventory/stores/adjustmentStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
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

  // تحديد النوع الافتراضي من بيانات المسار الوصفية (Route Meta)
  const routeDefaultType = computed(() => {
    return route.meta.defaultType || route.query.type || 'physical_count'
  })

  // نموذج بيانات رأس وثيقة التسوية الجردية
  const form = ref({
    adjustment_number: `ADJ-${Date.now().toString().slice(-6)}`,
    warehouse_id: '',
    adjustment_date: new Date().toISOString().substr(0, 10),
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

  // سكيما تفاصيل بنود التسوية الجردية المتكيفة ديناميكياً مع نوع العملية
  const detailSchema = computed(() => [
    // أعمدة تقنية مخفية
    {
      key: 'product_id',
      extractFromItem: (item) => item.id,
    },
    {
      key: 'available_units',
      defaultValue: [],
      extractFromItem: (item) => item.units || [],
    },
    {
      key: 'batch_id',
      defaultValue: null,
      extractFromItem: (item) => item.batch_id || null,
    },

    // الأعمدة المرئية
    {
      key: 'product_id_display',
      label: 'رقم الصنف',
      widthClass: 'w-[10%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => (item.id ? `PRD-${item.id}` : ''),
    },
    {
      key: 'product_name',
      label: 'اسم الصنف التجاري المعتمد',
      widthClass: form.value.type === 'opening_balance' ? 'w-[35%]' : 'w-[25%]',
      readonly: true,
      type: 'text',
      extractFromItem: (item) => item.name || '',
    },
    {
      key: 'product_unit_id',
      label: 'وحدة القياس',
      slot: 'cell-product_unit_id',
      widthClass: 'w-[13%]',
      type: 'text',
      extractFromItem: (item) => item.units?.[0]?.id || '',
    },
    {
      key: 'current_quantity',
      label: 'الرصيد الدفتري',
      type: 'number',
      readonly: true,
      defaultValue: 0,
      widthClass: 'w-[11%]',
      slot: 'cell-current_quantity',
      hidden: form.value.type === 'opening_balance',
      extractFromItem: (item) => parseFloat(item.current_stock ?? item.stock ?? 0),
    },
    {
      key: 'actual_quantity',
      label: quantityInputLabel.value,
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[12%]',
      slot: 'cell-actual_quantity',
      extractFromItem: (item) => {
        if (form.value.type === 'damage' || form.value.type === 'loss') {
          return 0
        }
        return parseFloat(item.current_stock ?? item.stock ?? 0)
      },
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
      formula: (row) => {
        const actual = parseFloat(row.actual_quantity) || 0
        const current = parseFloat(row.current_quantity) || 0

        if (form.value.type === 'damage' || form.value.type === 'loss') {
          return parseFloat((-1 * actual).toFixed(4))
        }
        if (form.value.type === 'opening_balance') {
          return parseFloat(actual.toFixed(4))
        }
        return parseFloat((actual - current).toFixed(4))
      },
      slot: 'cell-quantity_difference',
    },
    {
      key: 'unit_cost',
      label: 'تكلفة الوحدة',
      type: 'number',
      defaultValue: 0,
      widthClass: 'w-[11%]',
      slot: 'cell-unit_cost',
      extractFromItem: (item) => {
        const defaultUnit = item.units?.[0]
        return parseFloat(defaultUnit?.cost_price || item.cost_price || defaultUnit?.price || 0)
      },
    },
    {
      key: 'total_cost',
      label: totalCostColumnLabel.value,
      type: 'calculated',
      readonly: true,
      summary: true,
      widthClass: 'w-[14%]',
      formula: (row) => {
        const qty = parseFloat(row.actual_quantity) || 0
        const current = parseFloat(row.current_quantity) || 0
        const cost = parseFloat(row.unit_cost) || 0

        if (form.value.type === 'damage' || form.value.type === 'loss') {
          return parseFloat((qty * cost).toFixed(4))
        }
        if (form.value.type === 'opening_balance') {
          return parseFloat((qty * cost).toFixed(4))
        }
        const diff = qty - current
        return parseFloat((diff * cost).toFixed(4))
      },
      slot: 'cell-total_cost',
    },
  ])

  const visibleTableSchema = computed(() => {
    return detailSchema.value.filter((col) => col.label && !col.hidden)
  })

  // إدارة تفاصيل البنود ومنع التكرار
  const { createEmptyRow, handleItemSelected, removeRow } = useDynamicDetails(
    items,
    detailSchema.value,
    {
      uniqueKeys: ['product_id', 'product_unit_id'],
      mergeQtyKey: null,
    },
  )

  const triggerAddNewEmptyLine = () => {
    items.value.push(createEmptyRow())
  }

  const handleGlobalItemSelect = (selectedItem) => {
    if (!selectedItem) return
    handleItemSelected(selectedItem)
  }

  // مزامنة التكلفة والرصيد الدفتري عند تغيير الوحدة
  const syncUnitDetails = (row) => {
    const matchedUnit = row.available_units?.find((u) => u.id === row.product_unit_id)
    if (matchedUnit) {
      if (matchedUnit.cost_price !== undefined && matchedUnit.cost_price !== null) {
        row.unit_cost = parseFloat(matchedUnit.cost_price) || 0
      }
    }
  }

  // مراقبة المستودع لتحديث قائمة الأصناف والأرصدة
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
            }
          })
        } catch (err) {
          console.error('فشل في مزامنة الرصيد الدفتري مع المستودع الجديد:', err)
        }
      }
    },
  )

  // الإجماليات الحسابية
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

  onMounted(async () => {
    if (isEdit.value) {
      await adjustmentStore.fetchAdjustment(route.params.id)
      if (adjustmentStore.currentAdjustment) {
        const cur = adjustmentStore.currentAdjustment

        form.value = {
          adjustment_number: cur.adjustment_number,
          warehouse_id: cur.warehouse_id || '',
          adjustment_date: cur.adjustment_date
            ? cur.adjustment_date.substr(0, 10)
            : new Date().toISOString().substr(0, 10),
          type: cur.type || routeDefaultType.value,
          status: cur.status || 'draft',
          auto_approve: false,
          notes: cur.notes || '',
        }

        items.value = (cur.items || []).map((it) => {
          return {
            product_id_display: it.product_id ? `PRD-${it.product_id}` : '',
            product_name: it.product?.name || it.product_name || '',
            product_id: it.product_id,
            product_unit_id: it.product_unit_id,
            batch_id: it.batch_id || null,
            current_quantity: parseFloat(it.current_quantity) || 0,
            actual_quantity: parseFloat(it.actual_quantity) || 0,
            quantity_difference: parseFloat(it.quantity_difference) || 0,
            unit_cost: parseFloat(it.unit_cost) || 0,
            total_cost: parseFloat(it.total_cost) || 0,
            available_units: it.product?.units || it.available_units || [],
            notes: it.notes || '',
            _flashing: false,
          }
        })

        if (cur.warehouse_id) {
          await productStore.fetchProducts({ is_active: 1, store_id: cur.warehouse_id, all: true })

          items.value.forEach((row) => {
            const matchedStoreItem = productStore.products?.find((it) => it.id === row.product_id)
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
    }

    isFormLoaded.value = true
  })

  // تجهيز وحفظ البيانات
  const handleSubmit = async (approveDirectly = false) => {
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
          product_id: row.product_id,
          product_unit_id: row.product_unit_id,
          batch_id: row.batch_id || null,
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
    }
  }

  const handleCancel = () => {
    router.push(getRedirectRoute())
  }

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
    removeRow,
    triggerAddNewEmptyLine,
    handleGlobalItemSelect,
    adjustmentStore,
    productStore,
  }
}
