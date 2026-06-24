<template>
  <AppDialog
    :model-value="isOpen"
    @update:model-value="handleClose"
    title="الملف الرقمي التفصيلي للمتقدم"
    size="max-w-3xl"
  >
    <div class="space-y-6 text-right -mt-2 pb-2" dir="rtl">
      <div
        class="flex flex-col sm:flex-row justify-between items-center gap-5 bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden"
      >
        <div class="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <div
            @click="isPhotoZoomed = true"
            class="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 shadow-md bg-slate-800 shrink-0 cursor-pointer hover:ring-4 hover:ring-indigo-500/30 hover:border-indigo-400 transition-all duration-300 group relative"
            title="اضغط لتكبير الصورة الشخصية 🔍"
          >
            <img
              v-if="application?.photo_url"
              :src="application.photo_url"
              class="w-full h-full object-cover transform -scale-x-100 group-hover:scale-110 transition-transform duration-300"
              alt="صورة المتدرب"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold"
            >
              HR
            </div>
            <div
              class="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
            >
              تكبير 👁️
            </div>
          </div>

          <div class="text-center sm:text-right space-y-1">
            <h4 class="text-base font-black text-slate-100 tracking-wide">
              {{ application?.full_name }}
            </h4>
            <div
              class="flex flex-wrap justify-center sm:justify-start items-center gap-x-3 gap-y-1 text-xs"
            >
              <span class="text-slate-400 font-bold font-mono">هاتف: {{ application?.phone }}</span>
              <span v-if="application?.email" class="text-slate-600 font-bold">|</span>
              <span v-if="application?.email" class="text-slate-400 font-medium font-mono">{{
                application?.email
              }}</span>
            </div>
            <div class="pt-1">
              <span
                v-if="application?.national_id"
                class="inline-block text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md"
              >
                هوية/إقامة: {{ application.national_id }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-center">
          <span
            class="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-xl text-xs font-black border border-indigo-500/10 shadow-sm"
          >
            ID: #{{ application?.id }}
          </span>
          <button
            @click="handleClose"
            type="button"
            class="text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl transition-colors"
            :disabled="store.loading"
          >
            إغلاق ✕
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
          <span class="block text-[10px] font-bold text-slate-500 mb-1"
            >المنشأة التعليمية / الجامعة</span
          >
          <span class="text-xs font-extrabold text-slate-200">{{
            application?.academic_institution
          }}</span>
        </div>
        <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
          <span class="block text-[10px] font-bold text-slate-500 mb-1"
            >التخصص الدراسي الرئيسي</span
          >
          <span class="text-xs font-extrabold text-slate-200">{{
            application?.academic_major
          }}</span>
        </div>
        <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
          <span class="block text-[10px] font-bold text-slate-500 mb-1"
            >تاريخ بدء التدريب الأكاديمي</span
          >
          <span class="text-xs font-bold font-mono text-emerald-400">{{
            application?.internship_start_date
          }}</span>
        </div>
        <div class="border border-slate-800/60 p-3 rounded-xl bg-slate-950/20 shadow-sm">
          <span class="block text-[10px] font-bold text-slate-500 mb-1"
            >تاريخ انتهاء فترة التدريب</span
          >
          <span class="text-xs font-bold font-mono text-rose-400">{{
            application?.internship_end_date
          }}</span>
        </div>
      </div>

      <div class="border border-slate-800/60 p-4 rounded-xl bg-slate-950/20 shadow-sm">
        <span class="block text-[10px] font-bold text-slate-500 mb-1"
          >ملاحظات خاصة ملحقة بالطلب</span
        >
        <p class="text-xs font-medium text-slate-400 leading-relaxed">
          {{ application?.notes || 'لا توجد أي ملاحظات إضافية ملحقة مع هذا الطلب.' }}
        </p>
      </div>

      <div
        v-if="statusType === 'pending'"
        class="border-t border-dashed border-slate-800 pt-4 space-y-4"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-1.5 h-3.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50"
          ></span>
          <h5 class="text-xs font-black text-slate-200">
            إجراءات الاعتماد والتعميد الإداري والمالي
          </h5>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppDropdown
            id="working_schedule_id"
            label="اختر الوردية وجدول العمل لضبط الحضور *"
            v-model="approvalForm.working_schedule_id"
            :options="schedules"
            option-label="name"
            option-value="id"
            placeholder="-- برجاء اختيار جدول العمل --"
            required
          />

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-400 mb-1"
              >المكافأة المالية المقطوعة شهرياً *</label
            >
            <input
              v-model.number="approvalForm.basic_salary"
              type="number"
              min="0"
              placeholder="أدخل 0 إذا كان التدريب غير مدفوع..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-100 text-right focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>

          <AppDropdown
            id="department_id"
            label="الإدارة / القسم (اختياري)"
            v-model="approvalForm.department_id"
            :options="flatDepartments"
            option-label="dropdownName"
            option-value="id"
            placeholder="-- لا يتبع لقسم محدد حالياً --"
          />

          <AppDropdown
            id="manager_id"
            label="المشرف / المدير المباشر (اختياري)"
            v-model="approvalForm.manager_id"
            :options="allEmployees"
            option-label="full_name"
            option-value="id"
            placeholder="-- بدون مشرف مباشر حالياً --"
          />
        </div>
      </div>

      <div class="border-t border-slate-800 pt-4 mt-2 flex flex-wrap justify-end gap-3 shrink-0">
        <button
          v-if="statusType !== 'pending'"
          @click="handleClose"
          type="button"
          class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
        >
          إغلاق النافذة
        </button>

        <template v-else>
          <button
            @click="handleReject"
            :disabled="store.loading"
            type="button"
            class="px-4 py-2.5 text-xs font-extrabold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {{ store.loading ? 'جاري المعالجة...' : 'رفض الطلب فوراً ❌' }}
          </button>

          <button
            @click="handleApprove"
            :disabled="store.loading"
            type="button"
            class="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg
              v-if="store.loading"
              class="animate-spin h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ store.loading ? 'جاري التوثيق...' : 'اعتماد وقبول المتدرب رسمياً 🟢' }}</span>
          </button>
        </template>
      </div>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isPhotoZoomed && application?.photo_url"
        class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        @click="isPhotoZoomed = false"
      >
        <div
          class="relative max-w-xl w-full flex flex-col items-center justify-center transform scale-100 transition-all"
        >
          <img
            :src="application.photo_url"
            class="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-800 bg-slate-900 transform -scale-x-100"
            alt="معاينة الصورة المكبرة"
          />
          <button
            @click.stop="isPhotoZoomed = false"
            type="button"
            class="mt-4 px-4 py-2 text-xs font-black text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl shadow-md transition-all active:scale-95"
          >
            ✕ إغلاق المعاينة
          </button>
        </div>
      </div>
    </Transition>
  </AppDialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useInternshipStore } from '@/modules/hr/stores/internshipStore'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useWorkingScheduleStore } from '@/modules/hr/stores/workingScheduleStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  application: { type: Object, default: null },
  statusType: { type: String, default: 'pending' },
})

const emit = defineEmits(['update:isOpen', 'refresh'])

const toast = useToast()
const store = useInternshipStore()

// تهيئة واستخراج مصفوفات المتاجر عبر خطة التفاعلية الصارمة (storeToRefs)
const departmentStore = useDepartmentStore()
const { flatDepartments } = storeToRefs(departmentStore)

const employeeStore = useEmployeeStore()
const { allEmployees } = storeToRefs(employeeStore)

const scheduleStore = useWorkingScheduleStore()
const { schedules } = storeToRefs(scheduleStore)

const isPhotoZoomed = ref(false)

const approvalForm = ref({
  working_schedule_id: '',
  basic_salary: 0,
  department_id: null,
  manager_id: null,
})

// المحرك المركزي الموحد لتهيئة البيانات وحقن الـ Hydration بشكل متزامن وآمن
const initModal = async () => {
  isPhotoZoomed.value = false
  approvalForm.value = {
    working_schedule_id: '',
    basic_salary: 0,
    department_id: props.application?.department_id || null,
    manager_id: props.application?.manager_id || null,
  }

  if (props.statusType === 'pending') {
    try {
      await Promise.all([
        flatDepartments.value.length === 0 ? departmentStore.fetchDepartments() : null,
        !allEmployees.value || allEmployees.value.length === 0
          ? employeeStore.fetchAllEmployees()
          : null,
        schedules.value.length === 0 ? scheduleStore.fetchSchedules({ per_page: 100 }) : null,
      ])
    } catch (err) {
      console.error('Failed to load dropdowns for intern approval workflow', err)
    }
  }
}

// التوثيق عند عملية التركيب الأولى والـ v-if الفعلي للشاشة
onMounted(() => {
  if (props.isOpen) {
    initModal()
  }
})

// رصد التغييرات المتلاحقة في حال إعادة فتح المودال لبيانات متدرب آخر
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      initModal()
    }
  },
)

const handleClose = () => {
  if (store.loading) return
  emit('update:isOpen', false)
}

const handleApprove = async () => {
  if (!approvalForm.value.working_schedule_id) {
    return toast.error('برجاء تحديد جدول العمل والوردية الخاصة بالمتدرب لربط نظام الحضور.')
  }
  if (
    approvalForm.value.basic_salary === null ||
    approvalForm.value.basic_salary === undefined ||
    approvalForm.value.basic_salary < 0
  ) {
    return toast.error('برجاء إدخل قيمة المكافأة المالية المقطوعة.')
  }

  try {
    await store.approveIntern(props.application.id, approvalForm.value)
    toast.success(`تم قبول واعتماد المتدرب (${props.application.full_name}) بنجاح.`)
    emit('refresh')
    emit('update:isOpen', false)
  } catch {
    toast.error(store.error || 'فشلت عملية اعتماد المتدرب.')
  }
}

const handleReject = async () => {
  try {
    await store.rejectIntern(props.application.id)
    toast.success(`تم رفض طلب الانضمام المقدم من المتقدم (${props.application.full_name}).`)
    emit('refresh')
    emit('update:isOpen', false)
  } catch {
    toast.error(store.error || 'فشلت عملية رفض طلب التدريب.')
  }
}
</script>
