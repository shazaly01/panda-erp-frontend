<!-- src/modules/purchasing/views/requisitions/components/RequisitionItemsTable.vue -->
<template>
  <div class="p-0 bg-transparent space-y-4 font-sans text-right" dir="rtl">
    <!-- 1. شريط البحث الذكي لإدراج الأصناف المخزنية المسجلة -->
    <div
      class="w-full text-xs bg-[#e05e2b] p-1 rounded-lg shadow-[0_0_15px_rgba(224,94,43,0.25)] border border-[#e05e2b]"
    >
      <SmartSearchGrid
        :data="searchableProducts"
        :columns="[
          { key: 'id_display', label: 'كود الصنف', class: 'text-right' },
          { key: 'name', label: 'اسم الصنف التجاري', class: 'text-right font-bold' },
          { key: 'cost_display', label: 'التكلفة التقديرية (شراء)', class: 'text-center' },
          { key: 'stock_display', label: 'الرصيد المخزني الحالي', class: 'text-center' },
        ]"
        :search-keys="['id', 'name', 'code', 'all_barcodes']"
        placeholder="ابحث بالاسم، كود الصنف، أو امسح الباركود لإدراج منتج مسجل بالطلب مباشرة..."
        @select="handleGlobalItemSelect"
      />
    </div>

    <!-- تنبيه خطأ التحقق العام لقائمة البنود -->
    <p
      v-if="getValidationError('items')"
      class="p-2.5 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/50"
    >
      {{ getValidationError('items') }}
    </p>

    <!-- 2. جدول إدخال وتعديل البنود التفاعلي (يدعم الأصناف المخزنية والمدخلات الحرة) -->
    <div class="overflow-x-auto rounded-xl border border-[#3e414c] bg-[#1a1d24] shadow-lg">
      <table class="w-full text-right border-collapse text-xs">
        <thead>
          <tr class="bg-[#121316] text-gray-300 border-b border-[#3e414c] font-bold select-none">
            <th class="p-2.5 text-center w-12">#</th>
            <th class="p-2.5 min-w-[220px]">بيان الصنف أو الخدمة</th>
            <th class="p-2.5 min-w-[130px]">وحدة القياس</th>
            <th class="p-2.5 text-center w-28">الكمية المطلوبة</th>
            <th class="p-2.5 text-center w-32">التكلفة التقديرية</th>
            <th class="p-2.5 text-center w-28">الإجمالي التقديري</th>
            <th class="p-2.5 min-w-[200px]">المواصفات الفنية وملاحظات البند</th>
            <th class="p-2.5 text-center w-12">إجراء</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2a2e39]">
          <tr
            v-for="(row, index) in items"
            :key="row.id || index"
            class="hover:bg-[#232732] transition-colors"
          >
            <!-- تسلسل السطر ونوعه -->
            <td class="p-2.5 text-center font-mono text-gray-400">
              <div class="flex flex-col items-center justify-center gap-1">
                <span>{{ index + 1 }}</span>
                <span
                  class="text-[9px] px-1.5 py-0.2 rounded font-sans font-bold"
                  :class="
                    row.is_custom
                      ? 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                  "
                >
                  {{ row.is_custom ? 'مخصص' : 'مخزني' }}
                </span>
              </div>
            </td>

            <!-- بيان الصنف (إما حقل نصي حر أو صنف مخزني مقفل) -->
            <td class="p-2.5">
              <div class="flex flex-col gap-1">
                <!-- حالة الصنف المخصص/الخدمة الحرة -->
                <div v-if="row.is_custom" class="w-full">
                  <input
                    type="text"
                    v-model="row.item_name"
                    placeholder="اكتب اسم الصنف، الجهاز، أو الخدمة المطلوبة..."
                    class="w-full p-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
                  />
                </div>

                <!-- حالة الصنف المسجل في دليل المنتجات -->
                <div v-else class="flex flex-col">
                  <span class="font-bold text-white text-xs">{{ row.item_name }}</span>
                  <span class="text-[10px] font-mono text-gray-400">
                    كود: PRD-{{ row.product_id }}
                  </span>
                </div>

                <!-- أخطاء التحقق -->
                <p
                  v-if="getValidationError(`items.${index}.item_name`)"
                  class="text-rose-400 text-[10px] font-bold"
                >
                  {{ getValidationError(`items.${index}.item_name`) }}
                </p>
                <p
                  v-if="getValidationError(`items.${index}.product_id`)"
                  class="text-rose-400 text-[10px] font-bold"
                >
                  {{ getValidationError(`items.${index}.product_id`) }}
                </p>
              </div>
            </td>

            <!-- وحدة القياس -->
            <td class="p-2.5">
              <div class="flex flex-col gap-1">
                <!-- وحدة حرة للصنف المخصص -->
                <div v-if="row.is_custom">
                  <input
                    type="text"
                    v-model="row.unit_name"
                    placeholder="مثال: حبة، طقم، متر..."
                    class="w-full p-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded text-white text-xs font-semibold outline-none text-right"
                  />
                </div>

                <!-- قائمة وحدات الصنف المخزني المسجل -->
                <div v-else>
                  <select
                    v-model="row.product_unit_id"
                    @change="syncUnitDetails(row)"
                    style="color-scheme: dark"
                    class="w-full p-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded text-white text-xs font-bold outline-none text-right appearance-none cursor-pointer"
                  >
                    <option value="" class="bg-[#16171b] text-gray-400">اختر الوحدة...</option>
                    <option
                      v-for="u in row.available_units"
                      :key="u.id"
                      :value="u.id"
                      class="bg-[#16171b] text-white"
                    >
                      {{ u.unit_name || u.name || 'وحدة مسجلة' }}
                    </option>
                  </select>
                </div>

                <!-- أخطاء التحقق -->
                <p
                  v-if="getValidationError(`items.${index}.product_unit_id`)"
                  class="text-rose-400 text-[10px] font-bold"
                >
                  {{ getValidationError(`items.${index}.product_unit_id`) }}
                </p>
                <p
                  v-if="getValidationError(`items.${index}.unit_name`)"
                  class="text-rose-400 text-[10px] font-bold"
                >
                  {{ getValidationError(`items.${index}.unit_name`) }}
                </p>
              </div>
            </td>

            <!-- الكمية المطلوبة -->
            <td class="p-2.5">
              <div class="flex flex-col items-center">
                <input
                  type="text"
                  inputmode="decimal"
                  :value="formatNumber(row.quantity_requested)"
                  @input="row.quantity_requested = unformatNumber($event.target.value)"
                  class="w-full p-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded text-white text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
                  placeholder="1"
                />
                <p
                  v-if="getValidationError(`items.${index}.quantity_requested`)"
                  class="text-rose-400 text-[10px] font-bold mt-1 text-center"
                >
                  {{ getValidationError(`items.${index}.quantity_requested`) }}
                </p>
              </div>
            </td>

            <!-- التكلفة التقديرية للوحدة -->
            <td class="p-2.5">
              <div class="flex flex-col items-center">
                <input
                  type="text"
                  inputmode="decimal"
                  :value="formatNumber(row.estimated_unit_cost)"
                  @input="row.estimated_unit_cost = unformatNumber($event.target.value)"
                  class="w-full p-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded text-white text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-[#e05e2b]/30"
                  placeholder="0.00"
                />
                <p
                  v-if="getValidationError(`items.${index}.estimated_unit_cost`)"
                  class="text-rose-400 text-[10px] font-bold mt-1 text-center"
                >
                  {{ getValidationError(`items.${index}.estimated_unit_cost`) }}
                </p>
              </div>
            </td>

            <!-- الإجمالي التقديري للسطر -->
            <td class="p-2.5 text-center font-mono font-bold text-emerald-400 text-xs">
              {{
                formatNumber(
                  (parseFloat(row.quantity_requested) || 0) *
                    (parseFloat(row.estimated_unit_cost) || 0),
                )
              }}
            </td>

            <!-- المواصفات الفنية والملاحظات -->
            <td class="p-2.5">
              <div class="flex flex-col gap-1.5">
                <input
                  type="text"
                  v-model="row.specifications"
                  placeholder="المواصفات الفنية (مقاس، ماركة، سعة...)"
                  class="w-full p-1.5 bg-[#16171b] border border-[#3e414c] hover:border-gray-500 focus:border-[#e05e2b] rounded text-gray-300 text-xs outline-none"
                />
                <input
                  type="text"
                  v-model="row.notes"
                  placeholder="ملاحظات البند..."
                  class="w-full p-1 bg-[#16171b] border border-[#2a2e39] hover:border-gray-500 focus:border-[#e05e2b] rounded text-gray-400 text-[11px] outline-none"
                />
              </div>
            </td>

            <!-- حذف السطر -->
            <td class="p-2.5 text-center">
              <button
                type="button"
                @click="removeRow(index)"
                class="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="حذف هذا البند"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </td>
          </tr>

          <!-- في حال كانت القائمة فارغة -->
          <tr v-if="items.length === 0">
            <td colspan="8" class="p-6 text-center text-gray-400 font-semibold text-xs">
              لا توجد بنود مضافة حتى الآن. يمكنك البحث عن منتج أعلاه أو الضغط على زر الإضافة اليدوية
              أدناه.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. زر إضافة سطر مخصص / يدوي إضافي -->
    <div class="flex items-center justify-between pt-1">
      <button
        type="button"
        @click="triggerAddNewEmptyLine"
        class="h-9 px-4 bg-[#23252e] hover:bg-[#2b2e3a] text-[#e05e2b] border border-[#e05e2b]/40 hover:border-[#e05e2b] text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>+ إضافة صنف حر / خدمة يدوية</span>
      </button>

      <span class="text-xs text-gray-400 font-mono">
        إجمالي البنود المسجلة: <strong class="text-white">{{ items.length }}</strong>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProductStore } from '@/modules/inventory/stores/productStore'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'

defineProps({
  items: { type: Array, required: true },
  getValidationError: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  unformatNumber: { type: Function, required: true },
  triggerAddNewEmptyLine: { type: Function, required: true },
  removeRow: { type: Function, required: true },
  handleGlobalItemSelect: { type: Function, required: true },
  syncUnitDetails: { type: Function, required: true },
})

const productStore = useProductStore()

// استخراج البيانات وتجهيز مصفوفة البحث السريع بالباركود والاسم
const searchableProducts = computed(() => {
  if (!productStore.products) return []

  return productStore.products.map((item) => {
    const directBarcodes = Array.isArray(item.barcodes)
      ? item.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
      : []

    const unitBarcodes = Array.isArray(item.units)
      ? item.units.flatMap((u) =>
          Array.isArray(u.barcodes)
            ? u.barcodes.map((b) => (typeof b === 'object' ? b.barcode : b))
            : [],
        )
      : []

    const allBarcodes = [...new Set([...directBarcodes, ...unitBarcodes])].filter(Boolean)

    return {
      ...item,
      id_display: `PRD-${item.id}`,
      name: item.name || '',
      cost_display: item.units?.[0]
        ? `${parseFloat(item.units[0].cost_price || item.cost_price || 0).toFixed(2)}`
        : '0.00',
      stock_display:
        item.current_stock !== undefined
          ? `${item.current_stock}`
          : item.stock !== undefined
            ? `${item.stock}`
            : '0',
      all_barcodes: allBarcodes,
    }
  })
})
</script>

<style scoped>
select option {
  background-color: #16171b !important;
  color: #f8fafc !important;
}
</style>
