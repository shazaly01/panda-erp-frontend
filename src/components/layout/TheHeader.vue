<!-- src/components/layout/TheHeader.vue -->
<template>
  <header
    class="flex h-16 items-center justify-between bg-surface-section border-b border-surface-border px-2.5 sm:px-6 lg:px-8 gap-1.5 sm:gap-3 flex-shrink-0 transition-colors duration-200"
  >
    <!-- زر فتح القائمة على الشاشات الصغيرة -->
    <button
      @click="$emit('open-sidebar')"
      class="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-ground transition-colors cursor-pointer shrink-0"
      aria-label="فتح القائمة"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- أزرار التبديل بين موديولات الـ ERP المتاحة لصلاحيات المستخدم -->
    <nav
      aria-label="أقسام النظام"
      class="flex-1 min-w-0 flex items-center justify-start lg:justify-center gap-1.5 sm:gap-3 px-1 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth"
    >
      <button
        v-for="mod in visibleModules"
        :key="mod.key"
        :ref="(el) => setModuleRef(mod.key, el)"
        @click="handleSelectModule(mod.key)"
        :class="[
          appStore.activeModule === mod.key
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
        ]"
      >
        <component :is="mod.icon" class="w-5 h-5 hidden sm:block" />
        <span>{{ mod.label }}</span>
      </button>
    </nav>

    <!-- عناصر التحكم ومعلومات المستخدم -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <!-- زر التبديل بين الوضع الفاتح والداكن -->
      <button
        @click="themeStore.toggleTheme"
        type="button"
        class="relative p-2 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-ground border border-surface-border/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        :title="
          themeStore.currentTheme === 'dark'
            ? 'التبديل إلى الوضع الفاتح'
            : 'التبديل إلى الوضع الداكن'
        "
        aria-label="تبديل وضع المظهر"
      >
        <SunIcon
          v-if="themeStore.currentTheme === 'dark'"
          class="h-5 w-5 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45"
        />
        <MoonIcon
          v-else
          class="h-5 w-5 text-text-secondary transform transition-transform duration-300 hover:-rotate-12"
        />
      </button>

      <div class="h-6 w-[1px] bg-surface-border hidden sm:block"></div>

      <!-- معلومات المستخدم -->
      <div class="flex items-center gap-2">
        <span class="font-medium text-sm text-text-primary hidden sm:inline">
          {{ authStore.user?.full_name }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useThemeStore } from '@/stores/themeStore'
import { getAccessibleModules, resolveModuleLandingRoute } from '@/core/navigation/accessResolver'
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

const emit = defineEmits(['open-sidebar', 'module-selected'])
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const themeStore = useThemeStore()

const allModulesConfig = [
  { key: 'accounting', label: 'المحاسبة', icon: BanknotesIcon },
  { key: 'sales', label: 'المبيعات', icon: ReceiptPercentIcon },
  { key: 'purchasing', label: 'المشتريات', icon: ShoppingCartIcon },
  { key: 'inventory', label: 'المخازن', icon: CubeIcon },
  { key: 'hr', label: 'الموارد البشرية', icon: UserGroupIcon },
]

// عرض الموديولات التي يملك المستخدم صلاحيات تشغيلية داخلها فقط
const visibleModules = computed(() => {
  const allowedKeys = getAccessibleModules(authStore, router)
  return allModulesConfig.filter((mod) => allowedKeys.includes(mod.key))
})

const handleSelectModule = (moduleKey) => {
  appStore.setActiveModule(moduleKey)
  emit('module-selected', moduleKey)

  const targetRoute = resolveModuleLandingRoute(moduleKey, authStore, router)
  if (targetRoute) {
    router.push(targetRoute)
  }
}

const moduleRefs = ref({})

const setModuleRef = (key, el) => {
  if (el) {
    moduleRefs.value[key] = el
  }
}

const scrollToActiveModule = async (smooth = true) => {
  await nextTick()
  const activeEl = moduleRefs.value[appStore.activeModule]
  if (activeEl && typeof activeEl.scrollIntoView === 'function') {
    activeEl.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'nearest',
      inline: 'center',
    })
  }
}

watch(
  () => appStore.activeModule,
  () => {
    scrollToActiveModule(true)
  },
)

onMounted(() => {
  setTimeout(() => {
    scrollToActiveModule(false)
  }, 60)
})
</script>
