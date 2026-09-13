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
  ExternalLink,
  ShieldCheck,
  Check,
  GraduationCap,
  Briefcase,
  Layers,
  Zap,
  Building2
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
      if (res.success && res.recommendations) {
        // Double-check no enrolled courses are in the list
        const filtered = res.recommendations.filter(rec => {
          const match = courses.find(c => c.id === rec.courseId);
          return match && !(match.enrolledTraineeIds || []).includes(currentUser?.id);
        });
        setRecommendations(filtered);
        if (res.source) setAiSource(res.source);
      }
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-[var(--radius)] shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header (Clean Light Theme with AI Accent) */}
        <div className="p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/50 border-b border-slate-200 text-slate-900 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-[var(--radius)] bg-white border border-blue-200 text-blue-600 shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                  AI Capacity Advisor
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-white/80 px-2 py-0.5 rounded-[var(--radius)] border border-slate-200">
                  {aiSource}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Dynamic Course Recommendations
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Multi-factor evaluation personalized for <b className="text-slate-900">{currentUser?.name || "Officer"}</b> across skills, credentials, qualifications & cadre posting.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius)] bg-white/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trainee Evaluated Profile Matrix Strip */}
        <div className="bg-slate-100/80 px-6 py-3 border-b border-slate-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{userDept}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                <span>{userRole}</span>
              </span>
              {userQualifications.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-purple-50 border border-purple-200 text-purple-800 font-medium text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>{userQualifications.length} Qualifications</span>
                </span>
              )}
              {userCertificates.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-amber-50 border border-amber-200 text-amber-800 font-medium text-[11px]">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{userCertificates.length} Certificates</span>
                </span>
              )}
              {userSkills.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{userSkills.length} Skills</span>
                </span>
              )}
            </div>
            <button
              onClick={loadRecommendations}
              disabled={loading}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-[var(--radius)] border border-blue-200 flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Analyzing..." : "Re-evaluate"}</span>
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto shadow-md"></div>
              <p className="text-sm font-black text-slate-800">Synthesizing personalized training recommendations...</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Comparing your active skills, degree qualifications, verified certifications, and operational department against current unenrolled curricula.
              </p>
            </div>
          ) : (
            <>
              {recommendations.length === 0 ? (
                <div className="py-14 bg-white rounded-[var(--radius)] border border-slate-200 text-center space-y-3 p-8 shadow-xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="font-black text-slate-900 text-base">All Recommended Courses Enrolled!</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    You have successfully enrolled in all training curricula matching your current skills and department prerequisites. Continue your active modules or explore the Course Catalog for upcoming nationwide programs.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const courseObj = courses.find(c => c.id === rec.courseId);
                    if (!courseObj) return null;

                    const matchScore = rec.matchScore ?? 85;
                    const scoreBg = matchScore >= 90 ? "bg-emerald-50 text-emerald-800 border-emerald-300" : matchScore >= 80 ? "bg-blue-50 text-blue-800 border-blue-300" : "bg-amber-50 text-amber-800 border-amber-300";

                    return (
                      <div 
                        key={rec.courseId || index}
                        className="p-5 rounded-[var(--radius)] border border-slate-200 hover:border-blue-300 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={courseObj.thumbnail || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800"} 
                              alt={rec.courseTitle || courseObj.title}
                              className="w-16 h-16 rounded-[var(--radius)] object-cover ring-1 ring-slate-200 shrink-0" 
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[var(--radius)]">
                                  {courseObj.code || "TRACK"}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {courseObj.department || "National Academy"}
                                </span>
                              </div>
                              <h3 className="font-black text-slate-900 text-sm mt-1 leading-snug group-hover:text-blue-600 transition-colors">
                                {rec.courseTitle || courseObj.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {courseObj.category || "Operational Track"} • {courseObj.duration || "4 Weeks"}
                              </p>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right shrink-0">
                            <span className={`px-3 py-1.5 border rounded-[var(--radius)] text-xs font-black shadow-2xs inline-flex items-center gap-1 ${scoreBg}`}>
                              <Sparkles className="w-3 h-3" />
                              <span>{matchScore}% Match</span>
                            </span>
                          </div>
                        </div>

                        {/* AI Rationale Box */}
                        <div className="p-3.5 bg-slate-50/80 rounded-[var(--radius)] border border-slate-200 text-xs space-y-2">
                          <div className="flex items-start gap-2">
                            <BrainCircuit className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              <b className="text-slate-900 font-medium">AI Recommendation Rationale:</b> {rec.reason}
                            </p>
                          </div>

                          {rec.careerImpact && (
                            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-800 font-semibold border-t border-slate-200/60">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span><b>Operational Benefit:</b> {rec.careerImpact}</span>
                            </div>
                          )}

                          {Array.isArray(rec.skillGapsAddressed) && rec.skillGapsAddressed.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Target Competencies:</span>
                              {rec.skillGapsAddressed.map((gap, gIdx) => (
                                <span key={gIdx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-[var(--radius)] text-[10px] font-semibold">
                                  {gap}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
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
                              className="px-3.5 py-1.5 rounded-[var(--radius)] border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                            >
                              Overview
                            </button>

                            <button
                              onClick={() => {
                                if (onEnrollCourse) onEnrollCourse(courseObj);
                                onClose();
                              }}
                              className="px-4 py-1.5 rounded-[var(--radius)] font-medium shadow-sm transition-all flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
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
          <span className="text-[11px]">
            AI Course Recommendations automatically adapt as you complete assessments and earn certifications.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-[var(--radius)] text-slate-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

