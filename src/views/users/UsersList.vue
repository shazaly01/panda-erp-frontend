<template>
  <div class="text-right">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">إدارة مستخدمي النظام</h1>
      <AppButton @click="openUserModal()"> إضافة مستخدم جديد </AppButton>
    </div>

    <UserFilterBar
      :initial-tab="currentTab"
      :initial-search="searchQuery"
      @tab-change="handleTabChange"
      @search-change="handleSearchChange"
    />

    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="users || []"
        :is-loading="loading"
        @row-click="handleRowClick"
      >
        <template #cell-phone="{ item }">
          <span class="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
            {{ item.phone }}
          </span>
        </template>

        <template #cell-username="{ item }">
          <span class="font-mono text-xs text-gray-600 dark:text-slate-400">
            {{ item.username || '---' }}
          </span>
        </template>

        <template #cell-status="{ item }">
          <span
            v-if="item.status === 'pending'"
            class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-500/20"
          >
            بانتظار الاعتماد
          </span>
          <span
            v-else-if="item.status === 'suspended'"
            class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-500/20"
          >
            مجمد / معلق
          </span>
          <span
            v-else
            class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-500/20"
          >
            نشط
          </span>
        </template>

        <template #cell-role="{ item }">
          <span
            v-if="item.roles && item.roles.length > 0"
            class="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {{ item.roles[0].name }}
          </span>
          <span v-else class="text-xs text-gray-400 italic"> لم يعين بعد </span>
        </template>

        <template #cell-created_at="{ item }">
          <span class="text-xs text-gray-500 dark:text-slate-400">
            {{ formatDate(item.created_at) }}
          </span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex justify-end space-x-4 space-x-reverse">
            <template v-if="item.status === 'pending'">
              <button
                @click.stop="openApprovalModal(item)"
                class="font-bold text-sm text-green-500 hover:text-green-700 transition-colors"
              >
                اعتماد وتفعيل
              </button>
            </template>

            <template v-else>
              <button
                @click.stop="openUserModal(item)"
                class="font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              >
                تعديل
              </button>

              <button
                v-if="!hasSuperAdminRole(item)"
                @click.stop="handleToggleStatus(item)"
                :class="[
                  'font-bold text-sm transition-colors',
                  item.status === 'active'
                    ? 'text-amber-500 hover:text-amber-700'
                    : 'text-emerald-500 hover:text-emerald-700',
                ]"
              >
                {{ item.status === 'active' ? 'تعليق الحساب' : 'إلغاء التعليق' }}
              </button>

              <button
                v-if="!hasSuperAdminRole(item)"
                @click.stop="openDeleteDialog(item)"
                class="font-semibold text-danger hover:text-red-700 transition-colors"
              >
                حذف
              </button>
            </template>
          </div>
        </template>
      </AppTable>

      <AppPagination :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <UserModal
      v-model="isModalOpen"
      :user="selectedUser"
      :is-saving="isSaving"
      @save="handleSaveUser"
    />

    <UserApprovalModal
      v-model="isApprovalModalOpen"
      :user="userToApprove"
      :is-approving="isApproving"
      @approve="handleUserApproval"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المستخدم"
      :message="`هل أنت متأكد من رغبتك في حذف المستخدم '${userToDelete?.full_name}'؟`"
      @confirmed="deleteSelectedUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات القياسية المشتركة للمشروع
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

// استيراد المكونات المقسمة والمصممة حديثاً
import UserModal from './UserModal.vue'
import UserFilterBar from './UserFilterBar.vue'
import UserApprovalModal from './UserApprovalModal.vue'

const userStore = useUserStore()
const { users, loading, pagination, filters } = storeToRefs(userStore)
const toast = useToast()

const currentTab = ref(filters.value.status || 'active')
const searchQuery = ref(filters.value.search || '')

// هندسة هيكلية أعمدة الجدول ديناميكياً بحسب التبويب النشط
const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'full_name', label: 'الاسم الكامل' },
    { key: 'phone', label: 'رقم الهاتف' },
    { key: 'username', label: 'اسم المستخدم' },
    { key: 'status', label: 'الحالة' },
  ]
  // إخفاء عمود الدور في طلبات الانتظار لتوفير المساحة حيث أنها حسابات خالية من الأدوار حتى لحظة الاعتماد
  if (currentTab.value !== 'pending') {
    headers.push({ key: 'role', label: 'الدور' })
  }
  headers.push({ key: 'created_at', label: 'تاريخ الإنشاء' })
  headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left' })
  return headers
})

const hasSuperAdminRole = (user) => {
  return user.roles && user.roles.some((role) => role.name === 'Super Admin')
}

const handleTabChange = (tab) => {
  currentTab.value = tab
  userStore.fetchUsers(1, { status: tab })
}

const handleSearchChange = (query) => {
  searchQuery.value = query
  userStore.fetchUsers(1, { search: query })
}

const handlePageChange = (page) => {
  userStore.fetchUsers(page).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات المستخدمين من السيرفر.')
  })
}

onMounted(() => {
  userStore.fetchUsers(1, { status: currentTab.value, search: searchQuery.value })
})

const handleRowClick = (user) => {
  if (user.status === 'pending') {
    openApprovalModal(user)
  } else {
    openUserModal(user)
  }
}

// --- [قسم التحكم بالحسابات القياسية النشطة] ---
const isModalOpen = ref(false)
const selectedUser = ref(null)
const isSaving = ref(false)

const openUserModal = (user = null) => {
  if (user && hasSuperAdminRole(user)) {
    toast.info('لا يمكن تعديل مستخدم Super Admin الحرج.')
    return
  }
  selectedUser.value = user
  isModalOpen.value = true
}

const handleSaveUser = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await userStore.updateUser(formData.id, formData)
      toast.success(`تم تعديل بيانات المستخدم '${formData.full_name}' بنجاح.`)
    } else {
      await userStore.createUser(formData)
      toast.success(
        `تمت إضافة المستخدم المعلق '${formData.full_name}' بنجاح وبانتظار تفعيل كلمته المرورية.`,
      )
    }
    await userStore.fetchUsers(pagination.value.current_page || 1)
    isModalOpen.value = false
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء معالجة وحفظ البيانات.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}

// --- [قسم معالجة وتعليق/تجميد وتنشيط الحسابات] ---
const handleToggleStatus = async (user) => {
  try {
    const response = await userStore.toggleUserStatus(user.id)
    toast.success(response.message || 'تم تحديث حالة الحساب بنجاح.')
    // إعادة جلب الصفحة الحالية لتحديث البيانات واختفاء الموظف من التبويب الحالي طبقاً لحالته الجديدة
    await userStore.fetchUsers(pagination.value.current_page || 1)
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء محاولة تغيير حالة الحساب.'
    toast.error(message)
  }
}

// --- [قسم معالجة واعتماد طلبات الانتظار عبر المكون المنفصل] ---
const isApprovalModalOpen = ref(false)
const isApproving = ref(false)
const userToApprove = ref(null)

const openApprovalModal = (user) => {
  userToApprove.value = user
  isApprovalModalOpen.value = true
}

const handleUserApproval = async (payload) => {
  if (!userToApprove.value) return
  isApproving.value = true
  try {
    await userStore.approveUser(userToApprove.value.id, payload)
    toast.success(`تم اعتماد حساب الموظف '${userToApprove.value.full_name}' وتنشيطه بالمنظومة.`)
    await userStore.fetchUsers(pagination.value.current_page || 1)
    isApprovalModalOpen.value = false
  } catch (error) {
    const message = error.response?.data?.message || 'فشل تفعيل الحساب وتعيين الصلاحيات.'
    toast.error(message)
  } finally {
    isApproving.value = false
  }
}

// --- [قسم الحذف] ---
const isDeleteDialogOpen = ref(false)
const userToDelete = ref(null)

const openDeleteDialog = (user) => {
  userToDelete.value = user
  isDeleteDialogOpen.value = true
}

const deleteSelectedUser = async () => {
  if (userToDelete.value) {
    try {
      await userStore.deleteUser(userToDelete.value.id)
      toast.success(`تم حذف المستخدم '${userToDelete.value.full_name}' بنجاح.`)
      await userStore.fetchUsers(pagination.value.current_page || 1)
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء محاولة حذف الحساب.'
      toast.error(message)
    } finally {
      userToDelete.value = null
      isDeleteDialogOpen.value = false
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '---'
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
