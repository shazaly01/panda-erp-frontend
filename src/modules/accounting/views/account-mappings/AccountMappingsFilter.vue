<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث باسم التوجيه، المفتاح (Key)، أو كود واسم الحساب..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'

defineProps({
  searchQuery: { type: String, default: '' },
})

defineEmits(['update:searchQuery'])
</script>
