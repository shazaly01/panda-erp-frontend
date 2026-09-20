<!--src\modules\inventory\views\products\ProductCreateView.vue-->
<template>
  <div class="space-y-4 max-w-7xl mx-auto pb-28">
    <!-- ترويسة بسيطة ومدمجة في سطر واحد دون أي إهدار للمساحة الرأسية -->
    <div class="flex items-center justify-between px-1 py-1">
      <div class="flex items-center gap-2.5">
        <h1 class="text-xl font-bold text-text-primary">إضافة صنف جديد</h1>
        <span class="text-xs text-text-muted hidden sm:inline">• وحدة إدارة المخازن</span>
      </div>
    </div>

    <!-- بطاقة النموذج الرئيسية -->
    <div class="bg-surface-section p-6 rounded-2xl border border-surface-border shadow-sm">
      <!-- حالة تحميل البيانات المرجعية -->
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
        <p class="text-sm text-text-muted">جاري تحميل القوائم المرجعية والخيارات...</p>
      </div>

      <ProductForm
        v-else
        ref="productFormRef"
        v-model="form"
        :categories="categories"
        :units-list="unitsList"
        :price-lists="priceLists"
        :warehouses="warehouses"
      />
    </div>

    <!-- شريط الإجراءات السفلي العائم المعتمد للتحكم -->
    <div
      class="fixed bottom-0 left-0 right-0 z-30 bg-surface-section/95 backdrop-blur-md border-t border-surface-border py-3.5 px-6 shadow-lg"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="text-xs text-text-muted hidden sm:block">
          تلميح: يمكنك الضغط على
          <kbd
            class="px-1.5 py-0.5 bg-surface-ground border border-surface-border rounded font-mono font-bold text-text-primary"
            >Ctrl</kbd
          >
          +
          <kbd
            class="px-1.5 py-0.5 bg-surface-ground border border-surface-border rounded font-mono font-bold text-text-primary"
            >Enter</kbd
          >
          للحفظ السريع.
        </div>

        <div class="flex items-center gap-3 ms-auto">
          <AppButton variant="secondary" @click="cancel" :disabled="isSaving"> إلغاء </AppButton>

          <AppButton
            variant="secondary"
            @click="submit(true)"
            :disabled="isSaving || isLoading"
            class="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20 border-blue-200 dark:border-sky-500/30"
          >
            <span v-if="isSaving && saveMode === 'new'">جاري الحفظ...</span>
            <span v-else>حفظ وإضافة آخر</span>
          </AppButton>

          <AppButton @click="submit(false)" :disabled="isSaving || isLoading">
            <span v-if="isSaving && saveMode === 'close'">جاري الحفظ...</span>
            <span v-else>حفظ وإنهاء</span>
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import axios from '@/services/apiClient'

import AppButton from '@/components/ui/AppButton.vue'
import ProductForm from './components/ProductForm.vue'

const router = useRouter()
const toast = useToast()
const productStore = useProductStore()

const productFormRef = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const saveMode = ref('close')

// القوائم المرجعية
const categories = ref([])
const unitsList = ref([])
const priceLists = ref([])
const warehouses = ref([])

// دالة توليد حالة النموذج الافتراضية
const buildFormData = (previousForm = null) => {
  const defaultPriceListId = priceLists.value[0]?.id || null

  return {
    name: '',
    sku: '',
    aliases: '',
    cost_price: 0,
    description: '',
    is_active: true,

    // الاحتفاظ ببعض الإعدادات من الصنف السابق لتسريع الإدخال المتكرر
    category_id: previousForm ? previousForm.category_id : null,
    type: previousForm ? previousForm.type : 'storable',
    can_be_sold: previousForm ? previousForm.can_be_sold : true,
    can_be_purchased: true,
    valuation_method: previousForm ? previousForm.valuation_method : 'avco',
    tracking_type: previousForm ? previousForm.tracking_type : 'none',
    inventory_policy: previousForm ? previousForm.inventory_policy : 'direct_deduction',

    units: [
      {
        unit_id: null,
        conversion_factor: 1,
        is_base_unit: true,
        is_purchase_unit: true,
        is_sale_unit: previousForm ? previousForm.can_be_sold : true,
        barcodes: [''],
        prices: defaultPriceListId
          ? [{ price_list_id: defaultPriceListId, price: 0, min_quantity: 1 }]
          : [],
      },
    ],
    reorder_rules: [],
  }
}

const form = ref(buildFormData())

// اختصار الحفظ السريع
const handleGlobalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    if (!isSaving.value && !isLoading.value) {
      submit(false)
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown)

  try {
    const [categoriesRes, unitsRes, priceListsRes, warehousesRes] = await Promise.all([
      axios.get('/inventory/categories?is_active=1'),
      axios.get('/inventory/units?is_active=1'),
      axios.get('/inventory/price-lists?is_active=1'),
      axios.get('/inventory/warehouses?is_active=1'),
    ])

    categories.value = categoriesRes.data?.data || categoriesRes.data || []
    unitsList.value = unitsRes.data?.data || unitsRes.data || []
    priceLists.value = priceListsRes.data?.data || priceListsRes.data || []
    warehouses.value = warehousesRes.data?.data || warehousesRes.data || []

    form.value = buildFormData()
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات المرجعية.')
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

const cancel = () => {
  router.push({ name: 'InventoryProductsList' })
}

const submit = async (stayOnPage = false) => {
  if (!form.value.name.trim()) {
    productFormRef.value?.resetToFirstTab()
    productFormRef.value?.focusNameInput()
    return toast.error('حقل اسم الصنف / المنتج مطلوب.')
  }
  if (!form.value.category_id) {
    productFormRef.value?.resetToFirstTab()
    return toast.error('يرجى اختيار تصنيف الصنف.')
  }
  if (!form.value.units || form.value.units.length === 0 || !form.value.units[0].unit_id) {
    return toast.error('يجب اختيار وحدة قياس أساسية للصنف.')
  }

  const baseUnits = form.value.units.filter((u) => u.is_base_unit)
  if (baseUnits.length !== 1) {
    return toast.error('يجب تحديد وحدة أساسية واحدة فقط للصنف.')
  }

  isSaving.value = true
  saveMode.value = stayOnPage ? 'new' : 'close'

  try {
    await productStore.createProduct(form.value)

    if (stayOnPage) {
      toast.success('تم حفظ الصنف بنجاح. يمكنك إدخال الصنف التالي الآن.')

      const previousFormState = { ...form.value }
      form.value = buildFormData(previousFormState)

      productFormRef.value?.resetToFirstTab()
      productFormRef.value?.focusNameInput()

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.success('تمت إضافة الصنف بنجاح.')
      router.push({ name: 'InventoryProductsList' })
    }
  } catch (error) {
    toast.error(productStore.error || 'حدث خطأ أثناء حفظ الصنف.')
  } finally {
    isSaving.value = false
  }
}
</script>
