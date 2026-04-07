<!--src\modules\hr\views\departments\components\DepartmentForm.vue-->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppInput
          id="dept-name"
          type="text"
          label="اسم الإدارة / القسم *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: إدارة الموارد البشرية"
          required
        />
      </div>

      <div>
        <AppInput
          id="dept-code"
          type="text"
          label="كود الإدارة"
          :model-value="modelValue.code"
          @update:model-value="updateField('code', $event)"
          placeholder="اتركه فارغاً للتوليد التلقائي"
          class="font-mono text-left"
          dir="ltr"
        />
      </div>

      <div>
        <AppDropdown
          id="dept-type"
          label="المستوى التنظيمي *"
          :model-value="modelValue.type"
          @update:model-value="updateField('type', $event)"
          :options="departmentTypes"
          option-label="name"
          option-value="id"
          placeholder="اختر المستوى..."
          required
        />
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="dept-parent"
          label="يتبع لـ (الإدارة الأب)"
          :model-value="modelValue.parent_id"
          @update:model-value="updateField('parent_id', $event)"
          :options="flatDepartments"
          option-label="dropdownName"
          option-value="id"
          placeholder="-- إدارة رئيسية (لا يتبع لأحد) --"
          :disabled="isRootEdit"
        />
        <p v-if="isRootEdit" class="text-xs text-amber-500 mt-1">
          لا يمكن تغيير تبعية إدارة رئيسية تمتلك فروعاً فرعية.
        </p>
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="dept-cost-center"
          label="مركز التكلفة المحاسبي المرتبط"
          :model-value="modelValue.cost_center_id"
          @update:model-value="updateField('cost_center_id', $event)"
          :options="costCenters"
          option-label="name"
          option-value="id"
          placeholder="-- بدون مركز تكلفة --"
        />
      </div>
    </div>

    <div>
      <AppTextarea
        id="dept-desc"
        label="وصف المهام (اختياري)"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="اكتب نبذة عن مهام ومسؤوليات هذه الإدارة..."
        rows="3"
      />
    </div>

    <div class="flex items-center gap-3 pt-2">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-3 text-sm font-medium text-text-primary">
          {{ modelValue.is_active ? 'الإدارة نشطة (مفعلة)' : 'الإدارة موقوفة' }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  flatDepartments: { type: Array, required: true },
  costCenters: { type: Array, required: true },
  isRootEdit: { type: Boolean, default: false }, // لمنع تغيير الأب إذا كانت العقدة جذرية ولها أبناء
})

const emit = defineEmits(['update:modelValue'])

// مصفوفة الأنواع مطابقة للـ Enum في الباك-إند
const departmentTypes = [
  { id: 'administration', name: '🏢 إدارة عليا' },
  { id: 'department', name: '📁 قسم' },
  { id: 'section', name: '📑 شعبة / وحدة' },
  { id: 'branch', name: '📍 فرع' },
]

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
