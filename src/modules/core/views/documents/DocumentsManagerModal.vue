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
        <!-- الرأس العلوي للمودال وإحصائيات الجهة المالكة -->
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

        <!-- جسم الأرشيف: نموذج الأرشفة متبوعاً بجدول المحتويات -->
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

        <!-- حوار تأكيد الحذف الإداري الصارم -->
        <AppConfirmDialog
          v-model="isDeleteDialogOpen"
          title="تأكيد حذف المستند من الأرشيف"
          :message="`تنبيه: هل أنت متأكد من حذف مستند '${documentToDelete?.name}'؟ سيبقى الملف مؤمناً بقاعدة البيانات الإدارية.`"
          @confirmed="deleteSelectedDocument"
        />
      </div>
    </div>
  </Transition>

  <!-- المكون المستقل والذكي الذي تم استخلاصه لإدارة ومعاينة الملفات والمستندات الممسوحة ضوئياً -->
  <DocumentPreviewModal :document="previewDoc" @close="closePreview" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import DocumentsList from './DocumentsList.vue'
import DocumentForm from './DocumentForm.vue'
import DocumentPreviewModal from './DocumentPreviewModal.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  owner: { type: Object, required: true },
  targetType: { type: String, required: true },
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
 * معالجة طلب الرفع وضبط رسائل الأخطاء القياسية المعربة
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

// --- طبقة التحكم في المعاينة الفورية المربوطة بالمكون الفرعي ---
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
</script>
