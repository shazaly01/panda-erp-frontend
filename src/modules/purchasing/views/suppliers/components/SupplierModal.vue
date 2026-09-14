<!--src/modules/purchasing/views/suppliers/components/SupplierModal.vue-->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="3xl"
    border-color="border-primary"
    :loading="isSaving"
  >
    <SupplierForm v-model="form" :errors="validationErrors" />

    <template #footer>
      <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
      <AppButton @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة المورد' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useSupplierStore } from '@/modules/purchasing/stores/supplierStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import SupplierForm from './SupplierForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  supplierToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const supplierStore = useSupplierStore()
const { validationErrors } = storeToRefs(supplierStore)

const isSaving = ref(false)
const isEditMode = computed(() => !!props.supplierToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'))

const defaultForm = () => ({
  name: '',
  commercial_name: '',
  type: 'company',
  status: 'active',
  phone: '',
  email: '',
  tax_number: '',
  commercial_registry: '',
  credit_limit: 0,
  credit_period_days: 0,
  address: '',
  notes: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      supplierStore.validationErrors = null

      if (isEditMode.value) {
        form.value = {
          name: props.supplierToEdit.name || '',
          commercial_name: props.supplierToEdit.commercial_name || '',
          type: props.supplierToEdit.type || 'company',
          status: props.supplierToEdit.status || 'active',
          phone: props.supplierToEdit.phone || '',
          email: props.supplierToEdit.email || '',
          tax_number: props.supplierToEdit.tax_number || '',
          commercial_registry: props.supplierToEdit.commercial_registry || '',
          credit_limit: props.supplierToEdit.credit_limit ?? 0,
          credit_period_days: props.supplierToEdit.credit_period_days ?? 0,
          address: props.supplierToEdit.address || '',
          notes: props.supplierToEdit.notes || '',
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
  supplierStore.validationErrors = null
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.name.trim()) {
    return toast.error('حقل اسم المورد مطلوب.')
  }

  isSaving.value = true
  try {
    const payload = {
      ...form.value,
      credit_limit: Number(form.value.credit_limit) || 0,
      credit_period_days: Number(form.value.credit_period_days) || 0,
    }

    if (isEditMode.value) {
      await supplierStore.updateSupplier(props.supplierToEdit.id, payload)
      toast.success('تم تحديث بيانات المورد بنجاح.')
    } else {
      await supplierStore.createSupplier(payload)
      toast.success('تمت إضافة المورد بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    if (error.response?.status !== 422) {
      toast.error(supplierStore.error || 'حدث خطأ أثناء حفظ بيانات المورد.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>
