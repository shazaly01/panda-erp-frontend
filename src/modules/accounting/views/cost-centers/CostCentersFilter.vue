<template>
  <div
    class="bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs mb-6 transition-all duration-200"
    dir="rtl"
  >
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <label for="search-cost-center" class="block text-xs font-bold text-text-secondary mb-1.5">
          البحث السريع
        </label>
        <AppInput
          id="search-cost-center"
          :model-value="searchQuery"
          placeholder="بحث بكود أو اسم مركز التكلفة..."
          class="bg-surface-card"
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="w-full md:w-48">
        <label
          for="filter-cost-center-type"
          class="block text-xs font-bold text-text-secondary mb-1.5"
        >
          نوع المركز
        </label>
        <AppDropdown
          id="filter-cost-center-type"
          :model-value="typeFilter"
          :options="[
            { id: '', name: 'كل الأنواع' },
            { id: 'direct', name: 'مباشر' },
            { id: 'indirect', name: 'غير مباشر' },
            { id: 'group', name: 'تجميعي' },
          ]"
          class="bg-surface-card"
          @update:model-value="$emit('update:typeFilter', $event)"
        />
      </div>

      <div class="w-full md:w-48">
        <label class="block text-xs font-bold text-text-secondary mb-1.5"> الحالة </label>
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: '1', name: 'نشط' },
            { id: '0', name: 'غير نشط' },
          ]"
          class="bg-surface-card"
          @update:model-value="$emit('update:statusFilter', $event)"
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
  typeFilter: { type: String, default: '' },
  statusFilter: { type: [String, Number], default: '' },
})

defineEmits(['update:searchQuery', 'update:typeFilter', 'update:statusFilter'])
</script>
