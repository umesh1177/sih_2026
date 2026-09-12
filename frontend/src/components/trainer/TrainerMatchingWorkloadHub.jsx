import React, { useState, useEffect } from "react";
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  Filter, 
  Search, 
  ArrowRight, 
  Layers, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Building2, 
  SlidersHorizontal, 
  Info,
  Check,
  Flame,
  UserCheck,
  ChevronRight,
  RefreshCw,
  Zap,
  HelpCircle
} from "lucide-react";
import { api } from "../../services/api";

export const TrainerMatchingWorkloadHub = ({ 
  currentUser, 
  onAssignToCourse = null,
  onOpenCreateCourse = null
}) => {
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState("all"); // "all" | "cold-start" | "workload-warning" | "optimal" | "high-match"
  const [simulatedSubject, setSimulatedSubject] = useState("Doppler Weather Radar Interpretation & Nowcasting");
  const [selectedTrainerDossier, setSelectedTrainerDossier] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [assignmentSuccessMsg, setAssignmentSuccessMsg] = useState(null);

  // Configurable thresholds for workload calculation
  const [thresholds, setThresholds] = useState({
    maxCoursesHighLoad: 3,
    maxLearnersHighLoad: 120,
    maxAssessmentsHighLoad: 4,
    competencyHighMatchCutoff: 70
  });

  const DOMAIN_PRESETS = [
    "Doppler Weather Radar Interpretation & Nowcasting",
    "Numerical Weather Prediction & WRF Modeling",
    "Tropical Cyclogenesis & Storm Surge Inundation",
    "Agrometeorology & Crop Weather Advisory (Fasal)",
    "Satellite Radiance Assimilation & INSAT-3DR Products",
    "Seismological Network & Earthquake Early Warning"
  ];

  const fetchWorkloads = async () => {
    setLoading(true);
    try {
      const res = await api.getTrainersWorkload();
      if (res.success && (res.workloads || res.workload)) {
        setWorkloads(res.workloads || res.workload || []);
      } else {
        const sRes = await api.suggestTrainers(simulatedSubject);
        if (sRes.success && sRes.suggestedTrainers) {
          setWorkloads(sRes.suggestedTrainers || []);
        } else {
          setWorkloads([]);
        }
      }
    } catch (err) {
      console.error("Failed fetching trainer workloads:", err);
      setWorkloads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, [simulatedSubject]);

  const handleSimulateSubjectChange = async (subjName) => {
    setSimulatedSubject(subjName);
    setLoading(true);
    try {
      const res = await api.suggestTrainers(subjName);
      if (res.success && res.suggestedTrainers) {
        setWorkloads(res.suggestedTrainers || []);
      } else {
        setWorkloads([]);
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setWorkloads([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering trainers
  const filteredTrainers = workloads.filter(t => {
    // Search query filter
    const matchesSearch = searchQuery === "" || 
      t.trainerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Tab filter
    if (activeFilterTab === "cold-start") return t.isColdStart;
    if (activeFilterTab === "workload-warning") return t.workloadLevel === "High" || t.recommendationTone === "warning";
    if (activeFilterTab === "optimal") return t.workloadLevel === "Optimal" && !t.isColdStart;
    if (activeFilterTab === "high-match") return (t.matchScore || 0) >= thresholds.competencyHighMatchCutoff;

    return true;
  });

  const coldStartCount = workloads.filter(w => w.isColdStart).length;
  const workloadWarningCount = workloads.filter(w => w.workloadLevel === "High" || w.recommendationTone === "warning").length;
  const optimalCount = workloads.filter(w => w.workloadLevel === "Optimal" && !w.isColdStart).length;

  const handleAssignFaculty = (trainer) => {
    setAssignmentSuccessMsg(`${trainer.trainerName} successfully shortlisted and matched for "${simulatedSubject}"!`);
    setTimeout(() => setAssignmentSuccessMsg(null), 4500);
    if (onAssignToCourse) onAssignToCourse(trainer, simulatedSubject);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ═════════ 1. HERO BANNER: RULES 17 & 18 TRAINER MATCHING ENGINE ═════════ */}
      <div className="bg-gradient-to-r from-[#0B3475] via-[#0D3F8D] to-[#08285C] rounded-[var(--radius)] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              RULES 17 & 18 ENFORCED
            </span>
            <span className="text-xs text-blue-200">
              Cold-Start Prevention • Real-Time Workload Balancing Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Faculty Matching & Workload Intelligence Hub
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
            Multi-dimensional trainer matching engine that eliminates artificial cold-start scores for new faculty (Rule 17) and calculates composite operational workload before course delegation (Rule 18).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-[var(--radius)] text-xs backdrop-blur-md transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-300" />
            <span>Workload Thresholds</span>
          </button>

          {onOpenCreateCourse && (
            <button
              onClick={onOpenCreateCourse}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-[var(--radius)] text-xs shadow-lg transition-transform hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          )}

          <button
            onClick={fetchWorkloads}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-[var(--radius)] border border-white/10 transition-colors"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-300" : ""}`} />
          </button>
        </div>
      </div>

      {/* ═════════ 2. DUAL-RULE ARCHITECTURAL PILLARS (RULES 17 & 18 EXPLAINER) ═════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Rule 17 Card: Cold-Start */}
        <div className="p-5 rounded-[var(--radius)] bg-emerald-50/70 border border-emerald-200/90 shadow-2xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
              Rule 17 • Cold-Start Handling
            </span>
            <span className="text-[11px] font-medium text-emerald-800">Zero Artificial Scores</span>
          </div>

          <h3 className="font-black text-emerald-950 text-sm flex items-center gap-2">
            <span>🌱 New Faculty Cold-Start Protocol</span>
          </h3>

          <p className="text-xs text-emerald-900/80 leading-relaxed">
            If a trainer has <b>no previous trainee feedback</b> or <b>assessment history</b>, the system will <b>NEVER assign an artificial performance score</b>. Instead, it displays <code>Performance history unavailable</code> and matches based on:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px] font-medium text-emerald-900">
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-emerald-100 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Competency</span>
            </div>
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-emerald-100 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WMO / Certifications</span>
            </div>
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-emerald-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Field Experience</span>
            </div>
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-emerald-100 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Qualifications</span>
            </div>
          </div>
        </div>

        {/* Rule 18 Card: Workload & Availability */}
        <div className="p-5 rounded-[var(--radius)] bg-amber-50/70 border border-amber-200/90 shadow-2xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase tracking-wider">
              Rule 18 • Workload Balancing
            </span>
            <span className="text-[11px] font-medium text-amber-800">Beyond "Available = true"</span>
          </div>

          <h3 className="font-black text-amber-950 text-sm flex items-center gap-2">
            <span>⚖️ 4-Factor Workload Composite Formula</span>
          </h3>

          <p className="text-xs text-amber-900/80 leading-relaxed">
            Faculty availability is never a binary boolean. The engine calculates active operational load and issues recommendations with realistic workload warnings:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px] font-medium text-amber-900">
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-amber-100 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Current Course Load</span>
            </div>
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-amber-100 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Active Learners</span>
            </div>
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-amber-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Scheduled Exams</span>
            </div>
            <div className="p-2 bg-white/80 rounded-[var(--radius)] border border-amber-100 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Declared Availability</span>
            </div>
          </div>
        </div>

      </div>

      {/* ═════════ 3. INTERACTIVE SUBJECT SIMULATION BAR ═════════ */}
      <div className="bg-white p-5 rounded-[var(--radius)] border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0B3475] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Live Domain Matching Simulator
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Test Subject-to-Faculty Matching:</span>
            </h3>
          </div>

          <div className="w-full sm:w-auto flex-1 max-w-md">
            <input
              type="text"
              value={simulatedSubject}
              onChange={(e) => handleSimulateSubjectChange(e.target.value)}
              placeholder="Type meteorology domain (e.g. Doppler Radar, NWP WRF, Cyclone)..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium text-slate-900 focus:bg-white focus:border-[#0B3475] outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Quick Presets:</span>
          {DOMAIN_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulateSubjectChange(p)}
              className={`px-3 py-1.5 rounded-[var(--radius)] font-medium text-xs shrink-0 transition-all ${
                simulatedSubject === p
                  ? "bg-[#0B3475] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {p.split(" & ")[0]}
            </button>
          ))}
        </div>
      </div>

      {assignmentSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-[var(--radius)] text-xs font-medium flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignmentSuccessMsg}</span>
        </div>
      )}

      {/* ═════════ 4. FILTER TABS & SEARCH BAR ═════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-[var(--radius)] border border-slate-200/90 shadow-2xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All Faculty (${workloads.length})`, count: workloads.length },
            { id: "cold-start", label: `🌱 Cold-Start Rule 17 (${coldStartCount})`, count: coldStartCount },
            { id: "workload-warning", label: `⚠ Workload Warnings (${workloadWarningCount})`, count: workloadWarningCount },
            { id: "optimal", label: `🌟 Optimal Availability (${optimalCount})`, count: optimalCount },
            { id: "high-match", label: `Top Match (≥${thresholds.competencyHighMatchCutoff}%)`, count: workloads.filter(w => (w.matchScore || 0) >= thresholds.competencyHighMatchCutoff).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilterTab(tab.id)}
              className={`px-3.5 py-2 rounded-[var(--radius)] text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                activeFilterTab === tab.id
                  ? "bg-[#0B3475] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty, skills, cadre..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0B3475]"
          />
        </div>
      </div>

      {/* ═════════ 5. FACULTY MATCHING & WORKLOAD GRID ═════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredTrainers.map((t) => {
          const isHighMatch = (t.matchScore || 0) >= thresholds.competencyHighMatchCutoff;
          const isWarning = t.recommendationTone === "warning" || t.workloadLevel === "High";

          return (
            <div
              key={t.trainerId}
              className={`p-6 rounded-[var(--radius)] bg-white border transition-all duration-200 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md ${
                t.isColdStart 
                  ? "border-emerald-200 ring-1 ring-emerald-100/80" 
                  : isWarning 
                  ? "border-amber-300 ring-1 ring-amber-100" 
                  : "border-slate-200"
              }`}
            >
              <div className="space-y-4">
                
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"}
                      alt={t.trainerName}
                      className="w-14 h-14 rounded-[var(--radius)] object-cover ring-2 ring-slate-100 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {t.trainerName}
                        </h3>
                        {/* Domain Match Pill */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          (t.matchScore || 0) >= 80
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : (t.matchScore || 0) >= 40
                            ? "bg-blue-100 text-blue-900 border-blue-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {t.matchScore ? `${t.matchScore}% Match` : "Domain Matched"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium mt-0.5">{t.designation}</p>
                      <p className="text-[11px] text-slate-400">{t.department}</p>
                    </div>
                  </div>

                  {/* Cold-Start vs Established Badge */}
                  <div>
                    {t.isColdStart ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <span>🌱 Cold-Start Faculty</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>Established Faculty</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ─── RULE 17: PERFORMANCE HISTORY SECTION ─── */}
                <div className="p-3.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rule 17 Performance Signal:</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {t.isColdStart ? "Zero Feedback History" : `${t.feedbackCount} Reviews Recorded`}
                    </span>
                  </div>

                  {t.isColdStart ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-[var(--radius)] bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 font-mono">
                        Performance history unavailable
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Matched on verified credentials & qualifications
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-[var(--radius)] bg-amber-100 text-amber-900 font-black text-xs flex items-center gap-1">
                          ★ {t.performanceScore} / 5.0
                        </span>
                        <span className="text-xs text-slate-700 font-medium">
                          {t.feedbackCount} Trainee Evaluations
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {t.assessmentHistoryCount} Scheduled Assessments
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── RULE 18: WORKLOAD & AVAILABILITY TELEMETRY ─── */}
                <div className="p-3.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rule 18 Workload Calculation:</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      t.workloadLevel === "High"
                        ? "bg-rose-100 text-rose-900"
                        : t.workloadLevel === "Moderate"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}>
                      {t.workloadStatus}
                    </span>
                  </div>

                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-[var(--radius)] border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Course Load</span>
                      <b className="text-slate-900 font-black text-sm">{t.currentCourseLoad}</b>
                      <span className="text-[9px] text-slate-400 block">Active Tracks</span>
                    </div>
                    <div className="p-2 bg-white rounded-[var(--radius)] border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Active Learners</span>
                      <b className="text-slate-900 font-black text-sm">{t.activeLearners}</b>
                      <span className="text-[9px] text-slate-400 block">Trainees Enrolled</span>
                    </div>
                    <div className="p-2 bg-white rounded-[var(--radius)] border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Assessments</span>
                      <b className="text-slate-900 font-black text-sm">{t.scheduledAssessments}</b>
                      <span className="text-[9px] text-slate-400 block">Exams On Deck</span>
                    </div>
                    <div className="p-2 bg-white rounded-[var(--radius)] border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Availability</span>
                      <b className={`font-black text-xs ${
                        t.declaredAvailability === "Limited" 
                          ? "text-rose-700" 
                          : t.declaredAvailability === "Moderate" 
                          ? "text-amber-700" 
                          : "text-emerald-700"
                      }`}>
                        {t.declaredAvailability}
                      </b>
                      <span className="text-[9px] text-slate-400 block">Declared Status</span>
                    </div>
                  </div>
                </div>

                {/* ─── 4 VERIFIED MATCHING PILLARS ─── */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Verified Competencies & Credentials:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(t.skills || []).slice(0, 4).map((sk, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-[var(--radius)] font-medium text-[10px] border border-blue-100">
                        {sk}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-[var(--radius)] font-medium text-[10px]">
                      {t.matchedCredentials?.qualification?.split("(")[0]}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-[var(--radius)] font-medium text-[10px] border border-emerald-100">
                      {t.matchedCredentials?.experienceDisplay || "10+ Yrs Exp"}
                    </span>
                  </div>
                </div>

                {/* ─── FINAL RECOMMENDATION BANNER ─── */}
                <div className={`p-3.5 rounded-[var(--radius)] border text-xs flex items-start gap-2.5 ${
                  t.recommendationTone === "warning"
                    ? "bg-rose-50/80 border-rose-200 text-rose-950"
                    : t.recommendationTone === "cold-start"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : t.recommendationTone === "balanced"
                    ? "bg-amber-50/80 border-amber-200 text-amber-950"
                    : "bg-blue-50/80 border-blue-200 text-blue-950"
                }`}>
                  <div className="mt-0.5">
                    {t.recommendationTone === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : t.recommendationTone === "cold-start" ? (
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs">
                        Final Recommendation:
                      </span>
                      <span className="font-black underline">
                        {t.finalRecommendation}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-snug">
                      {t.recommendationReason}
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTrainerDossier(t)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Inspect Credentials Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAssignFaculty(t)}
                  className={`px-4 py-2 font-extrabold rounded-[var(--radius)] text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                    t.recommendationTone === "warning"
                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      : "bg-[#0B3475] hover:bg-[#08285C] text-white"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Match & Designate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═════════ 6. TRAINER CREDENTIALS DOSSIER MODAL ═════════ */}
      {selectedTrainerDossier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-[var(--radius)] max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 text-xs text-slate-800">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedTrainerDossier.avatar}
                  alt={selectedTrainerDossier.trainerName}
                  className="w-14 h-14 rounded-[var(--radius)] object-cover ring-2 ring-[#0B3475]/20 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {selectedTrainerDossier.trainerName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                      {selectedTrainerDossier.isColdStart ? "Cold-Start Faculty" : "Established"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedTrainerDossier.designation}</p>
                  <p className="text-[11px] text-slate-400">{selectedTrainerDossier.department}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrainerDossier(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[var(--radius)]"
              >
                ✕
              </button>
            </div>

            {/* Rule 17 Cold Start Breakdown */}
            <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Matching Pillars (Rule 17)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Academic Qualification</span>
                  <p className="font-medium text-slate-900">{selectedTrainerDossier.matchedCredentials?.qualification}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Operational Experience</span>
                  <p className="font-medium text-slate-900">{selectedTrainerDossier.matchedCredentials?.experienceDisplay}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Performance Signal</span>
                  <p className="font-medium text-slate-900">{selectedTrainerDossier.performanceDisplay}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Active Workload</span>
                  <p className="font-medium text-slate-900">{selectedTrainerDossier.workloadStatus} ({selectedTrainerDossier.currentCourseLoad} Courses • {selectedTrainerDossier.activeLearners} Cadets)</p>
                </div>
              </div>
            </div>

            {/* Active Courses List */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900">Assigned Curriculum & Subjects:</h4>
              {selectedTrainerDossier.assignedCourses?.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedTrainerDossier.assignedCourses.map((c, i) => (
                    <div key={i} className="p-2.5 bg-blue-50/60 rounded-[var(--radius)] border border-blue-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-blue-950">{c.title}</span>
                      <span className="text-[10px] font-mono text-blue-600 font-medium">{c.code || "ACTIVE"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-slate-400 text-center text-xs">
                  No currently assigned active courses. Full bandwidth available.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTrainerDossier(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
              >
                Close Dossier
              </button>
              <button
                onClick={() => {
                  handleAssignFaculty(selectedTrainerDossier);
                  setSelectedTrainerDossier(null);
                }}
                className="px-5 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-medium rounded-[var(--radius)] text-xs shadow-md"
              >
                Designate as Faculty Lead
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════ 7. CONFIGURABLE WORKLOAD THRESHOLDS MODAL ═════════ */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[var(--radius)] max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0B3475]" />
                <span>Workload & Cold-Start Rule Configuration</span>
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Configure organizational thresholds for faculty workload warnings (Rule 18) and competency matching cutoffs.
            </p>

            <div className="space-y-4">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  High Load Course Limit (Courses per Faculty):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={thresholds.maxCoursesHighLoad}
                  onChange={(e) => setThresholds(p => ({ ...p, maxCoursesHighLoad: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  High Load Trainee Capacity Threshold:
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={thresholds.maxLearnersHighLoad}
                  onChange={(e) => setThresholds(p => ({ ...p, maxLearnersHighLoad: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Competency Top-Match Cutoff (%):
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={thresholds.competencyHighMatchCutoff}
                  onChange={(e) => setThresholds(p => ({ ...p, competencyHighMatchCutoff: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-medium rounded-[var(--radius)] text-xs"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
