<!--src\modules\inventory\views\products\components\ProductForm.vue-->
<template>
  <div class="space-y-6">
    <!-- الشبكة: عمود المحتوى والبطاقات (8) + عمود الحالة والخصائص (4) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- ========================================================= -->
      <!-- المسار الرئيسي (8 أعمدة) -->
      <!-- ========================================================= -->
      <div class="lg:col-span-8 space-y-5">
        <!-- البطاقة 1: هوية الصنف وبيانات التعريف الأساسية -->
        <div
          class="bg-surface-section rounded-2xl border border-surface-border p-5 md:p-6 shadow-sm space-y-4"
        >
          <div class="flex items-center gap-2.5 pb-3 border-b border-surface-border/60">
            <div
              class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-sm font-bold text-text-primary">بيانات التعريف الأساسية</h2>
              <p class="text-[11px] text-text-muted">الاسم والتصنيف المرجعي وكود التمييز للصنف.</p>
            </div>
          </div>

          <!-- اسم الصنف -->
          <div>
            <AppInput
              id="product-name"
              type="text"
              label="اسم الصنف / المنتج *"
              :model-value="modelValue.name"
              @update:model-value="updateField('name', $event)"
              placeholder="مثال: زيت محرك 20W-50، فلتر هواء، خدمة صيانة..."
              required
            />
          </div>

          <!-- التصنيف وكود الصنف -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div class="md:col-span-7">
              <AppDropdown
                id="product-category"
                label="التصنيف المرجعي (القسم) *"
                :model-value="modelValue.category_id"
                :options="categories"
                option-label="name"
                option-value="id"
                placeholder="اختر القسم..."
                @update:model-value="updateField('category_id', $event)"
              />
            </div>

            <div class="md:col-span-5">
              <div class="flex items-end gap-1.5">
                <div class="flex-1">
                  <AppInput
                    id="product-sku"
                    type="text"
                    label="كود الصنف (SKU)"
                    :model-value="modelValue.sku"
                    @update:model-value="updateField('sku', $event)"
                    placeholder="مثال: PRD-1002"
                  />
                </div>
                <button
                  type="button"
                  @click="generateSku"
                  class="px-3 h-[42px] text-xs font-semibold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 hover:bg-blue-100 dark:hover:bg-sky-500/20 border border-blue-200 dark:border-sky-500/30 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                  title="توليد كود تلقائي"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span class="hidden sm:inline">توليد</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- البطاقة 2: الوحدة الأساسية، التسعير، والباركود المباشر -->
        <div
          class="bg-surface-section rounded-2xl border border-surface-border p-5 md:p-6 shadow-sm space-y-4"
        >
          <div class="flex items-center justify-between pb-3 border-b border-surface-border/60">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-bold text-text-primary">الوحدة والتسعير المباشر</h2>
                <p class="text-[11px] text-text-muted">
                  وحدة القياس الأساسية، سعر الشراء، وسعر البيع للعملاء.
                </p>
              </div>
            </div>

            <!-- مؤشر هامش الربح المحسوب تلقائياً -->
            <div
              v-if="(modelValue.can_be_sold ?? true) && Number(baseUnitQuickPrice) > 0"
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              :class="
                profitMargin >= 0
                  ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
              "
            >
              <span class="text-[11px] font-medium">هامش الربح:</span>
              <span class="text-xs font-bold font-mono dir-ltr">{{ profitMargin }}%</span>
              <span class="text-[11px] opacity-75 font-mono"
                >({{ profitAmount > 0 ? '+' : '' }}{{ profitAmount }})</span
              >
            </div>
          </div>

          <!-- سطر الوحدة والأسعار الثلاثة المتناسقة -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <AppDropdown
                id="base-product-unit"
                label="وحدة القياس الأساسية *"
                :model-value="baseUnit?.unit_id"
                :options="unitsList"
                option-label="name"
                option-value="id"
                placeholder="اختر الوحدة (قطعة، حبة)..."
                @update:model-value="updateBaseUnitField('unit_id', $event)"
              />
            </div>

            <div>
              <AppInput
                id="product-cost-price"
                type="number"
                label="سعر التكلفة (الشراء)"
                :model-value="modelValue.cost_price"
                @update:model-value="updateField('cost_price', $event)"
                placeholder="0.00"
              />
            </div>

            <div v-if="modelValue.can_be_sold ?? true">
              <AppInput
                id="base-product-sale-price"
                type="number"
                label="سعر البيع المباشر *"
                :model-value="baseUnitQuickPrice"
                @update:model-value="setBaseUnitQuickPrice($event)"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- حقل مسح الباركود المباشر للصنف -->
          <div>
            <label class="block text-xs font-medium text-text-secondary mb-1.5">
              كود الباركود (مسح مباشر عبر القارئ أو كتابة الكود)
            </label>
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <input
                  type="text"
                  id="base-barcode-quick-input"
                  v-model="quickBarcodeInput"
                  @keydown.enter.prevent="addBaseQuickBarcode"
                  placeholder="امسح الباركود بجهاز المسح أو اكتب واضغط Enter..."
                  class="w-full h-10 px-3.5 pe-10 text-xs rounded-xl border border-surface-border bg-surface-ground focus:bg-surface-section focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-text-primary placeholder:text-text-muted/60"
                />
                <div
                  class="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-text-muted"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                @click="addBaseQuickBarcode"
                class="h-10 px-3.5 bg-surface-ground hover:bg-surface-border border border-surface-border rounded-xl text-xs font-bold text-text-primary transition-colors shrink-0"
              >
                إضافة
              </button>
            </div>

            <!-- وسوم الباركود الحالية -->
            <div class="flex flex-wrap gap-1.5 mt-2 min-h-[26px]">
              <span
                v-for="(bc, bcIdx) in baseUnitCleanBarcodes"
                :key="bcIdx"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-ground border border-surface-border text-text-primary font-mono text-xs shadow-2xs"
              >
                <span>{{ bc }}</span>
                <button
                  type="button"
                  @click="removeBaseBarcode(bcIdx)"
                  class="text-rose-500 hover:text-rose-700 font-bold leading-none ms-1"
                  title="حذف هذا الباركود"
                >
                  ×
                </button>
              </span>
              <span
                v-if="baseUnitCleanBarcodes.length === 0"
                class="text-[11px] text-text-muted italic flex items-center gap-1 py-0.5"
              >
                لا يوجد باركود مسجل حالياً. يمكنك تركه فارغاً أو مسحه لربطه مع قارئ الباركود.
              </span>
            </div>
          </div>
        </div>

        <!-- البطاقة 3: الوصف والملاحظات التشغيلية -->
        <div
          class="bg-surface-section rounded-2xl border border-surface-border p-5 md:p-6 shadow-sm"
        >
          <AppInput
            id="product-description"
            type="text"
            label="الوصف والملاحظات"
            :model-value="modelValue.description"
            @update:model-value="updateField('description', $event)"
            placeholder="ملاحظات تشغيلية، تفاصيل فنية، أو تعليمات استخدام إضافية..."
          />
        </div>

        <!-- المكون المجمع للأقسام الموسعة -->
        <ProductAdvancedDetails
          :model-value="modelValue"
          :units-list="unitsList"
          :price-lists="priceLists"
          :warehouses="warehouses"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </div>

      <!-- ========================================================= -->
      <!-- اللوحة الجانبية (4 أعمدة): الحالة والخصائص التشغيلية -->
      <!-- ========================================================= -->
      <div class="lg:col-span-4 space-y-4">
        <div
          class="bg-surface-section rounded-2xl border border-surface-border p-5 shadow-sm space-y-4"
        >
          <h3
            class="text-xs font-bold text-text-secondary uppercase tracking-wider pb-2 border-b border-surface-border/60"
          >
            الحالة والخصائص التشغيلية
          </h3>

          <!-- مفتاح حالة التفعيل (نشط / موقوف) -->
          <div
            class="flex items-center justify-between p-3.5 rounded-xl bg-surface-ground border border-surface-border/70"
          >
            <span class="text-xs font-bold text-text-primary">
              {{ (modelValue.is_active ?? true) ? 'صنف نشط في النظام' : 'صنف موقوف حالياً' }}
            </span>
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="modelValue.is_active ?? true"
                @change="updateField('is_active', $event.target.checked)"
                class="sr-only peer"
              />
              <div
                class="w-10 h-5 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"
              ></div>
            </label>
          </div>

          <!-- خيار الإتاحة للبيع للعملاء -->
          <label
            class="flex items-start gap-3 p-3.5 rounded-xl bg-surface-ground border border-surface-border/70 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :checked="modelValue.can_be_sold ?? true"
              @change="updateField('can_be_sold', $event.target.checked)"
              class="w-4 h-4 mt-0.5 text-blue-600 rounded border-surface-border focus:ring-blue-500"
            />
            <div>
              <span class="text-xs font-bold text-text-primary block">صنف متاح للبيع للعملاء</span>
              <span class="text-[11px] text-text-muted block mt-0.5 leading-snug">
                يظهر الصنف في واجهات نقاط البيع وفواتير المبيعات.
              </span>
            </div>
          </label>

          <!-- طبيعة ونوع الصنف -->
          <div>
            <AppDropdown
              id="sidebar-product-type"
              label="طبيعة الصنف *"
              :model-value="modelValue.type"
              :options="productTypeOptions"
              @update:model-value="handleTypeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import ProductAdvancedDetails from './ProductAdvancedDetails.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  unitsList: { type: Array, default: () => [] },
  priceLists: { type: Array, default: () => [] },
  warehouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const quickBarcodeInput = ref('')

const productTypeOptions = [
  { id: 'storable', name: 'منتج مخزني (Storable)' },
  { id: 'raw_material', name: 'مادة خام / مستلزمات (Raw Material)' },
  { id: 'composite', name: 'منتج تجميعي (Composite)' },
  { id: 'service', name: 'خدمة / صيانة (Service)' },
]

// الوحدة الأساسية للصنف
const baseUnit = computed(() => {
  if (!props.modelValue.units || props.modelValue.units.length === 0) return null
  return props.modelValue.units.find((u) => u.is_base_unit) || props.modelValue.units[0]
})

const baseUnitIndex = computed(() => {
  if (!props.modelValue.units || props.modelValue.units.length === 0) return 0
  const idx = props.modelValue.units.findIndex((u) => u.is_base_unit)
  return idx !== -1 ? idx : 0
})

// سعر البيع المباشر للوحدة الأساسية
const baseUnitQuickPrice = computed(() => {
  if (!baseUnit.value || !baseUnit.value.prices || baseUnit.value.prices.length === 0) return 0
  return baseUnit.value.prices[0]?.price || 0
})

// باركودات الوحدة الأساسية
const baseUnitCleanBarcodes = computed(() => {
  if (!baseUnit.value || !Array.isArray(baseUnit.value.barcodes)) return []
  return baseUnit.value.barcodes.filter((b) => typeof b === 'string' && b.trim() !== '')
})

// حسابات هامش الربح الحي
const profitAmount = computed(() => {
  const sale = Number(baseUnitQuickPrice.value) || 0
  const cost = Number(props.modelValue.cost_price) || 0
  return Number((sale - cost).toFixed(2))
})

const profitMargin = computed(() => {
  const sale = Number(baseUnitQuickPrice.value) || 0
  const cost = Number(props.modelValue.cost_price) || 0
  if (sale <= 0) return 0
  return Number((((sale - cost) / sale) * 100).toFixed(1))
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// تحديث حقل بالوحدة الأساسية
const updateBaseUnitField = (field, value) => {
  const updatedUnits = [...(props.modelValue.units || [])]
  if (updatedUnits.length === 0) {
    const defaultPriceListId = props.priceLists[0]?.id || null
    updatedUnits.push({
      unit_id: value,
      conversion_factor: 1,
      is_base_unit: true,
      is_purchase_unit: true,
      is_sale_unit: props.modelValue.can_be_sold ?? true,
      barcodes: [''],
      prices: defaultPriceListId
        ? [{ price_list_id: defaultPriceListId, price: 0, min_quantity: 1 }]
        : [],
    })
  } else {
    updatedUnits[baseUnitIndex.value] = {
      ...updatedUnits[baseUnitIndex.value],
      [field]: value,
      is_base_unit: true,
      conversion_factor: 1,
    }
  }
  updateField('units', updatedUnits)
}

// تعيين سعر بيع الوحدة الأساسية
const setBaseUnitQuickPrice = (priceValue) => {
  const updatedUnits = [...(props.modelValue.units || [])]
  const defaultPriceListId = props.priceLists[0]?.id || null

  if (updatedUnits.length === 0) {
    updatedUnits.push({
      unit_id: null,
      conversion_factor: 1,
      is_base_unit: true,
      is_purchase_unit: true,
      is_sale_unit: props.modelValue.can_be_sold ?? true,
      barcodes: [''],
      prices: [
        { price_list_id: defaultPriceListId, price: Number(priceValue) || 0, min_quantity: 1 },
      ],
    })
  } else {
    const currentUnit = { ...updatedUnits[baseUnitIndex.value] }
    const currentPrices = [...(currentUnit.prices || [])]

    if (currentPrices.length === 0) {
      currentPrices.push({
        price_list_id: defaultPriceListId,
        price: Number(priceValue) || 0,
        min_quantity: 1,
      })
    } else {
      currentPrices[0] = {
        ...currentPrices[0],
        price_list_id: currentPrices[0].price_list_id || defaultPriceListId,
        price: Number(priceValue) || 0,
        min_quantity: currentPrices[0].min_quantity || 1,
      }
    }
    currentUnit.prices = currentPrices
    updatedUnits[baseUnitIndex.value] = currentUnit
  }

  updateField('units', updatedUnits)
}

// إضافة وحذف الباركود المباشر
const addBaseQuickBarcode = () => {
  const code = quickBarcodeInput.value.trim()
  if (!code) return

  const updatedUnits = [...(props.modelValue.units || [])]
  const targetIndex = baseUnitIndex.value
  const targetUnit = { ...(updatedUnits[targetIndex] || {}) }
  const currentBarcodes = (targetUnit.barcodes || []).filter(
    (b) => typeof b === 'string' && b.trim() !== '',
  )

  if (!currentBarcodes.includes(code)) {
    targetUnit.barcodes = [...currentBarcodes, code]
    updatedUnits[targetIndex] = targetUnit
    updateField('units', updatedUnits)
  }

  quickBarcodeInput.value = ''
}

const removeBaseBarcode = (indexToRemove) => {
  const updatedUnits = [...(props.modelValue.units || [])]
  const targetIndex = baseUnitIndex.value
  const targetUnit = { ...(updatedUnits[targetIndex] || {}) }
  const clean = (targetUnit.barcodes || []).filter((b) => typeof b === 'string' && b.trim() !== '')

  clean.splice(indexToRemove, 1)
  targetUnit.barcodes = clean.length > 0 ? clean : ['']
  updatedUnits[targetIndex] = targetUnit
  updateField('units', updatedUnits)
}

const handleTypeChange = (newType) => {
  const updates = { ...props.modelValue, type: newType }
  if (newType === 'service') {
    updates.tracking_type = 'none'
    updates.valuation_method = 'standard'
  }
  if (newType === 'raw_material') {
    updates.can_be_sold = false
  }
  emit('update:modelValue', updates)
}

const generateSku = () => {
  const prefix = props.modelValue.type === 'service' ? 'SRV' : 'PRD'
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  updateField('sku', `${prefix}-${randomSuffix}`)
}

const resetToFirstTab = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const focusNameInput = () => {
  nextTick(() => {
    const el = document.getElementById('product-name')
    if (el) {
      const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
      if (input) input.focus()
    }
  })
}

defineExpose({
  resetToFirstTab,
  focusNameInput,
})
</script>
