<!--src\modules\hr\views\leave-passes\components\LeavePassesFilter.vue-->
<template>
  <div class="bg-surface-section p-4 rounded-xl border border-surface-border mb-6">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- حقل البحث الذكي المربوط بمحرك الـ Debounce في الصفحة الرئيسية -->
      <div class="md:col-span-8">
        <AppInput
          :model-value="searchQuery"
          placeholder="ابحث باسم الموظف، الرقم الوظيفي، أو رقم الهاتف..."
          @update:model-value="$emit('update:searchQuery', $event)"
          clearable
        />
      </div>

      <!-- تصفية وحصر القائمة بحسب الحالة الحركية الفعلية للإذن -->
      <div class="md:col-span-4">
        <AppDropdown
          :model-value="statusFilter"
          :options="[
            { id: '', name: 'كل الحالات الحركية' },
            { id: 'approved', name: 'معتمد للعبور (لم يخرج)' },
            { id: 'out', name: 'خارج المنشأة حالياً' },
            { id: 'returned', name: 'عاد للمنشأة (مغلق)' },
            { id: 'rejected', name: 'أذونات مرفوضة إدارياً' },
          ]"
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  searchQuery: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
