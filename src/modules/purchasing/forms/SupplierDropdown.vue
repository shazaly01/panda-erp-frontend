<!--src\modules\purchasing\forms\SupplierDropdown.vue--->
<template>
  <AppDropdown
    :id="id"
    :label="label"
    :model-value="modelValue"
    :options="formattedSuppliers"
    option-label="displayName"
    option-value="id"
    :placeholder="placeholder"
    :loading="supplierStore.loading"
    :required="required"
    :show-clear="showClear"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import { useSupplierStore } from '../stores/supplierStore'

const props = defineProps({
  id: {
    type: String,
    default: 'supplier-select',
  },
  label: {
    type: String,
    default: 'المورد',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: 'اختر المورد...',
  },
  required: {
    type: Boolean,
    default: false,
  },
  showClear: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'select'])

const supplierStore = useSupplierStore()

// جلب قائمة الموردين تلقائياً عند تحميل المكوّن إذا لم تكن محملة في الذاكرة
onMounted(async () => {
  if (!supplierStore.isSelectorLoaded) {
    try {
      await supplierStore.fetchSuppliersSelector()
    } catch (err) {
      console.error('حدث خطأ أثناء تحميل قائمة الموردين:', err)
    }
  }
})

// إعداد خيارات العرض والبحث بصيغة: [الكود] الاسم التجاري أو الاسم
const formattedSuppliers = computed(() => {
  return supplierStore.selectorSuppliers.map((supplier) => {
    const codePrefix = supplier.partner_code ? `[${supplier.partner_code}] ` : ''
    const displayName = `${codePrefix}${supplier.name}${
      supplier.commercial_name ? ` - ${supplier.commercial_name}` : ''
    }`

    return {
      ...supplier,
      displayName,
    }
  })
})

// معالجة التحديد وإطلاق الأحداث مع تمرير كائن المورد المالي والتشغيلي بالكامل
function handleUpdate(val) {
  emit('update:modelValue', val)

  const selectedSupplier = val ? supplierStore.getSupplierById(val) : null

  emit('change', val, selectedSupplier)
  emit('select', selectedSupplier)
}
</script>
