<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <AppDropdown
          id="loc-warehouse"
          label="المستودع *"
          :model-value="modelValue.warehouse_id"
          @update:model-value="onWarehouseChange"
          :options="warehouses"
          option-label="name"
          option-value="id"
          placeholder="اختر المستودع..."
          required
        />
      </div>

      <div>
        <AppDropdown
          id="loc-parent"
          label="الموقع الأب (الرئيسي)"
          :model-value="modelValue.parent_id"
          @update:model-value="updateField('parent_id', $event)"
          :options="filteredParentLocations"
          option-label="name"
          option-value="id"
          placeholder="اختر الموقع الأب (اختياري)"
          :show-clear="true"
          :disabled="!modelValue.warehouse_id"
        />
      </div>

      <div>
        <AppInput
          id="loc-name"
          type="text"
          label="اسم الموقع *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: الممر 1، الرف أ-3، الحاوية 12..."
          required
        />
      </div>

      <div>
        <AppInput
          id="loc-code"
          type="text"
          label="كود/رمز الموقع"
          :model-value="modelValue.code"
          @update:model-value="updateField('code', $event)"
          placeholder="مثال: AISLE-01, RACK-A3..."
          class="font-mono text-left"
          dir="ltr"
        />
      </div>

      <div class="md:col-span-2">
        <AppDropdown
          id="loc-type"
          label="نوع الموقع"
          :model-value="modelValue.type"
          @update:model-value="updateField('type', $event)"
          :options="typeOptions"
          option-label="name"
          option-value="id"
          placeholder="اختر نوع الموقع..."
        />
      </div>
    </div>

    <div class="flex items-center gap-3 pt-2">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="modelValue.is_active"
          @change="updateField('is_active', $event.target.checked)"
          class="sr-only peer"
        />
        <div
          class="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
        ></div>
        <span class="ms-3 text-sm font-medium text-text-primary">
          {{ modelValue.is_active ? 'الموقع نشط (متاح للاستخدام)' : 'الموقع موقوف' }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  warehouses: { type: Array, default: () => [] },
  locationsList: { type: Array, default: () => [] },
  currentEditId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'warehouse-changed'])

const typeOptions = [
  { id: 'aisle', name: 'ممر (Aisle)' },
  { id: 'rack', name: 'صف رفوف (Rack)' },
  { id: 'shelf', name: 'رف (Shelf)' },
  { id: 'bin', name: 'صندوق / حاوية (Bin)' },
]

// فلترة المواقع المتاحة لتكون أب للموقع الحالي (تتبع نفس المستودع، وليست الموقع نفسه)
const filteredParentLocations = computed(() => {
  if (!props.modelValue.warehouse_id) return []
  return props.locationsList.filter((loc) => {
    const isSameWarehouse = String(loc.warehouse_id) === String(props.modelValue.warehouse_id)
    const isNotSelf = !props.currentEditId || loc.id !== props.currentEditId
    return isSameWarehouse && isNotSelf
  })
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const onWarehouseChange = (warehouseId) => {
  // عند تغيير المستودع يتم تصفير الموقع الأب لأن الموقع الأب يجب أن يتبع لنفس المستودع
  emit('update:modelValue', {
    ...props.modelValue,
    warehouse_id: warehouseId,
    parent_id: null,
  })
  emit('warehouse-changed', warehouseId)
}
</script>
