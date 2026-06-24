<!--src\modules\hr\views\internships\components\InternshipApplicationForm.vue--->
<template>
  <div class="space-y-5 animate-fadeIn">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppInput
          id="intern-full-name"
          type="text"
          label="الاسم رباعي (باللغة العربية) *"
          :model-value="modelValue.full_name"
          @update:model-value="updateField('full_name', $event)"
          placeholder="أدخل الاسم الرباعي للمتقدم للتدريب..."
          required
          class="!rounded-xl text-xs font-semibold text-slate-900 focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-phone"
          type="text"
          label="رقم الهاتف الجوال *"
          :model-value="modelValue.phone"
          @update:model-value="updateField('phone', $event)"
          placeholder="مثال: 05xxxxxxxx"
          required
          class="!rounded-xl text-xs font-mono font-bold text-slate-900 text-right focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-email"
          type="email"
          label="البريد الإلكتروني"
          :model-value="modelValue.email"
          @update:model-value="updateField('email', $event)"
          placeholder="name@example.com"
          class="!rounded-xl text-xs font-mono font-semibold text-slate-900 text-left focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-national-id"
          type="text"
          label="رقم الهوية الوطنية / الإقامة"
          :model-value="modelValue.national_id"
          @update:model-value="updateField('national_id', $event)"
          placeholder="أدخل رقم الوثيقة الشخصية للمتقدم..."
          class="!rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-required-hours"
          type="number"
          min="1"
          label="عدد الساعات المطلوبة من الجامعة"
          :model-value="modelValue.required_training_hours"
          @update:model-value="
            updateField('required_training_hours', $event ? Number($event) : null)
          "
          placeholder="مثال: 120"
          class="!rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-institution"
          type="text"
          label="الجامعة / الكلية أو المعهد *"
          :model-value="modelValue.academic_institution"
          @update:model-value="updateField('academic_institution', $event)"
          placeholder="مثال: جامعة الملك سعود..."
          required
          class="!rounded-xl text-xs font-bold text-slate-800 focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-major"
          type="text"
          label="التخصص الدراسي الدقيق *"
          :model-value="modelValue.academic_major"
          @update:model-value="updateField('academic_major', $event)"
          placeholder="مثال: هندسة برمجيات، علوم حاسب..."
          required
          class="!rounded-xl text-xs font-bold text-slate-800 focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-start-date"
          type="date"
          label="تاريخ بدء التدريب المقترح *"
          :model-value="modelValue.internship_start_date"
          @update:model-value="updateField('internship_start_date', $event)"
          required
          class="!rounded-xl text-xs font-semibold text-slate-900 text-right focus:ring-indigo-600/5 shadow-sm"
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="intern-end-date"
          type="date"
          label="تاريخ انتهاء التدريب المقترح *"
          :model-value="modelValue.internship_end_date"
          @update:model-value="updateField('internship_end_date', $event)"
          required
          class="!rounded-xl text-xs font-semibold text-slate-900 text-right focus:ring-indigo-600/5 shadow-sm"
        />
      </div>
    </div>

    <div>
      <AppTextarea
        id="intern-notes"
        label="ملاحظات أو شروط تدريبية خاصة من الجهة التعليمية"
        :model-value="modelValue.notes"
        @update:model-value="updateField('notes', $event)"
        placeholder="اكتب أي ملاحظات أو متطلبات إضافية متعلقة بطلب التدريب..."
        rows="4"
        class="!rounded-xl text-xs font-medium text-slate-800 focus:ring-indigo-600/5 shadow-sm resize-none"
      />
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

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
