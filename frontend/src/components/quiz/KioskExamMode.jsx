import React, { useState, useEffect, useCallback } from "react";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ShieldCheck, 
  Maximize2,
  X,
  FileCheck,
  AlertOctagon,
  RotateCcw,
  Check,
  Building2,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../../services/api";

export const KioskExamMode = ({ quiz, currentUser, onClose, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [markedForReview, setMarkedForReview] = useState({}); // { [questionId]: boolean }
  const [visited, setVisited] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((quiz?.durationMinutes || 30) * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isDisqualified, setIsDisqualified] = useState(false);

  const questions = quiz?.questions && quiz.questions.length > 0 ? quiz.questions : [
    {
      id: "q_demo_1",
      question: "In numerical weather prediction (NWP), what is the primary role of the Arakawa C-grid staggering?",
      options: [
        "Placing velocity variables (u, v) on cell faces and mass variables (T, P) at cell centres to optimise gravity wave dispersion",
        "Placing all variables at cell vertices exclusively",
        "Eliminating vertical advection across sigma coordinates",
        "Converting non-hydrostatic systems into hydrostatic balance"
      ],
      correctAnswer: 0,
      marks: 3,
      difficulty: "Medium",
      subjectName: "Atmospheric Dynamics",
      explanation: "Arakawa C-grid offers superior dispersion properties for high-frequency gravity and inertia-gravity waves."
    },
    {
      id: "q_demo_2",
      question: "In dual-polarization weather radar, what physical property does Differential Reflectivity (ZDR) primarily characterize?",
      options: [
        "Echo top height above sea level",
        "The median oblateness / eccentricity of hydrometeors (horizontal vs vertical axis ratio)",
        "Radial velocity toward the radar antenna",
        "Total atmospheric precipitable water"
      ],
      correctAnswer: 1,
      marks: 3,
      difficulty: "Medium",
      subjectName: "Doppler Radar Meteorology",
      explanation: "ZDR = 10 * log10(Zh / Zv), giving direct insights into hydrometeor geometric oblateness."
    },
    {
      id: "q_demo_3",
      question: "For Tropical Cyclone intensity estimation via the Dvorak Technique, which satellite pattern represents the highest convective organization?",
      options: [
        "Shear Pattern with displaced convective core",
        "Curved Band Pattern with 0.5 spiral wrap",
        "Eye Pattern with cold symmetrical Central Dense Overcast (CDO)",
        "Isolated banding without low-level center definition"
      ],
      correctAnswer: 2,
      marks: 4,
      difficulty: "Hard",
      subjectName: "Tropical Meteorology",
      explanation: "A distinct, warm eye embedded within a cold, symmetrical CDO yields the highest T-Number intensity."
    },
    {
      id: "q_demo_4",
      question: "Which condition must be satisfied to prevent numerical instability in explicit finite difference advection schemes (CFL condition)?",
      options: [
        "CFL = (u · Δt) / Δx ≤ 1.0",
        "CFL = (u · Δx) / Δt ≥ 1.0",
        "CFL = (Δx · Δt) / u = 0",
        "CFL = u² / (g · Δz) > 2.0"
      ],
      correctAnswer: 0,
      marks: 3,
      difficulty: "Medium",
      subjectName: "Numerical Modeling",
      explanation: "The Courant-Friedrichs-Lewy condition dictates that the physical domain of dependence must lie within the numerical domain."
    }
  ];

  const currentQuestion = questions[currentIndex] || {};

  // Auto-request Fullscreen on entrance
  useEffect(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Mark first question as visited
    if (questions[0]?.id) {
      setVisited({ [questions[0].id]: true });
    }
  }, []);

  // Submit Handler
  const handleSubmitQuiz = useCallback(async (forcedDisqualification = false) => {
    if (submitting || submissionResult) return;
    setSubmitting(true);
    try {
      // Calculate score
      let correctCount = 0;
      let totalScore = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          correctCount++;
          totalScore += (q.marks || 2);
        }
      });

      const totalPossible = questions.reduce((sum, q) => sum + (q.marks || 2), 0);
      const percentage = Math.round((totalScore / totalPossible) * 100);

      const submissionPayload = {
        quizId: quiz.id,
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || "Rahul Sharma",
        answers,
        score: totalScore,
        totalMarks: totalPossible,
        percentage,
        isDisqualified: forcedDisqualification,
        tabSwitchCount,
        timeTakenMinutes: Math.round(((quiz.durationMinutes || 30) * 60 - timeLeftSeconds) / 60)
      };

      try {
        await api.submitQuiz(submissionPayload);
      } catch (e) {
        console.warn("Server submission fallback:", e.message);
      }

      setSubmissionResult({
        score: totalScore,
        totalMarks: totalPossible,
        percentage,
        correctCount,
        totalQuestions: questions.length,
        isPassed: percentage >= (quiz.passMarks ? (quiz.passMarks / quiz.totalMarks) * 100 : 50),
        isDisqualified: forcedDisqualification
      });

      if (!forcedDisqualification && percentage >= 70) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }

    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [answers, currentUser, questions, quiz, submitting, submissionResult, tabSwitchCount, timeLeftSeconds]);

  // Countdown timer
  useEffect(() => {
    if (submissionResult) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(false); // Auto submit on timer expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitQuiz, submissionResult]);

  // Format time MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ─── STRICT ANTI-CHEAT PROCTORING DETECTION (TAB SWITCH / ALT-TAB / FOCUS LOSS) ───
  useEffect(() => {
    if (submissionResult) return;

    const handleViolation = () => {
      if (submissionResult) return;
      
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setIsDisqualified(true);
          handleSubmitQuiz(true); // Auto-submit immediately after 3 warnings!
        } else {
          setShowWarningModal(true);
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleWindowBlur = () => {
      handleViolation();
    };

    const handleKeyDown = (e) => {
      // Catch Alt+Tab, Escape, Meta/Windows key, F11
      if (e.altKey || e.key === "Tab" || e.key === "Escape" || e.key === "Meta" || e.key === "F11") {
        // Warning
        if (e.altKey || e.key === "Meta") {
          handleViolation();
        }
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmitQuiz, submissionResult]);

  // Navigate question
  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    const targetQ = questions[idx];
    if (targetQ) {
      setVisited(prev => ({ ...prev, [targetQ.id]: true }));
    }
  };

  // Toggle answer
  const handleSelectOption = (optIdx) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optIdx }));
  };

  // Toggle review flag
  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  // Clear answer
  const handleClearAnswer = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  // Palette counts
  const answeredCount = Object.keys(answers).length;
  const markedReviewCount = Object.keys(markedForReview).filter(k => markedForReview[k]).length;
  const notAnsweredCount = questions.length - answeredCount;

  // ═════════ POST-SUBMISSION RESULT SCREEN (SCORE WITHHELD UNTIL PUBLISHED) ═════════
  if (submissionResult) {
    return (
      <div className="fixed inset-0 z-50 bg-[#080e1e] text-white flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
        <div className="bg-[#0f1b36] border border-slate-700/80 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
            {submissionResult.isDisqualified ? (
              <AlertOctagon className="w-8 h-8 text-rose-300" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Under Faculty Evaluation
            </span>

            <h2 className="text-2xl font-black text-white">
              {submissionResult.isDisqualified ? "Assessment Auto-Submitted (Disqualified)" : "Assessment Submitted Successfully"}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              {submissionResult.isDisqualified
                ? "Test terminated automatically due to exceeding 3 anti-cheat window focus violations."
                : "Your responses have been securely recorded. In accordance with MoES examination rules, individual scores and answer explanations are withheld until the lead trainer finishes evaluations and publishes official results."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-[#0a1224] rounded-2xl border border-slate-800 text-xs text-left">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Attempt Summary</span>
              <b className="text-sm font-black text-white">{answeredCount} of {questions.length} Answered</b>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Proctor Integrity</span>
              <b className="text-sm font-black text-emerald-400">100% Proctored Kiosk</b>
            </div>
          </div>

          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onFinish ? onFinish() : onClose();
            }}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs shadow-lg transition-transform hover:scale-102"
          >
            Return to Assessment Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070d1d] text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      
      {/* ═════════ 1. TOP SECURE KIOSK HEADER ═════════ */}
      <header className="h-16 bg-[#0c162e] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xl z-30">
        
        {/* Left: Exam Branding & Fullscreen Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center font-black text-sm shadow">
            IMD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-black text-[10px] uppercase tracking-wider border border-blue-400/30">
                PROCTORED KIOSK
              </span>
              <span className="text-xs font-extrabold text-white truncate max-w-xs sm:max-w-md">
                {quiz?.title || "National Meteorological Assessment"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Candidate: <b>{currentUser?.name || "Rahul Sharma"}</b> • Fullscreen Security Locked
            </p>
          </div>
        </div>

        {/* Right: Violation Counter, Timer & Submit */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Violation warning badge */}
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-600 text-rose-300 rounded-full text-xs font-black animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{tabSwitchCount}/3 Violations</span>
            </div>
          )}

          {/* Countdown Clock */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono font-black text-xs sm:text-sm shadow-inner ${
            timeLeftSeconds < 300 
              ? "bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse" 
              : "bg-slate-900 border-slate-700 text-blue-300"
          }`}>
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Finish & Submit CTA */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Submit Assessment
          </button>
        </div>
      </header>

      {/* ═════════ 2. MAIN PROCTORED VIEWPORT ═════════ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ─── LEFT: QUESTION PALETTE (GRID & STATUS) ─── */}
        <aside className="w-full lg:w-80 bg-[#0a1224] border-r border-slate-800/90 p-4 sm:p-5 flex flex-col shrink-0 overflow-y-auto shadow-2xl order-2 lg:order-1 max-h-56 lg:max-h-none">
          
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">
            Question Palette ({questions.length})
          </h3>

          {/* Palette Status Badges */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] font-bold">
            <div className="flex items-center gap-2 p-2 bg-emerald-950/40 rounded-xl border border-emerald-800/50 text-emerald-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-950/40 rounded-xl border border-blue-800/50 text-blue-300">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Review ({markedReviewCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-slate-600"></span>
              <span>Not Answered ({notAnsweredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></span>
              <span>Total ({questions.length})</span>
            </div>
          </div>

          {/* Palette Number Buttons Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = currentIndex === idx;
              const isAns = answers[q.id] !== undefined;
              const isRev = !!markedForReview[q.id];

              let bgStyle = "bg-slate-800 text-slate-300 hover:bg-slate-700";
              if (isRev) {
                bgStyle = "bg-blue-600 text-white font-black ring-2 ring-blue-400";
              } else if (isAns) {
                bgStyle = "bg-emerald-600 text-white font-black";
              }

              if (isCurrent) {
                bgStyle += " ring-2 ring-yellow-400 scale-105 shadow-md";
              }

              return (
                <button
                  key={q.id || idx}
                  onClick={() => goToQuestion(idx)}
                  className={`h-9 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center ${bgStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-500 hidden lg:block">
            Proctored by MoES Automated Assessment Service
          </div>
        </aside>

        {/* ─── RIGHT / CENTER: QUESTION STAGE & OPTION PICKER ─── */}
        <main className="flex-1 flex flex-col bg-[#070e1f] overflow-y-auto p-4 sm:p-8 order-1 lg:order-2 justify-between">
          
          <div className="max-w-4xl w-full mx-auto space-y-6">
            
            {/* Top Question Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-black">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700">
                  {currentQuestion.subjectName || "Meteorological Physics"}
                </span>
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-bold">
                  {currentQuestion.difficulty || "Medium"}
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-slate-400">
                Marks: <b className="text-emerald-400">+{currentQuestion.marks || 2}</b> / <b className="text-rose-400">-0</b>
              </div>
            </div>

            {/* Question Prompt */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1b36] border border-slate-800 shadow-xl space-y-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options Radio List */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-4 group ${
                      isSelected
                        ? "bg-blue-600/30 border-blue-400 text-white font-bold ring-2 ring-blue-500 shadow-lg"
                        : "bg-[#0c162e] border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-[#101e3d]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono transition-colors ${
                        isSelected 
                          ? "bg-blue-600 text-white shadow" 
                          : "bg-slate-800 text-slate-400 group-hover:text-white"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-blue-400 bg-blue-600 text-white" : "border-slate-700"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* ═════════ 3. BOTTOM QUESTION CONTROL ACTIONS ═════════ */}
          <div className="max-w-4xl w-full mx-auto pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-8">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  markedForReview[currentQuestion.id]
                    ? "bg-blue-600 border-blue-400 text-white shadow"
                    : "bg-slate-800/80 border-slate-700 text-blue-300 hover:bg-slate-700"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{markedForReview[currentQuestion.id] ? "Marked for Review" : "Mark for Review"}</span>
              </button>

              {answers[currentQuestion.id] !== undefined && (
                <button
                  onClick={handleClearAnswer}
                  className="px-3 py-2 text-slate-500 hover:text-rose-400 text-xs font-bold transition-colors"
                >
                  Clear Response
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-transform hover:scale-105"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Finalize & Submit</span>
                </button>
              )}
            </div>
          </div>

        </main>

      </div>

      {/* ═════════ TAB-SWITCH ANTI-CHEAT WARNING MODAL ═════════ */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-[#1a0f1e] border-2 border-rose-600 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-rose-600/20 border border-rose-500 text-rose-400 flex items-center justify-center mx-auto animate-bounce">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase">
                Warning {tabSwitchCount} of 3
              </span>
              <h3 className="text-lg font-black text-white">Security Violation Detected</h3>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                You have navigated away from the exam window or switched application focus. All events are logged.
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-rose-900/60 text-xs text-rose-300 font-mono">
              ⚠️ Warning {tabSwitchCount}/3: Test will be automatically submitted after 3 violations!
            </div>

            <button
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg transition-all"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* ═════════ CONFIRM SUBMIT MODAL ═════════ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#0f1b36] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500 text-blue-400 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Ready to Submit Assessment?</h3>
              <p className="text-xs text-slate-400">
                You have answered <b>{answeredCount}</b> of <b>{questions.length}</b> questions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800 text-emerald-300">
                {answeredCount} Answered
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                {notAnsweredCount} Remaining
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-transform hover:scale-102"
              >
                {submitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
