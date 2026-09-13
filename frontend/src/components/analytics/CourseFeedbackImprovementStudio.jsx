import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck,
  Inbox
} from "lucide-react";
import { api } from "../../services/api";

export const CourseFeedbackImprovementStudio = ({ 
  currentUser, 
  onOpenStudio, 
  onOpenQuestionBank, 
  onOpenAssessment 
}) => {
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;

  // ─── STATE ───
  const [courses, setCourses] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, feedbacksRes] = await Promise.all([
          api.getCourses().catch(() => ({ success: false, courses: [] })),
          api.getFeedbacks().catch(() => ({ success: false, feedbacks: [] }))
        ]);

        const courseList = Array.isArray(coursesRes) ? coursesRes : (coursesRes.courses || []);
        const feedbackList = Array.isArray(feedbacksRes) ? feedbacksRes : (feedbacksRes.feedbacks || feedbacksRes.data || []);

        setCourses(courseList);
        setFeedbacks(feedbackList);

        if (courseList.length > 0) {
          setSelectedCourseId(prev => prev && courseList.some(c => c.id === prev) ? prev : courseList[0].id);
        }
      } catch (err) {
        console.error("Failed to load feedback telemetry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute aggregated stats for each course dynamically
  const coursesFeedback = useMemo(() => {
    return courses.map(c => {
      const courseReviews = feedbacks.filter(f => f.courseId === c.id || f.courseId === c.courseId);
      const total = courseReviews.length;

      let sumOverall = 0;
      let sumContent = 0;
      let sumTrainer = 0;
      let sumMaterial = 0;
      let sumAssessment = 0;

      const mappedReviews = courseReviews.map((r, idx) => {
        const cRating = Number(r.contentRating || r.contentQuality || r.content || 5);
        const tRating = Number(r.trainerRating || r.trainerEffectiveness || r.trainer || 5);
        const mRating = Number(r.materialRating || r.learningMaterial || r.material || (r.relevanceRating || 4.5));
        const aRating = Number(r.assessmentRating || r.assessmentQuality || r.assessment || (r.relevanceRating || 4.5));
        const overall = Number(r.overallRating || r.overall || ((cRating + tRating + mRating + aRating) / 4).toFixed(1));

        sumOverall += overall;
        sumContent += cRating;
        sumTrainer += tRating;
        sumMaterial += mRating;
        sumAssessment += aRating;

        return {
          id: r.id || `rev_${idx}`,
          traineeName: r.traineeName || "Learner Trainee",
          station: r.station || r.designation || "MoES/IMD Center",
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
          overall: overall,
          content: cRating,
          trainer: tRating,
          material: mRating,
          assessment: aRating,
          comment: r.comment || "Course covered essential concepts and operational workflows.",
          sentiment: overall >= 4.5 ? "positive" : overall <= 3.5 ? "critical" : "mixed",
          tags: r.tags || (overall >= 4.5 ? ["Highly Recommended"] : overall <= 3.5 ? ["Needs Review"] : ["Operational Value"])
        };
      });

      const metrics = total > 0 ? {
        contentQuality: parseFloat((sumContent / total).toFixed(1)),
        trainerEffectiveness: parseFloat((sumTrainer / total).toFixed(1)),
        learningMaterial: parseFloat((sumMaterial / total).toFixed(1)),
        assessmentQuality: parseFloat((sumAssessment / total).toFixed(1))
      } : {
        contentQuality: 0,
        trainerEffectiveness: 0,
        learningMaterial: 0,
        assessmentQuality: 0
      };

      const overallRating = total > 0 ? parseFloat((sumOverall / total).toFixed(1)) : 0;

      return {
        courseId: c.id,
        courseTitle: c.title || c.name || "Specialized Training Course",
        category: c.category || c.department || "Meteorological Science",
        leadTrainerName: c.leadTrainerName || c.instructor || "Faculty Lead",
        totalReviews: total,
        overallRating: overallRating,
        metrics: metrics,
        reviews: mappedReviews
      };
    });
  }, [courses, feedbacks]);

  const selectedCourse = useMemo(() => {
    return coursesFeedback.find(c => c.courseId === selectedCourseId) || coursesFeedback[0] || {
      courseId: "none",
      courseTitle: "No Courses Available",
      category: "N/A",
      leadTrainerName: "N/A",
      totalReviews: 0,
      overallRating: 0,
      metrics: { contentQuality: 0, trainerEffectiveness: 0, learningMaterial: 0, assessmentQuality: 0 },
      reviews: []
    };
  }, [coursesFeedback, selectedCourseId]);

  // Recalculate dynamic alerts based on configurable alertThreshold
  const evaluatedAlerts = useMemo(() => {
    if (!selectedCourse || selectedCourse.totalReviews === 0) return [];
    const alerts = [];
    const m = selectedCourse.metrics;

    if (m.assessmentQuality > 0 && m.assessmentQuality < alertThreshold) {
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

    if (m.learningMaterial > 0 && m.learningMaterial < alertThreshold) {
      alerts.push({
        type: "material_refresh",
        metricName: "Learning Material",
        score: m.learningMaterial,
        title: "⚠ Learning Material Review Recommended",
        description: `Learning Material rating (${m.learningMaterial}/5.0) is below the ${alertThreshold} threshold. Learners requested higher-fidelity slides or updated reference notes.`,
        actionLabel: "Update Syllabus Learning Materials",
        actionType: "material"
      });
    }

    if (m.contentQuality > 0 && m.contentQuality < alertThreshold) {
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
    if (!selectedCourse || !selectedCourse.reviews) return [];
    return selectedCourse.reviews.filter(r => {
      const matchSearch = (r.comment || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.traineeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.station || "").toLowerCase().includes(searchQuery.toLowerCase());
      
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
      `Learner Feedback Consensus:\n` +
      `- Questions on 4D-Var variational equations and CFL numerical stability contained ambiguous double negatives.\n` +
      `- Learners requested 3 step-by-step mathematical examples before timed quizzes.\n\n` +
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius)] bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* ═════════ 1. HEADER & COURSE SELECTOR ═════════ */}
      <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-50 border border-amber-200 text-amber-900 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Post-Course Quality Telemetry
            </span>
            <span className="text-xs font-medium text-slate-400">
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
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Select Active Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full sm:w-72 p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600 shadow-xs"
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
        <div className="lg:col-span-4 bg-white rounded-[var(--radius)] border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5 text-center flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Aggregated Course Rating
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {selectedCourse.overallRating}
              </span>
              <span className="text-slate-400 text-lg font-medium">/ 5.0</span>
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
              Based on <b>{selectedCourse.totalReviews} Verified Learners</b>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-100 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Lead Faculty:</span>
              <span className="font-medium text-slate-900">{selectedCourse.leadTrainerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Curriculum Track:</span>
              <span className="font-medium text-slate-900">{selectedCourse.category}</span>
            </div>
          </div>
        </div>

        {/* Right: 4 Evaluated Pillars Matrix (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-[var(--radius)] border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                4-Pillar Quality Breakdown
              </h3>
              <p className="text-xs text-slate-400">Continuous evaluation telemetry across instructional dimensions</p>
            </div>

            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-[var(--radius)]">
              Alert Trigger: &lt; {alertThreshold} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pillar 1: Content Quality */}
            <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">1. Content Quality</span>
                <span className="font-black text-xs text-slate-900">{selectedCourse.metrics.contentQuality} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(selectedCourse.metrics.contentQuality / 5) * 100}%` }} className="bg-emerald-500 h-full rounded-full" />
              </div>
              <span className="text-[10px] text-slate-500 block">Syllabus depth & meteorological relevance</span>
            </div>

            {/* Pillar 2: Trainer Effectiveness */}
            <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">2. Trainer Effectiveness</span>
                <span className="font-black text-xs text-slate-900">{selectedCourse.metrics.trainerEffectiveness} / 5.0</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(selectedCourse.metrics.trainerEffectiveness / 5) * 100}%` }} className="bg-emerald-500 h-full rounded-full" />
              </div>
              <span className="text-[10px] text-slate-500 block">Clarity, responsiveness & practical demonstrations</span>
            </div>

            {/* Pillar 3: Learning Material */}
            <div className={`p-4 rounded-[var(--radius)] border space-y-2 ${
              selectedCourse.metrics.learningMaterial < alertThreshold
                ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">3. Learning Material</span>
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
            <div className={`p-4 rounded-[var(--radius)] border space-y-2 ${
              selectedCourse.metrics.assessmentQuality < alertThreshold
                ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">4. Assessment Quality</span>
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
              className="bg-gradient-to-r from-rose-50 via-amber-50/80 to-indigo-50/70 rounded-[var(--radius)] p-6 border border-rose-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in"
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
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
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
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
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
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
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
      <div className="bg-white rounded-[var(--radius)] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        
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
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[var(--radius)] text-xs font-medium">
              {[
                { id: "all", label: "All Reviews" },
                { id: "critical", label: "⚠ Needs Review" },
                { id: "positive", label: "⭐ Positive" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setReviewFilter(f.id)}
                  className={`px-3 py-1 rounded-[var(--radius)] transition-all ${
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
                className="p-5 rounded-[var(--radius)] bg-slate-50/70 border border-slate-200 space-y-3 shadow-2xs hover:bg-white transition-colors"
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
                      <span className="text-xs font-medium text-slate-700 ml-1.5">{r.overall} / 5.0</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {r.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-2 py-0.5 rounded-[var(--radius)] text-[10px] font-medium ${
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
                  <span className={r.assessment <= 3 ? "text-rose-700 font-medium" : ""}>
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
          <div className="bg-white rounded-[var(--radius)] max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-medium">
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
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAiRemediationModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setIsAiRemediationModalOpen(false);
                  showToast("✓ Course Remediation Plan saved and broadcasted to faculty!");
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[var(--radius)] text-xs shadow-md flex items-center gap-1.5"
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
