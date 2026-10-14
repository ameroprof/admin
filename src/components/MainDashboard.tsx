import React from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  GraduationCap,
  UserCheck,
  Gamepad2,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  CheckCircle2,
  FileDown,
  Printer,
  School,
  ChevronLeft,
} from 'lucide-react';
import { LessonPlan, Student, TimetableSlot, AttendanceRecord, ActiveTab } from '../types';
import { DEFAULT_TEACHER } from '../data/mockData';
import { exportLessonPlanToWord, printDocument } from '../utils/exportUtils';

interface MainDashboardProps {
  students: Student[];
  savedPlans: LessonPlan[];
  slots: TimetableSlot[];
  attendanceRecords: AttendanceRecord[];
  onNavigateTab: (tab: ActiveTab) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  students,
  savedPlans,
  slots,
  attendanceRecords,
  onNavigateTab,
}) => {
  // Statistics calculations
  const totalStudents = students.length;
  const totalClassesWeekly = slots.length;

  // Today's attendance percentage
  const latestAttendance = attendanceRecords[0];
  let presentToday = 0;
  let totalMarkedToday = 0;

  if (latestAttendance) {
    Object.values(latestAttendance.statusMap).forEach(st => {
      totalMarkedToday++;
      if (st === 'present' || st === 'late') presentToday++;
    });
  }

  const attendanceRate = totalMarkedToday > 0 ? Math.round((presentToday / totalMarkedToday) * 100) : 96;

  // Grade averages
  const totals = students.map(
    s => s.grades.firstExam + s.grades.secondExam + s.grades.activities + s.grades.finalExam
  );
  const averageGrade = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const passRate = totals.length > 0 ? Math.round((totals.filter(t => t >= 50).length / totals.length) * 100) : 100;

  // Sunday / Today classes (Sunday is the first day of school week in UNRWA Jordan/Palestine)
  const todayClasses = slots.filter(s => s.day === 'الأحد').sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      {/* Teacher Profile / Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        {/* Subtle Decorative Pattern */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold text-blue-100">
              <School className="w-3.5 h-3.5" />
              وكالة الغوث الدولية (UNRWA) - دائرة التربية والتعليم
              <span className="bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded-full text-[11px] mr-1">
                تصميم وإعداد: {DEFAULT_TEACHER.name}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              مرحباً بك، أستاذ {DEFAULT_TEACHER.name}
            </h2>

            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              منصة {DEFAULT_TEACHER.school} • منطقة {DEFAULT_TEACHER.area} • مبحث {DEFAULT_TEACHER.subject}
              <br />
              منظومة EduSmart الذكية لإدارة الفصول وتوليد خطط الدروس لجميع المواد • <span className="font-bold text-amber-300">تصميم وإعداد: {DEFAULT_TEACHER.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('lesson-plan')}
              className="px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-black text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              توليد خطة درس أونروا الآن
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-3 bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/30 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              رصد حضور اليوم
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-bold">نسبة الحضور التراكمي</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{attendanceRate}%</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">مواظبة ممتازة لشعب السابع</span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => onNavigateTab('timetable')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-bold">الحصص الأسبوعية</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{totalClassesWeekly} حصة</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">موزعة على الأحد - الخميس</span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => onNavigateTab('gradebook')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-bold">إجمالي الطلبة المسجلين</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{totalStudents} طالب</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">نسبة النجاح: {passRate}%</span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => onNavigateTab('lesson-plan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-slate-500 font-bold">الخطط اليومية المحفوظة</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{savedPlans.length} خطط</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">معتمدة بنموذج الأونروا</span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick Plan Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Active Classes & Quick Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-800">
                  حصص اليوم (الأحد - بداية الأسبوع الدراسي)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('timetable')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                عرض الجدول الكامل
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayClasses.map(slot => (
                <div
                  key={slot.id}
                  className="p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-2xl transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-blue-900 bg-blue-100/60 px-2.5 py-0.5 rounded-md">
                      الحصة {slot.period}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{slot.section}</span>
                  </div>

                  <div className="font-bold text-slate-900 text-sm mb-1">{slot.subject}</div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Core Modules Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigateTab('lesson-plan')}
              className="p-4 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 rounded-2xl text-right transition-all group shadow-xs"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-800">مولّد خطط الأونروا</div>
              <div className="text-[11px] text-slate-400 mt-0.5">وفق النموذج الرسمي والمراحل الـ 4</div>
            </button>

            <button
              onClick={() => onNavigateTab('gradebook')}
              className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-2xl text-right transition-all group shadow-xs"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-800">سجل العلامات والتقييم</div>
              <div className="text-[11px] text-slate-400 mt-0.5">حساب تلقائي وتصدير كشوفات</div>
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 rounded-2xl text-right transition-all group shadow-xs"
            >
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-800">راصد الغياب والحضور</div>
              <div className="text-[11px] text-slate-400 mt-0.5">متابعة يومية وإنذارات الأونروا</div>
            </button>

            <button
              onClick={() => onNavigateTab('timetable')}
              className="p-4 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-400 rounded-2xl text-right transition-all group shadow-xs"
            >
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-800">الجدول الأسبوعي</div>
              <div className="text-[11px] text-slate-400 mt-0.5">إدارة الحصص والشعب والمختبر</div>
            </button>

            <button
              onClick={() => onNavigateTab('games')}
              className="p-4 bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-400 rounded-2xl text-right transition-all group shadow-xs"
            >
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-800">الألعاب التعليمية والـ Quiz</div>
              <div className="text-[11px] text-slate-400 mt-0.5">أنشطة تفاعلية ومسابقات رقمية</div>
            </button>

            <button
              onClick={() => onNavigateTab('files')}
              className="p-4 bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-400 rounded-2xl text-right transition-all group shadow-xs"
            >
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-all">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-800">مركز استيراد وتصدير الملفات</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Word و Excel و PDF ونسخ احتياطي</div>
            </button>
          </div>
        </div>

        {/* Right Column: Latest Plans & Quick Word Export */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-800">أحدث خطط الدروس اليومية</h3>
              </div>
              <button
                onClick={() => onNavigateTab('lesson-plan')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                الكل
              </button>
            </div>

            <div className="space-y-3">
              {savedPlans.slice(0, 3).map(plan => (
                <div
                  key={plan.id}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded text-[11px]">
                      {plan.subject}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{plan.createdAt}</span>
                  </div>

                  <div className="font-bold text-slate-800 text-xs">{plan.lessonTitle}</div>
                  <div className="text-[11px] text-slate-500">{plan.grade} • {plan.unitTitle}</div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <button
                      onClick={() => onNavigateTab('lesson-plan')}
                      className="text-blue-600 hover:underline font-bold text-[11px]"
                    >
                      فتح الخطة
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => exportLessonPlanToWord(plan)}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                        title="تصدير Word"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={printDocument}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        title="طباعة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Technology Tip Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>إضاءة تربوية لمعلمي الأونروا:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              وفق توجيهات قسم تكنولوجيا التعليم بالأونروا، احرص في مرحلة "التوسع ودعم التميز" على إتاحة فرصة التعلم المتمايز ودمج التطبيقات الرقمية التفاعلية مثل مايكروسوفت تيمز وأوراق العمل الحية لتعزيز المشاركة الفاعلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
