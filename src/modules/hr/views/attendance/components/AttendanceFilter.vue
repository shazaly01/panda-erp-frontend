<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-4">
        <label class="block text-xs font-bold text-slate-400 mb-1.5">البحث</label>
        <AppInput
          id="attendance-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف أو الرقم الوظيفي..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-bold text-slate-400 mb-1.5">من تاريخ</label>
        <AppInput
          id="attendance-start-date"
          type="date"
          :model-value="startDate"
          @update:model-value="$emit('update:startDate', $event)"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-bold text-slate-400 mb-1.5">إلى تاريخ</label>
        <AppInput
          id="attendance-end-date"
          type="date"
          :model-value="endDate"
          @update:model-value="$emit('update:endDate', $event)"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-bold text-slate-400 mb-1.5">القسم</label>
        <AppDropdown
          id="attendance-department-filter"
          :model-value="departmentId"
          :options="[{ id: '', name: 'كل الأقسام' }, ...departmentOptions]"
          @update:model-value="$emit('update:departmentId', $event)"
        />
      </div>

      <div class="md:col-span-4 flex items-center pt-5">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="presentOnly"
            @change="$emit('update:presentOnly', $event.target.checked)"
            class="w-4 h-4 rounded border-slate-750 bg-slate-950 text-blue-500 focus:ring-0 focus:ring-offset-0"
          />
          <span class="text-xs font-bold text-slate-300">من حضر فقط (استبعاد الغائبين)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  departmentId: { type: [String, Number], default: '' },
  positionId: { type: [String, Number], default: '' },
  employmentType: { type: String, default: '' },
  presentOnly: { type: Boolean, default: false },

  // مصفوفات الخيارات الممررة ديناميكياً من المكون الأب
  departmentOptions: { type: Array, default: () => [] },
  positionOptions: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:startDate',
  'update:endDate',
  'update:departmentId',
  'update:positionId',
  'update:employmentType',
  'update:presentOnly',
])
</script>
