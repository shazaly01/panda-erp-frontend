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
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-lg transform flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
            <h3 class="text-lg font-semibold text-text-primary">
              {{ isEditMode ? 'تعديل الوردية' : 'إضافة وردية جديدة' }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
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

          <div class="pb-2">
            <ShiftForm v-model="form" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الوردية' }}</span>
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
import { useShiftStore } from '@/modules/hr/stores/shiftStore'
import AppButton from '@/components/ui/AppButton.vue'
import ShiftForm from './ShiftForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  shiftToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const shiftStore = useShiftStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.shiftToEdit)

const defaultForm = () => ({
  name: '',
  start_time: '08:00',
  end_time: '16:00',
  grace_period_minutes: 15,
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.shiftToEdit.name,
          start_time: props.shiftToEdit.start_time,
          end_time: props.shiftToEdit.end_time,
          grace_period_minutes: props.shiftToEdit.grace_period_minutes,
          is_active: props.shiftToEdit.is_active,
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
  if (!form.value.name.trim()) return toast.error('يرجى إدخال اسم الوردية.')
  if (!form.value.start_time || !form.value.end_time) return toast.error('أوقات الوردية مطلوبة.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await shiftStore.updateShift(props.shiftToEdit.id, form.value)
      toast.success('تم تحديث إعدادات الوردية بنجاح.')
    } else {
      await shiftStore.createShift(form.value)
      toast.success('تم إضافة الوردية بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(shiftStore.error || 'حدث خطأ أثناء حفظ الوردية.')
  } finally {
    isSaving.value = false
  }
}
</script>
