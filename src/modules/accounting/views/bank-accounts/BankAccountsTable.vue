<!--src/modules/accounting/views/bank-accounts/BankAccountsTable.vue-->
<template>
  <AppCard>
    <AppTable
      :headers="tableHeaders"
      :items="bankAccounts"
      :is-loading="loading"
      :row-clickable="true"
      @row-click="$emit('row-clicked', $event)"
    >
      <template #cell-bank_info="{ item }">
        <div class="flex flex-col gap-1.5 py-1">
          <span class="font-bold text-text-primary text-base leading-tight">
            {{ item.bank_name }}
          </span>
          <div class="flex items-center gap-1 text-xs text-text-muted">
            <svg
              class="w-3.5 h-3.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span class="truncate max-w-[200px]">{{ item.account_name }}</span>
          </div>
          <span
            v-if="item.branch?.name"
            class="inline-flex items-center text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded mt-0.5 w-fit"
          >
            فرع: {{ item.branch.name }}
          </span>
        </div>
      </template>

      <template #cell-account_numbers="{ item }">
        <div class="flex flex-col gap-1.5 min-w-[180px]">
          <div class="flex items-center">
            <span
              class="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded-r-md rounded-l-none border-l-0"
            >
              رقم الحساب
            </span>
            <span
              class="text-[11px] font-mono font-bold bg-white text-gray-800 border border-gray-200 px-2 py-0.5 rounded-l-md text-center tracking-wider"
            >
              {{ item.account_number }}
            </span>
          </div>

          <div v-if="item.iban" class="flex items-center">
            <span
              class="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-r-md rounded-l-none border-l-0"
            >
              IBAN
            </span>
            <span
              class="text-[11px] font-mono font-bold bg-white text-gray-800 border border-indigo-200 px-2 py-0.5 rounded-l-md text-center tracking-wider truncate max-w-[150px]"
              :title="item.iban"
            >
              {{ item.iban }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-currency="{ item }">
        <span class="font-medium text-text-primary text-sm uppercase">
          {{ item.currency?.code || item.currency_id || '-' }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span
          :class="[
            'px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center w-fit gap-1',
            item.is_active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-600 border-gray-200',
          ]"
        >
          <span
            :class="['w-1.5 h-1.5 rounded-full', item.is_active ? 'bg-emerald-500' : 'bg-gray-400']"
          ></span>
          {{ item.is_active ? 'نشط' : 'غير نشط' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end space-x-1 space-x-reverse">
          <button
            v-if="authStore.can('bank_account.update')"
            @click.stop="$emit('edit', item)"
            class="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="تعديل"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            v-if="authStore.can('bank_account.delete')"
            @click.stop="$emit('delete', item)"
            class="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="حذف"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <AppPagination :meta="pagination" @page-change="$emit('page-change', $event)" />
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const props = defineProps({
  bankAccounts: { type: Array, required: true },
  pagination: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['page-change', 'edit', 'delete', 'row-clicked'])

const authStore = useAuthStore()

const tableHeaders = computed(() => {
  const headers = [
    { key: 'bank_info', label: 'تفاصيل البنك', class: 'min-w-[200px]' },
    { key: 'account_numbers', label: 'أرقام الحساب' },
    { key: 'currency', label: 'العملة', class: 'text-center' },
    { key: 'status', label: 'الحالة', class: 'min-w-[120px]' },
  ]

  if (authStore.can('bank_account.update') || authStore.can('bank_account.delete')) {
    headers.push({ key: 'actions', label: 'إجراءات', class: 'text-left min-w-[100px]' })
  }
  return headers
})
</script>
