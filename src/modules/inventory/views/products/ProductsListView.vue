<!--src\modules\inventory\views\products\ProductsListView.vue--->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الشريط العلوي لشاشة قائمة المنتجات -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">الأصناف والمنتجات</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة بطاقات الأصناف، قوائم الأسعار للوحدات، الباركودات، وقواعد حد الأمان وإعادة الطلب
          بالمستودعات.
        </p>
      </div>
      <AppButton
        v-if="authStore.can('inventory.products.create')"
        @click="goToCreatePage"
        icon="plus"
      >
        إضافة صنف جديد
      </AppButton>
    </div>

    <!-- مكون شريط الفلترة والبحث -->
    <ProductsFilter
      v-model:searchQuery="searchQuery"
      v-model:categoryFilter="categoryFilter"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      :categories="categories"
      @update:searchQuery="onSearch"
      @update:categoryFilter="handlePageChange(1)"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- مكون جدول الأصناف مع التصفح -->
    <ProductsTable
      :products="products"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEditPage"
      @delete="openDeleteDialog"
    />

    <!-- حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الصنف"
      :message="`هل أنت متأكد من رغبتك في حذف الصنف (${productToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import axios from '@/services/apiClient'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import ProductsFilter from './components/ProductsFilter.vue'
import ProductsTable from './components/ProductsTable.vue'

// -- تهيئة الـ Router والـ Stores والـ Toast --
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()
const toast = useToast()

const { products, pagination, loading } = storeToRefs(productStore)

// -- البيانات المرجعية للفلاتر --
const categories = ref([])

// -- الفلاتر والبحث --
const searchQuery = ref('')
const categoryFilter = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات وإدارة التصفح (Pagination) --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    category_id: categoryFilter.value,
    type: typeFilter.value,
    is_active: statusFilter.value,
  }

  try {
    await productStore.fetchProducts(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة الأصناف.')
  }
}

// جلب التصنيفات للفلتر وجلب أول صفحة عند تحميل الشاشة
onMounted(async () => {
  try {
    const categoriesRes = await axios.get('/inventory/categories?is_active=1')
    categories.value = categoriesRes.data?.data || categoriesRes.data || []
  } catch (err) {
    console.error('فشل جلب قائمة التصنيفات للفلتر:', err)
  }

  handlePageChange(1)
})

// -- التوجيه لشاشتي الإضافة والتعديل المستقلتين --
const goToCreatePage = () => {
  router.push({ name: 'InventoryProductsCreate' })
}

const goToEditPage = (product) => {
  router.push({ name: 'InventoryProductsEdit', params: { id: product.id } })
}

// -- إدارة الحذف (Delete Dialog State) --
const isDeleteDialogOpen = ref(false)
const productToDelete = ref(null)

const openDeleteDialog = (product) => {
  productToDelete.value = product
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  try {
    await productStore.deleteProduct(productToDelete.value.id)
    toast.success('تم حذف الصنف بنجاح.')

    const targetPage =
      products.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page || 1

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(productStore.error || 'فشل عملية الحذف (قد يكون الصنف مرتبطاً بحركات مخزنية).')
  } finally {
    isDeleteDialogOpen.value = false
    productToDelete.value = null
  }
}
</script>
