<!--src\modules\inventory\views\products\components\ProductForm.vue--->
<template>
  <div class="space-y-6">
    <!-- شريط التبويبات (Tabs Navigation) -->
    <div class="border-b border-surface-border">
      <nav class="flex space-x-2 space-x-reverse overflow-x-auto pb-2" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          class="px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 flex items-center gap-2"
          :class="
            activeTab === tab.id
              ? 'bg-blue-600 text-white font-bold shadow-md dark:bg-sky-500'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-border/50'
          "
        >
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- محتوى التبويبات -->
    <div class="pt-2">
      <!-- ========================================================= -->
      <!-- 1. التبويب الأول: البيانات الأساسية والمحاسبية -->
      <!-- ========================================================= -->
      <div v-show="activeTab === 'general'" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="md:col-span-2">
            <AppInput
              id="product-name"
              type="text"
              label="اسم الصنف / المنتج *"
              :model-value="modelValue.name"
              @update:model-value="updateField('name', $event)"
              placeholder="مثال: عصير برتقال 1 لتر، حاسوب محمول..."
              required
            />
          </div>
          <div>
            <AppInput
              id="product-sku"
              type="text"
              label="كود الصنف (SKU)"
              :model-value="modelValue.sku"
              @update:model-value="updateField('sku', $event)"
              placeholder="مثال: PRD-1002"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <AppDropdown
              id="product-category"
              label="التصنيف *"
              :model-value="modelValue.category_id"
              :options="categories"
              option-label="name"
              option-value="id"
              placeholder="اختر القسم..."
              @update:model-value="updateField('category_id', $event)"
            />
          </div>

          <div>
            <AppDropdown
              id="product-type"
              label="نوع المنتج *"
              :model-value="modelValue.type"
              :options="[
                { id: 'storable', name: 'منتج مخزني (Storable)' },
                { id: 'raw_material', name: 'مادة خام (Raw Material)' },
                { id: 'composite', name: 'منتج تجميعي (Composite)' },
                { id: 'service', name: 'خدمة (Service)' },
              ]"
              @update:model-value="updateField('type', $event)"
            />
          </div>

          <div>
            <AppDropdown
              id="product-valuation"
              label="طريقة التقييم المالي *"
              :model-value="modelValue.valuation_method"
              :options="[
                { id: 'avco', name: 'المتوسط المتحرك (AVCO)' },
                { id: 'fifo', name: 'الوارد أولاً يصرف أولاً (FIFO)' },
                { id: 'standard', name: 'التكلفة المعيارية (Standard)' },
              ]"
              @update:model-value="updateField('valuation_method', $event)"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <AppDropdown
              id="product-tracking"
              label="طريقة التتبع المخزني *"
              :model-value="modelValue.tracking_type"
              :options="[
                { id: 'none', name: 'بدون تتبع' },
                { id: 'by_batch', name: 'بالدفعة / التشغيلة (Batch)' },
                { id: 'by_serial', name: 'بالرقم التسلسلي (Serial)' },
              ]"
              @update:model-value="updateField('tracking_type', $event)"
            />
          </div>

          <div>
            <AppDropdown
              id="product-policy"
              label="سياسة الخصم من المخزون *"
              :model-value="modelValue.inventory_policy"
              :options="[
                { id: 'direct_deduction', name: 'خصم مباشر عند البيع' },
                { id: 'auto_deduct_bom_on_sale', name: 'خصم تلقائي للمكونات (BOM)' },
                { id: 'production_order_required', name: 'يتطلب أمر إنتاج مسبق' },
              ]"
              @update:model-value="updateField('inventory_policy', $event)"
            />
          </div>

          <div>
            <AppInput
              id="product-cost"
              type="number"
              label="سعر التكلفة المعياري"
              :model-value="modelValue.cost_price"
              @update:model-value="updateField('cost_price', $event)"
              placeholder="0.0000"
            />
          </div>
        </div>

        <div>
          <AppInput
            id="product-description"
            type="text"
            label="وصف المنتج"
            :model-value="modelValue.description"
            @update:model-value="updateField('description', $event)"
            placeholder="ملاحظات أو مواصفات إضافية للصنف..."
          />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="modelValue.is_active"
              @change="updateField('is_active', $event.target.checked)"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-sky-500"
            ></div>
            <span class="ms-3 text-sm font-medium text-text-primary">
              {{ modelValue.is_active ? 'الصنف نشط (متاح في العمليات المخزنية)' : 'الصنف موقوف' }}
            </span>
          </label>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 2. التبويب الثاني: وحدات القياس والباركود -->
      <!-- ========================================================= -->
      <div v-show="activeTab === 'units'" class="space-y-4">
        <div
          class="flex justify-between items-center bg-surface-ground p-3 rounded-xl border border-surface-border"
        >
          <p class="text-xs text-text-muted">
            حدد كافة الوحدات التي يباع ويشترى بها هذا الصنف. يجب تحديد **وحدة أساسية واحدة** فقط
            بمعامل تحويل يساوي 1.
          </p>
          <button
            type="button"
            @click="addUnitRow"
            class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
          >
            + إضافة وحدة أخرى
          </button>
        </div>

        <div
          v-for="(u, unitIdx) in modelValue.units"
          :key="unitIdx"
          class="p-4 rounded-xl border-2 border-surface-border bg-surface-section space-y-4 shadow-sm"
        >
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div class="md:col-span-4">
              <AppDropdown
                :id="`unit-id-${unitIdx}`"
                label="وحدة القياس *"
                :model-value="u.unit_id"
                :options="unitsList"
                option-label="name"
                option-value="id"
                placeholder="اختر الوحدة..."
                @update:model-value="updateUnitRow(unitIdx, 'unit_id', $event)"
              />
            </div>

            <div class="md:col-span-3">
              <AppInput
                :id="`unit-factor-${unitIdx}`"
                type="number"
                label="معامل التحويل *"
                :model-value="u.conversion_factor"
                @update:model-value="updateUnitRow(unitIdx, 'conversion_factor', $event)"
                :disabled="u.is_base_unit"
                placeholder="1.000000"
              />
            </div>

            <div class="md:col-span-4 flex items-center gap-4 py-2">
              <label class="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="base_unit_selector"
                  :checked="u.is_base_unit"
                  @change="setBaseUnit(unitIdx)"
                  class="text-blue-600 focus:ring-blue-500"
                />
                <span class="font-bold text-blue-600 dark:text-sky-400">الوحدة الأساسية</span>
              </label>

              <label class="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  :checked="u.is_purchase_unit"
                  @change="updateUnitRow(unitIdx, 'is_purchase_unit', $event.target.checked)"
                  class="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>شراء</span>
              </label>

              <label class="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  :checked="u.is_sale_unit"
                  @change="updateUnitRow(unitIdx, 'is_sale_unit', $event.target.checked)"
                  class="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>بيع</span>
              </label>
            </div>

            <div class="md:col-span-1 text-left">
              <button
                v-if="modelValue.units.length > 1 && !u.is_base_unit"
                type="button"
                @click="removeUnitRow(unitIdx)"
                class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                title="حذف الوحدة"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- الباركودات المربوطة بهذه الوحدة -->
          <div class="pt-3 border-t border-surface-border">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-text-secondary"
                >الأكواد الشريطية (الباركود) للوحدة:</span
              >
              <button
                type="button"
                @click="addBarcodeToUnit(unitIdx)"
                class="text-xs text-blue-600 dark:text-sky-400 hover:underline font-medium"
              >
                + إضافة كود باركود
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div v-for="(bc, bcIdx) in u.barcodes" :key="bcIdx" class="flex items-center gap-2">
                <AppInput
                  :id="`unit-${unitIdx}-bc-${bcIdx}`"
                  type="text"
                  :model-value="bc"
                  @update:model-value="updateBarcodeValue(unitIdx, bcIdx, $event)"
                  placeholder="امسح أو اكتب الباركود..."
                  class="flex-1"
                />
                <button
                  type="button"
                  @click="removeBarcodeFromUnit(unitIdx, bcIdx)"
                  class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="حذف الباركود"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 3. التبويب الثالث: قوائم أسعار الوحدات -->
      <!-- ========================================================= -->
      <div v-show="activeTab === 'prices'" class="space-y-4">
        <div class="bg-surface-ground p-3 rounded-xl border border-surface-border">
          <p class="text-xs text-text-muted">
            تسعير الصنف لكل وحدة قياس عبر قوائم الأسعار المتاحة (تجزئة، جملة...) مع دعم خصومات
            الكمية.
          </p>
        </div>

        <div
          v-for="(u, unitIdx) in modelValue.units"
          :key="unitIdx"
          class="p-4 rounded-xl border border-surface-border bg-surface-section space-y-3"
        >
          <div class="flex justify-between items-center border-b border-surface-border pb-2">
            <h4 class="font-bold text-sm text-text-primary flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              تسعير وحدة: {{ getUnitName(u.unit_id) || `وحدة رقم ${unitIdx + 1}` }}
            </h4>
            <button
              type="button"
              @click="addPriceToUnit(unitIdx)"
              class="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
            >
              + إضافة سعر لهذه الوحدة
            </button>
          </div>

          <div
            v-if="!u.prices || u.prices.length === 0"
            class="text-xs text-text-muted italic py-2"
          >
            لم يتم إضافة أي أسعار لهذه الوحدة بعد.
          </div>

          <div
            v-for="(p, priceIdx) in u.prices"
            :key="priceIdx"
            class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-surface-border bg-surface-ground"
          >
            <div class="md:col-span-5">
              <AppDropdown
                :id="`u-${unitIdx}-price-list-${priceIdx}`"
                label="قائمة السعر *"
                :model-value="p.price_list_id"
                :options="priceLists"
                option-label="name"
                option-value="id"
                placeholder="اختر القائمة..."
                @update:model-value="updateUnitPriceRow(unitIdx, priceIdx, 'price_list_id', $event)"
              />
            </div>

            <div class="md:col-span-3">
              <AppInput
                :id="`u-${unitIdx}-min-qty-${priceIdx}`"
                type="number"
                label="الحد الأدنى للكمية *"
                :model-value="p.min_quantity"
                @update:model-value="updateUnitPriceRow(unitIdx, priceIdx, 'min_quantity', $event)"
                placeholder="1.0000"
              />
            </div>

            <div class="md:col-span-3">
              <AppInput
                :id="`u-${unitIdx}-price-${priceIdx}`"
                type="number"
                label="سعر البيع *"
                :model-value="p.price"
                @update:model-value="updateUnitPriceRow(unitIdx, priceIdx, 'price', $event)"
                placeholder="0.0000"
              />
            </div>

            <div class="md:col-span-1 text-left">
              <button
                type="button"
                @click="removeUnitPriceRow(unitIdx, priceIdx)"
                class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                title="حذف السعر"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 4. التبويب الرابع: قواعد إعادة الطلب -->
      <!-- ========================================================= -->
      <div v-show="activeTab === 'reorder'" class="space-y-4">
        <div
          class="flex justify-between items-center bg-surface-ground p-3 rounded-xl border border-surface-border"
        >
          <p class="text-xs text-text-muted">
            حدد قواعد الأمان والحد الأقصى والكمية الموصى بها لكل مستودع لتنبيهك بنواقص المخزون.
          </p>
          <button
            type="button"
            @click="addReorderRule"
            class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
          >
            + إضافة قاعدة مستودع
          </button>
        </div>

        <div
          v-if="!modelValue.reorder_rules || modelValue.reorder_rules.length === 0"
          class="text-center py-8 text-text-muted border-2 border-dashed border-surface-border rounded-xl"
        >
          لا توجد قواعد إعادة طلب معرفة لهذا الصنف.
        </div>

        <div
          v-for="(r, ruleIdx) in modelValue.reorder_rules"
          :key="ruleIdx"
          class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-xl border border-surface-border bg-surface-section shadow-sm"
        >
          <div class="md:col-span-4">
            <AppDropdown
              :id="`reorder-wh-${ruleIdx}`"
              label="المستودع *"
              :model-value="r.warehouse_id"
              :options="warehouses"
              option-label="name"
              option-value="id"
              placeholder="اختر المستودع..."
              @update:model-value="updateReorderRule(ruleIdx, 'warehouse_id', $event)"
            />
          </div>

          <div class="md:col-span-2">
            <AppInput
              :id="`reorder-min-${ruleIdx}`"
              type="number"
              label="حد الأمان (Min) *"
              :model-value="r.min_quantity"
              @update:model-value="updateReorderRule(ruleIdx, 'min_quantity', $event)"
              placeholder="0.0000"
            />
          </div>

          <div class="md:col-span-2">
            <AppInput
              :id="`reorder-max-${ruleIdx}`"
              type="number"
              label="الحد الأقصى (Max) *"
              :model-value="r.max_quantity"
              @update:model-value="updateReorderRule(ruleIdx, 'max_quantity', $event)"
              placeholder="0.0000"
            />
          </div>

          <div class="md:col-span-3">
            <AppInput
              :id="`reorder-qty-${ruleIdx}`"
              type="number"
              label="الكمية الموصى بشرائها *"
              :model-value="r.reorder_quantity"
              @update:model-value="updateReorderRule(ruleIdx, 'reorder_quantity', $event)"
              placeholder="0.0000"
            />
          </div>

          <div class="md:col-span-1 text-left">
            <button
              type="button"
              @click="removeReorderRule(ruleIdx)"
              class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
              title="حذف القاعدة"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  unitsList: { type: Array, default: () => [] },
  priceLists: { type: Array, default: () => [] },
  warehouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'البيانات الأساسية والمحاسبية' },
  { id: 'units', label: 'الوحدات والباركود' },
  { id: 'prices', label: 'أسعار الوحدات' },
  { id: 'reorder', label: 'حد الأمان وإعادة الطلب' },
]

// تحديث الحقول الأساسية للكائن
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// الحصول على اسم الوحدة لعرضها في شاشة الأسعار
const getUnitName = (unitId) => {
  if (!unitId) return ''
  const found = props.unitsList.find((u) => u.id === Number(unitId))
  return found ? found.name : ''
}

// --- إدارة مصفوفة الوحدات ---
const addUnitRow = () => {
  const newUnits = [
    ...props.modelValue.units,
    {
      unit_id: null,
      conversion_factor: 1,
      is_base_unit: false,
      is_purchase_unit: false,
      is_sale_unit: true,
      barcodes: [''],
      prices: [],
    },
  ]
  updateField('units', newUnits)
}

const updateUnitRow = (index, field, value) => {
  const updatedUnits = [...props.modelValue.units]
  updatedUnits[index] = { ...updatedUnits[index], [field]: value }
  updateField('units', updatedUnits)
}

const removeUnitRow = (index) => {
  const updatedUnits = props.modelValue.units.filter((_, i) => i !== index)
  updateField('units', updatedUnits)
}

const setBaseUnit = (selectedIndex) => {
  const updatedUnits = props.modelValue.units.map((u, i) => ({
    ...u,
    is_base_unit: i === selectedIndex,
    conversion_factor: i === selectedIndex ? 1 : u.conversion_factor,
  }))
  updateField('units', updatedUnits)
}

// --- إدارة باركودات الوحدة ---
const addBarcodeToUnit = (unitIdx) => {
  const updatedUnits = [...props.modelValue.units]
  const currentBarcodes = updatedUnits[unitIdx].barcodes || []
  updatedUnits[unitIdx].barcodes = [...currentBarcodes, '']
  updateField('units', updatedUnits)
}

const updateBarcodeValue = (unitIdx, bcIdx, value) => {
  const updatedUnits = [...props.modelValue.units]
  const updatedBarcodes = [...updatedUnits[unitIdx].barcodes]
  updatedBarcodes[bcIdx] = value
  updatedUnits[unitIdx].barcodes = updatedBarcodes
  updateField('units', updatedUnits)
}

const removeBarcodeFromUnit = (unitIdx, bcIdx) => {
  const updatedUnits = [...props.modelValue.units]
  updatedUnits[unitIdx].barcodes = updatedUnits[unitIdx].barcodes.filter((_, i) => i !== bcIdx)
  updateField('units', updatedUnits)
}

// --- إدارة أسعار الوحدة ---
const addPriceToUnit = (unitIdx) => {
  const updatedUnits = [...props.modelValue.units]
  const currentPrices = updatedUnits[unitIdx].prices || []
  updatedUnits[unitIdx].prices = [
    ...currentPrices,
    { price_list_id: null, price: 0, min_quantity: 1 },
  ]
  updateField('units', updatedUnits)
}

const updateUnitPriceRow = (unitIdx, priceIdx, field, value) => {
  const updatedUnits = [...props.modelValue.units]
  const updatedPrices = [...updatedUnits[unitIdx].prices]
  updatedPrices[priceIdx] = { ...updatedPrices[priceIdx], [field]: value }
  updatedUnits[unitIdx].prices = updatedPrices
  updateField('units', updatedUnits)
}

const removeUnitPriceRow = (unitIdx, priceIdx) => {
  const updatedUnits = [...props.modelValue.units]
  updatedUnits[unitIdx].prices = updatedUnits[unitIdx].prices.filter((_, i) => i !== priceIdx)
  updateField('units', updatedUnits)
}

// --- إدارة قواعد إعادة الطلب ---
const addReorderRule = () => {
  const currentRules = props.modelValue.reorder_rules || []
  const updatedRules = [
    ...currentRules,
    { warehouse_id: null, min_quantity: 0, max_quantity: 0, reorder_quantity: 0, is_active: true },
  ]
  updateField('reorder_rules', updatedRules)
}

const updateReorderRule = (ruleIdx, field, value) => {
  const updatedRules = [...(props.modelValue.reorder_rules || [])]
  updatedRules[ruleIdx] = { ...updatedRules[ruleIdx], [field]: value }
  updateField('reorder_rules', updatedRules)
}

const removeReorderRule = (ruleIdx) => {
  const updatedRules = props.modelValue.reorder_rules.filter((_, i) => i !== ruleIdx)
  updateField('reorder_rules', updatedRules)
}
</script>
