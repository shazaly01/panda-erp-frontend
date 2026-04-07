<!--src\modules\hr\views\positions\components\PositionForm.vue-->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppInput
          id="pos-name"
          type="text"
          label="المسمى الوظيفي *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: مدير موارد بشرية، مبرمج واجهات، محاسب..."
          required
        />
      </div>

      <div class="md:col-span-2">
        <AppInput
          id="pos-code"
          type="text"
          label="كود الوظيفة"
          :model-value="modelValue.code"
          @update:model-value="updateField('code', $event)"
          placeholder="اتركه فارغاً للتوليد التلقائي"
          class="font-mono text-left"
          dir="ltr"
        />
      </div>
    </div>

    <div>
      <AppTextarea
        id="pos-desc"
        label="الوصف الوظيفي (المهام والمتطلبات)"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="اكتب نبذة عن مهام ومسؤوليات هذا المسمى..."
        rows="4"
      />
    </div>

    <div class="flex items-center gap-3 pt-2">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-3 text-sm font-medium text-text-primary">
          {{ modelValue.is_active ? 'المسمى الوظيفي نشط (متاح للاختيار)' : 'المسمى الوظيفي موقوف' }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
