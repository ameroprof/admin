export interface LessonPlanPhase {
  phaseNumber: number;
  name: string;
  teacherRole: string;
  learnerRole: string;
  duration: string;
}

export interface SelfReflection {
  strengths: string;
  challenges: string;
  recommendations: string;
}

export interface LessonPlanMetadata {
  totalStudents: number;
  absentCount: number;
  periodOrder: string;
  date: string;
  day: string;
}

export interface LessonPlan {
  id: string;
  subject: string;
  grade: string;
  teacherName: string;
  schoolName: string;
  area: string;
  principalName: string;
  unitTitle: string;
  lessonTitle: string;
  periodCount: string;
  academicYear: string;
  priorKnowledge: string;
  homework: string;
  digitalTools?: string;
  outcomes: string[];
  phases: LessonPlanPhase[];
  selfReflection: SelfReflection;
  metadata: LessonPlanMetadata;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  section: string;
  gender: 'M' | 'F';
  grades: {
    firstExam: number;   // 20
    secondExam: number;  // 20
    activities: number;  // 20 (مهمات رقمية ومشاركة)
    finalExam: number;   // 40
  };
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  section: string;
  statusMap: Record<string, AttendanceStatus>; // studentId -> status
  notes?: Record<string, string>;
}

export interface TimetableSlot {
  id: string;
  day: string; // الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس
  period: number; // 1 to 7
  subject: string;
  section: string;
  room: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  questions: QuizQuestion[];
}

export interface MatchPair {
  id: number;
  term: string;
  match: string;
}

export interface MatchGameSet {
  id: string;
  title: string;
  subject: string;
  pairs: MatchPair[];
}

export interface UNRWAPresetTemplate {
  id: string;
  name: string;
  subject: string;
  grade: string;
  semester: 'الفصل الأول' | 'الفصل الثاني';
  unitTitle: string;
  lessonTitle: string;
  periodCount: string;
  academicYear: string;
  priorKnowledge: string;
  homework: string;
  digitalTools: string;
  outcomes: string[];
  phases: LessonPlanPhase[];
  selfReflection: SelfReflection;
}

export interface SemesterDistributionSlot {
  weekNumber: number;
  startDate: string;
  endDate: string;
  unitTitle: string;
  lessonTitle: string;
  periodCount: number;
  periodMinutes?: number;
  totalMinutes?: number;
  outcomes: string;
  digitalTools: string;
  assessmentMethod: string;
}

export interface SemesterBook {
  id: string;
  title: string;
  subject: string;
  grade: string;
  semesterName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  totalPeriods: number;
  periodDurationMinutes?: number;
  teacherName: string;
  schoolName: string;
  area: string;
  principalName: string;
  distributionSlots: SemesterDistributionSlot[];
  lessonPlans: LessonPlan[];
  createdAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'lesson-plan'
  | 'timetable'
  | 'gradebook'
  | 'attendance'
  | 'games'
  | 'files';


