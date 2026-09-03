<!---src\modules\inventory\views\units\components\UnitForm.vue--->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <AppInput
          id="unit-name"
          type="text"
          label="اسم وحدة القياس *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: كيلو جرام، متر، حبة، كرتونة..."
          required
        />
      </div>

      <div>
        <AppInput
          id="unit-symbol"
          type="text"
          label="الرمز / الاختصار *"
          :model-value="modelValue.symbol"
          @update:model-value="updateField('symbol', $event)"
          placeholder="مثال: كجم، م، قطعة، كرتون..."
          required
        />
      </div>
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
          {{ modelValue.is_active ? 'وحدة القياس نشطة (متاحة للاستخدام)' : 'وحدة القياس موقوفة' }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'

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
