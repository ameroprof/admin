import { LessonPlan, SemesterBook, SemesterDistributionSlot } from '../types';
import { COMPREHENSIVE_CURRICULUM_PRESETS } from '../data/curriculumPresets';
import { DEFAULT_TEACHER } from '../data/mockData';

// Curriculum outlines per subject and grade for automatic semester curriculum division
const CURRICULUM_OUTLINES: Record<string, { units: { title: string; lessons: string[] }[] }> = {
  // مهارات رقمية صف سابع
  'مهارات رقمية_سابع_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: المواطنة الرقمية والأمن السيبراني',
        lessons: [
          'الهوية الرقمية والأثر الرقمي على شبكة الإنترنت',
          'قواعد إنشاء كلمات المرور القوية وطرق حفظها الآمنة',
          'المصادقة ثنائية العوامل (2FA) وحماية الحسابات من الاختراق',
          'التصيد الاحتيالي (Phishing) وكشف الرسائل والروابط المشبوهة',
          'الأخلاقيات والمواطنة الرقمية في بيئات التواصل والتعلم',
        ],
      },
      {
        title: 'الوحدة الثانية: أساسيات نظم التشغيل وإدارة الملفات السحابية',
        lessons: [
          'نظام التشغيل ومكوناته وإدارة موارد الحاسوب',
          'إدارة المجلدات والصلاحيات وتنظيم الملفات في ون درايف',
          'أدوات مايكروسوفت 365 والتعاون المتزامن عبر Teams',
          'مراجعة وتطبيقات عملية وتقويم أدائي تكويني',
        ],
      },
      {
        title: 'الوحدة الثالثة: البرمجة بلغة سكراتش - المفاهيم التأسيسية',
        lessons: [
          'الواجهة التفاعلية لمنصة سكراتش وإحداثيات الحركة',
          'لبنات التحكم والتكرار البسيط (Repeat Loop)',
          'المظاهر والأصوات والمؤثرات في سكراتش',
          'المشروع الختامي للفصل الدراسي الأول واختبار نهاية الفصل',
        ],
      },
    ],
  },

  'مهارات رقمية_سابع_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: البرمجة المتقدمة بسكراتش والمتغيرات',
        lessons: [
          'مفهوم المتغير (Variable) وأهميته في تخزين البيانات',
          'العمليات الحسابية ومقارنة الأعداد في سكراتش',
          'الجمل الشرطية (if... then) وتطبيقات الألعاب التفاعلية',
          'بناء لعبة المتاهة وجمع النقاط وتفادي العوائق',
          'الاستشعار والتحكم بالملامسة ولون الكائنات',
        ],
      },
      {
        title: 'الوحدة الثانية: أوراق العمل الرقمية والتفكير المنطقي',
        lessons: [
          'حل المشكلات وتجزئة المسائل المعقدة (Decomposition)',
          'الخوارزميات والمخططات الانسيابية البسيطة',
          'إجراء اختبارات الكود وتصحيح الأخطاء (Debugging)',
          'عرض مشاريع الطلبة البرمجية وتقويم الأقران',
        ],
      },
      {
        title: 'الوحدة الثالثة: التكنولوجيا في خدمة المجتمع والبيئة',
        lessons: [
          'الإنترنت الآمن وحماية خصوصية الأسرة والبيانات',
          'التكنولوجيا الخضراء والنفايات الإلكترونية',
          'مراجعة عامة للمنهاج وتطبيق الاختبار النهائي العملي',
        ],
      },
    ],
  },

  // مهارات رقمية صف ثامن
  'مهارات رقمية_ثامن_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: شبكات الحاسوب والبنية التحتية',
        lessons: [
          'مفهوم شبكات الحاسوب وأهميتها وأنواعها (LAN / WAN)',
          'وسائط نقل البيانات السلكية واللاسلكية ومعدات الشبكة',
          'نظام العنونة المنطقية IP Address وطريقة انتقال الحزم',
          'بروتوكولات الإنترنت الأساسية وخادم أسماء النطاقات (DNS)',
        ],
      },
      {
        title: 'الوحدة الثانية: معالجة النصوص المتقدمة والعروض التقديمية',
        lessons: [
          'تنسيق المستندات الطويلة وفهرسة الموضوعات آلياً',
          'دمج المراسلات (Mail Merge) في بيئات العمل',
          'تصميم العروض التقديمية التفاعلية وقواعد العرض الناجح',
          'المشروع العملي النصي واختبار منتصف الفصل',
        ],
      },
    ],
  },

  'مهارات رقمية_ثامن_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: الجداول الإلكترونية المتقدمة (Excel)',
        lessons: [
          'مفاهيم جداول البيانات وإدخال البيانات المجدولة وتنسيقها',
          'الدوال الرياضية والإحصائية (SUM, AVERAGE, MAX, MIN)',
          'الدالة الشرطية المنطقية (IF) وتطبيقاتها التربوية',
          'دالة العد الشرطي (COUNTIF) والتصفية المتقدمة للبيانات',
          'المخططات والرسوم البيانية وقراءة المؤشرات البصرية',
        ],
      },
      {
        title: 'الوحدة الثانية: قواعد البيانات البسيطة والذكاء الاصطناعي',
        lessons: [
          'مفهوم قاعدة البيانات والجداول والسجلات والحقول',
          'المفتاح الأساسي (Primary Key) والربط بين الجداول',
          'مقدمة في الذكاء الاصطناعي والتعرف على الأنماط',
          'المشروع الختامي لمعالجة البيانات والاختبار العملي النهائي',
        ],
      },
    ],
  },

  // مهارات رقمية صف تاسع
  'مهارات رقمية_تاسع_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: مقدمة البرمجة النصية بلغة بايثون (Python)',
        lessons: [
          'بيئة التطوير (IDLE / Replit) ومزايا لغة بايثون',
          'أوامر الإخراج print() وتنسيق النصوص والأرقام',
          'المتغيرات وأنواع البيانات الأساسية (int, float, str, bool)',
          'دوال الإدخال input() وتحويل أنواع البيانات (Casting)',
          'العمليات الحسابية والمعاملات الرياضية وأولويات العمليات',
        ],
      },
      {
        title: 'الوحدة الثانية: أمن المعلومات وقواعد البيانات العلائقية',
        lessons: [
          'أمن قواعد البيانات وطرق التشفير الأساسية',
          'التطبيقات الحياتية للبرمجة في أتمتة الأعمال اليومية',
          'مراجعة شاملة وتطبيق مشاريع بايثون البرمجية',
        ],
      },
    ],
  },

  'مهارات رقمية_تاسع_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: التحكم في تدفق البرنامج بلغة بايثون',
        lessons: [
          'المعاملات المنطقية والمقارنات (==, !=, <, >, and, or)',
          'الجمل الشرطية البسيطة (if-else statements)',
          'الجمل الشرطية المتعددة (if-elif-else hierarchy)',
          'حلقات التكرار المحددة (For Loops) ودالة range()',
          'حلقات التكرار الشرطية (While Loops) وتفادي الحلقات اللانهائية',
        ],
      },
      {
        title: 'الوحدة الثانية: القوائم والدوال البرمجية',
        lessons: [
          'القوائم (Lists) وإضافة وحذف وفهرسة العناصر',
          'بناء الدوال الخاصة (Functions) باستخدام كلمة def',
          'مشروع برمجي تطبيقي ختامي والاختبار العملي',
        ],
      },
    ],
  },

  // مهارات رقمية صف عاشر
  'مهارات رقمية_عاشر_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: تصميم وتطوير صفحات الويب (HTML5 & CSS3)',
        lessons: [
          'بنية صفحات الويب والوسوم الدلالية لـ HTML5',
          'وسوم النصوص والعناوين والفقرات والقوائم والصور',
          'الروابط التشعبية والجداول ونماذج الإدخال (Forms)',
          'أساسيات تنسيق صفحات الويب بلغة CSS3 (الألوان والخطوط)',
          'نموذج الصندوق (Box Model) والهوامش والحدود (Margin & Padding)',
          'تخطيط الصفحات المتجاوبة ونشر الموقع على الاستضافة السحابية',
        ],
      },
    ],
  },

  'مهارات رقمية_عاشر_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: الذكاء الاصطناعي وتعلم الآلة (AI & Machine Learning)',
        lessons: [
          'مفهوم الذكاء الاصطناعي ومجالاته والفرق بينه وبين البرمجة التقليدية',
          'مراحل تعلم الآلة: جمع البيانات، التدريب، والاختبار',
          'تدريب نموذج ذكاء اصطناعي عملياً عبر Teachable Machine',
          'الرؤية الحاسوبية ومعالجة اللغات الطبيعية (NLP)',
          'أخلاقيات الذكاء الاصطناعي، الخصوصية، ومستقبل الوظائف',
          'المشروع الابتكاري التكنولوجي الختامي والاختبار النهائي',
        ],
      },
    ],
  },

  // اجتماعيات صف خامس
  'اجتماعيات_خامس_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: جغرافية وطني فلسطين ومعالمه',
        lessons: [
          'الموقع الجغرافي لفلسطين وأهميته الاستراتيجية والحضارية',
          'الحدود الطبيعية والسياسية والدول المجاورة لفلسطين',
          'التضاريس الكبرى: السهول الساحلية والداخلية وجبال فلسطين',
          'الأغوار والبحر الميت وصحراء النقب والتنوع البيئي',
          'المناخ وعناصره وتأثيره على الأنشطة الاقتصادية والزراعية',
        ],
      },
    ],
  },

  'اجتماعيات_خامس_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: التراث الشعبي والهوية الفلسطينية',
        lessons: [
          'مفهوم التراث الشعبي المادي وغير المادي',
          'عناصر التراث الفلسطيني: الأزياء والمطرزات والأدوات الشعبية',
          'الدبكة والأهازيج والأمثال الشعبية ودورها في الذاكرة الجمعية',
          'المدن التاريخية والآثار والمعالم الحضارية في فلسطين',
          'واجبنا الوطني في صون التراث ونقله للأجيال القادمة',
        ],
      },
    ],
  },

  // علوم صف رابع
  'علوم_رابع_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: جسم الإنسان وصحته',
        lessons: [
          'الهيكل العظمي وأجزاؤه الرئيسية ووظائفه الحمائية',
          'المفاصل والعضلات وتكاملها لإحداث الحركة السليمة',
          'الحواس الخمس وسلامة أعضاء الحس في جسم الإنسان',
          'العادات الغذائية والصحية السليمة لحماية الجسم والنمو',
        ],
      },
    ],
  },

  'علوم_رابع_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: المادة وخصائصها وتحولاتها',
        lessons: [
          'مفهوم المادة وحالاتها الثلاث (الصلبة، السائلة، والغازية)',
          'خصائص كل حالة من حيث الشكل والحجم وحركة الجسيمات',
          'التحولات الفيزيائية بالحرارة: الانصهار والغليان والتبخر',
          'التحولات الفيزيائية بالتبريد: التكاثف والتجمد ودورة الماء',
          'تطبيقات عملية وتجارب استكشافية لحفظ كتلة المادة',
        ],
      },
    ],
  },

  // مالية صف سابع
  'مالية_سابع_فصل 1': {
    units: [
      {
        title: 'الوحدة الأولى: نشأة المال والمبادلات الاقتصادية',
        lessons: [
          'مفهوم المقايضة كأول نظام للتبادل التجاري',
          'صعوبات وعيوب نظام المقايضة في التبادلات اليومية',
          'المراحل التاريخية لتطور النقود (السلعية، المعدنية، والورقية)',
          'وظائف النقود الأساسية كوسيط للتبادل ومستودع للقيمة',
          'النقود الائتمانية والعملات الإلكترونية ووسائل الدفع الحديثة',
        ],
      },
    ],
  },

  'مالية_سابع_فصل 2': {
    units: [
      {
        title: 'الوحدة الأولى: التخطيط المالي الشخصي والادخار',
        lessons: [
          'التمييز بين الحاجات الأساسية والرغبات الشخصية',
          'مفهوم الميزانية المالية المتوازنة وضبط المصروفات',
          'الادخار وأهميته في تحقيق الأهداف المستقبلية ومواجهة الطوارئ',
          'ترشيد الاستهلاك وتجنب الإسراف والإنفاق العشوائي',
          'إعداد خطة مالية أسبوعية وتطبيقها عملياً في الحياة اليومية',
        ],
      },
    ],
  },
};

/**
 * Calculates number of school weeks between start and end date
 */
export function calculateSemesterWeeks(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.max(1, Math.min(22, Math.round(diffDays / 7)));
  return weeks;
}

/**
 * Generates dates for a specific week number
 */
export function getWeekDates(startDateStr: string, weekIndex: number): { start: string; end: string } {
  const start = new Date(startDateStr);
  start.setDate(start.getDate() + weekIndex * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 4); // Thursday

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Automatically divides curriculum and generates a Complete Semester Preparation Binder (دفتر التحضير الفصلي الشامل)
 */
export function generateFullSemesterBinder(params: {
  subject: string;
  grade: string;
  semesterName: string;
  startDate: string;
  endDate: string;
  periodsPerWeek: number;
  textbookText?: string;
  teacherName?: string;
  schoolName?: string;
  area?: string;
  principalName?: string;
}): SemesterBook {
  const {
    subject,
    grade,
    semesterName,
    startDate,
    endDate,
    periodsPerWeek = 2,
    textbookText = '',
    teacherName = DEFAULT_TEACHER.name,
    schoolName = DEFAULT_TEACHER.school,
    area = DEFAULT_TEACHER.area,
    principalName = DEFAULT_TEACHER.principal,
  } = params;

  const totalWeeks = calculateSemesterWeeks(startDate, endDate);
  const totalPeriods = totalWeeks * periodsPerWeek;

  // Find curriculum outline matching subject & grade & semester
  let subjectKey = '';
  if (subject.includes('مهارات') || subject.includes('تكنولوجيا')) {
    if (grade.includes('سابع')) subjectKey = `مهارات رقمية_سابع_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
    else if (grade.includes('ثامن')) subjectKey = `مهارات رقمية_ثامن_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
    else if (grade.includes('تاسع')) subjectKey = `مهارات رقمية_تاسع_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
    else if (grade.includes('عاشر')) subjectKey = `مهارات رقمية_عاشر_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
  } else if (subject.includes('اجتماعيات') || subject.includes('الاجتماعية')) {
    subjectKey = `اجتماعيات_خامس_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
  } else if (subject.includes('علوم') || subject.includes('العلوم')) {
    subjectKey = `علوم_رابع_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
  } else if (subject.includes('مالية') || subject.includes('المالية')) {
    subjectKey = `مالية_سابع_${semesterName.includes('الأول') ? 'فصل 1' : 'فصل 2'}`;
  }

  // Flatten lessons from outline or fallback
  const outline = CURRICULUM_OUTLINES[subjectKey] || CURRICULUM_OUTLINES['مهارات رقمية_سابع_فصل 2'];
  const allLessons: { unit: string; lesson: string }[] = [];

  outline.units.forEach(u => {
    u.lessons.forEach(l => {
      allLessons.push({ unit: u.title, lesson: l });
    });
  });

  // If textbookText was uploaded, we can also extract custom chapters
  if (textbookText && textbookText.trim().length > 20) {
    const lines = textbookText.split('\n').filter(l => l.trim().length > 3 && l.length < 120);
    if (lines.length >= 3) {
      lines.slice(0, 16).forEach((line, idx) => {
        allLessons.push({
          unit: `الوحدة المقررة من الكتاب المرفوع (جزء ${Math.floor(idx / 4) + 1})`,
          lesson: line.trim(),
        });
      });
    }
  }

  const distributionSlots: SemesterDistributionSlot[] = [];
  const lessonPlans: LessonPlan[] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const weekNumber = w + 1;
    const { start: weekStart, end: weekEnd } = getWeekDates(startDate, w);

    // Pick lesson cyclically or distributed
    const lessonItem = allLessons[w % allLessons.length] || {
      unit: `الوحدة الدراسية المقررة (${Math.floor(w / 4) + 1})`,
      lesson: `الدرس ${weekNumber}: تطبيقات عملية ومراجعة تكوينية في ${subject}`,
    };

    const periodCount = periodsPerWeek;
    const periodMinutes = 40;
    const totalLessonMinutes = periodCount * periodMinutes;

    // Detailed phase duration calculation strictly honoring 40 minutes per single period
    let phase1Duration = '5 دقائق';
    let phase2Duration = '15 دقيقة';
    let phase3Duration = '15 دقيقة';
    let phase4Duration = '5 دقائق';

    if (periodCount === 2) {
      // 80 minutes total (2 periods x 40 min)
      phase1Duration = '10 دقائق';
      phase2Duration = '25 دقيقة';
      phase3Duration = '30 دقيقة';
      phase4Duration = '15 دقيقة';
    } else if (periodCount === 3) {
      // 120 minutes total (3 periods x 40 min)
      phase1Duration = '15 دقيقة';
      phase2Duration = '40 دقيقة';
      phase3Duration = '45 دقيقة';
      phase4Duration = '20 دقيقة';
    } else if (periodCount >= 4) {
      const p1 = Math.round(totalLessonMinutes * 0.12);
      const p2 = Math.round(totalLessonMinutes * 0.33);
      const p3 = Math.round(totalLessonMinutes * 0.38);
      const p4 = totalLessonMinutes - (p1 + p2 + p3);
      phase1Duration = `${p1} دقيقة`;
      phase2Duration = `${p2} دقيقة`;
      phase3Duration = `${p3} دقيقة`;
      phase4Duration = `${p4} دقيقة`;
    }

    const periodCountLabel = periodCount === 1
      ? 'حصة واحدة (40 دقيقة)'
      : periodCount === 2
      ? 'حصتان (80 دقيقة - 40 دقيقة لكل حصة)'
      : `${periodCount} حصص (${totalLessonMinutes} دقيقة - مدة الحصة 40 دقيقة)`;

    const outcomesText = `1. يُعرّف الطالب مفاهيم الدرس (${lessonItem.lesson}) بدقة.\n2. يُطبق المهارات والأدوات الرقمية في مختبر الحاسوب.\n3. يُنجز التدريبات والأنشطة التعاونية بنجاح.`;

    // 1. Semester distribution slot
    const slot: SemesterDistributionSlot = {
      weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
      unitTitle: lessonItem.unit,
      lessonTitle: lessonItem.lesson,
      periodCount,
      periodMinutes: 40,
      totalMinutes: totalLessonMinutes,
      outcomes: outcomesText,
      digitalTools: 'MS Teams, Padlet, Kahoot, Liveworksheets',
      assessmentMethod: 'ملاحظة مباشرة، بطاقة خروج Exit Ticket، ومهمة رقمية',
    };
    distributionSlots.push(slot);

    // 2. Full detailed UNRWA lesson plan for this week
    const plan: LessonPlan = {
      id: `lp-sem-${weekNumber}-${Date.now()}`,
      subject,
      grade,
      teacherName,
      schoolName,
      area,
      principalName,
      unitTitle: lessonItem.unit,
      lessonTitle: lessonItem.lesson,
      periodCount: periodCountLabel,
      academicYear: `2026/2027 - ${semesterName}`,
      priorKnowledge: `المكتسبات السابقة والمفاهيم التأسيسية لدرس الأسبوع السابق.`,
      homework: `حل النشاط التطبيقي المقابل للدرس في الكتاب المدرسي ومشاركته عبر MS Teams.`,
      digitalTools: 'MS Teams, Padlet, Kahoot, Liveworksheets',
      outcomes: [
        `1. يُوضح الطالب المفاهيم الأساسية لدرس (${lessonItem.lesson}) بلغة علمية دقيقة وبأسلوبه الخاص.`,
        `2. يستنتج القواعد والمهارات العملية المرتبطة بالدرس من خلال التفاعل مع عروض المعلم والأنشطة.`,
        `3. يُوظف الأدوات والمنصات الرقمية المتاحة في إنجاز المهمة وحل المشكلات الصفية.`,
        `4. يُطبق خطوات التنفيذ العملي بنجاح وتفانٍ داخل بيئة التعلم.`,
        `5. يُظهر روح التعاون الإيجابي مع زملائه أثناء الأنشطة الجماعية والمجموعات المتمايزة.`
      ],
      phases: [
        {
          phaseNumber: 1,
          name: '1. التهيئة والاندماج (Engagement & Warm-up)',
          teacherRole: `استثارة دافعية الطلبة لموضوع الأسبوع (${weekNumber}) عبر مقطع فيديو تفاعلي أو موقف مشكل استهلالي وطرح سؤال محوري يربط المفهوم بالواقع اليومي. تدوين المفاتيح على السبورة.`,
          learnerRole: `التركيز والملاحظة، استدعاء الخبرات السابقة، والمشاركة في العصف الذهني عبر Padlet أو المشاركة الصفية (فكر-زاوج-شارك).`,
          duration: phase1Duration,
        },
        {
          phaseNumber: 2,
          name: '2. الشرح والتفسير (Explanation & Exploration)',
          teacherRole: `شرح المفاهيم الجوهرية للدرس (${lessonItem.lesson}) ونمذجة خطوات العمل على الشاشة. توجيه أسئلة سابرة لتقييم الاستيعاب وتوضيح الفروق الدقيقة والمفاهيم المحورية.`,
          learnerRole: `التدوين في السجل، التفاعل مع المعلم، حل تدريب استكشافي أولي بالتعاون مع الزميل، والاستفسار عن النقاط الدقيقة.`,
          duration: phase2Duration,
        },
        {
          phaseNumber: 3,
          name: '3. التوسع ودعم التميز (Expansion & Differentiation)',
          teacherRole: `توزيع الطلبة على مجموعات متمايزة تراعي الفروق الفردية: مجموعة الدعم والتمكين (بطاقات إرشادية مساعدة)، مجموعة التطبيق القياسي، ومجموعة التميز (مهمة إثرائية إضافية عبر تيمز).`,
          learnerRole: `العمل التعاوني النشط وفق الأدوار (قائد، باحث، مسجل، متحدث)، تطبيق المهارات عملياً، وإنتاج المخرج المشترك للمجموعة.`,
          duration: phase3Duration,
        },
        {
          phaseNumber: 4,
          name: '4. تأكيد التعلم والتقويم (Closure & Assessment)',
          teacherRole: `إدارة تقييم ختامي تكويني عبر بطاقات الخروج (Exit Tickets) أو مسابقة Kahoot سريعة، وتلخيص الأفكار الذهبية للحصة ورصد الواجب البيتي.`,
          learnerRole: `الإجابة عن بطاقة الخروج وتقييم الأداء الذاتي وتلخيص أبرز ما تم تعلمه وتطبيقه اليوم.`,
          duration: phase4Duration,
        },
      ],
      selfReflection: {
        strengths: `تفاعل ملموس وإتقان واضح لمعظم نتاجات الدرس المستهدفة للأسبوع (${weekNumber}) وفق معايير الأونروا.`,
        challenges: `تفاوت يسير في زمن إنجاز الأنشطة العملية بين بعض المجموعات.`,
        recommendations: `تعزيز استراتيجيات تدريب الأقران في الأسبوع القادم لتسريع وتيرة التطبيق.`,
      },
      metadata: {
        totalStudents: 38,
        absentCount: 0,
        periodOrder: periodCount === 1 ? 'الحصة الأولى' : 'الأولى والثانية',
        date: weekStart,
        day: 'الأحد',
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    lessonPlans.push(plan);
  }

  return {
    id: `book-${Date.now()}`,
    title: `دفتر تحضير الدروس الفصلي الشامل - ${subject} (${grade}) - ${semesterName}`,
    subject,
    grade,
    semesterName,
    academicYear: `2026/2027`,
    startDate,
    endDate,
    totalWeeks,
    totalPeriods,
    periodDurationMinutes: 40,
    teacherName,
    schoolName,
    area,
    principalName,
    distributionSlots,
    lessonPlans,
    createdAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Exports the Entire Semester Preparation Binder into a single unified Word document (.doc)
 * containing: Cover Page, Teacher Info, Syllabus Distribution Plan Table, and ALL Weekly Lesson Plans with page breaks!
 */
export function exportSemesterBookToWord(book: SemesterBook) {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${book.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Arial', 'Traditional Arabic', sans-serif;
      direction: rtl;
      text-align: right;
      margin: 1.5cm;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .cover-container {
      border: 3px double #005696;
      padding: 40px 20px;
      text-align: center;
      min-height: 22cm;
      background-color: #fafcff;
    }
    .unrwa-main-title {
      font-size: 22pt;
      font-weight: bold;
      color: #005696;
      margin-bottom: 8px;
    }
    .unrwa-sub-title {
      font-size: 15pt;
      font-weight: bold;
      color: #333333;
      margin-bottom: 25px;
    }
    .book-title-box {
      border: 2px solid #005696;
      background-color: #e6f0fa;
      padding: 20px;
      margin: 30px auto;
      max-width: 80%;
      border-radius: 8px;
    }
    .book-title-text {
      font-size: 20pt;
      font-weight: black;
      color: #003366;
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      direction: rtl;
    }
    th, td {
      border: 1px solid #333333;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: top;
      text-align: right;
    }
    th {
      background-color: #e6f0fa;
      font-weight: bold;
      color: #003366;
    }
    .header-box {
      border: 2px solid #005696;
      background-color: #f0f7fc;
      padding: 10px;
      text-align: center;
      margin-bottom: 12px;
    }
    .section-title {
      background-color: #005696;
      color: #ffffff;
      font-weight: bold;
      font-size: 10.5pt;
      padding: 4px 8px;
      margin-top: 10px;
    }
  </style>
</head>
<body>

  <!-- ============================================== -->
  <!-- 1. OFFICIAL COVER PAGE (غلاف دفتر التحضير الرسمي) -->
  <!-- ============================================== -->
  <div class="cover-container page-break">
    <div class="unrwa-main-title">وكالة الغوث الدولية - الأونروا (UNRWA)</div>
    <div class="unrwa-sub-title">دائرة التربية والتعليم / منطقة ${book.area} - ${book.schoolName}</div>
    
    <div style="margin: 40px 0;">
      <div style="font-size: 14pt; color: #555;">المملكة الأردنية الهاشمية / إقليم العمليات</div>
    </div>

    <div class="book-title-box">
      <div class="book-title-text">دَفْتَر تَحْضِير الدُّرُوسِ الفَصْلِيّ الشَّامِل</div>
      <div style="font-size: 13pt; font-weight: bold; color: #005696; margin-top: 8px;">
        النموذج الرسمي المعتمد لوكالة الغوث الدولية
      </div>
    </div>

    <table style="width: 75%; margin: 40px auto; border: 2px solid #005696; font-size: 11pt;">
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold; width: 35%;">المبحث الدراسي:</td>
        <td style="font-weight: bold; color: #003366;">${book.subject}</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">الصف والشعب:</td>
        <td>${book.grade}</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">الفصل الدراسي:</td>
        <td>${book.semesterName} (العام الدراسي ${book.academicYear})</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">الفترة الزمنية للدفتر:</td>
        <td style="direction: ltr; text-align: right;">من ${book.startDate} إلى ${book.endDate} (${book.totalWeeks} أسبوعاً دراسياً)</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">معيار زمن الحصة الصَفية:</td>
        <td style="font-weight: bold; color: #005696;">40 دقيقة لكل حصة (المعيار الرسمي المعتمد)</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">إجمالي الحصص والزمن التدريسي:</td>
        <td>${book.totalPeriods} حصة صَفية (${book.totalPeriods * 40} دقيقة = ${Math.round((book.totalPeriods * 40) / 60)} ساعة تدريسية)</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">معلم المادة ومعد الدفتر:</td>
        <td style="font-weight: bold; color: #005696; font-size: 12pt;">${book.teacherName}</td>
      </tr>
      <tr>
        <td style="background-color: #f0f7fc; font-weight: bold;">مدير المدرسة:</td>
        <td>${book.principalName}</td>
      </tr>
    </table>

    <div style="margin-top: 60px; font-size: 11pt; font-weight: bold; color: #005696;">
      تصميم وإعداد وبرمجة: الأستاذ عامر كراجه • خبير تكنولوجيا التعليم والمناهج
    </div>
  </div>

  <!-- ============================================== -->
  <!-- 2. SEMESTER SYLLABUS DISTRIBUTION MATRIX        -->
  <!-- ============================================== -->
  <div class="page-break">
    <div class="header-box">
      <div style="font-size: 14pt; font-weight: bold; color: #005696;">خطة التوزيع الزمني لمنهاج الفصل الدراسي (مصفوفة المنهاج)</div>
      <div style="font-size: 11pt; color: #333;">المبحث: ${book.subject} | الصف: ${book.grade} | ${book.semesterName} | المعيار: 40 دقيقة/حصة | المعلم: ${book.teacherName}</div>
    </div>

    <table>
      <thead>
        <tr style="background-color: #005696; color: white;">
          <th style="color: white; text-align: center; width: 6%;">الأسبوع</th>
          <th style="color: white; text-align: center; width: 16%;">الفترة الزمنية</th>
          <th style="color: white; width: 22%;">عنوان الوحدة الدراسية</th>
          <th style="color: white; width: 24%;">موضوع الدرس المستهدف</th>
          <th style="color: white; text-align: center; width: 12%;">الحصص والزمن<br><span style="font-size: 7.5pt; font-weight: normal;">(40 دقيقة/حصة)</span></th>
          <th style="color: white; width: 20%;">استراتيجيات التقويم والأدوات</th>
        </tr>
      </thead>
      <tbody>
        ${book.distributionSlots.map(slot => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${slot.weekNumber}</td>
            <td style="text-align: center; font-size: 9pt; direction: ltr;">${slot.startDate} - ${slot.endDate}</td>
            <td style="font-weight: bold; font-size: 9.5pt;">${slot.unitTitle}</td>
            <td style="font-size: 9.5pt;">${slot.lessonTitle}</td>
            <td style="text-align: center; font-weight: bold;">${slot.periodCount} حصة<br><span style="font-size: 8pt; color: #005696;">(${slot.periodCount * 40} دقيقة)</span></td>
            <td style="font-size: 8.5pt;">${slot.assessmentMethod}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <table style="border: none; margin-top: 30px;">
      <tr style="border: none;">
        <td style="border: none; text-align: center; width: 33%;">
          <strong>توقيع المعلم ومعد الخطة:</strong><br><br>
          ____________________<br>
          (${book.teacherName})
        </td>
        <td style="border: none; text-align: center; width: 33%;">
          <strong>توقيع أخصائي المبحث (المشرف):</strong><br><br>
          ____________________<br>
          (دائرة التربية والتعليم)
        </td>
        <td style="border: none; text-align: center; width: 33%;">
          <strong>توقيع واعتماد مدير المدرسة:</strong><br><br>
          ____________________<br>
          (${book.principalName})
        </td>
      </tr>
    </table>
  </div>

  <!-- ============================================== -->
  <!-- 3. ALL SEQUENTIAL OFFICIAL DAILY LESSON PLANS   -->
  <!-- ============================================== -->
  ${book.lessonPlans.map((plan, pIdx) => `
    <div class="page-break">
      <!-- Header Box -->
      <div class="header-box">
        <div style="font-size: 13pt; font-weight: bold; color: #005696;">وكالة الغوث الدولية - الأونروا (UNRWA)</div>
        <div style="font-size: 11pt; font-weight: bold; color: #333;">دائرة التربية والتعليم / منطقة ${plan.area} - ${plan.schoolName}</div>
        <div style="font-size: 12pt; font-weight: bold; color: #000; text-decoration: underline; margin-top: 2px;">
          خطة درس يومية - الأسبوع (${pIdx + 1}) | التاريخ: ${plan.metadata.date}
        </div>
      </div>

      <!-- Overview Info -->
      <table>
        <tr>
          <td width="50%"><strong>المبحث:</strong> ${plan.subject}</td>
          <td width="50%"><strong>الصف والشعب:</strong> ${plan.grade}</td>
        </tr>
        <tr>
          <td><strong>عنوان الوحدة:</strong> ${plan.unitTitle}</td>
          <td><strong>موضوع الدرس:</strong> ${plan.lessonTitle}</td>
        </tr>
        <tr>
          <td><strong>عدد الحصص:</strong> ${plan.periodCount} حصص</td>
          <td><strong>العام الدراسي:</strong> ${plan.academicYear}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>التعلم القبلي:</strong> ${plan.priorKnowledge}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>الواجب البيتي:</strong> ${plan.homework}</td>
        </tr>
      </table>

      <!-- Outcomes -->
      <div class="section-title">النتاجات التعليمية (Learning Outcomes)</div>
      <table style="margin-top: 0;">
        <tr>
          <td>
            <ul style="margin: 4px 0; padding-right: 20px;">
              ${plan.outcomes.map(o => `<li style="margin-bottom: 3px; font-size: 9.5pt;">${o}</li>`).join('')}
            </ul>
          </td>
        </tr>
      </table>

      <!-- Execution 4-Column Table -->
      <div class="section-title">جدول تنفيذ الدرس وفق معايير الأونروا الرسمية (Execution Phases)</div>
      <table style="margin-top: 0;">
        <thead>
          <tr style="background-color: #f0f7fc;">
            <th width="20%">المراحل (Phases)</th>
            <th width="38%">دور المعلم (Teacher Role)</th>
            <th width="32%">دور المتعلم (Learner Role)</th>
            <th width="10%" style="text-align: center;">الزمن</th>
          </tr>
        </thead>
        <tbody>
          ${plan.phases.map(ph => `
            <tr>
              <td><strong>${ph.name}</strong></td>
              <td style="font-size: 9pt;">${ph.teacherRole}</td>
              <td style="font-size: 9pt;">${ph.learnerRole}</td>
              <td style="text-align: center; font-weight: bold;">${ph.duration}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Self Reflection -->
      <div class="section-title">التأمل الذاتي حول عمليتي التعلم والتعليم (Self-Reflection)</div>
      <table style="margin-top: 0;">
        <tr>
          <td width="33%" style="font-size: 9pt;"><strong>نقاط القوة:</strong><br>${plan.selfReflection.strengths}</td>
          <td width="33%" style="font-size: 9pt;"><strong>التحديات:</strong><br>${plan.selfReflection.challenges}</td>
          <td width="34%" style="font-size: 9pt;"><strong>التوصيات:</strong><br>${plan.selfReflection.recommendations}</td>
        </tr>
      </table>

      <!-- Signatures Footer -->
      <table style="margin-top: 10px; border: 1.5px solid #005696; font-size: 9pt;">
        <tr style="background-color: #f0f7fc;">
          <th style="text-align: center;">الصف</th>
          <th style="text-align: center;">العدد الكلي</th>
          <th style="text-align: center;">الغياب</th>
          <th style="text-align: center;">ترتيب الحصة</th>
          <th style="text-align: center;">التاريخ</th>
          <th style="text-align: center;">توقيع المعلم</th>
          <th style="text-align: center;">توقيع المشرف</th>
          <th style="text-align: center;">اعتماد المدير</th>
        </tr>
        <tr>
          <td style="text-align: center;">${plan.grade}</td>
          <td style="text-align: center;">${plan.metadata.totalStudents}</td>
          <td style="text-align: center;">${plan.metadata.absentCount}</td>
          <td style="text-align: center;">${plan.metadata.periodOrder}</td>
          <td style="text-align: center;">${plan.metadata.date}</td>
          <td style="text-align: center;">${plan.teacherName}</td>
          <td style="text-align: center;">(معتمد)</td>
          <td style="text-align: center;">${plan.principalName}</td>
        </tr>
      </table>

      <div style="text-align: center; font-size: 8.5pt; color: #666; margin-top: 12px; border-top: 1px dashed #ccc; padding-top: 4px;">
        دفتر التحضير الفصلي الشامل • مدرسة ذكور وادي السير الإعدادية • تصميم وإعداد: عامر كراجه
      </div>
    </div>
  `).join('')}

</body>
</html>
`;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `دفتر_تحضير_فصلي_كامل_${book.subject}_${book.semesterName.replace(/\s+/g, '_')}_عامر_كراجه.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
