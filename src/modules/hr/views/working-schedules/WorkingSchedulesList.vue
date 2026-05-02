<!--src\modules\hr\views\working-schedules\WorkingSchedulesList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- الترويسة -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">قوالب الجدولة ودورات العمل</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة قوالب الدوام، دورات العمل، وتعيين الورديات للأيام.
        </p>
      </div>
      <AppButton
        v-if="authStore.can('hr.working_schedules.create')"
        @click="goToCreate"
        icon="plus"
      >
        إنشاء قالب جديد
      </AppButton>
    </div>

    <!-- الفلتر -->
    <WorkingSchedulesFilter
      v-model:searchQuery="filters.search"
      v-model:type="filters.type"
      @update:searchQuery="onFilterChange"
      @update:type="onFilterChange"
    />

    <!-- الجدول -->
    <WorkingSchedulesTable
      :schedules="schedules"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="goToEdit"
      @delete="openDeleteDialog"
    />

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف القالب"
      :message="`هل أنت متأكد من رغبتك في حذف قالب (${scheduleToDelete?.name})؟ إذا كان مرتبطاً بعقود موظفين، سيتم رفض الحذف من الخادم.`"
      confirm-text="حذف نهائي"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import { useAuthStore } from '@/stores/authStore'
import { useWorkingScheduleStore } from '@/modules/hr/stores/workingScheduleStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import WorkingSchedulesFilter from './components/WorkingSchedulesFilter.vue'
import WorkingSchedulesTable from './components/WorkingSchedulesTable.vue'

// -- تهيئة --
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const workingScheduleStore = useWorkingScheduleStore()

const { schedules, pagination, loading } = storeToRefs(workingScheduleStore)

// -- الفلاتر --
const filters = reactive({
  search: '',
  type: '', // مثلاً fixed, rotating
})

let searchTimeout = null

const onFilterChange = () => {
  workingScheduleStore.loading = true
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات --
const handlePageChange = async (page = 1) => {
  try {
    await workingScheduleStore.fetchSchedules({ page, ...filters })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب قوالب الجدولة.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- التوجيه (Navigation) --
const goToCreate = () => {
  router.push({ name: 'working-schedules.create' })
}

const goToEdit = (schedule) => {
  router.push({ name: 'working-schedules.edit', params: { id: schedule.id } })
}

// -- إدارة الحذف --
const isDeleteDialogOpen = ref(false)
const scheduleToDelete = ref(null)

const openDeleteDialog = (schedule) => {
  scheduleToDelete.value = schedule
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!scheduleToDelete.value) return

  try {
    await workingScheduleStore.deleteSchedule(scheduleToDelete.value.id)
    toast.success('تم حذف القالب بنجاح.')

    const targetPage =
      schedules.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch (error) {
    toast.error(workingScheduleStore.error || 'فشل عملية الحذف، قد يكون القالب مستخدماً.')
  } finally {
    isDeleteDialogOpen.value = false
    scheduleToDelete.value = null
  }
}
</script>
