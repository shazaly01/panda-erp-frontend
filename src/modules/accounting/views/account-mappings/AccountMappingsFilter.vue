<template>
  <div
    class="bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs mb-6 transition-all duration-200"
    dir="rtl"
  >
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <label class="block text-xs font-bold text-text-secondary mb-1.5">
          البحث السريع في التوجيهات
        </label>
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث باسم التوجيه، المفتاح (Key)، أو كود واسم الحساب..."
          class="bg-surface-card"
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
