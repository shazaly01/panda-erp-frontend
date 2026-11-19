<!-- src/modules/hr/views/internet_vouchers/components/VoucherImportModal.vue -->
<template>
  <AppDialog
    :model-value="modelValue"
    @update:model-value="closeModal"
    title="استيراد أكواد ميكروتيك (CSV)"
    size="lg"
    border-color="border-primary"
    :loading="loading"
  >
    <div
      class="-m-3 p-4 bg-surface-header rounded-xl border border-surface-border shadow-xs space-y-3.5 text-right font-sans transition-colors duration-200"
      dir="rtl"
    >
      <!-- رسالة إرشادية -->
      <p class="text-xs text-text-secondary font-medium leading-relaxed">
        قم برفع ملف البيانات بصيغة <strong class="font-mono text-primary">(CSV)</strong> لإضافة
        الأكواد الجديدة إلى مخزون الشركة.
      </p>

      <!-- منطقة رفع الملف -->
      <div
        class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer bg-surface-card group"
        :class="
          selectedFile
            ? 'border-success/60 bg-success/5'
            : 'border-surface-border hover:border-primary/70'
        "
        @click="$refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.txt"
          class="hidden"
          @change="handleFileChange"
        />

        <div v-if="!selectedFile" class="space-y-1.5">
          <div
            class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 text-primary mx-auto flex items-center justify-center group-hover:scale-105 transition-transform"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p class="text-xs sm:text-sm text-text-primary font-black">
            اضغط لاختيار ملف الأكواد من جهازك
          </p>
          <p class="text-[11px] text-text-muted">يُسمح بصيغة CSV أو TXT فقط (أقصى حجم 10MB)</p>
        </div>

        <div v-else class="text-success font-bold flex flex-col items-center gap-1.5">
          <div
            class="w-11 h-11 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span class="text-xs sm:text-sm font-mono font-black tracking-wide text-text-primary">
            {{ selectedFile.name }}
          </span>
          <span class="text-[10px] text-primary underline">اضغط لتغيير الملف</span>
        </div>
      </div>

      <!-- الخيارات الإضافية -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-surface-card p-3.5 rounded-xl border border-surface-border shadow-2xs items-end"
      >
        <div>
          <AppInput
            id="voucher-capacity"
            label="سعة الكود الافتراضية"
            v-model="capacity"
            placeholder="مثال: 1GB أو 500MB"
            class="font-mono"
          />
        </div>

        <div class="pb-1">
          <label
            class="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-ground/70 border border-surface-border cursor-pointer select-none"
          >
            <span class="text-xs font-bold text-text-primary">الملف يحتوي على صف عناوين</span>
            <input
              type="checkbox"
              v-model="hasHeader"
              class="w-4 h-4 rounded border-surface-border text-primary focus:ring-primary/25 accent-primary cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        @click="closeModal"
        :disabled="loading"
      >
        إلغاء وتراجع
      </AppButton>
      <AppButton
        type="button"
        size="sm"
        @click="submitImport"
        :loading="loading"
        :disabled="!selectedFile || loading"
        icon="upload"
      >
        بدء الاستيراد
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref } from 'vue'
import { useInternetVoucherStore } from '@/modules/hr/stores/internetVoucherStore'
import { useToast } from 'vue-toastification'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'imported'])

const store = useInternetVoucherStore()
const toast = useToast()

const fileInput = ref(null)
const selectedFile = ref(null)
const capacity = ref('1GB')
const hasHeader = ref(true)
const loading = ref(false)

const closeModal = () => {
  if (loading.value) return
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  capacity.value = '1GB'
  hasHeader.value = true
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('يرجى اختيار ملف بصيغة CSV.')
      resetForm()
      return
    }
    selectedFile.value = file
  }
}

const submitImport = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('capacity', capacity.value)
  formData.append('has_header', hasHeader.value)

  loading.value = true
  try {
    await store.importVouchers(formData)
    emit('imported')
    closeModal()
  } catch {
    toast.error(store.error || 'حدث خطأ غير متوقع أثناء الرفع.')
  } finally {
    loading.value = false
  }
}
</script>
