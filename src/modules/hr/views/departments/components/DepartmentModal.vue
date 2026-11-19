<!-- src/modules/hr/views/departments/components/DepartmentModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="close"
    :title="title"
    size="lg"
    border-color="border-primary"
    :loading="isSaving"
  >
    <DepartmentForm
      v-model="form"
      :flat-departments="filteredDepartments"
      :cost-centers="costCenters"
      :employees="employeesList"
      :is-root-edit="isEditMode && hasChildren"
    />

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="close" :disabled="isSaving">
        إلغاء وتراجع
      </AppButton>
      <AppButton size="sm" @click="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الإدارة' }}</span>
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import DepartmentForm from './DepartmentForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  departmentToEdit: { type: Object, default: null },
  initialParentId: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const toast = useToast()
const departmentStore = useDepartmentStore()
const costCenterStore = useCostCenterStore()
const employeeStore = useEmployeeStore()

const isSaving = ref(false)

const isEditMode = computed(() => !!props.departmentToEdit)
const hasChildren = computed(() => isEditMode.value && props.departmentToEdit.children?.length > 0)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات الإدارة' : 'إضافة إدارة / قسم جديد'))

const filteredDepartments = computed(() => {
  if (!isEditMode.value) return departmentStore.flatDepartments
  return departmentStore.flatDepartments.filter((d) => d.id !== props.departmentToEdit.id)
})

const costCenters = computed(() => costCenterStore.activeCostCenters || [])
const employeesList = computed(() => employeeStore.employees || [])

const defaultForm = () => ({
  name: '',
  code: '',
  type: 'department',
  parent_id: props.initialParentId,
  cost_center_id: null,
  description: '',
  is_active: true,
  supervisor_ids: [],
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (costCenterStore.costCenters.length === 0 || costCenterStore.costCenters.length < 50) {
        costCenterStore.fetchCostCenters({ per_page: 500 }).catch(() => {
          console.error('تعذر جلب مراكز التكلفة')
        })
      }

      if (employeeStore.employees.length === 0) {
        employeeStore.fetchEmployees({ per_page: 500, active_only: 1 }).catch(() => {
          console.error('تعذر جلب الموظفين')
        })
      }

      if (isEditMode.value) {
        form.value = {
          name: props.departmentToEdit.name,
          code: props.departmentToEdit.code || '',
          type: props.departmentToEdit.type,
          parent_id: props.departmentToEdit.parent_id,
          cost_center_id: props.departmentToEdit.cost_center_id,
          description: props.departmentToEdit.description || '',
          is_active: props.departmentToEdit.is_active ?? true,
          supervisor_ids: props.departmentToEdit.supervisors
            ? props.departmentToEdit.supervisors.map((s) => s.id)
            : [],
        }
      } else {
        form.value = defaultForm()
      }
    }
  },
  { immediate: true },
)

const close = () => {
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!form.value.name.trim()) return toast.error('حقل اسم الإدارة مطلوب.')
  if (!form.value.type) return toast.error('الرجاء تحديد المستوى التنظيمي.')

  isSaving.value = true
  try {
    if (isEditMode.value) {
      await departmentStore.updateDepartment(props.departmentToEdit.id, form.value)
      toast.success('تم تحديث بيانات الإدارة بنجاح.')
    } else {
      await departmentStore.createDepartment(form.value)
      toast.success('تمت إضافة الإدارة الجديدة بنجاح.')
    }

    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    // الأخطاء يتم التعامل معها في الـ Store
  } finally {
    isSaving.value = false
  }
}
</script>
