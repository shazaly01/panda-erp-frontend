<!--src\modules\hr\views\working-schedules\WorkingScheduleFormPage.vue--->
<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <!-- الترويسة (Header) -->
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
            {{ isEditMode ? 'تعديل قالب الجدولة' : 'إنشاء قالب جدولة جديد' }}
          </h1>
          <p class="text-sm text-text-muted mt-1">
            {{
              isEditMode
                ? `تحديث إعدادات القالب: ${form.name}`
                : 'بناء دورة عمل وتوزيع الورديات على أيامها.'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- حالة التحميل -->
    <div v-if="isLoadingData" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <!-- النموذج -->
    <div v-else class="space-y-6">
      <!-- القسم الأول: البيانات الأساسية -->
      <AppCard class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-1">
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
              class="font-mono"
              required
            />
          </div>
        </div>
      </AppCard>

      <!-- القسم الثاني: الجدول التفاعلي -->
      <AppCard class="p-6">
        <WorkingScheduleLinesGrid
          v-model="form.lines"
          :cycle-days="form.cycle_days"
          :shifts="availableShifts"
        />
      </AppCard>

      <!-- أزرار الحفظ -->
      <div
        class="flex justify-end gap-3 pt-2 sticky bottom-4 z-10 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-surface-border shadow-lg"
      >
        <AppButton variant="secondary" @click="goBack" :disabled="isSaving"> إلغاء </AppButton>
        <AppButton @click="submit" :disabled="isSaving">
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
// افتراض أن لديك Store للورديات لنجلب منه قائمة الورديات لملء الـ Dropdown
import { useShiftStore } from '@/modules/hr/stores/shiftStore'

import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
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
  // نقوم بتهيئة الاسم للعرض في الـ Dropdown
  return shiftStore.shifts.map((shift) => ({
    ...shift,
    dropdownName: `${shift.name} (${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)})`,
  }))
})

// --- بيانات النموذج ---
const defaultForm = () => ({
  name: '',
  type: 'rotating',
  cycle_days: 7, // افتراضياً أسبوع
  lines: [], // سيتم تعبئتها ديناميكياً من المكون الابن
})

const form = ref(defaultForm())

// --- تحميل البيانات الأولية ---
onMounted(async () => {
  isLoadingData.value = true

  try {
    // جلب قائمة الورديات المتاحة إذا لم تكن موجودة
    if (shiftStore.shifts.length === 0) {
      await shiftStore.fetchShifts({ per_page: 100 })
    }

    if (isEditMode.value) {
      // هنا تفترض الدالة أن الباك إند يُرجع القالب مع علاقة lines() محملة
      const scheduleData = await scheduleStore.fetchScheduleById(scheduleId.value)

      form.value = {
        name: scheduleData.name,
        type: scheduleData.type,
        cycle_days: scheduleData.cycle_days,
        lines: scheduleData.lines || [],
      }
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل البيانات.')
    goBack()
  } finally {
    isLoadingData.value = false
  }
})

// --- الإجراءات ---
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
