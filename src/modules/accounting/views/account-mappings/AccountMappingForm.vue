<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="p-4 rounded-xl border border-surface-border bg-surface-section/30 space-y-4">
        <div>
          <h4 class="text-sm font-bold text-primary">معلومات مفتاح الربط</h4>
          <p class="text-xs text-text-muted mt-1">
            هذه البيانات النظامية لا يمكن تعديلها، يتم توجيهها فقط.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput id="mapping-name" label="اسم التوجيه" v-model="form.name" disabled />

          <AppInput
            id="mapping-key"
            label="المفتاح النظامي (Key)"
            v-model="form.key"
            disabled
            dir="ltr"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5">
        <AccountCandidateSelect
          id="account-id"
          label="الحساب المحاسبي المرتبط"
          v-model="form.account_id"
          :candidates="candidates"
          required
        />

        <p class="text-[10px] text-orange-500 mt-1">
          * سيتم توجيه القيود الآلية الخاصة بهذا المفتاح إلى الحساب المختار.
        </p>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving || !form.account_id">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ التوجيه المحاسبي</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
// 🌟 استدعاء المكون الجديد
import AccountCandidateSelect from '@/modules/accounting/components/selects/AccountCandidateSelect.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  candidates: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  id: null,
  name: '',
  key: '',
  account_id: '',
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
        key: newData.key,
        account_id: newData.account_id || '',
      }
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
</script>
