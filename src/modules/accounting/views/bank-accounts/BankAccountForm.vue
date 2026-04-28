<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="bank-name"
          label="اسم البنك"
          v-model="form.bank_name"
          placeholder="مثال: مصرف الوحدة / مصرف الجمهورية"
          required
        />

        <AppInput
          id="account-name"
          label="اسم الحساب (وصف)"
          v-model="form.account_name"
          placeholder="مثال: حساب الجاري - الفرع الرئيسي"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="account-number"
          label="رقم الحساب"
          v-model="form.account_number"
          placeholder="ادخل رقم الحساب الداخلي"
          required
        />

        <AppInput
          id="bank-iban"
          label="رقم الآيبان (IBAN)"
          v-model="form.iban"
          placeholder="LY..."
          dir="ltr"
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
            سيقوم النظام بإنشاء حساب مالي فرعي لهذا البنك وربطه بدليل الحسابات (تحت حساب النقدية
            بالبنوك) بشكل آلي فور الحفظ.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="bank-currency"
          label="العملة"
          v-model="form.currency_id"
          :options="currencies"
          option-label="name"
          option-value="id"
          placeholder="اختر العملة"
          required
        />

        <AppDropdown
          id="bank-branch"
          label="الفرع المرتبط (اختياري)"
          v-model="form.branch_id"
          :options="branches"
          option-label="name"
          option-value="id"
          placeholder="اختر الفرع"
        />
      </div>

      <div class="mt-3 flex items-center">
        <input
          id="is-active-bank"
          type="checkbox"
          v-model="form.is_active"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label
          for="is-active-bank"
          class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
        >
          الحساب البنكي نشط (يظهر في السندات والعمليات)
        </label>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث البيانات' : 'حفظ الحساب البنكي' }}</span>
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
  currencies: { type: Array, default: () => [] },
  branches: { type: Array, default: () => [] },
  // 🚫 تمت إزالة transactionalAccounts لأننا لم نعد نحتاجها
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  bank_name: '',
  account_name: '',
  account_number: '',
  iban: '',
  currency_id: '',
  branch_id: '',
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
        bank_name: newData.bank_name,
        account_name: newData.account_name,
        account_number: newData.account_number,
        iban: newData.iban || '',
        currency_id: newData.currency_id || newData.currency?.id || '',
        branch_id: newData.branch_id || newData.branch?.id || '',
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
