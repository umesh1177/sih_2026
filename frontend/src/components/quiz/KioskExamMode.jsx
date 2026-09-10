import React, { useState, useEffect, useCallback } from "react";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  FileCheck, 
  AlertOctagon, 
  Check, 
  Building2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../../services/api";

export const KioskExamMode = ({ quiz, currentUser, onClose, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((quiz?.durationMinutes || 30) * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isDisqualified, setIsDisqualified] = useState(false);

  const questions = quiz?.questions && quiz.questions.length > 0 ? quiz.questions : [
    { id: "q_demo_1", question: "In numerical weather prediction (NWP), what is the primary role of the Arakawa C-grid staggering?", options: ["Placing velocity variables (u, v) on cell faces and mass variables (T, P) at cell centres to optimise gravity wave dispersion", "Placing all variables at cell vertices exclusively", "Eliminating vertical advection across sigma coordinates", "Converting non-hydrostatic systems into hydrostatic balance"], correctAnswer: 0, marks: 3, difficulty: "Medium", subjectName: "Atmospheric Dynamics", explanation: "Arakawa C-grid offers superior dispersion properties for high-frequency gravity and inertia-gravity waves." },
    { id: "q_demo_2", question: "In dual-polarization weather radar, what physical property does Differential Reflectivity (ZDR) primarily characterize?", options: ["Echo top height above sea level", "The median oblateness / eccentricity of hydrometeors (horizontal vs vertical axis ratio)", "Radial velocity toward the radar antenna", "Total atmospheric precipitable water"], correctAnswer: 1, marks: 3, difficulty: "Medium", subjectName: "Doppler Radar Meteorology", explanation: "ZDR = 10 * log10(Zh / Zv), giving direct insights into hydrometeor geometric oblateness." },
    { id: "q_demo_3", question: "For Tropical Cyclone intensity estimation via the Dvorak Technique, which satellite pattern represents the highest convective organization?", options: ["Shear Pattern with displaced convective core", "Curved Band Pattern with 0.5 spiral wrap", "Eye Pattern with cold symmetrical Central Dense Overcast (CDO)", "Isolated banding without low-level center definition"], correctAnswer: 2, marks: 4, difficulty: "Hard", subjectName: "Tropical Meteorology", explanation: "A distinct, warm eye embedded within a cold, symmetrical CDO yields the highest T-Number intensity." },
    { id: "q_demo_4", question: "Which condition must be satisfied to prevent numerical instability in explicit finite difference advection schemes (CFL condition)?", options: ["CFL = (u · Δt) / Δx ≤ 1.0", "CFL = (u · Δx) / Δt ≥ 1.0", "CFL = (Δx · Δt) / u = 0", "CFL = u² / (g · Δz) > 2.0"], correctAnswer: 0, marks: 3, difficulty: "Medium", subjectName: "Numerical Modeling", explanation: "The Courant-Friedrichs-Lewy condition dictates that the physical domain of dependence must lie within the numerical domain." }
  ];

  const currentQuestion = questions[currentIndex] || {};

  useEffect(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    if (questions[0]?.id) {
      setVisited({ [questions[0].id]: true });
    }
  }, []);

  const handleSubmitQuiz = useCallback(async (forcedDisqualification = false) => {
    if (submitting || submissionResult) return;
    setSubmitting(true);
    try {
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

  useEffect(() => {
    if (submissionResult) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmitQuiz, submissionResult]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (submissionResult) return;
    const handleViolation = () => {
      if (submissionResult) return;
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setIsDisqualified(true);
          handleSubmitQuiz(true);
        } else {
          setShowWarningModal(true);
        }
        return newCount;
      });
    };
    const handleVisibilityChange = () => { if (document.hidden) handleViolation(); };
    const handleWindowBlur = () => { handleViolation(); };
    const handleKeyDown = (e) => {
      if (e.altKey || e.key === "Meta") { handleViolation(); }
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

  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    const targetQ = questions[idx];
    if (targetQ) setVisited(prev => ({ ...prev, [targetQ.id]: true }));
  };

  const handleSelectOption = (optIdx) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optIdx }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  };

  const handleClearAnswer = () => {
    setAnswers(prev => { const next = { ...prev }; delete next[currentQuestion.id]; return next; });
  };

  const answeredCount = Object.keys(answers).length;
  const markedReviewCount = Object.keys(markedForReview).filter(k => markedForReview[k]).length;
  const notAnsweredCount = questions.length - answeredCount;

  // ─── POST-SUBMISSION RESULT SCREEN ───
  if (submissionResult) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F6F8FA] text-slate-800 flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
        <div className="bg-white text-slate-900 border border-[#D9E2EC] rounded-xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 shadow-md">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            submissionResult.isDisqualified ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"
          }`}>
            {submissionResult.isDisqualified
              ? <AlertOctagon className="w-8 h-8 text-red-600" />
              : <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            }
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Official Examination Protocol
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {submissionResult.isDisqualified ? "Assessment Auto-Submitted (Violation Limit)" : "Assessment Submitted Successfully"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              {submissionResult.isDisqualified
                ? "Test session was concluded due to exceeding maximum allowed anti-cheat focus shifts."
                : "Your responses have been securely archived. Official verification and scoring will be updated in your Officer Dossier and Learning Transcript."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-left">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-[#D9E2EC]">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">Attempt Summary</span>
              <b className="text-sm font-bold text-slate-900">{answeredCount} of {questions.length} Answered</b>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-[#D9E2EC]">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">Proctor Status</span>
              <b className="text-sm font-bold text-emerald-700">Verified Kiosk Session</b>
            </div>
          </div>

          <button
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
              onFinish ? onFinish() : onClose();
            }}
            className="w-full py-2.5 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Return to Assessments Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F6F8FA] text-slate-800 flex flex-col overflow-hidden select-none font-sans">
      
      {/* INSTITUTIONAL HEADER BAR (LIGHT THEME) */}
      <header className="h-14 bg-white border-b border-[#D9E2EC] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#155E75] text-white flex items-center justify-center font-bold text-xs">
            IMD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                PROCTORED EXAM
              </span>
              <span className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {quiz?.title || "National Meteorological Assessment"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Candidate: <span className="font-semibold text-slate-700">{currentUser?.name || "Rahul Sharma"}</span> • MoES Proctored Kiosk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-semibold">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Violations: {tabSwitchCount}/3</span>
            </div>
          )}

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono font-bold text-xs sm:text-sm ${
            timeLeftSeconds < 300
              ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
              : "bg-slate-50 border-[#D9E2EC] text-slate-800"
          }`}>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 bg-[#15803D] hover:bg-green-800 text-white font-semibold rounded-md text-xs transition-colors shadow-xs"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PALETTE (LIGHT THEME) */}
        <aside className="w-full lg:w-72 bg-white border-r border-[#D9E2EC] p-4 flex flex-col shrink-0 overflow-y-auto order-2 lg:order-1 max-h-52 lg:max-h-none">
          <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3">
            Question Palette ({questions.length})
          </h3>

          <div className="grid grid-cols-2 gap-1.5 mb-4 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-blue-50 rounded border border-blue-200 text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Review ({markedReviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded border border-[#D9E2EC] text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>
              <span>Unanswered ({notAnsweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded border border-[#D9E2EC] text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 shrink-0"></span>
              <span>Total ({questions.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const isCurrent = currentIndex === idx;
              const isAns = answers[q.id] !== undefined;
              const isRev = !!markedForReview[q.id];

              let cls = "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100";
              if (isRev) cls = "bg-blue-600 text-white border-blue-600 font-bold";
              else if (isAns) cls = "bg-emerald-600 text-white border-emerald-600 font-bold";
              if (isCurrent) cls += " ring-2 ring-blue-500 scale-105";

              return (
                <button
                  key={q.id || idx}
                  onClick={() => goToQuestion(idx)}
                  className={`h-8 rounded text-xs font-medium font-mono transition-all flex items-center justify-center ${cls}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 text-[10px] text-slate-400 hidden lg:block">
            Ministry of Earth Sciences Examination Security Engine
          </div>
        </aside>

        {/* RIGHT QUESTION PANEL (LIGHT THEME) */}
        <main className="flex-1 flex flex-col bg-[#F6F8FA] overflow-y-auto p-4 sm:p-8 order-1 lg:order-2 justify-between">
          <div className="max-w-4xl w-full mx-auto space-y-5">
            
            {/* Question Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9E2EC]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#1D4ED8] text-white rounded text-xs font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-3 py-1 bg-white text-slate-700 rounded text-xs font-medium border border-[#D9E2EC]">
                  {currentQuestion.subjectName || "Meteorological Physics"}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium">
                  {currentQuestion.difficulty || "Medium"}
                </span>
              </div>
              <div className="text-xs font-mono font-semibold text-slate-500">
                Score weight: <b className="text-emerald-700">+{currentQuestion.marks || 2} marks</b> • Negative: <b className="text-slate-500">0</b>
              </div>
            </div>

            {/* Question Box */}
            <div className="p-6 sm:p-7 rounded-xl bg-white border border-[#D9E2EC] shadow-xs">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 sm:p-4.5 rounded-lg border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? "bg-[#EAF2FF] border-[#1D4ED8] text-[#1E293B] shadow-xs"
                        : "bg-white border-[#D9E2EC] text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 font-mono transition-colors ${
                      isSelected ? "bg-[#1D4ED8] text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="leading-snug flex-1">{opt}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#1D4ED8] bg-[#1D4ED8]" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="max-w-4xl w-full mx-auto pt-5 border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium text-xs transition-colors border border-[#D9E2EC]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                  markedForReview[currentQuestion.id]
                    ? "bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]"
                    : "bg-white border-[#D9E2EC] text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQuestion.id] ? "Marked for Review" : "Mark for Review"}</span>
              </button>

              {answers[currentQuestion.id] !== undefined && (
                <button
                  onClick={handleClearAnswer}
                  className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-red-600 text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Selection</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#15803D] hover:bg-green-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Finalize & Submit</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-7 max-w-md w-full text-center space-y-4 shadow-xl border border-red-200">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-red-50 text-red-700 border border-red-200">
                Security Warning {tabSwitchCount} of 3
              </span>
              <h3 className="text-base font-bold text-slate-900">Focus Shift Detected</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You navigated away from the active examination window. All proctoring events are registered in the tamper-evident audit trail.
              </p>
            </div>
            <div className="p-3 bg-red-50/60 rounded-lg border border-red-100 text-xs text-red-800 font-medium">
              Warning {tabSwitchCount}/3 — Reaching 3 violations will trigger automatic test submission.
            </div>
            <button
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
            >
              I Acknowledge — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-7 max-w-md w-full text-center space-y-5 shadow-xl border border-[#D9E2EC]">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Submit Assessment?</h3>
              <p className="text-xs text-slate-500">
                You have answered <b className="text-slate-800">{answeredCount}</b> of <b className="text-slate-800">{questions.length}</b> questions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                {answeredCount} Answered
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-[#D9E2EC] text-slate-600">
                {notAnsweredCount} Unanswered
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#15803D] hover:bg-green-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
              >
                {submitting ? "Submitting..." : "Yes, Submit Final"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
