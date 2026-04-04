<!--src\modules\accounting\views\journal-entries\JournalEntryForm.vue-->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput id="entry-date" label="تاريخ القيد" v-model="form.date" type="date" required />

        <AppDropdown
          id="entry-currency"
          label="العملة (اختياري)"
          v-model="form.currency_id"
          :options="currencies"
          placeholder="اختر العملة"
        />
      </div>

      <AppTextarea
        id="entry-description"
        label="البيان العام للقيد"
        v-model="form.description"
        placeholder="ادخل وصفاً شاملاً للقيد المحاسبي"
        rows="2"
      />

      <div class="mt-6 border-t border-gray-700 pt-5">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            تفاصيل القيد (مدين / دائن)
          </h3>
          <AppButton type="button" variant="secondary" @click="addLine"> + إضافة سطر </AppButton>
        </div>

        <div
          v-for="(line, index) in form.details"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 bg-black/20 rounded-lg border border-gray-800 relative group"
        >
          <div class="md:col-span-3">
            <AppDropdown
              :id="'acc-' + index"
              label="الحساب"
              v-model="line.account_id"
              :options="accounts"
              required
            />
          </div>

          <div class="md:col-span-2">
            <AppDropdown
              :id="'cc-' + index"
              label="مركز التكلفة"
              v-model="line.cost_center_id"
              :options="costCenters"
            />
          </div>

          <div class="md:col-span-2">
            <AppCurrencyInput
              :id="'debit-' + index"
              label="مدين (Debit)"
              v-model="line.debit"
              @input="handleDebitInput(index)"
              placeholder="0.00"
            />
          </div>

          <div class="md:col-span-2">
            <AppCurrencyInput
              :id="'credit-' + index"
              label="دائن (Credit)"
              v-model="line.credit"
              @input="handleCreditInput(index)"
              placeholder="0.00"
            />
          </div>

          <div class="md:col-span-3 flex items-end space-x-2 space-x-reverse">
            <AppInput
              class="flex-1"
              :id="'desc-' + index"
              label="البيان"
              v-model="line.description"
              placeholder="بيان السطر"
            />

            <button
              v-if="form.details.length > 2"
              type="button"
              @click="removeLine(index)"
              class="mb-2 p-2 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
              title="حذف السطر"
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

      <div
        class="flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border-2 transition-all duration-300"
        :class="
          isBalanced ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
        "
      >
        <div class="flex space-x-8 space-x-reverse">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 uppercase">إجمالي المدين</span>
            <span
              class="text-xl font-mono font-bold"
              :class="isBalanced ? 'text-emerald-400' : 'text-white'"
            >
              {{ totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400 uppercase">إجمالي الدائن</span>
            <span
              class="text-xl font-mono font-bold"
              :class="isBalanced ? 'text-emerald-400' : 'text-white'"
            >
              {{ totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>

        <div class="text-center md:text-left mt-4 md:mt-0">
          <span class="text-[10px] block text-gray-400 uppercase">الفرق</span>
          <span
            class="text-2xl font-mono font-black"
            :class="isBalanced ? 'text-emerald-400' : 'text-rose-500'"
          >
            {{ balanceDifference.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
          </span>
          <p v-if="!isBalanced" class="text-[10px] text-rose-400 animate-pulse mt-1">
            القيد غير متزن حالياً
          </p>
          <p v-else class="text-[10px] text-emerald-400 mt-1">القيد متزن وجاهز للحفظ</p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse border-t border-gray-700 pt-5">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving || !isBalanced || totalDebit === 0">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ القيد اليومية</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// المكونات المفضلة لديك
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  accounts: { type: Array, default: () => [] },
  costCenters: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

// إنشاء نموذج فارغ بنفس نمط createFreshForm الخاص بك
const createFreshForm = () => ({
  id: null,
  date: new Date().toISOString().split('T')[0],
  description: '',
  currency_id: '',
  details: [
    { account_id: '', cost_center_id: '', debit: 0, credit: 0, description: '' },
    { account_id: '', cost_center_id: '', debit: 0, credit: 0, description: '' },
  ],
})

const form = ref(createFreshForm())

// --- الحسابات المنطقية للموازنة ---
const totalDebit = computed(() => {
  return form.value.details.reduce((sum, line) => sum + (Number(line.debit) || 0), 0)
})

const totalCredit = computed(() => {
  return form.value.details.reduce((sum, line) => sum + (Number(line.credit) || 0), 0)
})

const balanceDifference = computed(() => {
  return Math.abs(totalDebit.value - totalCredit.value)
})

const isBalanced = computed(() => {
  return balanceDifference.value < 0.001
})

// --- إدارة الأسطر ---
const addLine = () => {
  form.value.details.push({
    account_id: '',
    cost_center_id: '',
    debit: 0,
    credit: 0,
    description: '',
  })
}

const removeLine = (index) => {
  if (form.value.details.length > 2) {
    form.value.details.splice(index, 1)
  }
}

// تصفير الجانب المقابل عند الإدخال (مدين/دائن)
const handleDebitInput = (index) => {
  if (form.value.details[index].debit > 0) {
    form.value.details[index].credit = 0
  }
}

const handleCreditInput = (index) => {
  if (form.value.details[index].credit > 0) {
    form.value.details[index].debit = 0
  }
}

// المراقبة المفضلة لديك لتحديث النموذج
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  if (isBalanced.value && totalDebit.value > 0) {
    emit('submit', { ...form.value })
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
