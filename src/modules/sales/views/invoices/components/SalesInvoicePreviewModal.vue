<!-- src/modules/sales/views/invoices/components/SalesInvoicePreviewModal.vue -->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 transition-all duration-200"
    dir="rtl"
    @click.self="closeModal"
  >
    <div
      class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-scale-in"
    >
      <!-- شريط التحكم العلوي (خارج كادر الفاتورة المخصص للقطة الشاشة) -->
      <div
        class="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0"
      >
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 class="text-xs sm:text-sm font-black tracking-wide text-slate-100">
            معاينة الفاتورة (جاهزة للقطة الشاشة والمشاركة)
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <!-- زر مشاركة واتساب السريع -->
          <button
            v-if="customerPhone"
            type="button"
            @click="sendViaWhatsApp"
            class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="إرسال تفاصيل ورابط الفاتورة للعميل عبر واتساب"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.771.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.705 0-3.32-.428-4.743-1.185l-5.257 1.376 1.4-5.122c-.832-1.482-1.3-3.195-1.3-5.011 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z"
              />
            </svg>
            <span class="hidden sm:inline">واتساب</span>
          </button>

          <!-- زر طباعة مباشر اختياري -->
          <button
            v-if="sale?.id"
            type="button"
            @click="openPrintPage"
            class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-slate-700"
            title="فتح نافذة الطباعة الكاملة"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span class="hidden sm:inline">طباعة</span>
          </button>

          <!-- زر الإغلاق -->
          <button
            type="button"
            @click="closeModal"
            class="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="إغلاق النافذة (Esc)"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- إشعار إرشادي سريع للكاشير -->
      <div
        class="bg-amber-50 border-b border-amber-200/80 px-4 py-1 text-[11px] text-amber-800 flex items-center justify-between font-semibold flex-shrink-0"
      >
        <span>💡 يمكنك الآن أخذ لقطة شاشة (Screenshot) للفاتورة بالأسفل ومشاركتها فوراً.</span>
        <span class="text-[10px] text-amber-700 font-mono">اضغط Esc للإغلاق والعودة</span>
      </div>

      <!-- مساحة الفاتورة القابلة للتمرير مع حصر الإطار بنمط A5 القياسي -->
      <div class="p-3 sm:p-5 overflow-y-auto bg-slate-100 flex justify-center flex-1">
        <div
          id="invoice-screenshot-target"
          class="bg-white rounded-lg border border-slate-300 p-4 shadow-sm w-full max-w-[14.8cm] text-slate-800 space-y-3 font-sans"
        >
          <!-- 1. ترويسة الفاتورة الرسمية -->
          <div class="flex items-center justify-between border-b-2 border-orange-500 pb-2.5 gap-3">
            <div class="flex items-center gap-2.5">
              <img
                v-if="showLogo"
                :src="reportLogoUrl"
                alt="Logo"
                class="h-11 w-auto object-contain"
                @error="showLogo = false"
              />
              <div>
                <h1 class="text-sm font-black text-slate-900">
                  {{ companyName || 'فاتورة مبيعات' }}
                </h1>
                <span
                  class="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200 mt-0.5"
                >
                  فاتورة مبيعات ضريبية / تجارية
                </span>
              </div>
            </div>

            <div class="text-left text-[10px] space-y-0.5 font-mono">
              <div class="font-black text-xs text-slate-900">
                {{ normalizedSale.invoice_number }}
              </div>
              <div class="text-slate-600">
                التاريخ: {{ String(normalizedSale.invoice_date).substring(0, 10) }}
              </div>
              <div class="text-orange-600 font-sans font-bold">
                السداد: {{ normalizedSale.payment_summary_lbl }}
              </div>
            </div>
          </div>

          <!-- 2. بيانات العميل والملاحظات -->
          <div
            class="bg-gradient-to-r from-orange-50/40 via-white to-slate-50/80 rounded-lg border border-slate-200 border-t-2 border-t-orange-500 border-r-4 border-r-orange-500 p-2 text-xs shadow-2xs"
          >
            <div class="grid grid-cols-2 gap-2 text-xs">
              <!-- جهة العميل -->
              <div class="text-right space-y-0.5">
                <div class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                  <span class="text-[10px] font-bold text-orange-600">بيانات العميل:</span>
                </div>
                <p class="font-black text-slate-900 text-xs pr-2">
                  {{ normalizedSale.customer_name }}
                </p>
                <p
                  v-if="normalizedSale.customer_name_text"
                  class="text-orange-600 font-bold text-[10px] pr-2"
                >
                  {{ normalizedSale.customer_name_text }}
                </p>
                <p v-if="customerPhone" class="text-slate-500 font-mono text-[10px] pr-2">
                  الهاتف: {{ customerPhone }}
                </p>
              </div>

              <!-- الملاحظات -->
              <div class="text-left space-y-0.5 border-r border-slate-200 pr-2">
                <span class="text-[10px] font-bold text-slate-400 block">ملاحظات الفاتورة:</span>
                <p
                  class="text-[10px] text-slate-700 leading-snug font-medium line-clamp-2"
                  v-if="normalizedSale.notes"
                >
                  {{ normalizedSale.notes }}
                </p>
                <p class="text-[10px] text-slate-400 italic" v-else>لا توجد ملاحظات إضافية</p>
              </div>
            </div>
          </div>

          <!-- 3. جدول بنود الأصناف المباعة -->
          <div class="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
            <table class="w-full text-right border-collapse text-[11px]">
              <thead>
                <tr class="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                  <th class="p-1.5 w-6 text-center">#</th>
                  <th class="p-1.5 text-right">الصنف التجاري</th>
                  <th class="p-1.5 w-14 text-center">الوحدة</th>
                  <th class="p-1.5 w-12 text-center">الكمية</th>
                  <th class="p-1.5 w-20 text-center">السعر</th>
                  <th class="p-1.5 w-24 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in normalizedSale.items"
                  :key="item.id || index"
                  class="border-b border-slate-200 hover:bg-slate-50/50"
                >
                  <td class="p-1.5 text-center font-mono text-slate-500 text-[10px]">
                    {{ index + 1 }}
                  </td>
                  <td class="p-1.5 font-bold text-slate-900">
                    {{ item.product_name || item.item_name || item.name || '-' }}
                  </td>
                  <td class="p-1.5 text-center text-slate-600 text-[10px]">
                    {{ item.unit_name || resolveUnitName(item) || '-' }}
                  </td>
                  <td class="p-1.5 text-center font-black text-slate-900 font-mono">
                    {{ formatNumber(item.quantity) }}
                  </td>
                  <td class="p-1.5 text-center font-mono font-medium text-slate-700">
                    {{ formatNumber(item.unit_price) }}
                  </td>
                  <td class="p-1.5 text-left font-mono font-bold text-slate-900">
                    {{ formatNumber(item.total_amount || item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 4. شريط الإجماليات المالية -->
          <div
            class="bg-gradient-to-r from-orange-50/30 via-white to-slate-50/60 rounded-lg border border-slate-200 border-t-2 border-t-orange-500 border-r-4 border-r-orange-500 p-2 flex justify-end items-center text-xs shadow-2xs"
          >
            <div class="w-48 space-y-1 text-xs">
              <div class="flex justify-between items-center px-1">
                <span class="text-slate-500 font-bold text-[10px]">المجموع الفرعي:</span>
                <span class="font-mono font-bold text-slate-800 text-left">
                  {{ formatNumber(normalizedSale.subtotal || 0) }}
                </span>
              </div>

              <div
                v-if="Number(normalizedSale.discount_amount) > 0"
                class="flex justify-between items-center px-1 text-rose-600"
              >
                <span class="font-bold text-[10px]">الخصم:</span>
                <span class="font-mono font-bold text-left">
                  -{{ formatNumber(normalizedSale.discount_amount || 0) }}
                </span>
              </div>

              <div
                v-if="Number(normalizedSale.vat_amount) > 0"
                class="flex justify-between items-center px-1 text-blue-600"
              >
                <span class="font-bold text-[10px]">الضريبة:</span>
                <span class="font-mono font-bold text-left">
                  {{ formatNumber(normalizedSale.vat_amount || 0) }}
                </span>
              </div>

              <div
                class="flex justify-between items-center bg-orange-500 text-white rounded-md px-2 py-1 shadow-xs mt-1"
              >
                <span class="font-black text-[11px]">الصافي الفعلي:</span>
                <div class="flex items-center gap-1 font-mono font-black text-xs">
                  <span>{{ formatNumber(normalizedSale.total_amount || 0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. التوقيعات الرسمية -->
          <div class="grid grid-cols-3 gap-2 text-center text-slate-500 pt-2 pb-1 text-[10px]">
            <div>
              <p class="font-bold text-slate-700">توقيع المنشئ</p>
              <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-2"></div>
            </div>
            <div>
              <p class="font-bold text-slate-700">توقيع المحاسب</p>
              <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-2"></div>
            </div>
            <div>
              <p class="font-bold text-slate-700">توقيع المستلم</p>
              <div class="border-b border-dashed border-slate-300 mx-auto w-16 pt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'
import { useToast } from 'vue-toastification'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  sale: { type: Object, default: () => null },
})

const emit = defineEmits(['update:modelValue'])

const toast = useToast()
const customerStore = useCustomerStore()

const showLogo = ref(true)
const reportLogoUrl = '/ReportLogo.png'
const companyName = import.meta.env.VITE_COMPANY_NAME || ''

const normalizedSale = computed(() => {
  if (!props.sale) return {}

  const partnerId = Number(props.sale.partner_id)
  const currentCust =
    customerStore.selectorCustomers?.find((c) => c.id === partnerId) ||
    customerStore.customers?.find((c) => c.id === partnerId)

  let paymentLabel = props.sale.payment_summary_lbl
  if (!paymentLabel) {
    const cash = Number(props.sale.cash_amount) || 0
    const bank = Number(props.sale.bank_amount) || 0
    const parts = []
    if (cash > 0) parts.push('نقدي')
    if (bank > 0) parts.push('بنكي')
    if (parts.length === 0) parts.push('آجل')
    paymentLabel = parts.join(' + ')
  }

  return {
    ...props.sale,
    customer_name:
      props.sale.customer_name ||
      props.sale.partner?.name ||
      currentCust?.name ||
      'عميل عام / مباشر',
    customer_phone:
      props.sale.customer_phone || props.sale.partner?.phone || currentCust?.phone || '',
    payment_summary_lbl: paymentLabel,
    invoice_number:
      props.sale.invoice_number || (props.sale.id ? `#${props.sale.id}` : 'مسودة جديدة'),
    invoice_date: props.sale.invoice_date || new Date().toISOString().substring(0, 10),
    items: props.sale.items || [],
  }
})

const customerPhone = computed(() => {
  return normalizedSale.value.customer_phone || null
})

const resolveUnitName = (item) => {
  if (item.unit_name) return item.unit_name
  if (item.available_units && item.unit_id) {
    const matched = item.available_units.find(
      (u) => u.id === item.unit_id || u.unit_id === item.unit_id,
    )
    if (matched) return matched.unit_name || matched.unit?.name
  }
  return '-'
}

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const openPrintPage = () => {
  if (props.sale?.id) {
    window.open(`/print/sales/invoices/${props.sale.id}`, '_blank')
  }
}

const parseSudanPhoneForWhatsApp = (rawPhone) => {
  if (!rawPhone) return { valid: false }
  let clean = rawPhone.toString().replace(/[^0-9]/g, '')
  if (!clean) return { valid: false }

  if (clean.startsWith('00249')) clean = clean.substring(2)
  if ((clean.startsWith('09') || clean.startsWith('01')) && clean.length === 10) {
    return { valid: true, phone: '249' + clean.substring(1) }
  }
  if ((clean.startsWith('9') || clean.startsWith('1')) && clean.length === 9) {
    return { valid: true, phone: '249' + clean }
  }
  if (clean.startsWith('249') && clean.length === 12) {
    return { valid: true, phone: clean }
  }
  if (clean.length >= 10 && clean.length <= 15 && !clean.startsWith('0')) {
    return { valid: true, phone: clean }
  }
  return { valid: false }
}

const sendViaWhatsApp = () => {
  const phone = customerPhone.value
  if (!phone) {
    toast.warning('لا يوجد رقم هاتف مسجل لهذا العميل.')
    return
  }

  const phoneRes = parseSudanPhoneForWhatsApp(phone)
  if (!phoneRes.valid) {
    toast.error('رقم هاتف العميل غير متطابق مع صيغ الواتساب المعتمدة.')
    return
  }

  const invoiceNum = normalizedSale.value.invoice_number || `#${props.sale?.id || ''}`
  const customerName = normalizedSale.value.customer_name || 'عميلنا العزيز'
  const total = formatNumber(normalizedSale.value.total_amount || 0)
  const shareUrl = normalizedSale.value.public_url || normalizedSale.value.pdf_url || ''

  const textMsg = shareUrl
    ? `مرحباً ${customerName}،\nشكراً لتعاملكم معنا. تفاصيل الفاتورة (${invoiceNum}):\nإجمالي المبلغ: ${total}.\nرابط الفاتورة:\n${shareUrl}`
    : `مرحباً ${customerName}،\nشكراً لتعاملكم معنا. تفاصيل الفاتورة (${invoiceNum}):\nإجمالي المبلغ: ${total}.`

  const encodedText = encodeURIComponent(textMsg)

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const targetUrl = isMobile
    ? `whatsapp://send?phone=${phoneRes.phone}&text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneRes.phone}&text=${encodedText}`

  window.open(targetUrl, '_blank')
}
</script>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.15s ease-out forwards;
}
</style>
