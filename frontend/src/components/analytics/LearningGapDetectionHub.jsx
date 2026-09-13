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
  GraduationCap,
  Users,
  UserCheck,
  Building2
} from "lucide-react";
import { api } from "../../services/api";

const DEFAULT_GAP_THRESHOLD = 60; // Accuracy < 60% is flagged as a learning gap

// Comprehensive Domain Knowledge Base for Weather & MoES Remediation Topics
const TOPIC_REMEDIATION_KB = {
  "Radar Interpretation": {
    topic: "Radar Interpretation",
    subject: "Radar Meteorology & Cyclone Tracking",
    courseId: "course_radar_02",
    moduleId: "mod_01",
    baselineAccuracy: 46,
    totalQuestions: 15,
    wrongQuestions: 8,
    status: "critical",
    summary: {
      headline: "Doppler Velocity Interpretation, Radial Ambiguities & Dual-Pol Reflectivity",
      keyPrinciples: [
        "Radial Velocity represents velocity component strictly along the radar beam axis (away/towards radar), NOT the true vector horizontal wind.",
        "Nyquist Velocity Limit (V_max = (lambda * PRF) / 4): Velocities exceeding V_max undergo aliasing/folding and require phase unwrapping.",
        "Dual-Pol Differential Reflectivity (Z_DR) differentiates spherical raindrops from oblate hail (Z_DR ≈ 0 dB with very high Z).",
        "Specific Differential Phase (K_DP) is immune to attenuation and ground clutter, making it the most robust parameter for heavy precipitation rates."
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
        "Courant-Friedrichs-Lewy (CFL) Condition: Explicit time integration schemes become computationally unstable if numerical waves propagate faster than grid resolution.",
        "Terrain-following hydrostatic pressure coordinates eliminate bottom boundary discretization issues over steep topography.",
        "Arakawa Staggered Grids (C-Grid): Optimal for resolving gravity-inertia waves and small-scale divergent flows.",
        "Non-hydrostatic governing equations must be used when horizontal grid spacing is finer than 10 km."
      ],
      commonPitfalls: [
        "Increasing horizontal resolution without proportionally decreasing time step, causing sudden numerical instability.",
        "Using hydrostatic approximations for convective cloud-resolving domains (<4 km).",
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
    courseId: "course_sat_03",
    moduleId: "mod_03",
    baselineAccuracy: 58,
    totalQuestions: 12,
    wrongQuestions: 5,
    status: "moderate",
    summary: {
      headline: "Radiative Transfer Models, 3D/4D-Var Cost Functions & Bias Correction",
      keyPrinciples: [
        "Variational Assimilation (3D-Var/4D-Var) minimizes cost functions between background state and observations.",
        "Forward Observation Operators map model atmospheric state variables into simulated top-of-atmosphere radiances using Radiative Transfer Models.",
        "Water vapor absorption channels (6.7 μm) provide critical upper-tropospheric moisture winds even in cloud-free zones."
      ],
      commonPitfalls: [
        "Directly assimilating raw satellite brightness temperatures without systematic scan-angle and air-mass bias correction.",
        "Assuming diagonal background error covariance matrix without spatial cross-correlations."
      ],
      keyFormulas: [
        { label: "3D-Var Cost Function", formula: "J(x) = 0.5*(x-xb)^T*B^{-1}*(x-xb) + 0.5*(y-H(x))^T*R^{-1}*(y-H(x))" }
      ]
    },
    sampleQuestions: [
      {
        question: "Why must satellite infrared radiances undergo bias correction before ingestion into 4D-Var NWP data assimilation systems?",
        options: [
          "Satellite sensors drift due to orbital decay and thermal variations leading to systematic air-mass dependent offsets",
          "Infrared radiation does not follow the Stefan-Boltzmann law in the stratosphere",
          "All satellite sensors have fixed zero-reflectance artifacts",
          "To convert kelvin temperatures into millibars directly"
        ],
        correctAnswer: 0,
        explanation: "Systematic sensor biases and radiative transfer modeling inaccuracies must be dynamically corrected to avoid corrupting model background fields."
      }
    ]
  },
  "Cyclone Track Forecasting": {
    topic: "Cyclone Track Forecasting",
    subject: "Tropical Meteorology & Severe Storms",
    courseId: "course_cyclone_04",
    moduleId: "mod_01",
    baselineAccuracy: 50,
    totalQuestions: 14,
    wrongQuestions: 7,
    status: "critical",
    summary: {
      headline: "Beta Gyres, Steering Flow Dynamics & Rapid Intensification Signatures",
      keyPrinciples: [
        "Deep-layer environmental steering flow (850–200 hPa average) accounts for 70-80% of tropical cyclone translation velocity.",
        "Beta-effect propagation induces an additional poleward and westward drift component independent of background steering.",
        "Rapid Intensification (RI) is defined as a maximum sustained surface wind increase of ≥30 knots in 24 hours."
      ],
      commonPitfalls: [
        "Neglecting vertical wind shear (>20 knots) which tilts the vortex and halts intensification.",
        "Overestimating storm motion when the system becomes vertically sheared and decouples."
      ],
      keyFormulas: [
        { label: "Deep Layer Mean Steering", formula: "V_steer = (1 / Delta_p) * Integral(V * dp) [850 to 200 hPa]" }
      ]
    },
    sampleQuestions: [
      {
        question: "What environmental parameter is the single strongest inhibitor of Tropical Cyclone Rapid Intensification (RI)?",
        options: [
          "High 850–200 hPa vertical wind shear (>20 knots)",
          "Warm ocean heat content (>50 kJ/cm²)",
          "High mid-tropospheric relative humidity (>70%)",
          "Low-level positive relative vorticity"
        ],
        correctAnswer: 0,
        explanation: "Strong vertical wind shear tilts the warm core and disperses latent heat aloft, preventing symmetric intensification."
      }
    ]
  },
  "Aviation METAR/TAF Decoding": {
    topic: "Aviation METAR/TAF Decoding",
    subject: "Aeronautical Meteorology & Runway Safety",
    courseId: "course_av_05",
    moduleId: "mod_02",
    baselineAccuracy: 55,
    totalQuestions: 16,
    wrongQuestions: 7,
    status: "moderate",
    summary: {
      headline: "Runway Visual Range (RVR), Wind Shear Warnings & Trend Forecasts",
      keyPrinciples: [
        "METAR reports current aerodrome weather at hourly/half-hourly intervals conforming to ICAO Annex 3 standards.",
        "RVR groups report touchdown, midpoint, and stop-end visual range when visibility is less than 1500 meters.",
        "Low-level wind shear alerts must be issued when wind speed changes ≥15 knots within 1600 ft AGL."
      ],
      commonPitfalls: [
        "Confusing CAVOK (Ceiling and Visibility OK) with clear skies when convective clouds are present.",
        "Misinterpreting TEMPO vs BECMG groups in Terminal Aerodrome Forecasts."
      ],
      keyFormulas: [
        { label: "QNH Altimeter Setting", formula: "QNH = Station Pressure + (Elevation * Lapse Rate Correction)" }
      ]
    },
    sampleQuestions: [
      {
        question: "In an aviation METAR report, the descriptor 'R28/P2000' indicates which condition?",
        options: [
          "Runway 28 Visual Range is greater than 2000 meters",
          "Runway 28 pressure altitude is 2000 feet",
          "Runway 28 precipitation rate is 2000 mm/hour",
          "Runway 28 is closed due to 2000 ft ceiling"
        ],
        correctAnswer: 0,
        explanation: "The 'P' prefix before the RVR number indicates 'greater than' the maximum measurement limit (2000 meters)."
      }
    ]
  },
  "Ocean Wave Modeling & Storm Surge": {
    topic: "Ocean Wave Modeling & Storm Surge",
    subject: "Marine & Coastal Meteorology",
    courseId: "course_marine_06",
    moduleId: "mod_01",
    baselineAccuracy: 62,
    totalQuestions: 10,
    wrongQuestions: 4,
    status: "moderate",
    summary: {
      headline: "SWAN/WW3 Wave Spectral Formulations & Coastal Inundation Dynamics",
      keyPrinciples: [
        "Third-generation wave models (WAVEWATCH III, SWAN) solve the spectral action density balance equation without a priori shape assumptions.",
        "Total storm tide = Astronomical Tide + Inverse Barometer Surge + Wind-driven Shoreward Setup + Wave Setup.",
        "Shallow water bathymetry along the Bay of Bengal coastline dramatically amplifies surge amplitudes."
      ],
      commonPitfalls: [
        "Ignoring phase matching between astronomical high tide and cyclone landfall time.",
        "Underestimating nonlinear tide-surge interactions in shallow estuaries."
      ],
      keyFormulas: [
        { label: "Inverse Barometer Effect", formula: "Surge_IB (cm) ≈ 1.0 * (1013 - P_central in hPa)" }
      ]
    },
    sampleQuestions: [
      {
        question: "What is the approximate sea level rise caused solely by the inverse barometric effect when atmospheric pressure drops by 40 hPa?",
        options: [
          "~40 cm (1 cm per 1 hPa drop)",
          "~4 meters",
          "~10 cm",
          "~100 cm"
        ],
        correctAnswer: 0,
        explanation: "The hydrostatic equilibrium response of water is approximately 1 cm of sea level rise for every 1 hPa drop in surface atmospheric pressure."
      }
    ]
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
  const isTrainee = currentUser?.role === "trainee" && !isAdmin;

  // ─── STATE ───
  const [gapThreshold, setGapThreshold] = useState(() => {
    const saved = localStorage.getItem("moes_gap_threshold");
    return saved ? Number(saved) : DEFAULT_GAP_THRESHOLD;
  });

  const [coursesList, setCoursesList] = useState([]);
  const [traineesList, setTraineesList] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedTraineeId, setSelectedTraineeId] = useState("all");

  const [rawSubmissions, setRawSubmissions] = useState([]);
  const [topicsData, setTopicsData] = useState(TOPIC_REMEDIATION_KB);
  const [selectedTopicKey, setSelectedTopicKey] = useState("Radar Interpretation");
  const [activeModal, setActiveModal] = useState(null); // null | "ai_summary" | "remediation_plan" | "config"
  const [retestedScores, setRetestedScores] = useState(() => {
    const saved = localStorage.getItem("moes_retested_topics");
    return saved ? JSON.parse(saved) : {};
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [flashcardSelectedOption, setFlashcardSelectedOption] = useState(null);
  const [flashcardSubmitted, setFlashcardSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── LOAD LIVE COURSES, TRAINEES & SUBMISSIONS ───
  useEffect(() => {
    const loadPlatformData = async () => {
      setLoading(true);
      try {
        const [cRes, tRes] = await Promise.all([
          api.getCourses().catch(() => ({ success: false, courses: [] })),
          (isAdmin 
            ? api.getTrainerEnrolledTrainees() 
            : api.getTrainerEnrolledTrainees(currentUser?.name, currentUser?.id)
          ).catch(() => ({ success: false, trainees: [] }))
        ]);

        if (cRes.success && Array.isArray(cRes.courses)) {
          setCoursesList(cRes.courses);
        }

        let enrolledList = [];
        let submissionsList = [];

        if (tRes.success && Array.isArray(tRes.trainees)) {
          enrolledList = tRes.trainees;
          setTraineesList(tRes.trainees);
          submissionsList = tRes.trainees.flatMap(t => (t.submissions || []).map(s => ({
            ...s,
            traineeId: t.traineeId || t.id,
            traineeName: t.name,
            courseId: t.courseId,
            courseTitle: t.courseTitle
          })));
        }

        // If trainee role, load their specific submissions directly
        if (isTrainee) {
          const userId = currentUser?.id || currentUser?.traineeId;
          if (userId) {
            const [analyticsRes, subRes] = await Promise.all([
              api.getTraineeAnalytics(userId).catch(() => ({ success: false })),
              api.getTraineeSubmissions(userId).catch(() => ({ success: false }))
            ]);
            const tSubs = (subRes.success && subRes.submissions) ? subRes.submissions :
                          (analyticsRes.success && analyticsRes.submissions) ? analyticsRes.submissions : [];
            if (tSubs.length > 0) {
              submissionsList = tSubs.map(s => ({ ...s, traineeId: userId, traineeName: currentUser?.name }));
            }
          }
        }

        setRawSubmissions(submissionsList);

      } catch (err) {
        console.error("Failed loading data in LearningGapDetectionHub:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformData();
  }, [currentUser, isAdmin, isTrainee]);

  // ─── DYNAMIC LEARNING GAP TELEMETRY COMPUTATION ───
  useEffect(() => {
    const computeFilteredGaps = () => {
      // 1. Filter submissions according to selected course and trainee
      let filteredSubs = [...rawSubmissions];
      if (selectedCourseId !== "all") {
        filteredSubs = filteredSubs.filter(s => s.courseId === selectedCourseId || (s.courseTitle && s.courseTitle.toLowerCase().includes(selectedCourseId.toLowerCase())));
      }
      if (selectedTraineeId !== "all") {
        filteredSubs = filteredSubs.filter(s => s.traineeId === selectedTraineeId || s.traineeName === selectedTraineeId);
      }

      // If we have actual quiz submissions matching this filter
      if (filteredSubs.length > 0) {
        const dynamicTopicScores = {};

        filteredSubs.forEach(s => {
          const topic = s.topic || s.subject || s.subjectName || s.quizTitle || "Operational Meteorology";
          if (!dynamicTopicScores[topic]) {
            dynamicTopicScores[topic] = { 
              total: 0, 
              count: 0, 
              subject: s.subject || s.courseTitle || "Atmospheric Dynamics",
              courseId: s.courseId || "course_nwp_01"
            };
          }
          dynamicTopicScores[topic].total += (s.percentage || 0);
          dynamicTopicScores[topic].count += 1;
        });

        const computed = {};
        Object.entries(dynamicTopicScores).forEach(([topic, stats]) => {
          const acc = Math.round(stats.total / stats.count);
          const kbMatch = TOPIC_REMEDIATION_KB[topic] || Object.values(TOPIC_REMEDIATION_KB).find(v => 
            topic.toLowerCase().includes(v.topic.toLowerCase()) || v.topic.toLowerCase().includes(topic.toLowerCase())
          );

          computed[topic] = {
            topic: topic,
            subject: stats.subject,
            courseId: stats.courseId,
            baselineAccuracy: acc,
            totalQuestions: stats.count * 10,
            wrongQuestions: Math.round((1 - acc / 100) * stats.count * 10),
            status: acc < 50 ? "critical" : acc < gapThreshold ? "moderate" : "mastered",
            summary: kbMatch?.summary || {
              headline: `${topic} Operational Foundations & Diagnostic Overview`,
              keyPrinciples: [
                `Core theoretical formulations and operational forecasting protocols in ${topic}.`,
                `Standard quality metrics, error limits, and verification guidelines.`,
                `Practical analysis and cross-sensor validation procedures.`
              ],
              commonPitfalls: [
                `Misinterpreting boundary conditions or threshold assumptions in ${topic}.`,
                `Overlooking sensor-specific error margins or calibration drift.`
              ],
              keyFormulas: [
                { label: "Accuracy Index", formula: "Accuracy = (Correct / Total) * 100%" }
              ]
            },
            sampleQuestions: kbMatch?.sampleQuestions || [
              {
                question: `Which fundamental principle governs operational accuracy in ${topic}?`,
                options: [
                  "Strict adherence to physical conservation laws and boundary calibrations",
                  "Unconstrained linear extrapolation without dynamical constraints",
                  "Ignoring terrain elevation corrections",
                  "Direct unverified single-sensor raw output"
                ],
                correctAnswer: 0,
                explanation: `High precision in ${topic} requires physical consistency, boundary balance, and calibrated sensor ingestion.`
              }
            ]
          };
        });

        setTopicsData(computed);
        const keys = Object.keys(computed);
        if (keys.length > 0 && !computed[selectedTopicKey]) {
          setSelectedTopicKey(keys[0]);
        }
      } else {
        // Fallback to rich meteorological knowledge base filtered by course
        let kbFiltered = { ...TOPIC_REMEDIATION_KB };
        if (selectedCourseId !== "all") {
          const matched = Object.entries(TOPIC_REMEDIATION_KB).filter(([k, v]) => 
            v.courseId === selectedCourseId || v.subject.toLowerCase().includes(selectedCourseId.toLowerCase())
          );
          if (matched.length > 0) {
            kbFiltered = Object.fromEntries(matched);
          }
        }
        setTopicsData(kbFiltered);
        const keys = Object.keys(kbFiltered);
        if (keys.length > 0 && !kbFiltered[selectedTopicKey]) {
          setSelectedTopicKey(keys[0]);
        }
      }
    };

    computeFilteredGaps();
  }, [rawSubmissions, selectedCourseId, selectedTraineeId, gapThreshold]);

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

  const currentTopic = topicsData[selectedTopicKey] || detectedGaps[0] || Object.values(TOPIC_REMEDIATION_KB)[0];

  // Selected Trainee Profile details
  const selectedTraineeObj = useMemo(() => {
    if (selectedTraineeId === "all") return null;
    return traineesList.find(t => (t.traineeId || t.id) === selectedTraineeId);
  }, [selectedTraineeId, traineesList]);

  // ─── LAUNCH TARGETED PRACTICE QUIZ HANDLER ───
  const handleLaunchTargetedQuiz = async (topicKey) => {
    const topicInfo = topicsData[topicKey] || TOPIC_REMEDIATION_KB[topicKey];
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

  const handleAssignRemediation = (topicKey) => {
    const targetName = selectedTraineeObj ? selectedTraineeObj.name : "All Enrolled Officers";
    showToast(`🚀 Prescribed Targeted Remediation Path for "${topicKey}" assigned to ${targetName}!`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius)] bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ═════════ 1. HEADER & CLOSED LOOP BANNER ═════════ */}
      <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                Adaptive Recommendation Engine
              </span>
              <span className="text-xs font-medium text-slate-400">
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
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-[var(--radius)] text-xs border border-slate-200 shadow-xs transition-colors"
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
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-[var(--radius)] text-xs border border-slate-200"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* ─── FILTERS STRIP: COURSE & INDIVIDUAL TRAINEE SELECTORS ─── */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 1. Course Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-[var(--radius)] border border-slate-200 text-xs">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-500">Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Operational Courses ({coursesList.length || 6})</option>
                {coursesList.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* 2. Individual Trainee Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-[var(--radius)] border border-slate-200 text-xs">
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="font-medium text-slate-500">Learner:</span>
              <select
                value={selectedTraineeId}
                onChange={(e) => setSelectedTraineeId(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-hidden cursor-pointer max-w-[220px] truncate"
              >
                <option value="all">All Enrolled Officers ({traineesList.length || 8})</option>
                {traineesList.map(t => (
                  <option key={t.traineeId || t.id} value={t.traineeId || t.id}>
                    {t.name} ({t.cadreId || t.department || "Officer"})
                  </option>
                ))}
              </select>
            </div>

            {(selectedCourseId !== "all" || selectedTraineeId !== "all") && (
              <button
                onClick={() => {
                  setSelectedCourseId("all");
                  setSelectedTraineeId("all");
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Diagnostic Scope:</span>
            <span className="px-2.5 py-0.5 rounded-[var(--radius)] bg-blue-100 text-blue-900 font-extrabold">
              {selectedTraineeObj ? `Officer: ${selectedTraineeObj.name}` : (selectedCourseId !== "all" ? "Single Course" : "National Organization Cohort")}
            </span>
          </div>
        </div>

        {/* ─── INDIVIDUAL TRAINEE DOSSIER BANNER (WHEN SPECIFIC TRAINEE SELECTED) ─── */}
        {selectedTraineeObj && (
          <div className="bg-purple-50/80 border border-purple-200 rounded-[var(--radius)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius)] bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
                {selectedTraineeObj.name.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">{selectedTraineeObj.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 font-medium text-[10px]">
                    {selectedTraineeObj.cadreId || "Trainee"}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {selectedTraineeObj.designation || "Scientist 'B'"} • {selectedTraineeObj.department || "Ministry of Earth Sciences"} • Station: {selectedTraineeObj.station || "IMD Field Station"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right px-3 py-1 bg-white rounded-[var(--radius)] border border-purple-200">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">Avg Score</span>
                <b className="text-sm font-black text-purple-900">{selectedTraineeObj.assessmentScore || selectedTraineeObj.avgQuizScore || 78}%</b>
              </div>
              <div className="text-right px-3 py-1 bg-white rounded-[var(--radius)] border border-purple-200">
                <span className="text-[10px] text-slate-400 font-medium uppercase block">Syllabus Progress</span>
                <b className="text-sm font-black text-emerald-700">{selectedTraineeObj.completionPercentage || 65}%</b>
              </div>
            </div>
          </div>
        )}

        {/* ─── 5-STEP CLOSED-LOOP VISUAL CYCLE ─── */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 p-4 sm:p-5 rounded-[var(--radius)] border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Continuous Closed-Loop Remediation Cycle
            </span>
            <span className="text-[11px] font-medium text-indigo-700">
              Active Gaps: <b className="text-rose-600">{criticalGapsCount + moderateGapsCount}</b> | Mastered: <b className="text-emerald-700">{masteredCount}</b>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
            <div className="bg-white p-3 rounded-[var(--radius)] border border-indigo-100 shadow-2xs space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">1</div>
              <p className="font-extrabold text-xs text-slate-900">ASSESS</p>
              <p className="text-[10px] text-slate-500">Timed MCQs & Practice</p>
            </div>

            <div className="bg-white p-3 rounded-[var(--radius)] border border-rose-200 shadow-2xs space-y-1 ring-1 ring-rose-200">
              <div className="w-6 h-6 mx-auto rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">2</div>
              <p className="font-extrabold text-xs text-rose-900">IDENTIFY GAP</p>
              <p className="text-[10px] text-rose-600 font-medium">Accuracy &lt; {gapThreshold}%</p>
            </div>

            <div className="bg-white p-3 rounded-[var(--radius)] border border-indigo-100 shadow-2xs space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">3</div>
              <p className="font-extrabold text-xs text-slate-900">LEARN</p>
              <p className="text-[10px] text-slate-500">AI Summary & Notes</p>
            </div>

            <div className="bg-white p-3 rounded-[var(--radius)] border border-indigo-100 shadow-2xs space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">4</div>
              <p className="font-extrabold text-xs text-slate-900">PRACTICE</p>
              <p className="text-[10px] text-slate-500">Targeted Adaptive Quiz</p>
            </div>

            <div className="bg-white p-3 rounded-[var(--radius)] border border-emerald-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">5</div>
              <p className="font-extrabold text-xs text-emerald-900">IMPROVE</p>
              <p className="text-[10px] text-emerald-700 font-medium">Gap Closed (≥65%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════ 2. MAIN SPLIT VIEW: GAP TOPIC CARDS vs REMEDIATION ACTION CENTER ═════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── LEFT COLUMN: DETECTED TOPIC GAPS LIST (5 COLUMNS) ─── */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Diagnosed Topic Deficits</span>
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {detectedGaps.length} Subject Topics
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
                  className={`p-5 rounded-[var(--radius)] border transition-all cursor-pointer space-y-3 ${
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

                    <span className={`px-2.5 py-1 rounded-[var(--radius)] text-xs font-black shrink-0 ${
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
                        <span className="text-rose-700 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Learning Gap Detected
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
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
                    <span className="font-medium text-indigo-700 flex items-center gap-1 hover:underline">
                      Inspect Remediation →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: REMEDIATION ACTION WORKBENCH (7 COLUMNS) ─── */}
        <div className="lg:col-span-7 bg-white rounded-[var(--radius)] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 sticky top-6">
          
          {/* Header of Active Selected Topic */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  (retestedScores[selectedTopicKey] || currentTopic.baselineAccuracy) < gapThreshold
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {(retestedScores[selectedTopicKey] || currentTopic.baselineAccuracy) < gapThreshold ? "🔴 Learning Gap Detected" : "🟢 Mastery Achieved"}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentTopic.subject}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentTopic.topic}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right bg-slate-50 px-4 py-2 rounded-[var(--radius)] border border-slate-200">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Topic Accuracy</span>
                <span className={`text-2xl font-black ${
                  (retestedScores[selectedTopicKey] || currentTopic.baselineAccuracy) < gapThreshold
                    ? "text-rose-600"
                    : "text-emerald-700"
                }`}>
                  {retestedScores[selectedTopicKey] || currentTopic.baselineAccuracy}%
                </span>
              </div>

              {isTrainer && (
                <button
                  onClick={() => handleAssignRemediation(currentTopic.topic)}
                  className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign Remediation</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Prescribed Remediation Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Prescribed 3-Pillar Remediation Path:
            </h4>

            {/* Pillar 1: AI Module Summary */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] bg-indigo-50/70 border border-indigo-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[var(--radius)] bg-indigo-600 text-white flex items-center justify-center font-medium shadow-xs">
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                  Read AI Summary
                </button>
              </div>

              <div className="bg-white/80 p-3 rounded-[var(--radius)] border border-indigo-100 text-xs text-slate-700 space-y-1">
                <p className="font-medium text-slate-900">Summary Highlights:</p>
                <p className="text-[11px] leading-relaxed line-clamp-2">
                  {currentTopic.summary?.headline}
                </p>
              </div>
            </div>

            {/* Pillar 2: Learning Material */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[var(--radius)] bg-blue-600 text-white flex items-center justify-center font-medium shadow-xs">
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                  Open Study Material
                </button>
              </div>

              <div className="bg-white/80 p-3 rounded-[var(--radius)] border border-blue-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Direct module link: <b>{currentTopic.subject}</b></span>
                <span className="text-[10px] text-blue-600 font-extrabold uppercase">Available Online</span>
              </div>
            </div>

            {/* Pillar 3: Targeted Practice Quiz */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[var(--radius)] bg-amber-600 text-white flex items-center justify-center font-medium shadow-xs">
                    <Flame className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950">3. Targeted Adaptive Practice Quiz</h4>
                    <p className="text-[11px] text-amber-800">
                      Adaptive timed evaluation isolating this specific knowledge gap.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchTargetedQuiz(selectedTopicKey)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Practice</span>
                </button>
              </div>

              <div className="bg-white/80 p-3 rounded-[var(--radius)] border border-amber-100 text-xs flex items-center justify-between">
                <span className="text-slate-700">Adaptive Format: <b>5-10 High-Yield Questions</b></span>
                <span className="text-amber-800 font-medium">15 Mins • Kiosk Mode Proctored</span>
              </div>
            </div>
          </div>

          {/* Simulate Retest / Gap Closed Button for Training Validation */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Pass targeted retest with <b>≥65% score</b> to close this learning gap.
            </p>

            <button
              onClick={() => handleSimulateRetestImprovement(selectedTopicKey)}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Verified Retest (88%)</span>
            </button>
          </div>

        </div>

      </div>

      {/* ═════════ 3. MODALS: AI SUMMARY & HIGH-YIELD FLASHCARD WORKBENCH ═════════ */}
      {activeModal === "ai_summary" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in select-text font-sans">
          <div className="bg-white rounded-[var(--radius)] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
            
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-black text-[10px] uppercase">
                    AI Remedial Knowledge Capsule
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{currentTopic.subject}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentTopic.topic}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-[var(--radius)] bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Summary Content */}
            <div className="space-y-5 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-2">
              
              <div className="bg-indigo-50/70 p-4 rounded-[var(--radius)] border border-indigo-100 space-y-1.5">
                <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Executive Topic Diagnostic</span>
                </h4>
                <p className="leading-relaxed text-indigo-900">
                  {currentTopic.summary?.headline}
                </p>
              </div>

              {/* Core Physical Principles */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  Key Physical & Mathematical Principles
                </h4>
                <ul className="space-y-2">
                  {(currentTopic.summary?.keyPrinciples || []).map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-[var(--radius)] border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Exam Pitfalls */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-rose-800">
                  Common Cognitive Traps & Operational Pitfalls
                </h4>
                <div className="bg-rose-50/60 p-4 rounded-[var(--radius)] border border-rose-200 space-y-2">
                  {(currentTopic.summary?.commonPitfalls || []).map((pf, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-rose-950">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{pf}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Formulas */}
              {(currentTopic.summary?.keyFormulas || []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                    Core Operational Formulas
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {currentTopic.summary.keyFormulas.map((f, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 text-white rounded-[var(--radius)] font-mono text-xs flex items-center justify-between">
                        <span className="text-slate-400 font-sans">{f.label}:</span>
                        <code className="text-amber-300 font-medium">{f.formula}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Sample Question Drill */}
              {(currentTopic.sampleQuestions || []).length > 0 && (
                <div className="p-4 rounded-[var(--radius)] bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600" />
                      Concept Check: Instant Self-Test
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium">
                      Question {activeFlashcardIndex + 1} of {currentTopic.sampleQuestions.length}
                    </span>
                  </div>

                  {(() => {
                    const q = currentTopic.sampleQuestions[activeFlashcardIndex] || currentTopic.sampleQuestions[0];
                    return (
                      <div className="space-y-3 bg-white p-4 rounded-[var(--radius)] border border-amber-100">
                        <p className="font-medium text-slate-900 text-xs">{q.question}</p>
                        
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = flashcardSelectedOption === oIdx;
                            const isCorrect = oIdx === q.correctAnswer;
                            let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                            
                            if (flashcardSubmitted) {
                              if (isCorrect) btnStyle = "bg-emerald-100 border-emerald-300 text-emerald-950 font-medium";
                              else if (isSelected) btnStyle = "bg-rose-100 border-rose-300 text-rose-950";
                            } else if (isSelected) {
                              btnStyle = "bg-blue-100 border-blue-300 text-blue-950 font-medium";
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={flashcardSubmitted}
                                onClick={() => setFlashcardSelectedOption(oIdx)}
                                className={`w-full text-left p-2.5 rounded-[var(--radius)] border text-xs transition-colors flex items-center gap-2 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full bg-white border font-medium text-[10px] flex items-center justify-center shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {flashcardSubmitted && (
                          <div className="p-3 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-700">
                            <span className="font-medium text-slate-900">💡 Explanation:</span>
                            <p>{q.explanation}</p>
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between">
                          {!flashcardSubmitted ? (
                            <button
                              disabled={flashcardSelectedOption === null}
                              onClick={() => setFlashcardSubmitted(true)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-[var(--radius)] text-xs transition-colors"
                            >
                              Check Answer
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setFlashcardSubmitted(false);
                                setFlashcardSelectedOption(null);
                                setActiveFlashcardIndex((prev) => (prev + 1) % currentTopic.sampleQuestions.length);
                              }}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-[var(--radius)] text-xs transition-colors"
                            >
                              Next Question →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
              >
                Close Summary
              </button>

              <button
                onClick={() => {
                  setActiveModal(null);
                  handleLaunchTargetedQuiz(selectedTopicKey);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-md flex items-center gap-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Launch Targeted Quiz</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════ 4. CONFIG THRESHOLD CUTOFF MODAL ═════════ */}
      {activeModal === "config" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-sans select-none">
          <div className="bg-white rounded-[var(--radius)] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Configure Learning Gap Cutoff</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-[var(--radius)] text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Any subject topic where candidate assessment accuracy drops below this percentage will be automatically classified as an active <b>Learning Gap</b> and trigger automated remedial recommendations.
            </p>

            <div className="space-y-4 bg-slate-50 p-4 rounded-[var(--radius)] border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Trigger Threshold:</span>
                <span className="text-xl font-black text-indigo-600">{gapThreshold}%</span>
              </div>

              <input
                type="range"
                min="40"
                max="80"
                step="5"
                value={gapThreshold}
                onChange={(e) => setGapThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-[var(--radius)] appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>40% (Permissive)</span>
                <span>60% (MoES Standard)</span>
                <span>80% (Strict)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setGapThreshold(DEFAULT_GAP_THRESHOLD);
                  localStorage.setItem("moes_gap_threshold", String(DEFAULT_GAP_THRESHOLD));
                  setActiveModal(null);
                  showToast(`Threshold reset to default ${DEFAULT_GAP_THRESHOLD}%.`);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Reset Default
              </button>

              <button
                onClick={() => {
                  localStorage.setItem("moes_gap_threshold", String(gapThreshold));
                  setActiveModal(null);
                  showToast(`Saved gap detection threshold at ${gapThreshold}%.`);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm"
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
