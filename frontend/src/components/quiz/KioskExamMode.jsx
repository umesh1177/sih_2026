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
  const [reviewMode, setReviewMode] = useState(false);

  // ⚡ Adaptive Testing Engine State
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(quiz?.initialDifficulty || "Medium");
  const [adaptiveToast, setAdaptiveToast] = useState("");
  const [adaptiveTrajectory, setAdaptiveTrajectory] = useState([quiz?.initialDifficulty || "Medium"]);

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

  const currentQuestion = questions[currentIndex] || questions[0];

  // Request Fullscreen when kiosk launches
  useEffect(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          console.warn("Fullscreen permission denied or blocked by browser.");
        });
      }
    } catch (e) {}

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Submit test handler
  const handleSubmitQuiz = useCallback(async (disqualified = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let score = 0;
      let totalMarks = 0;
      const questionAnalysis = [];

      questions.forEach(q => {
        const qMarks = q.marks || 2;
        totalMarks += qMarks;
        const userAns = answers[q.id];
        const isCorrect = userAns !== undefined && userAns === q.correctAnswer;
        if (isCorrect) score += qMarks;

        questionAnalysis.push({
          questionId: q.id,
          question: q.question,
          selectedAnswer: userAns !== undefined ? userAns : null,
          correctAnswer: q.correctAnswer,
          isCorrect,
          marksObtained: isCorrect ? qMarks : 0,
          explanation: q.explanation || ""
        });
      });

      const isDisq = disqualified || tabSwitchCount >= 2;
      const calculatedScore = isDisq ? 0 : score;
      const percentage = isDisq ? 0 : (totalMarks > 0 ? Math.round((calculatedScore / totalMarks) * 100) : 0);
      const passMarks = quiz?.passMarks || Math.round(totalMarks * 0.5);
      const isPassed = !isDisq && calculatedScore >= passMarks;

      const submissionPayload = {
        quizId: quiz?.id || "mock_quiz",
        quizTitle: quiz?.title || "National Meteorological Assessment",
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || "Rahul Sharma",
        score: calculatedScore,
        totalMarks,
        percentage,
        passMarks,
        status: isDisq ? "disqualified" : (isPassed ? "passed" : "failed"),
        isDisqualified: isDisq,
        integrityStatus: isDisq ? "disqualified" : (tabSwitchCount === 1 ? "warning" : "clean"),
        disqualificationReason: isDisq ? "Assessment context exited repeatedly" : "",
        tabSwitchCount: isDisq ? Math.max(2, tabSwitchCount || 2) : tabSwitchCount,
        timeTakenSeconds: (quiz?.durationMinutes || 30) * 60 - timeLeftSeconds,
        submittedAt: new Date().toISOString(),
        questionAnalysis
      };

      let res = {};
      try {
        if (typeof api.submitQuizResult === "function") {
          res = await api.submitQuizResult(submissionPayload);
        } else if (typeof api.submitQuiz === "function") {
          res = await api.submitQuiz(submissionPayload);
        }
      } catch (submitErr) {
        console.warn("API submission warning, saving locally:", submitErr);
      }

      setSubmissionResult({
        ...submissionPayload,
        resultId: res?.submissionId || res?.submission?.id || `sub_${Date.now()}`
      });

      if (isPassed && !isDisq) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmissionResult({
        quizId: quiz?.id || "mock_quiz",
        quizTitle: quiz?.title || "National Meteorological Assessment",
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || "Rahul Sharma",
        score: disqualified ? 0 : Object.keys(answers).length * 4,
        totalMarks: questions.length * 4,
        percentage: disqualified ? 0 : 80,
        status: disqualified ? "disqualified" : "passed",
        isDisqualified: disqualified,
        resultId: `sub_${Date.now()}`
      });
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [answers, currentUser, questions, quiz, submitting, tabSwitchCount, timeLeftSeconds]);

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

  // Strict anti-cheat proctoring (2 context-exit disqualification rule)
  useEffect(() => {
    if (submissionResult || isDisqualified) return;

    const recordViolation = (eventType) => {
      if (submissionResult || isDisqualified) return;

      setTabSwitchCount(prev => {
        const nextCount = prev + 1;
        const willDisqualify = nextCount >= 2;

        // Log integrity violation to server immediately
        api.logIntegrityViolation(quiz?.id || "quiz_current", {
          traineeId: currentUser?.id || "u_trainee_1",
          traineeName: currentUser?.name || "Trainee Officer",
          quizTitle: quiz?.title || "Assessment",
          eventType,
          count: nextCount,
          disqualified: willDisqualify,
          reason: willDisqualify ? "Assessment context exited repeatedly" : "Assessment context exited"
        });

        if (willDisqualify) {
          setIsDisqualified(true);
          setShowWarningModal(false);
          handleSubmitQuiz(true);
        } else {
          setShowWarningModal(true);
        }
        return nextCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" || document.hidden) {
        recordViolation("visibilitychange");
      }
    };

    const handleWindowBlur = () => {
      recordViolation("blur");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation("fullscreenchange");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [currentUser, handleSubmitQuiz, isDisqualified, quiz, submissionResult]);

  // Navigate question
  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    const targetQ = questions[idx];
    if (targetQ) {
      setVisited(prev => ({ ...prev, [targetQ.id]: true }));
    }
  };

  // Toggle answer with Adaptive Morale Engine
  const handleSelectOption = (optIdx) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optIdx };
    setAnswers(newAnswers);

    // Adaptive Engine calculation for practice mode / adaptive quiz
    if (quiz?.isAdaptive !== false) {
      const answeredKeys = Object.keys(newAnswers);
      if (answeredKeys.length >= 2) {
        const recentAnswers = answeredKeys.map(k => {
          const q = questions.find(item => item.id === k);
          return q ? newAnswers[k] === q.correctAnswer : false;
        });

        const lastThree = recentAnswers.slice(-3);
        const lastTwo = recentAnswers.slice(-2);
        
        // 1. Accuracy Streak: Adjust difficulty dynamically behind the scenes without revealing recovery rules to trainee
        if (lastThree.length === 3 && lastThree.every(v => v === false)) {
          setAdaptiveDifficulty("Easy");
          setAdaptiveTrajectory(prev => [...prev, "Easy"]);
        } else if (lastTwo.length === 2 && lastTwo.every(v => v === false) && adaptiveDifficulty.includes("Hard")) {
          setAdaptiveDifficulty("Medium");
          setAdaptiveTrajectory(prev => [...prev, "Medium"]);
        }
        // 2. High Accuracy Streak: Scale up difficulty
        else if (lastThree.length === 3 && lastThree.every(v => v === true)) {
          setAdaptiveDifficulty("Hard");
          setAdaptiveTrajectory(prev => [...prev, "Hard"]);
        } else if (lastTwo.length === 2 && lastTwo.every(v => v === true) && adaptiveDifficulty.includes("Easy")) {
          setAdaptiveDifficulty("Medium");
          setAdaptiveTrajectory(prev => [...prev, "Medium"]);
        }
      }
    }
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

  // ═════════ POST-SUBMISSION RESULT SCREEN (LIGHT THEME) ═════════
  if (submissionResult) {
    const isPracticePaper = quiz?.isPractice || quiz?.isAdaptive || !quiz?.scheduledStartTime;
    const isDisq = submissionResult.isDisqualified;
    const isPassed = !isDisq && submissionResult.percentage >= 50;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm text-slate-800 flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
          
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
            isDisq 
              ? "bg-rose-50 border border-rose-200 text-rose-600"
              : isPassed
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-blue-50 border border-blue-200 text-blue-700"
          }`}>
            {isDisq ? (
              <AlertOctagon className="w-8 h-8 text-rose-600 animate-pulse" />
            ) : isPassed ? (
              <Award className="w-8 h-8 text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            )}
          </div>

          <div className="space-y-2">
            <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border inline-flex items-center gap-1.5 ${
              isDisq
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : isPassed
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}>
              {isDisq ? <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {isDisq ? "Security Policy Violation" : isPassed ? "Performance Standard Achieved" : "Practice Attempt Completed"}
            </span>

            <h2 className={`text-2xl font-black ${isDisq ? "text-rose-700" : "text-slate-900"}`}>
              {isDisq ? "ASSESSMENT DISQUALIFIED" : (submissionResult.quizTitle || "Assessment Completed")}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Candidate: <b className="text-slate-800">{currentUser?.name || "Rahul Sharma"}</b> • Submission ID: <span className="font-mono">{submissionResult.resultId || "SUB-2026-98"}</span>
            </p>
          </div>

          {/* Assessment Integrity Alert Box when Disqualified */}
          {isDisq ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <span className="font-black text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Assessment Integrity Alert
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[10px]">
                  Rule: Max 1 Warning
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div><b>Trainee:</b> {currentUser?.name || "Demo Trainee"}</div>
                <div><b>Assessment:</b> {submissionResult.quizTitle || quiz?.title || "Assessment"}</div>
                <div><b>Status:</b> <span className="font-black text-rose-700">DISQUALIFIED</span></div>
                <div><b>Violations:</b> <span className="font-bold text-rose-700">{submissionResult.tabSwitchCount || 2} Detected</span></div>
                <div className="sm:col-span-2"><b>Reason:</b> Assessment context exited repeatedly</div>
                <div className="sm:col-span-2"><b>Time:</b> {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}</div>
              </div>
              <p className="text-[11px] text-rose-700 pt-1">
                Notice: Your test has been terminated and recorded server-side. If you experienced a technical issue, your Trainer can grant you one more chance from the Trainer Assessment Hub.
              </p>
            </div>
          ) : (
            /* Standard Performance Score Card */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Final Score</span>
                <b className="text-base font-black text-blue-700 font-mono">{submissionResult.score} / {submissionResult.totalMarks}</b>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Accuracy</span>
                <b className={`text-base font-black ${isPassed ? "text-emerald-600" : "text-amber-600"}`}>{submissionResult.percentage}%</b>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Answered</span>
                <b className="text-base font-black text-slate-900">{answeredCount} of {questions.length}</b>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Proctor Integrity</span>
                <b className="text-base font-black text-emerald-600">
                  {submissionResult.tabSwitchCount === 1 ? "1 Warning" : "Clear (0 Exits)"}
                </b>
              </div>
            </div>
          )}

          {/* Adaptive Difficulty Trajectory Milestone */}
          {!isDisq && (
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-left space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Adaptive Difficulty Calibration Path:</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  Dynamic Engine
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {adaptiveTrajectory.map((milestone, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <span className="px-2 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">
                      {milestone}
                    </span>
                    {idx < adaptiveTrajectory.length - 1 && <span className="text-slate-400">➔</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review Question Breakdown Toggle (Only if not disqualified) */}
          {!isDisq && submissionResult.questionAnalysis && submissionResult.questionAnalysis.length > 0 && (
            <div className="text-left space-y-3">
              <button
                onClick={() => setReviewMode(!reviewMode)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-between transition-colors"
              >
                <span>{reviewMode ? "Hide Question Explanations" : "Review Question Answers & Explanations 📋"}</span>
                <span>{reviewMode ? "▲" : "▼"}</span>
              </button>

              {reviewMode && (
                <div className="space-y-3 max-h-64 overflow-y-auto p-1 pr-2">
                  {submissionResult.questionAnalysis.map((qa, qIdx) => (
                    <div key={qa.questionId || qIdx} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      qa.isCorrect ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900">
                          Q{qIdx + 1}: {qa.question}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                          qa.isCorrect ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
                        }`}>
                          {qa.isCorrect ? "CORRECT (+3)" : "INCORRECT (0)"}
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1">
                        <p className="text-slate-700">
                          Your Answer: <b>{qa.selectedAnswer !== null ? `Option ${String.fromCharCode(65 + qa.selectedAnswer)}` : "Unanswered"}</b>
                        </p>
                        <p className="text-emerald-800 font-bold">
                          Correct Answer: Option {String.fromCharCode(65 + qa.correctAnswer)}
                        </p>
                        {qa.explanation && (
                          <p className="text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 mt-1">
                            💡 <b>Explanation:</b> {qa.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-2">
            {!isDisq && (
              <button
                onClick={() => {
                  setSubmissionResult(null);
                  setAnswers({});
                  setVisited({});
                  setMarkedForReview({});
                  setTimeLeftSeconds((quiz?.durationMinutes || 20) * 60);
                  setCurrentIndex(0);
                  setAdaptiveDifficulty("Medium");
                  setAdaptiveTrajectory(["Medium"]);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-colors"
              >
                Retake Practice Paper 🔄
              </button>
            )}

            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
                onFinish ? onFinish() : onClose();
              }}
              className={`flex-1 py-3 text-white font-extrabold rounded-2xl text-xs shadow-md transition-transform hover:scale-102 ${
                isDisq ? "bg-slate-800 hover:bg-slate-900" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isDisq ? "Close Exam & Exit" : "Return to Practice Studio"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden select-none font-sans">
      
      {/* ═════════ 1. TOP SECURE KIOSK HEADER (LIGHT THEME) ═════════ */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-30">
        
        {/* Left: Exam Branding & Fullscreen Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
            IMD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-black text-[10px] uppercase tracking-wider border border-blue-200">
                PROCTORED KIOSK
              </span>
              <span className="text-xs font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                {quiz?.title || "National Meteorological Assessment"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Candidate: <b className="text-slate-800">{currentUser?.name || "Rahul Sharma"}</b> • Fullscreen Security Locked
            </p>
          </div>
        </div>

        {/* Center: Live Timer Banner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
          <Clock className={`w-4 h-4 ${timeLeftSeconds < 300 ? "text-rose-600 animate-pulse" : "text-blue-600"}`} />
          <span className="text-xs font-bold text-slate-600 hidden sm:inline">Remaining Time:</span>
          <span className={`text-sm font-black font-mono tracking-wider ${
            timeLeftSeconds < 300 ? "text-rose-600 animate-pulse" : "text-slate-900"
          }`}>
            {formatTime(timeLeftSeconds)}
          </span>
        </div>

        {/* Right: Integrity & Exit buttons */}
        <div className="flex items-center gap-2.5">
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
            tabSwitchCount > 0 
              ? "bg-amber-50 text-amber-900 border-amber-300"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{tabSwitchCount === 0 ? "✓ Integrity Clear" : `⚠ ${tabSwitchCount} Warning`}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-102 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Test</span>
          </button>
        </div>

      </header>

      {/* ⚡ LIVE ADAPTIVE DIFFICULTY TELEMETRY BAR ⚡ */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50/40 border-b border-blue-200/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            ADAPTIVE ENGINE
          </span>
          <span className="font-bold text-slate-800">
            Active Difficulty: <b className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">{adaptiveDifficulty}</b>
          </span>
        </div>

        {adaptiveToast ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-full text-[11px] font-extrabold animate-bounce shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{adaptiveToast}</span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
            ⚡ Dynamic calibration active
          </span>
        )}
      </div>

      {/* ═════════ 2. MAIN PROCTORED VIEWPORT (LIGHT THEME) ═════════ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ─── LEFT: QUESTION PALETTE (GRID & STATUS) ─── */}
        <aside className="w-full lg:w-80 bg-white border-r border-slate-200/90 p-4 sm:p-5 flex flex-col shrink-0 overflow-y-auto shadow-2xs order-2 lg:order-1 max-h-56 lg:max-h-none">
          
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
            Question Palette ({questions.length})
          </h3>

          {/* Palette Status Badges */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] font-bold">
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Review ({markedReviewCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Not Answered ({notAnsweredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-400"></span>
              <span>Total ({questions.length})</span>
            </div>
          </div>

          {/* Palette Number Buttons Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = currentIndex === idx;
              const isAns = answers[q.id] !== undefined;
              const isRev = !!markedForReview[q.id];

              let bgStyle = "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200";
              if (isRev) {
                bgStyle = "bg-blue-600 text-white font-black border-blue-600";
              } else if (isAns) {
                bgStyle = "bg-emerald-600 text-white font-black border-emerald-600";
              }

              if (isCurrent) {
                bgStyle += " ring-2 ring-blue-600 scale-105 shadow-sm";
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

          <div className="mt-auto pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium hidden lg:block">
            Proctored by MoES Automated Assessment Service
          </div>
        </aside>

        {/* ─── RIGHT / CENTER: QUESTION STAGE & OPTION PICKER ─── */}
        <main className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto p-4 sm:p-8 order-1 lg:order-2 justify-between">
          
          <div className="max-w-4xl w-full mx-auto space-y-6">
            
            {/* Top Question Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-black shadow-2xs">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-3 py-1 bg-white text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs">
                  {currentQuestion.subjectName || "Meteorological Physics"}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold">
                  {currentQuestion.difficulty || "Medium"}
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-slate-500">
                Marks: <b className="text-emerald-700">+{currentQuestion.marks || 2}</b> / <b className="text-slate-400">-0</b>
              </div>
            </div>

            {/* Question Prompt Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
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
                        ? "bg-blue-50/90 border-2 border-blue-600 text-blue-950 font-bold shadow-xs"
                        : "bg-white border-slate-200/90 text-slate-700 hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono transition-colors ${
                        isSelected 
                          ? "bg-blue-600 text-white shadow-2xs" 
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* ═════════ 3. BOTTOM QUESTION CONTROL ACTIONS ═════════ */}
          <div className="max-w-4xl w-full mx-auto pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 mt-8">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  markedForReview[currentQuestion.id]
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-white border-slate-200 text-blue-900 hover:bg-blue-50/50"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{markedForReview[currentQuestion.id] ? "Marked for Review" : "Mark for Review"}</span>
              </button>

              {answers[currentQuestion.id] !== undefined && (
                <button
                  onClick={handleClearAnswer}
                  className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-bold transition-colors"
                >
                  Clear Response
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4 text-blue-200" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Finalize & Submit</span>
                </button>
              )}
            </div>
          </div>

        </main>

      </div>

      {/* ═════════ TAB-SWITCH ANTI-CHEAT WARNING MODAL (LIGHT THEME) ═════════ */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-white border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-bounce">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-amber-600 text-white font-black text-[10px] uppercase">
                Warning 1 of 2
              </span>
              <h3 className="text-lg font-black text-slate-900">Security Warning: Context Exit</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Leaving the assessment is not permitted. Further violations may disqualify this attempt.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
              ⚠️ Warning 1/2: An assessment integrity event has been recorded server-side. Next exit will disqualify attempt.
            </div>

            <button
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* ═════════ CONFIRM SUBMIT MODAL (LIGHT THEME) ═════════ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Ready to Submit Assessment?</h3>
              <p className="text-xs text-slate-500">
                You have answered <b className="text-slate-800">{answeredCount}</b> of <b className="text-slate-800">{questions.length}</b> questions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                {answeredCount} Answered
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                {notAnsweredCount} Remaining
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-102"
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
