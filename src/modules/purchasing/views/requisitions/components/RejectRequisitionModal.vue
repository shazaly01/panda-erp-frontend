<!-- src/modules/purchasing/views/requisitions/components/RejectRequisitionModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="handleClose"
    :title="modalTitle"
    size="md"
    border-color="border-danger"
    :loading="isSubmitting"
  >
    <form
      id="reject-requisition-form"
      @submit.prevent="handleConfirm"
      class="-m-3 p-3.5 bg-surface-header/60 rounded-xl border border-surface-border space-y-3 text-right font-sans"
      dir="rtl"
    >
      <!-- تنبيه إرشادي -->
      <div
        class="p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-start gap-2.5 text-danger text-xs leading-relaxed"
      >
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span class="font-semibold">
          سيؤدي هذا الإجراء إلى رفض الطلب نهائياً وإشعار مقدم الطلب بالسبب. يرجى توضيح سبب الرفض
          بدقة.
        </span>
      </div>

      <!-- حقل سبب الرفض -->
      <div class="space-y-1">
        <label class="block text-[11px] font-bold text-text-secondary pr-1">
          سبب الرفض <span class="text-danger">*</span>
        </label>
        <textarea
          v-model="rejectionReason"
          rows="4"
          required
          placeholder="اكتب أسباب عدم اعتماد الطلب أو التوجيهات البديلة للموظف..."
          class="w-full p-3 bg-surface-card border border-surface-border hover:border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/20 rounded-lg text-xs text-text-primary placeholder:text-text-muted outline-none transition-all resize-none font-semibold leading-relaxed"
        ></textarea>
        <p v-if="validationError" class="text-danger text-[10px] font-bold pr-1">
          {{ validationError }}
        </p>
      </div>
    </form>

    <template #footer>
      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        :disabled="isSubmitting"
        @click="handleClose"
      >
        تراجع وإلغاء
      </AppButton>

      <button
        type="submit"
        form="reject-requisition-form"
        :disabled="isSubmitting || !rejectionReason.trim()"
        class="h-9 px-4 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">جاري الرفض...</span>
        <span v-else>تأكيد الرفض</span>
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  requisition: { type: Object, default: () => null },
  isSubmitting: { type: Boolean, default: false },
  validationError: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'close'])

const rejectionReason = ref('')

const modalTitle = computed(() => {
  const num =
    props.requisition?.requisition_number ||
    (props.requisition?.id ? `#${props.requisition.id}` : '')
  return num ? `رفض طلب الشراء (${num})` : 'رفض طلب الشراء'
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      rejectionReason.value = ''
    }
  },
)

const handleClose = () => {
  if (props.isSubmitting) return
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirm = () => {
  if (!rejectionReason.value.trim()) return
  emit('confirm', rejectionReason.value.trim())
}
</script>
