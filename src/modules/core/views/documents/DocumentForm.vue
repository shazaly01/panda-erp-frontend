<!--src\modules\core\views\documents\DocumentForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" class="font-sans">
    <div class="space-y-5 bg-surface-ground p-5 rounded-lg border border-surface-border">
      <h4
        class="text-md font-semibold text-text-secondary border-b border-surface-border pb-2 flex items-center"
      >
        <svg
          class="w-5 h-5 ml-2 text-primary"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        أرشفة مستند جديد بالنظام
      </h4>

      <AppInput
        id="document-name"
        label="اسم الفهرسة للمستند"
        v-model="form.name"
        placeholder="مثال: جواز السفر المحدث 2026، عقد عمل الموظف..."
        required
      />

      <div>
        <label
          for="document-type"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          تصنيف نوع المستند <span class="text-rose-500">*</span>
        </label>
        <select
          id="document-type"
          v-model="form.document_type"
          required
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 bg-gray-50 dark:text-gray-300 focus:ring-primary focus:border-primary dark:bg-surface-ground dark:border-surface-border"
        >
          <option value="" disabled selected>-- يرجى اختيار تصنيف الملف للأرشفة --</option>

          <template v-if="targetType === 'employee' || targetType === 'contract'">
            <option value="employee_photo">الصورة الشخصية للموظف</option>
            <option value="employee_contract">عقد العمل الرسمي</option>
            <option value="national_id">الهوية الوطنية / الإقامة</option>
            <option value="passport">جواز السفر</option>
            <option value="hr_certificate">شهادة ثبوتية / مؤهل علمي</option>
          </template>

          <template v-else>
            <option value="company_license">الرخصة التجارية / السجل</option>
            <option value="invoice">فاتورة مالية</option>
            <option value="receipt">إيصال استلام</option>
            <option value="payment_voucher">سند صرف رسمي</option>
          </template>

          <option value="other">مستند إداري عام آخر</option>
        </select>
      </div>

      <div>
        <label
          for="document-file"
          class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
        >
          ملف الوثيقة الفعلي (الحد الأقصى 50 ميجابايت)
        </label>
        <input
          id="document-file"
          ref="fileInput"
          type="file"
          @change="handleFileChange"
          required
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-surface-ground dark:border-surface-border p-1"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
        />

        <p v-if="fileError || serverError" class="text-sm text-rose-500 mt-1 font-medium">
          {{ fileError || serverError }}
        </p>
      </div>
    </div>

    <div v-if="isSaving && uploadProgress > 0" class="mt-4 mb-4">
      <div class="flex justify-between mb-1">
        <span class="text-xs font-medium text-blue-600 dark:text-sky-400"
          >جاري تشفير وبث الملف للأرشيف السحابي...</span
        >
        <span class="text-xs font-medium text-blue-600 dark:text-sky-400"
          >{{ uploadProgress }}%</span
        >
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-150"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <div class="mt-6 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel">
        إلغاء المعاملة
      </AppButton>
      <AppButton type="submit" :disabled="isSaving || !form.file || !form.document_type">
        <span v-if="isSaving">جاري الحفظ والتدقيق...</span>
        <span v-else>تأكيد الرفع والأرشفة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  targetId: {
    type: [String, Number],
    required: true,
  },
  targetType: {
    type: String,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  uploadProgress: { type: Number, default: 0 },
  serverError: { type: String, default: null },
})

const emit = defineEmits(['submit', 'cancel'])

/**
 * دالة توليد كائن البيانات طازجاً مدمجاً به الـ Enum الافتراضي
 */
const createFreshForm = () => ({
  target_id: props.targetId,
  target_type: props.targetType,
  document_type: '', // حقن القيمة الابتدائية للـ Enum لضمان الـ Reactive Binding
  name: '',
  file: null,
})

const form = ref(createFreshForm())
const fileError = ref(null)
const fileInput = ref(null)

/**
 * دالة مسح وتصفير المدخلات المستدعاة برمجياً من المودال الأب بعد الرفع الناجح
 */
const resetForm = () => {
  form.value = createFreshForm()
  fileError.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * التحقق الحذر والمطابقة الاستباقية لحجم الملف (Client-Side Protection)
 * تم ضبط الحجم على 50 ميجابايت ليتوافق تماماً مع قواعد الباك-إند الصارمة
 */
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) {
    form.value.file = null
    return
  }

  const maxSize = 50 * 1024 * 1024 // 50 Megabytes
  if (file.size > maxSize) {
    fileError.value = 'حجم الملف يتجاوز الحد المسموح به (50 ميجابايت). يرجى ضغطه وإعادة المحاولة.'
    form.value.file = null
    event.target.value = ''
    return
  }

  fileError.value = null
  form.value.file = file
}

const handleSubmit = () => {
  if (!form.value.file) {
    fileError.value = 'الرجاء اختيار ملف الوثيقة أولاً.'
    return
  }
  if (!form.value.document_type) {
    fileError.value = 'الرجاء اختيار تصنيف نوع المستند لحمايته وفهرسته.'
    return
  }

  // استخلاص البيانات وفك التغليف التفاعلي لضمان بث قيم نصية صريحة وخام للـ Store والـ Service
  const cleanPayload = {
    name: String(form.value.name).trim(),
    document_type: String(form.value.document_type).trim(),
    target_type: String(form.value.target_type).trim(),
    target_id: Number(form.value.target_id),
    file: form.value.file, // تمرير كائن الملف الثنائي الخام كما هو
  }

  // بث الكائن النقي الجديد
  emit('submit', cleanPayload)
}

const handleCancel = () => {
  emit('cancel')
}

// تصدير دالة التصفير لتتمكن النافذة المنبثقة الأم من تصفير الحقول آلياً عند النجاح
defineExpose({ resetForm })
</script>
