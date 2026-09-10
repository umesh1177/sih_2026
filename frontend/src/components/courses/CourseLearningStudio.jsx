import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  Download, 
  Lock, 
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
        duration: "1h 45m",
        materials: [
          {
            id: "mat_1_1_1",
            title: "Recorded Masterclass: Sigma Coordinates & Topographic Boundary Conditions",
            type: "video",
            duration: "45 mins",
            allowDownload: false,
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 15, 2025"
          },
          {
            id: "mat_1_1_2",
            title: "Masterclass Slide Deck: Hydrostatic and Non-Hydrostatic Approximations",
            type: "presentation",
            pages: 28,
            allowDownload: false,
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 16, 2025"
          },
          {
            id: "mat_1_1_3",
            title: "Technical Handbook: Planetary Boundary Layer Parameterization Guide",
            type: "pdf",
            size: "4.2 MB",
            allowDownload: true,
            uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 18, 2025"
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
    title: "Recorded Masterclass: Sigma Coordinates & Topographic Boundary Conditions",
    type: "video",
    duration: "45 mins",
    allowDownload: false,
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    uploadedBy: course?.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
    uploadedAt: "Uploaded on: Jan 15, 2025"
  };

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [selectedModuleId, setSelectedModuleId] = useState(subjects[0]?.modules?.[0]?.id || "");
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);

  // View Layout Modes: "standard" | "split" (Half screen content + Half screen Notes/AI/Quiz) | "fullscreen" (Stage only)
  const [viewMode, setViewMode] = useState("standard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("notes"); // "notes" | "ai_summary" | "practice_quiz"

  const [completedMaterials, setCompletedMaterials] = useState({ [initialMaterial.id]: true });
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
    setCompletedMaterials(prev => ({ ...prev, [mat.id]: true }));
  };

  // Calculate total materials count and progress
  let totalMaterials = 0;
  subjects.forEach(s => s.modules?.forEach(m => totalMaterials += (m.materials?.length || 0)));
  const completedCount = Object.keys(completedMaterials).length;
  const progressPct = totalMaterials > 0 ? Math.min(Math.round((completedCount / totalMaterials) * 100), 100) : 50;

  return (
    <div className="flex flex-col h-full bg-[#0b1329] text-slate-100 overflow-hidden select-none font-sans">
      
      {/* ═════════ RESPONSIVE STUDIO CONTROL HEADER ═════════ */}
      <header className="min-h-[56px] py-2 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 shrink-0 shadow-lg z-30">
        
        {/* Left Section: Back, Collapse Sidebar & Course Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700/60 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Exit Studio</span>
          </button>

          {/* Toggle Sidebar Collapse */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Show Curriculum Navigator" : "Hide Curriculum Navigator"}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Course Code & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white shrink-0 hidden xs:inline-block">
              {course.code || "NWP-401"}
            </span>
            <h1 className="font-bold text-white text-xs sm:text-sm truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Right Section: Progress, View Modes, AI Summary & Practice Quiz Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end ml-auto">
          
          {/* Progress Bar (Visible on large screens) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs shrink-0">
            <span className="text-slate-400 text-[11px]">Progress:</span>
            <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            <span className="font-extrabold text-emerald-400 text-[11px]">{progressPct}%</span>
          </div>

          {/* View Mode Selector Group */}
          <div className="flex items-center bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-800 shrink-0">
            {/* 1. Standard View */}
            <button
              onClick={() => {
                setViewMode("standard");
                setIsSidebarCollapsed(false);
              }}
              title="Standard View (Navigator + Viewer)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "standard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
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
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
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
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
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
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Target className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span>Practice Quiz</span>
          </button>

        </div>
      </header>

      {/* ═════════ MAIN STUDIO VIEWPORT ═════════ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ─── LEFT: CURRICULUM NAVIGATOR ─── */}
        {!isSidebarCollapsed && (
          <aside className="w-full md:w-76 lg:w-80 bg-[#0d1527] border-r border-slate-800/90 flex flex-col shrink-0 overflow-y-auto shadow-2xl z-20 transition-all duration-300 max-h-48 md:max-h-none">
            <div className="p-3 sm:p-4 border-b border-slate-800 bg-[#111c35]/80 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Curriculum Content</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {subjects.length} Subjects • {totalMaterials} Interactive Modules
                </p>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white hidden md:block"
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
                  <div key={subject.id} className="border border-slate-800/80 rounded-2xl overflow-hidden bg-[#101a33] shadow-md">
                    {/* Subject Title Bar */}
                    <button
                      onClick={() => toggleSubjectExpand(subject.id)}
                      className="w-full p-3 bg-gradient-to-r from-[#142244] to-[#101a33] hover:from-[#192b57] hover:to-[#142244] flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600/90 text-white flex items-center justify-center font-black text-[10px] shadow">
                          S{sIdx + 1}
                        </div>
                        <span className="font-bold text-slate-200 text-xs line-clamp-1">{subject.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Modules & Materials list */}
                    {isExpanded && (
                      <div className="p-2 space-y-2 bg-[#0d1527]/90">
                        {subject.modules && subject.modules.map(mod => (
                          <div key={mod.id} className="p-2 bg-[#111d38] rounded-xl border border-slate-800/60">
                            <div className="flex items-center justify-between px-1 mb-1.5">
                              <span className="font-bold text-blue-200 text-[11px]">{mod.title}</span>
                              <span className="text-[10px] font-mono text-slate-400">{mod.duration}</span>
                            </div>

                            <div className="space-y-1">
                              {mod.materials && mod.materials.map(mat => {
                                const isActive = selectedMaterial?.id === mat.id;
                                const isDone = !!completedMaterials[mat.id];

                                return (
                                  <button
                                    key={mat.id}
                                    onClick={() => handleSelectMaterial(subject.id, mod.id, mat)}
                                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all text-xs ${
                                      isActive
                                        ? "bg-blue-600 text-white font-bold shadow-lg ring-1 ring-blue-400 transform scale-[1.01]"
                                        : "hover:bg-slate-800 text-slate-300 font-medium"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      {mat.type === "video" ? (
                                        <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-rose-400"}`} />
                                      ) : mat.type === "presentation" ? (
                                        <Layers className={`w-4 h-4 shrink-0 ${isActive ? "text-yellow-200" : "text-amber-400"}`} />
                                      ) : (
                                        <FileText className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-200" : "text-sky-400"}`} />
                                      )}
                                      <span className="truncate text-[11px]">{mat.title}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {mat.allowDownload ? (
                                        <Download className={`w-3 h-3 ${isActive ? "text-blue-100" : "text-slate-500"}`} />
                                      ) : (
                                        <Lock className={`w-3 h-3 ${isActive ? "text-amber-200" : "text-slate-500"}`} />
                                      )}
                                      {isDone && (
                                        <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? "text-emerald-200" : "text-emerald-400"}`} />
                                      )}
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

        {/* ─── CENTER: IMMERSIVE MATERIAL STAGE ─── */}
        <div className={`flex-1 flex flex-col bg-[#080e1e] overflow-y-auto ${viewMode === "split" ? "lg:w-1/2" : "w-full"}`}>
          
          {/* Top Stage Metadata & Action Banner */}
          <div className="bg-[#0f1a35] border-b border-slate-800/90 px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 border border-blue-400/40 text-blue-300">
                  {(selectedMaterial?.type || "learning").toUpperCase()} MASTERCLASS
                </span>

                {selectedMaterial?.allowDownload ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                    <Download className="w-3 h-3" /> Download Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300">
                    <Lock className="w-3 h-3" /> In-Portal Protected View Only
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {selectedMaterial?.title}
              </h2>

              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Uploaded by: <b className="text-white">{selectedMaterial?.uploadedBy || course?.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')"}</b></span>
                </span>
                <span>•</span>
                <span>{selectedMaterial?.uploadedAt || "Uploaded on: Jan 15, 2025"}</span>
                <span>•</span>
                <span className="text-slate-400">{selectedMaterial?.duration || selectedMaterial?.size || "45 mins"}</span>
              </p>
            </div>

            {/* Stage Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              
              {/* Mark Complete */}
              {!completedMaterials[selectedMaterial?.id] ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{markingComplete ? "Saving..." : "Mark Complete"}</span>
                </button>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                </span>
              )}

              {/* Take Notes Button */}
              {viewMode !== "split" && (
                <button
                  onClick={() => {
                    setRightPanelTab("notes");
                    setViewMode("split");
                    setIsSidebarCollapsed(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notes</span>
                </button>
              )}

              {selectedMaterial?.allowDownload && (
                <button
                  onClick={() => alert(`Downloading resource: ${selectedMaterial?.title}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              )}

            </div>
          </div>

          {/* Interactive Material Viewer Body */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col items-center">
            
            {/* 1. 🎬 VIDEO MASTERCLASS STAGE */}
            {selectedMaterial?.type === "video" && (
              <div className="w-full max-w-5xl bg-[#0d172e] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
                <div className="aspect-video w-full bg-black flex items-center justify-center relative shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src={selectedMaterial.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                    title={selectedMaterial.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="p-4 sm:p-5 bg-[#111e3b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">{selectedMaterial.title}</h3>
                      <p className="text-xs text-slate-400">
                        Duration: {selectedMaterial.duration || "45 mins"} • IMD Operational Capacity Series
                      </p>
                    </div>
                  </div>

                  {/* Timestamp Quick Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Markers:</span>
                    <button
                      onClick={() => {
                        setLectureNote(prev => prev + "\n- [04:15] Sigma Coordinate transformation & boundary conditions");
                        setRightPanelTab("notes");
                        if (viewMode !== "split") setViewMode("split");
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono text-[10px] border border-slate-700"
                    >
                      + 04:15
                    </button>
                    <button
                      onClick={() => {
                        setLectureNote(prev => prev + "\n- [18:30] Hydrostatic vs Non-Hydrostatic approximations");
                        setRightPanelTab("notes");
                        if (viewMode !== "split") setViewMode("split");
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono text-[10px] border border-slate-700"
                    >
                      + 18:30
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 📊 PRESENTATION / SLIDE DECK STAGE */}
            {selectedMaterial?.type === "presentation" && (
              <div className="w-full max-w-5xl bg-[#0f1b38] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
                <div className="p-3 sm:p-4 bg-[#142347] text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs">Slide Deck Viewer</span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      disabled={currentSlidePage <= 1}
                      onClick={() => setCurrentSlidePage(prev => Math.max(1, prev - 1))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-200 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      Slide {currentSlidePage} / {selectedMaterial.pages || 28}
                    </span>
                    <button
                      disabled={currentSlidePage >= (selectedMaterial.pages || 28)}
                      onClick={() => setCurrentSlidePage(prev => Math.min(selectedMaterial.pages || 28, prev + 1))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-10 bg-gradient-to-br from-[#0b1429] via-[#0f214a] to-[#122b63] text-white min-h-[380px] flex flex-col justify-between relative overflow-hidden border-b border-slate-800">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-300" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                        IMD Directorate of NWP & Radar Operations
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
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

                <div className="p-2.5 bg-[#0a1224] flex items-center gap-2 overflow-x-auto">
                  {[1, 2, 3, 4, 5, 6].map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentSlidePage(page)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all shrink-0 ${
                        currentSlidePage === page
                          ? "bg-blue-600 text-white shadow"
                          : "bg-slate-800/80 hover:bg-slate-700 text-slate-400"
                      }`}
                    >
                      Slide {page}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 📄 SCIENTIFIC STUDY NOTES / PDF HANDBOOK STAGE */}
            {selectedMaterial?.type === "pdf" && (
              <div className="w-full max-w-5xl bg-[#0f1b38] rounded-3xl shadow-2xl border border-slate-800 p-5 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold shadow">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm sm:text-base">{selectedMaterial.title}</h3>
                      <p className="text-xs text-slate-400">IMD Technical Reference Handbook • {selectedMaterial.size || "4.2 MB"}</p>
                    </div>
                  </div>

                  {selectedMaterial.allowDownload && (
                    <button
                      onClick={() => alert(`Downloading: ${selectedMaterial.title}`)}
                      className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="p-3.5 bg-blue-950/70 rounded-2xl border border-blue-800/60 text-blue-200">
                    <h4 className="font-extrabold text-xs mb-1 text-blue-300">Executive Technical Summary for Shift Forecasters:</h4>
                    This handbook establishes the mathematical basis for planetary boundary layer (PBL) parameterization in high-resolution regional weather forecast domains over the Indian subcontinent.
                  </div>

                  <h3 className="text-xs font-extrabold text-white pt-1 border-b border-slate-800 pb-1">
                    1. Governing Planetary Boundary Layer Equations
                  </h3>
                  <p>
                    The turbulent momentum flux divergence in the atmospheric surface layer is parameterized via eddy diffusivity (Km) formulations:
                  </p>
                  <div className="p-3 bg-black/40 rounded-xl font-mono text-blue-300 text-xs border border-slate-800">
                    τ_x = ρ · K_m · (∂u/∂z),   τ_y = ρ · K_m · (∂v/∂z)
                  </div>
                  <p>
                    Where K_m = l² · |∂V/∂z| · f(Ri), and Ri is the gradient Richardson number denoting dynamic stability versus buoyant production of convective turbulence.
                  </p>

                  <h3 className="text-xs font-extrabold text-white pt-1 border-b border-slate-800 pb-1">
                    2. Dual-Polarization Radar Ingestion Guidelines
                  </h3>
                  <p>
                    When Doppler Radar reflectivity moments (Z_H, Z_DR, K_DP, ρ_HV) are ingested into the 3D-Var variational assimilation framework, hydrometeor classification weights must filter out anomalous ground clutter and sea spray returns along coastal radar stations.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── RIGHT: 3-TAB SPLIT PANEL (Notes | AI Summary | Practice Quiz) ─── */}
        {viewMode === "split" && (
          <aside className="w-full lg:w-1/2 bg-[#0c1426] border-l border-slate-800 flex flex-col shrink-0 shadow-2xl z-20 max-h-[50vh] lg:max-h-none overflow-y-auto">
            
            {/* Panel Tabs (Lecture Notes | AI Summary | Practice Quiz) */}
            <div className="p-2.5 sm:p-3 bg-[#101b33] border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 sm:p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                {/* Tab 1: Notes */}
                <button
                  onClick={() => setRightPanelTab("notes")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    rightPanelTab === "notes"
                      ? "bg-amber-500 text-slate-950 font-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>My Notes</span>
                </button>

                {/* Tab 2: AI Summary */}
                <button
                  onClick={() => setRightPanelTab("ai_summary")}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    rightPanelTab === "ai_summary"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow"
                      : "text-slate-400 hover:text-white"
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
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Practice Quiz (AI)</span>
                </button>
              </div>

              {/* Close Split View Button */}
              <button
                onClick={() => setViewMode("standard")}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold shrink-0 ml-2"
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
                    <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-amber-400" />
                      <span>Module Personal Notes</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Auto-saved per module for {selectedMaterial?.title}
                    </p>
                  </div>

                  {lastSavedTime && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> {lastSavedTime}
                    </span>
                  )}
                </div>

                {/* Quick Helper Formatting Toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap p-2 bg-[#121e38] rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setLectureNote(prev => prev + `\n- [${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] `)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-[11px] font-bold"
                  >
                    + Timestamp
                  </button>
                  <button
                    onClick={() => setLectureNote(prev => prev + "\n- **Key Formula:** `CFL = u*dt/dx <= 1.0`")}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-[11px] font-bold"
                  >
                    + Formula
                  </button>
                  <button
                    onClick={() => setLectureNote(prev => prev + "\n- **Observation:** ")}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-[11px] font-bold"
                  >
                    + Bullet
                  </button>
                  <button
                    onClick={handleDownloadNote}
                    disabled={!lectureNote}
                    className="px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-40 ml-auto flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Export (.md)
                  </button>
                </div>

                {/* Main Textarea */}
                <textarea
                  value={lectureNote}
                  onChange={(e) => setLectureNote(e.target.value)}
                  placeholder="Write your personal lecture observations, numerical derivations, meteorological questions, and key takeaways here..."
                  className="flex-1 w-full p-4 rounded-2xl bg-[#09101f] border border-slate-800 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[220px] resize-none"
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
                    className="flex items-center gap-1 text-slate-500 hover:text-rose-400 text-xs font-bold disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>

                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
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
                    <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      Gemini 1.5 Flash
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-1">
                      AI Material Summary & Key Takeaways
                    </h3>
                  </div>

                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={generatingSummary}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingSummary ? "animate-spin" : ""}`} />
                    <span>{generatingSummary ? "Synthesizing..." : "Regenerate"}</span>
                  </button>
                </div>

                {!aiSummary && !generatingSummary && (
                  <div className="p-8 text-center bg-[#101b33] rounded-2xl border border-dashed border-slate-700 space-y-3">
                    <BrainCircuit className="w-10 h-10 text-blue-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">No Summary Generated Yet</h4>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      Click below to analyze this {selectedMaterial?.type?.toUpperCase()} with Gemini AI and generate key takeaways and governing equations.
                    </p>
                    <button
                      onClick={handleGenerateAiSummary}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
                    >
                      ✨ Generate AI Summary Now
                    </button>
                  </div>
                )}

                {generatingSummary && (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-white text-sm">Analyzing {selectedMaterial?.type?.toUpperCase()} Material...</h4>
                    <p className="text-slate-400 text-xs font-mono">
                      Extracting governing formulas, key takeaways, and operational applications...
                    </p>
                  </div>
                )}

                {aiSummary && !generatingSummary && (
                  <div className="space-y-4 text-xs animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 to-[#122248] border border-blue-500/30 text-blue-100 space-y-1.5 shadow-md">
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">Executive Summary</span>
                      <p className="leading-relaxed text-xs">{aiSummary.executiveSummary}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0f1b36] border border-slate-800 space-y-2">
                      <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Core Key Takeaways</span>
                      </h4>
                      <ul className="space-y-2">
                        {(aiSummary.keyTakeaways || []).map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px] leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {aiSummary.coreFormulasAndConcepts && (
                      <div className="p-4 rounded-2xl bg-[#0f1b36] border border-slate-800 space-y-2">
                        <h4 className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                          <FileCode className="w-4 h-4 text-amber-400" />
                          <span>Governing Formulas & Theoretical Definitions</span>
                        </h4>
                        <div className="space-y-1.5">
                          {aiSummary.coreFormulasAndConcepts.map((f, idx) => (
                            <div key={idx} className="p-2.5 bg-black/40 rounded-xl font-mono text-blue-300 text-[11px] border border-slate-800">
                              <code>{f}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSummary.operationalApplications && (
                      <div className="p-4 rounded-2xl bg-[#0f1b36] border border-slate-800 space-y-1.5">
                        <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-sky-400" />
                          <span>Operational Forecasting Applications</span>
                        </h4>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {aiSummary.operationalApplications}
                        </p>
                      </div>
                    )}

                    {aiSummary.examTips && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px]">
                        <b>💡 Certification Exam Highlight:</b> {aiSummary.examTips}
                      </div>
                    )}

                    <button
                      onClick={handleInsertSummaryIntoNotes}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      <span>Insert AI Summary into My Lecture Notes</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═════════ TAB 3: 🎯 PRACTICE QUIZ & PATTERN CLONER ═════════ */}
            {rightPanelTab === "practice_quiz" && (
              <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      Gemini Powered
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-0.5">
                      Interactive Practice Quiz Engine
                    </h3>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPracticeMode("ai_topic")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        practiceMode === "ai_topic"
                          ? "bg-blue-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Topic AI
                    </button>
                    <button
                      onClick={() => setPracticeMode("pattern_clone")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        practiceMode === "pattern_clone"
                          ? "bg-blue-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Pattern Cloner
                    </button>
                  </div>
                </div>

                {/* MODE 1: Topic Generator Controls */}
                {practiceMode === "ai_topic" && (
                  <div className="space-y-3 bg-[#111d38] p-3.5 rounded-2xl border border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase">Target Difficulty</label>
                        <select
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Easy">Easy (Foundational)</option>
                          <option value="Medium">Medium (Operational)</option>
                          <option value="Hard">Hard (Mathematical Dynamics)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase">Question Count</label>
                        <select
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-1 focus:ring-blue-500"
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
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>{generatingQuiz ? "Gemini is Synthesizing MCQs..." : `Generate AI Quiz for "${selectedMaterial?.title?.slice(0, 30)}..."`}</span>
                    </button>
                  </div>
                )}

                {/* MODE 2: Pattern Cloner Controls */}
                {practiceMode === "pattern_clone" && (
                  <div className="space-y-3 bg-[#111d38] p-3.5 rounded-2xl border border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase">Paste Trainer Question to Clone:</label>
                      <textarea
                        rows={2}
                        value={sampleQuestionText}
                        onChange={(e) => setSampleQuestionText(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={quizDifficulty}
                        onChange={(e) => setQuizDifficulty(e.target.value)}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="Medium">Medium Rigor</option>
                        <option value="Hard">Hard Rigor</option>
                        <option value="Easy">Easy Rigor</option>
                      </select>

                      <select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGeneratePatternQuiz}
                      disabled={generatingQuiz}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>{generatingQuiz ? "Cloning Pattern with Gemini..." : "⚡ Generate Pattern Variants"}</span>
                    </button>
                  </div>
                )}

                {/* Live Quiz Runner */}
                {practiceQuestions.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-300">
                        {practiceQuestions.length} Questions Ready
                      </span>
                      {quizFinished && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          Score: {calculateScore().correct}/{calculateScore().total} ({calculateScore().percentage}%)
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {practiceQuestions.map((q, qIndex) => {
                        const isAnswered = userAnswers[qIndex] !== undefined;
                        const isCorrect = userAnswers[qIndex] === q.correctAnswer;

                        return (
                          <div key={q.id || qIndex} className="p-4 rounded-2xl bg-[#0f1b36] border border-slate-800 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-xs text-white leading-snug">
                                {qIndex + 1}. {q.question}
                              </h4>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                                {q.difficulty || "Medium"}
                              </span>
                            </div>

                            {/* Options */}
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIndex) => {
                                const isSelected = userAnswers[qIndex] === optIndex;
                                let btnStyle = "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-blue-500";

                                if (quizFinished) {
                                  if (optIndex === q.correctAnswer) {
                                    btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                                  } else if (isSelected && !isCorrect) {
                                    btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                                  }
                                } else if (isSelected) {
                                  btnStyle = "bg-blue-900/60 border-blue-400 text-white font-bold ring-1 ring-blue-400";
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
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Solution */}
                            {quizFinished && (
                              <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/60 text-[11px] space-y-1 text-blue-200">
                                <p className="font-bold text-blue-300">Pedagogical Solution:</p>
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
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-[1.01]"
                        >
                          Submit & Evaluate ({Object.keys(userAnswers).length}/{practiceQuestions.length})
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUserAnswers({});
                            setQuizFinished(false);
                          }}
                          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
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

    </div>
  );
};
