<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 rounded-lg bg-surface-section border border-surface-border hover:bg-surface-border transition-colors"
          title="العودة للقائمة"
        >
          <svg class="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-text-primary">
            {{ isEditMode ? 'تعديل سياسة العمل الإضافي' : 'إضافة سياسة جديدة' }}
          </h1>
          <p class="text-sm text-text-muted mt-1">
            {{
              isEditMode
                ? 'تحديث معدلات ومعايير السياسة الحالية.'
                : 'إنشاء سياسة جديدة لربطها لاحقاً بعقود الموظفين.'
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="isLoadingData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <AppCard class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div>
            <AppInput
              id="working_days_per_month"
              type="number"
              label="أيام العمل في الشهر *"
              v-model="form.working_days_per_month"
              min="1"
              max="31"
              required
            />
          </div>

          <div>
            <AppInput
              id="working_hours_per_day"
              type="number"
              label="ساعات العمل في اليوم *"
              v-model="form.working_hours_per_day"
              min="1"
              max="24"
              required
            />
          </div>

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

          <div>
            <AppInput
              id="holiday_rate"
              type="number"
              step="0.01"
              label="معدل العطلات الرسمية *"
              v-model="form.holiday_rate"
              min="1"
              dir="ltr"
              class="font-mono text-left"
              required
            />
          </div>

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

          <div
            v-if="form.is_daily_basis"
            class="md:col-span-2 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-100 dark:border-sky-800/30"
          >
            <AppInput
              id="hours_to_day_threshold"
              type="number"
              label="حد الساعات لاحتساب يوم كامل *"
              v-model="form.hours_to_day_threshold"
              min="1"
              max="24"
              placeholder="مثال: 5"
              required
            />
            <p class="text-xs text-sky-600 mt-2">
              إذا تجاوز الموظف هذا العدد من الساعات، سيتم تحويل الإضافي تلقائياً إلى "يوم عمل كامل".
            </p>
          </div>
        </div>
      </AppCard>

      <div class="flex justify-end gap-3">
        <AppButton variant="secondary" @click="goBack" :disabled="isSaving"> إلغاء </AppButton>
        <AppButton @click="submit" :disabled="isSaving">
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

import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

import { useOvertimePolicyStore } from '@/modules/hr/stores/overtimePolicyStore'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const policyStore = useOvertimePolicyStore()

const isEditMode = computed(() => route.name === 'overtime-policies.edit')
const policyId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

const basisOptions = [
  { label: 'حساب بنظام الساعات (تجميع الساعات الإضافية)', value: false },
  { label: 'حساب بنظام الأيام (تحويل الساعات ليوم كامل)', value: true },
]

const defaultForm = () => ({
  name: '',
  working_days_per_month: 30,
  working_hours_per_day: 8,
  regular_rate: 1.5,
  weekend_rate: 2.0,
  holiday_rate: 2.0,
  is_daily_basis: false,
  hours_to_day_threshold: 8,
})

const form = ref(defaultForm())

onMounted(async () => {
  if (isEditMode.value) {
    isLoadingData.value = true
    try {
      const policyData = await policyStore.fetchPolicyById(policyId.value)
      form.value = {
        name: policyData.name,
        working_days_per_month: policyData.working_days_per_month,
        working_hours_per_day: policyData.working_hours_per_day,
        regular_rate: policyData.regular_rate,
        weekend_rate: policyData.weekend_rate,
        holiday_rate: policyData.holiday_rate,
        is_daily_basis: Boolean(policyData.is_daily_basis),
        hours_to_day_threshold: policyData.hours_to_day_threshold,
      }
    } catch (error) {
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
  // تحقق بسيط (Simple Validation)
  if (!form.value.name) return toast.error('اسم السياسة مطلوب.')
  if (form.value.is_daily_basis && !form.value.hours_to_day_threshold) {
    return toast.error('يجب تحديد حد الساعات لاحتساب يوم كامل.')
  }

  isSaving.value = true

  try {
    if (isEditMode.value) {
      await policyStore.updatePolicy(policyId.value, form.value)
      toast.success('تم تحديث السياسة بنجاح.')
    } else {
      await policyStore.createPolicy(form.value)
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
