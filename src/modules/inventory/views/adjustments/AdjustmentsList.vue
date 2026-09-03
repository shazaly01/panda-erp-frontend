<!--src/modules/inventory/views/adjustments/AdjustmentsList.vue-->
<template>
  <div class="space-y-6">
    <!-- ترويسة الشاشة المتكيفة -->
    <div class="flex justify-between items-center mb-6">
      <div class="text-right" dir="rtl">
        <h1 class="text-2xl font-black text-text-primary">{{ pageTitle }}</h1>
        <p class="text-xs text-text-secondary mt-1">
          {{ pageSubtitle }}
        </p>
      </div>
      <AppButton
        type="button"
        @click="goToCreatePage"
        class="bg-[#e05e2b] hover:bg-[#d04f1e] text-white border-none shadow-[0_0_10px_rgba(224,94,43,0.25)]"
      >
        {{ createButtonText }}
      </AppButton>
    </div>

    <!-- فلاتر البحث المتقدم -->
    <AdjustmentFilters
      v-model:searchQuery="searchQuery"
      v-model:typeFilter="typeFilter"
      v-model:statusFilter="statusFilter"
      v-model:warehouseFilter="warehouseFilter"
      v-model:fromDateFilter="fromDateFilter"
      v-model:toDateFilter="toDateFilter"
      :is-type-disabled="isTypeLocked"
      @update:searchQuery="onSearch"
      @update:typeFilter="handlePageChange(1)"
      @update:statusFilter="handlePageChange(1)"
      @update:warehouseFilter="handlePageChange(1)"
      @update:fromDateFilter="handlePageChange(1)"
      @update:toDateFilter="handlePageChange(1)"
    />

    <!-- جدول عرض التسويات الجردية -->
    <AdjustmentTable
      :adjustments="adjustments"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-adjustment="goToEditPage"
      @delete-adjustment="openDeleteDialog"
      @approve-adjustment="openApproveDialog"
      @row-clicked="goToEditPage"
      @print-adjustment="openPrintPage"
    />

    <!-- حوار تأكيد حذف السند المسودة -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف وإلغاء وثيقة التسوية"
      :message="`هل أنت متأكد تماماً من رغبتك في حذف طلب التسوية رقم '${adjustmentToDelete?.adjustment_number || adjustmentToDelete?.id}'؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirmed="deleteSelectedAdjustment"
    />

    <!-- حوار تأكيد اعتماد وترحيل التسوية -->
    <AppConfirmDialog
      v-model="isApproveDialogOpen"
      title="تأكيد اعتماد وترحيل التسوية الجردية"
      :message="`هل أنت متأكد من اعتماد طلب التسوية رقم '${adjustmentToApprove?.adjustment_number || adjustmentToApprove?.id}'؟ سيتم تطبيق الفروقات الجردية لحظياً على المستودع وتوليد القيد المحاسبي المباشر.`"
      @confirmed="confirmApproveAdjustment"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdjustmentStore } from '@/modules/inventory/stores/adjustmentStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AdjustmentFilters from './components/AdjustmentFilters.vue'
import AdjustmentTable from './components/AdjustmentTable.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const adjustmentStore = useAdjustmentStore()
const { adjustments, loading, pagination } = storeToRefs(adjustmentStore)

// استخراج النوع الافتراضي المحدد في بيانات المسار الوصفية
const defaultType = computed(() => route.meta.defaultType || '')
const isTypeLocked = computed(() => Boolean(route.meta.defaultType))

const searchQuery = ref('')
const typeFilter = ref(defaultType.value)
const statusFilter = ref('')
const warehouseFilter = ref('')
const fromDateFilter = ref('')
const toDateFilter = ref('')
let searchTimeout = null

// العناوين المتكيفة بحسب الشاشة الحالية
const pageTitle = computed(() => {
  if (route.meta.pageTitle) {
    return route.meta.pageTitle
  }
  switch (defaultType.value) {
    case 'physical_count':
      return 'محاضر الجرد الدوري والفعلي'
    case 'damage':
      return 'إدارة وتسويات البضاعة التالفة'
    case 'loss':
      return 'إدارة وتسويات الفاقد والعجز المخزني'
    case 'opening_balance':
      return 'أرصدة بضاعة أول المدة (الرصيد الافتتاحي)'
    case 'general_adjustment':
      return 'التسويات المخزنية العامة والاستثنائية'
    default:
      return 'إدارة التسويات والأرصدة الافتتاحية'
  }
})

const pageSubtitle = computed(() => {
  switch (defaultType.value) {
    case 'physical_count':
      return 'متابعة وتدقيق نتائج الجرد الميداني ومطابقة الأرصدة الفعلية مع الدفاتر.'
    case 'damage':
      return 'توثيق واعتماد إذونات إتلاف وتكهين البضائع التالفة مع التوجيه المحاسبي المباشر.'
    case 'loss':
      return 'تسجيل حالات الفقد والعجز المخزني والسرقات ومتابعة انحرافات العهدة.'
    case 'opening_balance':
      return 'إدخال وتدقيق بضاعة أول المدة وتأسيس رأس مال المخزون عند بدء النشاط.'
    case 'general_adjustment':
      return 'معالجة فروقات الأوزان والتحويلات والتسويات اليدوية الاستثنائية.'
    default:
      return 'متابعة وتدقيق محاضر الجرد الدوري، الأرصدة الافتتاحية، وتسويات العجز والتالف بالمستودعات.'
  }
})

const createButtonText = computed(() => {
  switch (defaultType.value) {
    case 'physical_count':
      return 'إصدار محضر جرد جديد'
    case 'damage':
      return 'تسجيل إتلاف بضاعة'
    case 'loss':
      return 'تسجيل فاقد وعجز'
    case 'opening_balance':
      return 'إدخال رصيد افتتاحي'
    case 'general_adjustment':
      return 'إصدار تسوية عامة'
    default:
      return 'إصدار تسوية جردية جديدة'
  }
})

// مراقبة تبديل المسار داخل نفس المكون لإعادة التهيئة اللحظية
watch(
  () => route.fullPath,
  () => {
    typeFilter.value = defaultType.value
    handlePageChange(1)
  },
)

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = (page = 1) => {
  const filters = {
    search: searchQuery.value,
    type: typeFilter.value,
    status: statusFilter.value,
    warehouse_id: warehouseFilter.value,
    from_date: fromDateFilter.value,
    to_date: toDateFilter.value,
  }

  adjustmentStore.fetchAdjustments(page, filters).catch(() => {
    toast.error('فشل النظام في جلب مستندات التسوية المخزنية من الخادم.')
  })
}

onMounted(() => {
  typeFilter.value = defaultType.value
  handlePageChange(1)
})

const goToCreatePage = () => {
  switch (defaultType.value) {
    case 'physical_count':
      router.push('/app/inventory/adjustments/physical-count/create')
      break
    case 'damage':
      router.push('/app/inventory/adjustments/damage/create')
      break
    case 'loss':
      router.push('/app/inventory/adjustments/loss/create')
      break
    case 'opening_balance':
      router.push('/app/inventory/adjustments/opening-balance/create')
      break
    case 'general_adjustment':
      router.push('/app/inventory/adjustments/general/create')
      break
    default:
      router.push('/app/inventory/adjustments/create')
      break
  }
}

const goToEditPage = (adjustment) => {
  if (adjustment.status === 'approved') {
    router.push(`/app/inventory/adjustments/${adjustment.id}`)
  } else {
    router.push(`/app/inventory/adjustments/${adjustment.id}/edit`)
  }
}

const openPrintPage = (adjustment) => {
  window.open(`/print/inventory/adjustments/${adjustment.id}`, '_blank')
}

// منطق تأكيد الحذف
const isDeleteDialogOpen = ref(false)
const adjustmentToDelete = ref(null)

const openDeleteDialog = (adjustment) => {
  adjustmentToDelete.value = adjustment
  isDeleteDialogOpen.value = true
}

const deleteSelectedAdjustment = async () => {
  if (adjustmentToDelete.value) {
    try {
      await adjustmentStore.deleteAdjustment(adjustmentToDelete.value.id)
      toast.success(
        `تم حذف مستند التسوية رقم '${adjustmentToDelete.value.adjustment_number || adjustmentToDelete.value.id}' بنجاح.`,
      )

      if (adjustments.value.length === 1 && pagination.value?.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value?.current_page || 1)
      }
    } catch {
      const errorMessage = adjustmentStore.error || 'فشلت عملية حذف مستند التسوية المخزنية.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      adjustmentToDelete.value = null
    }
  }
}

// منطق تأكيد الاعتماد المباشر من القائمة
const isApproveDialogOpen = ref(false)
const adjustmentToApprove = ref(null)

const openApproveDialog = (adjustment) => {
  adjustmentToApprove.value = adjustment
  isApproveDialogOpen.value = true
}

const confirmApproveAdjustment = async () => {
  if (adjustmentToApprove.value) {
    try {
      await adjustmentStore.approveAdjustment(adjustmentToApprove.value.id)
      toast.success(
        `تم اعتماد وترحيل طلب التسوية رقم '${adjustmentToApprove.value.adjustment_number || adjustmentToApprove.value.id}' وتحديث الأرصدة بنجاح.`,
      )
      await handlePageChange(pagination.value?.current_page || 1)
    } catch {
      const errorMessage = adjustmentStore.error || 'فشلت عملية اعتماد وترحيل مستند التسوية.'
      toast.error(errorMessage)
    } finally {
      isApproveDialogOpen.value = false
      adjustmentToApprove.value = null
    }
  }
}
</script>
