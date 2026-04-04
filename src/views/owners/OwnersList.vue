<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة الجهات المالكة</h1>
      <AppButton v-if="authStore.can('owner.create')" @click="openOwnerModal()">
        إضافة جهة مالكة
      </AppButton>
    </div>

    <AppCard>
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div class="relative w-full md:w-96">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث باسم الجهة المالكة..."
            class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all sm:text-sm"
            @input="onSearch"
          />
        </div>

        <div class="text-sm text-text-muted">إجمالي الجهات: {{ pagination?.total || 0 }}</div>
      </div>

      <AppTable :headers="tableHeaders" :items="owners" :is-loading="loading">
        <template #cell-created_at="{ item }">
          <span dir="ltr" class="text-text-muted text-sm">{{ item.created_at }}</span>
        </template>

        <template #cell-actions="{ item }">
          <div class="flex items-center space-x-2 space-x-reverse">
            <button
              v-if="authStore.can('owner.update')"
              @click.stop="openOwnerModal(item)"
              class="p-1 font-medium text-sky-500 hover:text-sky-400 transition-colors"
              title="تعديل"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 100 2h12a1 1 0 100-2H3z"
                ></path>
              </svg>
            </button>

            <button
              v-if="authStore.can('owner.delete')"
              @click.stop="openDeleteDialog(item)"
              class="p-1 font-medium text-rose-500 hover:text-rose-400 transition-colors"
              title="حذف"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </template>
      </AppTable>

      <AppPagination v-if="pagination" :meta="pagination" @page-change="handlePageChange" />
    </AppCard>

    <OwnerModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :owner="selectedOwner"
      :is-saving="isSaving"
      @save="handleSaveOwner"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الجهة المالكة"
      :message="`هل أنت متأكد من رغبتك في حذف '${ownerToDelete?.name}'؟`"
      @confirmed="deleteSelectedOwner"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOwnerStore } from '@/stores/ownerStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import OwnerModal from './OwnerModal.vue'

const ownerStore = useOwnerStore()
const authStore = useAuthStore()
const { owners, loading, pagination } = storeToRefs(ownerStore)
const toast = useToast()

const searchQuery = ref('')
let searchTimeout = null

const tableHeaders = computed(() => {
  const headers = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'اسم الجهة المالكة' },
    { key: 'created_at', label: 'تاريخ الإضافة' },
  ]

  if (authStore.can('owner.update') || authStore.can('owner.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left' })
  }
  return headers
})

const handlePageChange = (page = 1) => {
  ownerStore.fetchOwners(page, searchQuery.value).catch(() => {
    toast.error('حدث خطأ أثناء جلب بيانات الجهات المالكة.')
  })
}

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

onMounted(() => {
  handlePageChange()
})

const isModalOpen = ref(false)
const selectedOwner = ref(null)
const isSaving = ref(false)

const openOwnerModal = (owner = null) => {
  if (owner && !authStore.can('owner.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذه البيانات.')
    return
  }
  selectedOwner.value = owner ? { ...owner } : null
  isModalOpen.value = true
}

const handleSaveOwner = async (formData) => {
  isSaving.value = true
  try {
    if (formData.id) {
      await ownerStore.updateOwner(formData.id, formData)
      toast.success(`تم تعديل '${formData.name}' بنجاح.`)
    } else {
      await ownerStore.createOwner(formData)
      toast.success(`تمت إضافة '${formData.name}' بنجاح.`)
    }

    // التعديل الثاني: إغلاق النافذة فوراً بعد النجاح
    isModalOpen.value = false

    // التعديل الثالث: استخدام ?. لمنع الخطأ إذا كان الـ pagination غير جاهز
    const currentPage = pagination.value?.current_page || 1
    await handlePageChange(currentPage)
  } catch (error) {
    const errorMessage = ownerStore.error || 'حدث خطأ أثناء حفظ البيانات.'
    toast.error(errorMessage)
  } finally {
    isSaving.value = false
  }
}

const isDeleteDialogOpen = ref(false)
const ownerToDelete = ref(null)

const openDeleteDialog = (owner) => {
  ownerToDelete.value = owner
  isDeleteDialogOpen.value = true
}

const deleteSelectedOwner = async () => {
  if (ownerToDelete.value) {
    try {
      await ownerStore.deleteOwner(ownerToDelete.value.id)
      toast.success(`تم حذف '${ownerToDelete.value.name}' بنجاح.`)

      // التعديل الرابع: حماية قراءة الصفحة الحالية
      const currentPage = pagination.value?.current_page || 1

      if (owners.value.length === 1 && currentPage > 1) {
        await handlePageChange(currentPage - 1)
      } else {
        await handlePageChange(currentPage)
      }
    } catch (error) {
      const errorMessage =
        ownerStore.error || error.response?.data?.message || 'حدث خطأ أثناء الحذف.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      ownerToDelete.value = null
    }
  }
}
</script>
