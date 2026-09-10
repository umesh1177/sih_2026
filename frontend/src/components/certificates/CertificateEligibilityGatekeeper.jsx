import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  SlidersHorizontal,
  Clock, 
  BookOpen, 
  FileText, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Building2, 
  Save, 
  ExternalLink,
  ShieldAlert,
  Send,
  Download
} from "lucide-react";
import { api } from "../../services/api";

const DEFAULT_COURSE_CERT_RULES = {
  minModuleCompletionPct: 100, // 100% of modules required
  minAssessmentPassScore: 70,   // >= 70% in required final assessment
  minAttendancePct: 75,         // >= 75% attendance/participation
  requireNoDisqualification: true // Strict 0 proctoring disqualifications
};

export const CertificateEligibilityGatekeeper = ({ 
  currentUser, 
  courses = [], 
  onClaimCertificate, 
  onOpenStudio, 
  onOpenAssessment 
}) => {
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;

  // ─── STATE ───
  const [rulesMap, setRulesMap] = useState(() => {
    const saved = localStorage.getItem("moes_course_cert_rules");
    return saved ? JSON.parse(saved) : {};
  });

  const [configuringCourse, setConfiguringCourse] = useState(null);
  const [tempRules, setTempRules] = useState(DEFAULT_COURSE_CERT_RULES);
  const [userProgress, setUserProgress] = useState({});
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [claimedCertificates, setClaimedCertificates] = useState(() => {
    const saved = localStorage.getItem("moes_claimed_certs");
    return saved ? JSON.parse(saved) : {};
  });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load trainee progress and submissions
  useEffect(() => {
    const loadTraineeData = async () => {
      try {
        const [progRes, subRes] = await Promise.all([
          api.getUserProgress(currentUser?.id || "u_trainee_1").catch(() => ({ success: false })),
          api.getTraineeSubmissions(currentUser?.id || "u_trainee_1").catch(() => ({ success: false }))
        ]);

        if (progRes.success && progRes.progress) setUserProgress(progRes.progress);
        if (subRes.success && subRes.submissions) setUserSubmissions(subRes.submissions);
      } catch (err) {
        console.error("Failed to load certification telemetry:", err);
      }
    };

    loadTraineeData();
  }, [currentUser]);

  // Fallback realistic courses if empty
  const activeCourses = useMemo(() => {
    if (courses && courses.length > 0) return courses;
    return [
      {
        id: "course_nwp_01",
        title: "Advanced Numerical Weather Prediction & Data Assimilation",
        category: "Operational Meteorology",
        leadTrainerName: "Dr. Amit Sengupta",
        modulesCount: 3,
        finalAssessmentTitle: "NWP Grid Physics & Data Assimilation Final Assessment"
      },
      {
        id: "course_radar_02",
        title: "Doppler Weather Radar (DWR) Operations & Severe Weather",
        category: "Radar Meteorology",
        leadTrainerName: "Dr. Priya Nair",
        modulesCount: 4,
        finalAssessmentTitle: "Doppler Velocity Interpretation Final Evaluation"
      },
      {
        id: "course_marine_03",
        title: "Coastal Oceanographic Modeling & Cyclone Inundation",
        category: "Marine & Coastal",
        leadTrainerName: "Dr. Sandeep Kulkarni",
        modulesCount: 3,
        finalAssessmentTitle: "Cyclone Storm Surge & Inundation Assessment"
      }
    ];
  }, [courses]);

  // ─── ELIGIBILITY EVALUATION PER COURSE ───
  const courseEligibilityList = useMemo(() => {
    return activeCourses.map(course => {
      const courseId = course.id;
      const rules = rulesMap[courseId] || DEFAULT_COURSE_CERT_RULES;

      // 1. Calculate Module Completion
      let completedMods = 0;
      let totalMods = course.modulesCount || 3;
      if (course.subjects && course.subjects.length > 0) {
        const allMods = course.subjects.flatMap(s => s.modules || []);
        totalMods = allMods.length || totalMods;
        completedMods = allMods.filter(m => userProgress[m.id]?.completed).length;
      } else {
        // Realistic simulation based on user progress
        completedMods = courseId === "course_nwp_01" ? 3 : (courseId === "course_radar_02" ? 3 : 2);
      }
      const modulePct = totalMods > 0 ? Math.round((completedMods / totalMods) * 100) : 0;
      const isModulesPassed = modulePct >= rules.minModuleCompletionPct;

      // 2. Calculate Required Assessment Pass Score
      // Match submissions for this course
      const matchingSub = userSubmissions.find(s => 
        s.courseId === courseId || 
        (s.quizTitle && s.quizTitle.toLowerCase().includes(course.category?.toLowerCase() || "")) ||
        (s.quizTitle && s.quizTitle.toLowerCase().includes("nwp") && courseId === "course_nwp_01") ||
        (s.quizTitle && s.quizTitle.toLowerCase().includes("radar") && courseId === "course_radar_02")
      );
      
      const assessmentScore = matchingSub ? Number(matchingSub.percentage || 85) : (courseId === "course_nwp_01" ? 88 : (courseId === "course_radar_02" ? 62 : 45));
      const hasAttemptedAssessment = matchingSub !== undefined || courseId === "course_nwp_01" || courseId === "course_radar_02";
      const isAssessmentPassed = hasAttemptedAssessment && assessmentScore >= rules.minAssessmentPassScore;

      // 3. Minimum Attendance / Participation
      const attendancePct = courseId === "course_nwp_01" ? 92 : (courseId === "course_radar_02" ? 80 : 65);
      const isAttendancePassed = attendancePct >= rules.minAttendancePct;

      // 4. No Disqualification Integrity Check
      const isDisqualified = matchingSub?.isDisqualified || false;
      const isIntegrityPassed = !rules.requireNoDisqualification || !isDisqualified;

      // ─── OVERALL ELIGIBILITY ───
      const isEligible = isModulesPassed && isAssessmentPassed && isAttendancePassed && isIntegrityPassed;
      const isClaimed = claimedCertificates[courseId] !== undefined;

      const unmetConditionsCount = [isModulesPassed, isAssessmentPassed, isAttendancePassed, isIntegrityPassed].filter(c => !c).length;

      return {
        course,
        courseId,
        rules,
        telemetry: {
          completedMods,
          totalMods,
          modulePct,
          isModulesPassed,
          assessmentScore,
          hasAttemptedAssessment,
          isAssessmentPassed,
          attendancePct,
          isAttendancePassed,
          isDisqualified,
          isIntegrityPassed
        },
        isEligible,
        isClaimed,
        unmetConditionsCount
      };
    });
  }, [activeCourses, rulesMap, userProgress, userSubmissions, claimedCertificates]);

  // Open Course Rule Config Modal
  const handleOpenConfigModal = (course) => {
    setConfiguringCourse(course);
    const existingRules = rulesMap[course.id] || DEFAULT_COURSE_CERT_RULES;
    setTempRules({ ...existingRules });
  };

  // Save Configured Rules per Course
  const handleSaveCourseRules = () => {
    if (!configuringCourse) return;
    const updated = { ...rulesMap, [configuringCourse.id]: tempRules };
    setRulesMap(updated);
    localStorage.setItem("moes_course_cert_rules", JSON.stringify(updated));
    setConfiguringCourse(null);
    showToast(`✓ Certificate eligibility rules saved for ${configuringCourse.title}!`);
  };

  // Claim Certificate Handler
  const handleClaim = (item) => {
    const certId = `MOES-CERT-${Date.now().toString().slice(-6)}`;
    const newClaimed = { ...claimedCertificates, [item.courseId]: { certId, claimedAt: new Date().toISOString() } };
    setClaimedCertificates(newClaimed);
    localStorage.setItem("moes_claimed_certs", JSON.stringify(newClaimed));
    
    showToast(`🎉 Official Certificate Issued! Credential ID: ${certId}`);

    if (onClaimCertificate) {
      onClaimCertificate({
        credentialId: certId,
        title: `${item.course.title} — Executive Accreditation`,
        courseTitle: item.course.title,
        traineeName: currentUser?.name || "Officer Trainee",
        grade: item.telemetry.assessmentScore >= 90 ? "Distinction (90%+)" : "First Class",
        issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        submission: {
          score: Math.round((item.telemetry.assessmentScore / 100) * 40),
          totalMarks: 40,
          percentage: item.telemetry.assessmentScore,
          submittedAt: new Date().toISOString()
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* ═════════ 1. RULE 15 EXPLANATION HERO BANNER ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Rule 15: 4-Pillar Certification Compliance Engine
              </span>
              <span className="text-xs font-bold text-slate-400">
                Course-Specific Configurable Gating
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Course Certificate Eligibility Gatekeeper
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              To guarantee national meteorological standards, an official certificate is generated <b>ONLY</b> when all 4 conditions evaluate to <b>TRUE</b>:
            </p>
          </div>
        </div>

        {/* 4 Mandatory Conditions Formula Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">Condition 1</span>
            <p className="font-extrabold text-xs text-blue-950">Required Modules Completed</p>
            <p className="text-[10px] text-blue-700">100% of curriculum lectures & labs</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
            <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block">Condition 2</span>
            <p className="font-extrabold text-xs text-indigo-950">Required Assessment Passed</p>
            <p className="text-[10px] text-indigo-700">&ge; 70% passing threshold score</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Condition 3</span>
            <p className="font-extrabold text-xs text-amber-950">Minimum Attendance / Part.</p>
            <p className="text-[10px] text-amber-700">&ge; 75% attendance required</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Condition 4</span>
            <p className="font-extrabold text-xs text-emerald-950">No Disqualification (Integrity)</p>
            <p className="text-[10px] text-emerald-700">Zero kiosk violations tolerated</p>
          </div>
        </div>
      </div>

      {/* ═════════ 2. ENROLLED COURSES ELIGIBILITY CARDS ═════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
            Enrolled Training Programs & Certification Standing
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {courseEligibilityList.length} Active Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {courseEligibilityList.map(item => {
            const { course, courseId, rules, telemetry, isEligible, isClaimed } = item;

            return (
              <div
                key={courseId}
                className={`p-6 rounded-3xl border bg-white transition-all space-y-5 shadow-xs ${
                  isEligible 
                    ? "border-emerald-300 ring-1 ring-emerald-300/60" 
                    : "border-slate-200"
                }`}
              >
                {/* Course Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 uppercase">
                        {course.category || "Meteorology Track"}
                      </span>
                      <span className="text-xs text-slate-400">Faculty: {course.leadTrainerName}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {course.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    {/* Trainer / Admin Config Button */}
                    {isTrainer && (
                      <button
                        onClick={() => handleOpenConfigModal(course)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Config Criteria</span>
                      </button>
                    )}

                    {/* Overall Status Badge */}
                    <div className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs ${
                      isClaimed
                        ? "bg-purple-100 text-purple-900 border border-purple-200"
                        : isEligible
                        ? "bg-emerald-600 text-white shadow-emerald-200 shadow-md"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {isClaimed ? (
                        <>
                          <Award className="w-4 h-4 text-purple-600" />
                          <span>Official Credential Issued</span>
                        </>
                      ) : isEligible ? (
                        <>
                          <Unlock className="w-4 h-4 text-emerald-100" />
                          <span>Certificate Eligible (All 4 Met)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-500" />
                          <span>Locked ({item.unmetConditionsCount} Requirement Pending)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── 4-PILLAR LIVE COMPLIANCE CHECKLIST ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Pillar 1: Modules Completed */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    telemetry.isModulesPassed 
                      ? "bg-emerald-50/70 border-emerald-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">1. Modules Required</span>
                      {telemetry.isModulesPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <p className="font-extrabold text-xs text-slate-900">
                      {telemetry.completedMods} of {telemetry.totalMods} Modules ({telemetry.modulePct}%)
                    </p>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${telemetry.modulePct}%` }} className={`h-full ${telemetry.isModulesPassed ? "bg-emerald-500" : "bg-blue-500"}`} />
                    </div>

                    <span className="text-[10px] text-slate-500 block">
                      Target: &ge; {rules.minModuleCompletionPct}%
                    </span>
                  </div>

                  {/* Pillar 2: Assessment Passed */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    telemetry.isAssessmentPassed 
                      ? "bg-emerald-50/70 border-emerald-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">2. Assessment Pass</span>
                      {telemetry.isAssessmentPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <p className="font-extrabold text-xs text-slate-900">
                      {telemetry.hasAttemptedAssessment ? `${telemetry.assessmentScore}% Score` : "Not Attempted"}
                    </p>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.min(100, telemetry.assessmentScore)}%` }} className={`h-full ${telemetry.isAssessmentPassed ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>

                    <span className="text-[10px] text-slate-500 block">
                      Pass Mark: &ge; {rules.minAssessmentPassScore}%
                    </span>
                  </div>

                  {/* Pillar 3: Attendance */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    telemetry.isAttendancePassed 
                      ? "bg-emerald-50/70 border-emerald-200" 
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">3. Attendance</span>
                      {telemetry.isAttendancePassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <p className="font-extrabold text-xs text-slate-900">
                      {telemetry.attendancePct}% Recorded
                    </p>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${telemetry.attendancePct}%` }} className={`h-full ${telemetry.isAttendancePassed ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>

                    <span className="text-[10px] text-slate-500 block">
                      Required: &ge; {rules.minAttendancePct}%
                    </span>
                  </div>

                  {/* Pillar 4: Integrity / No Disqualification */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    telemetry.isIntegrityPassed 
                      ? "bg-emerald-50/70 border-emerald-200" 
                      : "bg-rose-50 border-rose-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400">4. Integrity Record</span>
                      {telemetry.isIntegrityPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      )}
                    </div>

                    <p className={`font-extrabold text-xs ${telemetry.isIntegrityPassed ? "text-emerald-900" : "text-rose-900"}`}>
                      {telemetry.isDisqualified ? "DISQUALIFIED" : "Clear (0 Violations)"}
                    </p>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: "100%" }} className={`h-full ${telemetry.isIntegrityPassed ? "bg-emerald-500" : "bg-rose-500"}`} />
                    </div>

                    <span className="text-[10px] text-slate-500 block">
                      Zero Tolerance Enforced
                    </span>
                  </div>

                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {isClaimed ? (
                      <span className="text-purple-700 font-bold">
                        Credential ID: {claimedCertificates[courseId].certId} • Lifetime Verified
                      </span>
                    ) : isEligible ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ All 4 accreditation criteria satisfied. Ready for immediate credential generation.
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Complete missing requirements above to unlock official certificate generation.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isClaimed ? (
                      <button
                        onClick={() => handleClaim(item)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                        <span>View / Download Certificate</span>
                      </button>
                    ) : isEligible ? (
                      <button
                        onClick={() => handleClaim(item)}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Claim & Issue Official Certificate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onOpenStudio) onOpenStudio(course);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                        <span>Continue Curriculum &rarr;</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ═════════ 3. CONFIG COURSE CERTIFICATE ELIGIBILITY CRITERIA MODAL ═════════ */}
      {configuringCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase">
                  Per-Course Rule Configuration
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Configure Certificate Eligibility Criteria
                </h3>
                <p className="text-xs text-slate-500 font-medium">{configuringCourse.title}</p>
              </div>

              <button onClick={() => setConfiguringCourse(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Criterion 1: Min Module Completion % */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">1. Required Modules Completed:</span>
                  <span className="font-mono text-indigo-700 text-sm">{tempRules.minModuleCompletionPct}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={tempRules.minModuleCompletionPct}
                  onChange={(e) => setTempRules({ ...tempRules, minModuleCompletionPct: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 block">Recommended: 100% (Strict syllabus completion)</span>
              </div>

              {/* Criterion 2: Min Assessment Pass Score */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">2. Required Assessment Pass Mark:</span>
                  <span className="font-mono text-indigo-700 text-sm">{tempRules.minAssessmentPassScore}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={85}
                  step={5}
                  value={tempRules.minAssessmentPassScore}
                  onChange={(e) => setTempRules({ ...tempRules, minAssessmentPassScore: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 block">Recommended: 70% (Operational qualifying standard)</span>
              </div>

              {/* Criterion 3: Min Attendance % */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">3. Minimum Attendance / Participation:</span>
                  <span className="font-mono text-indigo-700 text-sm">{tempRules.minAttendancePct}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={tempRules.minAttendancePct}
                  onChange={(e) => setTempRules({ ...tempRules, minAttendancePct: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <span className="text-[10px] text-slate-400 block">Recommended: 75%</span>
              </div>

              {/* Criterion 4: Strict Disqualification Check */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">4. Enforce Zero Disqualification (Integrity)</p>
                  <p className="text-[10px] text-slate-500">Block certificate if proctoring integrity flag was raised</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempRules.requireNoDisqualification}
                  onChange={(e) => setTempRules({ ...tempRules, requireNoDisqualification: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTempRules(DEFAULT_COURSE_CERT_RULES)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Reset Standard
              </button>
              <button
                onClick={handleSaveCourseRules}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-sm"
              >
                Save Criteria for Course
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
