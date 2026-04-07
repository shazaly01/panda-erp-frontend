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
            <AttendanceLogForm v-model="form" :is-edit-mode="isEditMode" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'تسجيل الحركة' }}</span>
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
import { useAttendanceLogStore } from '@/modules/hr/stores/attendanceLogStore' // سنقوم بإنشائه لاحقاً
import AppButton from '@/components/ui/AppButton.vue'
import AttendanceLogForm from './AttendanceLogForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  logToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const attendanceLogStore = useAttendanceLogStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.logToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل حركة الحضور' : 'تسجيل حركة حضور يدوية'))

// دالة مساعدة للحصول على تاريخ اليوم بصيغة YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0]

const defaultForm = () => ({
  employee_id: null,
  date: getTodayDate(),
  check_in: '',
  check_out: '',
  status: 'present',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.logToEdit.employee_id,
          date: props.logToEdit.date,
          check_in: props.logToEdit.check_in || '',
          check_out: props.logToEdit.check_out || '',
          status: props.logToEdit.status,
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
  if (!form.value.date) return toast.error('تاريخ الحركة مطلوب.')
  if (!form.value.status) return toast.error('حالة الحضور مطلوبة.')

  // تحقق منطقي: لا يمكن تسجيل انصراف قبل الحضور
  if (form.value.check_in && form.value.check_out) {
    if (form.value.check_out <= form.value.check_in) {
      return toast.error('وقت الانصراف يجب أن يكون بعد وقت الحضور.')
    }
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await attendanceLogStore.updateAttendance(props.logToEdit.id, form.value)
      toast.success('تم تحديث حركة الحضور بنجاح.')
    } else {
      await attendanceLogStore.createAttendance(form.value)
      toast.success('تم تسجيل حركة الحضور بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الحركة.')
  } finally {
    isSaving.value = false
  }
}
</script>
