<!--src\views\roles\RolePermissionsDialog.vue--->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:modelValue="close"
    :title="dialogTitle"
    size="max-w-7xl"
  >
    <!-- حالة التحميل -->
    <div v-if="isLoading" class="text-center py-12 text-text-secondary">
      <div
        class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-2"
      ></div>
      <div>جاري تحميل مصفوفة الصلاحيات ديناميكياً...</div>
    </div>

    <!-- حالة عدم وجود بيانات -->
    <div v-else-if="modules.length === 0" class="text-center py-12 text-text-muted">
      لا توجد موديولات أو صلاحيات مسجلة في قاعدة البيانات.
    </div>

    <!-- الواجهة الرئيسية -->
    <div v-else class="flex flex-col h-[75vh]">
      <div class="grid grid-cols-12 gap-6 flex-1 overflow-hidden mb-4">
        <!-- القائمة الجانبية للموديولات -->
        <div
          class="col-span-3 border-l border-surface-border pl-4 flex flex-col h-full overflow-y-auto custom-scrollbar"
        >
          <div class="space-y-1">
            <div class="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3">
              موديولات النظام
            </div>
            <button
              v-for="mod in modules"
              :key="mod.key"
              @click="selectModule(mod.key)"
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

        <!-- منطقة تفاصيل الصلاحيات للموديول النشط -->
        <div class="col-span-9 flex flex-col h-full overflow-hidden">
          <!-- شريط التحكم العلوي: التبويبات الفرعية ومربع البحث -->
          <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <!-- التبويبات الفرعية (تظهر فقط إذا كان الموديول يحتوي على تقارير) -->
            <div
              v-if="hasReports"
              class="flex items-center gap-1 bg-surface-ground p-1 rounded-xl border border-surface-border"
            >
              <button
                type="button"
                @click="activeSubTab = 'operations'"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                :class="
                  activeSubTab === 'operations'
                    ? 'bg-surface-section text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                "
              >
                العمليات والشاشات ({{ operationsGroups.length }})
              </button>
              <button
                type="button"
                @click="activeSubTab = 'reports'"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                :class="
                  activeSubTab === 'reports'
                    ? 'bg-surface-section text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                "
              >
                <span>التقارير ومؤشرات الرقابة</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary">
                  {{ reportPermissions.length }}
                </span>
              </button>
            </div>

            <div v-else class="text-sm font-bold text-text-primary">
              صلاحيات العمليات وإدارة البيانات
            </div>

            <!-- مربع البحث السريع -->
            <div class="relative w-72">
              <span
                class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted"
              >
                🔍
              </span>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="
                  activeSubTab === 'reports'
                    ? 'ابحث داخل تقارير هذا الموديول...'
                    : 'ابحث عن شاشة أو مجموعة...'
                "
                class="w-full pr-10 pl-4 py-1.5 text-xs bg-surface-ground border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <!-- 1. تبويب العمليات التشغيلية (جدول الـ CRUD المضغوط + العمليات الخاصة) -->
          <div
            v-if="activeSubTab === 'operations'"
            class="flex-1 overflow-auto border border-surface-border rounded-xl bg-surface-section shadow-sm custom-scrollbar"
          >
            <table class="min-w-full divide-y divide-surface-border text-sm table-fixed">
              <thead
                class="bg-surface-ground sticky top-0 z-20 shadow-[0_1px_0_0_var(--surface-border)]"
              >
                <tr>
                  <!-- عمود الشاشة -->
                  <th
                    class="p-3 font-bold text-text-primary text-right sticky right-0 bg-surface-ground shadow-[1px_0_0_0_var(--surface-border)] z-30 w-[210px]"
                  >
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        :checked="isModuleFullySelected"
                        @change="toggleActiveModule"
                        class="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all shadow-sm"
                        title="تحديد/إلغاء تحديد كافة صلاحيات هذا الموديول"
                      />
                      <span>الشاشة / الإدارة</span>
                    </div>
                  </th>

                  <!-- الأعمدة الأربعة القياسية (CRUD) -->
                  <th
                    v-for="std in standardActions"
                    :key="std.key"
                    class="p-3 font-bold text-text-secondary text-center w-[85px] whitespace-nowrap"
                  >
                    <div class="flex flex-col items-center gap-1.5">
                      <span>{{ std.display }}</span>
                      <input
                        type="checkbox"
                        :checked="isColumnFullySelected(std.key)"
                        @change="toggleColumn(std.key, $event)"
                        class="h-3.5 w-3.5 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all"
                        :title="`تحديد كل عمود (${std.display}) للشاشات الظاهرة`"
                      />
                    </div>
                  </th>

                  <!-- عمود الإجراءات والاعتمادات الخاصة -->
                  <th class="p-3 font-bold text-text-secondary text-right">
                    <span>سير العمل والعمليات الخاصة</span>
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-surface-border">
                <tr v-if="filteredOperationsGroups.length === 0" class="text-center">
                  <td colspan="6" class="p-8 text-text-muted">
                    لا توجد شاشات تطابق معايير البحث في هذا القسم.
                  </td>
                </tr>

                <tr
                  v-for="group in filteredOperationsGroups"
                  :key="group.key"
                  class="hover:bg-primary/5 transition-colors group/row"
                >
                  <!-- اسم الشاشة وتحديد السطر بالكامل -->
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

                  <!-- خلايا الـ CRUD القياسية -->
                  <td v-for="std in standardActions" :key="std.key" class="p-3 text-center">
                    <div class="flex justify-center items-center h-full">
                      <template v-if="getPermissionFor(group, std.key)">
                        <input
                          type="checkbox"
                          :value="getPermissionFor(group, std.key).id"
                          v-model="selectedPermissions"
                          class="h-5 w-5 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all shadow-sm hover:border-primary"
                        />
                      </template>
                      <span v-else class="text-text-muted opacity-20 select-none text-xs">—</span>
                    </div>
                  </td>

                  <!-- خلية العمليات الخاصة والاعتمادات (Chips) -->
                  <td class="p-3">
                    <div
                      v-if="getSpecialPermissions(group).length > 0"
                      class="flex flex-wrap items-center gap-1.5"
                    >
                      <label
                        v-for="perm in getSpecialPermissions(group)"
                        :key="perm.id"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer select-none transition-all"
                        :class="
                          selectedPermissions.includes(perm.id)
                            ? 'bg-primary/20 border-primary text-white font-bold shadow-xs'
                            : 'bg-surface-ground border-surface-border text-text-secondary hover:border-text-muted'
                        "
                      >
                        <input
                          type="checkbox"
                          :value="perm.id"
                          v-model="selectedPermissions"
                          class="h-3.5 w-3.5 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all"
                        />
                        <span>{{ perm.action_display || perm.action }}</span>
                      </label>
                    </div>
                    <span v-else class="text-text-muted opacity-25 text-xs select-none">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2. تبويب التقارير والرقابة (شبكة بطاقات مريحة) -->
          <div
            v-else-if="activeSubTab === 'reports'"
            class="flex-1 overflow-auto border border-surface-border rounded-xl bg-surface-section shadow-sm p-4 custom-scrollbar"
          >
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
              <div class="text-xs font-bold text-text-muted uppercase tracking-wider">
                قائمة التقارير والاستعلامات الرقابية المتاحة
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all-reports"
                  :checked="isAllReportsSelected"
                  @change="toggleAllReports"
                  class="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer"
                />
                <label
                  for="select-all-reports"
                  class="text-xs font-bold text-text-primary cursor-pointer"
                >
                  تحديد كافة التقارير
                </label>
              </div>
            </div>

            <div v-if="filteredReports.length === 0" class="text-center py-12 text-text-muted">
              لا توجد تقارير تطابق نص البحث المدخل.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <label
                v-for="perm in filteredReports"
                :key="perm.id"
                class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all"
                :class="
                  selectedPermissions.includes(perm.id)
                    ? 'bg-primary/10 border-primary text-white shadow-xs'
                    : 'bg-surface-ground border-surface-border hover:border-surface-border/80'
                "
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissions"
                  class="mt-1 h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer"
                />
                <div class="flex flex-col flex-1 min-w-0">
                  <span
                    class="text-sm font-bold truncate"
                    :class="
                      selectedPermissions.includes(perm.id) ? 'text-white' : 'text-text-primary'
                    "
                  >
                    {{ perm.action_display || perm.name }}
                  </span>
                  <span
                    class="text-[11px] font-mono truncate mt-0.5"
                    :class="
                      selectedPermissions.includes(perm.id) ? 'text-white/80' : 'text-text-muted'
                    "
                    dir="ltr"
                  >
                    {{ perm.name }}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- أزرار الحفظ والإلغاء في الأسفل -->
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
const activeSubTab = ref('operations') // 'operations' | 'reports'
const searchQuery = ref('')

const dialogTitle = computed(() => `صيانة وتخصيص صلاحيات دور: ${props.role?.name || ''}`)

// جلب هيكل الموديولات من الستور
const modules = computed(() => roleStore.permissions.modules || [])

// العمليات الأربع القياسية
const standardActions = [
  { key: 'view', display: 'عرض' },
  { key: 'create', display: 'إضافة' },
  { key: 'update', display: 'تعديل' },
  { key: 'delete', display: 'حذف' },
]

// تعيين أول موديول كـ تبويب نشط تلقائياً
watch(
  () => modules.value,
  (newModules) => {
    if (newModules.length > 0 && !activeModuleKey.value) {
      activeModuleKey.value = newModules[0].key
    }
  },
  { immediate: true },
)

const selectModule = (modKey) => {
  activeModuleKey.value = modKey
  activeSubTab.value = 'operations'
  searchQuery.value = ''
}

// الموديول النشط حالياً
const activeModule = computed(() => {
  return modules.value.find((m) => m.key === activeModuleKey.value) || null
})

// تمييز شاشات ومجموعات التقارير
const isReportGroup = (group) => {
  return group.key === 'reports' || group.key === 'report'
}

// مجموعات الشاشات والعمليات العادية
const operationsGroups = computed(() => {
  if (!activeModule.value) return []
  return activeModule.value.groups.filter((g) => !isReportGroup(g))
})

// مجموعات التقارير
const reportGroups = computed(() => {
  if (!activeModule.value) return []
  return activeModule.value.groups.filter((g) => isReportGroup(g))
})

// هل يحتوي الموديول الحالي على تقارير؟
const hasReports = computed(() => reportGroups.value.length > 0)

// استخراج كافة صلاحيات التقارير للموديول
const reportPermissions = computed(() => {
  const perms = []
  reportGroups.value.forEach((group) => {
    group.permissions.forEach((p) => perms.push(p))
  })
  return perms
})

// فلترة مجموعات العمليات بناءً على البحث
const filteredOperationsGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query || activeSubTab.value !== 'operations') return operationsGroups.value

  return operationsGroups.value.filter(
    (g) => g.display_name.toLowerCase().includes(query) || g.key.toLowerCase().includes(query),
  )
})

// فلترة قائمة التقارير بناءً على البحث
const filteredReports = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query || activeSubTab.value !== 'reports') return reportPermissions.value

  return reportPermissions.value.filter(
    (p) =>
      (p.action_display && p.action_display.toLowerCase().includes(query)) ||
      p.name.toLowerCase().includes(query),
  )
})

// جلب الصلاحية القياسية لشاشة معينة
function getPermissionFor(group, actionKey) {
  return group.permissions.find((p) => p.action === actionKey) || null
}

// جلب الصلاحيات الاستثنائية/الخاصة بشاشة معينة (سير العمل، الاعتمادات، إلخ)
function getSpecialPermissions(group) {
  const stdKeys = ['view', 'create', 'update', 'delete']
  return group.permissions.filter((p) => !stdKeys.includes(p.action))
}

// --- [ منطق التحديد الجماعي على مستوى السطر Row Level ] ---

function isRowFullySelected(group) {
  return group.permissions.every((p) => selectedPermissions.value.includes(p.id))
}

function toggleRow(group, event) {
  const isChecked = event.target.checked
  const ids = group.permissions.map((p) => p.id)

  if (isChecked) {
    ids.forEach((id) => {
      if (!selectedPermissions.value.includes(id)) {
        selectedPermissions.value.push(id)
      }
    })
  } else {
    selectedPermissions.value = selectedPermissions.value.filter((id) => !ids.includes(id))
  }
}

// --- [ منطق التحديد الجماعي على مستوى العمود القياسي Column Level ] ---

function getIdsForActionColumn(actionKey) {
  const ids = []
  filteredOperationsGroups.value.forEach((group) => {
    const p = getPermissionFor(group, actionKey)
    if (p) ids.push(p.id)
  })
  return ids
}

function isColumnFullySelected(actionKey) {
  const columnIds = getIdsForActionColumn(actionKey)
  if (columnIds.length === 0) return false
  return columnIds.every((id) => selectedPermissions.value.includes(id))
}

function toggleColumn(actionKey, event) {
  const isChecked = event.target.checked
  const columnIds = getIdsForActionColumn(actionKey)

  if (isChecked) {
    const toAdd = columnIds.filter((id) => !selectedPermissions.value.includes(id))
    selectedPermissions.value.push(...toAdd)
  } else {
    selectedPermissions.value = selectedPermissions.value.filter((id) => !columnIds.includes(id))
  }
}

// --- [ منطق التحديد الجماعي للموديول بالكامل Module Level ] ---

const isModuleFullySelected = computed(() => {
  if (!activeModule.value || activeModule.value.groups.length === 0) return false
  return activeModule.value.groups.every((group) => isRowFullySelected(group))
})

function toggleActiveModule(event) {
  const isChecked = event.target.checked
  if (!activeModule.value) return

  activeModule.value.groups.forEach((group) => {
    const isRowSelected = isRowFullySelected(group)
    if (isChecked && !isRowSelected) {
      toggleRow(group, { target: { checked: true } })
    } else if (!isChecked && isRowSelected) {
      toggleRow(group, { target: { checked: false } })
    }
  })
}

// --- [ منطق التحديد الجماعي للتقارير Reports Level ] ---

const isAllReportsSelected = computed(() => {
  if (filteredReports.value.length === 0) return false
  return filteredReports.value.every((p) => selectedPermissions.value.includes(p.id))
})

function toggleAllReports(event) {
  const isChecked = event.target.checked
  const reportIds = filteredReports.value.map((p) => p.id)

  if (isChecked) {
    const toAdd = reportIds.filter((id) => !selectedPermissions.value.includes(id))
    selectedPermissions.value.push(...toAdd)
  } else {
    selectedPermissions.value = selectedPermissions.value.filter((id) => !reportIds.includes(id))
  }
}

// --- [ شحن وتفريغ صلاحيات الدور المختار ] ---

const loadRolePermissions = (role) => {
  if (!role || !role.permissions) {
    selectedPermissions.value = []
    return
  }

  const nameToIdMap = new Map()
  modules.value.forEach((mod) => {
    mod.groups.forEach((group) => {
      group.permissions.forEach((p) => {
        nameToIdMap.set(p.name, p.id)
      })
    })
  })

  selectedPermissions.value = role.permissions
    .map((p) => {
      if (typeof p === 'object' && p !== null) return p.id
      if (typeof p === 'number') return p
      if (typeof p === 'string') return nameToIdMap.get(p)
      return null
    })
    .filter((id) => id !== null && id !== undefined)
}

watch(
  () => [props.role, modules.value],
  ([newRole]) => {
    loadRolePermissions(newRole)
  },
  { immediate: true, deep: true },
)

// --- [ حفظ وإغلاق الحوار ] ---

const close = () => emit('update:modelValue', false)

const handleSubmit = () => {
  if (!props.role) return

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
