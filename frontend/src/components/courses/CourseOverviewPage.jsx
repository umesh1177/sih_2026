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
  FolderKanban
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

  const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

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
        // Filter trainees enrolled in this specific course
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
        // Mock fallback quizzes for this course
        setCourseQuizzes([
          {
            id: "quiz_nwp_01",
            title: "#30 Atmospheric Dynamics & NWP 4D-Var Assimilation",
            courseId: course.id,
            courseName: course.title,
            subjectId: course.subjects?.[0]?.id || "subj_1",
            subjectName: course.subjects?.[0]?.name || "Atmospheric Dynamics",
            durationMinutes: 30,
            totalMarks: 40,
            passMarks: 20,
            scheduledStartTime: new Date().toISOString(),
            resultsPublished: false,
            submissionsCount: 34,
            questions: []
          },
          {
            id: "quiz_nwp_02",
            title: "#29 Doppler Weather Radar & Polarimetric Nowcasting",
            courseId: course.id,
            courseName: course.title,
            subjectId: course.subjects?.[1]?.id || "subj_2",
            subjectName: course.subjects?.[1]?.name || "Doppler Weather Radar",
            durationMinutes: 45,
            totalMarks: 50,
            passMarks: 25,
            scheduledStartTime: new Date(Date.now() - 86400000).toISOString(),
            resultsPublished: true,
            submissionsCount: 42,
            questions: []
          }
        ]);
      }
    }).catch(() => {});
  }, [currentUser?.id, course?.id, course?.title, course?.code]);

  // Calculate completion percentage
  const allModules = course?.subjects?.flatMap(s => s.modules || []) || [];
  const totalModuleCount = allModules.length || 1;
  const completedModuleCount = allModules.filter(m => userProgress[m.id]?.completed).length;
  const progressPercentage = completedModuleCount > 0 
    ? Math.round((completedModuleCount / totalModuleCount) * 100)
    : (isEnrolled ? 65 : 0);

  const isCourse100Percent = progressPercentage >= 100 || currentUser?.role === "trainer" || currentUser?.role === "admin";

  // Derive specs counts
  const totalSubjects = course.subjects?.length || 2;
  const totalModules = totalModuleCount;
  const totalVideos = course.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type === "video").length || 0), 0) || 0), 0) || 3;
  const totalInteractiveDocs = course.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type !== "video").length || 0), 0) || 0), 0) || 9;

  // Handle Feedback Submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) return;

    setFeedbackSubmitting(true);
    try {
      const payload = {
        courseId: course.id,
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || "Rahul Sharma",
        ...feedbackForm
      };
      const res = await api.submitFeedback(payload);
      if (res.success) {
        setFeedbackSubmitted(true);
        setFeedbacks(prev => [res.feedback || { ...payload, id: `fb_${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handlePublishResultsSuccess = (quizId) => {
    setCourseQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, resultsPublished: true } : q));
  };

  // Outcomes list
  const defaultOutcomes = [
    `Master foundational principles and operational frameworks of ${course.category || "Atmospheric Sciences"}.`,
    `Apply specialized data tools, satellite imagery, and radar algorithms compliant with MoES/IMD standard operating procedures (SOPs).`,
    `Perform real-time forecasting, hazard identification, and multi-model ensemble analysis during active meteorological events.`,
    `Synthesize quantitative weather bulletins and advisories for disaster management authorities and civil protection cells.`,
    `Complete timed subject-wise MCQ assessments and qualify for official MoES Certified Credentials.`
  ];

  const filteredTrainees = courseTrainees.filter(t => 
    (t.name || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.station || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.cadreId || "").toLowerCase().includes(traineeSearch.toLowerCase())
  );

  const filteredQuizzes = courseQuizzes.filter(q => {
    if (selectedSubjectQuizFilter === "all") return true;
    return q.subjectId === selectedSubjectQuizFilter || q.subjectName === selectedSubjectQuizFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20 select-none">
      
      {/* ─── 1. TOP NAVY/BLUE BANNER (STUNNING AESTHETICS) ─── */}
      <div className="bg-gradient-to-r from-[#0a2558] via-[#123e88] to-[#1967d2] text-white px-6 sm:px-12 py-10 shadow-xl relative overflow-hidden border-b border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb Back link */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-blue-100/90 hover:text-white mb-6 transition-all group bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl backdrop-blur-md w-fit shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Course Catalog</span>
          </button>

          <div className="max-w-3xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-[#0a2558] shadow">
                {course.code}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                {course.category}
              </span>
              {currentUser?.role === "trainer" && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Lead Instructor View
                </span>
              )}
              {isEnrolled && currentUser?.role !== "trainer" && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Enrolled ({progressPercentage}%)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-blue-100">
              <span>By {course.department || "India Meteorological Department (MoES)"}</span>
              <span>•</span>
              <span>Lead Trainer: <b>{course.leadTrainerName || "Dr. Amit Sengupta"}</b></span>
              <span>•</span>
              <span className="text-blue-200/80">(Last updated on Sep 9, 2026)</span>
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
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "about"
                    ? "bg-[#0a2558] text-white shadow-md"
                    : "text-slate-600 hover:text-[#0a2558] hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>About</span>
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "content"
                    ? "bg-[#0a2558] text-white shadow-md"
                    : "text-slate-600 hover:text-[#0a2558] hover:bg-slate-100"
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
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === "trainees"
                        ? "bg-[#0a2558] text-white shadow-md"
                        : "text-slate-600 hover:text-[#0a2558] hover:bg-slate-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Enrolled Cadets ({courseTrainees.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === "quizzes"
                        ? "bg-[#0a2558] text-white shadow-md"
                        : "text-slate-600 hover:text-[#0a2558] hover:bg-slate-100"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Subject Quizzes & Evaluation ({courseQuizzes.length})</span>
                  </button>
                </>
              )}

              {/* Feedback Tab (Admin / Trainer / Trainee) */}
              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === "feedback"
                    ? "bg-[#0a2558] text-white shadow-md"
                    : "text-slate-600 hover:text-[#0a2558] hover:bg-slate-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {currentUser?.role === "admin" 
                    ? `Cadre Feedbacks (${feedbacks.length})`
                    : currentUser?.role === "trainer"
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
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-150">
                
                {/* Description */}
                <div className="space-y-2.5">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0a2558]" />
                    <span>Course Description</span>
                  </h2>
                  <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${
                    expandedDescription ? "" : "line-clamp-3"
                  }`}>
                    {course.description || "This course is designed to educate all officers on the critical operational protocols and scientific methodologies of atmospheric analysis. It provides a detailed examination of data assimilation, Doppler radar interpretations, and numerical weather modeling."}
                  </p>
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="text-xs font-bold text-[#1967d2] hover:underline"
                  >
                    {expandedDescription ? "view less" : "view more"}
                  </button>
                </div>

                {/* Learning Outcomes */}
                <div className="space-y-3">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Learning Outcome & Core Objectives</span>
                  </h2>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    {(expandedOutcomes ? defaultOutcomes : defaultOutcomes.slice(0, 3)).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setExpandedOutcomes(!expandedOutcomes)}
                    className="text-xs font-bold text-[#1967d2] hover:underline"
                  >
                    {expandedOutcomes ? "view less" : "view more"}
                  </button>
                </div>

                {/* Prerequisites & Required Competency Baseline */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0a2558]" />
                      <span>Prerequisites & Skill Requirements</span>
                    </h2>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Verified Criteria
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Array.isArray(course.prerequisites) ? course.prerequisites : [course.prerequisites || "Atmospheric Dynamics"]).map((prereq, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-800">{prereq}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-200/70">
                          Mandatory
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competencies */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      MoES Competency Mapping
                    </h2>
                    <span className="text-slate-400 text-xs">ⓘ</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Functional
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {course.category || "Domain Specialization"}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      MoES Forecaster Tier-1
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
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Curricula, Lecture Decks & Study Manuals</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Uploaded by official MoES faculty and senior scientists</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {totalSubjects} Subjects • {totalModules} Modules
                  </span>
                </div>

                <div className="space-y-4">
                  {(course.subjects || []).map((subject, sIdx) => {
                    const isOpen = openSubjectId === subject.id || openSubjectId === "";
                    return (
                      <div key={subject.id || sIdx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenSubjectId(isOpen ? "__closed" : subject.id)}
                          className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                              Subject {sIdx + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{subject.name || subject.title}</h3>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="p-4 space-y-3 bg-white border-t border-slate-100">
                            {(subject.modules || []).map((mod, mIdx) => (
                              <div key={mod.id || mIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
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
                                    <div key={mat.id || matIdx} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                          {mat.type === "video" ? (
                                            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                                              <PlayCircle className="w-4 h-4" />
                                            </div>
                                          ) : (
                                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                              <FileText className="w-4 h-4" />
                                            </div>
                                          )}
                                          <div>
                                            <h5 className="font-bold text-xs text-slate-900">{mat.title}</h5>
                                            <p className="text-[10px] text-slate-500">
                                              {mat.type === "video" ? `Video Lecture • ${mat.duration || "45 mins"}` : `Study Document • ${mat.size || `${mat.pages || 34} pages`}`}
                                            </p>
                                          </div>
                                        </div>

                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                          {mat.allowDownload ? "Downloadable" : "In-Portal Protected"}
                                        </span>
                                      </div>

                                      {/* Trainer / Uploader info pill */}
                                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1 font-medium">
                                          <User className="w-3 h-3 text-blue-600" />
                                          <span>Uploaded by: <b>{mat.uploadedBy || course.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer)"}</b></span>
                                        </span>
                                        <span className="text-slate-400">
                                          {mat.uploadedAt || "Uploaded on: Jan 15, 2025"}
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

            {/* ═════════ TAB 3 (TRAINER): ENROLLED CADETS ROSTER IN THIS COURSE ═════════ */}
            {activeTab === "trainees" && currentUser?.role === "trainer" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
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
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0a2558] to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                {trainee.name?.split(" ").map(n => n[0]).join("") || "TR"}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs">{trainee.name}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{trainee.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 space-y-0.5">
                            <span className="font-mono font-bold text-slate-800 text-[11px] block">{trainee.cadreId}</span>
                            <span className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{trainee.station}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span>{trainee.progressPercentage}%</span>
                              <span className="text-[10px] text-slate-400">({trainee.completedModulesCount}/{trainee.totalModulesCount || 8} Mods)</span>
                            </div>
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${trainee.progressPercentage}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 text-xs">
                              {trainee.avgQuizScore}%
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-sm transition-transform hover:scale-105"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-200" />
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

            {/* ═════════ TAB 4 (TRAINER): SUBJECT QUIZZES, EVALUATION & RESULT PUBLISHING ═════════ */}
            {activeTab === "quizzes" && currentUser?.role === "trainer" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
                
                {/* Header with Subject Filter & Create Quiz Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Subject Quizzes & Result Publishing Engine
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quizzes are organized strictly by assigned subject. Evaluate submissions and publish results so trainees can view their scores.
                    </p>
                  </div>

                  <button
                    onClick={onOpenAiGenerator}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 shrink-0"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>Create Subject Quiz</span>
                  </button>
                </div>

                {/* Subject Tabs Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <button
                    onClick={() => setSelectedSubjectQuizFilter("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      selectedSubjectQuizFilter === "all"
                        ? "bg-[#0a2558] text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    All Subjects ({courseQuizzes.length})
                  </button>
                  {(course.subjects || []).map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => setSelectedSubjectQuizFilter(s.id || s.name)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                        selectedSubjectQuizFilter === (s.id || s.name)
                          ? "bg-[#0a2558] text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s.name || s.title}
                    </button>
                  ))}
                </div>

                {/* Attractive Quiz Cards Grid */}
                <div className="grid grid-cols-1 gap-5">
                  {filteredQuizzes.map((quiz) => {
                    const isPublished = quiz.resultsPublished;

                    return (
                      <div
                        key={quiz.id}
                        className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all p-6 space-y-4"
                      >
                        {/* Top Quiz Header: Subject Tag, Published Status, Duration */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl text-xs font-black shadow-sm">
                              {quiz.subjectName || "Assigned Subject"}
                            </span>

                            {isPublished ? (
                              <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Results Published
                              </span>
                            ) : (
                              <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Pending Evaluation
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
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

                        {/* Title & Submission Counts */}
                        <div className="space-y-1">
                          <h3 className="font-black text-slate-900 text-base">
                            {quiz.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Candidate Submissions: <b className="text-slate-800">{quiz.submissionsCount || 34} Cadets</b> • Scheduled Window: {new Date(quiz.scheduledStartTime).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Action Hub: Evaluate Quizzes, Publish Results, Analytics */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Evaluate Quizzes Button */}
                            <button
                              onClick={() => setSelectedQuizForEvaluation(quiz)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-sm transition-transform hover:scale-105"
                            >
                              <ClipboardList className="w-3.5 h-3.5 text-blue-200" />
                              <span>Evaluate Submissions & Feedback</span>
                            </button>

                            {/* Inspect Performance Analytics */}
                            <button
                              onClick={() => setSelectedExamForAnalytics({
                                id: quiz.id,
                                title: quiz.title,
                                subjects: [quiz.subjectName || "Atmospheric Dynamics", "NWP 4D-Var", "+2 more"],
                                score: "82.5% Avg",
                                totalMarks: quiz.totalMarks || 40,
                                percentage: 82.5,
                                durationMinutes: quiz.durationMinutes || 30,
                                attempted: 34,
                                correctCount: 29
                              })}
                              className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold rounded-xl text-xs transition-colors"
                            >
                              <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
                              <span>Quiz Analytics</span>
                            </button>
                          </div>

                          {/* Quick Publish Toggle */}
                          {!isPublished ? (
                            <button
                              onClick={async () => {
                                try {
                                  await api.publishQuizResults(quiz.id, { note: "Directly published by Lead Trainer." });
                                  handlePublishResultsSuccess(quiz.id);
                                } catch (e) {
                                  console.error("Publish failed:", e);
                                }
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                              <span>Publish Quiz Results</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Scores Visible to Trainees</span>
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* ═════════ TAB 5: CADRE FEEDBACKS & REVIEWS ═════════ */}
            {activeTab === "feedback" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* ADMIN / TRAINER VIEW: READ-ONLY OVERSIGHT OF ALL CADRE FEEDBACKS */}
                {(currentUser?.role === "admin" || currentUser?.role === "trainer") ? (
                  <div className="space-y-6">
                    
                    {/* Admin Policy Notice */}
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs text-blue-950">
                        <p className="font-extrabold text-blue-900">
                          {currentUser?.role === "admin" ? "Administrative Oversight & Quality Audit Mode" : "Instructor Evaluation Oversight"}
                        </p>
                        <p className="text-blue-800 leading-relaxed">
                          {currentUser?.role === "admin"
                            ? "Feedback submission is reserved exclusively for enrolled Officer Trainees upon course completion. Administrators have oversight and review access to inspect all uploaded officer evaluations."
                            : "Senior trainers have read-only access to trainee ratings and qualitative recommendations to refine lectures and module hands-on materials."}
                        </p>
                      </div>
                    </div>

                    {/* Aggregate Rating Scorecard */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Institutional Feedback Metrics & Summary</h3>
                          <p className="text-xs text-slate-500">Aggregated evaluations submitted by certified officers</p>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                          {feedbacks.length} Verified Reviews
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 text-center">
                          <p className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Overall Course Rating</p>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            <span className="text-2xl font-black text-slate-900">
                              {feedbacks.length > 0 
                                ? (feedbacks.reduce((a, b) => a + (b.trainerRating + b.contentRating + b.relevanceRating) / 3, 0) / feedbacks.length).toFixed(1)
                                : "4.9"}
                            </span>
                            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                          </div>
                          <p className="text-[10px] text-amber-700 font-semibold">Consensus Score</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Trainer Pedagogy</p>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-xl font-black text-slate-900">
                              {feedbacks.length > 0 
                                ? (feedbacks.reduce((a, b) => a + (b.trainerRating || 5), 0) / feedbacks.length).toFixed(1)
                                : "5.0"}
                            </span>
                            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Lecture Clarity</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Curriculum Rigor</p>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-xl font-black text-slate-900">
                              {feedbacks.length > 0 
                                ? (feedbacks.reduce((a, b) => a + (b.contentRating || 5), 0) / feedbacks.length).toFixed(1)
                                : "4.8"}
                            </span>
                            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Syllabus Depth</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Forecasting Relevance</p>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-xl font-black text-slate-900">
                              {feedbacks.length > 0 
                                ? (feedbacks.reduce((a, b) => a + (b.relevanceRating || 5), 0) / feedbacks.length).toFixed(1)
                                : "4.9"}
                            </span>
                            <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                          </div>
                          <p className="text-[10px] text-slate-500">Operational Utility</p>
                        </div>

                      </div>
                    </div>

                    {/* Uploaded Cadre Reviews Feed */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>All Uploaded Trainee Officer Feedbacks ({feedbacks.length})</span>
                        </h3>
                      </div>

                      {feedbacks.map((fb, idx) => (
                        <div key={fb.id || idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-bold text-sm">
                                {fb.traineeName ? fb.traineeName.charAt(0) : "O"}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{fb.traineeName || "Officer Trainee"}</h4>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {fb.cadreId || "IMD-CADRE-2024"} • {fb.station || fb.department || "Regional Meteorological Centre"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-black text-amber-900">
                                  {(((fb.trainerRating || 5) + (fb.contentRating || 5) + (fb.relevanceRating || 5)) / 3).toFixed(1)} / 5.0
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "Sep 8, 2026"}
                              </span>
                            </div>
                          </div>

                          {/* Ratings breakdown chips */}
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                              Trainer: <b>{fb.trainerRating || 5}★</b>
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                              Content: <b>{fb.contentRating || 5}★</b>
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                              Relevance: <b>{fb.relevanceRating || 5}★</b>
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Cadet
                            </span>
                          </div>

                          {/* Comment body */}
                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 whitespace-pre-line">
                            "{fb.comment}"
                          </p>
                        </div>
                      ))}

                      {feedbacks.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
                          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">No feedbacks uploaded yet for this course</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Enrolled trainees will submit reviews upon 100% course completion.</p>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  /* TRAINEE VIEW: CONDITIONAL FEEDBACK SUBMISSION & REVIEW LIST */
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    {!isCourse100Percent ? (
                      <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-amber-200 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                          <Lock className="w-8 h-8" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1.5">
                          <h3 className="text-lg font-bold text-slate-900">
                            Course Feedback Locked ({progressPercentage}% Completed)
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            To maintain high evaluation standards, official institutional feedback unlocks only after you complete <b>100%</b> of all lectures and modules.
                          </p>
                        </div>

                        <div className="max-w-sm mx-auto space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-600">Current Progress</span>
                            <span className="text-blue-700">{progressPercentage}% / 100%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenStudio(course)}
                          className="mt-4 px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                        >
                          Resume Learning to Complete Course
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                          <div>
                            <h2 className="text-base font-extrabold text-slate-900">Official Institutional Feedback Form</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Your evaluation helps MoES/IMD refine training programs and faculty curricula.</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Completed
                          </span>
                        </div>

                        {feedbackSubmitted ? (
                          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                              <Check className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-emerald-900">Thank You! Your Feedback Has Been Registered.</h3>
                            <p className="text-xs text-emerald-700">
                              Your ratings have been submitted to the MoES Training Directorate.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitFeedback} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                                <label className="text-xs font-bold text-slate-800">Trainer Delivery & Pedagogy</label>
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
                                <span className="text-[10px] font-bold text-slate-500">{feedbackForm.trainerRating} / 5 Stars</span>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                                <label className="text-xs font-bold text-slate-800">Content & Material Rigor</label>
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
                                <span className="text-[10px] font-bold text-slate-500">{feedbackForm.contentRating} / 5 Stars</span>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                                <label className="text-xs font-bold text-slate-800">Relevance to Forecasting</label>
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
                                <span className="text-[10px] font-bold text-slate-500">{feedbackForm.relevanceRating} / 5 Stars</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-800">
                                Detailed Officer Feedback & Practical Recommendations:
                              </label>
                              <textarea
                                rows={4}
                                required
                                placeholder="Share your experience on course depth, presentation clarity, and software hands-on sessions..."
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={feedbackSubmitting}
                              className="px-6 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
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

              </div>
            )}

          </div>

          {/* ─── RIGHT FLOATING SPECIFICATIONS CARD (PREMIUM LOOK) ─── */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-6">
            
            {/* Top Video Preview box */}
            <div className="h-56 bg-slate-900 relative group overflow-hidden">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <div 
                  onClick={() => onOpenStudio(course)}
                  className="w-14 h-14 rounded-full bg-white/95 text-[#1967d2] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <PlayCircle className="w-8 h-8 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold drop-shadow">
                <span>{course.duration}</span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-extrabold">HD Video + Slides</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Main Action Button */}
              {currentUser?.role === "trainer" || currentUser?.role === "admin" ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-3 px-4 bg-[#0a2558] hover:bg-[#071c42] text-white font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98"
                >
                  <Eye className="w-4 h-4 text-blue-200" />
                  <span>Launch Learning Studio & Content Preview</span>
                </button>
              ) : isEnrolled ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-3 px-4 bg-[#1967d2] hover:bg-[#1557b0] text-white font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start / Resume Learning</span>
                </button>
              ) : currentUser?.status === "rejected" ? (
                <button
                  onClick={() => alert(`❌ Enrollment Blocked: Your officer profile was rejected by the MoES Administrator.\n\nReason: "${currentUser.rejectionReason || 'Incomplete credentials.'}"\n\nPlease visit Officer Profile to rectify and resubmit.`)}
                  className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-200" />
                  <span>Enrollment Locked (Profile Rejected)</span>
                </button>
              ) : currentUser?.status === "pending" ? (
                <button
                  onClick={() => alert("⏳ Enrollment Restricted: Your officer registration is currently under MoES administrative review. You will be able to enroll immediately upon approval.")}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-slate-900" />
                  <span>Pending Admin Approval to Enroll</span>
                </button>
              ) : (
                <button
                  onClick={() => onEnrollClick(course)}
                  className="w-full py-3 px-4 bg-[#1967d2] hover:bg-[#1557b0] text-white font-black rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Enroll in Course</span>
                </button>
              )}

              {/* 8-Grid Specs Icons */}
              <div className="grid grid-cols-4 gap-4 text-center border-t border-b border-slate-100 py-6">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700">{course.duration?.split(" ")[0] || "6w"}</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700">{totalModules} Modules</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700">{totalVideos} Videos</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">{totalInteractiveDocs} Docs</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700">Free</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">Blended</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">CC BY 4.0</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">MoES IMD</span>
                </div>
              </div>

              {/* Creators Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Lead Faculty & Creators</h3>
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-emerald-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow">
                    {course.leadTrainerName?.split(" ")?.map(n => n[0])?.slice(0, 2)?.join("") || "AS"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{course.leadTrainerName || "Dr. Amit Sengupta"}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{course.department || "Ministry of Earth Sciences"}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ═════════ INDIVIDUAL TRAINEE PERFORMANCE DOSSIER MODAL ═════════ */}
      {selectedTraineeForDossier && (
        <TraineePerformanceDossierModal
          trainee={selectedTraineeForDossier}
          onClose={() => setSelectedTraineeForDossier(null)}
        />
      )}

      {/* ═════════ QUIZ EVALUATION & PUBLISH MODAL ═════════ */}
      {selectedQuizForEvaluation && (
        <QuizEvaluationModal
          quiz={selectedQuizForEvaluation}
          currentUser={currentUser}
          onClose={() => setSelectedQuizForEvaluation(null)}
          onResultsPublished={handlePublishResultsSuccess}
        />
      )}

      {/* ═════════ QUIZ PERFORMANCE ANALYTICS MODAL ═════════ */}
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
