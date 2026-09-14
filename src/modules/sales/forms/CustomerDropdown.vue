<template>
  <AppDropdown
    :id="id"
    :label="label"
    :model-value="modelValue"
    :options="formattedCustomers"
    option-label="displayName"
    option-value="id"
    :placeholder="placeholder"
    :loading="customerStore.loading"
    :required="required"
    :show-clear="showClear"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import { useCustomerStore } from '../stores/customerStore'

const props = defineProps({
  id: {
    type: String,
    default: 'customer-select',
  },
  label: {
    type: String,
    default: 'العميل',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: 'اختر العميل...',
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

const customerStore = useCustomerStore()

// تحميل قائمة العملاء تلقائياً عند تحميل المكوّن إذا لم تكن محملة مسبقاً في الذاكرة
onMounted(async () => {
  if (!customerStore.isSelectorLoaded) {
    try {
      await customerStore.fetchCustomersSelector()
    } catch (err) {
      console.error('حدث خطأ أثناء تحميل قائمة العملاء:', err)
    }
  }
})

// إعداد خيارات العرض والبحث بصيغة: [الكود] الاسم التجاري أو الاسم
const formattedCustomers = computed(() => {
  return customerStore.selectorCustomers.map((customer) => {
    const codePrefix = customer.partner_code ? `[${customer.partner_code}] ` : ''
    const displayName = `${codePrefix}${customer.name}${
      customer.commercial_name ? ` - ${customer.commercial_name}` : ''
    }`

    return {
      ...customer,
      displayName,
    }
  })
})

// معالجة التحديد وتمرير كائن العميل ببياناته المالية والتشغيلية (حساب الذمم، العملة، حد الائتمان)
function handleUpdate(val) {
  emit('update:modelValue', val)

  const selectedCustomer = val ? customerStore.getCustomerById(val) : null

  emit('change', val, selectedCustomer)
  emit('select', selectedCustomer)
}
</script>
