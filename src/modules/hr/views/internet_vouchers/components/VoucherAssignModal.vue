<!-- src/modules/hr/views/internet_vouchers/components/VoucherAssignModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="closeModal"
    title="صرف كود إنترنت (يدوي)"
    size="lg"
    border-color="border-primary"
    :loading="loading"
  >
    <div
      class="-m-3 p-4 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3.5 text-right font-sans transition-colors duration-200"
      dir="rtl"
    >
      <!-- الحالة الأولى: اختيار الموظف والصرف -->
      <div v-if="!assignedVoucher" class="space-y-3.5">
        <div
          class="p-3 rounded-xl bg-surface-card border border-surface-border flex items-start gap-2.5 shadow-2xs"
        >
          <div
            class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p class="text-xs text-text-secondary leading-relaxed font-medium">
            اختر الموظف من القائمة أدناه. سيقوم النظام تلقائياً بسحب أول كود متاح في المخزون وربطه
            بسجل الموظف.
          </p>
        </div>

        <div>
          <AppDropdown
            id="employee-select"
            label="اسم الموظف *"
            v-model="selectedEmployeeId"
            :options="employeeOptions"
            option-label="full_name"
            option-value="id"
            placeholder="ابحث واختر الموظف..."
            class="w-full"
          />
        </div>
      </div>

      <!-- الحالة الثانية: نجاح الصرف وعرض الكود -->
      <div v-else class="text-center py-3 space-y-4">
        <div
          class="w-14 h-14 bg-success/15 border border-success/40 rounded-full flex items-center justify-center text-success mx-auto shadow-xs"
        >
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h3 class="text-base sm:text-lg font-black text-text-primary">تم الصرف بنجاح!</h3>
          <p class="text-xs text-text-secondary mt-1">
            تم صرف الكود للموظف:
            <strong class="text-text-primary font-black">{{
              assignedVoucher.employee_name
            }}</strong>
          </p>
        </div>

        <div
          class="bg-surface-card border-2 border-primary/50 rounded-2xl p-5 shadow-sm space-y-1.5"
        >
          <span class="text-[11px] text-primary font-black uppercase tracking-wider block">
            كود الإنترنت المخصص
          </span>
          <div class="flex justify-center items-center">
            <span
              class="text-3xl sm:text-4xl font-mono font-black text-text-primary tracking-[0.15em] select-all"
            >
              {{ assignedVoucher.code }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <template v-if="!assignedVoucher">
        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          @click="closeModal"
          :disabled="loading"
        >
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          @click="submitAssign"
          :loading="loading"
          :disabled="!selectedEmployeeId || loading"
          icon="check"
        >
          تأكيد الصرف
        </AppButton>
      </template>

      <template v-else>
        <AppButton type="button" size="sm" @click="closeModal" class="w-full justify-center">
          إنهاء وإغلاق
        </AppButton>
      </template>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInternetVoucherStore } from '@/modules/hr/stores/internetVoucherStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { useToast } from 'vue-toastification'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'assigned'])

const voucherStore = useInternetVoucherStore()
const employeeStore = useEmployeeStore()
const toast = useToast()

const selectedEmployeeId = ref('')
const loading = ref(false)
const assignedVoucher = ref(null)

const employeeOptions = computed(() => {
  return employeeStore.employees.map((emp) => ({
    id: emp.id,
    full_name: `${emp.employee_number} - ${emp.full_name}`,
  }))
})

onMounted(async () => {
  if (employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees({ status: 'active', per_page: 500 })
  }
})

const closeModal = () => {
  if (loading.value) return
  emit('update:modelValue', false)
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
    assignedVoucher.value = data.data
    emit('assigned')
    toast.success('تمت عملية الربط بنجاح!')
  } catch {
    toast.error(voucherStore.error || 'حدث خطأ أثناء الصرف. تأكد من توفر أكواد في المخزون.')
  } finally {
    loading.value = false
  }
}
</script>
