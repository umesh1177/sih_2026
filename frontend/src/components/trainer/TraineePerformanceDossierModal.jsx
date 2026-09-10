import React, { useState } from "react";
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
  Target
} from "lucide-react";

export const TraineePerformanceDossierModal = ({ trainee, onClose }) => {
  const [activeDossierTab, setActiveDossierTab] = useState("overview"); // "overview" | "quizzes" | "competencies"
  const [trainerNote, setTrainerNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([
    "Cadet demonstrates exceptional mastery in 4D-Var cost function minimization.",
    "Recommended for Tier-1 National Severe Weather Forecasting shift operations."
  ]);

  if (!trainee) return null;

  const handleAddNote = () => {
    if (!trainerNote.trim()) return;
    setSavedNotes(prev => [...prev, trainerNote.trim()]);
    setTrainerNote("");
  };

  const submissions = trainee.submissions || [
    {
      id: "sub_1",
      title: "#30 Atmospheric Dynamics & NWP 4D-Var Assimilation",
      score: 29,
      totalMarks: 40,
      percentage: 72.5,
      accuracy: 72.5,
      timeSpent: "13m 16s",
      submittedAt: "14th Aug 2026 20:36",
      status: "Passed"
    },
    {
      id: "sub_2",
      title: "#29 Satellite Meteorology & INSAT-3DR Imager Processing",
      score: 17,
      totalMarks: 20,
      percentage: 85.0,
      accuracy: 85.0,
      timeSpent: "34m 53s",
      submittedAt: "12th Aug 2026 13:06",
      status: "Distinction"
    },
    {
      id: "sub_3",
      title: "#28 Doppler Weather Radar & Severe Storm Nowcasting",
      score: 33,
      totalMarks: 40,
      percentage: 82.5,
      accuracy: 82.5,
      timeSpent: "17m 13s",
      submittedAt: "07th Aug 2026 21:20",
      status: "Passed"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 font-sans my-auto">
        
        {/* ═════════ HEADER: CADET PROFILE CARD ═════════ */}
        <div className="p-6 bg-white border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center font-bold text-xl shrink-0">
              {trainee.name?.split(" ").map(n => n[0]).join("") || "TR"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {trainee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#15803D] border border-emerald-200">
                  {trainee.status || "In Training"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{trainee.designation || "Scientist 'B' (Trainee)"} • {trainee.department}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cadre: {trainee.cadreId || "MOES-MET-2026-4491"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trainee.station || "IMD Jaipur"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Average Score</span>
              <span className="text-xl font-bold text-[#1D4ED8]">{trainee.avgQuizScore || 82}%</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ═════════ SUB-TABS NAVIGATION ═════════ */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveDossierTab("overview")}
            className={`px-4 py-3 text-xs font-black border-b-2 transition-all ${
              activeDossierTab === "overview"
                ? "border-[#0a2558] text-[#0a2558]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Course Progress & Milestones
          </button>

          <button
            onClick={() => setActiveDossierTab("quizzes")}
            className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
              activeDossierTab === "quizzes"
                ? "border-[#0a2558] text-[#0a2558]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Assessments & Test Scores</span>
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded-full text-[10px] font-extrabold">
              {submissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveDossierTab("competencies")}
            className={`px-4 py-3 text-xs font-black border-b-2 transition-all ${
              activeDossierTab === "competencies"
                ? "border-[#0a2558] text-[#0a2558]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Verified Competencies & Bio
          </button>
        </div>

        {/* ═════════ BODY CONTENT AREA ═════════ */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: COURSE PROGRESS & MILESTONES */}
          {activeDossierTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Enrolled Course Highlight Card */}
              <div className="p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 rounded-3xl border border-blue-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      CURRENT ENROLLED PROGRAM
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-1.5">
                      {trainee.courseTitle || "Advanced Numerical Weather Prediction (NWP) & Data Assimilation"}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      Course Code: <span className="font-mono font-bold text-slate-700">{trainee.courseCode || "MOES-IMD-101"}</span> • Enrolled Date: {trainee.enrolledDate || "12th Jan 2026"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-[#0a2558]">{trainee.progressPercentage || 75}%</span>
                    <p className="text-[11px] font-bold text-slate-500">Overall Completion</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${trainee.progressPercentage || 75}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>Modules Cleared: {trainee.completedModulesCount || 3} of {trainee.totalModulesCount || 4}</span>
                    <span>Status: {trainee.status || "In Progress"}</span>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">QUIZZES TAKEN</span>
                  <p className="text-xl font-black text-[#0a2558] mt-1">{submissions.length}</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">ACCURACY RATE</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{trainee.avgQuizScore || 82.5}%</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">TRAINING HOURS</span>
                  <p className="text-xl font-black text-purple-900 mt-1">48 Hours</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">VERIFIED SKILLS</span>
                  <p className="text-xl font-black text-blue-700 mt-1">{trainee.skills?.length || 5} Units</p>
                </div>
              </div>

              {/* Trainer Notes & Qualitative Audit */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0a2558]" />
                  <span>Lead Trainer Evaluation Notes & Endorsement</span>
                </h4>

                <div className="space-y-2">
                  {savedNotes.map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700 font-medium">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add confidential trainer remark for this cadet..."
                    value={trainerNote}
                    onChange={(e) => setTrainerNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNote())}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs"
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
              <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
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
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {sub.title}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {sub.score}/{sub.totalMarks} ({sub.percentage}%)
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {sub.accuracy}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {sub.timeSpent}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {sub.submittedAt}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            sub.status === "Distinction"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          }`}>
                            {sub.status || "Passed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED COMPETENCIES & QUALIFICATIONS */}
          {activeDossierTab === "competencies" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Competencies Chips */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0a2558]" />
                  <span>Verified Competency Units & Skills</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(trainee.skills || ["Python for Meteorology", "Synoptic Analysis", "QGIS", "Data Assimilation"]).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-900 rounded-xl font-bold text-xs border border-blue-200/80"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  <span>Academic Qualifications & Degrees</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(trainee.qualifications) ? trainee.qualifications : [trainee.qualifications || "M.Sc. Atmospheric Science"]).map((q, qIdx) => (
                    <span
                      key={qIdx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 text-purple-900 rounded-xl font-bold text-xs border border-purple-200/80"
                    >
                      <Check className="w-3.5 h-3.5 text-purple-600" />
                      <span>{q}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Postings */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-700" />
                  <span>Operational Postings & Deployments</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(trainee.experience) ? trainee.experience : [trainee.experience || "2 years at IMD Field Station"]).map((exp, eIdx) => (
                    <span
                      key={eIdx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-900 rounded-xl font-bold text-xs border border-amber-200/80"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-600" />
                      <span>{exp}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ═════════ MODAL FOOTER ═════════ */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            National Capacity Building & Competency Tracking Registry
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-md"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
