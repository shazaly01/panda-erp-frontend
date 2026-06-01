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

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label
            for="document-file"
            class="block text-sm font-medium text-gray-700 dark:text-text-secondary"
          >
            ملف الوثيقة الفعلي (الحد الأقصى 50 ميجابايت)
          </label>

          <div class="flex space-x-2 space-x-reverse">
            <button
              v-if="!isScannerActive"
              type="button"
              @click="startScanner"
              class="inline-flex items-center px-3 py-1 text-xs font-medium text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded hover:bg-sky-100 transition-colors"
            >
              <svg
                class="w-3.5 h-3.5 ml-1"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
              استخدام الماسح الضوئي (كاميرا الأوراق)
            </button>
            <button
              v-else
              type="button"
              @click="stopScanner"
              class="inline-flex items-center px-3 py-1 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded hover:bg-rose-100 transition-colors"
            >
              إلغاء وتشغيل رفع الملفات التقليدي
            </button>
          </div>
        </div>

        <div
          v-if="isScannerActive"
          class="border border-sky-500/30 rounded-lg p-3 bg-gray-950 text-white overflow-hidden"
        >
          <div
            class="relative bg-black rounded overflow-hidden aspect-[4/3] max-w-md mx-auto flex items-center justify-center"
          >
            <video
              ref="videoRef"
              autoplay
              playsinline
              class="w-full h-full object-cover transform scale-x-1"
            ></video>

            <div
              class="absolute inset-6 border-2 border-dashed border-sky-400/60 rounded pointer-events-none flex items-center justify-center"
            >
              <span
                class="text-[10px] text-sky-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm"
                >ضع الوثيقة داخل النطاق الدليلي</span
              >
            </div>
          </div>

          <div class="mt-3 flex justify-center">
            <button
              type="button"
              @click="captureAndProcessDocument"
              class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded shadow transition-colors flex items-center"
            >
              سحب المستند ضوئياً وعزل الخلفية
            </button>
          </div>
        </div>

        <input
          v-show="!isScannerActive"
          id="document-file"
          ref="fileInput"
          type="file"
          @change="handleFileChange"
          :required="!form.file"
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-surface-ground dark:border-surface-border p-1"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
        />

        <div
          v-if="scannedPreviewUrl"
          class="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between"
        >
          <div class="flex items-center space-x-3 space-x-reverse">
            <img
              :src="scannedPreviewUrl"
              class="w-16 h-20 object-cover rounded border border-emerald-600/40 shadow-sm bg-white"
              alt="Scanned Document Preview"
            />
            <div>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                جاهز للأرشفة الفورية
              </p>
              <p class="text-[11px] text-text-muted mt-0.5 font-mono">
                مستند ممسوح رقمياً عالي التباين
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="clearScannedFile"
            class="text-xs text-rose-500 hover:text-rose-400 font-medium px-2 py-1"
          >
            حذف وإعادة المحاولة
          </button>
        </div>

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

  <canvas ref="canvasRef" class="hidden"></canvas>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
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
  document_type: '',
  name: '',
  file: null,
})

const form = ref(createFreshForm())
const fileError = ref(null)
const fileInput = ref(null)

// متغيرات التحكم في نظام البيئة الخاص بالماسح الضوئي الرقمي
const isScannerActive = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
const scannedPreviewUrl = ref(null)
let mediaStream = null

/**
 * تشغيل نظام الماسح الضوئي وجلب كاميرا البيئة الخلفية للأجهزة المحمولة بحذر
 */
const startScanner = async () => {
  fileError.value = null
  clearScannedFile()
  isScannerActive.value = true

  try {
    // محاولة طلب كاميرا مخصصة للأوراق مستهدفة الكاميرات الخلفية بدقة عالية
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    })

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
  } catch (err) {
    isScannerActive.value = false
    fileError.value = 'تعذر الوصول إلى كاميرا الجهاز، يرجى التحقق من صلاحيات المتصفح للأمان.'
  }
}

/**
 * إيقاف بث الماسح الضوئي وتحرير الكاميرا فوراً لمنع استهلاك موارد الجهاز
 */
const stopScanner = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }
  isScannerActive.value = false
}

/**
 * التقاط الإطار الثابت وتطبيق فلاتر المعالجة الرقمية لمحاكاة أجهزة الـ Scanner الحقيقية
 */
const captureAndProcessDocument = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  // مطابقة أبعاد الكانفاس الحقيقية مع البث الفعلي للفيديو عالي الجودة
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // رسم الإطار الخام
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  /**
   * تطبيق فلاتر الصور المحاسبية: تحويل لرمادي عالي التباين (Grayscale) تلوه رفع السطوع
   * والتباين الشديد لتنظيف الخلفية البيضاء وجعل النصوص حادة تماماً كالأوراق الرسمية
   */
  ctx.filter = 'grayscale(100%) contrast(150%) brightness(110%)'

  // إعادة رسم مصفوفة البكسلات بالفلاتر النشطة الجديدة لتوثيقها بالـ Blob
  ctx.drawImage(canvas, 0, 0)

  // استخراج الصورة الممسوحة وتوليد رابط محلي فوري للمعاينة السريعة
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        fileError.value = 'فشلت عملية تشفير ومعالجة بكسلات المستند.'
        return
      }

      // توليد مسمى افتراضي منظم يحمل وسم التاريخ الحالي للعام 2026 لحمايتها
      const timestamp = Math.floor(Date.now() / 1000)
      const fileName = `scanned_doc_${timestamp}.jpg`

      // بناء كائن ملف رسمي نقي متكامل الهوية لتقديمه لطبقة الخدمات مباشرة
      const scannedFile = new File([blob], fileName, { type: 'image/jpeg' })

      form.value.file = scannedFile
      scannedPreviewUrl.value = URL.createObjectURL(blob)

      // إيقاف الكاميرا تلقائياً بعد استلام الورقة بنجاح
      stopScanner()
    },
    'image/jpeg',
    0.85,
  )
}

/**
 * تصفير ملف السكانر المحفوظ وعزل روابط الذاكرة لعدم حدوث تسريب في المتصفح
 */
const clearScannedFile = () => {
  form.value.file = null
  if (scannedPreviewUrl.value) {
    URL.revokeObjectURL(scannedPreviewUrl.value)
    scannedPreviewUrl.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * دالة مسح وتصفير المدخلات المستدعاة برمجياً من المودال الأب بعد الرفع الناجح
 */
const resetForm = () => {
  form.value = createFreshForm()
  fileError.value = null
  stopScanner()
  clearScannedFile()
}

/**
 * التحقق الحذر والمطابقة الاستباقية لحجم الملف (Client-Side Protection)
 */
const handleFileChange = (event) => {
  // إلغاء معاينة المسح الضوئي فقط وتنظيف ذاكرة الروابط المحفوظة دون تصفير عنصر الـ input الفعلي
  if (scannedPreviewUrl.value) {
    URL.revokeObjectURL(scannedPreviewUrl.value)
    scannedPreviewUrl.value = null
  }

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
    fileError.value = 'الرجاء اختيار ملف الوثيقة أو سحبها ضوئياً أولاً.'
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
    file: form.value.file,
  }

  // بث الكائن النقي الجديد
  emit('submit', cleanPayload)
}

const handleCancel = () => {
  stopScanner()
  emit('cancel')
}

// تأمين إغلاق تدفق الكاميرا في حال خروج المستخدم فجأة من الكومبوننت لتجنب استمرار إضاءة الكاميرا
onBeforeUnmount(() => {
  stopScanner()
  if (scannedPreviewUrl.value) {
    URL.revokeObjectURL(scannedPreviewUrl.value)
  }
})

// تصدير دالة التصفير لتتمكن النافذة المنبثقة الأم من تصفير الحقول آلياً عند النجاح
defineExpose({ resetForm })
</script>
