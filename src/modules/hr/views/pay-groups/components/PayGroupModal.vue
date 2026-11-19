<!-- src/modules/hr/views/pay-groups/components/PayGroupModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="md"
    border-color="border-primary"
    :loading="isSaving"
  >
    <PayGroupForm v-model="form" :is-edit-mode="isEditMode" />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة المجموعة' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PayGroupForm from './PayGroupForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  groupToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const payGroupStore = usePayGroupStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.groupToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل مجموعة الدفع' : 'إضافة مجموعة دفع جديدة'))

const defaultForm = () => ({
  name: '',
  frequency: '',
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.groupToEdit.name,
          frequency: props.groupToEdit.frequency,
          is_active: Boolean(props.groupToEdit.is_active),
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
  if (!form.value.name.trim()) return toast.error('يرجى إدخال اسم المجموعة.')
  if (!form.value.frequency) return toast.error('يرجى تحديد دورة الراتب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await payGroupStore.updatePayGroup(props.groupToEdit.id, form.value)
      toast.success('تم تحديث بيانات المجموعة بنجاح.')
    } else {
      await payGroupStore.createPayGroup(form.value)
      toast.success('تم إنشاء مجموعة الدفع بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات.')
  } finally {
    isSaving.value = false
  }
}
</script>
