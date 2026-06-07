<template>
  <div class="space-y-6">
    <div class="sticky top-0 bg-surface-section py-2 z-10 shadow-sm border-b border-surface-border">
      <div class="relative">
        <span
          class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted"
        >
          🔍
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث عن موديول، شاشة، أو صلاحية معينة..."
          class="w-full pr-10 pl-4 py-2 text-sm bg-surface-ground border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center py-6 text-text-secondary">
      <div
        class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full mb-2"
      ></div>
      <div class="text-xs">جاري بناء مصفوفة الصلاحيات ديناميكياً...</div>
    </div>

    <div v-else-if="error" class="text-center text-danger text-sm py-4">⚠️ {{ error }}</div>

    <div v-else-if="filteredModules.length === 0" class="text-center text-text-muted py-8 text-sm">
      لا توجد موديولات أو شاشات تطابق استعلام البحث الحالي.
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="mod in filteredModules"
        :key="mod.key"
        class="border border-surface-border rounded-xl p-4 bg-surface-section shadow-sm space-y-4"
      >
        <div class="flex items-center justify-between border-b border-surface-border pb-2">
          <h4 class="font-bold text-sm text-primary flex items-center gap-2">
            <span class="w-2 h-2 bg-primary rounded-full"></span>
            {{ mod.display_name }}
          </h4>
          <span
            class="text-xs font-semibold bg-surface-ground text-text-muted px-2 py-0.5 rounded-md border border-surface-border"
          >
            {{ mod.groups.length }} شاشات
          </span>
        </div>

        <div class="space-y-4 divide-y divide-surface-border/50">
          <div v-for="group in mod.groups" :key="group.key" class="pt-3 first:pt-0">
            <h5
              class="text-xs font-bold text-text-primary mb-2.5 bg-surface-ground/50 px-2 py-1 rounded inline-block"
            >
              🖥️ {{ group.display_name }}
            </h5>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2">
              <div
                v-for="permission in group.permissions"
                :key="permission.id"
                class="flex items-center gap-2 group/item"
              >
                <input
                  :id="`perm-${permission.id}`"
                  type="checkbox"
                  :value="permission.name"
                  :checked="localSelected.includes(permission.name)"
                  @change="togglePermission(permission.name)"
                  class="h-4 w-4 rounded border-surface-border text-primary focus:ring-primary/50 cursor-pointer transition-all shadow-sm"
                />
                <label
                  :for="`perm-${permission.id}`"
                  class="text-xs text-text-secondary group-hover/item:text-text-primary cursor-pointer select-none transition-colors"
                >
                  {{ permission.action_display }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  // مصفوفة الصلاحيات المحددة مسبقاً (Array of string names) لتتوافق مع الـ v-model القياسي للـ Form
  selectedPermissions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:selectedPermissions'])

const roleStore = useRoleStore()
const { permissions, loading } = storeToRefs(roleStore)
const error = ref(null)
const localSelected = ref([...props.selectedPermissions])
const searchQuery = ref('')

// مزامنة الصلاحيات المختارة محلياً عند تغير البيانات القادمة من المكون الأب
watch(
  () => props.selectedPermissions,
  (newVal) => {
    localSelected.value = newVal ? [...newVal] : []
  },
  { deep: true },
)

// شحن البنية الهيكلية الشجرية عند التأسيس الأولي للمكون
onMounted(async () => {
  try {
    if (!roleStore.permissions.modules || roleStore.permissions.modules.length === 0) {
      await roleStore.fetchPermissions()
    }
  } catch (err) {
    console.error('PermissionsChecklist structural fetch failed:', err)
    error.value = 'فشل الخادم في تحميل شجرة الصلاحيات التأسيسية.'
  }
})

// 🌟 المحرك الذكي للفلترة التوافقية مع الهيكل المطور بنسبة 100% المقاد بالبيانات
const filteredModules = computed(() => {
  const modulesList = permissions.value.modules || []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return modulesList

  return modulesList
    .map((mod) => {
      // فلترة مجموعات الشاشات الداخلية بناءً على المطابقة لاسم الشاشة أو مسميات الأفعال
      const matchedGroups = mod.groups.filter((group) => {
        const groupMatches =
          group.display_name.toLowerCase().includes(query) ||
          group.key.toLowerCase().includes(query)
        const actionMatches = group.permissions.some(
          (p) =>
            p.action_display.toLowerCase().includes(query) || p.name.toLowerCase().includes(query),
        )
        return groupMatches || actionMatches
      })

      // إذا تطابق اسم الموديول نفسه، نعيده كاملاً بشاشاته، وإلا نعيد فقط الشاشات المتطابقة
      if (mod.display_name.toLowerCase().includes(query) || mod.key.toLowerCase().includes(query)) {
        return mod
      } else if (matchedGroups.length > 0) {
        return {
          ...mod,
          groups: matchedGroups,
        }
      }
      return null
    })
    .filter(Boolean) // تنظيف المصفوفة من العناصر الفارغة
})

// تبديل حالة الصلاحية (تحديد / إلغاء تحديد) وضخ المخرجات للأب فورياً
const togglePermission = (permissionName) => {
  const index = localSelected.value.indexOf(permissionName)
  if (index > -1) {
    localSelected.value.splice(index, 1)
  } else {
    localSelected.value.push(permissionName)
  }
  emit('update:selectedPermissions', localSelected.value)
}
</script>
