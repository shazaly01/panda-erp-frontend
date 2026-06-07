<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <AppInput
        id="role-name"
        label="اسم الدور"
        v-model="form.name"
        placeholder="ادخل اسم الدور"
        required
        :disabled="isDefaultRole"
      />
      <p v-if="isDefaultRole" class="text-sm text-yellow-500 -mt-2">
        لا يمكن تعديل أسماء الأدوار الافتراضية والأساسية للنظام.
      </p>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2">
          الصلاحيات الممنوحة لهذا الدور
        </label>
        <PermissionsChecklist v-model:selectedPermissions="form.permissions" />
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <AppButton type="submit" :disabled="isSaving" class="px-8 shadow-sm">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ التغييرات</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PermissionsChecklist from '@/components/forms/PermissionsChecklist.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

// تعريف بنية النموذج النظيفة للنمو المستقبلي
const form = ref({
  id: null,
  name: '',
  permissions: [], // مصفوفة من أسماء الصلاحيات النصية (String Names) لتتوافق مع الـ API
})

// 🌟 تزامن أمني شامل لحماية الأدوار الافتراضية من التعديل العشوائي للأسماء
const isDefaultRole = computed(() => {
  if (!form.value || !form.value.name) return false
  return ['Super Admin', 'Admin', 'User', 'Employee', 'HR Manager'].includes(form.value.name)
})

// مراقبة التغييرات في البيانات الأولية لملء النموذج بدقة متناهية
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        name: newData.name,
        // استخراج أسماء الصلاحيات النصية فقط من كائنات الصلاحيات القادمة من قاعدة البيانات
        permissions: newData.permissions ? newData.permissions.map((p) => p.name) : [],
      }
    } else {
      // إعادة تعيين النموذج بالكامل عند الرغبة في إنشاء دور جديد
      form.value = { id: null, name: '', permissions: [] }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
