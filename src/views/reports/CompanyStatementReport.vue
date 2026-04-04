<template>
  <div>
    <FullScreenLoader :show="loading" message="جاري تحميل التقرير..." />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">{{ reportTitle }}</h1>
      <AppButton
        v-if="reportData"
        @click="handlePrint"
        class="bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        <PrinterIcon class="w-5 h-5 ml-2" />
        طباعة احترافية
      </AppButton>
    </div>

    <AppCard class="mb-8">
      <h3 class="font-semibold text-lg mb-4">خيارات التقرير</h3>

      <div class="space-y-4 max-w-2xl">
        <div class="flex items-center gap-6 border-b border-gray-100 pb-4">
          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="reportType"
              value="company"
              class="form-radio text-primary h-5 w-5"
              @change="resetData"
            />
            <span class="mr-2 text-text-primary">كشف حساب شركة</span>
          </label>

          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="reportType"
              value="owner"
              class="form-radio text-sky-500 h-5 w-5"
              @change="resetData"
            />
            <span class="mr-2 text-text-primary">كشف حساب جهة مالكة</span>
          </label>
        </div>

        <div>
          <CompaniesDropdown
            v-if="reportType === 'company'"
            id="report-company-select"
            label="اختر الشركة"
            v-model="selectedId"
            @update:modelValue="fetchReport"
          />

          <OwnersDropdown
            v-else
            id="report-owner-select"
            label="اختر الجهة المالكة"
            v-model="selectedId"
            @update:modelValue="fetchReport"
          />
        </div>
      </div>
    </AppCard>

    <div v-if="error" class="text-center p-10 text-danger">
      <p>{{ error }}</p>
    </div>

    <AppCard v-else-if="reportData" class="p-6">
      <div class="border-b border-surface-border pb-4 mb-6">
        <div v-if="reportType === 'company'">
          <h2 class="text-xl font-bold text-primary mb-2">{{ reportData.company?.name }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
            <p><strong>الرقم الضريبي:</strong> {{ reportData.company?.tax_number || 'N/A' }}</p>
            <p><strong>المفوض:</strong> {{ reportData.company?.owner_name || 'N/A' }}</p>
            <p><strong>العنوان:</strong> {{ reportData.company?.address || 'غير محدد' }}</p>
          </div>
        </div>

        <div v-else>
          <h2 class="text-xl font-bold text-sky-600 mb-2">{{ reportData.owner?.name }}</h2>
          <div class="text-sm text-text-secondary">
            <p>
              تقرير مجمع للمشاريع التابعة لـ <strong>{{ reportData.owner?.name }}</strong>
            </p>
          </div>
        </div>
      </div>

      <div class="bg-surface-ground p-4 rounded-lg mb-8">
        <h3 class="text-lg font-semibold mb-4">ملخص مالي</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-sm text-text-muted">إجمالي العقود الكلية</p>
            <p class="text-2xl font-bold text-gray-500">
              {{ formatCurrency(reportData.summary?.total_contract_value || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي القيمة المستحقة</p>
            <p class="text-2xl font-bold text-primary">
              {{ formatCurrency(reportData.summary?.total_due_value || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي المبالغ المدفوعة</p>
            <p class="text-2xl font-bold text-success">
              {{ formatCurrency(reportData.summary?.total_payments_received || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">الرصيد المتبقي</p>
            <p class="text-2xl font-bold text-warning">
              {{ formatCurrency(reportData.summary?.total_remaining || 0) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">عدد المشاريع</p>
            <p class="text-2xl font-bold">{{ reportData.projects?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-semibold mb-4">تفاصيل المشاريع</h3>

        <div
          v-for="project in reportData.projects"
          :key="project.id"
          class="border border-surface-border rounded-lg p-4 grid grid-cols-5 gap-4 items-center"
        >
          <div class="col-span-2">
            <h4 class="font-semibold text-base text-text-primary truncate" :title="project.name">
              مشروع: {{ project.name }}
            </h4>

            <div class="flex flex-col gap-0.5 mt-1 text-xs">
              <div v-if="project.contract_number" class="flex items-center gap-1.5">
                <span class="text-gray-500">رقم العقد:</span>
                <span class="font-mono text-emerald-500">{{ project.contract_number }}</span>
              </div>

              <div v-if="reportType === 'company'" class="flex items-center gap-1.5">
                <span class="text-gray-500">المالك:</span>
                <span class="text-sky-500">{{
                  project.owner?.name || project.project_owner || 'غير محدد'
                }}</span>
              </div>

              <div v-else class="flex items-center gap-1.5">
                <span class="text-gray-500">الشركة المنفذة:</span>
                <span class="text-indigo-500 font-bold">{{
                  project.company?.name || 'غير محدد'
                }}</span>
              </div>
            </div>
          </div>
          <div>
            <p class="text-sm text-text-muted">قيمة العقد</p>
            <p class="font-bold text-text-secondary">
              {{ formatCurrency(project.contract_value) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-text-muted">القيمة المستحقة</p>
            <p class="font-bold text-text-primary">{{ formatCurrency(project.due_value) }}</p>
          </div>
          <div>
            <p class="text-sm text-text-muted">إجمالي المدفوع</p>
            <p class="font-bold text-success">
              {{ formatCurrency(project.total_paid || project.payments_sum_amount || 0) }}
            </p>
          </div>
        </div>

        <div v-if="reportData.projects?.length === 0" class="text-center py-8 text-text-muted">
          لا توجد مشاريع مسجلة.
        </div>
      </div>
    </AppCard>

    <div v-else class="text-center text-text-muted py-10">
      <p v-if="reportType === 'company'">الرجاء اختيار شركة من القائمة لعرض كشف حسابها.</p>
      <p v-else>الرجاء اختيار جهة مالكة من القائمة لعرض كشف حسابها.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PrinterIcon } from '@heroicons/vue/24/outline'
import AppButton from '@/components/ui/AppButton.vue'
import reportService from '@/services/reportService'
import { useToast } from 'vue-toastification'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'
import AppCard from '@/components/ui/AppCard.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import OwnersDropdown from '@/components/forms/OwnersDropdown.vue'
import { formatCurrency } from '@/utils/formatters'

const toast = useToast()
const router = useRouter()

// نوع التقرير: 'company' أو 'owner'
const reportType = ref('company')
// المعرف المختار (سواء كان id شركة أو id مالك)
const selectedId = ref(null)

const reportData = ref(null)
const loading = ref(false)
const error = ref(null)

// دالة لتصفير البيانات عند تغيير نوع التقرير
const resetData = () => {
  selectedId.value = null
  reportData.value = null
  error.value = null
}

async function fetchReport() {
  if (!selectedId.value) {
    reportData.value = null
    return
  }

  loading.value = true
  error.value = null
  reportData.value = null

  try {
    let response

    // جلب البيانات بناءً على النوع المختار بشكل مستقل
    if (reportType.value === 'company') {
      response = await reportService.getCompanyStatement(selectedId.value)
    } else {
      // يجب التأكد من وجود هذه الدالة في ملف reportService كما شرحنا سابقاً
      response = await reportService.getOwnerStatement(selectedId.value)
    }

    reportData.value = response.data.data
  } catch (err) {
    error.value = 'فشل في تحميل بيانات التقرير. الرجاء المحاولة مرة أخرى.'
    toast.error(error.value)
    console.error(err)
  } finally {
    loading.value = false
  }
}

const reportTitle = computed(() => {
  if (!reportData.value) return 'تقرير كشف الحساب'
  return reportType.value === 'company' ? `كشف حساب شركة` : `كشف حساب جهة مالكة`
})

const handlePrint = () => {
  if (!reportData.value) return

  // نرسل نوع التقرير مع البيانات ليتم تنسيق الطباعة بشكل صحيح
  const printPayload = {
    ...reportData.value,
    reportType: reportType.value, // إضافة النوع لتمييزه في صفحة الطباعة
  }

  sessionStorage.setItem('printStatementData', JSON.stringify(printPayload))
  const routeData = router.resolve({ name: 'PrintCompanyStatement' })
  window.open(routeData.href, '_blank')
}
</script>
