<!-- src/modules/hr/views/working-schedules/WorkingScheduleFormPage.vue -->
<template>
  <div class="space-y-3 max-w-5xl mx-auto pb-24 text-right font-sans" dir="rtl">
    <!-- مؤشر التحميل لكامل الشاشة -->
    <FullScreenLoader :show="isLoadingData" message="جاري تحميل بيانات قالب الجدولة..." />

    <!-- ترويسة الصفحة المدمجة -->
    <div
      class="flex flex-wrap justify-between items-center gap-3 py-1.5 border-b border-surface-border/60"
    >
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="goBack"
          class="p-1.5 rounded-lg bg-surface-card border border-surface-border text-text-secondary hover:text-primary hover:border-primary/60 transition-colors shadow-2xs cursor-pointer"
          title="العودة لقائمة قوالب الجدولة"
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
          <span>{{ isEditMode ? 'تعديل قالب الجدولة' : 'إنشاء قالب جدولة جديد' }}</span>
        </h1>

        <span
          v-if="isEditMode && scheduleId"
          class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/25"
        >
          #{{ scheduleId }}
        </span>
      </div>

      <span v-if="isEditMode && form.name" class="text-xs font-bold text-text-secondary">
        القالب النشط: <strong class="text-text-primary">{{ form.name }}</strong>
      </span>
    </div>

    <!-- محتوى النموذج -->
    <div v-if="!isLoadingData" class="space-y-3">
      <!-- القسم الأول: البيانات الأساسية لقالب الجدولة -->
      <div
        class="p-4 bg-surface-header/70 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm space-y-3 transition-colors duration-200"
      >
        <div class="flex items-center justify-between pb-1.5 border-b border-primary/15">
          <span class="text-xs font-black text-text-primary flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>إعدادات قالب الجدولة وطول الدورة</span>
          </span>
          <span class="text-[10px] font-bold text-text-muted">الحقول المميزة بـ * إلزامية</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <AppInput
              id="schedule_name"
              label="اسم القالب *"
              v-model="form.name"
              placeholder="مثال: دورة أمنية 28 يوم"
              required
            />
          </div>

          <div>
            <AppDropdown
              id="schedule_type"
              label="نوع القالب *"
              v-model="form.type"
              :options="typeOptions"
              required
            />
          </div>

          <div>
            <AppInput
              id="cycle_days"
              type="number"
              min="1"
              max="365"
              label="طول الدورة (بالأيام) *"
              v-model="form.cycle_days"
              placeholder="مثال: 7 أو 14 أو 28"
              class="font-mono text-left"
              dir="ltr"
              required
            />
          </div>
        </div>
      </div>

      <!-- القسم الثاني: الجدول التفاعلي لتوزيع الورديات -->
      <div
        class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs transition-colors duration-200"
      >
        <WorkingScheduleLinesGrid
          v-model="form.lines"
          :cycle-days="form.cycle_days"
          :shifts="availableShifts"
        />
      </div>
    </div>

    <!-- شريط الإجراءات السفلي الثابت -->
    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        <span>يُطبَّق جدول الورديات الدوري تلقائياً على العقود المرتبطة بهذا القالب.</span>
      </div>

      <div class="flex items-center gap-2">
        <AppButton type="button" variant="secondary" size="sm" @click="goBack" :disabled="isSaving">
          إلغاء وتراجع
        </AppButton>
        <AppButton type="button" size="sm" @click="submit" :disabled="isSaving">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'اعتماد وإنشاء القالب' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useWorkingScheduleStore } from '@/modules/hr/stores/workingScheduleStore'
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'
import WorkingScheduleLinesGrid from './components/WorkingScheduleLinesGrid.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const scheduleStore = useWorkingScheduleStore()
const shiftStore = useShiftStore()

const isEditMode = computed(() => route.name === 'working-schedules.edit')
const scheduleId = computed(() => route.params.id)

const isLoadingData = ref(false)
const isSaving = ref(false)

const typeOptions = [
  { id: 'fixed', name: 'ثابت (نفس الوردية دائماً)' },
  { id: 'rotating', name: 'مرن / متغير (نظام شفتات متغيرة)' },
]

const availableShifts = computed(() => {
  return shiftStore.shifts.map((shift) => ({
    ...shift,
    dropdownName: `${shift.name} (${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)})`,
  }))
})

const defaultForm = () => ({
  name: '',
  type: 'rotating',
  cycle_days: 7,
  lines: [],
})

const form = ref(defaultForm())

onMounted(async () => {
  isLoadingData.value = true

  try {
    if (shiftStore.shifts.length === 0) {
      await shiftStore.fetchShifts({ per_page: 100 })
    }

    if (isEditMode.value) {
      const scheduleData = await scheduleStore.fetchScheduleById(scheduleId.value)

      form.value = {
        name: scheduleData.name,
        type: scheduleData.type,
        cycle_days: scheduleData.cycle_days,
        lines: scheduleData.lines || [],
      }
    }
  } catch {
    toast.error('حدث خطأ أثناء تحميل البيانات.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

const goBack = () => {
  router.push({ name: 'WorkingSchedulesList' })
}

const submit = async () => {
  if (!form.value.name.trim()) return toast.error('اسم القالب مطلوب.')
  if (!form.value.cycle_days || form.value.cycle_days < 1)
    return toast.error('طول الدورة يجب أن يكون يوماً واحداً على الأقل.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await scheduleStore.updateSchedule(scheduleId.value, form.value)
      toast.success('تم تحديث قالب الجدولة بنجاح.')
    } else {
      await scheduleStore.createSchedule(form.value)
      toast.success('تم إنشاء القالب بنجاح.')
    }
    goBack()
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'فشل حفظ البيانات. تأكد من صحة المدخلات.'
    toast.error(errorMsg)
  } finally {
    isSaving.value = false
  }
}
</script>
