<!--src\modules\hr\views\internships\components\InternshipApplicationsFilter.vue--->
<template>
  <div
    class="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 shadow-sm transition-all duration-300 text-right"
  >
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div class="md:col-span-4">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم المتقدم للتدريب، أو رقم الهاتف الجوال..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
          class="!rounded-xl text-xs"
        />
      </div>

      <div class="md:col-span-4">
        <AppInput
          :model-value="institutionFilter"
          placeholder="ابحث باسم الجامعة، الكلية، أو المعهد التعليمي..."
          @update:model-value="$emit('update:institutionFilter', $event)"
          clearable
          class="!rounded-xl text-xs"
        />
      </div>

      <div class="md:col-span-2">
        <AppInput
          :model-value="dateFrom"
          type="date"
          placeholder="من تاريخ"
          @update:model-value="$emit('update:dateFrom', $event)"
          clearable
          class="!rounded-xl text-xs text-slate-300 relative uppercase"
        />
      </div>

      <div class="md:col-span-2">
        <AppInput
          :model-value="dateTo"
          type="date"
          placeholder="إلى تاريخ"
          @update:model-value="$emit('update:dateTo', $event)"
          clearable
          class="!rounded-xl text-xs text-slate-300 relative uppercase"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  institutionFilter: { type: String, default: '' },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:institutionFilter', 'update:dateFrom', 'update:dateTo'])
</script>

<style scoped>
/* تحسين مظهر أيقونة اختيار التاريخ لتتناسب مع التصميم الداكن للمنظومة */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.7) sepia(1) saturate(5) hue-rotate(175deg);
  cursor: pointer;
}
</style>
