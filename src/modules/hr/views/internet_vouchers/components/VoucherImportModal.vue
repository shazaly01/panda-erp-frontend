<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 hide-on-print"
    @click.self="closeModal"
  >
    <div
      class="bg-slate-900 rounded-[2rem] p-8 max-w-xl w-full relative shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-800"
    >
      <button
        @click="closeModal"
        class="absolute top-6 left-6 text-slate-400 hover:text-rose-400 transition font-bold"
      >
        ✕
      </button>

      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">استيراد أكواد ميكروتيك (CSV)</h2>
        <p class="text-slate-400 text-sm">
          قم برفع ملف الإكسيل بصيغة (CSV) لإضافة الأكواد الجديدة إلى مخزون الشركة.
        </p>
      </div>

      <form @submit.prevent="submitImport" class="space-y-6">
        <!-- منطقة رفع الملف -->
        <div
          class="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 transition cursor-pointer bg-slate-800/50 group"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.txt"
            class="hidden"
            @change="handleFileChange"
          />
          <div v-if="!selectedFile">
            <svg
              class="mx-auto h-12 w-12 text-slate-500 mb-3 group-hover:text-blue-400 transition"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="text-slate-300 font-medium">اضغط لاختيار ملف البيانات</p>
            <p class="text-slate-500 text-xs mt-1">يُسمح بصيغة CSV فقط (أقصى حجم 10MB)</p>
          </div>
          <div v-else class="text-emerald-400 font-bold flex flex-col items-center gap-2">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="tracking-wider">{{ selectedFile.name }}</span>
          </div>
        </div>

        <!-- الخيارات الإضافية -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800"
        >
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2"
              >سعة الكود الافتراضية</label
            >
            <AppInput id="voucher-capacity" v-model="capacity" placeholder="مثال: 1GB أو 500MB" />
          </div>
          <div class="flex items-end pb-2">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                v-model="hasHeader"
                class="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
              />
              <span class="text-slate-300 text-sm group-hover:text-white transition"
                >الملف يحتوي على صف عناوين</span
              >
            </label>
          </div>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="flex justify-end gap-3 pt-4">
          <AppButton type="button" variant="secondary" @click="closeModal" :disabled="loading">
            إلغاء
          </AppButton>
          <AppButton type="submit" :loading="loading" :disabled="!selectedFile" icon="upload">
            بدء الاستيراد
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useInternetVoucherStore } from '@/modules/hr/stores/internetVoucherStore'
import { useToast } from 'vue-toastification'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

const props = defineProps({
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
  } catch (error) {
    toast.error(store.error || 'حدث خطأ غير متوقع أثناء الرفع.')
  } finally {
    loading.value = false
  }
}
</script>
