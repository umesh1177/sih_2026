import React, { useState, useEffect, useMemo } from "react";
import { 
  AlertTriangle, 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Award, 
  X, 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  Compass, 
  Zap, 
  HelpCircle, 
  BarChart3, 
  Flame, 
  RefreshCw,
  Send,
  GraduationCap
} from "lucide-react";
import { api } from "../../services/api";

const DEFAULT_GAP_THRESHOLD = 60; // Accuracy < 60% is flagged as a learning gap

// Rich Domain Knowledge Base for Weather & MoES Remediation Topics
const TOPIC_REMEDIATION_KB = {
  "Radar Interpretation": {
    topic: "Radar Interpretation",
    subject: "Radar Meteorology & Cyclone Tracking",
    courseId: "course_nwp_01",
    moduleId: "mod_01",
    baselineAccuracy: 46,
    totalQuestions: 15,
    wrongQuestions: 8,
    status: "critical",
    summary: {
      headline: "Doppler Velocity Interpretation, Radial Ambiguities & Dual-Pol Reflectivity",
      keyPrinciples: [
        "Radial Velocity represents velocity component strictly along the radar beam axis (away/towards radar), NOT the true vector horizontal wind.",
        "Nyquist Velocity Limit ($V_{\\max} = \\frac{\\lambda \\cdot \\text{PRF}}{4}$): Velocities exceeding $V_{\\max}$ undergo aliasing/folding and require phase unwrapping.",
        "Dual-Pol Differential Reflectivity ($Z_{DR}$) differentiates spherical raindrops from oblate hail ($Z_{DR} \\approx 0\\text{ dB}$ with very high $Z$).",
        "Specific Differential Phase ($K_{DP}$) is immune to attenuation and ground clutter, making it the most robust parameter for heavy precipitation rates."
      ],
      commonPitfalls: [
        "Confusing zero radial velocity on the zero-isodop line with zero wind speed (it indicates wind perpendicular to the beam).",
        "Misidentifying ground clutter / anomalous propagation (AP) echoes as severe convective storm cores.",
        "Failing to account for beam broadening at long ranges (>150 km), which averages velocity gradients."
      ],
      keyFormulas: [
        { label: "Doppler Frequency Shift", formula: "f_d = (2 * V_r) / lambda" },
        { label: "Nyquist Maximum Unambiguous Velocity", formula: "V_max = (lambda * PRF) / 4" },
        { label: "Marshall-Palmer Z-R Rainfall Relation", formula: "Z = 200 * R^{1.6}" }
      ]
    },
    sampleQuestions: [
      {
        question: "In a single Doppler radar velocity display, what does a zero-velocity band (zero isodop) oriented North-South indicate when winds are uniformly westerly?",
        options: [
          "Wind speed is zero across the station",
          "Winds are blowing parallel to the zero isodop line (perpendicular to radial beam)",
          "Anomalous propagation caused beam blockage",
          "Radar receiver entered Doppler saturation"
        ],
        correctAnswer: 1,
        explanation: "When winds blow from the West, beams pointing North and South are perpendicular to the wind vector, producing zero Doppler radial component."
      },
      {
        question: "Which dual-polarization metric is most reliable for discriminating large tumbling hail stones from heavy rain?",
        options: [
          "High Z (>55 dBZ) with near-zero Differential Reflectivity (Z_DR ≈ 0 dB)",
          "Extremely high Z_DR (>4.5 dB)",
          "Very low Correlation Coefficient (<0.4)",
          "Zero Specific Differential Phase (K_DP = 0)"
        ],
        correctAnswer: 0,
        explanation: "Tumbling hailstones appear quasi-spherical to the radar pulses, yielding Z_DR near 0 dB despite massive reflectivity (>55-60 dBZ)."
      }
    ]
  },
  "Numerical Prediction": {
    topic: "Numerical Prediction",
    subject: "Atmospheric Dynamics & NWP Modeling",
    courseId: "course_nwp_01",
    moduleId: "mod_02",
    baselineAccuracy: 52,
    totalQuestions: 18,
    wrongQuestions: 9,
    status: "moderate",
    summary: {
      headline: "CFL Stability Condition, Finite Difference Approximations & Sigma Coordinates",
      keyPrinciples: [
        "Courant-Friedrichs-Lewy (CFL) Condition ($C = \\frac{u \\cdot \\Delta t}{\\Delta x} \\le 1$): Explicit time integration schemes become computationally unstable if numerical waves propagate faster than grid resolution.",
        "Terrain-following hydrostatic pressure coordinates ($\sigma = \\frac{p - p_{top}}{p_s - p_{top}}$) eliminate bottom boundary discretization issues over steep topography like the Himalayas.",
        "Arakawa Staggered Grids (C-Grid): Optimal for resolving gravity-inertia waves and small-scale divergent flows.",
        "Non-hydrostatic governing equations must be used when horizontal grid spacing $\\Delta x < 10\\text{ km}$."
      ],
      commonPitfalls: [
        "Increasing horizontal resolution (reducing $\\Delta x$) without proportionally decreasing time step $\\Delta t$, causing sudden numerical explosion.",
        "Using hydrostatic approximations for convective cloud-resolving domains ($<4\\text{ km}$).",
        "Ignoring boundary relaxation zones in regional nested WRF/GFS simulations."
      ],
      keyFormulas: [
        { label: "Courant-Friedrichs-Lewy (CFL) Criterion", formula: "C = (u * Delta_t) / Delta_x <= C_max (typically 1.0)" },
        { label: "Hydrostatic Balance Equation", formula: "dp/dz = - rho * g" },
        { label: "Geostrophic Wind Relation", formula: "V_g = (1 / (f * rho)) * (grad(p) x k)" }
      ]
    },
    sampleQuestions: [
      {
        question: "If an explicit NWP advection scheme has a grid spacing Δx = 5 km and maximum horizontal wind speed u = 50 m/s, what is the maximum permissible time step Δt to avoid CFL numerical instability?",
        options: [
          "100 seconds",
          "500 seconds",
          "1000 seconds",
          "50 seconds"
        ],
        correctAnswer: 0,
        explanation: "By CFL criterion: Δt ≤ Δx / u = (5000 m) / (50 m/s) = 100 seconds."
      }
    ]
  },
  "Satellite Data Assimilation": {
    topic: "Satellite Data Assimilation",
    subject: "Satellite Meteorology & Remote Sensing",
    courseId: "course_nwp_01",
    moduleId: "mod_03",
    baselineAccuracy: 58,
    totalQuestions: 12,
    wrongQuestions: 5,
    status: "moderate",
    summary: {
      headline: "Radiative Transfer Models, 3D/4D-Var Cost Functions & Bias Correction",
      keyPrinciples: [
        "Variational Assimilation (3D-Var/4D-Var) minimizes the objective cost function $J(x) = \\frac{1}{2}(x - x_b)^T B^{-1}(x - x_b) + \\frac{1}{2}(y - H(x))^T R^{-1}(y - H(x))$.",
        "Forward Observation Operator $H(x)$ maps model state variables (temperature, moisture) into simulated top-of-atmosphere radiances using Radiative Transfer Models (RTTOV/CRTM).",
        "Water vapor absorption channels (6.7 μm) provide critical upper-tropospheric moisture winds even in cloud-free zones."
      ],
      commonPitfalls: [
        "Directly assimilating raw satellite brightness temperatures without systematic scan-angle and air-mass bias correction.",
        "Assuming diagonal background error covariance matrix $B$ (spatial and inter-variable cross-correlations are essential)."
      ],
      keyFormulas: [
        { label: "Variational Cost Function J(x)", formula: "J(x) = 0.5*(x - x_b)^T * B^{-1} * (x - x_b) + 0.5*(y - H(x))^T * R^{-1} * (y - H(x))" },
        { label: "Planck Radiance Equation", formula: "B_nu(T) = (2 * h * nu^3 / c^2) / (exp(h * nu / (k * T)) - 1)" }
      ]
    },
    sampleQuestions: [
      {
        question: "What is the primary role of the Observation Operator H(x) in satellite radiance assimilation?",
        options: [
          "To translate satellite telemetry into raw binary packets",
          "To transform the model state variables into simulated brightness temperatures matching the satellite sensor",
          "To filter out all cloud-covered pixels automatically",
          "To calculate the satellite's orbital trajectory"
        ],
        correctAnswer: 1,
        explanation: "H(x) is the forward radiative transfer operator that translates NWP model profiles (T, q, p) into simulated radiance spectra for direct comparison with satellite observations."
      }
    ]
  },
  "Cyclone Dynamics & Dvorak Technique": {
    topic: "Cyclone Dynamics & Dvorak Technique",
    subject: "Cyclone Warning & Marine Meteorology",
    courseId: "course_nwp_01",
    moduleId: "mod_04",
    baselineAccuracy: 84,
    totalQuestions: 20,
    wrongQuestions: 3,
    status: "mastered",
    summary: {
      headline: "T-Number Estimation, Central Dense Overcast (CDO) & Eye Pattern Analysis",
      keyPrinciples: [
        "Dvorak Technique uses satellite IR and Visible imagery pattern recognition to estimate Tropical Cyclone Intensity (T-Number: T1.0 to T8.0).",
        "Curved band pattern measures degree of cyclonic wrap around the system center.",
        "Eye pattern analysis evaluates temperature contrast between the warm eye and surrounding cold eyewall clouds."
      ],
      commonPitfalls: [
        "Misinterpreting diurnal IR cloud-top temperature oscillations as rapid intensification or weakening."
      ],
      keyFormulas: [
        { label: "T-Number to Wind Speed Relation", formula: "V_max = 3.9 * (T_number)^{1.5} (knots)" }
      ]
    },
    sampleQuestions: []
  }
};

export const LearningGapDetectionHub = ({ 
  currentUser, 
  onStartExam, 
  onOpenStudio, 
  onOpenCourse,
  onNavigateTab 
}) => {
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;
  const isTrainee = currentUser?.role === "trainee" && !isTrainer;

  // ─── STATE ───
  const [gapThreshold, setGapThreshold] = useState(() => {
    const saved = localStorage.getItem("moes_gap_threshold");
    return saved ? Number(saved) : DEFAULT_GAP_THRESHOLD;
  });

  // Start with empty data; gaps are computed 100% from real submissions
  const [topicsData, setTopicsData] = useState({});
  const [hasSubmissions, setHasSubmissions] = useState(null); // null = loading, false = no data, true = has data
  const [selectedTopicKey, setSelectedTopicKey] = useState("");
  const [activeModal, setActiveModal] = useState(null); // null | "ai_summary" | "remediation_plan" | "config"
  const [retestedScores, setRetestedScores] = useState(() => {
    const saved = localStorage.getItem("moes_retested_topics");
    return saved ? JSON.parse(saved) : {};
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [flashcardSelectedOption, setFlashcardSelectedOption] = useState(null);
  const [flashcardSubmitted, setFlashcardSubmitted] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── DYNAMIC LEARNING GAP TELEMETRY LOADER ───
  useEffect(() => {
    const loadDynamicGaps = async () => {
      try {
        let submissions = [];

        if (isTrainee) {
          const userId = currentUser?.id || currentUser?.traineeId;
          if (userId) {
            const [analyticsRes, subRes] = await Promise.all([
              api.getTraineeAnalytics(userId).catch(() => ({ success: false })),
              api.getTraineeSubmissions(userId).catch(() => ({ success: false }))
            ]);
            submissions = (subRes.success && subRes.submissions) ? subRes.submissions :
                          (analyticsRes.success && analyticsRes.submissions) ? analyticsRes.submissions : [];
          }
        } else if (currentUser?.role === "trainer") {
          const trainerRes = await api.getTrainerEnrolledTrainees(currentUser?.name, currentUser?.id).catch(() => ({ success: false }));
          if (trainerRes.success && Array.isArray(trainerRes.trainees)) {
            submissions = trainerRes.trainees.flatMap(t => t.submissions || []);
          }
        } else {
          // Admin: fetch overall submissions
          const adminRes = await api.getTrainerEnrolledTrainees().catch(() => ({ success: false }));
          if (adminRes.success && Array.isArray(adminRes.trainees)) {
            submissions = adminRes.trainees.flatMap(t => t.submissions || []);
          }
        }

        const hasData = Array.isArray(submissions) && submissions.length > 0;
        setHasSubmissions(hasData);

        if (!hasData) {
          setTopicsData({});
          return;
        }

        const dynamicTopicScores = {};

        submissions.forEach(s => {
          const topic = s.topic || s.subject || s.subjectName || s.quizTitle || "General Assessment";
          if (!dynamicTopicScores[topic]) {
            dynamicTopicScores[topic] = { total: 0, count: 0, subject: s.subject || s.courseTitle || "Meteorology" };
          }
          dynamicTopicScores[topic].total += (s.percentage || 0);
          dynamicTopicScores[topic].count += 1;
        });

        const qbRes = await api.getQuestions().catch(() => ({ success: false, questions: [] }));
        const qbQuestions = (qbRes.success && Array.isArray(qbRes.questions)) ? qbRes.questions : [];

        const computedTopics = {};

        Object.entries(dynamicTopicScores).forEach(([topic, stats]) => {
          const acc = Math.round(stats.total / stats.count);
          const kbMatch = TOPIC_REMEDIATION_KB[topic] || Object.values(TOPIC_REMEDIATION_KB).find(v => 
            topic.toLowerCase().includes(v.topic.toLowerCase()) || v.topic.toLowerCase().includes(topic.toLowerCase())
          );

          const matchedQs = qbQuestions.filter(q =>
            (q.topic && q.topic.toLowerCase().includes(topic.toLowerCase())) ||
            (q.subjectName && q.subjectName.toLowerCase().includes(topic.toLowerCase()))
          );

          computedTopics[topic] = {
            topic: topic,
            subject: stats.subject,
            baselineAccuracy: acc,
            totalQuestions: stats.count * 10,
            wrongQuestions: Math.round((1 - acc / 100) * stats.count * 10),
            status: acc < 50 ? "critical" : acc < 70 ? "moderate" : "mastered",
            summary: kbMatch?.summary || {
              headline: `${topic} Operational Foundations & Diagnostic Overview`,
              keyPrinciples: [
                `Core theoretical formulations and operational protocols in ${topic}.`,
                `Standard quality metrics, error limits, and verification guidelines.`,
                `Practical analysis and cross-sensor validation procedures.`
              ],
              commonPitfalls: [
                `Misinterpreting edge cases or boundary conditions in ${topic}.`,
                `Overlooking sensor-specific error margins or calibration drift.`
              ],
              keyFormulas: [
                { label: "Accuracy Index", formula: "Accuracy = (Correct / Total) * 100%" }
              ]
            },
            sampleQuestions: matchedQs.length > 0 ? matchedQs.slice(0, 5).map(q => ({
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
              explanation: q.explanation || ""
            })) : (kbMatch?.sampleQuestions || [])
          };
        });

        setTopicsData(computedTopics);

        const firstKey = Object.keys(computedTopics)[0];
        if (firstKey) setSelectedTopicKey(firstKey);

      } catch (err) {
        console.error("Failed to load dynamic learning gap telemetry:", err);
        setHasSubmissions(false);
      }
    };

    loadDynamicGaps();
  }, [currentUser, isTrainee]);


  // ─── GAP DETECTION CLASSIFICATION ───
  const detectedGaps = useMemo(() => {
    const list = Object.entries(topicsData).map(([key, data]) => {
      const retest = retestedScores[key];
      const effectiveAccuracy = retest !== undefined ? retest : data.baselineAccuracy;
      const isGap = effectiveAccuracy < gapThreshold;
      const severity = effectiveAccuracy < 50 ? "critical" : effectiveAccuracy < gapThreshold ? "moderate" : "mastered";

      return {
        key,
        ...data,
        effectiveAccuracy,
        isGap,
        severity,
        retested: retest !== undefined
      };
    });

    return list.sort((a, b) => a.effectiveAccuracy - b.effectiveAccuracy);
  }, [topicsData, gapThreshold, retestedScores]);

  const criticalGapsCount = detectedGaps.filter(g => g.severity === "critical").length;
  const moderateGapsCount = detectedGaps.filter(g => g.severity === "moderate").length;
  const masteredCount = detectedGaps.filter(g => g.severity === "mastered").length;

  const currentTopic = topicsData[selectedTopicKey] || Object.values(topicsData)[0] || null;

  // ─── LAUNCH TARGETED PRACTICE QUIZ HANDLER ───
  const handleLaunchTargetedQuiz = async (topicKey) => {
    const topicInfo = topicsData[topicKey];
    if (!topicInfo) return;

    let quizQuestions = [];

    if (topicInfo.sampleQuestions && topicInfo.sampleQuestions.length > 0) {
      quizQuestions = topicInfo.sampleQuestions.map((q, idx) => ({
        id: `q_${idx + 1}`,
        text: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: 2,
        difficulty: "Medium",
        topic: topicInfo.topic
      }));
    } else {
      try {
        const qbRes = await api.getQuestions();
        if (qbRes.success && Array.isArray(qbRes.questions)) {
          const matched = qbRes.questions.filter(q => 
            (q.topic && q.topic.toLowerCase().includes(topicInfo.topic.toLowerCase())) ||
            (q.subjectName && q.subjectName.toLowerCase().includes(topicInfo.subject?.toLowerCase() || ""))
          );
          if (matched.length > 0) {
            quizQuestions = matched.slice(0, 5).map((q, idx) => ({
              id: q.id || `q_${idx + 1}`,
              text: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
              explanation: q.explanation || "",
              marks: Number(q.marks) || 2,
              difficulty: q.difficulty || "Medium",
              topic: topicInfo.topic
            }));
          }
        }
      } catch (e) {
        console.error("Failed fetching questions from bank:", e);
      }
    }

    if (quizQuestions.length === 0) {
      showToast("No practice questions are available for this topic yet.", "info");
      return;
    }

    const targetedQuiz = {
      id: `targeted_practice_${Date.now()}`,
      title: `Remedial Adaptive Practice: ${topicInfo.topic}`,
      topic: topicInfo.topic,
      courseId: topicInfo.courseId || "course_nwp_01",
      courseName: topicInfo.subject || "Meteorological Specialization",
      durationMinutes: 15,
      totalMarks: quizQuestions.reduce((acc, q) => acc + (q.marks || 2), 0),
      passMarks: Math.round(quizQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) * 0.6),
      isPractice: true,
      isAdaptive: true,
      isTargetedRemediation: true,
      questions: quizQuestions
    };

    if (onStartExam) {
      onStartExam(targetedQuiz);
      showToast(`🎯 Launching Targeted Adaptive Remediation Quiz for ${topicInfo.topic}!`);
    } else {
      showToast("Launching targeted evaluation in kiosk mode...", "info");
    }
  };

  // ─── SIMULATE COMPLETED RETEST (GAP CLOSED) ───
  const handleSimulateRetestImprovement = (topicKey) => {
    const updated = { ...retestedScores, [topicKey]: 88 };
    setRetestedScores(updated);
    localStorage.setItem("moes_retested_topics", JSON.stringify(updated));
    showToast(`🎉 Remediation Success! Retest score for ${topicKey} improved to 88% — Learning Gap CLOSED!`);
  };

  const handleResetTopic = (topicKey) => {
    const updated = { ...retestedScores };
    delete updated[topicKey];
    setRetestedScores(updated);
    localStorage.setItem("moes_retested_topics", JSON.stringify(updated));
    showToast(`Reset ${topicKey} to baseline evaluation accuracy.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* ═════════ 1. HEADER & CLOSED LOOP BANNER ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                Adaptive Recommendation Engine
              </span>
              <span className="text-xs font-bold text-slate-400">
                Rule 10: Topic Accuracy &lt; {gapThreshold}% Trigger
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Automated Learning Gap Detection & Remediation
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              When recurring accuracy falls below the configured <b>{gapThreshold}% threshold</b>, the system automatically isolates the cognitive gap and provisions targeted <b>AI Module Summaries</b>, <b>Subject Materials</b>, and <b>Adaptive Practice Quizzes</b>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveModal("config")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs border border-slate-200 shadow-xs transition-colors"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Config Cutoff ({gapThreshold}%)</span>
            </button>

            <button
              onClick={() => {
                setRetestedScores({});
                localStorage.removeItem("moes_retested_topics");
                showToast("All topic gap telemetry reset to live evaluation baselines.");
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-2xl text-xs border border-slate-200"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* ─── 5-STEP CLOSED-LOOP VISUAL CYCLE ─── */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 p-4 sm:p-5 rounded-2xl border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Continuous Closed-Loop Remediation Cycle
            </span>
            <span className="text-[11px] font-bold text-indigo-700">
              Active Gaps: <b className="text-rose-600">{criticalGapsCount + moderateGapsCount}</b> | Mastered: <b className="text-emerald-700">{masteredCount}</b>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">1</div>
              <p className="font-extrabold text-xs text-slate-900">ASSESS</p>
              <p className="text-[10px] text-slate-500">Timed MCQs & Practice</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs space-y-1 ring-1 ring-rose-200">
              <div className="w-6 h-6 mx-auto rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">2</div>
              <p className="font-extrabold text-xs text-rose-900">IDENTIFY GAP</p>
              <p className="text-[10px] text-rose-600 font-bold">Accuracy &lt; {gapThreshold}%</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">3</div>
              <p className="font-extrabold text-xs text-slate-900">LEARN</p>
              <p className="text-[10px] text-slate-500">AI Summary & Notes</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">4</div>
              <p className="font-extrabold text-xs text-slate-900">PRACTICE</p>
              <p className="text-[10px] text-slate-500">Targeted Adaptive Quiz</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">5</div>
              <p className="font-extrabold text-xs text-emerald-900">IMPROVE</p>
              <p className="text-[10px] text-emerald-700 font-bold">Gap Closed (≥65%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════ EMPTY STATE: No Assessments / Submissions Taken ═════════ */}
      {hasSubmissions === false && (
        <div className="bg-white rounded-3xl border border-slate-200 p-14 text-center space-y-5 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-lg">No Learning Gaps Detected Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {isTrainee
                ? "Your gap analysis will appear here once you complete assessments. Take an official exam in the Assessments tab or a practice paper to build your diagnostic profile."
                : isTrainer
                ? "No trainee assessment submissions recorded yet for your assigned subjects. Learning gap analytics will automatically compute once enrolled trainees attempt quizzes."
                : "No assessment telemetry submissions recorded in the database yet. Gap detection triggers automatically upon assessment completion."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
              <span>1.</span> {isTrainer ? "Assign course subjects" : "Enroll in a course"}
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
              <span>2.</span> {isTrainer ? "Conduct assessments" : "Take an assessment"}
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700">
              <span>3.</span> Real-time Gap Telemetry
            </div>
          </div>
        </div>
      )}

      {/* ═════════ 2. MAIN SPLIT VIEW: GAP TOPIC CARDS vs REMEDIATION ACTION CENTER ═════════ */}
      {hasSubmissions === true && detectedGaps.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        
        {/* ─── LEFT COLUMN: DETECTED TOPIC GAPS LIST (5 COLUMNS) ─── */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Diagnosed Subject Areas</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {detectedGaps.length} Evaluated Topics
            </span>
          </div>

          <div className="space-y-3">
            {detectedGaps.map(item => {
              const isSelected = selectedTopicKey === item.key;
              const isCritical = item.severity === "critical";
              const isModerate = item.severity === "moderate";
              const isMastered = item.severity === "mastered";

              return (
                <div
                  key={item.key}
                  onClick={() => setSelectedTopicKey(item.key)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? "bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          isCritical ? "bg-rose-500 animate-pulse" : isModerate ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <h4 className="font-black text-sm text-slate-900">{item.topic}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium pl-4.5">{item.subject}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                      isCritical
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : isModerate
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}>
                      {item.effectiveAccuracy}% Accuracy
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.effectiveAccuracy}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-medium">
                      <span>Threshold: {gapThreshold}%</span>
                      {item.isGap ? (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Learning Gap Detected
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Mastery Satisfied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Footer inside Card */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {item.wrongQuestions} of {item.totalQuestions} Questions Incorrect
                    </span>
                    <span className="font-bold text-indigo-700 flex items-center gap-1 hover:underline">
                      Inspect Remediation →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: REMEDIATION ACTION WORKBENCH (7 COLUMNS) ─── */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 sticky top-6">
          
          {/* Header of Active Selected Topic */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  currentTopic.baselineAccuracy < gapThreshold
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {currentTopic.baselineAccuracy < gapThreshold ? "🔴 Learning Gap Detected" : "🟢 Mastery Achieved"}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {currentTopic.subject}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentTopic.topic}
              </h2>
            </div>

            <div className="text-right shrink-0 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnosed Accuracy</span>
              <span className={`text-2xl font-black ${
                (retestedScores[selectedTopicKey] || currentTopic.baselineAccuracy) < gapThreshold
                  ? "text-rose-600"
                  : "text-emerald-700"
              }`}>
                {retestedScores[selectedTopicKey] || currentTopic.baselineAccuracy}%
              </span>
            </div>
          </div>

          {/* 3 Prescribed Remediation Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Prescribed 3-Pillar Remediation Path:
            </h4>

            {/* Pillar 1: AI Module Summary */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-indigo-950">1. AI High-Yield Concept Summary</h4>
                    <p className="text-[11px] text-indigo-800">
                      Auto-synthesized key formulas, common traps, and physical principles.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveFlashcardIndex(0);
                    setFlashcardSubmitted(false);
                    setFlashcardSelectedOption(null);
                    setActiveModal("ai_summary");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                  Read AI Summary
                </button>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Summary Highlights:</p>
                <p className="text-[11px] leading-relaxed line-clamp-2">
                  {currentTopic.summary?.headline}
                </p>
              </div>
            </div>

            {/* Pillar 2: Learning Material */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <BookOpen className="w-5 h-5 text-blue-100" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-blue-950">2. Relevant Learning Materials & Video Lectures</h4>
                    <p className="text-[11px] text-blue-800">
                      Direct deep link into course syllabus modules, slides, and recorded video sessions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenStudio) {
                      onOpenStudio({ id: currentTopic.courseId || "course_nwp_01", title: currentTopic.subject });
                      showToast(`Opening syllabus studio for ${currentTopic.subject}`);
                    } else if (onNavigateTab) {
                      onNavigateTab("courses");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                  Open Study Material
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-blue-100">
                <span>Module: <b>NWP Doppler Mechanics & Dual-Pol Radar</b></span>
                <span>•</span>
                <span>Format: <b>Video + Slide Deck PDF</b></span>
              </div>
            </div>

            {/* Pillar 3: Practice Quiz (Targeted Adaptive) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950">3. Targeted Remedial Practice Quiz</h4>
                    <p className="text-[11px] text-amber-800">
                      Adaptive question sequence dynamically focused on closing this specific weakness.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchTargetedQuiz(selectedTopicKey)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-200" />
                  <span>Launch Practice Quiz</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span>Adaptive Difficulty: <b>Moderate $\rightarrow$ Hard on consecutive 3 correct</b></span>
                <span className="font-bold">10 MCQs • 15 Mins</span>
              </div>
            </div>
          </div>

          {/* Remediation Progress / Gap Closure Simulator */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-700">Closed-Loop Re-Evaluation Status:</p>
              <p className="text-[11px] text-slate-500">
                {retestedScores[selectedTopicKey] 
                  ? `Retest verified at ${retestedScores[selectedTopicKey]}% accuracy! Gap successfully resolved.`
                  : "Complete the practice quiz to re-evaluate topic accuracy and remove gap alert."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {retestedScores[selectedTopicKey] ? (
                <button
                  onClick={() => handleResetTopic(selectedTopicKey)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Reset Retest
                </button>
              ) : (
                <button
                  onClick={() => handleSimulateRetestImprovement(selectedTopicKey)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Retest Mastery (88%)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
      )}

      {/* ═════════ 3. AI SUMMARY & KNOWLEDGE CHECK MODAL ═════════ */}
      {activeModal === "ai_summary" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-[#0a2558] to-blue-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase">
                    AI Remediation Synthesis
                  </span>
                  <h3 className="text-lg font-black">{currentTopic.topic} — High-Yield Concept Review</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed">
              
              {/* Executive Concept Summary */}
              <div className="space-y-2">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <span>Core Operational Principles & Mechanics</span>
                </h4>
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2 text-slate-700">
                  {currentTopic.summary?.keyPrinciples?.map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <p className="text-xs">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfalls & Traps */}
              <div className="space-y-2">
                <h4 className="font-black text-sm text-rose-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Top 3 Common Traps / Misinterpretations</span>
                </h4>
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2 text-slate-700">
                  {currentTopic.summary?.commonPitfalls?.map((pit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold text-sm">✕</span>
                      <p className="text-xs text-rose-950 font-medium">{pit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Formulas */}
              {currentTopic.summary?.keyFormulas && currentTopic.summary.keyFormulas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Essential Physical Equations & Constants</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentTopic.summary.keyFormulas.map((f, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
                        <span className="text-[10px] text-slate-500 font-bold block">{f.label}</span>
                        <span className="text-xs font-bold text-indigo-900">{f.formula}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Flashcard / Quick Concept Check */}
              {currentTopic.sampleQuestions && currentTopic.sampleQuestions.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Instant Concept Check (Flashcard)</span>
                    </h5>
                    <span className="text-[10px] font-bold text-amber-800">
                      Question {activeFlashcardIndex + 1} of {currentTopic.sampleQuestions.length}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-slate-900">
                    {currentTopic.sampleQuestions[activeFlashcardIndex]?.question}
                  </p>

                  <div className="space-y-2">
                    {currentTopic.sampleQuestions[activeFlashcardIndex]?.options?.map((opt, oIdx) => {
                      const isCorrect = oIdx === currentTopic.sampleQuestions[activeFlashcardIndex]?.correctAnswer;
                      const isSelected = flashcardSelectedOption === oIdx;

                      let btnStyle = "bg-white hover:bg-amber-100/50 border-slate-200 text-slate-800";
                      if (flashcardSubmitted) {
                        if (isCorrect) btnStyle = "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold";
                        else if (isSelected) btnStyle = "bg-rose-100 border-rose-400 text-rose-950 line-through";
                      } else if (isSelected) {
                        btnStyle = "bg-amber-100 border-amber-400 text-amber-950 font-bold";
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={flashcardSubmitted}
                          onClick={() => setFlashcardSelectedOption(oIdx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {flashcardSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {!flashcardSubmitted ? (
                    <button
                      disabled={flashcardSelectedOption === null}
                      onClick={() => setFlashcardSubmitted(true)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-[11px] space-y-1">
                      <p className="font-bold text-slate-900">Explanation:</p>
                      <p className="text-slate-600">
                        {currentTopic.sampleQuestions[activeFlashcardIndex]?.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
              >
                Close Summary
              </button>

              <button
                onClick={() => {
                  setActiveModal(null);
                  handleLaunchTargetedQuiz(selectedTopicKey);
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Launch Adaptive Practice Quiz</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════ 4. CONFIG GAP THRESHOLD MODAL ═════════ */}
      {activeModal === "config" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-base text-slate-900">Configure Gap Trigger Threshold</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              When a trainee's recurring accuracy in any topic falls below this cutoff, it is flagged as an operational <b>Learning Gap</b> and prioritized for remediation.
            </p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-black">
                <span>Cutoff Percentage:</span>
                <span className="text-indigo-700 font-mono text-base">{gapThreshold}%</span>
              </div>

              <input
                type="range"
                min={40}
                max={80}
                step={5}
                value={gapThreshold}
                onChange={(e) => setGapThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>40% (Lenient)</span>
                <span>60% (Recommended)</span>
                <span>80% (Strict)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setGapThreshold(DEFAULT_GAP_THRESHOLD);
                  localStorage.setItem("moes_gap_threshold", DEFAULT_GAP_THRESHOLD);
                  setActiveModal(null);
                  showToast(`Reset gap threshold to standard default (${DEFAULT_GAP_THRESHOLD}%).`);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Reset Default
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("moes_gap_threshold", gapThreshold);
                  setActiveModal(null);
                  showToast(`Saved gap detection threshold: ${gapThreshold}%`);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Save Cutoff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
