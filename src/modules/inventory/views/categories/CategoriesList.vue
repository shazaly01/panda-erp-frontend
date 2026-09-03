<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">تصنيفات الأصناف</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة هيكل تصنيفات الأصناف والمواد بالمخازن وتحديد العلاقات الهرمية بينها.
        </p>
      </div>
      <AppButton v-if="authStore.can('category.create')" @click="openCreateModal(null)" icon="plus">
        إضافة تصنيف رئيسي
      </AppButton>
    </div>

    <CategoriesTreeView
      :categories="categoryTree"
      :loading="loading"
      @add-child="handleAddChild"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <CategoryModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :category-to-edit="categoryToEdit"
      :initial-parent-id="initialParentId"
      @saved="onCategorySaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف التصنيف"
      :message="`هل أنت متأكد من رغبتك في حذف تصنيف (${categoryToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء (لن يتم الحذف إذا كان مرتبطاً بأصناف أو تصنيفات فرعية).`"
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
import { useCategoryStore } from '@/modules/inventory/stores/categoryStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import CategoriesTreeView from './components/CategoriesTreeView.vue'
import CategoryModal from './components/CategoryModal.vue'

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const { categoryTree, loading } = storeToRefs(categoryStore)

onMounted(async () => {
  await categoryStore.fetchCategories()
})

const isModalOpen = ref(false)
const categoryToEdit = ref(null)
const initialParentId = ref(null)

const openCreateModal = (parentId = null) => {
  categoryToEdit.value = null
  initialParentId.value = parentId
  isModalOpen.value = true
}

const handleAddChild = (parentNode) => {
  openCreateModal(parentNode.id)
}

const openEditModal = (category) => {
  categoryToEdit.value = category
  initialParentId.value = null
  isModalOpen.value = true
}

const onCategorySaved = async () => {
  // الـ Store يقوم بإعادة التحميل تلقائياً عند الإضافة أو التحديث
}

const isDeleteDialogOpen = ref(false)
const categoryToDelete = ref(null)

const openDeleteDialog = (category) => {
  categoryToDelete.value = category
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!categoryToDelete.value) return

  try {
    await categoryStore.deleteCategory(categoryToDelete.value.id)
    toast.success('تم حذف التصنيف بنجاح.')
  } catch (error) {
    toast.error(categoryStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    categoryToDelete.value = null
  }
}
</script>
