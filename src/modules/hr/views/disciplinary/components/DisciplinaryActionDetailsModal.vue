<!-- src/modules/hr/views/disciplinary/components/DisciplinaryActionDetailsModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="dialogTitle"
    size="3xl"
    border-color="border-primary"
    :loading="isProcessing"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <!-- مؤشر التحميل -->
    <div v-if="loading && !action" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span class="text-xs text-text-muted font-bold">جاري تحميل تفاصيل الجزاء التأديبي...</span>
    </div>

    <!-- رسالة خطأ في حال تعذر الجلب -->
    <div
      v-else-if="loadError"
      class="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-bold text-center"
    >
      {{ loadError }}
    </div>

    <!-- محتوى تفاصيل الجزاء -->
    <div v-else-if="action" class="space-y-4 font-sans text-right" dir="rtl">
      <!-- =========================================================
             1. شريط الملخص العلوي (الرقم المرجعي + الحالة + التواريخ)
             ========================================================= -->
      <div
        class="p-4 rounded-xl bg-surface-header/70 border border-surface-border border-r-4 border-r-primary flex flex-wrap items-center justify-between gap-3"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono font-black text-base text-primary">
              {{ action.number }}
            </span>
            <AppBadge :variant="getStatusBadgeVariant(action.effective_status)" size="sm" pill>
              {{ action.status_label }}
            </AppBadge>
            <span
              class="text-[11px] px-2 py-0.5 rounded-md font-bold border"
              :class="
                action.attendance_log_id
                  ? 'bg-info/12 text-info border-info/30'
                  : 'bg-surface-card text-text-secondary border-surface-border'
              "
            >
              {{ action.attendance_log_id ? 'رصد آلي من البصمة' : 'مخالفة مسجلة يدوياً' }}
            </span>
          </div>
          <p class="text-xs font-bold text-text-primary">
            {{ action.violation_type?.name || 'مخالفة لائحية' }}
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs">
          <div class="text-right">
            <span class="block text-[10px] font-bold text-text-muted">تاريخ المخالفة</span>
            <span class="font-mono font-black text-text-primary">{{ action.violation_date }}</span>
          </div>
          <div v-if="action.expires_at" class="text-right border-r border-surface-border pr-4">
            <span class="block text-[10px] font-bold text-text-muted">تاريخ السقوط بالتقادم</span>
            <span
              class="font-mono font-black"
              :class="action.is_expired ? 'text-text-muted line-through' : 'text-warning'"
            >
              {{ action.expires_at }}
            </span>
          </div>
        </div>
      </div>

      <!-- =========================================================
             2. بطاقة الموظف والعقوبة المقررة
             ========================================================= -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <!-- بيانات الموظف واللائحة -->
        <div
          class="p-4 rounded-xl bg-surface-section/70 border border-surface-border space-y-2.5 text-xs"
        >
          <h4
            class="font-black text-text-primary border-b border-surface-border/70 pb-1.5 flex items-center gap-1.5"
          >
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>بيانات الموظف واللائحة</span>
          </h4>

          <div class="flex justify-between items-center">
            <span class="text-text-muted font-bold">اسم الموظف:</span>
            <span class="font-black text-text-primary">{{
              action.employee?.full_name || '-'
            }}</span>
          </div>

          <div v-if="action.employee?.employee_number" class="flex justify-between items-center">
            <span class="text-text-muted font-bold">الرقم الوظيفي:</span>
            <span class="font-mono font-bold text-text-secondary">
              {{ action.employee.employee_number }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-text-muted font-bold">اللائحة المطبقة:</span>
            <span class="font-bold text-text-primary">{{
              action.violation_type?.name || '-'
            }}</span>
          </div>

          <div v-if="action.violation_type?.code" class="flex justify-between items-center">
            <span class="text-text-muted font-bold">كود اللائحة:</span>
            <span
              class="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-text-secondary"
            >
              {{ action.violation_type.code }}
            </span>
          </div>
        </div>

        <!-- تفاصيل العقوبة والأثر المالي -->
        <div
          class="p-4 rounded-xl bg-surface-section/70 border border-surface-border space-y-2.5 text-xs"
        >
          <h4
            class="font-black text-text-primary border-b border-surface-border/70 pb-1.5 flex items-center gap-1.5"
          >
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>تفاصيل العقوبة والأثر المالي</span>
          </h4>

          <div class="flex justify-between items-center">
            <span class="text-text-muted font-bold">درجة التدرج العقابي:</span>
            <span
              class="px-2 py-0.5 rounded font-mono font-black bg-primary/12 text-primary border border-primary/25"
            >
              الدرجة ({{ action.step_order }})
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-text-muted font-bold">نوع العقوبة:</span>
            <AppBadge :variant="getActionBadgeVariant(action.action_type)" size="xs">
              {{ action.action_type_label }}
            </AppBadge>
          </div>

          <div v-if="Number(action.deduction_amount) > 0" class="flex justify-between items-center">
            <span class="text-text-muted font-bold">قيمة الخصم المالي:</span>
            <span class="font-mono font-black text-danger text-sm">
              {{ formatCurrency(action.deduction_amount) }}
              <span
                v-if="Number(action.deduction_days) > 0"
                class="text-[11px] font-sans font-bold text-text-muted"
              >
                ({{ action.deduction_days }} يوم)
              </span>
            </span>
          </div>

          <div v-if="Number(action.suspension_days) > 0" class="flex justify-between items-center">
            <span class="text-text-muted font-bold">مدة الإيقاف المؤقت:</span>
            <span class="font-black text-orange-600 dark:text-orange-300">
              {{ action.suspension_days }} أيام عمل
            </span>
          </div>

          <div
            v-if="Number(action.deduction_amount) <= 0 && Number(action.suspension_days) <= 0"
            class="flex justify-between items-center"
          >
            <span class="text-text-muted font-bold">الأثر المالي المباشر:</span>
            <span class="text-text-secondary font-semibold">لا يوجد خصم مالي</span>
          </div>
        </div>
      </div>

      <!-- =========================================================
             3. سبب المخالفة وتفاصيل الواقعة
             ========================================================= -->
      <div
        v-if="action.reason"
        class="p-3.5 rounded-xl bg-surface-card border border-surface-border space-y-1 text-xs"
      >
        <span class="text-[11px] font-bold text-text-muted block">بيان المخالفة وسبب القرار:</span>
        <p class="font-semibold text-text-primary leading-relaxed">{{ action.reason }}</p>
      </div>

      <!-- =========================================================
             4. بطاقة سجل البصمة المسبب للمخالفة (تظهر للمخالفات الآلية)
             ========================================================= -->
      <div
        v-if="action.attendance_log"
        class="p-4 rounded-xl bg-info/8 border border-info/25 space-y-2.5 text-xs"
      >
        <div class="flex items-center justify-between border-b border-info/20 pb-1.5">
          <h4 class="font-black text-info flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>بيانات سجل البصمة المسبب للمخالفة</span>
          </h4>
          <span class="font-mono font-bold text-text-secondary">
            {{ action.attendance_log.date }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div class="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span class="block text-[10px] text-text-muted font-bold">وقت الحضور</span>
            <span class="font-mono font-black text-text-primary">
              {{ formatTime(action.attendance_log.check_in) }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span class="block text-[10px] text-text-muted font-bold">وقت الانصراف</span>
            <span class="font-mono font-black text-text-primary">
              {{ formatTime(action.attendance_log.check_out) }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span class="block text-[10px] text-text-muted font-bold">دقائق التأخير</span>
            <span
              class="font-mono font-black"
              :class="
                action.attendance_log.delay_minutes > 0 ? 'text-danger' : 'text-text-secondary'
              "
            >
              {{ action.attendance_log.delay_minutes }} دقيقة
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span class="block text-[10px] text-text-muted font-bold">الانصراف المبكر</span>
            <span
              class="font-mono font-black"
              :class="
                action.attendance_log.early_leave_minutes > 0
                  ? 'text-warning'
                  : 'text-text-secondary'
              "
            >
              {{ action.attendance_log.early_leave_minutes }} دقيقة
            </span>
          </div>
        </div>

        <div v-if="action.pay_period" class="text-[11px] text-text-secondary pt-1">
          <strong>الفترة المالية المحتسبة:</strong> {{ action.pay_period.name }} ({{
            action.pay_period.start_date
          }}
          إلى {{ action.pay_period.end_date }})
        </div>
      </div>

      <!-- =========================================================
             5. حالة الربط المالي في مسيرات الرواتب
             ========================================================= -->
      <div
        v-if="action.payroll_input"
        class="p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs"
        :class="
          action.payroll_input.is_processed
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-warning/10 border-warning/30 text-warning'
        "
      >
        <div class="flex items-center gap-2 font-bold">
          <span>
            {{
              action.payroll_input.is_processed
                ? `تم ترحيل الخصم المالي (${formatCurrency(action.payroll_input.amount)}) في مسير الرواتب رقم #${action.payroll_input.payroll_batch_id}.`
                : `الخصم المالي (${formatCurrency(action.payroll_input.amount)}) مدرج في مدخلات الرواتب وبانتظار ترحيل مسير الشهر.`
            }}
          </span>
        </div>
      </div>

      <!-- =========================================================
             6. سجل التدقيق والاعتماد والإلغاء
             ========================================================= -->
      <div
        class="p-3.5 rounded-xl bg-surface-section/60 border border-surface-border space-y-2 text-[11px]"
      >
        <h4 class="font-black text-text-secondary">سجل التدقيق والمتابعة:</h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary">
          <div>
            <span class="text-text-muted">سُجّل بواسطة:</span>
            <strong class="text-text-primary mr-1">
              {{ action.creator?.name || 'النظام الآلي (البصمة)' }}
            </strong>
            <span v-if="action.created_at" class="font-mono text-[10px] text-text-muted mr-1">
              ({{ action.created_at }})
            </span>
          </div>

          <div v-if="action.approved_at">
            <span class="text-text-muted">اعتمده:</span>
            <strong class="text-success mr-1">{{ action.approver?.name || '-' }}</strong>
            <span class="font-mono text-[10px] text-text-muted mr-1">
              ({{ action.approved_at }})
            </span>
          </div>
        </div>

        <!-- تفاصيل الإلغاء إن وُجدت -->
        <div
          v-if="action.status === 'cancelled'"
          class="mt-2 p-2.5 rounded-lg bg-danger/10 border border-danger/25 text-danger space-y-1"
        >
          <div>
            <strong>تم إلغاء الجزاء بواسطة:</strong>
            <span class="mr-1">{{ action.canceller?.name || 'النظام الآلي' }}</span>
            <span v-if="action.cancelled_at" class="font-mono text-[10px] mr-1">
              ({{ action.cancelled_at }})
            </span>
          </div>
          <div v-if="action.cancellation_reason">
            <strong>سبب الإلغاء:</strong> {{ action.cancellation_reason }}
          </div>
        </div>
      </div>

      <!-- =========================================================
             7. لوحة إلغاء مدمجة (تظهر عند ضغط زر إلغاء الجزاء)
             ========================================================= -->
      <div
        v-if="isCancelPanelOpen"
        class="p-4 rounded-xl bg-warning/10 border border-warning/40 space-y-3"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black text-warning">إدخال سبب إلغاء الجزاء التأديبي</h4>
          <button
            type="button"
            @click="isCancelPanelOpen = false"
            class="text-xs text-text-muted hover:text-text-primary cursor-pointer"
          >
            إغلاق ✕
          </button>
        </div>

        <textarea
          v-model="cancellationReason"
          rows="2"
          minlength="3"
          maxlength="255"
          placeholder="اكتب مبرر إلغاء الجزاء والتراجع عن أثره المالي..."
          class="w-full p-2.5 rounded-lg bg-surface-card border border-surface-border focus:border-warning text-xs font-semibold text-text-primary outline-none resize-none"
        ></textarea>

        <div class="flex items-center justify-end gap-2">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            @click="isCancelPanelOpen = false"
            :disabled="isProcessing"
          >
            تراجع
          </AppButton>
          <AppButton
            type="button"
            variant="warning"
            size="sm"
            :disabled="isProcessing || cancellationReason.trim().length < 3"
            @click="handleCancelSubmit"
          >
            {{ isProcessing ? 'جاري الإلغاء...' : 'تأكيد إلغاء الجزاء' }}
          </AppButton>
        </div>
      </div>

      <!-- =========================================================
             8. شريط الأزرار السفلي
             ========================================================= -->
      <div
        class="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-surface-border"
      >
        <div class="flex items-center gap-2 flex-wrap">
          <!-- زر الاعتماد -->
          <AppButton
            v-if="canApprove && action.status === 'pending'"
            type="button"
            :variant="action.action_type === 'termination' ? 'danger' : 'primary'"
            :disabled="isProcessing"
            @click="isApproveConfirmOpen = true"
          >
            {{
              action.action_type === 'termination'
                ? 'اعتماد توصية إنهاء الخدمة'
                : 'اعتماد الجزاء وتنفيذ أثره'
            }}
          </AppButton>

          <!-- زر الإلغاء -->
          <AppButton
            v-if="canCancel && canCancelCurrentAction && !isCancelPanelOpen"
            type="button"
            variant="warning"
            :disabled="isProcessing"
            @click="openCancelPanel"
          >
            إلغاء الجزاء
          </AppButton>
        </div>

        <AppButton type="button" variant="secondary" @click="handleClose" :disabled="isProcessing">
          إغلاق
        </AppButton>
      </div>
    </div>

    <!-- حوار تأكيد الاعتماد -->
    <AppConfirmDialog
      v-model="isApproveConfirmOpen"
      :title="
        action?.action_type === 'termination'
          ? 'تحذير حرج: تأكيد اعتماد إنهاء الخدمة'
          : 'تأكيد اعتماد الجزاء التأديبي'
      "
      :message="approveConfirmText"
      :confirm-text="
        action?.action_type === 'termination' ? 'اعتماد إنهاء الخدمة' : 'اعتماد وتنفيذ'
      "
      :confirm-variant="action?.action_type === 'termination' ? 'danger' : 'primary'"
      @confirmed="handleApproveConfirm"
    />
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useDisciplinaryActionStore } from '@/modules/hr/stores/disciplinaryActionStore'
import { formatCurrency } from '@/utils/formatters'

import AppDialog from '@/components/ui/AppDialog.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  actionId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'updated'])

const toast = useToast()
const authStore = useAuthStore()
const disciplinaryStore = useDisciplinaryActionStore()

const { singleAction: action, loading } = storeToRefs(disciplinaryStore)

const loadError = ref('')
const isProcessing = ref(false)
const isApproveConfirmOpen = ref(false)
const isCancelPanelOpen = ref(false)
const cancellationReason = ref('')

const dialogTitle = computed(() =>
  action.value?.number
    ? `تفاصيل الجزاء التأديبي (${action.value.number})`
    : 'تفاصيل الجزاء التأديبي',
)

const hasAdminRole = computed(
  () =>
    Array.isArray(authStore.user?.roles) &&
    authStore.user.roles.some((r) => r.name === 'HR Manager' || r.name === 'Super Admin'),
)

const canApprove = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.approve'),
)

const canCancel = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.cancel'),
)

const canCancelCurrentAction = computed(() => {
  if (!action.value) return false
  if (action.value.status === 'cancelled') return false
  if (action.value.payroll_input?.is_processed) return false
  return true
})

const approveConfirmText = computed(() => {
  if (!action.value) return ''
  if (action.value.action_type === 'termination') {
    return `تنبيه حرج: اعتماد القرار رقم (${action.value.number}) سيؤدي إلى تغيير حالة الموظف "${action.value.employee?.full_name}" إلى (مفصول / Dismissed) وإغلاق عقده النشط فوراً. هل تريد المتابعة؟`
  }
  return `هل أنت متأكد من رغبتك في اعتماد الجزاء رقم (${action.value.number}) وتنفيذ أثره المالي والتشغيلي؟`
})

const getActionBadgeVariant = (actionType) => {
  switch (actionType) {
    case 'verbal_warning':
      return 'info'
    case 'written_warning':
      return 'warning'
    case 'salary_deduction':
      return 'primary'
    case 'suspension':
      return 'warning'
    case 'termination':
      return 'danger'
    default:
      return 'secondary'
  }
}

const getStatusBadgeVariant = (effectiveStatus) => {
  switch (effectiveStatus) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'expired':
      return 'secondary'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return '—'
  return String(timeStr).substring(0, 5)
}

const loadDetails = async () => {
  if (!props.actionId) return
  loadError.value = ''
  isCancelPanelOpen.value = false
  cancellationReason.value = ''

  try {
    await disciplinaryStore.fetchActionById(props.actionId)
  } catch (err) {
    loadError.value = err.response?.data?.message || 'تعذر تحميل تفاصيل الجزاء التأديبي.'
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen && props.actionId) {
      await loadDetails()
    } else {
      isCancelPanelOpen.value = false
      cancellationReason.value = ''
    }
  },
  { immediate: true },
)

const handleApproveConfirm = async () => {
  if (!action.value) return
  isApproveConfirmOpen.value = false
  isProcessing.value = true
  try {
    await disciplinaryStore.approveAction(action.value.id)
    toast.success(`تم اعتماد الجزاء (${action.value.number}) وتنفيذ أثره بنجاح.`)
    emit('updated')
  } catch {
    toast.error(disciplinaryStore.error || 'تعذر اعتماد الجزاء التأديبي.')
  } finally {
    isProcessing.value = false
  }
}

const openCancelPanel = () => {
  cancellationReason.value = ''
  isCancelPanelOpen.value = true
}

const handleCancelSubmit = async () => {
  if (!action.value || cancellationReason.value.trim().length < 3) return
  isProcessing.value = true
  try {
    await disciplinaryStore.cancelAction(action.value.id, {
      cancellation_reason: cancellationReason.value.trim(),
    })
    toast.success(`تم إلغاء الجزاء (${action.value.number}) والتراجع عن أثره بنجاح.`)
    isCancelPanelOpen.value = false
    emit('updated')
  } catch {
    toast.error(disciplinaryStore.error || 'تعذر إلغاء الجزاء التأديبي.')
  } finally {
    isProcessing.value = false
  }
}

const handleClose = (force = false) => {
  if (isProcessing.value && !force) return
  emit('update:modelValue', false)
  emit('close')
}
</script>
