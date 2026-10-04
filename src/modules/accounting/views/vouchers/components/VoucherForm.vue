<!--src/modules/accounting/views/vouchers/components/VoucherForm.vue-->
<template>
  <form @submit.prevent="handleSubmit(false)" class="space-y-4">
    <!-- 1. ترويسة السند المدمجة والمتوازنة -->
    <div class="bg-surface-card/40 border border-surface-border p-4 rounded-xl space-y-4">
      <!-- السطر الأول: طريقة الدفع + الخزينة/البنك + رقم الشيك/العملية + تاريخ السند -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <!-- طريقة الدفع -->
        <div
          :class="paymentMethodType === 'bank' ? 'md:col-span-3' : 'md:col-span-4'"
          class="flex flex-col"
        >
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            طريقة الدفع *
          </label>
          <div
            class="grid grid-cols-2 gap-1.5 p-1 bg-gray-50 dark:bg-surface-ground border-2 border-gray-300 dark:border-blue-500/40 rounded-xl shadow-sm h-[46px] items-center box-border"
          >
            <button
              type="button"
              :disabled="isEditMode"
              @click="handlePaymentMethodChange('box')"
              :class="[
                'flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-bold transition-all duration-200 select-none',
                paymentMethodType === 'box'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-gray-600 dark:text-text-muted hover:text-gray-900 dark:hover:text-text-primary hover:bg-white dark:hover:bg-surface-card/60',
                isEditMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
              ]"
            >
              <span class="text-sm">💵</span>
              <span>نقدي (خزينة)</span>
            </button>
            <button
              type="button"
              :disabled="isEditMode"
              @click="handlePaymentMethodChange('bank')"
              :class="[
                'flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-bold transition-all duration-200 select-none',
                paymentMethodType === 'bank'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-gray-600 dark:text-text-muted hover:text-gray-900 dark:hover:text-text-primary hover:bg-white dark:hover:bg-surface-card/60',
                isEditMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
              ]"
            >
              <span class="text-sm">🏦</span>
              <span>تحويل (بنك)</span>
            </button>
          </div>
        </div>

        <!-- الخزينة المحددة (تظهر عند اختيار نقدي) -->
        <div v-if="paymentMethodType === 'box'" class="md:col-span-4">
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

        <!-- الحساب البنكي المحدد (يظهر عند اختيار بنك) -->
        <div v-if="paymentMethodType === 'bank'" class="md:col-span-3">
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

        <!-- رقم الشيك / العملية (يظهر فقط عند الدفع البنكي واختياري) -->
        <div v-if="paymentMethodType === 'bank'" class="md:col-span-3">
          <AppInput
            id="bank-ref-number"
            type="text"
            label="رقم الشيك / العملية"
            v-model="form.bank_ref_number"
            placeholder="رقم الشيك أو الحوالة..."
          />
        </div>

        <!-- تاريخ السند -->
        <div :class="paymentMethodType === 'bank' ? 'md:col-span-3' : 'md:col-span-4'">
          <AppInput
            id="voucher-date"
            type="date"
            label="تاريخ السند *"
            v-model="form.date"
            dir="ltr"
            required
          />
          <p v-if="fiscalYearError" class="mt-1 text-xs text-rose-500 font-medium">
            {{ fiscalYearError }}
          </p>
        </div>
      </div>

      <!-- السطر الثاني: الفرع والمستفيد والبيان العام -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <!-- الفرع -->
        <div class="md:col-span-3">
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

        <!-- اسم الدافع / المستفيد -->
        <div class="md:col-span-4">
          <AppInput
            id="payee-name"
            type="text"
            :label="isReceipt ? 'استلمنا من السيد / الجهة *' : 'يُصرف للسيد / الجهة *'"
            v-model="form.payee_name"
            @blur="handlePayeeBlur"
            :placeholder="isReceipt ? 'اسم الدافع...' : 'اسم المستفيد...'"
            required
          />
        </div>

        <!-- البيان العام للسند -->
        <div class="md:col-span-5">
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
          <!-- حالة البحث الفوري عن الحساب -->
          <div v-if="!line.account_id" class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                ابحث واختر الحساب للسطر ({{ index + 1 }}):
              </span>
              <button
                v-if="form.details.length > 1"
                type="button"
                @click="removeLine(index)"
                class="text-rose-500 hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                إلغاء السطر
              </button>
            </div>
            <AccountPartySearchGrid
              :placeholder="
                isReceipt
                  ? 'ابحث عن حساب، عميل، أو مصدر الإيراد...'
                  : 'ابحث عن حساب مصروف، مورد، موظف، أو جهة صرف...'
              "
              @select="handleSelectAccount(index, $event)"
            />
          </div>

          <!-- حالة الحساب المختار وتحديد المبلغ -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <!-- تفاصيل الحساب والوسم المرجعي -->
            <div
              class="lg:col-span-4 flex items-center justify-between p-2.5 bg-surface-card rounded-lg border border-surface-border gap-2"
            >
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-mono font-bold text-primary">{{
                    line.account_code
                  }}</span>
                  <span
                    v-if="line.reference_label"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 truncate"
                  >
                    {{ line.reference_label }}
                  </span>
                </div>
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
                class="w-full px-2.5 py-2.5 text-xs bg-surface-ground border border-surface-border text-text-primary rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
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
                class="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="حذف هذا السطر"
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
    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-surface-border"
    >
      <!-- الإجمالي التلقائي مع شارة مميزة -->
      <div class="flex items-center gap-3">
        <div
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl border"
          :class="
            isReceipt
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/20'
          "
        >
          <span class="text-xs font-bold text-text-muted">
            إجمالي {{ isReceipt ? 'القبض' : 'الصرف' }}:
          </span>
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
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <AppButton type="button" variant="secondary" @click="$emit('cancel')" :disabled="isSaving">
          إلغاء
        </AppButton>
        <AppButton
          type="button"
          @click="handleSubmit(true)"
          :disabled="isSaving || computedTotalAmount <= 0"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'تحديث وترحيل مباشر' : 'حفظ وترحيل مباشر' }}</span>
        </AppButton>
        <AppButton
          type="button"
          @click="handleSubmit(false)"
          :disabled="isSaving || computedTotalAmount <= 0"
        >
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'تحديث السند' : 'حفظ كمسودة' }}</span>
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
  costCenters: { type: Array, default: () => [] },
  fiscalYearError: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])
const toast = useToast()

const isReceipt = computed(() => props.type === 'receipt')
const isEditMode = computed(() => !!props.initialData?.id)

const paymentMethodType = ref('box')

const createEmptyLine = () => ({
  _key: Date.now() + Math.random(),
  account_id: null,
  account_code: '',
  account_name: '',
  cost_center_id: props.branches.length > 0 ? props.branches[0].id : '',
  amount: '',
  description: '',
  party_type: null,
  party_id: null,
  reference_type: null,
  reference_id: null,
  reference_label: null,
})

const form = ref({
  id: null,
  type: props.type,
  date: new Date().toISOString().split('T')[0],
  branch_id: '',
  box_id: '',
  bank_account_id: null,
  bank_ref_number: '',
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
      const isBank =
        newVal.payment_method?.type === 'bank' ||
        Boolean(newVal.bank_account_id) ||
        Boolean(newVal.bank_account)

      paymentMethodType.value = isBank ? 'bank' : 'box'

      const resolvedBoxId = !isBank
        ? newVal.payment_method?.type === 'box'
          ? newVal.payment_method.id
          : newVal.box_id || (props.boxes[0]?.id ?? null)
        : null

      const resolvedBankId = isBank
        ? newVal.payment_method?.type === 'bank'
          ? newVal.payment_method.id
          : newVal.bank_account_id || (props.bankAccounts[0]?.id ?? null)
        : null

      form.value = {
        id: newVal.id || null,
        type: newVal.type || props.type,
        date: newVal.date || new Date().toISOString().split('T')[0],
        branch_id: newVal.branch?.id || newVal.branch_id || (props.branches[0]?.id ?? ''),
        box_id: resolvedBoxId,
        bank_account_id: resolvedBankId,
        bank_ref_number: newVal.bank_ref_number || newVal.payment_method?.bank_ref_number || '',
        currency_id: newVal.currency?.id || newVal.currency_id || (props.currencies[0]?.id ?? ''),
        payee_name: newVal.payee_name || '',
        description: newVal.description || '',
        details:
          Array.isArray(newVal.details) && newVal.details.length > 0
            ? newVal.details.map((d, i) => ({
                _key: Date.now() + i,
                account_id: d.account?.id || d.account_id,
                account_code: d.account?.code || d.account_code || '',
                account_name: d.account?.name || d.account_name || '',
                cost_center_id:
                  d.cost_center?.id || d.cost_center_id || (props.branches[0]?.id ?? ''),
                amount: Number(d.amount) || '',
                description: d.description || '',
                party_type: d.party_type || null,
                party_id: d.party_id ? String(d.party_id) : null,
                reference_type: d.reference_type || null,
                reference_id: d.reference_id ? Number(d.reference_id) : null,
                reference_label: d.reference_label || null,
              }))
            : [createEmptyLine()],
      }
    } else {
      paymentMethodType.value = 'box'
      form.value.currency_id = props.currencies[0]?.id || ''
      form.value.bank_account_id = null
      form.value.bank_ref_number = ''
      if (props.boxes.length > 0) {
        form.value.box_id = props.boxes[0].id
      }
    }
  },
  { immediate: true, deep: true },
)

const handlePaymentMethodChange = (newValue) => {
  if (isEditMode.value) return
  paymentMethodType.value = newValue
  if (newValue === 'box') {
    form.value.bank_account_id = null
    form.value.bank_ref_number = ''
    if (!form.value.box_id && props.boxes.length > 0) {
      form.value.box_id = props.boxes[0].id
    }
  } else {
    form.value.box_id = null
    if (!form.value.bank_account_id && props.bankAccounts.length > 0) {
      form.value.bank_account_id = props.bankAccounts[0].id
    }
  }
}

const handlePayeeBlur = () => {
  if (form.value.payee_name && !form.value.description) {
    const actionWord = isReceipt.value ? 'استلام من' : 'صرف لـ'
    form.value.description = `${actionWord} ${form.value.payee_name}`
  }
}

const handleSelectAccount = (index, item) => {
  const line = form.value.details[index]
  if (!line) return

  line.account_id = item.account_id || item.id
  line.account_code = item.code
  line.account_name = item.name
  line.party_type = item.party_type || item.type || null
  line.party_id = item.party_id || item.id ? String(item.party_id || item.id) : null

  if (!line.cost_center_id) {
    line.cost_center_id = form.value.branch_id || ''
  }

  if (!form.value.payee_name) {
    form.value.payee_name = item.name
  }

  if (!form.value.description) {
    const actionWord = isReceipt.value ? 'استلام من' : 'صرف لـ'
    form.value.description = `${actionWord} ${item.name}`
  }

  if (!line.description) {
    line.description = form.value.description || item.name
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
    line.party_type = null
    line.party_id = null
    line.reference_type = null
    line.reference_id = null
    line.reference_label = null
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
      if (typeof input.select === 'function') {
        input.select()
      }
    }
  }
}

const handleSubmit = (postAfterSave = false) => {
  if (props.fiscalYearError) {
    return toast.error('لا يمكن الحفظ: ' + props.fiscalYearError)
  }
  if (!form.value.date) return toast.error('تاريخ السند مطلوب.')
  if (!form.value.branch_id) return toast.error('الرجاء اختيار الفرع.')

  const isBank = paymentMethodType.value === 'bank'
  if (!isBank && !form.value.box_id) {
    return toast.error('الرجاء اختيار الخزينة.')
  }
  if (isBank && !form.value.bank_account_id) {
    return toast.error('الرجاء اختيار الحساب البنكي.')
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
    party_type: line.party_type || null,
    party_id: line.party_id ? String(line.party_id) : null,
    reference_type: line.reference_type || null,
    reference_id: line.reference_id ? Number(line.reference_id) : null,
  }))

  const payload = {
    type: props.type,
    branch_id: form.value.branch_id,
    date: form.value.date,
    payee_name: form.value.payee_name,
    description: form.value.description,
    box_id: isBank ? null : form.value.box_id || null,
    bank_account_id: isBank ? form.value.bank_account_id || null : null,
    bank_ref_number: isBank ? form.value.bank_ref_number || null : null,
    currency_id: form.value.currency_id || selectedCurrency?.id,
    exchange_rate: exchangeRate,
    amount: computedTotalAmount.value,
    details: cleanDetails,
    post_after_save: postAfterSave,
  }

  emit('submit', payload)
}
</script>

<style scoped>
:deep(#voucher-date) {
  height: 46px !important;
  box-sizing: border-box !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.p-dropdown) {
  height: 46px !important;
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
}
</style>
