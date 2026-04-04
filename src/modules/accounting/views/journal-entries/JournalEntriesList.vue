<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">القيود اليومية</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة العمليات المحاسبية، المسودات، والقيود المُرحلة
        </p>
      </div>
      <AppButton v-if="authStore.can('journal_entry.create')" @click="goToCreatePage">
        إضافة قيد جديد
      </AppButton>
    </div>

    <JournalEntriesFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
      @update:startDate="handlePageChange(1)"
      @update:endDate="handlePageChange(1)"
    />

    <JournalEntriesTable
      :journal-entries="entries"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @view="openViewModal"
      @edit="goToEditPage"
      @post="openPostDialog"
      @delete="openDeleteDialog"
    />

    <JournalEntryViewModal
      v-if="isViewModalOpen"
      v-model="isViewModalOpen"
      :entry-id="selectedEntry?.id"
    />

    <AppConfirmDialog
      v-model="isPostDialogOpen"
      title="تأكيد ترحيل القيد"
      :message="`هل أنت متأكد من رغبتك في ترحيل القيد للاعتماد؟ لا يمكن التعديل عليه أو حذفه بعد الترحيل.`"
      confirm-text="ترحيل واعتماد"
      confirm-variant="primary"
      @confirmed="postSelectedEntry"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف مسودة القيد"
      :message="`هل أنت متأكد من رغبتك في حذف مسودة القيد المحاسبي بشكل نهائي؟`"
      @confirmed="deleteSelectedEntry"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useJournalEntryStore } from '@/modules/accounting/stores/journalEntryStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import JournalEntriesFilter from './JournalEntriesFilter.vue'
import JournalEntriesTable from './JournalEntriesTable.vue'
import JournalEntryViewModal from './components/JournalEntryViewModal.vue'

// -- إدارة الحالة --
const router = useRouter()
const authStore = useAuthStore()
const journalStore = useJournalEntryStore()
const toast = useToast()

const { entries, pagination, loading } = storeToRefs(journalStore)

// -- الفلاتر --
const searchQuery = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    status: statusFilter.value,
    start_date: startDate.value,
    end_date: endDate.value,
  }

  try {
    await journalStore.fetchEntries(filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قائمة القيود.')
  }
}

onMounted(() => {
  handlePageChange()
})

// -- التنقل لصفحات الإدخال والتعديل (Full Page) --
const goToCreatePage = () => {
  router.push({ name: 'journal-entries.create' })
}

const goToEditPage = (entry) => {
  if (entry.status === 'posted') {
    toast.warning('القيود المُرحلة غير قابلة للتعديل.')
    return
  }
  router.push({ name: 'journal-entries.edit', params: { id: entry.id } })
}

// -- نافذة العرض السريعة --
const isViewModalOpen = ref(false)
const selectedEntry = ref(null)

const openViewModal = (entry) => {
  selectedEntry.value = entry
  isViewModalOpen.value = true
}

// -- إدارة الترحيل (Posting) --
const isPostDialogOpen = ref(false)
const entryToPost = ref(null)

const openPostDialog = (entry) => {
  entryToPost.value = entry
  isPostDialogOpen.value = true
}

const postSelectedEntry = async () => {
  if (entryToPost.value) {
    try {
      await journalStore.postEntry(entryToPost.value.id)
      toast.success('تم ترحيل القيد واعتماده بنجاح.')
      await handlePageChange(pagination.value?.current_page || 1)
    } catch (error) {
      toast.error(journalStore.error || 'حدث خطأ أثناء ترحيل القيد.')
    } finally {
      isPostDialogOpen.value = false
      entryToPost.value = null
    }
  }
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const entryToDelete = ref(null)

const openDeleteDialog = (entry) => {
  if (entry.status === 'posted') {
    toast.warning('لا يمكن حذف القيود المُرحلة.')
    return
  }
  entryToDelete.value = entry
  isDeleteDialogOpen.value = true
}

const deleteSelectedEntry = async () => {
  if (entryToDelete.value) {
    try {
      await journalStore.deleteEntry(entryToDelete.value.id)
      toast.success('تم حذف المسودة بنجاح.')

      const targetPage =
        entries.value.length === 0 && pagination.value?.current_page > 1
          ? pagination.value.current_page - 1
          : pagination.value.current_page

      await handlePageChange(targetPage)
    } catch (error) {
      toast.error(journalStore.error || 'فشل الحذف.')
    } finally {
      isDeleteDialogOpen.value = false
      entryToDelete.value = null
    }
  }
}
</script>
