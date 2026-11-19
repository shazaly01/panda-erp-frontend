<!-- src/modules/hr/views/calendar-exceptions/components/CalendarExceptionForm.vue -->
<template>
  <form
    @submit.prevent="handleSubmit"
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- 1. الاسم والنوع -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <AppInput
          id="exception-name"
          label="اسم الحالة *"
          v-model="form.name"
          placeholder="مثال: عيد الفطر / أمطار غزيرة"
          required
        />
      </div>

      <div>
        <AppDropdown
          id="exception-type"
          label="نوع الحالة *"
          v-model="form.type"
          :options="typeOptions"
          option-label="name"
          option-value="id"
          required
        />
      </div>
    </div>

    <!-- 2. التواريخ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <AppInput
          id="start-date"
          type="date"
          label="تاريخ البداية *"
          v-model="form.start_date"
          required
        />
      </div>

      <div>
        <AppInput
          id="end-date"
          type="date"
          label="تاريخ النهاية (اختياري)"
          v-model="form.end_date"
          :min="form.start_date"
        />
      </div>
    </div>

    <p class="text-[11px] text-text-secondary pr-1">
      • اترك "تاريخ النهاية" فارغاً إذا كانت الحالة مستمرة إلى أجل غير مسمى (مثل حالات الطوارئ).
    </p>

    <!-- 3. إعدادات العمل الإضافي -->
    <div class="p-3.5 rounded-xl bg-surface-card border border-surface-border shadow-2xs space-y-2">
      <div class="flex items-center justify-between gap-2">
        <label
          for="treat-overtime"
          class="relative inline-flex items-center cursor-pointer select-none"
        >
          <input
            id="treat-overtime"
            type="checkbox"
            v-model="form.treat_as_overtime_if_worked"
            class="sr-only peer"
          />
          <div
            class="w-10 h-5 bg-surface-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
          ></div>
          <span class="ms-2.5 text-xs font-black text-text-primary">
            احتساب الحضور كعمل إضافي (Overtime)
          </span>
        </label>

        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
          :class="
            form.treat_as_overtime_if_worked
              ? 'bg-info/10 text-info border-info/30'
              : 'bg-surface-ground text-text-muted border-surface-border'
          "
        >
          {{ form.treat_as_overtime_if_worked ? 'يُحسب إضافي' : 'يوم تعويضي' }}
        </span>
      </div>

      <p class="text-[11px] text-text-secondary leading-relaxed pr-1">
        عند تفعيل هذا الخيار، يُسجَّل حضور أي موظف في هذه الفترة كـ "عمل إضافي" بالكامل في محرك
        الرواتب، وإلا يُعتبر حضوراً طبيعياً مع تعويض بيوم آخر.
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const typeOptions = [
  { id: 'holiday', name: 'عطلة رسمية (أعياد، مناسبات)' },
  { id: 'emergency', name: 'طوارئ عامة (أحداث سياسية، مناخ)' },
  { id: 'other', name: 'أخرى' },
]

const createFreshForm = () => ({
  id: null,
  name: '',
  type: 'holiday',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  treat_as_overtime_if_worked: true,
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
        type: newData.type,
        start_date: newData.start_date,
        end_date: newData.end_date || '',
        treat_as_overtime_if_worked: Boolean(newData.treat_as_overtime_if_worked),
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

defineExpose({
  submit: handleSubmit,
})
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}
</style>
