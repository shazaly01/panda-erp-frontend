<template>
  <div
    class="bg-surface-header/60 p-4 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs mb-6 transition-all duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-4">
        <label class="block text-xs font-bold text-text-secondary mb-1.5"> البحث السريع </label>
        <AppInput
          :model-value="searchQuery"
          placeholder="بحث برقم القيد أو البيان..."
          class="bg-surface-card"
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-3">
        <label class="block text-xs font-bold text-text-secondary mb-1.5"> حالة القيد </label>
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات' },
            { id: 'draft', name: 'مسودة' },
            { id: 'posted', name: 'مُرحل' },
          ]"
          class="bg-surface-card"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>

      <div class="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1.5"> من تاريخ </label>
          <AppInput
            type="date"
            :model-value="startDate"
            class="bg-surface-card"
            @update:model-value="$emit('update:startDate', $event)"
            placeholder="من تاريخ"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-text-secondary mb-1.5"> إلى تاريخ </label>
          <AppInput
            type="date"
            :model-value="endDate"
            class="bg-surface-card"
            @update:model-value="$emit('update:endDate', $event)"
            placeholder="إلى تاريخ"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter', 'update:startDate', 'update:endDate'])
</script>
