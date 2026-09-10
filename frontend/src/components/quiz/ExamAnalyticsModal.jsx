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
  BarChart3, 
  TrendingUp, 
  Layers, 
  ChevronRight, 
  Target, 
  Check, 
  Hourglass, 
  Gauge, 
  Medal,
  FileText
} from "lucide-react";

export const ExamAnalyticsModal = ({ exam, currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [responseSearch, setResponseSearch] = useState("");
  const [responseFilter, setResponseFilter] = useState("all");
  const [activeAnalysisFilter, setActiveAnalysisFilter] = useState("subjects");
  const [copiedShare, setCopiedShare] = useState(false);

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
    userAnswer: idx % 4 === 3 ? (q.correctAnswer + 1) % 4 : q.correctAnswer,
    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 1,
    isCorrect: idx % 4 !== 3,
    explanation: q.explanation || "This option directly satisfies atmospheric boundary condition equations formulated in operational NWP."
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

  const leaderboardData = [
    { rank: 1, name: "Dr. Sunita Kulkarni", station: "IMD Pune (NWP Division)", score: "38/40", accuracy: "95%", time: "11m 45s", percentile: "99.8%" },
    { rank: 2, name: "Rahul Sharma (You)", station: "IMD HQ New Delhi (Satellite Division)", score: "29/40", accuracy: "72.5%", time: "13m 16s", percentile: "88.4%" },
    { rank: 3, name: "Dr. Amit Sengupta", station: "IMD Kolkata (Cyclone Warning Centre)", score: "36/40", accuracy: "90%", time: "12m 10s", percentile: "96.5%" },
    { rank: 4, name: "Priya Nair", station: "RMC Chennai (Radar Division)", score: "28/40", accuracy: "70%", time: "14m 20s", percentile: "84.2%" },
    { rank: 5, name: "Vikram Malhotra", station: "MC Bhubaneswar", score: "27/40", accuracy: "67.5%", time: "15m 05s", percentile: "79.1%" }
  ];

  const handleShareScore = () => {
    const text = `CAPACITY CONNECT — Assessment Score\nExam: ${exam?.title || "#30 Mock Technical Aptitude"}\nScore: ${stats.score}/${stats.totalMarks} (${stats.percentage}%)\nAccuracy: ${stats.accuracy}%\nTime Spent: ${stats.timeSpent}\nOfficer: ${currentUser?.name || "Rahul Sharma"}`;
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-[#D9E2EC] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-[#D9E2EC] bg-white flex flex-col gap-3 shrink-0">
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Assessments</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-800 truncate max-w-md">{exam?.title || "#30 Technical Assessment"}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Exam Title & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {exam?.title || "#30 Technical Assessment"}
              </h1>
              
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{stats.allottedTime}</span>
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>{stats.totalQuestions} questions</span>
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                  <Award className="w-3 h-3 text-blue-600" />
                  <span>{stats.totalMarks} marks</span>
                </span>
              </div>
            </div>

            {/* Share action */}
            <button
              onClick={handleShareScore}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 self-start sm:self-center"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? "Copied" : "Share Score"}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-[#D9E2EC] -mb-5 pt-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-[#1D4ED8] text-[#1D4ED8]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("responses")}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
                activeTab === "responses"
                  ? "border-[#1D4ED8] text-[#1D4ED8]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Responses</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
                activeTab === "leaderboard"
                  ? "border-[#1D4ED8] text-[#1D4ED8]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Medal className="w-3.5 h-3.5 text-amber-600" />
              <span>Leaderboard</span>
            </button>
          </div>

        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#F6F8FA]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-white border border-[#D9E2EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Score</span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {stats.score} ({stats.percentage}%)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Score with percentage</p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#D9E2EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Attempted</span>
                  <h3 className="text-xl font-bold text-[#1D4ED8]">
                    {stats.attempted} / {stats.totalQuestions}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Questions answered</p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#D9E2EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Accuracy</span>
                  <h3 className="text-xl font-bold text-emerald-700">
                    {stats.accuracy}%
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {stats.correctCount} correct of {stats.attempted} attempted
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#D9E2EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Time Spent</span>
                  <h3 className="text-xl font-bold text-slate-900 font-mono">
                    {stats.timeSpent}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Total exam session time</p>
                </div>
              </div>

              {/* Performance Analysis Section */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Performance vs Time Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accuracy and time utilization across meteorological domain subjects.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-[#D9E2EC] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-semibold text-slate-900 text-xs">Domain Accuracy Breakdown</h3>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#155E75]"></span>
                        <span>Performance</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#1D4ED8]"></span>
                        <span>Time Utilization</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    {subjectPerformanceData.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-800">{item.subject}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {item.correct}/{item.totalQuestions} Correct
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 h-3 rounded overflow-hidden">
                            <div
                              className="h-full bg-[#155E75] rounded transition-all duration-300"
                              style={{ width: `${item.performance}%` }}
                            ></div>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                            <div
                              className="h-full bg-[#1D4ED8] rounded transition-all duration-300"
                              style={{ width: `${Math.min(100, item.timeUtilization * 1.2)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RESPONSES */}
          {activeTab === "responses" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-[#D9E2EC]">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={responseSearch}
                      onChange={(e) => setResponseSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#D9E2EC] text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <select
                    value={responseFilter}
                    onChange={(e) => setResponseFilter(e.target.value)}
                    className="p-1.5 rounded-md border border-[#D9E2EC] text-xs font-semibold bg-white text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value="correct">Correct Only</option>
                    <option value="incorrect">Incorrect Only</option>
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {filteredResponses.map((q) => (
                  <div key={q.id} className="bg-white rounded-lg p-5 border border-[#D9E2EC] shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">Question {q.questionNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                          {q.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span>{q.timeSpent} / {q.allottedTime}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          {q.marks}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = q.userAnswer === optIdx;
                        const isCorrect = q.correctAnswer === optIdx;

                        let style = "bg-white border-[#D9E2EC] text-slate-700";
                        if (isCorrect) {
                          style = "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold";
                        } else if (isChosen && !isCorrect) {
                          style = "bg-red-50 border-red-300 text-red-800";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-md border text-xs flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            <div className="flex items-center gap-1.5">
                              {isChosen && (
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-black/5">
                                  Your Choice
                                </span>
                              )}
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              {isChosen && !isCorrect && (
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-md bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-0.5">
                        <span className="font-semibold text-blue-950 block text-[11px]">Explanation:</span>
                        <p className="leading-relaxed text-[11px]">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-xs overflow-hidden">
                <div className="p-4 bg-white border-b border-[#D9E2EC] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">National Assessment Standings</h3>
                    <p className="text-xs text-slate-500">MoES Central Competency Ranking</p>
                  </div>
                  <Medal className="w-6 h-6 text-amber-500" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-[#D9E2EC]">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Officer Trainee</th>
                        <th className="p-3">Station / Centre</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Accuracy</th>
                        <th className="p-3">Time</th>
                        <th className="p-3 text-right">Percentile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboardData.map((row) => (
                        <tr
                          key={row.rank}
                          className={`hover:bg-slate-50 transition-colors ${
                            row.name.includes("You") ? "bg-blue-50/60 font-semibold" : ""
                          }`}
                        >
                          <td className="p-3 font-bold">
                            #{row.rank}
                          </td>
                          <td className="p-3 font-semibold text-slate-900">{row.name}</td>
                          <td className="p-3 text-slate-500">{row.station}</td>
                          <td className="p-3 font-bold text-slate-900">{row.score}</td>
                          <td className="p-3 text-emerald-700 font-semibold">{row.accuracy}</td>
                          <td className="p-3 text-slate-600 font-mono">{row.time}</td>
                          <td className="p-3 text-right font-bold text-[#1D4ED8]">{row.percentile}</td>
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
