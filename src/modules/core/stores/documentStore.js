//src\modules\core\stores\documentStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import documentService from '../services/documentService' // تم ضبط المسار ليتوافق مع الهيكل الفعلي للمجلدات

export const useDocumentStore = defineStore('document', () => {
  const documents = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  /**
   * جلب المستندات الخاصة بسجل معين (شركة، مشروع، موظف، عقد)
   */
  async function fetchDocuments(targetId, targetType) {
    loading.value = true
    error.value = null
    try {
      const response = await documentService.get(targetId, targetType)
      // الباك-إند يعيد البيانات داخل مصفوفة data طبقاً لـ DocumentResource
      documents.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب قائمة المستندات من السيرفر.'
      documents.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * رفع مستند جديد وتحديث القائمة تلقائياً بعد اكتمال الرفع
   */
  async function createDocument(payload) {
    loading.value = true
    error.value = null
    uploadProgress.value = 0
    try {
      await documentService.create(payload, (event) => {
        uploadProgress.value = Math.round((event.loaded * 100) / event.total)
      })
      // تحديث القائمة فوراً لإظهار الملف المرفوع حديثاً في الجدول
      await fetchDocuments(payload.target_id, payload.target_type)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشلت عملية رفع المستند للأرشيف.'
      throw err
    } finally {
      loading.value = false
      setTimeout(() => (uploadProgress.value = 0), 1000)
    }
  }

  /**
   * دالة التحميل الفوري والإجباري للمستند
   */
  function downloadDocument(docId) {
    try {
      documentService.download(docId)
    } catch (err) {
      error.value = 'حدث خطأ أثناء محاولة تحميل الملف.'
    }
  }

  /**
   * حذف مستند برمجياً وتحديث القائمة بعد الحذف
   */
  async function deleteDocument(docId, targetId, targetType) {
    loading.value = true
    error.value = null
    try {
      await documentService.delete(docId)
      // إعادة جلب المستندات لتحديث الجدول بعد الحذف الناجح
      await fetchDocuments(targetId, targetType)
    } catch (err) {
      // قراءة رسائل الصلاحيات المنبثقة من الباك-إند (مثل: عذراً، ليس لديك صلاحية...)
      if (err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message
      } else {
        error.value = 'حدث خطأ غير متوقع أثناء حذف الملف.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    documents,
    loading,
    error,
    uploadProgress,
    fetchDocuments,
    createDocument,
    downloadDocument, // تصدير الدالة لتكون متاحة للواجهات
    deleteDocument,
  }
})
