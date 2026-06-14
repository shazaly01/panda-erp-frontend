<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="md:col-span-2">
        <AppInput
          id="visitor-name"
          type="text"
          label="اسم الزائر بالكامل *"
          :model-value="modelValue.name"
          @update:model-value="updateField('name', $event)"
          placeholder="أدخل الاسم الثلاثي أو الثنائي للزائر..."
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="visitor-phone"
          type="text"
          label="رقم هاتف الزائر *"
          :model-value="modelValue.phone"
          @update:model-value="updateField('phone', $event)"
          placeholder="مثال: 05xxxxxxx"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="visitor-national-id"
          type="text"
          label="الرقم القومي / الهوية"
          :model-value="modelValue.national_id"
          @update:model-value="updateField('national_id', $event)"
          placeholder="أدخل رقم البطاقة الشخصية أو جواز السفر..."
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="visitor-date"
          type="date"
          label="تاريخ الزيارة المقررة *"
          :model-value="modelValue.visit_date"
          @update:model-value="updateField('visit_date', $event)"
          required
        />
      </div>

      <div class="md:col-span-1">
        <AppInput
          id="visitor-company"
          type="text"
          label="الشركة أو الجهة القادم منها"
          :model-value="modelValue.company_from"
          @update:model-value="updateField('company_from', $event)"
          placeholder="مثال: شركة النظم العالمية، بنك التنمية..."
        />
      </div>

      <div class="md:col-span-2 relative">
        <AppInput
          id="visitor-host"
          type="text"
          label="الموظف المراد مقابلته (المستضيف)"
          v-model="hostSearchQuery"
          placeholder="اكتب 3 أحرف على الأقل من اسم الموظف للبحث الآمن..."
          clearable
          @update:model-value="onHostSearchInput"
        />

        <ul
          v-if="availableHosts.length > 0 && showDropdown"
          class="absolute z-50 w-full bg-surface-section border border-surface-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-surface-border"
        >
          <li
            v-for="host in availableHosts"
            :key="host.id"
            @click="selectHost(host)"
            class="p-2.5 hover:bg-primary/5 cursor-pointer text-xs flex justify-between items-center transition-colors"
          >
            <span class="font-bold text-text-primary">{{ host.name }}</span>
            <span
              v-if="host.department"
              class="text-[10px] text-text-muted bg-surface-border px-1.5 py-0.5 rounded font-medium"
            >
              {{ host.department.name }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div>
      <AppTextarea
        id="visitor-purpose"
        label="سبب أو غرض الزيارة"
        :model-value="modelValue.purpose"
        @update:model-value="updateField('purpose', $event)"
        placeholder="اكتب تفاصيل أو سبب المقابلة باختصار..."
        rows="4"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useVisitorStore } from '@/modules/hr/stores/visitorStore'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const visitorStore = useVisitorStore()
const { availableHosts } = storeToRefs(visitorStore)

const hostSearchQuery = ref('')
const showDropdown = ref(false)
let debounceTimeout = null

// معالج البث الموحد للمدخلات (Identical to your way)
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

// محرك البحث اليدوي المربوط بالـ Debounce لمنع الضغط على السيرفر
const onHostSearchInput = (value) => {
  clearTimeout(debounceTimeout)
  if (!value || value.length < 3) {
    availableHosts.value = []
    showDropdown.value = false
    return
  }

  debounceTimeout = setTimeout(async () => {
    await visitorStore.searchHosts(value)
    showDropdown.value = true
  }, 400)
}

// تثبيت الاختيار الفعلي للموظف المستضيف
const selectHost = (host) => {
  hostSearchQuery.value = host.name
  updateField('employee_id', host.id)
  showDropdown.value = false
}

// مراقبة تعيين البيانات عند التعديل أو التصفير لإبقاء الاسم متزامناً في واجهة البحث
watch(
  () => props.modelValue.employee_id,
  (newId) => {
    if (!newId) {
      hostSearchQuery.value = ''
    } else if (props.modelValue.employee && hostSearchQuery.value === '') {
      hostSearchQuery.value = props.modelValue.employee.name
    }
  },
  { immediate: true },
)
</script>
