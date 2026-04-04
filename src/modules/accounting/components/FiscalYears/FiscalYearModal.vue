<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="isEditMode ? 'تعديل السنة المالية' : 'إضافة سنة مالية جديدة'"
  >
    <form @submit.prevent="save">
      <div
        v-if="error"
        class="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200"
      >
        {{ error }}
      </div>

      <div class="space-y-4">
        <AppInput
          id="name"
          label="اسم السنة (مثال: 2025)"
          v-model="form.name"
          placeholder="أدخل وصف السنة المالية"
          required
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInput
            id="start_date"
            type="date"
            label="من تاريخ"
            v-model="form.start_date"
            required
          />

          <AppInput id="end_date" type="date" label="إلى تاريخ" v-model="form.end_date" required />
        </div>

        <div v-if="isEditMode">
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            حالة السنة
          </label>
          <select
            v-model="form.status"
            class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary py-2 px-3"
          >
            <option value="open">مفتوحة (Open)</option>
            <option value="closed">مغلقة (Closed)</option>
          </select>
        </div>
      </div>

      <div class="mt-8 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close" :disabled="loading">
          إلغاء
        </AppButton>

        <AppButton type="submit" variant="primary" :disabled="loading">
          <span v-if="loading">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إنشاء السنة' }}</span>
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useFiscalYearStore } from '@/modules/accounting/stores/fiscalYearStore'

// استيراد مكوناتك الجاهزة
import AppDialog from '@/components/ui/AppDialog.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

// Props & Emits
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  item: { type: Object, default: null }, // إذا كان null فهذا يعني إضافة جديد
})

const emit = defineEmits(['update:modelValue', 'saved'])

// Store
const store = useFiscalYearStore()

// State
const loading = ref(false)
const error = ref(null)

// النموذج المبدئي
const initialForm = {
  name: '',
  start_date: '',
  end_date: '',
  status: 'open',
}

const form = reactive({ ...initialForm })

// Computed
const isEditMode = computed(() => !!props.item)

// Watchers
// لمراقبة فتح المودال وتعبئة البيانات عند التعديل
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      error.value = null
      if (props.item) {
        // وضع التعديل: نسخ البيانات
        Object.assign(form, props.item)
      } else {
        // وضع الإضافة: تصفير النموذج
        Object.assign(form, initialForm)

        // تحسين: اقتراح تواريخ تلقائية للسنة الحالية
        const currentYear = new Date().getFullYear()
        form.name = String(currentYear)
        form.start_date = `${currentYear}-01-01`
        form.end_date = `${currentYear}-12-31`
      }
    }
  },
)

// Actions
const close = () => {
  emit('update:modelValue', false)
}

const save = async () => {
  loading.value = true
  error.value = null

  try {
    if (isEditMode.value) {
      await store.updateFiscalYear(props.item.id, form)
    } else {
      await store.createFiscalYear(form)
    }

    emit('saved') // تنبيه الأب لتحديث الجدول
    close() // إغلاق المودال
  } catch (err) {
    console.error(err)
    // عرض رسالة الخطأ القادمة من الباك إند أو رسالة عامة
    error.value = err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات'
  } finally {
    loading.value = false
  }
}
</script>
