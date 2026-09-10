import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  Download, 
  Lock, 
  Unlock,
  CheckCircle2, 
  Star, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Clock, 
  Award, 
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  RotateCcw,
  Share2,
  MessageSquare,
  ShieldCheck,
  Building2,
  ChevronLeft,
  TrendingUp,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Columns,
  StickyNote,
  Save,
  Trash2,
  Plus,
  Copy,
  Check,
  BrainCircuit,
  ExternalLink,
  HelpCircle,
  Video,
  FileCode,
  Tag,
  Target,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Sliders,
  ToggleLeft,
  ToggleRight,
  FastForward,
  CheckSquare,
  Square,
  X
} from "lucide-react";
import { api } from "../../services/api";

const DEFAULT_SUBJECTS = [
  {
    id: "sub_dyn_1",
    name: "Subject 1: Atmospheric Dynamics & Mathematical Modeling",
    modules: [
      {
        id: "mod_1_1",
        title: "Module 1.1: Primitive Equation Systems in NWP",
        duration: "2h 30m",
        materials: [
          {
            id: "mat_1_1_1",
            title: "Video 1: Recorded Masterclass — Sigma Coordinates & Lower Boundary Conditions",
            type: "video",
            duration: "45 mins",
            durationSeconds: 2700,
            allowDownload: false,
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 15, 2025",
            prerequisiteConfig: {
              enabled: false,
              condition: "ALL",
              requiredWatchThreshold: 80,
              prerequisites: []
            }
          },
          {
            id: "mat_1_1_quiz1",
            title: "Video Quiz 1: Primitive Equations & Vertical Coordinate Advection Check",
            type: "quiz",
            duration: "15 mins",
            totalMarks: 10,
            passPercentage: 50,
            allowDownload: false,
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 15, 2025",
            prerequisiteConfig: {
              enabled: true,
              condition: "ALL",
              requiredWatchThreshold: 80,
              prerequisites: [
                {
                  id: "mat_1_1_1",
                  title: "Video 1: Recorded Masterclass — Sigma Coordinates & Lower Boundary Conditions",
                  type: "video",
                  requiredWatchPct: 80
                }
              ]
            },
            questions: [
              {
                id: "vq_1_1",
                question: "In operational NWP terrain-following sigma coordinates σ = (p - pt)/(ps - pt), what value does σ assume at the Earth's surface?",
                options: ["σ = 1.0", "σ = 0.0", "σ = 0.5", "σ = ∞"],
                correctAnswer: 0,
                marks: 5,
                explanation: "At the surface p = ps, so σ = (ps - pt)/(ps - pt) = 1.0 identically."
              },
              {
                id: "vq_1_2",
                question: "Which term in the momentum equation represents geopotential gradient forcing along constant sigma surfaces?",
                options: ["-∇Φ - σ α ∇p_s", "f(k × v)", "∂p_s/∂t", "μ ∇²v"],
                correctAnswer: 0,
                marks: 5,
                explanation: "The horizontal pressure gradient splits into geopotential gradient and surface pressure slope terms."
              }
            ]
          },
          {
            id: "mat_1_1_2",
            title: "Video 2: Recorded Masterclass — Boundary Layer Closures & WRF Eddy Physics",
            type: "video",
            duration: "50 mins",
            durationSeconds: 3000,
            allowDownload: false,
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 16, 2025",
            prerequisiteConfig: {
              enabled: true,
              condition: "ALL",
              requiredWatchThreshold: 80,
              prerequisites: [
                {
                  id: "mat_1_1_quiz1",
                  title: "Video Quiz 1: Primitive Equations & Vertical Coordinate Advection Check",
                  type: "quiz",
                  requiredPassScore: 50
                }
              ]
            }
          },
          {
            id: "mat_1_1_quiz2",
            title: "Video Quiz 2: Boundary Layer Closures & CFL Numerical Stability Check",
            type: "quiz",
            duration: "15 mins",
            totalMarks: 10,
            passPercentage: 50,
            allowDownload: false,
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 16, 2025",
            prerequisiteConfig: {
              enabled: true,
              condition: "ALL",
              requiredWatchThreshold: 80,
              prerequisites: [
                {
                  id: "mat_1_1_2",
                  title: "Video 2: Recorded Masterclass — Boundary Layer Closures & WRF Eddy Physics",
                  type: "video",
                  requiredWatchPct: 80
                }
              ]
            },
            questions: [
              {
                id: "vq_2_1",
                question: "What is the primary physical parameter modeled by the Yonsei University (YSU) PBL scheme?",
                options: ["Non-local turbulent eddy mixing with explicit entrainment", "Hydrostatic barotropic filtering", "Direct solar beam attenuation", "CFL grid dispersion"],
                correctAnswer: 0,
                marks: 5,
                explanation: "YSU is a non-local K-profile scheme with entrainment at the boundary layer top."
              },
              {
                id: "vq_2_2",
                question: "To prevent numerical dispersion explosion in explicit advection, what must the Courant number CFL be?",
                options: ["CFL ≤ 1.0", "CFL ≥ 2.0", "CFL = 5.0", "CFL < 0"],
                correctAnswer: 0,
                marks: 5,
                explanation: "The Courant-Friedrichs-Lewy condition dictates CFL ≤ 1.0 for explicit stability."
              }
            ]
          },
          {
            id: "mat_1_1_3",
            title: "Study Material 3: Advanced Technical Handbook — Planetary Boundary Layer Parameterization Guide",
            type: "pdf",
            size: "4.2 MB",
            allowDownload: true,
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 18, 2025",
            prerequisiteConfig: {
              enabled: true,
              condition: "ALL", // ALL (AND): Quiz 1 AND Quiz 2 must be passed
              requiredWatchThreshold: 80,
              prerequisites: [
                {
                  id: "mat_1_1_quiz1",
                  title: "Video Quiz 1: Primitive Equations & Vertical Coordinate Advection Check",
                  type: "quiz",
                  requiredPassScore: 50
                },
                {
                  id: "mat_1_1_quiz2",
                  title: "Video Quiz 2: Boundary Layer Closures & CFL Numerical Stability Check",
                  type: "quiz",
                  requiredPassScore: 50
                }
              ]
            }
          }
        ]
      }
    ]
  }
];

export const CourseLearningStudio = ({ course, currentUser, onBack, onEnrollSuccess }) => {
  const subjects = (course?.subjects && course.subjects.length > 0) ? course.subjects : DEFAULT_SUBJECTS;
  
  const initialMaterial = subjects[0]?.modules?.[0]?.materials?.[0] || {
    id: "default_mat",
    title: "Video 1: Recorded Masterclass — Sigma Coordinates & Lower Boundary Conditions",
    type: "video",
    duration: "45 mins",
    durationSeconds: 2700,
    allowDownload: false,
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    uploadedBy: course?.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
    uploadedAt: "Uploaded on: Jan 15, 2025"
  };

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [selectedModuleId, setSelectedModuleId] = useState(subjects[0]?.modules?.[0]?.id || "");
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);

  // ─── CONTROLLED LEARNING PATH & UNLOCK CONSTRAINTS STATE ───
  // Default is ON (Strict Lock Progression)
  const [isLockPathEnabled, setIsLockPathEnabled] = useState(course?.controlledLearningPathEnabled !== false);
  const [videoWatchProgress, setVideoWatchProgress] = useState({
    mat_1_1_1: { watchedPercentage: 85, isThresholdMet: true, watchedSeconds: 2300 }
  });
  const [quizProgress, setQuizProgress] = useState({
    mat_1_1_quiz1: { completed: true, passed: true, score: 10, totalMarks: 10, percentage: 100 },
    mat_1_1_quiz2: { completed: false, passed: false, score: 0, totalMarks: 10, percentage: 0 }
  });
  const [inStudioQuizAnswers, setInStudioQuizAnswers] = useState({});
  const [inStudioQuizResult, setInStudioQuizResult] = useState(null);
  const [showTrainerConfigModal, setShowTrainerConfigModal] = useState(false);
  const [editingPrereqMaterial, setEditingPrereqMaterial] = useState(null);
  const [prereqConfigMap, setPrereqConfigMap] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // View Layout Modes: "standard" | "split" | "fullscreen"
  const [viewMode, setViewMode] = useState("standard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("notes"); // "notes" | "ai_summary" | "practice_quiz"

  const [completedMaterials, setCompletedMaterials] = useState({ 
    mat_1_1_1: true,
    mat_1_1_quiz1: true
  });
  const [currentSlidePage, setCurrentSlidePage] = useState(1);
  const [expandedSubjects, setExpandedSubjects] = useState({ [subjects[0]?.id]: true });
  const [markingComplete, setMarkingComplete] = useState(false);

  // ─── Module & Material Specific Lecture Notes State ───
  const [lectureNote, setLectureNote] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState("");

  // ─── AI PDF / PPT / Video Summary Generation State ───
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summarySource, setSummarySource] = useState("");

  // ─── AI Practice Quiz & Pattern Cloner State ───
  const [practiceMode, setPracticeMode] = useState("ai_topic"); // "ai_topic" | "pattern_clone"
  const [selectedQuizSubject, setSelectedQuizSubject] = useState(subjects[0]?.name || "Atmospheric Dynamics");
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [sampleQuestionText, setSampleQuestionText] = useState(
    "In Numerical Weather Prediction, calculate the Courant-Friedrichs-Lewy (CFL) stability criterion given grid resolution dx = 5 km and maximum wind speed u = 50 m/s."
  );

  const showNotification = (msg, type = "success") => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ─── UNLOCK CONSTRAINTS EVALUATOR ───
  const evaluateMaterialUnlock = useCallback((mat) => {
    if (!mat) return { isLocked: false, unmet: [], met: [], condition: "OPEN", reason: "No material" };
    
    // Master ON/OFF Switch Check
    if (!isLockPathEnabled) {
      return { isLocked: false, unmet: [], met: [], condition: "OPEN", reason: "Open Exploration Mode Enabled" };
    }

    const config = prereqConfigMap[mat.id] || mat.prerequisiteConfig;
    if (!config || !config.enabled || !config.prerequisites || config.prerequisites.length === 0) {
      return { isLocked: false, unmet: [], met: [], condition: "NONE", reason: "No prerequisites configured" };
    }

    const condition = config.condition || "ALL"; // "ALL" (AND) | "ANY" (OR)
    const requiredWatchThreshold = config.requiredWatchThreshold || 80;

    const evaluationResults = config.prerequisites.map(prereq => {
      let isMet = false;
      let statusText = "";

      if (prereq.type === "video") {
        const prog = videoWatchProgress[prereq.id] || { watchedPercentage: completedMaterials[prereq.id] ? 100 : 0 };
        const pct = prog.watchedPercentage || (completedMaterials[prereq.id] ? 100 : 0);
        const reqPct = prereq.requiredWatchPct || requiredWatchThreshold || 80;
        isMet = pct >= reqPct || !!completedMaterials[prereq.id];
        statusText = `${pct}% Watched (${isMet ? "✓ Met" : `Requires ≥ ${reqPct}%`})`;
      } else if (prereq.type === "quiz") {
        const qp = quizProgress[prereq.id] || { completed: !!completedMaterials[prereq.id], passed: !!completedMaterials[prereq.id] };
        isMet = (qp.completed && qp.passed) || !!completedMaterials[prereq.id];
        statusText = isMet ? `Passed (${qp.percentage || 100}%) ✓` : `Pending Assessment Passing Grade (Min 50%) ✕`;
      } else {
        isMet = !!completedMaterials[prereq.id];
        statusText = isMet ? "Completed ✓" : "Pending Completion ✕";
      }

      return {
        ...prereq,
        isMet,
        statusText
      };
    });

    const unmet = evaluationResults.filter(r => !r.isMet);
    const met = evaluationResults.filter(r => r.isMet);

    let isLocked = false;
    if (condition === "ALL") {
      isLocked = unmet.length > 0;
    } else {
      // "ANY" condition: at least 1 must be met
      isLocked = met.length === 0;
    }

    return {
      isLocked,
      condition,
      allPrereqs: evaluationResults,
      unmet,
      met,
      requiredWatchThreshold
    };
  }, [isLockPathEnabled, prereqConfigMap, videoWatchProgress, quizProgress, completedMaterials]);

  // Find material by ID anywhere in the curriculum
  const findMaterialById = (matId) => {
    for (const sub of subjects) {
      for (const mod of (sub.modules || [])) {
        for (const mat of (mod.materials || [])) {
          if (mat.id === matId) return { subject: sub, module: mod, material: mat };
        }
      }
    }
    return null;
  };

  // ─── VIDEO WATCH THRESHOLD PROGRESS HANDLER ───
  const handleUpdateVideoWatchPercent = (matId, newPercent) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newPercent)));
    const isMet = clamped >= 80;

    setVideoWatchProgress(prev => ({
      ...prev,
      [matId]: {
        watchedPercentage: clamped,
        isThresholdMet: isMet
      }
    }));

    if (isMet) {
      setCompletedMaterials(prev => ({ ...prev, [matId]: true }));
      showNotification(`✓ 80% Watch Threshold Met! "${selectedMaterial?.title?.substring(0, 32)}..." completed. Downstream learning resources unlocked!`);
    } else {
      showNotification(`Watch progress updated to ${clamped}%. Watch at least 80% to unlock downstream prerequisites.`);
    }
  };

  // ─── IN-STUDIO QUIZ SUBMIT HANDLER ───
  const handleInStudioQuizSubmit = (quizMat) => {
    const questions = quizMat.questions || [];
    let score = 0;
    let totalMarks = 0;

    questions.forEach((q, idx) => {
      const qMarks = Number(q.marks) || 5;
      totalMarks += qMarks;
      if (inStudioQuizAnswers[idx] === q.correctAnswer) {
        score += qMarks;
      }
    });

    const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const isPassed = pct >= (quizMat.passPercentage || 50);

    const resultObj = {
      score,
      totalMarks,
      percentage: pct,
      isPassed
    };
    setInStudioQuizResult(resultObj);

    setQuizProgress(prev => ({
      ...prev,
      [quizMat.id]: {
        completed: true,
        passed: isPassed,
        score,
        totalMarks,
        percentage: pct
      }
    }));

    if (isPassed) {
      setCompletedMaterials(prev => ({ ...prev, [quizMat.id]: true }));
      showNotification(`🎉 Assessment Passed with ${pct}% score! Prerequisite satisfied & downstream content unlocked.`);
    } else {
      showNotification(`Assessment completed with ${pct}%. Minimum 50% required to satisfy prerequisite unlock. Please review and retry.`, "error");
    }
  };

  // Storage key helper
  const getNoteStorageKey = (matId) => {
    const userId = currentUser?.id || "guest_officer";
    const cId = course?.id || "course_gen";
    return `moes_notes_${userId}_${cId}_${matId}`;
  };

  // Sync state if course changes
  useEffect(() => {
    if (course?.subjects && course.subjects.length > 0) {
      const firstSub = course.subjects[0];
      const firstMod = firstSub?.modules?.[0];
      const firstMat = firstMod?.materials?.[0];
      setSelectedSubjectId(firstSub?.id || "");
      setSelectedModuleId(firstMod?.id || "");
      setSelectedQuizSubject(firstSub?.name || "");
      if (firstMat) {
        setSelectedMaterial(firstMat);
        setCompletedMaterials(prev => ({ ...prev, [firstMat.id]: true }));
      }
      setExpandedSubjects({ [firstSub?.id]: true });
    }
  }, [course?.id]);

  // Load Note & AI Summary on Material Switch
  useEffect(() => {
    if (!selectedMaterial?.id) return;
    const key = getNoteStorageKey(selectedMaterial.id);
    const savedNote = localStorage.getItem(key);
    if (savedNote) {
      setLectureNote(savedNote);
      setLastSavedTime("Saved locally");
    } else {
      setLectureNote("");
      setLastSavedTime("");
    }

    // Reset quiz attempt state for the selected material
    setInStudioQuizAnswers({});
    setInStudioQuizResult(null);

    // Check cached AI summary
    const summaryKey = `moes_ai_sum_${course?.id || "c"}_${selectedMaterial.id}`;
    const cachedSummary = localStorage.getItem(summaryKey);
    if (cachedSummary) {
      try {
        const parsed = JSON.parse(cachedSummary);
        setAiSummary(parsed.summary);
        setSummarySource(parsed.source || "Cached AI Summary");
      } catch (e) {
        setAiSummary(null);
      }
    } else {
      setAiSummary(null);
    }
  }, [selectedMaterial?.id, course?.id]);

  // Save Note to localStorage
  const handleSaveNote = () => {
    if (!selectedMaterial?.id) return;
    const key = getNoteStorageKey(selectedMaterial.id);
    localStorage.setItem(key, lectureNote);
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLastSavedTime(`Saved at ${timeStr}`);
  };

  // Auto-save note on pause typing (1 second debounce)
  useEffect(() => {
    if (!selectedMaterial?.id || !lectureNote) return;
    const timer = setTimeout(() => {
      const key = getNoteStorageKey(selectedMaterial.id);
      localStorage.setItem(key, lectureNote);
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSavedTime(`Auto-saved at ${timeStr}`);
    }, 1200);
    return () => clearTimeout(timer);
  }, [lectureNote, selectedMaterial?.id]);

  // Download Note as Markdown
  const handleDownloadNote = () => {
    const filename = `${course?.code || "COURSE"}_${selectedMaterial?.title?.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.md`;
    const textContent = `# Lecture Notes: ${selectedMaterial?.title}\nCourse: ${course?.title}\nOfficer: ${currentUser?.name || "Trainee"}\nDate: ${new Date().toLocaleDateString()}\n\n---\n\n${lectureNote}\n\n---\n*MoES Capacity Connect Digital Portal*`;
    const element = document.createElement("a");
    const file = new Blob([textContent], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Generate AI Summary for PDF / PPT / Video
  const handleGenerateAiSummary = async () => {
    if (generatingSummary) return;
    setGeneratingSummary(true);
    try {
      const payload = {
        materialTitle: selectedMaterial?.title,
        materialType: selectedMaterial?.type,
        courseTitle: course?.title,
        customNotes: lectureNote
      };
      const res = await api.generateMaterialSummary(payload);
      if (res.success && res.summary) {
        setAiSummary(res.summary);
        setSummarySource(res.source || "Gemini 1.5 Flash");
        // Cache locally
        const summaryKey = `moes_ai_sum_${course?.id || "c"}_${selectedMaterial.id}`;
        localStorage.setItem(summaryKey, JSON.stringify({ summary: res.summary, source: res.source }));
        setRightPanelTab("ai_summary");
        if (viewMode === "standard") setViewMode("split");
      }
    } catch (err) {
      console.error("AI Summary generation failed:", err);
      alert("AI Summary generation failed: " + err.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Insert AI Summary into Notes
  const handleInsertSummaryIntoNotes = () => {
    if (!aiSummary) return;
    const summaryMd = `\n\n### 🤖 AI Key Summary & Takeaways (${new Date().toLocaleDateString()}):\n**Executive Summary:** ${aiSummary.executiveSummary}\n\n**Key Takeaways:**\n${(aiSummary.keyTakeaways || []).map(k => `• ${k}`).join("\n")}\n\n**Governing Equations / Concepts:**\n${(aiSummary.coreFormulasAndConcepts || []).map(f => `- \`${f}\``).join("\n")}\n\n**Operational Application:** ${aiSummary.operationalApplications}\n`;
    
    setLectureNote(prev => (prev ? prev + summaryMd : summaryMd.trim()));
    setRightPanelTab("notes");
  };

  // ─── AI Practice Quiz Generation (Topic Based) ───
  const handleGeneratePracticeQuiz = async () => {
    if (generatingQuiz) return;
    setGeneratingQuiz(true);
    setUserAnswers({});
    setQuizFinished(false);
    try {
      const payload = {
        topic: `${selectedQuizSubject} - ${selectedMaterial?.title || ""}`,
        difficulty: quizDifficulty,
        count: questionCount,
        courseName: course?.title
      };
      const res = await api.generateAiQuestions(payload);
      if (res.success && res.generatedQuestions) {
        setPracticeQuestions(res.generatedQuestions);
        setRightPanelTab("practice_quiz");
        if (viewMode === "standard") setViewMode("split");
      }
    } catch (err) {
      console.error("Practice Quiz generation failed:", err);
      alert("Practice Quiz synthesis failed: " + err.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // ─── AI Pattern Cloner Generation ───
  const handleGeneratePatternQuiz = async () => {
    if (generatingQuiz || !sampleQuestionText.trim()) return;
    setGeneratingQuiz(true);
    setUserAnswers({});
    setQuizFinished(false);
    try {
      const payload = {
        sampleQuestion: sampleQuestionText,
        topic: selectedQuizSubject,
        difficulty: quizDifficulty,
        count: questionCount
      };
      const res = await api.generatePatternQuestionsWithAI(payload);
      if (res.success && res.generatedQuestions) {
        setPracticeQuestions(res.generatedQuestions);
        setRightPanelTab("practice_quiz");
        if (viewMode === "standard") setViewMode("split");
      }
    } catch (err) {
      console.error("Pattern cloning failed:", err);
      alert("Pattern cloning failed: " + err.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    practiceQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: practiceQuestions.length,
      percentage: practiceQuestions.length > 0 ? Math.round((correct / practiceQuestions.length) * 100) : 0
    };
  };

  // Load progress from server
  useEffect(() => {
    if (!currentUser?.id) return;
    api.getUserProgress(currentUser.id).then(res => {
      if (res.success && res.progress) {
        const completedMap = {};
        Object.entries(res.progress).forEach(([moduleId, info]) => {
          if (info.completed) {
            subjects.forEach(s => s.modules?.forEach(m => {
              if (m.id === moduleId) m.materials?.forEach(mat => {
                completedMap[mat.id] = true;
              });
            }));
          }
        });
        setCompletedMaterials(prev => ({ ...prev, ...completedMap }));
      }
    }).catch(() => {});
  }, [currentUser?.id]);

  const handleMarkComplete = async () => {
    if (!currentUser?.id || markingComplete) return;
    setMarkingComplete(true);
    try {
      await api.markModuleComplete(selectedModuleId, currentUser.id);
      setCompletedMaterials(prev => ({ ...prev, [selectedMaterial.id]: true }));
      showNotification(`✓ "${selectedMaterial.title.substring(0, 30)}..." marked as complete.`);
    } catch (err) {
      console.error("Mark complete failed:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const toggleSubjectExpand = (subId) => {
    setExpandedSubjects(prev => ({ ...prev, [subId]: !prev[subId] }));
  };

  const handleSelectMaterial = (subId, modId, mat) => {
    setSelectedSubjectId(subId);
    setSelectedModuleId(modId);
    setSelectedMaterial(mat);
    setCurrentSlidePage(1);
  };

  // Jump to specific prerequisite material
  const handleJumpToPrerequisite = (prereqId) => {
    const found = findMaterialById(prereqId);
    if (found) {
      setSelectedSubjectId(found.subject.id);
      setSelectedModuleId(found.module.id);
      setSelectedMaterial(found.material);
      setExpandedSubjects(prev => ({ ...prev, [found.subject.id]: true }));
      showNotification(`Navigated to prerequisite: "${found.material.title.substring(0, 35)}..."`);
    } else {
      showNotification("Prerequisite material not found in curriculum.", "error");
    }
  };

  // Calculate total materials count and progress
  let totalMaterials = 0;
  subjects.forEach(s => s.modules?.forEach(m => totalMaterials += (m.materials?.length || 0)));
  const completedCount = Object.keys(completedMaterials).length;
  const progressPct = totalMaterials > 0 ? Math.min(Math.round((completedCount / totalMaterials) * 100), 100) : 50;

  // Evaluate selected material lock status
  const currentUnlockStatus = evaluateMaterialUnlock(selectedMaterial);

  // Current Video Watch Info
  const currentVideoProgress = selectedMaterial?.type === "video" 
    ? (videoWatchProgress[selectedMaterial.id] || { watchedPercentage: completedMaterials[selectedMaterial.id] ? 100 : 0, isThresholdMet: !!completedMaterials[selectedMaterial.id] })
    : null;

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden select-none font-sans relative">
      
      {/* ─── TOAST NOTIFICATION CONTAINER ─── */}
      {toastMessage && (
        <div className={`fixed top-4 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-3 duration-300 max-w-md ${
          toastMessage.type === "error" 
            ? "bg-rose-900/95 text-white border-rose-500" 
            : "bg-slate-900/95 text-white border-blue-500"
        }`}>
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <p className="text-xs font-semibold leading-relaxed">{toastMessage.message}</p>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/10 rounded-lg ml-auto">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* ═════════ RESPONSIVE STUDIO CONTROL HEADER ═════════ */}
      <header className="min-h-[58px] py-2 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 shrink-0 shadow-sm z-30">
        
        {/* Left Section: Back, Collapse Sidebar & Course Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Exit Studio</span>
          </button>

          {/* Toggle Sidebar Collapse */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Show Curriculum Navigator" : "Hide Curriculum Navigator"}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Course Code & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white shrink-0 hidden xs:inline-block">
              {course.code || "NWP-401"}
            </span>
            <h1 className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-md">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Right Section: Master Lock Path Toggle, Progress, View Modes, Tools */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end ml-auto">
          
          {/* ─── TRAINER MASTER CONTROLLED LEARNING PATH ON/OFF TOGGLE ─── */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => {
                const nextState = !isLockPathEnabled;
                setIsLockPathEnabled(nextState);
                showNotification(
                  nextState 
                    ? "🔒 Controlled Learning Path Activated: Prerequisites and 80% watch threshold strictly enforced." 
                    : "🔓 Open Exploration Mode Activated: All prerequisite lock constraints bypassed for trainees."
                );
              }}
              title="Toggle Controlled Learning Progression Path on/off"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isLockPathEnabled 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-amber-500 text-white shadow-sm"
              }`}
            >
              {isLockPathEnabled ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Controlled Path:</span>
                  <span className="uppercase tracking-wider text-[10px] font-black bg-indigo-800/60 px-1.5 py-0.5 rounded">ON (Strict)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Path Mode:</span>
                  <span className="uppercase tracking-wider text-[10px] font-black bg-amber-700/60 px-1.5 py-0.5 rounded">OFF (Open)</span>
                </>
              )}
            </button>

            {/* Trainer Prereq Config Button */}
            <button
              onClick={() => {
                setEditingPrereqMaterial(selectedMaterial);
                setShowTrainerConfigModal(true);
              }}
              title="Configure Prerequisite Dependencies for this resource"
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 border border-slate-200/60 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>

          {/* Progress Bar (Visible on large screens) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs shrink-0">
            <span className="text-slate-500 text-[11px] font-medium">Progress:</span>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            <span className="font-extrabold text-emerald-700 text-[11px]">{progressPct}%</span>
          </div>

          {/* View Mode Selector Group */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
            {/* 1. Standard View */}
            <button
              onClick={() => {
                setViewMode("standard");
                setIsSidebarCollapsed(false);
              }}
              title="Standard View (Navigator + Viewer)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "standard"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Standard</span>
            </button>

            {/* 2. Split View (Notes & Tools) */}
            <button
              onClick={() => {
                setViewMode("split");
                setIsSidebarCollapsed(true);
              }}
              title="Split View (Stage + Notes / AI / Quiz)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "split"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split & Tools</span>
            </button>

            {/* 3. Full Screen Mode */}
            <button
              onClick={() => {
                if (viewMode === "fullscreen") {
                  setViewMode("standard");
                  setIsSidebarCollapsed(false);
                } else {
                  setViewMode("fullscreen");
                  setIsSidebarCollapsed(true);
                }
              }}
              title={viewMode === "fullscreen" ? "Exit Fullscreen Stage" : "Expanded Fullscreen Stage"}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "fullscreen"
                  ? "bg-blue-600 text-white font-black shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {viewMode === "fullscreen" ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{viewMode === "fullscreen" ? "Full Stage" : "Full"}</span>
            </button>
          </div>

          {/* Quick Action 1: AI Summary Button */}
          <button
            onClick={() => {
              setRightPanelTab("ai_summary");
              if (viewMode !== "split") {
                setViewMode("split");
                setIsSidebarCollapsed(true);
              }
              if (!aiSummary) handleGenerateAiSummary();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>AI Summary</span>
          </button>

          {/* Quick Action 2: Practice Quiz (AI) Button */}
          <button
            onClick={() => {
              setRightPanelTab("practice_quiz");
              if (viewMode !== "split") {
                setViewMode("split");
                setIsSidebarCollapsed(true);
              }
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Target className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Practice Quiz</span>
          </button>

        </div>
      </header>

      {/* ═════════ MASTER ON/OFF STATUS BANNER (When Bypassed) ═════════ */}
      {!isLockPathEnabled && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0 shadow-inner">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              <b>Trainer Master Bypass Active:</b> Controlled Learning Path is turned <b>OFF</b>. All video watch thresholds and assessment prerequisites are currently unlocked for open trainee exploration.
            </span>
          </div>
          <button
            onClick={() => setIsLockPathEnabled(true)}
            className="px-2.5 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm shrink-0"
          >
            Turn ON Strict Lock
          </button>
        </div>
      )}

      {/* ═════════ MAIN STUDIO VIEWPORT ═════════ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ─── LEFT: CURRICULUM NAVIGATOR WITH LOCK ICONS ─── */}
        {!isSidebarCollapsed && (
          <aside className="w-full md:w-76 lg:w-84 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto shadow-sm z-20 transition-all duration-300 max-h-48 md:max-h-none">
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Curriculum Pathway</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {subjects.length} Subjects • {totalMaterials} Interactive Modules
                </p>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 hidden md:block"
                title="Collapse Navigator"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Subjects Accordion */}
            <div className="p-3 space-y-3">
              {subjects.map((subject, sIdx) => {
                const isExpanded = !!expandedSubjects[subject.id];
                return (
                  <div key={subject.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    {/* Subject Title Bar */}
                    <button
                      onClick={() => toggleSubjectExpand(subject.id)}
                      className="w-full p-3 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                          S{sIdx + 1}
                        </div>
                        <span className="font-bold text-slate-800 text-xs line-clamp-1">{subject.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {/* Modules & Materials list */}
                    {isExpanded && (
                      <div className="p-2 space-y-2 bg-white">
                        {subject.modules && subject.modules.map(mod => (
                          <div key={mod.id} className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between px-1 mb-1.5">
                              <span className="font-bold text-slate-700 text-[11px]">{mod.title}</span>
                              <span className="text-[10px] font-mono text-slate-500">{mod.duration}</span>
                            </div>

                            <div className="space-y-1">
                              {mod.materials && mod.materials.map(mat => {
                                const isActive = selectedMaterial?.id === mat.id;
                                const isDone = !!completedMaterials[mat.id];
                                const unlockInfo = evaluateMaterialUnlock(mat);
                                const isLocked = unlockInfo.isLocked;

                                return (
                                  <button
                                    key={mat.id}
                                    onClick={() => handleSelectMaterial(subject.id, mod.id, mat)}
                                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all text-xs ${
                                      isActive
                                        ? "bg-blue-600 text-white font-bold shadow-md ring-1 ring-blue-400 transform scale-[1.01]"
                                        : isLocked
                                        ? "bg-slate-100/70 hover:bg-slate-200/70 text-slate-500 border border-dashed border-slate-300"
                                        : "hover:bg-slate-100 text-slate-700 font-medium"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      {isLocked ? (
                                        <Lock className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-amber-600"}`} />
                                      ) : mat.type === "video" ? (
                                        <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-rose-600"}`} />
                                      ) : mat.type === "quiz" ? (
                                        <HelpCircle className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-indigo-600"}`} />
                                      ) : mat.type === "presentation" ? (
                                        <Layers className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-amber-600"}`} />
                                      ) : (
                                        <FileText className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-sky-600"}`} />
                                      )}
                                      
                                      <div className="truncate flex flex-col text-left">
                                        <span className="truncate text-[11px]">{mat.title}</span>
                                        {isLocked && (
                                          <span className={`text-[9px] font-bold ${isActive ? "text-amber-200" : "text-amber-700"}`}>
                                            🔒 Locked ({unlockInfo.condition} Condition)
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isLocked ? (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                          LOCKED
                                        </span>
                                      ) : isDone ? (
                                        <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? "text-emerald-200" : "text-emerald-600"}`} />
                                      ) : mat.allowDownload ? (
                                        <Download className={`w-3 h-3 ${isActive ? "text-blue-100" : "text-slate-400"}`} />
                                      ) : null}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ─── CENTER: IMMERSIVE MATERIAL STAGE (OR LOCKED BANNER) ─── */}
        <div className={`flex-1 flex flex-col bg-slate-100/60 overflow-y-auto ${viewMode === "split" ? "lg:w-1/2" : "w-full"}`}>
          
          {/* Top Stage Metadata & Action Banner */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 border border-blue-200 text-blue-700">
                  {(selectedMaterial?.type || "learning").toUpperCase()} RESOURCE
                </span>

                {currentUnlockStatus.isLocked ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 border border-amber-300 text-amber-900">
                    <Lock className="w-3 h-3 text-amber-700" /> Prerequisite Lock Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Unlocked & Accessible
                  </span>
                )}

                {selectedMaterial?.allowDownload ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Download className="w-3 h-3" /> Download Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                    <Lock className="w-3 h-3" /> In-Portal Protected
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {selectedMaterial?.title}
              </h2>

              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Uploaded by: <b className="text-slate-900">{selectedMaterial?.uploadedBy || course?.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')"}</b></span>
                </span>
                <span>•</span>
                <span>{selectedMaterial?.uploadedAt || "Uploaded on: Jan 15, 2025"}</span>
                <span>•</span>
                <span className="text-slate-500">{selectedMaterial?.duration || selectedMaterial?.size || "45 mins"}</span>
              </p>
            </div>

            {/* Stage Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              
              {/* Configure Prerequisite Button for Trainer */}
              <button
                onClick={() => {
                  setEditingPrereqMaterial(selectedMaterial);
                  setShowTrainerConfigModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Trainer Rule Config</span>
              </button>

              {/* Mark Complete (if not locked) */}
              {!currentUnlockStatus.isLocked && (
                !completedMaterials[selectedMaterial?.id] ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{markingComplete ? "Saving..." : "Mark Complete"}</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                  </span>
                )
              )}

              {/* Take Notes Button */}
              {viewMode !== "split" && (
                <button
                  onClick={() => {
                    setRightPanelTab("notes");
                    setViewMode("split");
                    setIsSidebarCollapsed(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                  <span>Notes</span>
                </button>
              )}

              {selectedMaterial?.allowDownload && !currentUnlockStatus.isLocked && (
                <button
                  onClick={() => alert(`Downloading resource: ${selectedMaterial?.title}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              )}

            </div>
          </div>

          {/* ═════════ STAGE CONTENT: LOCKED SCREEN vs INTERACTIVE VIEWERS ═════════ */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col items-center">
            
            {/* 🔒 LOCKED MATERIAL VIEW (When Prerequisite Not Met) */}
            {currentUnlockStatus.isLocked ? (
              <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg border border-amber-200 p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
                    <Lock className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider inline-block">
                    🔒 {selectedMaterial?.title} Locked
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Complete Required Assessment / Prerequisite to Continue
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                    This learning resource is protected under the <b>Controlled Progression Pathway</b>. You must satisfy the prerequisite criteria configured by the Lead Trainer before this content becomes available.
                  </p>
                </div>

                {/* Progression Rule Condition Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                        Prerequisite Logic: {currentUnlockStatus.condition === "ALL" ? "ALL Conditions Required (AND)" : "ANY Condition Required (OR)"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {currentUnlockStatus.condition === "ALL" 
                          ? "Every prerequisite listed below must be passed/completed before access is granted." 
                          : "Completing any one of the prerequisites below is sufficient to unlock this resource."}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-white shadow-sm shrink-0">
                    {currentUnlockStatus.unmet.length} Condition(s) Unmet
                  </span>
                </div>

                {/* Prerequisites Checklist */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                    Required Prerequisite Checklist:
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {currentUnlockStatus.allPrereqs.map((prereq, pIdx) => (
                      <div 
                        key={prereq.id || pIdx} 
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                          prereq.isMet 
                            ? "bg-emerald-50/70 border-emerald-300" 
                            : "bg-white border-amber-200 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            prereq.isMet ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700 border border-amber-300"
                          }`}>
                            {prereq.isMet ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {prereq.type?.toUpperCase()}
                              </span>
                              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">{prereq.title}</h5>
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium">
                              Requirement: {prereq.type === "video" ? "Watch ≥ 80% duration" : prereq.type === "quiz" ? "Pass with ≥ 50% score" : "Complete reading"} • Current: <b className={prereq.isMet ? "text-emerald-700" : "text-amber-800"}>{prereq.statusText}</b>
                            </p>
                          </div>
                        </div>

                        {/* Jump Action */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {prereq.isMet ? (
                            <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold px-2.5 py-1 bg-emerald-100 rounded-lg">
                              <Check className="w-4 h-4" /> Satisfied
                            </span>
                          ) : (
                            <button
                              onClick={() => handleJumpToPrerequisite(prereq.id)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105"
                            >
                              <span>Jump to Prerequisite</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trainer Bypass Prompt */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Trainer note: You can disable this lock globally or customize conditions using the header controls.
                  </span>
                  <button
                    onClick={() => {
                      setIsLockPathEnabled(false);
                      showNotification("🔓 Controlled Path Disabled: All materials are now open for exploration.");
                    }}
                    className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Bypass & Open Exploration</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ─── UNLOCKED CONTENT STAGES ─── */
              <>
                {/* 1. 🎬 VIDEO MASTERCLASS STAGE (WITH 80% WATCH THRESHOLD CONTROLS) */}
                {selectedMaterial?.type === "video" && (
                  <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col">
                    <div className="aspect-video w-full bg-black flex items-center justify-center relative shadow-inner">
                      <iframe
                        className="w-full h-full"
                        src={selectedMaterial.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                        title={selectedMaterial.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>

                    {/* 80% Watch Threshold Progress & Simulator Bar */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>Progression Rule: 80% Watch Threshold</span>
                          </span>
                          {currentVideoProgress?.isThresholdMet ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> THRESHOLD MET (≥ 80%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                              PENDING (Requires ≥ 80%)
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-800 rounded-full h-3 relative overflow-hidden border border-slate-700">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              currentVideoProgress?.watchedPercentage >= 80 
                                ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                                : "bg-gradient-to-r from-blue-500 to-indigo-500"
                            }`}
                            style={{ width: `${currentVideoProgress?.watchedPercentage || 0}%` }}
                          ></div>
                          {/* 80% Indicator Line */}
                          <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-amber-300 z-10" title="80% Threshold Gate"></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                          <span>Watched: {currentVideoProgress?.watchedPercentage || 0}%</span>
                          <span>Unlock Target: 80%</span>
                        </div>
                      </div>

                      {/* Interactive Watch Simulator Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleUpdateVideoWatchPercent(selectedMaterial.id, (currentVideoProgress?.watchedPercentage || 0) + 15)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold border border-white/20 shadow-sm"
                        >
                          + 15%
                        </button>
                        <button
                          onClick={() => handleUpdateVideoWatchPercent(selectedMaterial.id, (currentVideoProgress?.watchedPercentage || 0) + 30)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold border border-white/20 shadow-sm"
                        >
                          + 30%
                        </button>
                        <button
                          onClick={() => handleUpdateVideoWatchPercent(selectedMaterial.id, 85)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-transform hover:scale-105"
                        >
                          <FastForward className="w-3.5 h-3.5" />
                          <span>⚡ Fast-Forward to 85% (Unlock)</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                          <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">{selectedMaterial.title}</h3>
                          <p className="text-xs text-slate-500">
                            Duration: {selectedMaterial.duration || "45 mins"} • IMD Operational Capacity Series
                          </p>
                        </div>
                      </div>

                      {/* Timestamp Quick Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Markers:</span>
                        <button
                          onClick={() => {
                            setLectureNote(prev => prev + "\n- [04:15] Sigma Coordinate transformation & boundary conditions");
                            setRightPanelTab("notes");
                            if (viewMode !== "split") setViewMode("split");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 font-mono text-[10px] font-bold border border-slate-200"
                        >
                          + 04:15
                        </button>
                        <button
                          onClick={() => {
                            setLectureNote(prev => prev + "\n- [18:30] Hydrostatic vs Non-Hydrostatic approximations");
                            setRightPanelTab("notes");
                            if (viewMode !== "split") setViewMode("split");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 font-mono text-[10px] font-bold border border-slate-200"
                        >
                          + 18:30
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. 📝 IN-STUDIO INTERACTIVE VIDEO QUIZ STAGE */}
                {selectedMaterial?.type === "quiz" && (
                  <div className="w-full max-w-4xl bg-white rounded-3xl shadow-md border border-slate-200 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shadow-sm">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                            Interactive Prerequisite Assessment
                          </span>
                          <h3 className="font-black text-slate-900 text-base sm:text-lg mt-0.5">{selectedMaterial.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Duration: {selectedMaterial.duration || "15 mins"} • Total Marks: {selectedMaterial.totalMarks || 10} • Pass Grade: {selectedMaterial.passPercentage || 50}%
                          </p>
                        </div>
                      </div>

                      {quizProgress[selectedMaterial.id]?.passed && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold rounded-xl text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed ({quizProgress[selectedMaterial.id].percentage}%)
                        </span>
                      )}
                    </div>

                    {/* Quiz Questions List */}
                    <div className="space-y-5">
                      {(selectedMaterial.questions || []).map((q, qIdx) => {
                        const isSubmitted = !!inStudioQuizResult;
                        const userAns = inStudioQuizAnswers[qIdx];
                        const isCorrect = userAns === q.correctAnswer;

                        return (
                          <div key={q.id || qIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-relaxed">
                                {qIdx + 1}. {q.question}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-bold shrink-0">
                                {q.marks || 5} Marks
                              </span>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = userAns === optIdx;
                                let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/30";

                                if (isSubmitted) {
                                  if (optIdx === q.correctAnswer) {
                                    btnClass = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400";
                                  } else if (isSelected && !isCorrect) {
                                    btnClass = "bg-rose-50 border-rose-400 text-rose-950 font-medium";
                                  }
                                } else if (isSelected) {
                                  btnClass = "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-400";
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isSubmitted && inStudioQuizResult.isPassed}
                                    onClick={() => {
                                      if (!isSubmitted || !inStudioQuizResult.isPassed) {
                                        setInStudioQuizAnswers({ ...inStudioQuizAnswers, [qIdx]: optIdx });
                                      }
                                    }}
                                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnClass}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {isSubmitted && optIdx === q.correctAnswer && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {isSubmitted && (
                              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                                <p className="font-bold text-blue-800">Scientific Explanation:</p>
                                <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Result Banner or Submit Button */}
                    {inStudioQuizResult ? (
                      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        inStudioQuizResult.isPassed 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                          : "bg-rose-50 border-rose-300 text-rose-950"
                      }`}>
                        <div className="flex items-center gap-3">
                          {inStudioQuizResult.isPassed ? (
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
                              <AlertCircle className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-black text-sm">
                              {inStudioQuizResult.isPassed ? "🎉 Assessment Passed — Prerequisite Cleared!" : "Assessment Incomplete — Passing Score Needed"}
                            </h4>
                            <p className="text-xs">
                              You scored <b>{inStudioQuizResult.score} / {inStudioQuizResult.totalMarks}</b> ({inStudioQuizResult.percentage}%). Minimum required to unlock downstream resources is {selectedMaterial.passPercentage || 50}%.
                            </p>
                          </div>
                        </div>

                        {!inStudioQuizResult.isPassed && (
                          <button
                            onClick={() => {
                              setInStudioQuizResult(null);
                              setInStudioQuizAnswers({});
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry Assessment</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleInStudioQuizSubmit(selectedMaterial)}
                          disabled={Object.keys(inStudioQuizAnswers).length === 0}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition-transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>Submit Assessment & Evaluate Unlock ({Object.keys(inStudioQuizAnswers).length}/{(selectedMaterial.questions || []).length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. 📊 PRESENTATION / SLIDE DECK STAGE */}
                {selectedMaterial?.type === "presentation" && (
                  <div className="w-full max-w-5xl bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-3 sm:p-4 bg-slate-50 text-slate-800 flex items-center justify-between border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-xs">Slide Deck Viewer</span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          disabled={currentSlidePage <= 1}
                          onClick={() => setCurrentSlidePage(prev => Math.max(1, prev - 1))}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-slate-700 shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          Slide {currentSlidePage} / {selectedMaterial.pages || 28}
                        </span>
                        <button
                          disabled={currentSlidePage >= (selectedMaterial.pages || 28)}
                          onClick={() => setCurrentSlidePage(prev => Math.min(selectedMaterial.pages || 28, prev + 1))}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-slate-700 shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-[380px] flex flex-col justify-between relative overflow-hidden border-b border-slate-200">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-300" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                            IMD Directorate of NWP & Radar Operations
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                          SLIDE_#0{currentSlidePage}
                        </span>
                      </div>

                      <div className="py-4 space-y-3 max-w-2xl">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow">
                          Section {currentSlidePage}: {currentSlidePage === 1 ? "Primitive Equation Systems" : currentSlidePage === 2 ? "Grid Discretization Schemes" : "Boundary Layer Parameterizations"}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {currentSlidePage === 1 
                            ? "Primitive Equation Coordinate Transformations & Hydrostatic Balance"
                            : currentSlidePage === 2
                            ? "Arakawa C-Grid Staggering & Spatial Finite Differencing"
                            : "Regional Boundary Layer Eddy Diffusivity Formulations"}
                        </h2>
                        <p className="text-xs text-blue-100/90 leading-relaxed">
                          In operational numerical weather modeling across complex Indian topography, terrain-following sigma coordinates σ = (p - pt)/(ps - pt) ensure smooth lower boundary representation.
                        </p>

                        <div className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-blue-400/20 text-xs font-mono text-blue-300">
                          <code>du/dt + u(du/dx) + v(du/dy) + σ̇(du/dσ) - fv = -∂Φ/∂x - σ·α·(∂p_s/∂x)</code>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-blue-200/70">
                        <span>Trainer: Dr. Amit Sengupta</span>
                        <span>MoES National Capacity Series</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 flex items-center gap-2 overflow-x-auto">
                      {[1, 2, 3, 4, 5, 6].map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentSlidePage(page)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all shrink-0 ${
                            currentSlidePage === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          Slide {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. 📄 SCIENTIFIC STUDY NOTES / PDF HANDBOOK STAGE */}
                {selectedMaterial?.type === "pdf" && (
                  <div className="w-full max-w-5xl bg-white rounded-3xl shadow-md border border-slate-200 p-5 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{selectedMaterial.title}</h3>
                          <p className="text-xs text-slate-500">IMD Technical Reference Handbook • {selectedMaterial.size || "4.2 MB"}</p>
                        </div>
                      </div>

                      {selectedMaterial.allowDownload && (
                        <button
                          onClick={() => alert(`Downloading: ${selectedMaterial.title}`)}
                          className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                      <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900">
                        <h4 className="font-extrabold text-xs mb-1 text-blue-800">Executive Technical Summary for Shift Forecasters:</h4>
                        This handbook establishes the mathematical basis for planetary boundary layer (PBL) parameterization in high-resolution regional weather forecast domains over the Indian subcontinent.
                      </div>

                      <h3 className="text-xs font-extrabold text-slate-900 pt-1 border-b border-slate-200 pb-1">
                        1. Governing Planetary Boundary Layer Equations
                      </h3>
                      <p>
                        The turbulent momentum flux divergence in the atmospheric surface layer is parameterized via eddy diffusivity (Km) formulations:
                      </p>
                      <div className="p-3 bg-slate-900 rounded-xl font-mono text-blue-300 text-xs border border-slate-800">
                        τ_x = ρ · K_m · (∂u/∂z),   τ_y = ρ · K_m · (∂v/∂z)
                      </div>
                      <p>
                        Where K_m = l² · |∂V/∂z| · f(Ri), and Ri is the gradient Richardson number denoting dynamic stability versus buoyant production of convective turbulence.
                      </p>

                      <h3 className="text-xs font-extrabold text-slate-900 pt-1 border-b border-slate-200 pb-1">
                        2. Dual-Polarization Radar Ingestion Guidelines
                      </h3>
                      <p>
                        When Doppler Radar reflectivity moments (Z_H, Z_DR, K_DP, ρ_HV) are ingested into the 3D-Var variational assimilation framework, hydrometeor classification weights must filter out anomalous ground clutter and sea spray returns along coastal radar stations.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* ─── RIGHT: 3-TAB SPLIT PANEL (Notes | AI Summary | Practice Quiz) ─── */}
        {viewMode === "split" && (
          <aside className="w-full lg:w-1/2 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl z-20 max-h-[50vh] lg:max-h-none overflow-y-auto">
            
            {/* Panel Tabs (Lecture Notes | AI Summary | Practice Quiz) */}
            <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 sm:p-1 rounded-xl border border-slate-300/60 overflow-x-auto max-w-full">
                {/* Tab 1: Notes */}
                <button
                  onClick={() => setRightPanelTab("notes")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    rightPanelTab === "notes"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                  <span>My Notes</span>
                </button>

                {/* Tab 2: AI Summary */}
                <button
                  onClick={() => setRightPanelTab("ai_summary")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    rightPanelTab === "ai_summary"
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>AI Summary ✨</span>
                </button>

                {/* Tab 3: Practice Quiz */}
                <button
                  onClick={() => setRightPanelTab("practice_quiz")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    rightPanelTab === "practice_quiz"
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Practice Quiz (AI)</span>
                </button>
              </div>

              {/* Close Split View Button */}
              <button
                onClick={() => setViewMode("standard")}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold shrink-0 ml-2 border border-slate-200"
                title="Return to Standard View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ═════════ TAB 1: 📝 LECTURE NOTES FORM ═════════ */}
            {rightPanelTab === "notes" && (
              <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3 overflow-y-auto">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-500" />
                      <span>Module Personal Notes</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Auto-saved per module for {selectedMaterial?.title}
                    </p>
                  </div>

                  {lastSavedTime && (
                    <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> {lastSavedTime}
                    </span>
                  )}
                </div>

                {/* Quick Helper Formatting Toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setLectureNote(prev => prev + `\n- [${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] `)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-blue-700 rounded-lg text-[11px] font-bold border border-slate-200 shadow-sm"
                  >
                    + Timestamp
                  </button>
                  <button
                    onClick={() => setLectureNote(prev => prev + "\n- **Key Formula:** `CFL = u*dt/dx <= 1.0`")}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-blue-700 rounded-lg text-[11px] font-bold border border-slate-200 shadow-sm"
                  >
                    + Formula
                  </button>
                  <button
                    onClick={() => setLectureNote(prev => prev + "\n- **Observation:** ")}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-blue-700 rounded-lg text-[11px] font-bold border border-slate-200 shadow-sm"
                  >
                    + Bullet
                  </button>
                  <button
                    onClick={handleDownloadNote}
                    disabled={!lectureNote}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold disabled:opacity-40 ml-auto flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3 h-3" /> Export (.md)
                  </button>
                </div>

                {/* Main Textarea */}
                <textarea
                  value={lectureNote}
                  onChange={(e) => setLectureNote(e.target.value)}
                  placeholder="Write your personal lecture observations, numerical derivations, meteorological questions, and key takeaways here..."
                  className="flex-1 w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[220px] resize-none"
                />

                {/* Bottom Save */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear these notes?")) {
                        setLectureNote("");
                        const key = getNoteStorageKey(selectedMaterial.id);
                        localStorage.removeItem(key);
                      }
                    }}
                    disabled={!lectureNote}
                    className="flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-bold disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>

                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═════════ TAB 2: ✨ AI SUMMARY ENGINE ═════════ */}
            {rightPanelTab === "ai_summary" && (
              <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
                      Gemini 1.5 Flash
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">
                      AI Material Summary & Key Takeaways
                    </h3>
                  </div>

                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={generatingSummary}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingSummary ? "animate-spin" : ""}`} />
                    <span>{generatingSummary ? "Synthesizing..." : "Regenerate"}</span>
                  </button>
                </div>

                {!aiSummary && !generatingSummary && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                    <BrainCircuit className="w-10 h-10 text-blue-600 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No Summary Generated Yet</h4>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                      Click below to analyze this {selectedMaterial?.type?.toUpperCase()} with Gemini AI and generate key takeaways and governing equations.
                    </p>
                    <button
                      onClick={handleGenerateAiSummary}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm"
                    >
                      ✨ Generate AI Summary Now
                    </button>
                  </div>
                )}

                {generatingSummary && (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-slate-900 text-sm">Analyzing {selectedMaterial?.type?.toUpperCase()} Material...</h4>
                    <p className="text-slate-500 text-xs font-mono">
                      Extracting governing formulas, key takeaways, and operational applications...
                    </p>
                  </div>
                )}

                {aiSummary && !generatingSummary && (
                  <div className="space-y-4 text-xs animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1.5 shadow-sm">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Executive Summary</span>
                      <p className="leading-relaxed text-xs">{aiSummary.executiveSummary}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Core Key Takeaways</span>
                      </h4>
                      <ul className="space-y-2">
                        {(aiSummary.keyTakeaways || []).map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 text-[11px] leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {aiSummary.coreFormulasAndConcepts && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                        <h4 className="font-extrabold text-amber-700 text-xs flex items-center gap-1.5">
                          <FileCode className="w-4 h-4 text-amber-600" />
                          <span>Governing Formulas & Theoretical Definitions</span>
                        </h4>
                        <div className="space-y-1.5">
                          {aiSummary.coreFormulasAndConcepts.map((f, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-900 rounded-xl font-mono text-blue-300 text-[11px] border border-slate-800">
                              <code>{f}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSummary.operationalApplications && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Operational Forecasting Applications</span>
                        </h4>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {aiSummary.operationalApplications}
                        </p>
                      </div>
                    )}

                    {aiSummary.examTips && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                        <b>💡 Certification Exam Highlight:</b> {aiSummary.examTips}
                      </div>
                    )}

                    <button
                      onClick={handleInsertSummaryIntoNotes}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Insert AI Summary into My Lecture Notes</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═════════ TAB 3: 🎯 PRACTICE QUIZ & PATTERN CLONER ═════════ */}
            {rightPanelTab === "practice_quiz" && (
              <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
                      Gemini Powered
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                      Interactive Practice Quiz Engine
                    </h3>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setPracticeMode("ai_topic")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        practiceMode === "ai_topic"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Topic AI
                    </button>
                    <button
                      onClick={() => setPracticeMode("pattern_clone")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        practiceMode === "pattern_clone"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Pattern Cloner
                    </button>
                  </div>
                </div>

                {/* MODE 1: Topic Generator Controls */}
                {practiceMode === "ai_topic" && (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Target Difficulty</label>
                        <select
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Easy">Easy (Foundational)</option>
                          <option value="Medium">Medium (Operational)</option>
                          <option value="Hard">Hard (Mathematical Dynamics)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Question Count</label>
                        <select
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={3}>3 Quick Practice MCQs</option>
                          <option value={5}>5 Standard MCQs</option>
                          <option value={10}>10 In-depth Assessment MCQs</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleGeneratePracticeQuiz}
                      disabled={generatingQuiz}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{generatingQuiz ? "Gemini is Synthesizing MCQs..." : `Generate AI Quiz for "${selectedMaterial?.title?.slice(0, 30)}..."`}</span>
                    </button>
                  </div>
                )}

                {/* MODE 2: Pattern Cloner Controls */}
                {practiceMode === "pattern_clone" && (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Paste Trainer Question to Clone:</label>
                      <textarea
                        rows={2}
                        value={sampleQuestionText}
                        onChange={(e) => setSampleQuestionText(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={quizDifficulty}
                        onChange={(e) => setQuizDifficulty(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Medium">Medium Rigor</option>
                        <option value="Hard">Hard Rigor</option>
                        <option value="Easy">Easy Rigor</option>
                      </select>

                      <select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGeneratePatternQuiz}
                      disabled={generatingQuiz}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{generatingQuiz ? "Cloning Pattern with Gemini..." : "⚡ Generate Pattern Variants"}</span>
                    </button>
                  </div>
                )}

                {/* Live Quiz Runner */}
                {practiceQuestions.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-700">
                        {practiceQuestions.length} Questions Ready
                      </span>
                      {quizFinished && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          Score: {calculateScore().correct}/{calculateScore().total} ({calculateScore().percentage}%)
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {practiceQuestions.map((q, qIndex) => {
                        const isAnswered = userAnswers[qIndex] !== undefined;
                        const isCorrect = userAnswers[qIndex] === q.correctAnswer;

                        return (
                          <div key={q.id || qIndex} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                {qIndex + 1}. {q.question}
                              </h4>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                                {q.difficulty || "Medium"}
                              </span>
                            </div>

                            {/* Options */}
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIndex) => {
                                const isSelected = userAnswers[qIndex] === optIndex;
                                let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/40";

                                if (quizFinished) {
                                  if (optIndex === q.correctAnswer) {
                                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                                  } else if (isSelected && !isCorrect) {
                                    btnStyle = "bg-rose-50 border-rose-400 text-rose-900 font-medium";
                                  }
                                } else if (isSelected) {
                                  btnStyle = "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-400";
                                }

                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => {
                                      if (!quizFinished) {
                                        setUserAnswers({ ...userAnswers, [qIndex]: optIndex });
                                      }
                                    }}
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span>{String.fromCharCode(65 + optIndex)}. {opt}</span>
                                    {quizFinished && optIndex === q.correctAnswer && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Solution */}
                            {quizFinished && (
                              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] space-y-1 text-blue-900">
                                <p className="font-bold text-blue-800">Pedagogical Solution:</p>
                                <p className="leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Controls */}
                    <div className="pt-2">
                      {!quizFinished ? (
                        <button
                          onClick={() => setQuizFinished(true)}
                          disabled={Object.keys(userAnswers).length === 0}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-[1.01]"
                        >
                          Submit & Evaluate ({Object.keys(userAnswers).length}/{practiceQuestions.length})
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUserAnswers({});
                            setQuizFinished(false);
                          }}
                          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Practice Quiz</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </aside>
        )}

      </div>

      {/* ═════════ TRAINER PREREQUISITE CONFIGURATOR MODAL ═════════ */}
      {showTrainerConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Trainer Prerequisite Unlock Configurator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define learning path progression constraints for: <b>{editingPrereqMaterial?.title?.substring(0, 35)}...</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrainerConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Global Master Rule Status */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-xs text-slate-900 block">
                  Master Progression Lock: {isLockPathEnabled ? "Active (Strict Mode)" : "Disabled (Open Mode)"}
                </span>
                <span className="text-[11px] text-slate-500">
                  When enabled, trainees must complete prerequisites to unlock this material.
                </span>
              </div>
              <button
                onClick={() => setIsLockPathEnabled(!isLockPathEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 ${
                  isLockPathEnabled ? "bg-indigo-600" : "bg-slate-500"
                }`}
              >
                {isLockPathEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{isLockPathEnabled ? "Enabled" : "Disabled"}</span>
              </button>
            </div>

            {/* Prerequisite Logic Condition (ALL vs ANY) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Condition Requirement Logic:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const currentConfig = prereqConfigMap[editingPrereqMaterial.id] || editingPrereqMaterial.prerequisiteConfig || {};
                    setPrereqConfigMap(prev => ({
                      ...prev,
                      [editingPrereqMaterial.id]: {
                        ...currentConfig,
                        condition: "ALL"
                      }
                    }));
                  }}
                  className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                    (prereqConfigMap[editingPrereqMaterial?.id]?.condition || editingPrereqMaterial?.prerequisiteConfig?.condition || "ALL") === "ALL"
                      ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-950">ALL Conditions (AND)</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900">STRICT</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    e.g., Quiz 1 AND Quiz 2 must both be completed before unlocking.
                  </p>
                </button>

                <button
                  onClick={() => {
                    const currentConfig = prereqConfigMap[editingPrereqMaterial.id] || editingPrereqMaterial.prerequisiteConfig || {};
                    setPrereqConfigMap(prev => ({
                      ...prev,
                      [editingPrereqMaterial.id]: {
                        ...currentConfig,
                        condition: "ANY"
                      }
                    }));
                  }}
                  className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                    (prereqConfigMap[editingPrereqMaterial?.id]?.condition || editingPrereqMaterial?.prerequisiteConfig?.condition) === "ANY"
                      ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-950">ANY Condition (OR)</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">FLEXIBLE</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    e.g., Complete Quiz 1 OR Assignment 1 to unlock.
                  </p>
                </button>
              </div>
            </div>

            {/* Video Watch Threshold Settings */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Minimum Video Watch Threshold:
                </label>
                <span className="text-xs font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  80% (Default)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Trainees cannot simply open the video for 2 seconds; they must consume at least 80% duration before completion is credited.
              </p>
            </div>

            {/* Save & Apply Button */}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowTrainerConfigModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowTrainerConfigModal(false);
                  showNotification("✓ Progression unlock rules updated successfully for this course!");
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Save & Apply Rule
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
