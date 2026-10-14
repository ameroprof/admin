import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ChevronLeft,
  Lightbulb,
  Shuffle,
  FileQuestion,
  Award,
} from 'lucide-react';
import { QuizQuestion, QuizSet, MatchPair, Student } from '../types';
import { INITIAL_QUIZ, INITIAL_MATCH_GAME } from '../data/mockData';

interface InteractiveGamesProps {
  students: Student[];
}

export const InteractiveGames: React.FC<InteractiveGamesProps> = ({ students }) => {
  const [activeSubTab, setActiveSubTab] = useState<'matching' | 'quiz' | 'wheel' | 'worksheet'>('quiz');

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<QuizSet>(INITIAL_QUIZ);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Matching game state
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>(INITIAL_MATCH_GAME.pairs);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [movesCount, setMovesCount] = useState(0);

  // Wheel state
  const [wheelItems, setWheelItems] = useState<string[]>(
    students.length > 0 ? students.map(s => s.name) : ['أحمد', 'براء', 'حمزة', 'زيد', 'سيف الدين', 'عمر', 'كريم', 'محمد']
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWheelWinner, setSelectedWheelWinner] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // AI Generator state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customTopic, setCustomTopic] = useState('الأمن السيبراني والبرمجة بسكراتش');
  const [customSubject, setCustomSubject] = useState('مهارات رقمية');
  const [aiError, setAiError] = useState<string | null>(null);

  // Confetti on win
  const triggerWin = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Quiz handler
  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    const q = currentQuiz.questions[currentQuestionIndex];
    if (idx === q.correctIndex) {
      setScore(prev => prev + 1);
      triggerWin();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      triggerWin();
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
    setShowExplanation(false);
  };

  // Match Game logic
  const handleTermClick = (pair: MatchPair) => {
    if (matchedIds.includes(pair.id)) return;
    setSelectedTerm(pair.term);
    if (selectedDefinition) {
      checkMatch(pair.term, selectedDefinition);
    }
  };

  const handleDefClick = (pair: MatchPair) => {
    if (matchedIds.includes(pair.id)) return;
    setSelectedDefinition(pair.match);
    if (selectedTerm) {
      checkMatch(selectedTerm, pair.match);
    }
  };

  const checkMatch = (term: string, def: string) => {
    setMovesCount(prev => prev + 1);
    const found = matchPairs.find(p => p.term === term && p.match === def);
    if (found) {
      const nextMatched = [...matchedIds, found.id];
      setMatchedIds(nextMatched);
      setSelectedTerm(null);
      setSelectedDefinition(null);
      if (nextMatched.length === matchPairs.length) {
        triggerWin();
      }
    } else {
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
      }, 700);
    }
  };

  const resetMatchGame = () => {
    setMatchedIds([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setMovesCount(0);
  };

  // Spin Wheel logic
  const spinWheel = () => {
    if (isSpinning || wheelItems.length === 0) return;
    setIsSpinning(true);
    setSelectedWheelWinner(null);
    const randomIndex = Math.floor(Math.random() * wheelItems.length);
    const degreesPerItem = 360 / wheelItems.length;
    const extraSpins = 5 * 360;
    const targetDegree = extraSpins + (wheelItems.length - 1 - randomIndex) * degreesPerItem + degreesPerItem / 2;
    
    setWheelRotation(prev => prev + targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedWheelWinner(wheelItems[randomIndex]);
      triggerWin();
    }, 3200);
  };

  // AI Generation
  const handleGenerateAIQuiz = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: customSubject,
          topic: customTopic,
          grade: 'الصف السابع',
          questionCount: 5,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل التوليد');
      }

      const data = await res.json();
      setCurrentQuiz({
        id: `qz-${Date.now()}`,
        title: data.title || `تحدي ${customTopic}`,
        subject: customSubject,
        topic: customTopic,
        grade: 'الصف السابع',
        questions: data.questions,
      });
      restartQuiz();
      setActiveSubTab('quiz');
      triggerWin();
    } catch (err: any) {
      setAiError(err.message || 'تعذر توليد الأسئلة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-blue-600" />
              واحة الألعاب والأنشطة الرقمية التفاعلية
            </h3>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md text-[11px]">
              تصميم وإعداد: عامر كراجه
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            مسابقات كويز، مطابقة المفاهيم، عجلة الحظ للمشاركة الصفية، وأوراق عمل ذكية • إعداد: عامر كراجه
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'quiz'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            سباق المعرفة الرقمية (Quiz)
          </button>

          <button
            onClick={() => setActiveSubTab('matching')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'matching'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            مطابقة المفاهيم والمصطلحات
          </button>

          <button
            onClick={() => setActiveSubTab('wheel')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'wheel'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            عجلة المشاركة والتفاعل الصفي
          </button>

          <button
            onClick={() => setActiveSubTab('worksheet')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'worksheet'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            ورقة عمل تفاعلية جاهزة للطباعة
          </button>
        </div>

        {/* AI Quick Generator Box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={e => setCustomTopic(e.target.value)}
            placeholder="موضوع النشاط (مثلاً: سكراتش، شبكات)"
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
          />
          <button
            onClick={handleGenerateAIQuiz}
            disabled={isGeneratingAI}
            className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50"
          >
            {isGeneratingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            توليد بالذكاء الاصطناعي
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* QUIZ TAB */}
      {activeSubTab === 'quiz' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {!quizFinished ? (
            <div>
              {/* Header stats */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {currentQuiz.subject} • {currentQuiz.grade}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{currentQuiz.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm font-bold">
                  <div className="text-slate-500">
                    السؤال {currentQuestionIndex + 1} من {currentQuiz.questions.length}
                  </div>
                  <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-xl flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    النقاط: {score}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-slate-800 leading-relaxed">
                  {currentQuiz.questions[currentQuestionIndex]?.question}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {currentQuiz.questions[currentQuestionIndex]?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuiz.questions[currentQuestionIndex].correctIndex;
                  let btnStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                    } else {
                      btnStyle = 'border-slate-200 opacity-50 bg-slate-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedOption !== null}
                      className={`p-4 rounded-xl border-2 text-right transition-all flex items-start justify-between gap-3 ${btnStyle}`}
                    >
                      <span className="text-sm font-semibold leading-relaxed">{opt}</span>
                      {selectedOption !== null && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {selectedOption !== null && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {showExplanation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    التوضيح التعليمي:
                  </div>
                  <p className="text-sm text-blue-800">
                    {currentQuiz.questions[currentQuestionIndex]?.explanation}
                  </p>
                </div>
              )}

              {selectedOption !== null && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>
                      {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-10 max-w-md mx-auto">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-inner">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">أحسنت! اكتمل التحدي بنجاح</h3>
              <p className="text-slate-600 text-sm mb-6">
                لقد حققت <strong className="text-blue-600 font-black">{score}</strong> من أصل{' '}
                <strong>{currentQuiz.questions.length}</strong> إجابات صحيحة
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600">نسبة الإتقان:</span>
                  <span className="font-bold text-blue-700">
                    {Math.round((score / currentQuiz.questions.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-600">المبحث:</span>
                  <span className="font-bold">{currentQuiz.subject}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">الموضوع:</span>
                  <span className="font-bold text-slate-800">{currentQuiz.topic}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={restartQuiz}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة المحاولة
                </button>
                <button
                  onClick={() => setActiveSubTab('matching')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm"
                >
                  تجربة لعبة المطابقة
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MATCHING GAME TAB */}
      {activeSubTab === 'matching' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
            <div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                نشاط تفاعلي تعاوني
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">مطابقة مصطلحات المهارات الرقمية والتكنولوجيا</h3>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="text-slate-600">عدد المحاولات: {movesCount}</span>
              <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl">
                المكتمل: {matchedIds.length} / {matchPairs.length}
              </span>
              <button
                onClick={resetMatchGame}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg bg-slate-100"
                title="إعادة تعيين اللعبة"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
            طريقة اللعب: اضغط على المصطلح التكنولوجي في العمود الأيمن، ثم اضغط على تعريفه المناسب في العمود الأيسر للمطابقة.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Terms Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-700 bg-slate-100 p-2.5 rounded-xl text-center">
                المصطلحات التكنولوجية (Terms)
              </h4>
              {matchPairs.map(p => {
                const isMatched = matchedIds.includes(p.id);
                const isSelected = selectedTerm === p.term;

                let cardStyle = 'border-slate-200 bg-white hover:border-blue-400 text-slate-800';
                if (isMatched) {
                  cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 opacity-70 line-through';
                } else if (isSelected) {
                  cardStyle = 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 shadow-sm';
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => handleTermClick(p)}
                    disabled={isMatched}
                    className={`w-full p-4 rounded-xl border-2 text-right font-bold text-sm transition-all flex items-center justify-between ${cardStyle}`}
                  >
                    <span>{p.term}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {/* Definitions Column (shuffled order for challenge) */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-700 bg-slate-100 p-2.5 rounded-xl text-center">
                التعريفات والشروحات (Definitions)
              </h4>
              {[...matchPairs].reverse().map(p => {
                const isMatched = matchedIds.includes(p.id);
                const isSelected = selectedDefinition === p.match;

                let cardStyle = 'border-slate-200 bg-white hover:border-blue-400 text-slate-800';
                if (isMatched) {
                  cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 opacity-70';
                } else if (isSelected) {
                  cardStyle = 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 shadow-sm';
                }

                return (
                  <button
                    key={`def-${p.id}`}
                    onClick={() => handleDefClick(p)}
                    disabled={isMatched}
                    className={`w-full p-3.5 rounded-xl border-2 text-right text-xs font-semibold leading-relaxed transition-all flex items-center justify-between ${cardStyle}`}
                  >
                    <span>{p.match}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {matchedIds.length === matchPairs.length && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <Trophy className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-xl font-black text-emerald-900 mb-1">تهانينا! أتممت مطابقة جميع المصطلحات بنجاح</h4>
              <p className="text-sm text-emerald-800 mb-4">أنجزت النشاط في {movesCount} محاولة فقط.</p>
              <button
                onClick={resetMatchGame}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700"
              >
                لعب جولة أخرى
              </button>
            </div>
          )}
        </div>
      )}

      {/* SPIN WHEEL TAB */}
      {activeSubTab === 'wheel' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
            <div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                أداة تفاعلية للمختبر والصَف
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">عجلة الاختيار العشوائي للطلبة والمهمات</h3>
            </div>
            <div className="text-xs text-slate-500">
              عدد الأسماء في العجلة: <strong>{wheelItems.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Left: Wheel Graphic */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden">
              {/* Pointer */}
              <div className="w-0 h-0 border-x-12 border-x-transparent border-t-20 border-t-rose-600 z-10 mb-[-12px] drop-shadow-md" />

              {/* Rotating Container */}
              <div
                className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-white shadow-xl relative overflow-hidden transition-all duration-[3000ms] ease-out flex items-center justify-center"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  background: 'conic-gradient(#3b82f6 0% 12.5%, #10b981 12.5% 25%, #f59e0b 25% 37.5%, #8b5cf6 37.5% 50%, #ec4899 50% 62.5%, #06b6d4 62.5% 75%, #f97316 75% 87.5%, #6366f1 87.5% 100%)',
                }}
              >
                <div className="w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center text-slate-800 font-black text-sm z-10 border-4 border-slate-200">
                  {isSpinning ? 'يدور...' : 'الأونروا'}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-base shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'جارٍ السحب العشوائي...' : 'تدوير العجلة الآن!'}
              </button>

              {/* Winner Announcement */}
              {selectedWheelWinner && (
                <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl text-center animate-bounce">
                  <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">الطالب / الخيار الفائز:</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedWheelWinner}</div>
                </div>
              )}
            </div>

            {/* Right: Wheel list customizer */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h4 className="font-bold text-sm text-slate-800 mb-2">قائمة المشاركين في العجلة:</h4>
              <textarea
                rows={8}
                value={wheelItems.join('\n')}
                onChange={e => setWheelItems(e.target.value.split('\n').filter(x => x.trim()))}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="اسم في كل سطر"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                يمكنك كتابة أسماء الطلبة، أو أرقام المجموعات، أو أسئلة شفوية سريعة، أو جوائز تحفيزية.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WORKSHEET TAB */}
      {activeSubTab === 'worksheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                ورقة عمل رقمية تفاعلية
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                ورقة عمل: وحدة الأمن السيبراني ولغة سكراتش (الصف السابع)
              </h3>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              طباعة ورقة العمل للطلبة
            </button>
          </div>

          <div className="space-y-6 text-sm text-slate-800">
            {/* Section 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-blue-900 mb-3">السؤال الأول: ضع إشارة (✓) أمام العبارة الصحيحة وإشارة (✗) أمام العبارة الخطأ:</h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span>1. كلمة المرور "12345678" تُعد كلمة قوية لأنها تزيد عن 8 خانات.</span>
                  <span className="text-slate-400 font-mono">( &nbsp;&nbsp;&nbsp;&nbsp; )</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span>2. المصادقة الثنائية (2FA) تحمي الحساب حتى في حال تسريب كلمة المرور.</span>
                  <span className="text-slate-400 font-mono">( &nbsp;&nbsp;&nbsp;&nbsp; )</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span>3. في لغة سكراتش، المتغير (Variable) يمكنه تخزين قيمة واحدة تتغير أثناء عمل البرنامج.</span>
                  <span className="text-slate-400 font-mono">( &nbsp;&nbsp;&nbsp;&nbsp; )</span>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-blue-900 mb-3">السؤال الثاني: أكمل الفراغات بالمصطلح العلمي المناسب:</h4>
              <div className="space-y-3">
                <p className="leading-loose">
                  1. يُسمى الهجوم الإلكتروني الذي يحاول سرقة بيانات الحسابات عبر روابط وهمية بـ ____________________.
                </p>
                <p className="leading-loose">
                  2. اللبنة البرمجية في سكراتش التي تجعل النقاط تزداد بمقدار واحد عند لمس الهدف هي: ____________________.
                </p>
                <p className="leading-loose">
                  3. الأثر الرقمي الذي يتركه المستخدم عند تصفح الإنترنت والمواقع يُعرف بـ ____________________.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
