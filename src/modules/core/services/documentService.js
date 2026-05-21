// src/modules/core/services/documentService.js
import apiClient from './apiClient'

const resource = '/documents'

export default {
  /**
   * جلب المستندات بناءً على المعرف والنوع (شركة، مشروع، موظف، عقد)
   */
  get(targetId, targetType) {
    return apiClient.get(resource, {
      params: {
        target_id: targetId,
        target_type: targetType,
      },
    })
  },

  /**
   * رفع مستند جديد يدعم الخصائص العالمية وتصنيف الـ Enum
   * (تم تأمين قراءة المتغيرات النصية الخام وضخها أولاً قبل دفق الملف)
   */
  create(payload, onUploadProgress) {
    const formData = new FormData()

    formData.append('document_type', payload.document_type)
    formData.append('name', payload.name)
    formData.append('target_type', payload.target_type)
    formData.append('target_id', String(payload.target_id))

    if (payload.file) {
      formData.append('file', payload.file)
    }

    return apiClient.post(resource, formData, {
      // إجبار Axios على تجاهل الـ JSON العام وإرسال الملفات كـ FormData
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress,
    })
  },

  /**
   * تحميل المستند إجبارياً لمنع المتصفح من فتحه في تبويب جديد
   */
  download(id) {
    const downloadUrl = `${apiClient.defaults.baseURL}${resource}/${id}/download`
    window.open(downloadUrl, '_blank')
  },

  /**
   * حذف مستند برمجياً (Soft Delete)
   */
  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
