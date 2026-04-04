<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="owners"
      :loading="loading"
      :required="required"
      placeholder="اختر الجهة المالكة"
    />

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// نستورد متجر الملاك الجديد
import { useOwnerStore } from '@/stores/ownerStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الجهة المالكة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

// إعداد Store لجلب البيانات
const ownerStore = useOwnerStore()
const { owners, loading } = storeToRefs(ownerStore)
const error = ref(null)

// جلب القائمة عند التحميل
onMounted(async () => {
  // نجلب البيانات فقط إذا كانت القائمة فارغة لتوفير الطلبات
  if (owners.value.length === 0) {
    try {
      // نستدعي دالة الجلب الموجودة في الـ Store الذي أنشأناه
      await ownerStore.fetchOwners()
    } catch (err) {
      error.value = 'فشل تحميل قائمة الجهات المالكة.'
      console.error('Failed to fetch owners for dropdown:', err)
    }
  }
})
</script>
