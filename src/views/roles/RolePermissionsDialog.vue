<template>
  <AppDialog
    :model-value="modelValue"
    @update:modelValue="close"
    :title="dialogTitle"
    size="max-w-5xl"
  >
    <div v-if="isLoading" class="text-center py-8">جاري التحميل...</div>

    <div v-else-if="permissionGroups.length === 0" class="text-center py-8">
      لا توجد صلاحيات لعرضها.
    </div>

    <div v-else class="space-y-8">
      <div class="max-h-[65vh] overflow-y-auto px-1 space-y-8 custom-scrollbar">
        <div v-for="category in organizedPermissions" :key="category.name" class="space-y-3">
          <div class="flex items-center gap-3 pb-2 border-b border-surface-border">
            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 class="font-bold text-text-primary text-lg">{{ category.name }}</h3>
          </div>

          <div
            class="border border-surface-border rounded-xl overflow-hidden shadow-sm bg-surface-section"
          >
            <table class="min-w-full divide-y divide-surface-border">
              <thead class="bg-surface-ground/50">
                <tr>
                  <th class="p-3 font-bold text-text-secondary text-right text-sm w-1/4">
                    المجموعة
                  </th>
                  <th
                    v-for="action in permissionActions"
                    :key="action.key"
                    class="p-3 font-bold text-text-secondary text-center text-sm"
                  >
                    {{ action.display_name }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border">
                <tr
                  v-for="group in category.groups"
                  :key="group.key"
                  class="hover:bg-primary/5 transition-colors"
                >
                  <td class="p-3 font-semibold text-text-primary text-sm">
                    {{ group.display_name }}
                  </td>

                  <td v-for="action in permissionActions" :key="action.key" class="p-3 text-center">
                    <template v-if="getPermissionFor(group, action.key)">
                      <input
                        type="checkbox"
                        :value="getPermissionFor(group, action.key).id"
                        v-model="selectedPermissions"
                        class="h-5 w-5 rounded border-surface-border text-primary focus:ring-primary cursor-pointer transition-all"
                      />
                    </template>
                    <span v-else class="text-text-muted opacity-20">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-border">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSubmit" :disabled="isSubmitting" class="px-8">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الصلاحيات' }}
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  role: Object,
  isLoading: Boolean,
  isSubmitting: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])
const roleStore = useRoleStore()
const selectedPermissions = ref([])

const dialogTitle = computed(() => `تعديل صلاحيات دور: ${props.role?.name || ''}`)

// --- [إعدادات الأقسام لـ ERP القابل للتوسع] ---

const categoriesDef = [
  {
    name: 'إدارة النظام',
    keys: ['dashboard', 'user', 'role', 'backup', 'setting'],
  },
  {
    name: 'المحاسبة - البيانات الأساسية',
    keys: ['account', 'cost_center', 'currency', 'fiscal_year', 'box', 'bank_account'],
  },
  {
    name: 'المحاسبة - العمليات والتقارير',
    keys: ['payment', 'receipt', 'journal_entry', 'accounting_settings', 'report'],
  },
]

const permissionGroups = computed(() => roleStore.permissions.groups || [])
const permissionActions = computed(() => roleStore.permissions.actions || [])

// تنظيم البيانات حسب الأقسام
const organizedPermissions = computed(() => {
  const allGroups = [...permissionGroups.value]
  const result = []

  // 1. تصنيف المجموعات المعرفة مسبقاً
  categoriesDef.forEach((cat) => {
    const groups = allGroups.filter((g) => cat.keys.includes(g.key))
    if (groups.length > 0) {
      result.push({ name: cat.name, groups })
    }
  })

  // 2. تجميع أي مجموعات جديدة (غير مصنفة) في قسم "أخرى" لضمان عدم ضياعها مستقبلاً
  const categorizedKeys = categoriesDef.flatMap((c) => c.keys)
  const otherGroups = allGroups.filter((g) => !categorizedKeys.includes(g.key))

  if (otherGroups.length > 0) {
    result.push({ name: 'وحدات إضافية / أخرى', groups: otherGroups })
  }

  return result
})

function getPermissionFor(group, actionKey) {
  return group.permissions.find((p) => p.action === actionKey)
}

watch(
  () => props.role,
  (newRole) => {
    selectedPermissions.value = newRole?.permissions?.map((p) => p.id) || []
  },
  { immediate: true, deep: true },
)

const close = () => emit('update:modelValue', false)

const handleSubmit = () => {
  if (!props.role) return

  // بناء Map للبحث عن اسم الصلاحية من الـ ID
  const allPermissionsMap = new Map()
  permissionGroups.value.forEach((group) => {
    group.permissions.forEach((p) => {
      allPermissionsMap.set(p.id, `${group.key}.${p.action}`)
    })
  })

  const permissionNames = selectedPermissions.value
    .map((id) => allPermissionsMap.get(id))
    .filter(Boolean)

  emit('submit', {
    name: props.role.name,
    permissions: permissionNames,
  })
}
</script>
