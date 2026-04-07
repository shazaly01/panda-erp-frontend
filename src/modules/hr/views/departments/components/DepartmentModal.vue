<!--src\modules\hr\views\departments\components\DepartmentModal.vue-->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-2xl transform flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title"
        >
          <div
            class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 shrink-0"
          >
            <h3 id="modal-title" class="text-lg font-semibold text-text-primary">
              {{ title }}
            </h3>
            <button
              @click="close"
              class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
              aria-label="Close"
              :disabled="isSaving"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 pb-2">
            <DepartmentForm
              v-model="form"
              :flat-departments="filteredDepartments"
              :cost-centers="costCenters"
              :is-root-edit="isEditMode && hasChildren"
            />
          </div>

          <div class="pt-4 mt-2 border-t border-surface-border flex justify-end gap-3 shrink-0">
            <AppButton variant="secondary" @click="close" :disabled="isSaving"> إلغاء </AppButton>
            <AppButton @click="submit" :disabled="isSaving">
              <span v-if="isSaving">جاري الحفظ...</span>
              <span v-else>{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الإدارة' }}</span>
            </AppButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useDepartmentStore } from '@/modules/hr/stores/departmentStore'
import { useCostCenterStore } from '@/modules/accounting/stores/costCenterStore'
import AppButton from '@/components/ui/AppButton.vue'
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

const isSaving = ref(false)

const isEditMode = computed(() => !!props.departmentToEdit)
const hasChildren = computed(() => isEditMode.value && props.departmentToEdit.children?.length > 0)

const title = computed(() => (isEditMode.value ? 'تعديل بيانات الإدارة' : 'إضافة إدارة / قسم جديد'))

const filteredDepartments = computed(() => {
  if (!isEditMode.value) return departmentStore.flatDepartments
  return departmentStore.flatDepartments.filter((d) => d.id !== props.departmentToEdit.id)
})

const costCenters = computed(() => costCenterStore.activeCostCenters || [])

const defaultForm = () => ({
  name: '',
  code: '',
  type: 'department',
  parent_id: props.initialParentId,
  cost_center_id: null,
  description: '',
  is_active: true,
})

const form = ref(defaultForm())

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // 1. جلب مراكز التكلفة في الخلفية بدون حظر الواجهة أو إظهار تحميل
      if (costCenterStore.costCenters.length === 0 || costCenterStore.costCenters.length < 50) {
        costCenterStore.fetchCostCenters({ per_page: 500 }).catch(() => {
          console.error('تعذر جلب مراكز التكلفة')
        })
      }

      // 2. تعبئة البيانات فوراً لكي تظهر الشاشة للمستخدم في نفس اللحظة
      if (isEditMode.value) {
        form.value = {
          name: props.departmentToEdit.name,
          code: props.departmentToEdit.code || '',
          type: props.departmentToEdit.type,
          parent_id: props.departmentToEdit.parent_id,
          cost_center_id: props.departmentToEdit.cost_center_id,
          description: props.departmentToEdit.description || '',
          is_active: props.departmentToEdit.is_active,
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

    // 3. الحل الأكيد لمشكلة عدم الإغلاق: إجبار النافذة على الإغلاق فوراً
    emit('update:modelValue', false)

    // 4. إرسال حدث التحديث للأب بعد إغلاق النافذة لضمان عدم حدوث تعارض
    emit('saved')
  } catch (error) {
    // الأخطاء يتم التعامل معها في الـ Store
  } finally {
    isSaving.value = false
  }
}
</script>
