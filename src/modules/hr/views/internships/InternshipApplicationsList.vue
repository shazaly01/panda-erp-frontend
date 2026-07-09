<!--src\modules\hr\views\internships\InternshipApplicationsList.vue---->
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
        @click="switchStatusFilter('completed')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'completed'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-md shadow-rose-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        المتدربين المنتهية فترتهم 🔴
      </button>

      <button
        @click="switchStatusFilter('rejected')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'rejected'
            ? 'bg-slate-500/10 text-slate-400 border-slate-500/30 shadow-md shadow-slate-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        الطلبات المرفوضة ❌
      </button>
    </div>

    <SidebarFilter
      v-model:searchQuery="searchQuery"
      v-model:institutionFilter="institutionFilter"
      v-model:dateFrom="dateFrom"
      v-model:dateTo="dateTo"
      @update:searchQuery="onSearch"
      @update:institutionFilter="handlePageChange(1)"
      @update:dateFrom="onSearch"
      @update:dateTo="onSearch"
    />

    <InternshipApplicationsTable
      :applications="currentData"
      :pagination="currentPagination"
      :loading="loading"
      :current-status="currentStatus"
      @page-change="handlePageChange"
      @row-click="openApplicationDetails"
      @print-card="openIdentityCardPrint"
    />

    <InternshipApplicationModal
      v-if="isModalOpen"
      v-model:isOpen="isModalOpen"
      :application="selectedApplication"
      :status-type="currentStatus"
      @refresh="onApplicationProcessed"
    />

    <div
      v-if="isCardModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md hide-on-print"
      @click.self="closeIdentityCardPrint"
    >
      <div
        class="relative max-w-4xl w-full max-h-[95vh] overflow-y-auto overflow-x-hidden bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl animate-scaleIn text-right"
      >
        <button
          @click="closeIdentityCardPrint"
          class="absolute top-4 left-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="mt-6 flex justify-center">
          <EmployeeIdentityCard :employee="selectedIntern" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useInternshipStore } from '@/modules/hr/stores/internshipStore'

import SidebarFilter from './components/InternshipApplicationsFilter.vue'
import InternshipApplicationsTable from './components/InternshipApplicationsTable.vue'
import InternshipApplicationModal from './components/InternshipApplicationModal.vue'
import EmployeeIdentityCard from '../employees/components/EmployeeIdentityCard.vue'

const internshipStore = useInternshipStore()
const toast = useToast()

const {
  pendingApplications,
  activeInterns,
  rejectedApplications,
  completedInterns,
  applicationsPagination,
  internsPagination,
  rejectedPagination,
  completedPagination,
  loading,
} = storeToRefs(internshipStore)

const currentStatus = ref('pending')
const searchQuery = ref('')
const institutionFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
let searchTimeout = null

// توزيع وحساب المصفوفات النشطة تبعاً للتبويب الفعال
const currentData = computed(() => {
  if (currentStatus.value === 'pending') return pendingApplications.value
  if (currentStatus.value === 'approved') return activeInterns.value
  if (currentStatus.value === 'completed') return completedInterns.value
  if (currentStatus.value === 'rejected') return rejectedApplications.value
  return []
})

// حساب كائن الترقيم الفعال المتوافق مع الحالة الحالية
const currentPagination = computed(() => {
  if (currentStatus.value === 'pending') return applicationsPagination.value
  if (currentStatus.value === 'approved') return internsPagination.value
  if (currentStatus.value === 'completed') return completedPagination.value
  if (currentStatus.value === 'rejected') return rejectedPagination.value
  return { current_page: 1, last_page: 1, total: 0, per_page: 15 }
})

// محرك البحث المؤجل (Debounce) لتقليص الضغط على خادم الـ API
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 400)
}

// التبديل بين التبويبات وتفريغ حقول البحث تلقائياً لتهيئة المشهد الجديد
const switchStatusFilter = (status) => {
  currentStatus.value = status
  searchQuery.value = ''
  institutionFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  handlePageChange(1)
}

// دالة جلب وضخ البيانات المركزية مع حقن معاملات البحث وفلاتر النطاق الزمني
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    institution: institutionFilter.value,
    date_from: dateFrom.value,
    date_to: dateTo.value,
  }

  try {
    if (currentStatus.value === 'pending') {
      await internshipStore.fetchPendingApplications(filters)
    } else if (currentStatus.value === 'approved') {
      await internshipStore.fetchActiveInterns(filters)
    } else if (currentStatus.value === 'completed') {
      await internshipStore.fetchCompletedInterns(filters)
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

const isCardModalOpen = ref(false)
const selectedIntern = ref(null)

const openIdentityCardPrint = (intern) => {
  selectedIntern.value = intern
  isCardModalOpen.value = true
}

const closeIdentityCardPrint = () => {
  isCardModalOpen.value = false
  selectedIntern.value = null
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

.animate-scaleIn {
  animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media print {
  .hide-on-print {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }
}
</style>
