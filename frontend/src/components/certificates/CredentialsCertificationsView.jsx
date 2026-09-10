import React, { useState } from "react";
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
  ArrowUpRight
} from "lucide-react";

export const CredentialsCertificationsView = ({ currentUser, onOpenCertificate }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Official MoES / IMD Verified Digital Credentials
  const credentialsData = [
    {
      id: "CAP-2026-NWP-9841",
      title: "Advanced Numerical Weather Prediction (NWP) & Data Assimilation",
      category: "nwp",
      division: "Numerical Weather Prediction Division, IMD HQ New Delhi",
      issuedTo: currentUser?.name || "Rahul Sharma",
      issueDate: "15th Feb 2026",
      expiryDate: "Lifetime Verified",
      grade: "Distinction (100%)",
      score: "20/20",
      isDistinction: true,
      credentialUrl: "https://capacityconnect.moes.gov.in/verify/CAP-2026-NWP-9841",
      skillsVerified: [
        "4D-Var Data Assimilation",
        "Sigma Vertical Coordinates",
        "WRF Ensemble Physics",
        "GFS Boundary Conditions"
      ],
      submissionData: {
        score: 20,
        totalMarks: 20,
        percentage: 100,
        submittedAt: "2026-02-15T10:30:00Z"
      }
    },
    {
      id: "CAP-2026-DWR-7712",
      title: "Doppler Weather Radar (DWR) Polarimetric Interpretation & Nowcasting",
      category: "radar",
      division: "Radar Operations & Severe Weather Division, RMC Chennai",
      issuedTo: currentUser?.name || "Rahul Sharma",
      issueDate: "28th Jan 2026",
      expiryDate: "Valid till Jan 2029",
      grade: "Distinction (95%)",
      score: "38/40",
      isDistinction: true,
      credentialUrl: "https://capacityconnect.moes.gov.in/verify/CAP-2026-DWR-7712",
      skillsVerified: [
        "Dual-Polarization (ZDR/KDP)",
        "Hydrometeor Classification",
        "Nyquist Velocity De-aliasing",
        "Severe Mesocyclone Tracking"
      ],
      submissionData: {
        score: 38,
        totalMarks: 40,
        percentage: 95,
        submittedAt: "2026-01-28T14:15:00Z"
      }
    },
    {
      id: "CAP-2026-SAT-6320",
      title: "Satellite Meteorology: INSAT-3DR Multispectral Imaging & Sounder",
      category: "satellite",
      division: "Satellite Meteorology Division, IMD New Delhi",
      issuedTo: currentUser?.name || "Rahul Sharma",
      issueDate: "10th Jan 2026",
      expiryDate: "Lifetime Verified",
      grade: "First Class (85%)",
      score: "17/20",
      isDistinction: false,
      credentialUrl: "https://capacityconnect.moes.gov.in/verify/CAP-2026-SAT-6320",
      skillsVerified: [
        "Thermal Infrared (TIR) Analysis",
        "Cloud Motion Vectors (CMV)",
        "Hydro-Estimator Rainfall (HEM)",
        "Atmospheric Sounder Profiles"
      ],
      submissionData: {
        score: 17,
        totalMarks: 20,
        percentage: 85,
        submittedAt: "2026-01-10T16:45:00Z"
      }
    },
    {
      id: "CAP-2025-CYC-4419",
      title: "Tropical Cyclone Early Warning & Dvorak Technique Protocol",
      category: "warning",
      division: "Cyclone Warning Division (RSMC New Delhi)",
      issuedTo: currentUser?.name || "Rahul Sharma",
      issueDate: "05th Dec 2025",
      expiryDate: "Lifetime Verified",
      grade: "First Class (88%)",
      score: "35/40",
      isDistinction: false,
      credentialUrl: "https://capacityconnect.moes.gov.in/verify/CAP-2025-CYC-4419",
      skillsVerified: [
        "Dvorak T-Number Estimation",
        "Storm Surge Inundation Modeling",
        "RSMC Advisory Dissemination",
        "Track Forecast Ensembles"
      ],
      submissionData: {
        score: 35,
        totalMarks: 40,
        percentage: 87.5,
        submittedAt: "2025-12-05T11:20:00Z"
      }
    },
    {
      id: "CAP-2025-AGR-3108",
      title: "Agrometeorological Advisories & FASAL Crop-Weather Modeling",
      category: "agro",
      division: "Agrimet Division, IMD Pune",
      issuedTo: currentUser?.name || "Rahul Sharma",
      issueDate: "18th Nov 2025",
      expiryDate: "Valid till Nov 2028",
      grade: "Distinction (92%)",
      score: "46/50",
      isDistinction: true,
      credentialUrl: "https://capacityconnect.moes.gov.in/verify/CAP-2025-AGR-3108",
      skillsVerified: [
        "Crop Weather Modeling",
        "Soil Moisture Stress Indices",
        "District Agromet Bulletins",
        "Evapotranspiration Metrics"
      ],
      submissionData: {
        score: 46,
        totalMarks: 50,
        percentage: 92,
        submittedAt: "2025-11-18T09:10:00Z"
      }
    },
    {
      id: "CAP-2025-HYD-1904",
      title: "Flash Flood Guidance System (FFGS) & Hydrometeorological Risk",
      category: "hydro",
      division: "Hydrometeorology Division, IMD HQ",
      issuedTo: currentUser?.name || "Rahul Sharma",
      issueDate: "02nd Oct 2025",
      expiryDate: "Lifetime Verified",
      grade: "First Class (82.5%)",
      score: "33/40",
      isDistinction: false,
      credentialUrl: "https://capacityconnect.moes.gov.in/verify/CAP-2025-HYD-1904",
      skillsVerified: [
        "FFGS Threat Indexing",
        "Rainfall-Runoff Modeling",
        "Catchment Soil Saturation",
        "River Basin Alert Systems"
      ],
      submissionData: {
        score: 33,
        totalMarks: 40,
        percentage: 82.5,
        submittedAt: "2025-10-02T15:00:00Z"
      }
    }
  ];

  const handleCopyLink = (cred) => {
    navigator.clipboard.writeText(cred.credentialUrl);
    setCopiedId(cred.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCredentials = credentialsData.filter(cred => {
    const matchesSearch = cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.skillsVerified.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === "distinction") return matchesSearch && cred.isDistinction;
    if (activeFilter === "nwp") return matchesSearch && cred.category === "nwp";
    if (activeFilter === "radar") return matchesSearch && cred.category === "radar";
    if (activeFilter === "satellite") return matchesSearch && cred.category === "satellite";
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ═════════ TOP HERO ACCREDITATION BANNER ═════════ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#12397e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/50">
        
        {/* Background Decorative Seals */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>
        <div className="absolute right-40 top-0 opacity-15 pointer-events-none">
          <Award className="w-48 h-48 text-amber-300" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Ministry of Earth Sciences • Official Digital Credential Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Certified Professional Accreditations
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Cryptographically verified competency certifications issued under the National Capacity Building Program for Operational Meteorology & Geoscience.
            </p>
          </div>

          {/* Officer Verification Stamp */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3.5 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-[#0a2558] flex items-center justify-center font-black text-xl shadow-md">
              <Award className="w-7 h-7 text-[#0a2558]" />
            </div>
            <div>
              <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Accredited Officer</p>
              <p className="font-extrabold text-sm text-white">{currentUser?.name || "Rahul Sharma"}</p>
              <p className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Digital Signature Verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════ 4 KEY METRIC TILES ═════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{credentialsData.length}</p>
            <p className="text-xs font-bold text-slate-500">Verified Credentials</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 text-amber-600 fill-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-900">3</p>
            <p className="text-xs font-bold text-amber-700">Distinction Honors (90%+)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">24</p>
            <p className="text-xs font-bold text-slate-500">Competencies Cleared</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-purple-900">Tier-1</p>
            <p className="text-xs font-bold text-slate-500">Accreditation Standing</p>
          </div>
        </div>

      </div>

      {/* ═════════ SEARCH & FILTER CONTROLS ═════════ */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search credentials or competency skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "all", label: "All Credentials" },
            { id: "distinction", label: "🌟 Distinction Honors" },
            { id: "nwp", label: "NWP & Modeling" },
            { id: "radar", label: "Radar Systems" },
            { id: "satellite", label: "Satellite & INSAT" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? "bg-[#0a2558] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═════════ CREDENTIALS SHOWCASE GRID ═════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCredentials.map((cred) => {
          const isCopied = copiedId === cred.id;

          return (
            <div
              key={cred.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl group relative overflow-hidden ${
                cred.isDistinction
                  ? "border-amber-300 shadow-amber-50/50 hover:border-amber-400"
                  : "border-slate-200 shadow-sm hover:border-blue-300"
              }`}
            >
              {/* Gold Top Accent Line for Distinction */}
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

                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      ID: {cred.id}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
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
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">ISSUED TO</span>
                    <p className="font-extrabold text-slate-900 text-xs">{cred.issuedTo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">ISSUE DATE</span>
                    <p className="font-bold text-slate-700 text-xs">{cred.issueDate}</p>
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
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200/60 transition-colors"
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
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-md transition-transform hover:scale-[1.02]"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>View Official Certificate</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
