<!-- src/modules/hr/views/disciplinary/components/RecordViolationModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    title="تسجيل مخالفة إدارية / تأديبية جديدة"
    size="3xl"
    border-color="border-primary"
    :loading="isSubmitting"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <!-- مؤشر التحميل الأولي عند جلب القوائم الأساسية -->
    <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-14 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted font-bold">جاري تجهيز بيانات الموظفين واللوائح...</span>
    </div>

    <!-- نموذج تسجيل المخالفة -->
    <form
      v-else
      @submit.prevent="handleSubmit"
      @keydown.ctrl.enter.prevent="handleSubmit"
      class="space-y-4 font-sans text-right"
      dir="rtl"
    >
      <!-- تنبيه أخطاء الخادم العامة -->
      <div
        v-if="generalError"
        class="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/35 text-danger text-xs font-bold"
      >
        {{ generalError }}
      </div>

      <!-- =========================================================
             البطاقة 1: بيانات الواقعة والمخالفة
             ========================================================= -->
      <div
        class="record-violation-card bg-surface-section/70 border border-surface-border p-4 rounded-xl space-y-3.5 transition-all duration-200"
      >
        <div class="flex items-center justify-between border-b border-surface-border/70 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-2">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>بيانات المخالفة والموظف المعني</span>
          </h3>
          <span class="text-[11px] text-text-muted font-medium">
            يُحتسب التدرج العقابي تلقائياً فور الاختيار
          </span>
        </div>

        <!-- الصف الأول: الموظف + نوع المخالفة + تاريخ المخالفة -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <!-- اختيار الموظف -->
          <div class="md:col-span-5">
            <label for="rv-employee" class="block text-xs font-bold text-text-secondary mb-1.5">
              الموظف المعني *
            </label>
            <div
              class="relative w-full h-[40px] bg-surface-card border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
            >
              <div class="w-full h-full px-1 flex items-center">
                <AppDropdown
                  id="rv-employee"
                  v-model="form.employee_id"
                  :options="activeEmployeeOptions"
                  option-label="displayLabel"
                  option-value="id"
                  placeholder="اختر الموظف..."
                  filter-placeholder="ابحث بالاسم أو الرقم الوظيفي..."
                  class="w-full bg-transparent modal-embedded-dropdown"
                />
              </div>
            </div>
            <p v-if="getFieldError('employee_id')" class="mt-1 text-[11px] text-danger font-bold">
              {{ getFieldError('employee_id') }}
            </p>
          </div>

          <!-- اختيار نوع المخالفة / اللائحة -->
          <div class="md:col-span-4">
            <label
              for="rv-violation-type"
              class="block text-xs font-bold text-text-secondary mb-1.5"
            >
              اللائحة / نوع المخالفة *
            </label>
            <div class="relative w-full h-[40px] flex items-center">
              <select
                id="rv-violation-type"
                v-model="form.violation_type_id"
                class="w-full h-[40px] pr-3 pl-8 bg-surface-card border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                required
              >
                <option value="" disabled class="bg-surface-section text-text-muted">
                  -- اختر نوع المخالفة --
                </option>
                <option
                  v-for="vt in activeViolationTypes"
                  :key="vt.id"
                  :value="vt.id"
                  class="bg-surface-section text-text-primary font-bold"
                >
                  {{ vt.name }}
                </option>
              </select>
              <span
                class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
              >
                ▼
              </span>
            </div>
            <p
              v-if="getFieldError('violation_type_id')"
              class="mt-1 text-[11px] text-danger font-bold"
            >
              {{ getFieldError('violation_type_id') }}
            </p>
          </div>

          <!-- تاريخ المخالفة -->
          <div class="md:col-span-3">
            <label for="rv-date" class="block text-xs font-bold text-text-secondary mb-1.5">
              تاريخ المخالفة *
            </label>
            <AppInput
              id="rv-date"
              type="date"
              v-model="form.violation_date"
              class="bg-surface-card font-mono font-bold"
              dir="ltr"
              required
            />
            <p
              v-if="getFieldError('violation_date')"
              class="mt-1 text-[11px] text-danger font-bold"
            >
              {{ getFieldError('violation_date') }}
            </p>
          </div>
        </div>

        <!-- الصف الثاني: وصف الواقعة وسبب المخالفة -->
        <div>
          <label for="rv-reason" class="block text-xs font-bold text-text-secondary mb-1.5">
            تفاصيل الواقعة وسبب المخالفة
          </label>
          <textarea
            id="rv-reason"
            v-model="form.reason"
            rows="2"
            maxlength="1000"
            placeholder="اكتب وصفاً واضحاً للمخالفة وتوقيتها ومكان وقوعها (اختياري)..."
            class="w-full p-2.5 rounded-lg bg-surface-card border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-text-primary placeholder:text-text-muted outline-none transition-all resize-none"
          ></textarea>
          <p v-if="getFieldError('reason')" class="mt-1 text-[11px] text-danger font-bold">
            {{ getFieldError('reason') }}
          </p>
        </div>

        <!-- خيار الاعتماد الفوري (يظهر للمخوّلين بالاعتماد فقط وعندما لا تكون العقوبة إنهاء خدمة) -->
        <div
          v-if="canShowAutoApproveOption"
          class="pt-1 flex items-center justify-between flex-wrap gap-2"
        >
          <label
            class="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-card border border-surface-border hover:border-primary/50 cursor-pointer select-none transition-colors"
          >
            <input
              type="checkbox"
              v-model="form.auto_approve"
              class="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary/25 accent-primary cursor-pointer"
            />
            <span class="text-xs font-bold text-text-primary">
              اعتماد الجزاء وتنفيذ أثره المالي فوراً عند الحفظ
            </span>
          </label>
        </div>
      </div>

      <!-- =========================================================
             البطاقة 2: بطاقة المعاينة الفورية للتدرج العقابي والأثر المالي
             ========================================================= -->
      <div
        class="rounded-xl border border-surface-border border-r-4 border-r-primary bg-surface-card/90 p-4 shadow-2xs transition-all duration-200"
      >
        <div
          class="flex items-center justify-between gap-2 pb-2.5 border-b border-surface-border/70"
        >
          <h4 class="text-xs font-black text-text-primary flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>معاينة الجزاء اللائحي المستحق قبل الحفظ</span>
          </h4>
          <span
            v-if="escalationPreview"
            class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/12 text-primary border border-primary/25"
          >
            محسوب آلياً حسب سجل الموظف
          </span>
        </div>

        <!-- 1. حالة عدم اكتمال الاختيار -->
        <div v-if="!canPreview" class="py-6 text-center text-xs text-text-muted font-medium">
          اختر <strong>الموظف</strong> و<strong>نوع المخالفة</strong> لعرض الدرجة العقابية المستحقة
          والأثر المالي وتاريخ السقوط تلقائياً.
        </div>

        <!-- 2. حالة جاري الحساب -->
        <div
          v-else-if="previewLoading"
          class="py-6 flex items-center justify-center gap-2.5 text-xs text-primary font-bold"
        >
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span>جاري فحص سجل الموظف وتحديد الدرجة العقابية المستحقة...</span>
        </div>

        <!-- 3. حالة وجود خطأ في المعاينة -->
        <div
          v-else-if="previewError"
          class="my-2 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-bold"
        >
          {{ previewError }}
        </div>

        <!-- 4. عرض نتيجة المعاينة الفورية -->
        <div v-else-if="escalationPreview" class="pt-3 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- الدرجة ونوع العقوبة -->
            <div class="p-3 rounded-xl bg-surface-section border border-surface-border space-y-1">
              <span class="text-[11px] font-bold text-text-muted block"
                >الدرجة والعقوبة المستحقة</span
              >
              <div class="flex items-center gap-2 flex-wrap pt-0.5">
                <span
                  class="px-2 py-0.5 rounded-md bg-primary text-white font-mono font-black text-xs"
                >
                  الدرجة ({{ escalationPreview.step_order }})
                </span>
                <span class="font-black text-xs text-text-primary">
                  {{ escalationPreview.action_type_label }}
                </span>
              </div>
            </div>

            <!-- الأثر المالي / التشغيلي -->
            <div class="p-3 rounded-xl bg-surface-section border border-surface-border space-y-1">
              <span class="text-[11px] font-bold text-text-muted block"
                >الأثر المالي والتشغيلي</span
              >
              <div class="pt-0.5">
                <template v-if="Number(escalationPreview.deduction_amount) > 0">
                  <span class="font-mono font-black text-sm text-danger">
                    خصم {{ formatCurrency(escalationPreview.deduction_amount) }}
                  </span>
                  <span
                    v-if="Number(escalationPreview.deduction_days) > 0"
                    class="text-[11px] text-text-secondary font-bold mr-1"
                  >
                    ({{ escalationPreview.deduction_days }} يوم)
                  </span>
                </template>

                <span
                  v-else-if="Number(escalationPreview.suspension_days) > 0"
                  class="font-black text-xs text-orange-600 dark:text-orange-300"
                >
                  إيقاف مؤقت لمدة ({{ escalationPreview.suspension_days }}) أيام
                </span>

                <span v-else class="font-bold text-xs text-text-secondary">
                  {{
                    escalationPreview.action_type === 'termination'
                      ? 'رفع توصية بإنهاء الخدمة'
                      : 'إجراء تأديبي بدون خصم مالي'
                  }}
                </span>
              </div>
            </div>

            <!-- مدة السريان وتاريخ السقوط -->
            <div class="p-3 rounded-xl bg-surface-section border border-surface-border space-y-1">
              <span class="text-[11px] font-bold text-text-muted block">سقوط الجزاء بالتقادم</span>
              <div class="pt-0.5 flex items-center gap-1.5 flex-wrap">
                <span class="font-mono font-black text-xs text-text-primary">
                  {{ escalationPreview.expires_at }}
                </span>
                <span class="text-[11px] text-text-muted font-bold">
                  (بعد {{ escalationPreview.validity_months }} أشهر)
                </span>
              </div>
            </div>
          </div>

          <!-- ملاحظات الدرجة وتنبيه حالة الاعتماد -->
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] pt-1"
          >
            <p v-if="escalationPreview.notes" class="text-text-secondary font-medium">
              <strong class="text-text-primary">نص اللائحة:</strong> {{ escalationPreview.notes }}
            </p>
            <span v-else></span>

            <span
              v-if="escalationPreview.action_type === 'termination'"
              class="px-2.5 py-1 rounded-lg bg-rose-500/12 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold shrink-0"
            >
              حاجز أمان: تُحفظ معلقة لحين اعتماد HR صراحةً
            </span>
            <span
              v-else
              class="px-2.5 py-1 rounded-lg font-bold shrink-0"
              :class="
                willBeAutoApproved
                  ? 'bg-success/12 text-success border border-success/30'
                  : 'bg-warning/12 text-warning border border-warning/30'
              "
            >
              {{
                willBeAutoApproved
                  ? 'سيُعتمد ويُنفذ أثره فوراً عند الحفظ'
                  : 'سيُحفظ بحالة (بانتظار الاعتماد)'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- =========================================================
             شريط الأزرار السفلي
             ========================================================= -->
      <div class="flex items-center justify-between gap-3 pt-2 border-t border-surface-border">
        <span class="text-[11px] text-text-muted hidden sm:inline">
          اختصار الحفظ:
          <kbd
            class="px-1.5 py-0.5 rounded bg-surface-section border border-surface-border font-mono text-[10px]"
          >
            Ctrl + Enter
          </kbd>
        </span>

        <div class="flex items-center gap-2.5 mr-auto">
          <AppButton
            type="button"
            variant="secondary"
            @click="handleClose"
            :disabled="isSubmitting"
          >
            إلغاء
          </AppButton>

          <AppButton type="submit" :disabled="isSubmitting || !canPreview || Boolean(previewError)">
            <span v-if="isSubmitting">جاري تسجيل المخالفة...</span>
            <span v-else>حفظ وتسجيل الجزاء</span>
          </AppButton>
        </div>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useDisciplinaryActionStore } from '@/modules/hr/stores/disciplinaryActionStore'
import { useViolationTypeStore } from '@/modules/hr/stores/violationTypeStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { formatCurrency } from '@/utils/formatters'

import AppDialog from '@/components/ui/AppDialog.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const authStore = useAuthStore()
const disciplinaryStore = useDisciplinaryActionStore()
const violationTypeStore = useViolationTypeStore()
const employeeStore = useEmployeeStore()

const { escalationPreview, previewLoading } = storeToRefs(disciplinaryStore)
const { violationTypes } = storeToRefs(violationTypeStore)
const { allEmployees } = storeToRefs(employeeStore)

const isInitialLoading = ref(false)
const isSubmitting = ref(false)
const generalError = ref('')
const previewError = ref('')
const validationErrors = ref({})
let previewTimer = null

const buildDefaultForm = () => ({
  employee_id: '',
  violation_type_id: '',
  violation_date: new Date().toISOString().split('T')[0],
  reason: '',
  auto_approve: false,
})

const form = ref(buildDefaultForm())

// التحقق من صلاحية الاعتماد الفوري
const hasAdminRole = computed(
  () =>
    Array.isArray(authStore.user?.roles) &&
    authStore.user.roles.some((r) => r.name === 'HR Manager' || r.name === 'Super Admin'),
)

const canApprove = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.approve'),
)

const activeEmployeeOptions = computed(() =>
  (allEmployees.value || [])
    .filter((emp) => emp.status !== 'dismissed' && emp.status !== 'end_of_service')
    .map((emp) => ({
      ...emp,
      displayLabel: emp.employee_number
        ? `${emp.full_name} (${emp.employee_number})`
        : emp.full_name,
    })),
)

const activeViolationTypes = computed(() =>
  (violationTypes.value || []).filter((vt) => Boolean(vt.is_active)),
)

const canPreview = computed(() =>
  Boolean(form.value.employee_id && form.value.violation_type_id && form.value.violation_date),
)

const canShowAutoApproveOption = computed(
  () =>
    canApprove.value &&
    escalationPreview.value &&
    escalationPreview.value.action_type !== 'termination',
)

const willBeAutoApproved = computed(() => {
  if (!escalationPreview.value || escalationPreview.value.action_type === 'termination') {
    return false
  }
  if (canApprove.value && form.value.auto_approve) {
    return true
  }
  return !escalationPreview.value.requires_approval
})

const getFieldError = (path) => {
  return validationErrors.value?.[path]?.[0] || null
}

// استدعاء معاينة التدرج العقابي تلقائياً عند اكتمال البيانات الأساسية
const triggerEscalationPreview = () => {
  clearTimeout(previewTimer)
  previewError.value = ''

  if (!canPreview.value) {
    disciplinaryStore.clearPreview()
    return
  }

  previewTimer = setTimeout(async () => {
    try {
      const result = await disciplinaryStore.previewEscalation({
        employee_id: Number(form.value.employee_id),
        violation_type_id: Number(form.value.violation_type_id),
        violation_date: form.value.violation_date,
      })
      if (result?.action_type === 'termination') {
        form.value.auto_approve = false
      }
    } catch (err) {
      previewError.value =
        err.response?.data?.message || 'تعذر احتساب درجة التدرج العقابي لهذا الموظف.'
    }
  }, 200)
}

watch(
  () => [form.value.employee_id, form.value.violation_type_id, form.value.violation_date],
  () => {
    triggerEscalationPreview()
  },
)

const initializeModal = async () => {
  generalError.value = ''
  previewError.value = ''
  validationErrors.value = {}
  form.value = buildDefaultForm()
  disciplinaryStore.clearPreview()

  const promises = []
  if (employeeStore.allEmployees.length === 0) {
    promises.push(employeeStore.fetchAllEmployees())
  }
  if (violationTypeStore.violationTypes.length === 0) {
    promises.push(violationTypeStore.fetchViolationTypes({ is_active: 1 }))
  }

  if (promises.length > 0) {
    isInitialLoading.value = true
    try {
      await Promise.all(promises)
    } finally {
      isInitialLoading.value = false
    }
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await initializeModal()
    } else {
      clearTimeout(previewTimer)
      disciplinaryStore.clearPreview()
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  generalError.value = ''
  validationErrors.value = {}

  if (!form.value.employee_id) {
    toast.warning('يرجى اختيار الموظف أولاً.')
    return
  }
  if (!form.value.violation_type_id) {
    toast.warning('يرجى تحديد نوع المخالفة أو اللائحة.')
    return
  }
  if (!form.value.violation_date) {
    toast.warning('يرجى تحديد تاريخ المخالفة.')
    return
  }

  const payload = {
    employee_id: Number(form.value.employee_id),
    violation_type_id: Number(form.value.violation_type_id),
    violation_date: form.value.violation_date,
    reason: form.value.reason?.trim() || null,
  }

  if (canShowAutoApproveOption.value && form.value.auto_approve) {
    payload.auto_approve = true
  }

  isSubmitting.value = true
  try {
    const created = await disciplinaryStore.createAction(payload)
    toast.success(`تم تسجيل المخالفة برقم (${created?.number || ''}) وتطبيق سلم التدرج بنجاح.`)
    emit('saved', created)
    handleClose(true)
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors
      generalError.value = err.response.data.message || 'يرجى التحقق من البيانات المدخلة.'
    } else {
      generalError.value = err.response?.data?.message || 'فشل تسجيل المخالفة التأديبية.'
    }
    toast.error(generalError.value)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = (force = false) => {
  if (isSubmitting.value && !force) return
  emit('update:modelValue', false)
  emit('close')
}

onMounted(() => {
  if (props.modelValue) {
    initializeModal()
  }
})

onBeforeUnmount(() => {
  clearTimeout(previewTimer)
})
</script>

<style scoped>
.record-violation-card :deep(input),
.record-violation-card :deep(select) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 0.5rem !important;
  box-sizing: border-box !important;
}

.record-violation-card :deep(input) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
}

:deep(.modal-embedded-dropdown .p-dropdown),
:deep(.modal-embedded-dropdown [data-pc-name='dropdown']),
:deep(.modal-embedded-dropdown [data-pc-section='root']),
:deep(.modal-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 38px !important;
  min-height: 38px !important;
}

:deep(.modal-embedded-dropdown .p-dropdown-label),
:deep(.modal-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}
</style>
