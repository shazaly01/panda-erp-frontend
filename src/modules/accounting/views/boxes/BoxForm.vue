<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="box-name"
          label="اسم الخزينة"
          v-model="form.name"
          placeholder="مثال: الخزينة الرئيسية / عهدة المبيعات"
          required
        />

        <AppDropdown
          id="box-currency"
          label="العملة"
          v-model="form.currency_id"
          :options="currencies"
          option-label="name"
          option-value="id"
          placeholder="اختر العملة"
          required
        />
      </div>

      <div
        class="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex items-start space-x-3 space-x-reverse"
      >
        <svg
          class="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 class="text-sm font-bold text-blue-800">توليد مالي تلقائي</h4>
          <p class="text-xs text-blue-600 mt-1">
            سيقوم النظام بإنشاء حساب مالي فرعي لهذه الخزينة وربطه بدليل الحسابات (تحت حساب النقدية
            بالصناديق) بشكل آلي فور الحفظ.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="box-branch"
          label="الفرع التابعة له (اختياري)"
          v-model="form.branch_id"
          :options="branches"
          option-label="name"
          option-value="id"
          placeholder="اختر الفرع"
        />

        <div class="flex items-center mt-8">
          <input
            id="is-active-box"
            type="checkbox"
            v-model="form.is_active"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="is-active-box"
            class="mr-2 text-sm font-medium text-text-primary cursor-pointer select-none"
          >
            خزينة نشطة (تظهر في السندات)
          </label>
        </div>
      </div>

      <AppTextarea
        id="box-description"
        label="وصف الخزينة (اختياري)"
        v-model="form.description"
        placeholder="ادخل تفاصيل إضافية حول هذه الخزينة"
        rows="2"
      />
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث البيانات' : 'حفظ الخزينة' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  currencies: { type: Array, default: () => [] },
  branches: { type: Array, default: () => [] },
  // 🚫 تمت إزالة transactionalAccounts لأنه لم يعد له حاجة
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  name: '',
  currency_id: '',
  branch_id: '',
  description: '',
  is_active: true,
  // 🚫 تمت إزالة account_id
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
        currency_id: newData.currency_id || newData.currency?.id || '',
        branch_id: newData.branch_id || newData.branch?.id || '',
        description: newData.description || '',
        is_active: Boolean(newData.is_active),
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // إرسال البيانات التشغيلية الصافية للـ Backend
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
