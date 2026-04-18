<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 class="text-lg font-semibold text-text-primary">توليد الفترات المالية</h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
              aria-label="Close"
              :disabled="isGenerating"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 pb-2 px-1">
            <PayPeriodGenerateForm v-model="form" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isGenerating">
              إلغاء
            </AppButton>
            <AppButton @click="submit" :disabled="isGenerating">
              <span v-if="isGenerating" class="flex items-center gap-2">
                <svg
                  class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري التوليد...
              </span>
              <span v-else>بدء التوليد</span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayPeriodStore } from '@/modules/hr/stores/payPeriodStore'
import AppButton from '@/components/ui/AppButton.vue'
import PayPeriodGenerateForm from './PayPeriodGenerateForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const payPeriodStore = usePayPeriodStore()

const isGenerating = ref(false)

// تحديد السنة الحالية كقيمة افتراضية ذكية
const currentYear = new Date().getFullYear()

const defaultForm = () => ({
  pay_group_id: '',
  year: currentYear,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      form.value = defaultForm()
    }
  },
)

const close = () => {
  if (isGenerating.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  // تحقق Frontend بسيط
  if (!form.value.pay_group_id) return toast.error('يرجى تحديد مجموعة الدفع أولاً.')
  if (!form.value.year || form.value.year < 2020) return toast.error('يرجى إدخال سنة مالية صحيحة.')

  isGenerating.value = true
  try {
    const result = await payPeriodStore.generatePeriods(form.value)
    // طباعة رسالة النجاح القادمة من الباك إند التي تخبرنا بعدد الفترات
    toast.success(result.message || 'تم توليد الفترات بنجاح.')

    emit('update:modelValue', false)
    emit('saved') // لإعادة تحميل الجدول في الشاشة الرئيسية
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء عملية التوليد.')
  } finally {
    isGenerating.value = false
  }
}
</script>
