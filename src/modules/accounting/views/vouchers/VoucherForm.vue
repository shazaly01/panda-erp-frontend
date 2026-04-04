<!-- <template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput id="voucher-date" label="تاريخ السند" v-model="form.date" type="date" required />

        <AppDropdown
          id="voucher-type"
          label="نوع السند"
          v-model="form.type"
          :options="voucherTypes"
          placeholder="اختر النوع (صرف/قبض)"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="payment-method-toggle"
          label="وسيلة الدفع"
          v-model="paymentMethodType"
          :options="[
            { id: 'box', name: 'نقدي (خزينة)' },
            { id: 'bank', name: 'تحويل (بنك)' },
          ]"
        />

        <AppDropdown
          v-if="paymentMethodType === 'box'"
          id="box-id"
          label="الخزينة"
          v-model="form.box_id"
          :options="boxes"
          placeholder="اختر الخزينة"
        />

        <AppDropdown
          v-if="paymentMethodType === 'bank'"
          id="bank-id"
          label="الحساب البنكي"
          v-model="form.bank_account_id"
          :options="banks"
          placeholder="اختر البنك"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AppDropdown
          id="currency-id"
          label="العملة"
          v-model="form.currency_id"
          :options="currencies"
          placeholder="اختر العملة"
        />

        <AppInput
          id="exchange-rate"
          label="سعر الصرف"
          v-model="form.exchange_rate"
          type="number"
          step="0.000001"
        />

        <AppCurrencyInput
          id="total-amount"
          label="إجمالي السند"
          v-model="form.amount"
          :readonly="true"
          placeholder="0.00"
        />
      </div>

      <AppTextarea
        id="voucher-description"
        label="البيان العام للقيد"
        v-model="form.description"
        placeholder="ادخل وصفاً موجزاً للسند"
        rows="2"
      />

      <div class="mt-6 border-t border-gray-700 pt-5">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold text-white">تفاصيل الحسابات</h3>
          <AppButton type="button" variant="secondary" @click="addLine"> + إضافة سطر </AppButton>
        </div>

        <div
          v-for="(line, index) in form.details"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-black/20 rounded-lg relative"
        >
          <AppDropdown
            :id="'acc-' + index"
            label="الحساب"
            v-model="line.account_id"
            :options="accounts"
          />
          <AppDropdown
            :id="'cc-' + index"
            label="مركز التكلفة"
            v-model="line.cost_center_id"
            :options="costCenters"
          />
          <AppCurrencyInput
            :id="'amt-' + index"
            label="المبلغ"
            v-model="line.amount"
            @input="updateTotalAmount"
          />
          <div class="flex items-end space-x-2 space-x-reverse">
            <AppInput
              class="flex-1"
              :id="'desc-' + index"
              label="البيان"
              v-model="line.description"
            />
            <button
              v-if="form.details.length > 1"
              type="button"
              @click="removeLine(index)"
              class="mb-2 p-2 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ السند المحاسبي</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  boxes: { type: Array, default: () => [] },
  banks: { type: Array, default: () => [] },
  accounts: { type: Array, default: () => [] },
  costCenters: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

const voucherTypes = [
  { id: 'payment', name: 'سند صرف' },
  { id: 'receipt', name: 'سند قبض' },
]

const paymentMethodType = ref('box')

const createFreshForm = () => ({
  id: null,
  date: new Date().toISOString().split('T')[0],
  type: 'payment',
  box_id: '',
  bank_account_id: '',
  currency_id: '',
  exchange_rate: 1,
  amount: 0,
  description: '',
  details: [{ account_id: '', cost_center_id: '', amount: 0, description: '' }],
})

const form = ref(createFreshForm())

// تحديث الإجمالي تلقائياً عند تغيير مبالغ السطور
const updateTotalAmount = () => {
  form.value.amount = form.value.details.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)
}

const addLine = () => {
  form.value.details.push({ account_id: '', cost_center_id: '', amount: 0, description: '' })
}

const removeLine = (index) => {
  form.value.details.splice(index, 1)
  updateTotalAmount()
}

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
      paymentMethodType.value = newData.bank_account_id ? 'bank' : 'box'
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
</script> -->
