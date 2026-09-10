import React, { useState } from "react";
import { 
  X, 
  Clock, 
  Award, 
  Share2, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  ChevronRight, 
  Target, 
  Check, 
  Hourglass, 
  Gauge, 
  Users, 
  Medal,
  Building2,
  FileText
} from "lucide-react";

export const ExamAnalyticsModal = ({ exam, currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "responses" | "leaderboard"
  const [responseSearch, setResponseSearch] = useState("");
  const [responseFilter, setResponseFilter] = useState("all"); // "all" | "correct" | "incorrect"
  const [activeAnalysisFilter, setActiveAnalysisFilter] = useState("subjects"); // "subjects" | "labels" | "types"
  const [copiedShare, setCopiedShare] = useState(false);

  // Derived or default statistics matching Photo 3 & 4
  const stats = exam?.stats || {
    score: exam?.score || 29,
    totalMarks: exam?.totalMarks || 40,
    percentage: exam?.percentage || 72.5,
    attempted: exam?.attempted || 40,
    totalQuestions: exam?.questions?.length || 40,
    accuracy: exam?.accuracy || 72.5,
    correctCount: exam?.correctCount || 29,
    timeSpent: exam?.timeTaken || "13m 16s",
    allottedTime: exam?.durationMinutes ? `${exam.durationMinutes} min` : "30 min"
  };

  // Performance vs Time Breakdown by Subject matching Photo 4 (dynamically built from selected exam)
  const subjectPerformanceData = exam?.subjectPerformance || (exam?.subjects && exam.subjects.length > 0 ? (
    exam.subjects.filter(s => !s.includes("+")).map((subj, idx) => {
      const perfValues = [90, 85, 75, 65, 80, 70];
      const timeUtils = [29.66, 56.05, 35.76, 68.69, 42.1, 51.3];
      const perf = perfValues[idx % perfValues.length];
      const util = timeUtils[idx % timeUtils.length];
      return {
        subject: subj,
        performance: perf,
        timeUtilization: util,
        timeSpent: `0m ${12 + (idx * 11) % 25}s`,
        timeRequired: "0m 45s",
        totalQuestions: Math.max(5, Math.floor((stats.totalQuestions || 40) / Math.max(1, exam.subjects.length))),
        correct: Math.max(3, Math.floor((stats.correctCount || 29) / Math.max(1, exam.subjects.length)))
      };
    })
  ) : [
    {
      subject: "Atmospheric Dynamics & Primitive Equations",
      performance: 90,
      timeUtilization: 29.66,
      timeSpent: "0m 13s",
      timeRequired: "0m 44s",
      totalQuestions: 10,
      correct: 9
    },
    {
      subject: "Doppler Weather Radar (DWR) & De-aliasing",
      performance: 90,
      timeUtilization: 56.05,
      timeSpent: "0m 23s",
      timeRequired: "0m 41s",
      totalQuestions: 10,
      correct: 9
    },
    {
      subject: "Satellite Infrared & Tropical Cyclogenesis",
      performance: 60,
      timeUtilization: 35.76,
      timeSpent: "0m 18s",
      timeRequired: "0m 45s",
      totalQuestions: 10,
      correct: 6
    },
    {
      subject: "Numerical Weather Prediction (NWP) 4D-Var",
      performance: 50,
      timeUtilization: 68.69,
      timeSpent: "0m 32s",
      timeRequired: "0m 50s",
      totalQuestions: 10,
      correct: 5
    }
  ]);

  // Default rich mock responses matching Photo 5
  const mockResponses = exam?.questions && exam.questions.length > 0 ? exam.questions.map((q, idx) => ({
    id: q.id || `q_${idx + 1}`,
    questionNumber: idx + 1,
    topic: q.subjectName || q.topic || "Atmospheric Modeling",
    difficulty: q.difficulty || "Easy",
    solveApproach: idx % 2 === 0 ? "Direct Analysis" : "Formula Substitution",
    timeSpent: `${Math.floor(5 + (idx * 3) % 25)}s`,
    allottedTime: "30s",
    marks: "1/1",
    question: q.question,
    options: q.options || ["Option A", "Option B", "Option C", "Option D"],
    userAnswer: idx % 4 === 3 ? (q.correctAnswer + 1) % 4 : q.correctAnswer, // mostly correct, some wrong
    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 1,
    isCorrect: idx % 4 !== 3,
    explanation: q.explanation || "This option directly satisfies the atmospheric boundary condition equations formulated in operational NWP."
  })) : [
    {
      id: "q_1",
      questionNumber: 1,
      topic: "Planetary Boundary Layer & Sigma Coordinates",
      difficulty: "Easy",
      solveApproach: "Direct Formulation",
      timeSpent: "0m 08s",
      allottedTime: "0m 30s",
      marks: "1/1",
      question: "In numerical weather prediction, what defines terrain-following sigma vertical coordinates?",
      options: [
        "A. Normalized pressure coordinate sigma = (p - p_top) / (p_sfc - p_top)",
        "B. Geometric height above sea level strictly",
        "C. Dry static energy level across the tropopause",
        "D. Geopotential thickness without surface reference"
      ],
      userAnswer: 0,
      correctAnswer: 0,
      isCorrect: true,
      explanation: "Sigma coordinate transforms the lower irregular topographical boundary into a coordinate surface sigma = 1 at the ground."
    },
    {
      id: "q_2",
      questionNumber: 2,
      topic: "Doppler Weather Radar (DWR)",
      difficulty: "Medium",
      solveApproach: "Formula Calculation",
      timeSpent: "0m 22s",
      allottedTime: "0m 45s",
      marks: "1/1",
      question: "What physical property does Differential Reflectivity (ZDR) measure in polarimetric radar?",
      options: [
        "A. Total storm echo top height",
        "B. Median oblateness/eccentricity ratio between horizontal and vertical hydrometeor axes",
        "C. Radial wind velocity toward the antenna",
        "D. Cloud condensation nuclei concentration"
      ],
      userAnswer: 1,
      correctAnswer: 1,
      isCorrect: true,
      explanation: "ZDR is calculated as 10 * log10(Zh / Zv), giving direct insight into hydrometeor geometric eccentricity."
    },
    {
      id: "q_3",
      questionNumber: 3,
      topic: "Tropical Cyclogenesis",
      difficulty: "Hard",
      solveApproach: "Satellite Interpretation",
      timeSpent: "0m 31s",
      allottedTime: "0m 45s",
      marks: "0/1",
      question: "In the Dvorak Tropical Cyclone analysis, what does a persistent cold Central Dense Overcast (CDO) indicate?",
      options: [
        "A. Rapid decay of convective core",
        "B. Severe wind shear dissipating the system",
        "C. Deep convective core organization and high tropical cyclone intensity",
        "D. Extratropical transition into a cold front"
      ],
      userAnswer: 1,
      correctAnswer: 2,
      isCorrect: false,
      explanation: "A well-formed, symmetrical cold Central Dense Overcast (CDO) signifies strong eyewall convection and central pressure deepening."
    },
    {
      id: "q_4",
      questionNumber: 4,
      topic: "Numerical Weather Prediction 4D-Var",
      difficulty: "Hard",
      solveApproach: "Variational Analysis",
      timeSpent: "0m 28s",
      allottedTime: "0m 50s",
      marks: "1/1",
      question: "What is the primary function of the Adjoint Model in 4D-Var Data Assimilation suites?",
      options: [
        "A. To smooth terrain gradients over the Tibetan Plateau",
        "B. To integrate the gradient of the cost function backwards in time to obtain sensitivities with respect to initial state vector",
        "C. To calculate 100-year climatic trends",
        "D. To extrapolate radar reflectivity beyond maximum range"
      ],
      userAnswer: 1,
      correctAnswer: 1,
      isCorrect: true,
      explanation: "The adjoint model integrates sensitivities backward in time to efficiently compute the cost function gradient for minimization."
    }
  ];

  // Leaderboard data
  const leaderboardData = [
    { rank: 1, name: "Dr. Sunita Kulkarni", station: "IMD Pune (NWP Division)", score: "38/40", accuracy: "95%", time: "11m 45s", percentile: "99.8%" },
    { rank: 2, name: "Rahul Sharma (You)", station: "IMD HQ New Delhi (Satellite Division)", score: "29/40", accuracy: "72.5%", time: "13m 16s", percentile: "88.4%" },
    { rank: 3, name: "Dr. Amit Sengupta", station: "IMD Kolkata (Cyclone Warning Centre)", score: "36/40", accuracy: "90%", time: "12m 10s", percentile: "96.5%" },
    { rank: 4, name: "Priya Nair", station: "RMC Chennai (Radar Division)", score: "28/40", accuracy: "70%", time: "14m 20s", percentile: "84.2%" },
    { rank: 5, name: "Vikram Malhotra", station: "MC Bhubaneswar", score: "27/40", accuracy: "67.5%", time: "15m 05s", percentile: "79.1%" }
  ];

  const handleShareScore = () => {
    const text = `🎖️ CAPACITY CONNECT — Assessment Score\nExam: ${exam?.title || "#30 Mock Technical Aptitude"}\nScore: ${stats.score}/${stats.totalMarks} (${stats.percentage}%)\nAccuracy: ${stats.accuracy}%\nTime Spent: ${stats.timeSpent}\nOfficer: ${currentUser?.name || "Rahul Sharma"}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const filteredResponses = mockResponses.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(responseSearch.toLowerCase()) || q.topic.toLowerCase().includes(responseSearch.toLowerCase());
    if (responseFilter === "correct") return matchesSearch && q.isCorrect;
    if (responseFilter === "incorrect") return matchesSearch && !q.isCorrect;
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        
        {/* ═════════ TOP HEADER BAR & BREADCRUMBS (MATCHES PHOTO 3) ═════════ */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 shrink-0">
          
          {/* Breadcrumb & Close */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">History</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-800 truncate max-w-md">{exam?.title || "#30 Mock Technical Aptitude"}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Exam Title & Meta Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {exam?.title || "#30 Mock Technical Aptitude"}
              </h1>
              
              <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{stats.allottedTime}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{stats.totalQuestions} questions</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>{stats.totalMarks} marks</span>
                </span>
              </div>
            </div>

            {/* Share score action */}
            <button
              onClick={handleShareScore}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a2558] hover:bg-[#071c42] text-white text-xs font-bold shadow-md transition-transform hover:scale-105 shrink-0 self-start sm:self-center"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedShare ? "Score Copied!" : "Share score"}</span>
            </button>
          </div>

          {/* Main Navigation Tabs: Overview | Responses | Leaderboard */}
          <div className="flex items-center gap-6 border-b border-slate-200 mt-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                activeTab === "overview"
                  ? "border-[#0a2558] text-[#0a2558]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("responses")}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                activeTab === "responses"
                  ? "border-[#0a2558] text-[#0a2558]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Responses</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-all ${
                activeTab === "leaderboard"
                  ? "border-[#0a2558] text-[#0a2558]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Medal className="w-4 h-4 text-amber-500" />
              <span>Leaderboard</span>
            </button>
          </div>

        </div>

        {/* ═════════ MODAL BODY CONTENT ═════════ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-[#fbfcfe]">
          
          {/* ────────────────── 1. TAB: OVERVIEW (PHOTOS 3 & 4) ────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-150">
              
              {/* 4 Stat Score Cards (Matches Photo 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Score Card (Yellow / Cream Border) */}
                <div className="p-5 rounded-2xl bg-[#fffef5] border border-amber-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Score</span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {stats.score} ({stats.percentage}%)
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Gauge className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 font-medium">Score with percentage</p>
                </div>

                {/* 2. Attempted Card (Light Blue Border) */}
                <div className="p-5 rounded-2xl bg-[#f8fbff] border border-blue-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Attempted</span>
                      <h3 className="text-2xl font-black text-blue-900 tracking-tight">
                        {stats.attempted} / {stats.totalQuestions}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 font-medium">Questions attempted with total</p>
                </div>

                {/* 3. Accuracy Card (Amber / Cream Border) */}
                <div className="p-5 rounded-2xl bg-[#fffef5] border border-amber-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Accuracy</span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {stats.accuracy}%
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 font-medium">
                    {stats.correctCount} correct of {stats.attempted} attempted
                  </p>
                </div>

                {/* 4. Time Spent Card (Blue Border) */}
                <div className="p-5 rounded-2xl bg-[#f8fbff] border border-blue-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Time Spent</span>
                      <h3 className="text-2xl font-black text-blue-900 tracking-tight">
                        {stats.timeSpent}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Hourglass className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 font-medium">Total time on this attempt</p>
                </div>

              </div>

              {/* Performance Analysis Section (Matches Photo 3 & 4) */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Performance Analysis</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your accuracy and time usage across subjects, labels, and question types.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveAnalysisFilter("subjects")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeAnalysisFilter === "subjects"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Subjects
                  </button>
                  <button
                    onClick={() => setActiveAnalysisFilter("labels")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeAnalysisFilter === "labels"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Labels
                  </button>
                  <button
                    onClick={() => setActiveAnalysisFilter("types")}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeAnalysisFilter === "types"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Question Types
                  </button>
                </div>

                {/* ─── 1. PERFORMANCE VS TIME BY SUBJECT (DUAL COMPARISON BARS - PHOTO 4) ─── */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Performance vs Time by Subject</h3>
                      <p className="text-[11px] text-slate-500">
                        How accurately you scored in each subject compared with the share of time you spent there.
                      </p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#0a2558]"></span>
                        <span>Performance</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#2563eb]"></span>
                        <span>Time Utilization</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Bar Chart Rows */}
                  <div className="space-y-6 pt-2">
                    {subjectPerformanceData.map((item, idx) => (
                      <div key={idx} className="space-y-2 group">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">{item.subject}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {item.correct}/{item.totalQuestions} Correct
                          </span>
                        </div>

                        {/* Comparative Dual Bars */}
                        <div className="space-y-1.5 relative">
                          {/* Performance Bar (Navy) */}
                          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-[#0a2558] rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-extrabold"
                              style={{ width: `${item.performance}%` }}
                            >
                              {item.performance}%
                            </div>
                          </div>

                          {/* Time Utilization Bar (Blue) */}
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-[#2563eb] rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[9px] text-white font-bold"
                              style={{ width: `${Math.min(100, item.timeUtilization * 1.2)}%` }}
                            >
                              {item.timeUtilization}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Axis scale marks */}
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-2 font-mono">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* ─── 2. TIME SPENT BY SUBJECT (PHOTO 4 BOTTOM) ─── */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Time Spent by Subject</h3>
                      <p className="text-[11px] text-slate-500">
                        Average time per question in each subject versus the time typically required.
                      </p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#0a2558]"></span>
                        <span>Time Spent</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
                        <span>Time Required</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {subjectPerformanceData.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>{item.subject}</span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {item.timeSpent} / {item.timeRequired}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-24 text-[10px] font-bold text-slate-500">Spent: {item.timeSpent}</div>
                          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#0a2558] h-full rounded-full" style={{ width: `${Math.min(100, item.timeUtilization * 1.1)}%` }}></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-24 text-[10px] font-bold text-slate-400">Target: {item.timeRequired}</div>
                          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#3b82f6] h-full rounded-full" style={{ width: `75%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ────────────────── 2. TAB: RESPONSES (PHOTO 5) ────────────────── */}
          {activeTab === "responses" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={responseSearch}
                      onChange={(e) => setResponseSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <select
                    value={responseFilter}
                    onChange={(e) => setResponseFilter(e.target.value)}
                    className="p-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value="correct">Correct Only</option>
                    <option value="incorrect">Incorrect Only</option>
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a2558] hover:bg-[#071c42] text-white text-xs font-bold shadow transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>

              {/* Question Cards List (Matching Photo 5) */}
              <div className="space-y-6">
                {filteredResponses.map((q) => (
                  <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    
                    {/* Top Question Badges Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">Q{q.questionNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-black text-[10px] uppercase">
                          MCQ
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                          Topic: {q.topic}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                          Difficulty: {q.difficulty}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-xs font-semibold">
                          Solve Approach: {q.solveApproach}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-500">
                        <span>⏱️ {q.timeSpent} / {q.allottedTime}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                          🏅 {q.marks}
                        </span>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.question}
                    </div>

                    {/* Options List */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Answer Choices:</span>
                      {q.options.map((opt, optIdx) => {
                        const isChosen = q.userAnswer === optIdx;
                        const isCorrect = q.correctAnswer === optIdx;

                        let style = "bg-white border-slate-200 text-slate-700";
                        if (isCorrect) {
                          style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-400";
                        } else if (isChosen && !isCorrect) {
                          style = "bg-rose-50 border-rose-400 text-rose-800 font-semibold";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${style}`}
                          >
                            <span>{opt}</span>
                            <div className="flex items-center gap-2">
                              {isChosen && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/10">
                                  Your Choice
                                </span>
                              )}
                              {isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {isChosen && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 space-y-1">
                        <span className="font-extrabold text-[#0a2558] block">Scientific Explanation:</span>
                        <p className="leading-relaxed text-[11px]">{q.explanation}</p>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ────────────────── 3. TAB: LEADERBOARD ────────────────── */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-[#0a2558] to-[#1967d2] text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base">National Meteorological Assessment Leaderboard</h3>
                    <p className="text-xs text-blue-100">MoES Central Competency Ranking</p>
                  </div>
                  <Medal className="w-8 h-8 text-amber-300" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-4">Rank</th>
                        <th className="p-4">Officer Trainee</th>
                        <th className="p-4">Station / Centre</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Accuracy</th>
                        <th className="p-4">Time Taken</th>
                        <th className="p-4 text-right">Percentile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboardData.map((row) => (
                        <tr
                          key={row.rank}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            row.name.includes("You") ? "bg-blue-50/60 font-bold" : ""
                          }`}
                        >
                          <td className="p-4 font-black">
                            {row.rank === 1 ? "🥇 #1" : row.rank === 2 ? "🥈 #2" : row.rank === 3 ? "🥉 #3" : `#${row.rank}`}
                          </td>
                          <td className="p-4 font-bold text-slate-900">{row.name}</td>
                          <td className="p-4 text-slate-600">{row.station}</td>
                          <td className="p-4 font-bold text-[#0a2558]">{row.score}</td>
                          <td className="p-4 text-emerald-700 font-semibold">{row.accuracy}</td>
                          <td className="p-4 text-slate-600 font-mono">{row.time}</td>
                          <td className="p-4 text-right font-black text-blue-700">{row.percentile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
