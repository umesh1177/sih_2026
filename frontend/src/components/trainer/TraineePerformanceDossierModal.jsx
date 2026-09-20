import React, { useState, useMemo } from "react";
import { 
  X, 
  User, 
  Award, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  BookOpen, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Star,
  Check,
  ChevronRight,
  Target,
  FileQuestion
} from "lucide-react";

export const TraineePerformanceDossierModal = ({ trainee, onClose }) => {
  const [activeDossierTab, setActiveDossierTab] = useState("overview"); // "overview" | "quizzes" | "competencies"
  const [trainerNote, setTrainerNote] = useState("");
  const [savedNotes, setSavedNotes] = useState(trainee?.trainerNotes || []);

  if (!trainee) return null;

  const handleAddNote = () => {
    if (!trainerNote.trim()) return;
    setSavedNotes(prev => [...prev, trainerNote.trim()]);
    setTrainerNote("");
  };

  const submissions = trainee.submissions || [];

  const avgQuizScore = useMemo(() => {
    if (trainee.avgQuizScore !== undefined) return trainee.avgQuizScore;
    if (submissions.length > 0) {
      const sum = submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      return Math.round(sum / submissions.length);
    }
    return 0;
  }, [trainee, submissions]);

  const progressPercentage = useMemo(() => {
    if (trainee.progressPercentage !== undefined) return trainee.progressPercentage;
    if (trainee.totalModulesCount && trainee.totalModulesCount > 0) {
      return Math.round(((trainee.completedModulesCount || 0) / trainee.totalModulesCount) * 100);
    }
    return 0;
  }, [trainee]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 my-auto relative">
        
        {/* ═════════ HEADER: CADET PROFILE CARD (LIGHT THEME) ═════════ */}
        <div className="p-6 bg-white border-b border-slate-200 text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shrink-0">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-semibold text-2xl shadow-xs shrink-0">
              {trainee.name?.split(" ").map(n => n[0]).join("") || "TR"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {trainee.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {trainee.status || "Active Learner"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{trainee.designation || "Trainee"} • {trainee.department || "Operational Directorate"}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                {trainee.cadreId && (
                  <span className="flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>ID: {trainee.cadreId}</span>
                  </span>
                )}
                {trainee.station && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trainee.station}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">AVERAGE SCORE</span>
              <span className="text-xl font-bold text-blue-700">{avgQuizScore}%</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ═════════ SUB-TABS NAVIGATION ═════════ */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveDossierTab("overview")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeDossierTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Course Progress & Milestones
          </button>

          <button
            onClick={() => setActiveDossierTab("quizzes")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeDossierTab === "quizzes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Assessments & Test Scores</span>
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
              {submissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveDossierTab("competencies")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeDossierTab === "competencies"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Verified Competencies & Bio
          </button>
        </div>

        {/* ═════════ BODY CONTENT AREA ═════════ */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-slate-50/30">
          
          {/* TAB 1: COURSE PROGRESS & MILESTONES */}
          {activeDossierTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Enrolled Course Highlight Card */}
              <div className="p-5 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      CURRENT ENROLLED PROGRAM
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-1.5">
                      {trainee.courseTitle || "Specialized Training Track"}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      Course Code: <span className="font-mono font-medium text-slate-700">{trainee.courseCode || "MOES-TR-01"}</span> • Enrolled Date: {trainee.enrolledDate || "Current Term"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-blue-700">{progressPercentage}%</span>
                    <p className="text-[11px] font-medium text-slate-400">Overall Completion</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>Modules Cleared: {trainee.completedModulesCount || 0} of {trainee.totalModulesCount || 0}</span>
                    <span>Status: {trainee.status || "In Progress"}</span>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">QUIZZES TAKEN</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{submissions.length}</p>
                </div>

                <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">ACCURACY RATE</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{avgQuizScore}%</p>
                </div>

                <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">TRAINING STATUS</span>
                  <p className="text-xl font-black text-blue-700 mt-1">{trainee.status || "Active"}</p>
                </div>

                <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">VERIFIED SKILLS</span>
                  <p className="text-xl font-black text-purple-700 mt-1">{trainee.skills?.length || 0} Units</p>
                </div>
              </div>

              {/* Trainer Notes & Qualitative Audit */}
              <div className="p-5 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Lead Trainer Evaluation Notes & Remarks</span>
                </h4>

                {savedNotes.length === 0 ? (
                  <p className="text-slate-400 text-xs py-2">No confidential trainer remarks logged yet for this cadet.</p>
                ) : (
                  <div className="space-y-2">
                    {savedNotes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-[var(--radius)] border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-slate-700 font-medium">{note}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add confidential trainer remark for this cadet..."
                    value={trainerNote}
                    onChange={(e) => setTrainerNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNote())}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[var(--radius)] text-xs transition-colors"
                  >
                    Add Remark
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ALL QUIZ PERFORMANCE HISTORY */}
          {activeDossierTab === "quizzes" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {submissions.length === 0 ? (
                <div className="py-12 bg-white rounded-[var(--radius)] border border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <FileQuestion className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-slate-800 text-sm">No Assessment Submissions Logged</h4>
                  <p className="text-xs text-slate-500">This trainee has not yet completed any scheduled assessments.</p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-4">Assessment Title</th>
                        <th className="py-3.5 px-4">Score</th>
                        <th className="py-3.5 px-4">Accuracy</th>
                        <th className="py-3.5 px-4">Time Taken</th>
                        <th className="py-3.5 px-4">Submitted Date</th>
                        <th className="py-3.5 px-4 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            {sub.title || sub.quizTitle || "Assessment"}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            {sub.score}/{sub.totalMarks} ({sub.percentage}%)
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {sub.accuracy || sub.percentage}%
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {sub.timeSpent || (sub.timeTakenMinutes ? `${sub.timeTakenMinutes}m` : "—")}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              (sub.percentage || 0) >= 90
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : (sub.percentage || 0) >= 50
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-rose-100 text-rose-900 border border-rose-300"
                            }`}>
                              {sub.status || ((sub.percentage || 0) >= 50 ? "Passed" : "Needs Review")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPETENCIES & BIO */}
          {activeDossierTab === "competencies" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">Verified Skills & Knowledge Areas</h4>
                {(!trainee.skills || trainee.skills.length === 0) ? (
                  <p className="text-slate-400 text-xs">No specific skill tags mapped yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {trainee.skills.map((s, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-[var(--radius)] font-medium text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <h5 className="font-semibold text-slate-800 text-xs">Learner Biography / Background</h5>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {trainee.bio || "No biography provided in profile dossier."}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ═════════ FOOTER ACTIONS ═════════ */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 rounded-b-xl">
          <div className="text-[11px] text-slate-400 font-medium">
            Learner Performance Record
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
