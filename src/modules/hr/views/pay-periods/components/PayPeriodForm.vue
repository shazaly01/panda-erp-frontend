<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppDropdown
          id="payperiod-group"
          label="مجموعة الدفع *"
          :model-value="modelValue.pay_group_id"
          @update:model-value="updateField('pay_group_id', $event)"
          :options="payGroupStore.groups"
          option-label="name"
          option-value="id"
          placeholder="-- اختر مجموعة الدفع --"
          :disabled="isEditMode"
          required
        />
      </div>

      <div class="md:col-span-2">
        <AppInput
          id="payperiod-name"
          type="text"
          label="اسم الفترة *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: شهر أبريل 2026، الأسبوع 14"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="payperiod-start-date"
          type="date"
          label="تاريخ البداية *"
          :model-value="modelValue.start_date"
          @update:model-value="updateField('start_date', $event)"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="payperiod-end-date"
          type="date"
          label="تاريخ النهاية *"
          :model-value="modelValue.end_date"
          @update:model-value="updateField('end_date', $event)"
          :min="modelValue.start_date"
          required
        />
      </div>

      <div class="md:col-span-2" v-if="isEditMode">
        <AppDropdown
          id="payperiod-status"
          label="حالة الفترة المالية"
          :model-value="modelValue.status"
          @update:model-value="updateField('status', $event)"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          required
        />
        <p class="text-[10px] text-amber-600 mt-1" v-if="modelValue.status === 'closed'">
          تنبيه: إغلاق الفترة يمنع صرف رواتب جديدة عليها.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePayGroupStore } from '@/modules/hr/stores/payGroupStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  isEditMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const payGroupStore = usePayGroupStore()

const statusOptions = [
  { label: 'مفتوحة (متاحة للصرف)', value: 'open' },
  { label: 'مغلقة (مرحّلة بالكامل)', value: 'closed' },
]

onMounted(() => {
  if (payGroupStore.groups.length === 0) {
    payGroupStore.fetchPayGroups({ is_active: 1 })
  }
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>
