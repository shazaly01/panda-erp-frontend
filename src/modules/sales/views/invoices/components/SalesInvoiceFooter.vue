<!-- src/modules/sales/views/invoices/components/SalesInvoiceFooter.vue -->
<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 text-right font-sans transition-colors duration-200 items-stretch"
    dir="rtl"
  >
    <!-- 1. العمود الأيمن: التسويات المالية + ملاحظات الفاتورة (مكدّسة رأسياً لتوازن الارتفاع) -->
    <div class="lg:col-span-3 flex flex-col gap-3 justify-between">
      <!-- 1.أ التسويات المالية (الخصم والرسوم) - قابلة للطي -->
      <div
        class="p-3.5 bg-surface-section rounded-xl border border-surface-border shadow-xs transition-all duration-200"
      >
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-1.5 cursor-pointer select-none"
          @click="isAdjustmentsOpen = !isAdjustmentsOpen"
        >
          <div class="flex items-center gap-1.5">
            <h3 class="text-[11px] font-black text-text-primary">إضافات وتسويات مالية</h3>
            <span
              v-if="hasAdjustments"
              class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25"
            >
              مطبقة
            </span>
          </div>

          <div class="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
            <span class="text-[10px] font-bold">{{ isAdjustmentsOpen ? 'طي' : 'توسيع' }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': isAdjustmentsOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <!-- ملخص سريع يظهر أثناء الطي -->
        <div
          v-if="!isAdjustmentsOpen"
          class="pt-2 text-xs flex justify-between items-center text-text-muted cursor-pointer"
          @click="isAdjustmentsOpen = true"
        >
          <div v-if="hasAdjustments" class="flex flex-wrap gap-2 font-mono font-bold text-[11px]">
            <span v-if="discountValueModel > 0" class="text-danger">
              خصم:
              {{
                discountTypeModel === 'percentage'
                  ? `${discountValueModel}%`
                  : formatCurrency(discountValueModel)
              }}
            </span>
            <span v-if="serviceChargeModel > 0" class="text-info">
              خدمة: {{ formatCurrency(serviceChargeModel) }}
            </span>
            <span v-if="deliveryFeeModel > 0" class="text-info">
              توصيل: {{ formatCurrency(deliveryFeeModel) }}
            </span>
          </div>
          <span v-else class="text-[10px]">لا توجد تسويات مالية (انقر للتعديل)</span>
        </div>

        <!-- حقول الإدخال تظهر عند التوسيع -->
        <div v-show="isAdjustmentsOpen" class="space-y-2.5 pt-2.5 transition-all">
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col space-y-1">
              <label class="text-[10px] font-bold text-text-secondary truncate">نوع الخصم</label>
              <select
                v-model="discountTypeModel"
                class="h-8 px-2 bg-surface-ground border border-surface-border rounded-lg text-text-primary text-xs font-bold focus:border-primary outline-none cursor-pointer"
              >
                <option value="fixed">مبلغ ثابت</option>
                <option value="percentage">نسبة (%)</option>
              </select>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-[10px] font-bold text-text-secondary truncate">قيمة الخصم</label>
              <div
                class="relative w-full h-8 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="discountValueModel"
                  class="block w-full h-full px-2 bg-transparent text-danger font-mono text-left font-bold text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
          <p v-if="getFieldError('discount_value')" class="text-danger text-[10px] font-bold">
            {{ getFieldError('discount_value') }}
          </p>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col space-y-1">
              <label class="text-[10px] font-bold text-text-secondary truncate">رسوم الخدمة</label>
              <div
                class="relative w-full h-8 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="serviceChargeModel"
                  class="block w-full h-full px-2 bg-transparent text-info font-mono text-left font-bold text-xs focus:outline-none"
                />
              </div>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-[10px] font-bold text-text-secondary truncate">رسوم التوصيل</label>
              <div
                class="relative w-full h-8 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="deliveryFeeModel"
                  class="block w-full h-full px-2 bg-transparent text-info font-mono text-left font-bold text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 1.ب ملاحظات وشروط الفاتورة - قابلة للطي -->
      <div
        class="p-3.5 bg-surface-section rounded-xl border border-surface-border shadow-xs flex-1 flex flex-col justify-between transition-all duration-200"
      >
        <div
          class="flex items-center justify-between border-b border-surface-border/80 pb-1.5 cursor-pointer select-none"
          @click="isNotesOpen = !isNotesOpen"
        >
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] font-black text-text-primary cursor-pointer">
              ملاحظات وشروط الفاتورة
            </label>
            <span
              v-if="hasNotes"
              class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-info/10 text-info border border-info/25"
            >
              مسجلة
            </span>
          </div>

          <div class="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
            <span class="text-[10px] font-bold">{{ isNotesOpen ? 'طي' : 'توسيع' }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-180': isNotesOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <!-- معاينة سريعة أثناء الطي -->
        <div
          v-if="!isNotesOpen"
          class="pt-2 text-[10px] text-text-muted cursor-pointer truncate"
          @click="isNotesOpen = true"
        >
          <span v-if="hasNotes" class="text-text-secondary font-semibold">{{ notesModel }}</span>
          <span v-else>لا توجد ملاحظات (انقر للكتابة)...</span>
        </div>

        <!-- حقل النص عند التوسيع -->
        <div v-show="isNotesOpen" class="pt-2 flex flex-col space-y-1.5 transition-all">
          <textarea
            v-model="notesModel"
            rows="2"
            placeholder="سجل أي ملاحظات خاصة بحركة البيع الحالية..."
            class="block w-full min-h-[72px] p-2.5 border border-surface-border rounded-lg bg-surface-ground text-text-primary placeholder:text-text-muted text-xs font-semibold focus:border-primary focus:bg-surface-section focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 2. العمود الأوسط: توزيع السداد -->
    <div
      class="lg:col-span-4 p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs flex flex-col justify-between space-y-3"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>توزيع السداد</span>
          </h3>
          <span class="text-[10px] font-bold text-text-muted">طريقة التحصيل</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <!-- كامل بنك -->
          <button
            type="button"
            :aria-pressed="paymentModeModel === 'bank'"
            :class="modeButtonClass('bank')"
            @click="selectPaymentMode('bank')"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span>كامل بنك</span>
          </button>

          <!-- كامل نقداً -->
          <button
            type="button"
            :aria-pressed="paymentModeModel === 'cash'"
            :class="modeButtonClass('cash')"
            @click="selectPaymentMode('cash')"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>كامل نقداً</span>
          </button>

          <!-- كامل آجل -->
          <button
            type="button"
            :aria-pressed="paymentModeModel === 'credit'"
            :class="modeButtonClass('credit')"
            @click="selectPaymentMode('credit')"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>كامل آجل</span>
          </button>

          <!-- تقسيم -->
          <button
            type="button"
            :aria-pressed="paymentModeModel === 'split'"
            :class="modeButtonClass('split')"
            @click="selectPaymentMode('split')"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>تقسيم</span>
          </button>
        </div>

        <!-- حقول التقسيم عند الاختيار -->
        <div
          v-if="paymentModeModel === 'split'"
          class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1"
        >
          <div class="flex flex-col space-y-1">
            <label for="invoice-cash-amount" class="text-[10px] font-bold text-text-secondary">
              المبلغ النقدي
            </label>
            <div
              class="relative w-full h-9 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            >
              <AppCurrencyInput
                id="invoice-cash-amount"
                v-model="cashAmountModel"
                :precision="2"
                variant="sales"
                input-class="h-9 !px-2 !text-left !font-mono !font-bold !text-xs"
                @focus="selectPaymentAmount"
                @click="selectPaymentAmount"
              />
            </div>
            <p v-if="getFieldError('payments.0.amount')" class="text-danger text-[10px] font-bold">
              {{ getFieldError('payments.0.amount') }}
            </p>
          </div>

          <div class="flex flex-col space-y-1">
            <label for="invoice-bank-amount" class="text-[10px] font-bold text-text-secondary">
              المبلغ البنكي
            </label>
            <div
              class="relative w-full h-9 bg-surface-ground border border-surface-border rounded-lg flex items-center transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            >
              <AppCurrencyInput
                id="invoice-bank-amount"
                v-model="bankAmountModel"
                :precision="2"
                variant="sales"
                input-class="h-9 !px-2 !text-left !font-mono !font-bold !text-xs"
                @focus="selectPaymentAmount"
                @click="selectPaymentAmount"
              />
            </div>
            <p v-if="getFieldError('payments.1.amount')" class="text-danger text-[10px] font-bold">
              {{ getFieldError('payments.1.amount') }}
            </p>
          </div>
        </div>
      </div>

      <p v-if="amountsExceedTotal" class="text-danger text-[10px] font-bold leading-relaxed">
        مجموع النقد والبنك أكبر من إجمالي الفاتورة.
      </p>
      <p v-else class="text-[10px] text-text-muted leading-relaxed">
        المتبقي يُسجَّل تلقائياً على حساب العميل.
      </p>
    </div>

    <!-- 3. العمود الأيسر: الإجماليات النهائية (نهاية مسار العين وفوق زر الحفظ مباشرة) -->
    <div
      class="lg:col-span-5 p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col justify-between space-y-3 transition-colors duration-200"
    >
      <div class="space-y-2 text-xs font-semibold text-text-secondary">
        <div class="flex items-center justify-between border-b border-surface-border/80 pb-2">
          <h3 class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>الإجماليات النهائية</span>
          </h3>
          <span class="text-[10px] font-bold text-text-muted">ملخص الفاتورة</span>
        </div>

        <div class="flex justify-between items-center border-b border-surface-border/50 pb-1.5">
          <span>الإجمالي قبل الخصم والضريبة:</span>
          <span class="font-mono font-bold text-text-primary">{{ formatCurrency(subtotal) }}</span>
        </div>

        <div
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5"
          :class="Number(discountAmount) > 0 ? 'text-danger' : 'text-text-muted'"
        >
          <span>إجمالي الخصم الممنوح (-):</span>
          <span class="font-mono font-bold">{{ formatCurrency(discountAmount || 0) }}</span>
        </div>

        <div
          v-if="Number(vatAmount) > 0"
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5 text-info"
        >
          <span>إجمالي الضريبة المستحقة (+):</span>
          <span class="font-mono font-bold">{{ formatCurrency(vatAmount || 0) }}</span>
        </div>

        <div
          v-if="Number(serviceChargeModel) + Number(deliveryFeeModel) > 0"
          class="flex justify-between items-center border-b border-surface-border/50 pb-1.5 text-text-secondary"
        >
          <span>رسوم الخدمة والتوصيل (+):</span>
          <span class="font-mono font-bold">
            {{
              formatCurrency((Number(serviceChargeModel) || 0) + (Number(deliveryFeeModel) || 0))
            }}
          </span>
        </div>
      </div>

      <div class="space-y-2 pt-0.5">
        <!-- صندوق الإجمالي النهائي الفعلي بسطر واحد واضح وعريض -->
        <div
          class="flex justify-between items-center gap-3 bg-primary/10 border border-primary/35 px-3.5 py-2.5 rounded-xl text-primary shadow-2xs"
        >
          <span class="font-black text-xs whitespace-nowrap">الإجمالي النهائي الفعلي:</span>
          <span class="text-xl sm:text-2xl font-mono font-black tracking-tight whitespace-nowrap">
            {{ formatCurrency(grandTotal) }}
          </span>
        </div>

        <!-- شريط المدفوع والمتبقي في صف واحد متوازن -->
        <div class="grid grid-cols-2 gap-2">
          <div
            class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-ground/70 border border-surface-border/70 text-xs"
          >
            <span class="text-text-secondary font-bold text-[11px]">المدفوع:</span>
            <span
              class="font-mono font-black"
              :class="paidAmount > 0 ? 'text-success' : 'text-text-primary'"
            >
              {{ formatCurrency(paidAmount) }}
            </span>
          </div>

          <div
            class="flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
            :class="
              remainingAmount > 0
                ? 'bg-warning/10 border-warning/35 text-warning'
                : 'bg-surface-ground/70 border-surface-border/70 text-text-muted'
            "
          >
            <span class="font-bold text-[11px]">المتبقي:</span>
            <span class="font-mono font-black">
              {{ formatCurrency(remainingAmount) }}
            </span>
          </div>
        </div>

        <p
          v-if="getFieldError('total_amount')"
          class="text-danger text-[10px] text-center font-bold mt-1"
        >
          {{ getFieldError('total_amount') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const notesModel = defineModel('notes', { type: String, default: '' })
const discountTypeModel = defineModel('discountType', { type: String, default: 'fixed' })
const discountValueModel = defineModel('discountValue', { type: Number, default: 0 })
const serviceChargeModel = defineModel('serviceCharge', { type: Number, default: 0 })
const deliveryFeeModel = defineModel('deliveryFee', { type: Number, default: 0 })
const cashAmountModel = defineModel('cashAmount', { type: Number, default: 0 })
const bankAmountModel = defineModel('bankAmount', { type: Number, default: 0 })
const paymentModeModel = defineModel('paymentMode', { type: String, default: 'bank' })

const props = defineProps({
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  vatAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  validationErrors: { type: Object, default: () => null },
})

const isAdjustmentsOpen = ref(false)
const isNotesOpen = ref(false)

const hasAdjustments = computed(() => {
  return (
    Number(discountValueModel.value) > 0 ||
    Number(serviceChargeModel.value) > 0 ||
    Number(deliveryFeeModel.value) > 0
  )
})

const hasNotes = computed(() => {
  return typeof notesModel.value === 'string' && notesModel.value.trim().length > 0
})

watch(
  () => [
    props.validationErrors?.discount_value,
    props.validationErrors?.service_charge,
    props.validationErrors?.delivery_fee,
    props.validationErrors?.notes,
  ],
  ([discErr, servErr, delivErr, notesErr]) => {
    if (discErr || servErr || delivErr) {
      isAdjustmentsOpen.value = true
    }
    if (notesErr) {
      isNotesOpen.value = true
    }
  },
)

const toAmount = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

const selectPaymentAmount = (event) => {
  const input = event?.target
  if (input && typeof input.select === 'function') {
    input.select()
  }
}

const paidAmount = computed(() => {
  return Math.round((toAmount(cashAmountModel.value) + toAmount(bankAmountModel.value)) * 100) / 100
})

const remainingAmount = computed(() => {
  return Math.round(Math.max(0, toAmount(props.grandTotal) - paidAmount.value) * 100) / 100
})

const amountsExceedTotal = computed(() => {
  return Math.round((paidAmount.value - toAmount(props.grandTotal)) * 100) > 0
})

const modeButtonClass = (mode) => [
  'min-h-10 px-2.5 py-2 rounded-xl border text-[11px] sm:text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer',
  paymentModeModel.value === mode
    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-2xs'
    : 'border-surface-border bg-surface-ground/70 text-text-secondary hover:bg-surface-card hover:border-primary/50 hover:text-primary',
]

const selectPaymentMode = (mode) => {
  const previousMode = paymentModeModel.value
  const total = Math.round(toAmount(props.grandTotal) * 100) / 100
  paymentModeModel.value = mode

  if (mode === 'bank') {
    cashAmountModel.value = 0
    bankAmountModel.value = total
    return
  }

  if (mode === 'cash') {
    cashAmountModel.value = total
    bankAmountModel.value = 0
    return
  }

  if (mode === 'credit') {
    cashAmountModel.value = 0
    bankAmountModel.value = 0
    return
  }

  if (mode === 'split' && previousMode !== 'split') {
    cashAmountModel.value = 0
    bankAmountModel.value = 0
  }
}

watch(
  () => props.grandTotal,
  (newTotal) => {
    const total = Math.round(toAmount(newTotal) * 100) / 100

    if (paymentModeModel.value === 'bank') {
      cashAmountModel.value = 0
      bankAmountModel.value = total
    } else if (paymentModeModel.value === 'cash') {
      cashAmountModel.value = total
      bankAmountModel.value = 0
    } else if (paymentModeModel.value === 'credit') {
      cashAmountModel.value = 0
      bankAmountModel.value = 0
    }
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>
