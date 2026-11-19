<!-- src/modules/hr/views/positions/components/PositionForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-2.5 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. المسمى الوظيفي -->
    <div>
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

    <!-- 2. كود الوظيفة -->
    <div>
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

    <!-- 3. الوصف الوظيفي -->
    <div>
      <AppTextarea
        id="pos-desc"
        label="الوصف الوظيفي (المهام والمتطلبات)"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="اكتب نبذة عن مهام ومسؤوليات هذا المسمى..."
        rows="3"
      />
    </div>

    <!-- 4. حالة التفعيل -->
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
          {{ modelValue.is_active ? 'المسمى الوظيفي نشط (متاح للاختيار)' : 'المسمى الوظيفي موقوف' }}
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
