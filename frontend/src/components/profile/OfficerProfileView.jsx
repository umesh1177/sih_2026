import React, { useState, useEffect } from "react";
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

  const parseArray = (val, defaults = []) => {
    if (Array.isArray(val) && val.length > 0) return val.filter(Boolean);
    if (typeof val === "string" && val.trim().length > 0) {
      if (val.includes("•")) return val.split("•").map(s => s.trim()).filter(Boolean);
      if (val.includes(",")) return val.split(",").map(s => s.trim()).filter(Boolean);
      return [val.trim()];
    }
    return defaults;
  };

  const getInitialForm = (user) => ({
    name: user?.name || user?.email || "Officer Trainee",
    email: user?.email || "",
    department: user?.department || "",
    designation: user?.designation || (user?.role === "trainer" ? "Faculty Trainer" : "Scientist 'B' (Trainee)"),
    station: user?.station || "",
    cadreId: user?.cadreId || "",
    phone: user?.phone || "",
    skills: parseArray(user?.skills, []),
    qualifications: parseArray(user?.qualifications, []),
    experience: parseArray(user?.experience, []),
    interests: Array.isArray(user?.interests) ? user.interests.join(", ") : (user?.interests || ""),
    bio: user?.bio || "",
    certificates: user?.certificates || []
  });

  const [form, setForm] = useState(() => getInitialForm(currentUser));

  // Sync form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setForm(getInitialForm(currentUser));
    }
  }, [currentUser]);

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
                
                {currentUser?.status === "approved" && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MoES Verified Officer</span>
                  </span>
                )}
                {currentUser?.status === "pending" && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-black flex items-center gap-1 shadow-sm animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending Administrative Review</span>
                  </span>
                )}
                {currentUser?.status === "rejected" && (
                  <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Verification Rejected</span>
                  </span>
                )}
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

      {/* ═════════ VERIFICATION STATUS & REJECTION REASON ALERT BANNER ═════════ */}
      {currentUser?.status === "rejected" && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">
                  Verification Action Required
                </span>
                <span className="text-xs font-bold text-rose-900">MoES Central Administration Review</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Officer Profile Registration Rejected by Administrator
              </h3>
              <div className="bg-white/90 p-3.5 rounded-2xl border border-rose-200 text-xs text-rose-950 font-medium">
                <span className="font-bold text-rose-900 block mb-0.5">Admin Feedback & Required Corrections:</span>
                "{currentUser.rejectionReason || currentUser.approvalNotes || "Incomplete credentials or document verification mismatch. Please review and update your qualifications and certifications."}"
              </div>
              <p className="text-[11px] text-slate-500">
                * Note: Course enrollments and active capacity features are locked until your revised profile is approved by Admin.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSaveProfile(true)}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Resubmit Profile for Approval</span>
          </button>
        </div>
      )}

      {currentUser?.status === "pending" && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm">
                Officer Profile Under Administrative Verification Review
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Your credentials, qualifications, and cadre posting documents are queued for MoES administrator sign-off. Full course enrollment access will unlock immediately upon verification.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSaveProfile(true)}
            disabled={loading}
            className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs transition-colors shrink-0 whitespace-nowrap"
          >
            Sync & Re-Verify
          </button>
        </div>
      )}

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
        {form.certificates.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">No Certificates Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Certificates are issued by Admin when you complete a course. Complete a course and ask the admin to generate certificates for it.
              You can also manually log external certifications below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {form.certificates.map((cert, cIdx) => {
              const categoryColors = {
                "Distinction": "bg-emerald-100 text-emerald-800 border-emerald-200",
                "Merit": "bg-blue-100 text-blue-800 border-blue-200",
                "Pass": "bg-amber-100 text-amber-800 border-amber-200",
                "Remedial": "bg-red-100 text-red-800 border-red-200"
              };
              const catClass = categoryColors[cert.performanceCategory] || "bg-amber-100 text-amber-800 border-amber-200";
              return (
                <div key={cIdx} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${catClass}`}>
                        {cert.performanceCategory || cert.grade || "Verified"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">{cert.year}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-2">{cert.title}</h4>
                    <p className="text-[11px] text-slate-500">{cert.issuer}</p>
                    {cert.grade && (
                      <p className="text-[11px] font-bold text-slate-600 mt-0.5">{cert.grade}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenCertificate && onOpenCertificate({
                          certificateId: cert.credentialId || cert.id,
                          score: cert.finalScore || 100,
                          totalMarks: 100,
                          percentage: cert.finalScore || 100,
                          performanceCategory: cert.performanceCategory,
                          grade: cert.grade,
                          issuer: cert.issuer,
                          year: cert.year,
                          submittedAt: cert.issuedAt
                        }, cert.title, form.name)}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </button>
                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(cIdx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}


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
