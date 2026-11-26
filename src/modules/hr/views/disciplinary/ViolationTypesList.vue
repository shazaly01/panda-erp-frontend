<!-- src/modules/hr/views/disciplinary/ViolationTypesList.vue -->
<template>
  <div class="space-y-5 text-right font-sans" dir="rtl">
    <!-- 1. ترويسة الصفحة وزر الإضافة -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary flex items-center gap-2.5">
          <span class="w-2 h-6 rounded-full bg-primary inline-block"></span>
          <span>لوائح المخالفات وسلالم الجزاءات</span>
        </h1>
        <p class="text-xs text-text-secondary mt-1 pr-4">
          تهيئة لوائح المخالفات الإدارية ومخالفات الحضور والانصراف، وبناء درجات التدرج العقابي ومدد
          السقوط بالتقادم.
        </p>
      </div>

      <AppButton v-if="canCreate" type="button" @click="openCreateModal">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>إضافة لائحة مخالفة جديدة</span>
        </span>
      </AppButton>
    </div>

    <!-- 2. شريط البحث والتصفية -->
    <div
      class="p-4 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm transition-colors duration-200"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
        <!-- البحث السريع -->
        <div class="lg:col-span-5 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1"
            >البحث بالاسم أو الكود</label
          >
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <span class="absolute right-3 text-text-muted pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearchInput"
              placeholder="ابحث باسم اللائحة أو الكود (مثل: LATE_ARRIVAL)..."
              class="block w-full h-full pr-9 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
            />
          </div>
        </div>

        <!-- طريقة الرصد -->
        <div class="lg:col-span-4 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">طريقة الرصد</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <select
              v-model="detectionModeFilter"
              @change="loadViolationTypes"
              class="block w-full h-full pr-3.5 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="" class="bg-surface-section text-text-primary">جميع طرق الرصد</option>
              <option value="manual" class="bg-surface-section text-text-primary">
                رصد يدوي / إداري
              </option>
              <option value="attendance_late" class="bg-surface-section text-text-primary">
                آلي - التأخير الصباحي
              </option>
              <option value="attendance_early_leave" class="bg-surface-section text-text-primary">
                آلي - الانصراف المبكر
              </option>
              <option value="attendance_absent" class="bg-surface-section text-text-primary">
                آلي - الغياب بدون إذن
              </option>
            </select>
            <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
          </div>
        </div>

        <!-- حالة اللائحة -->
        <div class="lg:col-span-3 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">حالة التفعيل</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <select
              v-model="statusFilter"
              @change="loadViolationTypes"
              class="block w-full h-full pr-3.5 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="" class="bg-surface-section text-text-primary">الكل</option>
              <option value="1" class="bg-surface-section text-text-primary">النشطة فقط</option>
              <option value="0" class="bg-surface-section text-text-primary">الموقوفة فقط</option>
            </select>
            <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. جدول عرض اللوائح وسلالم التدرج -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="violationTypes"
        :is-loading="loading"
        :row-clickable="canUpdate"
        @row-click="handleRowClick"
      >
        <!-- 1. اسم اللائحة والكود -->
        <template #cell-name="{ item }">
          <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-black text-xs sm:text-[13px] text-text-primary">
                {{ item.name }}
              </span>
              <span
                class="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25"
              >
                {{ item.code }}
              </span>
            </div>
            <p v-if="item.description" class="text-[11px] text-text-muted max-w-md truncate">
              {{ item.description }}
            </p>
          </div>
        </template>

        <!-- 2. طريقة الرصد وشروط التفعيل -->
        <template #cell-detection="{ item }">
          <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
            <AppBadge :variant="item.is_automated ? 'info' : 'secondary'" size="xs" pill>
              {{ item.detection_mode_label }}
            </AppBadge>

            <span v-if="item.is_automated" class="text-[11px] text-text-secondary font-medium">
              {{ item.trigger_mode_label }}
              <template v-if="item.detection_mode !== 'attendance_absent'">
                • الحد:
                <strong class="font-mono text-primary">{{ item.threshold_minutes }}</strong> د
                <template v-if="item.max_threshold_minutes">
                  إلى
                  <strong class="font-mono text-primary">{{ item.max_threshold_minutes }}</strong> د
                </template>
              </template>
              <template v-else-if="item.threshold_minutes > 0">
                • الحد:
                <strong class="font-mono text-primary">{{ item.threshold_minutes }}</strong> يوم
              </template>
            </span>
            <span v-else class="text-[11px] text-text-muted">
              يُسجل يدوياً بواسطة المشرف أو HR
            </span>
          </div>
        </template>

        <!-- 3. سلم التدرج العقابي -->
        <template #cell-steps="{ item }">
          <div class="flex flex-col gap-1.5 text-right" dir="rtl">
            <div class="flex items-center gap-1.5">
              <span
                class="px-2 py-0.5 rounded-md text-[11px] font-black bg-surface-ground border border-surface-border text-text-primary"
              >
                {{ item.steps?.length || 0 }} درجات
              </span>
              <span
                v-if="item.steps?.length"
                class="text-[11px] text-text-secondary truncate max-w-[220px]"
              >
                تبدأ بـ: <strong>{{ item.steps[0]?.action_type_label }}</strong>
              </span>
            </div>

            <!-- شريط مصغر يوضح تسلسل الدرجات -->
            <div v-if="item.steps?.length" class="flex items-center gap-1 flex-wrap">
              <span
                v-for="step in item.steps.slice(0, 5)"
                :key="step.step_order"
                class="text-[10px] px-1.5 py-0.5 rounded border font-semibold"
                :class="getStepBadgeClass(step.action_type)"
                :title="`الدرجة ${step.step_order}: ${step.action_type_label}`"
              >
                {{ step.step_order }}. {{ step.action_type_label }}
              </span>
              <span
                v-if="item.steps.length > 5"
                class="text-[10px] px-1.5 py-0.5 rounded bg-surface-ground text-text-muted font-bold"
              >
                +{{ item.steps.length - 5 }}
              </span>
            </div>
          </div>
        </template>

        <!-- 4. الاعتماد المسبق -->
        <template #cell-approval="{ item }">
          <div class="flex justify-center">
            <AppBadge :variant="item.requires_approval ? 'warning' : 'success'" size="xs">
              {{ item.requires_approval ? 'يتطلب اعتماد' : 'تنفيذ فوري' }}
            </AppBadge>
          </div>
        </template>

        <!-- 5. الحالة والارتباط -->
        <template #cell-status="{ item }">
          <div class="flex flex-col items-center gap-1">
            <AppBadge :variant="item.is_active ? 'success' : 'danger'" size="xs" pill>
              {{ item.is_active ? 'نشطة' : 'موقوفة' }}
            </AppBadge>
            <span
              v-if="item.disciplinary_actions_count !== undefined"
              class="text-[10px] text-text-muted font-mono"
            >
              {{ item.disciplinary_actions_count }} مخالفة مسجلة
            </span>
          </div>
        </template>

        <!-- 6. الإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-1" @click.stop>
            <button
              v-if="canUpdate"
              type="button"
              @click="openEditModal(item)"
              class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
              title="تعديل اللائحة وسلم التدرج"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              v-if="canDelete"
              type="button"
              @click="openDeleteDialog(item)"
              class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="حذف اللائحة"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <!-- 4. نافذة إضافة / تعديل اللائحة وسلم التدرج العقابي -->
    <ViolationTypeModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :violation-type-id="selectedTypeId"
      @saved="handleSaved"
    />

    <!-- 5. حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف لائحة المخالفة"
      :message="`هل أنت متأكد من رغبتك في حذف لائحة '${typeToDelete?.name}'؟ لن يتمكن النظام من حذفها إذا كانت مرتبطة بمخالفات مسجلة مسبقاً للموظفين.`"
      confirm-text="حذف اللائحة"
      confirm-variant="danger"
      @confirmed="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useViolationTypeStore } from '@/modules/hr/stores/violationTypeStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import ViolationTypeModal from './components/ViolationTypeModal.vue'

const toast = useToast()
const authStore = useAuthStore()
const violationTypeStore = useViolationTypeStore()

const { violationTypes, loading } = storeToRefs(violationTypeStore)

// التحقق من الصلاحيات المتوافقة مع ViolationTypePolicy
const hasAdminRole = computed(
  () =>
    Array.isArray(authStore.user?.roles) &&
    authStore.user.roles.some((r) => r.name === 'HR Manager' || r.name === 'Super Admin'),
)

const canCreate = computed(
  () =>
    hasAdminRole.value ||
    authStore.can('hr.violation_types.create') ||
    authStore.can('hr.settings.manage'),
)

const canUpdate = computed(
  () =>
    hasAdminRole.value ||
    authStore.can('hr.violation_types.update') ||
    authStore.can('hr.settings.manage'),
)

const canDelete = computed(
  () =>
    hasAdminRole.value ||
    authStore.can('hr.violation_types.delete') ||
    authStore.can('hr.settings.manage'),
)

// أعمدة الجدول
const tableHeaders = computed(() => [
  { key: 'name', label: 'اللائحة / نوع المخالفة' },
  { key: 'detection', label: 'طريقة الرصد والشرط' },
  { key: 'steps', label: 'سلم التدرج العقابي' },
  { key: 'approval', label: 'الاعتماد', class: 'text-center' },
  { key: 'status', label: 'الحالة', class: 'text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-left w-24' },
])

// فلاتر البحث
const searchQuery = ref('')
const detectionModeFilter = ref('')
const statusFilter = ref('')
let searchTimer = null

const loadViolationTypes = async () => {
  const filters = {}
  if (searchQuery.value.trim()) filters.search = searchQuery.value.trim()
  if (detectionModeFilter.value) filters.detection_mode = detectionModeFilter.value
  if (statusFilter.value !== '') filters.is_active = statusFilter.value

  await violationTypeStore.fetchViolationTypes(filters)
}

const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadViolationTypes()
  }, 400)
}

const getStepBadgeClass = (actionType) => {
  switch (actionType) {
    case 'verbal_warning':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25'
    case 'written_warning':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
    case 'salary_deduction':
      return 'bg-primary/10 text-primary border-primary/25'
    case 'suspension':
      return 'bg-orange-600/15 text-orange-700 dark:text-orange-300 border-orange-500/35'
    case 'termination':
      return 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/35'
    default:
      return 'bg-surface-ground text-text-secondary border-surface-border'
  }
}

// إدارة نافذة الإضافة والتعديل
const isModalOpen = ref(false)
const selectedTypeId = ref(null)

const openCreateModal = () => {
  selectedTypeId.value = null
  isModalOpen.value = true
}

const openEditModal = (item) => {
  selectedTypeId.value = item.id
  isModalOpen.value = true
}

const handleRowClick = (item) => {
  if (canUpdate.value) {
    openEditModal(item)
  }
}

const handleSaved = async () => {
  await loadViolationTypes()
}

// إدارة تأكيد الحذف
const isDeleteDialogOpen = ref(false)
const typeToDelete = ref(null)

const openDeleteDialog = (item) => {
  if (Number(item.disciplinary_actions_count) > 0) {
    toast.warning(
      `لا يمكن حذف لائحة "${item.name}" لوجود (${item.disciplinary_actions_count}) مخالفة مسجلة عليها؛ يمكنك تعديلها وإيقاف تفعيلها بدلاً من الحذف.`,
    )
    return
  }
  typeToDelete.value = item
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!typeToDelete.value) return
  try {
    await violationTypeStore.deleteViolationType(typeToDelete.value.id)
    toast.success(`تم حذف لائحة "${typeToDelete.value.name}" بنجاح.`)
  } catch {
    toast.error(violationTypeStore.error || 'تعذر حذف اللائحة.')
  } finally {
    isDeleteDialogOpen.value = false
    typeToDelete.value = null
  }
}

onMounted(() => {
  loadViolationTypes()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})
</script>
