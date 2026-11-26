<!-- src/modules/hr/views/payroll/PayrollInputForm.vue -->
<template>
  <form
    @submit.prevent
    @keydown.ctrl.enter.prevent="handleCtrlEnter"
    class="space-y-3.5 font-sans text-right"
    dir="rtl"
  >
    <!-- =========================================================
         البطاقة 1: طبيعة الحركة المالية وتاريخ الاستحقاق
         ========================================================= -->
    <div
      class="voucher-card bg-surface-section/70 border border-surface-border p-4 rounded-xl transition-all duration-200"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        <!-- أزرار اختيار نوع الحركة المالية -->
        <div class="md:col-span-8 flex flex-col">
          <label class="block text-xs font-bold text-text-secondary mb-1.5">
            طبيعة الحركة المالية *
          </label>
          <div
            class="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-surface-card border border-surface-border rounded-lg min-h-[40px] items-center box-border"
          >
            <button
              v-for="opt in movementTypes"
              :key="opt.id"
              type="button"
              @click="selectMovementType(opt.id)"
              class="flex items-center justify-center gap-1.5 h-[32px] px-2 rounded-md text-xs font-black transition-all duration-200 select-none cursor-pointer"
              :class="
                form.type === opt.id
                  ? opt.activeClass
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-ground/70'
              "
            >
              <span>{{ opt.label }}</span>
            </button>
          </div>
          <p v-if="getFieldError('type')" class="mt-1 text-xs text-danger font-bold">
            {{ getFieldError('type') }}
          </p>
        </div>

        <!-- تاريخ الاستحقاق -->
        <div class="md:col-span-4">
          <label
            for="payroll-input-date"
            class="block text-xs font-bold text-text-secondary mb-1.5"
          >
            تاريخ الاستحقاق *
          </label>
          <AppInput
            id="payroll-input-date"
            type="date"
            v-model="form.date"
            class="bg-surface-card font-mono font-bold"
            dir="ltr"
            required
          />
          <p v-if="getFieldError('date')" class="mt-1 text-xs text-danger font-bold">
            {{ getFieldError('date') }}
          </p>
        </div>
      </div>
    </div>

    <!-- =========================================================
         البطاقة 2: الموظف المعني والمبلغ (القلب المالي للحركة)
         ========================================================= -->
    <div
      class="voucher-card bg-surface-card/85 border border-primary/35 p-4 rounded-xl shadow-2xs transition-all duration-200"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        <!-- اختيار الموظف -->
        <div class="md:col-span-7">
          <label
            for="payroll-input-employee"
            class="block text-xs font-bold text-text-secondary mb-1.5"
          >
            الموظف المعني *
          </label>
          <AppDropdown
            id="payroll-input-employee"
            v-model="form.employee_id"
            :options="employees"
            option-label="displayLabel"
            option-value="id"
            placeholder="ابحث واختر الموظف..."
            class="bg-surface-section"
            required
          />
          <p v-if="getFieldError('employee_id')" class="mt-1 text-xs text-danger font-bold">
            {{ getFieldError('employee_id') }}
          </p>
        </div>

        <!-- حقل المبلغ -->
        <div class="md:col-span-5">
          <label
            for="payroll-input-amount"
            class="block text-xs font-bold text-text-secondary mb-1.5"
          >
            المبلغ المستحق *
          </label>
          <AppCurrencyInput
            id="payroll-input-amount"
            v-model="form.amount"
            :precision="2"
            placeholder="0.00"
            :input-class="`h-[40px] !bg-surface-section !border-primary/50 focus:!border-primary rounded-lg text-base font-black ${
              isAddition
                ? '!text-emerald-600 dark:!text-emerald-400'
                : '!text-rose-600 dark:!text-rose-400'
            }`"
            @keydown.enter.prevent="focusInput('payroll-input-reason')"
            required
          />
          <p v-if="getFieldError('amount')" class="mt-1 text-xs text-danger font-bold">
            {{ getFieldError('amount') }}
          </p>
        </div>
      </div>
    </div>

    <!-- =========================================================
         البطاقة 3: البيان العام وسبب الحركة
         ========================================================= -->
    <div
      class="voucher-card bg-surface-section/70 border border-surface-border p-4 rounded-xl transition-all duration-200"
    >
      <div>
        <label
          for="payroll-input-reason"
          class="block text-xs font-bold text-text-secondary mb-1.5"
        >
          السبب / البيان العام للحركة *
        </label>
        <AppInput
          id="payroll-input-reason"
          type="text"
          v-model="form.reason"
          @keydown.enter.prevent="focusInput('btn-payroll-input-submit')"
          :placeholder="reasonPlaceholder"
          class="bg-surface-card"
          required
        />
        <p v-if="getFieldError('reason')" class="mt-1 text-xs text-danger font-bold">
          {{ getFieldError('reason') }}
        </p>
      </div>
    </div>

    <!-- =========================================================
         الشريط السفلي المتوازن (الأزرار في اليمين وملخص الأثر في اليسار)
         ========================================================= -->
    <div
      class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1.5"
    >
      <!-- أزرار الحفظ والإلغاء -->
      <div class="flex flex-wrap items-center gap-2.5 justify-start">
        <AppButton
          id="btn-payroll-input-submit"
          type="button"
          @click="handleSubmit"
          :disabled="isSaving || numericAmount <= 0"
          class="bg-primary text-white font-black px-5 py-2 rounded-xl focus:ring-2 focus:ring-primary/40"
        >
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'حفظ واعتماد الحركة' }}</span>
        </AppButton>

        <AppButton
          type="button"
          variant="secondary"
          @click="$emit('cancel')"
          :disabled="isSaving"
          class="font-bold rounded-xl"
        >
          إلغاء
        </AppButton>
      </div>

      <!-- بطاقة ملخص الأثر المباشر على الراتب -->
      <div
        class="flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-xl bg-surface-section border border-surface-border border-r-4 shadow-xs"
        :class="isAddition ? 'border-r-emerald-500' : 'border-r-rose-500'"
      >
        <div class="flex flex-col text-right">
          <span class="text-xs font-black text-text-secondary">الأثر على الراتب:</span>
          <span
            class="text-[10px] font-bold"
            :class="isAddition ? 'text-success' : 'text-rose-600 dark:text-rose-400'"
          >
            {{ isAddition ? 'إضافة مستحقة للموظف' : 'استقطاع يُخصم من الراتب' }}
          </span>
        </div>

        <div
          class="flex items-baseline gap-1.5 px-3 py-1 rounded-lg border"
          :class="
            isAddition
              ? 'bg-emerald-500/12 border-emerald-500/35 text-success'
              : 'bg-rose-500/12 border-rose-500/35 text-rose-600 dark:text-rose-400'
          "
        >
          <span class="font-mono text-base font-black">
            {{ isAddition ? '+' : '-' }}
          </span>
          <span class="font-mono text-xl font-black tracking-tight">
            {{ formatNumber(numericAmount) }}
          </span>
        </div>
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
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  employees: { type: Array, default: () => [] },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])
const toast = useToast()

const isEditMode = computed(() => Boolean(props.initialData?.id))
const isPopulating = ref(false)

const movementTypes = [
  {
    id: 'bonus',
    label: 'حافز',
    activeClass: 'bg-emerald-600 text-white shadow-xs',
  },
  {
    id: 'allowance',
    label: 'بدل',
    activeClass: 'bg-sky-600 text-white shadow-xs',
  },
  {
    id: 'deduction',
    label: 'استقطاع',
    activeClass: 'bg-amber-600 text-white shadow-xs',
  },
  {
    id: 'penalty',
    label: 'جزاء',
    activeClass: 'bg-rose-600 text-white shadow-xs',
  },
]

const form = ref({
  id: null,
  employee_id: '',
  type: 'bonus',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  reason: '',
})

const isAddition = computed(() => form.value.type === 'bonus' || form.value.type === 'allowance')

const numericAmount = computed(() => {
  const val = Number(form.value.amount)
  return Number.isFinite(val) && val > 0 ? val : 0
})

const reasonPlaceholder = computed(() => {
  const placeholders = {
    bonus: 'مثال: مكافأة الأداء المتميز وإنجاز المهام الشهرية...',
    allowance: 'مثال: بدل سكن أو مواصلات إضافي...',
    deduction: 'مثال: استقطاع سداد عهدة أو تسوية مالية...',
    penalty: 'مثال: خصم إداري مباشر بقرار الإدارة...',
  }
  return placeholders[form.value.type] || 'اكتب سبب وتفاصيل الحركة المالية...'
})

const formatNumber = (num) =>
  Number(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const getFieldError = (field) => {
  return props.serverErrors?.[field]?.[0] || null
}

watch(
  () => props.initialData,
  (newVal) => {
    isPopulating.value = true
    if (newVal) {
      form.value = {
        id: newVal.id || null,
        employee_id: newVal.employee_id || '',
        type: newVal.type || 'bonus',
        amount: newVal.amount !== undefined && newVal.amount !== null ? Number(newVal.amount) : '',
        date: newVal.date || new Date().toISOString().split('T')[0],
        reason: newVal.reason || '',
      }
    } else {
      form.value = {
        id: null,
        employee_id: '',
        type: 'bonus',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
      }
    }
    nextTick(() => {
      isPopulating.value = false
    })
  },
  { immediate: true, deep: true },
)

// انتقال المؤشر تلقائياً إلى حقل المبلغ فور اختيار الموظف
watch(
  () => form.value.employee_id,
  (newId, oldId) => {
    if (!isPopulating.value && newId && newId !== oldId) {
      nextTick(() => {
        focusInput('payroll-input-amount')
      })
    }
  },
)

const selectMovementType = (typeId) => {
  form.value.type = typeId
}

const focusInput = (elementId) => {
  const el = document.getElementById(elementId)
  if (!el) return
  const target =
    el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'BUTTON'
      ? el
      : el.querySelector('input, select, button')
  if (target) {
    target.focus()
    if (typeof target.select === 'function') {
      target.select()
    }
  }
}

const handleCtrlEnter = () => {
  if (props.isSaving || numericAmount.value <= 0) return
  handleSubmit()
}

const handleSubmit = () => {
  if (!form.value.employee_id) {
    return toast.error('يرجى اختيار الموظف أولاً.')
  }
  if (!form.value.date) {
    return toast.error('يرجى تحديد تاريخ الاستحقاق.')
  }
  if (numericAmount.value <= 0) {
    return toast.error('المبلغ يجب أن يكون أكبر من الصفر.')
  }
  if (!form.value.reason || !form.value.reason.trim()) {
    focusInput('payroll-input-reason')
    return toast.error('يرجى كتابة سبب الحركة المالية.')
  }

  emit('submit', {
    employee_id: Number(form.value.employee_id),
    type: form.value.type,
    amount: numericAmount.value,
    date: form.value.date,
    reason: form.value.reason.trim(),
  })
}
</script>

<style scoped>
/* توحيد ارتفاع وحواف جميع حقول الإدخال والقوائم المنسدلة داخل البطاقات (40px) */
.voucher-card :deep(input),
.voucher-card :deep(.p-dropdown),
.voucher-card :deep([data-pc-name='dropdown']),
.voucher-card :deep([data-pc-section='root']) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 0.5rem !important;
  box-sizing: border-box !important;
}

.voucher-card :deep(input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
}

.voucher-card :deep(input[type='date']) {
  color-scheme: inherit;
}

.voucher-card :deep(.p-dropdown),
.voucher-card :deep([data-pc-name='dropdown']) {
  display: inline-flex !important;
  align-items: center !important;
}

.voucher-card :deep(.p-dropdown-label),
.voucher-card :deep([data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
}
</style>
