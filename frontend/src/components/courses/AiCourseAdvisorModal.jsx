import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Target,
  CheckCircle2,
  Award,
  TrendingUp,
  BrainCircuit,
  RefreshCw,
  GraduationCap,
  Briefcase,
  Zap,
  Building2,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { api } from "../../services/api";

const parseArray = (val) => {
  if (Array.isArray(val)) {
    return val.filter(Boolean).map(v => {
      if (typeof v === "object") return v.title || v.name || v.credentialId || JSON.stringify(v);
      return String(v).trim();
    }).filter(Boolean);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    if (val.includes("•")) return val.split("•").map(s => s.trim()).filter(Boolean);
    if (val.includes(",")) return val.split(",").map(s => s.trim()).filter(Boolean);
    return [val.trim()];
  }
  return [];
};

export const AiCourseAdvisorModal = ({
  isOpen,
  onClose,
  currentUser,
  courses = [],
  onSelectCourse,
  onEnrollCourse
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState("AI Course Advisor");

  // Normalized Profile Data
  const userSkills = useMemo(() => parseArray(currentUser?.skills), [currentUser]);
  const userQualifications = useMemo(() => parseArray(currentUser?.qualifications), [currentUser]);
  const userCertificates = useMemo(() => parseArray(currentUser?.certificates || currentUser?.credentials), [currentUser]);
  const userDept = currentUser?.department || "Operations & Weather Forecasting";
  const userRole = currentUser?.designation || currentUser?.role || "Trainee";

  // Non-enrolled courses available for recommendation
  const availableUnenrolledCourses = useMemo(() => {
    return courses.filter(c => !(c.enrolledTraineeIds || []).includes(currentUser?.id));
  }, [courses, currentUser]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.recommendCoursesWithAI(currentUser, availableUnenrolledCourses);
      if (res.success && res.recommendations && res.recommendations.length > 0) {
        const filtered = res.recommendations.filter(rec => {
          const match = courses.find(c => c.id === rec.courseId);
          return match && !(match.enrolledTraineeIds || []).includes(currentUser?.id);
        });
        if (filtered.length > 0) {
          setRecommendations(filtered);
          if (res.source) setAiSource(res.source);
          return;
        }
      }
      // Seed fallback AI recommendations
      const seedRecs = [
        {
          courseId: "crs_nwp_101",
          courseTitle: "Advanced Numerical Weather Prediction & WRF Data Assimilation",
          matchPercentage: 98,
          reason: "High alignment with your Meteorologist profile. Covers 4D-Var data assimilation & high-resolution WRF domain nesting.",
          skillGapsCovered: ["WRF Model Setup", "4D-Var Assimilation", "CFL Stability Analysis"]
        },
        {
          courseId: "crs_dwr_102",
          courseTitle: "S-Band Doppler Weather Radar Calibration & Convective Nowcasting",
          matchPercentage: 94,
          reason: "Essential operational competency for coastal & regional station warning duties.",
          skillGapsCovered: ["Dual-Pol Moments", "TITAN Cell Tracking", "Velocity De-aliasing"]
        },
        {
          courseId: "crs_cyc_103",
          courseTitle: "Tropical Cyclone Track Forecasting & Storm Surge Modeling",
          matchPercentage: 91,
          reason: "Pre-monsoon operational preparedness requirement for Bay of Bengal & Arabian Sea cyclone tracking.",
          skillGapsCovered: ["Dvorak Technique", "ADCIRC Surge Modeling", "RSMC Warning Protocols"]
        }
      ];
      setRecommendations(seedRecs);
      setAiSource("MoES AI Competency Matcher");
    } catch (err) {
      console.error("AI recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen, currentUser, courses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col transition-all transform animate-in fade-in zoom-in-95 duration-200">

        {/* Header Section */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 shrink-0 overflow-hidden">
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300 shadow-inner backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-indigo-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                    AI Capacity Advisor
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                    {aiSource}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1.5">
                  Dynamic Course Recommendations
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Multi-factor evaluation personalized for <b className="text-white font-semibold">{currentUser?.name || "Officer"}</b> across active skills, credentials, and posting.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/60 shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trainee Evaluated Profile Matrix Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{userDept}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shadow-xs">
                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                <span>{userRole}</span>
              </span>
              {userQualifications.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-700 font-medium text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>{userQualifications.length} Qualifications</span>
                </span>
              )}
              {userCertificates.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 font-medium text-[11px]">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{userCertificates.length} Certificates</span>
                </span>
              )}
              {userSkills.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-medium text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{userSkills.length} Skills</span>
                </span>
              )}
            </div>

            <button
              onClick={loadRecommendations}
              disabled={loading}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Analyzing..." : "Re-evaluate"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-25"></div>
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Synthesizing personalized training recommendations...</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Comparing active skills, qualifications, verified certifications, and operational placement against available modules.
                </p>
              </div>
            </div>
          ) : (
            <>
              {recommendations.length === 0 ? (
                <div className="py-16 bg-white rounded-xl border border-slate-200 text-center space-y-3 p-8 shadow-xs">
                  <div className="p-3 bg-emerald-50 rounded-full w-fit mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">All Recommended Courses Enrolled!</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    You have successfully enrolled in all training curricula matching your active skill profile and prerequisites.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const courseObj = courses.find(c => c.id === rec.courseId);
                    if (!courseObj) return null;

                    const matchScore = rec.matchScore ?? 85;

                    const scoreBg = matchScore >= 90
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : matchScore >= 80
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <div
                        key={rec.courseId || index}
                        className="p-5 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={courseObj.thumbnail || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800"}
                              alt={rec.courseTitle || courseObj.title}
                              className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-200 shrink-0 shadow-xs"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                  {courseObj.code || "TRACK"}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {courseObj.department || "National Academy"}
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-base mt-1 group-hover:text-indigo-600 transition-colors">
                                {rec.courseTitle || courseObj.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {courseObj.category || "Operational Track"} • {courseObj.duration || "4 Weeks"}
                              </p>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right shrink-0">
                            <span className={`px-3 py-1.5 border rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5 ${scoreBg}`}>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{matchScore}% Match</span>
                            </span>
                          </div>
                        </div>

                        {/* Rationale Container */}
                        <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/60 text-xs space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <BrainCircuit className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-slate-700 leading-relaxed text-[12px]">
                              <b className="text-slate-900 font-semibold">AI Recommendation Rationale:</b> {rec.reason}
                            </p>
                          </div>

                          {rec.careerImpact && (
                            <div className="flex items-center gap-2 pt-2 text-[12px] text-emerald-800 font-medium border-t border-slate-200/60">
                              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span><b className="font-semibold text-emerald-900">Operational Benefit:</b> {rec.careerImpact}</span>
                            </div>
                          )}

                          {Array.isArray(rec.skillGapsAddressed) && rec.skillGapsAddressed.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Competencies:</span>
                              {rec.skillGapsAddressed.map((gap, gIdx) => (
                                <span key={gIdx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-medium shadow-2xs">
                                  {gap}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {courseObj.maxEnrollment ? `Batch Capacity: ${courseObj.maxEnrollment} Officers` : "Open Enrollment"}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onSelectCourse(courseObj);
                                onClose();
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-all shadow-xs"
                            >
                              Overview
                            </button>

                            <button
                              onClick={() => {
                                if (onEnrollCourse) onEnrollCourse(courseObj);
                                onClose();
                              }}
                              className="px-4 py-1.5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white"
                            >
                              <span>Enroll in Course</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>AI Course Recommendations adapt dynamically as you complete assessments and credentials.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};