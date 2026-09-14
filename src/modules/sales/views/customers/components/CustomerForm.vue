<!--src/modules/sales/views/customers/components/CustomerForm.vue-->
<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- اسم العميل الأساسي -->
      <div>
        <AppInput
          id="customer-name"
          type="text"
          label="اسم العميل *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="مثال: شركة الأفق للتجارة، محمد أحمد..."
          :error="getFieldError('name')"
          required
        />
      </div>

      <!-- الاسم التجاري / الشهرة -->
      <div>
        <AppInput
          id="customer-commercial-name"
          type="text"
          label="الاسم التجاري (إن وجد)"
          :model-value="modelValue.commercial_name"
          @update:model-value="updateField('commercial_name', $event)"
          placeholder="مثال: أسواق الأفق المركزية..."
          :error="getFieldError('commercial_name')"
        />
      </div>

      <!-- نوع الكيان -->
      <div>
        <AppDropdown
          id="customer-type"
          label="نوع العميل *"
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

      <!-- حالة التعامل -->
      <div>
        <AppDropdown
          id="customer-status"
          label="حالة التعامل *"
          :model-value="modelValue.status"
          @update:model-value="updateField('status', $event)"
          :options="[
            { id: 'active', name: 'نشط (متاح للعمليات وفواتير البيع)' },
            { id: 'inactive', name: 'غير نشط (تجميد مؤقت)' },
            { id: 'blocked', name: 'محظور (منع البيع نهائياً)' },
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
          id="customer-phone"
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
          id="customer-email"
          type="email"
          label="البريد الإلكتروني"
          :model-value="modelValue.email"
          @update:model-value="updateField('email', $event)"
          placeholder="customer@example.com"
          :error="getFieldError('email')"
          dir="ltr"
        />
      </div>

      <!-- الرقم الضريبي -->
      <div>
        <AppInput
          id="customer-tax-number"
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
          id="customer-commercial-registry"
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
          id="customer-credit-limit"
          type="number"
          label="الحد الائتماني المسموح"
          :model-value="modelValue.credit_limit"
          @update:model-value="updateField('credit_limit', $event)"
          placeholder="0.00"
          :error="getFieldError('credit_limit')"
          min="0"
          step="0.01"
          dir="ltr"
        />
      </div>

      <!-- فترة التحصيل (بالأيام) -->
      <div>
        <AppInput
          id="customer-credit-period"
          type="number"
          label="فترة التحصيل المسموحة (بالأيام)"
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
          id="customer-address"
          label="عنوان العميل ومقر التسليم"
          :model-value="modelValue.address"
          @update:model-value="updateField('address', $event)"
          placeholder="المدينة، الحي، الشارع، المبنى، الرمز البريدي..."
          :error="getFieldError('address')"
          rows="2"
        />
      </div>

      <!-- ملاحظات إضافية -->
      <div class="md:col-span-2">
        <AppTextarea
          id="customer-notes"
          label="ملاحظات وشروط البيع والائتمان"
          :model-value="modelValue.notes"
          @update:model-value="updateField('notes', $event)"
          placeholder="أي شروط خاصة بالتوصيل، الاتفاقيات السعرية، أو بيانات الشحن..."
          :error="getFieldError('notes')"
          rows="2"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
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
