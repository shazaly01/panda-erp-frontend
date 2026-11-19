<!-- src/modules/hr/views/employees/components/EmployeeIdentityCard.vue -->
<template>
  <div
    class="p-4 sm:p-6 bg-surface-header/70 rounded-2xl border border-surface-border border-t-4 border-t-primary shadow-sm text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <!-- ترويسة المعاينة (تختفي عند الطباعة) -->
    <div
      class="flex flex-wrap justify-between items-center gap-2 pb-3 mb-6 border-b border-primary/15 hide-on-print"
    >
      <div>
        <h3 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
          <span>معاينة بطاقة الهوية</span>
        </h3>
        <p class="text-xs text-text-secondary mt-0.5 pr-4">
          {{
            isPublic
              ? 'تصميم رقمي موحد ومحسن للعرض والمشاركة عبر الهواتف الذكية'
              : 'تصميم ديناميكي مخصص للطباعة على بطاقات PVC حسب رتبة الحساب'
          }}
        </p>
      </div>

      <span
        class="px-2.5 py-1 rounded-lg text-[11px] font-bold border"
        :class="
          isIntern
            ? 'bg-warning/10 text-warning border-warning/30'
            : 'bg-primary/10 text-primary border-primary/25'
        "
      >
        {{ isIntern ? 'بطاقة متدرب' : 'بطاقة موظف رسمي' }}
      </span>
    </div>

    <!-- محتوى بطاقتي الهوية (الأمامية والخلفية) -->
    <div id="id-card-content" class="flex flex-col md:flex-row gap-8 items-center justify-center">
      <!-- 1. الوجه الأمامي للبطاقة (Front Side) -->
      <div
        class="w-[340px] h-[540px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.18)] overflow-hidden border border-slate-200 relative flex flex-col items-center text-center group"
      >
        <!-- خلفية نقطية خفيفة -->
        <div
          class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="
            background-image: radial-gradient(#1e293b 2px, transparent 2px);
            background-size: 20px 20px;
          "
        ></div>

        <!-- الترويسة العلوية للبطاقة -->
        <div
          class="absolute top-0 left-0 w-full h-[160px] bg-gradient-to-br transition-all duration-500"
          :class="
            isIntern
              ? 'from-slate-900 via-amber-900 to-orange-950'
              : 'from-slate-900 via-slate-800 to-slate-950'
          "
        >
          <!-- شريط الهوية البرتقالي العلوي -->
          <div class="absolute top-0 inset-x-0 h-1.5 bg-orange-500"></div>
          <div
            class="absolute inset-0 bg-white/5"
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

        <!-- شعار واسم المنشأة -->
        <div class="z-10 mt-5 flex items-center justify-center gap-3 max-w-[90%] px-4">
          <div
            class="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-orange-500/30 flex-shrink-0 logo-holder"
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
          class="text-orange-300/80 text-[8px] font-black uppercase tracking-widest z-10 mt-1 w-full text-center"
        >
          {{ isIntern ? 'Official Intern Identity' : 'Official Employee Identity' }}
        </p>

        <!-- الصورة الشخصية -->
        <div class="z-10 mt-5 relative">
          <div
            class="absolute inset-0 blur-2xl opacity-25 rounded-full transition-all duration-500 bg-orange-500"
          ></div>
          <div
            class="w-36 h-36 rounded-full border-[5px] border-white ring-2 ring-orange-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.15)] bg-slate-50 overflow-hidden relative z-10"
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

        <!-- الاسم والرقم الوظيفي -->
        <div class="mt-4 w-full px-6 flex flex-col items-center">
          <h2 class="text-xl font-black text-slate-800 tracking-tight leading-tight">
            {{ employee.full_name }}
          </h2>

          <div class="mt-3 flex gap-2 justify-center w-full">
            <div
              class="bg-orange-50/70 px-3.5 py-1 rounded-xl border border-orange-200/80 shadow-2xs flex items-center gap-2"
            >
              <span class="text-[8px] text-orange-600 font-black uppercase tracking-wider">
                System ID
              </span>
              <span class="text-xs font-mono font-black text-slate-800">
                {{ employee.employee_number }}
              </span>
            </div>
          </div>
        </div>

        <!-- رمز QR والباركود -->
        <div class="mt-auto pb-4 z-10 flex flex-col items-center justify-center w-full">
          <div
            class="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs transition-transform duration-300 group-hover:scale-102"
          >
            <qrcode-vue
              :value="String(scanValue)"
              :size="85"
              level="M"
              render-as="svg"
              class="rounded-lg"
            />
          </div>

          <!-- الباركود الخطي في الوجه الأمامي عند التصفح العام الخارجي -->
          <div v-if="isPublic" class="w-full flex justify-center px-6 mt-3">
            <svg ref="barcodeElementFront" class="w-full h-auto max-h-[35px]"></svg>
          </div>
        </div>
      </div>

      <!-- 2. الوجه الخلفي للبطاقة (Back Side) -->
      <div
        v-if="!isPublic"
        class="w-[340px] h-[540px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.18)] overflow-hidden relative flex flex-col items-center text-center text-white border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 transition-all duration-500"
      >
        <div class="absolute top-0 inset-x-0 h-1.5 bg-orange-500"></div>
        <div
          class="absolute top-[-10%] right-[-10%] w-60 h-60 rounded-full blur-[70px] bg-orange-500/15"
        ></div>
        <div
          class="absolute bottom-[20%] left-[-15%] w-52 h-52 rounded-full blur-[60px] bg-amber-500/10"
        ></div>

        <div class="mt-10 px-8 z-10 relative flex-1">
          <div
            class="w-12 h-1 mx-auto mb-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
          ></div>
          <h4 class="font-black text-lg text-white tracking-wide">تعليمات الاستخدام</h4>

          <p
            class="text-[11px] text-slate-300 mt-6 leading-relaxed font-medium text-justify px-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-700/60 shadow-inner"
          >
            هذه البطاقة تعتبر مستنداً رسمياً يثبت هوية حاملها وتبقى ملكاً لشركة
            <strong class="font-bold text-orange-400">
              {{ brandingStore.appName || 'محطة مياه المنارة' }} </strong
            >. يلتزم حاملها بإبرازها وحملها بشكل دائم طوال فترة تواجده داخل مرافق وفروع المنشأة.
            تُستخدم لتسجيل الحضور والانصراف التلقائي وضبط أمن السلامة المهنية. في حال فقدانها، يرجى
            إخطار إدارة الموارد البشرية فوراً.
          </p>
        </div>

        <div
          class="mt-auto w-full flex flex-col items-center z-10 bg-white pt-5 pb-5 rounded-b-[2.5rem] border-t-2 border-orange-500"
        >
          <div class="w-full flex justify-center px-4 mb-3">
            <svg ref="barcodeElementBack" class="w-full h-auto max-h-[50px]"></svg>
          </div>

          <div class="w-full flex justify-between items-center px-6 border-t border-slate-100 pt-3">
            <p class="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">
              {{ brandingStore.appName ? 'SYSTEM-IDENTITY' : 'PANDA-ERP-SYS' }}
            </p>
            <p class="text-[9px] text-slate-500 font-mono tracking-widest font-black">
              {{ new Date().getFullYear() }} ©
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import JsBarcode from 'jsbarcode'
import QrcodeVue from 'qrcode.vue'
import { useBrandingStore } from '@/stores/brandingStore'

const props = defineProps({
  employee: { type: Object, required: true },
  isPublic: { type: Boolean, default: false },
})

const brandingStore = useBrandingStore()
const barcodeElementFront = ref(null)
const barcodeElementBack = ref(null)

const isIntern = computed(() => {
  const type = props.employee.employment_type?.value || props.employee.employment_type
  return type === 'intern' || props.employee.employee_number?.toUpperCase().startsWith('INT-')
})

const scanValue = computed(() => {
  return props.employee.barcode || props.employee.employee_number || ''
})

const generateBarcode = () => {
  nextTick(() => {
    const targetElement = props.isPublic ? barcodeElementFront.value : barcodeElementBack.value

    if (targetElement && scanValue.value) {
      JsBarcode(targetElement, String(scanValue.value), {
        format: 'CODE128',
        width: 2.0,
        height: props.isPublic ? 35 : 40,
        displayValue: false,
        margin: 0,
        background: 'transparent',
        lineColor: '#0f172a',
      })
    }
  })
}

onMounted(() => {
  generateBarcode()
})

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
