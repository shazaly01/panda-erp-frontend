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
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-xl transform flex flex-col max-h-[90vh]"
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

          <div class="overflow-y-auto flex-1 pb-2 px-1">
            <VisitorForm v-model="form" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إصدار سجل الزيارة' }}</span>
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
import { useVisitorStore } from '@/modules/hr/stores/visitorStore'
import AppButton from '@/components/ui/AppButton.vue'
import VisitorForm from './VisitorForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  visitorToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const visitorStore = useVisitorStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.visitorToEdit)

// تعيين العناوين ديناميكياً لتطابق نوع العملية
const title = computed(() =>
  isEditMode.value ? 'تعديل بيانات سجل الزائر' : 'تسجيل وإصدار زيارة جديدة',
)

// هيكل الحقول المعتمد في الـ Backend وتوليد تاريخ اليوم تلقائياً
const defaultForm = () => ({
  name: '',
  phone: '',
  national_id: '',
  company_from: '',
  purpose: '',
  employee_id: null,
  visit_date: new Date().toISOString().substring(0, 10),
})

const form = ref(defaultForm())

// مراقبة فتح وإغلاق المودال لملء الحقول التلقائية أو تصفيرها
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.visitorToEdit.name,
          phone: props.visitorToEdit.phone,
          national_id: props.visitorToEdit.national_id || '',
          company_from: props.visitorToEdit.company_from || '',
          purpose: props.visitorToEdit.purpose || '',
          employee_id: props.visitorToEdit.employee_id || null,
          visit_date: props.visitorToEdit.visit_date,
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
  // التحقق المبدئي لضمان جودة البيانات الأساسية قبل الإرسال للـ API
  if (!form.value.name.trim()) return toast.error('حقل اسم الزائر مطلوب.')
  if (!form.value.phone.trim()) return toast.error('حقل رقم الهاتف مطلوب.')
  if (!form.value.visit_date) return toast.error('حقل تاريخ الزيارة مطلوب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await visitorStore.updateVisitor(props.visitorToEdit.id, form.value)
      toast.success('تم تحديث بيانات سجل الزائر بنجاح.')
    } else {
      await visitorStore.createVisitor(form.value)
      toast.success('تم تسجيل الزائر بنجاح وإصدار رمز الـ QR الخاص به.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ غير متوقع أثناء معالجة الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
