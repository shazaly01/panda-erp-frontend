<!--src\modules\hr\views\payroll\components\SalaryRuleModal.vue-->
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
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4"
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
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-2xl transform flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 id="modal-title" class="text-lg font-semibold text-text-primary">
              {{ title }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
              aria-label="Close"
              :disabled="isSaving"
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

          <div class="overflow-y-auto flex-1 pb-2 px-1">
            <SalaryRuleForm v-model="form" />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة قاعدة الراتب' }}</span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useSalaryRuleStore } from '@/modules/hr/stores/salaryRuleStore'
import AppButton from '@/components/ui/AppButton.vue'
import SalaryRuleForm from './SalaryRuleForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ruleToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const salaryRuleStore = useSalaryRuleStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!props.ruleToEdit)

const title = computed(() =>
  isEditMode.value ? 'تعديل بيانات قاعدة الراتب' : 'إضافة قاعدة راتب جديدة',
)

const defaultForm = () => ({
  name: '',
  code: '',
  category: 'allowance',
  type: 'fixed',
  value: 0,
  percentage_of_code: '',
  formula_expression: '',
  account_mapping_key: null,
  is_active: true,
  description: '',
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value) {
        form.value = {
          name: props.ruleToEdit.name,
          code: props.ruleToEdit.code,
          category: props.ruleToEdit.category,
          type: props.ruleToEdit.type,
          value: props.ruleToEdit.value || 0,
          percentage_of_code: props.ruleToEdit.percentage_of_code || '',
          formula_expression: props.ruleToEdit.formula_expression || '',
          account_mapping_key: props.ruleToEdit.account_mapping_key || null,
          is_active: props.ruleToEdit.is_active,
          description: props.ruleToEdit.description || '',
        }
      } else {
        form.value = defaultForm()
      }
    }
  },
  { immediate: true },
)

const close = () => {
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.name.trim()) return toast.error('حقل اسم القاعدة مطلوب.')
  if (!form.value.code.trim()) return toast.error('حقل كود القاعدة مطلوب.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await salaryRuleStore.updateRule(props.ruleToEdit.id, form.value)
      toast.success('تم تحديث قاعدة الراتب بنجاح.')
    } else {
      await salaryRuleStore.createRule(form.value)
      toast.success('تمت إضافة قاعدة الراتب بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ.')
  } finally {
    isSaving.value = false
  }
}
</script>
