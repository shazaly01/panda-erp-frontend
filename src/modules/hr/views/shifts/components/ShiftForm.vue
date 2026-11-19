<!-- src/modules/hr/views/shifts/components/ShiftForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. اسم الوردية -->
    <div>
      <AppInput
        id="shift-name"
        label="اسم الوردية *"
        :model-value="modelValue.name"
        @update:model-value="updateField('name', $event)"
        placeholder="مثال: وردية صباحية"
        required
      />
    </div>

    <!-- 2. أوقات الدوام وفترة السماح -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          class="font-mono text-left"
          dir="ltr"
          help-text="الوقت المسموح به قبل احتساب التأخير."
        />
      </div>
    </div>

    <!-- 3. حالة التفعيل -->
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
          {{ modelValue.is_active ? 'الوردية مفعّلة (متاحة للتعيين)' : 'الوردية موقوفة' }}
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
        {{ modelValue.is_active ? 'مفعّلة' : 'معطّلة' }}
      </span>
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

<style scoped>
:global(.dark input[type='time']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='time']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}
</style>
