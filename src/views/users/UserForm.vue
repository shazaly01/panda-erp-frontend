<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <AppInput
        id="user-full-name"
        label="الاسم الكامل *"
        v-model="form.full_name"
        placeholder="الاسم الثلاثي..."
        required
      />

      <AppInput
        id="user-username"
        label="اسم المستخدم *"
        v-model="form.username"
        placeholder="اسم الدخول..."
        required
      />

      <AppInput
        id="user-email"
        label="البريد الإلكتروني"
        type="email"
        v-model="form.email"
        placeholder="example@domain.com"
      />

      <AppDropdown
        id="user-role"
        label="الدور / الصلاحية *"
        v-model="form.roles[0]"
        :options="roles"
        option-label="name"
        option-value="name"
        placeholder="اختر الصلاحية..."
        required
      />
    </div>

    <div class="bg-surface-ground/30 p-5 rounded-xl border border-surface-border space-y-4">
      <div
        class="border-b border-surface-border pb-2 flex items-center gap-2 text-primary font-bold text-sm"
      >
        إعدادات العمليات الافتراضية
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AppDropdown
          id="user-default-cc"
          label="الفرع / المركز"
          v-model="form.default_cost_center_id"
          :options="activeCostCenters"
          option-label="name"
          option-value="id"
          placeholder="اختر الفرع..."
          :show-clear="true"
        />

        <AppDropdown
          id="user-default-box"
          label="الخزينة الافتراضية"
          v-model="form.default_box_id"
          :options="boxes"
          option-label="name"
          option-value="id"
          placeholder="اختر الخزينة..."
          :show-clear="true"
        />

        <AppDropdown
          id="user-default-bank"
          label="البنك الافتراضي"
          v-model="form.default_bank_account_id"
          :options="formattedBankAccounts"
          option-label="displayName"
          option-value="id"
          placeholder="اختر البنك..."
          :show-clear="true"
        />
      </div>
    </div>

    <div class="border-t border-surface-border pt-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppInput
          id="user-password"
          :label="form.id ? 'تغيير كلمة المرور' : 'كلمة المرور *'"
          type="password"
          v-model="form.password"
          :required="!form.id"
          autocomplete="new-password"
        />
        <AppInput
          id="user-password-confirmation"
          label="تأكيد كلمة المرور"
          type="password"
          v-model="form.password_confirmation"
          :required="!form.id || form.password"
          autocomplete="new-password"
        />
      </div>
    </div>

    <div class="mt-8 flex justify-end gap-3 border-t border-surface-border pt-4">
      <AppButton type="submit" :disabled="isSaving" class="px-10">
        {{ isSaving ? 'جاري الحفظ...' : 'حفظ البيانات' }}
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

import { useRoleStore } from '@/stores/roleStore' // 👈 استيراد متجر الأدوار
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useBoxStore } from '@/modules/accounting/stores/boxStore'
import { useBankAccountStore } from '@/modules/accounting/stores/bankAccountStore'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const roleStore = useRoleStore()
const costCenterStore = useCostCenterStore()
const boxStore = useBoxStore()
const bankAccountStore = useBankAccountStore()

const roles = computed(() => roleStore.roles || [])
const activeCostCenters = computed(() => costCenterStore.activeCostCenters || [])
const boxes = computed(() => boxStore.boxes || [])
const formattedBankAccounts = computed(() =>
  (bankAccountStore.bankAccounts || []).map((b) => ({
    ...b,
    displayName: `${b.bank_name} - ${b.account_number}`,
  })),
)

onMounted(async () => {
  if (roleStore.roles?.length === 0) await roleStore.fetchRoles()
  if (costCenterStore.costCenters?.length === 0) await costCenterStore.fetchCostCenters()
  if (boxStore.boxes?.length === 0) await boxStore.fetchBoxes()
  if (bankAccountStore.bankAccounts?.length === 0) await bankAccountStore.fetchBankAccounts()
})

const form = ref({
  id: null,
  full_name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: [],
  default_cost_center_id: null,
  default_box_id: null,
  default_bank_account_id: null,
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        ...newData,
        password: '',
        password_confirmation: '',
        roles: newData.roles ? newData.roles.map((r) => r.name) : [],
        default_cost_center_id: newData.default_cost_center_id || null,
        default_box_id: newData.default_box_id || null,
        default_bank_account_id: newData.default_bank_account_id || null,
      }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  const payload = { ...form.value }
  if (payload.id && !payload.password) {
    delete payload.password
    delete payload.password_confirmation
  }
  emit('submit', payload)
}
</script>
