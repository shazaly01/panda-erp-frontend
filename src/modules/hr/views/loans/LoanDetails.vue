<!-- src/modules/hr/views/loans/LoanDetails.vue -->
<template>
  <div class="space-y-3 max-w-6xl mx-auto pb-12 text-right font-sans" dir="rtl">
    <!-- مؤشر التحميل -->
    <FullScreenLoader :show="loanStore.loading && !loan" message="جاري تحميل تفاصيل السلفة..." />

    <template v-if="loan">
      <!-- 1. ترويسة السلفة المدمجة -->
      <div
        class="p-4 sm:p-5 bg-surface-header/75 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors duration-200"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="goBack"
            class="p-2 rounded-lg bg-surface-card border border-surface-border text-text-secondary hover:text-primary hover:border-primary/60 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="العودة لقائمة السلف"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-sm sm:text-base font-black text-text-primary">
                تفاصيل سلفة: {{ loan.employee_name }}
              </h1>
              <AppBadge :variant="getStatusVariant(loan.status)" size="xs" pill>
                {{ getStatusLabel(loan.status) }}
              </AppBadge>
            </div>

            <div class="flex items-center gap-2 mt-1 text-xs text-text-secondary">
              <span>تاريخ الطلب:</span>
              <span class="font-mono font-bold text-text-primary">
                {{ loan.requested_at?.split(' ')[0] || '---' }}
              </span>
            </div>
          </div>
        </div>

        <!-- أزرار الإجراءات المالية -->
        <div class="flex items-center gap-2 flex-wrap">
          <AppButton
            v-if="loan.status === 'pending' && authStore.can('loan.approve')"
            size="sm"
            @click="approveLoan"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">جاري الاعتماد...</span>
            <span v-else>اعتماد وتوليد الأقساط</span>
          </AppButton>

          <AppButton
            v-if="loan.status === 'approved' && !loan.voucher_id && authStore.can('loan.approve')"
            size="sm"
            @click="openPaymentDialog"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">جاري التأكيد...</span>
            <span v-else>تأكيد صرف السلفة للموظف</span>
          </AppButton>
        </div>
      </div>

      <!-- 2. تفاصيل السلفة وجدول الأقساط -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <!-- العمود الأيمن: البيانات المالية والمبرر -->
        <div class="lg:col-span-1 space-y-3">
          <!-- بطاقة البيانات المالية -->
          <div
            class="p-4 bg-surface-section rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs space-y-3"
          >
            <h3
              class="text-xs font-black text-text-primary border-b border-surface-border/80 pb-2 flex items-center gap-1.5"
            >
              <span class="w-1.5 h-3.5 rounded-full bg-primary inline-block"></span>
              <span>البيانات المالية</span>
            </h3>

            <!-- صندوق المبلغ الإجمالي -->
            <div
              class="flex justify-between items-center bg-primary/10 border border-primary/35 px-3.5 py-2.5 rounded-xl text-primary shadow-2xs"
            >
              <span class="text-xs font-black">المبلغ الإجمالي:</span>
              <span class="text-lg sm:text-xl font-mono font-black tracking-tight">
                {{ formatCurrency(loan.amount || 0) }}
              </span>
            </div>

            <div class="space-y-2 text-xs">
              <div
                class="flex justify-between items-center py-1.5 border-b border-surface-border/60"
              >
                <span class="text-text-muted font-bold">عدد الأقساط:</span>
                <span class="font-mono font-black text-text-primary">
                  {{ loan.installments_count }} أشهر
                </span>
              </div>

              <div
                class="flex justify-between items-center py-1.5 border-b border-surface-border/60"
              >
                <span class="text-text-muted font-bold">بداية الخصم:</span>
                <span class="font-mono font-bold text-text-primary">
                  {{ loan.deduction_start_date || '---' }}
                </span>
              </div>

              <div
                v-if="loan.voucher_id"
                class="flex justify-between items-center py-1.5 border-b border-surface-border/60"
              >
                <span class="text-text-muted font-bold">رقم سند الصرف:</span>
                <AppBadge variant="success" size="xs" class="font-mono">
                  #{{ loan.voucher_id }}
                </AppBadge>
              </div>

              <div v-if="loan.approved_by_name" class="flex justify-between items-center pt-1">
                <span class="text-text-muted font-bold">اعتمدت بواسطة:</span>
                <span class="font-bold text-text-primary">{{ loan.approved_by_name }}</span>
              </div>
            </div>
          </div>

          <!-- بطاقة مبرر السلفة -->
          <div
            class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-2"
          >
            <h3
              class="text-xs font-black text-text-primary border-b border-surface-border/80 pb-2 flex items-center gap-1.5"
            >
              <span class="w-1.5 h-3.5 rounded-full bg-info inline-block"></span>
              <span>مبرر السلفة</span>
            </h3>
            <p class="text-xs text-text-secondary leading-relaxed font-medium">
              {{ loan.reason || 'لا يوجد مبرر مسجل.' }}
            </p>
          </div>
        </div>

        <!-- العمود الأيسر: منصة جدول السداد (الأقساط) -->
        <div class="lg:col-span-2">
          <div class="invoice-stage-3d rounded-2xl overflow-hidden transition-all duration-200">
            <!-- شريط عنوان المنصة -->
            <div
              class="px-4 py-3 bg-surface-ground/70 border-b border-surface-border flex items-center justify-between"
            >
              <h3 class="text-xs sm:text-sm font-black text-text-primary flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <span>جدول السداد (الأقساط الشهرية)</span>
              </h3>
              <span
                v-if="loan.installments?.length"
                class="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-surface-card border border-surface-border text-text-secondary"
              >
                {{ loan.installments.length }} قسط
              </span>
            </div>

            <!-- الحالة الفارغة قبل الاعتماد -->
            <div
              v-if="!loan.installments || loan.installments.length === 0"
              class="p-12 text-center text-text-muted bg-surface-section flex flex-col items-center justify-center gap-2"
            >
              <div
                class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-1"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-black text-text-primary">
                لم يتم توليد جدول الأقساط بعد
              </p>
              <p class="text-xs text-text-muted">
                سيتم إنشاء جدول الأقساط تلقائياً بمجرد اعتماد السلفة.
              </p>
            </div>

            <!-- جدول الأقساط -->
            <div v-else class="overflow-x-auto bg-surface-section">
              <table class="w-full text-xs text-right border-collapse">
                <thead class="invoice-thead-3d select-none h-10">
                  <tr>
                    <th class="px-4 py-2 w-14 text-center font-mono">#</th>
                    <th class="px-4 py-2 font-black text-right">الشهر / تاريخ الاستحقاق</th>
                    <th class="px-4 py-2 font-bold text-center">مبلغ القسط</th>
                    <th class="px-4 py-2 font-bold text-center">حالة السداد</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-border/70">
                  <tr
                    v-for="(inst, index) in loan.installments"
                    :key="index"
                    class="hover:bg-primary/5 transition-colors"
                  >
                    <td class="px-4 py-2.5 text-center font-mono font-bold text-text-muted">
                      {{ index + 1 }}
                    </td>
                    <td class="px-4 py-2.5 font-mono font-bold text-text-primary">
                      {{ inst.due_date || inst.month }}
                    </td>
                    <td class="px-4 py-2.5 text-center font-mono font-black text-primary">
                      {{ formatCurrency(inst.amount || 0) }}
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <AppBadge
                        :variant="inst.is_paid || inst.status === 'paid' ? 'success' : 'warning'"
                        size="xs"
                        pill
                      >
                        {{ inst.is_paid || inst.status === 'paid' ? 'تم الخصم' : 'مُعلق' }}
                      </AppBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useLoanStore } from '@/modules/hr/stores/loanStore'
import { formatCurrency } from '@/utils/formatters'

import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import FullScreenLoader from '@/components/ui/FullScreenLoader.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const authStore = useAuthStore()
const loanStore = useLoanStore()

const loanId = computed(() => route.params.id)
const loan = computed(() => loanStore.singleLoan)
const isProcessing = ref(false)

onMounted(async () => {
  try {
    await loanStore.fetchLoanById(loanId.value)
  } catch {
    toast.error('لم يتم العثور على السلفة أو حدث خطأ.')
    goBack()
  }
})

const goBack = () => {
  router.push({ name: 'LoansList' })
}

// -- عمليات الاعتماد والصرف --
const approveLoan = async () => {
  if (!confirm('هل أنت متأكد من اعتماد هذه السلفة؟ سيتم إنشاء جدول الأقساط تلقائياً.')) return

  isProcessing.value = true
  try {
    await loanStore.approveLoan(loanId.value)
    toast.success('تم اعتماد السلفة وتوليد الأقساط بنجاح.')
  } catch {
    toast.error(loanStore.error || 'فشل الاعتماد.')
  } finally {
    isProcessing.value = false
  }
}

const openPaymentDialog = async () => {
  const voucherId = prompt('يرجى إدخال رقم سند الصرف المحاسبي لتأكيد تسليم المبلغ للموظف:')

  if (voucherId === null) return
  if (!voucherId.trim() || isNaN(voucherId)) {
    return toast.error('رقم السند يجب أن يكون رقماً صحيحاً.')
  }

  isProcessing.value = true
  try {
    await loanStore.markLoanAsPaid(loanId.value, voucherId)
    toast.success('تم تأكيد الصرف وربط السلفة بالسند المحاسبي.')
  } catch {
    toast.error(loanStore.error || 'فشل تأكيد الصرف.')
  } finally {
    isProcessing.value = false
  }
}

// -- دوال تنسيق الحالة --
const getStatusLabel = (status) => {
  const labels = {
    pending: 'قيد الانتظار',
    approved: 'معتمدة / بانتظار الصرف',
    paid: 'مصروفة / قيد السداد',
    rejected: 'مرفوضة',
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const map = {
    pending: 'warning',
    approved: 'info',
    paid: 'success',
    rejected: 'danger',
  }
  return map[status] || 'secondary'
}
</script>
