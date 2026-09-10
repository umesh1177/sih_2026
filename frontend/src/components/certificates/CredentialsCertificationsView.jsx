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
  Share2, 
  Copy, 
  Check,
  Star,
  Layers,
  ArrowUpRight,
  BadgeCheck
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

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
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Official Digital Credential Registry"
        description="Tamper-evident, cryptographically verified competency certifications issued under the MoES / IMD National Capacity Building Program."
        badge={{ text: "Official Accreditations", variant: "teal" }}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D9E2EC] rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
            <BadgeCheck className="w-4 h-4 text-[#1D4ED8]" />
            <span>Officer: {currentUser?.name || "Rahul Sharma"}</span>
          </div>
        }
      />

      <div className="px-6 pb-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Verified Credentials"
            value={credentialsData.length}
            icon={Award}
            iconBg="bg-blue-50"
            iconColor="text-[#1D4ED8]"
            trend="Lifetime verified"
          />
          <StatCard
            label="Distinction Honors"
            value="3"
            icon={Star}
            iconBg="bg-amber-50"
            iconColor="text-[#B45309]"
            trend="Score ≥ 90%"
          />
          <StatCard
            label="Competencies Cleared"
            value="24"
            icon={Layers}
            iconBg="bg-teal-50"
            iconColor="text-[#0F766E]"
            trend="Verified capabilities"
          />
          <StatCard
            label="Accreditation Standing"
            value="Tier-1"
            icon={ShieldCheck}
            iconBg="bg-emerald-50"
            iconColor="text-[#15803D]"
            trend="Full clearance"
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-lg p-3.5 border border-[#D9E2EC] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search credential title or verified skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-md border border-[#D9E2EC] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Credentials" },
              { id: "distinction", label: "Distinction Honors" },
              { id: "nwp", label: "NWP & Modeling" },
              { id: "radar", label: "Radar Systems" },
              { id: "satellite", label: "Satellite & INSAT" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeFilter === tab.id
                    ? "bg-[#1D4ED8] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCredentials.map((cred) => {
            const isCopied = copiedId === cred.id;

            return (
              <div
                key={cred.id}
                className="bg-white rounded-xl p-5 border border-[#D9E2EC] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  
                  {/* Header: Badge & Credential Serial ID */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          cred.isDistinction
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "bg-blue-50 text-blue-900 border border-blue-200"
                        }`}
                      >
                        {cred.isDistinction ? <Star className="w-3.5 h-3.5 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />}
                        <span>{cred.grade}</span>
                      </span>

                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        {cred.id}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Issuing Division */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {cred.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cred.division}</span>
                    </p>
                  </div>

                  {/* Issuer Info & Verification Validity */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">ISSUED TO</span>
                      <p className="font-bold text-slate-800 text-xs">{cred.issuedTo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">ISSUE DATE</span>
                      <p className="font-medium text-slate-600 text-xs">{cred.issueDate}</p>
                    </div>
                  </div>

                  {/* Verified Competencies */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      VERIFIED COMPETENCIES
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cred.skillsVerified.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60"
                        >
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleCopyLink(cred)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors"
                    title="Copy verification link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isCopied ? "Copied" : "Copy URL"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenCertificate(
                        cred.submissionData,
                        cred.title,
                        cred.issuedTo
                      );
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-md text-xs transition-colors shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Official Certificate</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
