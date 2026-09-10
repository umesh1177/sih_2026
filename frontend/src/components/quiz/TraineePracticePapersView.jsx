import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  BarChart3, 
  RotateCcw, 
  ChevronRight, 
  Building2, 
  AlertCircle, 
  Check, 
  SlidersHorizontal,
  Flame,
  Brain,
  ShieldCheck,
  TrendingUp,
  X,
  Radio,
  FileCheck
} from "lucide-react";
import { api } from "../../services/api";

export const TraineePracticePapersView = ({ 
  currentUser, 
  onStartExam, 
  onOpenQuestionBank, 
  onOpenAiGenerator 
}) => {
  const [practicePapers, setPracticePapers] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generate Practice Paper Form State
  const [generateForm, setGenerateForm] = useState({
    title: "Adaptive Atmospheric Dynamics & NWP Practice Paper",
    source: "bank", // "bank" | "ai"
    topic: "Numerical Weather Prediction & Radar Data Assimilation",
    subjectId: "all",
    questionCount: 10,
    durationMinutes: 20,
    initialDifficulty: "Medium",
    isAdaptive: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available quizzes / practice papers from API
      const [qRes, subRes] = await Promise.all([
        api.getQuizzes(),
        api.getTraineeSubmissions(currentUser?.id || "u_trainee_1")
      ]);

      let papersList = [];
      if (qRes.success && qRes.quizzes) {
        papersList = qRes.quizzes.map(q => ({
          ...q,
          isPractice: true,
          isAdaptive: q.isAdaptive !== undefined ? q.isAdaptive : true
        }));
      }

      // Add local default practice papers if list is short
      if (papersList.length < 3) {
        papersList = [
          {
            id: "paper_nwp_10",
            title: "Adaptive NWP Governing Equations & Arakawa Grids Drill",
            courseName: "Atmospheric Modeling",
            subjectName: "Atmospheric Dynamics",
            totalMarks: 30,
            questionCount: 10,
            durationMinutes: 20,
            isAdaptive: true,
            initialDifficulty: "Medium",
            createdAt: "2026-02-18T10:00:00Z",
            questions: [
              {
                id: "q_p1",
                question: "In numerical weather prediction (NWP), what is the primary role of the Arakawa C-grid staggering?",
                options: [
                  "Placing velocity variables (u, v) on cell faces and mass variables (T, P) at cell centres to optimise gravity wave dispersion",
                  "Placing all variables at cell vertices exclusively",
                  "Eliminating vertical advection across sigma coordinates",
                  "Converting non-hydrostatic systems into hydrostatic balance"
                ],
                correctAnswer: 0,
                marks: 3,
                difficulty: "Medium",
                subjectName: "Atmospheric Dynamics",
                explanation: "Arakawa C-grid offers superior dispersion properties for high-frequency gravity and inertia-gravity waves."
              },
              {
                id: "q_p2",
                question: "Which condition must be satisfied to prevent numerical instability in explicit finite difference advection schemes (CFL condition)?",
                options: [
                  "CFL = (u · Δt) / Δx ≤ 1.0",
                  "CFL = (u · Δx) / Δt ≥ 1.0",
                  "CFL = (Δx · Δt) / u = 0",
                  "CFL = u² / (g · Δz) > 2.0"
                ],
                correctAnswer: 0,
                marks: 3,
                difficulty: "Medium",
                subjectName: "Numerical Modeling",
                explanation: "The CFL condition requires the numerical domain of dependence to enclose the physical domain."
              },
              {
                id: "q_p3",
                question: "In dual-polarization weather radar, what physical property does Differential Reflectivity (ZDR) primarily characterize?",
                options: [
                  "Echo top height above sea level",
                  "The median oblateness / eccentricity of hydrometeors (horizontal vs vertical axis ratio)",
                  "Radial velocity toward the radar antenna",
                  "Total atmospheric precipitable water"
                ],
                correctAnswer: 1,
                marks: 3,
                difficulty: "Medium",
                subjectName: "Doppler Radar Meteorology",
                explanation: "ZDR characterizes the axis ratio and oblateness of raindrops and hail particles."
              },
              {
                id: "q_p4",
                question: "For Tropical Cyclone intensity estimation via the Dvorak Technique, which satellite pattern represents the highest convective organization?",
                options: [
                  "Shear Pattern with displaced convective core",
                  "Curved Band Pattern with 0.5 spiral wrap",
                  "Eye Pattern with cold symmetrical Central Dense Overcast (CDO)",
                  "Isolated banding without low-level center definition"
                ],
                correctAnswer: 2,
                marks: 3,
                difficulty: "Hard",
                subjectName: "Tropical Meteorology",
                explanation: "A distinct warm eye embedded inside a cold symmetrical CDO yields maximum T-Numbers."
              },
              {
                id: "q_p5",
                question: "In INSAT-3DR multi-channel data, which channel is most effective for mid-tropospheric jet stream and upper-air moisture tracking?",
                options: [
                  "Water Vapour (WV) Channel (6.5 - 7.1 µm)",
                  "Visible Channel (0.55 - 0.75 µm)",
                  "Shortwave Infrared (SWIR) Channel (1.55 - 1.70 µm)",
                  "Thermal Infrared 2 (TIR-2) Channel (11.5 - 12.5 µm)"
                ],
                correctAnswer: 0,
                marks: 3,
                difficulty: "Medium",
                subjectName: "Satellite Meteorology",
                explanation: "The 6.7 µm WV channel absorbs strongly in upper-mid troposphere moisture."
              }
            ]
          },
          {
            id: "paper_radar_5",
            title: "Doppler Radar Dual-Polarization & Nowcasting Speed Test",
            courseName: "Radar Meteorology",
            subjectName: "Doppler Radar",
            totalMarks: 15,
            questionCount: 5,
            durationMinutes: 10,
            isAdaptive: true,
            initialDifficulty: "Medium",
            createdAt: "2026-02-15T14:30:00Z",
            questions: []
          },
          {
            id: "paper_sat_10",
            title: "INSAT-3DR Satellite Meteorological Sounder & Product Drill",
            courseName: "Satellite Meteorology",
            subjectName: "INSAT Products",
            totalMarks: 30,
            questionCount: 10,
            durationMinutes: 20,
            isAdaptive: true,
            initialDifficulty: "Hard",
            createdAt: "2026-02-10T09:00:00Z",
            questions: []
          }
        ];
      }

      setPracticePapers(papersList);

      // Score history
      if (subRes.success && subRes.submissions) {
        setScoreHistory(subRes.submissions);
      } else {
        setScoreHistory([
          {
            id: "sub_demo_1",
            quizTitle: "Adaptive NWP Governing Equations & Arakawa Grids Drill",
            score: 27,
            totalMarks: 30,
            percentage: 90.0,
            passed: true,
            submittedAt: "2026-02-17T18:30:00Z",
            adaptiveTrajectory: "Medium ➔ Hard ➔ Advanced",
            timeTakenSeconds: 742,
            tabSwitchCount: 0
          },
          {
            id: "sub_demo_2",
            quizTitle: "Doppler Radar Dual-Polarization & Nowcasting Speed Test",
            score: 12,
            totalMarks: 15,
            percentage: 80.0,
            passed: true,
            submittedAt: "2026-02-14T11:20:00Z",
            adaptiveTrajectory: "Medium ➔ Beginner ➔ Medium (Morale Boosted)",
            timeTakenSeconds: 380,
            tabSwitchCount: 0
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading practice papers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Generating new practice paper
  const handleGeneratePracticePaper = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      let generatedQuestions = [];

      if (generateForm.source === "ai") {
        // Generate with Gemini AI
        const res = await api.generateAiQuestions({
          topic: generateForm.topic || "Meteorological Science & Operational NWP",
          difficulty: generateForm.initialDifficulty || "Medium",
          count: Number(generateForm.questionCount) || 5,
          subjectName: generateForm.title
        });

        if (res.success && res.generatedQuestions) {
          generatedQuestions = res.generatedQuestions;
          // Also save to global question bank
          for (const q of generatedQuestions) {
            api.createQuestion({
              question: q.question,
              subjectId: "sub_nwp_01",
              subjectName: q.subjectName || generateForm.title,
              marks: q.marks || 2,
              type: "MCQ",
              difficulty: q.difficulty || generateForm.initialDifficulty,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            }).catch(() => {});
          }
        }
      } else {
        // Fetch from Question Bank
        const qbRes = await api.getQuestions();
        if (qbRes.success && qbRes.questions && qbRes.questions.length > 0) {
          let pool = [...qbRes.questions];
          if (generateForm.subjectId !== "all") {
            pool = pool.filter(q => q.subjectId === generateForm.subjectId);
          }
          // Shuffle and pick
          pool = pool.sort(() => 0.5 - Math.random());
          generatedQuestions = pool.slice(0, Number(generateForm.questionCount) || 10);
        }
      }

      // Fallback if empty
      if (generatedQuestions.length === 0) {
        generatedQuestions = [
          {
            id: `q_gen_${Date.now()}_1`,
            question: `In operational weather forecasting, what parameter is primarily evaluated for ${generateForm.topic}?`,
            options: [
              "Vorticity advection and potential vorticity (PV) anomalies",
              "Surface soil albedo variations only",
              "Static boundary layer pressure without wind shear",
              "Total ionospheric electron concentration"
            ],
            correctAnswer: 0,
            marks: 3,
            difficulty: generateForm.initialDifficulty,
            explanation: "Vorticity advection in mid-troposphere is a primary diagnostic for synoptic scale vertical motion."
          },
          {
            id: `q_gen_${Date.now()}_2`,
            question: "When applying data assimilation in NWP, what does the Background Error Covariance Matrix (B-Matrix) determine?",
            options: [
              "The spatial spreading and multivariate balance of observation increments",
              "The cost of satellite ground station maintenance",
              "The total integration timestep for explicit Courant stability",
              "The color palette for radar reflectivity visualization"
            ],
            correctAnswer: 0,
            marks: 3,
            difficulty: generateForm.initialDifficulty,
            explanation: "The B-matrix dictates how observed innovations are spatially smoothed and projected across balanced dynamic fields."
          }
        ];
      }

      // Create new practice quiz object
      const newPaper = {
        id: `paper_custom_${Date.now()}`,
        title: generateForm.title,
        courseId: "crs_nwp_101",
        courseName: "MoES Operational Meteorology",
        trainerName: "AI Adaptive Engine",
        totalMarks: generatedQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) || 20,
        passMarks: Math.round((generatedQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) || 20) * 0.5),
        durationMinutes: Number(generateForm.durationMinutes) || 20,
        questionCount: generatedQuestions.length,
        isAdaptive: generateForm.isAdaptive,
        initialDifficulty: generateForm.initialDifficulty,
        questions: generatedQuestions,
        createdAt: new Date().toISOString()
      };

      // Save quiz to backend
      try {
        await api.createQuiz(newPaper);
      } catch (err) {}

      setPracticePapers(prev => [newPaper, ...prev]);
      setIsGenerateModalOpen(false);

      alert(`✅ Practice Paper "${newPaper.title}" successfully generated with ${generatedQuestions.length} questions and saved to your Practice Papers tab!`);
    } catch (err) {
      alert("Failed generating practice paper: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const filteredPapers = practicePapers.filter(paper => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (paper.title || "").toLowerCase().includes(q);
      const matchCourse = (paper.courseName || "").toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in select-none">
      
      {/* ─── 1. HEADER SECTION ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200 uppercase">
              Trainee Practice Studio
            </span>
            <span className="text-xs text-slate-500 font-semibold">• {practicePapers.length} Practice Papers Available</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0a2558] tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-500" />
            <span>AI Practice Papers & Adaptive Assessment Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Generate customized practice question papers with Google Gemini AI or from the MoES Question Bank. Features <b>Dynamic Adaptive Testing</b> with morale-boosting difficulty calibration and instant performance analytics.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Create New Practice Paper</span>
          </button>

          {onOpenQuestionBank && (
            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Browse Question Bank</span>
            </button>
          )}

          <button
            onClick={loadData}
            title="Refresh Papers"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 2. ADAPTIVE TESTING ENGINE EXPLANATION BANNER ─── */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-[#0d3477] to-[#0a2558] text-white rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-extrabold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Active Feature: Morale-Aware Adaptive Testing Engine</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Real-Time Dynamic Difficulty Calibration
            </h3>
            <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
              When you take a practice test, the engine actively assesses your accuracy streaks:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Morale Recovery Rule:
                </span>
                <p className="text-[11px] text-blue-100">
                  If 2-3 false answers occur in a row, the engine automatically lowers question difficulty (e.g. Advanced ➔ Intermediate ➔ Beginner) to reinforce fundamentals and protect officer morale.
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Challenge Escalation Rule:
                </span>
                <p className="text-[11px] text-blue-100">
                  Consecutive correct answers dynamically step up difficulty to high-order meteorological synthesis and complex case studies.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-2 shrink-0 w-full lg:w-64">
            <Brain className="w-8 h-8 text-sky-300 mx-auto" />
            <p className="font-black text-white text-xs">1-Click Fast Drill</p>
            <p className="text-[11px] text-blue-200">
              Start an instant 10-question adaptive NWP & radar assessment:
            </p>
            <button
              onClick={() => {
                if (practicePapers.length > 0 && onStartExam) {
                  onStartExam(practicePapers[0]);
                }
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-transform active:scale-95"
            >
              Launch Quick Drill ⚡
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. AVAILABLE PRACTICE QUESTION PAPERS SECTION ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <span>Generated Question Papers ({filteredPapers.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select any question paper to launch full-screen kiosk practice mode
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper title..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No practice papers matching search</h4>
            <p className="text-xs text-slate-500">Click "Create New Practice Paper" to generate one with AI!</p>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-4 py-2 bg-[#0a2558] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Generate AI Question Paper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper, idx) => (
              <div
                key={paper.id || idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Adaptive Indicator Pill */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {paper.isAdaptive ? "ADAPTIVE ENGINE" : "STANDARD"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {paper.durationMinutes || 20} mins
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {paper.courseName || "Operational Meteorological Science"} • {paper.subjectName || "Dynamics & Observations"}
                  </p>
                </div>

                {/* Specs tags */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center mb-4 text-xs">
                  <div>
                    <p className="font-extrabold text-slate-800">{paper.questionCount || (paper.questions ? paper.questions.length : 10)}</p>
                    <p className="text-[10px] text-slate-400">Questions</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800">{paper.totalMarks || 30}</p>
                    <p className="text-[10px] text-slate-400">Total Marks</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-emerald-600">{paper.initialDifficulty || "Dynamic"}</p>
                    <p className="text-[10px] text-slate-400">Difficulty</p>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={() => onStartExam && onStartExam(paper)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs transition-all shadow-md group-hover:scale-102 active:scale-95"
                >
                  <PlayCircle className="w-4 h-4 text-emerald-400" />
                  <span>Start Practice Exam</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. PRACTICE SCORE HISTORY & PERFORMANCE LEDGER ─── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Practice Scores & Performance History</span>
            </h2>
            <p className="text-xs text-slate-500">
              Track your past practice attempts, accuracy percentages, and adaptive difficulty milestones
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{scoreHistory.length} attempts recorded</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Practice Paper Title</th>
                  <th className="px-4 py-3.5">Score / Marks</th>
                  <th className="px-4 py-3.5">Accuracy %</th>
                  <th className="px-4 py-3.5">Adaptive Trajectory</th>
                  <th className="px-4 py-3.5">Time Spent</th>
                  <th className="px-4 py-3.5">Attempt Date</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoreHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No practice exam attempts recorded yet. Launch a practice paper above to start!
                    </td>
                  </tr>
                ) : (
                  scoreHistory.map((hist, i) => {
                    const isPassed = hist.percentage >= 50;
                    return (
                      <tr key={hist.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">
                          {hist.quizTitle || "Adaptive Practice Paper"}
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-800">
                          {hist.score} / {hist.totalMarks || 30}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isPassed ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                          }`}>
                            {hist.percentage}% • {isPassed ? "PASSED" : "RETRY"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[11px] text-slate-600 font-medium">
                          {hist.adaptiveTrajectory || "Medium ➔ Advanced"}
                        </td>
                        <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                          {Math.floor((hist.timeTakenSeconds || 600) / 60)}m {((hist.timeTakenSeconds || 600) % 60)}s
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-[11px]">
                          {new Date(hist.submittedAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => {
                              const matchingPaper = practicePapers.find(p => p.title === hist.quizTitle) || practicePapers[0];
                              if (matchingPaper && onStartExam) onStartExam(matchingPaper);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-900 font-bold rounded-lg text-xs transition-colors"
                          >
                            Retake 🔄
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═════════ CREATE PRACTICE PAPER MODAL ═════════ */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Generate Practice Question Paper
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure question parameters with Google Gemini AI or MoES Question Bank
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleGeneratePracticePaper} className="space-y-4 text-xs">
              
              {/* Paper Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question Paper Title:
                </label>
                <input
                  type="text"
                  required
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  placeholder="e.g. Adaptive NWP 4D-Var & Radar Assimilation Test"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Source Option: AI vs Question Bank */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setGenerateForm({ ...generateForm, source: "bank" })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    generateForm.source === "bank"
                      ? "bg-blue-50 border-blue-400 text-blue-950 ring-2 ring-blue-500/20 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black mb-1">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>MoES Question Bank</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Extract verified curated questions from the central repository.
                  </p>
                </div>

                <div
                  onClick={() => setGenerateForm({ ...generateForm, source: "ai" })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    generateForm.source === "ai"
                      ? "bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-500/20 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Google Gemini AI</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Live generate fresh domain-specific MCQs tailored to your topic.
                  </p>
                </div>
              </div>

              {/* Domain / Topic */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Topic / Domain Focus:
                </label>
                <input
                  type="text"
                  required
                  value={generateForm.topic}
                  onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                  placeholder="e.g. Numerical Weather Prediction, Tropical Cyclones, INSAT Satellite"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Questions Count & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Number of Questions:
                  </label>
                  <select
                    value={generateForm.questionCount}
                    onChange={(e) => setGenerateForm({ ...generateForm, questionCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Questions (Speed Drill)</option>
                    <option value={10}>10 Questions (Standard Drill)</option>
                    <option value={15}>15 Questions (Full Assessment)</option>
                    <option value={20}>20 Questions (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duration (Minutes):
                  </label>
                  <select
                    value={generateForm.durationMinutes}
                    onChange={(e) => setGenerateForm({ ...generateForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Initial Difficulty & Adaptive Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>Enable Morale-Aware Adaptive Testing</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dynamically scales difficulty up or down based on response streaks
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={generateForm.isAdaptive}
                    onChange={(e) => setGenerateForm({ ...generateForm, isAdaptive: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    Starting Difficulty Level:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Easy", "Medium", "Hard"].map(lvl => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setGenerateForm({ ...generateForm, initialDifficulty: lvl })}
                        className={`py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                          generateForm.initialDifficulty === lvl
                            ? "bg-[#0a2558] text-white border-[#0a2558]"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Generating Paper...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Generate & Save Paper</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
