<!-- src/modules/inventory/views/categories/components/CategoryForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-2.5 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. اسم التصنيف -->
    <div>
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

    <!-- 2. التصنيف الأب -->
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

    <!-- 3. كود التصنيف -->
    <div>
      <AppInput
        id="cat-code"
        type="text"
        label="كود/رمز التصنيف"
        :model-value="modelValue.code"
        @update:model-value="updateField('code', $event)"
        placeholder="اتركه فارغاً للتوليد التلقائي"
      />
    </div>

    <!-- 4. وصف التصنيف -->
    <div>
      <AppTextarea
        id="cat-desc"
        label="وصف التصنيف"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="اكتب وصفاً مختصراً لنوعية أصناف هذا التصنيف..."
        rows="2"
      />
    </div>

    <!-- 5. حالة التفعيل -->
    <div
      class="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-card border border-surface-border"
    >
      <label class="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-10 h-5 bg-surface-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-2.5 text-xs font-bold text-text-primary">
          {{ modelValue.is_active ? 'التصنيف نشط (متاح للاستخدام)' : 'التصنيف موقوف' }}
        </span>
      </label>

      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
        :class="
          modelValue.is_active
            ? 'bg-success/10 text-success border-success/30'
            : 'bg-danger/10 text-danger border-danger/30'
        "
      >
        {{ modelValue.is_active ? 'مفعّل' : 'معطّل' }}
      </span>
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
