<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <AppInput
        id="fiscal-year-name"
        label="اسم السنة المالية"
        v-model="form.name"
        placeholder="مثال: السنة المالية 2026"
        required
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="start-date"
          label="تاريخ البداية"
          v-model="form.start_date"
          type="date"
          required
        />

        <AppInput
          id="end-date"
          label="تاريخ النهاية"
          v-model="form.end_date"
          type="date"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="fiscal-year-status"
          label="حالة السنة"
          v-model="form.status"
          :options="statusOptions"
          placeholder="اختر الحالة"
          required
        />
      </div>

      <div
        v-if="form.status === 'closed'"
        class="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p class="text-xs font-bold leading-relaxed">
          تنبيه: إغلاق السنة سيمنع بشكل نهائي إضافة أو تعديل أي قيود أو عمليات محاسبية ضمن هذا
          النطاق الزمني.
        </p>
      </div>

      <div
        v-else-if="form.status === 'open'"
        class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-700"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-xs font-bold leading-relaxed">
          السنة المالية مفتوحة: النظام سيقبل إدخال القيود والعمليات المحاسبية ضمن هذه التواريخ.
        </p>
      </div>

      <div
        v-else
        class="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-blue-700"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-xs font-bold leading-relaxed">
          السنة في مرحلة التخطيط: لن تقبل أي عمليات محاسبية حتى يتم تغيير حالتها إلى "مفتوحة".
        </p>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ السنة المالية</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const statusOptions = [
  { id: 'open', name: 'مفتوحة (Open)' },
  { id: 'closed', name: 'مغلقة (Closed)' },
  { id: 'planned', name: 'مستقبلية (Planned)' },
]

const createFreshForm = () => ({
  id: null,
  name: '',
  start_date: new Date().getFullYear() + '-01-01',
  end_date: new Date().getFullYear() + '-12-31',
  status: 'planned',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // الباك-إند يرسل التاريخ بصيغة Y-m-d جاهزة، ولكن نضع split كإجراء وقائي
      form.value = {
        id: newData.id,
        name: newData.name,
        start_date: newData.start_date ? newData.start_date.split('T')[0] : '',
        end_date: newData.end_date ? newData.end_date.split('T')[0] : '',
        status: newData.status?.value || newData.status || 'planned',
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
