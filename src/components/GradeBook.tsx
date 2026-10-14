import React, { useState } from 'react';
import {
  GraduationCap,
  FileDown,
  Printer,
  Plus,
  Trash2,
  Award,
  TrendingUp,
  Users,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Student } from '../types';
import { exportGradeBookToExcel, printDocument } from '../utils/exportUtils';

interface GradeBookProps {
  students: Student[];
  onUpdateStudentGrade: (id: string, field: keyof Student['grades'], val: number) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const GradeBook: React.FC<GradeBookProps> = ({
  students,
  onUpdateStudentGrade,
  onAddStudent,
  onDeleteStudent,
}) => {
  const [selectedSection, setSelectedSection] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  // New Student form state
  const [newName, setNewName] = useState('');
  const [newSection, setNewSection] = useState('السابع أ');
  const [newFirst, setNewFirst] = useState(18);
  const [newSecond, setNewSecond] = useState(18);
  const [newActivities, setNewActivities] = useState(19);
  const [newFinal, setNewFinal] = useState(36);
  const [newNotes, setNewNotes] = useState('');

  // Filtering
  const filteredStudents = students.filter(s => {
    const matchesSection = selectedSection === 'الكل' || s.section === selectedSection;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Calculate statistics
  const totalCount = filteredStudents.length;
  const totals = filteredStudents.map(
    s => s.grades.firstExam + s.grades.secondExam + s.grades.activities + s.grades.finalExam
  );

  const averageScore = totalCount > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totalCount) : 0;
  const maxScore = totalCount > 0 ? Math.max(...totals) : 0;
  const minScore = totalCount > 0 ? Math.min(...totals) : 0;
  const passedCount = totals.filter(t => t >= 50).length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const student: Student = {
      id: `st-${Date.now()}`,
      name: newName,
      section: newSection,
      gender: 'M',
      grades: {
        firstExam: Number(newFirst),
        secondExam: Number(newSecond),
        activities: Number(newActivities),
        finalExam: Number(newFinal),
      },
      notes: newNotes,
    };
    onAddStudent(student);
    setNewName('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              سجل العلامات والتقويم التربوي التراكمي
            </h3>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[11px]">
              تصميم وإعداد: عامر كراجه
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            حساب فوري للمجموع الإجمالي والتقديرات وإصدار الشهادات الرسمية وفق معايير الأونروا
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">نسبة النجاح العامة</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{passRate}%</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">متوسط علامات الشعبة</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{averageScore} / 100</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">أعلى علامة محققة</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{maxScore} / 100</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">إجمالي الطلبة المرصودين</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{totalCount} طالب</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الطالب..."
              className="bg-transparent outline-none w-full font-medium"
            />
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none"
            >
              <option value="الكل">جميع الشعب</option>
              <option value="السابع أ">السابع أ</option>
              <option value="السابع ب">السابع ب</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة طالب جديد
          </button>

          <button
            onClick={() => exportGradeBookToExcel(students, selectedSection)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            تصدير كشف العلامات (Excel)
          </button>

          <button
            onClick={printDocument}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            طباعة السجل الرسمي
          </button>
        </div>
      </div>

      {/* Grade Book Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white font-bold text-center">
                <th className="p-3 border-l border-blue-800 w-12">#</th>
                <th className="p-3 border-l border-blue-800 text-right min-w-48">اسم الطالب الرباعي</th>
                <th className="p-3 border-l border-blue-800 w-24">الشعبة</th>
                <th className="p-3 border-l border-blue-800 w-24">التقويم الأول (20)</th>
                <th className="p-3 border-l border-blue-800 w-24">التقويم الثاني (20)</th>
                <th className="p-3 border-l border-blue-800 w-28">المشاركة والمهمات (20)</th>
                <th className="p-3 border-l border-blue-800 w-24">النهائي (40)</th>
                <th className="p-3 border-l border-blue-800 w-24 bg-blue-950">المجموع (100)</th>
                <th className="p-3 border-l border-blue-800 w-28">التقدير</th>
                <th className="p-3 border-l border-blue-800 w-24">الحالة</th>
                <th className="p-3 border-l border-blue-800 min-w-40 text-right">ملاحظات المعلم</th>
                <th className="p-3 w-20 no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => {
                const total =
                  s.grades.firstExam + s.grades.secondExam + s.grades.activities + s.grades.finalExam;

                let badge = 'bg-blue-50 text-blue-800 border-blue-200';
                let rating = 'مقبول';
                if (total >= 90) {
                  rating = 'ممتاز';
                  badge = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
                } else if (total >= 80) {
                  rating = 'جيد جداً';
                  badge = 'bg-teal-50 text-teal-800 border-teal-200 font-bold';
                } else if (total >= 70) {
                  rating = 'جيد';
                  badge = 'bg-blue-50 text-blue-800 border-blue-200';
                } else if (total < 50) {
                  rating = 'ضعيف';
                  badge = 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
                }

                const isPass = total >= 50;

                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-200 hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    <td className="p-3 text-center font-bold text-slate-500 border-l border-slate-200">
                      {idx + 1}
                    </td>

                    <td className="p-3 font-bold text-slate-800 border-l border-slate-200">
                      {s.name}
                    </td>

                    <td className="p-3 text-center font-semibold text-slate-600 border-l border-slate-200">
                      {s.section}
                    </td>

                    {/* First Exam Input */}
                    <td className="p-2 border-l border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={s.grades.firstExam}
                        onChange={e => onUpdateStudentGrade(s.id, 'firstExam', Number(e.target.value))}
                        className="w-16 p-1 text-center border border-slate-200 rounded font-bold text-slate-800 bg-white"
                      />
                    </td>

                    {/* Second Exam Input */}
                    <td className="p-2 border-l border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={s.grades.secondExam}
                        onChange={e => onUpdateStudentGrade(s.id, 'secondExam', Number(e.target.value))}
                        className="w-16 p-1 text-center border border-slate-200 rounded font-bold text-slate-800 bg-white"
                      />
                    </td>

                    {/* Activities Input */}
                    <td className="p-2 border-l border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={s.grades.activities}
                        onChange={e => onUpdateStudentGrade(s.id, 'activities', Number(e.target.value))}
                        className="w-16 p-1 text-center border border-slate-200 rounded font-bold text-slate-800 bg-white"
                      />
                    </td>

                    {/* Final Exam Input */}
                    <td className="p-2 border-l border-slate-200 text-center">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={s.grades.finalExam}
                        onChange={e => onUpdateStudentGrade(s.id, 'finalExam', Number(e.target.value))}
                        className="w-16 p-1 text-center border border-slate-200 rounded font-bold text-slate-800 bg-white"
                      />
                    </td>

                    {/* Total Calculated */}
                    <td className="p-3 text-center font-black text-sm border-l border-slate-200 bg-blue-50/60 text-blue-950">
                      {total}
                    </td>

                    {/* Rating Badge */}
                    <td className="p-2 text-center border-l border-slate-200">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] border ${badge}`}>
                        {rating}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-2 text-center border-l border-slate-200">
                      <span
                        className={`font-bold text-xs ${isPass ? 'text-emerald-700' : 'text-rose-600'}`}
                      >
                        {isPass ? 'ناجح' : 'مكمل'}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="p-2 border-l border-slate-200 text-slate-600 text-[11px]">
                      {s.notes || '-'}
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedStudentForReport(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="عرض وطباعة بطاقة درجات الطالب"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          title="حذف الطالب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="font-black text-slate-800 text-base">إضافة طالب جديد لسجل العلامات</h4>
            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="مثال: يوسف رامي الحناوي"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف والشعبة:</label>
                <select
                  value={newSection}
                  onChange={e => setNewSection(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="السابع أ">السابع أ</option>
                  <option value="السابع ب">السابع ب</option>
                  <option value="الثامن أ">الثامن أ</option>
                  <option value="الثامن ب">الثامن ب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التقويم الأول (من 20):</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={newFirst}
                    onChange={e => setNewFirst(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التقويم الثاني (من 20):</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={newSecond}
                    onChange={e => setNewSecond(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المهمات الرقمية (من 20):</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={newActivities}
                    onChange={e => setNewActivities(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاختبار النهائي (من 40):</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={newFinal}
                    onChange={e => setNewFinal(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات المعلم:</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="ملاحظات سلوكية أو أكاديمية..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                >
                  إضافة الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Student Report Card Modal (Print Ready) */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            <div className="border-2 border-blue-900 bg-blue-50/50 p-4 rounded-2xl text-center">
              <div className="text-xs font-bold text-blue-900">وكالة الغوث الدولية (الأونروا)</div>
              <div className="text-xs font-semibold text-slate-700">دائرة التربية والتعليم - شمال عمان</div>
              <div className="text-xs font-bold text-slate-800">مدرسة ذكور وادي السير الإعدادية</div>
              <div className="text-base font-black text-blue-950 mt-2">شهادة تقويم الأداء الأكاديمي</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">اسم الطالب:</span>
                <span className="font-bold text-sm text-slate-900">{selectedStudentForReport.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">الصف والشعبة:</span>
                <span className="font-bold">{selectedStudentForReport.section}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">المبحث:</span>
                <span className="font-bold">مهارات رقمية وتكنولوجيا</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">معلم المادة ومعد الشهادة:</span>
                <span className="font-bold text-blue-900">عامر كراجه</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">منظومة التقييم:</span>
                <span className="font-bold text-emerald-700">EduSmart UNRWA • تصميم وإعداد: عامر كراجه</span>
              </div>
            </div>

            {/* Grades Table */}
            <table className="w-full text-xs text-right border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2 border-b">مجال التقييم</th>
                  <th className="p-2 border-b text-center">الدرجة العظمى</th>
                  <th className="p-2 border-b text-center">الدرجة المحققة</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">التقويم الأول</td>
                  <td className="p-2 text-center">20</td>
                  <td className="p-2 text-center font-bold">{selectedStudentForReport.grades.firstExam}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">التقويم الثاني</td>
                  <td className="p-2 text-center">20</td>
                  <td className="p-2 text-center font-bold">{selectedStudentForReport.grades.secondExam}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">المشاركة والمهمات الرقمية</td>
                  <td className="p-2 text-center">20</td>
                  <td className="p-2 text-center font-bold">{selectedStudentForReport.grades.activities}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">الاختبار النهائي</td>
                  <td className="p-2 text-center">40</td>
                  <td className="p-2 text-center font-bold">{selectedStudentForReport.grades.finalExam}</td>
                </tr>
                <tr className="bg-blue-50/70 font-black text-blue-900">
                  <td className="p-2">المجموع الكلي</td>
                  <td className="p-2 text-center">100</td>
                  <td className="p-2 text-center text-sm">
                    {selectedStudentForReport.grades.firstExam +
                      selectedStudentForReport.grades.secondExam +
                      selectedStudentForReport.grades.activities +
                      selectedStudentForReport.grades.finalExam}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentForReport(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-xs"
              >
                إغلاق
              </button>
              <button
                onClick={printDocument}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                طباعة الشهادة الرسمية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
