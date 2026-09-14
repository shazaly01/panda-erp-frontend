<!--src/modules/sales/views/customers/CustomersList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- رأس الصفحة وإجراء إضافة عميل جديد -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">إدارة العملاء</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة ملفات العملاء وجهات البيع، تتبع الحدود الائتمانية، فترات التحصيل، والبيانات الضريبية
          والتجارية.
        </p>
      </div>
      <AppButton v-if="authStore.can('core.partners.create')" @click="openCreateModal" icon="plus">
        إضافة عميل جديد
      </AppButton>
    </div>

    <!-- شريط البحث والتصفية -->
    <CustomersFilter
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
    />

    <!-- جدول عرض العملاء والترقيم -->
    <CustomersTable
      :customers="customers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة الإضافة والتعديل المنبثقة -->
    <CustomerModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :customer-to-edit="customerToEdit"
      @saved="onCustomerSaved"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف العميل"
      :message="`هل أنت متأكد من رغبتك في حذف العميل (${customerToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء (لن يتم الحذف إذا كانت هناك فواتير، سندات، أو أرصدة وحركات بيع مرتبطة به).`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import CustomersFilter from './components/CustomersFilter.vue'
import CustomersTable from './components/CustomersTable.vue'
import CustomerModal from './components/CustomerModal.vue'

// -- تهيئة الـ Stores والتنبيهات --
const authStore = useAuthStore()
const customerStore = useCustomerStore()
const toast = useToast()

const { customers, pagination, loading } = storeToRefs(customerStore)

// -- الفلاتر والبحث --
const searchQuery = ref('')
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
    search: searchQuery.value,
    type: typeFilter.value,
    status: statusFilter.value,
  }

  try {
    await customerStore.fetchCustomers(page, filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل قائمة العملاء.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const customerToEdit = ref(null)

const openCreateModal = () => {
  customerToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (customer) => {
  customerToEdit.value = customer
  isModalOpen.value = true
}

const onCustomerSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const customerToDelete = ref(null)

const openDeleteDialog = (customer) => {
  customerToDelete.value = customer
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!customerToDelete.value) return

  try {
    await customerStore.deleteCustomer(customerToDelete.value.id)
    toast.success('تم حذف العميل بنجاح.')

    const targetPage =
      customers.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(customerStore.error || 'فشلت عملية حذف العميل.')
  } finally {
    isDeleteDialogOpen.value = false
    customerToDelete.value = null
  }
}
</script>
