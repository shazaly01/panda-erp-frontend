<!--src\modules\inventory\views\products\ProductEditView.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الشريط العلوي لشاشة التعديل -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-6 rounded-2xl border border-surface-border shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold text-text-primary">تعديل الصنف: {{ form.name || '...' }}</h1>
        <p class="text-sm text-text-muted mt-1">
          تحديث بيانات الصنف، تغيير أسعار الوحدات، أو تعديل قواعد إعادة الطلب والباركود.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <AppButton variant="secondary" @click="cancel" :disabled="isSaving"> إلغاء </AppButton>
        <AppButton @click="submit" :disabled="isSaving || isLoading">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>حفظ التعديلات</span>
        </AppButton>
      </div>
    </div>

    <!-- بطاقة النموذج الرئيسية -->
    <div class="bg-surface-section p-6 rounded-2xl border border-surface-border shadow-sm">
      <!-- حالة تحميل بيانات الصنف والقوائم -->
      <div v-if="isLoading" class="py-16 text-center">
        <svg
          class="animate-spin h-10 w-10 text-blue-600 dark:text-sky-400 mx-auto mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="text-sm text-text-muted">جاري تحميل بيانات الصنف والقوائم المرجعية...</p>
      </div>

      <ProductForm
        v-else
        v-model="form"
        :categories="categories"
        :units-list="unitsList"
        :price-lists="priceLists"
        :warehouses="warehouses"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import axios from '@/services/apiClient'

import AppButton from '@/components/ui/AppButton.vue'
import ProductForm from './components/ProductForm.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const productStore = useProductStore()

const productId = route.params.id
const isLoading = ref(true)
const isSaving = ref(false)

// القوائم المرجعية
const categories = ref([])
const unitsList = ref([])
const priceLists = ref([])
const warehouses = ref([])

const form = ref({
  name: '',
  sku: '',
  category_id: null,
  type: 'storable',
  valuation_method: 'avco',
  tracking_type: 'none',
  inventory_policy: 'direct_deduction',
  cost_price: 0,
  description: '',
  is_active: true,
  units: [],
  reorder_rules: [],
})

// تحويل كائن البيانات القادم من الـ API إلى الهيكل المتوافق مع Form Request
const mapProductToForm = (p) => {
  return {
    name: p.name || '',
    sku: p.sku || '',
    category_id: p.category_id || null,
    type: p.type || 'storable',
    valuation_method: p.valuation_method || 'avco',
    tracking_type: p.tracking_type || 'none',
    inventory_policy: p.inventory_policy || 'direct_deduction',
    cost_price: p.cost_price || 0,
    description: p.description || '',
    is_active: p.is_active ?? true,
    units: p.units?.length
      ? p.units.map((u) => ({
          unit_id: u.unit_id,
          conversion_factor: u.conversion_factor,
          is_base_unit: u.is_base_unit,
          is_purchase_unit: u.is_purchase_unit,
          is_sale_unit: u.is_sale_unit,
          barcodes: u.barcodes?.length ? [...u.barcodes] : [''],
          prices: u.prices?.length
            ? u.prices.map((pr) => ({
                price_list_id: pr.price_list_id,
                price: pr.price,
                min_quantity: pr.min_quantity,
              }))
            : [],
        }))
      : [
          {
            unit_id: null,
            conversion_factor: 1,
            is_base_unit: true,
            is_purchase_unit: true,
            is_sale_unit: true,
            barcodes: [''],
            prices: [],
          },
        ],
    reorder_rules: p.reorder_rules?.length
      ? p.reorder_rules.map((r) => ({
          warehouse_id: r.warehouse_id,
          min_quantity: r.min_quantity,
          max_quantity: r.max_quantity,
          reorder_quantity: r.reorder_quantity,
          is_active: r.is_active ?? true,
        }))
      : [],
  }
}

onMounted(async () => {
  try {
    const [categoriesRes, unitsRes, priceListsRes, warehousesRes, productData] = await Promise.all([
      axios.get('/inventory/categories?is_active=1'),
      axios.get('/inventory/units?is_active=1'),
      axios.get('/inventory/price-lists?is_active=1'),
      axios.get('/inventory/warehouses?is_active=1'),
      productStore.fetchProduct(productId),
    ])

    categories.value = categoriesRes.data?.data || categoriesRes.data || []
    unitsList.value = unitsRes.data?.data || unitsRes.data || []
    priceLists.value = priceListsRes.data?.data || priceListsRes.data || []
    warehouses.value = warehousesRes.data?.data || warehousesRes.data || []

    if (productData) {
      form.value = mapProductToForm(productData)
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل بيانات الصنف والقوائم.')
  } finally {
    isLoading.value = false
  }
})

const cancel = () => {
  router.push({ name: 'InventoryProductsList' })
}

const submit = async () => {
  if (!form.value.name.trim()) {
    return toast.error('حقل اسم المنتج مطلوب.')
  }
  if (!form.value.units || form.value.units.length === 0 || !form.value.units[0].unit_id) {
    return toast.error('يجب إضافة وحدة قياس واحدة على الأقل للصنف.')
  }

  const baseUnits = form.value.units.filter((u) => u.is_base_unit)
  if (baseUnits.length !== 1) {
    return toast.error('يجب تحديد وحدة أساسية واحدة فقط للصنف.')
  }

  isSaving.value = true
  try {
    await productStore.updateProduct(productId, form.value)
    toast.success('تم تحديث بيانات الصنف بنجاح.')
    router.push({ name: 'InventoryProductsList' })
  } catch (error) {
    toast.error(productStore.error || 'حدث خطأ أثناء حفظ التعديلات.')
  } finally {
    isSaving.value = false
  }
}
</script>
