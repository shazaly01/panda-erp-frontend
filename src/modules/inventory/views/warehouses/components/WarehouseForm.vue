<!--src\modules\inventory\views\warehouses\components\WarehouseForm.vue---->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      <div>
        <AppInput
          id="wh-code"
          type="text"
          label="كود/رمز المستودع"
          :model-value="modelValue.code"
          @update:model-value="updateField('code', $event)"
          placeholder="مثال: WH-01..."
          class="font-mono text-left"
          dir="ltr"
        />
      </div>

      <div>
        <AppInput
          id="wh-phone"
          type="text"
          label="رقم الهاتف"
          :model-value="modelValue.phone"
          @update:model-value="updateField('phone', $event)"
          placeholder="مثال: 0501234567"
          dir="ltr"
        />
      </div>

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

      <div class="md:col-span-2">
        <AppTextarea
          id="wh-address"
          label="عنوان المستودع"
          :model-value="modelValue.address"
          @update:model-value="updateField('address', $event)"
          placeholder="اكتب العنوان بالتفصيل..."
          rows="3"
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
          {{ modelValue.is_active ? 'المستودع نشط (متاح للاستخدام)' : 'المستودع موقوف' }}
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
