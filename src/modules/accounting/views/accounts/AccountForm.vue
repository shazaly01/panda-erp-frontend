<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="relative">
          <AppInput
            id="account-code"
            label="كود الحساب"
            v-model="form.code"
            placeholder="مثال: 101001"
            dir="ltr"
            required
            :disabled="isGeneratingCode"
          />
          <div v-if="isGeneratingCode" class="absolute left-3 top-9">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
          <p v-if="!form.id" class="text-xs text-text-muted mt-1">
            سيتم اقتراح الكود تلقائياً عند اختيار الحساب الأب.
          </p>
        </div>

        <AppInput
          id="account-name"
          label="اسم الحساب"
          v-model="form.name"
          placeholder="مثال: ذمم الموظفين / مصروفات الكهرباء"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="account-nature"
          label="طبيعة الحساب"
          v-model="form.nature"
          :options="natureOptions"
          placeholder="اختر الطبيعة (مدين/دائن)"
          required
        />

        <AppDropdown
          id="account-type"
          label="تصنيف الحساب"
          v-model="form.type"
          :options="accountTypeOptions"
          placeholder="أصول، خصوم، مصروفات..."
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppDropdown
          id="parent-account"
          label="الحساب الرئيسي (الأب)"
          v-model="form.parent_id"
          :options="filteredParentAccounts"
          placeholder="اختر الحساب الأب (اختياري)"
          option-label="dropdownName"
          option-value="id"
          @update:model-value="handleParentChange"
        />

        <AppDropdown
          id="account-currency"
          label="العملة المرتبطة"
          v-model="form.currency_id"
          :options="currencies"
          placeholder="اختر العملة"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        <div class="flex items-center">
          <input
            id="is-transactional"
            type="checkbox"
            v-model="form.is_transactional"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="is-transactional"
            class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
          >
            حساب حركي (يقبل القيود المحاسبية مباشرة)
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="requires-cost-center"
            type="checkbox"
            v-model="form.requires_cost_center"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="requires-cost-center"
            class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
          >
            يتطلب ربط بمركز تكلفة
          </label>
        </div>
      </div>

      <AppTextarea
        id="account-notes"
        label="ملاحظات الحساب (اختياري)"
        v-model="form.notes"
        placeholder="ادخل تفاصيل إضافية حول طبيعة عمل هذا الحساب"
        rows="3"
      />
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving || isGeneratingCode">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'حفظ التعديلات' : 'حفظ الحساب' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

// 1. استدعاء الستور لكي نستخدم الدالة الذكية
import { useAccountStore } from '@/modules/accounting/stores/accountStore'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  currencies: { type: Array, default: () => [] },
  parentAccounts: { type: Array, default: () => [] },
  accountTypeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

const accountStore = useAccountStore()
const isGeneratingCode = ref(false)

const natureOptions = [
  { id: 'debit', name: 'مدين (Debit)' },
  { id: 'credit', name: 'دائن (Credit)' },
]

const createFreshForm = () => ({
  id: null,
  code: '',
  name: '',
  nature: 'debit',
  type: '',
  currency_id: '',
  parent_id: '',
  is_transactional: true,
  requires_cost_center: false,
  notes: '',
})

const form = ref(createFreshForm())

// فلترة الآباء (منع الحساب من اختيار نفسه كأب عند التعديل)
const filteredParentAccounts = computed(() => {
  if (!form.value.id) return props.parentAccounts
  return props.parentAccounts.filter((a) => a.id !== form.value.id)
})

// داخل AccountForm.vue في جزء الـ script setup

watch(
  () => props.initialData,
  async (newData) => {
    if (newData) {
      // تعبئة بيانات الفورم
      form.value = {
        id: newData.id || null,
        code: newData.code || '',
        name: newData.name || '',
        nature: newData.nature?.value || newData.nature || 'debit',
        type: newData.type?.value || newData.type || '',
        currency_id: newData.currency_id || '',
        parent_id: newData.parent_id || '',
        is_transactional: newData.id ? Boolean(newData.is_transactional) : true,
        requires_cost_center: Boolean(newData.requires_cost_center),
        notes: newData.notes || newData.description || '',
      }

      // --- حل مشكلة "أول مرة" ---
      // ننتظر دورة تحديث واحدة للتأكد من أن المكونات جاهزة
      await nextTick()

      if (!form.value.id && form.value.parent_id) {
        // نستدعي الاقتراح مباشرة إذا كان هناك أب ولا يوجد معرف للحساب (إضافة جديد)
        await fetchSuggestedCode(form.value.parent_id)
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

// فصلنا منطق جلب الكود في دالة مستقلة لسهولة استدعائها
const fetchSuggestedCode = async (parentId) => {
  if (form.value.id || !parentId) return

  isGeneratingCode.value = true
  try {
    const suggestedCode = await accountStore.suggestAccountCode(parentId)
    if (suggestedCode) {
      form.value.code = suggestedCode
    }
  } catch (error) {
    console.error('فشل اقتراح الكود', error)
  } finally {
    isGeneratingCode.value = false
  }
}

// ==========================================
// الدالة السحرية: جلب الكود عند تغيير الأب
// ==========================================
const handleParentChange = async (newParentId) => {
  // لا نقوم بتغيير الكود إذا كنا في وضع التعديل (لكي لا نمسح كود حساب موجود)
  if (form.value.id) return

  if (!newParentId) {
    form.value.code = '' // إذا مسح الأب، نمسح الكود
    return
  }

  isGeneratingCode.value = true
  try {
    const suggestedCode = await accountStore.suggestAccountCode(newParentId)
    if (suggestedCode) {
      form.value.code = suggestedCode
    }
  } catch (error) {
    console.error('فشل اقتراح الكود', error)
  } finally {
    isGeneratingCode.value = false
  }
}

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
