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

      <div class="p-4 rounded-xl border border-surface-border bg-surface-section/30 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-bold text-primary">الربط مع دليل الحسابات</h4>
            <p class="text-xs text-text-muted mt-1">كيف تود ربط هذه الخزينة محاسبياً؟</p>
          </div>

          <div v-if="!form.id" class="flex items-center">
            <input
              id="auto-create-account"
              type="checkbox"
              v-model="autoCreateAccount"
              class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label
              for="auto-create-account"
              class="mr-2 text-xs font-bold text-text-secondary cursor-pointer select-none"
            >
              إنشاء حساب تلقائي
            </label>
          </div>
        </div>

        <div v-if="!autoCreateAccount || form.id" class="animate-fade-in">
          <AppDropdown
            id="account-id"
            label="الحساب المالي المرتبط"
            v-model="form.account_id"
            :options="transactionalAccounts"
            option-label="dropdownName"
            option-value="id"
            placeholder="ابحث عن حساب (مثلاً: 1002001...)"
            :required="!autoCreateAccount || form.id"
            :disabled="form.id && form.account_id"
          />
          <p v-if="form.id" class="text-[10px] text-orange-500 mt-1">
            * لا يمكن تغيير الحساب المرتبط بعد الإنشاء لضمان سلامة القيود.
          </p>
        </div>
        <div v-else class="text-xs text-emerald-600 font-medium py-2">
          <svg
            class="w-4 h-4 inline-block ml-1"
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
          سيقوم النظام بإنشاء حساب فرعي جديد تحت "حساب الخزائن" الرئيسي تلقائياً.
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
            class="mr-2 text-sm font-medium text-text-primary cursor-pointer"
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
  transactionalAccounts: { type: Array, default: () => [] }, // أضفنا هذا الـ Prop
})

const emit = defineEmits(['submit', 'cancel'])

// متغير للتحكم في نوع الربط
const autoCreateAccount = ref(true)

const createFreshForm = () => ({
  id: null,
  name: '',
  currency_id: '',
  account_id: '', // الحساب المرتبط
  branch_id: '',
  description: '',
  is_active: true,
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
        account_id: newData.account_id || '',
        branch_id: newData.branch_id || newData.branch?.id || '',
        description: newData.description || '',
        is_active: Boolean(newData.is_active),
      }
      // إذا كان الحساب موجوداً بالفعل (وضع تعديل)، نغلق "الإنشاء التلقائي"
      autoCreateAccount.value = false
    } else {
      form.value = createFreshForm()
      autoCreateAccount.value = true
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // إذا كان الإنشاء تلقائي، نتأكد من مسح account_id قبل الإرسال لكي يفهم الباك-إند
  const payload = { ...form.value }
  if (autoCreateAccount.value && !form.value.id) {
    payload.account_id = null
  }
  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
