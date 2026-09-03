<template>
  <div class="space-y-6">
    <!-- شريط العنوان وأزرار التحكم العليا -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">
          {{ isEditMode ? 'تعديل طلب الدعم والمنح' : 'إنشاء طلب دعم ومنح جديد' }}
        </h1>
        <p class="text-sm text-text-muted mt-1">
          إعداد وتجهيز خطاب الاحتياجات الموحد لكافة الأقسام لتقديمه للجهات الخارجية
        </p>
      </div>

      <div class="flex items-center gap-3">
        <AppButton variant="secondary" @click="router.push({ name: 'GrantRequestsList' })">
          إلغاء وعودة
        </AppButton>
        <AppButton :disabled="isSaving" @click="handleSubmit">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'تحديث الطلب' : 'حفظ الطلب' }}</span>
        </AppButton>
      </div>
    </div>

    <!-- بطاقة البيانات الأساسية لرأس الخطاب -->
    <AppCard>
      <div class="border-b border-surface-border pb-3 mb-5">
        <h2 class="text-lg font-semibold text-text-primary">البيانات الأساسية للخطاب</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- رقم الخطاب (توليد تلقائي) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            رقم الخطاب / الإشارة
          </label>
          <div class="relative">
            <input
              type="text"
              :value="isEditMode ? form.request_number : 'يتم التوليد تلقائياً عند الحفظ'"
              disabled
              class="block w-full px-3 py-2.5 border border-surface-border rounded-lg bg-surface-ground/80 text-text-muted font-mono text-sm cursor-not-allowed select-none"
            />
            <span
              v-if="!isEditMode"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
            >
              تلقائي
            </span>
          </div>
        </div>

        <AppInput
          id="target-organization"
          label="الجهة الموجه إليها الخطاب"
          v-model="form.target_organization"
          placeholder="مثال: وزارة التخطيط / منظمة اليونيسف"
          required
        />

        <AppInput
          id="request-title"
          label="موضوع الخطاب / عنوان الطلب"
          v-model="form.title"
          placeholder="مثال: طلب تجهيزات وأجهزة مكتبية"
          required
        />

        <AppInput
          id="request-date"
          type="date"
          label="تاريخ الخطاب"
          v-model="form.request_date"
          required
        />

        <div class="md:col-span-2 lg:col-span-4">
          <AppDropdown
            id="request-status"
            label="حالة الطلب"
            v-model="form.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="اختر حالة الطلب"
          />
        </div>

        <div class="md:col-span-2 lg:col-span-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1">
            ملاحظات أو ديباجة عامة
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="اكتب أي توضيحات إضافية أو مبررات عامة للطلب..."
            class="block w-full p-3 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all sm:text-sm"
          ></textarea>
        </div>
      </div>
    </AppCard>

    <!-- بطاقة بنود واحتياجات الأقسام -->
    <AppCard>
      <div class="border-b border-surface-border pb-3 mb-5">
        <h2 class="text-lg font-semibold text-text-primary">بنود واحتياجات الأقسام</h2>
        <p class="text-xs text-text-muted mt-0.5">
          قم بإضافة كافة الأجهزة والمواد المطلوبة وحدد القسم التابع لها
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(item, index) in form.items"
          :key="index"
          class="p-5 border rounded-xl space-y-4 relative transition-all duration-200"
          :class="[
            index % 2 === 0
              ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-xs'
              : 'bg-blue-50/70 dark:bg-sky-950/20 border-blue-200 dark:border-sky-800/50 shadow-xs',
          ]"
        >
          <!-- ترويسة البند والتمييز البصري -->
          <div class="flex justify-between items-center pb-2 border-b border-surface-border/60">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs"
                :class="[
                  index % 2 === 0
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    : 'bg-blue-600 text-white dark:bg-sky-600 dark:text-white',
                ]"
              >
                {{ index + 1 }}
              </span>
              <span
                class="text-xs font-bold"
                :class="[
                  index % 2 === 0
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-blue-700 dark:text-sky-300',
                ]"
              >
                البند رقم ({{ index + 1 }})
              </span>
            </div>

            <button
              v-if="form.items.length > 1"
              type="button"
              @click="removeItem(index)"
              class="text-rose-500 hover:text-rose-700 text-sm flex items-center gap-1 transition-colors cursor-pointer font-medium"
              title="حذف هذا البند"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              حذف البند
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- اختيار القسم -->
            <div class="lg:col-span-2">
              <AppDropdown
                :id="`item-dept-${index}`"
                label="القسم المستفيد"
                v-model="item.department_id"
                :options="departmentStore.flatDepartments"
                option-label="dropdownName"
                option-value="id"
                :loading="departmentStore.loading"
                placeholder="اختر القسم..."
                required
              />
            </div>

            <!-- اسم الجهاز / البند -->
            <div class="lg:col-span-2">
              <AppInput
                :id="`item-name-${index}`"
                label="اسم البند / الجهاز"
                v-model="item.item_name"
                placeholder="مثال: حاسوب مكتبي متكامل"
                required
              />
            </div>

            <!-- المواصفات الفنية -->
            <div class="md:col-span-2 lg:col-span-4">
              <AppInput
                :id="`item-spec-${index}`"
                label="المواصفات الفنية التفصيلية"
                v-model="item.specifications"
                placeholder="مثال: Core i7, 16GB RAM, 512GB SSD, شاشة 24 بوصة"
              />
            </div>

            <!-- الكمية -->
            <AppInput
              :id="`item-qty-${index}`"
              type="number"
              min="1"
              label="الكمية"
              v-model="item.quantity"
              placeholder="1"
              required
            />

            <!-- الوحدة -->
            <AppInput
              :id="`item-unit-${index}`"
              label="الوحدة"
              v-model="item.unit"
              placeholder="جهاز / طقم / حزمة"
            />

            <!-- التكلفة التقديرية (اختياري) -->
            <AppInput
              :id="`item-cost-${index}`"
              type="number"
              step="0.01"
              min="0"
              label="التكلفة التقديرية (إجمالي البند)"
              v-model="item.estimated_cost"
              placeholder="0.00"
            />

            <!-- ملاحظات البند -->
            <AppInput
              :id="`item-notes-${index}`"
              label="ملاحظات خاصة بالبند"
              v-model="item.notes"
              placeholder="ملاحظات إضافية"
            />
          </div>
        </div>
      </div>

      <!-- زر إضافة بند في الأسفل مباشرة -->
      <div class="mt-4 pt-2 flex justify-center">
        <button
          type="button"
          @click="addItem"
          class="w-full py-3 border-2 border-dashed border-primary/40 hover:border-primary rounded-xl text-primary font-semibold text-sm flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          إضافة بند جديد آخر
        </button>
      </div>

      <!-- ملخص إجمالي الطلب وأزرار التحكم السفلية -->
      <div
        class="mt-6 pt-4 border-t border-surface-border flex flex-wrap justify-between items-center gap-4 bg-surface-ground/30 p-4 rounded-xl"
      >
        <div class="flex items-center gap-6 text-sm">
          <div>
            <span class="text-text-muted">إجمالي عدد البنود:</span>
            <span class="font-bold text-text-primary mr-1">{{ totalItemsCount }}</span>
          </div>
          <div>
            <span class="text-text-muted">إجمالي الكميات:</span>
            <span class="font-bold text-text-primary mr-1">{{ totalQuantityCount }}</span>
          </div>
          <div v-if="totalCostSum > 0">
            <span class="text-text-muted">إجمالي التكلفة التقديرية:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 mr-1">{{
              formatCurrency(totalCostSum)
            }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <AppButton
            variant="secondary"
            type="button"
            @click="router.push({ name: 'GrantRequestsList' })"
          >
            إلغاء وعودة
          </AppButton>
          <AppButton type="button" @click="handleSubmit" :disabled="isSaving">
            <span v-if="isSaving">جاري الحفظ...</span>
            <span v-else>{{ isEditMode ? 'تحديث الطلب' : 'حفظ الطلب بالكامل' }}</span>
          </AppButton>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGrantRequestStore } from '@/stores/grantRequestStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useToast } from 'vue-toastification'

import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const grantRequestStore = useGrantRequestStore()
const departmentStore = useDepartmentStore()

const isSaving = ref(false)
const isEditMode = computed(() => !!route.params.id)

const statusOptions = [
  { label: 'مسودة', value: 'draft' },
  { label: 'تم التقديم', value: 'submitted' },
  { label: 'قيد المراجعة', value: 'under_review' },
  { label: 'موافقة جزئية', value: 'partially_approved' },
  { label: 'معتمد بالكامل', value: 'approved' },
  { label: 'مرفوض', value: 'rejected' },
  { label: 'مكتمل ومستلم', value: 'completed' },
]

const createEmptyItem = () => ({
  id: null,
  department_id: null,
  item_name: '',
  specifications: '',
  quantity: 1,
  unit: 'جهاز',
  estimated_cost: null,
  notes: '',
})

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const form = ref({
  id: null,
  request_number: '',
  target_organization: '',
  title: '',
  request_date: getTodayDate(),
  status: 'draft',
  notes: '',
  items: [createEmptyItem()],
})

const addItem = () => {
  form.value.items.push(createEmptyItem())
}

const removeItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const totalItemsCount = computed(() => form.value.items.length)

const totalQuantityCount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

const totalCostSum = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0)
})

const formatCurrency = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadInitialData = async () => {
  if (departmentStore.flatDepartments.length === 0) {
    await departmentStore.fetchDepartments()
  }

  if (isEditMode.value) {
    try {
      const id = route.params.id
      await grantRequestStore.fetchGrantRequest(id)
      const data = grantRequestStore.currentGrantRequest

      if (data) {
        form.value = {
          id: data.id,
          request_number: data.request_number,
          target_organization: data.target_organization,
          title: data.title,
          request_date: data.request_date,
          status: data.status,
          notes: data.notes || '',
          items:
            data.items && data.items.length > 0
              ? data.items.map((i) => ({
                  id: i.id,
                  department_id: i.department_id,
                  item_name: i.item_name,
                  specifications: i.specifications || '',
                  quantity: i.quantity,
                  unit: i.unit || '',
                  estimated_cost: i.estimated_cost || null,
                  notes: i.notes || '',
                }))
              : [createEmptyItem()],
        }
      }
    } catch {
      toast.error('حدث خطأ أثناء جلب بيانات الطلب.')
      router.push({ name: 'GrantRequestsList' })
    }
  }
}

const validateForm = () => {
  if (isEditMode.value && !form.value.request_number?.trim()) {
    toast.error('رقم الخطاب غير متوفر.')
    return false
  }
  if (!form.value.target_organization.trim()) {
    toast.error('يرجى تحديد الجهة الموجه إليها الخطاب.')
    return false
  }
  if (!form.value.title.trim()) {
    toast.error('يرجى كتابة عنوان أو موضوع الطلب.')
    return false
  }
  if (!form.value.request_date) {
    toast.error('يرجى تحديد تاريخ الخطاب.')
    return false
  }

  for (let i = 0; i < form.value.items.length; i++) {
    const item = form.value.items[i]
    if (!item.department_id) {
      toast.error(`يرجى تحديد القسم للبند رقم (${i + 1}).`)
      return false
    }
    if (!item.item_name.trim()) {
      toast.error(`يرجى إدخال اسم الجهاز/البند للبند رقم (${i + 1}).`)
      return false
    }
    if (!item.quantity || Number(item.quantity) < 1) {
      toast.error(`يرجى إدخال كمية صحيحة للبند رقم (${i + 1}).`)
      return false
    }
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSaving.value = true
  try {
    const payload = {
      request_number: isEditMode.value ? form.value.request_number : null,
      target_organization: form.value.target_organization,
      title: form.value.title,
      request_date: form.value.request_date,
      status: form.value.status,
      notes: form.value.notes,
      items: form.value.items.map((item) => ({
        id: item.id || undefined,
        department_id: item.department_id,
        item_name: item.item_name,
        specifications: item.specifications || null,
        quantity: Number(item.quantity),
        unit: item.unit || null,
        estimated_cost: item.estimated_cost ? Number(item.estimated_cost) : null,
        notes: item.notes || null,
      })),
    }

    if (isEditMode.value) {
      await grantRequestStore.updateGrantRequest(form.value.id, payload)
      toast.success('تم تحديث طلب الدعم بنجاح.')
    } else {
      await grantRequestStore.createGrantRequest(payload)
      toast.success('تم حفظ وتوليد رقم طلب الدعم بنجاح.')
    }

    router.push({ name: 'GrantRequestsList' })
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حفظ الطلب.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadInitialData()
})
</script>
