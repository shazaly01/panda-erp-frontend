<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="currency-code"
          label="كود العملة (ISO)"
          v-model="form.code"
          placeholder="مثال: USD, SAR"
          @input="form.code = form.code.toUpperCase()"
          maxlength="3"
          required
        />

        <AppInput
          id="currency-name"
          label="اسم العملة"
          v-model="form.name"
          placeholder="مثال: دولار أمريكي"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="currency-symbol"
          label="رمز العملة"
          v-model="form.symbol"
          placeholder="مثال: $ أو ﷼"
          required
        />

        <AppCurrencyInput
          id="currency-exchange-rate"
          label="سعر الصرف (مقابل العملة الأساسية)"
          v-model="form.exchange_rate"
          :disabled="form.is_base"
          placeholder="0.000000"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        <div class="flex items-center">
          <input
            id="is-base-currency"
            type="checkbox"
            v-model="form.is_base"
            @change="handleBaseChange"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="is-base-currency"
            class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
          >
            هذه هي العملة الأساسية للنظام (Base Currency)
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="is-active-currency"
            type="checkbox"
            v-model="form.is_active"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="is-active-currency"
            class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
          >
            العملة نشطة حالياً
          </label>
        </div>
      </div>

      <p
        v-if="form.is_base"
        class="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200"
      >
        <span class="font-bold">ملاحظة:</span> العملة الأساسية يكون سعر صرفها دائماً 1.000000
      </p>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ العملة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  code: '',
  name: '',
  symbol: '',
  exchange_rate: 1,
  is_base: false,
  is_active: true,
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        code: newData.code,
        name: newData.name,
        symbol: newData.symbol,
        exchange_rate: Number(newData.exchange_rate),
        is_base: Boolean(newData.is_base),
        is_active: Boolean(newData.is_active),
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleBaseChange = () => {
  if (form.value.is_base) {
    form.value.exchange_rate = 1
  }
}

const handleSubmit = () => {
  if (form.value.is_base) {
    form.value.exchange_rate = 1
  }
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
