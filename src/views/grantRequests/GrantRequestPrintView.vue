<template>
  <div
    class="print-page-wrapper min-h-screen bg-neutral-100 dark:bg-neutral-900 py-8 px-4 print:p-0 print:bg-white text-neutral-900"
  >
    <!-- شريط أدوات التحكم العلوي (يختفي تلقائياً عند أمر الطباعة) -->
    <div
      class="no-print max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="router.back()"
          class="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
        >
          رجوع
        </button>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handlePrint"
          class="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          طباعة الخطاب (Print / PDF)
        </button>
      </div>
    </div>

    <!-- حاوية الخطاب الرسمية (A4 Sheet Container) -->
    <div
      v-if="requestData"
      class="sheet-container max-w-4xl mx-auto bg-white p-10 md:p-14 shadow-lg print:shadow-none print:p-0 print:max-w-full text-black font-sans leading-relaxed"
      dir="rtl"
    >
      <!-- ترويسة الخطاب الرسمية -->
      <div class="border-b-2 border-neutral-800 pb-5 mb-6">
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h1 class="text-xl font-extrabold tracking-wide">الجمهورية / الإدارة العامة</h1>
            <p class="text-sm font-bold text-neutral-700">مكتب التخطيط والمشاريع المؤسسية</p>
            <p class="text-xs text-neutral-500">قسم متابعة الدعم والمنح والتعاون المشترك</p>
          </div>

          <div class="text-left space-y-1 text-sm font-semibold">
            <div>
              <span class="text-neutral-500">الرقم الإشاري:</span>
              <span class="font-mono font-bold mr-2">{{ requestData.request_number }}</span>
            </div>
            <div>
              <span class="text-neutral-500">التاريخ:</span>
              <span class="mr-2">{{ requestData.request_date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- نص الخطاب والجهة الموجه إليها -->
      <div class="my-6 space-y-4">
        <div class="text-base font-bold">
          السادة المحترمون /
          <span class="text-lg underline underline-offset-4">{{
            requestData.target_organization
          }}</span>
        </div>
        <div class="text-sm font-bold text-neutral-800">
          السلام عليكم ورحمة الله وبركاته،، وبعد،
        </div>
        <div
          class="text-base font-extrabold text-neutral-900 bg-neutral-50 p-3 rounded border border-neutral-200 text-center"
        >
          الموضوع: {{ requestData.title }}
        </div>
        <p v-if="requestData.notes" class="text-sm text-neutral-700 leading-relaxed text-justify">
          {{ requestData.notes }}
        </p>
        <p v-else class="text-sm text-neutral-700 leading-relaxed text-justify">
          يهديكم فريق العمل أطيب التحايا، وبالإشارة إلى خطة تطوير البنية التحتية وتلبية الاحتياجات
          التشغيلية للأقسام المختلفة، نرفق لسيادتكم أدناه قائمة الاحتياجات والمواصفات الفنية
          المطلوبة، آملين تكرمكم بالنظر فيها وتقديم الدعم الممكن:
        </p>
      </div>

      <!-- جداول البنود مجمعة حسب كل قسم -->
      <div class="space-y-8 my-6">
        <div
          v-for="(deptGroup, deptIndex) in groupedDepartments"
          :key="deptIndex"
          class="space-y-2 break-inside-avoid"
        >
          <!-- عنوان القسم -->
          <div
            class="flex items-center justify-between bg-neutral-800 text-white px-3 py-1.5 rounded-t font-bold text-sm"
          >
            <span>القسم المستفيد: {{ deptGroup.department_name }}</span>
            <span v-if="deptGroup.department_code" class="text-xs font-mono text-neutral-300">
              [ {{ deptGroup.department_code }} ]
            </span>
          </div>

          <!-- جدول بنود القسم -->
          <table class="w-full text-right border-collapse border border-neutral-300 text-xs">
            <thead>
              <tr class="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                <th class="p-2 border-l border-neutral-300 w-10 text-center">#</th>
                <th class="p-2 border-l border-neutral-300 w-48">اسم البند / الجهاز</th>
                <th class="p-2 border-l border-neutral-300">المواصفات الفنية المطلوبة</th>
                <th class="p-2 border-l border-neutral-300 w-16 text-center">الكمية</th>
                <th class="p-2 border-l border-neutral-300 w-16 text-center">الوحدة</th>
                <th
                  v-if="hasEstimatedCost"
                  class="p-2 border-l border-neutral-300 w-24 text-center"
                >
                  التكلفة التقديرية
                </th>
                <th class="p-2 w-32">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, itemIndex) in deptGroup.items"
                :key="item.id || itemIndex"
                class="border-b border-neutral-200"
              >
                <td class="p-2 border-l border-neutral-300 text-center font-bold">
                  {{ itemIndex + 1 }}
                </td>
                <td class="p-2 border-l border-neutral-300 font-bold text-neutral-900">
                  {{ item.item_name }}
                </td>
                <td class="p-2 border-l border-neutral-300 text-neutral-700 leading-normal">
                  {{ item.specifications || '---' }}
                </td>
                <td class="p-2 border-l border-neutral-300 text-center font-bold">
                  {{ item.quantity }}
                </td>
                <td class="p-2 border-l border-neutral-300 text-center text-neutral-600">
                  {{ item.unit || 'جهاز' }}
                </td>
                <td
                  v-if="hasEstimatedCost"
                  class="p-2 border-l border-neutral-300 text-center font-mono"
                >
                  {{ item.estimated_cost ? formatCurrency(item.estimated_cost) : '---' }}
                </td>
                <td class="p-2 text-neutral-600 text-[11px]">{{ item.notes || '---' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ملخص إجمالي عام للطلب -->
      <div
        class="my-6 p-3 bg-neutral-50 border border-neutral-300 rounded text-xs flex justify-between items-center break-inside-avoid"
      >
        <div class="flex gap-6 font-semibold text-neutral-800">
          <span
            >عدد الأقسام المشمولة:
            <strong class="text-black">{{ groupedDepartments.length }}</strong></span
          >
          <span
            >إجمالي الأصناف المطلوبة:
            <strong class="text-black">{{
              requestData.total_items_count || totalItemsCount
            }}</strong></span
          >
          <span
            >إجمالي عدد القطع:
            <strong class="text-black">{{
              requestData.total_quantity || totalQuantityCount
            }}</strong></span
          >
        </div>
        <div
          v-if="hasEstimatedCost && (requestData.total_estimated_cost || totalCostSum > 0)"
          class="font-bold text-neutral-900"
        >
          الإجمالي المالي التقديري:
          <span class="font-mono text-sm mr-1">{{
            formatCurrency(requestData.total_estimated_cost || totalCostSum)
          }}</span>
        </div>
      </div>

      <!-- خاتمة الخطاب والتوقيعات والاعتمادات الرسمية -->
      <div class="mt-12 pt-6 border-t border-neutral-300 break-inside-avoid space-y-8">
        <p class="text-center font-bold text-sm text-neutral-800">
          وتفضلوا بقبول فائق الاحترام والتقدير والامتنان،،
        </p>

        <div class="grid grid-cols-3 gap-6 text-center text-xs font-bold pt-4">
          <div class="space-y-12">
            <p>المسؤول المعد للطلب</p>
            <p class="text-neutral-500">................................</p>
          </div>

          <div class="space-y-12">
            <p>ختم المنشأة / المؤسسة</p>
            <div
              class="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-full mx-auto flex items-center justify-center text-neutral-300 text-[10px]"
            >
              موضع الختم
            </div>
          </div>

          <div class="space-y-12">
            <p>المدير العام / المفوض</p>
            <p class="text-neutral-500">................................</p>
          </div>
        </div>
      </div>
    </div>

    <!-- حالة التحميل -->
    <div v-else class="flex justify-center items-center py-20 text-neutral-500">
      جاري تحضير مستند الطباعة...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGrantRequestStore } from '@/stores/grantRequestStore'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const grantRequestStore = useGrantRequestStore()

const requestData = ref(null)

const handlePrint = () => {
  window.print()
}

const formatCurrency = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const groupedDepartments = computed(() => {
  if (!requestData.value) return []

  if (requestData.value.departments_summary && requestData.value.departments_summary.length > 0) {
    return requestData.value.departments_summary
  }

  if (requestData.value.items && requestData.value.items.length > 0) {
    const groups = {}
    requestData.value.items.forEach((item) => {
      const deptId = item.department_id || 'general'
      const deptName = item.department_name || item.department?.name || 'القسم العام'
      const deptCode = item.department_code || item.department?.code || ''

      if (!groups[deptId]) {
        groups[deptId] = {
          department_id: deptId,
          department_name: deptName,
          department_code: deptCode,
          items: [],
        }
      }
      groups[deptId].items.push(item)
    })
    return Object.values(groups)
  }

  return []
})

const hasEstimatedCost = computed(() => {
  if (!requestData.value?.items) return false
  return requestData.value.items.some((item) => Number(item.estimated_cost) > 0)
})

const totalItemsCount = computed(() => {
  return requestData.value?.items ? requestData.value.items.length : 0
})

const totalQuantityCount = computed(() => {
  if (!requestData.value?.items) return 0
  return requestData.value.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

const totalCostSum = computed(() => {
  if (!requestData.value?.items) return 0
  return requestData.value.items.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0)
})

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    toast.error('معرف الطلب غير موجود.')
    router.back()
    return
  }

  try {
    const data = await grantRequestStore.fetchPrintData(id)
    requestData.value = data
  } catch {
    toast.error('فشل في جلب بيانات الطباعة.')
    router.back()
  }
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .print-page-wrapper {
    background: transparent !important;
    padding: 0 !important;
    min-height: auto !important;
  }

  .sheet-container {
    box-shadow: none !important;
    max-width: 100% !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  body {
    background-color: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4 portrait;
    margin: 15mm;
  }
}
</style>
