<!-- src/modules/hr/views/working-schedules/components/WorkingScheduleLinesGrid.vue -->
<template>
  <div class="space-y-3 text-right font-sans" dir="rtl">
    <!-- ترويسة قسم توزيع الورديات -->
    <div
      class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-surface-border/80"
    >
      <h3 class="text-xs sm:text-sm font-black text-text-primary flex items-center gap-2">
        <svg
          class="w-4 h-4 text-primary shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>توزيع الورديات على أيام الدورة</span>
      </h3>

      <span
        class="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-bold"
      >
        إجمالي الأيام:
        <strong class="font-mono font-black mr-1">{{ cycleDays || 0 }}</strong>
      </span>
    </div>

    <!-- رسالة تنبيه في حال عدم إدخال أيام الدورة -->
    <div
      v-if="!cycleDays || cycleDays < 1"
      class="text-center py-10 px-4 text-text-muted bg-surface-card rounded-xl border border-dashed border-surface-border text-xs font-medium"
    >
      يرجى إدخال "عدد أيام دورة العمل" في الأعلى ليتم توليد جدول الورديات هنا.
    </div>

    <!-- منصة جدول عرض وتعديل الورديات (3D Elevated Stage) -->
    <div v-else class="invoice-stage-3d rounded-2xl overflow-hidden transition-all duration-200">
      <div class="overflow-x-auto bg-surface-section">
        <table class="w-full text-right text-xs border-collapse">
          <thead class="invoice-thead-3d select-none h-10">
            <tr>
              <th class="px-4 py-2 w-24 text-center font-mono">اليوم رقم</th>
              <th class="px-4 py-2 font-black text-right">
                <span class="inline-flex items-center gap-2">
                  <span
                    class="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/25 inline-block"
                  ></span>
                  <span>الوردية المخصصة (Shift)</span>
                </span>
              </th>
              <th class="px-4 py-2 text-center w-36 font-bold">حالة اليوم</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-surface-border/70">
            <tr
              v-for="(line, index) in localLines"
              :key="index"
              class="transition-colors"
              :class="
                line.shift_id ? 'invoice-row-filled' : 'bg-surface-ground/40 hover:bg-primary/5'
              "
            >
              <td class="px-4 py-2.5 text-center align-middle">
                <span
                  class="inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-black text-xs"
                  :class="
                    line.shift_id
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-card text-text-muted border border-surface-border'
                  "
                >
                  {{ index + 1 }}
                </span>
              </td>

              <td class="px-4 py-2.5 align-middle">
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

              <td class="px-4 py-2.5 text-center align-middle">
                <AppBadge :variant="line.shift_id ? 'info' : 'secondary'" size="xs" pill>
                  {{ line.shift_id ? 'يوم عمل' : 'يوم راحة' }}
                </AppBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

const props = defineProps({
  modelValue: { type: Array, required: true },
  cycleDays: { type: [Number, String], default: 0 },
  shifts: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const localLines = ref([])

const emitUpdate = () => {
  emit('update:modelValue', localLines.value)
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal.length > 0 && localLines.value.length === 0) {
      localLines.value = JSON.parse(JSON.stringify(newVal))
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.cycleDays,
  (newVal) => {
    const days = parseInt(newVal) || 0
    let currentLines = [...localLines.value]

    if (days > currentLines.length) {
      for (let i = currentLines.length; i < days; i++) {
        currentLines.push({ day_number: i + 1, shift_id: null })
      }
    } else if (days < currentLines.length) {
      currentLines = currentLines.slice(0, days)
    }

    localLines.value = currentLines
    emitUpdate()
  },
  { immediate: true },
)
</script>
