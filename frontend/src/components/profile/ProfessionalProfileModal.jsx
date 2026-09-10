import React, { useState } from "react";
import { 
  X, 
  User, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2,
  ShieldCheck
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const ProfessionalProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    department: currentUser?.department || "",
    designation: currentUser?.designation || "",
    qualifications: currentUser?.qualifications || "",
    experience: currentUser?.experience || "",
    interests: currentUser?.interests?.join(", ") || "",
    skills: currentUser?.skills?.join(", ") || "",
    bio: currentUser?.bio || "",
    certificates: currentUser?.certificates || []
  });

  const [newCert, setNewCert] = useState({ title: "", issuer: "", year: "2024" });

  if (!isOpen) return null;

  const handleAddCertificate = () => {
    if (!newCert.title) return;
    setForm(prev => ({
      ...prev,
      certificates: [...prev.certificates, { ...newCert }]
    }));
    setNewCert({ title: "", issuer: "", year: "2024" });
  };

  const handleRemoveCertificate = (index) => {
    setForm(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async (submitForApproval = false) => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        department: form.department,
        designation: form.designation,
        qualifications: form.qualifications,
        experience: form.experience,
        interests: form.interests.split(",").map(s => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        bio: form.bio,
        certificates: form.certificates
      };

      await api.updateProfile(currentUser.id, payload);

      if (submitForApproval) {
        await api.submitProfileForApproval(currentUser.id);
        alert("Your professional profile has been submitted for Administrative Verification!");
      } else {
        alert("Profile details saved successfully.");
      }

      await refreshProfile();
      onClose();
    } catch (err) {
      alert("Failed updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0a2558] text-white flex items-center justify-center font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Officer Professional Capacity Profile
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentUser?.status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  Status: {currentUser?.status || "Pending"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                MoES Competency Mapping & Capacity Building Portfolio
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Status Banner */}
          {currentUser?.status === "pending" && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Profile Pending Administrative Approval</p>
                <p className="text-[11px] text-amber-700">
                  You can browse all courses. Complete your profile details and submit for verification to unlock full certifications and exams.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Officer Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IMD Department / Division</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation & Grade</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Meteorological Skills (Comma separated)
              </label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. NWP Modeling, Radar Data Interpretation, Python, QGIS"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic & Scientific Qualifications</label>
            <textarea
              rows={2}
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              placeholder="e.g. M.Sc. Meteorology (Pune University), Advanced Diploma in Operational Weather Forecasting"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Experience & Operational Postings</label>
            <textarea
              rows={2}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="e.g. 2 years at Cyclone Warning Centre Visakhapatnam, Radar shift operations"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {/* Certificates Section */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0a2558]" />
              <span>Prior Certifications & Credentials</span>
            </h3>

            <div className="space-y-2 mb-3">
              {form.certificates.map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">{cert.title}</p>
                    <p className="text-[11px] text-slate-500">{cert.issuer} • {cert.year}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Certificate Row */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Certificate Title"
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                className="flex-1 min-w-[180px] p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Issuing Authority (e.g. IMD / WMO)"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                className="w-44 p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Year"
                value={newCert.year}
                onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddCertificate}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveProfile(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveProfile(true)}
              className="flex items-center gap-2 px-5 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold shadow-md transition-all transform hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Submit for Admin Approval</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
