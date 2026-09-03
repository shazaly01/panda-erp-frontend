<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="3xl"
    border-color="border-indigo-500"
    :loading="isSaving"
  >
    <CategoryForm v-model="form" :flat-categories="filteredFlatCategories" />

    <template #footer>
      <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
      <AppButton @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة التصنيف' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useCategoryStore } from '@/modules/inventory/stores/categoryStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import CategoryForm from './CategoryForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categoryToEdit: { type: Object, default: null },
  initialParentId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const categoryStore = useCategoryStore()
const { flatCategories } = storeToRefs(categoryStore)

const isSaving = ref(false)
const isEditMode = computed(() => !!props.categoryToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات التصنيف' : 'إضافة تصنيف جديد'))

// استثناء التصنيف الحالي من الخيارات عند التعديل منعاً لااختيار العنصر كـ Parent لنفسه
const filteredFlatCategories = computed(() => {
  if (!isEditMode.value || !props.categoryToEdit) {
    return flatCategories.value
  }
  return flatCategories.value.filter((cat) => cat.id !== props.categoryToEdit.id)
})

const defaultForm = () => ({
  name: '',
  code: '',
  parent_id: props.initialParentId || null,
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
          name: props.categoryToEdit.name || '',
          code: props.categoryToEdit.code || '',
          parent_id: props.categoryToEdit.parent_id || null,
          description: props.categoryToEdit.description || '',
          is_active: props.categoryToEdit.is_active ?? true,
        }
      } else {
        form.value = {
          ...defaultForm(),
          parent_id: props.initialParentId || null,
        }
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
    return toast.error('حقل اسم التصنيف مطلوب.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await categoryStore.updateCategory(props.categoryToEdit.id, form.value)
      toast.success('تم تحديث التصنيف بنجاح.')
    } else {
      await categoryStore.createCategory(form.value)
      toast.success('تمت إضافة التصنيف بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(categoryStore.error || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
