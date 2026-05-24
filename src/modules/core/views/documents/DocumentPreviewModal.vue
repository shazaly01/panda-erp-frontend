<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="document"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 font-sans"
      @click.self="closeModal"
    >
      <div
        class="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col bg-surface-ground rounded-lg shadow-2xl overflow-hidden bg-gray-950"
      >
        <!-- شريط التحكم العلوي للمعاينة -->
        <div
          class="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800 flex-shrink-0"
        >
          <div class="flex items-center space-x-3 space-x-reverse text-white">
            <span class="px-2 py-0.5 text-xs font-mono bg-sky-600 rounded uppercase font-sans">
              {{ document.extension }}
            </span>
            <h3 class="font-bold truncate text-base max-w-xl">{{ document.name }}</h3>
          </div>

          <div class="flex items-center space-x-4 space-x-reverse">
            <button
              @click="handleDownload"
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
              @click="closeModal"
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

        <!-- منطقة العرض الديناميكية حسب الامتداد الإداري للوثيقة -->
        <div class="flex-grow bg-gray-900 flex items-center justify-center overflow-auto p-4">
          <img
            v-if="isImage(document.extension)"
            :src="document.url"
            class="max-w-full max-h-full object-contain rounded"
            alt="Panda DMS Preview"
          />

          <video
            v-else-if="isVideo(document.extension)"
            :src="document.url"
            controls
            autoplay
            class="max-w-full max-h-full rounded"
          ></video>

          <iframe
            v-else-if="canPreviewInIframe(document.extension)"
            :src="document.url"
            class="w-full h-full border-none bg-white rounded shadow"
          ></iframe>

          <!-- شاشة التنبيه للمستندات غير القابلة للمعاينة الفورية -->
          <div
            v-else
            class="text-center text-white max-w-md p-6 bg-gray-800 rounded-lg border border-gray-750"
          >
            <p class="text-lg font-bold mb-2">⚠️ لا يمكن معاينة هذا النوع من الملفات مباشرة</p>
            <p class="text-sm text-gray-400 mb-5">
              ملفات الجداول والبيانات المضغوطة تتطلب تحميلها خارج النظام لفتحها ببيئتها المخصصة.
            </p>
            <button
              @click="handleDownload"
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
import { useDocumentStore } from '@/stores/documentStore'

const props = defineProps({
  document: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const documentStore = useDocumentStore()

const closeModal = () => {
  emit('close')
}

const handleDownload = () => {
  if (props.document?.id) {
    documentStore.downloadDocument(props.document.id)
  }
}

// دالات الفحص والتحقق الصارم من امتدادات الأرشيف الإلكتروني
const isImage = (ext) =>
  ext && ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg'].includes(ext.toLowerCase())

const isVideo = (ext) => ext && ['mp4', 'mov'].includes(ext.toLowerCase())

const canPreviewInIframe = (ext) => ext && ['pdf', 'txt', 'json'].includes(ext.toLowerCase())
</script>
