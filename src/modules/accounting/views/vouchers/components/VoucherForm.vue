<!--src/modules/accounting/views/vouchers/components/VoucherForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- 1. ترويسة السند المدمجة (مساحات مريحة وواسعة) -->
    <div class="bg-surface-card/40 border border-surface-border p-4 rounded-xl space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- طريقة الدفع -->
        <div>
          <AppDropdown
            id="payment-method"
            label="طريقة الدفع *"
            :model-value="paymentMethodType"
            @update:model-value="handlePaymentMethodChange"
            :options="paymentMethodOptions"
            option-label="name"
            option-value="id"
            :disabled="isEditMode"
            required
          />
        </div>

        <!-- الخزينة / الحساب البنكي -->
        <div v-if="paymentMethodType === 'box'">
          <AppDropdown
            id="voucher-box"
            label="الخزينة المحددة *"
            v-model="form.box_id"
            :options="boxes"
            option-label="name"
            option-value="id"
            placeholder="اختر الخزينة..."
            required
          />
        </div>
        <div v-if="paymentMethodType === 'bank'">
          <AppDropdown
            id="voucher-bank"
            label="الحساب البنكي *"
            v-model="form.bank_account_id"
            :options="formattedBankAccounts"
            option-label="displayName"
            option-value="id"
            placeholder="اختر الحساب البنكي..."
            required
          />
        </div>

        <!-- الفرع -->
        <div>
          <AppDropdown
            id="voucher-branch"
            label="الفرع *"
            v-model="form.branch_id"
            :options="branches"
            option-label="name"
            option-value="id"
            placeholder="اختر الفرع..."
            required
          />
        </div>

        <!-- تاريخ السند -->
        <div>
          <AppInput
            id="voucher-date"
            type="date"
            label="تاريخ السند *"
            v-model="form.date"
            class="text-center font-mono"
            dir="ltr"
            required
          />
          <p v-if="fiscalYearError" class="mt-1 text-xs text-rose-500 font-medium">
            {{ fiscalYearError }}
          </p>
        </div>
      </div>

      <!-- اسم الدافع / المستفيد والبيان العام -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-4">
          <AppInput
            id="payee-name"
            type="text"
            :label="isReceipt ? 'استلمنا من السيد / الجهة *' : 'يُصرف للسيد / الجهة *'"
            v-model="form.payee_name"
            :placeholder="isReceipt ? 'اسم الدافع...' : 'اسم المستفيد...'"
            required
          />
        </div>
        <div class="md:col-span-8">
          <AppInput
            id="voucher-description"
            type="text"
            label="البيان العام للسند *"
            v-model="form.description"
            placeholder="شرح موجز لسبب الصرف أو القبض..."
            required
          />
        </div>
      </div>
    </div>

    <!-- 2. منطقة الحسابات والمبالغ -->
    <div class="bg-surface-card/30 border border-surface-border rounded-xl p-4 space-y-3">
      <div class="flex justify-between items-center px-1">
        <label class="text-xs font-bold text-text-primary flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full"
            :class="isReceipt ? 'bg-emerald-500' : 'bg-rose-500'"
          ></span>
          {{
            isReceipt
              ? 'الحسابات المقبوض منها (الطرف الدائن)'
              : 'الحسابات المصروف لها (الطرف المدين)'
          }}
        </label>
        <button
          type="button"
          @click="addNewEmptyLine"
          class="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          إضافة حساب آخر (تقسيم المبلغ)
        </button>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="(line, index) in form.details"
          :key="line._key"
          class="p-3 bg-surface-bg border border-surface-border rounded-xl transition-all hover:border-primary/40"
        >
          <!-- حالة البحث -->
          <div v-if="!line.account_id" class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-text-muted"
                >ابحث واختر الحساب للسطر ({{ index + 1 }}):</span
              >
              <button
                v-if="form.details.length > 1"
                type="button"
                @click="removeLine(index)"
                class="text-rose-500 hover:text-rose-600 text-xs flex items-center gap-1"
              >
                إلغاء السطر
              </button>
            </div>
            <AccountPartySearchGrid
              placeholder="اكتب اسم الحساب، المورد، العميل، أو الموظف..."
              @select="handleSelectAccount(index, $event)"
            />
          </div>

          <!-- حالة الحساب المختار -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <!-- تفاصيل الحساب -->
            <div
              class="lg:col-span-4 flex items-center justify-between p-2 bg-surface-card rounded-lg border border-surface-border"
            >
              <div class="flex flex-col min-w-0">
                <span class="text-[11px] font-mono font-bold text-primary">{{
                  line.account_code
                }}</span>
                <span
                  class="text-xs font-bold text-text-primary truncate"
                  :title="line.account_name"
                >
                  {{ line.account_name }}
                </span>
              </div>
              <button
                type="button"
                @click="resetLineAccount(index)"
                class="text-[11px] text-text-muted hover:text-primary hover:bg-surface-border px-2 py-1 rounded transition-colors shrink-0"
                title="تغيير الحساب"
              >
                تغيير
              </button>
            </div>

            <!-- مركز التكلفة -->
            <div class="lg:col-span-3">
              <select
                :id="`costCenter-${index}`"
                v-model="line.cost_center_id"
                @keydown.enter.prevent="focusInput(`amount-${index}`)"
                class="w-full px-2.5 py-2 text-xs bg-surface-ground border border-surface-border text-text-primary rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
              >
                <option value="">-- بدون مركز تكلفة --</option>
                <option v-for="cc in costCenters" :key="cc.id" :value="cc.id">
                  {{ cc.name }}
                </option>
              </select>
            </div>

            <!-- المبلغ -->
            <div class="lg:col-span-2">
              <AppInput
                :id="`amount-${index}`"
                type="number"
                v-model.number="line.amount"
                @keydown.enter.prevent="focusInput(`desc-${index}`)"
                min="0.01"
                step="0.01"
                placeholder="المبلغ *"
                class="font-mono text-center font-bold text-sm"
                :class="isReceipt ? 'text-emerald-500' : 'text-rose-500'"
                required
              />
            </div>

            <!-- البيان الفرعي -->
            <div class="lg:col-span-2">
              <AppInput
                :id="`desc-${index}`"
                type="text"
                v-model="line.description"
                placeholder="ملاحظة السطر..."
              />
            </div>

            <!-- زر حذف السطر -->
            <div class="lg:col-span-1 flex items-center justify-center">
              <button
                type="button"
                @click="removeLine(index)"
                class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="حذف هذا الحساب"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. الشريط السفلي المدمج -->
    <div class="flex items-center justify-between pt-2 border-t border-surface-border">
      <!-- الإجمالي التلقائي مع رمز العملة -->
      <div class="flex items-baseline gap-2">
        <span class="text-xs font-bold text-text-muted"
          >إجمالي {{ isReceipt ? 'القبض' : 'الصرف' }}:</span
        >
        <span
          class="font-mono text-xl font-black"
          :class="isReceipt ? 'text-emerald-500' : 'text-rose-500'"
        >
          {{ formatNumber(computedTotalAmount) }}
        </span>
        <span class="text-xs font-bold text-text-muted uppercase">
          {{ selectedCurrencyCode }}
        </span>
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex items-center gap-2.5">
        <AppButton type="button" variant="secondary" @click="$emit('cancel')" :disabled="isSaving">
          إلغاء
        </AppButton>
        <AppButton type="submit" :disabled="isSaving || computedTotalAmount <= 0">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'تحديث السند' : 'حفظ السند' }}</span>
        </AppButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AccountPartySearchGrid from '@/components/ui/AccountPartySearchGrid.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  type: { type: String, required: true },
  isSaving: { type: Boolean, default: false },
  branches: { type: Array, default: () => [] },
  boxes: { type: Array, default: () => [] },
  bankAccounts: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  accounts: { type: Array, default: () => [] },
  costCenters: { type: Array, default: () => [] },
  fiscalYearError: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])
const toast = useToast()

const isReceipt = computed(() => props.type === 'receipt')
const isEditMode = computed(() => !!props.initialData?.id)

const paymentMethodType = ref('box')
const paymentMethodOptions = [
  { id: 'box', name: '💵 نقدي (خزينة)' },
  { id: 'bank', name: '🏦 تحويل (بنك)' },
]

const createEmptyLine = () => ({
  _key: Date.now() + Math.random(),
  account_id: null,
  account_code: '',
  account_name: '',
  cost_center_id: props.branches.length > 0 ? props.branches[0].id : '',
  amount: '',
  description: '',
})

const form = ref({
  id: null,
  type: props.type,
  date: new Date().toISOString().split('T')[0],
  branch_id: '',
  box_id: '',
  bank_account_id: null,
  currency_id: '',
  payee_name: '',
  description: '',
  details: [createEmptyLine()],
})

const formattedBankAccounts = computed(() =>
  props.bankAccounts.map((b) => ({
    ...b,
    displayName: `${b.bank_name} - ${b.account_number}`,
  })),
)

const selectedCurrencyCode = computed(() => {
  const currency = props.currencies.find((c) => c.id === form.value.currency_id)
  return currency ? currency.code : props.currencies[0]?.code || ''
})

const computedTotalAmount = computed(() => {
  return form.value.details.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)
})

const formatNumber = (num) =>
  Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      form.value = {
        id: newVal.id || null,
        type: newVal.type || props.type,
        date: newVal.date || new Date().toISOString().split('T')[0],
        branch_id: newVal.branch?.id || newVal.branch_id || (props.branches[0]?.id ?? ''),
        box_id:
          newVal.payment_method?.type === 'box' ? newVal.payment_method.id : newVal.box_id || null,
        bank_account_id:
          newVal.payment_method?.type === 'bank'
            ? newVal.payment_method.id
            : newVal.bank_account_id || null,
        currency_id: newVal.currency?.id || newVal.currency_id || (props.currencies[0]?.id ?? ''),
        payee_name: newVal.payee_name || '',
        description: newVal.description || '',
        details:
          Array.isArray(newVal.details) && newVal.details.length > 0
            ? newVal.details.map((d, i) => ({
                _key: Date.now() + i,
                account_id: d.account?.id || d.account_id,
                account_code: d.account?.code || '',
                account_name: d.account?.name || '',
                cost_center_id: d.cost_center?.id || d.cost_center_id || '',
                amount: Number(d.amount) || '',
                description: d.description || '',
              }))
            : [createEmptyLine()],
      }
      paymentMethodType.value = form.value.bank_account_id ? 'bank' : 'box'
    } else {
      form.value.currency_id = props.currencies[0]?.id || ''
    }
  },
  { immediate: true, deep: true },
)

const handlePaymentMethodChange = (newValue) => {
  paymentMethodType.value = newValue
  if (newValue === 'box') {
    form.value.bank_account_id = null
  } else {
    form.value.box_id = null
  }
}

const handleSelectAccount = (index, item) => {
  const line = form.value.details[index]
  if (!line) return

  line.account_id = item.account_id || item.id
  line.account_code = item.code
  line.account_name = item.name
  if (!line.cost_center_id) {
    line.cost_center_id = form.value.branch_id || ''
  }

  if (!form.value.payee_name) {
    form.value.payee_name = item.name
  }

  nextTick(() => {
    focusInput(`amount-${index}`)
  })
}

const resetLineAccount = (index) => {
  const line = form.value.details[index]
  if (line) {
    line.account_id = null
    line.account_code = ''
    line.account_name = ''
  }
}

const addNewEmptyLine = () => {
  form.value.details.push(createEmptyLine())
}

const removeLine = (index) => {
  if (form.value.details.length > 1) {
    form.value.details.splice(index, 1)
  } else {
    form.value.details = [createEmptyLine()]
  }
}

const focusInput = (elementId) => {
  const el = document.getElementById(elementId)
  if (el) {
    const input = el.tagName === 'INPUT' || el.tagName === 'SELECT' ? el : el.querySelector('input')
    if (input) {
      input.focus()
      if (input.tagName === 'INPUT') input.select()
    }
  }
}

const handleSubmit = () => {
  if (props.fiscalYearError) {
    return toast.error('لا يمكن الحفظ: ' + props.fiscalYearError)
  }
  if (!form.value.date) return toast.error('تاريخ السند مطلوب.')
  if (!form.value.branch_id) return toast.error('الرجاء اختيار الفرع.')
  if (!form.value.box_id && !form.value.bank_account_id) {
    return toast.error('الرجاء اختيار الخزينة أو الحساب البنكي.')
  }
  if (!form.value.payee_name) {
    return toast.error(`الرجاء كتابة اسم ${isReceipt.value ? 'الدافع' : 'المستفيد'}.`)
  }
  if (!form.value.description) {
    return toast.error('الرجاء كتابة البيان العام للسند.')
  }

  const unassignedLine = form.value.details.some((l) => !l.account_id || Number(l.amount) <= 0)
  if (unassignedLine) {
    return toast.error('يرجى التأكد من اختيار الحساب وكتابة مبلغ صحيح لكل سطر.')
  }

  if (computedTotalAmount.value <= 0) {
    return toast.error('إجمالي السند يجب أن يكون أكبر من الصفر.')
  }

  const selectedCurrency =
    props.currencies.find((c) => c.id === form.value.currency_id) || props.currencies[0]
  const exchangeRate = selectedCurrency?.exchange_rate || 1

  const cleanDetails = form.value.details.map((line) => ({
    account_id: line.account_id,
    cost_center_id: line.cost_center_id || null,
    amount: Number(line.amount),
    description: line.description || null,
  }))

  const payload = {
    type: props.type,
    branch_id: form.value.branch_id,
    date: form.value.date,
    payee_name: form.value.payee_name,
    description: form.value.description,
    box_id: form.value.box_id || null,
    bank_account_id: form.value.bank_account_id || null,
    currency_id: form.value.currency_id || selectedCurrency?.id,
    exchange_rate: exchangeRate,
    amount: computedTotalAmount.value,
    details: cleanDetails,
  }

  emit('submit', payload)
}
</script>
