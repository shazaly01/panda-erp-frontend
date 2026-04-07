<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <div v-if="loanStore.loading && !loan" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <template v-else-if="loan">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section p-5 rounded-xl border border-surface-border"
      >
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="p-2 rounded-lg bg-surface-ground border border-surface-border hover:bg-surface-border transition-colors"
            title="العودة للقائمة"
          >
            <svg
              class="w-5 h-5 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-text-primary">
              تفاصيل سلفة: {{ loan.employee_name }}
            </h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm text-text-muted"
                >تاريخ الطلب: {{ loan.requested_at?.split(' ')[0] }}</span
              >
              <span class="text-surface-border">•</span>
              <span
                class="px-2.5 py-0.5 text-[11px] font-bold rounded-full"
                :class="getStatusClass(loan.status)"
              >
                {{ getStatusLabel(loan.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <AppButton
            v-if="loan.status === 'pending' && authStore.can('loan.approve')"
            @click="approveLoan"
            :disabled="isProcessing"
            class="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
          >
            اعتماد وتوليد الأقساط
          </AppButton>

          <AppButton
            v-if="loan.status === 'approved' && !loan.voucher_id && authStore.can('loan.approve')"
            @click="openPaymentDialog"
            :disabled="isProcessing"
            variant="primary"
          >
            تأكيد صرف السلفة للموظف
          </AppButton>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 space-y-6">
          <AppCard class="p-5 space-y-4">
            <h3 class="font-bold text-lg border-b border-surface-border pb-2 text-text-primary">
              البيانات المالية
            </h3>

            <div class="flex justify-between items-center">
              <span class="text-sm text-text-muted">المبلغ الإجمالي:</span>
              <span class="text-xl font-bold font-mono text-primary">{{ loan.amount }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-text-muted">عدد الأقساط:</span>
              <span class="text-sm font-bold text-text-primary"
                >{{ loan.installments_count }} أشهر</span
              >
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-text-muted">بداية الخصم:</span>
              <span class="text-sm font-bold text-text-primary">{{
                loan.deduction_start_date
              }}</span>
            </div>

            <div
              v-if="loan.voucher_id"
              class="flex justify-between items-center pt-3 border-t border-surface-border"
            >
              <span class="text-sm text-text-muted">رقم سند الصرف:</span>
              <span class="text-sm font-mono font-bold text-emerald-600"
                >#{{ loan.voucher_id }}</span
              >
            </div>

            <div
              v-if="loan.approved_by_name"
              class="flex justify-between items-center pt-3 border-t border-surface-border"
            >
              <span class="text-sm text-text-muted">اعتمدت بواسطة:</span>
              <span class="text-sm font-bold text-text-primary">{{ loan.approved_by_name }}</span>
            </div>
          </AppCard>

          <AppCard class="p-5">
            <h3
              class="font-bold text-lg border-b border-surface-border pb-2 text-text-primary mb-3"
            >
              مبرر السلفة
            </h3>
            <p class="text-sm text-text-secondary leading-relaxed">
              {{ loan.reason }}
            </p>
          </AppCard>
        </div>

        <div class="lg:col-span-2">
          <AppCard class="overflow-hidden">
            <div class="p-4 border-b border-surface-border bg-surface-ground">
              <h3 class="font-bold text-lg text-text-primary">جدول السداد (الأقساط)</h3>
            </div>

            <div
              v-if="!loan.installments || loan.installments.length === 0"
              class="p-8 text-center text-text-muted"
            >
              <svg
                class="w-12 h-12 mx-auto text-surface-border mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              سيتم إنشاء جدول الأقساط تلقائياً بمجرد اعتماد السلفة.
            </div>

            <table v-else class="w-full text-sm text-right">
              <thead class="bg-surface-section text-text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">الشهر / الاستحقاق</th>
                  <th class="px-4 py-3 font-medium">مبلغ القسط</th>
                  <th class="px-4 py-3 font-medium">حالة السداد</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border">
                <tr
                  v-for="(inst, index) in loan.installments"
                  :key="index"
                  class="hover:bg-surface-ground transition-colors"
                >
                  <td class="px-4 py-3 font-mono text-text-primary">
                    {{ inst.due_date || inst.month }}
                  </td>
                  <td class="px-4 py-3 font-mono font-bold text-primary">{{ inst.amount }}</td>
                  <td class="px-4 py-3">
                    <span
                      v-if="inst.is_paid || inst.status === 'paid'"
                      class="px-2 py-1 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      تم الخصم
                    </span>
                    <span
                      v-else
                      class="px-2 py-1 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-100"
                    >
                      مُعلق
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </AppCard>
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

import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'

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
  } catch (error) {
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
  } catch (error) {
    toast.error(loanStore.error || 'فشل الاعتماد.')
  } finally {
    isProcessing.value = false
  }
}

const openPaymentDialog = async () => {
  const voucherId = prompt('يرجى إدخال رقم سند الصرف المحاسبي لتأكيد تسليم المبلغ للموظف:')

  if (voucherId === null) return // ألغى المستخدم العملية
  if (!voucherId.trim() || isNaN(voucherId)) {
    return toast.error('رقم السند يجب أن يكون رقماً صحيحاً.')
  }

  isProcessing.value = true
  try {
    await loanStore.markLoanAsPaid(loanId.value, voucherId)
    toast.success('تم تأكيد الصرف وربط السلفة بالسند المحاسبي.')
  } catch (error) {
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
    paid: 'مصروفة / قيد السداد', // قد تكون paid في السلفة تعني سُددت بالكامل، عدل التسمية حسب منطقك
    rejected: 'مرفوضة',
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-sky-100 text-sky-800',
    paid: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
