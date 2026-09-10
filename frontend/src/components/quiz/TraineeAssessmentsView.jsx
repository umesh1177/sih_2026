import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Award, 
  PlayCircle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  BarChart3, 
  ChevronRight, 
  Building2, 
  Layers, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { ExamAnalyticsModal } from "./ExamAnalyticsModal";
import { api } from "../../services/api";

export const TraineeAssessmentsView = ({ quizzes = [], currentUser, onStartExam }) => {
  const [activeSubTab, setActiveSubTab] = useState("available"); // "available" | "upcoming" | "completed"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamForAnalytics, setSelectedExamForAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState(quizzes);
  const [loading, setLoading] = useState(false);

  const loadAssessmentsAndSubmissions = async () => {
    setLoading(true);
    try {
      const [qRes, subRes] = await Promise.all([
        api.getQuizzes().catch(() => ({ success: false, quizzes: [] })),
        api.getTraineeSubmissions(currentUser?.id || "").catch(() => ({ success: false, submissions: [] }))
      ]);

      if (qRes.success && qRes.quizzes) {
        setAllQuizzes(qRes.quizzes);
      }
      if (subRes.success && subRes.submissions) {
        setSubmissions(subRes.submissions);
      }
    } catch (err) {
      console.error("Failed loading trainee assessments data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessmentsAndSubmissions();
  }, [currentUser]);

  const now = new Date();

  // Create submission lookup map by quizId
  const submissionMap = new Map();
  submissions.forEach(sub => {
    submissionMap.set(sub.quizId, sub);
  });

  // Dynamic Categorization based on real DB records
  const completedList = submissions.map(sub => {
    const quizObj = allQuizzes.find(q => q.id === sub.quizId) || {};
    const submittedDate = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "Recently Submitted";

    const mins = Math.floor((sub.timeTakenSeconds || 0) / 60);
    const secs = (sub.timeTakenSeconds || 0) % 60;
    const timeTakenFormatted = `${mins}m ${secs}s`;

    return {
      id: sub.id || `comp_${sub.quizId}`,
      quizId: sub.quizId,
      title: sub.quizTitle || quizObj.title || "Scheduled Assessment",
      subjects: quizObj.subjects || (quizObj.courseName ? [quizObj.courseName] : ["Core Modules"]),
      score: sub.isDisqualified ? "0 / 0 (Disqualified)" : `${sub.score} / ${sub.totalMarks} (${sub.percentage}%)`,
      scoreNum: sub.score,
      totalMarks: sub.totalMarks,
      percentage: sub.percentage,
      passed: sub.passed,
      status: sub.isDisqualified ? "Disqualified" : "Submitted",
      isDisqualified: !!sub.isDisqualified,
      disqualificationReason: sub.disqualificationReason || "Integrity rule violation (context switch)",
      submittedAt: submittedDate,
      timeTaken: timeTakenFormatted,
      timeTakenSeconds: sub.timeTakenSeconds || 0,
      durationMinutes: quizObj.durationMinutes || 30,
      accuracy: sub.isDisqualified ? 0 : sub.percentage,
      attempted: quizObj.questions ? quizObj.questions.length : (sub.answers ? Object.keys(sub.answers).length : 0),
      isPending: sub.isPending || false,
      answers: sub.answers || {},
      questions: quizObj.questions || []
    };
  });

  const availableQuizzes = allQuizzes.filter(q => {
    const existingSub = submissionMap.get(q.id);
    // If normally submitted and NOT disqualified, it belongs exclusively in Completed
    if (existingSub && !existingSub.isDisqualified) return false;

    // Check scheduling time
    if (q.scheduledStartTime) {
      const startTime = new Date(q.scheduledStartTime);
      if (startTime > now) return false; // Upcoming
    }

    if (q.deadlineTime) {
      const deadline = new Date(q.deadlineTime);
      if (deadline < now) return false; // Expired
    }

    return true;
  }).map(q => {
    const existingSub = submissionMap.get(q.id);
    const isDisq = !!existingSub?.isDisqualified;

    return {
      ...q,
      isDisqualified: isDisq,
      disqualificationReason: existingSub?.disqualificationReason || "Security rule violation: Multiple window/tab switches detected.",
      startsDate: q.scheduledStartTime ? new Date(q.scheduledStartTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Open Assessment",
      startsRelative: "Live Now",
      endsDate: q.deadlineTime ? new Date(q.deadlineTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Open Deadline",
      endsRelative: "Active Window",
      subjects: q.subjects || (q.courseName ? [q.courseName] : ["Core Curriculum"])
    };
  });

  const upcomingQuizzes = allQuizzes.filter(q => {
    if (submissionMap.has(q.id)) return false;
    if (q.scheduledStartTime) {
      const startTime = new Date(q.scheduledStartTime);
      return startTime > now;
    }
    return false;
  }).map(q => {
    const startTime = new Date(q.scheduledStartTime);
    const diffMs = startTime - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      ...q,
      scheduledDate: startTime.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      unlocksIn: diffDays === 1 ? "in 1 day" : `in ${diffDays} days`,
      startsDate: startTime.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      startsRelative: `in ${diffDays} days`,
      endsDate: q.deadlineTime ? new Date(q.deadlineTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Standard Window",
      endsRelative: `Scheduled`,
      subjects: q.subjects || (q.courseName ? [q.courseName] : ["Core Curriculum"])
    };
  });

  const filteredCompleted = completedList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAvailable = availableQuizzes.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subjects || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUpcoming = upcomingQuizzes.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subjects || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans select-none text-slate-800">
      
      {/* ═════════ TOP HEADER BANNER ═════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Scheduled Assessments & Exams
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Attempt official assessments in proctored fullscreen kiosk mode to earn verified credentials.
          </p>
        </div>

        {/* 3 Main Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveSubTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "available"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Available ({availableQuizzes.length})
          </button>

          <button
            onClick={() => setActiveSubTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "upcoming"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upcoming ({upcomingQuizzes.length})
          </button>

          <button
            onClick={() => setActiveSubTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "completed"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedList.length})
          </button>
        </div>
      </div>

      {/* ═════════ SUB-TAB 1: AVAILABLE (LIGHT CARDS) ═════════ */}
      {activeSubTab === "available" && (
        <div className="space-y-4">
          {filteredAvailable.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No Available Assessments</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have completed all active assessments, or no new assessments are currently in session.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
              {filteredAvailable.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>CapacityConnect</span>
                        </div>
                      </div>

                      {quiz.isDisqualified ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[11px] font-bold shrink-0">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Disqualified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold shrink-0">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Live Now</span>
                        </div>
                      )}
                    </div>

                    {quiz.isDisqualified && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-900 space-y-1">
                        <div className="font-extrabold flex items-center gap-1 text-red-800">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Security Violation: Disqualified</span>
                        </div>
                        <p className="text-red-700 leading-snug">
                          Exam locked due to repeated tab switching. You cannot start or enter this exam until your Lead Trainer grants a second chance.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>STARTS</span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs">{quiz.startsDate}</p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>ENDS</span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs">{quiz.endsDate}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <Layers className="w-3 h-3" />
                        <span>SUBJECTS</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {quiz.subjects.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{quiz.durationMinutes || 30} mins</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        <span>{quiz.totalMarks || 30} marks</span>
                      </span>
                    </div>

                    {quiz.isDisqualified ? (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-red-100 border border-red-300 text-red-700 font-bold rounded-xl text-xs cursor-not-allowed opacity-90 shadow-2xs"
                        title="Disqualified: Trainee cannot enter this assessment without trainer second chance permission."
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Locked (Disqualified)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartExam(quiz)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all transform hover:scale-[1.02] active:scale-95"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═════════ SUB-TAB 2: UPCOMING ═════════ */}
      {activeSubTab === "upcoming" && (
        <div className="space-y-4">
          {filteredUpcoming.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No Upcoming Assessments</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are currently no scheduled future assessments assigned to your active tracks.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
              {filteredUpcoming.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-base text-slate-900 leading-tight">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>CapacityConnect</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{quiz.unlocksIn}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          Go-Live: {quiz.scheduledDate || quiz.startsDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Instructor: <span className="font-bold text-amber-950">{quiz.trainerName || "Faculty Lead"}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <Layers className="w-3 h-3" />
                        <span>SUBJECTS</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {quiz.subjects.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{quiz.durationMinutes || 30} mins</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        <span>{quiz.totalMarks || 30} marks</span>
                      </span>
                    </div>

                    <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Locked</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═════════ SUB-TAB 3: COMPLETED EXAMS TABLE VIEW ═════════ */}
      {activeSubTab === "completed" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6 animate-in fade-in duration-150">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search completed assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Total Attempts: {filteredCompleted.length}
              </span>
            </div>
          </div>

          {filteredCompleted.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No Completed Assessments</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have not completed any assessments yet. Take an available assessment to view performance analysis and results.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Quiz / Assessment</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Time Taken</th>
                    <th className="py-3 px-4 text-right">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompleted.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                          {row.title}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {row.subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-xs">
                        {row.isPending ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            Evaluation Pending
                          </span>
                        ) : (
                          <span className="text-slate-900 font-bold">
                            {row.score}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {row.isDisqualified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Disqualified</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            row.passed
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{row.passed ? "Passed" : "Needs Retest"}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {row.submittedAt}
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-mono font-medium whitespace-nowrap">
                        {row.timeTaken}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedExamForAnalytics(row)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all border border-blue-200"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>View Analytics</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ═════════ DETAILED EXAM ANALYTICS MODAL ═════════ */}
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
