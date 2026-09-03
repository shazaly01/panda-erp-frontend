<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="3xl"
    border-color="border-blue-500"
    :loading="isSaving"
  >
    <WarehouseForm v-model="form" :users="users" />

    <template #footer>
      <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
      <AppButton @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة المستودع' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import WarehouseForm from './WarehouseForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  warehouseToEdit: { type: Object, default: null },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const warehouseStore = useWarehouseStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.warehouseToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات المستودع' : 'إضافة مستودع جديد'))

const defaultForm = () => ({
  name: '',
  code: '',
  phone: '',
  address: '',
  manager_id: null,
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.warehouseToEdit.name || '',
          code: props.warehouseToEdit.code || '',
          phone: props.warehouseToEdit.phone || '',
          address: props.warehouseToEdit.address || '',
          manager_id: props.warehouseToEdit.manager_id || null,
          is_active: props.warehouseToEdit.is_active ?? true,
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
    return toast.error('حقل اسم المستودع مطلوب.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await warehouseStore.updateWarehouse(props.warehouseToEdit.id, form.value)
      toast.success('تم تحديث بيانات المستودع بنجاح.')
    } else {
      await warehouseStore.createWarehouse(form.value)
      toast.success('تمت إضافة المستودع بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(warehouseStore.error || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
