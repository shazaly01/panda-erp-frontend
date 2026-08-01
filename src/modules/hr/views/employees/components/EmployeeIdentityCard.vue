<!--src\modules\hr\views\employees\components\EmployeeIdentityCard.vue--->
<template>
  <div
    class="p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl"
  >
    <div class="flex justify-between items-center mb-8 hide-on-print">
      <div>
        <h3 class="text-xl font-black text-white drop-shadow-md">معاينة بطاقة الهوية</h3>
        <p class="text-xs text-slate-400 mt-1">
          {{
            isPublic
              ? 'تصميم رقمي موحد ومحسن للعرض والمشاركة عبر الهواتف الذكية'
              : 'تصميم ديناميكي مخصص للطباعة على بطاقات PVC حسب رتبة الحساب'
          }}
        </p>
      </div>
    </div>

    <div id="id-card-content" class="flex flex-col md:flex-row gap-10 items-center justify-center">
      <!-- 🟢 الوجه الأمامي للبطاقة (Front Side) -->
      <div
        class="w-[340px] h-[540px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden border border-slate-200/80 relative flex flex-col items-center text-center group"
      >
        <div
          class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="
            background-image: radial-gradient(#1e293b 2px, transparent 2px);
            background-size: 20px 20px;
          "
        ></div>

        <div
          class="absolute top-0 left-0 w-full h-[160px] bg-gradient-to-br transition-all duration-500"
          :class="
            isIntern
              ? 'from-purple-900 via-indigo-800 to-purple-950'
              : 'from-slate-900 via-blue-900 to-indigo-950'
          "
        >
          <div
            class="absolute inset-0 bg-white/10"
            style="clip-path: polygon(0 0, 100% 0, 100% 35%, 0 95%)"
          ></div>
          <svg
            class="absolute bottom-0 w-full h-10 text-white"
            preserveAspectRatio="none"
            viewBox="0 0 1440 74"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,32L60,37.3C120,43,240,53,360,58.7C480,64,600,64,720,53.3C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,74L1380,74C1320,74,1200,74,1080,74C960,74,840,74,720,74C600,74,480,74,360,74C240,74,120,74,60,74L0,74Z"
            ></path>
          </svg>
        </div>

        <div class="z-10 mt-5 flex items-center justify-center gap-3 max-w-[90%] px-4">
          <div
            class="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-white/20 flex-shrink-0 logo-holder"
          >
            <img
              :src="brandingStore.logoMiniUrl || '/MainLogo2.png'"
              :alt="brandingStore.appName"
              class="w-full h-full object-contain"
            />
          </div>
          <h4
            class="text-white font-black text-base tracking-tight drop-shadow-md truncate text-right"
          >
            {{ brandingStore.appName || 'محطة مياه المنارة' }}
          </h4>
        </div>
        <p
          class="text-white/50 text-[8px] font-black uppercase tracking-widest z-10 mt-1 w-full text-center"
        >
          {{ isIntern ? 'Official Intern Identity' : 'Official Employee Identity' }}
        </p>

        <div class="z-10 mt-5 relative">
          <div
            class="absolute inset-0 blur-2xl opacity-25 rounded-full transition-all duration-500"
            :class="isIntern ? 'bg-purple-500' : 'bg-indigo-500'"
          ></div>
          <div
            class="w-36 h-36 rounded-full border-[5px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] bg-slate-50 overflow-hidden relative z-10"
          >
            <img
              v-if="employee.profile_photo?.url || employee.photo_url || employee.avatar"
              :src="employee.profile_photo?.url || employee.photo_url || employee.avatar"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="صورة الهوية الرسمية"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-100 to-slate-200"
            >
              <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="mt-4 w-full px-6 flex flex-col items-center">
          <h2 class="text-xl font-black text-slate-800 tracking-tight leading-tight">
            {{ employee.full_name }}
          </h2>

          <!-- <p
            class="font-black text-xs mt-1.5 uppercase tracking-wider px-3 py-0.5 rounded-full border transition-colors duration-500"
            :class="
              isIntern
                ? 'text-purple-600 bg-purple-50 border-purple-100'
                : 'text-blue-600 bg-blue-50 border-blue-100'
            "
          >
            {{ employee.position?.name || (isIntern ? 'متدرب' : 'موظف') }}
          </p> -->

          <div class="mt-3 flex gap-2 justify-center w-full">
            <div
              class="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2"
            >
              <span class="text-[8px] text-slate-400 font-black uppercase tracking-wider"
                >System ID</span
              >
              <span class="text-xs font-mono font-black text-slate-700">{{
                employee.employee_number
              }}</span>
            </div>
          </div>
        </div>

        <div class="mt-auto pb-4 z-10 flex flex-col items-center justify-center w-full">
          <div
            class="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-transform duration-300 group-hover:scale-102"
          >
            <qrcode-vue
              :value="String(scanValue)"
              :size="85"
              level="M"
              render-as="svg"
              class="rounded-lg"
            />
          </div>

          <!-- 🌟 حقن الباركود الخطي في الوجه الأمامي فقط عند التصفح العام الخارجي -->
          <div v-if="isPublic" class="w-full flex justify-center px-6 mt-3">
            <svg ref="barcodeElementFront" class="w-full h-auto max-h-[35px]"></svg>
          </div>
        </div>
      </div>

      <!-- 🔴 الوجه الخلفي للبطاقة (Back Side) - يختفي تماماً في العرض الخارجي العام للمدربين -->
      <div
        v-if="!isPublic"
        class="w-[340px] h-[540px] rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden relative flex flex-col items-center text-center text-white border transition-all duration-500"
        :class="
          isIntern
            ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-purple-900/40'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-slate-800'
        "
      >
        <div
          class="absolute top-[-10%] right-[-10%] w-60 h-60 rounded-full blur-[70px] transition-colors duration-500"
          :class="isIntern ? 'bg-purple-600/15' : 'bg-blue-600/15'"
        ></div>
        <div
          class="absolute bottom-[20%] left-[-15%] w-52 h-52 rounded-full blur-[60px] transition-colors duration-500"
          :class="isIntern ? 'bg-pink-600/10' : 'bg-indigo-600/10'"
        ></div>

        <div class="mt-10 px-8 z-10 relative flex-1">
          <div
            class="w-10 h-1 mx-auto mb-5 rounded-full bg-gradient-to-r transition-all duration-500"
            :class="isIntern ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-indigo-500'"
          ></div>
          <h4 class="font-black text-lg text-white tracking-wide">تعليمات الاستخدام</h4>

          <p
            class="text-[11px] text-slate-400 mt-6 leading-relaxed font-medium text-justify px-2 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/60 shadow-inner"
          >
            هذه البطاقة تعتبر مستنداً رسمياً يثبت هوية حاملها وتبقى ملكاً لشركة
            <strong
              class="font-bold transition-colors duration-500"
              :class="isIntern ? 'text-purple-400' : 'text-blue-400'"
            >
              {{ brandingStore.appName || 'محطة مياه المنارة' }} </strong
            >. يلتزم حاملها بإبرازها وحملها بشكل دائم طوال فترة تواجده داخل مرافق وفروع المنشأة.
            تُستخدم لتسجيل الحضور والانصراف التلقائي وضبط أمن السلامة المهنية. في حال فقدانها، يرجى
            إخطار إدارة الموارد البشرية فوراً.
          </p>
        </div>

        <div
          class="mt-auto w-full flex flex-col items-center z-10 bg-white pt-5 pb-5 rounded-b-[2.5rem] border-t border-slate-100"
        >
          <div class="w-full flex justify-center px-4 mb-3">
            <svg ref="barcodeElementBack" class="w-full h-auto max-h-[50px]"></svg>
          </div>

          <div class="w-full flex justify-between items-center px-6 border-t border-slate-100 pt-3">
            <p class="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
              {{ brandingStore.appName ? 'SYSTEM-IDENTITY' : 'PANDA-ERP-SYS' }}
            </p>
            <p class="text-[9px] text-slate-400 font-mono tracking-widest font-black">
              {{ new Date().getFullYear() }} ©
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import JsBarcode from 'jsbarcode'
import QrcodeVue from 'qrcode.vue'
import { useBrandingStore } from '@/stores/brandingStore'

const props = defineProps({
  employee: { type: Object, required: true },
  isPublic: { type: Boolean, default: false }, // 🌟 معامل تحديد نوع الواجهة
})

const brandingStore = useBrandingStore()
const barcodeElementFront = ref(null)
const barcodeElementBack = ref(null)

/**
 * 🌟 محرك الفحص الذكي لتحديد نوع الموظف (متدرب أم موظف رسمي)
 */
const isIntern = computed(() => {
  const type = props.employee.employment_type?.value || props.employee.employment_type
  return type === 'intern' || props.employee.employee_number?.toUpperCase().startsWith('INT-')
})

// القيمة الحقيقية للمسح المشترك بين الـ QR والـ Barcode
const scanValue = computed(() => {
  return props.employee.barcode || props.employee.employee_number || ''
})

// دالة توليد الباركود التناظري الخطي المدمج بالخلف أو بالأمام ديناميكياً
const generateBarcode = () => {
  const targetElement = props.isPublic ? barcodeElementFront.value : barcodeElementBack.value

  if (targetElement && scanValue.value) {
    JsBarcode(targetElement, String(scanValue.value), {
      format: 'CODE128',
      width: 2.0,
      height: props.isPublic ? 35 : 40, // تكييف الارتفاع حسب مكان العرض
      displayValue: false,
      margin: 0,
      background: 'transparent',
      lineColor: '#0f172a',
    })
  }
}

onMounted(() => {
  generateBarcode()
})

// مراقبة تغيير قيمة البطاقة اللحظية لإعادة التوليد والترقيع الآلي
watch(scanValue, () => {
  generateBarcode()
})
</script>

<style scoped>
.logo-holder img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

@media print {
  body * {
    visibility: hidden;
  }
  .hide-on-print {
    display: none !important;
  }
  #id-card-content,
  #id-card-content * {
    visibility: visible;
  }
  #id-card-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-start !important;
    gap: 15px !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
