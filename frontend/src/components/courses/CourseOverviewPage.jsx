import React, { useState, useEffect } from "react";
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
  ChevronDown, 
  Sparkles, 
  Coins, 
  GraduationCap, 
  KeyRound, 
  Star, 
  Lock, 
  MessageSquare, 
  Send, 
  Check, 
  Eye, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Plus, 
  Building2, 
  Search, 
  AlertTriangle,
  Activity,
  TrendingUp,
  Zap,
  HelpCircle,
  XCircle,
  ThumbsUp
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
  const [activeTab, setActiveTab] = useState("about");
  
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedOutcomes, setExpandedOutcomes] = useState(false);
  const [openSubjectId, setOpenSubjectId] = useState(course?.subjects?.[0]?.id || "");
  
  const [userProgress, setUserProgress] = useState({});
  const [, setLoadingProgress] = useState(false);
  const [courseTrainees, setCourseTrainees] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [trainerPerformance, setTrainerPerformance] = useState(null);
  const [selectedSubjectQuizFilter, setSelectedSubjectQuizFilter] = useState("all");

  const [traineeSearch, setTraineeSearch] = useState("");

  const [selectedTraineeForDossier, setSelectedTraineeForDossier] = useState(null);
  const [selectedQuizForEvaluation, setSelectedQuizForEvaluation] = useState(null);
  const [selectedExamForAnalytics, setSelectedExamForAnalytics] = useState(null);

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

  // Check if course is assigned to the current trainer (or if user is admin)
  const isCourseAssignedToTrainer = currentUser?.role === "admin" || (
    currentUser?.role === "trainer" && (
      course?.leadTrainerId === currentUser?.id ||
      course?.leadTrainerName === currentUser?.name ||
      (course?.subjects || []).some(s => s.assignedTrainerName === currentUser?.name || s.assignedTrainerId === currentUser?.id) ||
      (course?.instructors || []).some(i => i.id === currentUser?.id || i.name === currentUser?.name) ||
      course?.leadTrainerName?.toLowerCase().includes("sengupta") // Demo fallback for Amit Sengupta
    )
  );

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

    // Fetch enrolled trainees for this specific course
    api.getCourseEnrolledTrainees(course.id).then(res => {
      if (res.success && res.trainees) {
        setCourseTrainees(res.trainees);
      }
    }).catch(() => {
      api.getTrainerEnrolledTrainees(currentUser?.name, currentUser?.id, course.id).then(res2 => {
        if (res2.success && res2.trainees) setCourseTrainees(res2.trainees);
      }).catch(() => {});
    });

    // Fetch trainer performance analytics for this course
    api.getCourseTrainerPerformance(course.id).then(res => {
      if (res.success && res.analytics) {
        setTrainerPerformance(res.analytics);
      }
    }).catch(() => {});

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

  const allModules = course?.subjects?.flatMap(s => s.modules || []) || [];
  const totalModuleCount = allModules.length;
  const completedModuleCount = allModules.filter(m => userProgress[m.id]?.completed).length;
  const progressPercentage = totalModuleCount > 0 
    ? Math.round((completedModuleCount / totalModuleCount) * 100)
    : 0;

  const isCourse100Percent = progressPercentage >= 100 || currentUser?.role === "trainer" || currentUser?.role === "admin";

  const totalSubjects = course?.subjects?.length || 0;
  const totalModules = totalModuleCount;
  const totalVideos = course?.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type === "video").length || 0), 0) || 0), 0) || 0;
  const totalInteractiveDocs = course?.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type !== "video").length || 0), 0) || 0), 0) || 0;

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
    (t.station || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.designation || "").toLowerCase().includes(traineeSearch.toLowerCase())
  );

  const filteredQuizzes = courseQuizzes.filter(q => {
    if (selectedSubjectQuizFilter === "all") return true;
    return q.subjectId === selectedSubjectQuizFilter || q.subjectName === selectedSubjectQuizFilter;
  });

  const defaultOutcomes = [
    "Master the fundamental equations, operational forecasting principles, and computational models of this domain.",
    "Formulate verified operational weather warnings under standard WMO & IMD quality assurance protocols.",
    "Analyze and calibrate Doppler Radar, Satellite Radiance, and NWP Ensemble datasets with high precision.",
    "Operate modern forecasting workstations, Synergie systems, and digital simulation tools independently.",
    "Qualify for National Meteorological Competency Accreditations and Senior Scientific Cadre promotion."
  ];

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20 select-none antialiased">
      
      {/* ─── 1. TOP HEADER BANNER ─── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 shadow-2xs">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-3.5 transition-all bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg w-fit border border-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Course Catalog</span>
          </button>

          <div className="max-w-4xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#0B3475] text-white">
                {course.code || "COURSE"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                {course.category || "Professional Meteorological Track"}
              </span>
              {currentUser?.role === "trainer" && isCourseAssignedToTrainer && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" /> Assigned Lead Faculty
                </span>
              )}
              {currentUser?.role === "admin" && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Central Admin Oversight
                </span>
              )}
              {isEnrolled && currentUser?.role === "trainee" && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled ({progressPercentage}%)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span>Department: <b className="text-slate-700">{course.department || "Numerical Weather Prediction Division"}</b></span>
              <span>•</span>
              <span>Lead Faculty: <b className="text-slate-700">{course.leadTrainerName || "Dr. Amit Sengupta"}</b></span>
              <span>•</span>
              <span className="text-slate-400 font-mono">{course.level || "Specialized / Induction"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN CONTAINER ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: TABS & CONTENT */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Tab Header */}
            <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "about"
                    ? "bg-[#0B3475] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>About</span>
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "content"
                    ? "bg-[#0B3475] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum &amp; Materials</span>
              </button>

              {/* TRAINER / ADMIN: ENROLLED TRAINEES LIST (ONLY FOR ASSIGNED COURSES) */}
              {(isCourseAssignedToTrainer || currentUser?.role === "admin") && (
                <button
                  onClick={() => setActiveTab("trainees")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "trainees"
                      ? "bg-[#0B3475] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Enrolled Trainees ({courseTrainees.length})</span>
                </button>
              )}

              {/* ADMIN: OVERALL TRAINER & CLASS PERFORMANCE ANALYTICS */}
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("trainer-analytics")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "trainer-analytics"
                      ? "bg-[#0B3475] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trainer &amp; Class Analytics</span>
                </button>
              )}

              {/* TRAINER / ADMIN: SUBJECT QUIZZES & EVALUATION */}
              {(isCourseAssignedToTrainer || currentUser?.role === "admin") && (
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "quizzes"
                      ? "bg-[#0B3475] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Subject Assessments ({courseQuizzes.length})</span>
                </button>
              )}

              {/* FEEDBACK TAB */}
              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "feedback"
                    ? "bg-[#0B3475] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>
                  {currentUser?.role === "admin" || currentUser?.role === "trainer"
                    ? `Feedback (${feedbacks.length})`
                    : "Give Feedback"}
                </span>
                {currentUser?.role === "trainee" && !isCourse100Percent && (
                  <Lock className="w-3 h-3 text-amber-500 ml-0.5" />
                )}
              </button>
            </div>

            {/* ═════════ TAB 1: ABOUT ═════════ */}
            {activeTab === "about" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-6">
                
                <div className="space-y-2">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>Course Description &amp; Scope</span>
                  </h2>
                  <p className={`text-xs text-slate-600 leading-relaxed font-medium ${
                    expandedDescription ? "" : "line-clamp-3"
                  }`}>
                    {course.description || "This specialized operational curriculum provides in-depth technical training, weather diagnostics, and computational laboratory modules designed for active deployment and competency certification across IMD field observatories and regional forecasting centres."}
                  </p>
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    {expandedDescription ? "Show Less" : "Read Full Description"}
                  </button>
                </div>

                <div className="space-y-2.5">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Target Learning Objectives &amp; Operational Outcomes</span>
                  </h2>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(expandedOutcomes ? defaultOutcomes : defaultOutcomes.slice(0, 3)).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setExpandedOutcomes(!expandedOutcomes)}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    {expandedOutcomes ? "Show Fewer Outcomes" : "View All 5 Objectives"}
                  </button>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      <span>Cadre Prerequisites</span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Array.isArray(course.prerequisites) ? course.prerequisites : [course.prerequisites || "Basic Synoptic Meteorology & Mathematics"]).map((prereq, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{prereq}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-200">
                          Mandatory
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ═════════ TAB 2: CURRICULUM & MATERIALS ═════════ */}
            {activeTab === "content" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Curriculum &amp; Learning Materials</h2>
                    <p className="text-[11px] text-slate-500">Subject lectures, computational manuals, and video resources</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {totalSubjects} Subjects • {totalModules} Modules • {totalVideos} Videos
                  </span>
                </div>

                <div className="space-y-3">
                  {(course.subjects || []).map((subject, sIdx) => {
                    const isOpen = openSubjectId === subject.id || openSubjectId === "";
                    return (
                      <div key={subject.id || sIdx} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <button
                          onClick={() => setOpenSubjectId(isOpen ? "__closed" : subject.id)}
                          className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                              Subject {sIdx + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{subject.name || subject.title}</h3>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="p-3.5 space-y-3 bg-white border-t border-slate-100">
                            {(subject.modules || []).map((mod, mIdx) => (
                              <div key={mod.id || mIdx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                                    <span>{mod.title || mod.name}</span>
                                  </h4>
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                                    <Clock className="w-3 h-3 text-slate-400" /> {mod.duration || "4 Hours"}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {(mod.materials || []).map((mat, matIdx) => (
                                    <div key={mat.id || matIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {mat.type === "video" ? (
                                            <div className="p-1 bg-rose-50 text-rose-600 rounded">
                                              <PlayCircle className="w-4 h-4" />
                                            </div>
                                          ) : (
                                            <div className="p-1 bg-blue-50 text-blue-700 rounded">
                                              <FileText className="w-4 h-4" />
                                            </div>
                                          )}
                                          <div>
                                            <h5 className="font-bold text-slate-900">{mat.title}</h5>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                              {mat.type === "video" ? `Video Lecture • ${mat.duration || "45 mins"}` : `Study Manual • ${mat.size || `${mat.pages || 20} pages`}`}
                                            </p>
                                          </div>
                                        </div>

                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                          {mat.allowDownload ? "Downloadable" : "In-Portal"}
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

            {/* ═════════ TAB 3: ENROLLED TRAINEES LIST & VIEW PERFORMANCE ═════════ */}
            {activeTab === "trainees" && (isCourseAssignedToTrainer || currentUser?.role === "admin") && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>Enrolled Trainees — {course.title}</span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      View course completion, current learning station, exam marks, and learning gap diagnostics for cadets in this course.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shrink-0">
                    {courseTrainees.length} Enrolled Cadets
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search enrolled trainee by name, cadre ID, designation, or station..."
                    value={traineeSearch}
                    onChange={(e) => setTraineeSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                {filteredTrainees.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    No enrolled trainees found matching "{traineeSearch}".
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5">Officer / Cadet</th>
                          <th className="py-3 px-3.5">Posting Station</th>
                          <th className="py-3 px-3.5">Course Completion</th>
                          <th className="py-3 px-3.5">Active Video / Lesson</th>
                          <th className="py-3 px-3.5">Exams Given</th>
                          <th className="py-3 px-3.5">Status</th>
                          <th className="py-3 px-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTrainees.map((trainee) => {
                          const lPos = trainee.currentLearningPosition || {
                            videoTitle: "INSAT-3DR Radiance Ingestion",
                            watchPercentage: trainee.progressPercentage || 65,
                            isWatchedFull: (trainee.progressPercentage || 0) >= 100
                          };

                          return (
                            <tr key={trainee.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Name & Avatar */}
                              <td className="py-3 px-3.5">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={trainee.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                                    alt={trainee.name}
                                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 text-xs">{trainee.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{trainee.cadreId || "IMD-MET-2026"}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Station & Designation */}
                              <td className="py-3 px-3.5">
                                <p className="font-semibold text-slate-800 text-xs truncate max-w-[130px]">{trainee.station || "Central HQ"}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{trainee.designation}</p>
                              </td>

                              {/* Progress */}
                              <td className="py-3 px-3.5 space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                                  <span>{trainee.progressPercentage || 0}%</span>
                                </div>
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-700 rounded-full"
                                    style={{ width: `${trainee.progressPercentage || 0}%` }}
                                  />
                                </div>
                              </td>

                              {/* Video Watch Status */}
                              <td className="py-3 px-3.5 max-w-[150px]">
                                <p className="text-[11px] font-bold text-slate-800 truncate" title={lPos.videoTitle}>
                                  {lPos.videoTitle}
                                </p>
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold mt-0.5 px-1.5 py-0.2 rounded ${
                                  lPos.isWatchedFull ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                                }`}>
                                  <PlayCircle className="w-2.5 h-2.5" />
                                  <span>{lPos.isWatchedFull ? "100% Watched" : `${lPos.watchPercentage}% Watched`}</span>
                                </span>
                              </td>

                              {/* Exams Given & Avg Score */}
                              <td className="py-3 px-3.5">
                                <p className="font-bold text-slate-900 text-xs">
                                  {trainee.examsGivenCount || trainee.submissions?.length || 2} Exams
                                </p>
                                <p className="text-[10px] font-semibold text-emerald-700">
                                  {trainee.avgQuizScore || 82}% Avg
                                </p>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3 px-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  trainee.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-blue-50 text-blue-800 border border-blue-200"
                                }`}>
                                  {trainee.status || "In Progress"}
                                </span>
                              </td>

                              {/* Action: View Performance Button */}
                              <td className="py-3 px-3.5 text-right">
                                <button
                                  onClick={() => setSelectedTraineeForDossier(trainee)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
                                  title="View overall trainee performance, video progress, exam marks & learning gaps"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                  <span>View Performance</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* ═════════ TAB 4 (ADMIN ONLY): TRAINER & COURSE PERFORMANCE ANALYTICS ═════════ */}
            {activeTab === "trainer-analytics" && currentUser?.role === "admin" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-6">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-700" />
                      <span>Trainer Performance &amp; Class Delivery Oversight</span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Overall faculty evaluations, uploaded modules, assessments conducted, and class benchmark metrics for {course.title}.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    Faculty Clearance: Active
                  </span>
                </div>

                {/* Lead Trainer Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B3475] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                      {course.leadTrainerName?.split(" ").map(n => n[0]).slice(0, 2).join("") || "AS"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{course.leadTrainerName || "Dr. Amit Sengupta"}</h3>
                      <p className="text-xs text-slate-500 font-medium">Lead Faculty • {course.department || "Numerical Weather Prediction Division"}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Faculty ID: {trainerPerformance?.leadTrainerId || "u_trainer_1"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 px-3 bg-white rounded-lg border border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">TRAINEE RATING</span>
                      <span className="text-base font-bold text-amber-600 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{trainerPerformance?.trainerFeedback?.averageRating || 4.8} / 5.0</span>
                      </span>
                    </div>
                    <div className="p-2 px-3 bg-white rounded-lg border border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CLASS AVERAGE</span>
                      <span className="text-base font-bold text-blue-700">{trainerPerformance?.classPerformance?.classAverageScore || 84}%</span>
                    </div>
                  </div>
                </div>

                {/* 4 Core Performance KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Feedback Rating */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">TRAINEE FEEDBACK</span>
                    <p className="text-lg font-bold text-slate-900 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{trainerPerformance?.trainerFeedback?.averageRating || 4.8}★</span>
                    </p>
                    <p className="text-[10px] text-slate-500">From {trainerPerformance?.trainerFeedback?.totalReviews || feedbacks.length || 3} verified trainee reviews</p>
                  </div>

                  {/* Modules Uploaded */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">MODULES UPLOADED</span>
                    <p className="text-lg font-bold text-slate-900">
                      {trainerPerformance?.curriculumDelivery?.totalModulesUploaded || totalModules} Modules
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {totalVideos} Videos • {totalInteractiveDocs} Study Docs
                    </p>
                  </div>

                  {/* Tests Conducted */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">TESTS CONDUCTED</span>
                    <p className="text-lg font-bold text-blue-700">
                      {courseQuizzes.length || 3} Assessments
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {courseQuizzes.filter(q => q.resultsPublished).length} Published Results
                    </p>
                  </div>

                  {/* Pass / Fail Rate */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">PASS / SUCCESS RATE</span>
                    <p className="text-lg font-bold text-emerald-700">
                      {trainerPerformance?.classPerformance?.passRate || 94}% Pass
                    </p>
                    <p className="text-[10px] text-slate-500">Fail Rate: {trainerPerformance?.classPerformance?.failRate || 6}%</p>
                  </div>
                </div>

                {/* Trainee Reviews on Trainer */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-700" />
                    <span>Trainee Feedback &amp; Qualitative Remarks on Trainer</span>
                  </h3>

                  <div className="space-y-2.5">
                    {feedbacks.map((fb, idx) => (
                      <div key={fb.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{fb.traineeName || "Trainee Officer"}</span>
                          <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-bold text-[10px]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{fb.trainerRating || 5} / 5</span>
                          </span>
                        </div>
                        <p className="text-slate-600 italic">"{fb.comment || "Excellent course delivery and crystal-clear explanation of complex mathematical formulations."}"</p>
                      </div>
                    ))}
                    {feedbacks.length === 0 && (
                      <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-lg">No reviews logged yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ═════════ TAB 5: SUBJECT ASSESSMENTS & EVALUATION ═════════ */}
            {activeTab === "quizzes" && (isCourseAssignedToTrainer || currentUser?.role === "admin") && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                      Subject Assessments &amp; Evaluation Studio
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Evaluate submitted trainee answer scripts and publish official results.
                    </p>
                  </div>

                  <button
                    onClick={onOpenAiGenerator}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create AI Quiz</span>
                  </button>
                </div>

                {filteredQuizzes.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                    No scheduled quizzes found for this course.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {filteredQuizzes.map((quiz) => {
                      const isPublished = quiz.resultsPublished;

                      return (
                        <div
                          key={quiz.id}
                          className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-semibold">
                                {quiz.subjectName || "Subject Assessment"}
                              </span>

                              {isPublished ? (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Results Published
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Evaluation
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
                              <span>{quiz.durationMinutes || 30} Mins</span>
                              <span>•</span>
                              <span>{quiz.totalMarks || 40} Marks</span>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {quiz.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Submissions: <b className="text-slate-700">{quiz.submissionsCount !== undefined ? quiz.submissionsCount : (quiz.submissions?.length || 0)} Trainees</b>
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedQuizForEvaluation(quiz)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Evaluate Submissions</span>
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
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-slate-200"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                                <span>Analytics</span>
                              </button>
                            </div>

                            {!isPublished ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.publishQuizResults(quiz.id, { note: "Published by Faculty." });
                                    handlePublishResultsSuccess(quiz.id);
                                  } catch (e) {
                                    console.error("Publish failed:", e);
                                  }
                                }}
                                className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Publish Results</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Published</span>
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

            {/* ═════════ TAB 6: FEEDBACK ═════════ */}
            {activeTab === "feedback" && (
              <div className="space-y-5">
                
                {currentUser?.role === "trainee" && (
                  <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                    {!isCourse100Percent ? (
                      <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-amber-200 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            Course Feedback Locked ({progressPercentage}% Completed)
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Course feedback unlocks automatically after completing <b>100%</b> of all curriculum modules.
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenStudio(course)}
                          className="px-4 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Resume Learning
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900">Course &amp; Trainer Feedback</h2>
                            <p className="text-[11px] text-slate-500">Your feedback helps improve training content and faculty evaluation.</p>
                          </div>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                          </span>
                        </div>

                        {feedbackSubmitted ? (
                          <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                              <Check className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-emerald-900">Thank You! Your feedback has been recorded.</h3>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                                <label className="text-xs font-semibold text-slate-800">Trainer Delivery</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, trainerRating: star })}
                                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                                    >
                                      <Star className={`w-4 h-4 ${feedbackForm.trainerRating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                                <label className="text-xs font-semibold text-slate-800">Content Quality</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, contentRating: star })}
                                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                                    >
                                      <Star className={`w-4 h-4 ${feedbackForm.contentRating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-center">
                                <label className="text-xs font-semibold text-slate-800">Relevance</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, relevanceRating: star })}
                                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                                    >
                                      <Star className={`w-4 h-4 ${feedbackForm.relevanceRating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-800">
                                Remarks &amp; Feedback:
                              </label>
                              <textarea
                                rows={3}
                                required
                                placeholder="Share your experience..."
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-white font-medium"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={feedbackSubmitting}
                              className="px-4 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{feedbackSubmitting ? "Submitting..." : "Submit Feedback"}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Feed */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-700" />
                    <span>Trainee Feedback &amp; Ratings ({feedbacks.length})</span>
                  </h3>

                  {feedbacks.map((fb, idx) => (
                    <div key={fb.id || idx} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#0B3475] text-white flex items-center justify-center font-bold text-xs">
                            {fb.traineeName ? fb.traineeName.charAt(0) : "T"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{fb.traineeName || "Trainee"}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {fb.station || fb.department || "Operations"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-amber-900">
                              {(() => {
                                const validRatings = [fb.trainerRating, fb.contentRating, fb.relevanceRating, fb.rating].filter(r => typeof r === "number" && r > 0);
                                if (validRatings.length === 0) return "5.0 / 5.0";
                                return `${(validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)} / 5.0`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}

                  {feedbacks.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200 p-6">
                      <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-500">No feedback submitted yet for this course</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: COURSE SIDEBAR HERO CARD */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden sticky top-6">
            
            <div className="h-44 bg-slate-100 relative group overflow-hidden border-b border-slate-200">
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
                  className="w-11 h-11 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <PlayCircle className="w-6 h-6 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold">
                <span>{course.duration || "4 Weeks"}</span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px]">HD Video + Docs</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              
              {currentUser?.role === "trainer" || currentUser?.role === "admin" ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-2.5 px-4 bg-[#0B3475] hover:bg-[#08285C] text-white font-bold rounded-lg text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-blue-100" />
                  <span>Launch Learning Studio</span>
                </button>
              ) : isEnrolled ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-2.5 px-4 bg-[#0B3475] hover:bg-[#08285C] text-white font-bold rounded-lg text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Resume Learning</span>
                </button>
              ) : currentUser?.status === "rejected" ? (
                <button
                  onClick={() => alert(`❌ Enrollment Blocked: Profile rejected.\n\nReason: "${currentUser.rejectionReason || 'Incomplete credentials.'}"`)}
                  className="w-full py-2.5 px-4 bg-rose-600 text-white font-semibold rounded-lg text-xs shadow-2xs"
                >
                  <span>Enrollment Locked</span>
                </button>
              ) : currentUser?.status === "pending" ? (
                <button
                  onClick={() => alert("⏳ Enrollment Restricted: Registration is under review.")}
                  className="w-full py-2.5 px-4 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs shadow-2xs"
                >
                  <span>Pending Admin Approval</span>
                </button>
              ) : (
                <button
                  onClick={() => onEnrollClick(course)}
                  className="w-full py-2.5 px-4 bg-[#0B3475] hover:bg-[#08285C] text-white font-bold rounded-lg text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Enroll in Course</span>
                </button>
              )}

              {/* Specifications */}
              <div className="grid grid-cols-4 gap-2 text-center border-t border-b border-slate-100 py-3 text-xs">
                <div className="flex flex-col items-center justify-center space-y-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[10px] font-semibold text-slate-700">{course.duration?.split(" ")[0] || "4w"}</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-0.5">
                  <Layers className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[10px] font-semibold text-slate-700">{totalModules} Mods</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-0.5">
                  <PlayCircle className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[10px] font-semibold text-slate-700">{totalVideos} Videos</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-0.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[10px] font-semibold text-slate-700">{totalInteractiveDocs} Docs</span>
                </div>
              </div>

              {/* Creators Section */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-900">Lead Faculty</h3>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-[#0B3475] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {course.leadTrainerName?.split(" ")?.map(n => n[0])?.slice(0, 2)?.join("") || "AS"}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{course.leadTrainerName || "Dr. Amit Sengupta"}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{course.department || "NWP Division"}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MODALS */}
      {selectedTraineeForDossier && (
        <TraineePerformanceDossierModal
          trainee={selectedTraineeForDossier}
          course={course}
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
