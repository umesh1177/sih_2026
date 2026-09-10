import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Clock3, 
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
  Lock, 
  MessageSquare, 
  Send, 
  Check, 
  Eye, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Plus, 
  Building2, 
  Search, 
  Star
} from "lucide-react";
import { api } from "../../services/api";
import { TraineePerformanceDossierModal } from "../trainer/TraineePerformanceDossierModal";
import { QuizEvaluationModal } from "../trainer/QuizEvaluationModal";
import { ExamAnalyticsModal } from "../quiz/ExamAnalyticsModal";
import { StatusBadge } from "../common/StatusBadge";

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
  const [loadingProgress, setLoadingProgress] = useState(false);
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

  const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

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

  const allModules = course?.subjects?.flatMap(s => s.modules || []) || [];
  const totalModuleCount = allModules.length || 1;
  const completedModuleCount = allModules.filter(m => userProgress[m.id]?.completed).length;
  const progressPercentage = completedModuleCount > 0 
    ? Math.round((completedModuleCount / totalModuleCount) * 100)
    : (isEnrolled ? 65 : 0);

  const isCourse100Percent = progressPercentage >= 100 || currentUser?.role === "trainer" || currentUser?.role === "admin";

  const totalSubjects = course.subjects?.length || 2;
  const totalModules = totalModuleCount;
  const totalVideos = course.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type === "video").length || 0), 0) || 0), 0) || 3;
  const totalInteractiveDocs = course.subjects?.reduce((acc, sub) => 
    acc + (sub.modules?.reduce((mAcc, mod) => 
      mAcc + (mod.materials?.filter(m => m.type !== "video").length || 0), 0) || 0), 0) || 9;

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

  const defaultOutcomes = [
    `Master foundational principles and operational frameworks of ${course.category || "Atmospheric Sciences"}.`,
    `Apply specialized data tools, satellite imagery, and radar algorithms compliant with MoES/IMD SOPs.`,
    `Perform real-time forecasting, hazard identification, and multi-model ensemble analysis during active events.`,
    `Synthesize quantitative weather bulletins and advisories for disaster management authorities.`,
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
    <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] pb-16">
      
      {/* ─── Top Institutional Header ─── */}
      <div className="bg-white border-b border-[#D9E2EC] px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#164E63] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Catalog</span>
          </button>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1D4ED8] border border-blue-200 uppercase tracking-wider">
                {course.code}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-[#0F766E] border border-teal-200">
                {course.category}
              </span>
              {isEnrolled && currentUser?.role !== "trainer" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled ({progressPercentage}%)
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-[#1E293B] tracking-tight">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
              <span>Department: <b>{course.department || "MoES / IMD"}</b></span>
              <span>•</span>
              <span>Lead Faculty: <b>{course.leadTrainerName || "Dr. Amit Sengupta"}</b></span>
              <span>•</span>
              <span>Duration: <b>{course.duration}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 Cols): Navigation Tabs & Tab Content */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Tabs Header */}
            <div className="gov-card p-1.5 flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "about"
                    ? "bg-[#164E63] text-white"
                    : "text-[#475569] hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>About</span>
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "content"
                    ? "bg-[#164E63] text-white"
                    : "text-[#475569] hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum & Materials</span>
              </button>

              {currentUser?.role === "trainer" && (
                <>
                  <button
                    onClick={() => setActiveTab("trainees")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeTab === "trainees"
                        ? "bg-[#164E63] text-white"
                        : "text-[#475569] hover:bg-slate-100"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Enrolled Cadets ({courseTrainees.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                      activeTab === "quizzes"
                        ? "bg-[#164E63] text-white"
                        : "text-[#475569] hover:bg-slate-100"
                    }`}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Subject Quizzes ({courseQuizzes.length})</span>
                  </button>
                </>
              )}

              {currentUser?.role !== "trainer" && (
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                    activeTab === "feedback"
                      ? "bg-[#164E63] text-white"
                      : "text-[#475569] hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                  {!isCourse100Percent && <Lock className="w-3 h-3 text-amber-500 ml-0.5" />}
                </button>
              )}
            </div>

            {/* TAB 1: ABOUT */}
            {activeTab === "about" && (
              <div className="gov-card p-6 space-y-6">
                
                {/* Description */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#164E63]" />
                    <span>Course Description</span>
                  </h2>
                  <p className={`text-xs text-[#64748B] leading-relaxed ${
                    expandedDescription ? "" : "line-clamp-3"
                  }`}>
                    {course.description || "Detailed instructional curricula designed for operational atmospheric science, radar nowcasting, and numerical weather modeling."}
                  </p>
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                  >
                    {expandedDescription ? "Show less" : "Read more"}
                  </button>
                </div>

                {/* Learning Outcomes */}
                <div className="space-y-2.5">
                  <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Learning Objectives</span>
                  </h2>
                  <ul className="space-y-2 text-xs text-[#64748B]">
                    {(expandedOutcomes ? defaultOutcomes : defaultOutcomes.slice(0, 3)).map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2.5 rounded bg-[#F8FAFC] border border-[#D9E2EC]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setExpandedOutcomes(!expandedOutcomes)}
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                  >
                    {expandedOutcomes ? "Show less" : "View all objectives"}
                  </button>
                </div>

                {/* Prerequisites */}
                <div className="space-y-2.5 pt-2 border-t border-[#D9E2EC]">
                  <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#164E63]" />
                    <span>Prerequisites & Eligibility</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Array.isArray(course.prerequisites) ? course.prerequisites : [course.prerequisites || "Atmospheric Dynamics"]).map((prereq, i) => (
                      <div key={i} className="p-2.5 rounded border border-[#D9E2EC] bg-[#F8FAFC] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-[#1E293B]">{prereq}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase px-1.5 py-0.5 rounded bg-slate-200">
                          Required
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competency Mapping */}
                <div className="space-y-2.5 pt-2 border-t border-[#D9E2EC]">
                  <h2 className="text-sm font-bold text-[#1E293B]">
                    Target Competency Tags
                  </h2>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 font-medium">
                      {course.category || "Domain Specialization"}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-teal-50 text-[#0F766E] border border-teal-200 font-medium">
                      MoES Tier-1 Standard
                    </span>
                    {(course.competenciesGained || []).map((comp, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CURRICULUM & MATERIALS */}
            {activeTab === "content" && (
              <div className="gov-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">Curriculum Structure & Study Materials</h2>
                    <p className="text-xs text-[#64748B]">Official lectures, presentation decks, and technical manuals</p>
                  </div>
                  <span className="text-xs font-semibold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {totalSubjects} Subjects • {totalModules} Modules
                  </span>
                </div>

                <div className="space-y-3">
                  {(course.subjects || []).map((subject, sIdx) => {
                    const isOpen = openSubjectId === subject.id || openSubjectId === "";
                    return (
                      <div key={subject.id || sIdx} className="border border-[#D9E2EC] rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenSubjectId(isOpen ? "__closed" : subject.id)}
                          className="w-full p-3.5 bg-[#F8FAFC] hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-semibold text-[#164E63] uppercase tracking-wider">
                              Subject {sIdx + 1}
                            </span>
                            <h3 className="font-bold text-xs text-[#1E293B] mt-0.5">{subject.name || subject.title}</h3>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="p-4 space-y-3 bg-white border-t border-[#D9E2EC]">
                            {(subject.modules || []).map((mod, mIdx) => (
                              <div key={mod.id || mIdx} className="p-3 rounded bg-[#F8FAFC] border border-[#D9E2EC] space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-xs text-[#1E293B] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]"></span>
                                    <span>Module {mIdx + 1}: {mod.title || mod.name}</span>
                                  </h4>
                                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                                    <Clock3 className="w-3 h-3 text-[#94A3B8]" /> {mod.duration || "4h"}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  {(mod.materials || []).map((mat, matIdx) => (
                                    <div key={mat.id || matIdx} className="p-2.5 bg-white rounded border border-[#D9E2EC] flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        {mat.type === "video" ? (
                                          <PlayCircle className="w-4 h-4 text-blue-600 shrink-0" />
                                        ) : (
                                          <FileText className="w-4 h-4 text-[#0F766E] shrink-0" />
                                        )}
                                        <div>
                                          <span className="font-semibold text-[#1E293B] block">{mat.title}</span>
                                          <span className="text-[11px] text-[#64748B]">
                                            {mat.type === "video" ? `Video • ${mat.duration || "45m"}` : `Document • ${mat.size || "34p"}`}
                                          </span>
                                        </div>
                                      </div>

                                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-[#475569]">
                                        Protected
                                      </span>
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

            {/* TAB 3 (TRAINER): ENROLLED CADETS */}
            {activeTab === "trainees" && currentUser?.role === "trainer" && (
              <div className="gov-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">
                      Enrolled Cadets ({filteredTrainees.length})
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Monitor individual module completions and evaluation scores.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search cadet..."
                      value={traineeSearch}
                      onChange={(e) => setTraineeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9E2EC] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="gov-table-header">
                      <tr>
                        <th className="py-2.5 px-3">Trainee</th>
                        <th className="py-2.5 px-3">Cadre & Station</th>
                        <th className="py-2.5 px-3">Progress</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E2EC]">
                      {filteredTrainees.map((trainee) => (
                        <tr key={trainee.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-[#1E293B] block">{trainee.name}</span>
                            <span className="text-[10px] text-[#64748B]">{trainee.email}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[#1E293B] block">{trainee.cadreId}</span>
                            <span className="text-[10px] text-[#64748B]">{trainee.station}</span>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#1D4ED8] rounded-full"
                                  style={{ width: `${trainee.progressPercentage}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[11px]">{trainee.progressPercentage}%</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-semibold text-[#1E293B]">
                            {trainee.avgQuizScore}%
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedTraineeForDossier(trainee)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#1D4ED8] border border-[#D9E2EC] font-semibold rounded text-xs transition-colors"
                            >
                              Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4 (TRAINER): SUBJECT QUIZZES */}
            {activeTab === "quizzes" && currentUser?.role === "trainer" && (
              <div className="gov-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">
                      Subject Quizzes & Evaluation
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Evaluate submissions and publish results for trainees.
                    </p>
                  </div>

                  <button
                    onClick={onOpenAiGenerator}
                    className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Quiz</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredQuizzes.map((quiz) => {
                    const isPublished = quiz.resultsPublished;

                    return (
                      <div
                        key={quiz.id}
                        className="p-4 rounded border border-[#D9E2EC] bg-white space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1D4ED8] border border-blue-200 rounded text-[10px] font-semibold">
                              {quiz.subjectName || "Subject"}
                            </span>
                            {isPublished ? (
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Results Published
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Pending Evaluation
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-[#64748B]">
                            {quiz.durationMinutes} mins • {quiz.totalMarks} Marks
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-[#1E293B]">{quiz.title}</h3>
                        <p className="text-xs text-[#64748B]">
                          Submissions: <b>{quiz.submissionsCount || 34} Cadets</b>
                        </p>

                        <div className="pt-2 border-t border-[#D9E2EC] flex items-center justify-between">
                          <button
                            onClick={() => setSelectedQuizForEvaluation(quiz)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] font-semibold rounded text-xs transition-colors"
                          >
                            Evaluate Submissions
                          </button>

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
                              className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white font-semibold rounded text-xs transition-colors"
                            >
                              Publish Results
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Published
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: FEEDBACK */}
            {activeTab === "feedback" && currentUser?.role !== "trainer" && (
              <div className="gov-card p-6 space-y-4">
                {!isCourse100Percent ? (
                  <div className="text-center py-8 p-4 bg-[#F8FAFC] rounded border border-[#D9E2EC] space-y-2">
                    <Lock className="w-6 h-6 text-amber-600 mx-auto" />
                    <h3 className="text-xs font-bold text-[#1E293B]">
                      Feedback Locked ({progressPercentage}% Complete)
                    </h3>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                      Course feedback unlocks once you reach 100% completion of all modules.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-[#1E293B]">Official Course Evaluation</h2>
                    
                    {feedbackSubmitted ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center text-xs text-emerald-800">
                        Thank you. Your feedback has been registered with the training directorate.
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded bg-[#F8FAFC] border border-[#D9E2EC] text-center space-y-1">
                            <label className="font-semibold text-[#1E293B] block">Trainer Quality</label>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setFeedbackForm({ ...feedbackForm, trainerRating: star })}
                                  className="text-amber-500"
                                >
                                  <Star className={`w-4 h-4 ${feedbackForm.trainerRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded bg-[#F8FAFC] border border-[#D9E2EC] text-center space-y-1">
                            <label className="font-semibold text-[#1E293B] block">Content Rigor</label>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setFeedbackForm({ ...feedbackForm, contentRating: star })}
                                  className="text-amber-500"
                                >
                                  <Star className={`w-4 h-4 ${feedbackForm.contentRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded bg-[#F8FAFC] border border-[#D9E2EC] text-center space-y-1">
                            <label className="font-semibold text-[#1E293B] block">Relevance</label>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setFeedbackForm({ ...feedbackForm, relevanceRating: star })}
                                  className="text-amber-500"
                                >
                                  <Star className={`w-4 h-4 ${feedbackForm.relevanceRating >= star ? "fill-amber-400" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-[#1E293B] block mb-1">
                            Detailed Feedback & Recommendations:
                          </label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Share your practical feedback on course clarity and hands-on modules..."
                            value={feedbackForm.comment}
                            onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                            className="w-full p-2.5 rounded border border-[#D9E2EC] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={feedbackSubmitting}
                          className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors"
                        >
                          Submit Evaluation
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column (4 Cols): Course Specifications & Action Box */}
          <div className="lg:col-span-4 gov-card p-5 space-y-5 sticky top-4">
            
            {/* Action Button */}
            {currentUser?.role === "trainer" || currentUser?.role === "admin" ? (
              <button
                onClick={() => onOpenStudio(course)}
                className="w-full py-2.5 bg-[#164E63] hover:bg-[#113e4f] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Launch Learning Studio</span>
              </button>
            ) : isEnrolled ? (
              <button
                onClick={() => onOpenStudio(course)}
                className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Continue Learning</span>
              </button>
            ) : (
              <button
                onClick={() => onEnrollClick(course)}
                className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enroll in Course</span>
              </button>
            )}

            {/* Key Specs Table */}
            <div className="space-y-2 text-xs border-t border-[#D9E2EC] pt-4">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Duration</span>
                <span className="font-semibold text-[#1E293B]">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Modules</span>
                <span className="font-semibold text-[#1E293B]">{totalModules} Lessons</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Videos</span>
                <span className="font-semibold text-[#1E293B]">{totalVideos} Video Lectures</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Study Docs</span>
                <span className="font-semibold text-[#1E293B]">{totalInteractiveDocs} Manuals</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Access Mode</span>
                <span className="font-semibold text-[#1E293B]">Blended / Institutional</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">Accreditation</span>
                <span className="font-semibold text-[#15803D]">MoES / IMD Verified</span>
              </div>
            </div>

            {/* Lead Faculty Info */}
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#D9E2EC] space-y-1">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Lead Faculty
              </span>
              <p className="font-bold text-xs text-[#1E293B]">{course.leadTrainerName || "Dr. Amit Sengupta"}</p>
              <p className="text-[11px] text-[#64748B]">{course.department || "Numerical Weather Prediction Division"}</p>
            </div>

          </div>

        </div>
      </div>

      {/* Modals */}
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
