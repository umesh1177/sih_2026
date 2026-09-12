import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  User, 
  ArrowRight, 
  Sparkles,
  Award,
  HelpCircle,
  FileCheck
} from "lucide-react";

export const PrerequisiteCheckModal = ({ 
  isOpen, 
  onClose, 
  course, 
  currentUser, 
  onEnrollSuccess,
  onOpenProfile
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [waiverRequested, setWaiverRequested] = useState(false);
  const [enrollSuccessNotice, setEnrollSuccessNotice] = useState(false);

  if (!isOpen || !course) return null;

  // Prerequisites array safely parsed
  const prerequisites = Array.isArray(course.prerequisites) 
    ? course.prerequisites 
    : (typeof course.prerequisites === "string" ? [course.prerequisites] : ["Basic Atmospheric Sciences", "Meteorological Observations"]);

  // Trainee skills and background safely parsed
  const userSkills = Array.isArray(currentUser?.skills) 
    ? currentUser.skills 
    : (currentUser?.skills ? [currentUser.skills] : []);
  
  const userInterests = Array.isArray(currentUser?.interests)
    ? currentUser.interests
    : [];

  const qualificationsArr = Array.isArray(currentUser?.qualifications)
    ? currentUser.qualifications
    : (currentUser?.qualifications ? [currentUser.qualifications] : []);
  const qualificationsStr = qualificationsArr.join(" ").toLowerCase();
  const departmentStr = (currentUser?.department || "").toLowerCase();

  // Evaluate each prerequisite
  const evaluatedPrereqs = prerequisites.map(prereq => {
    const prereqLower = String(prereq || "").toLowerCase();
    
    // Check direct skill match
    const hasSkillMatch = userSkills.some(s => {
      const sLower = String(s || "").toLowerCase();
      return prereqLower.includes(sLower) || sLower.includes(prereqLower);
    });

    // Check interest match
    const hasInterestMatch = userInterests.some(i => {
      const iLower = String(i || "").toLowerCase();
      return prereqLower.includes(iLower) || iLower.includes(prereqLower);
    });

    // Check degree / qualification match
    const hasDegreeMatch = qualificationsStr.includes("meteorology") || 
      qualificationsStr.includes("physics") || 
      qualificationsStr.includes("tech") ||
      qualificationsStr.includes("m.sc") ||
      qualificationsStr.includes("b.sc") ||
      qualificationsStr.includes("diploma");

    // Check department relevance
    const hasDeptMatch = departmentStr.includes("radar") || 
      departmentStr.includes("cyclone") || 
      departmentStr.includes("nwp") || 
      departmentStr.includes("satellite") || 
      departmentStr.includes("agrimet") ||
      departmentStr.includes("centre") ||
      departmentStr.includes("jaipur") ||
      departmentStr.includes("pune");

    const isSatisfied = hasSkillMatch || hasInterestMatch || (hasDegreeMatch && course.level !== "Advanced") || (hasDeptMatch && hasDegreeMatch);

    return {
      title: prereq,
      isSatisfied,
      matchType: hasSkillMatch ? "Verified Profile Skill" : (hasInterestMatch ? "Specialization Track" : (hasDegreeMatch ? "Academic Qualification" : "Pending Verification"))
    };
  });

  const satisfiedCount = evaluatedPrereqs.filter(p => p.isSatisfied).length;
  // Consider passed if at least 50% satisfied or course is Beginner/Intermediate
  const isEligible = course.level === "Beginner" || satisfiedCount >= Math.ceil(prerequisites.length * 0.5);

  const handleConfirmEnroll = async () => {
    setIsProcessing(true);
    try {
      if (onEnrollSuccess) {
        await onEnrollSuccess(course.id);
      }
      setEnrollSuccessNotice(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Enrollment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestWaiver = () => {
    setWaiverRequested(true);
    setTimeout(() => {
      handleConfirmEnroll();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[var(--radius)] shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className={`p-6 text-white ${isEligible ? "bg-gradient-to-r from-[#0a2558] to-blue-900" : "bg-gradient-to-r from-amber-700 to-amber-900"} flex items-start justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[var(--radius)] bg-white/10 backdrop-blur-md">
              {isEligible ? (
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-200" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                MoES Competency Gatekeeper
              </span>
              <h2 className="text-lg font-semibold tracking-tight mt-0.5">
                {isEligible ? "Prerequisite Evaluation: Qualified" : "Prerequisite Verification Required"}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {/* Course Summary Card */}
          <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
              }}
              className="w-14 h-14 rounded-[var(--radius)] object-cover ring-1 ring-slate-300 shrink-0" 
            />
            <div className="overflow-hidden">
              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {course.code} • {course.level} Level
              </span>
              <h3 className="font-semibold text-slate-900 text-xs mt-1 truncate">{course.title}</h3>
              <p className="text-[11px] text-slate-500">
                Duration: {course.duration} • Department: {course.department}
              </p>
            </div>
          </div>

          {/* Prerequisite Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0a2558]" />
                <span>Required Foundational Skills ({satisfiedCount}/{prerequisites.length} Verified)</span>
              </h4>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isEligible ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {isEligible ? "Criteria Satisfied" : "Partial Alignment"}
              </span>
            </div>

            <div className="space-y-2">
              {evaluatedPrereqs.map((prereq, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-[var(--radius)] border flex items-center justify-between gap-3 text-xs ${
                    prereq.isSatisfied 
                      ? "bg-emerald-50/70 border-emerald-200 text-slate-800" 
                      : "bg-amber-50/70 border-amber-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {prereq.isSatisfied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{prereq.title}</p>
                      <p className="text-[10px] text-slate-500">{prereq.matchType}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                    prereq.isSatisfied ? "bg-emerald-200/60 text-emerald-900" : "bg-amber-200/60 text-amber-900"
                  }`}>
                    {prereq.isSatisfied ? "Satisfied" : "Skill Gap"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Skills Context */}
          <div className="p-3.5 bg-blue-50/50 rounded-[var(--radius)] border border-blue-100 text-xs">
            <p className="text-[11px] font-medium text-slate-700 mb-1.5">Your Registered Officer Competencies:</p>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.length > 0 ? (
                userSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-[#0a2558] border border-blue-200 rounded-[var(--radius)] font-semibold text-[10px]">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic text-[11px]">No custom skills listed in profile</span>
              )}
            </div>
          </div>

          {/* Administrative Approval Gating Alert */}
          {currentUser?.role === "trainee" && currentUser?.status !== "approved" && (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-[var(--radius)] text-rose-950 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Administrative Verification Required to Enroll</span>
              </div>
              <p className="text-xs leading-relaxed">
                Ministry of Earth Sciences regulations mandate that only officers with <b>Administrative Approval</b> can enroll in operational LMS courses.
              </p>
              {currentUser?.status === "rejected" && (
                <div className="p-3 bg-white/90 rounded-[var(--radius)] border border-rose-200 font-medium">
                  <span className="font-medium text-rose-900 block mb-0.5">Admin Rejection Feedback:</span>
                  "{currentUser.rejectionReason || 'Incomplete qualifications or credential verification failure.'}"
                </div>
              )}
              {currentUser?.status === "pending" && (
                <p className="text-[11px] text-amber-800 bg-amber-100/80 p-2.5 rounded-[var(--radius)] border border-amber-200">
                  ⏳ Your officer registration dossier is currently in the review queue. Please wait for Admin concurrence.
                </p>
              )}
            </div>
          )}

          {/* Enrollment Success Notice */}
          {enrollSuccessNotice && (
            <div className="p-4 bg-emerald-500 text-white rounded-[var(--radius)] shadow-md text-xs flex items-center gap-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">Enrollment Confirmed!</h4>
                <p className="text-emerald-100 text-[11px] mt-0.5">
                  You are now officially enrolled in {course.title}. Learning Studio is ready.
                </p>
              </div>
            </div>
          )}

          {/* Status Alert Message (When approved) */}
          {!enrollSuccessNotice && (!currentUser || currentUser.status === "approved") && (
            isEligible ? (
              <div className="p-3 bg-emerald-50 rounded-[var(--radius)] border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <b>Ready for Enrollment:</b> Your scientific background and qualifications qualify you for this program.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-[var(--radius)] border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Prerequisite Skill Gap Detected:</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    This course requires prior meteorological background. You can submit an Officer Waiver Request or update your verified qualifications.
                  </p>
                </div>
              </div>
            )
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-[var(--radius)] border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          {currentUser?.role === "trainee" && currentUser?.status !== "approved" ? (
            <button
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                else onClose();
              }}
              className="px-5 py-2.5 rounded-[var(--radius)] bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-md transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Go to Officer Profile & Resubmit</span>
            </button>
          ) : (
            <>
              {!isEligible && (
                <button
                  onClick={handleRequestWaiver}
                  disabled={isProcessing || waiverRequested}
                  className="px-4 py-2.5 rounded-[var(--radius)] bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>{waiverRequested ? "Waiver Approved!" : "Request Officer Waiver & Enroll"}</span>
                </button>
              )}

              {isEligible && (
                <button
                  onClick={handleConfirmEnroll}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-[var(--radius)] bg-[#0a2558] hover:bg-[#071c42] text-white text-xs font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  )}
                  <span>{isProcessing ? "Verifying..." : "Confirm & Enroll in Course"}</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
