import React, { useState } from "react";
import { 
  User, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Send,
  Layers,
  FileCheck2,
  Share2,
  Check,
  Compass
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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
        ? "✅ Professional profile submitted for Administrative KYC & Competency Verification!" 
        : "✅ Officer Profile details saved and synced to database!");
    } catch (err) {
      alert("Failed updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ═════════ TOP HERO PROFILE IDENTIFICATION CARD ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Background Decorative Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/80 via-indigo-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="flex items-center gap-5">
            {/* Officer Avatar with Verification Ring */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#0a2558] to-[#1e40af] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-white">
                {form.name.split(" ").map(n => n[0]).join("") || "RS"}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white shadow-md" title="Verified Officer">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Name & Designation */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {form.name}
                </h1>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MoES Verified Officer</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm font-extrabold text-blue-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{form.designation}</span>
              </p>

              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{form.station}</span>
              </p>
            </div>
          </div>

          {/* Cadre ID & Quick Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">NATIONAL CADRE ID</span>
              <span className="font-mono font-black text-slate-900 text-sm">{form.cadreId}</span>
            </div>

            <button
              onClick={() => handleSaveProfile(false)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-2xl text-xs shadow-md transition-transform hover:scale-105"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>{loading ? "Saving..." : saveSuccess ? "Saved to DB ✓" : "Save Changes"}</span>
            </button>
          </div>

        </div>

        {/* Quick Officer Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Division</span>
            <p className="font-extrabold text-slate-800 text-xs mt-0.5">{form.department}</p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Official Email</span>
            <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">{form.email}</p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Qualifications</span>
            <p className="font-black text-purple-900 text-xs mt-0.5">{form.qualifications.length} Degrees/Diplomas</p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Competencies Earned</span>
            <p className="font-black text-blue-900 text-xs mt-0.5">{form.skills.length} Active Skills</p>
          </div>
        </div>

      </div>

      {/* ═════════ SECTION 1: METEOROLOGICAL COMPETENCIES & OPERATIONAL SKILLS (EXACT MATCH SHARED PHOTO) ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold shadow-sm">
              <Layers className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Meteorological Competencies & Operational Skills
              </h2>
              <p className="text-xs text-slate-500">
                Verified technical competencies mapped to the National Weather Service matrix.
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-blue-900 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm">
            {form.skills.length} Active Skills
          </span>
        </div>

        {/* Skills Chips (Exact Match Shared Photo Style) */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {form.skills.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/70 text-blue-950 rounded-2xl text-xs font-bold border border-blue-200 shadow-sm group hover:border-blue-300 hover:bg-blue-100/80 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-red-600 ml-1 transition-colors text-sm font-black"
                title="Remove skill"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add Skill Input */}
        <div className="flex items-center gap-2 pt-2 max-w-lg">
          <input
            type="text"
            placeholder="Add new competency (e.g. Meso-scale Modeling, WRF-Hydro)..."
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
            className="flex-1 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

      </div>

      {/* ═════════ SECTION 2: ACADEMIC & SCIENTIFIC QUALIFICATIONS (STRUCTURED CHIPS MATCHING PHOTO) ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Academic & Scientific Qualifications
              </h2>
              <p className="text-xs text-slate-500">
                University degrees, postgraduate diplomas, and formal credentials for competency mapping.
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-purple-900 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-100 shadow-sm">
            {form.qualifications.length} Qualifications
          </span>
        </div>

        {/* Qualifications Chips */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {form.qualifications.map((qual, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50/70 text-purple-950 rounded-2xl text-xs font-bold border border-purple-200 shadow-sm group hover:border-purple-300 hover:bg-purple-100/80 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>{qual}</span>
              <button
                type="button"
                onClick={() => handleRemoveQual(qual)}
                className="text-slate-400 hover:text-red-600 ml-1 transition-colors text-sm font-black"
                title="Remove qualification"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add Qualification Input */}
        <div className="flex items-center gap-2 pt-2 max-w-lg">
          <input
            type="text"
            placeholder="Add qualification (e.g. Ph.D. Meteorology (IIT Delhi), M.Sc. Physics)..."
            value={newQualInput}
            onChange={(e) => setNewQualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddQual())}
            className="flex-1 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
          />
          <button
            type="button"
            onClick={handleAddQual}
            className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

      </div>

      {/* ═════════ SECTION 3: OPERATIONAL POSTINGS & WORK EXPERIENCE (STRUCTURED CHIPS MATCHING PHOTO) ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold shadow-sm">
              <Briefcase className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Operational Postings & Work Experience
              </h2>
              <p className="text-xs text-slate-500">
                Operational shifts, meteorological forecasting centres, and field station deployments.
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm">
            {form.experience.length} Postings Logged
          </span>
        </div>

        {/* Experience Chips */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {form.experience.map((exp, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50/70 text-amber-950 rounded-2xl text-xs font-bold border border-amber-200 shadow-sm group hover:border-amber-300 hover:bg-amber-100/80 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>{exp}</span>
              <button
                type="button"
                onClick={() => handleRemoveExp(exp)}
                className="text-slate-400 hover:text-red-600 ml-1 transition-colors text-sm font-black"
                title="Remove posting"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add Experience Input */}
        <div className="flex items-center gap-2 pt-2 max-w-lg">
          <input
            type="text"
            placeholder="Add operational posting (e.g. Cyclone Warning Centre Visakhapatnam (2 Yrs))..."
            value={newExpInput}
            onChange={(e) => setNewExpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExp())}
            className="flex-1 px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none font-medium"
          />
          <button
            type="button"
            onClick={handleAddExp}
            className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

      </div>

      {/* ═════════ SECTION 4: SCIENTIFIC BIO & RESEARCH INTERESTS ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Scientific Bio & Specialized Research Areas</h3>
            <p className="text-[11px] text-slate-400">Operational portfolio summary visible across MoES training directories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Executive Scientific Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Research Domains & Interests</label>
            <textarea
              rows={3}
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ═════════ SECTION 5: VERIFIED CERTIFICATES PORTFOLIO ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Official Accreditations & External Certifications</h3>
              <p className="text-xs text-slate-500">Documented courses and training milestones</p>
            </div>
          </div>
        </div>

        {/* Certificate Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {form.certificates.map((cert, cIdx) => (
            <div key={cIdx} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold">
                    {cert.grade || "Verified"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{cert.year}</span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mt-2">{cert.title}</h4>
                <p className="text-[11px] text-slate-500">{cert.issuer}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onOpenCertificate && onOpenCertificate({ score: 20, totalMarks: 20, percentage: 100 }, cert.title, form.name)}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900"
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
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Certificate Title..."
            value={newCert.title}
            onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
            className="flex-1 w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Issuing Authority (e.g. WMO, IMD)..."
            value={newCert.issuer}
            onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
            className="w-full md:w-64 p-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Year"
            value={newCert.year}
            onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
            className="w-full md:w-24 p-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddCertificate}
            className="w-full md:w-auto px-4 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shrink-0 flex items-center justify-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

      </div>

      {/* ═════════ BOTTOM ACTION BAR ═════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-extrabold text-sm text-slate-900">Administrative Verification & Competency Registry</p>
          <p className="text-xs text-slate-500">
            Submit your updated qualifications and competencies for administrative sign-off and official badge renewal.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleSaveProfile(false)}
            disabled={loading}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-colors"
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSaveProfile(true)}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-2xl text-xs shadow-lg transition-transform hover:scale-105"
          >
            <Send className="w-4 h-4 text-emerald-300" />
            <span>Submit for Verification</span>
          </button>
        </div>
      </div>

    </div>
  );
};
