import React, { useState } from "react";
import { 
  X, 
  User, 
  Award, 
  Briefcase, 
  GraduationCap, 
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

  const [newCert, setNewCert] = useState({ title: "", issuer: "", year: "2026" });

  if (!isOpen) return null;

  const handleAddCertificate = () => {
    if (!newCert.title) return;
    setForm(prev => ({
      ...prev,
      certificates: [...prev.certificates, { ...newCert }]
    }));
    setNewCert({ title: "", issuer: "", year: "2026" });
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
        alert("Your professional profile has been submitted for Administrative Verification.");
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#D9E2EC] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Officer Professional Capacity Profile
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  currentUser?.status === "approved"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  {currentUser?.status || "Pending"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                MoES Competency Mapping & Capacity Building Portfolio
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-3.5 text-xs">
          {/* Status Banner */}
          {currentUser?.status === "pending" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold">Profile Pending Administrative Approval</p>
                <p className="text-[11px] text-amber-700">
                  Complete your profile details and submit for verification to unlock certified exams.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Officer Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IMD Department / Division</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation & Grade</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                placeholder="e.g. NWP Modeling, Radar Data Interpretation, Python"
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic & Scientific Qualifications</label>
            <textarea
              rows={2}
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              placeholder="e.g. M.Sc. Meteorology (Pune University)"
              className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Experience & Operational Postings</label>
            <textarea
              rows={2}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="e.g. 2 years at Cyclone Warning Centre Visakhapatnam"
              className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Certificates Section */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#1D4ED8]" />
              <span>Prior Certifications & Credentials</span>
            </h3>

            <div className="space-y-1.5 mb-2.5">
              {form.certificates.map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-[#D9E2EC] rounded-md">
                  <div>
                    <p className="font-semibold text-slate-800">{cert.title}</p>
                    <p className="text-[11px] text-slate-500">{cert.issuer} • {cert.year}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                className="flex-1 min-w-[160px] p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs"
              />
              <input
                type="text"
                placeholder="Issuing Authority"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                className="w-36 p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs"
              />
              <input
                type="text"
                placeholder="Year"
                value={newCert.year}
                onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                className="w-16 p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs"
              />
              <button
                type="button"
                onClick={handleAddCertificate}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-[#D9E2EC] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-xs transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveProfile(false)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md font-semibold text-xs border border-[#D9E2EC] transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveProfile(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-md font-semibold text-xs shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Submit for Verification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
