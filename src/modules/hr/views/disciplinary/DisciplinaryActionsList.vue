<!-- src/modules/hr/views/disciplinary/DisciplinaryActionsList.vue -->
<template>
  <div class="space-y-5 text-right font-sans" dir="rtl">
    <!-- 1. ترويسة الصفحة وأزرار الإجراءات الرئيسية -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-text-primary flex items-center gap-2.5">
          <span class="w-2 h-6 rounded-full bg-primary inline-block"></span>
          <span>{{
            isManagementView ? 'المخالفون والجزاءات التأديبية' : 'مخالفاتي وجزاءاتي التأديبية'
          }}</span>
        </h1>
        <p class="text-xs text-text-secondary mt-1 pr-4">
          {{
            isManagementView
              ? 'متابعة الموظفين المخالفين المرصودين آلياً من البصمة أو يدوياً، واتخاذ قرار الاعتماد أو الإعفاء وتطبيق الأثر المالي في الرواتب.'
              : 'استعراض سجل المخالفات والجزاءات التأديبية الخاصة بك وحالة سريانها وتأثيرها المالي.'
          }}
        </p>
      </div>

      <div v-if="isManagementView" class="flex items-center gap-2.5 flex-wrap">
        <!-- زر انتقال سريع إلى شاشة إعدادات اللوائح لمن يملك صلاحية الإعدادات -->
        <button
          v-if="canManageSettings"
          type="button"
          @click="goToViolationRules"
          class="h-10 px-3.5 rounded-xl border border-surface-border bg-surface-card hover:border-primary hover:text-primary text-text-secondary text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <span>إعدادات اللوائح و الجزائات</span>
        </button>

        <!-- زر تسجيل مخالفة يدوية -->
        <AppButton v-if="canCreate" type="button" @click="openRecordModal">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>تسجيل مخالفة يدوية</span>
          </span>
        </AppButton>
      </div>
    </div>

    <!-- تنبيه إرشادي يظهر فقط للإدارة إذا لم تكن هناك لوائح رصد آلي مفعلة -->
    <div
      v-if="isManagementView && showNoAutomatedRulesNotice"
      class="p-3.5 rounded-xl bg-info/10 border border-info/30 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-2.5 text-text-primary">
        <span class="w-2 h-2 rounded-full bg-info shrink-0"></span>
        <span>
          <strong>ملاحظة تشغيلية:</strong> لا توجد حالياً لوائح رصد آلي نشطة (للتأخير الصباحي أو
          الانصراف المبكر أو الغياب). لتفعيل الرصد التلقائي من البصمة، فعّل لائحة واحدة على الأقل في
          شاشة اللوائح.
        </span>
      </div>
      <button
        v-if="canManageSettings"
        type="button"
        @click="goToViolationRules"
        class="px-3 py-1.5 rounded-lg bg-info text-white font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
      >
        تهيئة اللوائح الآن
      </button>
    </div>

    <!-- 2. بطاقات المتابعة الفورية (تفاعلية لتصفية المخالفين بضغطة زر) -->
    <div v-if="isManagementView" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- بطاقة 1: مخالفون بانتظار القرار -->
      <button
        type="button"
        @click="applyQuickCardFilter('pending')"
        class="p-4 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
        :class="
          activeQuickCard === 'pending'
            ? 'bg-warning/15 border-warning ring-2 ring-warning/25'
            : 'bg-surface-card border-surface-border hover:border-warning/60'
        "
      >
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-text-secondary block">
            مخالفون بانتظار القرار
          </span>
          <span class="text-2xl font-black font-mono text-warning block">
            {{ stats.pending }}
          </span>
          <span class="text-[10px] text-text-muted block"> تحتاج اعتماد الجزاء أو قبول العذر </span>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </button>

      <!-- بطاقة 2: مخالفات اليوم -->
      <button
        type="button"
        @click="applyQuickCardFilter('today')"
        class="p-4 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
        :class="
          activeQuickCard === 'today'
            ? 'bg-primary/15 border-primary ring-2 ring-primary/25'
            : 'bg-surface-card border-surface-border hover:border-primary/60'
        "
      >
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-text-secondary block">
            مخالفات اليوم ({{ todayFormatted }})
          </span>
          <span class="text-2xl font-black font-mono text-primary block">
            {{ stats.today }}
          </span>
          <span class="text-[10px] text-text-muted block">
            مرصودة آلياً أو مسجلة بتاريخ اليوم
          </span>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </button>

      <!-- بطاقة 3: جزاءات معتمدة وسارية -->
      <button
        type="button"
        @click="applyQuickCardFilter('approved')"
        class="p-4 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
        :class="
          activeQuickCard === 'approved'
            ? 'bg-success/15 border-success ring-2 ring-success/25'
            : 'bg-surface-card border-surface-border hover:border-success/60'
        "
      >
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-text-secondary block">
            جزاءات معتمدة وسارية
          </span>
          <span class="text-2xl font-black font-mono text-success block">
            {{ stats.approved }}
          </span>
          <span class="text-[10px] text-text-muted block"> مطبّقة ومؤثرة في سلم التدرج </span>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </button>

      <!-- بطاقة 4: إجمالي سجل المخالفات -->
      <button
        type="button"
        @click="applyQuickCardFilter('all')"
        class="p-4 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
        :class="
          activeQuickCard === 'all'
            ? 'bg-info/15 border-info ring-2 ring-info/25'
            : 'bg-surface-card border-surface-border hover:border-info/60'
        "
      >
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-text-secondary block"> إجمالي السجل العام </span>
          <span class="text-2xl font-black font-mono text-text-primary block">
            {{ stats.total }}
          </span>
          <span class="text-[10px] text-text-muted block"> عرض كافة الحالات والتواريخ </span>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-info/15 text-info flex items-center justify-center shrink-0"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      </button>
    </div>

    <!-- 3. شريط البحث والتصفية المتقدمة -->
    <div
      class="p-4 bg-surface-header rounded-xl border border-surface-border border-t-4 border-t-primary shadow-sm space-y-3.5 transition-colors duration-200"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
        <!-- البحث السريع -->
        <div
          :class="isManagementView ? 'lg:col-span-4' : 'lg:col-span-5'"
          class="flex flex-col space-y-1"
        >
          <label class="text-[11px] font-bold text-text-secondary pr-1">البحث السريع</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <span class="absolute right-3 text-text-muted pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearchInput"
              :placeholder="
                isManagementView
                  ? 'رقم الجزاء (DA-...)، اسم الموظف، أو رقمه الوظيفي...'
                  : 'ابحث برقم الجزاء المرجعي (DA-...)...'
              "
              class="block w-full h-full pr-9 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-semibold"
            />
          </div>
        </div>

        <!-- اختيار الموظف (يظهر للإدارة والمشرفين فقط) -->
        <div v-if="isManagementView" class="lg:col-span-4 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">الموظف</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs overflow-hidden"
          >
            <div class="w-full h-full px-1 flex items-center">
              <AppDropdown
                id="da-employee-filter"
                v-model="employeeFilter"
                :options="employeeOptions"
                option-label="displayLabel"
                option-value="id"
                placeholder="جميع الموظفين..."
                filter-placeholder="ابحث بالاسم أو الرقم الوظيفي..."
                class="w-full bg-transparent filter-embedded-dropdown"
                @update:model-value="handlePageChange(1)"
              />
            </div>
          </div>
        </div>

        <!-- نوع المخالفة / اللائحة -->
        <div
          :class="isManagementView ? 'lg:col-span-4' : 'lg:col-span-4'"
          class="flex flex-col space-y-1"
        >
          <label class="text-[11px] font-bold text-text-secondary pr-1"
            >نوع المخالفة / اللائحة</label
          >
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <select
              v-model="violationTypeFilter"
              @change="handlePageChange(1)"
              class="block w-full h-full pr-3.5 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="" class="bg-surface-section text-text-primary">جميع اللوائح</option>
              <option
                v-for="vt in violationTypes"
                :key="vt.id"
                :value="vt.id"
                class="bg-surface-section text-text-primary"
              >
                {{ vt.name }}
              </option>
            </select>
            <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
          </div>
        </div>

        <!-- حالة الجزاء -->
        <div
          :class="isManagementView ? 'lg:col-span-4' : 'lg:col-span-3'"
          class="flex flex-col space-y-1"
        >
          <label class="text-[11px] font-bold text-text-secondary pr-1">حالة القرار</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <select
              v-model="statusFilter"
              @change="handlePageChange(1)"
              class="block w-full h-full pr-3.5 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer"
            >
              <option value="" class="bg-surface-section text-text-primary">كل الحالات</option>
              <option value="pending" class="bg-surface-section text-text-primary">
                بانتظار الاعتماد (Pending)
              </option>
              <option value="approved" class="bg-surface-section text-text-primary">
                معتمد وسارٍ (Approved)
              </option>
              <option value="expired" class="bg-surface-section text-text-primary">
                منتهي بالتقادم (Expired)
              </option>
              <option value="cancelled" class="bg-surface-section text-text-primary">
                ملغى / معفى (Cancelled)
              </option>
            </select>
            <span class="absolute left-3 text-text-muted pointer-events-none text-[10px]">▼</span>
          </div>
        </div>

        <!-- من تاريخ -->
        <div v-if="isManagementView" class="lg:col-span-3 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">من تاريخ المخالفة</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <input
              type="date"
              v-model="startDateFilter"
              @change="handlePageChange(1)"
              class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
            />
          </div>
        </div>

        <!-- إلى تاريخ -->
        <div v-if="isManagementView" class="lg:col-span-3 flex flex-col space-y-1">
          <label class="text-[11px] font-bold text-text-secondary pr-1">إلى تاريخ المخالفة</label>
          <div
            class="relative w-full h-11 bg-surface-card border border-surface-border rounded-lg flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs"
          >
            <input
              type="date"
              v-model="endDateFilter"
              @change="handlePageChange(1)"
              class="block w-full h-full px-3 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
            />
          </div>
        </div>

        <!-- زر إعادة ضبط الفلاتر -->
        <div v-if="isManagementView" class="lg:col-span-2 flex items-center justify-end">
          <button
            type="button"
            @click="resetFilters"
            :disabled="!hasActiveFilters"
            class="w-full h-11 px-3 rounded-lg border border-surface-border bg-surface-card hover:border-primary hover:text-primary text-text-secondary text-xs font-bold transition-colors disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
          >
            مسح التصفية
          </button>
        </div>
      </div>
    </div>

    <!-- 4. جدول المخالفين والجزاءات -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="actions"
        :is-loading="loading"
        :row-clickable="true"
        @row-click="openDetailsModal"
      >
        <!-- 1. الموظف والرقم الوظيفي -->
        <template #cell-employee="{ item }">
          <div class="flex flex-col py-1 text-right" dir="rtl">
            <span class="font-black text-xs sm:text-[13px] text-text-primary">
              {{ item.employee?.full_name || '-' }}
            </span>
            <div class="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                v-if="item.employee?.employee_number"
                class="text-[11px] font-mono text-text-muted"
              >
                #{{ item.employee.employee_number }}
              </span>
              <span class="text-[11px] font-mono font-bold text-text-secondary">
                {{ item.violation_date || '-' }}
              </span>
            </div>
          </div>
        </template>

        <!-- 2. المخالفة وتفاصيل البصمة والدرجة -->
        <template #cell-violation="{ item }">
          <div class="flex flex-col gap-1 py-1 text-right" dir="rtl">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-black text-xs text-text-primary">
                {{ item.violation_type?.name || '-' }}
              </span>
              <span
                class="text-[10px] px-1.5 py-0.5 rounded font-bold border"
                :class="
                  item.attendance_log_id
                    ? 'bg-info/10 text-info border-info/25'
                    : 'bg-surface-ground text-text-secondary border-surface-border'
                "
              >
                {{ item.attendance_log_id ? 'آلي من البصمة' : 'رصد يدوي' }}
              </span>
            </div>

            <!-- تفاصيل البصمة المسببة للمخالفة مباشرة في الصف -->
            <div
              v-if="item.attendance_log"
              class="flex items-center gap-2 flex-wrap text-[11px] text-text-secondary"
            >
              <span v-if="item.attendance_log.check_in" class="font-mono">
                حضور: <strong>{{ formatTime(item.attendance_log.check_in) }}</strong>
              </span>
              <span v-if="item.attendance_log.check_out" class="font-mono">
                • انصراف: <strong>{{ formatTime(item.attendance_log.check_out) }}</strong>
              </span>
              <span
                v-if="Number(item.attendance_log.delay_minutes) > 0"
                class="text-danger font-bold"
              >
                • تأخير {{ item.attendance_log.delay_minutes }} د
              </span>
              <span
                v-if="Number(item.attendance_log.early_leave_minutes) > 0"
                class="text-warning font-bold"
              >
                • انصراف مبكر {{ item.attendance_log.early_leave_minutes }} د
              </span>
            </div>

            <p v-else-if="item.reason" class="text-[11px] text-text-muted max-w-[300px] truncate">
              {{ item.reason }}
            </p>

            <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span
                class="text-[10px] px-2 py-0.5 rounded font-mono font-black bg-primary/10 text-primary border border-primary/25"
              >
                الدرجة ({{ item.step_order }})
              </span>
              <AppBadge :variant="getActionBadgeVariant(item.action_type)" size="xs">
                {{ item.action_type_label }}
              </AppBadge>
              <span class="text-[10px] font-mono text-text-muted">{{ item.number }}</span>
            </div>
          </div>
        </template>

        <!-- 3. الأثر المالي والتشغيلي -->
        <template #cell-financial="{ item }">
          <div class="flex flex-col items-start gap-1 text-right" dir="rtl">
            <template v-if="Number(item.deduction_amount) > 0">
              <span class="font-mono font-black text-xs text-danger">
                خصم: {{ formatCurrency(item.deduction_amount) }}
              </span>
              <span
                v-if="Number(item.deduction_days) > 0"
                class="text-[10px] text-text-muted font-bold"
              >
                يعادل ({{ item.deduction_days }} يوم)
              </span>
            </template>

            <span
              v-if="Number(item.suspension_days) > 0"
              class="text-[11px] font-bold text-orange-600 dark:text-orange-300"
            >
              إيقاف عن العمل: {{ item.suspension_days }} أيام
            </span>

            <span
              v-if="Number(item.deduction_amount) <= 0 && Number(item.suspension_days) <= 0"
              class="text-[11px] text-text-muted"
            >
              {{
                item.action_type === 'termination'
                  ? 'توصية بإنهاء الخدمة'
                  : 'تنبيه / إنذار بدون خصم'
              }}
            </span>

            <span
              v-if="item.payroll_input"
              class="text-[10px] px-1.5 py-0.5 rounded font-bold"
              :class="
                item.payroll_input.is_processed
                  ? 'bg-success/12 text-success'
                  : 'bg-warning/12 text-warning'
              "
            >
              {{
                item.payroll_input.is_processed ? 'مُرحّل بمسير الرواتب' : 'مدرج بمدخلات الرواتب'
              }}
            </span>
          </div>
        </template>

        <!-- 4. الحالة وفترة السريان -->
        <template #cell-status="{ item }">
          <div class="flex flex-col items-center gap-1">
            <AppBadge :variant="getStatusBadgeVariant(item.effective_status)" size="xs" pill>
              {{ item.status_label }}
            </AppBadge>
            <span v-if="item.expires_at" class="text-[10px] font-mono text-text-muted">
              يسقط: {{ item.expires_at }}
            </span>
          </div>
        </template>

        <!-- 5. أزرار القرار المباشر والإجراءات -->
        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-1.5 flex-wrap" @click.stop>
            <!-- زر الاعتماد المباشر (للحالات المعلقة) -->
            <button
              v-if="canApprove && item.status === 'pending'"
              type="button"
              @click="openApproveDialog(item)"
              class="h-7 px-2.5 rounded-lg text-[11px] font-black bg-success/15 hover:bg-success text-success hover:text-white border border-success/30 transition-colors cursor-pointer whitespace-nowrap"
              title="اعتماد الجزاء وتنفيذ أثره المالي والتشغيلي"
            >
              اعتماد
            </button>

            <!-- زر الإعفاء / الإلغاء المباشر -->
            <button
              v-if="canCancel && canCancelItem(item)"
              type="button"
              @click="openCancelModal(item)"
              class="h-7 px-2.5 rounded-lg text-[11px] font-bold bg-warning/15 hover:bg-warning text-warning hover:text-white border border-warning/30 transition-colors cursor-pointer whitespace-nowrap"
              :title="
                item.status === 'pending'
                  ? 'قبول عذر الموظف وإلغاء المخالفة'
                  : 'إلغاء الجزاء والتراجع عن أثره'
              "
            >
              {{ item.status === 'pending' ? 'إعفاء' : 'إلغاء' }}
            </button>

            <!-- زر عرض التفاصيل -->
            <button
              type="button"
              @click="openDetailsModal(item)"
              class="h-7 px-2 rounded-lg text-[11px] font-bold bg-surface-ground hover:border-primary hover:text-primary text-text-secondary border border-surface-border transition-colors cursor-pointer whitespace-nowrap"
              title="استعراض كامل تفاصيل المخالفة وسجل التدقيق"
            >
              التفاصيل
            </button>

            <!-- زر حذف السجل (للمعلق أو الملغى فقط) -->
            <button
              v-if="canDelete && item.status !== 'approved'"
              type="button"
              @click="openDeleteDialog(item)"
              class="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="حذف سجل المخالفة"
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
        </template>
      </AppTable>

      <AppPagination :meta="pagination || {}" @page-change="handlePageChange" />
    </AppCard>

    <!-- 5. نافذة تسجيل مخالفة يدوية مع المعاينة الفورية -->
    <RecordViolationModal
      v-if="isRecordModalOpen"
      v-model="isRecordModalOpen"
      @saved="handleActionUpdated"
    />

    <!-- 6. نافذة تفاصيل الجزاء والتدقيق -->
    <DisciplinaryActionDetailsModal
      v-if="isDetailsModalOpen"
      v-model="isDetailsModalOpen"
      :action-id="selectedActionId"
      @updated="handleActionUpdated"
    />

    <!-- 7. حوار تأكيد اعتماد الجزاء -->
    <AppConfirmDialog
      v-model="isApproveDialogOpen"
      :title="
        actionToApprove?.action_type === 'termination'
          ? 'تحذير حرج: تأكيد اعتماد توصية إنهاء الخدمة'
          : 'تأكيد اعتماد الجزاء التأديبي'
      "
      :message="approveConfirmMessage"
      :confirm-text="
        actionToApprove?.action_type === 'termination' ? 'اعتماد إنهاء الخدمة' : 'اعتماد وتنفيذ'
      "
      :confirm-variant="actionToApprove?.action_type === 'termination' ? 'danger' : 'primary'"
      @confirmed="confirmApproveAction"
    />

    <!-- 8. نافذة الإعفاء / إلغاء الجزاء مع ذكر السبب الإلزامي -->
    <AppDialog
      :model-value="isCancelModalOpen"
      :title="`إعفاء / إلغاء المخالفة (${actionToCancel?.number || ''})`"
      size="lg"
      border-color="border-warning"
      :loading="isCancelling"
      @update:model-value="isCancelModalOpen = $event"
      @close="closeCancelModal"
    >
      <form @submit.prevent="confirmCancelAction" class="space-y-4 text-right font-sans" dir="rtl">
        <div
          class="p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs text-text-primary leading-relaxed"
        >
          سيؤدي إلغاء هذه المخالفة إلى عدم احتسابها في سلم التدرج العقابي للموظف، والتراجع الفوري عن
          أي استقطاع مالي غير مرحّل في مدخلات الرواتب.
        </div>

        <div>
          <label for="cancel-reason" class="block text-xs font-bold text-text-secondary mb-1.5">
            سبب الإعفاء أو الإلغاء *
          </label>
          <textarea
            id="cancel-reason"
            v-model="cancellationReason"
            rows="3"
            required
            minlength="3"
            maxlength="255"
            placeholder="اكتب مبرر الإعفاء أو الإلغاء بوضوح (مثال: قبول عذر التأخير المقدم من الموظف)..."
            class="w-full p-3 rounded-xl bg-surface-card border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-text-primary outline-none transition-all resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
          <AppButton
            type="button"
            variant="secondary"
            @click="closeCancelModal"
            :disabled="isCancelling"
          >
            تراجع
          </AppButton>
          <AppButton
            type="submit"
            variant="warning"
            :disabled="isCancelling || cancellationReason.trim().length < 3"
          >
            <span v-if="isCancelling">جاري الحفظ...</span>
            <span v-else>تأكيد الإعفاء والإلغاء</span>
          </AppButton>
        </div>
      </form>
    </AppDialog>

    <!-- 9. حوار تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف سجل المخالفة"
      :message="`هل أنت متأكد من رغبتك في حذف سجل المخالفة رقم '${actionToDelete?.number}' نهائياً؟`"
      confirm-text="حذف السجل"
      confirm-variant="danger"
      @confirmed="confirmDeleteAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useDisciplinaryActionStore } from '@/modules/hr/stores/disciplinaryActionStore'
import disciplinaryActionService from '@/modules/hr/services/disciplinaryAction.service'
import { useViolationTypeStore } from '@/modules/hr/stores/violationTypeStore'
import { useEmployeeStore } from '@/modules/hr/stores/employeeStore'
import { formatCurrency } from '@/utils/formatters'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

import RecordViolationModal from './components/RecordViolationModal.vue'
import DisciplinaryActionDetailsModal from './components/DisciplinaryActionDetailsModal.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const disciplinaryStore = useDisciplinaryActionStore()
const violationTypeStore = useViolationTypeStore()
const employeeStore = useEmployeeStore()

const { actions, pagination, loading } = storeToRefs(disciplinaryStore)
const { violationTypes } = storeToRefs(violationTypeStore)
const { allEmployees } = storeToRefs(employeeStore)

// الصلاحيات وتمييز وضع الإدارة مقابل وضع الخدمة الذاتية للموظف
const hasAdminRole = computed(
  () =>
    Array.isArray(authStore.user?.roles) &&
    authStore.user.roles.some((r) => r.name === 'HR Manager' || r.name === 'Super Admin'),
)

const canViewAll = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.view'),
)

const canCreate = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.create'),
)

const canApprove = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.approve'),
)

const canCancel = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.cancel'),
)

const canDelete = computed(
  () => hasAdminRole.value || authStore.can('hr.disciplinary_actions.delete'),
)

const canManageSettings = computed(() => hasAdminRole.value || authStore.can('hr.settings.manage'))

const isManagementView = computed(
  () => canViewAll.value || canCreate.value || canApprove.value || canCancel.value,
)

const showNoAutomatedRulesNotice = computed(() => {
  if (!Array.isArray(violationTypes.value) || violationTypes.value.length === 0) return false
  return !violationTypes.value.some((vt) => vt.is_active && vt.detection_mode !== 'manual')
})

const goToViolationRules = () => {
  router.push({ name: 'ViolationTypesList' })
}

// إحصائيات بطاقات المتابعة الفورية
const todayFormatted = new Date().toISOString().split('T')[0]
const stats = ref({
  pending: 0,
  today: 0,
  approved: 0,
  total: 0,
})

const loadQuickStats = async () => {
  if (!isManagementView.value) return
  try {
    const [pendingRes, todayRes, approvedRes, totalRes] = await Promise.all([
      disciplinaryActionService.get({ status: 'pending', per_page: 1 }),
      disciplinaryActionService.get({
        start_date: todayFormatted,
        end_date: todayFormatted,
        per_page: 1,
      }),
      disciplinaryActionService.get({ status: 'approved', per_page: 1 }),
      disciplinaryActionService.get({ per_page: 1 }),
    ])

    stats.value = {
      pending: Number(pendingRes.data?.meta?.total ?? 0),
      today: Number(todayRes.data?.meta?.total ?? 0),
      approved: Number(approvedRes.data?.meta?.total ?? 0),
      total: Number(totalRes.data?.meta?.total ?? 0),
    }
  } catch {
    // عدم تعطيل الشاشة في حال تعذر تحديث العدادات الجانبية
  }
}

const tableHeaders = computed(() => {
  const cols = []
  if (isManagementView.value) {
    cols.push({ key: 'employee', label: 'الموظف والتاريخ', class: 'min-w-[170px]' })
  }
  cols.push(
    { key: 'violation', label: 'المخالفة والتفاصيل والدرجة', class: 'min-w-[260px]' },
    { key: 'financial', label: 'الأثر المالي والتشغيلي', class: 'min-w-[160px]' },
    { key: 'status', label: 'حالة القرار', class: 'text-center min-w-[120px]' },
    { key: 'actions', label: 'القرار والإجراءات', class: 'text-left min-w-[200px]' },
  )
  return cols
})

const employeeOptions = computed(() =>
  (allEmployees.value || []).map((emp) => ({
    ...emp,
    displayLabel: emp.employee_number ? `${emp.full_name} (${emp.employee_number})` : emp.full_name,
  })),
)

// الفلاتر
const searchQuery = ref('')
const employeeFilter = ref('')
const violationTypeFilter = ref('')
const statusFilter = ref('')
const startDateFilter = ref('')
const endDateFilter = ref('')
let searchTimer = null

const activeQuickCard = computed(() => {
  if (
    statusFilter.value === 'pending' &&
    !startDateFilter.value &&
    !endDateFilter.value &&
    !employeeFilter.value &&
    !violationTypeFilter.value &&
    !searchQuery.value.trim()
  ) {
    return 'pending'
  }
  if (
    startDateFilter.value === todayFormatted &&
    endDateFilter.value === todayFormatted &&
    !statusFilter.value &&
    !employeeFilter.value &&
    !violationTypeFilter.value &&
    !searchQuery.value.trim()
  ) {
    return 'today'
  }
  if (
    statusFilter.value === 'approved' &&
    !startDateFilter.value &&
    !endDateFilter.value &&
    !employeeFilter.value &&
    !violationTypeFilter.value &&
    !searchQuery.value.trim()
  ) {
    return 'approved'
  }
  if (!hasActiveFilters.value) {
    return 'all'
  }
  return ''
})

const hasActiveFilters = computed(() =>
  Boolean(
    searchQuery.value.trim() ||
      employeeFilter.value ||
      violationTypeFilter.value ||
      statusFilter.value ||
      startDateFilter.value ||
      endDateFilter.value,
  ),
)

const applyQuickCardFilter = (cardKey) => {
  searchQuery.value = ''
  employeeFilter.value = ''
  violationTypeFilter.value = ''
  statusFilter.value = ''
  startDateFilter.value = ''
  endDateFilter.value = ''

  if (cardKey === 'pending') {
    statusFilter.value = 'pending'
  } else if (cardKey === 'today') {
    startDateFilter.value = todayFormatted
    endDateFilter.value = todayFormatted
  } else if (cardKey === 'approved') {
    statusFilter.value = 'approved'
  }

  handlePageChange(1)
}

const handlePageChange = async (page = 1) => {
  const filters = { page }
  if (searchQuery.value.trim()) filters.search = searchQuery.value.trim()
  if (isManagementView.value && employeeFilter.value) filters.employee_id = employeeFilter.value
  if (violationTypeFilter.value) filters.violation_type_id = violationTypeFilter.value
  if (statusFilter.value) filters.status = statusFilter.value
  if (startDateFilter.value) filters.start_date = startDateFilter.value
  if (endDateFilter.value) filters.end_date = endDateFilter.value

  await disciplinaryStore.fetchActions(filters)
}

const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handlePageChange(1)
  }, 450)
}

const resetFilters = () => {
  searchQuery.value = ''
  employeeFilter.value = ''
  violationTypeFilter.value = ''
  statusFilter.value = ''
  startDateFilter.value = ''
  endDateFilter.value = ''
  handlePageChange(1)
}

const formatTime = (timeStr) => {
  if (!timeStr) return '—'
  return String(timeStr).substring(0, 5)
}

// شارات الألوان
const getActionBadgeVariant = (actionType) => {
  switch (actionType) {
    case 'verbal_warning':
      return 'info'
    case 'written_warning':
      return 'warning'
    case 'salary_deduction':
      return 'primary'
    case 'suspension':
      return 'warning'
    case 'termination':
      return 'danger'
    default:
      return 'secondary'
  }
}

const getStatusBadgeVariant = (effectiveStatus) => {
  switch (effectiveStatus) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'expired':
      return 'secondary'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

const canCancelItem = (item) => {
  if (item.status === 'cancelled') return false
  if (item.payroll_input?.is_processed) return false
  return true
}

// النوافذ المنبثقة (التسجيل اليدوي والتفاصيل)
const isRecordModalOpen = ref(false)
const openRecordModal = () => {
  isRecordModalOpen.value = true
}

const isDetailsModalOpen = ref(false)
const selectedActionId = ref(null)
const openDetailsModal = (item) => {
  selectedActionId.value = item.id
  isDetailsModalOpen.value = true
}

const handleActionUpdated = async () => {
  await Promise.all([handlePageChange(pagination.value?.current_page || 1), loadQuickStats()])
}

// اعتماد الجزاء
const isApproveDialogOpen = ref(false)
const actionToApprove = ref(null)

const approveConfirmMessage = computed(() => {
  const item = actionToApprove.value
  if (!item) return ''

  if (item.action_type === 'termination') {
    return `تنبيه هام: اعتماد القرار رقم (${item.number}) للموظف "${item.employee?.full_name}" سيؤدي إلى تغيير حالته الوظيفية إلى (مفصول / Dismissed) وإغلاق عقده النشط فوراً. هل أنت متأكد من المتابعة؟`
  }

  const deductionNote =
    Number(item.deduction_amount) > 0
      ? ` وسيتم إدراج خصم مالي بقيمة (${formatCurrency(item.deduction_amount)}) في مدخلات الرواتب تلقائياً`
      : ''

  return `هل أنت متأكد من رغبتك في اعتماد الجزاء رقم (${item.number}) بحق الموظف "${item.employee?.full_name}" (${item.action_type_label})${deductionNote}؟`
})

const openApproveDialog = (item) => {
  actionToApprove.value = item
  isApproveDialogOpen.value = true
}

const confirmApproveAction = async () => {
  if (!actionToApprove.value) return
  try {
    await disciplinaryStore.approveAction(actionToApprove.value.id)
    toast.success(`تم اعتماد الجزاء التأديبي (${actionToApprove.value.number}) وتنفيذ أثره بنجاح.`)
    await handleActionUpdated()
  } catch {
    toast.error(disciplinaryStore.error || 'تعذر اعتماد الجزاء التأديبي.')
  } finally {
    isApproveDialogOpen.value = false
    actionToApprove.value = null
  }
}

// الإعفاء / إلغاء الجزاء
const isCancelModalOpen = ref(false)
const actionToCancel = ref(null)
const cancellationReason = ref('')
const isCancelling = ref(false)

const openCancelModal = (item) => {
  actionToCancel.value = item
  cancellationReason.value = ''
  isCancelModalOpen.value = true
}

const closeCancelModal = () => {
  if (isCancelling.value) return
  isCancelModalOpen.value = false
  actionToCancel.value = null
  cancellationReason.value = ''
}

const confirmCancelAction = async () => {
  if (!actionToCancel.value || cancellationReason.value.trim().length < 3) return

  isCancelling.value = true
  try {
    await disciplinaryStore.cancelAction(actionToCancel.value.id, {
      cancellation_reason: cancellationReason.value.trim(),
    })
    toast.success(`تم إلغاء المخالفة (${actionToCancel.value.number}) والتراجع عن أثرها بنجاح.`)
    closeCancelModal()
    await handleActionUpdated()
  } catch {
    toast.error(disciplinaryStore.error || 'تعذر إلغاء المخالفة.')
  } finally {
    isCancelling.value = false
  }
}

// حذف السجل
const isDeleteDialogOpen = ref(false)
const actionToDelete = ref(null)

const openDeleteDialog = (item) => {
  actionToDelete.value = item
  isDeleteDialogOpen.value = true
}

const confirmDeleteAction = async () => {
  if (!actionToDelete.value) return
  try {
    await disciplinaryStore.deleteAction(actionToDelete.value.id)
    toast.success(`تم حذف سجل المخالفة (${actionToDelete.value.number}) بنجاح.`)
    const targetPage =
      actions.value.length === 0 && pagination.value?.current_page > 1
        ? pagination.value.current_page - 1
        : pagination.value?.current_page || 1
    await Promise.all([handlePageChange(targetPage), loadQuickStats()])
  } catch {
    toast.error(disciplinaryStore.error || 'تعذر حذف سجل المخالفة.')
  } finally {
    isDeleteDialogOpen.value = false
    actionToDelete.value = null
  }
}

onMounted(async () => {
  const loaders = [
    handlePageChange(1),
    loadQuickStats(),
    violationTypeStore.violationTypes.length === 0
      ? violationTypeStore.fetchViolationTypes()
      : Promise.resolve(),
  ]

  if (isManagementView.value && employeeStore.allEmployees.length === 0) {
    loaders.push(employeeStore.fetchAllEmployees())
  }

  await Promise.all(loaders)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

:deep(.filter-embedded-dropdown .p-dropdown),
:deep(.filter-embedded-dropdown [data-pc-name='dropdown']),
:deep(.filter-embedded-dropdown [data-pc-section='root']),
:deep(.filter-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 42px !important;
  min-height: 42px !important;
}

:deep(.filter-embedded-dropdown .p-dropdown-label),
:deep(.filter-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}
</style>
