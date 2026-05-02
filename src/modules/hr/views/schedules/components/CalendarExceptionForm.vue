<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <!-- الاسم والنوع -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="exception-name"
          label="اسم الحالة *"
          v-model="form.name"
          placeholder="مثال: عيد الفطر / أمطار غزيرة"
          required
        />

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

      <!-- التواريخ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="start-date"
          type="date"
          label="تاريخ البداية *"
          v-model="form.start_date"
          required
        />

        <AppInput
          id="end-date"
          type="date"
          label="تاريخ النهاية (اختياري)"
          v-model="form.end_date"
        />
      </div>

      <div class="text-xs text-text-muted px-1 -mt-2 mb-4">
        * اترك "تاريخ النهاية" فارغاً إذا كانت الحالة مستمرة إلى أجل غير مسمى (مثل طوارئ الحرب).
      </div>

      <!-- إعدادات الأوفرتايم (العمل الإضافي) -->
      <div
        class="flex items-center mt-6 p-4 rounded-xl border border-surface-border bg-surface-muted/30"
      >
        <input
          id="treat-overtime"
          type="checkbox"
          v-model="form.treat_as_overtime_if_worked"
          class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
        />
        <div class="ml-3 rtl:mr-3 rtl:ml-0">
          <label
            for="treat-overtime"
            class="text-sm font-bold text-text-primary cursor-pointer select-none"
          >
            احتساب الحضور كعمل إضافي (Overtime)
          </label>
          <p class="text-xs text-text-muted mt-1">
            إذا قمت بتفعيل هذا الخيار، سيتم تسجيل حضور أي موظف في هذه الفترة كـ "عمل إضافي" بالكامل
            في محرك الرواتب، وإلا سيعتبر حضوراً طبيعياً مع تعويض بيوم آخر.
          </p>
        </div>
      </div>
    </div>

    <!-- أزرار الحفظ -->
    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث البيانات' : 'اعتماد الحالة' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

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
  treat_as_overtime_if_worked: true, // افتراضياً في العطلات يعتبر إضافي
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

const handleCancel = () => {
  emit('cancel')
}
</script>
