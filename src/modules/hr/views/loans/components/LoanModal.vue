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
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-2xl transform flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 id="modal-title" class="text-lg font-semibold text-text-primary">
              {{ title }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
              aria-label="Close"
              :disabled="isSaving"
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
            <LoanForm v-model="form" :is-edit-mode="isEditMode" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'تسجيل طلب السلفة' }}</span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useLoanStore } from '@/modules/hr/stores/loanStore' // سنقوم بإنشاء هذا المتجر
import AppButton from '@/components/ui/AppButton.vue'
import LoanForm from './LoanForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loanToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const loanStore = useLoanStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.loanToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل طلب السلفة' : 'طلب سلفة جديدة'))

// تحديد الشهر القادم كتاريخ افتراضي لبدء الخصم
const getNextMonthDate = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  date.setDate(1) // افتراضياً أول يوم في الشهر
  return date.toISOString().split('T')[0]
}

const defaultForm = () => ({
  employee_id: null,
  amount: '',
  installments_count: 1,
  deduction_start_date: getNextMonthDate(),
  reason: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.loanToEdit.employee_id,
          amount: props.loanToEdit.amount,
          installments_count: props.loanToEdit.installments_count,
          deduction_start_date: props.loanToEdit.deduction_start_date,
          reason: props.loanToEdit.reason,
        }
      } else {
        form.value = defaultForm()
      }
    }
  },
  { immediate: true },
)

const close = () => {
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.employee_id) return toast.error('يرجى اختيار الموظف.')
  if (!form.value.amount || form.value.amount <= 0)
    return toast.error('مبلغ السلفة يجب أن يكون أكبر من صفر.')
  if (!form.value.installments_count || form.value.installments_count < 1)
    return toast.error('عدد الأقساط يجب أن يكون 1 على الأقل.')
  if (!form.value.deduction_start_date) return toast.error('تاريخ بدء الخصم مطلوب.')
  if (!form.value.reason.trim()) return toast.error('سبب السلفة مطلوب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      // نفترض وجود نقطة نهاية للتحديث إذا كانت السلفة غير معتمدة بعد
      await loanStore.updateLoan(props.loanToEdit.id, form.value)
      toast.success('تم تحديث طلب السلفة بنجاح.')
    } else {
      await loanStore.createLoan(form.value)
      toast.success('تم تسجيل طلب السلفة بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
