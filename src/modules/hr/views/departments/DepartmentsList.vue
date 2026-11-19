<!-- src/modules/hr/views/departments/DepartmentsList.vue -->
<template>
  <div class="space-y-3 max-w-7xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>الهيكل التنظيمي (الإدارات والأقسام)</span>
        </h1>
        <span
          v-if="departmentTree?.length"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
          title="عدد الإدارات الرئيسية"
        >
          {{ departmentTree.length }}
        </span>
      </div>

      <AppButton
        v-if="authStore.can('department.create')"
        size="sm"
        @click="openCreateModal(null)"
        icon="plus"
      >
        إضافة إدارة رئيسية
      </AppButton>
    </div>

    <!-- شجرة الإدارات والأقسام -->
    <DepartmentsTreeView
      :departments="departmentTree"
      :loading="loading"
      @add-child="handleAddChild"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <!-- نافذة إضافة / تعديل إدارة -->
    <DepartmentModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :department-to-edit="departmentToEdit"
      :initial-parent-id="initialParentId"
      @saved="onDepartmentSaved"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الإدارة"
      :message="`هل أنت متأكد من رغبتك في حذف ${departmentToDelete?.name}؟ لا يمكن التراجع عن هذا الإجراء (لن يتم الحذف إذا كان هناك موظفون أو أقسام فرعية مرتبطة).`"
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
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import DepartmentsTreeView from './components/DepartmentsTreeView.vue'
import DepartmentModal from './components/DepartmentModal.vue'

// -- تهيئة الـ Stores --
const authStore = useAuthStore()
const departmentStore = useDepartmentStore()
const toast = useToast()

const { departmentTree, loading } = storeToRefs(departmentStore)

// -- جلب البيانات عند تحميل الصفحة --
onMounted(async () => {
  await departmentStore.fetchDepartments()
})

// -- إدارة النافذة المنبثقة (Modal State) --
const isModalOpen = ref(false)
const departmentToEdit = ref(null)
const initialParentId = ref(null)

const openCreateModal = (parentId = null) => {
  departmentToEdit.value = null
  initialParentId.value = parentId
  isModalOpen.value = true
}

const handleAddChild = (parentNode) => {
  openCreateModal(parentNode.id)
}

const openEditModal = (department) => {
  departmentToEdit.value = department
  initialParentId.value = null
  isModalOpen.value = true
}

const onDepartmentSaved = async () => {
  // الـ Store يقوم بتحديث الشجرة داخلياً بعد الحفظ
}

// -- إدارة الحذف (Delete State) --
const isDeleteDialogOpen = ref(false)
const departmentToDelete = ref(null)

const openDeleteDialog = (department) => {
  departmentToDelete.value = department
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!departmentToDelete.value) return

  try {
    await departmentStore.deleteDepartment(departmentToDelete.value.id)
    toast.success('تم حذف الإدارة بنجاح.')
  } catch (error) {
    toast.error(departmentStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    departmentToDelete.value = null
  }
}
</script>
