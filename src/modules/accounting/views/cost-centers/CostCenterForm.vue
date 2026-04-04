<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="cost-center-code"
          label="كود مركز التكلفة (التاق)"
          v-model="form.code"
          placeholder="مثال: 101001"
          required
        />

        <AppInput
          id="cost-center-name"
          label="اسم مركز التكلفة"
          v-model="form.name"
          placeholder="مثال: فرع الرياض / مشروع البرج"
          required
        />
      </div>

      <div class="grid grid-cols-1 gap-5">
        <AppDropdown
          id="parent-id"
          label="المركز الرئيسي (الأب)"
          v-model="form.parent_id"
          :options="parentCostCenters"
          placeholder="بدون مركز رئيسي (اختياري - يجعله تاق رئيسي)"
          option-label="dropdownName"
          option-value="id"
        />
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 p-4 rounded-xl border border-surface-border bg-surface-section/30"
      >
        <div class="flex items-center">
          <input
            id="is-branch"
            type="checkbox"
            v-model="form.is_branch"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="is-branch"
            class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
          >
            هذا المركز يمثل فرعاً مستقلاً (له فواتير خاصة)
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="is-active"
            type="checkbox"
            v-model="form.is_active"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="is-active"
            class="mr-2 text-sm font-medium text-text-primary select-none cursor-pointer"
          >
            مركز تكلفة نشط (يظهر في السندات والعمليات)
          </label>
        </div>
      </div>

      <div v-if="form.is_branch" class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
        <AppInput
          id="code-prefix"
          label="بادئة الأكواد (Prefix)"
          v-model="form.code_prefix"
          placeholder="مثال: RY, KRT..."
          required
        />
      </div>

      <AppTextarea
        id="cost-center-notes"
        label="ملاحظات إضافية (اختياري)"
        v-model="form.notes"
        placeholder="ادخل أي ملاحظات تتعلق بهذا المركز"
        rows="3"
      />
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث البيانات' : 'حفظ مركز التكلفة' }}</span>
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
  parentCostCenters: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])

// تم حذف typeOptions لأننا لم نعد بحاجة لها

const createFreshForm = () => ({
  id: null,
  code: '',
  name: '',
  // تم حذف حقل type
  parent_id: '',
  is_active: true,
  is_branch: false,
  code_prefix: '',
  notes: '',
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
        // تم حذف حقل type
        parent_id: newData.parent_id || '',
        is_active: Boolean(newData.is_active),
        is_branch: Boolean(newData.is_branch),
        code_prefix: newData.code_prefix || '',
        notes: newData.notes || '',
      }
    } else {
      form.value = createFreshForm()
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
