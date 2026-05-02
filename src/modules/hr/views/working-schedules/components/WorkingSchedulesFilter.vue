<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6 shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <!-- البحث النصي -->
      <div class="md:col-span-2 lg:col-span-2">
        <AppInput
          id="schedule-search-query"
          :model-value="searchQuery"
          placeholder="البحث باسم القالب..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <!-- فلتر نوع القالب -->
      <div class="md:col-span-1 lg:col-span-2">
        <AppDropdown
          id="schedule-type-filter"
          :model-value="type"
          :options="typeOptions"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب نوع القالب"
          @update:model-value="$emit('update:type', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  type: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:type'])

// خيارات نوع القالب
const typeOptions = [
  { id: '', name: 'كل الأنواع' },
  { id: 'fixed', name: 'ثابت (نفس الوردية دائماً)' },
  { id: 'rotating', name: 'مرن / متغير (نظام شفتات)' },
]
</script>
