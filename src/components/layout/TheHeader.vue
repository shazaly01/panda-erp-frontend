<!--src/components/layout/TheHeader.vue-->
<template>
  <header
    class="flex h-16 items-center justify-between bg-surface-section border-b border-surface-border px-4 sm:px-6 lg:px-8 flex-shrink-0 transition-colors duration-200"
  >
    <!-- زر فتح القائمة على الشاشات الصغيرة -->
    <button
      @click="$emit('open-sidebar')"
      class="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-ground transition-colors cursor-pointer"
      aria-label="فتح القائمة"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- أزرار التبديل بين موديولات الـ ERP -->
    <div class="flex-1 flex justify-center gap-2 sm:gap-4 px-4 overflow-x-auto">
      <button
        @click="appStore.setActiveModule('accounting')"
        :class="[
          appStore.activeModule === 'accounting'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer',
        ]"
      >
        <BanknotesIcon class="w-5 h-5 hidden sm:block" />
        <span>المحاسبة</span>
      </button>

      <button
        @click="appStore.setActiveModule('sales')"
        :class="[
          appStore.activeModule === 'sales'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer',
        ]"
      >
        <ReceiptPercentIcon class="w-5 h-5 hidden sm:block" />
        <span>المبيعات</span>
      </button>

      <button
        @click="appStore.setActiveModule('purchasing')"
        :class="[
          appStore.activeModule === 'purchasing'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer',
        ]"
      >
        <ShoppingCartIcon class="w-5 h-5 hidden sm:block" />
        <span>المشتريات</span>
      </button>

      <button
        @click="appStore.setActiveModule('inventory')"
        :class="[
          appStore.activeModule === 'inventory'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer',
        ]"
      >
        <CubeIcon class="w-5 h-5 hidden sm:block" />
        <span>المخازن</span>
      </button>

      <button
        @click="appStore.setActiveModule('hr')"
        :class="[
          appStore.activeModule === 'hr'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-text-secondary hover:bg-surface-ground hover:text-text-primary',
          'px-3 sm:px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer',
        ]"
      >
        <UserGroupIcon class="w-5 h-5 hidden sm:block" />
        <span>الموارد البشرية</span>
      </button>
    </div>

    <!-- عناصر التحكم ومعلومات المستخدم -->
    <div class="flex items-center gap-3">
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

defineEmits(['open-sidebar'])
const authStore = useAuthStore()
const appStore = useAppStore()
const themeStore = useThemeStore()
</script>
