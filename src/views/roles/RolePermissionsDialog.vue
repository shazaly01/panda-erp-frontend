<!--src\views\roles\RolePermissionsDialog.vue--->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:modelValue="close"
    :title="dialogTitle"
    size="max-w-7xl"
  >
    <div v-if="isLoading" class="text-center py-12 text-text-secondary">
      <div
        class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-2"
      ></div>
      <div>جاري تحميل شجرة الصلاحيات ديناميكياً...</div>
    </div>

    <div v-else-if="modules.length === 0" class="text-center py-12 text-text-muted">
      لا توجد موديولات أو صلاحيات مسجلة في قاعدة البيانات.
    </div>

    <div v-else class="flex flex-col h-[75vh]">
      <div class="grid grid-cols-12 gap-6 flex-1 overflow-hidden mb-4">
        <div
          class="col-span-3 border-l border-surface-border pl-4 flex flex-col h-full overflow-y-auto custom-scrollbar"
        >
          <div class="space-y-1">
            <div class="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3">
              موديولات النظام المتاحة
            </div>
            <button
              v-for="mod in modules"
              :key="mod.key"
              @click="activeModuleKey = mod.key"
              type="button"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-right"
              :class="
                activeModuleKey === mod.key
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary'
              "
            >
              <span class="truncate">{{ mod.display_name }}</span>
              <span
                class="text-xs px-2 py-0.5 rounded-md font-bold"
                :class="
                  activeModuleKey === mod.key
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-ground text-text-muted border border-surface-border'
                "
              >
                {{ mod.groups.length }}
              </span>
            </button>
          </div>
        </div>

        <div class="col-span-9 flex flex-col h-full overflow-hidden">
          <div class="mb-4 flex items-center gap-4">
            <div class="relative flex-1">
              <span
                class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted"
              >
                🔍
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ابحث عن شاشة أو مجموعة صلاحيات داخل هذا الموديول..."
                class="w-full pr-10 pl-4 py-2 text-sm bg-surface-ground border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div
            class="flex-1 overflow-auto border border-surface-border rounded-xl bg-surface-section shadow-sm custom-scrollbar"
          >
            <table class="min-w-full divide-y divide-surface-border text-sm table-fixed">
              <thead
                class="bg-surface-ground sticky top-0 z-20 shadow-[0_1px_0_0_var(--surface-border)]"
              >
                <tr>
                  <th
                    class="p-3 font-bold text-text-primary text-right sticky right-0 bg-surface-ground shadow-[1px_0_0_0_var(--surface-border)] z-30 w-[220px]"
                  >
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        :checked="isModuleFullySelected"
                        @change="toggleActiveModule"
                        class="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all shadow-sm"
                        title="تحديد/إلغاء تحديد كافة شاشات هذا الموديول بالكامل"
                      />
                      <span>الشاشة / المجموعة</span>
                    </div>
                  </th>
                  <th
                    v-for="action in activeModuleActions"
                    :key="action.key"
                    class="p-3 font-bold text-text-secondary text-center min-w-[100px] whitespace-nowrap"
                  >
                    <div class="flex flex-col items-center gap-1.5">
                      <span>{{ action.display }}</span>
                      <input
                        type="checkbox"
                        :checked="isColumnFullySelected(action.key)"
                        @change="toggleColumn(action.key, $event)"
                        class="h-3.5 w-3.5 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all"
                        title="تحديد كل العمود للقسم الحالي"
                      />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-surface-border">
                <tr v-if="filteredGroups.length === 0" class="text-center">
                  <td :colspan="activeModuleActions.length + 1" class="p-8 text-text-muted">
                    لا توجد شاشات تطابق بحثك الحالي في هذا الموديول.
                  </td>
                </tr>

                <tr
                  v-for="group in filteredGroups"
                  :key="group.key"
                  class="hover:bg-primary/5 transition-colors group/row"
                >
                  <td
                    class="p-3 font-semibold text-text-primary sticky right-0 bg-surface-section group-hover/row:bg-primary/5 shadow-[1px_0_0_0_var(--surface-border)] z-10 transition-colors truncate"
                  >
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        :checked="isRowFullySelected(group)"
                        @change="toggleRow(group, $event)"
                        class="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all"
                        title="تحديد كامل صلاحيات هذه الشاشة"
                      />
                      <span :title="group.display_name">{{ group.display_name }}</span>
                    </div>
                  </td>

                  <td
                    v-for="action in activeModuleActions"
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
                      <span v-else class="text-text-muted opacity-15 select-none">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        class="flex justify-end gap-3 pt-4 border-t border-surface-border w-full bg-surface-section"
      >
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSubmit" :disabled="isSubmitting" class="px-8 shadow-sm">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات الهيكلية' }}
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
const activeModuleKey = ref(null)
const searchQuery = ref('')

const dialogTitle = computed(() => `تعديل وصيانة صلاحيات دور: ${props.role?.name || ''}`)

// جلب الموديولات مهيكلة من الستور مباشرة بناءً على رد الباك كوند الشجري الجديد
const modules = computed(() => roleStore.permissions.modules || [])

// مراقبة تحميل البيانات لتعيين أول موديول كـ تبويب نشط تلقائياً
watch(
  () => modules.value,
  (newModules) => {
    if (newModules.length > 0 && !activeModuleKey.value) {
      activeModuleKey.value = newModules[0].key
    }
  },
  { immediate: true },
)

// الموديول الحالي النشط بناء على اختيار المستخدم من القائمة الجانبية
const activeModule = computed(() => {
  return modules.value.find((m) => m.key === activeModuleKey.value) || null
})

// فلترة مجموعات الشاشات داخل الموديول النشط بناءً على مربع البحث السريع
const filteredGroups = computed(() => {
  if (!activeModule.value) return []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return activeModule.value.groups

  return activeModule.value.groups.filter(
    (g) => g.display_name.toLowerCase().includes(query) || g.key.toLowerCase().includes(query),
  )
})

// ميزة الأعمدة الذكية (Contextual Columns): استخراج الأعمدة التي تمتلك صلاحيات فعلية في هذا الموديول فقط
const activeModuleActions = computed(() => {
  if (!activeModule.value) return []

  const existingActionKeys = new Set()
  activeModule.value.groups.forEach((group) => {
    group.permissions.forEach((p) => {
      existingActionKeys.add(p.action)
    })
  })

  return (roleStore.permissions.actions || []).filter((a) => existingActionKeys.has(a.key))
})

// دالة مساعدة للحصول على كائن الصلاحية المطابق للسطر والعمود
function getPermissionFor(group, actionKey) {
  return group.permissions.find((p) => p.action === actionKey) || null
}

// --- [ منطق التحكم والتحديد الجماعي على مستوى السطر Row Level ] ---

function isRowFullySelected(group) {
  return group.permissions.every((p) => selectedPermissions.value.includes(p.id))
}

function toggleRow(group, event) {
  const isChecked = event.target.checked
  const permissionIds = group.permissions.map((p) => p.id)

  if (isChecked) {
    permissionIds.forEach((id) => {
      if (!selectedPermissions.value.includes(id)) {
        selectedPermissions.value.push(id)
      }
    })
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(
      (id) => !permissionIds.includes(id),
    )
  }
}

// --- [ منطق التحكم والتحديد الجماعي على مستوى العمود Column Level ] ---

function getIdsForActiveColumn(actionKey) {
  const ids = []
  filteredGroups.value.forEach((group) => {
    const p = getPermissionFor(group, actionKey)
    if (p) ids.push(p.id)
  })
  return ids
}

// فحص تفعيل زر العمود الكلي للقسم الحالي
function isColumnFullySelected(actionKey) {
  const columnIds = getIdsForActiveColumn(actionKey)
  if (columnIds.length === 0) return false
  return columnIds.every((id) => selectedPermissions.value.includes(id))
}

// تفعيل وتثبيت عمود بالكامل بنقرة واحدة
function toggleColumn(actionKey, event) {
  const isChecked = event.target.checked
  const columnIds = getIdsForActiveColumn(actionKey)

  if (isChecked) {
    const toAdd = columnIds.filter((id) => !selectedPermissions.value.includes(id))
    selectedPermissions.value.push(...toAdd)
  } else {
    selectedPermissions.value = selectedPermissions.value.filter((id) => !columnIds.includes(id))
  }
}

// --- [ منطق التحكم والتحديد الجماعي للموديول بأكمله Module Level ] ---

const isModuleFullySelected = computed(() => {
  if (filteredGroups.value.length === 0) return false
  return filteredGroups.value.every((group) => isRowFullySelected(group))
})

function toggleActiveModule(event) {
  const isChecked = event.target.checked
  filteredGroups.value.forEach((group) => {
    const isRowSelected = isRowFullySelected(group)
    if (isChecked && !isRowSelected) {
      toggleRow(group, { target: { checked: true } })
    } else if (!isChecked && isRowSelected) {
      toggleRow(group, { target: { checked: false } })
    }
  })
}

// --- [ حفظ وإغلاق الحوار ] ---

const close = () => emit('update:modelValue', false)

const handleSubmit = () => {
  if (!props.role) return

  // بناء خارطة مطابقة المعرفات الرقمية بمسمياتها اللاتينية الكاملة المخزنة في قاعدة البيانات
  const allPermissionsMap = new Map()
  modules.value.forEach((mod) => {
    mod.groups.forEach((group) => {
      group.permissions.forEach((p) => {
        allPermissionsMap.set(p.id, p.name)
      })
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

// مراقبة شحن الصلاحيات للدور المختار فورياً عند الفتح
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
  background-color: var(--surface-border, #e5e7eb);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: var(--text-muted, #9ca3af);
}
</style>
