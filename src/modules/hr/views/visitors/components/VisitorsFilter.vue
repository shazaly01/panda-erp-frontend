<!---src\modules\hr\views\visitors\components\VisitorsFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div class="md:col-span-5">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم الزائر، رقم الهاتف، أو رقم الهوية..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-4">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات الإدارية' },
            { id: 'pending', name: 'انتظار الوصول (مسجل مسبقاً)' },
            { id: 'checked_in', name: 'داخل المنشأة حالياً' },
            { id: 'checked_out', name: 'غادر المنشأة' },
            { id: 'canceled', name: 'زيارات ملغية' },
          ]"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>

      <div class="md:col-span-3 flex items-center h-full pt-1 md:pt-0 px-2">
        <AppCheckbox
          :model-value="todayOnlyFilter"
          label="عرض زوار اليوم فقط"
          @update:model-value="$emit('update:todayOnlyFilter', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  todayOnlyFilter: { type: Boolean, default: true },
})

defineEmits(['update:searchQuery', 'update:statusFilter', 'update:todayOnlyFilter'])
</script>
