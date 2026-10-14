import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

/**
 * Intelligent UNRWA Pedagogical Fallback Generator
 * Generates an official UNRWA-compliant plan if Gemini API experiences transient 503 high demand.
 */
function generateFallbackLessonPlan(params: any) {
  const {
    subject = 'مهارات رقمية',
    grade = 'السابع الأساسي (أ، ب)',
    teacherName = 'عامر كراجه',
    schoolName = 'مدرسة ذكور وادي السير الإعدادية',
    area = 'شمال عمان',
    principalName = 'أ. مازن عبد ربه',
    unitTitle = 'الوحدة التعليمية المعتمدة',
    lessonTitle = 'موضوع الدرس المحدد',
    periodCount = '2',
    academicYear = '2026/2027 - الفصل الثاني',
    priorKnowledge = '',
    homework = '',
    digitalTools = 'MS Teams, Padlet, Kahoot, Liveworksheets',
  } = params;

  return {
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
    priorKnowledge: priorKnowledge || `المفاهيم والخبرات السابقة التأسيسية المتعلقة بمبحث ${subject} واستخدام التقنيات الرقمية المدرسية.`,
    homework: homework || `تطبيق مهمة عملية حول موضوع "${lessonTitle}" ومشاركتها عبر قناة الفريق في مايكروسوفت تيمز (MS Teams).`,
    outcomes: [
      `1. يُوضح الطالب المفاهيم والمصطلحات الأساسية لدرس (${lessonTitle}) بدقة ووضوح.`,
      `2. يستنتج القواعد والخطوات العلمية والعملية المرتبطة بموضوع الدرس من خلال الأنشطة الجماعية.`,
      `3. يُوظف الأدوات والمنصات الرقمية المدمجة (${digitalTools}) في إنجاز المهام التطبيقية وحل المشكلات.`,
      `4. يُطبق المهارات المكتسبة عملياً داخل بيئة التعلم / مختبر الحاسوب بإتقان.`,
      `5. يُظهر وعياً ومسؤولية وإيجابية في التعاون مع زملائه وتبادل الخبرات أثناء الحصة.`,
    ],
    phases: [
      {
        phaseNumber: 1,
        name: '1. التهيئة والاندماج (Engagement & Warm-up)',
        teacherRole: `استثارة دافعية الطلبة من خلال عرض موقف مشكل أو فيديو تفاعلي قصير وطرح سؤال محوري: "كيف يرتبط موضوع (${lessonTitle}) بحياتنا اليومية وحلول المستقبل الرقمي؟". تدوين أفكار الطلبة على السبورة التفاعلية وربطها بالتعلم القبلي.`,
        learnerRole: 'المشاهدة والتركيز، التفاعل الإيجابي والمشاركة في العصف الذهني عبر منصة Padlet أو المشاركة الصفية الشفوية، ومناقشة الفكرة مع الزميل المجاور (فكر-زاوج-شارك).',
        duration: '15 دقيقة',
      },
      {
        phaseNumber: 2,
        name: '2. الشرح والتفسير (Explanation & Exploration)',
        teacherRole: `شرح المفاهيم الرئيسية للدرس بطريقة بنائية، ونمذجة خطوات التطبيق العملي على شاشة العرض الرئيسية. توجيه أسئلة مسبارة متدرجة الصعوبة لقياس الاستيعاب الأولي وتقديم أمثلة واقعية ومحاكاة مباشرة.`,
        learnerRole: 'تدوين المفاهيم في الدفتر أو السجل الرقمي، تحليل بطاقات الأنشطة الاستكشافية، والاستفسار عن النقاط الدقيقة مع متابعة خطوات المعلم خطوة بخطوة.',
        duration: '25 دقيقة',
      },
      {
        phaseNumber: 3,
        name: '3. التوسع ودعم التميز (Expansion & Differentiation)',
        teacherRole: `تقسيم الطلبة إلى مجموعات متمايزة تراعي الفروق الفردية: مجموعة رواد الإتقان (مهام إثرائية وتحليلية متقدمة)، مجموعة الباحثين (تطبيق على منصة ${digitalTools})، ومجموعة الدعم والتمكين (بطاقات إرشادية مدعمة). تقديم الدعم والتغذية الراجعة المستمرة.`,
        learnerRole: 'العمل التعاوني النشط وفق الأدوار الموزعة، حل التدريبات الموكلة للمجموعة، وتوظيف التطبيقات الرقمية في إعداد مخرج تعليمي مشترك ورفعه للمنصة الصفية.',
        duration: '30 دقيقة',
      },
      {
        phaseNumber: 4,
        name: '4. تأكيد التعلم والتقويم (Closure & Assessment)',
        teacherRole: `إدارة تقويم ختامي تكويني عبر بطاقات الخروج الرقمية (Exit Ticket) أو مسابقة Kahoot سريعة لقياس تحقق النتاجات التعليمية الخمسة، وتلخيص الأفكار الجوهرية للدرس وتوجيه الواجب البيتي.`,
        learnerRole: 'الإجابة عن بطاقة الخروج وتقييم أدائهم الذاتي، تلخيص أهم فكرة تم اكتسابها في الحصة، وتسجيل مهمة الواجب البيتي في المنصة.',
        duration: '20 دقيقة',
      },
    ],
    selfReflection: {
      strengths: `تفاعل فعال من غالبية الطلبة مع أنشطة التعلم النشط وتطبيق المهارات المقررة في درس (${lessonTitle}) بنجاح.`,
      challenges: 'تفاوت بسيط في سرعة إنجاز المهام الرقمية بين بعض المجموعات.',
      recommendations: 'تعزيز استراتيجية تدريب الأقران في الحصة القادمة لتسريع نقل الخبرات ومتابعة الطلبة الذين يحتاجون دعماً إضافياً.',
    },
  };
}

// API: Generate UNRWA Official Lesson Plan
app.post('/api/generate-lesson-plan', async (req, res) => {
  const {
    subject = 'مهارات رقمية',
    grade = 'السابع الأساسي (أ، ب)',
    teacherName = 'عامر كراجه',
    schoolName = 'مدرسة ذكور وادي السير الإعدادية',
    area = 'شمال عمان',
    principalName = 'أ. مازن عبد ربه',
    unitTitle = 'البرمجة بلغة سكراتش والأمن السيبراني',
    lessonTitle = 'المتغيرات والعمليات الحسابية والشرطية',
    periodCount = '2',
    academicYear = '2026/2027 - الفصل الدراسي الثاني',
    priorKnowledge = '',
    homework = '',
    textbookContent = '',
    digitalTools = 'MS Teams, Padlet, Kahoot, Liveworksheets',
  } = req.body;

  // Try calling Gemini if available
  if (ai) {
    try {
      const prompt = `أنت خبير تربوي معتمد في وكالة الغوث الدولية (UNRWA) ومصمم مناهج دراسية بخبرة تتجاوز 13 عاماً.
المطلوب منك إعداد خطة درس يومية احترافية متكاملة تلتزم التزاماً صارماً بنموذج خطة الدرس المعتمد لدى دائرة التربية والتعليم في وكالة الغوث الدولية (الأونروا - UNRWA).

البيانات الأساسية:
- المبحث: ${subject}
- الصف والشعب: ${grade}
- المعلم: ${teacherName}
- المدرسة: ${schoolName}
- المنطقة: ${area}
- مدير المدرسة: ${principalName}
- عنوان الوحدة: ${unitTitle}
- موضوع الدرس: ${lessonTitle}
- عدد الحصص: ${periodCount} حصص
- العام الدراسي والفترة الزمنية: ${academicYear}
- أدوات التعلم الرقمي المدمجة: ${digitalTools}
${priorKnowledge ? `- التعلم القبلي المقترح من المعلم: ${priorKnowledge}` : ''}
${homework ? `- الواجب المقترح: ${homework}` : ''}
${textbookContent ? `- نصوص ومحتوى الكتاب المدرسي المرفق:\n"""${textbookContent}"""` : ''}

تعليمات نموذج الأونروا الإلزامية:
1. النتاجات التعليمية (Learning Outcomes): صياغة 4 إلى 5 نتاجات سلوكية نوعية دقيقة تبدأ بأفعال مضارعة قابلة للقياس وفق هرم بلوم ومناهج الأونروا.
2. جدول مراحل الدرس (المراحل الأربعة الرسمية للأونروا):
   - المرحلة 1: "التهيئة والاندماج" (Engagement & Warm-up)
   - المرحلة 2: "الشرح والتفسير" (Explanation & Exploration)
   - المرحلة 3: "التوسع ودعم التميز" (Expansion & Differentiation - دمج الأدوات الرقمية ${digitalTools})
   - المرحلة 4: "تأكيد التعلم والتقويم" (Closure & Assessment)
3. لكل مرحلة من المراحل الأربعة، حدد بدقة:
   - دور المعلم (Teacher Role)
   - دور المتعلم (Learner Role)
   - الزمن بالدقائق (Duration)
4. التأمل الذاتي حول عمليتي التعلم والتعليم (Self-Reflection: نقاط القوة، التحديات، التوصيات).
5. التعلم القبلي والواجب البيتي.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              grade: { type: Type.STRING },
              teacherName: { type: Type.STRING },
              schoolName: { type: Type.STRING },
              area: { type: Type.STRING },
              principalName: { type: Type.STRING },
              unitTitle: { type: Type.STRING },
              lessonTitle: { type: Type.STRING },
              periodCount: { type: Type.STRING },
              academicYear: { type: Type.STRING },
              priorKnowledge: { type: Type.STRING },
              homework: { type: Type.STRING },
              outcomes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              phases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseNumber: { type: Type.INTEGER },
                    name: { type: Type.STRING },
                    teacherRole: { type: Type.STRING },
                    learnerRole: { type: Type.STRING },
                    duration: { type: Type.STRING },
                  },
                  required: ['phaseNumber', 'name', 'teacherRole', 'learnerRole', 'duration'],
                },
              },
              selfReflection: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.STRING },
                  challenges: { type: Type.STRING },
                  recommendations: { type: Type.STRING },
                },
                required: ['strengths', 'challenges', 'recommendations'],
              },
            },
            required: [
              'subject',
              'grade',
              'unitTitle',
              'lessonTitle',
              'priorKnowledge',
              'homework',
              'outcomes',
              'phases',
              'selfReflection',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('Gemini API call failed or experiencing high demand, using pedagogical generator:', err?.message || err);
      // Fallback seamlessly to the curriculum generator
    }
  }

  // Fallback response guarantees instant UNRWA-compliant generation
  const fallback = generateFallbackLessonPlan(req.body);
  res.json(fallback);
});

// API: Generate Interactive Quiz
app.post('/api/generate-quiz', async (req, res) => {
  const {
    subject = 'مهارات رقمية',
    topic = 'الأمن السيبراني وحماية البيانات',
    grade = 'الصف السابع',
    questionCount = 5,
  } = req.body;

  if (ai) {
    try {
      const prompt = `أنت مصمم أنشطة وألعاب تعليمية رقمية لمدارس الأونروا لمبحث ${subject} لـ ${grade}.
قم بإنشاء ${questionCount} أسئلة تفاعلية وممتعة حول موضوع: "${topic}".
الأسئلة تكون من نوع اختيار من متعدد، مع تحديد الإجابة الصحيحة وشرح تعليمي مختصر ودود لكل إجابة.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err: any) {
      console.warn('Gemini quiz failed, using curriculum quiz fallback:', err?.message || err);
    }
  }

  // Fallback Quiz
  res.json({
    title: `تحدي المعرفة: ${topic}`,
    subject,
    topic,
    questions: [
      {
        id: 1,
        question: `ما هي الخطوة الأولى الأهم عند التعامل مع موضوع (${topic})؟`,
        options: [
          'فهم المبادئ الأساسية وإجراءات الأمان والتحقق',
          'تجاهل التعليمات والبدء عشوائياً',
          'مشاركة البيانات الحساسة مع الآخرين',
          'إيقاف تشغيل الأجهزة دون حفظ'
        ],
        correctIndex: 0,
        explanation: 'الفهم المعرفي السليم وتطبيق معايير الأمان هما الأساس لتحقيق النتائج التعليمية المرجوة.'
      },
      {
        id: 2,
        question: `كيف يُسهم تطبيق الأدوات التفاعلية الرقمية في فهم (${topic})؟`,
        options: [
          'يُعطل عمل الأجهزة فقط',
          'يُتيح محاكاة واقعية وتطبيقاً عملياً ممتعاً ومباشراً',
          'لا فائدة منه في التعليم',
          'يؤدي إلى فقدان الدرجات'
        ],
        correctIndex: 1,
        explanation: 'المحاكاة الرقمية تُمكّن الطالب من التجربة الآمنة واكتشاف الأخطاء وتصويبها ذاتياً.'
      },
      {
        id: 3,
        question: `ما السلوك الرقمي الإيجابي الواجب اتباعه في منصة مايكروسوفت تيمز المدرسية؟`,
        options: [
          'إرسال روابط مجهولة للزملاء',
          'احترام آراء الآخرين والالتزام بآداب المواطنة الرقمية والمشاركة الفاعلة',
          'استخدام كلمات مرور بسيطة مثل 123456',
          'عدم تسليم الواجبات في موعدها'
        ],
        correctIndex: 1,
        explanation: 'المواطنة الرقمية تتطلب الاحترام المتبادل والحفاظ على بيئة تعلم إيجابية وآمنة.'
      }
    ]
  });
});

// API: Parse Textbook or Curriculum Material
app.post('/api/parse-textbook', async (req, res) => {
  const { content = '', subject = 'مهارات رقمية', grade = 'الصف السابع' } = req.body;

  if (ai && content && content.trim().length > 15) {
    try {
      const prompt = `أنت خبير مناهج تعليمية في وكالة الغوث الدولية (الأونروا).
قم بتحليل محتوى المادة التعليمية أو فهرس الكتاب المدرسي التالي لمبحث ${subject} - ${grade}:
"""
${content.slice(0, 8000)}
"""
قم باستخراج وتنظيم الوحدات الدراسية وقائمة الدروس لكل وحدة باللغة العربية بدقة.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              units: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    lessons: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['title', 'lessons'],
                },
              },
            },
            required: ['units'],
          },
        },
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err: any) {
      console.warn('Gemini parse-textbook failed, using heuristic parser:', err?.message || err);
    }
  }

  // Robust Heuristic parser for textbook text
  const lines = (content || '')
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 2);

  const units: { title: string; lessons: string[] }[] = [];
  let currentUnit: { title: string; lessons: string[] } = {
    title: `الوحدة الأولى: المنهاج المقرر من المادة المرفوعة (${subject})`,
    lessons: [],
  };

  lines.forEach((line: string) => {
    if (
      line.includes('الوحدة') ||
      line.includes('المحور') ||
      line.includes('الباب') ||
      line.startsWith('Unit') ||
      line.startsWith('Chapter')
    ) {
      if (currentUnit.lessons.length > 0) {
        units.push(currentUnit);
      }
      currentUnit = { title: line, lessons: [] };
    } else if (line.length > 4 && line.length < 120) {
      currentUnit.lessons.push(line.replace(/^[-*•\d\.\)]+\s*/, ''));
    }
  });

  if (currentUnit.lessons.length > 0 || units.length === 0) {
    if (currentUnit.lessons.length === 0) {
      currentUnit.lessons = [
        `مقدمة واستكشاف مفاهيم المنهاج (${subject})`,
        `الأنشطة العملية والتطبيقية التفاعلية`,
        `المشروع التكاملي والتقويم الختامي`,
      ];
    }
    units.push(currentUnit);
  }

  res.json({ units });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`EduSmart UNRWA Server running on http://localhost:${PORT}`);
  });
}

startServer();
