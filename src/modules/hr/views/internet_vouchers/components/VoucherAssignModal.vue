<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 hide-on-print"
    @click.self="closeModal"
  >
    <div
      class="bg-slate-900 rounded-[2rem] p-8 max-w-xl w-full relative shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-800 overflow-hidden"
    >
      <!-- تأثير إضاءة خلفي -->
      <div
        class="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"
      ></div>

      <button
        v-if="!loading"
        @click="closeModal"
        class="absolute top-6 left-6 text-slate-400 hover:text-rose-400 transition font-bold z-10"
      >
        ✕
      </button>

      <!-- الحالة الأولى: اختيار الموظف والصرف -->
      <div v-if="!assignedVoucher" class="relative z-10">
        <div class="mb-8">
          <div
            class="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-blue-400 mb-4 shadow-lg"
          >
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">صرف كود إنترنت (يدوي)</h2>
          <p class="text-slate-400 text-sm leading-relaxed">
            اختر الموظف من القائمة أدناه. سيقوم النظام تلقائياً بسحب أول كود متاح في المخزون وربطه
            بسجل الموظف.
          </p>
        </div>

        <form @submit.prevent="submitAssign" class="space-y-8">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">اسم الموظف</label>
            <!-- استخدام AppDropdown بناءً على مكوناتك، نفترض أن employeeStore تم تمريره أو موجود -->
            <AppDropdown
              id="employee-select"
              v-model="selectedEmployeeId"
              :options="employeeOptions"
              option-label="full_name"
              option-value="id"
              placeholder="ابحث واختر الموظف..."
              class="w-full"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <AppButton type="button" variant="secondary" @click="closeModal" :disabled="loading">
              إلغاء
            </AppButton>
            <AppButton
              type="submit"
              :loading="loading"
              :disabled="!selectedEmployeeId"
              icon="check"
            >
              تأكيد الصرف
            </AppButton>
          </div>
        </form>
      </div>

      <!-- الحالة الثانية: نجاح الصرف وعرض الكود -->
      <div v-else class="relative z-10 text-center py-6">
        <div
          class="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 class="text-2xl font-black text-white mb-2">تم الصرف بنجاح!</h2>
        <p class="text-slate-400 mb-8">
          تم صرف الكود للموظف:
          <span class="text-white font-bold">{{ assignedVoucher.employee_name }}</span>
        </p>

        <div
          class="bg-slate-950/80 border border-sky-500/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(14,165,233,0.15)] mb-8"
        >
          <span class="text-xs text-sky-400 font-bold uppercase tracking-widest block mb-2"
            >كود الإنترنت المخصص</span
          >
          <div class="flex justify-center items-center gap-4">
            <span class="text-4xl font-mono font-black text-white tracking-[0.15em] select-all">{{
              assignedVoucher.code
            }}</span>
          </div>
        </div>

        <AppButton @click="closeModal" variant="primary" class="w-full justify-center">
          إنهاء وإغلاق
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInternetVoucherStore } from '@/modules/hr/stores/internetVoucherStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore' // لجلب قائمة الموظفين
import { useToast } from 'vue-toastification'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'assigned'])

const voucherStore = useInternetVoucherStore()
const employeeStore = useEmployeeStore()
const toast = useToast()

const selectedEmployeeId = ref('')
const loading = ref(false)
const assignedVoucher = ref(null) // لتخزين الكود بعد الصرف

// تجهيز قائمة الموظفين للدروب داون
const employeeOptions = computed(() => {
  return employeeStore.employees.map((emp) => ({
    id: emp.id,
    full_name: `${emp.employee_number} - ${emp.full_name}`,
  }))
})

onMounted(async () => {
  // جلب الموظفين إذا كانت القائمة فارغة
  if (employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees({ status: 'active', per_page: 500 })
  }
})

const closeModal = () => {
  if (loading.value) return
  emit('update:modelValue', false)
  // إعادة تعيين الشاشة بعد الإغلاق بمدة قصيرة لتجنب الوميض
  setTimeout(() => {
    selectedEmployeeId.value = ''
    assignedVoucher.value = null
  }, 300)
}

const submitAssign = async () => {
  if (!selectedEmployeeId.value) return

  loading.value = true
  try {
    const data = await voucherStore.assignManually(selectedEmployeeId.value)
    assignedVoucher.value = data.data // نعرض الكود في الشاشة بناءً على استجابة الباك إيند
    emit('assigned')
    toast.success('تمت عملية الربط بنجاح!')
  } catch (error) {
    toast.error(voucherStore.error || 'حدث خطأ أثناء الصرف. تأكد من توفر أكواد في المخزون.')
  } finally {
    loading.value = false
  }
}
</script>
