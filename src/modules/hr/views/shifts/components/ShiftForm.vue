<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
      <div class="md:col-span-1">
        <AppInput
          id="shift-name"
          label="اسم الوردية *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: وردية صباحية"
          required
        />
      </div>
      <div class="md:col-span-1 flex items-center pb-2">
        <label class="flex items-center cursor-pointer gap-2">
          <input
            type="checkbox"
            :checked="modelValue.is_active"
            @change="updateField('is_active', $event.target.checked)"
            class="w-5 h-5 text-primary border-surface-border rounded focus:ring-primary"
          />
          <span class="text-sm font-medium text-text-primary">الوردية مفعلة (متاحة للتعيين)</span>
        </label>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div>
        <AppInput
          id="shift-start"
          type="time"
          label="وقت بداية الدوام *"
          :model-value="modelValue.start_time"
          @update:model-value="updateField('start_time', $event)"
          required
        />
      </div>

      <div>
        <AppInput
          id="shift-end"
          type="time"
          label="وقت نهاية الدوام *"
          :model-value="modelValue.end_time"
          @update:model-value="updateField('end_time', $event)"
          required
        />
      </div>

      <div>
        <AppInput
          id="shift-grace"
          type="number"
          label="فترة السماح (بالدقائق)"
          :model-value="modelValue.grace_period_minutes"
          @update:model-value="updateField('grace_period_minutes', Number($event))"
          min="0"
          max="120"
          help-text="الوقت المسموح به قبل احتساب التأخير."
        />
      </div>
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
