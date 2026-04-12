<!--src\modules\hr\views\contracts\ContractFormPage.vue-->
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
            {{ isEditMode ? 'تعديل بيانات العقد' : 'إبرام عقد جديد' }}
          </h1>
          <p class="text-sm text-text-muted mt-1">
            {{
              isEditMode
                ? 'تحديث تفاصيل العقد المالي والتواريخ.'
                : 'ربط الموظف بهيكل راتب وتحديد فترة سريان العقد.'
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
            <AppDropdown
              id="employee_id"
              label="الموظف *"
              v-model="form.employee_id"
              :options="employees"
              option-label="full_name"
              option-value="id"
              placeholder="-- اختر الموظف --"
              :disabled="isEditMode"
              required
            />
            <p v-if="isEditMode" class="text-xs text-amber-500 mt-1">
              لا يمكن تغيير الموظف بعد إنشاء العقد. لربط موظف آخر، قم بإنشاء عقد جديد.
            </p>
          </div>

          <div>
            <AppDropdown
              id="salary_structure_id"
              label="هيكل الراتب *"
              v-model="form.salary_structure_id"
              :options="salaryStructures"
              option-label="name"
              option-value="id"
              placeholder="-- اختر هيكل الراتب --"
              required
            />
          </div>

          <div>
            <AppInput
              id="basic_salary"
              type="number"
              label="الراتب الأساسي *"
              v-model="form.basic_salary"
              min="0"
              step="0.01"
              class="font-mono text-left"
              dir="ltr"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <AppInput
              id="start_date"
              type="date"
              label="تاريخ بداية العقد *"
              v-model="form.start_date"
              required
            />
          </div>

          <div>
            <AppInput
              id="end_date"
              type="date"
              label="تاريخ نهاية العقد (اختياري)"
              v-model="form.end_date"
              placeholder="يترك فارغاً للعقود غير المحددة المدة"
            />
          </div>

          <div class="md:col-span-2 pt-4 border-t border-surface-border">
            <label class="block text-sm font-medium text-text-primary mb-2">
              نسخة العقد الموقعة (اختياري)
            </label>
            <div class="flex items-center gap-4">
              <input
                type="file"
                id="attachment"
                @change="handleFileUpload"
                accept=".pdf,.jpg,.jpeg,.png"
                class="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
              />
            </div>
            <p class="text-xs text-text-secondary mt-2">
              الصيغ المدعومة: PDF, JPG, PNG. الحد الأقصى: 2MB.
            </p>

            <div v-if="isEditMode && currentAttachmentUrl" class="mt-3 flex items-center gap-2">
              <span class="text-sm text-emerald-600">يوجد مرفق حالي:</span>
              <a
                :href="currentAttachmentUrl"
                target="_blank"
                class="text-sm text-sky-500 hover:underline"
              >
                عرض المرفق السابق
              </a>
            </div>
          </div>
        </div>
      </AppCard>

      <div class="flex justify-end gap-3">
        <AppButton variant="secondary" @click="goBack" :disabled="isSaving"> إلغاء </AppButton>
        <AppButton @click="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'اعتماد العقد' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

// استيراد مكونات الواجهة الأساسية
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

// استيراد المتاجر (Stores)
import { useContractStore } from '@/modules/hr/stores/contractStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useSalaryStructureStore } from '@/modules/hr/stores/salaryStructureStore'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const contractStore = useContractStore()
const employeeStore = useEmployeeStore()
const salaryStructureStore = useSalaryStructureStore()

const isEditMode = computed(() => route.name === 'contracts.edit')
const contractId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

// القوائم المنسدلة
const employees = ref([])
const salaryStructures = ref([])
const currentAttachmentUrl = ref(null)

const defaultForm = () => ({
  employee_id: null,
  salary_structure_id: null,
  basic_salary: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
})

const form = ref(defaultForm())
const attachmentFile = ref(null)

onMounted(async () => {
  isLoadingData.value = true

  try {
    // 1. جلب الموظفين (للقائمة المنسدلة)
    if (employeeStore.employees.length === 0) {
      await employeeStore.fetchEmployees({ per_page: 500 })
    }
    employees.value = employeeStore.employees

    // 2. جلب هياكل الرواتب النشطة فقط
    await salaryStructureStore.fetchStructures({ per_page: 500, is_active: 1 })
    salaryStructures.value = salaryStructureStore.structures

    // 3. تعبئة البيانات في حالة التعديل
    if (isEditMode.value) {
      const contractData = await contractStore.fetchContractById(contractId.value)

      form.value = {
        employee_id: contractData.employee?.id || contractData.employee_id,
        salary_structure_id: contractData.salary_structure?.id || contractData.salary_structure_id,
        basic_salary: contractData.basic_salary,
        start_date: contractData.start_date,
        end_date: contractData.end_date || '',
      }
      currentAttachmentUrl.value = contractData.attachment_url
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    attachmentFile.value = file
  } else {
    attachmentFile.value = null
  }
}

const goBack = () => {
  router.push({ name: 'ContractsList' })
}

const submit = async () => {
  if (!form.value.employee_id) return toast.error('يجب اختيار الموظف.')
  if (!form.value.salary_structure_id) return toast.error('يجب اختيار هيكل الراتب.')
  if (!form.value.basic_salary || form.value.basic_salary < 0)
    return toast.error('الراتب الأساسي غير صالح.')
  if (!form.value.start_date) return toast.error('تاريخ البداية مطلوب.')

  isSaving.value = true

  // استخدام FormData لدعم رفع الملفات
  const formData = new FormData()
  formData.append('employee_id', form.value.employee_id)
  formData.append('salary_structure_id', form.value.salary_structure_id)
  formData.append('basic_salary', form.value.basic_salary)
  formData.append('start_date', form.value.start_date)

  if (form.value.end_date) {
    formData.append('end_date', form.value.end_date)
  }

  if (attachmentFile.value) {
    formData.append('attachment', attachmentFile.value)
  }

  try {
    if (isEditMode.value) {
      // تنبيه لارافيل: عند استخدام FormData لتحديث مورد، يجب إرسالها كـ POST مع تمرير _method=PUT
      formData.append('_method', 'PUT')

      await contractStore.updateContract(contractId.value, formData)
      toast.success('تم تحديث العقد بنجاح.')
    } else {
      await contractStore.createContract(formData)
      toast.success('تم إبرام العقد الجديد بنجاح.')
    }
    goBack()
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || 'فشل حفظ البيانات. يرجى مراجعة الحقول والملف المرفق.'
    toast.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}
</script>
