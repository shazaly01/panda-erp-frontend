<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="3xl"
    border-color="border-amber-500"
    :loading="isSaving"
  >
    <WarehouseLocationForm
      v-model="form"
      :warehouses="warehouses"
      :locations-list="locations"
      :current-edit-id="locationToEdit?.id"
    />

    <template #footer>
      <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
      <AppButton @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الموقع' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useWarehouseLocationStore } from '@/modules/inventory/stores/warehouseLocationStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import WarehouseLocationForm from './WarehouseLocationForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  locationToEdit: { type: Object, default: null },
  warehouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const warehouseLocationStore = useWarehouseLocationStore()
const { locations } = storeToRefs(warehouseLocationStore)

const isSaving = ref(false)
const isEditMode = computed(() => !!props.locationToEdit)

const title = computed(() =>
  isEditMode.value ? 'تعديل بيانات موقع المستودع' : 'إضافة موقع جديد للمستودع',
)

const defaultForm = () => ({
  warehouse_id: null,
  parent_id: null,
  name: '',
  code: '',
  type: 'shelf',
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          warehouse_id: props.locationToEdit.warehouse_id || null,
          parent_id: props.locationToEdit.parent_id || null,
          name: props.locationToEdit.name || '',
          code: props.locationToEdit.code || '',
          type: props.locationToEdit.type || 'shelf',
          is_active: props.locationToEdit.is_active ?? true,
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
  if (!form.value.warehouse_id) {
    return toast.error('يرجى اختيار المستودع.')
  }
  if (!form.value.name.trim()) {
    return toast.error('حقل اسم الموقع مطلوب.')
  }

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await warehouseLocationStore.updateLocation(props.locationToEdit.id, form.value)
      toast.success('تم تحديث موقع المستودع بنجاح.')
    } else {
      await warehouseLocationStore.createLocation(form.value)
      toast.success('تمت إضافة موقع المستودع بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(warehouseLocationStore.error || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
