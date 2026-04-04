<template>
  <div class="bg-surface-section p-5 rounded-xl border border-surface-border mb-6 space-y-6">
    <!-- <div class="flex items-center gap-4 pb-4 border-b border-surface-border">
      <button
        @click="$emit('back')"
        class="p-2 text-text-muted hover:text-text-primary hover:bg-surface-border rounded-lg transition-colors"
        title="رجوع للقائمة"
      >
        <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-text-primary">
          {{
            isEditMode
              ? `تعديل ${type === 'receipt' ? 'سند قبض' : 'سند صرف'} #${modelValue.number || ''}`
              : `${type === 'receipt' ? 'سند قبض' : 'سند صرف'} جديد`
          }}
        </h1>
      </div>
    </div> -->

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <AppDropdown
          id="payment-method"
          label="طريقة الدفع *"
          :model-value="localPaymentMethod"
          @update:model-value="handlePaymentMethodChange"
          :options="paymentMethodOptions"
          option-label="name"
          option-value="id"
          :disabled="isEditMode"
          required
        />
      </div>

      <div v-if="localPaymentMethod === 'box'">
        <AppDropdown
          id="voucher-box"
          label="الخزينة المحددة *"
          :model-value="modelValue.box_id"
          @update:model-value="updateField('box_id', $event)"
          :options="boxes"
          option-label="name"
          option-value="id"
          placeholder="اختر الخزينة..."
          required
        />
      </div>
      <div v-if="localPaymentMethod === 'bank'">
        <AppDropdown
          id="voucher-bank"
          label="الحساب البنكي *"
          :model-value="modelValue.bank_account_id"
          @update:model-value="updateField('bank_account_id', $event)"
          :options="formattedBankAccounts"
          option-label="displayName"
          option-value="id"
          placeholder="اختر الحساب البنكي..."
          required
        />
      </div>

      <div>
        <AppDropdown
          id="voucher-branch"
          label="الفرع *"
          :model-value="modelValue.branch_id"
          @update:model-value="updateField('branch_id', $event)"
          :options="branches"
          option-label="name"
          option-value="id"
          placeholder="اختر الفرع..."
          required
        />
      </div>

      <div>
        <AppDropdown
          id="voucher-currency"
          label="العملة *"
          :model-value="modelValue.currency_id"
          @update:model-value="updateField('currency_id', $event)"
          :options="formattedCurrencies"
          option-label="displayName"
          option-value="id"
          placeholder="اختر العملة..."
          required
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div>
        <AppInput
          id="voucher-date"
          type="date"
          label="تاريخ السند *"
          :model-value="modelValue.date"
          @update:model-value="updateField('date', $event)"
          class="text-center font-mono"
          dir="ltr"
          required
        />
        <p v-if="fiscalYearError" class="mt-1 text-xs text-rose-500 font-medium">
          {{ fiscalYearError }}
        </p>
      </div>

      <div>
        <AppInput
          id="voucher-amount"
          type="number"
          :label="`إجمالي السند ${selectedCurrencyCode ? '(' + selectedCurrencyCode + ')' : ''} *`"
          :model-value="modelValue.amount"
          @update:model-value="updateField('amount', $event)"
          placeholder="0.00"
          class="font-mono text-left font-bold text-lg text-emerald-500"
          dir="ltr"
          required
        />
      </div>

      <div class="md:col-span-2">
        <AppInput
          id="payee-name"
          type="text"
          :label="type === 'receipt' ? 'استلمنا من السيد / الجهة *' : 'يُصرف للسيد / الجهة *'"
          :model-value="modelValue.payee_name"
          @update:model-value="updateField('payee_name', $event)"
          :placeholder="type === 'receipt' ? 'اسم الدافع...' : 'اسم المستفيد...'"
          required
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div>
        <AppTextarea
          id="voucher-description"
          label="البيان (وصف السند) *"
          :model-value="modelValue.description"
          @update:model-value="updateField('description', $event)"
          placeholder="شرح مفصل لسبب الدفع أو القبض..."
          rows="2"
          required
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// استيراد المكونات الجاهزة التي تستخدمها في نظامك
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  branches: { type: Array, required: true },
  boxes: { type: Array, required: true },
  bankAccounts: { type: Array, required: true },
  currencies: { type: Array, required: true },
  fiscalYearError: { type: String, default: '' },
  isEditMode: { type: Boolean, default: false },
  type: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const localPaymentMethod = ref('box')

// خيارات طريقة الدفع للقائمة المنسدلة
const paymentMethodOptions = [
  { id: 'box', name: '💵 نقدي (خزينة)' },
  { id: 'bank', name: '🏦 تحويل (بنك)' },
]

// تنسيق العملات لعرض الرمز والاسم
const formattedCurrencies = computed(() => {
  return props.currencies.map((c) => ({
    ...c,
    displayName: `${c.code} - ${c.name}`,
  }))
})

// تنسيق الحسابات البنكية لعرض اسم البنك ورقم الحساب
const formattedBankAccounts = computed(() => {
  return props.bankAccounts.map((b) => ({
    ...b,
    displayName: `${b.bank_name} - ${b.account_number}`,
  }))
})

// استخراج رمز العملة لعرضه بجانب حقل المبلغ
const selectedCurrencyCode = computed(() => {
  const currency = props.currencies.find((c) => c.id === props.modelValue.currency_id)
  return currency ? currency.code : ''
})

// تحديث طريقة الدفع عند تعديل سند موجود
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal.bank_account_id) {
      localPaymentMethod.value = 'bank'
    } else if (newVal.box_id) {
      localPaymentMethod.value = 'box'
    }
  },
  { immediate: true },
)

// معالجة تغيير طريقة الدفع
const handlePaymentMethodChange = (newValue) => {
  localPaymentMethod.value = newValue
  if (newValue === 'box') {
    emit('update:modelValue', { ...props.modelValue, bank_account_id: null })
  } else {
    emit('update:modelValue', { ...props.modelValue, box_id: null })
  }
}

// تحديث الحقول العامة
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
