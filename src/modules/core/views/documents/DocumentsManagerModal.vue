<!--src\modules\core\views\documents\DocumentsManagerModal.vue--->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4 font-sans"
      @click.self="closeModal"
    >
      <div
        class="bg-surface-section rounded-lg shadow-xl p-6 w-full max-w-4xl transform max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 border border-surface-border"
      >
        <div
          class="flex justify-between items-center border-b border-surface-border pb-3 mb-5 flex-shrink-0"
        >
          <div>
            <h3 class="text-lg font-semibold text-text-primary dark:text-white">
              الأرشيف الإلكتروني وإدارة المستندات
            </h3>
            <p class="text-sm text-text-muted mt-1">
              المرفقات الرسمية الخاصة بـ ({{ getTargetLabel(targetType) }}):
              <span class="font-bold text-text-main dark:text-sky-400">{{
                owner.name || owner.full_name || owner.employee_number
              }}</span>
            </p>
          </div>
          <button
            @click="closeModal"
            class="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-border transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="overflow-y-auto flex-grow pr-1">
          <DocumentForm
            ref="documentFormRef"
            :target-id="owner.id"
            :target-type="targetType"
            :is-saving="loading"
            :upload-progress="uploadProgress"
            @submit="handleUploadDocument"
            @cancel="closeModal"
            class="mb-8"
          />

          <hr class="border-surface-border my-6" />

          <h4
            class="text-md font-semibold text-text-secondary dark:text-gray-300 mb-4 flex items-center"
          >
            <svg
              class="w-5 h-5 ml-2 text-sky-500"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
              />
            </svg>
            ملفات الأرشيف الموثقة بالنظام
          </h4>

          <DocumentsList
            :documents="documents"
            :loading="loading"
            :error="error"
            @delete="openDeleteDialog"
            @preview="openPreviewModal"
          />
        </div>

        <AppConfirmDialog
          v-model="isDeleteDialogOpen"
          title="تأكيد حذف المستند من الأرشيف"
          :message="`تنبيه: هل أنت متأكد من حذف مستند '${documentToDelete?.name}'؟ سيبقى الملف مؤمناً بقاعدة البيانات الإدارية.`"
          @confirmed="deleteSelectedDocument"
        />
      </div>
    </div>
  </Transition>

  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="previewDoc"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 font-sans"
      @click.self="closePreview"
    >
      <div
        class="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col bg-surface-ground rounded-lg shadow-2xl overflow-hidden bg-gray-950"
      >
        <div
          class="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800 flex-shrink-0"
        >
          <div class="flex items-center space-x-3 space-x-reverse text-white">
            <span class="px-2 py-0.5 text-xs font-mono bg-sky-600 rounded uppercase font-sans">{{
              previewDoc.extension
            }}</span>
            <h3 class="font-bold truncate text-base max-w-xl">{{ previewDoc.name }}</h3>
          </div>

          <div class="flex items-center space-x-4 space-x-reverse">
            <button
              @click="documentStore.downloadDocument(previewDoc.id)"
              class="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center bg-emerald-950/40 px-3 py-1.5 rounded border border-emerald-800/50 transition-all"
            >
              <svg
                class="w-4 h-4 ml-1.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              تحميل مستند أصلي
            </button>

            <button
              @click="closePreview"
              class="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-grow bg-gray-900 flex items-center justify-center overflow-auto p-4">
          <img
            v-if="isImage(previewDoc.extension)"
            :src="previewDoc.url"
            class="max-w-full max-h-full object-contain rounded"
            alt="Panda DMS Preview"
          />

          <video
            v-else-if="isVideo(previewDoc.extension)"
            :src="previewDoc.url"
            controls
            autoplay
            class="max-w-full max-h-full rounded"
          ></video>

          <iframe
            v-else-if="canPreviewInIframe(previewDoc.extension)"
            :src="previewDoc.url"
            class="w-full h-full border-none bg-white rounded shadow"
          ></iframe>

          <div
            v-else
            class="text-center text-white max-w-md p-6 bg-gray-800 rounded-lg border border-gray-750"
          >
            <p class="text-lg font-bold mb-2">⚠️ لا يمكن معاينة هذا النوع من الملفات مباشرة</p>
            <p class="text-sm text-gray-400 mb-5">
              ملفات الجداول والبيانات المضغوطة تتطلب تحميلها خارج النظام لفتحها ببيئتها المخصصة.
            </p>
            <button
              @click="documentStore.downloadDocument(previewDoc.id)"
              class="px-5 py-2.5 bg-sky-600 text-white rounded font-medium hover:bg-sky-500 shadow transition-colors inline-flex items-center text-sm"
            >
              اضغط هنا لتحميل وثيقة الحسابات
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import DocumentsList from './DocumentsList.vue'
import DocumentForm from './DocumentForm.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  owner: { type: Object, required: true },
  targetType: { type: String, required: true }, // يدعم: company, project, employee, contract
})

const emit = defineEmits(['update:modelValue'])

const documentStore = useDocumentStore()
const { documents, loading, error, uploadProgress } = storeToRefs(documentStore)
const toast = useToast()
const documentFormRef = ref(null)

// مراقبة فتح المودال لإعادة جلب البيانات بشكل طازج دائمًا
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.owner) {
      documentStore.fetchDocuments(props.owner.id, props.targetType).catch(() => {
        toast.error('حدث خطأ فني أثناء جلب مستندات الأرشيف.')
      })
    }
  },
  { immediate: true },
)

/**
 * معالجة طلب الرفع وضبط رسائل الأخطاء القياسية المعربة المنبثقة من الخادم
 */
const handleUploadDocument = async (payload) => {
  try {
    await documentStore.createDocument(payload)
    toast.success(`تم أرشفة مستند '${payload.name}' بنجاح وتوثيقه بالمنشأة.`)

    if (documentFormRef.value) {
      documentFormRef.value.resetForm()
    }
  } catch (err) {
    let errorMessage = 'حدث خطأ غير متوقع أثناء معالجة رفع الوثيقة.'

    if (err.response) {
      const status = err.response.status
      if (status === 413) {
        errorMessage =
          'الملف كبير جداً! الخادم يرفض معالجة مستندات بهذا الحجم (راجع إعدادات php.ini للسيرفر).'
      } else if (status === 422) {
        const validationErrors = err.response.data?.errors
        if (validationErrors && validationErrors.file) {
          errorMessage = validationErrors.file[0]
        } else {
          errorMessage = err.response.data?.message || 'بيانات الوثيقة غير مطابقة لشروط الفهرسة.'
        }
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message
      }
    } else if (err.message?.includes('Network Error')) {
      errorMessage =
        'انقطع الاتصال بالشبكة: قد يكون حجم الملف كبيراً جداً وتجاوز زمن الاستجابة للمحرك.'
    }

    toast.error(errorMessage)
  }
}

// --- طبقة الحذف الناعم والتأكيدات المحاسبية ---
const isDeleteDialogOpen = ref(false)
const documentToDelete = ref(null)

const openDeleteDialog = (doc) => {
  documentToDelete.value = doc
  isDeleteDialogOpen.value = true
}

const deleteSelectedDocument = async () => {
  if (!documentToDelete.value) return
  try {
    await documentStore.deleteDocument(documentToDelete.value.id, props.owner.id, props.targetType)
    toast.success('تم نقل المستند لسلة المحذوفات الإدارية بنجاح.')
  } catch (err) {
    toast.error('فشلت عملية الحذف: عذراً، قد لا تملك الصلاحيات الكافية لهذه المعاملة.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
}

// --- طبقة المعاينة والمطابقة الفورية للملفات ---
const previewDoc = ref(null)

const openPreviewModal = (doc) => {
  console.log('🔗 Panda DMS Secure Link Initialized:', doc.url)
  previewDoc.value = doc
}

const closePreview = () => {
  previewDoc.value = null
}

/**
 * دالة مساعدة لترجمة مسميات الجهات المستهدفة باللغة العربية داخل لوحة التحكم
 */
const getTargetLabel = (type) => {
  const labels = {
    company: 'الشركة',
    project: 'المشروع',
    employee: 'الموظف ووثائقه الشخصية',
    contract: 'عقد العمل والملاحق الإدارية',
  }
  return labels[type] || 'جهة داخلية غير معرفة'
}

const isImage = (ext) =>
  ext && ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg'].includes(ext.toLowerCase())
const isVideo = (ext) => ext && ['mp4', 'mov'].includes(ext.toLowerCase())
const canPreviewInIframe = (ext) => ext && ['pdf', 'txt', 'json'].includes(ext.toLowerCase())
</script>
