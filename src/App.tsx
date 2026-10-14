/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, LessonPlan, Student, TimetableSlot, AttendanceRecord, AttendanceStatus } from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_LESSON_PLANS,
  INITIAL_TIMETABLE,
  INITIAL_ATTENDANCE,
  DEFAULT_TEACHER,
} from './data/mockData';
import { HeaderNavbar } from './components/HeaderNavbar';
import { MainDashboard } from './components/MainDashboard';
import { LessonPlanGenerator } from './components/LessonPlanGenerator';
import { WeeklySchedule } from './components/WeeklySchedule';
import { GradeBook } from './components/GradeBook';
import { AttendanceTracker } from './components/AttendanceTracker';
import { InteractiveGames } from './components/InteractiveGames';
import { FileImportExportCenter } from './components/FileImportExportCenter';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // 1. Students State with LocalStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('edusmart_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // 2. Lesson Plans State
  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem('edusmart_plans');
      return saved ? JSON.parse(saved) : INITIAL_LESSON_PLANS;
    } catch {
      return INITIAL_LESSON_PLANS;
    }
  });

  // 3. Timetable Slots
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem('edusmart_timetable');
      return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
    } catch {
      return INITIAL_TIMETABLE;
    }
  });

  // 4. Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edusmart_attendance');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('edusmart_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edusmart_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  useEffect(() => {
    localStorage.setItem('edusmart_timetable', JSON.stringify(timetableSlots));
  }, [timetableSlots]);

  useEffect(() => {
    localStorage.setItem('edusmart_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Handlers for Students
  const handleUpdateStudentGrade = (id: string, field: keyof Student['grades'], val: number) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, grades: { ...s.grades, [field]: val } } : s))
    );
  };

  const handleAddStudent = (student: Student) => {
    setStudents(prev => [student, ...prev]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => [...newStudents, ...prev]);
  };

  // Handlers for Lesson Plans
  const handleSavePlan = (plan: LessonPlan) => {
    setSavedPlans(prev => {
      const existing = prev.findIndex(p => p.id === plan.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = plan;
        return copy;
      }
      return [plan, ...prev];
    });
  };

  const handleDeletePlan = (id: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== id));
  };

  // Handlers for Timetable
  const handleAddSlot = (slot: TimetableSlot) => {
    setTimetableSlots(prev => [...prev, slot]);
  };

  const handleDeleteSlot = (id: string) => {
    setTimetableSlots(prev => prev.filter(s => s.id !== id));
  };

  // Handlers for Attendance
  const handleUpdateAttendance = (
    date: string,
    section: string,
    studentId: string,
    status: AttendanceStatus
  ) => {
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.date === date && r.section === section);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          statusMap: {
            ...updated[existingIndex].statusMap,
            [studentId]: status,
          },
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          date,
          section,
          statusMap: { [studentId]: status },
        };
        return [newRecord, ...prev];
      }
    });
  };

  const handleMarkAllPresent = (date: string, section: string) => {
    const sectionStudents = students.filter(s => s.section === section);
    const map: Record<string, AttendanceStatus> = {};
    sectionStudents.forEach(s => {
      map[s.id] = 'present';
    });

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => r.date === date && r.section === section);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          statusMap: {
            ...updated[existingIndex].statusMap,
            ...map,
          },
        };
        return updated;
      } else {
        return [
          {
            id: `att-${Date.now()}`,
            date,
            section,
            statusMap: map,
          },
          ...prev,
        ];
      }
    });
  };

  // Restore All Data Handler
  const handleRestoreAllData = (backup: any) => {
    if (backup.students) setStudents(backup.students);
    if (backup.savedPlans) setSavedPlans(backup.savedPlans);
    if (backup.slots) setTimetableSlots(backup.slots);
    if (backup.attendanceRecords) setAttendanceRecords(backup.attendanceRecords);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-['Cairo',sans-serif] flex flex-col justify-between">
      {/* Header and Navigation */}
      <HeaderNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {activeTab === 'dashboard' && (
          <MainDashboard
            students={students}
            savedPlans={savedPlans}
            slots={timetableSlots}
            attendanceRecords={attendanceRecords}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'lesson-plan' && (
          <LessonPlanGenerator
            savedPlans={savedPlans}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {activeTab === 'timetable' && (
          <WeeklySchedule
            slots={timetableSlots}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
          />
        )}

        {activeTab === 'gradebook' && (
          <GradeBook
            students={students}
            onUpdateStudentGrade={handleUpdateStudentGrade}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTracker
            students={students}
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={handleUpdateAttendance}
            onMarkAllPresent={handleMarkAllPresent}
          />
        )}

        {activeTab === 'games' && <InteractiveGames students={students} />}

        {activeTab === 'files' && (
          <FileImportExportCenter
            students={students}
            savedPlans={savedPlans}
            slots={timetableSlots}
            attendanceRecords={attendanceRecords}
            onImportStudents={handleImportStudents}
            onNavigateTab={setActiveTab}
            onRestoreAllData={handleRestoreAllData}
          />
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2 no-print">
        <div className="flex items-center justify-center gap-2">
          <span className="font-black text-slate-800 text-sm">
            وكالة الغوث الدولية (الأونروا - UNRWA) • دائرة التربية والتعليم • منطقة {DEFAULT_TEACHER.area}
          </span>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black px-2.5 py-0.5 rounded-lg text-xs">
            تصميم وإعداد: عامر كراجه
          </span>
        </div>
        <div className="font-medium text-slate-600">
          منظومة EduSmart Dashboard لإدارة الفصول وتوليد خطط الدروس لجميع المناهج والمواد (الفصل الأول والثاني)
        </div>
        <div className="text-[11px] text-slate-400">
          تصميم وبرمجة وإعداد خبير تكنولوجيا التعليم والمناهج المدرسية: {DEFAULT_TEACHER.name} • {DEFAULT_TEACHER.school}
        </div>
      </footer>
    </div>
  );
}
