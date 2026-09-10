import React, { useState, useMemo } from "react";
import { 
  Star, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Sliders, 
  Search, 
  Filter, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Plus, 
  X, 
  Check, 
  BarChart3, 
  Building2, 
  GraduationCap,
  Award,
  Layers,
  ShieldCheck
} from "lucide-react";
import { api } from "../../services/api";

const DEFAULT_COURSE_FEEDBACK_DATA = [
  {
    courseId: "course_nwp_01",
    courseTitle: "Advanced Numerical Weather Prediction & Data Assimilation",
    category: "Operational NWP",
    leadTrainerName: "Dr. Amit Sengupta",
    totalReviews: 48,
    overallRating: 4.4,
    metrics: {
      contentQuality: 4.6,
      trainerEffectiveness: 4.5,
      learningMaterial: 4.2,
      assessmentQuality: 3.8 // < 4.0 triggers alert!
    },
    alerts: [
      {
        type: "assessment_review",
        metric: "assessmentQuality",
        score: 3.8,
        title: "⚠ Assessment Review Recommended",
        description: "38% of cadets reported assessment questions contained confusing double negatives or tested CFL equations not demonstrated in the slides.",
        recommendedAction: "Review Quiz 1 and Final Assessment items in Question Bank or generate clarifying problem-solving drills."
      }
    ],
    reviews: [
      {
        id: "rev_1",
        traineeName: "Rahul Sharma (Scientist B)",
        station: "MC Jaipur",
        date: "2 days ago",
        overall: 4.0,
        content: 5,
        trainer: 5,
        material: 4,
        assessment: 3,
        comment: "Dr. Sengupta's lectures on atmospheric dynamics are phenomenal. However, the final quiz questions on 4D-Var variational assimilation were ambiguous with 2 very similar options.",
        sentiment: "mixed",
        tags: ["Ambiguous Quiz", "Great Lectures"]
      },
      {
        id: "rev_2",
        traineeName: "Priya Nair (Radar Specialist)",
        station: "CWC Visakhapatnam",
        date: "4 days ago",
        overall: 4.5,
        content: 5,
        trainer: 5,
        material: 5,
        assessment: 3,
        comment: "Excellent practical exposure. Assessment quality needs revision—several questions had confusing wording on sigma coordinates.",
        sentiment: "positive",
        tags: ["Revise Assessment", "High Practical Value"]
      },
      {
        id: "rev_3",
        traineeName: "Vikram Malhotra",
        station: "IMD Pune",
        date: "1 week ago",
        overall: 4.8,
        content: 5,
        trainer: 5,
        material: 4,
        assessment: 5,
        comment: "Very comprehensive curriculum. Best training program attended so far in MoES.",
        sentiment: "positive",
        tags: ["Highly Recommended"]
      }
    ]
  },
  {
    courseId: "course_radar_02",
    courseTitle: "Doppler Weather Radar (DWR) Operations & Severe Weather",
    category: "Radar Meteorology",
    leadTrainerName: "Dr. Priya Nair",
    totalReviews: 36,
    overallRating: 4.6,
    metrics: {
      contentQuality: 4.7,
      trainerEffectiveness: 4.8,
      learningMaterial: 3.9, // < 4.0 triggers alert!
      assessmentQuality: 4.5
    },
    alerts: [
      {
        type: "material_refresh",
        metric: "learningMaterial",
        score: 3.9,
        title: "⚠ Learning Material Review Recommended",
        description: "Cadets requested higher resolution Dual-Pol radar color bar guides and updated PDF reference charts for sea clutter classification.",
        recommendedAction: "Upload updated high-res ZDR/KDP operational quick-reference cards to Module 2."
      }
    ],
    reviews: [
      {
        id: "rev_4",
        traineeName: "Ananya Roy",
        station: "NCMRWF",
        date: "3 days ago",
        overall: 4.5,
        content: 5,
        trainer: 5,
        material: 3,
        assessment: 5,
        comment: "Radar simulations were fantastic. The PDF slides for Dual-Pol parameters were low resolution when zoomed in.",
        sentiment: "positive",
        tags: ["Low Res Slides", "Superb Simulator"]
      }
    ]
  },
  {
    courseId: "course_marine_03",
    courseTitle: "Coastal Oceanographic Modeling & Cyclone Inundation",
    category: "Marine Meteorology",
    leadTrainerName: "Dr. Sandeep Kulkarni",
    totalReviews: 29,
    overallRating: 4.7,
    metrics: {
      contentQuality: 4.8,
      trainerEffectiveness: 4.7,
      learningMaterial: 4.6,
      assessmentQuality: 4.7
    },
    alerts: [],
    reviews: [
      {
        id: "rev_5",
        traineeName: "Rohan Kulkarni",
        station: "IMD HQ",
        date: "5 days ago",
        overall: 5.0,
        content: 5,
        trainer: 5,
        material: 5,
        assessment: 5,
        comment: "Seamless instruction, clear assignments, and well-calibrated quiz pass thresholds.",
        sentiment: "positive",
        tags: ["Flawless Track"]
      }
    ]
  }
];

export const CourseFeedbackImprovementStudio = ({ 
  currentUser, 
  onOpenStudio, 
  onOpenQuestionBank, 
  onOpenAssessment 
}) => {
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;

  // ─── STATE ───
  const [coursesFeedback, setCoursesFeedback] = useState(() => {
    const saved = localStorage.getItem("moes_courses_feedback_data");
    return saved ? JSON.parse(saved) : DEFAULT_COURSE_FEEDBACK_DATA;
  });

  const [selectedCourseId, setSelectedCourseId] = useState("course_nwp_01");
  const [alertThreshold, setAlertThreshold] = useState(4.0); // Metric < 4.0 triggers alert
  const [reviewFilter, setReviewFilter] = useState("all"); // "all" | "critical" | "positive"
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [isAiRemediationModalOpen, setIsAiRemediationModalOpen] = useState(false);
  const [remediationDraft, setRemediationDraft] = useState("");

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedCourse = coursesFeedback.find(c => c.courseId === selectedCourseId) || coursesFeedback[0];

  // Recalculate dynamic alerts based on configurable alertThreshold
  const evaluatedAlerts = useMemo(() => {
    const alerts = [];
    const m = selectedCourse.metrics;

    if (m.assessmentQuality < alertThreshold) {
      alerts.push({
        type: "assessment_review",
        metricName: "Assessment Quality",
        score: m.assessmentQuality,
        title: "⚠ Assessment Review Recommended",
        description: `Assessment Quality score (${m.assessmentQuality}/5.0) is below the configured ${alertThreshold} threshold. Trainees reported ambiguous questions or phrasing gaps.`,
        actionLabel: "Review & Refine Assessment Items",
        actionType: "assessment"
      });
    }

    if (m.learningMaterial < alertThreshold) {
      alerts.push({
        type: "material_refresh",
        metricName: "Learning Material",
        score: m.learningMaterial,
        title: "⚠ Learning Material Review Recommended",
        description: `Learning Material rating (${m.learningMaterial}/5.0) is below the ${alertThreshold} threshold. Cadets requested higher-fidelity slides or updated reference notes.`,
        actionLabel: "Update Syllabus Learning Materials",
        actionType: "material"
      });
    }

    if (m.contentQuality < alertThreshold) {
      alerts.push({
        type: "content_review",
        metricName: "Content Quality",
        score: m.contentQuality,
        title: "⚠ Curriculum Content Refresh Recommended",
        description: `Content Quality rating (${m.contentQuality}/5.0) needs revision. Update syllabus structure to match operational guidelines.`,
        actionLabel: "Restructure Curriculum Syllabus",
        actionType: "content"
      });
    }

    return alerts;
  }, [selectedCourse, alertThreshold]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return (selectedCourse.reviews || []).filter(r => {
      const matchSearch = r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.traineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.station.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (reviewFilter === "critical") return matchSearch && (r.overall <= 4.0 || r.assessment <= 3 || r.material <= 3);
      if (reviewFilter === "positive") return matchSearch && r.overall >= 4.5;
      return matchSearch;
    });
  }, [selectedCourse, searchQuery, reviewFilter]);

  // 1-Click Action: AI Generate Remediation Action Plan
  const handleGenerateAiActionPlan = () => {
    const weakMetric = selectedCourse.metrics.assessmentQuality < alertThreshold ? "Assessment Quality" : "Learning Material";
    const plan = `[AI Course Quality Remediation Directive — ${selectedCourse.courseTitle}]\n\n` +
      `Identified Quality Bottleneck: ${weakMetric} (Score: ${selectedCourse.metrics.assessmentQuality < alertThreshold ? selectedCourse.metrics.assessmentQuality : selectedCourse.metrics.learningMaterial} / 5.0)\n\n` +
      `Cadet Feedback Consensus:\n` +
      `- Questions on 4D-Var variational equations and CFL numerical stability contained ambiguous double negatives.\n` +
      `- Cadets requested 3 step-by-step mathematical examples before timed quizzes.\n\n` +
      `Recommended Action Items for Faculty:\n` +
      `1. Refine Question #17 and #9 in Question Bank to remove ambiguous distractors.\n` +
      `2. Insert a 5-minute video walkthrough on Nyquist Velocity Unwrapping in Module 1.\n` +
      `3. Broadcast a clarification bulletin to all cadets enrolled in this track.`;

    setRemediationDraft(plan);
    setIsAiRemediationModalOpen(true);
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

      {/* ═════════ 1. HEADER & COURSE SELECTOR ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-50 border border-amber-200 text-amber-900 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Post-Course Quality Telemetry
            </span>
            <span className="text-xs font-bold text-slate-400">
              Rule 16: Feedback &rarr; Actionable Course Improvement
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Trainee Feedback & Course Improvement Studio
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Aggregates post-course feedback across 4 core pillars to detect teaching and evaluation bottlenecks, generating actionable signals for continuous curriculum refinement.
          </p>
        </div>

        {/* Course Dropdown Selector */}
        <div className="space-y-1 z-10 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Active Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full sm:w-72 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600 shadow-xs"
          >
            {coursesFeedback.map(c => (
              <option key={c.courseId} value={c.courseId}>
                {c.courseTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ═════════ 2. OVERALL RATING & 4-PILLAR BREAKDOWN ═════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Overall Rating Card (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5 text-center flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Aggregated Course Rating
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {selectedCourse.overallRating}
              </span>
              <span className="text-slate-400 text-lg font-bold">/ 5.0</span>
            </div>

            <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.floor(selectedCourse.overallRating)
                      ? "fill-amber-400 text-amber-500"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Based on <b>{selectedCourse.totalReviews} Verified Cadets</b>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Lead Faculty:</span>
              <span className="font-bold text-slate-900">{selectedCourse.leadTrainerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Curriculum Track:</span>
              <span className="font-bold text-slate-900">{selectedCourse.category}</span>
            </div>
          </div>
        </div>

        {/* Right: 4 Evaluated Pillars Matrix (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                4-Pillar Quality Breakdown
              </h3>
              <p className="text-xs text-slate-400">Continuous evaluation telemetry across instructional dimensions</p>
            </div>

            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              Alert Trigger: &lt; {alertThreshold} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pillar 1: Content Quality */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">1. Content Quality</span>
                <span className="font-black text-xs text-slate-900">{selectedCourse.metrics.contentQuality} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(selectedCourse.metrics.contentQuality / 5) * 100}%` }} className="bg-emerald-500 h-full rounded-full" />
              </div>
              <span className="text-[10px] text-slate-500 block">Syllabus depth & meteorological relevance</span>
            </div>

            {/* Pillar 2: Trainer Effectiveness */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">2. Trainer Effectiveness</span>
                <span className="font-black text-xs text-slate-900">{selectedCourse.metrics.trainerEffectiveness} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(selectedCourse.metrics.trainerEffectiveness / 5) * 100}%` }} className="bg-emerald-500 h-full rounded-full" />
              </div>
              <span className="text-[10px] text-slate-500 block">Clarity, responsiveness & practical demonstrations</span>
            </div>

            {/* Pillar 3: Learning Material */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              selectedCourse.metrics.learningMaterial < alertThreshold
                ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">3. Learning Material</span>
                <span className={`font-black text-xs ${
                  selectedCourse.metrics.learningMaterial < alertThreshold ? "text-amber-800 font-extrabold" : "text-slate-900"
                }`}>
                  {selectedCourse.metrics.learningMaterial} / 5.0 {selectedCourse.metrics.learningMaterial < alertThreshold && "⚠"}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(selectedCourse.metrics.learningMaterial / 5) * 100}%` }} className={`h-full rounded-full ${selectedCourse.metrics.learningMaterial < alertThreshold ? "bg-amber-500" : "bg-emerald-500"}`} />
              </div>
              <span className="text-[10px] text-slate-500 block">Video lecture clarity, slide resolution & notes</span>
            </div>

            {/* Pillar 4: Assessment Quality */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              selectedCourse.metrics.assessmentQuality < alertThreshold
                ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">4. Assessment Quality</span>
                <span className={`font-black text-xs ${
                  selectedCourse.metrics.assessmentQuality < alertThreshold ? "text-rose-700 font-extrabold" : "text-slate-900"
                }`}>
                  {selectedCourse.metrics.assessmentQuality} / 5.0 {selectedCourse.metrics.assessmentQuality < alertThreshold && "⚠"}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(selectedCourse.metrics.assessmentQuality / 5) * 100}%` }} className={`h-full rounded-full ${selectedCourse.metrics.assessmentQuality < alertThreshold ? "bg-rose-500" : "bg-emerald-500"}`} />
              </div>
              <span className="text-[10px] text-slate-500 block">Question clarity, fairness & distractor precision</span>
            </div>

          </div>
        </div>

      </div>

      {/* ═════════ 3. ACTIONABLE TRIGGER SIGNAL & REMEDIATION WORKBENCH ═════════ */}
      {evaluatedAlerts.length > 0 && (
        <div className="space-y-3">
          {evaluatedAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-rose-50 via-amber-50/80 to-indigo-50/70 rounded-3xl p-6 border border-rose-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <AlertTriangle className="w-3 h-3 text-white" />
                    Actionable Faculty Signal
                  </span>
                  <span className="text-xs font-extrabold text-rose-900">
                    {alert.title} — ({alert.metricName}: {alert.score}/5.0)
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {alert.description}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={handleGenerateAiActionPlan}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Remediation Plan</span>
                </button>

                {alert.actionType === "assessment" && (
                  <button
                    onClick={() => {
                      if (onOpenQuestionBank) onOpenQuestionBank();
                      else if (onOpenStudio) onOpenStudio({ id: selectedCourse.courseId, title: selectedCourse.courseTitle });
                      showToast(`Opening Question Bank to review assessment questions for ${selectedCourse.courseTitle}`);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span>{alert.actionLabel} &rarr;</span>
                  </button>
                )}

                {alert.actionType === "material" && (
                  <button
                    onClick={() => {
                      if (onOpenStudio) onOpenStudio({ id: selectedCourse.courseId, title: selectedCourse.courseTitle });
                      showToast(`Opening Curriculum Studio to upload high-res slides for ${selectedCourse.courseTitle}`);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                  >
                    <BookOpen className="w-4 h-4 text-blue-200" />
                    <span>{alert.actionLabel} &rarr;</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═════════ 4. QUALITATIVE REVIEWS & VERBATIM SENTIMENT EXPLORER ═════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        
        {/* Filter & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Verbatim Trainee Reviews & Suggestions</span>
            </h3>
            <p className="text-xs text-slate-400">Direct feedback submissions from certified cadets upon course completion</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback comments..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { id: "all", label: "All Reviews" },
                { id: "critical", label: "⚠ Needs Review" },
                { id: "positive", label: "⭐ Positive" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReviewFilter(f.id)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    reviewFilter === f.id
                      ? "bg-white text-indigo-950 font-black shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching trainee feedback records found.
            </div>
          ) : (
            filteredReviews.map(r => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 shadow-2xs hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900">{r.traineeName}</span>
                      <span className="text-[10px] text-slate-400">• {r.station}</span>
                      <span className="text-[10px] text-slate-400">• {r.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 pt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= r.overall ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5">{r.overall} / 5.0</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {r.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          tag.includes("Quiz") || tag.includes("Assessment") || tag.includes("Revise")
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{r.comment}"
                </p>

                {/* Micro Scores Breakdown */}
                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-semibold">
                  <span>Content: <b>{r.content}/5</b></span>
                  <span>•</span>
                  <span>Trainer: <b>{r.trainer}/5</b></span>
                  <span>•</span>
                  <span>Material: <b>{r.material}/5</b></span>
                  <span>•</span>
                  <span className={r.assessment <= 3 ? "text-rose-700 font-bold" : ""}>
                    Assessment: <b>{r.assessment}/5 {r.assessment <= 3 && "⚠"}</b>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ═════════ 5. AI REMEDIATION PLAN MODAL ═════════ */}
      {isAiRemediationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase">
                    AI Course Quality Action Plan
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{selectedCourse.courseTitle}</h3>
                </div>
              </div>

              <button onClick={() => setIsAiRemediationModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={remediationDraft}
              onChange={(e) => setRemediationDraft(e.target.value)}
              rows={10}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAiRemediationModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setIsAiRemediationModalOpen(false);
                  showToast("✓ Course Remediation Plan saved and broadcasted to faculty!");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Save & Broadcast Action Plan</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
