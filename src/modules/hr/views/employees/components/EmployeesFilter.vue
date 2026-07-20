<!--src\modules\hr\views\employees\components\EmployeesFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6 shadow-sm">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <AppInput
          id="emp-search-query"
          :model-value="searchQuery"
          placeholder="الاسم، الكود، أو رقم الهاتف..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <div>
        <AppDropdown
          id="emp-dept-filter"
          :model-value="departmentId"
          :options="[{ id: '', dropdownName: 'كل الإدارات والأقسام' }, ...departments]"
          option-label="dropdownName"
          option-value="id"
          placeholder="تصفية حسب الإدارة"
          @update:model-value="$emit('update:departmentId', $event)"
        />
      </div>

      <div>
        <AppDropdown
          id="emp-pos-filter"
          :model-value="positionId"
          :options="[{ id: '', name: 'كل المسميات الوظيفية' }, ...positions]"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب الوظيفة"
          @update:model-value="$emit('update:positionId', $event)"
        />
      </div>

      <div>
        <AppDropdown
          id="emp-status-filter"
          :model-value="status"
          :options="statusOptions"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب الحالة"
          @update:model-value="$emit('update:status', $event)"
        />
      </div>

      <div>
        <AppDropdown
          id="emp-contract-filter"
          :model-value="contractFilter"
          :options="contractOptions"
          option-label="name"
          option-value="id"
          placeholder="تصفية حسب العقود"
          @update:model-value="$emit('update:contractFilter', $event)"
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
  departmentId: { type: [String, Number], default: '' },
  positionId: { type: [String, Number], default: '' },
  status: { type: String, default: '' },
  contractFilter: { type: String, default: '' },
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
})

defineEmits([
  'update:searchQuery',
  'update:departmentId',
  'update:positionId',
  'update:status',
  'update:contractFilter',
])

// خيارات الحالة (مطابقة تماماً للـ Enum في الباك-إند)
const statusOptions = [
  { id: '', name: 'كل الحالات' },
  { id: 'active', name: 'نشط (على رأس العمل)' },
  { id: 'probation', name: 'فترة تجربة' },
  { id: 'on_leave', name: 'في إجازة' },
  { id: 'resigned', name: 'مستقيل' },
  { id: 'terminated', name: 'منهى خدماته' },
]

// خيارات تصفية العقود المترابطة مع الـ Query Parameters في الـ EmployeeController
const contractOptions = [
  { id: '', name: 'جميع حالات العقود' },
  { id: 'without_contract', name: 'بدون عقد عمل نهائياً' },
  { id: 'without_active_contract', name: 'بدون عقد نشط' },
]
</script>
