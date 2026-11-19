<!-- src/modules/hr/views/overtime-policies/OvertimePolicyFormPage.vue -->
<template>
  <div class="space-y-3 max-w-5xl mx-auto pb-24 text-right font-sans" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة -->
    <FullScreenLoader :show="isLoadingData" message="جاري تحميل بيانات سياسة العمل الإضافي..." />

    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="goBack"
          class="p-1.5 rounded-lg bg-surface-card border border-surface-border text-text-secondary hover:text-primary hover:border-primary/60 transition-colors shadow-2xs cursor-pointer"
          title="العودة لقائمة سياسات العمل الإضافي"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <h1 class="text-sm sm:text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3.5 bg-primary rounded-full"></span>
          <span>{{
            isEditMode ? 'تعديل سياسة العمل الإضافي' : 'إضافة سياسة عمل إضافي جديدة'
          }}</span>
        </h1>

        <span
          v-if="isEditMode && policyId"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          #{{ policyId }}
        </span>
      </div>
    </div>

    <!-- محتوى النموذج -->
    <div v-if="!isLoadingData" class="space-y-3">
      <!-- 1. بطاقة الترويسة: المعايير العامة ومعدلات الاحتساب -->
      <div
        class="p-4 bg-surface-header/70 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm space-y-3 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-primary/15">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>المعايير العامة ومعدلات الاحتساب</span>
          </span>
          <span class="text-[10px] font-bold text-text-muted">الحقول المميزة بـ * إلزامية</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- اسم السياسة -->
          <div class="md:col-span-2">
            <AppInput
              id="name"
              type="text"
              label="اسم السياسة *"
              v-model="form.name"
              placeholder="مثال: سياسة عمال المصنع"
              required
            />
          </div>

          <!-- مصدر احتساب الساعات الإضافية -->
          <div class="md:col-span-2">
            <AppDropdown
              id="overtime_source"
              label="مصدر احتساب الساعات الإضافية *"
              v-model="form.overtime_source"
              :options="sourceOptions"
              option-label="label"
              option-value="value"
              required
            />
            <p class="text-[11px] text-text-secondary mt-1 pr-1">
              {{
                form.overtime_source === 'supervisor'
                  ? 'يتم احتساب الساعات الإضافية حصراً بناءً على ما يعتمده ويدخله المشرف في سجل الحضور.'
                  : 'يتم احتساب الساعات الإضافية تلقائياً من الفارق الزمني بين بصمتي الدخول والخروج.'
              }}
            </p>
          </div>

          <!-- أيام العمل في الشهر -->
          <div>
            <AppInput
              id="working_days_per_month"
              type="number"
              label="أيام العمل في الشهر *"
              v-model="form.working_days_per_month"
              min="1"
              max="31"
              class="font-mono text-left"
              dir="ltr"
              required
            />
          </div>

          <!-- ساعات العمل في اليوم -->
          <div>
            <AppInput
              id="working_hours_per_day"
              type="number"
              label="ساعات العمل في اليوم *"
              v-model="form.working_hours_per_day"
              min="1"
              max="24"
              class="font-mono text-left"
              dir="ltr"
              required
            />
          </div>

          <!-- معدل الإضافي العادي -->
          <div>
            <AppInput
              id="regular_rate"
              type="number"
              step="0.01"
              label="معدل الإضافي العادي *"
              v-model="form.regular_rate"
              min="1"
              dir="ltr"
              class="font-mono text-left"
              required
            />
          </div>

          <!-- معدل عطلة نهاية الأسبوع -->
          <div>
            <AppInput
              id="weekend_rate"
              type="number"
              step="0.01"
              label="معدل عطلة نهاية الأسبوع *"
              v-model="form.weekend_rate"
              min="1"
              dir="ltr"
              class="font-mono text-left"
              required
            />
          </div>

          <!-- معدل العطلات الرسمية -->
          <div>
            <AppInput
              id="holiday_rate"
              type="number"
              step="0.01"
              label="معدل العطلات الرسمية / الطوارئ *"
              v-model="form.holiday_rate"
              min="1"
              dir="ltr"
              class="font-mono text-left"
              required
            />
          </div>

          <!-- طريقة حساب الإضافي -->
          <div>
            <AppDropdown
              id="is_daily_basis"
              label="طريقة حساب الإضافي *"
              v-model="form.is_daily_basis"
              :options="basisOptions"
              option-label="label"
              option-value="value"
              required
            />
          </div>

          <!-- حد الساعات لاحتساب يوم كامل -->
          <div
            v-if="form.is_daily_basis"
            class="md:col-span-2 p-3.5 bg-surface-card rounded-xl border border-info/40 shadow-2xs space-y-2"
          >
            <AppInput
              id="hours_to_day_threshold"
              type="number"
              label="حد الساعات لاحتساب يوم كامل *"
              v-model="form.hours_to_day_threshold"
              min="1"
              max="24"
              placeholder="مثال: 5"
              class="font-mono text-left"
              dir="ltr"
              required
            />
            <p class="text-[11px] text-info font-bold flex items-center gap-1.5">
              <span>•</span>
              <span>
                إذا تجاوز الموظف هذا العدد من الساعات، سيتم تحويل الإضافي تلقائياً إلى "يوم عمل
                كامل".
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- 2. بطاقة طريقة احتساب أجر الساعة والضريبة -->
      <div
        class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-3 transition-colors duration-200"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-surface-border/80"
        >
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
            <span>طريقة احتساب أجر الساعة والضريبة</span>
          </span>
          <span class="text-[10px] text-text-muted">
            تخصيص تسعير الساعة أو استقطاع الضريبة (أو ترك القيم الافتراضية)
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- نسبة الراتب المعتمدة للساعة -->
          <div>
            <AppInput
              id="wage_factor"
              type="number"
              step="0.01"
              min="0.01"
              max="2.00"
              label="نسبة الراتب المعتمدة للساعة"
              v-model="form.wage_factor"
              placeholder="1.00"
              dir="ltr"
              class="font-mono text-left"
            />
            <p class="text-[11px] text-text-muted mt-1 pr-1 leading-relaxed">
              الافتراضي <strong class="font-mono text-primary">1.00</strong> (100% من الراتب)، أو
              اكتب <strong class="font-mono text-warning">0.76</strong> (لـ 76%).
            </p>
          </div>

          <!-- ساعات الشهر الثابتة -->
          <div>
            <AppInput
              id="fixed_monthly_hours"
              type="number"
              min="1"
              max="744"
              label="ساعات الشهر الثابتة"
              v-model="form.fixed_monthly_hours"
              placeholder="تلقائي (أيام × ساعات الدوام)"
              dir="ltr"
              class="font-mono text-left"
            />
            <p class="text-[11px] text-text-muted mt-1 pr-1 leading-relaxed">
              اتركه فارغاً للحساب التلقائي، أو حدد ساعات ثابتة مثل
              <strong class="font-mono text-primary">176</strong> ساعة.
            </p>
          </div>

          <!-- نسبة ضريبة الإضافي -->
          <div>
            <AppInput
              id="tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              label="نسبة ضريبة الإضافي (%)"
              v-model="form.tax_rate"
              placeholder="0.00"
              dir="ltr"
              class="font-mono text-left"
            />
            <p class="text-[11px] text-text-muted mt-1 pr-1 leading-relaxed">
              الافتراضي <strong class="font-mono text-primary">0%</strong> (بدون ضريبة)، أو حدد
              <strong class="font-mono text-danger">15%</strong> للاستقطاع المباشر.
            </p>
          </div>

          <!-- الفئات المعفاة من الضريبة -->
          <div
            v-if="Number(form.tax_rate) > 0"
            class="md:col-span-3 p-3.5 bg-warning/10 rounded-xl border border-warning/35 space-y-2.5"
          >
            <span class="text-xs font-black text-warning block">
              الفئات المعفاة من خصم الضريبة:
            </span>

            <div class="flex flex-wrap gap-2">
              <label
                v-for="exemptOpt in exemptTypeOptions"
                :key="exemptOpt.value"
                class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all select-none text-xs font-bold"
                :class="
                  form.tax_exempt_employment_types.includes(exemptOpt.value)
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-2xs'
                    : 'bg-surface-card border-surface-border text-text-secondary hover:border-primary/50 hover:text-primary'
                "
              >
                <input
                  type="checkbox"
                  :value="exemptOpt.value"
                  v-model="form.tax_exempt_employment_types"
                  class="hidden"
                />
                <div
                  class="w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0"
                  :class="
                    form.tax_exempt_employment_types.includes(exemptOpt.value)
                      ? 'bg-primary border-primary'
                      : 'bg-surface-ground border-surface-border'
                  "
                >
                  <svg
                    v-if="form.tax_exempt_employment_types.includes(exemptOpt.value)"
                    class="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{{ exemptOpt.label }}</span>
              </label>
            </div>

            <p class="text-[11px] text-text-secondary font-medium">
              سيتم إعفاء الموظفين التابعين لهذه الفئات من خصم الـ
              <strong class="font-mono text-warning">{{ form.tax_rate }}%</strong> وصرف أجر الإضافي
              كاملاً.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- شريط الإجراءات السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        <span>تُطبق هذه السياسة تلقائياً على العقود المرتبطة بها عند احتساب مسير الرواتب.</span>
      </div>

      <div class="flex items-center gap-2">
        <AppButton type="button" variant="secondary" size="sm" @click="goBack" :disabled="isSaving">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" @click="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة السياسة' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

import { useOvertimePolicyStore } from '@/modules/hr/stores/overtimePolicyStore'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const policyStore = useOvertimePolicyStore()

const isEditMode = computed(() => route.name === 'overtime-policies.edit')
const policyId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

const sourceOptions = [
  { label: 'اعتماد المشرف (إدخال يدوي للساعات الإضافية)', value: 'supervisor' },
  { label: 'تلقائي من البصمة (حساب الفارق الزمني الفعلي)', value: 'punch' },
]

const basisOptions = [
  { label: 'حساب بنظام الساعات (تجميع الساعات الإضافية)', value: false },
  { label: 'حساب بنظام الأيام (تحويل الساعات ليوم كامل)', value: true },
]

const exemptTypeOptions = [
  { value: 'daily', label: 'عمال اليومية (Daily Workers)' },
  { value: 'temporary', label: 'العمالة المؤقتة (Temporary Workers)' },
  { value: 'contract', label: 'المتعاقدون بعقود محددة (Contractors)' },
]

const defaultForm = () => ({
  name: '',
  overtime_source: 'supervisor',
  working_days_per_month: 30,
  working_hours_per_day: 8,
  regular_rate: 1.5,
  weekend_rate: 2.0,
  holiday_rate: 2.0,
  is_daily_basis: false,
  hours_to_day_threshold: 8,
  wage_factor: 1.0,
  fixed_monthly_hours: null,
  tax_rate: 0.0,
  tax_exempt_employment_types: ['daily', 'temporary'],
})

const form = ref(defaultForm())

onMounted(async () => {
  if (isEditMode.value) {
    isLoadingData.value = true
    try {
      const policyData = await policyStore.fetchPolicyById(policyId.value)
      form.value = {
        name: policyData.name,
        overtime_source: policyData.overtime_source || 'supervisor',
        working_days_per_month: policyData.working_days_per_month,
        working_hours_per_day: policyData.working_hours_per_day,
        regular_rate: policyData.regular_rate,
        weekend_rate: policyData.weekend_rate,
        holiday_rate: policyData.holiday_rate,
        is_daily_basis: Boolean(policyData.is_daily_basis),
        hours_to_day_threshold: policyData.hours_to_day_threshold,
        wage_factor:
          policyData.wage_factor !== undefined && policyData.wage_factor !== null
            ? Number(policyData.wage_factor)
            : 1.0,
        fixed_monthly_hours: policyData.fixed_monthly_hours
          ? Number(policyData.fixed_monthly_hours)
          : null,
        tax_rate:
          policyData.tax_rate !== undefined && policyData.tax_rate !== null
            ? Number(policyData.tax_rate)
            : 0.0,
        tax_exempt_employment_types: Array.isArray(policyData.tax_exempt_employment_types)
          ? policyData.tax_exempt_employment_types
          : ['daily', 'temporary'],
      }
    } catch {
      toast.error('حدث خطأ أثناء تحميل تفاصيل السياسة.')
      goBack()
    } finally {
      isLoadingData.value = false
    }
  }
})

const goBack = () => {
  router.push({ name: 'OvertimePoliciesList' })
}

const submit = async () => {
  if (!form.value.name) return toast.error('اسم السياسة مطلوب.')
  if (!form.value.overtime_source) return toast.error('مصدر احتساب الساعات الإضافية مطلوب.')
  if (form.value.is_daily_basis && !form.value.hours_to_day_threshold) {
    return toast.error('يجب تحديد حد الساعات لاحتساب يوم كامل.')
  }

  isSaving.value = true

  const payload = {
    ...form.value,
    wage_factor: form.value.wage_factor ? Number(form.value.wage_factor) : 1.0,
    fixed_monthly_hours: form.value.fixed_monthly_hours
      ? Number(form.value.fixed_monthly_hours)
      : null,
    tax_rate: form.value.tax_rate ? Number(form.value.tax_rate) : 0.0,
    tax_exempt_employment_types: form.value.tax_exempt_employment_types || [],
  }

  try {
    if (isEditMode.value) {
      await policyStore.updatePolicy(policyId.value, payload)
      toast.success('تم تحديث السياسة بنجاح.')
    } else {
      await policyStore.createPolicy(payload)
      toast.success('تم إضافة السياسة الجديدة بنجاح.')
    }
    goBack()
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'فشل حفظ البيانات. يرجى المراجعة.'
    toast.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}
</script>
