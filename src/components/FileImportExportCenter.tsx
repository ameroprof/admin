import React, { useState } from 'react';
import {
  FileDown,
  Upload,
  FileSpreadsheet,
  FileText,
  Printer,
  Database,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LessonPlan, Student, TimetableSlot, AttendanceRecord, ActiveTab } from '../types';
import {
  exportLessonPlanToWord,
  exportGradeBookToExcel,
  exportAttendanceToExcel,
  exportTimetableToExcel,
  printDocument,
} from '../utils/exportUtils';

interface FileImportExportCenterProps {
  students: Student[];
  savedPlans: LessonPlan[];
  slots: TimetableSlot[];
  attendanceRecords: AttendanceRecord[];
  onImportStudents: (newStudents: Student[]) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onRestoreAllData: (data: any) => void;
}

export const FileImportExportCenter: React.FC<FileImportExportCenterProps> = ({
  students,
  savedPlans,
  slots,
  attendanceRecords,
  onImportStudents,
  onNavigateTab,
  onRestoreAllData,
}) => {
  const [importText, setImportText] = useState('');
  const [importSection, setImportSection] = useState('السابع أ');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Student Roster CSV parser
  const handleImportRoster = () => {
    if (!importText.trim()) {
      setFeedback({ message: 'الرجاء كتابة أو لصق أسماء الطلبة أولاً', type: 'error' });
      return;
    }

    const lines = importText.split('\n').filter(l => l.trim().length > 0);
    const newStudents: Student[] = lines.map((line, idx) => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0] || `طالب ${idx + 1}`;
      const firstExam = parts[1] ? Number(parts[1]) : 18;
      const secondExam = parts[2] ? Number(parts[2]) : 18;
      const activities = parts[3] ? Number(parts[3]) : 19;
      const finalExam = parts[4] ? Number(parts[4]) : 36;

      return {
        id: `st-imp-${Date.now()}-${idx}`,
        name,
        section: importSection,
        gender: 'M',
        grades: {
          firstExam,
          secondExam,
          activities,
          finalExam,
        },
        notes: 'تم الاستيراد من ملف خارجي',
      };
    });

    onImportStudents(newStudents);
    setFeedback({
      message: `تم استيراد ${newStudents.length} طالباً بنجاح إلى شعبة ${importSection}!`,
      type: 'success',
    });
    setImportText('');
  };

  // Backup all data to JSON
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      students,
      savedPlans,
      slots,
      attendanceRecords,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_EduSmart_UNRWA_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore backup from JSON
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        onRestoreAllData(json);
        setFeedback({ message: 'تم استعادة كافة بيانات النظام بنجاح!', type: 'success' });
      } catch (err) {
        setFeedback({ message: 'الملف غير صالح أو تالف.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              مركز استيراد وتصدير الملفات والوثائق المدرسية
            </h3>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[11px]">
              تصميم وإعداد: عامر كراجه
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تصدير واستيراد البيانات بصيغ مايكروسوفت وورد (Word .doc)، إكسل (Excel .xlsx)، وملفات PDF والنسخ الاحتياطية • تصميم وإعداد: عامر كراجه
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Database className="w-4 h-4" />
          تصدير نسخة احتياطية كاملة (JSON)
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid of Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Word Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">تصدير خطط الدروس (Word)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              تصدير خطط الدروس اليومية بصيغة وورد مطابقة تماماً لنموذج الأونروا الرسمي وترتيب الجداول والتوقيعات.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                if (savedPlans.length > 0) exportLessonPlanToWord(savedPlans[0]);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              تصدير الخطة الحالية (.doc)
            </button>
            <button
              onClick={() => onNavigateTab('lesson-plan')}
              className="w-full py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              فتح مولّد الخطط
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Excel Gradebook Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">تصدير سجل العلامات (Excel)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              تصدير كشوف علامات الطلبة لجميع الشعب مع التقويم الأول والثاني والمشاركة والنهائي والمجموع التراكمي.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => exportGradeBookToExcel(students, 'الكل')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              تصدير الكشف الشامل (.csv)
            </button>
            <button
              onClick={() => onNavigateTab('gradebook')}
              className="w-full py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              فتح سجل العلامات
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Excel Attendance Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
          <div>
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">تصدير سجل الحضور والغياب</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              تصدير تقرير الغياب التراكمي ونسب المواظبة وحالات الإنذار المدرسية لشعب الأونروا.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => exportAttendanceToExcel(attendanceRecords, students, 'الكل')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              تصدير تقرير الغياب
            </button>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="w-full py-1.5 text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              فتح راصد الغياب
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Timetable Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all">
          <div>
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mb-3">
              <Printer className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">طباعة وتصدير الجدول المدرسي</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              طباعة الجدول الأسبوعي للحصص بتنسيق A4 مريح أو تصديره إلى ملف مجدول جاهز للمشاركة.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => exportTimetableToExcel(slots)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              تصدير الجدول (Excel)
            </button>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="w-full py-1.5 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              فتح الجدول الأسبوعي
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Student Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">استيراد قائمة طلبة جديدة (Roster Import)</h4>
              <p className="text-xs text-slate-500">الصق أسماء الطلبة (اسم في كل سطر) أو بتنسيق مفصول بفواصل</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الشعبة المستهدفة:</label>
            <select
              value={importSection}
              onChange={e => setImportSection(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 mb-3"
            >
              <option value="السابع أ">السابع أ</option>
              <option value="السابع ب">السابع ب</option>
              <option value="الثامن أ">الثامن أ</option>
              <option value="الثامن ب">الثامن ب</option>
            </select>

            <textarea
              rows={5}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`أحمد حسام زلوم\nمحمود عادل الشريف\nطارق زياد القيسي\nيزن سمير كنعان`}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed font-mono"
            />
          </div>

          <button
            onClick={handleImportRoster}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Upload className="w-4 h-4" />
            استيراد الأسماء إلى سجل الطلبة
          </button>
        </div>

        {/* Restore Backup File */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">استعادة نسخة احتياطية من ملف (JSON Restore)</h4>
                <p className="text-xs text-slate-500">استعادة الخطط والدرجات والحضور والجدول من نسخة سابقة</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">اضغط هنا لرفع ملف النسخة الاحتياطية (.json)</p>
              <p className="text-[11px] text-slate-400 mt-1">يتم استعادة كافة الخطط المحفوظة والدرجات والجداول فوراً</p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            <strong>ملاحظة أمان:</strong> جميع البيانات تبقى آمنة ومحفوظة محلياً على جهاز المعلم مع إمكانية التصدير السريع في أي وقت.
          </div>
        </div>
      </div>
    </div>
  );
};
