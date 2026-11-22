<!--src\modules\hr\views\internships\components\TraineeApplicationEditor.vue-->
<template>
  <div class="space-y-5 animate-fadeIn">
    <div class="text-center space-y-1">
      <div
        class="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1 text-xs font-bold"
      >
        طلبك قيد الانتظار والمراجعة حالياً
      </div>
      <p class="text-[11px] text-slate-400 font-semibold mt-1">
        {{
          isEmployment
            ? 'يمكنك تعديل بياناتك المهنية أو تحديث السيرة الذاتية والصورة الشخصية طالما لم يتم البت في الطلب بعد.'
            : 'يمكنك تعديل بياناتك الأكاديمية أو إعادة التقاط صورتك الشخصية طالما لم يتم اعتماد الطلب بعد.'
        }}
      </p>
    </div>

    <!-- قسم الكاميرا والصورة الشخصية -->
    <div class="space-y-2">
      <label class="block text-xs font-bold text-slate-700 tracking-wide"
        >تحديث الصورة الشخصية الحية (اختياري)</label
      >
      <div
        class="relative w-full aspect-video bg-slate-950 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center group/cam"
      >
        <video
          v-show="isCameraOpen && !capturedImage"
          ref="videoRef"
          autoplay
          playsinline
          class="w-full h-full object-cover transform -scale-x-100"
        ></video>

        <!-- عرض الصورة الجديدة الملتقطة أو الصورة القديمة المخزنة مسبقاً في السيرفر -->
        <img
          v-if="capturedImage || application.photo_url"
          :src="capturedImage || application.photo_url"
          class="w-full h-full object-cover transform -scale-x-100 animate-scaleUp"
          alt="صورة المتقدم"
        />

        <div
          v-else-if="!isCameraOpen"
          class="text-center p-6 space-y-1 text-slate-400 text-xs font-bold"
        >
          لا توجد صورة شخصية مرفقة حالياً
        </div>
      </div>

      <div class="flex gap-2">
        <button
          v-if="!isCameraOpen"
          type="button"
          @click="startCamera"
          class="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all duration-200"
        >
          {{
            capturedImage || application.photo_url
              ? 'إعادة التقاط صورة جديدة'
              : 'فتح الكاميرا والتقاط صورة'
          }}
        </button>
        <button
          v-if="isCameraOpen"
          type="button"
          @click="capturePhoto"
          class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-2.5 text-xs font-bold shadow-md transition-all duration-200"
        >
          تجميد اللقطة الجديدة
        </button>
      </div>
    </div>

    <!-- شبكة مدخلات البيانات الشخصية -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 tracking-wide">الاسم بالكامل *</label>
        <input
          v-model="form.full_name"
          type="text"
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
        />
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 tracking-wide"
          >رقم الهاتف الجوال *</label
        >
        <input
          v-model="form.phone"
          type="tel"
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 shadow-sm text-right font-medium cursor-not-allowed"
          disabled
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 tracking-wide"
          >البريد الإلكتروني</label
        >
        <input
          v-model="form.email"
          type="email"
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-left"
        />
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 tracking-wide"
          >رقم الهوية الوطنية / الإقامة</label
        >
        <input
          v-model="form.national_id"
          type="text"
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-mono"
        />
      </div>
    </div>

    <!-- حقول طلب التوظيف -->
    <template v-if="isEmployment">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >المؤهل العلمي *</label
          >
          <input
            v-model="form.qualification"
            type="text"
            placeholder="مثال: بكالوريوس محاسبة / إدارة أعمال..."
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-600/5 transition-all duration-300 shadow-sm"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >سنوات الخبرة العملية</label
          >
          <input
            v-model.number="form.experience_years"
            type="number"
            min="0"
            max="60"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-600/5 transition-all duration-300 shadow-sm text-right font-mono"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-700 tracking-wide">
            تحديث السيرة الذاتية CV (PDF / Word / صورة - اختياري)
          </label>
          <a
            v-if="application.cv_url"
            :href="application.cv_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[11px] font-bold text-sky-600 hover:text-sky-500 underline"
          >
            عرض السيرة الذاتية الحالية 📄
          </a>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx,image/jpeg,image/png,image/jpg"
          @change="onCvSelected"
          class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 file:ml-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all shadow-sm"
        />
      </div>
    </template>

    <!-- حقول التدريب الأكاديمي -->
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >الجامعة أو المعهد الأكاديمي *</label
          >
          <input
            v-model="form.academic_institution"
            type="text"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >التخصص الأكاديمي الرئيسي *</label
          >
          <input
            v-model="form.academic_major"
            type="text"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >تاريخ بدء التدريب المقترح</label
          >
          <input
            v-model="form.internship_start_date"
            type="date"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-medium"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >تاريخ انتهاء التدريب المقترح</label
          >
          <input
            v-model="form.internship_end_date"
            type="date"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-medium"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 tracking-wide"
            >الساعات المطلوبة</label
          >
          <input
            v-model.number="form.required_training_hours"
            type="number"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-mono"
          />
        </div>
      </div>
    </template>

    <div class="space-y-1.5">
      <label class="block text-xs font-bold text-slate-700 tracking-wide">
        {{ isEmployment ? 'الوظيفة المرغوبة وملاحظات إضافية' : 'ملاحظات خاصة' }}
      </label>
      <textarea
        v-model="form.notes"
        rows="2"
        class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm resize-none"
      ></textarea>
    </div>

    <!-- زر تحديث البيانات وحفظ التغييرات -->
    <button
      @click="handleUpdateSubmit"
      :disabled="store.loading"
      class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span v-if="store.loading" class="flex items-center gap-2">
        <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        جاري تحديث سجل الطلب...
      </span>
      <span v-else>حفظ وتحديث التغييرات</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useToast } from 'vue-toastification'
import { useInternshipStore } from '../../../stores/internshipStore'

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
})

const store = useInternshipStore()
const toast = useToast()

const emit = defineEmits(['on-updated'])

const isEmployment = computed(() => props.application?.application_type === 'employment')

// التحكم بالعدسة والكاميرا اللحظية
const videoRef = ref(null)
const isCameraOpen = ref(false)
const capturedImage = ref(null)
const photoBlob = ref(null)
const cvFile = ref(null)

// ملء النموذج تلقائياً بالبيانات المسترجعة من الباك إند
const form = ref({
  full_name: props.application.full_name || '',
  phone: props.application.phone || '',
  email: props.application.email || '',
  national_id: props.application.national_id || '',
  academic_institution: props.application.academic_institution || '',
  academic_major: props.application.academic_major || '',
  internship_start_date: props.application.internship_start_date || '',
  internship_end_date: props.application.internship_end_date || '',
  required_training_hours: props.application.required_training_hours || null,
  qualification: props.application.qualification || '',
  experience_years: props.application.experience_years ?? null,
  notes: props.application.notes || '',
})

const onCvSelected = (e) => {
  cvFile.value = e.target.files?.[0] || null
}

const startCamera = async () => {
  capturedImage.value = null
  photoBlob.value = null
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      isCameraOpen.value = true
    }
  } catch {
    toast.error('لم نتمكن من تشغيل الكاميرا، يرجى تفعيل إذن الصلاحية.')
  }
}

const capturePhoto = () => {
  if (!videoRef.value) return
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  capturedImage.value = canvas.toDataURL('image/jpeg')
  canvas.toBlob(
    (blob) => {
      if (blob) photoBlob.value = blob
    },
    'image/jpeg',
    0.95,
  )
  stopCamera()
}

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach((track) => track.stop())
    videoRef.value.srcObject = null
  }
  isCameraOpen.value = false
}

/**
 * معالجة التحديث وضخ البيانات للـ API الخلفي عبر FormData لدعم تعديل الصورة والسيرة الذاتية
 */
const handleUpdateSubmit = async () => {
  if (!form.value.full_name.trim()) return toast.error('الاسم الكامل مطلوب.')

  if (isEmployment.value) {
    if (!form.value.qualification.trim()) return toast.error('المؤهل العلمي مطلوب.')
  } else {
    if (!form.value.academic_institution.trim()) return toast.error('المنشأة التعليمية مطلوبة.')
    if (!form.value.academic_major.trim()) return toast.error('التخصص الدراسي مطلوب.')
  }

  const formData = new FormData()
  if (photoBlob.value) {
    formData.append('photo', photoBlob.value, 'applicant_update_capture.jpg')
  }
  if (cvFile.value) {
    formData.append('cv', cvFile.value)
  }

  formData.append('full_name', form.value.full_name.trim())
  formData.append('phone', form.value.phone.trim())
  formData.append('email', form.value.email ? form.value.email.trim() : '')
  formData.append('national_id', form.value.national_id ? form.value.national_id.trim() : '')

  if (isEmployment.value) {
    formData.append('qualification', form.value.qualification.trim())
    if (
      form.value.experience_years !== null &&
      form.value.experience_years !== '' &&
      !isNaN(Number(form.value.experience_years))
    ) {
      formData.append('experience_years', String(form.value.experience_years))
    }
  } else {
    formData.append('academic_institution', form.value.academic_institution.trim())
    formData.append('academic_major', form.value.academic_major.trim())
    if (form.value.internship_start_date) {
      formData.append('internship_start_date', form.value.internship_start_date)
    }
    if (form.value.internship_end_date) {
      formData.append('internship_end_date', form.value.internship_end_date)
    }
    if (form.value.required_training_hours !== null && form.value.required_training_hours !== '') {
      formData.append('required_training_hours', String(form.value.required_training_hours))
    }
  }

  formData.append('notes', form.value.notes ? form.value.notes.trim() : '')

  try {
    const updatedData = await store.updatePublicApplication(props.application.id, formData)
    toast.success('تم تحديث بيانات طلبك بنجاح.')
    emit('on-updated', updatedData)
  } catch {
    toast.error(
      store.error ||
        'فشلت عملية التحديث، قد يكون المشرف قد اتخذ إجراءً في الطلب بالفعل وتوقفت صلاحية التعديل.',
    )
  }
}

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-scaleUp {
  animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
