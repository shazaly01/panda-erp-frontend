<!-- src/modules/hr/views/positions/components/PositionModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="md"
    border-color="border-primary"
    :loading="isSaving"
  >
    <PositionForm v-model="form" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة المسمى الوظيفي' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePositionStore } from '@/modules/hr/stores/positionStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import PositionForm from './PositionForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  positionToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const positionStore = usePositionStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.positionToEdit)

const title = computed(() =>
  isEditMode.value ? 'تعديل بيانات المسمى الوظيفي' : 'إضافة مسمى وظيفي جديد',
)

const defaultForm = () => ({
  name: '',
  code: '',
  description: '',
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.positionToEdit.name,
          code: props.positionToEdit.code || '',
          description: props.positionToEdit.description || '',
          is_active: props.positionToEdit.is_active ?? true,
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
  if (!form.value.name.trim()) return toast.error('حقل المسمى الوظيفي مطلوب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await positionStore.updatePosition(props.positionToEdit.id, form.value)
      toast.success('تم تحديث المسمى الوظيفي بنجاح.')
    } else {
      await positionStore.createPosition(form.value)
      toast.success('تمت إضافة المسمى الوظيفي بنجاح.')
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
