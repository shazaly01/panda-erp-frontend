<template>
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <AppInput
        id="role-name"
        label="اسم الدور"
        v-model="form.name"
        type="text"
        required
        placeholder="مثال: مشرف محتوى"
        :disabled="isDefaultRole"
      />
      <p v-if="isDefaultRole" class="text-sm text-yellow-500 mt-1">
        لا يمكن تعديل أسماء الأدوار الافتراضية والأساسية للنظام.
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  initialData: {
    type: Object,
    default: () => null,
  },
  isSubmitting: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({ id: null, name: '' })

const dialogTitle = computed(() => (props.initialData?.id ? 'تعديل اسم الدور' : 'إضافة دور جديد'))

// 🌟 تعديل أمني متوافق مع الحماية المركزية في الـ Controller والـ Seeders
const isDefaultRole = computed(() => {
  if (!form.value || !form.value.name) return false
  return ['Super Admin', 'Admin', 'User', 'Employee', 'HR Manager'].includes(form.value.name)
})

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData ? { ...newData } : { id: null, name: '' }
  },
  { immediate: true, deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
