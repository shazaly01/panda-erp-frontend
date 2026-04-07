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
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 class="text-lg font-semibold text-text-primary">
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
            <LeaveRequestForm v-model="form" :is-edit-mode="isEditMode" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'تقديم الطلب' }}</span>
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
import { useLeaveStore } from '@/modules/hr/stores/leaveStore' // سنقوم بإنشائه لاحقاً
import AppButton from '@/components/ui/AppButton.vue'
import LeaveRequestForm from './LeaveRequestForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  requestToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const leaveStore = useLeaveStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.requestToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل طلب الإجازة' : 'تقديم طلب إجازة جديد'))

// دالة مساعدة للحصول على تاريخ اليوم بصيغة YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0]

const defaultForm = () => ({
  employee_id: null,
  leave_type_id: null,
  start_date: getTodayDate(),
  end_date: getTodayDate(),
  reason: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.requestToEdit.employee_id,
          // قد يكون leave_type_id موجوداً ككائن أو كـ ID مباشر حسب الـ Resource المستقبلي
          leave_type_id: props.requestToEdit.leave_type_id || props.requestToEdit.leave_type?.id,
          start_date: props.requestToEdit.start_date,
          end_date: props.requestToEdit.end_date,
          reason: props.requestToEdit.reason || '',
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
  // التحقق المبدئي (Frontend Validation)
  if (!form.value.employee_id) return toast.error('يرجى اختيار الموظف.')
  if (!form.value.leave_type_id) return toast.error('يرجى تحديد نوع الإجازة.')
  if (!form.value.start_date) return toast.error('تاريخ بداية الإجازة مطلوب.')
  if (!form.value.end_date) return toast.error('تاريخ نهاية الإجازة مطلوب.')

  if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
    return toast.error('تاريخ النهاية يجب أن يكون مساوياً أو بعد تاريخ البداية.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await leaveStore.updateLeaveRequest(props.requestToEdit.id, form.value)
      toast.success('تم تحديث طلب الإجازة بنجاح.')
    } else {
      await leaveStore.createLeaveRequest(form.value)
      toast.success('تم تقديم طلب الإجازة بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الطلب.')
  } finally {
    isSaving.value = false
  }
}
</script>
