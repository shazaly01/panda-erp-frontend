<!-- src/modules/hr/components/DepartmentSelect.vue -->
<template>
  <AppDropdown
    :id="id"
    :label="label"
    :model-value="modelValue"
    :options="flatDepartments"
    :option-label="optionLabel"
    :option-value="optionValue"
    :placeholder="placeholder"
    :loading="loading"
    :required="required"
    :show-clear="showClear"
    @update:model-value="handleUpdate"
  />
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import { useDepartmentStore } from '../stores/departmentStore'

const props = defineProps({
  id: {
    type: String,
    default: 'department_id',
  },
  label: {
    type: String,
    default: 'الإدارة / القسم',
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
  optionLabel: {
    type: String,
    default: 'dropdownName',
  },
  optionValue: {
    type: String,
    default: 'id',
  },
  placeholder: {
    type: String,
    default: 'اختر الإدارة / القسم...',
  },
  required: {
    type: Boolean,
    default: false,
  },
  showClear: {
    type: Boolean,
    default: true,
  },
  forceRefresh: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const departmentStore = useDepartmentStore()
const { flatDepartments, loading } = storeToRefs(departmentStore)

const handleUpdate = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

onMounted(async () => {
  // التحقق من وجود البيانات مسبقاً لمنع التكرار غير الضروري لطلبات الشبكة
  if (props.forceRefresh || flatDepartments.value.length === 0) {
    await departmentStore.fetchDepartments()
  }
})
</script>
