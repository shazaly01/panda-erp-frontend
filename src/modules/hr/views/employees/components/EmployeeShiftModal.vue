<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
    @click.self="close"
  >
    <div
      class="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <div class="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">إدارة وردية الموظف</h3>
            <p class="text-sm text-slate-400 mt-0.5">{{ employee?.full_name }}</p>
          </div>
        </div>
        <button
          @click="close"
          class="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="p-8 space-y-8">
        <div v-if="isLoadingData" class="flex flex-col items-center py-10 space-y-4">
          <div
            class="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"
          ></div>
          <p class="text-slate-400 text-sm italic">جاري جلب إعدادات الوردية الحالية...</p>
        </div>

        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-bold text-slate-300">الوردية المعتمدة *</label>
              <div class="relative">
                <select
                  v-model="form.shift_id"
                  class="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                >
                  <option :value="null" disabled class="bg-slate-800">-- اختر الوردية --</option>
                  <option
                    v-for="shift in shiftStore.shifts"
                    :key="shift.id"
                    :value="shift.id"
                    class="bg-slate-800"
                  >
                    {{ shift.name }} ({{ shift.start_time }} - {{ shift.end_time }})
                  </option>
                </select>
                <div
                  class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-bold text-slate-300">تاريخ بدء التفعيل *</label>
              <input
                type="date"
                v-model="form.start_date"
                class="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono custom-date-input"
              />
            </div>
          </div>

          <div class="space-y-4">
            <label class="block text-sm font-bold text-slate-300"
              >أيام الإجازة الأسبوعية (Weekend)</label
            >
            <div class="flex flex-wrap gap-3">
              <label
                v-for="day in dayOptions"
                :key="day.id"
                class="group flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-200 select-none"
                :class="
                  form.weekend_days.includes(day.id)
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500'
                "
              >
                <input type="checkbox" :value="day.id" v-model="form.weekend_days" class="hidden" />
                <div
                  class="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
                  :class="
                    form.weekend_days.includes(day.id)
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-transparent border-slate-600'
                  "
                >
                  <svg
                    v-if="form.weekend_days.includes(day.id)"
                    class="w-3.5 h-3.5 text-white"
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
                <span class="text-sm font-bold">{{ day.name }}</span>
              </label>
            </div>
            <div
              class="bg-blue-500/5 border border-dashed border-blue-500/20 p-4 rounded-2xl text-center"
            >
              <p class="text-xs text-slate-500 leading-relaxed italic">
                ملاحظة: النظام سيعرض لك الوردية النشطة حالياً للموظف إن وجدت.
              </p>
            </div>
          </div>
        </template>
      </div>

      <div class="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
        <button
          @click="close"
          class="px-6 py-3 rounded-xl text-slate-400 font-bold hover:bg-slate-800 transition-colors"
          :disabled="isSaving"
        >
          إلغاء
        </button>
        <button
          @click="save"
          class="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2"
          :disabled="isSaving || isLoadingData"
        >
          <span
            v-if="isSaving"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          {{ isSaving ? 'جاري المعالجة...' : 'اعتماد الوردية' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

const props = defineProps({
  modelValue: Boolean,
  employee: Object,
})

const emit = defineEmits(['update:modelValue', 'updated'])
const toast = useToast()
const shiftStore = useShiftStore()

const isSaving = ref(false)
const isLoadingData = ref(false)

const dayOptions = [
  { id: 'Sunday', name: 'الأحد' },
  { id: 'Monday', name: 'الاثنين' },
  { id: 'Tuesday', name: 'الثلاثاء' },
  { id: 'Wednesday', name: 'الأربعاء' },
  { id: 'Thursday', name: 'الخميس' },
  { id: 'Friday', name: 'الجمعة' },
  { id: 'Saturday', name: 'السبت' },
]

const form = ref({
  employee_id: null,
  shift_id: null,
  start_date: new Date().toISOString().split('T')[0],
  weekend_days: [],
})

// الدالة المسؤولة عن تصفير وتحميل البيانات
const resetAndFetchData = async () => {
  if (!props.employee) return

  // 1. تصفير النموذج وتعيين المعرف
  form.value.employee_id = Number(props.employee.id)
  form.value.shift_id = null
  form.value.weekend_days = []
  form.value.start_date = new Date().toISOString().split('T')[0]

  isLoadingData.value = true
  try {
    // 2. جلب سجل ورديات الموظف من الباك-إند عبر المتجر
    const history = await shiftStore.fetchEmployeeShifts(form.value.employee_id)

    // 3. البحث عن الوردية النشطة (التي ليس لها تاريخ نهاية)
    const activeShift = history.find((s) => s.end_date === null)

    if (activeShift) {
      form.value.shift_id = activeShift.shift_id
      form.value.weekend_days = activeShift.weekend_days || []
      // يمكنك أيضاً عرض تاريخ البدء الأصلي إذا أردت
      // form.value.start_date = activeShift.start_date
    }
  } catch (error) {
    console.error('فشل جلب الوردية الحالية للموظف')
  } finally {
    isLoadingData.value = false
  }
}

// مراقبة فتح النافذة
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetAndFetchData()
    }
  },
)

onMounted(async () => {
  if (shiftStore.shifts.length === 0) {
    await shiftStore.fetchShifts()
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const save = async () => {
  if (!form.value.shift_id) return toast.error('يرجى اختيار الوردية.')

  isSaving.value = true
  try {
    await shiftStore.assignEmployeeToShift(form.value)
    toast.success(`تم اعتماد الوردية بنجاح.`)
    emit('updated')
    close()
  } catch (error) {
    const msg = error.response?.data?.message || 'فشل الحفظ.'
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.custom-date-input {
  color-scheme: dark;
}
</style>
