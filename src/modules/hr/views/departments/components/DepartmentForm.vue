<!-- src/modules/hr/views/departments/components/DepartmentForm.vue -->
<template>
  <div
    class="-m-3 p-3.5 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3 text-right font-sans transition-colors duration-200"
    dir="rtl"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- 1. اسم الإدارة / القسم -->
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

      <!-- 2. كود الإدارة -->
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

      <!-- 3. المستوى التنظيمي -->
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

      <!-- 4. الإدارة الأب -->
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
        <p v-if="isRootEdit" class="text-[11px] text-warning font-bold mt-1 pr-1">
          • لا يمكن تغيير تبعية إدارة رئيسية تمتلك فروعاً فرعية.
        </p>
      </div>

      <!-- 5. مركز التكلفة المحاسبي -->
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

      <!-- 6. مشرفو القسم -->
      <div class="md:col-span-2">
        <AppMultiSelect
          id="dept-supervisors"
          label="مشرفو القسم (صلاحية اعتماد الحضور)"
          :model-value="modelValue.supervisor_ids"
          @update:model-value="updateField('supervisor_ids', $event)"
          :options="employees"
          option-label="full_name"
          option-value="id"
          placeholder="اختر المشرفين المسؤولين عن هذا القسم..."
        />
        <p class="text-[11px] text-text-secondary mt-1 pr-1">
          يمكنك اختيار مشرف واحد أو عدة مشرفين لرؤية واعتماد حضور موظفي هذا القسم.
        </p>
      </div>
    </div>

    <!-- 7. وصف المهام -->
    <div>
      <AppTextarea
        id="dept-desc"
        label="وصف المهام (اختياري)"
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
        placeholder="اكتب نبذة عن مهام ومسؤوليات هذه الإدارة..."
        rows="2"
      />
    </div>

    <!-- 8. حالة التفعيل -->
    <div
      class="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-card border border-surface-border"
    >
      <label class="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-10 h-5 bg-surface-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-2.5 text-xs font-bold text-text-primary">
          {{ modelValue.is_active ? 'الإدارة نشطة (متاحة للاستخدام)' : 'الإدارة موقوفة' }}
        </span>
      </label>

      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
        :class="
          modelValue.is_active
            ? 'bg-success/10 text-success border-success/30'
            : 'bg-danger/10 text-danger border-danger/30'
        "
      >
        {{ modelValue.is_active ? 'مفعّلة' : 'معطّلة' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppMultiSelect from '@/components/ui/AppMultiSelect.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  flatDepartments: { type: Array, required: true },
  costCenters: { type: Array, required: true },
  employees: { type: Array, required: true },
  isRootEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const departmentTypes = [
  { id: 'administration', name: 'إدارة عليا' },
  { id: 'department', name: 'قسم' },
  { id: 'section', name: 'شعبة / وحدة' },
  { id: 'branch', name: 'فرع' },
]

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
