<template>
  <div
    class="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 shadow-sm transition-all duration-300 text-right"
  >
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div class="md:col-span-6">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم المتقدم للتدريب، أو رقم الهاتف الجوال..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
          class="!rounded-xl text-xs"
        />
      </div>

      <div class="md:col-span-6">
        <AppInput
          :model-value="institutionFilter"
          placeholder="ابحث باسم الجامعة، الكلية، أو المعهد التعليمي..."
          @update:model-value="$emit('update:institutionFilter', $event)"
          clearable
          class="!rounded-xl text-xs"
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
})

defineEmits(['update:searchQuery', 'update:institutionFilter'])
</script>
