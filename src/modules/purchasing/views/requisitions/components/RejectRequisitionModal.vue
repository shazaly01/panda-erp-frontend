<!-- src/modules/purchasing/views/requisitions/components/RejectRequisitionModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    dir="rtl"
  >
    <div
      class="w-full max-w-lg bg-[#23252e] border border-[#3e414c] rounded-2xl shadow-2xl overflow-hidden font-sans text-right animate-in fade-in zoom-in duration-200"
    >
      <!-- ترويسة النافذة المنبثقة -->
      <div class="flex items-center justify-between p-4 border-b border-[#374158] bg-[#181d28]">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-6 bg-rose-500 rounded-full inline-block"></span>
          <h2 class="text-sm font-black text-white">
            رفض طلب الشراء رقم ({{ requisition?.requisition_number || `#${requisition?.id}` }})
          </h2>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- محتوى النموذج -->
      <form @submit.prevent="handleConfirm" class="p-5 space-y-4">
        <div
          class="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed"
        >
          <svg
            class="w-5 h-5 shrink-0 text-rose-400 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            سيؤدي هذا الإجراء إلى رفض الطلب نهائياً وإشعار مقدم الطلب بالسبب. يرجى توضيح سبب الرفض
            بدقة.
          </span>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-300">
            سبب الرفض <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="rejectionReason"
            rows="4"
            required
            placeholder="اكتب أسباب عدم اعتماد الطلب أو التوجيهات البديلة للموظف..."
            class="w-full p-3 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all resize-none font-semibold leading-relaxed"
          ></textarea>
          <p v-if="validationError" class="text-rose-400 text-[11px] font-bold mt-1">
            {{ validationError }}
          </p>
        </div>

        <!-- أزرار الإجراء -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#374158]">
          <button
            type="button"
            @click="handleClose"
            :disabled="isSubmitting"
            class="h-9 px-4 bg-transparent hover:bg-gray-800 text-gray-300 text-xs font-bold rounded-xl border border-gray-600 transition-all disabled:opacity-50"
          >
            تراجع وإلغاء
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !rejectionReason.trim()"
            class="h-9 px-5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span v-if="isSubmitting">جاري الرفض...</span>
            <span v-else>تأكيد الرفض</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  requisition: { type: Object, default: () => null },
  isSubmitting: { type: Boolean, default: false },
  validationError: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'close'])

const rejectionReason = ref('')

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      rejectionReason.value = ''
    }
  },
)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirm = () => {
  if (!rejectionReason.value.trim()) return
  emit('confirm', rejectionReason.value.trim())
}
</script>
