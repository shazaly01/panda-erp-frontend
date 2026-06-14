<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 text-slate-800 flex flex-col justify-center items-center font-sans p-3 sm:p-6 antialiased relative overflow-hidden"
  >
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <svg
        class="absolute bottom-0 left-0 right-0 w-full min-w-[1200px] h-[340px] transition-all duration-1000"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          class="animate-wave-slow"
          fill="url(#wave-gradient-indigo)"
          opacity="0.3"
          d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
        <path
          class="animate-wave-fast"
          fill="url(#wave-gradient-emerald)"
          opacity="0.2"
          d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,218.7C672,203,768,149,864,122.7C960,96,1056,96,1152,117.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
        <defs>
          <linearGradient id="wave-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.15" />
            <stop offset="50%" stop-color="#818cf8" stop-opacity="0.05" />
            <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.3" />
          </linearGradient>
          <linearGradient id="wave-gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <div
      class="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none z-0"
    ></div>
    <div
      class="absolute inset-0 bg-[radial-gradient(#0f172a03_1px,transparent_1px)] [background-size:32px_32px] opacity-60 z-0"
    ></div>

    <div class="w-full max-w-2xl z-10 relative space-y-6 px-1 sm:px-0">
      <div class="flex flex-col items-center justify-center text-center space-y-3">
        <div class="relative group">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 rounded-full blur-md opacity-70"
          ></div>
          <img
            :src="brandingStore.logoMiniUrl"
            :alt="brandingStore.appName"
            class="logo-main mx-auto mb-2 relative z-10 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight text-slate-950 drop-shadow-sm">
            {{ appName || 'بوابة تسجيل الزوار الذاتية' }}
          </h1>
          <p
            class="text-xs md:text-sm text-slate-500 font-semibold tracking-wide mt-1.5 max-w-sm mx-auto leading-relaxed"
          >
            مرحباً بك، يرجى تسجيل بياناتك الشخصية لإصدار بطاقة الدخول الرقمية الفورية للمنشأة
          </p>
        </div>
      </div>

      <div
        class="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] relative transition-all duration-500"
      >
        <div class="absolute top-0 left-0 right-0 h-[3px] overflow-hidden rounded-t-3xl">
          <div
            class="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer"
          ></div>
        </div>

        <div v-if="!isRegistered" class="space-y-5 animate-fadeIn">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >الاسم بالكامل *</label
              >
              <input
                v-model="form.name"
                type="text"
                placeholder="أدخل اسمك الرباعى..."
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >رقم الهاتف الجوال *</label
              >
              <input
                v-model="form.phone"
                type="tel"
                placeholder="مثال: 09xxxxxxx"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-medium"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide">رقم الهوية</label>
              <input
                v-model="form.national_id"
                type="text"
                placeholder="أدخل رقم وثيقتك الشخصية..."
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >الشركة أو الجهة القادم منها</label
              >
              <input
                v-model="form.company_from"
                type="text"
                placeholder="اسم جهة عملك إن وُجدت..."
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
            </div>
          </div>

          <div class="space-y-1.5 relative">
            <label class="block text-xs font-bold text-slate-700 tracking-wide"
              >الشخص المراد مقابلته (المستضيف) *</label
            >
            <div class="relative">
              <input
                v-model="hostSearchQuery"
                type="text"
                placeholder="اكتب 3 أحرف من اسم الموظف للبحث التلقائي..."
                @input="onHostSearch"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
              <span
                v-if="loadingHosts"
                class="absolute left-4 top-4 flex h-4 w-4 items-center justify-center"
              >
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
            </div>

            <ul
              v-if="hosts.length > 0 && showDropdown"
              class="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.08)] mt-1.5 max-h-44 overflow-y-auto divide-y divide-slate-100"
            >
              <li
                v-for="host in hosts"
                :key="host.id"
                @click="selectHost(host)"
                class="p-3.5 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center transition-colors duration-150"
              >
                <span class="font-bold text-slate-800 text-sm">{{ host.name }}</span>
                <span
                  v-if="host.department"
                  class="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2.5 py-1 rounded-md border border-indigo-100"
                >
                  {{ host.department.name }}
                </span>
              </li>
            </ul>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 tracking-wide"
              >سبب أو غرض الزيارة</label
            >
            <textarea
              v-model="form.purpose"
              rows="3"
              placeholder="اكتب سبب الزيارة باختصار للموافقة عليها..."
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm resize-none"
            ></textarea>
          </div>

          <button
            @click="handleSubmit"
            :disabled="isSaving"
            class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-4 text-sm font-bold shadow-[0_10px_25px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-5 flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="flex items-center gap-2">
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
              جاري توليد وإصدار بطاقة الدخول...
            </span>
            <span v-else>إصدار بطاقة الدخول الذكية</span>
          </button>
        </div>

        <div v-else class="text-center space-y-6 animate-scaleUp pb-2">
          <div
            class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm"
          >
            <svg
              class="h-6 w-6 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 class="text-2xl font-black text-slate-900">تم إصدار بطاقة الدخول بنجاح!</h2>
            <p class="text-xs text-slate-500 font-medium mt-1">
              يرجى حفظ البطاقة أدناه أو مشاركتها مباشرة لإبرازها لمسؤول الأمن عند البوابة
            </p>
          </div>

          <div
            ref="passCardRef"
            class="bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60 shadow-inner relative max-w-sm mx-auto overflow-hidden group"
          >
            <div
              class="bg-white p-4 rounded-xl w-fit mx-auto shadow-sm relative z-10 border border-slate-200/40"
            >
              <qrcode-vue
                :value="qrToken"
                :size="180"
                level="M"
                background="#ffffff"
                foreground="#0f172a"
              />
            </div>

            <div
              class="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent my-5"
            ></div>

            <div class="space-y-3.5 text-right text-xs">
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">اسم الزائـــر:</span>
                <span class="font-extrabold text-slate-800 text-sm tracking-wide">{{
                  passData.name
                }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">رقم الجــــوال:</span>
                <span class="font-mono text-slate-700 font-bold tracking-wide">{{
                  passData.phone
                }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">تاريخ الزيارة:</span>
                <span class="font-mono text-indigo-600 font-black tracking-wide">{{
                  passData.visit_date
                }}</span>
              </div>
              <div
                v-if="passData.employee"
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">المستضيــــف:</span>
                <span class="text-slate-800 font-extrabold">{{ passData.employee.name }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
            <button
              @click="sharePassCard"
              :disabled="isProcessingImage"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl py-3 px-4 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {{ isProcessingImage ? 'جاري التحضير...' : 'مشاركة عبر الواتساب' }}
            </button>

            <button
              @click="downloadPassCard"
              :disabled="isProcessingImage"
              class="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-4 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              تحميل كصورة
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas'
import { useBrandingStore } from '@/stores/brandingStore'
import { visitorService } from '../../services/visitor.service'

const brandingStore = useBrandingStore()
const toast = useToast()

const { appName, logoFullUrl } = storeToRefs(brandingStore)

onMounted(() => {
  if (!brandingStore.isLoaded) {
    brandingStore.fetchBranding()
  }
})

const isRegistered = ref(false)
const isSaving = ref(false)
const isProcessingImage = ref(false)
const qrToken = ref('')
const passData = ref(null)
const passCardRef = ref(null)

const form = ref({
  name: '',
  phone: '',
  national_id: '',
  company_from: '',
  purpose: '',
  employee_id: null,
  visit_date: new Date().toISOString().substring(0, 10),
})

const hostSearchQuery = ref('')
const hosts = ref([])
const showDropdown = ref(false)
const loadingHosts = ref(false)
let debounceTimeout = null

const onHostSearch = () => {
  clearTimeout(debounceTimeout)
  const search = hostSearchQuery.value.trim()

  if (!search || search.length < 3) {
    hosts.value = []
    showDropdown.value = false
    return
  }

  loadingHosts.value = true
  debounceTimeout = setTimeout(async () => {
    try {
      const response = await visitorService.searchHosts(search)
      hosts.value = response.data.data || response.data
      showDropdown.value = true
    } catch (error) {
      console.error('Failed to search hosts', error)
    } finally {
      loadingHosts.value = false
    }
  }, 400)
}

const selectHost = (host) => {
  hostSearchQuery.value = host.name
  form.value.employee_id = host.id
  showDropdown.value = false
  hosts.value = []
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) return toast.error('يرجى إدخال اسمك بالكامل.')
  if (!form.value.phone.trim()) return toast.error('يرجى إدخال رقم هاتفك الجوال.')
  if (!form.value.employee_id) return toast.error('يرجى تحديد الموظف المستضيف المراد مقابلته.')

  isSaving.value = true
  try {
    const response = await visitorService.publicRegister(form.value)
    const result = response.data.data

    qrToken.value = `${window.location.origin}/verify-visitor/${result.qr_token}`
    passData.value = result
    isRegistered.value = true

    toast.success('تم إصدار بطاقة الدخول بنجاح، مرحباً بك!')
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.',
    )
  } finally {
    isSaving.value = false
  }
}

// 📥 دالة التقاط الكارت وتحميله كصورة PNG على الجهاز
const downloadPassCard = async () => {
  if (!passCardRef.value) return
  isProcessingImage.value = true

  try {
    const canvas = await html2canvas(passCardRef.value, {
      scale: 2, // مضاعفة الجودة لمنع التشويش على شاشات الموبايل
      useCORS: true,
      backgroundColor: null,
    })

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `Visitor-Pass-${passData.value?.name || 'Gate'}.png`
    link.click()

    toast.success('تم تحميل بطاقة الدخول إلى جهازك!')
  } catch (error) {
    console.error('تنفيذ التحميل فشل', error)
    toast.error('لم نتمكن من التقاط الصورة، يرجى حفظ لقطة الشاشة يدوياً.')
  } finally {
    isProcessingImage.value = false
  }
}

// 📲 دالة مشاركة الكارت كملف صورة أصلي عبر تطبيقات الهاتف (الواتساب وغيره)
const sharePassCard = async () => {
  if (!passCardRef.value) return
  isProcessingImage.value = true

  try {
    const canvas = await html2canvas(passCardRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    })

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('حدث خطأ أثناء معالجة الصورة.')
        return
      }

      const fileName = `Pass-${passData.value?.name || 'Visitor'}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      // التحقق من دعم المتصفح لميزة مشاركة الملفات الأصيلة (متاحة في أغلب الهواتف الذكية الحديثة)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'بطاقة الدخول الرقمية',
          text: `مرحباً، هذه هي بطاقة الدخول الرقمية الخاصة بالزائر: ${passData.value?.name || ''}`,
        })
      } else {
        // Fallback في حال كان المتصفح لا يدعم مشاركة الملفات (مثل بعض متصفحات الكمبيوتر المكتبي)
        downloadPassCard()
      }
    }, 'image/png')
  } catch (error) {
    console.error('فشلت مشاركة الملف', error)
    // تحويل تلقائي للتحميل المباشر كخيار بديل آمن
    downloadPassCard()
  } finally {
    isProcessingImage.value = false
  }
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 3.5s infinite linear;
}

/* 🌊 أنيميشن تحريك الأمواج الشفافة في الخلفية بسلاسة تامة */
@keyframes wave {
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.85);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}
.animate-wave-slow {
  animation: wave 22s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
}
.animate-wave-fast {
  animation: wave 14s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
}

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

ul::-webkit-scrollbar {
  width: 5px;
}
ul::-webkit-scrollbar-track {
  background: #f8fafc;
}
ul::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 99px;
}
ul::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}
</style>
