<!--src/components/layout/TheHeader.vue-->
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

    <!-- أزرار التبديل بين موديولات الـ ERP -->
    <nav
      aria-label="أقسام النظام"
      class="flex-1 min-w-0 flex items-center justify-start lg:justify-center gap-1.5 sm:gap-3 px-1 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth"
    >
      <button
        :ref="(el) => setModuleRef('accounting', el)"
        @click="handleSelectModule('accounting')"
        :class="[
          appStore.activeModule === 'accounting'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
        ]"
      >
        <BanknotesIcon class="w-5 h-5 hidden sm:block" />
        <span>المحاسبة</span>
      </button>

      <button
        :ref="(el) => setModuleRef('sales', el)"
        @click="handleSelectModule('sales')"
        :class="[
          appStore.activeModule === 'sales'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
        ]"
      >
        <ReceiptPercentIcon class="w-5 h-5 hidden sm:block" />
        <span>المبيعات</span>
      </button>

      <button
        :ref="(el) => setModuleRef('purchasing', el)"
        @click="handleSelectModule('purchasing')"
        :class="[
          appStore.activeModule === 'purchasing'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
        ]"
      >
        <ShoppingCartIcon class="w-5 h-5 hidden sm:block" />
        <span>المشتريات</span>
      </button>

      <button
        :ref="(el) => setModuleRef('inventory', el)"
        @click="handleSelectModule('inventory')"
        :class="[
          appStore.activeModule === 'inventory'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
        ]"
      >
        <CubeIcon class="w-5 h-5 hidden sm:block" />
        <span>المخازن</span>
      </button>

      <button
        :ref="(el) => setModuleRef('hr', el)"
        @click="handleSelectModule('hr')"
        :class="[
          appStore.activeModule === 'hr'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer',
        ]"
      >
        <UserGroupIcon class="w-5 h-5 hidden sm:block" />
        <span>الموارد البشرية</span>
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
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useThemeStore } from '@/stores/themeStore'
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

// خريطة مسارات لوحات التحكم لكل موديول (قابلة للتوسع عند بناء لوحات باقي الموديولات)
const moduleDashboards = {
  accounting: 'accounting.dashboard',
}

const handleSelectModule = (moduleKey) => {
  appStore.setActiveModule(moduleKey)
  emit('module-selected', moduleKey)

  const targetRouteName = moduleDashboards[moduleKey]
  if (targetRouteName && router.hasRoute(targetRouteName)) {
    router.push({ name: targetRouteName })
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
