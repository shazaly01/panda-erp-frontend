<!--src/modules/purchasing/views/suppliers/components/SupplierForm.vue-->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- اسم المورد الأساسي -->
      <div>
        <AppInput
          id="supplier-name"
          type="text"
          label="اسم المورد *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: شركة التوريدات المتكاملة، أحمد عبدالله..."
          :error="getFieldError('name')"
          required
        />
      </div>

      <!-- الاسم التجاري / الشهرة -->
      <div>
        <AppInput
          id="supplier-commercial-name"
          type="text"
          label="الاسم التجاري (إن وجد)"
          :model-value="modelValue.commercial_name"
          @update:model-value="updateField('commercial_name', $event)"
          placeholder="مثال: مركز التجارة الدولي..."
          :error="getFieldError('commercial_name')"
        />
      </div>

      <!-- نوع الكيان -->
      <div>
        <AppDropdown
          id="supplier-type"
          label="نوع المورد *"
          :model-value="modelValue.type"
          @update:model-value="updateField('type', $event)"
          :options="[
            { id: 'company', name: 'منشأة / شركة' },
            { id: 'person', name: 'فرد' },
          ]"
          option-label="name"
          option-value="id"
          :error="getFieldError('type')"
          required
        />
      </div>

      <!-- حالة المورد -->
      <div>
        <AppDropdown
          id="supplier-status"
          label="حالة التعامل *"
          :model-value="modelValue.status"
          @update:model-value="updateField('status', $event)"
          :options="[
            { id: 'active', name: 'نشط (متاح للعمليات والفواتير)' },
            { id: 'inactive', name: 'غير نشط (تجميد مؤقت)' },
            { id: 'blocked', name: 'محظور (منع التعامل نهائياً)' },
          ]"
          option-label="name"
          option-value="id"
          :error="getFieldError('status')"
          required
        />
      </div>

      <!-- رقم الهاتف -->
      <div>
        <AppInput
          id="supplier-phone"
          type="text"
          label="رقم الهاتف"
          :model-value="modelValue.phone"
          @update:model-value="updateField('phone', $event)"
          placeholder="مثال: 0501234567"
          :error="getFieldError('phone')"
          dir="ltr"
        />
      </div>

      <!-- البريد الإلكتروني -->
      <div>
        <AppInput
          id="supplier-email"
          type="email"
          label="البريد الإلكتروني"
          :model-value="modelValue.email"
          @update:model-value="updateField('email', $event)"
          placeholder="supplier@example.com"
          :error="getFieldError('email')"
          dir="ltr"
        />
      </div>

      <!-- الرقم الضريبي -->
      <div>
        <AppInput
          id="supplier-tax-number"
          type="text"
          label="الرقم الضريبي"
          :model-value="modelValue.tax_number"
          @update:model-value="updateField('tax_number', $event)"
          placeholder="مثال: 300012345600003"
          :error="getFieldError('tax_number')"
          class="font-mono"
          dir="ltr"
        />
      </div>

      <!-- السجل التجاري -->
      <div>
        <AppInput
          id="supplier-commercial-registry"
          type="text"
          label="رقم السجل التجاري"
          :model-value="modelValue.commercial_registry"
          @update:model-value="updateField('commercial_registry', $event)"
          placeholder="مثال: 1010123456"
          :error="getFieldError('commercial_registry')"
          class="font-mono"
          dir="ltr"
        />
      </div>

      <!-- الحد الائتماني -->
      <div>
        <AppInput
          id="supplier-credit-limit"
          type="number"
          label="الحد الائتماني"
          :model-value="modelValue.credit_limit"
          @update:model-value="updateField('credit_limit', $event)"
          placeholder="0.00"
          :error="getFieldError('credit_limit')"
          min="0"
          step="0.01"
          dir="ltr"
        />
      </div>

      <!-- فترة السداد (بالأيام) -->
      <div>
        <AppInput
          id="supplier-credit-period"
          type="number"
          label="فترة السداد المسموحة (بالأيام)"
          :model-value="modelValue.credit_period_days"
          @update:model-value="updateField('credit_period_days', $event)"
          placeholder="مثال: 30"
          :error="getFieldError('credit_period_days')"
          min="0"
          max="365"
          dir="ltr"
        />
      </div>

      <!-- العنوان بالتفصيل -->
      <div class="md:col-span-2">
        <AppTextarea
          id="supplier-address"
          label="العنوان الجغرافي والمقر"
          :model-value="modelValue.address"
          @update:model-value="updateField('address', $event)"
          placeholder="المدينة، الحي، الشارع، المبنى..."
          :error="getFieldError('address')"
          rows="2"
        />
      </div>

      <!-- ملاحظات إضافية -->
      <div class="md:col-span-2">
        <AppTextarea
          id="supplier-notes"
          label="ملاحظات وشروط التعامل"
          :model-value="modelValue.notes"
          @update:model-value="updateField('notes', $event)"
          placeholder="أي شروط توريد، مواعيد تسليم، أو تفاصيل خاصة بالدفع..."
          :error="getFieldError('notes')"
          rows="2"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const getFieldError = (field) => {
  if (!props.errors || !props.errors[field]) return ''
  const err = props.errors[field]
  return Array.isArray(err) ? err[0] : err
}
</script>
