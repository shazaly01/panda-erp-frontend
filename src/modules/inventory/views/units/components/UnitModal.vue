<!---src\modules\inventory\views\units\components\UnitModal.vue--->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="3xl"
    border-color="border-emerald-500"
    :loading="isSaving"
  >
    <UnitForm v-model="form" />

    <template #footer>
      <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
      <AppButton @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة وحدة قياس' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useUnitStore } from '@/modules/inventory/stores/unitStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import UnitForm from './UnitForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  unitToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const unitStore = useUnitStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.unitToEdit)

const title = computed(() =>
  isEditMode.value ? 'تعديل بيانات وحدة القياس' : 'إضافة وحدة قياس جديدة',
)

const defaultForm = () => ({
  name: '',
  symbol: '',
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.unitToEdit.name || '',
          symbol: props.unitToEdit.symbol || '',
          is_active: props.unitToEdit.is_active ?? true,
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
  if (!form.value.name.trim()) {
    return toast.error('حقل اسم وحدة القياس مطلوب.')
  }
  if (!form.value.symbol.trim()) {
    return toast.error('حقل رمز/اختصار وحدة القياس مطلوب.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await unitStore.updateUnit(props.unitToEdit.id, form.value)
      toast.success('تم تحديث وحدة القياس بنجاح.')
    } else {
      await unitStore.createUnit(form.value)
      toast.success('تمت إضافة وحدة القياس بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(unitStore.error || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
