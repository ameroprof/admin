import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  FileDown,
  Printer,
  BookOpen,
  MapPin,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { TimetableSlot } from '../types';
import { exportTimetableToExcel, printDocument } from '../utils/exportUtils';

interface WeeklyScheduleProps {
  slots: TimetableSlot[];
  onAddSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (id: string) => void;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const PERIOD_TIMES = [
  '08:00 - 08:40', // 40 دقيقة
  '08:45 - 09:25', // 40 دقيقة
  '09:30 - 10:10', // 40 دقيقة
  '10:30 - 11:10', // 40 دقيقة (بعد الفسحة)
  '11:15 - 11:55', // 40 دقيقة
  '12:00 - 12:40', // 40 دقيقة
  '12:45 - 01:25', // 40 دقيقة
];

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  slots,
  onAddSlot,
  onDeleteSlot,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('الكل');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form modal
  const [newDay, setNewDay] = useState(DAYS[0]);
  const [newPeriod, setNewPeriod] = useState(1);
  const [newSubject, setNewSubject] = useState('مهارات رقمية');
  const [newSection, setNewSection] = useState('السابع أ');
  const [newRoom, setNewRoom] = useState('مختبر الحاسوب 1');

  const filteredSlots = selectedSection === 'الكل'
    ? slots
    : slots.filter(s => s.section === selectedSection);

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const slot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      day: newDay,
      period: Number(newPeriod),
      subject: newSubject,
      section: newSection,
      room: newRoom,
    };
    onAddSlot(slot);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              الجدول الأسبوعي وتوزيع الحصص المدرسية
            </h3>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[11px]">
              تصميم وإعداد: عامر كراجه
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-[11px]">
              مدة الحصة: 40 دقيقة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            مدرسة ذكور وادي السير الإعدادية • منطقة شمال عمان • تصميم وإعداد الأستاذ: عامر كراجه
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none"
            >
              <option value="الكل">جميع الشعب والأنشطة</option>
              <option value="السابع أ">السابع أ</option>
              <option value="السابع ب">السابع ب</option>
              <option value="الثامن أ">الثامن أ</option>
              <option value="الثامن ب">الثامن ب</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة حصة للجدول
          </button>

          <button
            onClick={() => exportTimetableToExcel(slots)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            تصدير Excel
          </button>

          <button
            onClick={printDocument}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            طباعة الجدول
          </button>
        </div>
      </div>

      {/* Timetable Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-center font-bold">
                <th className="p-3 border-l border-blue-800 w-28">اليوم / الحصة</th>
                {PERIODS.map((p, idx) => (
                  <th key={p} className="p-3 border-l border-blue-800 min-w-32">
                    <div>الحصة {p}</div>
                    <div className="text-[10px] font-normal text-blue-200 font-mono mt-0.5">
                      {PERIOD_TIMES[idx]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dIdx) => (
                <tr key={day} className={`border-b border-slate-200 ${dIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                  {/* Day Label */}
                  <td className="p-3 font-black text-slate-800 text-center bg-slate-100/80 border-l border-slate-200">
                    {day}
                  </td>

                  {/* 7 Periods */}
                  {PERIODS.map(period => {
                    const slot = filteredSlots.find(s => s.day === day && s.period === period);

                    return (
                      <td key={period} className="p-2 border-l border-slate-200 align-top h-24">
                        {slot ? (
                          <div className="h-full bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 rounded-xl p-2.5 flex flex-col justify-between transition-all group relative">
                            <div>
                              <div className="font-bold text-blue-950 text-xs leading-snug">
                                {slot.subject}
                              </div>
                              <div className="text-[11px] font-semibold text-blue-800 mt-1">
                                {slot.section}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-blue-100">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {slot.room}
                              </span>
                              <button
                                onClick={() => onDeleteSlot(slot.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition-all no-print"
                                title="حذف الحصة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-[11px]">
                            فراغ
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="font-black text-slate-800 text-base">إضافة حصة جديدة للجدول</h4>
            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اليوم:</label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ترتيب الحصة:</label>
                <select
                  value={newPeriod}
                  onChange={e => setNewPeriod(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  {PERIODS.map(p => (
                    <option key={p} value={p}>
                      الحصة {p} ({PERIOD_TIMES[p - 1]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبحث:</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="مثال: مهارات رقمية"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الصف / الشعبة:</label>
                <input
                  type="text"
                  value={newSection}
                  onChange={e => setNewSection(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="مثال: السابع أ"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المكان / القاعة:</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="مثال: مختبر الحاسوب 1"
                  required
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
                  حفظ الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
