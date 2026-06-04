<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150"
    >
      <div
        class="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between"
      >
        <h3 class="text-md font-bold text-gray-900 dark:text-white">
          اعتماد حساب موظف وتعيين الصلاحية
        </h3>
        <button
          type="button"
          @click="close"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg"
        >
          ✕
        </button>
      </div>

      <div class="p-5 space-y-5">
        <div
          class="bg-gray-50 dark:bg-slate-900/40 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
        >
          <p class="text-xs text-gray-500 dark:text-slate-400">الموظف طالب التسجيل:</p>
          <p class="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
            {{ user?.full_name }}
          </p>
          <p class="text-xs text-blue-500 font-mono mt-0.5">{{ user?.phone }}</p>
        </div>

        <div class="space-y-1">
          <AppDropdown
            id="approval-user-role"
            label="حدد الدور / الصلاحية الوظيفية المعينة *"
            v-model="selectedRole"
            :options="roles"
            option-label="name"
            option-value="name"
            placeholder="اختر الصلاحية من القائمة..."
            required
          />
          <p class="text-[11px] text-gray-400 dark:text-slate-400 mt-1">
            ملاحظة: سيتم تفعيل حساب الموظف فوراً ومنحه كامل صلاحيات الدخول المرتبطة بالدور المختار.
          </p>
        </div>
      </div>

      <div
        class="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end space-x-2 space-x-reverse"
      >
        <button
          type="button"
          @click="close"
          class="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg transition-colors"
        >
          إلغاء الإجراء
        </button>
        <button
          type="button"
          @click="submitApproval"
          :disabled="isApproving || !selectedRole"
          class="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          <span v-if="isApproving">جاري تفعيل الحساب...</span>
          <span v-else>تفعيل واعتماد الحساب فوراً</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import { useRoleStore } from '@/stores/roleStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
  isApproving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'approve'])

const roleStore = useRoleStore()
const isOpen = ref(props.modelValue)

// المتغير المحلي لحفظ الدور المختار من القائمة المنسدلة
const selectedRole = ref(null)

// جلب الأدوار المسجلة في السيرفر ديناميكياً لتغذية الـ Dropdown
const roles = computed(() => roleStore.roles || [])

onMounted(async () => {
  if (roleStore.roles?.length === 0) {
    await roleStore.fetchRoles()
  }
})

// مراقبة حالة فتح وغلق المودال لإعادة ضبط الخيارات تلقائياً للأمان
watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
    if (val) {
      selectedRole.value = null // تصفير الاختيار عند كل فتح جديد
    }
  },
)

const close = () => {
  emit('update:modelValue', false)
}

// إرسال البيانات المعتمدة للأب بصيغة مصفوفة لتتوافق تماماً مع متطلبات الباك إند وحزمة Spatie
const submitApproval = () => {
  if (!selectedRole.value) return

  emit('approve', {
    roles: [selectedRole.value], // تغليف الدور داخل مصفوفة تلبية للهيكلية القياسية للباك إند
  })
}
</script>
