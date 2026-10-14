import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Calendar,
  FileDown,
  Printer,
  CheckCheck,
  Filter,
  Search,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import { exportAttendanceToExcel, printDocument } from '../utils/exportUtils';

interface AttendanceTrackerProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (date: string, section: string, studentId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: (date: string, section: string) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  students,
  attendanceRecords,
  onUpdateAttendance,
  onMarkAllPresent,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-10-14');
  const [selectedSection, setSelectedSection] = useState('السابع أ');
  const [searchQuery, setSearchQuery] = useState('');

  // Find or create virtual current record
  const currentRecord = attendanceRecords.find(
    r => r.date === selectedDate && r.section === selectedSection
  );

  const sectionStudents = students.filter(
    s => s.section === selectedSection && s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Absence counts across all history for warnings
  const getAbsenceCount = (studentId: string) => {
    return attendanceRecords.reduce((acc, rec) => {
      return rec.statusMap[studentId] === 'absent' ? acc + 1 : acc;
    }, 0);
  };

  // Section stats for today
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  let lateCount = 0;

  sectionStudents.forEach(s => {
    const status = currentRecord?.statusMap[s.id] || 'present';
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
    else if (status === 'excused') excusedCount++;
    else if (status === 'late') lateCount++;
  });

  const totalToday = sectionStudents.length;
  const attendanceRate = totalToday > 0 ? Math.round(((presentCount + lateCount) / totalToday) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              راصد الحضور والغياب اليومي والتراكمي
            </h3>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[11px]">
              تصميم وإعداد: عامر كراجه
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            رصد يومي دقيق، إنذارات الغياب وفق معايير وكالة الغوث، وتصدير التقارير الإدارية
          </p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">نسبة الحضور اليوم</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{attendanceRate}%</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">الحاضرون اليوم</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{presentCount} طالب</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">الغياب غير المبرر</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{absentCount} طالب</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">الغياب المبرر والتأخير</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{excusedCount + lateCount} طالب</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-mono"
            />
          </div>

          {/* Section Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none"
            >
              <option value="السابع أ">السابع أ</option>
              <option value="السابع ب">السابع ب</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs w-48">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث عن طالب..."
              className="bg-transparent outline-none w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onMarkAllPresent(selectedDate, selectedSection)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            تحديد الكل كحاضر
          </button>

          <button
            onClick={() => exportAttendanceToExcel(attendanceRecords, students, selectedSection)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            تصدير كشف الغياب (Excel)
          </button>

          <button
            onClick={printDocument}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            طباعة الكشف اليومي
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white font-bold text-center">
                <th className="p-3 border-l border-blue-800 w-12">#</th>
                <th className="p-3 border-l border-blue-800 text-right min-w-48">اسم الطالب</th>
                <th className="p-3 border-l border-blue-800 w-24">الشعبة</th>
                <th className="p-3 border-l border-blue-800 min-w-64 text-center">
                  حالة الحضور والغياب لليوم ({selectedDate})
                </th>
                <th className="p-3 border-l border-blue-800 w-32 text-center">مجموع الغياب التراكمي</th>
                <th className="p-3 text-right min-w-40">الإجراء الإداري والمتابعة</th>
              </tr>
            </thead>
            <tbody>
              {sectionStudents.map((s, idx) => {
                const currentStatus = currentRecord?.statusMap[s.id] || 'present';
                const totalAbsences = getAbsenceCount(s.id);
                const isWarning = totalAbsences >= 3;

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

                    {/* Status Buttons */}
                    <td className="p-2 border-l border-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onUpdateAttendance(selectedDate, selectedSection, s.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          حاضر
                        </button>

                        <button
                          onClick={() => onUpdateAttendance(selectedDate, selectedSection, s.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          غائب
                        </button>

                        <button
                          onClick={() => onUpdateAttendance(selectedDate, selectedSection, s.id, 'excused')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                            currentStatus === 'excused'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          مبرر
                        </button>

                        <button
                          onClick={() => onUpdateAttendance(selectedDate, selectedSection, s.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                            currentStatus === 'late'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          متأخر
                        </button>
                      </div>
                    </td>

                    {/* Total Absences */}
                    <td className="p-3 text-center border-l border-slate-200 font-mono font-bold">
                      <span className={totalAbsences > 0 ? 'text-rose-600' : 'text-slate-500'}>
                        {totalAbsences} أيام
                      </span>
                    </td>

                    {/* Admin Status */}
                    <td className="p-3">
                      {isWarning ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-[11px] flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          إنذار غياب أونروا (تجاوز الحد)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">مواظبة طبيعية</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
