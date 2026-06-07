<template>
  <AppDialog
    :model-value="modelValue"
    @update:modelValue="close"
    :title="dialogTitle"
    size="max-w-7xl"
  >
    <div class="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
      <PermissionsChecklist v-model:selectedPermissions="selectedPermissions" />
    </div>

    <template #footer>
      <div class="mt-4 flex justify-end gap-3 pt-4 border-t border-surface-border w-full">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSave" :disabled="isSaving" class="px-8 shadow-sm">
          <span v-if="isSaving">جاري الحفظ...</span>
          <span v-else>حفظ الصلاحيات</span>
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PermissionsChecklist from '@/components/forms/PermissionsChecklist.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  role: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const selectedPermissions = ref([])

const dialogTitle = computed(() => `تعديل صلاحيات دور: ${props.role?.name || ''}`)

// 🌟 تحسين أمني: مراقبة حالة فتح النافذة والدور معاً لضمان شحن الصلاحيات الصحيحة دائماً
watch(
  () => [props.role, props.modelValue],
  ([newRole, isOpen]) => {
    if (isOpen && newRole) {
      // استخراج مصفوفة أسماء الصلاحيات النصية (String Names) لتمريرها للمكون التابع
      selectedPermissions.value = newRole.permissions ? newRole.permissions.map((p) => p.name) : []
    } else if (!isOpen) {
      // تفريغ المصفوفة عند الإغلاق لمنع تسريب البيانات بين النوافذ
      selectedPermissions.value = []
    }
  },
  { immediate: true, deep: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSave = () => {
  if (!props.role) return

  // تجهيز الـ Payload المتطابق بالكامل مع متطلبات الـ Validation في الباك كوند
  const payload = {
    id: props.role.id,
    name: props.role.name,
    permissions: selectedPermissions.value,
  }

  emit('save', payload)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--surface-border, #e5e7eb);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: var(--text-muted, #9ca3af);
}
</style>
