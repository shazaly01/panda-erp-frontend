<!-- src/modules/inventory/views/warehouses/components/WarehouseForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-2.5 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. اسم المستودع -->
    <div>
      <AppInput
        id="wh-name"
        type="text"
        label="اسم المستودع *"
        :model-value="modelValue.name"
        @update:model-value="updateField('name', $event)"
        placeholder="مثال: المستودع الرئيسي، مستودع قطع الغيار..."
        required
      />
    </div>

    <!-- 2. كود/رمز المستودع -->
    <div>
      <AppInput
        id="wh-code"
        type="text"
        label="كود/رمز المستودع"
        :model-value="modelValue.code"
        @update:model-value="updateField('code', $event)"
        placeholder="مثال: WH-01 (أو اتركه فارغاً للتوليد التلقائي)"
      />
    </div>

    <!-- 3. مدير / مسؤول المستودع -->
    <div>
      <AppDropdown
        id="wh-manager"
        label="مدير / مسؤول المستودع"
        :model-value="modelValue.manager_id"
        @update:model-value="updateField('manager_id', $event)"
        :options="users"
        option-label="name"
        option-value="id"
        placeholder="اختر المسؤول (اختياري)"
        :show-clear="true"
      />
    </div>

    <!-- 4. رقم الهاتف -->
    <div>
      <AppInput
        id="wh-phone"
        type="text"
        label="رقم الهاتف"
        :model-value="modelValue.phone"
        @update:model-value="updateField('phone', $event)"
        placeholder="مثال: 0912345678"
      />
    </div>

    <!-- 5. عنوان المستودع -->
    <div>
      <AppTextarea
        id="wh-address"
        label="عنوان المستودع"
        :model-value="modelValue.address"
        @update:model-value="updateField('address', $event)"
        placeholder="اكتب العنوان بالتفصيل..."
        rows="2"
      />
    </div>

    <!-- 6. حالة التفعيل -->
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
          {{ modelValue.is_active ? 'المستودع نشط (متاح للاستخدام)' : 'المستودع موقوف' }}
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
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
