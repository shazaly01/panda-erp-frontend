<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">
        إدارة الأدوار وصلاحيات النظام
      </h1>
      <AppButton @click="openNameDialog()"> إضافة دور جديد </AppButton>
    </div>

    <AppCard>
      <AppTable :headers="tableHeaders" :items="roles" :is-loading="loading">
        <template #cell-permissions_count="{ item }">
          <span
            class="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {{ item.permissions?.length || 0 }} صلاحية نشطة
          </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <AppButton
              v-if="item.name !== 'Super Admin'"
              @click="openPermissionsDialog(item)"
              variant="outline"
              size="sm"
            >
              تعديل الصلاحيات
            </AppButton>

            <AppButton
              v-if="!isDefaultRole(item.name)"
              @click="openNameDialog(item)"
              variant="secondary"
              size="sm"
            >
              تعديل الاسم
            </AppButton>

            <AppButton
              v-if="!isDefaultRole(item.name)"
              @click="openDeleteDialog(item)"
              variant="danger"
              size="sm"
            >
              حذف
            </AppButton>
          </div>
        </template>
      </AppTable>
      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <RoleModal
      v-model="isNameDialogVisible"
      :initial-data="selectedRole"
      :is-submitting="loading"
      @submit="handleNameSubmit"
    />

    <RolePermissionsDialog
      v-if="isPermissionsDialogVisible"
      v-model="isPermissionsDialogVisible"
      :role="selectedRole"
      :is-submitting="loading"
      @submit="handlePermissionsSubmit"
    />

    <AppConfirmDialog
      v-model="isConfirmDialogVisible"
      title="تأكيد حذف الدور النظامي"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف دور '${selectedRole?.name}' نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirmed="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات القياسية المشتركة
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

// استيراد مكونات النوافذ المنبثقة وصيانة الصلاحيات الذكية
import RoleModal from './RoleModal.vue'
import RolePermissionsDialog from './RolePermissionsDialog.vue'

const roleStore = useRoleStore()
const { roles, loading, pagination } = storeToRefs(roleStore)
const toast = useToast()

// --- حالة النوافذ والحوارات ---
const isNameDialogVisible = ref(false)
const isPermissionsDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const selectedRole = ref(null)

// --- شحن وتجهيز شجرة البيانات المقادة من قاعدة البيانات ---
onMounted(() => {
  roleStore.fetchRoles()
  roleStore.fetchPermissions() // جلب البنية الشجرية الذكية للصلاحيات ديناميكياً
})

// --- مصفوفة أعمدة جدول العرض ---
const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم الدور الوظيفي' },
  { key: 'permissions_count', label: 'حجم الصلاحيات الممنوحة' },
  { key: 'created_at', label: 'تاريخ الإنشاء والتهيئة' },
  { key: 'actions', label: 'إجراءات صيانة الأمن للوصول', class: 'text-left' },
]

// 🌟 توحيد كامل وشامل لكافة الأدوار المحمية لمنع العبث بالهيكل الأساسي لـ ERP
const isDefaultRole = (roleName) => {
  return ['Super Admin', 'Admin', 'User', 'Employee', 'HR Manager'].includes(roleName)
}

const handlePageChange = (page) => {
  roleStore.fetchRoles(page).catch(() => toast.error('فشل جلب قائمة الأدوار من الخادم.'))
}

// --- دوال التحكم في فتح وإغلاق النوافذ المنبثقة ---
const openNameDialog = (role = null) => {
  selectedRole.value = role
  isNameDialogVisible.value = true
}

const openPermissionsDialog = (role) => {
  selectedRole.value = role
  isPermissionsDialogVisible.value = true
}

const openDeleteDialog = (role) => {
  selectedRole.value = role
  isConfirmDialogVisible.value = true
}

// --- دوال معالجة أحداث التزامن مع الخادم عبر الـ Store ---

const handleNameSubmit = async (formData) => {
  try {
    if (formData.id) {
      await roleStore.editRoleName(formData.id, { name: formData.name })
      toast.success('تم تحديث اسم الدور الوظيفي بنجاح.')
    } else {
      // إرسال مصفوفة فارغة في البداية لتطابق الـ Validation في السيرفر عند الإنشاء الجديد
      await roleStore.createRole({
        name: formData.name,
        permissions: [],
      })
      toast.success('تم إنشاء وحفظ الدور الجديد في النظام بنجاح.')
    }
    isNameDialogVisible.value = false
    await roleStore.fetchRoles(pagination.value.current_page)
  } catch (error) {
    toast.error('حدث خطأ غير متوقع أثناء معالجة وحفظ بيانات الدور.')
    console.error(error)
  }
}

const handlePermissionsSubmit = async (rolePayload) => {
  if (!selectedRole.value) return
  try {
    // 🌟 إصلاح جوهري: نمرر الـ payload الكامل (اسم الدور + مصفوفة مسميات الصلاحيات) المتوقع من دالة الـ Service
    await roleStore.updateRole(selectedRole.value.id, rolePayload)
    toast.success('تم تحديث وصيانة مصفوفة الصلاحيات للدور المختار بنجاح.')
    isPermissionsDialogVisible.value = false
    await roleStore.fetchRoles(pagination.value.current_page)
  } catch (error) {
    toast.error('فشل الخادم في حفظ وتحديث مصفوفة الصلاحيات المحدثة.')
    console.error(error)
  }
}

const handleDeleteConfirm = async () => {
  if (!selectedRole.value) return
  try {
    await roleStore.deleteRole(selectedRole.value.id)
    toast.success('تم حذف الدور وإلغاء ارتباطاته بالكامل من النظام.')
    isConfirmDialogVisible.value = false
    await roleStore.fetchRoles(pagination.value.current_page)
  } catch (error) {
    toast.error('فشل حذف الدور، يرجى التحقق من عدم ارتباط موظفين نشطين به حالياً.')
    console.error(error)
  }
}
</script>
