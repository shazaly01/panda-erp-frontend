<template>
  <AppDialog
    :model-value="modelValue"
    @update:modelValue="close"
    :title="dialogTitle"
    size="max-w-7xl"
  >
    <div v-if="isLoading" class="text-center py-8">جاري التحميل...</div>

    <div v-else-if="permissionGroups.length === 0" class="text-center py-8 text-text-muted">
      لا توجد صلاحيات لعرضها.
    </div>

    <div v-else class="space-y-8">
      <div class="max-h-[65vh] overflow-y-auto px-1 space-y-8 custom-scrollbar">
        <div v-for="category in organizedPermissions" :key="category.name" class="space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b border-surface-border">
            <div class="w-2 h-6 bg-primary rounded-md shadow-sm"></div>
            <h3 class="font-bold text-text-primary text-lg">{{ category.name }}</h3>
          </div>

          <div
            class="border border-surface-border rounded-xl shadow-sm bg-surface-section overflow-hidden"
          >
            <div class="overflow-x-auto custom-scrollbar">
              <table class="min-w-full divide-y divide-surface-border text-sm">
                <thead class="bg-surface-ground">
                  <tr>
                    <th
                      class="p-3 font-bold text-text-secondary text-right sticky right-0 bg-surface-ground shadow-[1px_0_0_0_var(--surface-border)] z-10 min-w-[180px] align-bottom"
                    >
                      المجموعة
                    </th>
                    <th
                      v-for="action in permissionActions"
                      :key="action.key"
                      class="p-3 font-bold text-text-secondary text-center min-w-[100px] whitespace-nowrap"
                    >
                      <div class="flex flex-col items-center gap-2">
                        <span>{{ action.display }}</span>
                        <input
                          type="checkbox"
                          :checked="isColumnFullySelected(action.key, category.groups)"
                          @change="toggleColumn(action.key, category.groups, $event)"
                          class="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all shadow-sm"
                          title="تحديد/إلغاء تحديد كل صلاحيات هذا العمود لهذه المجموعة"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-surface-border">
                  <tr
                    v-for="group in category.groups"
                    :key="group.key"
                    class="hover:bg-primary/5 transition-colors group/row"
                  >
                    <td
                      class="p-3 font-semibold text-text-primary sticky right-0 bg-surface-section group-hover/row:bg-primary/5 shadow-[1px_0_0_0_var(--surface-border)] z-10 transition-colors"
                    >
                      {{ group.display_name }}
                    </td>

                    <td
                      v-for="action in permissionActions"
                      :key="action.key"
                      class="p-3 text-center"
                    >
                      <div class="flex justify-center items-center h-full">
                        <template v-if="getPermissionFor(group, action.key)">
                          <input
                            type="checkbox"
                            :value="getPermissionFor(group, action.key).id"
                            v-model="selectedPermissions"
                            class="h-5 w-5 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all shadow-sm hover:border-primary"
                          />
                        </template>
                        <span v-else class="text-text-muted opacity-20 select-none">-</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3 pt-5 border-t border-surface-border">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSubmit" :disabled="isSubmitting" class="px-8 shadow-sm">
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

const permissionGroups = computed(() => roleStore.permissions.groups || [])

// 🌟 تعديل ذكي: نضمن دائماً وجود عمود "فحص البوابة" للأفعال الخاصة غير القياسية إذا لم توفرها الخلفية برمجياً
const permissionActions = computed(() => {
  const actions = [...(roleStore.permissions.actions || [])]
  if (actions.length > 0 && !actions.some((a) => a.key === 'gate_check')) {
    actions.push({ key: 'gate_check', display: 'فحص البوابة' })
  }
  return actions
})

const categoriesDef = [
  {
    name: 'إدارة النظام',
    keys: ['dashboard', 'user', 'role', 'backup', 'setting'],
  },
  {
    name: 'الموارد البشرية - الهيكل والتوظيف',
    keys: ['departments', 'positions', 'employees', 'contracts'],
  },
  {
    name: 'الموارد البشرية - العمليات والرواتب',
    keys: [
      'payroll',
      'shifts',
      'working_schedules',
      'calendar_exceptions',
      'shift_overrides',
      'attendance',
      'leaves',
      'loans',
      'payroll_inputs',
      'team_attendance',
      'pay_groups',
      'pay_periods',
      'overtime_policies',
      'internet_vouchers',
      'hr_leave_passes', // 🌟 إضافة المفتاح هنا ليعرض السطر في قسم الموارد البشرية الصحيح
    ],
  },
  {
    name: 'المحاسبة - البيانات الأساسية',
    keys: ['account', 'cost_center', 'currency', 'fiscal_year', 'box', 'bank_account'],
  },
  {
    name: 'المحاسبة - العمليات والتقارير',
    keys: [
      'payment',
      'receipt',
      'journal_entry',
      'accounting_settings',
      'report',
      'account_mapping',
      'sequences',
    ],
  },
]

const organizedPermissions = computed(() => {
  const allGroups = [...permissionGroups.value]
  const result = []

  categoriesDef.forEach((cat) => {
    const groups = allGroups.filter((g) => cat.keys.includes(g.key))
    if (groups.length > 0) {
      result.push({ name: cat.name, groups })
    }
  })

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

// --- [ دوال التحديد الجماعي للأعمدة ] ---

/**
 * دالة مساعدة تجلب كل معرفات (IDs) الصلاحيات الخاصة بحدث معين (مثل view) داخل قسم معين
 */
function getIdsForColumn(actionKey, sectionGroups) {
  const ids = []
  sectionGroups.forEach((group) => {
    const p = getPermissionFor(group, actionKey)
    if (p) ids.push(p.id)
  })
  return ids
}

/**
 * فحص ما إذا كان العمود كاملاً محدد لكي نضع علامة (صح) على الصندوق العلوي
 */
function isColumnFullySelected(actionKey, sectionGroups) {
  const columnIds = getIdsForColumn(actionKey, sectionGroups)
  if (columnIds.length === 0) return false // لا توجد صلاحيات لهذا العمود هنا أصلاً

  // يرجع true فقط إذا كانت جميع معرفات العمود موجودة في selectedPermissions
  return columnIds.every((id) => selectedPermissions.value.includes(id))
}

/**
 * تحديد أو إلغاء تحديد كل صلاحيات العمود بنقرة واحدة
 */
function toggleColumn(actionKey, sectionGroups, event) {
  const isChecked = event.target.checked
  const columnIds = getIdsForColumn(actionKey, sectionGroups)

  if (isChecked) {
    // إضافة كل الصلاحيات غير الموجودة مسبقاً إلى المصفوفة
    const newSelections = columnIds.filter((id) => !selectedPermissions.value.includes(id))
    selectedPermissions.value.push(...newSelections)
  } else {
    // إزالة كل صلاحيات هذا العمود من المصفوفة
    selectedPermissions.value = selectedPermissions.value.filter((id) => !columnIds.includes(id))
  }
}

// --- [ حفظ وإغلاق النافذة ] ---

const close = () => emit('update:modelValue', false)

const handleSubmit = () => {
  if (!props.role) return

  const allPermissionsMap = new Map()

  permissionGroups.value.forEach((group) => {
    group.permissions.forEach((p) => {
      allPermissionsMap.set(p.id, p.name)
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

watch(
  () => props.role,
  (newRole) => {
    if (newRole && newRole.permissions) {
      selectedPermissions.value = newRole.permissions.map((p) => p.id)
    } else {
      selectedPermissions.value = []
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--surface-border);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: var(--text-muted);
}
</style>
