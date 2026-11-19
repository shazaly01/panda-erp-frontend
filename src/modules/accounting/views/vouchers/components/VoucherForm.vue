<!--src/modules/accounting/views/vouchers/components/VoucherForm.vue-->
<template>
  <form @submit.prevent="handleSubmit(false)" class="space-y-3.5 font-sans text-right" dir="rtl">
    <!-- تنبيه يظهر فقط عند تعديل سند مُرحّل مسبقاً -->
    <div
      v-if="isPostedEdit"
      class="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500/12 text-amber-700 dark:text-amber-300 border border-amber-500/30"
    >
      <span>تعديل مباشر لسند مُرحّل — سيتم تحديث القيد المحاسبي المرتبط بنفس الرقم.</span>
    </div>

    <!-- البطاقة 1: الطرف الأول (طريقة الدفع + الخزينة/البنك + التاريخ + الفرع) -->
    <div
      class="voucher-card bg-surface-section/70 border border-surface-border p-4 rounded-xl space-y-3.5 transition-all duration-200"
    >
      <!-- حالة الدفع النقدي (خزينة) -->
      <div
        v-if="paymentMethodType === 'box'"
        class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start"
      >
        <!-- طريقة الدفع -->
        <div class="md:col-span-3 flex flex-col">
          <label class="block text-xs font-bold text-text-secondary mb-1.5">طريقة الدفع *</label>
          <div
            class="grid grid-cols-2 gap-1 p-1 bg-surface-card border border-surface-border rounded-lg h-[40px] items-center box-border"
          >
            <button
              type="button"
              @click="handlePaymentMethodChange('box')"
              class="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-black transition-all duration-200 select-none cursor-pointer bg-emerald-600 text-white shadow-xs"
            >
              <span class="text-sm">💵</span>
              <span>نقدي</span>
            </button>
            <button
              type="button"
              @click="handlePaymentMethodChange('bank')"
              class="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-black transition-all duration-200 select-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface-ground/70"
            >
              <span class="text-sm">🏦</span>
              <span>بنك</span>
            </button>
          </div>
        </div>

        <!-- الخزينة المحددة + الرصيد الحالي -->
        <div class="md:col-span-4">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <label for="voucher-box" class="block text-xs font-bold text-text-secondary">
              الخزينة المحددة *
            </label>
            <span
              v-if="selectedTreasury"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors"
              :class="
                isBalanceInsufficient
                  ? 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/35'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
              "
            >
              <span class="font-sans opacity-80">الرصيد:</span>
              <span>{{ formatNumber(currentTreasuryBalance) }}</span>
              <span class="text-[10px] opacity-80">{{ selectedTreasuryCurrencyCode }}</span>
            </span>
          </div>
          <AppDropdown
            id="voucher-box"
            v-model="form.box_id"
            :options="boxes"
            option-label="name"
            option-value="id"
            placeholder="اختر الخزينة..."
            class="bg-surface-card"
            required
          />
        </div>

        <!-- تاريخ السند -->
        <div class="md:col-span-3">
          <label for="voucher-date" class="block text-xs font-bold text-text-secondary mb-1.5">
            تاريخ السند *
          </label>
          <AppInput
            id="voucher-date"
            type="date"
            v-model="form.date"
            class="bg-surface-card font-mono font-bold"
            dir="ltr"
            required
          />
          <p v-if="fiscalYearError" class="mt-1 text-xs text-danger font-bold">
            {{ fiscalYearError }}
          </p>
        </div>

        <!-- الفرع -->
        <div class="md:col-span-2">
          <label for="voucher-branch" class="block text-xs font-bold text-text-secondary mb-1.5">
            الفرع *
          </label>
          <AppDropdown
            id="voucher-branch"
            v-model="form.branch_id"
            :options="branches"
            option-label="name"
            option-value="id"
            placeholder="اختر الفرع..."
            class="bg-surface-card"
            required
          />
        </div>
      </div>

      <!-- حالة التحويل البنكي -->
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
          <!-- طريقة الدفع -->
          <div class="md:col-span-4 flex flex-col">
            <label class="block text-xs font-bold text-text-secondary mb-1.5">طريقة الدفع *</label>
            <div
              class="grid grid-cols-2 gap-1 p-1 bg-surface-card border border-surface-border rounded-lg h-[40px] items-center box-border"
            >
              <button
                type="button"
                @click="handlePaymentMethodChange('box')"
                class="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-black transition-all duration-200 select-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-surface-ground/70"
              >
                <span class="text-sm">💵</span>
                <span>نقدي (خزينة)</span>
              </button>
              <button
                type="button"
                @click="handlePaymentMethodChange('bank')"
                class="flex items-center justify-center gap-1.5 h-full rounded-md text-xs font-black transition-all duration-200 select-none cursor-pointer bg-sky-600 text-white shadow-xs"
              >
                <span class="text-sm">🏦</span>
                <span>تحويل (بنك)</span>
              </button>
            </div>
          </div>

          <!-- الحساب البنكي المحدد + الرصيد الحالي -->
          <div class="md:col-span-5">
            <div class="flex items-center justify-between gap-1.5 mb-1.5">
              <label for="voucher-bank" class="block text-xs font-bold text-text-secondary">
                الحساب البنكي *
              </label>
              <span
                v-if="selectedTreasury"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors truncate"
                :class="
                  isBalanceInsufficient
                    ? 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/35'
                    : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25'
                "
              >
                <span class="font-sans opacity-80">الرصيد:</span>
                <span>{{ formatNumber(currentTreasuryBalance) }}</span>
                <span class="text-[10px] opacity-80">{{ selectedTreasuryCurrencyCode }}</span>
              </span>
            </div>
            <AppDropdown
              id="voucher-bank"
              v-model="form.bank_account_id"
              :options="formattedBankAccounts"
              option-label="displayName"
              option-value="id"
              placeholder="اختر الحساب البنكي..."
              class="bg-surface-card"
              required
            />
          </div>

          <!-- رقم الشيك / العملية -->
          <div class="md:col-span-3">
            <label for="bank-ref-number" class="block text-xs font-bold text-text-secondary mb-1.5">
              رقم الشيك / العملية
            </label>
            <AppInput
              id="bank-ref-number"
              type="text"
              v-model="form.bank_ref_number"
              placeholder="رقم الشيك أو الحوالة..."
              class="bg-surface-card"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
          <!-- تاريخ السند -->
          <div class="md:col-span-6">
            <label for="voucher-date" class="block text-xs font-bold text-text-secondary mb-1.5">
              تاريخ السند *
            </label>
            <AppInput
              id="voucher-date"
              type="date"
              v-model="form.date"
              class="bg-surface-card font-mono font-bold"
              dir="ltr"
              required
            />
            <p v-if="fiscalYearError" class="mt-1 text-xs text-danger font-bold">
              {{ fiscalYearError }}
            </p>
          </div>

          <!-- الفرع -->
          <div class="md:col-span-6">
            <label for="voucher-branch" class="block text-xs font-bold text-text-secondary mb-1.5">
              الفرع *
            </label>
            <AppDropdown
              id="voucher-branch"
              v-model="form.branch_id"
              :options="branches"
              option-label="name"
              option-value="id"
              placeholder="اختر الفرع..."
              class="bg-surface-card"
              required
            />
          </div>
        </div>
      </template>
    </div>

    <!-- البطاقة 2: الطرف المقابل والمبلغ ومركز التكلفة (حساب واحد افتراضياً) -->
    <div
      class="voucher-card bg-surface-card/85 border border-primary/35 p-4 rounded-xl shadow-2xs transition-all duration-200"
    >
      <!-- أ) الوضع الافتراضي المبسط: حساب واحد فقط -->
      <div
        v-if="!isMultiAccountMode && singleLine"
        class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start"
      >
        <!-- اختيار الحساب المالي أو الجهة + زر التبديل لتعدد الحسابات -->
        <div class="md:col-span-6">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <label class="block text-xs font-bold text-text-secondary">
              {{ isReceipt ? 'الحساب / جهة القبض *' : 'الحساب / جهة الصرف *' }}
            </label>
            <button
              type="button"
              @click="toggleMultiAccountMode"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer transition-colors"
            >
              <span>+ تعدد الحسابات</span>
            </button>
          </div>

          <!-- وضع البحث -->
          <div v-if="!singleLine.account_id" class="single-account-search w-full">
            <AccountPartySearchGrid
              :placeholder="
                isReceipt
                  ? 'ابحث عن حساب، عميل، أو مصدر الإيراد...'
                  : 'ابحث عن حساب مصروف، مورد، موظف، أو جهة صرف...'
              "
              @select="handleSelectAccount(0, $event)"
            />
          </div>

          <!-- وضع الحساب المختار -->
          <div
            v-else
            class="h-[40px] px-3 rounded-lg border border-surface-border bg-surface-section flex items-center justify-between gap-2"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-[11px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25 shrink-0"
              >
                {{ singleLine.account_code }}
              </span>
              <span
                class="text-xs sm:text-[13px] font-bold text-text-primary truncate"
                :title="singleLine.account_name"
              >
                {{ singleLine.account_name }}
              </span>
              <span
                v-if="singleLine.reference_label"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning/15 text-warning border border-warning/30 shrink-0"
              >
                {{ singleLine.reference_label }}
              </span>
            </div>

            <button
              type="button"
              @click="resetLineAccount(0)"
              class="px-2 py-0.5 text-[11px] font-bold rounded border border-surface-border bg-surface-card hover:border-primary hover:text-primary text-text-secondary transition-colors shrink-0 cursor-pointer"
              title="تغيير الحساب"
            >
              تغيير
            </button>
          </div>
        </div>

        <!-- حقل المبلغ (حقل عملة) -->
        <div class="md:col-span-3">
          <label for="single-amount" class="block text-xs font-bold text-text-secondary mb-1.5">
            المبلغ *
          </label>
          <AppCurrencyInput
            id="single-amount"
            v-model="singleLine.amount"
            :symbol="selectedCurrencyCode"
            placeholder="0.00"
            :input-class="`h-[40px] !bg-surface-section !border-primary/50 focus:!border-primary rounded-lg text-base font-black ${
              isReceipt ? '!text-emerald-600 dark:!text-emerald-400' : '!text-primary'
            }`"
            @keydown.enter.prevent="focusInput('payee-name')"
            required
          />
        </div>

        <!-- مركز التكلفة -->
        <div class="md:col-span-3">
          <label
            for="single-cost-center"
            class="block text-xs font-bold text-text-secondary mb-1.5"
          >
            مركز التكلفة
          </label>
          <div class="relative w-full h-[40px] flex items-center">
            <select
              id="single-cost-center"
              v-model="singleLine.cost_center_id"
              @keydown.enter.prevent="focusInput('payee-name')"
              class="w-full h-[40px] pr-3 pl-7 bg-surface-section border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-text-primary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="" class="bg-surface-section text-text-muted">-- بدون مركز --</option>
              <option
                v-for="cc in costCenters"
                :key="cc.id"
                :value="cc.id"
                class="bg-surface-section text-text-primary font-bold"
              >
                {{ cc.name }}
              </option>
            </select>
            <span
              class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      <!-- ب) وضع تعدد الحسابات (يظهر فقط عند اختيار تعدد الحسابات) -->
      <div
        v-else
        class="invoice-stage-3d rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200"
      >
        <div
          class="px-3.5 py-2 bg-surface-ground/70 border-b border-surface-border flex items-center justify-between gap-2"
        >
          <span class="text-xs font-bold text-text-secondary">
            {{ isReceipt ? 'توزيع المقبوضات على عدة حسابات' : 'توزيع المصروفات على عدة حسابات' }}
          </span>
          <button
            type="button"
            @click="toggleMultiAccountMode"
            class="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            العودة لحساب واحد
          </button>
        </div>

        <div class="overflow-x-auto min-h-[160px] flex flex-col justify-between">
          <table class="w-full border-collapse text-right text-xs">
            <thead class="invoice-thead-3d select-none h-10 tracking-tight">
              <tr>
                <th class="px-3 py-2 w-14 text-center text-slate-400 dark:text-slate-600 font-mono">
                  #
                </th>
                <th
                  class="px-3 py-2 min-w-[240px] text-right font-black text-white dark:text-slate-900 text-[13px]"
                >
                  {{ isReceipt ? 'الحساب المقبوض منه' : 'الحساب المصروف له' }}
                </th>
                <th
                  class="px-3 py-2 min-w-[150px] w-40 text-center font-bold text-slate-200 dark:text-slate-800"
                >
                  مركز التكلفة
                </th>
                <th
                  class="px-3 py-2 min-w-[160px] w-44 text-center font-black text-primary-light dark:text-primary-dark text-[13px]"
                >
                  المبلغ ({{ selectedCurrencyCode }})
                </th>
                <th
                  class="px-3 py-2 min-w-[160px] w-44 text-right font-bold text-slate-200 dark:text-slate-800"
                >
                  ملاحظة السطر
                </th>
                <th class="px-3 py-2 w-12 text-center font-bold text-slate-400 dark:text-slate-600">
                  إجراء
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-surface-border/70">
              <tr
                v-for="(line, index) in form.details"
                :key="line._key"
                class="invoice-row-3d animate-row-enter"
                :class="line.account_id ? 'invoice-row-filled' : 'invoice-row-empty'"
              >
                <td class="px-3 py-2 text-center font-mono align-middle">
                  <span
                    class="w-5 h-5 rounded-md inline-flex items-center justify-center font-black text-[11px]"
                    :class="
                      line.account_id
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-surface-ground text-text-muted border border-surface-border'
                    "
                  >
                    {{ index + 1 }}
                  </span>
                </td>

                <td class="px-3 py-2 align-middle">
                  <div v-if="!line.account_id" class="voucher-account-search w-full">
                    <AccountPartySearchGrid
                      :placeholder="
                        isReceipt
                          ? 'ابحث عن حساب، عميل، أو مصدر الإيراد...'
                          : 'ابحث عن حساب مصروف، مورد، موظف، أو جهة صرف...'
                      "
                      @select="handleSelectAccount(index, $event)"
                    />
                  </div>

                  <div v-else class="flex items-center justify-between gap-2">
                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span
                          class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/10 text-primary border border-primary/25"
                        >
                          {{ line.account_code }}
                        </span>
                        <span
                          v-if="line.reference_label"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning/15 text-warning border border-warning/30 truncate"
                        >
                          {{ line.reference_label }}
                        </span>
                      </div>
                      <span
                        class="text-xs sm:text-[13px] font-bold text-text-primary truncate mt-0.5"
                        :title="line.account_name"
                      >
                        {{ line.account_name }}
                      </span>
                    </div>

                    <button
                      type="button"
                      @click="resetLineAccount(index)"
                      class="px-2 py-1 text-[11px] font-bold rounded-lg border border-surface-border bg-surface-card hover:border-primary hover:text-primary text-text-secondary transition-colors shrink-0 cursor-pointer"
                      title="تغيير الحساب"
                    >
                      تغيير
                    </button>
                  </div>
                </td>

                <td class="px-3 py-2 align-middle">
                  <template v-if="line.account_id">
                    <div class="relative w-full h-9 flex items-center">
                      <select
                        :id="`costCenter-${index}`"
                        v-model="line.cost_center_id"
                        @keydown.enter.prevent="focusInput(`amount-${index}`)"
                        class="invoice-pill-editable w-full h-9 pr-3 pl-6 border rounded-xl text-text-secondary text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                      >
                        <option value="" class="bg-surface-section text-text-muted">
                          -- بدون مركز --
                        </option>
                        <option
                          v-for="cc in costCenters"
                          :key="cc.id"
                          :value="cc.id"
                          class="bg-surface-section text-text-primary font-bold"
                        >
                          {{ cc.name }}
                        </option>
                      </select>
                      <span
                        class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none text-[8px]"
                      >
                        ▼
                      </span>
                    </div>
                  </template>
                  <div
                    v-else
                    class="h-9 flex items-center justify-center text-text-muted/35 font-mono select-none"
                  >
                    —
                  </div>
                </td>

                <td class="px-3 py-2 align-middle">
                  <template v-if="line.account_id">
                    <div class="h-9 flex items-center justify-center">
                      <AppCurrencyInput
                        :id="`amount-${index}`"
                        v-model="line.amount"
                        :symbol="selectedCurrencyCode"
                        variant="sales"
                        placeholder="0.00"
                        :input-class="`invoice-pill-editable h-9 rounded-xl border text-center font-mono font-black text-sm ${
                          isReceipt ? '!text-success' : '!text-primary'
                        }`"
                        @keydown.enter.prevent="focusInput(`desc-${index}`)"
                        required
                      />
                    </div>
                  </template>
                  <div
                    v-else
                    class="h-9 flex items-center justify-center text-text-muted/35 font-mono select-none"
                  >
                    —
                  </div>
                </td>

                <td class="px-3 py-2 align-middle">
                  <template v-if="line.account_id">
                    <div class="h-9 flex items-center">
                      <input
                        :id="`desc-${index}`"
                        type="text"
                        v-model="line.description"
                        placeholder="ملاحظة السطر..."
                        class="invoice-pill-editable w-full h-9 px-3 border rounded-xl text-text-primary text-xs font-semibold outline-none transition-all placeholder:text-text-muted placeholder:font-normal"
                      />
                    </div>
                  </template>
                  <div
                    v-else
                    class="h-9 flex items-center justify-center text-text-muted/35 font-mono select-none"
                  >
                    —
                  </div>
                </td>

                <td class="px-3 py-2 text-center align-middle">
                  <div class="h-9 flex items-center justify-center">
                    <button
                      v-if="line.account_id || form.details.length > 1"
                      type="button"
                      @click="removeLine(index)"
                      class="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      title="حذف هذا السطر"
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
                    <span v-else class="text-text-muted/35 font-mono select-none">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="px-4 py-2 bg-surface-ground/60 border-t border-surface-border/80 flex flex-wrap items-center justify-between gap-2"
        >
          <button
            type="button"
            @click="addNewEmptyLine"
            class="h-8 px-3.5 bg-surface-card hover:bg-primary hover:text-white text-primary border border-primary/45 hover:border-primary text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>إضافة حساب آخر</span>
          </button>

          <span
            class="px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono text-xs text-text-secondary"
          >
            الحسابات المدرجة:
            <strong class="text-primary font-black text-sm mr-1">
              {{ form.details.filter((l) => l.account_id).length }}
            </strong>
          </span>
        </div>
      </div>
    </div>

    <!-- البطاقة 3: اسم المستفيد / الدافع والبيان العام للسند -->
    <div
      class="voucher-card bg-surface-section/70 border border-surface-border p-4 rounded-xl transition-all duration-200"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        <div class="md:col-span-5">
          <label for="payee-name" class="block text-xs font-bold text-text-secondary mb-1.5">
            {{ isReceipt ? 'استلمنا من السيد / الجهة *' : 'يُصرف للسيد / الجهة *' }}
          </label>
          <AppInput
            id="payee-name"
            type="text"
            v-model="form.payee_name"
            @blur="handlePayeeBlur"
            @keydown.enter.prevent="focusInput('voucher-description')"
            :placeholder="isReceipt ? 'اسم الدافع أو الجهة...' : 'اسم المستفيد أو الجهة...'"
            class="bg-surface-card"
            required
          />
        </div>

        <div class="md:col-span-7">
          <label
            for="voucher-description"
            class="block text-xs font-bold text-text-secondary mb-1.5"
          >
            البيان العام للسند *
          </label>
          <AppInput
            id="voucher-description"
            type="text"
            v-model="form.description"
            placeholder="شرح سبب الصرف أو القبض..."
            class="bg-surface-card"
            required
          />
        </div>
      </div>
    </div>

    <!-- تنبيه فوري عند تجاوز مبلغ الصرف للرصيد المتاح -->
    <div
      v-if="isBalanceInsufficient"
      class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-500/12 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-bold"
    >
      <svg
        class="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>
        لا يمكن إتمام الصرف: إجمالي المبلغ ({{ formatNumber(computedTotalAmount) }}
        {{ selectedCurrencyCode }}) يتجاوز الرصيد المتاح ({{
          formatNumber(effectiveAvailableBalance)
        }}
        {{ selectedTreasuryCurrencyCode }}).
      </span>
    </div>

    <!-- الشريط السفلي المتوازن (الأزرار في اليمين والإجمالي النهائي في أقصى اليسار) -->
    <div
      class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1.5"
    >
      <div class="flex flex-wrap items-center gap-2.5 justify-start">
        <template v-if="isPostedEdit">
          <AppButton
            type="button"
            @click="handleSubmit(false)"
            :disabled="isSaving || computedTotalAmount <= 0 || isBalanceInsufficient"
            class="bg-primary text-white font-black px-5 py-2 rounded-xl"
          >
            <span v-if="isSaving">جاري حفظ التعديلات...</span>
            <span v-else>حفظ التعديلات وتحديث القيد</span>
          </AppButton>
        </template>

        <template v-else>
          <AppButton
            type="button"
            @click="handleSubmit(true)"
            :disabled="isSaving || computedTotalAmount <= 0 || isBalanceInsufficient"
            class="bg-primary text-white font-black px-5 py-2 rounded-xl"
          >
            <span v-if="isSaving">جاري الحفظ...</span>
            <span v-else>{{ isEditMode ? 'تحديث وترحيل مباشر' : 'حفظ وترحيل مباشر' }}</span>
          </AppButton>

          <AppButton
            type="button"
            variant="secondary"
            @click="handleSubmit(false)"
            :disabled="isSaving || computedTotalAmount <= 0 || isBalanceInsufficient"
            class="font-bold rounded-xl"
          >
            <span v-if="isSaving">جاري الحفظ...</span>
            <span v-else>{{ isEditMode ? 'تحديث السند' : 'حفظ كمسودة' }}</span>
          </AppButton>
        </template>

        <AppButton
          type="button"
          variant="secondary"
          @click="$emit('cancel')"
          :disabled="isSaving"
          class="font-bold rounded-xl"
        >
          إلغاء
        </AppButton>
      </div>

      <div
        class="flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-xl bg-surface-section border border-surface-border border-r-4 border-r-primary shadow-xs"
      >
        <span class="text-xs font-black text-text-secondary">
          إجمالي {{ isReceipt ? 'القبض' : 'الصرف' }}:
        </span>
        <div
          class="flex items-baseline gap-1.5 px-3 py-1 rounded-lg border"
          :class="
            isReceipt
              ? 'bg-emerald-500/12 border-emerald-500/35 text-success'
              : isBalanceInsufficient
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                : 'bg-primary/12 border-primary/35 text-primary'
          "
        >
          <span class="font-mono text-xl font-black tracking-tight">
            {{ formatNumber(computedTotalAmount) }}
          </span>
          <span class="text-[11px] font-bold uppercase opacity-85">
            {{ selectedCurrencyCode }}
          </span>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AccountPartySearchGrid from '@/components/ui/AccountPartySearchGrid.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  type: { type: String, required: true },
  isSaving: { type: Boolean, default: false },
  branches: { type: Array, default: () => [] },
  boxes: { type: Array, default: () => [] },
  bankAccounts: { type: Array, default: () => [] },
  currencies: { type: Array, default: () => [] },
  costCenters: { type: Array, default: () => [] },
  fiscalYearError: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])
const toast = useToast()

const isReceipt = computed(() => props.type === 'receipt')
const isEditMode = computed(() => !!props.initialData?.id)
const isPostedEdit = computed(() => isEditMode.value && props.initialData?.status === 'posted')

const paymentMethodType = ref('box')
const isMultiAccountMode = ref(false)
const lastAutoDescription = ref('')

const createEmptyLine = (defaultBranchId = '') => ({
  _key: Date.now() + Math.random(),
  _autoDescription: '',
  account_id: null,
  account_code: '',
  account_name: '',
  cost_center_id: defaultBranchId || (props.branches.length > 0 ? props.branches[0].id : ''),
  amount: '',
  description: '',
  party_type: null,
  party_id: null,
  reference_type: null,
  reference_id: null,
  reference_label: null,
})

const form = ref({
  id: null,
  type: props.type,
  date: new Date().toISOString().split('T')[0],
  branch_id: '',
  box_id: '',
  bank_account_id: null,
  bank_ref_number: '',
  currency_id: '',
  payee_name: '',
  description: '',
  details: [createEmptyLine()],
})

const singleLine = computed(() => form.value.details[0])

const formattedBankAccounts = computed(() =>
  props.bankAccounts.map((b) => ({
    ...b,
    displayName: `${b.bank_name} - ${b.account_number}`,
  })),
)

const selectedCurrencyCode = computed(() => {
  const currency = props.currencies.find((c) => c.id === form.value.currency_id)
  return currency ? currency.code : props.currencies[0]?.code || ''
})

const selectedTreasury = computed(() => {
  if (paymentMethodType.value === 'bank') {
    if (!form.value.bank_account_id) return null
    return props.bankAccounts.find((b) => b.id === form.value.bank_account_id) || null
  }
  if (!form.value.box_id) return null
  return props.boxes.find((b) => b.id === form.value.box_id) || null
})

const currentTreasuryBalance = computed(() => {
  if (!selectedTreasury.value) return 0
  return Number(selectedTreasury.value.balance ?? selectedTreasury.value.account?.balance ?? 0)
})

const effectiveAvailableBalance = computed(() => {
  let available = currentTreasuryBalance.value
  if (!isReceipt.value && isPostedEdit.value && props.initialData) {
    const oldBoxId =
      props.initialData.payment_method?.type === 'box'
        ? props.initialData.payment_method.id
        : props.initialData.box_id || null
    const oldBankId =
      props.initialData.payment_method?.type === 'bank'
        ? props.initialData.payment_method.id
        : props.initialData.bank_account_id || null
    const oldAmount = Number(props.initialData.amount || 0)

    if (paymentMethodType.value === 'box' && form.value.box_id && form.value.box_id === oldBoxId) {
      available += oldAmount
    } else if (
      paymentMethodType.value === 'bank' &&
      form.value.bank_account_id &&
      form.value.bank_account_id === oldBankId
    ) {
      available += oldAmount
    }
  }
  return available
})

const selectedTreasuryCurrencyCode = computed(() => {
  return selectedTreasury.value?.currency?.code || selectedCurrencyCode.value
})

const selectedTreasuryName = computed(() => {
  if (!selectedTreasury.value) return ''
  if (paymentMethodType.value === 'bank') {
    return `${selectedTreasury.value.bank_name} - ${selectedTreasury.value.account_number}`
  }
  return selectedTreasury.value.name || ''
})

const computedTotalAmount = computed(() => {
  return form.value.details.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)
})

const isBalanceInsufficient = computed(() => {
  if (isReceipt.value || !selectedTreasury.value) return false
  return computedTotalAmount.value > effectiveAvailableBalance.value + 0.0001
})

const formatNumber = (num) =>
  Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

watch(
  () => props.initialData,
  (newVal) => {
    lastAutoDescription.value = ''
    if (newVal) {
      const isBank =
        newVal.payment_method?.type === 'bank' ||
        Boolean(newVal.bank_account_id) ||
        Boolean(newVal.bank_account)

      paymentMethodType.value = isBank ? 'bank' : 'box'

      const resolvedBranchId =
        newVal.branch?.id || newVal.branch_id || (props.branches[0]?.id ?? '')

      const resolvedBoxId = !isBank
        ? newVal.payment_method?.type === 'box'
          ? newVal.payment_method.id
          : newVal.box_id || (props.boxes[0]?.id ?? null)
        : null

      const resolvedBankId = isBank
        ? newVal.payment_method?.type === 'bank'
          ? newVal.payment_method.id
          : newVal.bank_account_id || (props.bankAccounts[0]?.id ?? null)
        : null

      const hasExistingDetails = Array.isArray(newVal.details) && newVal.details.length > 0
      isMultiAccountMode.value = hasExistingDetails && newVal.details.length > 1

      form.value = {
        id: newVal.id || null,
        type: newVal.type || props.type,
        date: newVal.date || new Date().toISOString().split('T')[0],
        branch_id: resolvedBranchId,
        box_id: resolvedBoxId,
        bank_account_id: resolvedBankId,
        bank_ref_number: newVal.bank_ref_number || newVal.payment_method?.bank_ref_number || '',
        currency_id: newVal.currency?.id || newVal.currency_id || (props.currencies[0]?.id ?? ''),
        payee_name: newVal.payee_name || '',
        description: newVal.description || '',
        details: hasExistingDetails
          ? newVal.details.map((d, i) => ({
              _key: Date.now() + i,
              _autoDescription: '',
              account_id: d.account?.id || d.account_id,
              account_code: d.account?.code || d.account_code || '',
              account_name: d.account?.name || d.account_name || '',
              cost_center_id: d.cost_center?.id || d.cost_center_id || resolvedBranchId,
              amount: Number(d.amount) || '',
              description: d.description || '',
              party_type: d.party_type || null,
              party_id: d.party_id ? String(d.party_id) : null,
              reference_type: d.reference_type || null,
              reference_id: d.reference_id ? Number(d.reference_id) : null,
              reference_label: d.reference_label || null,
            }))
          : [createEmptyLine(resolvedBranchId)],
      }
    } else {
      isMultiAccountMode.value = false
      paymentMethodType.value = 'box'
      const defaultBranchId = props.branches[0]?.id ?? ''
      form.value = {
        id: null,
        type: props.type,
        date: new Date().toISOString().split('T')[0],
        branch_id: defaultBranchId,
        box_id: props.boxes[0]?.id ?? '',
        bank_account_id: null,
        bank_ref_number: '',
        currency_id: props.currencies[0]?.id || '',
        payee_name: '',
        description: '',
        details: [createEmptyLine(defaultBranchId)],
      }
    }
  },
  { immediate: true, deep: true },
)

const toggleMultiAccountMode = () => {
  if (!isMultiAccountMode.value) {
    isMultiAccountMode.value = true
    if (form.value.details.length === 1 && form.value.details[0].account_id) {
      addNewEmptyLine()
    }
  } else {
    const filledLines = form.value.details.filter((l) => l.account_id)
    if (filledLines.length > 1) {
      form.value.details = [filledLines[0]]
      toast.info('تم التبديل لوضع الحساب الواحد والاحتفاظ بالحساب الأول.')
    } else if (filledLines.length === 1) {
      form.value.details = [filledLines[0]]
    } else {
      form.value.details = [createEmptyLine(form.value.branch_id)]
    }
    isMultiAccountMode.value = false
  }
}

const handlePaymentMethodChange = (newValue) => {
  paymentMethodType.value = newValue
  if (newValue === 'box') {
    form.value.bank_account_id = null
    form.value.bank_ref_number = ''
    if (!form.value.box_id && props.boxes.length > 0) {
      form.value.box_id = props.boxes[0].id
    }
  } else {
    form.value.box_id = null
    if (!form.value.bank_account_id && props.bankAccounts.length > 0) {
      form.value.bank_account_id = props.bankAccounts[0].id
    }
  }
}

const handlePayeeBlur = () => {
  const cleanPayee = (form.value.payee_name || '').trim()
  if (
    cleanPayee &&
    (!form.value.description || form.value.description === lastAutoDescription.value)
  ) {
    form.value.description = cleanPayee
    lastAutoDescription.value = cleanPayee
  }
}

const handleSelectAccount = (index, item) => {
  const line = form.value.details[index]
  if (!line) return

  line.account_id = item.account_id || item.id
  line.account_code = item.code
  line.account_name = item.name
  line.party_type = item.party_type || item.type || null
  line.party_id = item.party_id || item.id ? String(item.party_id || item.id) : null

  if (!line.cost_center_id) {
    line.cost_center_id = form.value.branch_id || ''
  }

  const generatedDesc = (item.name || '').trim()
  const prevGeneralAuto = lastAutoDescription.value

  if (generatedDesc && (!form.value.description || form.value.description === prevGeneralAuto)) {
    form.value.description = generatedDesc
    lastAutoDescription.value = generatedDesc
  }

  if (
    generatedDesc &&
    (!line.description ||
      line.description === line._autoDescription ||
      line.description === prevGeneralAuto)
  ) {
    line.description = generatedDesc
    line._autoDescription = generatedDesc
  }

  nextTick(() => {
    focusInput(isMultiAccountMode.value ? `amount-${index}` : 'single-amount')
  })
}

const resetLineAccount = (index) => {
  const line = form.value.details[index]
  if (line) {
    if (line.description === line._autoDescription) {
      line.description = ''
    }
    line._autoDescription = ''

    if (form.value.details.length === 1 && form.value.description === lastAutoDescription.value) {
      form.value.description = ''
      lastAutoDescription.value = ''
    }

    line.account_id = null
    line.account_code = ''
    line.account_name = ''
    line.party_type = null
    line.party_id = null
    line.reference_type = null
    line.reference_id = null
    line.reference_label = null
  }
}

const addNewEmptyLine = () => {
  form.value.details.push(createEmptyLine(form.value.branch_id))
}

const removeLine = (index) => {
  if (form.value.details.length > 1) {
    form.value.details.splice(index, 1)
  } else {
    form.value.details = [createEmptyLine(form.value.branch_id)]
    lastAutoDescription.value = ''
  }
}

const focusInput = (elementId) => {
  const el = document.getElementById(elementId)
  if (el) {
    const input = el.tagName === 'INPUT' || el.tagName === 'SELECT' ? el : el.querySelector('input')
    if (input) {
      input.focus()
      if (typeof input.select === 'function') {
        input.select()
      }
    }
  }
}

const handleSubmit = (postAfterSave = false) => {
  if (props.fiscalYearError) {
    return toast.error('لا يمكن الحفظ: ' + props.fiscalYearError)
  }
  if (!form.value.date) return toast.error('تاريخ السند مطلوب.')
  if (!form.value.branch_id) return toast.error('الرجاء اختيار الفرع.')

  const isBank = paymentMethodType.value === 'bank'
  if (!isBank && !form.value.box_id) {
    return toast.error('الرجاء اختيار الخزينة.')
  }
  if (isBank && !form.value.bank_account_id) {
    return toast.error('الرجاء اختيار الحساب البنكي.')
  }

  if (isBalanceInsufficient.value) {
    return toast.error(
      `رصيد ${selectedTreasuryName.value} غير كافٍ للصرف. الرصيد المتاح: ${formatNumber(effectiveAvailableBalance.value)}`,
    )
  }

  const unassignedLine = form.value.details.some((l) => !l.account_id || Number(l.amount) <= 0)
  if (unassignedLine) {
    return toast.error(
      isMultiAccountMode.value
        ? 'يرجى التأكد من اختيار الحساب وكتابة مبلغ صحيح لكل سطر.'
        : 'يرجى اختيار الحساب المقابل وإدخال مبلغ صحيح.',
    )
  }

  if (computedTotalAmount.value <= 0) {
    return toast.error('إجمالي السند يجب أن يكون أكبر من الصفر.')
  }

  if (!form.value.payee_name || !form.value.payee_name.trim()) {
    return toast.error(`الرجاء كتابة اسم ${isReceipt.value ? 'الدافع' : 'المستفيد'}.`)
  }
  if (!form.value.description || !form.value.description.trim()) {
    return toast.error('الرجاء كتابة البيان العام للسند.')
  }

  const selectedCurrency =
    props.currencies.find((c) => c.id === form.value.currency_id) || props.currencies[0]
  const exchangeRate = selectedCurrency?.exchange_rate || 1

  const cleanDetails = form.value.details.map((line) => ({
    account_id: line.account_id,
    cost_center_id: line.cost_center_id || null,
    amount: Number(line.amount),
    description: line.description || null,
    party_type: line.party_type || null,
    party_id: line.party_id ? String(line.party_id) : null,
    reference_type: line.reference_type || null,
    reference_id: line.reference_id ? Number(line.reference_id) : null,
  }))

  const payload = {
    type: props.type,
    branch_id: form.value.branch_id,
    date: form.value.date,
    payee_name: form.value.payee_name.trim(),
    description: form.value.description.trim(),
    box_id: isBank ? null : form.value.box_id || null,
    bank_account_id: isBank ? form.value.bank_account_id || null : null,
    bank_ref_number: isBank ? form.value.bank_ref_number || null : null,
    currency_id: form.value.currency_id || selectedCurrency?.id,
    exchange_rate: exchangeRate,
    amount: computedTotalAmount.value,
    details: cleanDetails,
    post_after_save: postAfterSave,
  }

  emit('submit', payload)
}
</script>

<style scoped>
/* توحيد ارتفاع وحواف جميع حقول الإدخال والقوائم المنسدلة داخل البطاقات (40px) */
.voucher-card :deep(input),
.voucher-card :deep(.p-dropdown),
.voucher-card :deep([data-pc-name='dropdown']),
.voucher-card :deep([data-pc-section='root']) {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 0.5rem !important;
  box-sizing: border-box !important;
}

.voucher-card :deep(input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
}

.voucher-card :deep(input[type='date']) {
  color-scheme: inherit;
}

.voucher-card :deep(.p-dropdown),
.voucher-card :deep([data-pc-name='dropdown']) {
  display: inline-flex !important;
  align-items: center !important;
}

.voucher-card :deep(.p-dropdown-label),
.voucher-card :deep([data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
}

/* توحيد ارتفاع وشكل حقل البحث في وضع الحساب الواحد مع بقية الحقول (40px) */
.single-account-search :deep(input) {
  background-color: rgb(var(--color-surface-section)) !important;
  border-color: rgb(var(--color-surface-border)) !important;
  color: rgb(var(--color-text-primary)) !important;
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 0.5rem !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  box-sizing: border-box !important;
}

.single-account-search :deep(input:focus) {
  border-color: rgb(var(--color-primary)) !important;
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2) !important;
}

/* توحيد خلفية وإطار حقل البحث الداخلي في جدول تعدد الحسابات */
.voucher-account-search :deep(input) {
  background-color: rgb(var(--color-surface-card)) !important;
  border-color: rgba(var(--primary-rgb), 0.45) !important;
  color: rgb(var(--color-text-primary)) !important;
  height: 40px !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

.voucher-account-search :deep(input:focus) {
  border-color: rgb(var(--color-primary)) !important;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.25) !important;
}
</style>
