<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <AppInput
        id="company-name"
        label="اسم الشركة"
        v-model="form.name"
        placeholder="ادخل اسم الشركة"
        required
      />

      <AppInput
        id="company-owner-name"
        label="المفوض"
        v-model="form.owner_name"
        placeholder="ادخل الاسم"
      />

      <AppInput
        id="company-commercial-record"
        label="رقم السجل التجاري"
        v-model="form.commercial_record"
        placeholder="ادخل رقم السجل التجاري"
      />

      <AppInput
        id="company-license-number"
        label="رقم الرخصة"
        v-model="form.license_number"
        placeholder="ادخل رقم الرخصة (اختياري)"
      />

      <AppInput
        id="company-tax-number"
        label="الرقم الضريبي"
        v-model="form.tax_number"
        placeholder="ادخل الرقم الضريبي"
      />

      <AppInput
        id="company-phone"
        label="رقم الهاتف"
        v-model="form.phone"
        placeholder="مثال: 091xxxxxxx"
      />

      <div class="md:col-span-2">
        <AppInput
          id="company-address"
          label="العنوان"
          v-model="form.address"
          placeholder="ادخل عنوان الشركة"
        />
      </div>

      <AppInput
        id="company-bank-name"
        label="اسم البنك"
        v-model="form.bank_name"
        placeholder="ادخل اسم البنك"
      />

      <AppInput
        id="company-account-number"
        label="رقم الحساب / IBAN"
        v-model="form.account_number"
        placeholder="ادخل رقم الحساب"
      />
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// === [تم التعديل هنا] ===
const createFreshForm = () => ({
  id: null,
  name: '',
  tax_number: '',
  commercial_record: '',
  license_number: '', // تمت إضافة الحقل الجديد
  owner_name: '',
  address: '',
  phone: '',
  bank_name: '',
  account_number: '',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // === [تم التعديل هنا] ===
      // املأ النموذج بالبيانات الموجودة
      form.value = {
        id: newData.id,
        name: newData.name,
        tax_number: newData.tax_number,
        commercial_record: newData.commercial_record || '',
        license_number: newData.license_number || '', // تمت إضافة الحقل الجديد
        owner_name: newData.owner_name,
        address: newData.address,
        phone: newData.phone || '',
        bank_name: newData.bank_name || '',
        account_number: newData.account_number || '',
      }
    } else {
      // إعادة تعيين النموذج عند الإضافة
      form.value = createFreshForm()
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>
