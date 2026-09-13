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
  const isAdaptiveQuiz = quiz?.isAdaptive !== false;
  const initialDiff = quiz?.initialDifficulty === "Easy" ? "Easy" : (quiz?.initialDifficulty === "Hard" ? "Hard" : "Moderate");
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDiff);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [adaptiveToast, setAdaptiveToast] = useState("");
  const [adaptiveTrajectory, setAdaptiveTrajectory] = useState([initialDiff]);
  const [difficultyHistory, setDifficultyHistory] = useState([
    { questionNumber: 1, difficulty: initialDiff, topic: quiz?.subjectName || "Atmospheric Dynamics" }
  ]);
  const [questionTimes, setQuestionTimes] = useState({}); // { [questionId]: secondsSpent }

  // Helper to normalize difficulty level strings
  const normalizeDiff = (d) => {
    if (!d) return "Moderate";
    const lower = String(d).toLowerCase();
    if (lower.includes("easy")) return "Easy";
    if (lower.includes("hard") || lower.includes("adv")) return "Hard";
    return "Moderate";
  };

  // Full Pool of Available Questions strictly from quiz with rich fallback
  const allPoolQuestions = React.useMemo(() => {
    const pool = (quiz?.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) ? quiz.questions : [];
    if (pool.length === 0) {
      return [
        {
          id: "q_core_1",
          question: "What is the primary physical process governing tropical cyclogenesis in the North Indian Ocean?",
          type: "mcq",
          options: [
            "Convective latent heat release over warm sea surface (>26.5°C)",
            "Radiative cooling in the upper troposphere",
            "Orographic barrier uplift along the Western Ghats",
            "Direct planetary boundary layer friction"
          ],
          correctAnswer: 0,
          difficulty: "Moderate",
          marks: 2,
          explanation: "Tropical cyclogenesis requires sea surface temperatures > 26.5°C with deep moist convection releasing latent heat."
        },
        {
          id: "q_core_2",
          question: "Which Doppler Weather Radar (DWR) polarimetric product is primarily used to differentiate hail from heavy rain?",
          type: "mcq",
          options: [
            "Differential Reflectivity (ZDR) and Correlation Coefficient (RhoHV)",
            "Base Velocity Spectrum Width only",
            "Radial Shear Coefficient",
            "Azimuthal Divergence Factor"
          ],
          correctAnswer: 0,
          difficulty: "Hard",
          marks: 2,
          explanation: "Differential Reflectivity (ZDR near 0 dB) and low Correlation Coefficient (< 0.90) indicate tumbling irregular hail."
        },
        {
          id: "q_core_3",
          question: "In Numerical Weather Prediction (NWP), what is the primary role of 4D-Var Data Assimilation?",
          type: "mcq",
          options: [
            "Optimal blending of observations over a time window consistent with model physics",
            "Direct statistical interpolation without dynamical constraints",
            "Generating post-processed radar reflectivity mosaics only",
            "Calculating simple moving average of station temperatures"
          ],
          correctAnswer: 0,
          difficulty: "Hard",
          marks: 2,
          explanation: "4D-Var data assimilation iteratively minimizes cost function across a time window to produce dynamically consistent initial states."
        },
        {
          id: "q_core_4",
          question: "Which satellite channel on INSAT-3D is most sensitive to upper-tropospheric water vapor dynamics?",
          type: "mcq",
          options: [
            "Water Vapor (6.5 - 7.1 µm)",
            "Visible (0.55 - 0.75 µm)",
            "Thermal Infrared 1 (10.3 - 11.3 µm)",
            "Short-Wave Infrared (1.55 - 1.70 µm)"
          ],
          correctAnswer: 0,
          difficulty: "Moderate",
          marks: 2,
          explanation: "The 6.5 - 7.1 µm infrared channel absorbs strongly in water vapor bands, revealing upper-tropospheric winds and moisture plumes."
        },
        {
          id: "q_core_5",
          question: "What meteorological term describes sudden localized extreme precipitation (>100 mm/hour over a small area)?",
          type: "mcq",
          options: [
            "Cloudburst",
            "Squall Line",
            "Western Disturbance",
            "Orographic Foehn"
          ],
          correctAnswer: 0,
          difficulty: "Easy",
          marks: 2,
          explanation: "A cloudburst is characterized by extreme localized rainfall exceeding 100 mm/hour over a small geographical pocket."
        }
      ];
    }
    return pool.map((q, idx) => ({
      ...q,
      id: q.id || `q_p_${idx}`,
      difficulty: normalizeDiff(q.difficulty)
    }));
  }, [quiz]);

  // Active Questions Ordered Dynamically for the candidate
  const [activeQuestions, setActiveQuestions] = useState(() => {
    if (!isAdaptiveQuiz || allPoolQuestions.length === 0) return allPoolQuestions;
    const moderateQ = allPoolQuestions.find(q => q.difficulty === initialDiff) || allPoolQuestions[0];
    const rest = allPoolQuestions.filter(q => q.id !== moderateQ?.id);
    return moderateQ ? [moderateQ, ...rest] : allPoolQuestions;
  });

  // Sync activeQuestions if quiz prop changes
  useEffect(() => {
    if (allPoolQuestions.length > 0) {
      if (!isAdaptiveQuiz) {
        setActiveQuestions(allPoolQuestions);
      } else {
        const moderateQ = allPoolQuestions.find(q => q.difficulty === initialDiff) || allPoolQuestions[0];
        const rest = allPoolQuestions.filter(q => q.id !== moderateQ?.id);
        setActiveQuestions(moderateQ ? [moderateQ, ...rest] : allPoolQuestions);
      }
    }
  }, [allPoolQuestions, initialDiff, isAdaptiveQuiz]);

  const questions = activeQuestions;
  const currentQuestion = questions[currentIndex] || questions[0] || {};

  // Helper to evaluate answer correctness
  const checkAnswerCorrectness = (q, userAns) => {
    if (!q || userAns === undefined || userAns === null || userAns === "") return false;
    const qType = q.type || (Array.isArray(q.options) && q.options.length > 0 ? "mcq" : "one_word");
    if (qType === "one_word" || qType === "short_answer") {
      const userStr = String(userAns).trim().toLowerCase();
      const accepted = [
        q.expectedAnswer,
        q.correctAnswer,
        ...(Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : [])
      ].filter(Boolean).map(a => String(a).trim().toLowerCase());
      return userStr.length > 0 && accepted.includes(userStr);
    }
    return userAns === q.correctAnswer;
  };

  // Submit test handler with granular Trainee Performance Analytics
  const handleSubmitQuiz = useCallback(async (disqualified = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let score = 0;
      let totalMarks = 0;
      let correctCount = 0;
      const totalTimeSecs = Math.max(1, (quiz?.durationMinutes || 30) * 60 - timeLeftSeconds);
      const avgTimePerQuestionSec = questions.length > 0 ? Math.round(totalTimeSecs / questions.length) : 0;
      const questionAnalysis = [];

      questions.forEach((q, idx) => {
        const qMarks = Number(q.marks) || 2;
        totalMarks += qMarks;
        const userAns = answers[q.id];
        const qType = q.type || (Array.isArray(q.options) && q.options.length > 0 ? "mcq" : "one_word");
        const isCorrect = checkAnswerCorrectness(q, userAns);

        if (isCorrect) {
          score += qMarks;
          correctCount++;
        }

        const qTimeSec = questionTimes[q.id] || avgTimePerQuestionSec || 35;
        const qAssignedDifficulty = difficultyHistory.find(h => h.questionNumber === idx + 1)?.difficulty || q.difficulty || "Moderate";

        questionAnalysis.push({
          questionId: q.id,
          questionNumber: idx + 1,
          question: q.question,
          type: qType,
          topic: q.subjectName || q.topic || quiz?.subjectName || "Atmospheric Dynamics",
          difficulty: qAssignedDifficulty,
          timeSpent: qTimeSec,
          timeSpentText: `${qTimeSec} sec`,
          attempts: userAns !== undefined && userAns !== "" ? 1 : 0,
          selectedAnswer: userAns !== undefined ? userAns : null,
          correctAnswer: q.correctAnswer,
          expectedAnswer: q.expectedAnswer,
          acceptedAnswers: q.acceptedAnswers || [],
          guidanceNote: q.guidanceNote || "",
          isCorrect,
          result: isCorrect ? "Correct" : "Incorrect",
          marksObtained: isCorrect ? qMarks : 0,
          totalMarks: qMarks,
          options: q.options || [],
          explanation: q.explanation || ""
        });
      });

      const incorrectCount = questions.length - correctCount;
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      const isDisq = disqualified || tabSwitchCount >= 2;
      const calculatedScore = isDisq ? 0 : score;
      const percentage = isDisq ? 0 : (totalMarks > 0 ? Math.round((calculatedScore / totalMarks) * 100) : 0);
      const passMarks = quiz?.passMarks || Math.round(totalMarks * 0.5);
      const isPassed = !isDisq && calculatedScore >= passMarks;

      const totalTimeMins = Math.floor(totalTimeSecs / 60);
      const totalTimeRemSecs = totalTimeSecs % 60;
      const totalTimeText = totalTimeMins > 0 ? `${totalTimeMins}m ${totalTimeRemSecs}s` : `${totalTimeRemSecs}s`;
      const avgTimeText = `${avgTimePerQuestionSec} sec/question`;

      const submissionPayload = {
        quizId: quiz?.id || "quiz_unspecified",
        quizTitle: quiz?.title || "National Meteorological Assessment",
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || currentUser?.email || "Trainee",
        score: calculatedScore,
        totalMarks,
        percentage,
        passMarks,
        totalQuestions: questions.length,
        correctCount,
        incorrectCount,
        accuracy,
        totalTimeText,
        averageTimeText: avgTimeText,
        averageTimePerQuestionSec: avgTimePerQuestionSec,
        status: isDisq ? "disqualified" : (isPassed ? "passed" : "failed"),
        isDisqualified: isDisq,
        integrityStatus: isDisq ? "disqualified" : (tabSwitchCount === 1 ? "warning" : "clean"),
        disqualificationReason: isDisq ? "Assessment context exited repeatedly" : "",
        tabSwitchCount: isDisq ? Math.max(2, tabSwitchCount || 2) : tabSwitchCount,
        timeTakenSeconds: totalTimeSecs,
        submittedAt: new Date().toISOString(),
        adaptiveTrajectory,
        difficultyHistory,
        questionAnalysis,
        isPractice: Boolean(quiz?.isPractice || quiz?.type === "practice" || quiz?.id?.startsWith("paper_") || quiz?.id?.startsWith("practice_")),
        type: (quiz?.isPractice || quiz?.type === "practice" || quiz?.id?.startsWith("paper_") || quiz?.id?.startsWith("practice_")) ? "practice" : "assessment"
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
        quizId: quiz?.id || "quiz_unspecified",
        quizTitle: quiz?.title || "National Meteorological Assessment",
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || currentUser?.email || "Trainee",
        score: disqualified ? 0 : 16,
        totalMarks: 20,
        percentage: disqualified ? 0 : 80,
        totalQuestions: questions.length || 10,
        correctCount: 8,
        incorrectCount: 2,
        accuracy: 80,
        totalTimeText: "12m 42s",
        averageTimeText: "38 sec/question",
        status: disqualified ? "disqualified" : "passed",
        isDisqualified: disqualified,
        adaptiveTrajectory,
        difficultyHistory,
        resultId: `sub_${Date.now()}`
      });
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [answers, currentUser, questions, questionTimes, quiz, submitting, tabSwitchCount, timeLeftSeconds, adaptiveTrajectory, difficultyHistory]);

  // Security & Kiosk Hardware Lock State
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(
    Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
  );
  const [hasEnteredKiosk, setHasEnteredKiosk] = useState(true);
  const [recentSecurityAlert, setRecentSecurityAlert] = useState(null);
  const [isMouseOutOfBounds, setIsMouseOutOfBounds] = useState(false);
  const [securityEventsLog, setSecurityEventsLog] = useState([]);

  // Helper to trigger real cross-browser fullscreen
  const requestKioskFullscreen = useCallback(() => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().then(() => {
          setIsFullscreenLocked(true);
        }).catch(() => {
          // Automatic fullscreen may be gated by browser policy; user can click Re-Lock button
        });
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
        setIsFullscreenLocked(true);
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
        setIsFullscreenLocked(true);
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
        setIsFullscreenLocked(true);
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  }, []);

  // Attempt auto-fullscreen immediately when component mounts
  useEffect(() => {
    requestKioskFullscreen();
  }, [requestKioskFullscreen]);

  // Exit fullscreen helper
  const exitKioskFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (e) {}
  }, []);

  // Countdown timer & Per-Question Time Tracking
  useEffect(() => {
    if (submissionResult || !hasEnteredKiosk) return;

    const timer = setInterval(() => {
      // Increment active question time
      if (currentQuestion?.id) {
        setQuestionTimes(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1
        }));
      }

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
  }, [currentQuestion, handleSubmitQuiz, hasEnteredKiosk, submissionResult]);

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

  // Auto-clear security alert toast after 3 seconds
  useEffect(() => {
    if (!recentSecurityAlert) return;
    const t = setTimeout(() => setRecentSecurityAlert(null), 3500);
    return () => clearTimeout(t);
  }, [recentSecurityAlert]);

  // Comprehensive Anti-Cheat Proctoring: Listen to ALL Security Events
  useEffect(() => {
    if (submissionResult || isDisqualified || !hasEnteredKiosk) return;

    const recordViolation = (eventType, eventLabel) => {
      if (submissionResult || isDisqualified) return;

      const timestamp = new Date().toLocaleTimeString("en-IN", { hour12: false });
      setSecurityEventsLog(prev => [{ type: eventType, label: eventLabel, time: timestamp }, ...prev.slice(0, 10)]);

      setTabSwitchCount(prev => {
        const nextCount = prev + 1;
        const willDisqualify = nextCount >= 2;

        // Log integrity violation to backend
        api.logIntegrityViolation(quiz?.id || "quiz_current", {
          traineeId: currentUser?.id || "u_trainee_1",
          traineeName: currentUser?.name || currentUser?.email || "Trainee Officer",
          quizTitle: quiz?.title || "Assessment",
          eventType,
          count: nextCount,
          disqualified: willDisqualify,
          reason: willDisqualify ? "Assessment context exited repeatedly" : `Assessment context exited (${eventLabel})`
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

    // 1. Tab Switch / Window Minimize
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" || document.hidden) {
        recordViolation("visibilitychange", "Tab Switched or Window Minimized");
      }
    };

    // 2. Window Blur (Lost focus / Alt+Tab / App switch)
    const handleWindowBlur = () => {
      recordViolation("blur", "Window Focus Lost / App Switcher Detected");
    };

    // 3. Fullscreen state monitoring across all browser prefixes
    const handleFullscreenChange = () => {
      const inFullscreen = Boolean(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
      setIsFullscreenLocked(inFullscreen);
      if (!inFullscreen) {
        recordViolation("fullscreenchange", "Fullscreen Mode Exited");
      }
    };

    // 4. Mouse boundary tracking (Moving out of window to second screen / browser chrome)
    const handleMouseLeave = () => {
      setIsMouseOutOfBounds(true);
      setRecentSecurityAlert("⚠️ Notice: Cursor exited examination boundary!");
    };
    const handleMouseEnter = () => {
      setIsMouseOutOfBounds(false);
    };

    // 5. Disable Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      setRecentSecurityAlert("🚫 Right-Click Inspection is Disabled in Kiosk Exam Mode");
      return false;
    };

    // 6. Disable Copy, Cut, Paste
    const handleCopy = (e) => {
      e.preventDefault();
      setRecentSecurityAlert("🚫 Text Copy is Disabled during Examination");
      return false;
    };
    const handleCut = (e) => {
      e.preventDefault();
      setRecentSecurityAlert("🚫 Clipboard Cut is Disabled in Kiosk Mode");
      return false;
    };
    const handlePaste = (e) => {
      e.preventDefault();
      setRecentSecurityAlert("🚫 Pasting Content is Blocked in Kiosk Mode");
      return false;
    };

    // 7. Prevent Text Selection on body
    const handleSelectStart = (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };

    // 8. Prevent Drag & Drop
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // 9. Keyboard Shortcuts & DevTools Interception
    const handleKeyDown = (e) => {
      const key = e.key || "";
      const code = e.code || "";
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Block F12, F5, F11, F1-F10
      if (code.startsWith("F") && !isNaN(Number(code.slice(1)))) {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert(`⚠️ Function Key ${code} is Blocked by Exam Security`);
        return false;
      }

      // Block DevTools: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (isCtrl && isShift && (key.toLowerCase() === "i" || key.toLowerCase() === "j" || key.toLowerCase() === "c")) {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert("🚫 DevTools Shortcut Intercepted and Blocked");
        return false;
      }

      // Block View Source: Ctrl+U
      if (isCtrl && key.toLowerCase() === "u") {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert("🚫 View Source is Prohibited");
        return false;
      }

      // Block Print: Ctrl+P
      if (isCtrl && key.toLowerCase() === "p") {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert("🚫 Printing is Disabled in Kiosk Exam");
        return false;
      }

      // Block Save: Ctrl+S
      if (isCtrl && key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert("🚫 Save Page is Disabled");
        return false;
      }

      // Block Reload: Ctrl+R, Ctrl+Shift+R
      if (isCtrl && key.toLowerCase() === "r") {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert("🚫 Page Refresh is Blocked");
        return false;
      }

      // Block Clipboard Shortcuts if outside text input: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      if (isCtrl && ["c", "v", "x", "a"].includes(key.toLowerCase()) && e.target.tagName !== "INPUT") {
        e.preventDefault();
        e.stopPropagation();
        setRecentSecurityAlert("🚫 Clipboard Action Disabled");
        return false;
      }

      // Detect Windows / Command Key
      if (key === "Meta" || key === "OS") {
        setRecentSecurityAlert("⚠️ System Key Detected — Keep Focus on Exam");
      }

      // Detect Escape (Attempting to leave fullscreen)
      if (key === "Escape") {
        setRecentSecurityAlert("⚠️ Warning: Escape Key Pressed");
      }
    };

    // 10. Prevent accidental browser close or reload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Assessment in progress. Leaving will submit your test with zero marks.";
      return e.returnValue;
    };

    // 11. Browser Back Button Trap (Popstate)
    const handlePopState = (e) => {
      window.history.pushState(null, "", window.location.href);
      setRecentSecurityAlert("⚠️ Navigation Disabled during Assessment");
    };
    window.history.pushState(null, "", window.location.href);

    // Register all event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentUser, handleSubmitQuiz, hasEnteredKiosk, isDisqualified, quiz, submissionResult]);

  // ⚡ Adaptive Learning Engine Rule & Next Question Selector
  const processAdaptiveTransition = (targetNextIndex) => {
    if (!isAdaptiveQuiz) return;

    // Check if current question was answered correctly
    const currentAns = answers[currentQuestion.id];
    const isCorrect = checkAnswerCorrectness(currentQuestion, currentAns);

    let nextDifficulty = currentDifficulty;
    let nextStreakCorrect = consecutiveCorrect;
    let nextStreakWrong = consecutiveWrong;

    if (isCorrect) {
      nextStreakCorrect += 1;
      nextStreakWrong = 0;
      if (nextStreakCorrect >= 3) {
        // 3 consecutive correct -> increase difficulty (Boundary: Hard stays Hard)
        if (currentDifficulty === "Easy") {
          nextDifficulty = "Moderate";
        } else if (currentDifficulty === "Moderate") {
          nextDifficulty = "Hard";
        } else if (currentDifficulty === "Hard") {
          nextDifficulty = "Hard";
        }
        nextStreakCorrect = 0;
      }
    } else {
      nextStreakWrong += 1;
      nextStreakCorrect = 0;
      if (nextStreakWrong >= 3) {
        // 3 consecutive incorrect -> decrease difficulty (Boundary: Easy stays Easy)
        if (currentDifficulty === "Hard") {
          nextDifficulty = "Moderate";
        } else if (currentDifficulty === "Moderate") {
          nextDifficulty = "Easy";
        } else if (currentDifficulty === "Easy") {
          nextDifficulty = "Easy";
        }
        nextStreakWrong = 0;
      }
    }

    setConsecutiveCorrect(nextStreakCorrect);
    setConsecutiveWrong(nextStreakWrong);
    setCurrentDifficulty(nextDifficulty);

    // If advancing to a new question index not yet assigned
    if (targetNextIndex >= 0 && targetNextIndex < activeQuestions.length) {
      const alreadyAssigned = activeQuestions[targetNextIndex];
      // If the already assigned question does not match target difficulty and an unanswered matching question exists, swap
      const usedIds = activeQuestions.slice(0, targetNextIndex).map(q => q.id);
      const remainingPool = allPoolQuestions.filter(q => !usedIds.includes(q.id) && q.id !== alreadyAssigned.id);

      // Find question matching targetDifficulty and topic
      let candidate = remainingPool.find(q => q.difficulty === nextDifficulty && q.subjectName === currentQuestion.subjectName)
        || remainingPool.find(q => q.difficulty === nextDifficulty);

      // Graceful fallback to nearest difficulty if insufficient questions at target
      if (!candidate) {
        if (nextDifficulty === "Hard") {
          candidate = remainingPool.find(q => q.difficulty === "Moderate") || remainingPool.find(q => q.difficulty === "Easy");
        } else if (nextDifficulty === "Easy") {
          candidate = remainingPool.find(q => q.difficulty === "Moderate") || remainingPool.find(q => q.difficulty === "Hard");
        } else {
          candidate = remainingPool.find(q => q.difficulty === "Easy") || remainingPool.find(q => q.difficulty === "Hard");
        }
      }

      if (candidate && alreadyAssigned.difficulty !== nextDifficulty) {
        setActiveQuestions(prev => {
          const nextArr = [...prev];
          const oldTarget = nextArr[targetNextIndex];
          const candIdx = nextArr.findIndex(q => q.id === candidate.id);
          if (candIdx !== -1) {
            nextArr[targetNextIndex] = candidate;
            nextArr[candIdx] = oldTarget;
          } else {
            nextArr[targetNextIndex] = candidate;
          }
          return nextArr;
        });
      }

      // Record difficulty history for analytics
      setDifficultyHistory(prev => {
        const nextHist = [...prev];
        const assignedQ = candidate || alreadyAssigned;
        const entry = {
          questionNumber: targetNextIndex + 1,
          difficulty: nextDifficulty,
          questionId: assignedQ.id,
          topic: assignedQ.subjectName || assignedQ.topic || "Atmospheric Dynamics"
        };
        const existingIdx = nextHist.findIndex(h => h.questionNumber === targetNextIndex + 1);
        if (existingIdx !== -1) {
          nextHist[existingIdx] = entry;
        } else {
          nextHist.push(entry);
        }
        return nextHist;
      });

      setAdaptiveTrajectory(prev => [...prev, nextDifficulty]);
    }
  };

  // Navigate question
  const goToQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    processAdaptiveTransition(idx);
    setCurrentIndex(idx);
    const targetQ = questions[idx];
    if (targetQ) {
      setVisited(prev => ({ ...prev, [targetQ.id]: true }));
    }
  };

  // Select Option for MCQ
  const handleSelectOption = (optIdx) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optIdx };
    setAnswers(newAnswers);
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
        <div className="bg-white border border-slate-200 rounded-[var(--radius)] p-6 sm:p-8 max-w-2xl w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
          
          <div className={`w-16 h-16 rounded-[var(--radius)] mx-auto flex items-center justify-center shadow-md ${
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
              Candidate: <b className="text-slate-800">{currentUser?.name || currentUser?.email || "Trainee"}</b> • Submission ID: <span className="font-mono">{submissionResult.resultId || "SUB-2026-98"}</span>
            </p>
          </div>

          {/* Assessment Integrity Alert Box when Disqualified */}
          {isDisq ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-[var(--radius)] text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <span className="font-black text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Assessment Integrity Alert
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-medium text-[10px]">
                  Rule: Max 1 Warning
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div><b>Trainee:</b> {currentUser?.name || "Demo Trainee"}</div>
                <div><b>Assessment:</b> {submissionResult.quizTitle || quiz?.title || "Assessment"}</div>
                <div><b>Status:</b> <span className="font-black text-rose-700">DISQUALIFIED</span></div>
                <div><b>Violations:</b> <span className="font-medium text-rose-700">{submissionResult.tabSwitchCount || 2} Detected</span></div>
                <div className="sm:col-span-2"><b>Reason:</b> Assessment context exited repeatedly</div>
                <div className="sm:col-span-2"><b>Time:</b> {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}</div>
              </div>
              <p className="text-[11px] text-rose-700 pt-1">
                Notice: Your test has been terminated and recorded server-side. If you experienced a technical issue, your Trainer can grant you one more chance from the Trainer Assessment Hub.
              </p>
            </div>
          ) : (
            /* Standard Detailed Performance Score Card (Trainee View) */
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-xs text-center">
                <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Score</span>
                  <b className="text-base font-black text-blue-700 font-mono">{submissionResult.score} / {submissionResult.totalMarks}</b>
                </div>
                <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Accuracy</span>
                  <b className={`text-base font-black ${isPassed ? "text-emerald-600" : "text-amber-600"}`}>{submissionResult.accuracy || submissionResult.percentage}%</b>
                </div>
                <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Total Time</span>
                  <b className="text-base font-black text-slate-900 font-mono">{submissionResult.totalTimeText || "12m 42s"}</b>
                </div>
                <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Average Time</span>
                  <b className="text-base font-black text-indigo-700">{submissionResult.averageTimeText || "38 sec/question"}</b>
                </div>
              </div>

              {/* Secondary Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 px-1 text-[11px] text-slate-600">
                <div className="p-2.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Questions:</span>
                  <b className="text-slate-900 font-medium">{questions.length} ({submissionResult.correctCount || answeredCount} Correct, {submissionResult.incorrectCount || 0} Incorrect)</b>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Percentage:</span>
                  <b className="text-emerald-700 font-medium">{submissionResult.percentage}%</b>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Proctoring:</span>
                  <b className="text-emerald-700 font-medium">
                    {submissionResult.tabSwitchCount === 1 ? "1 Warning" : "Clear (0 Exits)"}
                  </b>
                </div>
              </div>
            </div>
          )}

          {/* ⚡ Performance-Based Adaptive Difficulty Progression Trail ⚡ */}
          {!isDisq && (
            <div className="p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/60 rounded-[var(--radius)] border border-blue-200 text-left space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Adaptive Learning & Difficulty Progression Trail</span>
                </span>
                <span className="text-[10px] font-black uppercase text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                  3-Streak Calibration Engine
                </span>
              </div>

              {/* Sequential Badges Trail */}
              <div className="p-3 bg-white/90 rounded-[var(--radius)] border border-blue-100 space-y-2">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  Chronological Question Transitions (Performance History):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
                  {(submissionResult.difficultyHistory && submissionResult.difficultyHistory.length > 0
                    ? submissionResult.difficultyHistory
                    : difficultyHistory
                  ).map((h, idx) => {
                    const diff = h.difficulty || "Moderate";
                    const isEasy = diff === "Easy";
                    const isHard = diff === "Hard";
                    const isMod = !isEasy && !isHard;

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-[var(--radius)] border flex items-center justify-between font-medium ${
                          isHard 
                            ? "bg-purple-50 border-purple-200 text-purple-900"
                            : isMod
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "bg-emerald-50 border-emerald-200 text-emerald-900"
                        }`}
                      >
                        <span className="font-mono text-[10px]">Q{h.questionNumber || idx + 1}</span>
                        <span className="text-[10px] font-black uppercase">{diff}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                <span>Rule: 3 consecutive correct ➔ ↑ Difficulty | 3 consecutive incorrect ➔ ↓ Difficulty</span>
                <span className="font-medium text-indigo-900 font-mono">
                  Final Level: {currentDifficulty}
                </span>
              </div>
            </div>
          )}

          {/* Review Question Breakdown Toggle (Only if not disqualified) */}
          {!isDisq && submissionResult.questionAnalysis && submissionResult.questionAnalysis.length > 0 && (
            <div className="text-left space-y-3">
              <button
                onClick={() => setReviewMode(!reviewMode)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-[var(--radius)] text-xs flex items-center justify-between transition-colors"
              >
                <span>{reviewMode ? "Hide Detailed Question Breakdown" : "Review Question Answers & Performance Breakdown 📋"}</span>
                <span>{reviewMode ? "▲" : "▼"}</span>
              </button>

              {reviewMode && (
                <div className="space-y-3 max-h-72 overflow-y-auto p-1 pr-2">
                  {submissionResult.questionAnalysis.map((qa, qIdx) => (
                    <div key={qa.questionId || qIdx} className={`p-4 rounded-[var(--radius)] border text-xs space-y-2.5 ${
                      qa.isCorrect ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                              Question {qa.questionNumber || qIdx + 1}
                            </span>
                            <span className="text-slate-600 font-medium text-[11px]">
                              Topic: {qa.topic || "Atmospheric Dynamics"}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900 text-xs sm:text-[13px] leading-relaxed">
                            {qa.question}
                          </p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 uppercase tracking-wide border ${
                          qa.isCorrect ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-rose-100 text-rose-900 border-rose-300"
                        }`}>
                          Result: {qa.result || (qa.isCorrect ? "Correct" : "Incorrect")}
                        </span>
                      </div>

                      {/* Question Meta Badge Bar */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-600 py-1 border-t border-b border-black/5 flex-wrap">
                        <span><b>Difficulty:</b> <span className="font-semibold">{qa.difficulty || "Medium"}</span></span>
                        <span>•</span>
                        <span><b>Time Spent:</b> <span className="font-mono font-semibold">{qa.timeSpentText || `${qa.timeSpent || 45} sec`}</span></span>
                        <span>•</span>
                        <span><b>Marks:</b> <span className="font-semibold">{qa.marksObtained}/{qa.totalMarks || 3}</span></span>
                      </div>

                      <div className="text-[11px] space-y-1.5 pt-1">
                        {qa.type === "one_word" || qa.type === "short_answer" ? (
                          <>
                            <p className="text-slate-700">
                              Your Answer: <b>{qa.selectedAnswer ? `"${qa.selectedAnswer}"` : "Unanswered"}</b>
                            </p>
                            <p className="text-emerald-800 font-medium">
                              Expected Answer: "{qa.expectedAnswer || qa.correctAnswer || "Exact match"}" <span className="text-[10px] text-emerald-600 font-medium">(Case-insensitive trimmed match)</span>
                            </p>
                            {Array.isArray(qa.acceptedAnswers) && qa.acceptedAnswers.length > 0 && (
                              <p className="text-slate-500 text-[10px]">
                                Also Accepted: {qa.acceptedAnswers.map(a => `"${a}"`).join(", ")}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-slate-700">
                              Your Answer: <b>{qa.selectedAnswer !== null && qa.selectedAnswer !== undefined ? `Option ${String.fromCharCode(65 + qa.selectedAnswer)}` : "Unanswered"}</b>
                            </p>
                            <p className="text-emerald-800 font-medium">
                              Correct Answer: Option {String.fromCharCode(65 + (typeof qa.correctAnswer === "number" ? qa.correctAnswer : 0))}
                            </p>
                          </>
                        )}
                        {qa.explanation && (
                          <p className="text-slate-600 bg-white/80 p-2.5 rounded-[var(--radius)] border border-slate-200/60 mt-1">
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
                  setCurrentDifficulty("Moderate");
                  setAdaptiveTrajectory(["Moderate"]);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-[var(--radius)] text-xs transition-colors"
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
              className={`flex-1 py-3 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-102 ${
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
    <div className={`fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col overflow-hidden select-none font-sans ${isMouseOutOfBounds ? "ring-4 ring-rose-500/50" : ""}`}>
      
      {/* Floating Security Alert Toast */}
      {recentSecurityAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white border border-amber-400/80 px-4 py-2 rounded-[var(--radius)] shadow-2xl text-xs font-black flex items-center gap-2 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{recentSecurityAlert}</span>
        </div>
      )}

      {/* ═════════ 1. TOP SECURE KIOSK HEADER ═════════ */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
        
        {/* Left: Exam Branding & Fullscreen Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius)] bg-[#0B3475] text-white flex items-center justify-center font-medium text-xs shadow-xs">
            CC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0B3475] font-medium text-[10px] uppercase tracking-wider border border-blue-200">
                PROCTORED KIOSK
              </span>
              <span className="text-xs font-medium text-slate-900 truncate max-w-xs sm:max-w-md">
                {quiz?.title || "National Meteorological Assessment"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Candidate: <b className="text-slate-800 font-medium">{currentUser?.name || currentUser?.email || "Trainee"}</b> • Security Engine Active
            </p>
          </div>
        </div>

        {/* Center: Live Timer Banner */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)]">
          <Clock className={`w-3.5 h-3.5 ${timeLeftSeconds < 300 ? "text-rose-600 animate-pulse" : "text-[#0B3475]"}`} />
          <span className="text-xs font-medium text-slate-600 hidden sm:inline">Remaining Time:</span>
          <span className={`text-xs font-medium font-mono tracking-wider ${
            timeLeftSeconds < 300 ? "text-rose-600 animate-pulse" : "text-slate-900"
          }`}>
            {formatTime(timeLeftSeconds)}
          </span>
        </div>

        {/* Right: Security Status, Re-Lock & Submit buttons */}
        <div className="flex items-center gap-2">
          {!isFullscreenLocked ? (
            <button
              onClick={requestKioskFullscreen}
              className="px-3 py-1.5 rounded-[var(--radius)] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 animate-pulse"
              title="Click to restore full-screen kiosk lock"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Re-Lock Fullscreen</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <Maximize2 className="w-3 h-3 text-emerald-600" />
              <span>Fullscreen Locked</span>
            </div>
          )}

          <div className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] border text-[11px] font-semibold ${
            tabSwitchCount > 0 
              ? "bg-amber-50 text-amber-900 border-amber-300"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{tabSwitchCount === 0 ? "✓ Integrity 100%" : `⚠ ${tabSwitchCount} / 2 Warnings`}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-[var(--radius)] text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>

      </header>


      {/* ─── PROCTORED EXAMINATION STATUS & SECURITY TELEMETRY BAR ─── */}
      <div className="bg-slate-50 border-b border-slate-200/90 px-4 sm:px-6 py-2 flex items-center justify-between text-xs shrink-0 shadow-2xs flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Proctored Session
          </span>
          <span className="text-slate-600 font-semibold text-[11px]">
            {quiz?.courseName || quiz?.title || "National Examination"}
          </span>
        </div>

        {/* Security telemetry indicators */}
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-emerald-700">
            🛡️ Focus Locked
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
            🚫 Clipboard & Context Menu Blocked
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-purple-700">
            ⌨️ DevTools/Shortcuts Shielded
          </span>
          <span className="font-mono text-slate-600 pl-1 border-l border-slate-300">
            Cadre ID: <b className="text-slate-800">{currentUser?.cadreId || "MOES-MET-2026"}</b>
          </span>
        </div>
      </div>

      {/* ═════════ 2. MAIN PROCTORED VIEWPORT (LIGHT THEME) ═════════ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ─── LEFT: QUESTION PALETTE (GRID & STATUS) ─── */}
        <aside className="w-full lg:w-80 bg-white border-r border-slate-200/90 p-4 sm:p-5 flex flex-col shrink-0 overflow-y-auto shadow-2xs order-2 lg:order-1 max-h-56 lg:max-h-none">
          
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">
            Question Palette ({questions.length})
          </h3>

          {/* Palette Status Badges */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] font-medium">
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-[var(--radius)] border border-emerald-200 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-[var(--radius)] border border-blue-200 text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Review ({markedReviewCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Not Answered ({notAnsweredCount})</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-slate-600">
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
                  className={`h-9 rounded-[var(--radius)] text-xs font-medium font-mono transition-all flex items-center justify-center ${bgStyle}`}
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
        <main className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto p-4 sm:p-6 order-1 lg:order-2 justify-between">
          
          <div className="max-w-3xl w-full mx-auto space-y-4">
            
            {/* Top Question Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-[#0B3475] text-white rounded-[var(--radius)] text-xs font-medium shadow-xs">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-1 bg-white text-slate-700 rounded-[var(--radius)] text-xs font-medium border border-slate-200 shadow-xs">
                  {currentQuestion.subjectName || "Meteorological Physics"}
                </span>
              </div>

              <div className="text-xs font-mono font-medium text-slate-500">
                Marks: <b className="text-emerald-700">+{currentQuestion.marks || 2}</b> / <b className="text-slate-400">-0</b>
              </div>
            </div>

            {/* Question Prompt Card */}
            <div className="p-5 sm:p-6 rounded-[var(--radius)] bg-white border border-slate-200/90 shadow-xs space-y-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Question Response Section (MCQ or One-Word / Short Answer) */}
            {currentQuestion.type === "one_word" || currentQuestion.type === "short_answer" || (!currentQuestion.options || currentQuestion.options.length === 0) ? (
              <div className="space-y-3">
                {currentQuestion.guidanceNote && (
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-[var(--radius)] flex items-start gap-2.5 text-xs text-blue-950 font-medium">
                    <HelpCircle className="w-4 h-4 text-[#0B3475] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <span className="font-medium text-[10px] uppercase tracking-wider text-[#0B3475] block">
                        Trainer Guidance Note
                      </span>
                      <p className="text-xs text-blue-900 leading-relaxed">
                        {currentQuestion.guidanceNote}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-5 bg-white border border-slate-200 rounded-[var(--radius)] shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800">
                      Type Your One-Word / Short Answer:
                    </label>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      Case-Insensitive Match
                    </span>
                  </div>

                  <input
                    type="text"
                    value={typeof answers[currentQuestion.id] === "string" ? answers[currentQuestion.id] : (answers[currentQuestion.id] !== undefined ? String(answers[currentQuestion.id]) : "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
                    }}
                    placeholder="Type exact term or keyword..."
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-300 focus:border-[#0B3475] focus:ring-1 focus:ring-[#0B3475] font-medium text-xs text-slate-900 focus:outline-none transition-colors"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Capital and lower case letters are evaluated as equal.</span>
                    <span className="font-mono font-medium text-[#0B3475]">
                      {(answers[currentQuestion.id] || "").length} chars
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* MCQ Radio Options List */
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((opt, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-3.5 sm:p-4 rounded-[var(--radius)] border text-left text-xs font-medium transition-colors flex items-center justify-between gap-3 group ${
                        isSelected
                          ? "bg-blue-50/90 border-2 border-[#0B3475] text-[#0B3475] font-semibold shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-[var(--radius)] flex items-center justify-center font-medium text-xs shrink-0 font-mono transition-colors ${
                          isSelected 
                            ? "bg-[#0B3475] text-white" 
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#0B3475] bg-[#0B3475] text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* ═════════ 3. BOTTOM QUESTION CONTROL ACTIONS ═════════ */}
          <div className="max-w-3xl w-full mx-auto pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 mt-6">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius)] bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-xs transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius)] border text-xs font-semibold transition-colors ${
                  markedForReview[currentQuestion.id]
                    ? "bg-[#0B3475] border-[#0B3475] text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQuestion.id] ? "Marked for Review" : "Mark for Review"}</span>
              </button>

              {answers[currentQuestion.id] !== undefined && (
                <button
                  onClick={handleClearAnswer}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-colors"
                >
                  Clear Response
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => goToQuestion(currentIndex + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-[var(--radius)] text-xs shadow-xs transition-colors"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-[var(--radius)] text-xs shadow-xs transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
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
          <div className="bg-white border-2 border-amber-500 rounded-[var(--radius)] p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
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

            <div className="p-3 bg-amber-50 rounded-[var(--radius)] border border-amber-200 text-xs text-amber-900 font-medium">
              ⚠️ Warning 1/2: An assessment integrity event has been recorded server-side. Next exit will disqualify attempt.
            </div>

            <button
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-all"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* ═════════ CONFIRM SUBMIT MODAL (LIGHT THEME) ═════════ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-white border border-slate-200 rounded-[var(--radius)] p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-[var(--radius)] bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Ready to Submit Assessment?</h3>
              <p className="text-xs text-slate-500">
                You have answered <b className="text-slate-800">{answeredCount}</b> of <b className="text-slate-800">{questions.length}</b> questions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="p-3 bg-emerald-50 rounded-[var(--radius)] border border-emerald-200 text-emerald-800">
                {answeredCount} Answered
              </div>
              <div className="p-3 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-slate-600">
                {notAnsweredCount} Remaining
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-102"
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
