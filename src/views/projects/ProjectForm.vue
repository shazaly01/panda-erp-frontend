<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <AppInput
        id="project-name"
        label="اسم المشروع"
        v-model="form.name"
        placeholder="ادخل اسم المشروع"
        required
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <OwnersDropdown id="project-owner" label="الجهة المالكة للمشروع" v-model="form.owner_id" />

        <AppInput
          id="contract-number"
          label="رقم العقد"
          v-model="form.contract_number"
          placeholder="ادخل رقم العقد"
        />
      </div>

      <div class="mt-3 flex items-center">
        <input
          id="has-contract-permission"
          type="checkbox"
          v-model="form.has_contract_permission"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label
          for="has-contract-permission"
          class="mr-2 text-sm font-medium text-white select-none cursor-pointer"
        >
          يوجد إذن تعاقد لهذا المشروع
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <CompaniesDropdown
            id="project-company"
            label="الشركة التابع لها المشروع"
            v-model="form.company_id"
            :required="true"
          />
          <p v-if="errors.company_id" class="text-rose-500 text-xs mt-1 font-bold">
            يجب اختيار الشركة التابع لها المشروع
          </p>
        </div>

        <AppInput
          id="project-region"
          label="المنطقة"
          v-model="form.region"
          placeholder="مثال: بنغازى ..."
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CalculationOptionsDropdown
          id="project-calculation-option"
          label="خيار الاحتساب"
          v-model="form.calculation_option_id"
        />

        <!-- <AppInput
          id="project-award-date"
          label="تاريخ الترسية"
          v-model="form.award_date"
          type="date"
          required
        /> -->
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppCurrencyInput
          id="project-contract-value"
          label="قيمة العقد الكلية"
          v-model="form.contract_value"
          type="number"
          step="0.01"
          placeholder="0.00"
        />

        <AppCurrencyInput
          id="project-due-value"
          label="القيمة المستحقة"
          v-model="form.due_value"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
        />
      </div>

      <AppTextarea
        id="project-description"
        label="وصف المشروع (اختياري)"
        v-model="form.description"
        placeholder="ادخل وصفاً موجزاً للمشروع"
        rows="3"
      />
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ المشروع</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// استيراد مكونات UI الأساسية
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import OwnersDropdown from '@/components/forms/OwnersDropdown.vue'
import CalculationOptionsDropdown from '@/components/forms/CalculationOptionsDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

// إدارة الأخطاء يدوياً
const errors = reactive({
  company_id: false,
})

const createFreshForm = () => ({
  id: null,
  name: '',
  // project_owner: '',
  owner_id: '',
  contract_number: '',
  region: '',
  calculation_option_id: '',
  company_id: '',
  contract_value: '',
  due_value: '',
  award_date: '',
  description: '',
  has_contract_permission: false,
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const formattedDate = newData.award_date
        ? new Date(newData.award_date).toISOString().split('T')[0]
        : ''

      form.value = {
        id: newData.id,
        name: newData.name,
        // project_owner: newData.project_owner || '',
        owner_id: newData.owner_id || '',
        contract_number: newData.contract_number || '',
        region: newData.region || '',
        calculation_option_id: newData.calculation_option_id || '',
        company_id: Number(newData.company_id || newData.company?.id),
        contract_value: newData.contract_value,
        due_value: newData.due_value,
        award_date: formattedDate,
        description: newData.description || '',
        has_contract_permission: Boolean(newData.has_contract_permission),
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// دالة التحقق والإرسال
const handleSubmit = () => {
  // إعادة تعيين الأخطاء
  errors.company_id = false

  // التحقق من أن حقل الشركة ليس فارغاً
  if (!form.value.company_id) {
    errors.company_id = true
    // تركيز المتصفح على الحقل أو تنبيه المستخدم
    return
  }

  // إذا نجح التحقق، نقوم بالإرسال
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
