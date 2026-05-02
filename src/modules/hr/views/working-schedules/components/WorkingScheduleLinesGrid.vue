<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between border-b border-surface-border pb-3">
      <h3 class="text-md font-bold text-text-primary flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        توزيع الورديات على أيام الدورة
      </h3>
      <span class="text-xs text-text-muted bg-surface-muted px-2 py-1 rounded-md">
        إجمالي الأيام: {{ cycleDays || 0 }}
      </span>
    </div>

    <!-- رسالة تنبيه في حال عدم إدخال أيام الدورة -->
    <div
      v-if="!cycleDays || cycleDays < 1"
      class="text-center py-8 text-text-muted bg-surface-muted/30 rounded-xl border border-dashed border-surface-border"
    >
      يرجى إدخال "عدد أيام دورة العمل" في الأعلى ليتم توليد جدول الورديات هنا.
    </div>

    <!-- جدول عرض وتعديل الورديات -->
    <div v-else class="overflow-x-auto bg-surface rounded-xl border border-border-light shadow-sm">
      <table class="w-full text-right text-sm">
        <thead class="bg-surface-muted text-text-muted">
          <tr>
            <th class="px-4 py-3 font-medium w-24 text-center">اليوم رقم</th>
            <th class="px-4 py-3 font-medium">الوردية المخصصة (Shift)</th>
            <th class="px-4 py-3 font-medium text-center w-32">حالة اليوم</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-light">
          <tr
            v-for="(line, index) in localLines"
            :key="index"
            class="hover:bg-surface-hover transition-colors"
          >
            <td class="px-4 py-3 text-center font-bold text-text-primary">
              {{ index + 1 }}
            </td>
            <td class="px-4 py-3">
              <AppDropdown
                :id="`shift-select-${index}`"
                v-model="line.shift_id"
                :options="[{ id: null, dropdownName: '-- يوم راحة (Off Day) --' }, ...shifts]"
                option-label="dropdownName"
                option-value="id"
                placeholder="اختر الوردية"
                class="w-full"
                @update:model-value="emitUpdate"
              />
            </td>
            <td class="px-4 py-3 text-center">
              <span
                v-if="!line.shift_id"
                class="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 text-gray-600 border border-gray-200"
              >
                يوم راحة
              </span>
              <span
                v-else
                class="px-2 py-1 text-[10px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-200"
              >
                يوم عمل
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Array, required: true },
  cycleDays: { type: [Number, String], default: 0 },
  shifts: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

// 1. تعريف الحالة المحلية
const localLines = ref([])

// 2. تعريف دالة الإرسال (تم نقلها للأعلى لتجنب الـ ReferenceError)
const emitUpdate = () => {
  emit('update:modelValue', localLines.value)
}

// 3. مراقبة البيانات القادمة من الأب (في حالة التعديل)
watch(
  () => props.modelValue,
  (newVal) => {
    // نقوم بالتحديث فقط إذا كانت البيانات المحلية فارغة (عند التحميل الأول في وضع التعديل)
    // أو إذا كان هناك تغيير حقيقي من الأب (مثل Reset للنموذج)
    if (newVal && newVal.length > 0 && localLines.value.length === 0) {
      localLines.value = JSON.parse(JSON.stringify(newVal))
    }
  },
  { deep: true, immediate: true },
)

// 4. مراقبة تغير عدد الأيام لتوليد أو قص الأسطر
watch(
  () => props.cycleDays,
  (newVal) => {
    const days = parseInt(newVal) || 0
    let currentLines = [...localLines.value]

    if (days > currentLines.length) {
      // إضافة أيام جديدة دون المساس بالأيام القديمة
      for (let i = currentLines.length; i < days; i++) {
        currentLines.push({ day_number: i + 1, shift_id: null })
      }
    } else if (days < currentLines.length) {
      // إزالة الأيام الزائدة من نهاية المصفوفة
      currentLines = currentLines.slice(0, days)
    }

    localLines.value = currentLines
    emitUpdate()
  },
  { immediate: true },
)
</script>
