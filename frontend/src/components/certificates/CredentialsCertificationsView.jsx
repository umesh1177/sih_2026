import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  QrCode, 
  Calendar, 
  Building2, 
  FileText, 
  Sparkles, 
  Share2, 
  Copy, 
  Check,
  Star,
  Layers,
  ArrowUpRight,
  FileQuestion,
  Lock,
  Unlock,
  Sliders
} from "lucide-react";
import { api } from "../../services/api";

export const CredentialsCertificationsView = ({ currentUser, onOpenCertificate, onOpenStudio }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      setLoading(true);
      try {
        const [courseRes, subRes] = await Promise.all([
          api.getCourses().catch(() => ({ success: false, courses: [] })),
          currentUser?.id ? api.getTraineeSubmissions(currentUser.id).catch(() => ({ success: false, submissions: [] })) : Promise.resolve({ success: false, submissions: [] })
        ]);

        if (courseRes.success && Array.isArray(courseRes.courses)) {
          setCourses(courseRes.courses);
        }

        const list = [];
        
        // 1. Direct user certificates on profile
        if (currentUser?.certificates && Array.isArray(currentUser.certificates)) {
          currentUser.certificates.forEach((c, idx) => {
            const certId = c.credentialId || c.id || `CC-CERT-${idx + 1}`;
            const pct = c.finalScore || (c.grade && typeof c.grade === "string" && c.grade.includes("%") ? parseInt(c.grade.replace(/\D/g, "")) : 100);
            const isDist = (c.performanceCategory || c.grade || "").toLowerCase().includes("distinction") || pct >= 90;
            list.push({
              id: certId,
              title: c.title || "Course Completion Certificate",
              category: "general",
              division: c.issuer || "Capacity Connect",
              issuedTo: currentUser.name || "Trainee",
              issueDate: c.year || "2026",
              expiryDate: "Verified",
              grade: c.performanceCategory ? `${c.performanceCategory} (${pct}%)` : (c.grade || "Verified Credential"),
              isDistinction: isDist,
              credentialUrl: c.verificationUrl || `${window.location.origin}/?verify=${certId}`,
              skillsVerified: c.skills || ["Operational Competency", "Standard Protocols"],
              submissionData: {
                certificateId: certId,
                score: pct,
                totalMarks: 100,
                percentage: pct,
                performanceCategory: c.performanceCategory,
                grade: c.grade,
                issuer: c.issuer || "Capacity Connect",
                submittedAt: c.issuedAt || new Date().toISOString()
              }
            });
          });
        }

        // 2. Fetch real submissions that generated certificates or passed with qualifying score
        if (subRes.success && Array.isArray(subRes.submissions)) {
          subRes.submissions
            .filter(s => s.certificateGenerated || s.passed || (s.percentage >= 60))
            .forEach(s => {
              const certId = s.certificateId || `CC-CERT-${s.id}`;
              const exists = list.some(item => item.id === certId || item.title === s.quizTitle);
              if (!exists) {
                const isDist = (s.percentage || 0) >= 90;
                list.push({
                  id: certId,
                  title: s.quizTitle || "Subject Assessment Certification",
                  category: (s.quizTitle || "").toLowerCase().includes("radar") ? "radar" : (s.quizTitle || "").toLowerCase().includes("sat") ? "satellite" : "nwp",
                  division: "Capacity Connect Training Directorate",
                  issuedTo: s.traineeName || currentUser?.name || "Trainee",
                  issueDate: new Date(s.submittedAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
                  expiryDate: "Verified",
                  grade: isDist ? `Distinction (${s.percentage}%)` : `Passed (${s.percentage}%)`,
                  score: `${s.score}/${s.totalMarks}`,
                  isDistinction: isDist,
                  credentialUrl: `${window.location.origin}/?verify=${certId}`,
                  skillsVerified: ["Operational Assessment", "Applied Problem Solving", "Technical Verification"],
                  submissionData: {
                    certificateId: certId,
                    score: s.score,
                    totalMarks: s.totalMarks,
                    percentage: s.percentage,
                    submittedAt: s.submittedAt
                  }
                });
              }
            });
        }

        setCertificates(list);
      } catch (err) {
        console.error("Certificates load error:", err);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [currentUser]);

  const handleCopyLink = (cred) => {
    navigator.clipboard.writeText(cred.credentialUrl);
    setCopiedId(cred.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const distinctionCount = useMemo(() => certificates.filter(c => c.isDistinction).length, [certificates]);
  const totalSkillsCount = useMemo(() => {
    const all = certificates.flatMap(c => c.skillsVerified || []);
    return new Set(all).size;
  }, [certificates]);

  const filteredCredentials = useMemo(() => {
    return certificates.filter(cred => {
      const matchesSearch = cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cred.skillsVerified || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeFilter === "distinction") return matchesSearch && cred.isDistinction;
      if (activeFilter === "nwp") return matchesSearch && cred.category === "nwp";
      if (activeFilter === "radar") return matchesSearch && cred.category === "radar";
      if (activeFilter === "satellite") return matchesSearch && cred.category === "satellite";
      return matchesSearch;
    });
  }, [certificates, searchQuery, activeFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ═════════ TOP HERO ACCREDITATION BANNER ═════════ */}
      <div className="relative overflow-hidden bg-white rounded-[var(--radius)] p-6 sm:p-8 text-slate-800 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Learning & Competency Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            View your completed courses, earned certificates and verified competencies.
          </p>
        </div>

        {/* Learner Verification Stamp */}
        <div className="bg-slate-50 border border-slate-200 rounded-[var(--radius)] p-4 flex items-center gap-3.5 shrink-0 shadow-xs z-10">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shadow-xs">
            <Award className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Learner</p>
            <p className="font-bold text-sm text-slate-900">{currentUser?.name || "Trainee"}</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Learner
            </p>
          </div>
        </div>
      </div>

      {/* ═════════ 4 KEY METRIC TILES ═════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-[var(--radius)] p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-blue-50 text-blue-700 flex items-center justify-center font-medium">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{certificates.length}</p>
            <p className="text-xs font-medium text-slate-500">Certificates Earned</p>
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-amber-50 text-amber-700 flex items-center justify-center font-medium">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-800">{distinctionCount}</p>
            <p className="text-xs font-medium text-slate-500">Distinction Honors (90%+)</p>
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-emerald-50 text-emerald-700 flex items-center justify-center font-medium">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalSkillsCount}</p>
            <p className="text-xs font-medium text-slate-500">Competencies Verified</p>
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-purple-50 text-purple-700 flex items-center justify-center font-medium">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900">{certificates.length > 0 ? "Completed" : "In Progress"}</p>
            <p className="text-xs font-medium text-slate-500">Learning Standing</p>
          </div>
        </div>

      </div>

      {/* ═════════ VERIFIED ACCREDITATIONS & CERTIFICATES SHOWCASE ═════════ */}
      <div className="space-y-6">
        {/* ═════════ SEARCH & FILTER CONTROLS ═════════ */}
        <div className="bg-white rounded-[var(--radius)] p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search credentials or competency skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Credentials" },
              { id: "distinction", label: "🌟 Distinction Honors" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═════════ CREDENTIALS SHOWCASE GRID ═════════ */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading certified credentials...</p>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-[var(--radius)] border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">No Official Certificates Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Complete training courses and score qualifying marks on scheduled assessments to earn digitally verified certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCredentials.map((cred) => {
            const isCopied = copiedId === cred.id;

            return (
              <div
                key={cred.id}
                className={`bg-white rounded-[var(--radius)] p-6 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl group relative overflow-hidden ${
                  cred.isDistinction
                    ? "border-amber-300 shadow-amber-50/50 hover:border-amber-400"
                    : "border-slate-200 shadow-sm hover:border-blue-300"
                }`}
              >
                {cred.isDistinction && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
                )}

                <div className="space-y-4">
                  
                  {/* Header: Badge & Credential Serial ID */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                          cred.isDistinction
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-blue-100 text-blue-900 border border-blue-200"
                        }`}
                      >
                        {cred.isDistinction ? <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />}
                        <span>{cred.grade}</span>
                      </span>

                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        ID: {cred.id}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-[var(--radius)] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Issuing Division */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {cred.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cred.division}</span>
                    </p>
                  </div>

                  {/* Issuer Info & Verification Validity */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-[var(--radius)] border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">ISSUED TO</span>
                      <p className="font-extrabold text-slate-900 text-xs">{cred.issuedTo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">ISSUE DATE</span>
                      <p className="font-medium text-slate-700 text-xs">{cred.issueDate}</p>
                    </div>
                  </div>

                  {/* Verified Competencies */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      VERIFIED COMPETENCIES & MODULES
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cred.skillsVerified.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 rounded-[var(--radius)] text-[11px] font-semibold border border-slate-200/60 transition-colors"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleCopyLink(cred)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs transition-colors"
                    title="Copy verification link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isCopied ? "Copied!" : "Verify URL"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenCertificate(
                        cred.submissionData,
                        cred.title,
                        cred.issuedTo
                      );
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-[1.02]"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>View Certificate</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
