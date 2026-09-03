<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppInput
          id="cat-name"
          type="text"
          label="اسم التصنيف *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: المواد الخام، قطع الغيار، المنتجات النهائية..."
          required
        />
      </div>

      <div>
        <AppInput
          id="cat-code"
          type="text"
          label="كود/رمز التصنيف"
          :model-value="modelValue.code"
          @update:model-value="updateField('code', $event)"
          placeholder="اتركه فارغاً للتوليد التلقائي"
          class="font-mono text-left"
          dir="ltr"
        />
      </div>

      <div>
        <AppDropdown
          id="cat-parent"
          label="التصنيف الأب (الرئيسي)"
          :model-value="modelValue.parent_id"
          @update:model-value="updateField('parent_id', $event)"
          :options="flatCategories"
          option-label="dropdownName"
          option-value="id"
          placeholder="اختر التصنيف الأب (أو اتركه لتصنيف رئيسي)"
          :show-clear="true"
        />
      </div>
    </div>

    <div>
      <AppTextarea
        id="cat-desc"
        label="وصف التصنيف"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="اكتب وصفاً مختصراً لنوعية أصناف هذا التصنيف..."
        rows="3"
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
          {{ modelValue.is_active ? 'التصنيف نشط (متاح للاستخدام)' : 'التصنيف موقوف' }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  flatCategories: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
