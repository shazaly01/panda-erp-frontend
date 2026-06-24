<!--src\modules\hr\views\visitors\VisitorsList.vue--->
<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">سجل الزوار والبوابات</h1>
        <p class="text-sm text-text-muted mt-1">
          إدارة ومراقبة سجلات زوار المنشأة، وحركات الدخول والخروج الفورية من البوابات الأمنية.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div
          class="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1 shadow-inner"
        >
          <button
            @click="openPublicLink"
            class="px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1.5 border border-transparent hover:border-slate-200/40 shadow-sm"
          >
            <span>فتح البوابة العامة 🔗</span>
          </button>

          <div class="w-[1px] h-4 bg-slate-300 dark:bg-slate-800"></div>

          <button
            @click="copyPublicLink"
            class="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1.5 border border-transparent hover:border-slate-200/40"
            title="نسخ الرابط الخارجي لإنشاء أو طباعة QR Code"
          >
            <span>نسخ الرابط 📋</span>
          </button>
        </div>

        <AppButton v-if="authStore.can('hr_visitors.create')" @click="openCreateModal" icon="plus">
          تسجيل زائر جديد
        </AppButton>
      </div>
    </div>

    <VisitorsFilter
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      v-model:todayOnlyFilter="todayOnlyFilter"
      @update:searchQuery="onSearch"
      @update:statusFilter="handlePageChange(1)"
      @update:todayOnlyFilter="handlePageChange(1)"
    />

    <VisitorsTable
      :visitors="visitors"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit="openEditModal"
      @delete="openDeleteDialog"
      @check-in="handleCheckIn"
      @check-out="handleCheckOut"
    />

    <VisitorModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :visitor-to-edit="visitorToEdit"
      @saved="onVisitorSaved"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف سجل الزيارة"
      :message="`هل أنت متأكد من رغبتك في حذف سجل زيارة الزائر (${visitorToDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء.`"
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
import { useVisitorStore } from '@/modules/hr/stores/visitorStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import VisitorsFilter from './components/VisitorsFilter.vue'
import VisitorsTable from './components/VisitorsTable.vue'
import VisitorModal from './components/VisitorModal.vue'

// -- تهيئة الـ Stores وأدوات النظام --
const authStore = useAuthStore()
const visitorStore = useVisitorStore()
const toast = useToast()

const { visitors, pagination, loading } = storeToRefs(visitorStore)

// -- الفلاتر والبحث (Reactive Filters) --
const searchQuery = ref('')
const statusFilter = ref('')
const todayOnlyFilter = ref(true)
let searchTimeout = null

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

// -- جلب البيانات وإدارة التصفح والتصفية (Pagination & Filtering) --
const handlePageChange = async (page = 1) => {
  const filters = {
    page,
    search: searchQuery.value,
    status: statusFilter.value,
    today_only: todayOnlyFilter.value ? 1 : 0,
    visit_date: new Date().toLocaleDateString('sv-SE'),
  }

  try {
    await visitorStore.fetchVisitors(filters)
  } catch {
    toast.error('حدث خطأ أثناء جلب سجلات الزوار.')
  }
}

onMounted(() => {
  handlePageChange(1)
})

// -- إدارة حركات البوبة الفورية للأمن والتحكم اليدوي (Gate Actions Handling) --
const handleCheckIn = async (visitor) => {
  try {
    await visitorStore.checkInGate({ id: visitor.id })
    toast.success(`تم تسجيل دخول الزائر (${visitor.name}) بنجاح وإثبات وجوده بالمنشأة.`)
    handlePageChange(pagination.value?.current_page || 1)
  } catch {
    toast.error(visitorStore.error || 'فشل إتمام عملية تسجيل الدخول عند البوابة.')
  }
}

const handleCheckOut = async (visitor) => {
  try {
    await visitorStore.checkOutGate({ id: visitor.id })
    toast.success(`تم تسجيل خروج ومغادرة الزائر (${visitor.name}) للمنشأة بنجاح.`)
    handlePageChange(pagination.value?.current_page || 1)
  } catch {
    toast.error(visitorStore.error || 'فشل إتمام عملية تسجيل الخروج من البوابة.')
  }
}

// -- إدارة النافذة المنبثقة للإضافة والتعديل (Modal State) --
const isModalOpen = ref(false)
const visitorToEdit = ref(null)

const openCreateModal = () => {
  visitorToEdit.value = null
  isModalOpen.value = true
}

const openEditModal = (visitor) => {
  visitorToEdit.value = visitor
  isModalOpen.value = true
}

const onVisitorSaved = () => {
  handlePageChange(pagination.value?.current_page || 1)
}

// -- إدارة الحذف المرن (Delete State) --
const isDeleteDialogOpen = ref(false)
const visitorToDelete = ref(null)

const openDeleteDialog = (visitor) => {
  if (visitor.status === 'checked_in') {
    toast.warning('لا يمكن حذف سجل زائر متواجد حالياً داخل المنشأة.')
    return
  }
  visitorToDelete.value = visitor
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!visitorToDelete.value) return

  try {
    await visitorStore.deleteVisitor(visitorToDelete.value.id)
    toast.success('تم حذف سجل الزيارة بنجاح.')

    const targetPage =
      visitors.value.length === 1 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value.current_page

    await handlePageChange(targetPage)
  } catch {
    toast.error(visitorStore.error || 'فشل عملية الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
    visitorToDelete.value = null
  }
}

// ==========================================
// 🌟 إدارة روابط وأدوات البوابة العامة الخارجية
// ==========================================
const copyPublicLink = () => {
  const publicUrl = `${window.location.origin}/register-visit`

  navigator.clipboard
    .writeText(publicUrl)
    .then(() => {
      toast.success('تم نسخ رابط بوابة التسجيل الذاتية بنجاح! جاهز الآن لإنشاء الـ QR Code.')
    })
    .catch(() => {
      toast.error('عذراً، فشل نسخ الرابط تلقائياً من المتصفح.')
    })
}

const openPublicLink = () => {
  window.open('/register-visit', '_blank')
}
</script>
