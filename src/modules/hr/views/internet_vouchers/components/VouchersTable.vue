<template>
  <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-right text-sm">
        <thead class="bg-slate-800/50 text-slate-300 border-b border-slate-700">
          <tr>
            <th class="px-4 py-4 font-bold"># الكود</th>
            <th class="px-4 py-4 font-bold">السعة</th>
            <th class="px-4 py-4 font-bold text-center">الحالة</th>
            <th class="px-4 py-4 font-bold">الموظف المُستلم</th>
            <th class="px-4 py-4 font-bold">تاريخ الصرف</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-slate-300">
          <tr v-if="loading" class="animate-pulse">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">جاري تحميل الأكواد...</td>
          </tr>

          <tr v-else-if="vouchers.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">
              لا توجد أكواد مطابقة للبحث.
            </td>
          </tr>

          <tr
            v-for="voucher in vouchers"
            :key="voucher.id"
            class="hover:bg-slate-800/30 transition-colors"
          >
            <td class="px-4 py-4">
              <span class="font-mono text-white tracking-widest">{{ voucher.code }}</span>
            </td>

            <td class="px-4 py-4 font-semibold text-sky-400">
              {{ voucher.capacity }}
            </td>

            <td class="px-4 py-4 text-center">
              <span
                v-if="voucher.status === 'available'"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                متاح
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"
              >
                مصروف
              </span>
            </td>

            <td class="px-4 py-4">
              <span v-if="voucher.employee_name" class="text-white font-medium">
                {{ voucher.employee_name }}
              </span>
              <span v-else class="text-slate-500">-</span>
            </td>

            <td class="px-4 py-4 text-slate-400 text-xs" dir="ltr">
              {{ voucher.assigned_at || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- التحكم بالصفحات (Pagination) -->
    <div
      v-if="pagination && pagination.last_page > 1"
      class="px-4 py-4 border-t border-slate-800 flex justify-center"
    >
      <div class="flex gap-2">
        <button
          @click="$emit('page-change', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
        >
          السابق
        </button>
        <span class="px-4 py-1 text-slate-400 text-sm flex items-center">
          صفحة {{ pagination.current_page }} من {{ pagination.last_page }}
        </span>
        <button
          @click="$emit('page-change', pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition"
        >
          التالي
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  vouchers: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['page-change'])
</script>
