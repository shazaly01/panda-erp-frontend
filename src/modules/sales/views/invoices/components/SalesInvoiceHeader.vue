<!-- src/modules/sales/views/invoices/components/SalesInvoiceHeader.vue -->
<template>
  <div
    class="bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs text-right font-sans transition-all duration-200"
    :class="isHeaderCollapsed ? 'px-3 py-2' : 'p-3 space-y-2.5'"
    dir="rtl"
  >
    <!-- 1. وضع الطي المدمج: شريط ملخص ذكي يعرض القيم النشطة بنظرة خاطفة -->
    <div
      v-if="isHeaderCollapsed"
      @click="toggleHeaderCollapse"
      class="flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none group"
      title="انقر لتوسيع وتعديل بيانات رأس الفاتورة"
    >
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- شارة المستودع -->
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs transition-colors"
          :class="
            selectedWarehouseName
              ? 'bg-surface-card border-surface-border text-text-primary'
              : 'bg-danger/10 border-danger/30 text-danger'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span>{{ selectedWarehouseName || 'المستودع غير محدد' }}</span>
        </span>

        <!-- شارة العميل -->
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs transition-colors"
          :class="
            selectedCustomerName
              ? 'bg-surface-card border-surface-border text-text-primary'
              : 'bg-danger/10 border-danger/30 text-danger'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>{{ selectedCustomerName || 'العميل غير محدد' }}</span>
          <span v-if="formData.customer_name_text" class="text-text-secondary font-medium">
            ({{ formData.customer_name_text }})
          </span>
          <span
            v-if="selectedCustomerPriceListName"
            class="text-[10px] px-1.5 py-0.2 bg-success/15 text-success rounded font-bold"
          >
            {{ selectedCustomerPriceListName }}
          </span>
        </span>

        <!-- شارة وجهة التحصيل (البنك / الصندوق / آجل) -->
        <span
          v-if="showBankSelector && !showBoxSelector"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs"
          :class="
            selectedBankAccountName
              ? 'bg-surface-card border-primary/35 text-text-primary'
              : 'bg-warning/15 border-warning/40 text-warning'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            />
          </svg>
          <span>{{ selectedBankAccountName || 'اختر الحساب البنكي' }}</span>
        </span>

        <span
          v-else-if="showBoxSelector && !showBankSelector"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs"
          :class="
            selectedBoxName
              ? 'bg-surface-card border-primary/35 text-text-primary'
              : 'bg-warning/15 border-warning/40 text-warning'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>{{ selectedBoxName || 'اختر الصندوق النقدي' }}</span>
        </span>

        <span
          v-else-if="showBoxSelector && showBankSelector"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-primary/35 text-text-primary text-[11px] font-bold shadow-2xs"
        >
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>
            مقسّم: {{ selectedBoxName || 'صندوق' }} + {{ selectedBankAccountName || 'بنك' }}
          </span>
        </span>

        <span
          v-else
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card/70 border border-dashed border-surface-border text-text-muted text-[11px] font-bold"
        >
          <span>دفع آجل على العميل</span>
        </span>

        <!-- شارة التاريخ ونوع الطلب -->
        <span
          class="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-card/75 border border-surface-border/70 text-text-secondary text-[11px] font-mono font-bold"
        >
          <span>{{ formData.invoice_date }}</span>
          <span class="text-text-muted font-sans">• {{ selectedOrderTypeLabel }}</span>
        </span>
      </div>

      <!-- زر التوسيع -->
      <button
        type="button"
        @click.stop="toggleHeaderCollapse"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-card group-hover:bg-primary group-hover:text-white border border-surface-border group-hover:border-primary text-text-secondary text-[11px] font-bold transition-colors shadow-2xs cursor-pointer shrink-0"
      >
        <span>تعديل الرأس</span>
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- 2. وضع التوسيع الكامل: حقول الترويسة المعتادة مع زر الطي -->
    <template v-else>
      <!-- شريط علوي رفيع لطي الترويسة -->
      <div class="flex items-center justify-between pb-1 border-b border-primary/15">
        <span class="text-[11px] font-black text-text-secondary flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
          بيانات المستودع والعميل والتحصيل
        </span>

        <button
          type="button"
          @click="toggleHeaderCollapse"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-card/80 hover:bg-primary hover:text-white border border-surface-border hover:border-primary text-text-secondary text-[10px] font-bold transition-colors cursor-pointer"
          title="طي بيانات الرأس لتوفير مساحة أكبر للأصناف وحفظ الوضع"
        >
          <span>طي الترويسة</span>
          <svg class="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- الصف الأول: 4 أعمدة متساوية (المستودع + التاريخ + نوع الطلب + الصندوق/الحساب البنكي) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <!-- 1. المستودع المستهدف -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <div class="w-full h-full pr-8 pl-1 flex items-center">
              <WarehouseDropdown
                id="invoice-warehouse-id"
                v-model="formData.warehouse_id"
                label=""
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>
          <p
            v-if="getFieldError('warehouse_id')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('warehouse_id') }}
          </p>
        </div>

        <!-- 2. تاريخ الفاتورة -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <input
              type="date"
              v-model="formData.invoice_date"
              class="block w-full h-full pr-3 pl-16 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
            />

            <span
              class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none gap-1 text-xs z-10"
            >
              <span class="font-medium text-[10px]">تاريخ</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
          <p
            v-if="getFieldError('invoice_date')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('invoice_date') }}
          </p>
        </div>

        <!-- 3. نوع الطلب / البيع -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>

            <select
              v-model="formData.order_type"
              class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="standard" class="bg-surface-section text-text-primary">
                بيع مباشر (Standard)
              </option>
              <option value="dine_in" class="bg-surface-section text-text-primary">
                صالة / محلي (Dine-in)
              </option>
              <option value="takeaway" class="bg-surface-section text-text-primary">
                سفري (Takeaway)
              </option>
              <option value="delivery" class="bg-surface-section text-text-primary">
                توصيل (Delivery)
              </option>
            </select>

            <span
              class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
            >
              ▼
            </span>
          </div>
          <p
            v-if="getFieldError('order_type')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('order_type') }}
          </p>
        </div>

        <!-- 4. حسابات القبض التلقائية (الصندوق النقدي أو الحساب البنكي) -->
        <div class="relative w-full">
          <!-- الصندوق النقدي عند الدفع نقداً أو وجود مبلغ نقدي في التقسيم -->
          <div
            v-if="showBoxSelector && !showBankSelector"
            class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <div class="w-full h-full pr-8 pl-1 flex items-center">
              <AppDropdown
                id="invoice-box-id"
                v-model="formData.box_id"
                :options="boxStore.boxes"
                option-label="name"
                option-value="id"
                placeholder="اختر الصندوق النقدي..."
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <!-- الحساب البنكي عند الدفع البنكي -->
          <div
            v-else-if="showBankSelector && !showBoxSelector"
            class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </span>
            <div class="w-full h-full pr-8 pl-1 flex items-center">
              <AppDropdown
                id="invoice-bank-account-id"
                v-model="formData.bank_account_id"
                :options="bankAccountStore.bankAccounts"
                option-label="name"
                option-value="id"
                placeholder="اختر الحساب البنكي..."
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <!-- عرض مزدوج عند تقسيم الدفع بين نقد وبنك معاً -->
          <div v-else-if="showBoxSelector && showBankSelector" class="grid grid-cols-2 gap-1.5">
            <div
              class="relative h-9 bg-surface-card border border-primary/50 rounded-lg flex items-center overflow-hidden"
              title="الصندوق النقدي"
            >
              <AppDropdown
                id="invoice-split-box-id"
                v-model="formData.box_id"
                :options="boxStore.boxes"
                option-label="name"
                option-value="id"
                placeholder="الصندوق..."
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
            <div
              class="relative h-9 bg-surface-card border border-primary/50 rounded-lg flex items-center overflow-hidden"
              title="الحساب البنكي"
            >
              <AppDropdown
                id="invoice-split-bank-id"
                v-model="formData.bank_account_id"
                :options="bankAccountStore.bankAccounts"
                option-label="name"
                option-value="id"
                placeholder="البنك..."
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <!-- حالة الدفع الآجل الكامل -->
          <div
            v-else
            class="relative w-full h-9 bg-surface-card/60 border border-dashed border-surface-border rounded-lg flex items-center justify-center text-text-muted text-[11px] font-medium select-none px-2 text-center"
          >
            <span>دفع آجل على حساب العميل</span>
          </div>

          <p
            v-if="
              getFieldError('payments') ||
              getFieldError('payments.0.box_id') ||
              getFieldError('payments.0.bank_account_id')
            "
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{
              getFieldError('payments') ||
              getFieldError('payments.0.box_id') ||
              getFieldError('payments.0.bank_account_id')
            }}
          </p>
        </div>
      </div>

      <!-- الصف الثاني: 4 أعمدة متوازية تماماً مع الصف الأول (هاتف العميل + قائمة العميل على عمودين + اسم العميل النصي) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-0.5">
        <!-- 1. فحص العميل برقم الهاتف -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </span>

            <input
              type="text"
              v-model="customerPhone"
              @keydown.enter.prevent="checkCustomerPhone"
              placeholder="هاتف العميل (Enter للفحص)..."
              class="block w-full h-full pr-8 pl-14 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-medium"
            />

            <button
              type="button"
              @click="checkCustomerPhone"
              :disabled="isCheckingPhone || !customerPhone.trim()"
              class="absolute left-1 px-2.5 py-1 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="فحص وجود العميل برقم الهاتف أو إضافته"
            >
              <svg
                v-if="isCheckingPhone"
                class="animate-spin w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span v-else>فحص</span>
            </button>
          </div>
        </div>

        <!-- 2. قائمة اختيار العميل (تمتد على عمودين لتوازي التاريخ ونوع الطلب) -->
        <div class="relative w-full flex flex-col justify-center sm:col-span-2 lg:col-span-2">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>

            <div class="w-full h-full pr-8 pl-1 flex items-center">
              <AppDropdown
                id="invoice-partner-id"
                v-model="formData.partner_id"
                :options="customerOptions"
                option-label="displayLabel"
                option-value="id"
                placeholder="اختر حساب العميل..."
                filter-placeholder="ابحث بالاسم أو الهاتف..."
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <div
            v-if="selectedCustomerPriceListName"
            class="mt-1 flex items-center gap-1 animate-fade-in pr-1"
          >
            <span class="inline-block w-1.5 h-1.5 bg-success rounded-full"></span>
            <span class="text-[10px] text-success font-bold">
              فئة السعر: {{ selectedCustomerPriceListName }}
            </span>
          </div>

          <p
            v-if="getFieldError('partner_id')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('partner_id') }}
          </p>
        </div>

        <!-- 3. اسم العميل النصي الحر -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </span>

            <input
              type="text"
              v-model="formData.customer_name_text"
              placeholder="اسم العميل (نص حر - اختياري)"
              class="block w-full h-full pr-8 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-medium"
            />
          </div>
          <p
            v-if="getFieldError('customer_name_text')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('customer_name_text') }}
          </p>
        </div>
      </div>
    </template>

    <!-- نافذة إضافة عميل جديد السريعة (مدمجة لعدم الحاجة لملف خارجي) -->
    <Teleport to="body">
      <div
        v-if="isQuickCustomerModalOpen"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        dir="rtl"
        @click.self="isQuickCustomerModalOpen = false"
      >
        <div
          class="w-full max-w-md bg-surface-section border border-surface-border rounded-2xl shadow-2xl overflow-hidden text-right font-sans"
        >
          <div
            class="px-4 py-3 bg-surface-header border-b border-surface-border flex items-center justify-between"
          >
            <h3 class="text-sm font-black text-text-primary flex items-center gap-2">
              <span class="w-2 h-4 bg-primary rounded-full"></span>
              <span>تسجيل عميل جديد سريع</span>
            </h3>
            <button
              type="button"
              @click="isQuickCustomerModalOpen = false"
              class="text-text-muted hover:text-text-primary p-1 rounded-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="handleSaveNewCustomer" class="p-4 space-y-3 text-xs">
            <div>
              <label class="block font-bold text-text-secondary mb-1">
                اسم العميل <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                v-model="quickCustomerForm.name"
                required
                placeholder="أدخل اسم العميل..."
                class="w-full h-9 px-3 bg-surface-card border border-surface-border rounded-lg text-text-primary font-bold focus:border-primary outline-none"
              />
            </div>

            <div>
              <label class="block font-bold text-text-secondary mb-1">
                رقم الهاتف <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                v-model="quickCustomerForm.phone"
                required
                placeholder="09xxxxxxxx"
                class="w-full h-9 px-3 bg-surface-card border border-surface-border rounded-lg text-text-primary font-mono font-bold focus:border-primary outline-none"
              />
            </div>

            <div>
              <label class="block font-bold text-text-secondary mb-1">العنوان / ملاحظات</label>
              <input
                type="text"
                v-model="quickCustomerForm.address"
                placeholder="اختياري..."
                class="w-full h-9 px-3 bg-surface-card border border-surface-border rounded-lg text-text-primary focus:border-primary outline-none"
              />
            </div>

            <div class="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
              <button
                type="button"
                @click="isQuickCustomerModalOpen = false"
                class="px-3 py-1.5 rounded-lg border border-surface-border text-text-secondary hover:text-text-primary font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                :disabled="isSavingCustomer"
                class="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {{ isSavingCustomer ? 'جاري الحفظ...' : 'حفظ واختيار للفاتورة' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useCustomerStore } from '@/modules/sales/stores/customerStore'
import { useWarehouseStore } from '@/modules/inventory/stores/warehouseStore'
import { useBoxStore } from '@/modules/accounting/stores/boxStore'
import { useBankAccountStore } from '@/modules/accounting/stores/bankAccountStore'
import { useToast } from 'vue-toastification'

import WarehouseDropdown from '@/modules/inventory/forms/WarehouseDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
  isPos: { type: Boolean, default: false },
})

const customerStore = useCustomerStore()
const warehouseStore = useWarehouseStore()
const boxStore = useBoxStore()
const bankAccountStore = useBankAccountStore()
const toast = useToast()

// إدارة طي الترويسة وحفظ الحالة في المتصفح حسب الوضع (POS / قياسية)
const isPosMode = computed(() => Boolean(props.isPos || formData.value?.channel === 'pos'))
const storageKey = computed(() =>
  isPosMode.value ? 'erp_pos_header_collapsed' : 'erp_standard_header_collapsed',
)

const isHeaderCollapsed = ref(false)

const loadCollapsedPreference = () => {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (saved !== null) {
      isHeaderCollapsed.value = saved === 'true'
    }
  } catch (error) {
    console.warn('تعذر قراءة حالة طي الترويسة من المتصفح:', error)
  }
}

const toggleHeaderCollapse = () => {
  isHeaderCollapsed.value = !isHeaderCollapsed.value
  try {
    localStorage.setItem(storageKey.value, String(isHeaderCollapsed.value))
  } catch (error) {
    console.warn('تعذر حفظ حالة طي الترويسة في المتصفح:', error)
  }
}

onMounted(() => {
  loadCollapsedPreference()
})

watch(storageKey, () => {
  loadCollapsedPreference()
})

// الفتح التلقائي للترويسة إذا ظهرت أخطاء تحقق في أي حقل من حقول الرأس
watch(
  () => props.validationErrors,
  (errors) => {
    if (!errors) return
    const headerErrorKeys = [
      'warehouse_id',
      'invoice_date',
      'order_type',
      'partner_id',
      'customer_name_text',
      'payments',
      'payments.0.box_id',
      'payments.0.bank_account_id',
      'payments.1.box_id',
      'payments.1.bank_account_id',
    ]
    const hasHeaderError = headerErrorKeys.some(
      (key) => Array.isArray(errors[key]) && errors[key].length > 0,
    )
    if (hasHeaderError) {
      isHeaderCollapsed.value = false
    }
  },
  { deep: true },
)

const showBoxSelector = computed(() => {
  return formData.value.payment_mode === 'cash' || Number(formData.value.cash_amount ?? 0) > 0
})

const showBankSelector = computed(() => {
  return formData.value.payment_mode === 'bank' || Number(formData.value.bank_amount ?? 0) > 0
})

const customerOptions = computed(() => {
  const source =
    customerStore.selectorCustomers?.length > 0
      ? customerStore.selectorCustomers
      : customerStore.customers || []

  return source.map((c) => ({
    ...c,
    displayLabel: c.phone ? `${c.name} (${c.phone})` : c.name,
  }))
})

const selectedWarehouseName = computed(() => {
  const id = Number(formData.value?.warehouse_id)
  if (!id) return null
  const found = warehouseStore.warehouses?.find((w) => Number(w.id) === id)
  return found?.name || `المخزن #${id}`
})

const selectedCustomerName = computed(() => {
  const id = Number(formData.value?.partner_id)
  if (!id) return null
  const found = customerOptions.value.find((c) => Number(c.id) === id)
  return found?.name || `عميل #${id}`
})

const selectedBoxName = computed(() => {
  const id = Number(formData.value?.box_id)
  if (!id) return null
  const found = boxStore.boxes?.find((b) => Number(b.id) === id)
  return found?.name || `صندوق #${id}`
})

const selectedBankAccountName = computed(() => {
  const id = Number(formData.value?.bank_account_id)
  if (!id) return null
  const found = bankAccountStore.bankAccounts?.find((b) => Number(b.id) === id)
  return found?.name || `حساب بنكي #${id}`
})

const orderTypeLabels = {
  standard: 'بيع مباشر',
  dine_in: 'صالة / محلي',
  takeaway: 'سفري',
  delivery: 'توصيل',
}

const selectedOrderTypeLabel = computed(() => {
  return orderTypeLabels[formData.value?.order_type] || 'بيع مباشر'
})

const customerPhone = ref('')
const isCheckingPhone = ref(false)
const isQuickCustomerModalOpen = ref(false)
const isSavingCustomer = ref(false)
const quickCustomerForm = ref({
  name: '',
  phone: '',
  address: '',
})

const checkCustomerPhone = async () => {
  const phone = customerPhone.value?.trim()
  if (!phone) {
    toast.warning('يرجى إدخال رقم الهاتف أولاً لإجراء الفحص.')
    return
  }

  isCheckingPhone.value = true
  try {
    const result = await customerStore.findCustomerByPhone(phone)
    if (result?.found && result?.data) {
      formData.value.partner_id = result.data.id
      toast.success(`تم العثور على العميل "${result.data.name}" واختياره للفاتورة.`)
    } else {
      toast.info('العميل غير مسجل، يمكنك تسجيله الآن.')
      quickCustomerForm.value = {
        name: '',
        phone: phone,
        address: '',
      }
      isQuickCustomerModalOpen.value = true
    }
  } catch (error) {
    console.error('خطأ أثناء فحص رقم هاتف العميل:', error)
    toast.error('تعذر استكمال فحص رقم الهاتف، حاول مرة أخرى.')
  } finally {
    isCheckingPhone.value = false
  }
}

const handleSaveNewCustomer = async () => {
  if (!quickCustomerForm.value.name?.trim()) {
    toast.warning('يرجى إدخال اسم العميل.')
    return
  }

  isSavingCustomer.value = true
  try {
    const response = await customerStore.createCustomer({
      name: quickCustomerForm.value.name.trim(),
      phone: quickCustomerForm.value.phone.trim(),
      address: quickCustomerForm.value.address?.trim() || null,
      is_active: true,
    })

    const createdCustomer = response?.data || response
    if (createdCustomer && createdCustomer.id) {
      await customerStore.fetchCustomersSelector(true)
      formData.value.partner_id = createdCustomer.id
      customerPhone.value = createdCustomer.phone || customerPhone.value
      toast.success(`تم تسجيل العميل "${createdCustomer.name}" وتعيينه للفاتورة.`)
    }

    isQuickCustomerModalOpen.value = false
  } catch (error) {
    toast.error(customerStore.error || 'فشل في تسجيل بيانات العميل الجديد.')
  } finally {
    isSavingCustomer.value = false
  }
}

watch(
  () => formData.value.partner_id,
  (newId) => {
    if (newId) {
      const currentCust = customerOptions.value.find((c) => c.id === Number(newId))
      if (currentCust && currentCust.phone && !customerPhone.value) {
        customerPhone.value = currentCust.phone
      }
    }
  },
)

const selectedCustomerPriceListName = computed(() => {
  if (!formData.value.partner_id) return null
  const currentCust = customerOptions.value.find((c) => c.id === Number(formData.value.partner_id))
  return (
    currentCust?.price_list_name ||
    currentCust?.price_list?.name ||
    (currentCust?.price_list_id ? `فئة #${currentCust.price_list_id}` : null)
  )
})

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

:deep(.header-embedded-dropdown .p-dropdown),
:deep(.header-embedded-dropdown [data-pc-name='dropdown']),
:deep(.header-embedded-dropdown [data-pc-section='root']),
:deep(.header-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 36px !important;
  min-height: 36px !important;
}

:deep(.header-embedded-dropdown .p-dropdown-label),
:deep(.header-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
