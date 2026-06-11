<template>
  <div class="bg-surface-section p-5 rounded-xl border border-surface-border mb-6 shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <div class="md:col-span-4">
        <label class="block text-xs font-bold text-slate-400 mb-2">البحث</label>
        <AppInput
          id="attendance-search"
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف أو الرقم الوظيفي..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-bold text-slate-400 mb-2">من تاريخ</label>
        <AppInput
          id="attendance-start-date"
          type="date"
          :model-value="startDate"
          @update:model-value="$emit('update:startDate', $event)"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-bold text-slate-400 mb-2">إلى تاريخ</label>
        <AppInput
          id="attendance-end-date"
          type="date"
          :model-value="endDate"
          @update:model-value="$emit('update:endDate', $event)"
        />
      </div>

      <div class="md:col-span-4">
        <label class="block text-xs font-bold text-slate-400 mb-2">القسم الإداري</label>
        <AppDropdown
          id="attendance-department-filter"
          :model-value="departmentId"
          :options="[{ id: '', name: 'كل الأقسام والإدارات' }, ...departmentOptions]"
          @update:model-value="$emit('update:departmentId', $event)"
          class="w-full"
        />
      </div>

      <div
        class="md:col-span-12 pt-3 border-t border-slate-800/40 mt-1 flex items-center justify-between"
      >
        <label class="flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            :checked="presentOnly"
            @change="$emit('update:presentOnly', $event.target.checked)"
            class="w-4 h-4 rounded border-slate-750 bg-slate-950 text-blue-500 focus:ring-0 focus:ring-offset-0 transition-colors"
          />
          <span
            class="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors"
          >
            من حضر فقط (استبعاد الموظفين الغائبين تماماً طوال الفترة المحددة)
          </span>
        </label>

        <span class="text-[11px] font-medium text-slate-500 font-mono hidden md:inline">
          Panda ERP v2
        </span>
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
