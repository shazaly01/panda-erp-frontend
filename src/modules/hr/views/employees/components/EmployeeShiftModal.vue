<!-- src/modules/hr/views/employees/components/EmployeeShiftModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    title="إدارة وردية الموظف"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <div
      class="-m-3 p-4 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3.5 text-right font-sans transition-colors duration-200"
      dir="rtl"
    >
      <!-- بطاقة تعريف الموظف النشط -->
      <div
        v-if="employee"
        class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-card border border-surface-border shadow-2xs"
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span class="text-xs font-black text-text-primary">{{ employee.full_name }}</span>
        </div>
        <AppBadge v-if="employee.employee_number" variant="primary" size="xs" class="font-mono">
          #{{ employee.employee_number }}
        </AppBadge>
      </div>

      <!-- حالة التحميل -->
      <div v-if="isLoadingData" class="flex flex-col items-center justify-center py-8 space-y-2.5">
        <div
          class="w-8 h-8 border-3 border-primary/25 border-t-primary rounded-full animate-spin"
        ></div>
        <p class="text-xs font-bold text-text-secondary">جاري جلب إعدادات الوردية الحالية...</p>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- 1. الوردية المعتمدة -->
          <div class="flex flex-col space-y-1">
            <label for="emp-shift-select" class="text-[11px] font-bold text-text-secondary pr-1">
              الوردية المعتمدة *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
            >
              <span class="absolute right-3 text-primary pointer-events-none z-10">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>

              <select
                id="emp-shift-select"
                v-model="form.shift_id"
                class="block w-full h-full pr-9 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
              >
                <option :value="null" disabled class="bg-surface-section text-text-muted">
                  -- اختر الوردية --
                </option>
                <option
                  v-for="shift in shiftStore.shifts"
                  :key="shift.id"
                  :value="shift.id"
                  class="bg-surface-section text-text-primary"
                >
                  {{ shift.name }} ({{ shift.start_time }} - {{ shift.end_time }})
                </option>
              </select>

              <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
            </div>
          </div>

          <!-- 2. تاريخ بدء التفعيل -->
          <div class="flex flex-col space-y-1">
            <label
              for="emp-shift-start-date"
              class="text-[11px] font-bold text-text-secondary pr-1"
            >
              تاريخ بدء التفعيل *
            </label>
            <div
              class="relative w-full h-10 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
            >
              <input
                id="emp-shift-start-date"
                type="date"
                v-model="form.start_date"
                class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- 3. أيام الإجازة الأسبوعية -->
        <div class="space-y-2 pt-1">
          <label class="block text-[11px] font-bold text-text-secondary pr-1">
            أيام الإجازة الأسبوعية (Weekend)
          </label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="day in dayOptions"
              :key="day.id"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-150 select-none text-xs font-bold"
              :class="
                form.weekend_days.includes(day.id)
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-2xs'
                  : 'bg-surface-card border-surface-border text-text-secondary hover:border-primary/50 hover:text-primary'
              "
            >
              <input type="checkbox" :value="day.id" v-model="form.weekend_days" class="hidden" />
              <div
                class="w-4 h-4 rounded border flex items-center justify-center transition-all"
                :class="
                  form.weekend_days.includes(day.id)
                    ? 'bg-primary border-primary'
                    : 'bg-surface-ground border-surface-border'
                "
              >
                <svg
                  v-if="form.weekend_days.includes(day.id)"
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
              <span>{{ day.name }}</span>
            </label>
          </div>
        </div>

        <!-- ملاحظة إرشادية -->
        <div
          class="p-2.5 rounded-lg bg-info/10 border border-info/30 text-info text-[11px] font-bold flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>ملاحظة: يعرض النظام تلقائياً الوردية النشطة حالياً للموظف إن وجدت.</span>
        </div>
      </template>
    </div>

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="save" :disabled="isSaving || isLoadingData">
        <span v-if="isSaving">جاري المعالجة...</span>
        <span v-else>اعتماد الوردية</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

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

const resetAndFetchData = async () => {
  if (!props.employee) return

  form.value.employee_id = Number(props.employee.id)
  form.value.shift_id = null
  form.value.weekend_days = []
  form.value.start_date = new Date().toISOString().split('T')[0]

  isLoadingData.value = true
  try {
    const history = await shiftStore.fetchEmployeeShifts(form.value.employee_id)
    const activeShift = history.find((s) => s.end_date === null)

    if (activeShift) {
      form.value.shift_id = activeShift.shift_id
      form.value.weekend_days = activeShift.weekend_days || []
    }
  } catch {
    console.error('فشل جلب الوردية الحالية للموظف')
  } finally {
    isLoadingData.value = false
  }
}

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
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const save = async () => {
  if (!form.value.shift_id) return toast.error('يرجى اختيار الوردية.')

  isSaving.value = true
  try {
    await shiftStore.assignEmployeeToShift(form.value)
    toast.success('تم اعتماد الوردية بنجاح.')
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
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.65;
}
</style>
