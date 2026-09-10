import React, { useState, useMemo } from "react";
import { 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  X, 
  Edit3, 
  Send, 
  Layers, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  RotateCcw, 
  BrainCircuit, 
  Eye, 
  Filter, 
  Search, 
  BarChart3, 
  Save, 
  Check, 
  Sliders, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { api } from "../../services/api";

const DEFAULT_DIFFICULT_QUESTIONS = [
  {
    id: "q_item_17",
    questionNumber: 17,
    text: "Under which operational condition does a single Doppler radar exhibit velocity folding/aliasing near coastal convective boundaries?",
    topic: "Radar Interpretation",
    subjectName: "Radar Meteorology & Cyclone Tracking",
    courseId: "course_nwp_01",
    moduleId: "mod_01",
    attempts: 86,
    correct: 31,
    accuracy: 36,
    difficulty: "Hard",
    options: [
      { text: "When beam refraction enters severe anomalous propagation ducting", pct: 14 },
      { text: "When radial wind velocity component Vr exceeds the Nyquist limit Vmax = (lambda * PRF) / 4", pct: 36, isCorrect: true },
      { text: "When Doppler receiver phase shift exceeds 360° due to sea clutter", pct: 42, isTrap: true },
      { text: "When specific differential phase KDP drops below zero in heavy sea spray", pct: 8 }
    ],
    correctAnswer: 1,
    explanation: "Velocity aliasing occurs strictly when the radial velocity component Vr exceeds the maximum unambiguous Nyquist velocity Vmax = (lambda * PRF) / 4, forcing the measured phase angle to wrap around.",
    misunderstoodReason: "42% of trainees chose Option C because of confusing general signal phase shift with the specific Doppler Nyquist folding formula.",
    remedialRecommendation: "Conduct a 5-minute refresher on Nyquist Velocity Limits and PRF Trade-offs before scheduled radar lab drills."
  },
  {
    id: "q_item_09",
    questionNumber: 9,
    text: "What is the critical numerical stability constraint (CFL condition) for an explicit 1D advection scheme with grid resolution Δx = 2.5 km and horizontal wind u = 40 m/s?",
    topic: "Numerical Prediction",
    subjectName: "Atmospheric Dynamics & NWP Modeling",
    courseId: "course_nwp_01",
    moduleId: "mod_02",
    attempts: 74,
    correct: 28,
    accuracy: 38,
    difficulty: "Hard",
    options: [
      { text: "Time step Δt must not exceed 62.5 seconds", pct: 38, isCorrect: true },
      { text: "Time step Δt must not exceed 100 seconds", pct: 35, isTrap: true },
      { text: "Grid spacing Δx must be halved to 1.25 km", pct: 18 },
      { text: "Courant number C must be strictly greater than 1.5", pct: 9 }
    ],
    correctAnswer: 0,
    explanation: "By CFL criterion: C = (u * Δt) / Δx ≤ 1.0 => Δt ≤ (2500 m) / (40 m/s) = 62.5 seconds.",
    misunderstoodReason: "35% of trainees picked 100s by incorrectly calculating Δx / (2*u) or using formula for 2nd-order diffusion.",
    remedialRecommendation: "Emphasize time-stepping constraints in NWP solver labs."
  },
  {
    id: "q_item_23",
    questionNumber: 23,
    text: "In 3D-Var satellite radiance data assimilation, how does the Background Error Covariance matrix (B) constrain unobserved meteorological fields?",
    topic: "Satellite Data Assimilation",
    subjectName: "Satellite Meteorology & Remote Sensing",
    courseId: "course_nwp_01",
    moduleId: "mod_03",
    attempts: 65,
    correct: 27,
    accuracy: 41,
    difficulty: "Hard",
    options: [
      { text: "Through multivariate cross-covariances that spread observation increments to wind and mass fields", pct: 41, isCorrect: true },
      { text: "By filtering out high-frequency gravity waves through hydrostatic balance only", pct: 28, isTrap: true },
      { text: "By setting observation error variances to zero in cloud-free atmospheric columns", pct: 20 },
      { text: "By resetting NWP forecast models every 6 hours without spatial smoothing", pct: 11 }
    ],
    correctAnswer: 0,
    explanation: "The B-matrix contains spatial and cross-variable correlations (e.g., geostrophic balance), ensuring a localized temperature observation adjusts neighboring wind and geopotential fields.",
    misunderstoodReason: "Trainees frequently overlook multivariate cross-covariance formulations in variational assimilation.",
    remedialRecommendation: "Review B-matrix structure and spatial correlation lengths in Satellite Assimilation lecture."
  }
];

export const ItemAnalysisDifficultQuestionsModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onOpenStudio,
  quizTitle = "Advanced NWP & Radar Meteorology Final Assessment"
}) => {
  if (!isOpen) return null;

  // ─── STATE ───
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem("moes_weak_questions_bank");
    return saved ? JSON.parse(saved) : DEFAULT_DIFFICULT_QUESTIONS;
  });

  const [selectedQuestionId, setSelectedQuestionId] = useState("q_item_17");
  const [accuracyCutoff, setAccuracyCutoff] = useState(45); // Accuracy <= 45% flagged
  const [minAttempts, setMinAttempts] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeActionTab, setActiveActionTab] = useState("review"); // "review" | "ai_diagnostics" | "remedial_broadcast" | "generate_clones"
  const [toastMessage, setToastMessage] = useState(null);

  // Edit question state
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingExplanation, setEditingExplanation] = useState("");
  const [editingOptions, setEditingOptions] = useState([]);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Remedial broadcast note state
  const [broadcastNote, setBroadcastNote] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  // AI Cloned practice questions state
  const [generatingClones, setGeneratingClones] = useState(false);
  const [clonedQuestions, setClonedQuestions] = useState([]);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Flagged weak questions based on filter rule: Attempts >= minAttempts & Accuracy <= accuracyCutoff
  const flaggedQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const isWeak = q.attempts >= minAttempts && q.accuracy <= accuracyCutoff;
      return matchSearch && isWeak;
    });
  }, [questions, accuracyCutoff, minAttempts, searchQuery]);

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || questions[0];

  // Sync edit mode when selection changes
  const handleSelectQuestion = (q) => {
    setSelectedQuestionId(q.id);
    setEditingQuestionText(q.text);
    setEditingExplanation(q.explanation);
    setEditingOptions(q.options ? [...q.options] : []);
    setIsEditingMode(false);
    setBroadcastSent(false);
    setClonedQuestions([]);
    setBroadcastNote(`[Clarification Note on Question ${q.questionNumber}: ${q.topic}]\n\nDear Cadets,\nDuring the recent assessment on ${q.topic}, several trainees faced difficulties with: ${q.misunderstoodReason}\n\nPlease note: ${q.explanation}\n\nRecommended Action: ${q.remedialRecommendation}`);
  };

  // 1. Action: Save Revised Question Wording
  const handleSaveQuestionEdit = () => {
    const updated = questions.map(q => {
      if (q.id === selectedQuestion.id) {
        return {
          ...q,
          text: editingQuestionText,
          explanation: editingExplanation,
          options: editingOptions
        };
      }
      return q;
    });

    setQuestions(updated);
    localStorage.setItem("moes_weak_questions_bank", JSON.stringify(updated));
    setIsEditingMode(false);
    showToast("✓ Question wording & distractors updated in Question Bank!");
  };

  // 2. Action: Send Remedial Broadcast to Cadets
  const handleSendRemedialBroadcast = () => {
    setBroadcastSent(true);
    showToast(`📢 Remedial Clarification Note broadcasted to all ${selectedQuestion.attempts} cadets who attempted Question ${selectedQuestion.questionNumber}!`);
  };

  // 3. Action: AI Generate Clone Practice Questions
  const handleGenerateClones = async () => {
    setGeneratingClones(true);
    try {
      // Simulate high-yield domain AI generation
      await new Promise(r => setTimeout(r, 1200));

      const newClones = [
        {
          id: `clone_${Date.now()}_1`,
          text: `[Variation 1] A C-band Doppler radar with wavelength λ = 5.3 cm uses PRF = 1200 Hz. What is the maximum unambiguous radial velocity (Nyquist velocity)?`,
          options: [
            "15.9 m/s",
            "31.8 m/s",
            "63.6 m/s",
            "7.95 m/s"
          ],
          correctAnswer: 0,
          explanation: "Vmax = (λ * PRF) / 4 = (0.053 m * 1200 / s) / 4 = 15.9 m/s.",
          topic: selectedQuestion.topic,
          difficulty: "Medium"
        },
        {
          id: `clone_${Date.now()}_2`,
          text: `[Variation 2] When severe wind shear causes radial velocity to jump from +22 m/s to -18 m/s across a single range gate under Vmax = 20 m/s, what correction algorithm must be applied?`,
          options: [
            "Dual-PRF Staggered De-aliasing Unwrapping",
            "Echo Top Height Thresholding",
            "Beam Elevation Elevation Stepping",
            "Doppler Zero-Isodop Suppression"
          ],
          correctAnswer: 0,
          explanation: "Dual-PRF unfolding / phase unwrapping algorithms resolve velocity folding beyond the primary Nyquist interval.",
          topic: selectedQuestion.topic,
          difficulty: "Hard"
        }
      ];

      setClonedQuestions(newClones);
      showToast(`✨ Generated ${newClones.length} targeted clone practice questions on ${selectedQuestion.topic}!`);
    } catch (err) {
      showToast("Error generating practice clones", "error");
    } finally {
      setGeneratingClones(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* ═════════ 1. HEADER & ITEM ANALYSIS STATS ═════════ */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#0a2558] to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <AlertTriangle className="w-3 h-3 text-white" />
                Item Analysis & Weak Question Detection
              </span>
              <span className="text-xs font-bold text-slate-300">
                Rule 11: High Attempts + Low Success Rate Trigger
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Difficult Question & Ambiguity Diagnostic Studio
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Isolates flawed question wording, misleading distractors, and misunderstood concepts based on empirical class performance.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ─── TOAST NOTIFICATION ─── */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
            <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
            <span className="text-xs font-bold">{toastMessage.text}</span>
          </div>
        )}

        {/* ═════════ 2. CONFIGURATION BAR & STAT COUNTERS ═════════ */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Flagging Trigger Rule:
            </span>
            <span className="px-3 py-1 bg-white rounded-xl border border-slate-200 font-semibold text-slate-800">
              Attempts &ge; <b>{minAttempts}</b>
            </span>
            <span className="text-slate-400 font-bold">+</span>
            <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
              Accuracy &le; <b>{accuracyCutoff}%</b>
            </span>
            <span className="text-slate-400 font-mono">(&rarr; ⚠ High Difficulty Question)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-xs text-rose-700 bg-rose-100 px-3 py-1 rounded-xl">
              {flaggedQuestions.length} Questions Need Review
            </span>
          </div>
        </div>

        {/* ═════════ 3. MAIN WORKSPACE: QUESTION LIST (LEFT) & ACTION WORKBENCH (RIGHT) ═════════ */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* ─── LEFT COLUMN: FLAGGED QUESTIONS LIST (5 COLUMNS) ─── */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[calc(92vh-190px)] bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flagged questions or topics..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-3 pt-1">
              {flaggedQuestions.map(q => {
                const isSelected = selectedQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuestion(q)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-white border-rose-500 ring-2 ring-rose-200 shadow-md"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-black text-xs">
                          Q{q.questionNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{q.topic}</span>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Needs Review
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      {q.text}
                    </p>

                    {/* Performance Telemetry Bar */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-bold">Attempts</span>
                        <span className="font-extrabold text-slate-900">{q.attempts}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Correct</span>
                        <span className="font-extrabold text-emerald-700">{q.correct}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Accuracy</span>
                        <span className="font-black text-rose-600">{q.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: ACTIONABLE TRAINER INTERVENTIONS (7 COLUMNS) ─── */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-190px)] bg-white">
            
            {/* Header of Selected Question */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-black text-xs">
                    Question {selectedQuestion.questionNumber}
                  </span>
                  <span className="text-xs font-black text-slate-900">{selectedQuestion.topic}</span>
                  <span className="text-[11px] text-slate-400">({selectedQuestion.subjectName})</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  <TrendingDown className="w-4 h-4" />
                  <span>{selectedQuestion.accuracy}% Class Accuracy ({selectedQuestion.correct}/{selectedQuestion.attempts} Correct)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 leading-relaxed">
                {selectedQuestion.text}
              </div>
            </div>

            {/* Distractor Breakdown Chart */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Empirical Distractor Selection Analysis:
              </span>

              <div className="space-y-2">
                {selectedQuestion.options?.map((opt, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 max-w-[80%]">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          opt.isCorrect 
                            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400" 
                            : opt.isTrap 
                            ? "bg-rose-100 text-rose-800 ring-1 ring-rose-400" 
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={`truncate ${opt.isCorrect ? "font-black text-emerald-950" : opt.isTrap ? "font-bold text-rose-950" : "text-slate-700"}`}>
                          {opt.text}
                        </span>
                      </div>

                      <span className="font-mono font-black text-xs">
                        {opt.pct}% {opt.isCorrect && <span className="text-emerald-700">(Correct)</span>} {opt.isTrap && <span className="text-rose-600">(Common Trap)</span>}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${opt.pct}%` }}
                        className={`h-full rounded-full ${
                          opt.isCorrect ? "bg-emerald-500" : opt.isTrap ? "bg-rose-500" : "bg-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── ACTIONABLE INTERVENTIONS TABS ─── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setActiveActionTab("review")}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                    activeActionTab === "review"
                      ? "bg-indigo-600 text-white font-black shadow-xs"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>1. Review Wording</span>
                </button>

                <button
                  onClick={() => setActiveActionTab("ai_diagnostics")}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                    activeActionTab === "ai_diagnostics"
                      ? "bg-indigo-600 text-white font-black shadow-xs"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100"
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>2. Misconception Diagnostic</span>
                </button>

                <button
                  onClick={() => setActiveActionTab("remedial_broadcast")}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                    activeActionTab === "remedial_broadcast"
                      ? "bg-indigo-600 text-white font-black shadow-xs"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>3. Broadcast Remedial Note</span>
                </button>

                <button
                  onClick={() => setActiveActionTab("generate_clones")}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                    activeActionTab === "generate_clones"
                      ? "bg-indigo-600 text-white font-black shadow-xs"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>4. Generate Practice Clones</span>
                </button>
              </div>

              {/* TAB 1: REVIEW QUESTION WORDING & DISTRACTORS */}
              {activeActionTab === "review" && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">Question Formulation Editor:</span>
                    <button
                      onClick={() => setIsEditingMode(!isEditingMode)}
                      className="text-xs font-bold text-indigo-700 hover:underline"
                    >
                      {isEditingMode ? "Cancel Editing" : "Edit Wording & Key"}
                    </button>
                  </div>

                  {isEditingMode ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Question Text:</label>
                        <textarea
                          value={editingQuestionText}
                          onChange={(e) => setEditingQuestionText(e.target.value)}
                          rows={3}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Official Explanation & Working:</label>
                        <textarea
                          value={editingExplanation}
                          onChange={(e) => setEditingExplanation(e.target.value)}
                          rows={2}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={handleSaveQuestionEdit}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes to Question Bank</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-slate-700">
                      <p><b>Current Text:</b> {selectedQuestion.text}</p>
                      <p><b>Official Explanation:</b> {selectedQuestion.explanation}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onOpenStudio) {
                              onOpenStudio({ id: selectedQuestion.courseId, title: selectedQuestion.subjectName });
                              showToast(`Opening course module for ${selectedQuestion.topic}`);
                            }
                          }}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs border border-blue-200 flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Check Linked Learning Material in Studio &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MISCONCEPTION DIAGNOSTIC */}
              {activeActionTab === "ai_diagnostics" && (
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-black text-indigo-950">AI Root-Cause Misconception Analysis</h5>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 space-y-2 text-slate-700">
                    <p className="font-bold text-slate-900">Why Cadets are Failing this Item:</p>
                    <p className="text-xs leading-relaxed text-slate-800">
                      {selectedQuestion.misunderstoodReason}
                    </p>
                  </div>

                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1 text-amber-950">
                    <p className="font-bold text-xs">Faculty Action Item:</p>
                    <p className="text-[11px] leading-relaxed">
                      {selectedQuestion.remedialRecommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: BROADCAST REMEDIAL NOTE */}
              {activeActionTab === "remedial_broadcast" && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      <h5 className="font-black text-slate-900">Draft Clarification Bulletin to Cadets</h5>
                    </div>
                    {broadcastSent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sent to {selectedQuestion.attempts} Cadets
                      </span>
                    )}
                  </div>

                  <textarea
                    value={broadcastNote}
                    onChange={(e) => setBroadcastNote(e.target.value)}
                    rows={6}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSendRemedialBroadcast}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast Clarification Note</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: GENERATE CLONE PRACTICE QUESTIONS */}
              {activeActionTab === "generate_clones" && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h5 className="font-black text-amber-950">AI Clone Practice Questions Generator</h5>
                    </div>

                    <button
                      disabled={generatingClones}
                      onClick={handleGenerateClones}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
                    >
                      {generatingClones ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      )}
                      <span>{generatingClones ? "Synthesizing Clones..." : "Generate 2 Variations"}</span>
                    </button>
                  </div>

                  <p className="text-slate-600 text-[11px]">
                    Synthesize cloned drill questions focused on the same core principle to reinforce learning and re-assess cadets.
                  </p>

                  {clonedQuestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {clonedQuestions.map((clone, idx) => (
                        <div key={idx} className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-2 shadow-2xs">
                          <p className="font-bold text-slate-900">{clone.text}</p>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                            {clone.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`p-1.5 rounded-lg border ${oIdx === clone.correctAnswer ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-slate-50 border-slate-200"}`}>
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </div>
                            ))}
                          </div>
                          <div className="pt-1 text-[10px] text-slate-500">
                            <b>Explanation:</b> {clone.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>

        {/* ═════════ 4. FOOTER ═════════ */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Rule 11 Engine: Active Item Analysis & Cognitive Remediation
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
