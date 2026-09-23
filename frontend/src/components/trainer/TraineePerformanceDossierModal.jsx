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
  FileQuestion,
  PlayCircle,
  AlertTriangle,
  Zap,
  Layers,
  Sparkles
} from "lucide-react";

export const TraineePerformanceDossierModal = ({ trainee, course, onClose }) => {
  const [activeDossierTab, setActiveDossierTab] = useState("overview"); // "overview" | "quizzes" | "gaps" | "competencies"
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

  const learningPos = trainee.currentLearningPosition || {
    subjectName: "Numerical Weather Prediction",
    moduleTitle: "Data Assimilation & Satellite Radiance Ingestion",
    videoTitle: "INSAT-3DR Radiance Ingestion & 3D-Var Quality Control",
    isWatchedFull: progressPercentage >= 100,
    watchPercentage: progressPercentage >= 100 ? 100 : (progressPercentage > 50 ? 80 : 45),
    watchedDurationText: progressPercentage >= 100 ? "45m / 45m (100% Watched)" : "22m / 30m (73% Watched)",
    lastWatchedDate: "Today at 07:45 AM"
  };

  const learningGaps = trainee.learningGaps || [
    {
      topic: "Doppler Radar Velocity De-Aliasing & Dual-PRF",
      subject: "Radar Meteorology",
      accuracy: avgQuizScore > 80 ? 68 : 48,
      status: avgQuizScore > 80 ? "Developing" : "Needs Attention",
      gapType: "Conceptual Calibration",
      recommendation: "Review Nyquist interval and dual-PRF velocity unfolding practical laboratory modules."
    },
    {
      topic: "Background Error Covariance (B-Matrix) Inversion",
      subject: "Data Assimilation",
      accuracy: avgQuizScore > 75 ? 74 : 52,
      status: avgQuizScore > 75 ? "Developing" : "Needs Attention",
      gapType: "Mathematical Formulation",
      recommendation: "Complete NMC method matrix synthesis exercises in Module 2."
    },
    {
      topic: "Satellite Infrared Radiance Sounding",
      subject: "Satellite Meteorology",
      accuracy: 88,
      status: "Strong",
      gapType: "Mastered",
      recommendation: "Ready for advanced RTTOV fast radiative transfer modeling."
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 my-auto">
        
        {/* ═════════ HEADER: OFFICER RECORD PROFILE (CLEAN MODERN THEME) ═════════ */}
        <div className="p-5 sm:p-6 bg-white border-b border-slate-200 text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          
          <div className="flex items-center gap-3.5">
            <img
              src={trainee.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
              alt={trainee.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-100 shadow-2xs shrink-0"
            />

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  {trainee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {trainee.status || "Enrolled Trainee"}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{trainee.designation || "Scientist 'B' Trainee"} • {trainee.department || "IMD Division"}</span>
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium">
                {trainee.cadreId && (
                  <span className="flex items-center gap-1 font-mono text-blue-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ID: {trainee.cadreId}</span>
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{trainee.station || "National Forecasting Centre"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="bg-slate-50 rounded-xl p-2.5 px-3.5 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">AVERAGE SCORE</span>
              <span className="text-lg font-bold text-blue-700">{avgQuizScore}%</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ═════════ SUB-TABS NAVIGATION ═════════ */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/60 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveDossierTab("overview")}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDossierTab === "overview"
                ? "border-blue-700 text-blue-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Course &amp; Video Progress Tracker
          </button>

          <button
            onClick={() => setActiveDossierTab("quizzes")}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeDossierTab === "quizzes"
                ? "border-blue-700 text-blue-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Assessments &amp; Test Scores</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {submissions.length || trainee.examsGivenCount || 2}
            </span>
          </button>

          <button
            onClick={() => setActiveDossierTab("gaps")}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeDossierTab === "gaps"
                ? "border-blue-700 text-blue-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Learning Gap Detection</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
              {learningGaps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveDossierTab("competencies")}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDossierTab === "competencies"
                ? "border-blue-700 text-blue-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Verified Competencies &amp; Remarks
          </button>
        </div>

        {/* ═════════ BODY CONTENT AREA ═════════ */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-slate-50/40">
          
          {/* TAB 1: COURSE & VIDEO PROGRESS TRACKER */}
          {activeDossierTab === "overview" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Course Progress Card */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      ENROLLED COURSE PROGRESS
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5">
                      {trainee.courseTitle || course?.title || "Operational Meteorological Modeling"}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      Course Code: <span className="font-mono text-slate-700">{trainee.courseCode || course?.code || "MOES-MET-01"}</span> • Enrolled Date: {trainee.enrolledDate || "15 Jan 2026"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold text-blue-700">{progressPercentage}%</span>
                    <p className="text-[10px] font-medium text-slate-400">Total Course Completion</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>Modules Cleared: <b>{trainee.completedModulesCount || Math.ceil((progressPercentage / 100) * 6)} of {trainee.totalModulesCount || 6}</b></span>
                    <span>Status: <b>{trainee.status || (progressPercentage >= 100 ? "Completed" : "In Progress")}</b></span>
                  </div>
                </div>
              </div>

              {/* LIVE LEARNING POSITION & VIDEO TELEMETRY TRACKER */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-blue-700" />
                    <span>Current Learning Position &amp; Video Watch Status</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    learningPos.isWatchedFull
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}>
                    {learningPos.isWatchedFull ? "Full Video Completed" : "In-Progress Stream"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Current Lesson Details */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Module Reached</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">{learningPos.moduleTitle}</p>
                      <p className="text-[11px] text-slate-500">{learningPos.subjectName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Video Lecture</span>
                      <p className="font-semibold text-blue-900 text-xs mt-0.5 flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{learningPos.videoTitle}</span>
                      </p>
                    </div>
                  </div>

                  {/* Video Watch Telemetry */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Video Watch Progress</span>
                      <span className="text-xs font-bold text-slate-800">{learningPos.watchPercentage}%</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${learningPos.isWatchedFull ? "bg-emerald-600" : "bg-blue-700"}`}
                        style={{ width: `${learningPos.watchPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Watch Time: <b>{learningPos.watchedDurationText}</b></span>
                      <span className="text-slate-400">{learningPos.lastWatchedDate}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Trainee watched full video?</span>
                      <span className={`font-bold ${learningPos.isWatchedFull ? "text-emerald-700" : "text-amber-700"}`}>
                        {learningPos.isWatchedFull ? "✓ Yes (Full 100%)" : "⏳ In Progress"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">EXAMS GIVEN</span>
                  <p className="text-lg font-bold text-slate-900 mt-1">{submissions.length || trainee.examsGivenCount || 2}</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">ACCURACY RATE</span>
                  <p className="text-lg font-bold text-emerald-700 mt-1">{avgQuizScore}%</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">TRAINING STATUS</span>
                  <p className="text-lg font-bold text-blue-700 mt-1">{trainee.status || "In Progress"}</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">VERIFIED SKILLS</span>
                  <p className="text-lg font-bold text-purple-700 mt-1">{trainee.skills?.length || 4} Units</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EXAMS & TEST SCORES */}
          {activeDossierTab === "quizzes" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Assessment History &amp; Test Marks</h4>
                  <p className="text-[11px] text-slate-500">Record of all tests attempted, marks scored, and timing telemetry.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Total Exams Given: {submissions.length || trainee.examsGivenCount || 2}
                  </span>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-3.5">Assessment Title</th>
                        <th className="py-3 px-3.5">Score / Marks</th>
                        <th className="py-3 px-3.5">Percentage</th>
                        <th className="py-3 px-3.5">Time Spent</th>
                        <th className="py-3 px-3.5">Date</th>
                        <th className="py-3 px-3.5 text-right">Result Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          Numerical Weather Prediction &amp; Modeling
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          36 / 40 M
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-emerald-700">
                          90%
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">
                          18 mins
                        </td>
                        <td className="py-3 px-3.5 text-slate-400">
                          20 Feb 2026
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            PASSED
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          Radar Meteorology &amp; DWR Operations
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          28 / 40 M
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-blue-700">
                          70%
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">
                          22 mins
                        </td>
                        <td className="py-3 px-3.5 text-slate-400">
                          15 Feb 2026
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            PASSED
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-3.5">Assessment Title</th>
                        <th className="py-3 px-3.5">Score / Marks</th>
                        <th className="py-3 px-3.5">Accuracy</th>
                        <th className="py-3 px-3.5">Time Spent</th>
                        <th className="py-3 px-3.5">Date</th>
                        <th className="py-3 px-3.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((sub, idx) => (
                        <tr key={sub.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            {sub.title || sub.quizTitle || "Assessment"}
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            {sub.score}/{sub.totalMarks} ({sub.percentage}%)
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-slate-700">
                            {sub.accuracy || sub.percentage}%
                          </td>
                          <td className="py-3 px-3.5 text-slate-600">
                            {sub.timeSpent || (sub.timeTakenMinutes ? `${sub.timeTakenMinutes}m` : "—")}
                          </td>
                          <td className="py-3 px-3.5 text-slate-400">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              (sub.percentage || 0) >= 50
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
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

          {/* TAB 3: LEARNING GAP DETECTION */}
          {activeDossierTab === "gaps" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Learning Gap Diagnostics &amp; Remediation Protocol
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Automated concept gap detection derived from trainee question responses and exam errors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {learningGaps.map((gap, gIdx) => (
                  <div
                    key={gIdx}
                    className={`p-4 rounded-xl border bg-white space-y-2.5 transition-all ${
                      gap.accuracy >= 80 
                        ? "border-emerald-200 hover:border-emerald-300" 
                        : (gap.accuracy >= 60 ? "border-amber-200 hover:border-amber-300" : "border-rose-200 hover:border-rose-300")
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-xs">{gap.topic}</h5>
                          <span className="text-[10px] text-slate-400 font-medium">({gap.subject})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Diagnosis: <b>{gap.gapType}</b></p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-xs font-bold text-slate-800">{gap.accuracy}% Accuracy</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          gap.accuracy >= 80 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                            : (gap.accuracy >= 60 ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-rose-50 text-rose-800 border border-rose-200")
                        }`}>
                          {gap.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                      <Zap className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                      <span><b>Recommended Remediation:</b> {gap.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPETENCIES & REMARKS */}
          {activeDossierTab === "competencies" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Verified Meteorological Competencies</h4>
                {(!trainee.skills || trainee.skills.length === 0) ? (
                  <p className="text-slate-400 text-xs">No specific skill tags mapped yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {trainee.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg font-medium text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <h5 className="font-semibold text-slate-800 text-xs">Learner Background &amp; Bio</h5>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {trainee.bio || "Scientific Assistant / Trainee Officer undergoing capacity building in operational meteorology and numerical modeling."}
                  </p>
                </div>
              </div>

              {/* Trainer Remarks Log */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span>Trainer Evaluation Remarks &amp; Feedback Notes</span>
                </h4>

                {savedNotes.length === 0 ? (
                  <p className="text-slate-400 text-xs py-1">No confidential trainer remarks logged yet for this officer.</p>
                ) : (
                  <div className="space-y-2">
                    {savedNotes.map((note, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-slate-700 font-medium">{note}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add confidential evaluation note for this officer..."
                    value={trainerNote}
                    onChange={(e) => setTrainerNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNote())}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3.5 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
