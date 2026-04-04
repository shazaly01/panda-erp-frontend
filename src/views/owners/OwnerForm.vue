<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-5">
      <AppInput
        id="owner-name"
        label="اسم الجهة المالكة"
        v-model="form.name"
        placeholder="ادخل اسم الجهة المالكة"
        required
      />
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// إعداد نموذج فارغ
const createFreshForm = () => ({
  id: null,
  name: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات القادمة للتعديل
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>
