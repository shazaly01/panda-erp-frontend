<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div
        v-if="form.id"
        class="flex items-center justify-between p-3 rounded-lg bg-surface-section border border-surface-border mb-2"
      >
        <span class="text-sm font-bold text-text-secondary">كود مركز التكلفة:</span>
        <span class="text-sm font-mono font-bold text-primary">{{ form.code }}</span>
      </div>

      <div
        v-else
        class="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex items-start space-x-3 space-x-reverse mb-2"
      >
        <svg
          class="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
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
        <div>
          <h4 class="text-sm font-bold text-blue-800">ترقيم هرمي تلقائي</h4>
          <p class="text-xs text-blue-600 mt-1">
            سيقوم النظام بتوليد كود المركز آلياً (1, 1.1, 1.1.1...) بناءً على ترتيبه في الشجرة فور
            الحفظ.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AppInput
          id="cost-center-name"
          label="اسم مركز التكلفة"
          v-model="form.name"
          placeholder="مثال: فرع الرياض / مشروع البرج"
          required
        />

        <AppDropdown
          id="parent-id"
          label="المركز الرئيسي (الأب)"
          v-model="form.parent_id"
          :options="parentCostCenters"
          placeholder="بدون مركز رئيسي (اختياري - يجعله مركزاً رئيسياً)"
          option-label="name"
          option-value="id"
          :filter="true"
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
            هذا المركز يمثل فرعاً مستقلاً
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
            مركز تكلفة نشط (يظهر في العمليات)
          </label>
        </div>
      </div>

      <div v-if="form.is_branch" class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
        <AppInput
          id="code-prefix"
          label="بادئة الأكواد (Prefix)"
          v-model="form.code_prefix"
          placeholder="مثال: RY, KRT..."
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

const createFreshForm = () => ({
  id: null,
  code: '', // يُستخدم للعرض فقط في وضع التعديل
  name: '',
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
        code: newData.code, // نحفظ الكود هنا فقط لعرضه في الـ template
        name: newData.name,
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
  // تصفية البيانات قبل الإرسال (نزع الكود لأن الـ Request سيمنعه)
  const { code, ...payload } = form.value
  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
