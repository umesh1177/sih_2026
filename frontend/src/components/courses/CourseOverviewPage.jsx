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
  const [activeTab, setActiveTab] = useState("about");
  
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedOutcomes, setExpandedOutcomes] = useState(false);
  const [openSubjectId, setOpenSubjectId] = useState(course?.subjects?.[0]?.id || "");
  
  const [userProgress, setUserProgress] = useState({});
  const [, setLoadingProgress] = useState(false);
  const [courseTrainees, setCourseTrainees] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
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
        traineeName: currentUser?.name || "Trainee",
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
    "Analyze and troubleshoot operational datasets with high precision.",
    "Operate modern software workstations and digital simulation platforms independently.",
    "Qualify for National Professional Competency Certifications."
  ];

  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172033] font-sans pb-20 select-none">
      
      {/* ─── 1. TOP HEADER BANNER ─── */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-6 shadow-xs">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-medium text-[#475569] hover:text-[#172033] mb-4 transition-all bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Course Catalog</span>
          </button>

          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#2563EB] text-white">
                {course.code || "COURSE"}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200">
                {course.category || "Professional Track"}
              </span>
              {currentUser?.role === "trainer" && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  Lead Instructor View
                </span>
              )}
              {isEnrolled && currentUser?.role !== "trainer" && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled ({progressPercentage}%)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#172033]">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569]">
              <span>Department: <b>{course.department || "Capacity Building Directorate"}</b></span>
              <span>•</span>
              <span>Lead Trainer: <b>{course.leadTrainerName || "Assigned Faculty"}</b></span>
              <span>•</span>
              <span className="text-slate-400 font-mono">{course.level || "Specialized"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN CONTAINER ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Tab Header */}
            <div className="bg-white rounded-xl p-2 border border-[#E2E8F0] shadow-xs flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === "about"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#2563EB] hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>About</span>
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === "content"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#2563EB] hover:bg-slate-50"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Curriculum &amp; Materials</span>
              </button>

              {currentUser?.role === "trainer" && (
                <>
                  <button
                    onClick={() => setActiveTab("trainees")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === "trainees"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-[#475569] hover:text-[#2563EB] hover:bg-slate-50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Enrolled Trainees ({courseTrainees.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === "quizzes"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-[#475569] hover:text-[#2563EB] hover:bg-slate-50"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Subject Quizzes ({courseQuizzes.length})</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === "feedback"
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#2563EB] hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
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

            {/* TAB 1: ABOUT */}
            {activeTab === "about" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-6">
                
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    <span>Course Description</span>
                  </h2>
                  <p className={`text-xs sm:text-sm text-[#475569] leading-relaxed ${
                    expandedDescription ? "" : "line-clamp-3"
                  }`}>
                    {course.description || "This curriculum provides in-depth technical training, operational procedures, and hands-on modules designed for deployment and certification."}
                  </p>
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    {expandedDescription ? "Show Less" : "Show More"}
                  </button>
                </div>

                <div className="space-y-2.5">
                  <h2 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Learning Objectives</span>
                  </h2>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#475569]">
                    {(expandedOutcomes ? defaultOutcomes : defaultOutcomes.slice(0, 3)).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setExpandedOutcomes(!expandedOutcomes)}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    {expandedOutcomes ? "Show Less" : "Show More"}
                  </button>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                      <span>Prerequisites</span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Array.isArray(course.prerequisites) ? course.prerequisites : [course.prerequisites || "Domain Fundamentals"]).map((prereq, i) => (
                      <div key={i} className="p-3 rounded-lg border border-[#E2E8F0] bg-slate-50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-medium text-[#172033]">{prereq}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-200">
                          Required
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CONTENT */}
            {activeTab === "content" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div>
                    <h2 className="text-sm font-semibold text-[#172033]">Curriculum &amp; Learning Materials</h2>
                    <p className="text-xs text-[#475569]">Course lectures, manuals, and resources</p>
                  </div>
                  <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {totalSubjects} Subjects • {totalModules} Modules
                  </span>
                </div>

                <div className="space-y-3.5">
                  {(course.subjects || []).map((subject, sIdx) => {
                    const isOpen = openSubjectId === subject.id || openSubjectId === "";
                    return (
                      <div key={subject.id || sIdx} className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                        <button
                          onClick={() => setOpenSubjectId(isOpen ? "__closed" : subject.id)}
                          className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider">
                              Subject {sIdx + 1}
                            </span>
                            <h3 className="font-semibold text-[#172033] text-xs sm:text-sm">{subject.name || subject.title}</h3>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="p-3.5 space-y-3 bg-white border-t border-slate-100">
                            {(subject.modules || []).map((mod, mIdx) => (
                              <div key={mod.id || mIdx} className="p-3.5 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-xs text-[#172033] flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                                    <span>{mod.title || mod.name}</span>
                                  </h4>
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" /> {mod.duration || "4 Hours"}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {(mod.materials || []).map((mat, matIdx) => (
                                    <div key={mat.id || matIdx} className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] space-y-1 text-xs">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {mat.type === "video" ? (
                                            <div className="p-1 bg-rose-50 text-rose-600 rounded">
                                              <PlayCircle className="w-4 h-4" />
                                            </div>
                                          ) : (
                                            <div className="p-1 bg-blue-50 text-[#2563EB] rounded">
                                              <FileText className="w-4 h-4" />
                                            </div>
                                          )}
                                          <div>
                                            <h5 className="font-semibold text-[#172033]">{mat.title}</h5>
                                            <p className="text-[10px] text-slate-400">
                                              {mat.type === "video" ? `Video Lecture • ${mat.duration || "45 mins"}` : `Study Document • ${mat.size || `${mat.pages || 20} pages`}`}
                                            </p>
                                          </div>
                                        </div>

                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
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

            {/* TAB 3 (TRAINER): ENROLLED TRAINEES */}
            {activeTab === "trainees" && currentUser?.role === "trainer" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-semibold text-[#172033]">
                      Enrolled Trainees ({filteredTrainees.length})
                    </h2>
                    <p className="text-xs text-[#475569]">
                      Monitor individual module completions and evaluation marks.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search trainee..."
                      value={traineeSearch}
                      onChange={(e) => setTraineeSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Trainee</th>
                        <th className="py-2.5 px-3">Center</th>
                        <th className="py-2.5 px-3">Progress</th>
                        <th className="py-2.5 px-3">Avg Score</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Profile/Record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTrainees.map((trainee) => (
                        <tr key={trainee.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                {trainee.name?.split(" ").map(n => n[0]).join("") || "TR"}
                              </div>
                              <div>
                                <p className="font-semibold text-[#172033] text-xs">{trainee.name}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{trainee.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-[#475569] text-xs flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{trainee.station || "Training Center"}</span>
                            </span>
                          </td>

                          <td className="py-3 px-3 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                              <span>{trainee.progressPercentage || 0}%</span>
                            </div>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#2563EB] rounded-full"
                                style={{ width: `${trainee.progressPercentage || 0}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#172033] text-xs">
                              {trainee.avgQuizScore !== undefined ? `${trainee.avgQuizScore}%` : "—"}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                              trainee.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-50 text-[#2563EB]"
                            }`}>
                              {trainee.status || "In Progress"}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedTraineeForDossier(trainee)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-xs transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>Profile/Record</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4 (TRAINER): QUIZZES */}
            {activeTab === "quizzes" && currentUser?.role === "trainer" && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-5">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-semibold text-[#172033]">
                      Subject Quizzes &amp; Evaluation
                    </h2>
                    <p className="text-xs text-[#475569]">
                      Evaluate submissions and publish results.
                    </p>
                  </div>

                  <button
                    onClick={onOpenAiGenerator}
                    className="flex items-center gap-1 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Create Quiz</span>
                  </button>
                </div>

                {filteredQuizzes.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-[#E2E8F0]">
                    No quizzes scheduled yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredQuizzes.map((quiz) => {
                      const isPublished = quiz.resultsPublished;

                      return (
                        <div
                          key={quiz.id}
                          className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-200 rounded text-xs font-medium">
                                {quiz.subjectName || "Subject Assessment"}
                              </span>

                              {isPublished ? (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Results Published
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Evaluation
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs font-medium text-[#475569]">
                              <span>{quiz.durationMinutes || 30} Mins</span>
                              <span>•</span>
                              <span>{quiz.totalMarks || 40} Marks</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-semibold text-[#172033] text-sm">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-[#475569]">
                              Submissions: <b>{quiz.submissionsCount !== undefined ? quiz.submissionsCount : (quiz.submissions?.length || 0)} Trainees</b>
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedQuizForEvaluation(quiz)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
                              >
                                <ClipboardList className="w-3.5 h-3.5 text-blue-100" />
                                <span>Evaluate</span>
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
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-xs transition-colors"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                                <span>Analytics</span>
                              </button>
                            </div>

                            {!isPublished ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.publishQuizResults(quiz.id, { note: "Published by Trainer." });
                                    handlePublishResultsSuccess(quiz.id);
                                  } catch (e) {
                                    console.error("Publish failed:", e);
                                  }
                                }}
                                className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                                <span>Publish Results</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
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

            {/* TAB 5: FEEDBACK */}
            {activeTab === "feedback" && (
              <div className="space-y-5">
                
                {currentUser?.role === "trainee" && (
                  <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                    {!isCourse100Percent ? (
                      <div className="text-center py-10 px-4 bg-slate-50 rounded-lg border border-dashed border-amber-200 space-y-3">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                          <h3 className="text-sm font-semibold text-[#172033]">
                            Feedback Locked ({progressPercentage}% Completed)
                          </h3>
                          <p className="text-xs text-[#475569]">
                            Course feedback unlocks after completing <b>100%</b> of all modules.
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenStudio(course)}
                          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
                        >
                          Resume Learning
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h2 className="text-sm font-semibold text-[#172033]">Course Feedback Form</h2>
                            <p className="text-xs text-[#475569]">Your feedback helps improve training content.</p>
                          </div>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                          </span>
                        </div>

                        {feedbackSubmitted ? (
                          <div className="p-5 bg-emerald-50 rounded-lg border border-emerald-200 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                              <Check className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-semibold text-emerald-900">Thank You! Your feedback has been recorded.</h3>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1.5 text-center">
                                <label className="text-xs font-medium text-[#172033]">Trainer Delivery</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, trainerRating: star })}
                                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                                    >
                                      <Star className={`w-4 h-4 ${feedbackForm.trainerRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1.5 text-center">
                                <label className="text-xs font-medium text-[#172033]">Content Quality</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, contentRating: star })}
                                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                                    >
                                      <Star className={`w-4 h-4 ${feedbackForm.contentRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1.5 text-center">
                                <label className="text-xs font-medium text-[#172033]">Relevance</label>
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setFeedbackForm({ ...feedbackForm, relevanceRating: star })}
                                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                                    >
                                      <Star className={`w-4 h-4 ${feedbackForm.relevanceRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-[#172033]">
                                Remarks &amp; Feedback:
                              </label>
                              <textarea
                                rows={3}
                                required
                                placeholder="Share your experience..."
                                value={feedbackForm.comment}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                className="w-full p-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] bg-white"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={feedbackSubmitting}
                              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
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
                  <h3 className="text-sm font-semibold text-[#172033] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                    <span>Trainee Feedback ({feedbacks.length})</span>
                  </h3>

                  {feedbacks.map((fb, idx) => (
                    <div key={fb.id || idx} className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-semibold text-xs">
                            {fb.traineeName ? fb.traineeName.charAt(0) : "T"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#172033] text-xs sm:text-sm">{fb.traineeName || "Trainee"}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {fb.station || fb.department || "Operations"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-900">
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

                      <p className="text-xs text-[#475569] leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}

                  {feedbacks.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#E2E8F0] p-6">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-slate-600">No feedback submitted yet for this course</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden sticky top-6">
            
            <div className="h-48 bg-slate-100 relative group overflow-hidden border-b border-[#E2E8F0]">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent flex items-center justify-center">
                <div 
                  onClick={() => onOpenStudio(course)}
                  className="w-12 h-12 rounded-full bg-white text-[#2563EB] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <PlayCircle className="w-7 h-7 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                <span>{course.duration || "4 Weeks"}</span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-semibold">HD Video + Materials</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              
              {currentUser?.role === "trainer" || currentUser?.role === "admin" ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-blue-100" />
                  <span>Launch Learning Studio</span>
                </button>
              ) : isEnrolled ? (
                <button
                  onClick={() => onOpenStudio(course)}
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Resume Learning</span>
                </button>
              ) : currentUser?.status === "rejected" ? (
                <button
                  onClick={() => alert(`❌ Enrollment Blocked: Profile rejected.\n\nReason: "${currentUser.rejectionReason || 'Incomplete credentials.'}"`)}
                  className="w-full py-2.5 px-4 bg-rose-600 text-white font-medium rounded-lg text-xs shadow-xs"
                >
                  <span>Enrollment Locked</span>
                </button>
              ) : currentUser?.status === "pending" ? (
                <button
                  onClick={() => alert("⏳ Enrollment Restricted: Registration is under review.")}
                  className="w-full py-2.5 px-4 bg-amber-500 text-slate-950 font-medium rounded-lg text-xs shadow-xs"
                >
                  <span>Pending Admin Approval</span>
                </button>
              ) : (
                <button
                  onClick={() => onEnrollClick(course)}
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Enroll in Course</span>
                </button>
              )}

              {/* Specifications */}
              <div className="grid grid-cols-4 gap-3 text-center border-t border-b border-slate-100 py-4">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">{course.duration?.split(" ")[0] || "4w"}</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">{totalModules} Mods</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <PlayCircle className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">{totalVideos} Videos</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">{totalInteractiveDocs} Docs</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <Coins className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">Free</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">Blended</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <KeyRound className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[10px] font-medium text-slate-700">CC BY 4.0</span>
                </div>
                <div className="flex flex-col items-center justify-center space-y-1 pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-medium text-slate-700">Verified</span>
                </div>
              </div>

              {/* Creators Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[#172033]">Lead Faculty</h3>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {course.leadTrainerName?.split(" ")?.map(n => n[0])?.slice(0, 2)?.join("") || "AS"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#172033]">{course.leadTrainerName || "Faculty Instructor"}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{course.department || "Training Directorate"}</p>
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
