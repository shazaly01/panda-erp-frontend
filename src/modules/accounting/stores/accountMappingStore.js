//src\modules\accounting\stores\accountMappingStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import accountMappingService from '../services/accountMapping.service'

export const useAccountMappingStore = defineStore('accountingMapping', () => {
  // ==========================
  // 1. State
  // ==========================
  // القائمة ستحتوي على كائنات مثل:
  // { id: 1, key: 'sales_revenue', name: 'إيرادات المبيعات', account_id: 50, account: { code: '4101', name: '...' } }
  const mappings = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب كل إعدادات الربط الحالية
  async function fetchMappings() {
    loading.value = true
    error.value = null
    try {
      const response = await accountMappingService.get()
      mappings.value = Array.isArray(response.data) ? response.data : response.data.data || []
    } catch (err) {
      error.value = 'فشل تحميل إعدادات التوجيه المحاسبي'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // تحديث ربط معين (مثلاً تغيير حساب الرواتب من 2001 إلى 2005)
  async function updateMapping(id, accountId) {
    loading.value = true
    error.value = null
    try {
      await accountMappingService.update(id, accountId)

      // تحديث القائمة محلياً لتعكس التغيير فوراً
      const item = mappings.value.find((m) => m.id === id)
      if (item) {
        item.account_id = accountId
        // ملاحظة: لتحديث اسم الحساب أيضاً في الواجهة،
        // قد نحتاج لجلب القائمة مجدداً أو تمرير كائن الحساب كاملاً هنا
        // للأمان سنعيد طلب القائمة:
        await fetchMappings()
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حفظ الإعدادات'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==========================
  // 3. Getters
  // ==========================

  // تجميع الإعدادات حسب النوع (لسهولة العرض في تبويبات)
  // مثال: تبويب "مبيعات"، تبويب "رواتب"...
  // هذا يتطلب أن يكون لديك حقل 'group' أو تعتمد على بداية الـ key
  // سنفترض التحليل بناءً على الـ Key
  const groupedMappings = computed(() => {
    const groups = {
      hr: [],
      sales: [],
      purchases: [],
      inventory: [],
      other: [],
    }

    mappings.value.forEach((m) => {
      // نتحقق من وجود key أولاً لتجنب الأخطاء
      if (!m.key) return

      if (m.key.startsWith('hr_')) groups.hr.push(m)
      else if (m.key.startsWith('sales_') || m.key.startsWith('vat_output')) groups.sales.push(m)
      else if (m.key.startsWith('purchase_') || m.key.startsWith('vat_input'))
        groups.purchases.push(m)
      else if (m.key.startsWith('inventory_')) groups.inventory.push(m)
      else groups.other.push(m)
    })

    return groups
  })

  return {
    mappings,
    loading,
    error,
    groupedMappings, // استخدم هذا لإنشاء Tabs في صفحة الإعدادات
    fetchMappings,
    updateMapping,
  }
})
