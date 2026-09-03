<!--src\modules\inventory\forms\WarehouseDropdown.vue--->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="warehouses"
      option-label="name"
      option-value="id"
      :loading="loading"
      :required="required"
      placeholder="اختر المخزن"
      show-clear
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'

// تعريف الخصائص والأحداث
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المستودع' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// استخدام مخزن المستودعات
const warehouseStore = useWarehouseStore()
const { warehouses, loading } = storeToRefs(warehouseStore)
const error = ref(null)

// جلب قائمة المستودعات عند تحميل المكوّن إن لم تكن محمّلة
onMounted(async () => {
  if (warehouses.value.length === 0) {
    try {
      await warehouseStore.fetchWarehouses({ per_page: 1000 })
    } catch (err) {
      error.value = 'فشل تحميل قائمة المستودعات.'
      console.error('Failed to fetch warehouses for dropdown:', err)
    }
  }
})
</script>
