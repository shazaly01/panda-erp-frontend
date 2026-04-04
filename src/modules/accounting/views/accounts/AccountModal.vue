<!--src\modules\accounting\views\accounts\AccountModal.vue-->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-2xl transform"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title"
        >
          <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-5">
            <h3 id="modal-title" class="text-lg font-semibold text-text-primary">
              {{ title }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border"
              aria-label="Close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <AccountForm
            :initial-data="account"
            :is-saving="isSaving"
            :currencies="currencies"
            :parent-accounts="parentAccounts"
            :account-type-options="accountTypeOptions"
            @submit="handleFormSubmit"
            @cancel="close"
          />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import AccountForm from './AccountForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  account: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  currencies: { type: Array, default: () => [] },
  parentAccounts: { type: Array, default: () => [] },
  accountTypeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'save'])

const title = computed(() =>
  props.account && props.account.id ? 'تعديل الحساب المالي' : 'إضافة حساب مالي جديد',
)

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>
