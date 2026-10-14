import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  GraduationCap,
  UserCheck,
  Gamepad2,
  FileSpreadsheet,
  School,
  Clock,
  Printer,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { DEFAULT_TEACHER } from '../data/mockData';
import { printDocument } from '../utils/exportUtils';

interface HeaderNavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية والإحصائيات', icon: LayoutDashboard },
    { id: 'lesson-plan' as ActiveTab, label: 'مولّد خطط الأونروا', icon: Sparkles, badge: 'رسمي' },
    { id: 'timetable' as ActiveTab, label: 'الجدول الأسبوعي', icon: Calendar },
    { id: 'gradebook' as ActiveTab, label: 'سجل العلامات والتقييم', icon: GraduationCap },
    { id: 'attendance' as ActiveTab, label: 'راصد الغياب والحضور', icon: UserCheck },
    { id: 'games' as ActiveTab, label: 'الألعاب والأنشطة الرقمية', icon: Gamepad2 },
    { id: 'files' as ActiveTab, label: 'مركز الملفات والتصدير', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
      {/* Top institution bar */}
      <div className="bg-blue-900 text-white text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <School className="w-3.5 h-3.5 text-blue-300" />
          <span>وكالة الغوث الدولية (الأونروا - UNRWA) • دائرة التربية والتعليم</span>
          <span className="hidden md:inline text-blue-300">• منطقة شمال عمان</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden sm:flex items-center gap-1.5 text-blue-200">
            <Clock className="w-3 h-3" />
            <span className="font-mono">الفصل الدراسي الثاني 2026/2027</span>
          </div>

          <div className="flex items-center gap-1.5 text-white font-bold bg-amber-500/90 text-blue-950 px-2.5 py-0.5 rounded-lg shadow-xs">
            <span>تصميم وإعداد: {DEFAULT_TEACHER.name}</span>
          </div>
        </div>
      </div>

      {/* Main Bar with Logo & Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              UN
            </div>
            <div>
              <div className="font-black text-slate-900 text-base flex items-center gap-1.5 leading-none">
                EduSmart UNRWA
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
                  v3.8
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {DEFAULT_TEACHER.school} • <span className="text-blue-700 font-bold">تصميم وإعداد: {DEFAULT_TEACHER.name}</span>
              </div>
            </div>
          </div>

          {/* Quick Print Button */}
          <button
            onClick={printDocument}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            title="طباعة الصفحة الحالية"
          >
            <Printer className="w-3.5 h-3.5" />
            طباعة سريعة
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-amber-400 text-blue-950' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
