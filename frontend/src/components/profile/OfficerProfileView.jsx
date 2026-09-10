import React, { useState } from "react";
import { 
  User, 
  Award, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Save, 
  Building2, 
  Mail, 
  MapPin, 
  BookOpen, 
  Send,
  Layers,
  Check,
  BadgeCheck
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../common/PageHeader";

export const OfficerProfileView = ({ onOpenCertificate }) => {
  const { currentUser, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New item inputs for each structured section
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newQualInput, setNewQualInput] = useState("");
  const [newExpInput, setNewExpInput] = useState("");

  const parseArray = (val, defaults) => {
    if (Array.isArray(val) && val.length > 0) return val.filter(Boolean);
    if (typeof val === "string" && val.trim().length > 0) {
      if (val.includes("•")) return val.split("•").map(s => s.trim()).filter(Boolean);
      if (val.includes(",")) return val.split(",").map(s => s.trim()).filter(Boolean);
      return [val.trim()];
    }
    return defaults;
  };

  const [form, setForm] = useState({
    name: currentUser?.name || "Rahul Sharma",
    email: currentUser?.email || "rahul.sharma@imd.gov.in",
    department: currentUser?.department || "Numerical Weather Prediction (NWP) Division",
    designation: currentUser?.designation || "Scientist 'B' (Trainee)",
    station: currentUser?.station || "National Weather Forecasting Centre, IMD HQ New Delhi",
    cadreId: currentUser?.cadreId || "MOES-MET-2026-4491",
    phone: currentUser?.phone || "+91 98765 43210",
    skills: parseArray(currentUser?.skills, [
      "Python for Meteorology",
      "Synoptic Analysis",
      "QGIS",
      "Data Assimilation",
      "Meso-scale WRF",
      "Doppler Radar Interpretation",
      "INSAT-3DR Satellite Processing"
    ]),
    qualifications: parseArray(currentUser?.qualifications, [
      "M.Sc. Atmospheric Science & Meteorology (Pune University)",
      "B.Tech Computer Science & Environmental Engineering (IIT Delhi)",
      "Advanced Diploma in Operational Numerical Weather Prediction (IMD Pune)"
    ]),
    experience: parseArray(currentUser?.experience, [
      "National Weather Forecasting Centre New Delhi (3 Yrs - 4D-Var Data Assimilation)",
      "Cyclone Warning Centre Visakhapatnam (1.5 Yrs - Radar & Dvorak Tracking)",
      "Doppler Weather Radar Station Chennai (1 Yr - Severe Weather Nowcasting)"
    ]),
    interests: currentUser?.interests?.join(", ") || "Monsoon Dynamics, High-Resolution NWP Modeling, Machine Learning in Nowcasting, Tropical Cyclogenesis",
    bio: currentUser?.bio || "Meteorological scientist specializing in operational numerical weather prediction, high-performance computing ensembles, and polarimetric radar data assimilation under the Ministry of Earth Sciences.",
    certificates: currentUser?.certificates || [
      { title: "Advanced Numerical Weather Prediction (NWP)", issuer: "IMD Training Division", year: "2026", grade: "Distinction (100%)" },
      { title: "Doppler Weather Radar (DWR) Polarimetric Interpretation", issuer: "RMC Chennai", year: "2026", grade: "Distinction (95%)" },
      { title: "Satellite Meteorology: INSAT-3DR Imager", issuer: "IMD HQ New Delhi", year: "2026", grade: "First Class (85%)" }
    ]
  });

  const [newCert, setNewCert] = useState({ title: "", issuer: "", year: "2026", grade: "Verified" });

  // Competency Skills handlers
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!form.skills.includes(newSkillInput.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  // Qualifications handlers
  const handleAddQual = () => {
    if (!newQualInput.trim()) return;
    if (!form.qualifications.includes(newQualInput.trim())) {
      setForm(prev => ({ ...prev, qualifications: [...prev.qualifications, newQualInput.trim()] }));
    }
    setNewQualInput("");
  };

  const handleRemoveQual = (qualToRemove) => {
    setForm(prev => ({ ...prev, qualifications: prev.qualifications.filter(q => q !== qualToRemove) }));
  };

  // Experience handlers
  const handleAddExp = () => {
    if (!newExpInput.trim()) return;
    if (!form.experience.includes(newExpInput.trim())) {
      setForm(prev => ({ ...prev, experience: [...prev.experience, newExpInput.trim()] }));
    }
    setNewExpInput("");
  };

  const handleRemoveExp = (expToRemove) => {
    setForm(prev => ({ ...prev, experience: prev.experience.filter(e => e !== expToRemove) }));
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    if (!newCert.title) return;
    setForm(prev => ({ ...prev, certificates: [...prev.certificates, { ...newCert }] }));
    setNewCert({ title: "", issuer: "", year: "2026", grade: "Verified" });
  };

  const handleRemoveCertificate = (index) => {
    setForm(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));
  };

  const handleSaveProfile = async (submitForApproval = false) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name: form.name,
        department: form.department,
        designation: form.designation,
        station: form.station,
        cadreId: form.cadreId,
        phone: form.phone,
        qualifications: form.qualifications,
        experience: form.experience,
        skills: form.skills,
        interests: typeof form.interests === "string" ? form.interests.split(",").map(s => s.trim()).filter(Boolean) : form.interests,
        bio: form.bio,
        certificates: form.certificates
      };

      if (currentUser?.id) {
        await api.updateProfile(currentUser.id, payload);
        if (submitForApproval) {
          await api.submitProfileForApproval(currentUser.id);
        }
      }

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert(submitForApproval 
        ? "Professional profile submitted for Administrative KYC & Competency Verification." 
        : "Officer Profile details saved and synced to database.");
    } catch (err) {
      alert("Failed updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Officer Service Profile & Competency Dossier"
        description="Official personnel credentials, verified technical competencies, qualifications, and operational postings under MoES/IMD."
        badge={{ text: "Personnel Dossier", variant: "blue" }}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveProfile(false)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs border border-[#D9E2EC] transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>{loading ? "Saving..." : saveSuccess ? "Saved ✓" : "Save Changes"}</span>
            </button>
            <button
              onClick={() => handleSaveProfile(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Verification</span>
            </button>
          </div>
        }
      />

      <div className="px-6 pb-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Officer Hero Card */}
        <div className="bg-white rounded-xl p-6 border border-[#D9E2EC] shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-slate-100">
            
            <div className="flex items-center gap-4">
              {/* Officer Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#155E75] text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-xs">
                {form.name.split(" ").map(n => n[0]).join("") || "RS"}
              </div>

              {/* Name & Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {form.name}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MoES Verified Officer</span>
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#155E75] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{form.designation}</span>
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{form.station}</span>
                </p>
              </div>
            </div>

            {/* Cadre ID */}
            <div className="p-3 bg-slate-50 rounded-lg border border-[#D9E2EC] text-xs shrink-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">NATIONAL CADRE ID</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{form.cadreId}</span>
            </div>

          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">Division</span>
              <p className="font-semibold text-slate-800 text-xs truncate">{form.department}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">Official Email</span>
              <p className="font-semibold text-slate-800 text-xs truncate">{form.email}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">Qualifications</span>
              <p className="font-bold text-slate-800 text-xs">{form.qualifications.length} Registered Degrees</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-0.5">Competencies</span>
              <p className="font-bold text-[#1D4ED8] text-xs">{form.skills.length} Active Skills</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: METEOROLOGICAL COMPETENCIES */}
        <div className="bg-white rounded-xl p-6 border border-[#D9E2EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Meteorological Competencies & Operational Skills
                </h2>
                <p className="text-xs text-slate-500">
                  Technical competencies mapped to the National Meteorological Capacity Matrix.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {form.skills.length} Active
            </span>
          </div>

          {/* Skills Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {form.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-950 rounded-md text-xs font-medium border border-blue-200"
              >
                <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-red-600 ml-1 transition-colors text-sm font-bold"
                  title="Remove skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add Skill Input */}
          <div className="flex items-center gap-2 pt-2 max-w-md">
            <input
              type="text"
              placeholder="Add new competency (e.g. WRF Data Assimilation)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              className="flex-1 px-3 py-2 bg-slate-50 rounded-md border border-[#D9E2EC] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-md text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: QUALIFICATIONS */}
        <div className="bg-white rounded-xl p-6 border border-[#D9E2EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Academic & Scientific Qualifications
                </h2>
                <p className="text-xs text-slate-500">
                  University degrees, postgraduate diplomas, and verified academic credentials.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              {form.qualifications.length} Registered
            </span>
          </div>

          {/* Qualifications Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {form.qualifications.map((qual, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/70 text-teal-950 rounded-md text-xs font-medium border border-teal-200"
              >
                <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>{qual}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQual(qual)}
                  className="text-slate-400 hover:text-red-600 ml-1 transition-colors text-sm font-bold"
                  title="Remove qualification"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add Qualification Input */}
          <div className="flex items-center gap-2 pt-2 max-w-md">
            <input
              type="text"
              placeholder="Add qualification (e.g. M.Sc. Meteorology)..."
              value={newQualInput}
              onChange={(e) => setNewQualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddQual())}
              className="flex-1 px-3 py-2 bg-slate-50 rounded-md border border-[#D9E2EC] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddQual}
              className="px-3.5 py-2 bg-[#0F766E] hover:bg-teal-800 text-white font-semibold rounded-md text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: WORK EXPERIENCE */}
        <div className="bg-white rounded-xl p-6 border border-[#D9E2EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Operational Postings & Field Experience
                </h2>
                <p className="text-xs text-slate-500">
                  Operational shifts, regional forecasting centres, and field deployment records.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {form.experience.length} Postings
            </span>
          </div>

          {/* Experience Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {form.experience.map((exp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-800 rounded-md text-xs font-medium border border-[#D9E2EC]"
              >
                <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>{exp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExp(exp)}
                  className="text-slate-400 hover:text-red-600 ml-1 transition-colors text-sm font-bold"
                  title="Remove posting"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add Experience Input */}
          <div className="flex items-center gap-2 pt-2 max-w-md">
            <input
              type="text"
              placeholder="Add posting (e.g. Cyclone Warning Centre Visakhapatnam)..."
              value={newExpInput}
              onChange={(e) => setNewExpInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExp())}
              className="flex-1 px-3 py-2 bg-slate-50 rounded-md border border-[#D9E2EC] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddExp}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* SECTION 4: BIO & INTERESTS */}
        <div className="bg-white rounded-xl p-6 border border-[#D9E2EC] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scientific Bio & Specialized Research Areas</h3>
              <p className="text-xs text-slate-500">Official profile summary visible to department heads and faculty leads</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Scientific Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full p-2.5 bg-slate-50 rounded-md border border-[#D9E2EC] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Research Domains & Interests</label>
              <textarea
                rows={3}
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                className="w-full p-2.5 bg-slate-50 rounded-md border border-[#D9E2EC] text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: VERIFIED CERTIFICATES */}
        <div className="bg-white rounded-xl p-6 border border-[#D9E2EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Accreditations & External Certifications</h3>
                <p className="text-xs text-slate-500">Documented courses, technical exams, and training certifications</p>
              </div>
            </div>
          </div>

          {/* Certificate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {form.certificates.map((cert, cIdx) => (
              <div key={cIdx} className="p-3.5 bg-slate-50 rounded-lg border border-[#D9E2EC] space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[10px] font-semibold">
                      {cert.grade || "Verified"}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{cert.year}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 mt-1.5 leading-tight">{cert.title}</h4>
                  <p className="text-[11px] text-slate-500">{cert.issuer}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onOpenCertificate && onOpenCertificate({ score: 20, totalMarks: 20, percentage: 100 }, cert.title, form.name)}
                    className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
                  >
                    View Credential →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(cIdx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Certificate Row */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-[#D9E2EC] flex flex-col md:flex-row items-center gap-2.5">
            <input
              type="text"
              placeholder="Certificate Title..."
              value={newCert.title}
              onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
              className="flex-1 w-full p-2 bg-white rounded-md border border-[#D9E2EC] text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Issuing Authority..."
              value={newCert.issuer}
              onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
              className="w-full md:w-48 p-2 bg-white rounded-md border border-[#D9E2EC] text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Year"
              value={newCert.year}
              onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
              className="w-full md:w-20 p-2 bg-white rounded-md border border-[#D9E2EC] text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCertificate}
              className="w-full md:w-auto px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-md text-xs shrink-0 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
