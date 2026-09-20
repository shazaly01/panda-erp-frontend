<!-- src/modules/hr/views/attendance/PublicEmployeeAttendanceReport.vue -->
<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 text-slate-800 flex flex-col items-center font-sans p-2.5 sm:p-5 md:p-8 antialiased relative overflow-x-hidden"
  >
    <!-- الخلفية المتحركة الموحدة للنظام -->
    <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <svg
        class="absolute bottom-0 left-0 right-0 w-full min-w-[1000px] h-[340px] transition-all duration-1000"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          class="animate-wave-slow"
          fill="url(#wave-gradient-indigo)"
          opacity="0.3"
          d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
        <path
          class="animate-wave-fast"
          fill="url(#wave-gradient-emerald)"
          opacity="0.2"
          d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,218.7C672,203,768,149,864,122.7C960,96,1056,96,1152,117.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
        <defs>
          <linearGradient id="wave-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.15" />
            <stop offset="50%" stop-color="#818cf8" stop-opacity="0.05" />
            <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.3" />
          </linearGradient>
          <linearGradient id="wave-gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <div
      class="fixed top-[-10%] left-[-15%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-200/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none z-0"
    ></div>
    <div
      class="fixed inset-0 bg-[radial-gradient(#0f172a03_1px,transparent_1px)] [background-size:24px_24px] sm:[background-size:32px_32px] opacity-60 z-0 pointer-events-none"
    ></div>

    <!-- الحاوية الرئيسية المتجاوبة -->
    <div class="w-full max-w-7xl z-10 relative space-y-4 sm:space-y-6 my-auto">
      <!-- الهيدر واللوجو العام -->
      <div class="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
        <div class="relative group">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 rounded-full blur-md opacity-70"
          ></div>
          <img
            v-if="brandingStore.logoMiniUrl"
            :src="brandingStore.logoMiniUrl"
            :alt="brandingStore.appName"
            class="logo-main mx-auto mb-1 relative z-10 transition-transform duration-500 group-hover:scale-105 h-10 sm:h-12 w-auto object-contain"
          />
        </div>
        <div>
          <h1
            class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950 drop-shadow-sm"
          >
            كشف الحضور والانصراف الذكي
          </h1>
          <p class="text-[11px] sm:text-xs md:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1">
            البحث بالباركود، الرقم الوظيفي، أو الهاتف مع ترتيب أسبوعي يبدأ من يوم الأحد
          </p>
        </div>
      </div>

      <!-- بطاقة الفلاتر والبحث (تختفي عند الطباعة) -->
      <div
        class="no-print bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] relative"
      >
        <div
          class="absolute top-0 left-0 right-0 h-[3px] overflow-hidden rounded-t-2xl sm:rounded-t-3xl"
        >
          <div
            class="w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-shimmer"
          ></div>
        </div>

        <!-- حقول الفلاتر -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
          <div class="space-y-1">
            <label
              class="block text-xs font-bold text-slate-700 tracking-wide flex items-center justify-between"
            >
              <span>بيانات الموظف *</span>
              <span class="text-[10px] text-indigo-600 font-normal">باركود / وظيفي / هاتف</span>
            </label>
            <div class="relative">
              <input
                ref="searchInputRef"
                v-model="filters.identifier"
                type="text"
                placeholder="امسح الباركود أو اكتب الرقم..."
                @keyup.enter="fetchReport"
                autofocus
                class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-sm font-mono pl-9"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 tracking-wide"
              >من تاريخ (افتراضي: 4 أسابيع)</label
            >
            <input
              v-model="filters.start_date"
              type="date"
              class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-sm"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 tracking-wide">إلى تاريخ</label>
            <input
              v-model="filters.end_date"
              type="date"
              class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-sm"
            />
          </div>

          <div class="flex gap-2 pt-1 sm:pt-0">
            <button
              @click="fetchReport"
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg
                v-if="loading"
                class="animate-spin h-4 w-4 text-white"
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
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ loading ? 'جاري التحميل...' : 'بحث وعرض' }}</span>
            </button>

            <button
              v-if="reportData"
              @click="printReport"
              title="طباعة التقرير"
              type="button"
              class="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              🖨️
            </button>
          </div>
        </div>

        <!-- أزرار التبديل ومعلومات الموظف -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100 gap-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-[11px] sm:text-xs font-bold text-slate-500">طريقة العرض:</span>
            <div
              class="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 w-full sm:w-auto"
            >
              <button
                @click="changeGroupBy('week')"
                :class="[
                  'flex-1 sm:flex-none px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200',
                  filters.group_by === 'week'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                ]"
              >
                📅 أسبوعي (يبدأ الأحد)
              </button>
              <button
                @click="changeGroupBy('month')"
                :class="[
                  'flex-1 sm:flex-none px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200',
                  filters.group_by === 'month'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                ]"
              >
                🗓️ شهري (آخر شهر)
              </button>
            </div>
          </div>

          <div
            v-if="reportData?.employee"
            class="text-[11px] sm:text-xs text-slate-600 font-medium bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl flex flex-wrap items-center gap-2"
          >
            <div>
              الموظف:
              <span class="font-bold text-slate-900">{{ reportData.employee.full_name }}</span>
            </div>
            <span class="text-slate-300">|</span>
            <div>
              الرقم:
              <span class="font-mono font-bold text-slate-800">{{
                reportData.employee.employee_number
              }}</span>
            </div>
            <span v-if="reportData.employee.phone" class="text-slate-300">|</span>
            <div v-if="reportData.employee.phone">
              الهاتف:
              <span class="font-mono font-bold text-slate-800">{{
                reportData.employee.phone
              }}</span>
            </div>
            <span v-if="reportData.employee.barcode" class="text-slate-300">|</span>
            <div v-if="reportData.employee.barcode">
              الباركود:
              <span class="font-mono font-bold text-indigo-600">{{
                reportData.employee.barcode
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- عرض محتوى التقرير -->
      <div v-if="reportData" class="space-y-4 sm:space-y-6 animate-fadeIn">
        <!-- كروت الإجماليات العامة -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div
            class="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-0.5 sm:space-y-1"
          >
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-400"
              >إجمالي أيام الحضور</span
            >
            <div class="text-xl sm:text-2xl font-black text-emerald-600">
              {{ reportData.overall_summary.present_days }}
            </div>
            <div class="text-[9px] sm:text-[10px] text-slate-400">
              من أصل {{ reportData.overall_summary.total_days_logged }} مسجل
            </div>
          </div>

          <div
            class="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-0.5 sm:space-y-1"
          >
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-400"
              >ساعات العمل الفعلية</span
            >
            <div class="text-xl sm:text-2xl font-black text-indigo-600">
              {{ reportData.overall_summary.total_work_hours }}
            </div>
            <div class="text-[9px] sm:text-[10px] text-slate-400">
              {{ reportData.overall_summary.total_work_minutes }} دقيقة
            </div>
          </div>

          <div
            class="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-0.5 sm:space-y-1"
          >
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-400"
              >إجمالي التأخيرات</span
            >
            <div class="text-xl sm:text-2xl font-black text-amber-500">
              {{ reportData.overall_summary.total_delay_minutes }}
            </div>
            <div class="text-[9px] sm:text-[10px] text-slate-400">دقيقة تأخير</div>
          </div>

          <div
            class="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-0.5 sm:space-y-1"
          >
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-400">أيام الغياب</span>
            <div class="text-xl sm:text-2xl font-black text-rose-600">
              {{ reportData.overall_summary.absent_days }}
            </div>
            <div class="text-[9px] sm:text-[10px] text-slate-400">بدون إذن</div>
          </div>
        </div>

        <!-- شريط دوام الشهر الكامل -->
        <div
          v-if="filters.group_by === 'month' && fullMonthDays.length > 0"
          class="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-3.5 sm:p-5 md:p-6 space-y-3"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 animate-pulse"
              ></span>
              <h3 class="text-xs sm:text-sm md:text-base font-black text-slate-800">
                شريط أيام الشهر الكامل
              </h3>
            </div>
            <span class="text-[10px] sm:text-[11px] text-slate-400 font-medium"
              >مرر أفقياً &larr;</span
            >
          </div>

          <div class="overflow-x-auto pb-2 scrollbar-thin">
            <table class="w-full text-center border-collapse">
              <thead>
                <tr
                  class="bg-slate-50 text-[10px] sm:text-[11px] text-slate-500 font-bold border-b border-slate-200"
                >
                  <th
                    class="p-1.5 sm:p-2 border border-slate-200 min-w-[65px] sm:min-w-[75px] bg-slate-100 sticky right-0 z-10 text-[10px]"
                  >
                    المؤشر
                  </th>
                  <th
                    v-for="day in fullMonthDays"
                    :key="day.date"
                    :class="[
                      'p-1.5 sm:p-2 border border-slate-200 min-w-[42px] sm:min-w-[50px]',
                      isWeekend(day.date) ? 'bg-slate-100/80 text-rose-500 font-black' : '',
                    ]"
                  >
                    <span class="block text-[8px] sm:text-[9px]">{{ day.shortDayName }}</span>
                    <span class="font-mono text-[11px] sm:text-xs">{{ day.dayNumber }}</span>
                  </th>
                </tr>
              </thead>
              <tbody class="text-xs font-mono">
                <tr>
                  <td
                    class="p-1.5 sm:p-2 border border-slate-200 font-sans font-bold text-slate-700 bg-slate-50 sticky right-0 z-10 text-[10px]"
                  >
                    الحالة
                  </td>
                  <td
                    v-for="day in fullMonthDays"
                    :key="'status-' + day.date"
                    class="p-1 border border-slate-200"
                  >
                    <span
                      v-if="day.record"
                      :class="[
                        'w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-md sm:rounded-lg flex items-center justify-center font-bold text-[9px] sm:text-[10px]',
                        day.record.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : day.record.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : day.record.status === 'absent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600',
                      ]"
                    >
                      {{ getStatusAbbr(day.record.status) }}
                    </span>
                    <span v-else class="text-slate-300 font-sans text-[9px]">-</span>
                  </td>
                </tr>

                <tr>
                  <td
                    class="p-1.5 sm:p-2 border border-slate-200 font-sans font-bold text-slate-700 bg-slate-50 sticky right-0 z-10 text-[10px]"
                  >
                    الساعات
                  </td>
                  <td
                    v-for="day in fullMonthDays"
                    :key="'hours-' + day.date"
                    class="p-1 border border-slate-200 text-[10px] sm:text-xs font-bold"
                  >
                    <span v-if="day.record && day.record.work_hours > 0" class="text-indigo-600">
                      {{ day.record.work_hours }}
                    </span>
                    <span
                      v-else-if="day.record && day.record.status === 'present'"
                      class="text-emerald-600"
                    >
                      8
                    </span>
                    <span v-else class="text-slate-300 font-normal">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- فترات الأسابيع: تبدأ من الأحد (كروت بالموبايل / مصفوفة باللابتوب) -->
        <div class="space-y-4 sm:space-y-6">
          <div
            v-for="period in reportData.periods"
            :key="period.period_key"
            class="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
          >
            <!-- رأس الفترة -->
            <div
              class="bg-slate-50/90 p-3 sm:p-4 md:px-6 flex flex-wrap justify-between items-center gap-2 sm:gap-3 border-b border-slate-200/80"
            >
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-indigo-600"></span>
                <h3 class="text-xs sm:text-sm md:text-base font-black text-slate-800">
                  {{ period.period_title }}
                </h3>
              </div>

              <div class="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono">
                <span
                  class="bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-bold border border-emerald-100 font-sans"
                >
                  حضور: {{ period.subtotal.present_days }} أيام
                </span>
                <span
                  class="bg-indigo-50 text-indigo-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-bold border border-indigo-100 font-sans"
                >
                  ساعات: {{ period.subtotal.total_work_hours }} س
                </span>
                <span
                  v-if="period.subtotal.total_delay_minutes > 0"
                  class="bg-amber-50 text-amber-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-bold border border-amber-100 font-sans"
                >
                  تأخير: {{ period.subtotal.total_delay_minutes }} د
                </span>
              </div>
            </div>

            <!-- عرض الهاتف (Mobile View): مرتب من الأحد إلى السبت -->
            <div class="block md:hidden p-3 space-y-2.5 bg-slate-50/40">
              <div
                v-for="dayCol in getDaysColumns(period)"
                :key="'mobile-' + dayCol.date"
                :class="[
                  'rounded-xl border p-3 transition-all',
                  dayCol.record
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-50/60 border-dashed border-slate-200',
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      :class="[
                        'text-xs font-black',
                        isWeekend(dayCol.date) ? 'text-rose-600' : 'text-slate-800',
                      ]"
                    >
                      {{ dayCol.dayName }}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400">
                      {{ dayCol.formattedDate }}
                    </span>
                  </div>

                  <div v-if="dayCol.record">
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-black inline-block',
                        dayCol.record.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dayCol.record.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : dayCol.record.status === 'absent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700',
                      ]"
                    >
                      {{ formatStatus(dayCol.record.status) }}
                    </span>
                  </div>
                  <div v-else>
                    <span class="text-[10px] text-slate-400 font-medium">
                      {{ isWeekend(dayCol.date) ? 'عطلة أسبوعية' : 'غير موجود' }}
                    </span>
                  </div>
                </div>

                <div
                  v-if="dayCol.record"
                  class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs"
                >
                  <div class="flex items-center gap-3 font-mono text-[11px]">
                    <div>
                      <span class="text-slate-400 text-[10px] font-sans">دخول: </span>
                      <span class="font-bold text-slate-800">{{
                        dayCol.record.check_in || '--:--'
                      }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 text-[10px] font-sans">خروج: </span>
                      <span class="font-bold text-slate-800">{{
                        dayCol.record.check_out || '--:--'
                      }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      v-if="dayCol.record.delay_minutes > 0"
                      class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
                    >
                      تأخير {{ dayCol.record.delay_minutes }}د
                    </span>
                    <span class="font-mono font-bold text-indigo-600 text-xs">
                      {{ dayCol.record.work_hours }} س
                    </span>
                  </div>
                </div>
              </div>

              <!-- بطاقة ملخص الأسبوع للموبايل -->
              <div
                class="bg-indigo-950 text-white rounded-xl p-3 shadow-md flex justify-between items-center text-xs"
              >
                <span class="font-bold">مجموع الأسبوع:</span>
                <div class="flex items-center gap-3 font-mono">
                  <span>{{ period.subtotal.present_days }} أيام</span>
                  <span class="text-emerald-400 font-black"
                    >{{ period.subtotal.total_work_hours }} ساعة</span
                  >
                  <span v-if="period.subtotal.total_delay_minutes > 0" class="text-amber-400">
                    {{ period.subtotal.total_delay_minutes }}د تأخير
                  </span>
                </div>
              </div>
            </div>

            <!-- عرض اللابتوب (Desktop View): الأعمدة مرتبة من الأحد إلى السبت -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-center border-collapse min-w-[850px]">
                <thead>
                  <tr
                    class="bg-slate-100/70 text-slate-700 font-black text-xs border-b border-slate-200"
                  >
                    <th
                      v-for="dayCol in getDaysColumns(period)"
                      :key="dayCol.date"
                      :class="[
                        'p-2.5 sm:p-3 border-l border-slate-200/80 w-[12.5%]',
                        isWeekend(dayCol.date) ? 'bg-rose-50/40 text-rose-700' : '',
                      ]"
                    >
                      <span class="block text-xs sm:text-sm font-extrabold">{{
                        dayCol.dayName
                      }}</span>
                      <span
                        class="block text-[10px] sm:text-[11px] font-mono font-medium text-slate-500 mt-0.5"
                        >{{ dayCol.formattedDate }}</span
                      >
                    </th>
                    <th
                      class="p-2.5 sm:p-3 bg-indigo-50/70 text-indigo-950 font-black text-xs w-[12.5%]"
                    >
                      ملخص الأسبوع
                    </th>
                  </tr>
                </thead>
                <tbody class="align-top">
                  <tr>
                    <td
                      v-for="dayCol in getDaysColumns(period)"
                      :key="'cell-' + dayCol.date"
                      :class="[
                        'p-2 sm:p-2.5 border-l border-slate-200/80',
                        isWeekend(dayCol.date) ? 'bg-slate-50/40' : '',
                      ]"
                    >
                      <div
                        v-if="dayCol.record"
                        class="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 shadow-sm hover:shadow transition-all space-y-1.5 sm:space-y-2 text-right"
                      >
                        <div class="flex justify-between items-center">
                          <span
                            :class="[
                              'px-2 py-0.5 rounded-full text-[10px] font-black inline-block',
                              dayCol.record.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dayCol.record.status === 'late'
                                  ? 'bg-amber-100 text-amber-800'
                                  : dayCol.record.status === 'absent'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700',
                            ]"
                          >
                            {{ formatStatus(dayCol.record.status) }}
                          </span>

                          <span class="text-[10px] font-black text-indigo-600 font-mono">
                            {{ dayCol.record.work_hours }} س
                          </span>
                        </div>

                        <div
                          class="text-[10px] sm:text-[11px] space-y-1 font-mono pt-1 border-t border-slate-100"
                        >
                          <div class="flex justify-between text-slate-600">
                            <span class="text-slate-400 font-sans text-[10px]">دخول:</span>
                            <span class="font-bold text-slate-800">{{
                              dayCol.record.check_in || '--:--'
                            }}</span>
                          </div>
                          <div class="flex justify-between text-slate-600">
                            <span class="text-slate-400 font-sans text-[10px]">خروج:</span>
                            <span class="font-bold text-slate-800">{{
                              dayCol.record.check_out || '--:--'
                            }}</span>
                          </div>
                        </div>

                        <div
                          v-if="dayCol.record.delay_minutes > 0"
                          class="bg-amber-50 text-amber-700 p-1 rounded text-[9px] sm:text-[10px] font-bold text-center"
                        >
                          تأخير {{ dayCol.record.delay_minutes }} دقيقة
                        </div>
                      </div>

                      <div
                        v-else
                        class="h-full min-h-[95px] sm:min-h-[110px] rounded-xl sm:rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-2 text-center text-slate-300 space-y-1"
                      >
                        <span class="text-sm sm:text-base">☕</span>
                        <span class="text-[9px] sm:text-[10px] font-bold text-slate-400">
                          {{ isWeekend(dayCol.date) ? 'عطلة أسبوعية' : 'غير موجود' }}
                        </span>
                      </div>
                    </td>

                    <td
                      class="p-2 sm:p-3 bg-indigo-50/40 flex-col justify-center text-center font-mono"
                    >
                      <div
                        class="bg-white rounded-xl sm:rounded-2xl border border-indigo-100 p-2.5 sm:p-3 shadow-sm text-right space-y-1 sm:space-y-1.5"
                      >
                        <div class="text-[10px] sm:text-[11px] text-slate-500 font-sans">
                          حضور فعلي:
                        </div>
                        <div class="text-base sm:text-lg font-black text-emerald-600 font-mono">
                          {{ period.subtotal.present_days }}
                          <span class="text-[9px] sm:text-[10px] font-sans text-slate-400"
                            >أيام</span
                          >
                        </div>

                        <div
                          class="text-[10px] sm:text-[11px] text-slate-500 font-sans pt-1 border-t border-slate-100"
                        >
                          إجمالي الساعات:
                        </div>
                        <div class="text-base sm:text-lg font-black text-indigo-600 font-mono">
                          {{ period.subtotal.total_work_hours }}
                          <span class="text-[9px] sm:text-[10px] font-sans text-slate-400"
                            >ساعة</span
                          >
                        </div>

                        <div
                          v-if="period.subtotal.total_delay_minutes > 0"
                          class="pt-1 border-t border-slate-100"
                        >
                          <div class="text-[9px] sm:text-[10px] text-amber-600 font-bold font-sans">
                            تأخير: {{ period.subtotal.total_delay_minutes }} د
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- حالة عدم وجود بيانات -->
      <div
        v-else-if="!loading && hasSearched"
        class="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-slate-200/80 text-center space-y-2.5 sm:space-y-3"
      >
        <div
          class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-lg sm:text-xl"
        >
          🔍
        </div>
        <h3 class="text-xs sm:text-sm font-bold text-slate-800">لا توجد سجلات حضور مسجلة</h3>
        <p class="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
          لم يتم العثور على أي موظف أو سجلات حضور تطابق البيانات المدخلة ضمن النطاق الزمني المحدد.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useBrandingStore } from '@/stores/brandingStore'
import attendanceLogService from '../../services/attendanceLog.service'

const route = useRoute()
const toast = useToast()
const brandingStore = useBrandingStore()

const searchInputRef = ref(null)
const loading = ref(false)
const hasSearched = ref(false)
const reportData = ref(null)

const filters = ref({
  identifier: '',
  employee_id: '',
  start_date: '',
  end_date: '',
  group_by: 'week',
})

onMounted(() => {
  if (!brandingStore.isLoaded) {
    brandingStore.fetchBranding()
  }

  // دعم التقاط أي متغير ممرر عبر الرابط
  if (route.query.identifier) {
    filters.value.identifier = String(route.query.identifier)
  } else if (route.query.barcode) {
    filters.value.identifier = String(route.query.barcode)
  } else if (route.query.employee_number) {
    filters.value.identifier = String(route.query.employee_number)
  } else if (route.query.phone) {
    filters.value.identifier = String(route.query.phone)
  }

  if (route.query.employee_id) {
    filters.value.employee_id = String(route.query.employee_id)
  }
  if (route.query.group_by) {
    filters.value.group_by = String(route.query.group_by)
  }

  // ضبط التواريخ الافتراضية: آخر 4 أسابيع كاملة تبدأ من يوم الأحد
  const now = new Date()
  const currentDayOfWeek = now.getDay() // 0 = الأحد

  const currentSunday = new Date(now)
  currentSunday.setDate(now.getDate() - currentDayOfWeek)

  const defaultStartSunday = new Date(currentSunday)
  defaultStartSunday.setDate(currentSunday.getDate() - 21)

  const defaultEndSaturday = new Date(currentSunday)
  defaultEndSaturday.setDate(currentSunday.getDate() + 6)

  filters.value.start_date = route.query.start_date
    ? String(route.query.start_date)
    : defaultStartSunday.toISOString().substring(0, 10)

  filters.value.end_date = route.query.end_date
    ? String(route.query.end_date)
    : defaultEndSaturday.toISOString().substring(0, 10)

  nextTick(() => {
    searchInputRef.value?.focus()
  })

  if (filters.value.identifier || filters.value.employee_id) {
    fetchReport()
  }
})

const fetchReport = async () => {
  if (!filters.value.identifier && !filters.value.employee_id) {
    return toast.error('يرجى إدخال الباركود، الرقم الوظيفي، أو رقم الهاتف للموظف.')
  }

  loading.value = true
  hasSearched.value = true

  try {
    const params = {
      group_by: filters.value.group_by,
    }
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.identifier) params.identifier = filters.value.identifier
    if (filters.value.employee_id) params.employee_id = filters.value.employee_id

    const response = await attendanceLogService.getPublicEmployeeDetailedReport(params)
    reportData.value = response.data
    toast.success('تم جلب كشف الحضور بنجاح.')
  } catch (error) {
    reportData.value = null
    const message =
      error.response?.data?.message || 'تعذر جلب التقرير، يرجى التأكد من صحة البيانات.'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const changeGroupBy = (mode) => {
  filters.value.group_by = mode

  const now = new Date()
  if (mode === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    filters.value.start_date = firstDay.toISOString().substring(0, 10)
    filters.value.end_date = lastDay.toISOString().substring(0, 10)
  } else {
    const currentDayOfWeek = now.getDay()
    const currentSunday = new Date(now)
    currentSunday.setDate(now.getDate() - currentDayOfWeek)
    const defaultStartSunday = new Date(currentSunday)
    defaultStartSunday.setDate(currentSunday.getDate() - 21)
    const defaultEndSaturday = new Date(currentSunday)
    defaultEndSaturday.setDate(currentSunday.getDate() + 6)

    filters.value.start_date = defaultStartSunday.toISOString().substring(0, 10)
    filters.value.end_date = defaultEndSaturday.toISOString().substring(0, 10)
  }

  if (reportData.value) {
    fetchReport()
  }
}

const getDaysColumns = (period) => {
  const days = []
  const start = new Date(period.start_date + 'T00:00:00')
  const end = new Date(period.end_date + 'T00:00:00')

  const current = new Date(start)
  while (current <= end) {
    const dateStr = current.toISOString().substring(0, 10)
    const dayName = current.toLocaleDateString('ar-EG', { weekday: 'long' })
    const formattedDate = current.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })

    const record = period.records.find((r) => r.date === dateStr) || null

    days.push({
      date: dateStr,
      dayName,
      formattedDate,
      record,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
}

const fullMonthDays = computed(() => {
  if (!reportData.value || filters.value.group_by !== 'month') return []

  const allRecords = []
  reportData.value.periods.forEach((p) => {
    p.records.forEach((r) => allRecords.push(r))
  })

  const days = []
  const start = new Date(filters.value.start_date + 'T00:00:00')
  const end = new Date(filters.value.end_date + 'T00:00:00')

  const current = new Date(start)
  while (current <= end) {
    const dateStr = current.toISOString().substring(0, 10)
    const dayNumber = current.getDate()
    const shortDayName = current.toLocaleDateString('ar-EG', { weekday: 'narrow' })
    const record = allRecords.find((r) => r.date === dateStr) || null

    days.push({
      date: dateStr,
      dayNumber,
      shortDayName,
      record,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

const isWeekend = (dateStr) => {
  const day = new Date(dateStr + 'T00:00:00').getDay()
  return day === 5 // الجمعة
}

const getStatusAbbr = (status) => {
  const map = {
    present: 'ح',
    late: 'ت',
    absent: 'غ',
    on_leave: 'إ',
  }
  return map[status] || '-'
}

const formatStatus = (status) => {
  const statusMap = {
    present: 'حاضر',
    late: 'متأخر',
    absent: 'غائب',
    on_leave: 'إجازة',
  }
  return statusMap[status] || status
}

const printReport = () => {
  window.print()
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 3.5s infinite linear;
}

@keyframes wave {
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.85);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
}
.animate-wave-slow {
  animation: wave 22s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
}
.animate-wave-fast {
  animation: wave 14s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

@media print {
  body {
    background: white !important;
  }
  .no-print,
  .fixed,
  button,
  input {
    display: none !important;
  }
  .shadow-sm,
  .backdrop-blur-md,
  .backdrop-blur-xl {
    box-shadow: none !important;
    background: white !important;
    border-color: #cbd5e1 !important;
  }
  .block.md\:hidden {
    display: none !important;
  }
  .hidden.md\:block {
    display: block !important;
  }
  table {
    width: 100% !important;
    min-width: 100% !important;
  }
}
</style>
