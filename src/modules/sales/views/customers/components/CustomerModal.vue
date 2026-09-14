<!--src/modules/sales/views/customers/components/CustomerModal.vue-->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="3xl"
    border-color="border-primary"
    :loading="isSaving"
  >
    <CustomerForm v-model="form" :errors="validationErrors" />

    <template #footer>
      <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
      <AppButton @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة العميل' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'

import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import CustomerForm from './CustomerForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  customerToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const customerStore = useCustomerStore()
const { validationErrors } = storeToRefs(customerStore)

const isSaving = ref(false)
const isEditMode = computed(() => !!props.customerToEdit)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'))

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
      customerStore.validationErrors = null

      if (isEditMode.value) {
        form.value = {
          name: props.customerToEdit.name || '',
          commercial_name: props.customerToEdit.commercial_name || '',
          type: props.customerToEdit.type || 'company',
          status: props.customerToEdit.status || 'active',
          phone: props.customerToEdit.phone || '',
          email: props.customerToEdit.email || '',
          tax_number: props.customerToEdit.tax_number || '',
          commercial_registry: props.customerToEdit.commercial_registry || '',
          credit_limit: props.customerToEdit.credit_limit ?? 0,
          credit_period_days: props.customerToEdit.credit_period_days ?? 0,
          address: props.customerToEdit.address || '',
          notes: props.customerToEdit.notes || '',
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
  customerStore.validationErrors = null
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.name.trim()) {
    return toast.error('حقل اسم العميل مطلوب.')
  }

  isSaving.value = true
  try {
    const payload = {
      ...form.value,
      credit_limit: Number(form.value.credit_limit) || 0,
      credit_period_days: Number(form.value.credit_period_days) || 0,
    }

    if (isEditMode.value) {
      await customerStore.updateCustomer(props.customerToEdit.id, payload)
      toast.success('تم تحديث بيانات العميل بنجاح.')
    } else {
      await customerStore.createCustomer(payload)
      toast.success('تمت إضافة العميل بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    if (error.response?.status !== 422) {
      toast.error(customerStore.error || 'حدث خطأ أثناء حفظ بيانات العميل.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>
