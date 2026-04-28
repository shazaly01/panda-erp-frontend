<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="p-4 rounded-xl border border-surface-border bg-surface-section/30 space-y-4">
        <div>
          <h4 class="text-sm font-bold text-primary">المستند المستهدف</h4>
          <p class="text-xs text-text-muted mt-1 font-mono break-all">{{ form.model }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="sequence-format"
          label="صيغة الترقيم (Format)"
          v-model="form.format"
          placeholder="مثال: INV-{Y}-{0000}"
          dir="ltr"
          required
        />

        <AppDropdown
          id="sequence-reset"
          label="تيرة تصفير العداد"
          v-model="form.reset_frequency"
          :options="resetOptions"
          option-label="name"
          option-value="id"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="sequence-next-value"
          label="الرقم القادم (Next Value)"
          v-model="form.next_value"
          type="number"
          min="1"
          placeholder="أدخل الرقم القادم"
          required
        />
      </div>

      <p class="text-[10px] text-orange-500 mt-1">
        * يجب أن تحتوي الصيغة على عداد أصفار بين أقواس معقوفة مثل {0000} ليعمل الترقيم بشكل صحيح.
      </p>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ إعدادات الترقيم</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const resetOptions = ref([
  { id: 'yearly', name: 'سنوياً' },
  { id: 'monthly', name: 'شهرياً' },
  { id: 'never', name: 'مستمر (لا يصفر)' },
])

const form = ref({
  id: null,
  model: '',
  format: '',
  reset_frequency: 'yearly',
  next_value: 1,
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        model: newData.model,
        format: newData.format,
        reset_frequency: newData.reset_frequency || 'yearly',
        next_value: newData.next_value || 1,
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
