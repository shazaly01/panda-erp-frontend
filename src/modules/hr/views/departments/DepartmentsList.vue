<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">الهيكل التنظيمي (الإدارات والأقسام)</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة الهيكل الإداري للمنشأة، وتحديد المستويات التنظيمية وارتباطاتها المحاسبية.
        </p>
      </div>
      <AppButton
        v-if="authStore.can('department.create')"
        @click="openCreateModal(null)"
        icon="plus"
      >
        إضافة إدارة رئيسية
      </AppButton>
    </div>

    <DepartmentsTreeView
      :departments="departmentTree"
      :loading="loading"
      @add-child="handleAddChild"
      @edit="openEditModal"
      @delete="openDeleteDialog"
    />

    <DepartmentModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :department-to-edit="departmentToEdit"
      :initial-parent-id="initialParentId"
      @saved="onDepartmentSaved"
    />

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
  // عند الضغط على إضافة فرع من داخل الشجرة
  openCreateModal(parentNode.id)
}

const openEditModal = (department) => {
  departmentToEdit.value = department
  initialParentId.value = null
  isModalOpen.value = true
}

const onDepartmentSaved = async () => {
  // لا نحتاج لاستدعاء fetch هنا لأن הـ Store يقوم بذلك داخلياً في دوال create/update
  // ولكن يمكن وضع أي منطق إضافي هنا إذا لزم الأمر مستقبلاً
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
    // הـ Store يقوم بإرجاع الخطأ (مثال: لو الإدارة لها موظفين)
    toast.error(departmentStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    departmentToDelete.value = null
  }
}
</script>
