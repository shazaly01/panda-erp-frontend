<!---src\modules\hr\views\leave-passes\components\LeavePassModal.vue-->
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
                ></path>
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 pb-2">
            <LeavePassForm v-model="form" :is-edit-mode="isEditMode" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ وإصدار الإذن...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إصدار واعتماد الإذن' }}</span>
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
import { useLeavePassStore } from '@/modules/hr/stores/leavePassStore'
import AppButton from '@/components/ui/AppButton.vue'
import LeavePassForm from './LeavePassForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  leavePassToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const leavePassStore = useLeavePassStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.leavePassToEdit)

// تحديد العنوان بناءً على الصلاحية ونمط التشغيل (المشرف يصدر مباشرة)
const title = computed(() =>
  isEditMode.value ? 'تعديل تفاصيل إذن خروج قائم' : 'إصدار إذن خروج مؤقت مباشر',
)

// استمارة البيانات الافتراضية مطابقة للحقول الهيكلية المطلوبة في الـ Migration
const defaultForm = () => ({
  employee_id: null,
  date: new Date().toISOString().split('T')[0], // تهيئة الإذن تلقائياً بتاريخ اليوم الحالي
  reason: '',
  requested_leave_at: '',
  requested_return_at: '',
})

const form = ref(defaultForm())

// مراقبة فتح وإغلاق النافذة لشحن البيانات أو تصفيرها فورياً
watch(
  // تم تغييرها لتطابق مخرجات التغليف الـ Resource للباك إند بدقة
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          employee_id: props.leavePassToEdit.employee?.id || null,
          date: props.leavePassToEdit.date || new Date().toISOString().split('T')[0],
          reason: props.leavePassToEdit.reason || '',
          requested_leave_at: props.leavePassToEdit.requested_leave_at || '',
          requested_return_at: props.leavePassToEdit.requested_return_at || '',
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
  // التحقق الفوري (Client-Side Validation) لضمان اكتمال البيانات التشغيلية للأمن والـ HR
  if (!form.value.employee_id) return toast.error('يجب اختيار الموظف طالب الإذن.')
  if (!form.value.date) return toast.error('حقل تاريخ الإذن مطلوب.')
  if (!form.value.reason.trim()) return toast.error('يرجى كتابة سبب الخروج المؤقت.')
  if (!form.value.requested_leave_at) return toast.error('يرجى تحديد وقت الخروج المتوقع.')
  if (!form.value.requested_return_at) return toast.error('يرجى تحديد وقت العودة المتوقع للمنشأة.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await leavePassStore.updateLeavePass(props.leavePassToEdit.id, form.value)
      toast.success('تم تحديث بيانات إذن الخروج بنجاح.')
    } else {
      await leavePassStore.createLeavePass(form.value)
      toast.success('تم إصدار إذن الخروج واعتماده فورياً بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    // التقاط الأخطاء الصادرة عن كسر القيود الزمنية المنطقية في السيرفر وعرضها للمشرف
    toast.error(error.response?.data?.message || 'حدث خطأ غير متوقع أثناء حفظ الإذن.')
  } finally {
    isSaving.value = false
  }
}
</script>
