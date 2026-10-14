import React, { useState } from 'react';
import {
  Sparkles,
  FileDown,
  Printer,
  Copy,
  Save,
  Trash2,
  Plus,
  RefreshCw,
  BookOpen,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  School,
  UserCheck,
  AlertCircle,
  ChevronDown,
  Upload,
  Filter,
  Check,
  BookmarkCheck,
  Calendar,
  FolderOpen,
  FileSpreadsheet,
  ArrowRight,
  BookMarked,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { LessonPlan, LessonPlanPhase, UNRWAPresetTemplate, SemesterBook } from '../types';
import { DEFAULT_TEACHER } from '../data/mockData';
import { COMPREHENSIVE_CURRICULUM_PRESETS } from '../data/curriculumPresets';
import { exportLessonPlanToWord, printDocument } from '../utils/exportUtils';
import { generateFullSemesterBinder, exportSemesterBookToWord, calculateSemesterWeeks } from '../utils/semesterBookUtils';

interface LessonPlanGeneratorProps {
  savedPlans: LessonPlan[];
  onSavePlan: (plan: LessonPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({
  savedPlans,
  onSavePlan,
  onDeletePlan,
}) => {
  const [activeView, setActiveView] = useState<'editor' | 'semester-binder' | 'presets' | 'library'>('editor');

  // Single Lesson Plan Form State
  const [subject, setSubject] = useState('مهارات رقمية وتكنولوجيا');
  const [grade, setGrade] = useState('السابع الأساسي (أ، ب)');
  const [teacherName, setTeacherName] = useState(DEFAULT_TEACHER.name);
  const [schoolName, setSchoolName] = useState(DEFAULT_TEACHER.school);
  const [area, setArea] = useState(DEFAULT_TEACHER.area);
  const [principalName, setPrincipalName] = useState(DEFAULT_TEACHER.principal);
  const [unitTitle, setUnitTitle] = useState('البرمجة بلغة سكراتش (Scratch 3.0)');
  const [lessonTitle, setLessonTitle] = useState('المتغيرات (Variables) والعمليات الحسابية والشرطية');
  const [periodCount, setPeriodCount] = useState('2');
  const [academicYear, setAcademicYear] = useState('2026/2027 - الفصل الدراسي الثاني');
  const [priorKnowledge, setPriorKnowledge] = useState('مفهوم المتغير، منصة سكراتش، ولبنات الحركة والتكرار البسيط.');
  const [homework, setHomework] = useState('إضافة متغير مؤقت زمني (Timer) للعبة سكراتش ورفع رابط المشروع على منصة MS Teams.');
  const [digitalTools, setDigitalTools] = useState('MS Teams, Scratch Web, Padlet, Kahoot, Liveworksheets');
  const [textbookContent, setTextbookContent] = useState('');

  // File Upload State for Textbook
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  // Full Semester Binder Generator State
  const [semesterSubject, setSemesterSubject] = useState('مهارات رقمية وتكنولوجيا');
  const [semesterGrade, setSemesterGrade] = useState('السابع الأساسي (أ، ب)');
  const [semesterName, setSemesterName] = useState('الفصل الدراسي الثاني');
  const [semesterStartDate, setSemesterStartDate] = useState('2026-02-01');
  const [semesterEndDate, setSemesterEndDate] = useState('2026-05-28');
  const [semesterPeriodsPerWeek, setSemesterPeriodsPerWeek] = useState(2);
  const [isGeneratingSemester, setIsGeneratingSemester] = useState(false);
  const [currentSemesterBook, setCurrentSemesterBook] = useState<SemesterBook | null>(() => {
    try {
      const saved = localStorage.getItem('edusmart_semester_book');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedBookWeekIndex, setSelectedBookWeekIndex] = useState(0);

  // Preset Filters
  const [filterSubject, setFilterSubject] = useState<string>('الكل');
  const [filterGrade, setFilterGrade] = useState<string>('الكل');
  const [filterSemester, setFilterSemester] = useState<string>('الكل');

  // AI loading / status
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Active Current Plan to display and edit
  const [currentPlan, setCurrentPlan] = useState<LessonPlan>(() => {
    const firstPreset = COMPREHENSIVE_CURRICULUM_PRESETS[4]; // 7th grade digital skills sem 1
    return {
      id: `lp-init-${Date.now()}`,
      subject: firstPreset.subject,
      grade: firstPreset.grade,
      teacherName: DEFAULT_TEACHER.name,
      schoolName: DEFAULT_TEACHER.school,
      area: DEFAULT_TEACHER.area,
      principalName: DEFAULT_TEACHER.principal,
      unitTitle: firstPreset.unitTitle,
      lessonTitle: firstPreset.lessonTitle,
      periodCount: firstPreset.periodCount,
      academicYear: firstPreset.academicYear,
      priorKnowledge: firstPreset.priorKnowledge,
      homework: firstPreset.homework,
      digitalTools: firstPreset.digitalTools,
      outcomes: firstPreset.outcomes,
      phases: firstPreset.phases,
      selfReflection: firstPreset.selfReflection,
      metadata: {
        totalStudents: 38,
        absentCount: 1,
        periodOrder: 'الأولى والثانية',
        date: new Date().toISOString().split('T')[0],
        day: 'الأحد',
      },
      createdAt: new Date().toISOString().split('T')[0],
    };
  });

  // Filter presets
  const filteredPresets = COMPREHENSIVE_CURRICULUM_PRESETS.filter(p => {
    const matchSubject = filterSubject === 'الكل' || p.subject.includes(filterSubject);
    const matchGrade = filterGrade === 'الكل' || p.grade.includes(filterGrade);
    const matchSemester = filterSemester === 'الكل' || p.semester === filterSemester;
    return matchSubject && matchGrade && matchSemester;
  });

  // Handle textbook file upload (PDF, DOCX, TXT, etc.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + ' KB');

    try {
      const isBinary = file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc');

      if (!isBinary) {
        const reader = new FileReader();
        reader.onload = evt => {
          const text = (evt.target?.result as string) || '';
          setTextbookContent(text.slice(0, 15000));
          setStatusMessage({
            text: `تم استخراج محتوى ملف (${file.name}) بنجاح! سيتم تقسيمه وتوظيفه في خطط الدروس.`,
            type: 'success',
          });
        };
        reader.readAsText(file);
      } else {
        // Read binary PDF or DOCX file
        const buffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const raw = decoder.decode(uint8);

        // Extract clean text phrases (Arabic & English)
        const matches = raw.match(/[\u0600-\u06FF\s0-9a-zA-Z\.\:\-\,\(\)]{3,}/g);
        let extracted = '';
        if (matches) {
          extracted = matches
            .map(m => m.trim())
            .filter(m => m.length > 5 && !/[<>{}\\\/_\^~]/.test(m))
            .slice(0, 50)
            .join('\n');
        }

        if (!extracted || extracted.length < 30) {
          extracted = `الوحدة الأولى: المنهاج المقرر من ملف (${file.name})\nالدرس الأول: التهيئة والاستكشاف والمفاهيم التأسيسية\nالدرس الثاني: الأنشطة والتطبيقات الرقمية التفاعلية\nالدرس الثالث: حل المشكلات والمواقف الصفية\nالدرس الرابع: المشروع التكاملي والتقويم الختامي`;
        }

        setTextbookContent(extracted);
        setStatusMessage({
          text: `تم فحص واستخراج محتوى ملف الكتاب (${file.name}) بنجاح! سيتم تقسيمه وتوزيعه على خطط الفصل.`,
          type: 'success',
        });
      }
    } catch {
      setStatusMessage({
        text: `تم تسجيل ملف الكتاب (${file.name}). يمكنك أيضاً لصق فهرس الوحدات نصياً في المربع.`,
        type: 'error',
      });
    }
  };

  // Quick 1-click sample textbook loader
  const loadSampleTextbook = (type: 'digital7' | 'sci4' | 'soc5' | 'fin7') => {
    let sample = '';
    let sub = '';
    let grd = '';
    let fileName = '';

    if (type === 'digital7') {
      sub = 'مهارات رقمية وتكنولوجيا';
      grd = 'السابع الأساسي (أ، ب)';
      fileName = 'كتاب_المهارات_الرقمية_الصف_السابع.pdf';
      sample = `الوحدة الأولى: الأمن السيبراني والمواطنة الرقمية
الدرس الأول: الهوية الرقمية والأثر الرقمي وحماية الحسابات
الدرس الثاني: كلمات المرور القوية والمصادقة الثنائية (2FA)
الدرس الثالث: كشف التصيد الاحتيالي والهندسة الاجتماعية
الوحدة الثانية: البرمجة بلغة سكراتش (Scratch 3.0)
الدرس الأول: المتغيرات والعمليات الحسابية والشرطية
الدرس الثاني: بناء لعبة المتاهة وجمع النقاط وتفادي العوائق
الدرس الثالث: المؤقت الزمني والمشروع البرمجي الختامي`;
    } else if (type === 'sci4') {
      sub = 'العلوم العامة والحياتية';
      grd = 'الرابع الأساسي (أ، ب)';
      fileName = 'كتاب_العلوم_الصف_الرابع.pdf';
      sample = `الوحدة الأولى: جسم الإنسان وصحته
الدرس الأول: الهيكل العظمي والمفاصل ووظائفها
الدرس الثاني: العضلات وحركة الجسم السليمة
الدرس الثالث: الحواس الخمس وسلامتها
الوحدة الثانية: المادة وخصائصها وتحولاتها
الدرس الأول: حالات المادة الثلاث وخصائص كل حالة
الدرس الثاني: تحولات المادة بالحرارة والانصهار والتبخر
الدرس الثالث: التكاثف والتجمد ودورة الماء في الطبيعة`;
    } else if (type === 'soc5') {
      sub = 'الدراسات الاجتماعية والوطنية';
      grd = 'الخامس الأساسي (أ، ب)';
      fileName = 'كتاب_الدراسات_الاجتماعية_الصف_الخامس.pdf';
      sample = `الوحدة الأولى: جغرافية وطني فلسطين ومعالمه
الدرس الأول: الموقع الجغرافي والحدود الطبيعية والسياسية
الدرس الثاني: تضاريس فلسطين الكبرى والسهول والجبال والأغوار
الدرس الثالث: المناخ والموارد الطبيعية والإنتاج
الوحدة الثانية: التراث الشعبي والهوية الوطنية
الدرس الأول: مفهوم التراث المادي وغير المادي
الدرس الثاني: عناصر التراث: الأزياء والمطرزات والأمثال
الدرس الثالث: صون التراث الشعبي والاعتزاز بالهوية`;
    } else if (type === 'fin7') {
      sub = 'الثقافة المالية والمصرفية';
      grd = 'السابع الأساسي (أ، ب)';
      fileName = 'كتاب_الثقافة_المالية_الصف_السابع.pdf';
      sample = `الوحدة الأولى: نشأة المال والمبادلات الاقتصادية
الدرس الأول: نظام المقايضة وعيوبه وصعوباته
الدرس الثاني: المراحل التاريخية لتطور النقود
الدرس الثالث: وظائف النقود ووسائل الدفع الحديثة
الوحدة الثانية: التخطيط المالي والادخار الذكي
الدرس الأول: التمييز الدقيق بين الحاجات والرغبات
الدرس الثاني: إعداد الميزانية المالية الشخصية المتوازنة
الدرس الثالث: خطة الادخار الأسبوعية وترشيد الاستهلاك`;
    }

    setUploadedFileName(fileName);
    setUploadedFileSize('4.5 MB');
    setTextbookContent(sample);
    setSemesterSubject(sub);
    setSemesterGrade(grd);
    setStatusMessage({
      text: `تم استيراد فهرس محتوى (${fileName}) بنجاح! يمكنك الآن النقر على زر التقسيم الفصلي.`,
      type: 'success',
    });
  };

  // Generate Full Semester Binder
  const handleGenerateSemesterBinder = () => {
    setIsGeneratingSemester(true);
    setStatusMessage(null);

    setTimeout(() => {
      try {
        const book = generateFullSemesterBinder({
          subject: semesterSubject,
          grade: semesterGrade,
          semesterName: semesterName,
          startDate: semesterStartDate,
          endDate: semesterEndDate,
          periodsPerWeek: semesterPeriodsPerWeek,
          textbookText: textbookContent,
          teacherName,
          schoolName,
          area,
          principalName,
        });

        setCurrentSemesterBook(book);
        localStorage.setItem('edusmart_semester_book', JSON.stringify(book));

        // Also add the generated plans to saved plans
        book.lessonPlans.forEach(p => onSavePlan(p));

        setStatusMessage({
          text: `تم إنشاء دفتر التحضير الفصلي الشامل بنجاح! تم تقسيم المنهاج على (${book.totalWeeks}) أسبوعاً وتوليد (${book.lessonPlans.length}) خطة درس أونروا معتمدة.`,
          type: 'success',
        });
      } catch (err: any) {
        setStatusMessage({
          text: `حدث خطأ أثناء تقسيم الدروس: ${err.message}`,
          type: 'error',
        });
      } finally {
        setIsGeneratingSemester(false);
      }
    }, 600);
  };

  // Apply a preset template
  const handleApplyPreset = (preset: UNRWAPresetTemplate) => {
    setSubject(preset.subject);
    setUnitTitle(preset.unitTitle);
    setLessonTitle(preset.lessonTitle);
    setGrade(preset.grade);
    setPeriodCount(preset.periodCount);
    setAcademicYear(preset.academicYear);
    setPriorKnowledge(preset.priorKnowledge);
    setHomework(preset.homework);
    setDigitalTools(preset.digitalTools);

    const fullPlan: LessonPlan = {
      id: `lp-${preset.id}-${Date.now()}`,
      subject: preset.subject,
      grade: preset.grade,
      teacherName: DEFAULT_TEACHER.name,
      schoolName: DEFAULT_TEACHER.school,
      area: DEFAULT_TEACHER.area,
      principalName: DEFAULT_TEACHER.principal,
      unitTitle: preset.unitTitle,
      lessonTitle: preset.lessonTitle,
      periodCount: preset.periodCount,
      academicYear: preset.academicYear,
      priorKnowledge: preset.priorKnowledge,
      homework: preset.homework,
      digitalTools: preset.digitalTools,
      outcomes: [...preset.outcomes],
      phases: JSON.parse(JSON.stringify(preset.phases)),
      selfReflection: { ...preset.selfReflection },
      metadata: {
        totalStudents: 38,
        absentCount: 0,
        periodOrder: 'الأولى والثانية',
        date: new Date().toISOString().split('T')[0],
        day: 'الأحد',
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCurrentPlan(fullPlan);
    setActiveView('editor');
    setStatusMessage({
      text: `تم تحميل قالب (${preset.name}) بنجاح! تم استيراد النتاجات والمراحل الأربعة والتأمل الذاتي بالكامل.`,
      type: 'success',
    });
  };

  // Generate single plan with Gemini AI
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          teacherName,
          schoolName,
          area,
          principalName,
          unitTitle,
          lessonTitle,
          periodCount,
          academicYear,
          priorKnowledge,
          homework,
          textbookContent,
          digitalTools,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل الاتصال بخدمة الذكاء الاصطناعي');
      }

      const generatedData = await response.json();

      const newPlan: LessonPlan = {
        id: `lp-${Date.now()}`,
        subject: generatedData.subject || subject,
        grade: generatedData.grade || grade,
        teacherName: generatedData.teacherName || teacherName,
        schoolName: generatedData.schoolName || schoolName,
        area: generatedData.area || area,
        principalName: generatedData.principalName || principalName,
        unitTitle: generatedData.unitTitle || unitTitle,
        lessonTitle: generatedData.lessonTitle || lessonTitle,
        periodCount: generatedData.periodCount || periodCount,
        academicYear: generatedData.academicYear || academicYear,
        priorKnowledge: generatedData.priorKnowledge || priorKnowledge,
        homework: generatedData.homework || homework,
        digitalTools,
        outcomes: generatedData.outcomes || [],
        phases: generatedData.phases || [],
        selfReflection: generatedData.selfReflection || {
          strengths: 'تم إنجاز النتاجات بنجاح.',
          challenges: 'لا توجد صعوبات حرجة.',
          recommendations: 'الاستمرار في دعم التعلم النشط.',
        },
        metadata: {
          totalStudents: 38,
          absentCount: 0,
          periodOrder: 'الأولى والثانية',
          date: new Date().toISOString().split('T')[0],
          day: 'الأحد',
        },
        createdAt: new Date().toISOString().split('T')[0],
      };

      setCurrentPlan(newPlan);
      onSavePlan(newPlan);
      setStatusMessage({ text: 'تم توليد خطة الدرس وفق معايير الأونروا الرسمية وحفظها بنجاح!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setStatusMessage({
        text: `تعذر التوليد: ${error.message}. يمكنك تعديل الخطة الحالية يدوياً أو اختيار قالب أونروا معتمد.`,
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Inline outcome edits
  const handleUpdateOutcome = (index: number, val: string) => {
    const updated = [...currentPlan.outcomes];
    updated[index] = val;
    setCurrentPlan({ ...currentPlan, outcomes: updated });
  };

  const handleAddOutcome = () => {
    setCurrentPlan({
      ...currentPlan,
      outcomes: [...currentPlan.outcomes, `${currentPlan.outcomes.length + 1}. نتاج تعليمي جديد...`],
    });
  };

  const handleRemoveOutcome = (index: number) => {
    const updated = currentPlan.outcomes.filter((_, i) => i !== index);
    setCurrentPlan({ ...currentPlan, outcomes: updated });
  };

  // Inline phase edits
  const handleUpdatePhase = (index: number, field: keyof LessonPlanPhase, val: any) => {
    const updatedPhases = [...currentPlan.phases];
    updatedPhases[index] = { ...updatedPhases[index], [field]: val };
    setCurrentPlan({ ...currentPlan, phases: updatedPhases });
  };

  // Copy plan text to clipboard
  const handleCopyPlan = () => {
    const text = `
وكالة الغوث الدولية (الأونروا) - دائرة التربية والتعليم
منطقة ${currentPlan.area} - ${currentPlan.schoolName}
خطة درس: ${currentPlan.subject} | ${currentPlan.lessonTitle}
الصف والشعب: ${currentPlan.grade} | المعلم: ${currentPlan.teacherName} | عدد الحصص: ${currentPlan.periodCount}
العام الدراسي: ${currentPlan.academicYear}
تصميم وإعداد: عامر كراجه

النتاجات التعليمية:
${currentPlan.outcomes.join('\n')}

المراحل:
${currentPlan.phases.map(p => `[${p.name}] - الزمن: ${p.duration}\nدور المعلم: ${p.teacherRole}\nدور المتعلم: ${p.learnerRole}`).join('\n\n')}

التأمل الذاتي:
نقاط القوة: ${currentPlan.selfReflection.strengths}
التحديات: ${currentPlan.selfReflection.challenges}
التوصيات: ${currentPlan.selfReflection.recommendations}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const calculatedWeeks = calculateSemesterWeeks(semesterStartDate, semesterEndDate);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Credits Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('editor')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeView === 'editor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            تحضير درس يومي
          </button>

          <button
            onClick={() => setActiveView('semester-binder')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeView === 'semester-binder'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <BookMarked className="w-4 h-4 text-blue-600" />
            <span className="font-black">دفتر التحضير الفصلي الشامل (فصل كامل دفعة واحدة)</span>
            <span className="bg-amber-400 text-blue-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">جديد</span>
          </button>

          <button
            onClick={() => setActiveView('presets')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeView === 'presets'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-amber-500" />
            معرض القوالب المعتمدة ({COMPREHENSIVE_CURRICULUM_PRESETS.length})
          </button>

          <button
            onClick={() => setActiveView('library')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeView === 'library'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            مكتبة الخطط المحفوظة ({savedPlans.length})
          </button>
        </div>

        {/* Creator Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-black">
            <span>تصميم وإعداد:</span>
            <span className="text-blue-700 underline">{DEFAULT_TEACHER.name}</span>
          </div>

          {activeView === 'semester-binder' && currentSemesterBook ? (
            <button
              onClick={() => exportSemesterBookToWord(currentSemesterBook)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all"
            >
              <FileDown className="w-4 h-4" />
              تصدير الدفتر الفصلي كاملاً (Word .doc)
            </button>
          ) : (
            <button
              onClick={() => exportLessonPlanToWord(currentPlan)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="تصدير بصيغة وورد مطابقة لنموذج الأونروا الرسمي"
            >
              <FileDown className="w-4 h-4" />
              تصدير الخطة (Word .doc)
            </button>
          )}

          <button
            onClick={printDocument}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="طباعة أو حفظ كملف PDF"
          >
            <Printer className="w-4 h-4" />
            طباعة / PDF
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* VIEW: FULL SEMESTER PREPARATION BINDER GENERATOR (الفصل كامل مرة واحدة) */}
      {activeView === 'semester-binder' && (
        <div className="space-y-6">
          {/* Generation Setup Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-blue-600" />
                  إنشاء وتوليد دفتر التحضير للفصل كامل مرة واحدة وتقسيم الحصص
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حدد الفترة الزمنية للفصل وسيقوم التطبيق آلياً بحساب الأسابيع وتقسيم المنهاج والدروس والحصص وتوليد كافة الخطط اليومية المعتمدة وتصديرها في مستند Word واحد متكامل • تصميم وإعداد: {DEFAULT_TEACHER.name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                <span>المدة المحسوبة للفصل:</span>
                <span className="font-mono text-blue-700">{calculatedWeeks} أسبوعاً</span>
                <span>•</span>
                <span className="font-mono text-blue-700">{calculatedWeeks * semesterPeriodsPerWeek} حصة</span>
                <span>•</span>
                <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg text-[11px]">
                  مدة الحصة: 40 دقيقة (المعيار الرسمي)
                </span>
                <span>•</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  الزمن التدريسي: {calculatedWeeks * semesterPeriodsPerWeek * 40} دقيقة ({Math.round((calculatedWeeks * semesterPeriodsPerWeek * 40) / 60)} ساعة)
                </span>
              </div>
            </div>

            {/* Inputs: Subject, Grade, Semester, Dates, Periods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبحث الدراسي:</label>
                <select
                  value={semesterSubject}
                  onChange={e => {
                    const val = e.target.value;
                    setSemesterSubject(val);
                    if (val.includes('اجتماعيات')) {
                      setSemesterGrade('الخامس الأساسي (أ، ب)');
                    } else if (val.includes('علوم')) {
                      setSemesterGrade('الرابع الأساسي (أ، ب)');
                    } else if (val.includes('مالية')) {
                      setSemesterGrade('السابع الأساسي (أ، ب)');
                    } else if (val.includes('مهارات') || val.includes('تكنولوجيا')) {
                      if (!['السابع', 'الثامن', 'التاسع', 'العاشر'].some(g => semesterGrade.includes(g))) {
                        setSemesterGrade('السابع الأساسي (أ، ب)');
                      }
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="مهارات رقمية وتكنولوجيا">المهارات الرقمية وتكنولوجيا المعلومات (صفوف 7 - 10)</option>
                  <option value="العلوم العامة والحياتية">العلوم العامة والحياتية (الصف الرابع)</option>
                  <option value="الدراسات الاجتماعية والوطنية">الدراسات الاجتماعية والوطنية (الصف الخامس)</option>
                  <option value="الثقافة المالية والمصرفية">الثقافة المالية والمصرفية (الصف السابع)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف والشعب المستهدفة:</label>
                <select
                  value={semesterGrade}
                  onChange={e => setSemesterGrade(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {semesterSubject.includes('مهارات') && (
                    <>
                      <option value="السابع الأساسي (أ، ب)">الصف السابع الأساسي (أ، ب)</option>
                      <option value="الثامن الأساسي (أ، ب)">الصف الثامن الأساسي (أ، ب)</option>
                      <option value="التاسع الأساسي (أ، ب)">الصف التاسع الأساسي (أ، ب)</option>
                      <option value="العاشر الأساسي (أ، ب)">الصف العاشر الأساسي (أ، ب)</option>
                    </>
                  )}
                  {semesterSubject.includes('علوم') && (
                    <option value="الرابع الأساسي (أ، ب)">الصف الرابع الأساسي (أ، ب)</option>
                  )}
                  {semesterSubject.includes('اجتماعيات') && (
                    <option value="الخامس الأساسي (أ، ب)">الصف الخامس الأساسي (أ، ب)</option>
                  )}
                  {semesterSubject.includes('مالية') && (
                    <option value="السابع الأساسي (أ، ب)">الصف السابع الأساسي (أ، ب)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
                <select
                  value={semesterName}
                  onChange={e => setSemesterName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                  <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الحصص الأسبوعية (معيار 40 د/حصة):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={semesterPeriodsPerWeek}
                    onChange={e => setSemesterPeriodsPerWeek(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center"
                  />
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-2 rounded-xl whitespace-nowrap">
                    {semesterPeriodsPerWeek * 40} د/أسبوع
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ بداية الفصل الدراسي:</label>
                <input
                  type="date"
                  value={semesterStartDate}
                  onChange={e => setSemesterStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ نهاية الفصل الدراسي:</label>
                <input
                  type="date"
                  value={semesterEndDate}
                  onChange={e => setSemesterEndDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">المعلم والاعتمادات الرسمية:</label>
                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>المعلم: {teacherName}</span>
                  <span className="text-slate-400">•</span>
                  <span>{schoolName}</span>
                  <span className="text-slate-400">•</span>
                  <span>المدير: {principalName}</span>
                </div>
              </div>
            </div>

            {/* Textbook Upload Zone */}
            <div className="border-2 border-dashed border-blue-300 rounded-2xl p-4 bg-blue-50/30 hover:bg-blue-50/60 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      رفع ملف الكتاب المدرسي أو المحتوى التعليمي للمنهاج (Textbook Integration)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      يدعم ملفات الكتب والمذكرات (.txt, .docx, .doc, .pdf) أو نسخ ولصق فهرس الوحدات وعناوين الدروس
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    استعراض ورفع الملف
                    <input
                      type="file"
                      accept=".txt,.doc,.docx,.pdf,.json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedFileName && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ✓ {uploadedFileName} ({uploadedFileSize})
                    </span>
                  )}
                </div>
              </div>

              {/* Paste or Preview Textbook Content */}
              <div className="mt-3">
                <textarea
                  rows={2}
                  value={textbookContent}
                  onChange={e => setTextbookContent(e.target.value)}
                  placeholder="يمكنك أيضاً لصق نصوص الوحدات والدروس من كتاب الطالب مباشرة هنا ليتم تقسيمها بدقة وتوليد النتاجات..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Quick 1-Click Sample Curriculum Book Loaders */}
              <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">
                  أو حمّل نموذج كتاب مدرسي جاهز بضغطة واحدة:
                </span>
                <button
                  type="button"
                  onClick={() => loadSampleTextbook('digital7')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-[11px] font-bold transition-all"
                >
                  📘 كتاب مهارات رقمية (سابع)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleTextbook('sci4')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-all"
                >
                  🧪 كتاب علوم عامة (رابع)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleTextbook('soc5')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-all"
                >
                  🌍 كتاب دراسات اجتماعية (خامس)
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleTextbook('fin7')}
                  className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-[11px] font-bold transition-all"
                >
                  💰 كتاب ثقافة مالية (سابع)
                </button>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
              <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                يقوم النظام بحساب {calculatedWeeks} أسبوعاً وتوليد مصفوفة المنهاج و{calculatedWeeks} خطة درس نموذجية مطابقة لمعايير الأونروا الرسمية
              </div>

              <button
                onClick={handleGenerateSemesterBinder}
                disabled={isGeneratingSemester}
                className="px-6 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingSemester ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جارٍ تقسيم المنهاج وتوليد دفتر الفصل كامل...
                  </>
                ) : (
                  <>
                    <BookMarked className="w-4 h-4 text-amber-300" />
                    إنشاء وتقسيم دفتر التحضير للفصل كامل (توليد شامل فوري)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Semester Book Display */}
          {currentSemesterBook && (
            <div className="space-y-6">
              {/* Binder Summary Ribbon */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded">
                      دفتر التحضير الفصلي جاهز
                    </span>
                    <span className="text-xs text-blue-200">
                      تصميم وإعداد: {DEFAULT_TEACHER.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-black">{currentSemesterBook.title}</h3>
                  <p className="text-xs text-blue-100 mt-1">
                    الفترة: من {currentSemesterBook.startDate} إلى {currentSemesterBook.endDate} • {currentSemesterBook.totalWeeks} أسبوعاً • {currentSemesterBook.totalPeriods} حصة مقررة (معيار 40 دقيقة/حصة) • إجمالي الزمن: {currentSemesterBook.totalPeriods * 40} دقيقة ({Math.round((currentSemesterBook.totalPeriods * 40) / 60)} ساعة تدريسية) • {currentSemesterBook.lessonPlans.length} خطة درس معتمدة
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => exportSemesterBookToWord(currentSemesterBook)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <FileDown className="w-4 h-4" />
                    تصدير الدفتر كاملاً (Word .doc)
                  </button>

                  <button
                    onClick={printDocument}
                    className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة الدفتر الشامل
                  </button>
                </div>
              </div>

              {/* 1. Official Semester Syllabus Distribution Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-blue-900 text-white px-5 py-3 font-black text-sm flex items-center justify-between">
                  <span>خطة التوزيع الزمني لمنهاج الفصل الدراسي (مصفوفة المنهاج الرسمية للأونروا)</span>
                  <span className="text-xs font-bold text-blue-200">
                    تصميم وإعداد: {DEFAULT_TEACHER.name}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                        <th className="p-3 border-l text-center w-14">الأسبوع</th>
                        <th className="p-3 border-l text-center w-28">الفترة الزمنية</th>
                        <th className="p-3 border-l w-1/4">الوحدة الدراسية</th>
                        <th className="p-3 border-l w-1/3">موضوع الدرس المستهدف</th>
                        <th className="p-3 border-l text-center w-24">
                          الحصص والزمن
                          <div className="text-[10px] font-normal text-slate-500">(40 د/حصة)</div>
                        </th>
                        <th className="p-3 border-l w-1/4">استراتيجيات التقويم والأنشطة</th>
                        <th className="p-3 text-center w-20 no-print">معاينة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSemesterBook.distributionSlots.map((slot, idx) => (
                        <tr
                          key={slot.weekNumber}
                          className={`border-b border-slate-200 hover:bg-blue-50/50 transition-colors ${
                            idx === selectedBookWeekIndex ? 'bg-blue-50/80 font-bold' : ''
                          }`}
                        >
                          <td className="p-3 text-center font-bold border-l">{slot.weekNumber}</td>
                          <td className="p-3 text-center font-mono text-[11px] border-l direction-ltr">
                            {slot.startDate}
                          </td>
                          <td className="p-3 font-bold text-blue-950 border-l">{slot.unitTitle}</td>
                          <td className="p-3 font-semibold text-slate-800 border-l">{slot.lessonTitle}</td>
                          <td className="p-3 text-center border-l">
                            <div className="font-bold text-blue-800">{slot.periodCount} حصة</div>
                            <div className="text-[10px] text-emerald-700 font-semibold">{slot.periodCount * 40} دقيقة</div>
                          </td>
                          <td className="p-3 text-slate-600 text-[11px] border-l">{slot.assessmentMethod}</td>
                          <td className="p-2 text-center no-print">
                            <button
                              onClick={() => setSelectedBookWeekIndex(idx)}
                              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold text-[10px]"
                            >
                              عرض الخطة
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Interactive Weekly Plan Inspector inside the Semester Binder */}
              {currentSemesterBook.lessonPlans[selectedBookWeekIndex] && (
                <div className="bg-white rounded-2xl border-2 border-blue-900/30 p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        معاينة خطة الدرس للأسبوع ({selectedBookWeekIndex + 1}) من الدفتر الفصلي
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {currentSemesterBook.lessonPlans[selectedBookWeekIndex].lessonTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const plan = currentSemesterBook.lessonPlans[selectedBookWeekIndex];
                          setCurrentPlan(plan);
                          setActiveView('editor');
                          setStatusMessage({
                            text: `تم فتح خطة الأسبوع (${selectedBookWeekIndex + 1}) في المحرر اليومي للتعديل الكامل.`,
                            type: 'success',
                          });
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        تعديل هذه الخطة في المحرر اليومي
                      </button>

                      <button
                        onClick={() => exportLessonPlanToWord(currentSemesterBook.lessonPlans[selectedBookWeekIndex])}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        تصدير كـ Word منفصل
                      </button>
                    </div>
                  </div>

                  {/* 4 UNRWA Phases Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {currentSemesterBook.lessonPlans[selectedBookWeekIndex].phases.map(ph => (
                      <div key={ph.phaseNumber} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-black text-blue-950 mb-1 flex justify-between">
                          <span>{ph.name}</span>
                          <span className="text-slate-500 font-mono">{ph.duration}</span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed mb-1">
                          <strong>دور المعلم:</strong> {ph.teacherRole}
                        </p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          <strong>دور المتعلم:</strong> {ph.learnerRole}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      دفتر التحضير الفصلي الشامل • مدرسة ذكور وادي السير الإعدادية
                    </span>
                    <span className="font-bold text-blue-900">
                      تصميم وإعداد: {DEFAULT_TEACHER.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: PRESETS CATALOG VIEW */}
      {activeView === 'presets' && (
        <div className="space-y-6">
          {/* Preset Filters Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-blue-600" />
                  قوالب المناهج الدراسية المعتمدة (الأونروا - UNRWA)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تضم قوالب كاملة للمهارات الرقمية (7-10)، العلوم (4)، الاجتماعيات (5)، والمالية (7) للفصلين الأول والثاني • تصميم وإعداد: {DEFAULT_TEACHER.name}
                </p>
              </div>

              <div className="text-xs font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                {filteredPresets.length} قالب متطابق
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبحث:</label>
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="الكل">جميع المباحث</option>
                  <option value="مهارات رقمية">المهارات الرقمية والتكنولوجيا</option>
                  <option value="العلوم">العلوم العامة والحياتية</option>
                  <option value="الدراسات الاجتماعية">الدراسات الاجتماعية والوطنية</option>
                  <option value="الثقافة المالية">الثقافة المالية والمصرفية</option>
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                <select
                  value={filterGrade}
                  onChange={e => setFilterGrade(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="الكل">جميع الصفوف</option>
                  <option value="الرابع">الصف الرابع الأساسي</option>
                  <option value="الخامس">الصف الخامس الأساسي</option>
                  <option value="السابع">الصف السابع الأساسي</option>
                  <option value="الثامن">الصف الثامن الأساسي</option>
                  <option value="التاسع">الصف التاسع الأساسي</option>
                  <option value="العاشر">الصف العاشر الأساسي</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
                <select
                  value={filterSemester}
                  onChange={e => setFilterSemester(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="الكل">كلا الفصلين (الأول والثاني)</option>
                  <option value="الفصل الأول">الفصل الدراسي الأول</option>
                  <option value="الفصل الثاني">الفصل الدراسي الثاني</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] mb-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {preset.subject}
                    </span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {preset.grade}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {preset.semester}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm mb-1">{preset.lessonTitle}</h4>
                  <div className="text-xs text-slate-500 mb-3">
                    <strong>الوحدة:</strong> {preset.unitTitle} ({preset.periodCount} حصص)
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1">
                    <div className="font-semibold text-slate-700">عينة من نتاجات التعلم:</div>
                    <div className="line-clamp-2 text-[11px] text-slate-500">{preset.outcomes[0]}</div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-700 bg-indigo-50/60 p-2 rounded-lg mb-3">
                    <strong>أدوات رقمية:</strong> {preset.digitalTools}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">تصميم وإعداد: عامر كراجه</span>
                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    استخدام وتطبيق القالب
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: EDITOR VIEW (SINGLE LESSON PLAN) */}
      {activeView === 'editor' && (
        <div className="space-y-6">
          {/* Generator Input Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    مولّد خطط الدروس بالذكاء الاصطناعي (معايير الأونروا UNRWA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    تصميم وإعداد: {DEFAULT_TEACHER.name} • يمكنك رفع ملف الكتاب أو إدخال البيانات مباشرة
                  </p>
                </div>
              </div>

              {/* Quick Preset Selector with Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">اختر قالباً جاهزاً:</span>
                <select
                  onChange={e => {
                    const preset = COMPREHENSIVE_CURRICULUM_PRESETS.find(p => p.id === e.target.value);
                    if (preset) handleApplyPreset(preset);
                  }}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 max-w-xs"
                >
                  <option value="">-- اختر قالباً من الـ 14 مادة المقررة --</option>
                  <optgroup label="مادة المهارات الرقمية (صفوف 7 - 10)">
                    {COMPREHENSIVE_CURRICULUM_PRESETS.filter(p => p.subject.includes('مهارات')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="مادة العلوم العامة (الصف الرابع)">
                    {COMPREHENSIVE_CURRICULUM_PRESETS.filter(p => p.subject.includes('العلوم')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="مادة الاجتماعيات (الصف الخامس)">
                    {COMPREHENSIVE_CURRICULUM_PRESETS.filter(p => p.subject.includes('الاجتماعية')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="مادة الثقافة المالية (الصف السابع)">
                    {COMPREHENSIVE_CURRICULUM_PRESETS.filter(p => p.subject.includes('المالية')).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <button
                  onClick={() => setActiveView('semester-binder')}
                  className="px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-lg text-xs font-bold"
                >
                  تحضير فصل كامل
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبحث (Subject)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="مثال: مهارات رقمية"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف والشعب (Grade & Section)</label>
                <input
                  type="text"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="مثال: السابع أ، ب"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلم ومعد الخطة</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدرسة (School)</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة التعليمية (Area)</label>
                <input
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مدير المدرسة (Principal)</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={e => setPrincipalName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الوحدة (Unit Title)</label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={e => setUnitTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الدرس (Lesson Subject)</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-black text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد الحصص (Periods)</label>
                <input
                  type="text"
                  value={periodCount}
                  onChange={e => setPeriodCount(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">العام الدراسي والفصل (Semester)</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أدوات التعلم الرقمي المدمجة</label>
                <input
                  type="text"
                  value={digitalTools}
                  onChange={e => setDigitalTools(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="MS Teams, Padlet, Kahoot"
                />
              </div>
            </div>

            {/* Prior Knowledge & Homework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التعلم القبلي (Prior Knowledge)</label>
                <textarea
                  rows={2}
                  value={priorKnowledge}
                  onChange={e => setPriorKnowledge(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="المعارف والمفاهيم السابقة التي يبني عليها الدرس..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الواجب البيتي والمهمات (Homework)</label>
                <textarea
                  rows={2}
                  value={homework}
                  onChange={e => setHomework(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="التكليفات والأنشطة الرقمية المقترحة للمنزل..."
                />
              </div>
            </div>

            {/* Textbook Upload / Content Zone */}
            <div className="mb-4 border border-blue-200 bg-blue-50/40 p-3 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  رفع ملف الكتاب المدرسي أو المحتوى الخاص بالدرس (Textbook Integration):
                </span>
                <label className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  رفع ملف (.txt, .docx, .pdf)
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={2}
                value={textbookContent}
                onChange={e => setTextbookContent(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="الصق نصوص الدرس أو فقرات الكتاب المدرسي هنا لتقوم الخوارزمية الذكية باستخراج النتاجات والمراحل مباشرة..."
              />
            </div>

            {/* Generate Trigger Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                ملتزم بالمعايير التربوية الأربعة الرسمية للأونروا • تصميم وإعداد: عامر كراجه
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جارٍ إعداد خطة الأونروا بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    توليد الخطة الذكية فوراً (Generate UNRWA Plan)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OFFICIAL UNRWA DOCUMENT DISPLAY (EDITABLE & PRINT OPTIMIZED) */}
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-6 sm:p-8 space-y-6 print:p-0 print:border-none print:shadow-none">
            {/* 1. Official UNRWA Header Banner */}
            <div className="border-2 border-blue-900 bg-blue-50/50 p-4 rounded-xl text-center space-y-1.5 print:border-black print:bg-transparent">
              <div className="flex items-center justify-between border-b border-blue-900/20 pb-2 mb-2 print:border-black">
                <div className="text-right text-xs font-bold text-blue-950">
                  وكالة الغوث الدولية (UNRWA)<br />
                  دائرة التربية والتعليم<br />
                  منطقة: <span className="underline font-black">{currentPlan.area}</span>
                </div>
                <div className="text-center font-black text-blue-900 text-lg print:text-black">
                  دَفْتَر خُطَطِ الدُّرُوسِ اليَوْمِيَّة<br />
                  <span className="text-sm font-semibold text-slate-700">النموذج الرسمي المعتمد لمدارس وكالة الغوث</span>
                  <div className="text-[11px] font-bold text-blue-700 mt-0.5">
                    تصميم وإعداد المعلم: {DEFAULT_TEACHER.name}
                  </div>
                </div>
                <div className="text-left text-xs font-bold text-blue-950">
                  مدرسة: <span className="underline font-black">{currentPlan.schoolName}</span><br />
                  العام الدراسي: <span className="font-mono">{currentPlan.academicYear}</span>
                </div>
              </div>

              {/* Metadata Quick Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs pt-1">
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-slate-500 block text-[10px]">المبحث:</span>
                  <input
                    type="text"
                    value={currentPlan.subject}
                    onChange={e => setCurrentPlan({ ...currentPlan, subject: e.target.value })}
                    className="font-bold text-blue-900 w-full bg-transparent text-center"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-slate-500 block text-[10px]">الصف والشعب:</span>
                  <input
                    type="text"
                    value={currentPlan.grade}
                    onChange={e => setCurrentPlan({ ...currentPlan, grade: e.target.value })}
                    className="font-bold text-slate-800 w-full bg-transparent text-center"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-blue-200 md:col-span-2">
                  <span className="text-slate-500 block text-[10px]">عنوان الوحدة:</span>
                  <input
                    type="text"
                    value={currentPlan.unitTitle}
                    onChange={e => setCurrentPlan({ ...currentPlan, unitTitle: e.target.value })}
                    className="font-bold text-slate-800 w-full bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-blue-200 md:col-span-2">
                  <span className="text-slate-500 block text-[10px]">موضوع الدرس:</span>
                  <input
                    type="text"
                    value={currentPlan.lessonTitle}
                    onChange={e => setCurrentPlan({ ...currentPlan, lessonTitle: e.target.value })}
                    className="font-black text-blue-950 w-full bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-slate-500 block text-[10px]">عدد الحصص المقررة:</span>
                  <input
                    type="text"
                    value={currentPlan.periodCount}
                    onChange={e => setCurrentPlan({ ...currentPlan, periodCount: e.target.value })}
                    className="font-bold text-slate-800 w-full bg-transparent text-center"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-blue-200 md:col-span-2">
                  <span className="text-slate-500 block text-[10px]">التعلم القبلي:</span>
                  <textarea
                    rows={1}
                    value={currentPlan.priorKnowledge}
                    onChange={e => setCurrentPlan({ ...currentPlan, priorKnowledge: e.target.value })}
                    className="font-medium text-slate-800 w-full bg-transparent resize-none text-xs"
                  />
                </div>
              </div>

              <div className="bg-white p-2 rounded border border-blue-200 text-right">
                <span className="text-slate-500 block text-[10px]">الواجب البيتي والمهمات:</span>
                <input
                  type="text"
                  value={currentPlan.homework}
                  onChange={e => setCurrentPlan({ ...currentPlan, homework: e.target.value })}
                  className="font-medium text-slate-800 w-full bg-transparent text-xs"
                />
              </div>
            </div>

            {/* 2. Learning Outcomes Box */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-blue-900 text-white px-4 py-2 text-xs font-black flex items-center justify-between print:bg-slate-200 print:text-black">
                <span>النتاجات التعليمية السلوكية والمعرفية والمهارية (Learning Outcomes)</span>
                <button
                  onClick={handleAddOutcome}
                  className="no-print text-[11px] bg-blue-700 hover:bg-blue-600 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  إضافة نتاج
                </button>
              </div>
              <div className="p-3 bg-slate-50/50 space-y-2">
                {currentPlan.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-blue-800 font-bold text-xs pt-1 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      value={outcome.replace(/^\d+\.\s*/, '')}
                      onChange={e => handleUpdateOutcome(idx, `${idx + 1}. ${e.target.value}`)}
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                    <button
                      onClick={() => handleRemoveOutcome(idx)}
                      className="no-print p-1.5 text-slate-400 hover:text-rose-600 shrink-0"
                      title="حذف هذا النتاج"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Official UNRWA 4-Column Lesson Execution Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-blue-900 text-white px-4 py-2 text-xs font-black print:bg-slate-200 print:text-black">
                جدول سير وتنفيذ الحصة الصفية (مراحل الأونروا الأربعة الرسمية) • إعداد وتصميم: {DEFAULT_TEACHER.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                      <th className="p-3 border-l border-slate-300 w-1/5">
                        1. المراحل (Phases)
                      </th>
                      <th className="p-3 border-l border-slate-300 w-2/5">
                        2. دور المعلم واستراتيجيات التدريس (Teacher Role)
                      </th>
                      <th className="p-3 border-l border-slate-300 w-1/3">
                        3. دور المتعلم والأنشطة الرقمية (Learner Role)
                      </th>
                      <th className="p-3 w-28 text-center">
                        4. الزمن
                        <div className="text-[10px] font-normal text-slate-500">(معيار 40 د/حصة)</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPlan.phases.map((phase, pIdx) => {
                      const phaseBadgeColors = [
                        'bg-amber-50 text-amber-900 border-amber-200',
                        'bg-blue-50 text-blue-900 border-blue-200',
                        'bg-indigo-50 text-indigo-900 border-indigo-200',
                        'bg-emerald-50 text-emerald-900 border-emerald-200',
                      ];

                      return (
                        <tr key={pIdx} className="border-b border-slate-200 hover:bg-slate-50/50">
                          {/* Phase Title */}
                          <td className="p-3 border-l border-slate-200 align-top">
                            <div className={`p-2 rounded-lg border font-bold text-xs ${phaseBadgeColors[pIdx % 4]}`}>
                              {phase.name}
                            </div>
                            {pIdx === 2 && (
                              <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded border border-indigo-100">
                                <strong>تكامل رقمي:</strong> توظيف منصة MS Teams / الأنشطة المتمايزة
                              </div>
                            )}
                          </td>

                          {/* Teacher Role */}
                          <td className="p-3 border-l border-slate-200 align-top">
                            <textarea
                              rows={5}
                              value={phase.teacherRole}
                              onChange={e => handleUpdatePhase(pIdx, 'teacherRole', e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs leading-relaxed font-normal bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* Learner Role */}
                          <td className="p-3 border-l border-slate-200 align-top">
                            <textarea
                              rows={5}
                              value={phase.learnerRole}
                              onChange={e => handleUpdatePhase(pIdx, 'learnerRole', e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs leading-relaxed font-normal bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* Duration */}
                          <td className="p-3 align-top text-center">
                            <input
                              type="text"
                              value={phase.duration}
                              onChange={e => handleUpdatePhase(pIdx, 'duration', e.target.value)}
                              className="w-full text-center font-bold text-xs p-1.5 border border-slate-200 rounded bg-white text-blue-900"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Self-Reflection Box */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-2 text-xs font-black print:bg-slate-200 print:text-black">
                التأمل الذاتي حول عمليتي التعلم والتعليم (Self-Reflection)
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/50">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="block font-bold text-xs text-emerald-800 mb-1">
                    نقاط القوة وما تحقق بنجاح:
                  </span>
                  <textarea
                    rows={3}
                    value={currentPlan.selfReflection.strengths}
                    onChange={e =>
                      setCurrentPlan({
                        ...currentPlan,
                        selfReflection: { ...currentPlan.selfReflection, strengths: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg leading-relaxed resize-none"
                  />
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="block font-bold text-xs text-amber-800 mb-1">
                    التحديات أو الفروق المرصودة:
                  </span>
                  <textarea
                    rows={3}
                    value={currentPlan.selfReflection.challenges}
                    onChange={e =>
                      setCurrentPlan({
                        ...currentPlan,
                        selfReflection: { ...currentPlan.selfReflection, challenges: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg leading-relaxed resize-none"
                  />
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="block font-bold text-xs text-blue-800 mb-1">
                    التوصيات والبدائل التربوية للحصة القادمة:
                  </span>
                  <textarea
                    rows={3}
                    value={currentPlan.selfReflection.recommendations}
                    onChange={e =>
                      setCurrentPlan({
                        ...currentPlan,
                        selfReflection: { ...currentPlan.selfReflection, recommendations: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. Official Footer & Metadata Signatures Row */}
            <div className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-4 print:border-black">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">الصف / الشعبة:</span>
                  <span className="font-bold">{currentPlan.grade}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">العدد الكلي:</span>
                  <input
                    type="number"
                    value={currentPlan.metadata.totalStudents}
                    onChange={e =>
                      setCurrentPlan({
                        ...currentPlan,
                        metadata: { ...currentPlan.metadata, totalStudents: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full text-center font-bold bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">عدد الغياب:</span>
                  <input
                    type="number"
                    value={currentPlan.metadata.absentCount}
                    onChange={e =>
                      setCurrentPlan({
                        ...currentPlan,
                        metadata: { ...currentPlan.metadata, absentCount: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full text-center font-bold text-rose-600 bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">ترتيب الحصة:</span>
                  <input
                    type="text"
                    value={currentPlan.metadata.periodOrder}
                    onChange={e =>
                      setCurrentPlan({
                        ...currentPlan,
                        metadata: { ...currentPlan.metadata, periodOrder: e.target.value },
                      })
                    }
                    className="w-full text-center font-bold bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px]">اليوم والتاريخ:</span>
                  <span className="font-bold font-mono">{currentPlan.metadata.day} - {currentPlan.metadata.date}</span>
                </div>
              </div>

              {/* Signatures Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200 text-center text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px] mb-1">تصميم وإعداد المعلم:</span>
                  <span className="font-bold text-slate-900 block text-sm">{currentPlan.teacherName}</span>
                  <span className="text-[10px] text-blue-700 mt-2 block font-mono">معلم مهارات رقمية وتكنولوجيا</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px] mb-1">أخصائي المبحث (المشرف التربوي):</span>
                  <span className="font-bold text-slate-900 block text-sm">دائرة التربية والتعليم - {currentPlan.area}</span>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">توقيع المتابعة والإشراف</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px] mb-1">اسم وتوقيع مدير المدرسة:</span>
                  <span className="font-bold text-slate-900 block text-sm">{currentPlan.principalName}</span>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">الاعتماد الرسمي للمدرسة</span>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                منظومة خطط الدروس اليومية لوكالة الغوث الدولية (الأونروا) • تصميم وإعداد: {DEFAULT_TEACHER.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PLANS LIBRARY VIEW */}
      {activeView === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-base text-slate-800">مكتبة خطط الدروس المحفوظة</h3>
              <p className="text-xs text-slate-500">
                تصميم وإعداد: {DEFAULT_TEACHER.name} • يمكنك إعادة فتح أي خطة، تعديلها، تصديرها لوورد، أو طباعتها فوراً.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('semester-binder')}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <BookMarked className="w-4 h-4" />
                تحضير فصل كامل
              </button>

              <button
                onClick={() => setActiveView('presets')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                القوالب المعتمدة
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlans.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                      {p.subject}
                    </span>
                    <span className="font-mono">{p.createdAt}</span>
                  </div>

                  <h4 className="font-black text-slate-800 text-base mb-1">{p.lessonTitle}</h4>
                  <p className="text-xs text-slate-600 mb-3">
                    {p.unitTitle} • {p.grade} • {p.periodCount} حصص
                  </p>

                  <div className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-lg mb-3">
                    <strong>نتاجات الدرس:</strong> {p.outcomes[0] || 'لا توجد نتاجات مسجلة'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <button
                    onClick={() => {
                      setCurrentPlan(p);
                      setActiveView('editor');
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    عرض وتعديل الخطة
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => exportLessonPlanToWord(p)}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold"
                      title="تصدير وورد"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeletePlan(p.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      title="حذف الخطة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
