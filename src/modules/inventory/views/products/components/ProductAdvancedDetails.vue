<!--src\modules\inventory\views\products\components\ProductAdvancedDetails.vue-->
<template>
  <div class="space-y-4 pt-2">
    <!-- فاصل تمهيدي للأقسام المتقدمة -->
    <div class="flex items-center gap-3 py-2 border-b border-surface-border/60">
      <div
        class="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent"
      ></div>
      <span
        class="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2"
      >
        <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        إعدادات موسعة وخيارات متقدمة (اختياري)
      </span>
      <div
        class="h-px flex-1 bg-gradient-to-r from-transparent via-surface-border to-transparent"
      ></div>
    </div>

    <!-- ========================================================= -->
    <!-- القسم الأول: الوحدات الإضافية وتعبئة البيع (بدون جدول أو سكرول) -->
    <!-- ========================================================= -->
    <div
      class="border border-surface-border rounded-2xl bg-surface-section overflow-hidden transition-all duration-200"
    >
      <button
        type="button"
        @click="toggleSection('units')"
        class="w-full flex items-center justify-between p-4 text-right hover:bg-surface-ground/50 transition-colors"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-text-primary">وحدات تعبئة إضافية</h3>
              <span
                v-if="additionalUnitsList.length > 0"
                class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-sky-500/20 dark:text-sky-300"
              >
                {{ additionalUnitsList.length }} وحدة مضافة
              </span>
            </div>
            <p class="text-xs text-text-muted mt-0.5">
              تحديد وحدات بيع وشراء أخرى (مثل: كرتونة، درزن) مع تحديد كم حبة تحتوي عليها وسعرها.
            </p>
          </div>
        </div>
        <div
          class="text-text-muted transition-transform duration-200"
          :class="{ 'rotate-180': openSections.units }"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div v-show="openSections.units" class="p-4 pt-0 border-t border-surface-border/50 space-y-3">
        <!-- زر الإضافة وتنبيه الوحدة الأساسية -->
        <div class="flex items-center justify-between pt-3">
          <span class="text-xs text-text-muted">
            الوحدة الأساسية معرفة بالأعلى. يمكنك إضافة وحدات تعبئة فرعية هنا:
          </span>
          <button
            type="button"
            @click="addUnitRow"
            class="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>+ إضافة وحدة تعبئة</span>
          </button>
        </div>

        <!-- حالة عدم وجود وحدات إضافية -->
        <div
          v-if="additionalUnitsList.length === 0"
          class="p-4 rounded-xl border border-dashed border-surface-border text-center text-xs text-text-muted bg-surface-ground/20"
        >
          لا توجد وحدات إضافية. يتم بيع وشراء الصنف بالوحدة الأساسية فقط.
        </div>

        <!-- قائمة أسطر الوحدات الإضافية الانسيابية -->
        <div v-else class="space-y-2.5">
          <div
            v-for="item in additionalUnitsList"
            :key="item.index"
            class="p-3.5 rounded-xl border border-surface-border bg-surface-ground/40 flex flex-col md:flex-row items-end md:items-center gap-3"
          >
            <!-- اختيار الوحدة -->
            <div class="w-full md:w-1/3">
              <AppDropdown
                :id="`adv-unit-id-${item.index}`"
                label="الوحدة الإضافية *"
                :model-value="item.unit.unit_id"
                :options="unitsList"
                option-label="name"
                option-value="id"
                placeholder="اختر الوحدة (مثال: كرتونة)..."
                @update:model-value="updateUnitRow(item.index, 'unit_id', $event)"
              />
            </div>

            <!-- معامل التحويل (تحتوي على كذا من الوحدة الأساسية) -->
            <div class="w-full md:w-1/3">
              <AppInput
                :id="`adv-unit-factor-${item.index}`"
                type="number"
                label="الكمية بالوحدة الأساسية *"
                :model-value="item.unit.conversion_factor"
                @update:model-value="updateUnitRow(item.index, 'conversion_factor', $event)"
                placeholder="مثال: 12 أو 24"
              />
            </div>

            <!-- سعر البيع للوحدة الإضافية -->
            <div v-if="modelValue.can_be_sold ?? true" class="w-full md:w-1/3">
              <AppInput
                :id="`adv-unit-price-${item.index}`"
                type="number"
                label="سعر بيع هذه الوحدة"
                :model-value="getUnitBasePrice(item.unit)"
                @update:model-value="setUnitBasePrice(item.index, $event)"
                placeholder="0.00"
              />
            </div>

            <!-- زر حذف الوحدة الإضافية -->
            <div class="pt-2 md:pt-5 shrink-0">
              <button
                type="button"
                @click="removeUnitRow(item.index)"
                class="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                title="حذف هذه الوحدة"
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- القسم الثاني: قوائم الأسعار المتقدمة وشرائح الكميات -->
    <!-- ========================================================= -->
    <div
      v-if="modelValue.can_be_sold ?? true"
      class="border border-surface-border rounded-2xl bg-surface-section overflow-hidden transition-all duration-200"
    >
      <button
        type="button"
        @click="toggleSection('prices')"
        class="w-full flex items-center justify-between p-4 text-right hover:bg-surface-ground/50 transition-colors"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-text-primary">
                قوائم الأسعار المتقدمة وشرائح الكميات
              </h3>
              <span
                v-if="customPricesCount > 0"
                class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
              >
                {{ customPricesCount }} قاعدة سعرية
              </span>
            </div>
            <p class="text-xs text-text-muted mt-0.5">
              تخصيص أسعار خاصة لعملاء الجملة والموزعين أو تحديد خصومات كميات الشراء.
            </p>
          </div>
        </div>
        <div
          class="text-text-muted transition-transform duration-200"
          :class="{ 'rotate-180': openSections.prices }"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div
        v-show="openSections.prices"
        class="p-4 pt-0 border-t border-surface-border/50 space-y-4"
      >
        <div
          v-for="(u, unitIdx) in modelValue.units"
          :key="unitIdx"
          class="p-4 mt-3 rounded-xl border border-surface-border bg-surface-ground/30 space-y-3"
        >
          <div class="flex justify-between items-center border-b border-surface-border pb-2.5">
            <h4 class="font-bold text-xs text-text-primary flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              قوائم أسعار:
              <span class="text-blue-600 dark:text-sky-400 font-bold">
                {{ getUnitName(u.unit_id) || `وحدة رقم ${unitIdx + 1}` }}
              </span>
              <span v-if="u.is_base_unit" class="text-[11px] text-text-muted font-normal"
                >(الوحدة الأساسية)</span
              >
            </h4>
            <button
              type="button"
              @click="addPriceToUnit(unitIdx)"
              class="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>+ إضافة قائمة سعر</span>
            </button>
          </div>

          <div
            v-if="!u.prices || u.prices.length === 0"
            class="text-xs text-text-muted italic py-1"
          >
            لا توجد أسعار مخصصة إضافية لهذه الوحدة (يتم اعتماد السعر المباشر).
          </div>

          <div
            v-for="(p, priceIdx) in u.prices"
            :key="priceIdx"
            class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-xl border border-surface-border bg-surface-section"
          >
            <div class="md:col-span-5">
              <AppDropdown
                :id="`adv-u-${unitIdx}-price-list-${priceIdx}`"
                label="قائمة السعر *"
                :model-value="p.price_list_id"
                :options="priceLists"
                option-label="name"
                option-value="id"
                placeholder="اختر القائمة..."
                @update:model-value="updateUnitPriceRow(unitIdx, priceIdx, 'price_list_id', $event)"
              />
            </div>

            <div class="md:col-span-3">
              <AppInput
                :id="`adv-u-${unitIdx}-min-qty-${priceIdx}`"
                type="number"
                label="الحد الأدنى للكمية *"
                :model-value="p.min_quantity"
                @update:model-value="updateUnitPriceRow(unitIdx, priceIdx, 'min_quantity', $event)"
                placeholder="1.0000"
              />
            </div>

            <div class="md:col-span-3">
              <AppInput
                :id="`adv-u-${unitIdx}-price-${priceIdx}`"
                type="number"
                label="سعر البيع *"
                :model-value="p.price"
                @update:model-value="updateUnitPriceRow(unitIdx, priceIdx, 'price', $event)"
                placeholder="0.0000"
              />
            </div>

            <div class="md:col-span-1 text-left">
              <button
                type="button"
                @click="removeUnitPriceRow(unitIdx, priceIdx)"
                class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                title="حذف السعر"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- القسم الثالث: حد الأمان وقواعد إعادة الطلب بالمستودعات -->
    <!-- ========================================================= -->
    <div
      v-if="modelValue.type !== 'service'"
      class="border border-surface-border rounded-2xl bg-surface-section overflow-hidden transition-all duration-200"
    >
      <button
        type="button"
        @click="toggleSection('reorder')"
        class="w-full flex items-center justify-between p-4 text-right hover:bg-surface-ground/50 transition-colors"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-text-primary">
                حد الأمان وإعادة الطلب بالمستودعات
              </h3>
              <span
                v-if="reorderRulesCount > 0"
                class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
              >
                {{ reorderRulesCount }} مستودع محدد
              </span>
            </div>
            <p class="text-xs text-text-muted mt-0.5">
              تنبيهات تلقائية لنواقص المخزون وتحديد الحد الأدنى والكمية الموصى بها لكل مستودع.
            </p>
          </div>
        </div>
        <div
          class="text-text-muted transition-transform duration-200"
          :class="{ 'rotate-180': openSections.reorder }"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div
        v-show="openSections.reorder"
        class="p-4 pt-0 border-t border-surface-border/50 space-y-4"
      >
        <div class="flex justify-between items-center pt-3">
          <p class="text-xs text-text-muted">
            حدد قواعد الأمان (الحد الأدنى والأقصى) ليقوم النظام بتنبيه إدارة المشتريات:
          </p>
          <button
            type="button"
            @click="addReorderRule"
            class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1 shrink-0"
          >
            <span>+ إضافة مستودع</span>
          </button>
        </div>

        <div
          v-if="!modelValue.reorder_rules || modelValue.reorder_rules.length === 0"
          class="text-center py-6 text-text-muted border border-dashed border-surface-border rounded-xl text-xs"
        >
          لا توجد قواعد إعادة طلب معرفة لهذا الصنف حتى الآن.
        </div>

        <div
          v-for="(r, ruleIdx) in modelValue.reorder_rules"
          :key="ruleIdx"
          class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-xl border border-surface-border bg-surface-ground/30"
        >
          <div class="md:col-span-4">
            <AppDropdown
              :id="`adv-reorder-wh-${ruleIdx}`"
              label="المستودع *"
              :model-value="r.warehouse_id"
              :options="warehouses"
              option-label="name"
              option-value="id"
              placeholder="اختر المستودع..."
              @update:model-value="updateReorderRule(ruleIdx, 'warehouse_id', $event)"
            />
          </div>

          <div class="md:col-span-2">
            <AppInput
              :id="`adv-reorder-min-${ruleIdx}`"
              type="number"
              label="حد الأمان (Min) *"
              :model-value="r.min_quantity"
              @update:model-value="updateReorderRule(ruleIdx, 'min_quantity', $event)"
              placeholder="0.0000"
            />
          </div>

          <div class="md:col-span-2">
            <AppInput
              :id="`adv-reorder-max-${ruleIdx}`"
              type="number"
              label="الحد الأقصى (Max) *"
              :model-value="r.max_quantity"
              @update:model-value="updateReorderRule(ruleIdx, 'max_quantity', $event)"
              placeholder="0.0000"
            />
          </div>

          <div class="md:col-span-3">
            <AppInput
              :id="`adv-reorder-qty-${ruleIdx}`"
              type="number"
              label="كمية إعادة الطلب *"
              :model-value="r.reorder_quantity"
              @update:model-value="updateReorderRule(ruleIdx, 'reorder_quantity', $event)"
              placeholder="0.0000"
            />
          </div>

          <div class="md:col-span-1 text-left">
            <button
              type="button"
              @click="removeReorderRule(ruleIdx)"
              class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              title="حذف القاعدة"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- القسم الرابع: السياسات المخزنية والتقييم المالي -->
    <!-- ========================================================= -->
    <div
      v-if="modelValue.type !== 'service'"
      class="border border-surface-border rounded-2xl bg-surface-section overflow-hidden transition-all duration-200"
    >
      <button
        type="button"
        @click="toggleSection('policies')"
        class="w-full flex items-center justify-between p-4 text-right hover:bg-surface-ground/50 transition-colors"
      >
        <div class="flex items-center gap-3.5">
          <div
            class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-text-primary">السياسات المخزنية والتقييم المالي</h3>
              <span
                v-if="hasCustomPolicies"
                class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300"
              >
                مُخصّص
              </span>
            </div>
            <p class="text-xs text-text-muted mt-0.5">
              طريقة التقييم المالي (AVCO, FIFO)، تتبع الدفعات وتواريخ الصلاحية، وأرقام القطع
              البديلة.
            </p>
          </div>
        </div>
        <div
          class="text-text-muted transition-transform duration-200"
          :class="{ 'rotate-180': openSections.policies }"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div
        v-show="openSections.policies"
        class="p-4 pt-0 border-t border-surface-border/50 space-y-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
          <div>
            <AppDropdown
              id="adv-product-valuation"
              label="طريقة التقييم المالي *"
              :model-value="modelValue.valuation_method"
              :options="[
                { id: 'avco', name: 'المتوسط المتحرك (AVCO)' },
                { id: 'fifo', name: 'الوارد أولاً يصرف أولاً (FIFO)' },
                { id: 'standard', name: 'التكلفة المعيارية (Standard)' },
              ]"
              @update:model-value="updateField('valuation_method', $event)"
            />
          </div>

          <div>
            <AppDropdown
              id="adv-product-tracking"
              label="طريقة التتبع المخزني *"
              :model-value="modelValue.tracking_type"
              :options="[
                { id: 'none', name: 'بدون تتبع' },
                { id: 'by_batch', name: 'بالدفعة / التشغيلة (Batch)' },
                { id: 'by_serial', name: 'بالرقم التسلسلي (Serial)' },
              ]"
              @update:model-value="updateField('tracking_type', $event)"
            />
          </div>

          <div>
            <AppDropdown
              id="adv-product-policy"
              label="سياسة الخصم من المخزون *"
              :model-value="modelValue.inventory_policy"
              :options="[
                { id: 'direct_deduction', name: 'خصم مباشر عند العمليات' },
                { id: 'auto_deduct_bom_on_sale', name: 'خصم تلقائي للمكونات (BOM)' },
                { id: 'production_order_required', name: 'يتطلب أمر تشغيل / إنتاج' },
              ]"
              @update:model-value="updateField('inventory_policy', $event)"
            />
          </div>
        </div>

        <div>
          <AppInput
            id="adv-product-aliases"
            type="text"
            label="الأسماء البديلة / أرقام القطع التجارية (Aliases)"
            :model-value="modelValue.aliases"
            @update:model-value="updateField('aliases', $event)"
            placeholder="أرقام القطع لدى الموردين، الاسم الشائع، أو رموز بديلة لتسريع البحث في الفواتير..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  unitsList: { type: Array, default: () => [] },
  priceLists: { type: Array, default: () => [] },
  warehouses: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const openSections = ref({
  units: false,
  prices: false,
  reorder: false,
  policies: false,
})

const toggleSection = (sectionKey) => {
  openSections.value[sectionKey] = !openSections.value[sectionKey]
}

// استخراج الوحدات الإضافية فقط (مع الاحتفاظ بالمؤشر الحقيقي index في مصفوفة units)
const additionalUnitsList = computed(() => {
  if (!props.modelValue.units) return []
  return props.modelValue.units
    .map((unit, index) => ({ unit, index }))
    .filter((item) => !item.unit.is_base_unit)
})

const customPricesCount = computed(() => {
  if (!props.modelValue.units) return 0
  return props.modelValue.units.reduce((acc, u) => acc + (u.prices?.length || 0), 0)
})

const reorderRulesCount = computed(() => {
  return props.modelValue.reorder_rules?.length || 0
})

const hasCustomPolicies = computed(() => {
  return (
    props.modelValue.valuation_method !== 'avco' ||
    props.modelValue.tracking_type !== 'none' ||
    props.modelValue.inventory_policy !== 'direct_deduction' ||
    Boolean(props.modelValue.aliases?.trim())
  )
})

// الفحص التلقائي لفتح الأقسام في شاشة التعديل
onMounted(() => {
  if (additionalUnitsList.value.length > 0) openSections.value.units = true
  if (customPricesCount.value > 0) openSections.value.prices = true
  if (reorderRulesCount.value > 0) openSections.value.reorder = true
  if (hasCustomPolicies.value) openSections.value.policies = true
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const getUnitName = (unitId) => {
  if (!unitId) return ''
  const found = props.unitsList.find((u) => u.id === Number(unitId))
  return found ? found.name : ''
}

const getUnitBasePrice = (unit) => {
  if (!unit.prices || unit.prices.length === 0) return 0
  return unit.prices[0].price || 0
}

const setUnitBasePrice = (unitIdx, priceValue) => {
  const updatedUnits = [...props.modelValue.units]
  const currentPrices = [...(updatedUnits[unitIdx].prices || [])]
  const defaultPriceListId = props.priceLists[0]?.id || null

  if (currentPrices.length === 0) {
    currentPrices.push({
      price_list_id: defaultPriceListId,
      price: Number(priceValue) || 0,
      min_quantity: 1,
    })
  } else {
    currentPrices[0] = {
      ...currentPrices[0],
      price_list_id: currentPrices[0].price_list_id || defaultPriceListId,
      price: Number(priceValue) || 0,
      min_quantity: currentPrices[0].min_quantity || 1,
    }
  }

  updatedUnits[unitIdx] = {
    ...updatedUnits[unitIdx],
    prices: currentPrices,
  }
  updateField('units', updatedUnits)
}

// إضافة وحدة إضافية
const addUnitRow = () => {
  const defaultPriceListId = props.priceLists[0]?.id || null
  const newUnits = [
    ...props.modelValue.units,
    {
      unit_id: null,
      conversion_factor: 12,
      is_base_unit: false,
      is_purchase_unit: true,
      is_sale_unit: props.modelValue.can_be_sold ?? true,
      barcodes: [''],
      prices: defaultPriceListId
        ? [{ price_list_id: defaultPriceListId, price: 0, min_quantity: 1 }]
        : [],
    },
  ]
  updateField('units', newUnits)
}

const updateUnitRow = (index, field, value) => {
  const updatedUnits = [...props.modelValue.units]
  updatedUnits[index] = { ...updatedUnits[index], [field]: value }
  updateField('units', updatedUnits)
}

const removeUnitRow = (index) => {
  const updatedUnits = props.modelValue.units.filter((_, i) => i !== index)
  updateField('units', updatedUnits)
}

// أسعار الوحدات المتقدمة
const addPriceToUnit = (unitIdx) => {
  const updatedUnits = [...props.modelValue.units]
  const currentPrices = updatedUnits[unitIdx].prices || []
  updatedUnits[unitIdx].prices = [
    ...currentPrices,
    { price_list_id: null, price: 0, min_quantity: 1 },
  ]
  updateField('units', updatedUnits)
}

const updateUnitPriceRow = (unitIdx, priceIdx, field, value) => {
  const updatedUnits = [...props.modelValue.units]
  const updatedPrices = [...updatedUnits[unitIdx].prices]
  updatedPrices[priceIdx] = { ...updatedPrices[priceIdx], [field]: value }
  updatedUnits[unitIdx].prices = updatedPrices
  updateField('units', updatedUnits)
}

const removeUnitPriceRow = (unitIdx, priceIdx) => {
  const updatedUnits = [...props.modelValue.units]
  updatedUnits[unitIdx].prices = updatedUnits[unitIdx].prices.filter((_, i) => i !== priceIdx)
  updateField('units', updatedUnits)
}

// قواعد إعادة الطلب
const addReorderRule = () => {
  const currentRules = props.modelValue.reorder_rules || []
  const updatedRules = [
    ...currentRules,
    { warehouse_id: null, min_quantity: 0, max_quantity: 0, reorder_quantity: 0, is_active: true },
  ]
  updateField('reorder_rules', updatedRules)
}

const updateReorderRule = (ruleIdx, field, value) => {
  const updatedRules = [...(props.modelValue.reorder_rules || [])]
  updatedRules[ruleIdx] = { ...updatedRules[ruleIdx], [field]: value }
  updateField('reorder_rules', updatedRules)
}

const removeReorderRule = (ruleIdx) => {
  const updatedRules = props.modelValue.reorder_rules.filter((_, i) => i !== ruleIdx)
  updateField('reorder_rules', updatedRules)
}
</script>
