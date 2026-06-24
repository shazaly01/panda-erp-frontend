<!---src\modules\hr\views\internships\InternshipApplicationsList.vue-->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn p-4 sm:p-6 text-right" dir="rtl">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5"
    >
      <div>
        <h1 class="text-2xl font-black text-slate-100 tracking-tight">
          إدارة برنامج التدريب الأكاديمي
        </h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">
          مراجعة وفرز طلبات التدريب الخارجية، وإدارة شؤون المتدربين النشطين وسجلات الأرشيف من شاشة
          موحدة.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div
          class="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1 gap-1 shadow-inner"
        >
          <button
            @click="openPublicLink"
            type="button"
            class="px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1.5 border border-transparent shadow-sm"
          >
            <span>فتح رابط التقديم 🔗</span>
          </button>

          <div class="w-[1px] h-4 bg-slate-800"></div>

          <button
            @click="copyPublicLink"
            type="button"
            class="px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1.5 border border-transparent"
            title="نسخ رابط التقديم الخارجي للمتدربين"
          >
            <span>نسخ الرابط 📋</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-2">
      <button
        @click="switchStatusFilter('pending')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'pending'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        طلبات التقديم المعلقة ⏳
      </button>

      <button
        @click="switchStatusFilter('approved')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'approved'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        المتدربين النشطين حالياً 🟢
      </button>

      <button
        @click="switchStatusFilter('rejected')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'rejected'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-md shadow-rose-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        الطلبات المرفوضة ❌
      </button>
    </div>

    <InternshipApplicationsFilter
      v-model:searchQuery="searchQuery"
      v-model:institutionFilter="institutionFilter"
      @update:searchQuery="onSearch"
      @update:institutionFilter="handlePageChange(1)"
    />

    <InternshipApplicationsTable
      :applications="currentData"
      :pagination="currentPagination"
      :loading="loading"
      :current-status="currentStatus"
      @page-change="handlePageChange"
      @row-click="openApplicationDetails"
    />

    <InternshipApplicationModal
      v-if="isModalOpen"
      v-model:isOpen="isModalOpen"
      :application="selectedApplication"
      :status-type="currentStatus"
      @refresh="onApplicationProcessed"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useInternshipStore } from '@/modules/hr/stores/internshipStore'

import InternshipApplicationsFilter from './components/InternshipApplicationsFilter.vue'
import InternshipApplicationsTable from './components/InternshipApplicationsTable.vue'
import InternshipApplicationModal from './components/InternshipApplicationModal.vue'

const internshipStore = useInternshipStore()
const toast = useToast()

const {
  pendingApplications,
  activeInterns,
  rejectedApplications,
  applicationsPagination,
  internsPagination,
  rejectedPagination,
  loading,
} = storeToRefs(internshipStore)

const currentStatus = ref('pending')
const searchQuery = ref('')
const institutionFilter = ref('')
let searchTimeout = null

const currentData = computed(() => {
  if (currentStatus.value === 'pending') return pendingApplications.value
  if (currentStatus.value === 'approved') return activeInterns.value
  if (currentStatus.value === 'rejected') return rejectedApplications.value
  return []
})

const currentPagination = computed(() => {
  if (currentStatus.value === 'pending') return applicationsPagination.value
  if (currentStatus.value === 'approved') return internsPagination.value
  if (currentStatus.value === 'rejected') return rejectedPagination.value
  return { current_page: 1, last_page: 1, total: 0, per_page: 15 }
})

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 400)
}

const switchStatusFilter = (status) => {
  currentStatus.value = status
  searchQuery.value = ''
  institutionFilter.value = ''
  handlePageChange(1)
}

const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    institution: institutionFilter.value,
  }

  try {
    if (currentStatus.value === 'pending') {
      await internshipStore.fetchPendingApplications(filters)
    } else if (currentStatus.value === 'approved') {
      await internshipStore.fetchActiveInterns(filters)
    } else if (currentStatus.value === 'rejected') {
      await internshipStore.fetchRejectedApplications(filters)
    }
  } catch {
    toast.error('حدث خطأ فني أثناء تحديث قائمة البيانات.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

const isModalOpen = ref(false)
const selectedApplication = ref(null)

const openApplicationDetails = (application) => {
  selectedApplication.value = application
  isModalOpen.value = true
}

const onApplicationProcessed = () => {
  isModalOpen.value = false
  selectedApplication.value = null
  handlePageChange(currentPagination.value?.current_page || 1)
}

const copyPublicLink = () => {
  const publicUrl = `${window.location.origin}/internship/apply`
  navigator.clipboard
    .writeText(publicUrl)
    .then(() => {
      toast.success('تم نسخ رابط بوابة التقديم للتدريب بنجاح!')
    })
    .catch(() => {
      toast.error('عذراً، لم نتمكن من نسخ الرابط.')
    })
}

const openPublicLink = () => {
  window.open('/internship/apply', '_blank')
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.35s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
