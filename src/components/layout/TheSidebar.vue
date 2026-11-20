<!--src\components\layout\TheSidebar.vue-->
<template>
  <aside
    class="flex h-full flex-col bg-surface-section border-l border-surface-border lg:border-l-0 lg:border-r transition-colors duration-200 overflow-x-hidden"
  >
    <!-- رأس القائمة الجانبية -->
    <div
      class="flex h-16 items-center justify-between px-5 flex-shrink-0 border-b border-surface-border/50"
    >
      <RouterLink :to="{ name: 'Dashboard' }" class="flex items-center gap-2.5 min-w-0">
        <img
          v-if="
            appStore.isSidebarCollapsed
              ? brandingStore.logoMiniUrl
              : brandingStore.logoFullUrl || brandingStore.logoMiniUrl
          "
          :src="
            appStore.isSidebarCollapsed
              ? brandingStore.logoMiniUrl
              : brandingStore.logoFullUrl || brandingStore.logoMiniUrl
          "
          :alt="brandingStore.appName"
          class="h-9 w-auto object-contain rounded-md flex-shrink-0"
        />
        <h1
          v-if="!appStore.isSidebarCollapsed"
          class="text-lg font-bold text-text-primary truncate"
        >
          {{ brandingStore.appName }}
        </h1>
      </RouterLink>
      <button
        @click="$emit('close-sidebar')"
        class="lg:hidden text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-ground transition-colors"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <!-- مساحة التمرير والروابط مع حركة انتقال انسيابية عند تغيير الموديول -->
    <div class="flex flex-1 flex-col justify-between overflow-y-auto overflow-x-hidden mt-2">
      <Transition name="sidebar-module-slide" mode="out-in">
        <div :key="appStore.activeModule" class="space-y-3">
          <!-- بطاقة هوية الموديول النشط -->
          <div v-if="activeModuleMeta && !appStore.isSidebarCollapsed" class="px-4 pt-1">
            <div
              class="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-300"
              :class="activeModuleMeta.bannerBg"
            >
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                :class="activeModuleMeta.iconBox"
              >
                <component :is="activeModuleMeta.icon" class="h-4 w-4" stroke-width="2" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span
                    class="h-1.5 w-1.5 rounded-full animate-pulse"
                    :class="activeModuleMeta.dotColor"
                  ></span>
                  <p class="text-xs font-extrabold truncate" :class="activeModuleMeta.titleColor">
                    {{ activeModuleMeta.label }}
                  </p>
                </div>
                <p class="text-[10px] text-text-muted truncate">
                  {{ activeModuleMeta.subtitle }}
                </p>
              </div>
            </div>
          </div>

          <nav class="space-y-1 px-4">
            <template v-for="(item, itemIndex) in filteredNavLinks" :key="item.name || itemIndex">
              <!-- فاصل عنوان رئيسي بين الكتل -->
              <div v-if="item.type === 'header'" class="px-2 pt-4 pb-1.5 select-none">
                <span
                  class="text-[11px] font-bold text-text-muted/70 uppercase tracking-wider block"
                >
                  {{ item.name }}
                </span>
              </div>

              <!-- رابط مفرد مباشر -->
              <RouterLink
                v-else-if="!item.children"
                :to="{ name: item.routeName }"
                class="nav-link group"
                @click="$emit('close-sidebar')"
              >
                <component
                  :is="item.icon"
                  class="h-5 w-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
                  :class="getTheme(item.theme).rootIcon"
                  stroke-width="1.5"
                />
                <span class="mx-2.5 text-sm font-medium">{{ item.name }}</span>
              </RouterLink>

              <!-- مجموعة منسدلة -->
              <div v-else class="my-0.5">
                <button
                  @click="toggleGroup(item.name)"
                  class="nav-group-button group"
                  :class="[
                    isGroupOpen(item.name) ? getTheme(item.theme).groupOpenHeader : '',
                    isGroupActive(item) ? getTheme(item.theme).activeGroupHeader : '',
                  ]"
                >
                  <div class="flex items-center min-w-0">
                    <div
                      class="flex h-7 w-7 items-center justify-center rounded-md transition-colors flex-shrink-0"
                      :class="getTheme(item.theme).iconContainer"
                    >
                      <component
                        :is="item.icon"
                        class="h-5 w-5 transition-transform duration-200 group-hover:scale-105 flex-shrink-0"
                        stroke-width="1.5"
                      />
                    </div>
                    <span class="mx-2.5 text-sm font-semibold truncate">{{ item.name }}</span>
                  </div>
                  <ChevronDownIcon
                    class="h-4 w-4 transform transition-transform duration-200 text-text-muted flex-shrink-0"
                    :class="{ 'rotate-180': isGroupOpen(item.name) }"
                  />
                </button>

                <!-- حاوية العناصر الفرعية مع تدرج لوني وحد جانبي مميز للموديول -->
                <transition
                  enter-active-class="transition-all ease-in-out duration-300"
                  leave-active-class="transition-all ease-in-out duration-200"
                  enter-from-class="max-h-0 opacity-0"
                  enter-to-class="max-h-[600px] opacity-100"
                  leave-from-class="max-h-[600px] opacity-100"
                  leave-to-class="max-h-0 opacity-0"
                >
                  <div
                    v-show="isGroupOpen(item.name)"
                    class="mt-1 mr-2 space-y-1 overflow-hidden rounded-lg py-1.5 px-1.5 transition-colors duration-200"
                    :class="getTheme(item.theme).subContainer"
                  >
                    <template
                      v-for="(child, childIndex) in item.children"
                      :key="child.name || childIndex"
                    >
                      <!-- عنوان تصنيف داخلي -->
                      <div
                        v-if="child.type === 'header'"
                        class="px-3 pt-2.5 pb-1 select-none border-t border-surface-border/50 first:border-t-0 first:pt-1 mt-1.5 first:mt-0"
                      >
                        <span
                          class="text-[10px] font-extrabold uppercase tracking-wider block"
                          :class="getTheme(item.theme).subHeaderColor"
                        >
                          {{ child.name }}
                        </span>
                      </div>

                      <!-- الروابط الفرعية داخل المجموعة المنسدلة -->
                      <RouterLink
                        v-else
                        :to="{ name: child.routeName }"
                        v-slot="{ isExactActive, navigate, href }"
                        custom
                        @click="$emit('close-sidebar')"
                      >
                        <a
                          :href="href"
                          @click="navigate"
                          class="nav-link nav-sub-link group"
                          :class="[
                            isExactActive
                              ? getTheme(item.theme).activeSubLink
                              : 'text-text-secondary hover:bg-surface-ground/70 hover:text-text-primary',
                          ]"
                        >
                          <span
                            class="h-1.5 w-1.5 rounded-full transition-all duration-200 ml-1 flex-shrink-0"
                            :class="[
                              isExactActive
                                ? getTheme(item.theme).activeDot
                                : 'bg-text-muted/40 group-hover:bg-text-muted',
                            ]"
                          ></span>
                          <span class="mx-2 text-[13px] font-medium leading-none">{{
                            child.name
                          }}</span>
                        </a>
                      </RouterLink>
                    </template>
                  </div>
                </transition>
              </div>
            </template>
          </nav>
        </div>
      </Transition>

      <!-- فوتر القائمة الجانبية (تسجيل الخروج) -->
      <div class="mt-auto border-t border-surface-border px-3 py-3">
        <a @click.prevent="handleLogout" href="#" class="nav-link text-danger hover:bg-danger/10">
          <ArrowLeftOnRectangleIcon class="h-5 w-5" stroke-width="1.5" />
          <span class="mx-2.5 text-sm font-medium">تسجيل الخروج</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useBrandingStore } from '@/stores/brandingStore'
import {
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import { appMenus } from '@/core/menus'

defineEmits(['close-sidebar'])

const authStore = useAuthStore()
const route = useRoute()
const brandingStore = useBrandingStore()
const appStore = useAppStore()

// جعل allNavLinks تتغير آلياً عندما يضغط المستخدم على زر المبدل في الأعلى
const allNavLinks = computed(() => {
  return appMenus[appStore.activeModule] || []
})

// تعريف هوية كل موديول لتمييز القائمة الجانبية بصرياً عند التبديل
const moduleMetaMap = {
  accounting: {
    label: 'الإدارة المالية والمحاسبة',
    subtitle: 'النظام المحاسبي المتكامل',
    icon: BanknotesIcon,
    bannerBg:
      'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-400/10 dark:border-emerald-400/30',
    iconBox: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
    titleColor: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  sales: {
    label: 'إدارة المبيعات',
    subtitle: 'الفواتير ونقاط البيع',
    icon: ReceiptPercentIcon,
    bannerBg: 'bg-primary/10 border-primary/30 dark:bg-primary/15 dark:border-primary/30',
    iconBox: 'bg-primary text-white shadow-sm shadow-primary/30',
    titleColor: 'text-primary dark:text-primary-light',
    dotColor: 'bg-primary',
  },
  purchasing: {
    label: 'إدارة المشتريات',
    subtitle: 'التوريد والموردون',
    icon: ShoppingCartIcon,
    bannerBg:
      'bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-400/10 dark:border-indigo-400/30',
    iconBox: 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30',
    titleColor: 'text-indigo-700 dark:text-indigo-300',
    dotColor: 'bg-indigo-500',
  },
  inventory: {
    label: 'إدارة المخازن',
    subtitle: 'المستودعات والأرصدة',
    icon: CubeIcon,
    bannerBg: 'bg-sky-500/10 border-sky-500/30 dark:bg-sky-400/10 dark:border-sky-400/30',
    iconBox: 'bg-sky-500 text-white shadow-sm shadow-sky-500/30',
    titleColor: 'text-sky-700 dark:text-sky-300',
    dotColor: 'bg-sky-500',
  },
  hr: {
    label: 'الموارد البشرية',
    subtitle: 'شؤون الموظفين والرواتب',
    icon: UserGroupIcon,
    bannerBg: 'bg-slate-500/10 border-slate-500/30 dark:bg-slate-400/10 dark:border-slate-400/30',
    iconBox: 'bg-slate-600 text-white shadow-sm shadow-slate-500/30',
    titleColor: 'text-slate-700 dark:text-slate-200',
    dotColor: 'bg-slate-500',
  },
}

const activeModuleMeta = computed(() => {
  return moduleMetaMap[appStore.activeModule] || null
})

// تعريف سمات التصميم البصرية لكل موديول بصيغة Tailwind كاملة لمنع الـ Purge
const moduleThemes = {
  primary: {
    rootIcon: 'text-primary',
    iconContainer: 'bg-primary/10 text-primary dark:bg-primary/20',
    groupOpenHeader: 'bg-primary/5 text-primary dark:bg-primary/10',
    activeGroupHeader: 'text-primary font-bold',
    subContainer: 'bg-primary/[0.03] dark:bg-primary/[0.08] border-r-2 border-primary/40',
    subHeaderColor: 'text-primary dark:text-primary-light',
    activeSubLink:
      'bg-primary/15 text-primary dark:bg-primary/25 font-bold border-r-2 border-primary rounded-r-none',
    activeDot: 'bg-primary scale-125',
  },
  sky: {
    rootIcon: 'text-sky-500 dark:text-sky-400',
    iconContainer: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    groupOpenHeader: 'bg-sky-50/70 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    activeGroupHeader: 'text-sky-600 dark:text-sky-400 font-bold',
    subContainer: 'bg-sky-50/40 dark:bg-sky-950/30 border-r-2 border-sky-500/50',
    subHeaderColor: 'text-sky-700 dark:text-sky-300',
    activeSubLink:
      'bg-sky-100/90 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 font-bold border-r-2 border-sky-500 rounded-r-none',
    activeDot: 'bg-sky-500 scale-125',
  },
  emerald: {
    rootIcon: 'text-emerald-500 dark:text-emerald-400',
    iconContainer: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    groupOpenHeader:
      'bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    activeGroupHeader: 'text-emerald-600 dark:text-emerald-400 font-bold',
    subContainer: 'bg-emerald-50/40 dark:bg-emerald-950/30 border-r-2 border-emerald-500/50',
    subHeaderColor: 'text-emerald-700 dark:text-emerald-300',
    activeSubLink:
      'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 font-bold border-r-2 border-emerald-500 rounded-r-none',
    activeDot: 'bg-emerald-500 scale-125',
  },
  indigo: {
    rootIcon: 'text-indigo-500 dark:text-indigo-400',
    iconContainer: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    groupOpenHeader: 'bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    activeGroupHeader: 'text-indigo-600 dark:text-indigo-400 font-bold',
    subContainer: 'bg-indigo-50/40 dark:bg-indigo-950/30 border-r-2 border-indigo-500/50',
    subHeaderColor: 'text-indigo-700 dark:text-indigo-300',
    activeSubLink:
      'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 font-bold border-r-2 border-indigo-500 rounded-r-none',
    activeDot: 'bg-indigo-500 scale-125',
  },
  slate: {
    rootIcon: 'text-slate-500 dark:text-slate-400',
    iconContainer: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    groupOpenHeader: 'bg-slate-100/80 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200',
    activeGroupHeader: 'text-slate-700 dark:text-slate-300 font-bold',
    subContainer: 'bg-slate-100/50 dark:bg-slate-800/30 border-r-2 border-slate-500/50',
    subHeaderColor: 'text-slate-600 dark:text-slate-300',
    activeSubLink:
      'bg-slate-200/80 text-slate-900 dark:bg-slate-700/60 dark:text-slate-100 font-bold border-r-2 border-slate-500 rounded-r-none',
    activeDot: 'bg-slate-500 scale-125',
  },
}

// ربط افتراضي بين موديولات الـ ERP والسمات اللونية في حال عدم تحديد theme داخل العنصر
const defaultModuleThemeMap = {
  sales: 'primary',
  accounting: 'emerald',
  purchasing: 'indigo',
  inventory: 'sky',
  hr: 'slate',
}

const getTheme = (themeName) => {
  const resolvedTheme = themeName || defaultModuleThemeMap[appStore.activeModule] || 'primary'
  return moduleThemes[resolvedTheme] || moduleThemes.primary
}

const isGroupActive = (group) => {
  if (!group.children) return false
  return group.children.some((child) => child.routeName === route.name)
}

// الفلترة الديناميكية للصلاحيات مع الحفاظ على منطق الـ ERP
const filteredNavLinks = computed(() => {
  return allNavLinks.value
    .map((item) => {
      if (item.type === 'header') {
        return item
      }
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) => child.type === 'header' || authStore.can(child.permission),
        )
        const hasParentPermission = item.permission ? authStore.can(item.permission) : false
        const hasValidChildren = filteredChildren.some((c) => c.type !== 'header')

        if (hasValidChildren || hasParentPermission) {
          return { ...item, children: filteredChildren }
        }
        return null
      }

      return !item.permission || authStore.can(item.permission) ? item : null
    })
    .filter(Boolean)
})

const openGroups = ref([])

const toggleGroup = (groupName) => {
  if (openGroups.value.includes(groupName)) {
    openGroups.value = openGroups.value.filter((g) => g !== groupName)
  } else {
    openGroups.value.push(groupName)
  }
}

const isGroupOpen = (groupName) => {
  return openGroups.value.includes(groupName)
}

const setActiveGroup = () => {
  const currentRouteName = route.name
  for (const group of filteredNavLinks.value) {
    if (group.children && group.children.some((child) => child.routeName === currentRouteName)) {
      if (!isGroupOpen(group.name)) {
        openGroups.value.push(group.name)
      }
      return
    }
  }
}

watch(route, setActiveGroup, { immediate: true })

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center rounded-lg px-3 py-2 text-text-secondary transition-all duration-200 select-none;
}
.nav-link:hover {
  @apply bg-surface-ground text-text-primary;
}
.nav-link.router-link-exact-active {
  @apply bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-md shadow-primary/25;
}
.nav-sub-link {
  @apply py-1.5 px-2.5 rounded-md;
}
.nav-group-button {
  @apply flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-text-secondary transition-all duration-200 select-none;
}
.nav-group-button:hover {
  @apply bg-surface-ground text-text-primary;
}
</style>
