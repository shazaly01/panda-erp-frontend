// src/stores/appStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 🛡️ مقاومة الـ Refresh: قراءة القسم المحفوظ في المتصفح فوراً، وإذا لم يوجد، يتم اعتماد 'accounting' كافتراضي
  const activeModule = ref(localStorage.getItem('active_module') || 'accounting')

  /**
   * تعيين القسم النشط ومزامنته فوراً مع ذاكرة المتصفح الدائمة
   * @param {String} moduleName - اسم القسم (accounting أو hr)
   */
  function setActiveModule(moduleName) {
    activeModule.value = moduleName

    // حفظ الخيار مركزياً في المتصفح لكي لا يضيع عند إعادة تحميل الصفحة
    localStorage.setItem('active_module', moduleName)
  }

  /**
   * تصفير حالة الأقسام (تُستدعى عند تسجيل الخروج التام للمستخدم من النظام للأمان)
   */
  function clearAppSession() {
    activeModule.value = 'accounting'
    localStorage.removeItem('active_module')
  }

  return {
    activeModule,
    setActiveModule,
    clearAppSession,
  }
})
