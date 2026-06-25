<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 text-slate-800 flex flex-col justify-center items-center font-sans p-3 sm:p-6 antialiased relative overflow-hidden"
  >
    <!-- الخلفية المتحركة الموحدة للنظام -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <svg
        class="absolute bottom-0 left-0 right-0 w-full min-w-[1200px] h-[340px] transition-all duration-1000"
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
      class="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none z-0"
    ></div>
    <div
      class="absolute inset-0 bg-[radial-gradient(#0f172a03_1px,transparent_1px)] [background-size:32px_32px] opacity-60 z-0"
    ></div>

    <!-- المحتوى الرئيسي الحاضن للتبديل -->
    <div class="w-full max-w-2xl z-10 relative space-y-6 px-1 sm:px-0">
      <!-- الهيدر واللوجو العام للشركة -->
      <div class="flex flex-col items-center justify-center text-center space-y-3">
        <div class="relative group">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 rounded-full blur-md opacity-70"
          ></div>
          <img
            :src="brandingStore.logoMiniUrl"
            :alt="brandingStore.appName"
            class="logo-main mx-auto mb-2 relative z-10 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight text-slate-950 drop-shadow-sm">
            {{
              appName
                ? `برنامج التدريب الأكاديمي - ${appName}`
                : 'بوابة التقديم على برنامج التدريب الأكاديمي'
            }}
          </h1>
        </div>
      </div>

      <!-- 🌟 أزرار التبديل العلوية الاحترافية بين التقديم والمتابعة (تختفي في حالة عرض نتيجة النجاح الفورية) -->
      <div
        v-if="!isRegistered && currentView !== 'tracked_dashboard'"
        class="flex bg-slate-100 p-1 rounded-2xl max-w-xs mx-auto border border-slate-200/40 shadow-sm"
      >
        <button
          @click="handleApplyTabClick"
          :class="[
            'flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300',
            currentTab === 'apply'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900',
          ]"
        >
          تقديم طلب جديد
        </button>
        <button
          @click="currentTab = 'track'"
          :class="[
            'flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300',
            currentTab === 'track'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-900',
          ]"
        >
          متابعة طلب سابق
        </button>
      </div>

      <!-- حاوية الشاشات الديناميكية ذات تأثير الـ Glassmorphism -->
      <div
        class="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] relative transition-all duration-500"
      >
        <div class="absolute top-0 left-0 right-0 h-[3px] overflow-hidden rounded-t-3xl">
          <div
            class="w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-shimmer"
          ></div>
        </div>

        <!-- ========================================== -->
        <!-- شاشة التقديم لأول مرة (Apply Tab) -->
        <!-- ========================================== -->
        <div v-if="currentTab === 'apply' && !isRegistered" class="space-y-5 animate-fadeIn">
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 tracking-wide"
              >التحقق الرقمي واللقطة الحية الشخصية *</label
            >
            <div
              class="relative w-full aspect-video bg-slate-950 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center group/cam"
            >
              <video
                v-show="isCameraOpen && !capturedImage"
                ref="videoRef"
                autoplay
                playsinline
                class="w-full h-full object-cover transform -scale-x-100"
              ></video>

              <img
                v-if="capturedImage"
                :src="capturedImage"
                class="w-full h-full object-cover transform -scale-x-100 animate-scaleUp"
                alt="اللقطة الحية للمتدرب"
              />

              <div v-if="!isCameraOpen && !capturedImage" class="text-center p-6 space-y-2 z-10">
                <div
                  class="h-12 w-12 rounded-full bg-slate-900/5 flex items-center justify-center mx-auto text-slate-400 group-hover/cam:scale-105 transition-transform duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p class="text-xs font-bold text-slate-400">عدسة الكاميرا مغلقة حالياً</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                v-if="!isCameraOpen && !capturedImage"
                type="button"
                @click="startCamera"
                class="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all duration-200"
              >
                فتح الكاميرا والتقاط صورة
              </button>
              <button
                v-if="isCameraOpen && !capturedImage"
                type="button"
                @click="capturePhoto"
                class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-2.5 text-xs font-bold shadow-md transition-all duration-200"
              >
                اخذ لقطة
              </button>
              <button
                v-if="capturedImage"
                type="button"
                @click="retakePhoto"
                class="flex-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl py-2.5 text-xs font-bold transition-all duration-200"
              >
                إعادة التقاط الصورة الشخصية
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >الاسم بالكامل *</label
              >
              <input
                v-model="form.full_name"
                type="text"
                placeholder="أدخل اسمك رباعياً باللغة العربية..."
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >رقم الهاتف الجوال *</label
              >
              <input
                v-model="form.phone"
                type="tel"
                placeholder="مثال: 09xxxxxxxx"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-medium"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >البريد الإلكتروني</label
              >
              <input
                v-model="form.email"
                type="email"
                placeholder="name@example.com"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-left"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >رقم الهوية الوطنية</label
              >
              <input
                v-model="form.national_id"
                type="text"
                placeholder="أدخل رقم الهوية أو الإقامة..."
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >الجامعة أو المعهد الأكاديمي *</label
              >
              <input
                v-model="form.academic_institution"
                type="text"
                placeholder=""
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >التخصص الأكاديمي الرئيسي *</label
              >
              <input
                v-model="form.academic_major"
                type="text"
                placeholder=""
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >تاريخ بدء التدريب *</label
              >
              <input
                v-model="form.internship_start_date"
                type="date"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-medium"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >تاريخ انتهاء التدريب *</label
              >
              <input
                v-model="form.internship_end_date"
                type="date"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-medium"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 tracking-wide"
                >الساعات التدريبية المطلوبة</label
              >
              <input
                v-model.number="form.required_training_hours"
                type="number"
                min="1"
                placeholder="مثال: 120 ساعة"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm text-right font-mono"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 tracking-wide"
              >ملاحظات أو متطلبات تدريبية خاصة من الجامعة</label
            >
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="اكتب أي ملاحظات إضافية ترغب في إطلاع إدارة الموارد البشرية عليها..."
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all duration-300 shadow-sm resize-none"
            ></textarea>
          </div>

          <button
            @click="handleSubmit"
            :disabled="store.loading"
            class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-4 text-sm font-bold shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-5 flex items-center justify-center gap-2"
          >
            <span v-if="store.loading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
              جاري رفع الصورة ومستندات التدريب...
            </span>
            <span v-else>تقديم طلب التدريب رسمياً</span>
          </button>
        </div>

        <!-- ========================================== -->
        <!-- شاشة نجاح التسجيل لأول مرة مع كود التتبع -->
        <!-- ========================================== -->
        <div
          v-else-if="currentTab === 'apply' && isRegistered"
          class="text-center space-y-6 animate-scaleUp pb-2"
        >
          <div
            class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm"
          >
            <svg
              class="h-6 w-6 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 class="text-2xl font-black text-slate-900">تم تسجيل طلب التدريب بنجاح!</h2>
            <p class="text-xs text-slate-500 font-medium mt-1">
              تم إرسال مستنداتك إلى إدارة الموارد البشرية بنجاح، يرجى حفظ كود المتابعة وتذكرة
              المراجعة أدناه.
            </p>
          </div>

          <!-- بطاقة النجاح الفورية القابلة للحفظ والتحميل -->
          <div
            ref="passCardRef"
            class="bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/60 shadow-inner relative max-w-sm mx-auto overflow-hidden animate-fadeIn"
          >
            <div
              class="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-slate-200"
            >
              <img
                :src="capturedImage"
                class="w-full h-full object-cover transform -scale-x-100"
                alt="صورة المتقدم"
              />
            </div>

            <!-- 🌟 حقل كود المتابعة البارز الجديد -->
            <div
              class="mb-4 bg-indigo-950 border border-indigo-900 p-3 rounded-xl text-center shadow-md"
            >
              <span class="block text-[10px] text-indigo-400 font-black tracking-wide mb-0.5"
                >كود المتابعة السري (احفظه جيداً)</span
              >
              <span class="text-xl font-mono font-black text-white tracking-[0.3em] pl-[0.3em]">{{
                applicationData?.tracking_code
              }}</span>
            </div>

            <div class="space-y-2.5 text-right text-xs">
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">اسـم المتــدرب:</span>
                <span class="font-extrabold text-slate-800 text-sm tracking-wide">{{
                  applicationData?.full_name
                }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">رقم الجـــــوال:</span>
                <span class="font-mono text-slate-700 font-bold tracking-wide">{{
                  applicationData?.phone
                }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">المنشأة التعليمية:</span>
                <span class="text-slate-800 font-extrabold">{{
                  applicationData?.academic_institution
                }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">التخصص الدراسي:</span>
                <span class="text-indigo-600 font-black">{{
                  applicationData?.academic_major
                }}</span>
              </div>
              <div
                class="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-200/40"
              >
                <span class="text-slate-400 font-semibold">تاريخ التقديم:</span>
                <span class="font-mono text-slate-600 font-bold tracking-wide">{{
                  new Date().toISOString().substring(0, 10)
                }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
            <button
              @click="sharePassCard"
              :disabled="isProcessingImage"
              class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl py-3 px-4 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {{ isProcessingImage ? 'جاري التحضير...' : 'مشاركة التذكرة' }}
            </button>

            <button
              @click="downloadPassCard"
              :disabled="isProcessingImage"
              class="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-4 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              تحميل التذكرة كصورة
            </button>
          </div>

          <!-- رابط ينقل المتدرب لبوابة المتابعة مباشرة -->
          <div class="pt-3">
            <button
              @click="goToTrackTab"
              class="text-xs font-bold text-indigo-600 hover:text-indigo-500 underline transition-colors"
            >
              الانتقال لبوابة المتابعة والتعديل الآن &larr;
            </button>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- شاشة بوابة التتبع والمتابعة (Track Tab) -->
        <!-- ========================================== -->
        <div v-else-if="currentTab === 'track'" class="animate-fadeIn">
          <!-- 1. شاشة تسجيل الدخول بالتتبع -->
          <TrackingLogin v-if="currentView === 'login'" @on-tracked="handleTrackedSuccess" />

          <!-- 2. شاشات العرض الموجهة بناء على حالة الطلب المرتجعة -->
          <div v-else-if="currentView === 'tracked_dashboard'" class="space-y-4">
            <!-- زر العودة الفوقي للخروج من جلسة التتبع الحالية -->
            <div class="text-right">
              <button
                @click="exitTrackSession"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                &rarr; تسجيل الخروج من البوابة
              </button>
            </div>

            <!-- أ: إذا كان الطلب مقبولاً (approved) يعرض بطاقة الـ QR Code منعا للتعديل -->
            <QrPassCard
              v-if="store.currentTrackedApplication?.status === 'approved'"
              :application="store.currentTrackedApplication"
            />

            <!-- ب: إذا كان الطلب معلقاً (pending) يفتح المكون محرر التعديل الشامل للبيانات -->
            <TraineeApplicationEditor
              v-else-if="store.currentTrackedApplication?.status === 'pending'"
              :application="store.currentTrackedApplication"
              @on-updated="handleTrackedUpdate"
            />

            <!-- ج: إذا كان الطلب مرفوضاً -->
            <div v-else class="text-center py-6 space-y-3 animate-scaleUp">
              <div
                class="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 font-bold"
              >
                X
              </div>
              <h3 class="text-lg font-black text-slate-900">نعتذر منك، تم رفض الطلب</h3>
              <p class="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                بناءً على مراجعة المستندات والأعداد المتاحة، تعذر قبول طلب تدريبك لهذا الفصل. نتمنى
                لك التوفيق.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { toPng } from 'html-to-image'
import { useBrandingStore } from '@/stores/brandingStore'
import { useInternshipStore } from '../../stores/internshipStore'

// استيراد المكونات الفرعية المجزأة والمبنية حديثاً
import TrackingLogin from './components/TrackingLogin.vue'
import QrPassCard from './components/QrPassCard.vue'
import TraineeApplicationEditor from './components/TraineeApplicationEditor.vue'

const brandingStore = useBrandingStore()
const store = useInternshipStore()
const toast = useToast()

const { appName } = storeToRefs(brandingStore)

// متغيرات الكاميرا والتحكم باللقطات
const videoRef = ref(null)
const canvasRef = ref(null)
const passCardRef = ref(null)
const isCameraOpen = ref(false)
const capturedImage = ref(null)
const photoBlob = ref(null)

// متغيرات الحالة الأساسية
const currentTab = ref('apply') // التبويب الحالي: apply | track
const currentView = ref('login') // طريقة العرض بالتتبع: login | tracked_dashboard
const isRegistered = ref(false)
const isProcessingImage = ref(false)
const applicationData = ref(null)

const form = ref({
  full_name: '',
  phone: '',
  email: '',
  national_id: '',
  academic_institution: '',
  academic_major: '',
  internship_start_date: '',
  internship_end_date: '',
  required_training_hours: null,
  notes: '',
})

onMounted(() => {
  if (!brandingStore.isLoaded) {
    brandingStore.fetchBranding()
  }
})

const startCamera = async () => {
  capturedImage.value = null
  photoBlob.value = null
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      isCameraOpen.value = true
    }
  } catch (err) {
    console.error('Failed to open camera', err)
    toast.error('لم نتمكن من تشغيل الكاميرا، يرجى تفعيل إذن الصلاحية للمتصفح.')
  }
}

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  capturedImage.value = canvas.toDataURL('image/jpeg')

  canvas.toBlob(
    (blob) => {
      if (blob) photoBlob.value = blob
    },
    'image/jpeg',
    0.95,
  )

  stopCamera()
}

const retakePhoto = () => {
  capturedImage.value = null
  photoBlob.value = null
  startCamera()
}

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach((track) => track.stop())
    videoRef.value.srcObject = null
  }
  isCameraOpen.value = false
}

/**
 * إرسال الطلب وحفظ البيانات لأول مرة
 */
const handleSubmit = async () => {
  if (!form.value.full_name.trim()) return toast.error('يرجى إدخال اسمك بالكامل.')
  if (!form.value.phone.trim()) return toast.error('يرجى إدخال رقم هاتفك الجوال.')
  if (!form.value.academic_institution.trim()) return toast.error('يرجى تحديد جهتك الأكاديمية.')
  if (!form.value.academic_major.trim()) return toast.error('يرجى إدخال تخصصك الأكاديمي.')
  if (!form.value.internship_start_date) return toast.error('يرجى تحديد تاريخ بدء التدريب.')
  if (!form.value.internship_end_date) return toast.error('يرجى تحديد تاريخ انتهاء التدريب.')
  if (!photoBlob.value)
    return toast.error('برجاء التقاط صورتك الشخصية الحية عبر الكاميرا أولاً لاستكمال الطلب.')

  const formData = new FormData()
  formData.append('photo', photoBlob.value, 'intern_live_capture.jpg')
  formData.append('full_name', form.value.full_name.trim())
  formData.append('phone', form.value.phone.trim())

  if (form.value.email && form.value.email.trim()) formData.append('email', form.value.email.trim())
  if (form.value.national_id && form.value.national_id.trim())
    formData.append('national_id', form.value.national_id.trim())

  formData.append('academic_institution', form.value.academic_institution.trim())
  formData.append('academic_major', form.value.academic_major.trim())
  formData.append('internship_start_date', form.value.internship_start_date)
  formData.append('internship_end_date', form.value.internship_end_date)

  if (
    form.value.required_training_hours !== null &&
    form.value.required_training_hours !== '' &&
    !isNaN(Number(form.value.required_training_hours))
  ) {
    formData.append('required_training_hours', String(form.value.required_training_hours))
  }

  if (form.value.notes && form.value.notes.trim()) formData.append('notes', form.value.notes.trim())

  try {
    // استدعاء الأكشن من الـ Store والتحويل للحالة المسجلة بنجاح
    const result = await store.submitPublicApplication(formData)
    applicationData.value = result
    isRegistered.value = true
    toast.success('تم تسجيل طلب انضمامك للتدريب وإصدار تذكرة المراجعة بنجاح!')

    // 🌟 الحل: تصفير حقول النموذج فوراً لمنع التكرار عند العودة للتبويب
    form.value = {
      full_name: '',
      phone: '',
      email: '',
      national_id: '',
      academic_institution: '',
      academic_major: '',
      internship_start_date: '',
      internship_end_date: '',
      required_training_hours: null,
      notes: '',
    }
    photoBlob.value = null // تفريغ ملف الصورة القديم من الذاكرة
  } catch {
    toast.error(store.error || 'فشلت عملية إرسال الطلب، يرجى مراجعة المدخلات والمحاولة لاحقاً.')
  }
}

// 🌟 دوال المعالجة المربوطة بالأحداث (Events) القادمة من المكونات الفرعية
const handleTrackedSuccess = () => {
  currentView.value = 'tracked_dashboard'
}

/**
 * 🌟 عند التعديل بنجاح: نقوم بنقل المستخدم فوراً لشاشة النجاح الموحدة
 * وعرض كارت التذكرة بالبيانات والصورة الجديدة المحدثة
 */
const handleTrackedUpdate = (updatedApplication) => {
  // 1. تحديث البيانات في الـ Store للمزامنة
  store.currentTrackedApplication = updatedApplication

  // 2. ضخ البيانات المحدثة داخل كائن كارت النجاح
  applicationData.value = updatedApplication

  // 3. تحديث رابط الصورة المعروضة في الكارت (سواء القديمة أو الملتقطة حديثاً)
  capturedImage.value = updatedApplication.photo_url

  // 4. تفعيل علم النجاح وتبديل التبويب برمجياً لفتح الشاشة الفخمة فوراً
  isRegistered.value = true
  currentTab.value = 'apply'
}

const exitTrackSession = () => {
  store.currentTrackedApplication = null
  currentView.value = 'login'
}

const goToTrackTab = () => {
  isRegistered.value = false
  currentTab.value = 'track'
  currentView.value = 'login'
}

const handleApplyTabClick = () => {
  currentTab.value = 'apply'
  // إذا كان هناك تقديم ناجح سابق وقرر العودة للتقديم، نظف لقطة الكاميرا القديمة
  capturedImage.value = null
  applicationData.value = null
}

/**
 * تحميل التذكرة الفورية كصورة PNG بجودة ممتازة ودعم كامل للغة العربية بدون أخطاء أمان
 */
const downloadPassCard = async () => {
  if (!passCardRef.value) return
  isProcessingImage.value = true

  try {
    const width = passCardRef.value.offsetWidth
    const height = passCardRef.value.offsetHeight

    const dataUrl = await toPng(passCardRef.value, {
      quality: 0.95,
      pixelRatio: 2,
      width: width,
      height: height,
      skipFonts: true, // 🛡️ الحل الجذري: تخطي فحص الخطوط الخارجية لمنع خطأ SecurityError
      cacheBust: true, // 🛡️ منع المتصفح من كاش الصور القديم لضمان جلب الصورة الحية
      style: {
        margin: '0',
        transform: 'none',
      },
    })

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `Intern-Application-${applicationData.value?.full_name || 'HR'}.png`
    link.click()

    toast.success('تم تحميل تذكرة طلب التدريب إلى جهازك!')
  } catch (error) {
    console.error('Download failed', error)
    toast.error('لم نتمكن من معالجة كارت التذكرة، يرجى حفظ لقطة الشاشة يدوياً.')
  } finally {
    isProcessingImage.value = false
  }
}

/**
 * مشاركة التذكرة كملف صورة أصلي متكامل عبر تطبيقات الهاتف بدون حظر أمني
 */
const sharePassCard = async () => {
  if (!passCardRef.value) return
  isProcessingImage.value = true

  try {
    const width = passCardRef.value.offsetWidth
    const height = passCardRef.value.offsetHeight

    const dataUrl = await toPng(passCardRef.value, {
      quality: 0.95,
      pixelRatio: 2,
      width: width,
      height: height,
      skipFonts: true, // 🛡️ تأمين شاشة المشاركة ضد قيود خطوط جوجل
      cacheBust: true,
      style: {
        margin: '0',
        transform: 'none',
      },
    })

    const res = await fetch(dataUrl)
    const blob = await res.blob()

    if (!blob) return toast.error('حدث خطأ أثناء معالجة الصورة.')

    const fileName = `InternPass-${applicationData.value?.full_name || 'HR'}.png`
    const file = new File([blob], fileName, { type: 'image/png' })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'تذكرة طلب التدريب الرقمية',
        text: `مرحباً، تم تسجيل طلب التدريب الخاص بالمتدرب: ${applicationData.value?.full_name || ''}`,
      })
    } else {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = fileName
      link.click()
    }
  } catch (error) {
    console.error('Sharing failed', error)
    toast.error('حدث خطأ أثناء محاولة المشاركة.')
  } finally {
    isProcessingImage.value = false
  }
}

onBeforeUnmount(() => {
  stopCamera()
})
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

.animate-scaleUp {
  animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
