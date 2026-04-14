<template>
  <div
    class="p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl"
  >
    <div class="flex justify-between items-center mb-8 hide-on-print">
      <div>
        <h3 class="text-xl font-black text-white drop-shadow-md">معاينة بطاقة الهوية</h3>
        <p class="text-xs text-slate-400 mt-1">تصميم مخصص للطباعة على بطاقات PVC</p>
      </div>
      <AppButton
        variant="primary"
        size="md"
        @click="printCard"
        class="shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform"
      >
        <svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        طباعة البطاقة الاحترافية
      </AppButton>
    </div>

    <div id="id-card-content" class="flex flex-col md:flex-row gap-10 items-center justify-center">
      <div
        class="w-[340px] h-[540px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-200 relative flex flex-col items-center text-center group"
      >
        <div
          class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="
            background-image: radial-gradient(#1e293b 2px, transparent 2px);
            background-size: 20px 20px;
          "
        ></div>

        <div
          class="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-800 -z-0"
        >
          <div
            class="absolute inset-0 bg-white/10"
            style="clip-path: polygon(0 0, 100% 0, 100% 40%, 0 100%)"
          ></div>
          <svg
            class="absolute bottom-0 w-full h-12 text-white"
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

        <div class="z-10 mt-6 flex items-center justify-center gap-2">
          <div
            class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30"
          >
            <span class="text-white font-black text-xs">PE</span>
          </div>
          <h4 class="text-white font-black text-2xl tracking-tight drop-shadow-md">Panda ERP</h4>
        </div>
        <p class="text-blue-100/80 text-[10px] font-bold uppercase tracking-widest z-10 mt-1">
          Official Employee Identity
        </p>

        <div class="z-10 mt-8 relative">
          <div class="absolute inset-0 bg-blue-500 blur-xl opacity-30 rounded-full"></div>
          <div
            class="w-36 h-36 rounded-full border-[6px] border-white shadow-2xl bg-slate-50 overflow-hidden relative z-10"
          >
            <img
              v-if="employee.avatar"
              :src="employee.avatar"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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

        <div class="mt-6 flex-1 w-full px-6 flex flex-col items-center">
          <h2
            class="text-2xl font-black text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600"
          >
            {{ employee.full_name }}
          </h2>
          <p class="text-blue-600 font-black text-sm mt-1 uppercase tracking-wider">
            {{ employee.position?.name || 'موظف' }}
          </p>

          <div class="mt-4 flex gap-2 justify-center w-full">
            <div
              class="bg-slate-100/80 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2"
            >
              <span class="text-[9px] text-slate-400 font-bold uppercase">System ID</span>
              <span class="text-sm font-mono font-black text-slate-800">{{
                employee.employee_number
              }}</span>
            </div>
          </div>
        </div>

        <div
          class="mt-auto pb-6 w-full flex flex-col items-center bg-gradient-to-t from-slate-50 to-transparent pt-6"
        >
          <svg ref="barcodeElement" class="opacity-90"></svg>
        </div>
      </div>

      <div
        class="w-[340px] h-[540px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col items-center p-8 text-center text-white border border-slate-700"
      >
        <div
          class="absolute top-[-20%] left-[-20%] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"
        ></div>

        <div class="mt-8 z-10 relative">
          <div class="w-12 h-1 bg-blue-500 mx-auto mb-4 rounded-full"></div>
          <h4 class="font-black text-xl text-white tracking-wide">تعليمات الاستخدام</h4>
          <p class="text-[11px] text-slate-400 mt-5 leading-relaxed font-medium px-4">
            هذه البطاقة ملك لشركة <strong class="text-slate-200">Panda ERP</strong>. يرجى إبرازها
            بشكل دائم أثناء التواجد في مقر العمل. تُستخدم هذه البطاقة لتسجيل الحضور والانصراف
            والوصول للمرافق المخصصة. في حال الفقدان، يرجى إبلاغ إدارة الموارد البشرية فوراً.
          </p>
        </div>

        <div class="mt-auto mb-8 relative z-10 group">
          <div
            class="absolute inset-0 bg-blue-500/30 blur-2xl rounded-3xl transition-all duration-500 group-hover:bg-blue-500/50"
          ></div>
          <div
            class="relative p-5 bg-white rounded-[2rem] shadow-2xl border border-white/20 transform transition-transform duration-500 group-hover:scale-105"
          >
            <qrcode-vue
              :value="String(scanValue)"
              :size="150"
              level="H"
              render-as="svg"
              class="rounded-xl"
            />
          </div>
        </div>

        <div
          class="mb-4 z-10 w-full flex justify-between items-center border-t border-slate-700/50 pt-4 px-2"
        >
          <p class="text-[9px] text-slate-500 font-mono tracking-widest">PANDA-ERP-SYS</p>
          <p class="text-[9px] text-slate-500 font-mono tracking-widest font-bold">
            {{ new Date().getFullYear() }} ©
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import JsBarcode from 'jsbarcode'
import QrcodeVue from 'qrcode.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  employee: { type: Object, required: true },
})

const barcodeElement = ref(null)

// 🌟 القيمة الحقيقية للمسح: إذا كان للموظف باركود قديم نستخدمه، وإلا نستخدم الرقم النظامي الجديد
const scanValue = computed(() => {
  return props.employee.barcode || props.employee.employee_number || ''
})

// دالة توليد الباركود
const generateBarcode = () => {
  if (barcodeElement.value && scanValue.value) {
    JsBarcode(barcodeElement.value, String(scanValue.value), {
      format: 'CODE128',
      width: 1.8, // جعلنا الخطوط أوضح قليلاً
      height: 45, // زيادة الارتفاع لسهولة المسح
      displayValue: false,
      margin: 0,
      background: 'transparent',
      lineColor: '#0f172a', // لون كحلي داكن جداً بدلاً من الأسود الصريح ليتناسب مع التصميم
    })
  }
}

onMounted(() => {
  generateBarcode()
})

// 🌟 مراقبة تغيير قيمة المسح (بدلاً من مراقبة employee_number فقط)
watch(scanValue, () => {
  generateBarcode()
})

const printCard = () => {
  window.print()
}
</script>

<style scoped>
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
    /* ترتيب البطاقتين بجوار بعضهما في الورقة الـ A4 */
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-start !important;
    gap: 10px !important;
  }
  /* إجبار الطابعة على طباعة التدرجات اللونية والخلفيات بدقة */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
