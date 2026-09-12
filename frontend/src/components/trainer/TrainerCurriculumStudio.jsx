import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Video, 
  Presentation, 
  FileText, 
  FileCode, 
  Plus, 
  Upload, 
  Eye, 
  Sparkles, 
  BarChart3, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Users, 
  Trash2, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ExternalLink,
  ChevronDown,
  Bookmark,
  Lock,
  Unlock,
  HelpCircle,
  CheckSquare,
  PlusCircle,
  Database,
  Sliders,
  Check,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { api } from "../../services/api";
import { ContentGalleryPickerModal } from "./ContentGalleryPickerModal";
import { cleanSubject, cleanTopic } from "./ContentLibraryView";

export const TrainerCurriculumStudio = ({
  course,
  initialSubjectId,
  currentUser,
  onBack,
  onOpenContentLibrary,
  onOpenAiGenerator,
  onOpenAnalytics
}) => {
  const [currentCourse, setCurrentCourse] = useState(course);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    initialSubjectId || course?.subjects?.[0]?.id || "subj_01"
  );
  const [loading, setLoading] = useState(false);
  const [galleryPickerModule, setGalleryPickerModule] = useState(null); // module object
  const [previewItem, setPreviewItem] = useState(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [notification, setNotification] = useState(null);

  // ─── CONTROLLED PROGRESSION PATH STATE (TRAINER MASTER TOGGLE) ───
  const [isLockPathEnabled, setIsLockPathEnabled] = useState(
    course?.controlledLearningPathEnabled !== false
  );

  // New Module Creation State
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    duration: "4 Hours",
    description: ""
  });

  // ─── VIDEO QUIZ AUTHORING MODAL STATE (AI / QUESTION BANK / MANUAL) ───
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizTargetModule, setQuizTargetModule] = useState(null);
  const [quizTargetVideo, setQuizTargetVideo] = useState(null);
  const [quizCreationMode, setQuizCreationMode] = useState("ai"); // "ai" | "bank" | "manual"
  
  // AI Generation Form
  const [aiQuizTopic, setAiQuizTopic] = useState("");
  const [aiQuizCount, setAiQuizCount] = useState(3);
  const [aiQuizMarksPerQuestion, setAiQuizMarksPerQuestion] = useState(5);
  const [aiQuizDifficulty, setAiQuizDifficulty] = useState("Medium");
  const [generatingAiQuestions, setGeneratingAiQuestions] = useState(false);

  // Question Bank Selection State
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState([]);

  // Prepared Quiz Questions List
  const [stagedQuestions, setStagedQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState("15 Mins");
  const [quizPassPercentage, setQuizPassPercentage] = useState(50);
  const [enforcePrecedingVideoPrereq, setEnforcePrecedingVideoPrereq] = useState(true);
  const [enforceDownstreamLockPrereq, setEnforceDownstreamLockPrereq] = useState(true);

  // Sync course state
  useEffect(() => {
    if (course?.id) {
      fetchFreshCourseData();
    }
  }, [course?.id]);

  const fetchFreshCourseData = async () => {
    try {
      const res = await api.getCourseById(course.id);
      if (res.success && res.course) {
        setCurrentCourse(res.course);
        setIsLockPathEnabled(res.course.controlledLearningPathEnabled !== false);
        if (!selectedSubjectId && res.course.subjects?.length > 0) {
          setSelectedSubjectId(res.course.subjects[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to refresh course studio:", err);
    }
  };

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ─── TOGGLE CONTROLLED PROGRESSION PATH (MASTER ON/OFF) ───
  const handleToggleControlledPath = async () => {
    const nextState = !isLockPathEnabled;
    setIsLockPathEnabled(nextState);
    try {
      await api.updateCourse(currentCourse.id, { controlledLearningPathEnabled: nextState });
      showToast(
        nextState 
          ? "🔒 Controlled Learning Path enabled: Trainees must satisfy video 80% watch threshold & quiz passing gates." 
          : "🔓 Open Exploration Mode enabled: All lock gates bypassed for trainees."
      );
    } catch (e) {
      showToast("Controlled path mode updated locally.");
    }
  };

  const currentSubject = currentCourse?.subjects?.find(
    s => s.id === selectedSubjectId || s.name === selectedSubjectId
  ) || currentCourse?.subjects?.[0] || {
    id: "subj_01",
    name: "Atmospheric Dynamics & Modeling",
    code: "S1",
    modules: []
  };

  // Calculate material totals
  const allModules = currentSubject?.modules || [];
  let totalVideos = 0;
  let totalQuizzes = 0;
  let totalPpts = 0;
  let totalPdfs = 0;
  let totalManuals = 0;

  allModules.forEach(mod => {
    (mod.materials || []).forEach(mat => {
      const t = (mat.type || "").toLowerCase();
      if (t === "quiz") totalQuizzes++;
      else if (t.includes("video") || t.includes("lecture") || t.includes("mp4")) totalVideos++;
      else if (t.includes("ppt") || t.includes("presentation")) totalPpts++;
      else if (t.includes("manual") || t.includes("lab")) totalManuals++;
      else totalPdfs++;
    });
  });

  const handleRemoveMaterial = async (moduleId, materialId, materialTitle) => {
    if (!window.confirm(`Remove "${materialTitle}" from this curriculum module?`)) return;

    try {
      setLoading(true);
      const res = await api.removeMaterialFromModule(
        currentCourse.id, 
        currentSubject.id, 
        moduleId, 
        materialId
      );

      if (res.success) {
        showToast(`Removed "${materialTitle}" from module.`);
        await fetchFreshCourseData();
      } else {
        showToast(res.message || "Failed to remove material", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialAttachedSuccess = async (moduleId, attachedItems) => {
    showToast(`Attached ${attachedItems.length} material(s) to module!`);
    await fetchFreshCourseData();
  };

  const handleCreateModuleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) {
      showToast("Please enter a module title / topic", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: moduleForm.title.trim(),
        duration: moduleForm.duration.trim() || "4 Hours",
        description: moduleForm.description.trim() || "Operational module guidelines and instructional sessions."
      };
      const res = await api.addModuleToSubject(currentCourse.id, currentSubject.id, payload);
      if (res.success) {
        showToast(`Module "${payload.title}" created successfully!`);
        setIsCreateModuleModalOpen(false);
        setModuleForm({ title: "", duration: "4 Hours", description: "" });
        await fetchFreshCourseData();
        if (res.module) {
          setGalleryPickerModule(res.module);
        }
      } else {
        showToast(res.message || "Failed to create module", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (!window.confirm(`Delete module "${moduleTitle}" and all attached learning resources?`)) return;

    setLoading(true);
    try {
      const res = await api.deleteModuleFromSubject(currentCourse.id, currentSubject.id, moduleId);
      if (res.success) {
        showToast(`Module "${moduleTitle}" removed.`);
        await fetchFreshCourseData();
      } else {
        showToast(res.message || "Failed to delete module", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── OPEN QUIZ CREATOR MODAL BELOW TARGET VIDEO ───
  const handleOpenQuizModal = (moduleItem, videoItem = null) => {
    setQuizTargetModule(moduleItem);
    setQuizTargetVideo(videoItem);

    const defaultTitle = videoItem 
      ? `Video Quiz: ${videoItem.title.replace(/^Video \d+:\s*/i, "").substring(0, 35)} Check`
      : `Module Assessment Quiz: ${moduleItem.title.substring(0, 35)}`;
    
    setQuizTitle(defaultTitle);
    setAiQuizTopic(videoItem?.title || moduleItem.title);
    setStagedQuestions([]);
    setSelectedBankQuestionIds([]);
    setQuizCreationMode("ai");
    setIsQuizModalOpen(true);
  };

  // ─── GENERATE QUIZ QUESTIONS WITH AI QUESTION GENERATOR ───
  const handleGenerateAiQuizQuestions = async () => {
    if (generatingAiQuestions) return;
    setGeneratingAiQuestions(true);
    try {
      const payload = {
        topic: aiQuizTopic || currentSubject.name,
        difficulty: aiQuizDifficulty,
        count: aiQuizCount,
        courseName: currentCourse.title
      };
      const res = await api.generateAiQuestions(payload);
      if (res.success && res.generatedQuestions) {
        const mapped = res.generatedQuestions.map((q, idx) => ({
          id: `ai_q_${Date.now()}_${idx}`,
          question: q.question,
          options: q.options || ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
          marks: Number(aiQuizMarksPerQuestion) || 5,
          explanation: q.explanation || "Scientifically verified operational response."
        }));
        setStagedQuestions(mapped);
        showToast(`✨ Generated ${mapped.length} technical MCQs with AI Question Generator!`);
      } else {
        showToast(res.message || "Failed to generate AI questions", "error");
      }
    } catch (err) {
      showToast("AI Generation error: " + err.message, "error");
    } finally {
      setGeneratingAiQuestions(false);
    }
  };

  // ─── FETCH QUESTION BANK QUESTIONS ───
  const handleFetchBankQuestions = async () => {
    if (bankQuestions.length > 0) return;
    setLoadingBankQuestions(true);
    try {
      const res = await api.getQuestions();
      if (res.success && res.questions) {
        setBankQuestions(res.questions);
      }
    } catch (err) {
      console.error("Error loading bank questions:", err);
    } finally {
      setLoadingBankQuestions(false);
    }
  };

  // ─── TOGGLE BANK QUESTION SELECTION ───
  const handleToggleBankQuestion = (q) => {
    const isSelected = selectedBankQuestionIds.includes(q.id);
    if (isSelected) {
      setSelectedBankQuestionIds(prev => prev.filter(id => id !== q.id));
      setStagedQuestions(prev => prev.filter(item => item.id !== q.id));
    } else {
      setSelectedBankQuestionIds(prev => [...prev, q.id]);
      setStagedQuestions(prev => [
        ...prev,
        {
          id: q.id,
          question: q.question || q.text,
          options: q.options || ["A", "B", "C", "D"],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
          marks: Number(q.marks) || 5,
          explanation: q.explanation || ""
        }
      ]);
    }
  };

  // ─── SAVE & ATTACH QUIZ TO CURRICULUM BELOW VIDEO ───
  const handleSaveQuizToCurriculum = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      showToast("Please enter a title for the quiz", "error");
      return;
    }

    if (stagedQuestions.length === 0) {
      showToast("Please generate or select at least 1 question for the quiz", "error");
      return;
    }

    setLoading(true);
    try {
      const totalMarks = stagedQuestions.reduce((acc, q) => acc + (Number(q.marks) || 5), 0);
      const newQuizId = `mat_quiz_${Date.now()}`;

      // Build Prerequisite Config
      let prereqConfig = {
        enabled: false,
        condition: "ALL",
        requiredWatchThreshold: 80,
        prerequisites: []
      };

      if (enforcePrecedingVideoPrereq && quizTargetVideo) {
        prereqConfig = {
          enabled: true,
          condition: "ALL",
          requiredWatchThreshold: 80,
          prerequisites: [
            {
              id: quizTargetVideo.id,
              title: quizTargetVideo.title,
              type: "video",
              requiredWatchPct: 80
            }
          ]
        };
      }

      const quizPayload = {
        id: newQuizId,
        title: quizTitle.trim(),
        type: "quiz",
        duration: quizDuration,
        durationSeconds: 900,
        allowDownload: false,
        uploadedBy: currentUser?.name ? `${currentUser.name} (Trainer)` : "Dr. Amit Sengupta",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        totalMarks,
        passPercentage: Number(quizPassPercentage) || 50,
        prerequisiteConfig: prereqConfig,
        questions: stagedQuestions
      };

      // Insert immediately after quizTargetVideo in module materials:
      const updatedSubjects = currentCourse.subjects.map(sub => {
        if (sub.id !== currentSubject.id) return sub;
        return {
          ...sub,
          modules: (sub.modules || []).map(mod => {
            if (mod.id !== quizTargetModule.id) return mod;
            const currentMats = mod.materials || [];
            const insertIdx = quizTargetVideo ? currentMats.findIndex(m => m.id === quizTargetVideo.id) : currentMats.length - 1;
            
            let nextMats = [];
            if (insertIdx === -1) {
              nextMats = [...currentMats, quizPayload];
            } else {
              nextMats = [
                ...currentMats.slice(0, insertIdx + 1),
                quizPayload,
                ...currentMats.slice(insertIdx + 1)
              ];

              // If enforceDownstreamLockPrereq is on, chain subsequent material to require this quiz
              if (enforceDownstreamLockPrereq && insertIdx + 1 < currentMats.length) {
                const downstreamMat = nextMats[insertIdx + 2];
                if (downstreamMat) {
                  const existingPrereqs = downstreamMat.prerequisiteConfig?.prerequisites || [];
                  nextMats[insertIdx + 2] = {
                    ...downstreamMat,
                    prerequisiteConfig: {
                      enabled: true,
                      condition: downstreamMat.prerequisiteConfig?.condition || "ALL",
                      requiredWatchThreshold: 80,
                      prerequisites: [
                        ...existingPrereqs.filter(p => p.id !== quizTargetVideo?.id),
                        {
                          id: quizPayload.id,
                          title: quizPayload.title,
                          type: "quiz",
                          requiredPassScore: quizPayload.passPercentage
                        }
                      ]
                    }
                  };
                }
              }
            }

            return {
              ...mod,
              materials: nextMats
            };
          })
        };
      });

      await api.updateCourse(currentCourse.id, { subjects: updatedSubjects });
      await fetchFreshCourseData();
      setIsQuizModalOpen(false);
      showToast(`✓ Video Quiz "${quizPayload.title}" successfully added below "${quizTargetVideo?.title || "Module"}" with ${stagedQuestions.length} questions!`);

    } catch (err) {
      showToast("Failed attaching quiz: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper Icon getter
  const getItemIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "quiz") {
      return <HelpCircle className="w-4 h-4 text-indigo-600" />;
    }
    if (t.includes("video") || t.includes("lecture") || t.includes("mp4")) {
      return <Video className="w-4 h-4 text-blue-600" />;
    }
    if (t.includes("ppt") || t.includes("presentation")) {
      return <Presentation className="w-4 h-4 text-amber-600" />;
    }
    if (t.includes("manual") || t.includes("lab")) {
      return <FileCode className="w-4 h-4 text-emerald-600" />;
    }
    return <FileText className="w-4 h-4 text-rose-600" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius)] bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${notification.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* ═════════ 1. HERO BAR: COURSE METADATA & CONTROLLED PATH MASTER ON/OFF ═════════ */}
      <div className="bg-white rounded-[var(--radius)] p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-[#0a2558] text-slate-700 hover:text-white rounded-[var(--radius)] font-semibold transition-all shadow-xs flex items-center gap-1.5 text-xs"
            title="Return to Trainer Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Studio</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#0a2558] border border-blue-200 rounded-[var(--radius)] font-extrabold text-[10px] uppercase tracking-wider">
                {currentCourse?.code || "MOES-IMD-NWP-2025"}
              </span>
              <span className="text-xs font-medium text-slate-400">Curriculum Management Studio</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {currentCourse?.title || "Advanced Numerical Weather Prediction (NWP) & Data Assimilation"}
            </h1>
          </div>
        </div>

        {/* Global Action Strip + Controlled Path Master ON/OFF Switch */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          
          {/* 🔒 MASTER CONTROLLED PATH ON/OFF SWITCH */}
          <button
            onClick={handleToggleControlledPath}
            title="Trainer Rule: Toggle strict video watch threshold & quiz unlock constraints on/off"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius)] text-xs font-extrabold shadow-sm transition-all ${
              isLockPathEnabled 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {isLockPathEnabled ? (
              <>
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>Controlled Path:</span>
                <span className="bg-indigo-800/80 px-1.5 py-0.5 rounded text-[10px] uppercase">ON (Strict)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-white" />
                <span>Controlled Path:</span>
                <span className="bg-amber-700/80 px-1.5 py-0.5 rounded text-[10px] uppercase">OFF (Open)</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenContentLibrary && onOpenContentLibrary(currentSubject?.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-extrabold rounded-[var(--radius)] text-xs transition-colors shadow-2xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Content Library</span>
          </button>

          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 font-extrabold rounded-[var(--radius)] text-xs border border-blue-200 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Generate Subject Quiz</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold rounded-[var(--radius)] text-xs border border-purple-200 transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
            <span>Subject Analytics</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. ASSIGNED SUBJECT TABS & STATS ═════════ */}
      <div className="bg-white rounded-[var(--radius)] border border-slate-200 p-6 shadow-sm space-y-6">
        
        {/* Subject Header, Badges & Create Module Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[var(--radius)] bg-[#0a2558] text-amber-400 font-black text-base flex items-center justify-center shadow-md">
              {currentSubject?.code || "S1"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded text-[10px]">
                  {allModules.length} Modules
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Program: <b>{currentCourse?.title}</b> ({currentCourse?.code})
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {cleanSubject(currentSubject?.name || "Atmospheric Dynamics & Modeling")}
              </h2>
            </div>
          </div>

          {/* Quick Stats Badges & Create New Module Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-[var(--radius)] text-xs font-extrabold border border-blue-200">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>{totalVideos} Videos</span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-900 rounded-[var(--radius)] text-xs font-extrabold border border-indigo-200">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>{totalQuizzes} Quizzes</span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 rounded-[var(--radius)] text-xs font-extrabold border border-amber-200">
              <Presentation className="w-3.5 h-3.5 text-amber-600" />
              <span>{totalPpts} PPTs</span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-900 rounded-[var(--radius)] text-xs font-extrabold border border-purple-200">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>{totalPdfs} PDFs</span>
            </span>

            <button
              onClick={() => setIsCreateModuleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 active:scale-95 ml-1"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Upload New Module</span>
            </button>
          </div>
        </div>

        {/* ═════════ 3. MODULE CARDS GRID ═════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allModules.map((moduleItem, modIdx) => {
            const materials = moduleItem.materials || [];
            return (
              <div 
                key={moduleItem.id || modIdx}
                className="bg-white rounded-[var(--radius)] border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                {/* Module Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-400 uppercase tracking-wider font-extrabold">
                      MODULE {modIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{moduleItem.duration || "4 Hours"}</span>
                      </span>
                      <button
                        onClick={() => handleDeleteModule(moduleItem.id, moduleItem.title)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-[var(--radius)] transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {cleanTopic(moduleItem.title)}
                  </h3>
                  {moduleItem.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {moduleItem.description}
                    </p>
                  )}
                </div>

                {/* Materials List (With dedicated "+ Upload Quiz Below Video" buttons) */}
                <div className="space-y-2 flex-1">
                  {materials.length === 0 ? (
                    <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                      <p className="text-xs font-medium text-slate-600">No learning materials attached yet</p>
                      <p className="text-[10px] text-slate-400">Click below to upload from your Content Library</p>
                    </div>
                  ) : (
                    materials.map((mat, matIdx) => {
                      const isVideo = (mat.type || "").toLowerCase().includes("video") || (mat.type || "").toLowerCase().includes("lecture");
                      const isQuiz = (mat.type || "").toLowerCase() === "quiz";

                      return (
                        <div key={mat.id || matIdx} className="space-y-1.5">
                          <div
                            className={`p-3 rounded-[var(--radius)] border flex items-center justify-between gap-3 text-xs transition-colors group ${
                              isQuiz 
                                ? "bg-indigo-50/70 border-indigo-200 hover:bg-indigo-100/70" 
                                : "bg-slate-50/70 hover:bg-blue-50/50 border-slate-200/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-[var(--radius)] border shrink-0 ${isQuiz ? "bg-indigo-100 border-indigo-300" : "bg-white border-slate-200"}`}>
                                {getItemIcon(mat.type)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isQuiz && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-200 text-indigo-900 uppercase">
                                      QUIZ GATE
                                    </span>
                                  )}
                                  <p className="font-medium text-slate-900 truncate text-xs">
                                    {mat.title}
                                  </p>
                                </div>

                                <span className="text-[10px] text-slate-500 font-medium">
                                  {isQuiz 
                                    ? `${mat.questions?.length || 2} Questions • ${mat.totalMarks || 10} Marks • Min Pass ${mat.passPercentage || 50}%`
                                    : `${mat.duration || mat.pages ? `${mat.duration || `${mat.pages} Pgs`} • ` : ""}${mat.size || "3.5 MB"}`}
                                  {mat.prerequisiteConfig?.enabled && (
                                    <span className="text-amber-700 font-medium ml-1">
                                      • 🔒 Prerequisite Linked
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Action buttons on item */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setPreviewItem({
                                    ...mat,
                                    subject: currentSubject.name,
                                    topic: moduleItem.title
                                  });
                                  setCurrentSlideIndex(0);
                                  setCurrentPageIndex(0);
                                }}
                                className="p-1.5 bg-white hover:bg-[#0a2558] text-slate-600 hover:text-white border border-slate-200 rounded-[var(--radius)] text-xs font-medium transition-colors shadow-2xs"
                                title="Preview Full Material"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleRemoveMaterial(moduleItem.id, mat.id, mat.title)}
                                className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-[var(--radius)] text-xs font-medium transition-colors shadow-2xs opacity-0 group-hover:opacity-100"
                                title="Remove from Module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 🎬 DEDICATED BUTTON TO UPLOAD QUIZ BELOW THIS VIDEO */}
                          {isVideo && (
                            <div className="flex items-center justify-end px-2 pt-0.5">
                              <button
                                onClick={() => handleOpenQuizModal(moduleItem, mat)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black transition-all hover:scale-105 shadow-xs"
                              >
                                <PlusCircle className="w-3 h-3 text-indigo-600" />
                                <span>+ Upload Quiz Below This Video</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Module Footer & Upload Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Uploaded by: <b className="text-slate-700">{currentUser?.name || "Dr. Amit Sengupta"}</b>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenQuizModal(moduleItem, null)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-extrabold rounded-[var(--radius)] text-xs shadow-2xs transition-all hover:scale-105"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>+ Add Video Quiz</span>
                    </button>

                    <button
                      onClick={() => setGalleryPickerModule(moduleItem)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071739] text-white font-extrabold rounded-[var(--radius)] text-xs shadow-xs transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Material</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Add New Curriculum Module Dashed Card */}
          <div
            onClick={() => setIsCreateModuleModalOpen(true)}
            className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/80 rounded-[var(--radius)] p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-[var(--radius)] bg-[#0a2558] text-white flex items-center justify-center font-medium shadow-md group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Add New Curriculum Module</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-0.5">
                Define a new lecture topic or practical session for {cleanSubject(currentSubject?.name)}
              </p>
            </div>
            <span className="px-4 py-1.5 bg-white text-blue-900 rounded-[var(--radius)] text-xs font-extrabold border border-blue-200 shadow-2xs group-hover:bg-[#0a2558] group-hover:text-white transition-colors">
              + Upload / Create Module
            </span>
          </div>
        </div>

      </div>

      {/* ═════════ MODAL: CREATE / UPLOAD VIDEO QUIZ (AI / QUESTION BANK / MANUAL) ═════════ */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
          <div className="bg-white rounded-[var(--radius)] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-800 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 font-medium">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                    TRAINER VIDEO QUIZ AUTHORING
                  </span>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                    {quizTargetVideo ? `Upload Quiz Below: "${quizTargetVideo.title?.substring(0, 32)}..."` : "Create In-Module Assessment Quiz"}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 rounded-[var(--radius)] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveQuizToCurriculum} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              
              {/* Quiz Title & Pass Score */}
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-800 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Video Quiz: Primitive Equations & Geostrophic Advection Check"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      value={quizDuration}
                      onChange={(e) => setQuizDuration(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Passing Grade Requirement</label>
                    <select
                      value={quizPassPercentage}
                      onChange={(e) => setQuizPassPercentage(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium text-slate-900"
                    >
                      <option value={50}>50% Passing Score (Standard)</option>
                      <option value={70}>70% Passing Score (Rigor)</option>
                      <option value={80}>80% Passing Score (Mastery)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3 QUESTION SOURCE MODES (AI / QUESTION BANK / MANUAL) */}
              <div className="space-y-3">
                <label className="block font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                  Choose How to Build Quiz Questions:
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizCreationMode("ai")}
                    className={`p-2.5 rounded-[var(--radius)] border text-center font-medium flex flex-col items-center gap-1 transition-all ${
                      quizCreationMode === "ai"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-400 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px]">1. Generate with AI ✨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuizCreationMode("bank");
                      handleFetchBankQuestions();
                    }}
                    className={`p-2.5 rounded-[var(--radius)] border text-center font-medium flex flex-col items-center gap-1 transition-all ${
                      quizCreationMode === "bank"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-400 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px]">2. Select from Bank 📚</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuizCreationMode("manual");
                      if (stagedQuestions.length === 0) {
                        setStagedQuestions([
                          {
                            id: `manual_q_${Date.now()}`,
                            question: "In operational NWP, what does the CFL stability condition ensure?",
                            options: ["Courant number ≤ 1.0", "Infinite time step", "Zero geopotential slope", "Non-hydrostatic divergence"],
                            correctAnswer: 0,
                            marks: 5,
                            explanation: "The CFL condition ensures computational stability in explicit advection."
                          }
                        ]);
                      }
                    }}
                    className={`p-2.5 rounded-[var(--radius)] border text-center font-medium flex flex-col items-center gap-1 transition-all ${
                      quizCreationMode === "manual"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-400 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px]">3. Custom MCQs ✍️</span>
                  </button>
                </div>
              </div>

              {/* MODE 1: AI QUESTION GENERATOR */}
              {quizCreationMode === "ai" && (
                <div className="p-4 bg-indigo-50/70 rounded-[var(--radius)] border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>AI Question Generator</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-700 font-medium bg-white px-2 py-0.5 rounded border border-indigo-200">
                      SOP Validated
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-indigo-900 uppercase mb-1">Topic Name</label>
                    <input
                      type="text"
                      value={aiQuizTopic}
                      onChange={(e) => setAiQuizTopic(e.target.value)}
                      placeholder="e.g. Navier-Stokes equations, sigma vertical coordinate, PBL closures"
                      className="w-full p-2 bg-white border border-indigo-200 rounded-[var(--radius)] text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-indigo-900 uppercase mb-1">Question Count</label>
                      <select
                        value={aiQuizCount}
                        onChange={(e) => setAiQuizCount(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-[var(--radius)] text-xs font-medium"
                      >
                        <option value={1}>1 MCQ</option>
                        <option value={2}>2 MCQs</option>
                        <option value={3}>3 MCQs</option>
                        <option value={5}>5 MCQs</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-indigo-900 uppercase mb-1">Marks Each</label>
                      <select
                        value={aiQuizMarksPerQuestion}
                        onChange={(e) => setAiQuizMarksPerQuestion(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-[var(--radius)] text-xs font-medium"
                      >
                        <option value={2}>2 Marks</option>
                        <option value={5}>5 Marks</option>
                        <option value={10}>10 Marks</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-indigo-900 uppercase mb-1">Difficulty</label>
                      <select
                        value={aiQuizDifficulty}
                        onChange={(e) => setAiQuizDifficulty(e.target.value)}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-[var(--radius)] text-xs font-medium"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiQuizQuestions}
                    disabled={generatingAiQuestions}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                  >
                    <Sparkles className={`w-4 h-4 ${generatingAiQuestions ? "animate-spin" : ""}`} />
                    <span>{generatingAiQuestions ? "Synthesizing Questions with AI..." : "✨ Synthesize Questions with AI"}</span>
                  </button>
                </div>
              )}

              {/* MODE 2: SELECT FROM QUESTION BANK */}
              {quizCreationMode === "bank" && (
                <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Pick Questions from Question Bank</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium">
                      {selectedBankQuestionIds.length} Selected
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      placeholder="Filter by question keyword or topic..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-[var(--radius)] text-xs"
                    />
                  </div>

                  {loadingBankQuestions ? (
                    <div className="p-6 text-center text-xs text-slate-500 font-mono">
                      Loading Question Bank repository...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {bankQuestions
                        .filter(q => !bankSearchQuery || (q.question || q.text || "").toLowerCase().includes(bankSearchQuery.toLowerCase()))
                        .map(q => {
                          const isSelected = selectedBankQuestionIds.includes(q.id);
                          return (
                            <div
                              key={q.id}
                              onClick={() => handleToggleBankQuestion(q)}
                              className={`p-3 rounded-[var(--radius)] border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                                isSelected ? "bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400" : "bg-white border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="mt-0.5 accent-indigo-600 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 text-xs line-clamp-2">
                                  {q.question || q.text}
                                </p>
                                <span className="text-[10px] text-slate-500">
                                  {q.topic || "Dynamics"} • {q.marks || 5} Marks • {q.difficulty || "Medium"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* STAGED QUESTIONS PREVIEW LIST */}
              {stagedQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">
                      Quiz Questions Preview ({stagedQuestions.length} Items • {stagedQuestions.reduce((acc, q) => acc + (Number(q.marks) || 5), 0)} Marks Total):
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {stagedQuestions.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-slate-900 leading-tight">
                            {qIdx + 1}. {q.question}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-mono text-[10px] font-black shrink-0 border border-indigo-200">
                            {q.marks || 5} Marks
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Options: {q.options?.join(" | ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AUTOMATED CONTROLLED PROGRESSION RULE WIRING */}
              <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-[var(--radius)] space-y-2 text-indigo-950">
                <span className="font-extrabold text-xs block text-indigo-900">
                  🔒 Automated Learning Path Progression Rule:
                </span>
                
                <label className="flex items-start gap-2 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={enforcePrecedingVideoPrereq}
                    onChange={(e) => setEnforcePrecedingVideoPrereq(e.target.checked)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <span>
                    Require preceding video <b>(≥ 80% watch threshold)</b> before trainee can unlock and attempt this quiz.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={enforceDownstreamLockPrereq}
                    onChange={(e) => setEnforceDownstreamLockPrereq(e.target.checked)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <span>
                    Require trainee to <b>pass this quiz (≥ {quizPassPercentage}%)</b> before downstream materials become unlocked.
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || stagedQuestions.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Attach Quiz to Curriculum ({stagedQuestions.length} Questions)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ═════════ MODAL: CREATE NEW MODULE ═════════ */}
      {isCreateModuleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
          <div className="bg-white rounded-[var(--radius)] shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800 my-auto">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#12397e] text-white flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  CURRICULUM STRUCTURING
                </span>
                <h3 className="text-lg font-black tracking-tight mt-1 text-white">
                  Add New Module in {cleanSubject(currentSubject?.name)}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModuleModalOpen(false)}
                className="w-9 h-9 rounded-[var(--radius)] bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateModuleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">
                  Module Title / Curriculum Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tropical Easterly Jet & Monsoonal Synoptic Dynamics"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full p-3 rounded-[var(--radius)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">Allocated Instructional Hours</label>
                <select
                  value={moduleForm.duration}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                  className="w-full p-3 rounded-[var(--radius)] border border-slate-200 font-medium"
                >
                  <option value="2 Hours">2 Instructional Hours</option>
                  <option value="4 Hours">4 Instructional Hours (Standard)</option>
                  <option value="6 Hours">6 Instructional Hours</option>
                  <option value="8 Hours">8 Instructional Hours (In-depth)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">Pedagogical Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of learning objectives, mathematical derivations, or forecasting radar operations..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full p-3 rounded-[var(--radius)] border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModuleModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>{loading ? "Creating Module..." : "Create Module & Add Materials"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════ MODAL: CONTENT GALLERY PICKER (ATTACH FROM LIBRARY) ═════════ */}
      {galleryPickerModule && (
        <ContentGalleryPickerModal
          isOpen={!!galleryPickerModule}
          onClose={() => setGalleryPickerModule(null)}
          course={currentCourse}
          subject={currentSubject}
          moduleItem={galleryPickerModule}
          currentUser={currentUser}
          onAttachedSuccess={(items) => {
            handleMaterialAttachedSuccess(galleryPickerModule.id, items);
            setGalleryPickerModule(null);
          }}
        />
      )}

    </div>
  );
};
