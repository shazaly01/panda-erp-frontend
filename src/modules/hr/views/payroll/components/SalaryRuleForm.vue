<!--src\modules\hr\views\payroll\components\SalaryRuleForm.vue--->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-1">
        <AppInput
          id="rule-name"
          label="اسم القاعدة (بالعربية) *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثلاً: الراتب الأساسي، بدل السكن..."
          required
        />
      </div>
      <div class="md:col-span-1">
        <AppInput
          id="rule-code"
          label="كود القاعدة (Unique Code) *"
          :model-value="modelValue.code"
          @update:model-value="updateField('code', $event)"
          placeholder="BASIC, HOUSING, GOSI_EMP..."
          class="font-mono text-left"
          dir="ltr"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppDropdown
          id="rule-category"
          label="فئة القاعدة *"
          :model-value="modelValue.category"
          @update:model-value="updateField('category', $event)"
          :options="categoryOptions"
          required
        />
      </div>
      <div class="md:col-span-1">
        <AppDropdown
          id="rule-type"
          label="طريقة الحساب *"
          :model-value="modelValue.type"
          @update:model-value="updateField('type', $event)"
          :options="typeOptions"
          required
        />
      </div>

      <div v-if="['fixed', 'percentage'].includes(modelValue.type)" class="md:col-span-1">
        <AppInput
          id="rule-value"
          type="number"
          :label="modelValue.type === 'percentage' ? 'النسبة المئوية (%)' : 'المبلغ الثابت'"
          :model-value="modelValue.value"
          @update:model-value="updateField('value', $event)"
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <div v-if="modelValue.type === 'percentage'" class="md:col-span-1">
        <AppInput
          id="rule-percentage-of"
          label="يُحسب من كود القاعدة"
          :model-value="modelValue.percentage_of_code"
          @update:model-value="updateField('percentage_of_code', $event)"
          placeholder="مثلاً: BASIC"
          help-text="سيتم ضرب النسبة في قيمة الكود المكتوب هنا"
        />
      </div>

      <div v-if="modelValue.type === 'formula'" class="md:col-span-2">
        <AppTextarea
          id="rule-formula"
          label="المعادلة البرمجية (Formula)"
          :model-value="modelValue.formula_expression"
          @update:model-value="updateField('formula_expression', $event)"
          placeholder="مثلاً: (BASIC + HOUSING) * 0.08"
          rows="2"
          class="font-mono"
          dir="ltr"
        />
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="rule-mapping"
          label="الربط مع شجرة الحسابات (المقاصة)"
          :model-value="modelValue.account_mapping_key"
          @update:model-value="updateField('account_mapping_key', $event)"
          :options="accountMappingOptions"
          placeholder="اختر الحساب المحاسبي المرتبط"
        />
      </div>
    </div>

    <div>
      <AppTextarea
        id="rule-desc"
        label="وصف القاعدة"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="شرح إضافي..."
      />
    </div>

    <div class="flex items-center gap-3 pt-2">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-3 text-sm font-medium text-text-primary"
          >القاعدة نشطة وتدخل في الحسابات</span
        >
      </label>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
// إزالة apiClient لأنه لم يعد هناك حاجة له
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

// استدعاء المخزن الخاص بالتوجيه المحاسبي
import { useAccountMappingStore } from '@/modules/accounting/stores/accountMappingStore'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// ==========================================
// القوائم التفاعلية (الديناميكية) باستخدام Pinia Store
// ==========================================
const accountMappingStore = useAccountMappingStore()

// نستخدم computed لكي تتحدث القائمة المنسدلة تلقائياً إذا تغيرت بيانات الـ Store
const accountMappingOptions = computed(() => {
  // 1. تم إزالة الأقواس () لأن groupedMappings أصبحت computed في الـ Store
  const hrMappings = accountMappingStore.groupedMappings.hr || []

  return hrMappings.map((mapping) => ({
    id: mapping.key,
    // 2. استخدام account_code مباشرة لأن هذا هو شكل البيانات في الـ JSON المرسل من السيرفر
    name: mapping.account_code ? `${mapping.name} (${mapping.account_code})` : mapping.name,
  }))
})

onMounted(async () => {
  // للتحسين: نطلب البيانات من السيرفر فقط إذا لم تكن موجودة مسبقاً في الـ Store
  if (accountMappingStore.mappings.length === 0) {
    await accountMappingStore.fetchMappings()
  }
})

// ==========================================
// القوائم الثابتة (المنطقية)
// ==========================================
const categoryOptions = [
  { id: 'allowance', name: 'استحقاق (يُضاف للراتب)' },
  { id: 'deduction', name: 'استقطاع (يُخصم من الراتب)' },
  { id: 'company_contribution', name: 'مساهمة شركة (تكلفة إضافية)' },
]

const typeOptions = [
  { id: 'fixed', name: 'مبلغ ثابت' },
  { id: 'percentage', name: 'نسبة مئوية' },
  { id: 'formula', name: 'معادلة حسابية' },
  { id: 'input', name: 'مدخل يدوي (عند التحضير)' },
]
</script>
