<template>
  <div class="space-y-6 animate-scaleUp">
    <!-- عنوان التنبيه الفوقي -->
    <div class="text-center space-y-1">
      <div
        class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 text-xs font-black"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        تم قبول طلب التدريب رسمياً
      </div>
      <p class="text-xs text-slate-400 font-semibold mt-1">
        يرجى تصوير الشاشة (Screenshot) أو تحميل البطاقة الرقمية لإبرازها عند بوابة الدخول.
      </p>
    </div>

    <!-- بطاقة الهوية الرقمية القابلة للتصوير والتحميل -->
    <div
      ref="passBadgeRef"
      class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] relative max-w-sm mx-auto overflow-hidden text-white group"
    >
      <!-- تأثيرات الإضاءة الخلفية والـ Glow اللطيف للمظهر الاحترافي -->
      <div
        class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-70"
      ></div>
      <div
        class="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-70"
      ></div>

      <!-- ترويسة البطاقة -->
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
        <div class="text-right">
          <h3 class="text-sm font-black tracking-wide text-slate-100">بطاقة دخول متدرب</h3>
          <p class="text-[10px] text-indigo-400 font-bold tracking-wider mt-0.5 font-mono">
            PANDA ERP GATEPASS
          </p>
        </div>
        <div
          class="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      </div>

      <!-- الصورة الشخصية مع الـ QR Code جنباً إلى جنب -->
      <div class="grid grid-cols-2 gap-4 items-center mb-5">
        <!-- مربع الصورة الشخصية الحية المعزولة -->
        <div class="space-y-1.5 text-center">
          <div
            class="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-slate-800 shadow-md bg-slate-900 relative"
          >
            <img
              v-if="application.photo_url"
              :src="application.photo_url"
              class="w-full h-full object-cover transform -scale-x-100"
              alt="صورة المتدرب"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-600">
              لا توجد صورة
            </div>
          </div>
          <p class="text-[10px] text-slate-500 font-bold">الصورة الشخصية الحية</p>
        </div>

        <!-- مربع الـ QR Code البوابي المولد ديناميكياً -->
        <div class="space-y-1.5 text-center">
          <div
            class="w-28 h-28 mx-auto bg-white rounded-2xl p-2 shadow-md flex items-center justify-center border border-slate-800 transition-transform duration-300 group-hover:scale-[1.02]"
          >
            <!-- توليد الـ QR Code اعتماداً على رابط خدمة التوليد المباشرة الفعالة والمستقرة بناءً على كود الباركود -->
            <img
              v-if="application.barcode"
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${application.barcode}&color=0f172a`"
              class="w-full h-full object-contain select-none"
              alt="بوابة الأمن QR"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-400 text-[10px]"
            >
              جاري التوليد...
            </div>
          </div>
          <p class="text-[10px] text-indigo-400 font-bold font-mono tracking-wider">
            {{ application.barcode }}
          </p>
        </div>
      </div>

      <!-- بيانات المتدرب الأساسية المنظمة باللغة العربية -->
      <div class="space-y-2 text-right text-xs">
        <div
          class="bg-slate-900/60 border border-slate-800/40 px-3 py-2 rounded-xl flex justify-between items-center"
        >
          <span class="text-slate-500 font-bold">الاسم الكامل:</span>
          <span class="font-black text-slate-200 tracking-wide text-sm">{{
            application.full_name
          }}</span>
        </div>
        <div
          class="bg-slate-900/60 border border-slate-800/40 px-3 py-2 rounded-xl flex justify-between items-center"
        >
          <span class="text-slate-500 font-bold">المنشأة التعليمية:</span>
          <span class="font-extrabold text-slate-300">{{ application.academic_institution }}</span>
        </div>
        <div
          class="bg-slate-900/60 border border-slate-800/40 px-3 py-2 rounded-xl flex justify-between items-center"
        >
          <span class="text-slate-500 font-bold">التخصص الأكاديمي:</span>
          <span class="font-black text-indigo-400">{{ application.academic_major }}</span>
        </div>
        <div
          class="bg-slate-900/60 border border-slate-800/40 px-3 py-2 rounded-xl flex justify-between items-center"
        >
          <span class="text-slate-500 font-bold">فترة التدريب:</span>
          <span class="font-mono text-emerald-400 font-bold text-[11px] tracking-wide">
            {{ application.internship_start_date }} / {{ application.internship_end_date }}
          </span>
        </div>
      </div>

      <!-- تذييل أمني للبطاقة -->
      <div class="mt-4 pt-3 border-t border-slate-900 text-center">
        <p class="text-[9px] text-slate-600 font-bold tracking-widest">
          SECURE GATEPASS SYSTEM © 2026
        </p>
      </div>
    </div>

    <!-- أزرار الإجراءات للتحميل والمشاركة للتحكم الفوري -->
    <div class="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
      <button
        @click="downloadBadgeImage"
        :disabled="isProcessing"
        class="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl py-3 px-4 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-slate-400"
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
        {{ isProcessing ? 'جاري المعالجة...' : 'تحميل البطاقة الرقمية' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { toPng } from 'html-to-image'

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
})

const toast = useToast()
const passBadgeRef = ref(null)
const isProcessing = ref(false)

/**
 * دالة التقاط البطاقة وتحميلها كصورة PNG مع الحفاظ على سلامة الخط العربي والـ QR وحمايتها من القص
 */
const downloadBadgeImage = async () => {
  if (!passBadgeRef.value) return
  isProcessing.value = true

  try {
    // 🌟 حساب الأبعاد الحقيقية لكارت الـ QR لمنع القص من الأطراف
    const width = passBadgeRef.value.offsetWidth
    const height = passBadgeRef.value.offsetHeight

    const dataUrl = await toPng(passBadgeRef.value, {
      quality: 0.98,
      pixelRatio: 3, // رفع الدقة لـ 3 ليكون الـ QR Code حاداً وسهل القراءة عند كشك الأمن
      width: width,
      height: height,
      style: {
        margin: '0',
        transform: 'none',
        borderRadius: '24px', // المحافظة على انحناء الحواف في الصورة المستخرجة
      },
    })

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `InternBadge-${props.application.full_name || 'GatePass'}.png`
    link.click()

    toast.success('تم تحميل بطاقة الدخول الأمنية بنجاح.')
  } catch (error) {
    console.error('Badge extraction failed', error)
    toast.error('فشل حفظ البطاقة كصورة، يرجى تصوير الشاشة يدوياً (Screenshot).')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
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
