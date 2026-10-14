import { LessonPlan, Student, AttendanceRecord, TimetableSlot } from '../types';

/**
 * Exports a UNRWA Lesson Plan into a Microsoft Word compatible (.doc / .docx) file.
 * Uses official Word HTML format with MSO styles, RTL direction, exact table borders, and UNRWA hierarchy.
 */
export function exportLessonPlanToWord(plan: LessonPlan) {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${plan.subject} - ${plan.lessonTitle}</title>
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
    .header-box {
      border: 2px solid #005696;
      background-color: #f0f7fc;
      padding: 12px;
      text-align: center;
      margin-bottom: 15px;
    }
    .unrwa-title-1 {
      font-size: 16pt;
      font-weight: bold;
      color: #005696;
      margin: 0;
    }
    .unrwa-title-2 {
      font-size: 13pt;
      font-weight: bold;
      color: #333333;
      margin: 4px 0;
    }
    .unrwa-title-3 {
      font-size: 14pt;
      font-weight: bold;
      color: #000000;
      text-decoration: underline;
      margin: 6px 0 0 0;
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
      font-size: 10.5pt;
      vertical-align: top;
      text-align: right;
    }
    th {
      background-color: #e6f0fa;
      font-weight: bold;
      color: #003366;
    }
    .section-title {
      background-color: #005696;
      color: #ffffff;
      font-weight: bold;
      font-size: 11pt;
      padding: 4px 8px;
      margin-top: 10px;
    }
    .outcomes-list {
      margin: 6px 0;
      padding-right: 20px;
    }
    .outcomes-list li {
      margin-bottom: 4px;
      font-size: 10.5pt;
    }
    .reflection-box {
      border: 1px solid #666;
      padding: 8px;
      margin-bottom: 12px;
      background-color: #fafafa;
    }
    .footer-signatures {
      width: 100%;
      border-top: 1.5px solid #005696;
      margin-top: 20px;
      padding-top: 8px;
    }
    .badge {
      font-weight: bold;
      color: #005696;
    }
  </style>
</head>
<body>

  <!-- UNRWA Official Header -->
  <div class="header-box">
    <div class="unrwa-title-1">وكالة الغوث الدولية - الأونروا (UNRWA)</div>
    <div class="unrwa-title-2">دائرة التربية والتعليم / منطقة ${plan.area || 'شمال عمان'} - ${plan.schoolName || 'مدرسة ذكور وادي السير الإعدادية'}</div>
    <div class="unrwa-title-3">دفتر خطط الدروس اليومية / خطة الدرس الرسمية</div>
    <div style="font-size: 10pt; color: #005696; font-weight: bold; margin-top: 5px;">تصميم وإعداد الأستاذ: عامر كراجه</div>
  </div>

  <!-- Lesson Overview Metadata Table -->
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
      <td><strong>عدد الحصص المقررة:</strong> ${plan.periodCount} حصص</td>
      <td><strong>العام الدراسي والفصل:</strong> ${plan.academicYear}</td>
    </tr>
    <tr>
      <td><strong>اسم المعلم:</strong> ${plan.teacherName}</td>
      <td><strong>مدير المدرسة:</strong> ${plan.principalName}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>التعلم القبلي:</strong> ${plan.priorKnowledge || 'مراجعة المكتسبات السابقة والمفاهيم التأسيسية.'}</td>
    </tr>
    <tr>
      <td colspan="2"><strong>الواجب البيتي:</strong> ${plan.homework || 'حل التدريبات المقررة ومتابعة منصة الفرق.'}</td>
    </tr>
    ${plan.digitalTools ? `<tr><td colspan="2"><strong>أدوات التعلم الرقمي المدمجة:</strong> ${plan.digitalTools}</td></tr>` : ''}
  </table>

  <!-- Learning Outcomes -->
  <div class="section-title">النتاجات التعليمية (Learning Outcomes)</div>
  <table style="margin-top: 0;">
    <tr>
      <td>
        <ul class="outcomes-list">
          ${plan.outcomes.map(outcome => `<li>${outcome}</li>`).join('')}
        </ul>
      </td>
    </tr>
  </table>

  <!-- Official 4-Column Lesson Execution Table -->
  <div class="section-title">جدول تنفيذ الدرس وفق معايير الأونروا (Lesson Execution Phases)</div>
  <table style="margin-top: 0;">
    <thead>
      <tr>
        <th width="22%">المراحل (Phases)</th>
        <th width="37%">دور المعلم (Teacher Role)</th>
        <th width="31%">دور المتعلم (Learner Role)</th>
        <th width="10%" style="text-align: center;">الزمن</th>
      </tr>
    </thead>
    <tbody>
      ${plan.phases.map(phase => `
        <tr>
          <td><strong>${phase.name}</strong></td>
          <td>${phase.teacherRole}</td>
          <td>${phase.learnerRole}</td>
          <td style="text-align: center;"><strong>${phase.duration}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Self Reflection -->
  <div class="section-title">التأمل الذاتي حول عمليتي التعلم والتعليم (Self-Reflection)</div>
  <table style="margin-top: 0;">
    <tr>
      <td width="33%">
        <strong>نقاط القوة وما تحقق:</strong><br>
        ${plan.selfReflection.strengths}
      </td>
      <td width="33%">
        <strong>التحديات المرصودة:</strong><br>
        ${plan.selfReflection.challenges}
      </td>
      <td width="34%">
        <strong>التوصيات والبدائل المقترحة:</strong><br>
        ${plan.selfReflection.recommendations}
      </td>
    </tr>
  </table>

  <!-- Official Footer & Signatures -->
  <table style="margin-top: 15px; border: 1.5px solid #005696;">
    <tr style="background-color: #f0f7fc;">
      <th style="text-align: center;">الصف/الشعبة</th>
      <th style="text-align: center;">العدد الكلي</th>
      <th style="text-align: center;">عدد الغياب</th>
      <th style="text-align: center;">ترتيب الحصة</th>
      <th style="text-align: center;">اليوم والتاريخ</th>
    </tr>
    <tr>
      <td style="text-align: center;">${plan.grade}</td>
      <td style="text-align: center;">${plan.metadata.totalStudents}</td>
      <td style="text-align: center;">${plan.metadata.absentCount}</td>
      <td style="text-align: center;">${plan.metadata.periodOrder}</td>
      <td style="text-align: center;">${plan.metadata.day} - ${plan.metadata.date}</td>
    </tr>
  </table>

  <table style="border: none; margin-top: 25px;">
    <tr style="border: none;">
      <td style="border: none; text-align: center; width: 33%;">
        <strong>توقيع وإعداد المعلم:</strong><br><br>
        ____________________<br>
        (${plan.teacherName})
      </td>
      <td style="border: none; text-align: center; width: 33%;">
        <strong>توقيع أخصائي المبحث (المشرف):</strong><br><br>
        ____________________<br>
        (دائرة التربية والتعليم)
      </td>
      <td style="border: none; text-align: center; width: 33%;">
        <strong>توقيع واعتماد مدير المدرسة:</strong><br><br>
        ____________________<br>
        (${plan.principalName})
      </td>
    </tr>
  </table>

  <div style="text-align: center; font-size: 9pt; color: #555555; margin-top: 25px; border-top: 1px dashed #005696; padding-top: 8px; direction: rtl;">
    منظومة EduSmart UNRWA لإدارة التعليم والخطط المدرسية • تصميم وإعداد: عامر كراجه
  </div>

</body>
</html>
`;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `خطة_أونروا_${plan.subject}_${plan.lessonTitle.replace(/[\s/\\:*?"<>|]/g, '_')}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports Student Grade Book into Excel CSV with UTF-8 BOM.
 */
export function exportGradeBookToExcel(students: Student[], sectionName: string = 'الكل') {
  const headers = [
    'الرقم',
    'اسم الطالب',
    'الشعبة',
    'التقويم الأول (20)',
    'التقويم الثاني (20)',
    'المشاركة والمهمات الرقمية (20)',
    'الاختبار النهائي (40)',
    'المجموع الإجمالي (100)',
    'التقدير',
    'الحالة',
    'ملاحظات تربوية',
  ];

  const filtered = sectionName === 'الكل'
    ? students
    : students.filter(s => s.section === sectionName);

  const rows = filtered.map((s, index) => {
    const total = s.grades.firstExam + s.grades.secondExam + s.grades.activities + s.grades.finalExam;
    let rank = 'مقبول';
    if (total >= 90) rank = 'ممتاز';
    else if (total >= 80) rank = 'جيد جداً';
    else if (total >= 70) rank = 'جيد';
    else if (total < 50) rank = 'ضعيف (يحتاج متابعة)';

    const status = total >= 50 ? 'ناجح' : 'مكمل';

    return [
      index + 1,
      `"${s.name}"`,
      `"${s.section}"`,
      s.grades.firstExam,
      s.grades.secondExam,
      s.grades.activities,
      s.grades.finalExam,
      total,
      `"${rank}"`,
      `"${status}"`,
      `"${s.notes || ''}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `سجل_العلامات_الأونروا_${sectionName.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports Attendance Sheet to Excel CSV.
 */
export function exportAttendanceToExcel(
  records: AttendanceRecord[],
  students: Student[],
  sectionName: string
) {
  const headers = ['الرقم', 'اسم الطالب', 'الشعبة', 'حاضر', 'غائب', 'مبرر', 'متأخر', 'نسبة الحضور %', 'الحالة الإدارية'];
  const filteredStudents = sectionName === 'الكل'
    ? students
    : students.filter(s => s.section === sectionName);

  const rows = filteredStudents.map((s, index) => {
    let present = 0;
    let absent = 0;
    let excused = 0;
    let late = 0;

    records.forEach(rec => {
      const status = rec.statusMap[s.id];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'excused') excused++;
      else if (status === 'late') late++;
    });

    const totalDays = present + absent + excused + late;
    const rate = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 100;
    const alertStatus = absent >= 3 ? 'إنذار غياب أونروا' : 'طبيعي ومواظب';

    return [
      index + 1,
      `"${s.name}"`,
      `"${s.section}"`,
      present,
      absent,
      excused,
      late,
      `${rate}%`,
      `"${alertStatus}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `سجل_الحضور_والغياب_الأونروا_${sectionName.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports Timetable to CSV.
 */
export function exportTimetableToExcel(slots: TimetableSlot[]) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const headers = ['اليوم / الحصة', ...periods.map(p => `الحصة ${p}`)];
  const rows = days.map(day => {
    const periodSlots = periods.map(p => {
      const slot = slots.find(s => s.day === day && s.period === p);
      if (slot) {
        return `"${slot.subject} - ${slot.section} (${slot.room})"`;
      }
      return '"فراغ"';
    });
    return [`"${day}"`, ...periodSlots].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `الجدول_الأسبوعي_المدرسي_الأونروا.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers standard browser print dialog for cleanly styled UNRWA documents.
 */
export function printDocument() {
  window.print();
}
