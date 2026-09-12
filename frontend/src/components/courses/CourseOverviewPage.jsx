import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  User, 
  Layers, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Coins, 
  GraduationCap, 
  KeyRound, 
  Star, 
  Lock, 
  MessageSquare, 
  Send, 
  HelpCircle, 
  BrainCircuit, 
  RefreshCw, 
  SlidersHorizontal,
  Check,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Flame,
  CheckCircle,
  Copy,
  Eye,
  Users,
  ClipboardList,
  BarChart3,
  Plus,
  Building2,
  Search,
  FolderKanban,
  AlertTriangle
} from "lucide-react";
import { api } from "../../services/api";
import { TraineePerformanceDossierModal } from "../trainer/TraineePerformanceDossierModal";
import { QuizEvaluationModal } from "../trainer/QuizEvaluationModal";
import { ExamAnalyticsModal } from "../quiz/ExamAnalyticsModal";

export const CourseOverviewPage = ({ 
  course, 
  currentUser, 
  onBack, 
  onOpenStudio, 
  onEnrollClick,
  onOpenAiGenerator
}) => {
  // Navigation Tabs: "about" | "content" | "feedback" | "trainees" | "quizzes"
  const [activeTab, setActiveTab] = useState("about");
  
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedOutcomes, setExpandedOutcomes] = useState(false);
  const [openSubjectId, setOpenSubjectId] = useState(course?.subjects?.[0]?.id || "");
  
  // Progress & Trainees state
  const [userProgress, setUserProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [courseTrainees, setCourseTrainees] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [selectedSubjectQuizFilter, setSelectedSubjectQuizFilter] = useState("all");

  // Search filters
  const [traineeSearch, setTraineeSearch] = useState("");

  // Modals
  const [selectedTraineeForDossier, setSelectedTraineeForDossier] = useState(null);
  const [selectedQuizForEvaluation, setSelectedQuizForEvaluation] = useState(null);
  const [selectedExamForAnalytics, setSelectedExamForAnalytics] = useState(null);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    trainerRating: 5,
    contentRating: 5,
    relevanceRating: 5,
    recommendScore: 9,
    comment: ""
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const isEnrolled = (course?.enrolledTraineeIds || []).includes(currentUser?.id);

  // Fetch course progress, feedbacks, enrolled trainees & quizzes for this course
  useEffect(() => {
    if (!course?.id) return;

    if (currentUser?.id) {
      setLoadingProgress(true);
      api.getUserProgress(currentUser.id).then(res => {
        if (res.success && res.progress) {
          setUserProgress(res.progress);
        }
      }).catch(() => {}).finally(() => setLoadingProgress(false));
    }

    api.getFeedbacks(course.id).then(res => {
      if (res.success && res.feedbacks) {
        setFeedbacks(res.feedbacks);
      }
    }).catch(() => {});

    // Fetch Trainees for this course
    api.getTrainerEnrolledTrainees(currentUser?.name, currentUser?.id).then(res => {
      if (res.success && res.trainees) {
        const matching = res.trainees.filter(t => 
          t.courseTitle === course.title || 
          t.courseCode === course.code || 
          t.courseId === course.id
        );
        setCourseTrainees(matching.length > 0 ? matching : res.trainees);
      }
    }).catch(() => {});

    // Fetch Quizzes for this course
    api.getQuizzes({ courseId: course.id }).then(res => {
      if (res.success && res.quizzes) {
        setCourseQuizzes(res.quizzes);
      } else {
        setCourseQuizzes([]);
      }
    }).catch(() => {
      setCourseQuizzes([]);
    });
  }, [currentUser?.id, course?.id, course?.title, course?.code]);

  // Calculate completion percentage
  const allModules = course?.subjects?.flatMap(s => s.modules || []) || [];
  const totalModuleCount = allModules.length;
  const completedModuleCount = allModules.filter(m => userProgress[m.id]?.completed).length;
  const progressPercentage = totalModuleCount > 0 
    ? Math.round((completedModuleCount / totalModuleCount) * 100)
    : 0;

  const isCourse100Percent = progressPercentage >= 100 || currentUser?.role === "trainer" || currentUser?.role === "admin";

  // Derive specs counts
  const totalSubjects = course?.subjects?.length || 0;
  const totalModules = totalModuleCount;
  const totalVideos = course?.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type === "video").length || 0), 0) || 0), 0) || 0;
  const totalInteractiveDocs = course?.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type !== "video").length || 0), 0) || 0), 0) || 0;

  // Handle Feedback Submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) return;

    setFeedbackSubmitting(true);
    try {
      const payload = {
        courseId: course.id,
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || "Trainee Officer",
        ...feedbackForm
      };
      const res = await api.submitFeedback(payload);
      if (res.success) {
        setFeedbackSubmitted(true);
        setFeedbacks(prev => [res.feedback || payload, ...prev]);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handlePublishResultsSuccess = (quizId) => {
    setCourseQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, resultsPublished: true } : q));
  };

  const filteredTrainees = courseTrainees.filter(t => 
    (t.name || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.cadreId || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.station || "").toLowerCase().includes(traineeSearch.toLowerCase())
  );

  const filteredQuizzes = courseQuizzes.filter(q => {
    if (selectedSubjectQuizFilter === "all") return true;
    return q.subjectId === selectedSubjectQuizFilter || q.subjectName === selectedSubjectQuizFilter;
  });

  const defaultOutcomes = [
    "Master the fundamental equations, principles, and computational models of this domain.",
    "Formulate verified operational strategies under standard quality assurance frameworks.",
    "Analyze and troubleshoot operational sensor and telemetry datasets with high precision.",
    "Operate modern software workstations and digital simulation platforms independently.",
    "Qualify for MoES and IMD Tier-1 National Professional Competency Certifications."
  ];

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20 select-none">
      
      {/* ─── 1. TOP LIGHT HEADER BANNER (PROFESSIONAL LIGHT UI) ─── */}
      <div className="bg-white border-b border-slate-200 text-slate-900 px-6 sm:px-12 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Back link */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-5 transition-all group bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-[var(--radius)] w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-slate-500" />
            <span>Back to Course Catalog</span>
          </button>

          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                {course.code || "COURSE"}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                {course.category || "Professional Track"}
              </span>
              {currentUser?.role === "trainer" && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  Lead Instructor View
                </span>
              )}
              {isEnrolled && currentUser?.role !== "trainer" && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled ({progressPercentage}%)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span>By <b>{course.department || "Capacity Building Directorate"}</b></span>
              <span>•</span>
              <span>Lead Trainer: <b>{course.leadTrainerName || "Assigned Faculty"}</b></span>
              <span>•</span>
              <span className="text-slate-400 font-mono">{course.level || "Specialized"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN TWO-COLUMN CONTAINER ─── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ─── LEFT COLUMN: Navigation Tabs (About, Content, Enrolled Cadets, Quizzes, Feedback) ─── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab Navigation Header */}
            <div className="bg-white rounded-[var(--radius)] p-2 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === "about"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>About</span>
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === "content"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Curriculum & Materials</span>
              </button>

              {/* Trainer Specific Tabs: Enrolled Cadets & Subject Quizzes */}
              {currentUser?.role === "trainer" && (
                <>
                  <button
                    onClick={() => setActiveTab("trainees")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                      activeTab === "trainees"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Enrolled Cadets ({courseTrainees.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                      activeTab === "quizzes"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Subject Quizzes & Evaluation ({courseQuizzes.length})</span>
                  </button>
                </>
              )}

              {/* Feedback Tab */}
              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === "feedback"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {currentUser?.role === "admin" || currentUser?.role === "trainer"
                    ? `Cadre Feedbacks (${feedbacks.length})`
                    : "Give Feedback"}
                </span>
                {currentUser?.role === "trainee" && !isCourse100Percent && (
                  <Lock className="w-3 h-3 text-amber-500 ml-0.5" />
                )}
              </button>
            </div>

            {/* ═════════ TAB 1: ABOUT ═════════ */}
            {activeTab === "about" && (
              <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-150">
                
                {/* Description */}
                <div className="space-y-2.5">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Course Description</span>
                  </h2>
                  <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${
                    expandedDescription ? "" : "line-clamp-3"
                  }`}>
                    {course.description || "This curriculum provides in-depth technical training, operational procedures, and hands-on modules designed for field deployment and certification."}
                  </p>
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {expandedDescription ? "view less" : "view more"}
                  </button>
                </div>

                {/* Learning Outcomes */}
                <div className="space-y-3">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Learning Outcomes & Core Objectives</span>
                  </h2>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    {(expandedOutcomes ? defaultOutcomes : defaultOutcomes.slice(0, 3)).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2.5 rounded-[var(--radius)] bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setExpandedOutcomes(!expandedOutcomes)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {expandedOutcomes ? "view less" : "view more"}
                  </button>
                </div>

                {/* Prerequisites */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Prerequisites & Skill Requirements</span>
                    </h2>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Verified Criteria
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Array.isArray(course.prerequisites) ? course.prerequisites : [course.prerequisites || "Domain Fundamentals"]).map((prereq, i) => (
                      <div key={i} className="p-3.5 rounded-[var(--radius)] border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-800">{prereq}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-200/70">
                          Mandatory
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competencies */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Mapped Competencies
                  </h2>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Functional
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                      {course.category || "Domain Specialization"}
                    </span>
                    {(course.competenciesGained || []).map((comp, i) => (
                      <span key={i} className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ═════════ TAB 2: CONTENT & UPLOADED MATERIALS ═════════ */}
            {activeTab === "content" && (
              <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Curricula, Lecture Decks & Study Manuals</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Uploaded by official faculty and senior trainers</p>
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {totalSubjects} Subjects • {totalModules} Modules
                  </span>
                </div>

                <div className="space-y-4">
                  {(course.subjects || []).map((subject, sIdx) => {
                    const isOpen = openSubjectId === subject.id || openSubjectId === "";
                    return (
                      <div key={subject.id || sIdx} className="border border-slate-200 rounded-[var(--radius)] overflow-hidden shadow-xs">
                        <button
                          onClick={() => setOpenSubjectId(isOpen ? "__closed" : subject.id)}
                          className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                              Subject {sIdx + 1}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-sm mt-0.5">{subject.name || subject.title}</h3>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="p-4 space-y-3 bg-white border-t border-slate-100">
                            {(subject.modules || []).map((mod, mIdx) => (
                              <div key={mod.id || mIdx} className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-xs text-slate-900 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    <span>{mod.title || mod.name}</span>
                                  </h4>
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                                    <Clock className="w-3 h-3" /> {mod.duration || "4 Hours"}
                                  </span>
                                </div>

                                {/* Materials list with Uploader info */}
                                <div className="space-y-2">
                                  {(mod.materials || []).map((mat, matIdx) => (
                                    <div key={mat.id || matIdx} className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 hover:border-blue-300 transition-all space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                          {mat.type === "video" ? (
                                            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-[var(--radius)]">
                                              <PlayCircle className="w-4 h-4" />
                                            </div>
                                          ) : (
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-[var(--radius)]">
                                              <FileText className="w-4 h-4" />
                                            </div>
                                          )}
                                          <div>
                                            <h5 className="font-medium text-xs text-slate-900">{mat.title}</h5>
                                            <p className="text-[10px] text-slate-500">
                                              {mat.type === "video" ? `Video Lecture • ${mat.duration || "45 mins"}` : `Study Document • ${mat.size || `${mat.pages || 20} pages`}`}
                                            </p>
                                          </div>
                                        </div>

                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                          {mat.allowDownload ? "Downloadable" : "In-Portal"}
                                        </span>
                                      </div>

                                      {/* Trainer info */}
                                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1 font-medium">
                                          <User className="w-3 h-3 text-blue-600" />
                                          <span>Uploaded by: <b>{mat.uploadedBy || course.leadTrainerName || "Faculty Instructor"}</b></span>
                                        </span>
                                        <span className="text-slate-400">
                                          {mat.uploadedAt || "Active Term"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═════════ TAB 3 (TRAINER): ENROLLED CADETS ROSTER ═════════ */}
            {activeTab === "trainees" && currentUser?.role === "trainer" && (
              <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Enrolled Cadets in this Course ({filteredTrainees.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Monitor individual module completions, evaluation marks, and competency dossiers.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search cadet, station, cadre ID..."
                      value={traineeSearch}
                      onChange={(e) => setTraineeSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Trainee Cadet</th>
                        <th className="py-3 px-4">Cadre ID & Station</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Avg Score</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Individual Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTrainees.map((trainee) => (
                        <tr key={trainee.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-[var(--radius)] bg-blue-600 text-white flex items-center justify-center font-medium text-xs shrink-0 shadow-xs">
                                {trainee.name?.split(" ").map(n => n[0]).join("") || "TR"}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs">{trainee.name}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{trainee.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 space-y-0.5">
                            <span className="font-mono font-medium text-slate-800 text-[11px] block">{trainee.cadreId || "—"}</span>
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{trainee.station || "Regional Centre"}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                              <span>{trainee.progressPercentage || 0}%</span>
                              <span className="text-[10px] text-slate-400">({trainee.completedModulesCount || 0}/{trainee.totalModulesCount || 0} Mods)</span>
                            </div>
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${trainee.progressPercentage || 0}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 text-xs">
                              {trainee.avgQuizScore !== undefined ? `${trainee.avgQuizScore}%` : "—"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              trainee.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {trainee.status || "In Progress"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedTraineeForDossier(trainee)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-[var(--radius)] text-xs transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>View Dossier</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═════════ TAB 4 (TRAINER): SUBJECT QUIZZES ═════════ */}
            {activeTab === "quizzes" && currentUser?.role === "trainer" && (
              <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
                
                {/* Header with Filter & Create Quiz */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Subject Quizzes & Evaluation Engine
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assessments are organized by subject. Evaluate submissions and publish results for trainees.
                    </p>
                  </div>

                  <button
                    onClick={onOpenAiGenerator}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105 shrink-0"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Create Subject Quiz</span>
                  </button>
                </div>

                {/* Subject Tabs Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <button
                    onClick={() => setSelectedSubjectQuizFilter("all")}
                    className={`px-3 py-1.5 rounded-[var(--radius)] font-medium whitespace-nowrap transition-all ${
                      selectedSubjectQuizFilter === "all"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    All Subjects ({courseQuizzes.length})
                  </button>
                  {(course.subjects || []).map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => setSelectedSubjectQuizFilter(s.id || s.name)}
                      className={`px-3 py-1.5 rounded-[var(--radius)] font-medium whitespace-nowrap transition-all ${
                        selectedSubjectQuizFilter === (s.id || s.name)
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s.name || s.title}
                    </button>
                  ))}
                </div>

                {/* Quiz Cards Grid */}
                {filteredQuizzes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-[var(--radius)] border border-slate-200">
                    No quizzes scheduled yet for this subject filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5">
                    {filteredQuizzes.map((quiz) => {
                      const isPublished = quiz.resultsPublished;

                      return (
                        <div
                          key={quiz.id}
                          className="bg-white rounded-[var(--radius)] border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all p-6 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-[var(--radius)] text-xs font-medium">
                                {quiz.subjectName || "Subject Assessment"}
                              </span>

                              {isPublished ? (
                                <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Results Published
                                </span>
                              ) : (
                                <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Evaluation
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                <span>{quiz.durationMinutes || 30} Mins</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>{quiz.totalMarks || 40} Marks (Pass: {quiz.passMarks || 20})</span>
                              </span>
                            </div>
                          </div>

                          {/* Title & Info */}
                          <div className="space-y-1">
                            <h3 className="font-black text-slate-900 text-base">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Candidate Submissions: <b className="text-slate-800">{quiz.submissionsCount !== undefined ? quiz.submissionsCount : (quiz.submissions?.length || 0)} Cadets</b>
                            </p>
                          </div>

                          {/* Action Hub */}
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedQuizForEvaluation(quiz)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-xs transition-colors"
                              >
                                <ClipboardList className="w-3.5 h-3.5 text-blue-100" />
                                <span>Evaluate Submissions & Feedback</span>
                              </button>

                              <button
                                onClick={() => setSelectedExamForAnalytics({
                                  id: quiz.id,
                                  title: quiz.title,
                                  subjects: [quiz.subjectName || "Subject Assessment"],
                                  score: `${quiz.averageScore || 0}% Avg`,
                                  totalMarks: quiz.totalMarks || 40,
                                  percentage: quiz.averageScore || 0,
                                  durationMinutes: quiz.durationMinutes || 30,
                                  attempted: quiz.submissionsCount || 0,
                                  questions: quiz.questions || []
                                })}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-[var(--radius)] text-xs transition-colors"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                                <span>Quiz Analytics</span>
                              </button>
                            </div>

                            {!isPublished ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.publishQuizResults(quiz.id, { note: "Directly published by Faculty." });
                                    handlePublishResultsSuccess(quiz.id);
                                  } catch (e) {
                                    console.error("Publish failed:", e);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-xs transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                                <span>Publish Quiz Results</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Scores Visible to Trainees</span>
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ═════════ TAB 5: CADRE FEEDBACKS & REVIEWS ═════════ */}
            {activeTab === "feedback" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Institutional Notice */}
                <div className="p-4 rounded-[var(--radius)] bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-blue-950">
                    <p className="font-extrabold text-blue-900">
                      {currentUser?.role === "admin" || currentUser?.role === "trainer" ? "Quality Audit & Feedback Oversight" : "Course Feedback"}
                    </p>
                    <p className="text-blue-800 leading-relaxed">
                      {currentUser?.role === "admin" || currentUser?.role === "trainer"
                        ? "Institutional feedback submitted by trainees after course completion helps faculty refine lectures and training modules."
                        : "Trainees can submit evaluations after achieving 100% course completion."}
                    </p>
                  </div>
                </div>

                {/* Trainee Form */}
                {currentUser?.role === "trainee" && (
                  <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    {!isCourse100Percent ? (
                      <div className="text-center py-12 px-6 bg-slate-50 rounded-[var(--radius)] border-2 border-dashed border-amber-200 space-y-4">
                        <div className="w-16 h-16 rounded-[var(--radius)] bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                          <Lock className="w-8 h-8" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1.5">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Course Feedback Locked ({progressPercentage}% Completed)
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Official institutional feedback unlocks only after you complete <b>100%</b> of all lectures and modules.
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenStudio(course)}
                          className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105"
                        >
                          Resume Learning to Complete Course
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                          <div>
                            <h2 className="text-base font-extrabold text-slate-900">Official Institutional Feedback Form</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Your evaluation helps refine future curriculum delivery.</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Completed
                          </span>
                        </div>

                        {feedbackSubmitted ? (
                          <div className="p-6 bg-emerald-50 rounded-[var(--radius)] border border-emerald-200 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                              <Check className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-emerald-900">Thank You! Your Feedback Has Been Registered.</h3>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitFeedback} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-2 text-center">
                                <label className="text-xs font-medium text-slate-800">Trainer Delivery & Pedagogy</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, trainerRating: star })}
                                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                                    >
                                      <Star className={`w-5 h-5 ${feedbackForm.trainerRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">{feedbackForm.trainerRating} / 5 Stars</span>
                              </div>

                              <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-2 text-center">
                                <label className="text-xs font-medium text-slate-800">Content & Material Rigor</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, contentRating: star })}
                                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                                    >
                                      <Star className={`w-5 h-5 ${feedbackForm.contentRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">{feedbackForm.contentRating} / 5 Stars</span>
                              </div>

                              <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-2 text-center">
                                <label className="text-xs font-medium text-slate-800">Relevance to Domain</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, relevanceRating: star })}
                                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                                    >
                                      <Star className={`w-5 h-5 ${feedbackForm.relevanceRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">{feedbackForm.relevanceRating} / 5 Stars</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-800">
                                Detailed Remarks & Recommendations:
                              </label>
                              <textarea
                                rows={4}
                                required
                                placeholder="Share your experience on course depth, presentation clarity, and hands-on sessions..."
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                className="w-full p-3.5 rounded-[var(--radius)] border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={feedbackSubmitting}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105 flex items-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              <span>{feedbackSubmitting ? "Submitting..." : "Submit Institutional Evaluation"}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Cadre Reviews Feed */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Uploaded Trainee Feedbacks ({feedbacks.length})</span>
                  </h3>

                  {feedbacks.map((fb, idx) => (
                    <div key={fb.id || idx} className="bg-white rounded-[var(--radius)] p-6 border border-slate-200 shadow-sm space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-600 text-white flex items-center justify-center font-medium text-sm">
                            {fb.traineeName ? fb.traineeName.charAt(0) : "O"}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 text-xs sm:text-sm">{fb.traineeName || "Trainee"}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {fb.cadreId || "CADRE"} • {fb.station || fb.department || "Operations"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-[var(--radius)] border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-black text-amber-900">
                              {(() => {
                                const validRatings = [fb.trainerRating, fb.contentRating, fb.relevanceRating, fb.rating].filter(r => typeof r === "number" && r > 0);
                                if (validRatings.length === 0) return "Not rated";
                                return `${(validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)} / 5.0`;
                              })()}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "Active"}
                          </span>
                        </div>
                      </div>

                      {/* Comment body */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-[var(--radius)] border border-slate-100 whitespace-pre-line">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}

                  {feedbacks.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-[var(--radius)] border border-dashed border-slate-200 p-6">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-700">No feedbacks uploaded yet for this course</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* ─── RIGHT FLOATING SPECIFICATIONS CARD (LIGHT & CLEAN) ─── */}
          <div className="lg:col-span-4 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            
            {/* Top Video Preview box */}
            <div className="h-56 bg-slate-100 relative group overflow-hidden border-b border-slate-200">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-center justify-center">
                <div 
                  onClick={() => onOpenStudio(course)}
                  className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <PlayCircle className="w-8 h-8 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-medium drop-shadow">
                <span>{course.duration || "4 Weeks"}</span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-extrabold">HD Video + Slides</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Main Action Button */}
              {currentUser?.role === "trainer" || currentUser?.role === "admin" ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[var(--radius)] text-sm shadow-sm transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4 text-blue-100" />
                  <span>Launch Learning Studio</span>
                </button>
              ) : isEnrolled ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[var(--radius)] text-sm shadow-sm transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start / Resume Learning</span>
                </button>
              ) : currentUser?.status === "rejected" ? (
                <button
                  onClick={() => alert(`❌ Enrollment Blocked: Profile was rejected.\n\nReason: "${currentUser.rejectionReason || 'Incomplete credentials.'}"`)}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[var(--radius)] text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-200" />
                  <span>Enrollment Locked</span>
                </button>
              ) : currentUser?.status === "pending" ? (
                <button
                  onClick={() => alert("⏳ Enrollment Restricted: Registration is currently under administrative review.")}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-[var(--radius)] text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-slate-900" />
                  <span>Pending Admin Approval</span>
                </button>
              ) : (
                <button
                  onClick={() => onEnrollClick(course)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[var(--radius)] text-sm shadow-sm transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Enroll in Course</span>
                </button>
              )}

              {/* 8-Grid Specs Icons */}
              <div className="grid grid-cols-4 gap-4 text-center border-t border-b border-slate-100 py-6">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-700">{course.duration?.split(" ")[0] || "4w"}</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-700">{totalModules} Modules</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-700">{totalVideos} Videos</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-medium text-slate-700 leading-tight">{totalInteractiveDocs} Docs</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-700">Free</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-medium text-slate-700 leading-tight">Blended</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-medium text-slate-700 leading-tight">CC BY 4.0</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-medium text-slate-700 leading-tight">Verified</span>
                </div>
              </div>

              {/* Creators Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-900">Lead Faculty & Creators</h3>
                <div className="flex items-center gap-3.5 p-3 rounded-[var(--radius)] bg-slate-50 border border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {course.leadTrainerName?.split(" ")?.map(n => n[0])?.slice(0, 2)?.join("") || "AS"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{course.leadTrainerName || "Faculty Instructor"}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{course.department || "Capacity Directorate"}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ═════════ MODALS ═════════ */}
      {selectedTraineeForDossier && (
        <TraineePerformanceDossierModal
          trainee={selectedTraineeForDossier}
          onClose={() => setSelectedTraineeForDossier(null)}
        />
      )}

      {selectedQuizForEvaluation && (
        <QuizEvaluationModal
          quiz={selectedQuizForEvaluation}
          currentUser={currentUser}
          onClose={() => setSelectedQuizForEvaluation(null)}
          onResultsPublished={handlePublishResultsSuccess}
        />
      )}

      {selectedExamForAnalytics && (
        <ExamAnalyticsModal
          exam={selectedExamForAnalytics}
          currentUser={currentUser}
          onClose={() => setSelectedExamForAnalytics(null)}
        />
      )}

    </div>
  );
};
