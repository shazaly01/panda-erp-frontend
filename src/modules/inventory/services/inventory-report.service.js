import apiClient from '@/services/apiClient'

const resource = '/inventory/reports'

export default {
  // 1. تقرير كارت الصنف التفصيلي والرصيد التراكمي
  getItemStockCard(params = {}) {
    return apiClient.get(`${resource}/stock-card`, { params })
  },

  // 2. تقرير أرصدة وتقييم المخزون اللحظي
  getStockBalance(params = {}) {
    return apiClient.get(`${resource}/stock-balance`, { params })
  },

  // 3. تقرير تدقيق المطابقة وفحص سلامة البيانات المخزنية
  getIntegrityAudit(params = {}) {
    return apiClient.get(`${resource}/integrity-audit`, { params })
  },

  // 4. تقرير تسويات وفروقات الجرد الفعلي والدفتري
  getStockDiscrepancies(params = {}) {
    return apiClient.get(`${resource}/discrepancies`, { params })
  },

  // 5. تقرير متابعة التحويلات بين المستودعات
  getTransfersTracking(params = {}) {
    return apiClient.get(`${resource}/transfers-tracking`, { params })
  },

  // 6. تقرير صلاحيات ودفعات التشغيل والراكد
  getBatchExpiry(params = {}) {
    return apiClient.get(`${resource}/batch-expiry`, { params })
  },

  // 7. تقرير تتبع ومسار الأرقام التسلسلية
  getSerialTracking(params = {}) {
    return apiClient.get(`${resource}/serial-tracking`, { params })
  },

  // 8. تقرير نواقص المخزون وحدود إعادة الطلب
  getReorderAlerts(params = {}) {
    return apiClient.get(`${resource}/reorder-alerts`, { params })
  },

  // 9. تقرير انحرافات واستهلاك وتكاليف الإنتاج
  getProductionVariance(params = {}) {
    return apiClient.get(`${resource}/production-variance`, { params })
  },
}
