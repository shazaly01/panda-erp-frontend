<!---src\modules\hr\views\internships\InternshipApplicationsList.vue--->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn p-4 sm:p-6 text-right" dir="rtl">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-5"
    >
      <div>
        <h1 class="text-2xl font-black text-slate-100 tracking-tight">إدارة التوظيف والتدريب</h1>
        <p class="text-xs md:text-sm text-slate-400 font-medium mt-1">
          مراجعة وفرز طلبات التوظيف والتدريب (الإلكترونية واليدوية)، وإدارة المعاينات والمتدربين
          النشطين وسجلات الأرشيف من شاشة موحدة.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
        <!-- زر الإدخال اليدوي المحلي -->
        <button
          v-if="authStore.can('hr.internship_applications.create')"
          @click="isManualModalOpen = true"
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ إدخال طلب يدوي</span>
        </button>

        <!-- أزرار فتح / قفل استقبال الطلبات الأونلاين (تدريب / توظيف) -->
        <template v-if="authStore.can('hr.internship_applications.toggle_status')">
          <button
            @click="handleToggleStatus('internship')"
            :disabled="loading"
            type="button"
            :class="[
              'px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border shadow-sm',
              isRegistrationOpen
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
              loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            :title="
              isRegistrationOpen
                ? 'تقديم التدريب مفتوح - اضغط للإغلاق'
                : 'تقديم التدريب مغلق - اضغط للفتح'
            "
          >
            <span
              class="w-2 h-2 rounded-full transition-all"
              :class="isRegistrationOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"
            ></span>
            <span>{{ isRegistrationOpen ? 'التدريب: مفتوح' : 'التدريب: مغلق' }}</span>
          </button>

          <button
            @click="handleToggleStatus('employment')"
            :disabled="loading"
            type="button"
            :class="[
              'px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border shadow-sm',
              isJobRegistrationOpen
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
              loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            :title="
              isJobRegistrationOpen
                ? 'تقديم التوظيف مفتوح - اضغط للإغلاق'
                : 'تقديم التوظيف مغلق - اضغط للفتح'
            "
          >
            <span
              class="w-2 h-2 rounded-full transition-all"
              :class="isJobRegistrationOpen ? 'bg-sky-400 animate-pulse' : 'bg-rose-500'"
            ></span>
            <span>{{ isJobRegistrationOpen ? 'التوظيف: مفتوح' : 'التوظيف: مغلق' }}</span>
          </button>
        </template>

        <!-- روابط البوابة العامة (تدريب / توظيف) -->
        <div
          class="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1 gap-1 shadow-inner"
        >
          <button
            @click="openPublicLink('internship')"
            type="button"
            class="px-2.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1"
            title="فتح رابط التقديم للتدريب"
          >
            <span>رابط التدريب 🔗</span>
          </button>

          <button
            @click="copyPublicLink('internship')"
            type="button"
            class="px-2 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-all duration-200"
            title="نسخ رابط التقديم للتدريب"
          >
            📋
          </button>

          <div class="w-[1px] h-4 bg-slate-800"></div>

          <button
            @click="openPublicLink('employment')"
            type="button"
            class="px-2.5 py-1.5 text-xs font-bold text-sky-400 hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1"
            title="فتح رابط التقديم للتوظيف"
          >
            <span>رابط التوظيف 🔗</span>
          </button>

          <button
            @click="copyPublicLink('employment')"
            type="button"
            class="px-2 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-all duration-200"
            title="نسخ رابط التقديم للتوظيف"
          >
            📋
          </button>
        </div>
      </div>
    </div>

    <!-- فلتر سريع حسب نوع الطلب (الكل / تدريب / توظيف) -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div
        class="inline-flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 gap-1"
      >
        <button
          @click="switchApplicationType('')"
          type="button"
          :class="[
            'px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all',
            applicationTypeFilter === ''
              ? 'bg-slate-700 text-white shadow'
              : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          الكل
        </button>
        <button
          @click="switchApplicationType('internship')"
          type="button"
          :class="[
            'px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all',
            applicationTypeFilter === 'internship'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          التدريب الأكاديمي 🎓
        </button>
        <button
          @click="switchApplicationType('employment')"
          type="button"
          :class="[
            'px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all',
            applicationTypeFilter === 'employment'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          طلبات التوظيف 💼
        </button>
      </div>
    </div>

    <!-- أزرار تبويبات الفلترة حسب الصلاحيات -->
    <div class="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-2">
      <button
        v-if="authStore.can('hr.internship_applications.view_pending')"
        @click="switchStatusFilter('pending')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'pending'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        الطلبات المعلقة ⏳
      </button>

      <button
        v-if="authStore.can('hr.internship_applications.view_pending')"
        @click="switchStatusFilter('interview')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'interview'
            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-md shadow-sky-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        قيد المعاينة 🗓️
      </button>

      <button
        v-if="authStore.can('hr.internship_applications.view_active')"
        @click="switchStatusFilter('approved')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'approved'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        تحت التدريب حالياً 🟢
      </button>

      <button
        v-if="authStore.can('hr.internship_applications.view_completed')"
        @click="switchStatusFilter('completed')"
        type="button"
        :class="[
          'px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 border focus:outline-none',
          currentStatus === 'completed'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-md shadow-rose-500/5'
            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-300',
        ]"
      >
        المنتهية فترتهم 🔴
      </button>

      <button
        v-if="authStore.can('hr.internship_applications.view_rejected')"
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

    <ManualApplicationModal
      v-if="isManualModalOpen"
      v-model:isOpen="isManualModalOpen"
      @created="onManualApplicationCreated"
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
import { useAuthStore } from '@/stores/authStore'

import SidebarFilter from './components/InternshipApplicationsFilter.vue'
import InternshipApplicationsTable from './components/InternshipApplicationsTable.vue'
import InternshipApplicationModal from './components/InternshipApplicationModal.vue'
import ManualApplicationModal from './components/ManualApplicationModal.vue'
import EmployeeIdentityCard from '../employees/components/EmployeeIdentityCard.vue'

const internshipStore = useInternshipStore()
const authStore = useAuthStore()
const toast = useToast()

const {
  pendingApplications,
  interviewApplications,
  activeInterns,
  rejectedApplications,
  completedInterns,
  applicationsPagination,
  interviewPagination,
  internsPagination,
  rejectedPagination,
  completedPagination,
  loading,
  isRegistrationOpen,
  isJobRegistrationOpen,
} = storeToRefs(internshipStore)

const currentStatus = ref('pending')
const applicationTypeFilter = ref('')
const searchQuery = ref('')
const institutionFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
let searchTimeout = null

// توزيع وحساب المصفوفات النشطة تبعاً للتبويب الفعال
const currentData = computed(() => {
  if (currentStatus.value === 'pending') return pendingApplications.value
  if (currentStatus.value === 'interview') return interviewApplications.value
  if (currentStatus.value === 'approved') return activeInterns.value
  if (currentStatus.value === 'completed') return completedInterns.value
  if (currentStatus.value === 'rejected') return rejectedApplications.value
  return []
})

// حساب كائن الترقيم الفعال المتوافق مع الحالة الحالية
const currentPagination = computed(() => {
  if (currentStatus.value === 'pending') return applicationsPagination.value
  if (currentStatus.value === 'interview') return interviewPagination.value
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

// التبديل بين نوع الطلب (الكل / تدريب / توظيف)
const switchApplicationType = (type) => {
  applicationTypeFilter.value = type
  handlePageChange(1)
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

// دالة جلب وضخ البيانات المركزية مع حقن معاملات البحث وفلاتر النطاق الزمني ونوع الطلب
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    application_type: applicationTypeFilter.value || undefined,
    search: searchQuery.value,
    institution: institutionFilter.value,
    date_from: dateFrom.value,
    date_to: dateTo.value,
  }

  try {
    if (currentStatus.value === 'pending') {
      await internshipStore.fetchPendingApplications(filters)
    } else if (currentStatus.value === 'interview') {
      await internshipStore.fetchInterviewApplications(filters)
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

// تبديل حالة استقبال طلبات التدريب أو التوظيف مع إظهار إشعار بنتيجة العملية
const handleToggleStatus = async (type = 'internship') => {
  try {
    const res = await internshipStore.toggleRegistrationStatus(type)
    if (res?.message) {
      toast.success(res.message)
    }
  } catch {
    toast.error('فشل في تغيير حالة استقبال الطلبات.')
  }
}

// تحديد التبويب المتاح الافتراضي عند فتح الشاشة
const initDefaultTab = () => {
  const tabPermissions = [
    { status: 'pending', perm: 'hr.internship_applications.view_pending' },
    { status: 'approved', perm: 'hr.internship_applications.view_active' },
    { status: 'completed', perm: 'hr.internship_applications.view_completed' },
    { status: 'rejected', perm: 'hr.internship_applications.view_rejected' },
  ]

  const firstAllowedTab = tabPermissions.find((item) => authStore.can(item.perm))

  if (firstAllowedTab) {
    currentStatus.value = firstAllowedTab.status
    handlePageChange(1)
  }
}

onMounted(() => {
  initDefaultTab()
  if (authStore.can('hr.internship_applications.toggle_status')) {
    internshipStore.fetchRegistrationStatus()
  }
})

const isModalOpen = ref(false)
const selectedApplication = ref(null)
const isManualModalOpen = ref(false)

const openApplicationDetails = (application) => {
  selectedApplication.value = application
  isModalOpen.value = true
}

const onApplicationProcessed = () => {
  isModalOpen.value = false
  selectedApplication.value = null
  handlePageChange(currentPagination.value?.current_page || 1)
}

const onManualApplicationCreated = () => {
  if (currentStatus.value === 'pending') {
    handlePageChange(1)
  } else {
    switchStatusFilter('pending')
  }
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

const getPublicUrl = (type = 'internship') => {
  const base = `${window.location.origin}/internship/apply`
  return type === 'employment' ? `${base}?type=employment` : base
}

const copyPublicLink = (type = 'internship') => {
  const publicUrl = getPublicUrl(type)
  const label = type === 'employment' ? 'التوظيف' : 'التدريب'
  navigator.clipboard
    .writeText(publicUrl)
    .then(() => {
      toast.success(`تم نسخ رابط بوابة التقديم لـ ${label} بنجاح!`)
    })
    .catch(() => {
      toast.error('عذراً، لم نتمكن من نسخ الرابط.')
    })
}

const openPublicLink = (type = 'internship') => {
  const path = type === 'employment' ? '/internship/apply?type=employment' : '/internship/apply'
  window.open(path, '_blank')
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
