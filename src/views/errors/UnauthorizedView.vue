<!-- src/views/errors/UnauthorizedView.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-[65vh] px-4 py-8 text-center">
    <div
      class="w-full max-w-lg rounded-2xl bg-surface-section border border-surface-border p-8 shadow-sm transition-colors duration-200"
    >
      <!-- أيقونة التنبيه -->
      <div
        class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger border border-danger/20"
      >
        <ShieldExclamationIcon class="h-9 w-9" stroke-width="1.75" />
      </div>

      <!-- العنوان والوصف الديناميكي حسب حالة صلاحيات المستخدم -->
      <template v-if="hasAvailableScreen">
        <h1 class="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
          غير مصرح لك بالوصول إلى هذه الصفحة
        </h1>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          لا يملك حسابك الصلاحيات المطلوبة لعرض المحتوى المطلوب. يمكنك الانتقال إلى الشاشات المتاحة
          لصلاحياتك عبر زر العودة أدناه أو من القائمة الجانبية.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            @click="goToAvailableScreen"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-dark transition-all cursor-pointer"
          >
            <ArrowRightIcon class="h-4 w-4" />
            <span>الانتقال إلى شاشتي المتاحة</span>
          </button>

          <button
            type="button"
            @click="handleLogout"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-ground px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-danger hover:border-danger/40 transition-colors cursor-pointer"
          >
            <ArrowLeftOnRectangleIcon class="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </template>

      <template v-else>
        <h1 class="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
          حسابك بانتظار تحديد الصلاحيات
        </h1>
        <p class="text-sm text-text-secondary leading-relaxed mb-6">
          تم تسجيل دخولك بنجاح، ولكن لم يتم إسناد أي دور وظيفي أو صلاحيات وصول لحسابك حتى الآن. يرجى
          التواصل مع مدير النظام لتفعيل صلاحياتك.
        </p>

        <div class="flex items-center justify-center">
          <button
            type="button"
            @click="handleLogout"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-danger/10 border border-danger/30 px-6 py-2.5 text-sm font-bold text-danger hover:bg-danger hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeftOnRectangleIcon class="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { resolveBestLandingTarget } from '@/core/navigation/accessResolver'
import {
  ShieldExclamationIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const fallbackTarget = computed(() => {
  return resolveBestLandingTarget(authStore, appStore, router)
})

const hasAvailableScreen = computed(() => {
  const target = fallbackTarget.value
  if (!target) return false
  if (typeof target === 'object' && target.name === 'Unauthorized') return false
  return true
})

const goToAvailableScreen = () => {
  if (hasAvailableScreen.value) {
    router.replace(fallbackTarget.value)
  }
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>
