import React, { useState } from "react";
import { 
  X, 
  Upload, 
  Video, 
  Presentation, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { api } from "../../services/api";

export const SubjectMaterialUploadModal = ({ 
  isOpen, 
  onClose, 
  subject = {}, 
  currentUser, 
  onMaterialUploaded 
}) => {
  const [materialType, setMaterialType] = useState("video");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("45 Mins");
  const [fileSize, setFileSize] = useState("12.4 MB");
  const [url, setUrl] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(subject.modules?.[0]?.id || "mod_01");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const modules = subject.modules && subject.modules.length > 0 ? subject.modules : [
    { id: "mod_01", title: "Module 1: Mathematical Foundations & Navier-Stokes Equations", durationHours: 4 },
    { id: "mod_02", title: "Module 2: Boundary Layer Physics & Parameterizations", durationHours: 6 },
    { id: "mod_03", title: "Module 3: 4D-Var Data Assimilation & Satellite Ingestion", durationHours: 8 }
  ];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please specify a title for the material.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        subjectId: subject.id || "sub_nwp_01",
        moduleId: selectedModuleId,
        type: materialType,
        title: title.trim(),
        duration,
        fileSize,
        url: url || "https://storage.moes.gov.in/materials/sample_lecture.pdf",
        uploadedBy: currentUser?.name || "Dr. Amit Sengupta",
        uploadedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      };

      await api.uploadSubjectMaterial(payload);

      setSuccess(true);
      setTimeout(() => {
        if (onMaterialUploaded) onMaterialUploaded(payload);
        onClose();
      }, 1000);

    } catch (err) {
      alert("Failed uploading material: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-[#D9E2EC] w-full max-w-xl flex flex-col overflow-hidden text-slate-800 font-sans my-auto">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#D9E2EC] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Upload Learning Resource
              </h2>
              <p className="text-xs text-slate-500">
                {subject.title || "Subject 1: Atmospheric Dynamics"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Target Module Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Curriculum Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {modules.map((m, mIdx) => (
                <option key={m.id || mIdx} value={m.id || `mod_${mIdx}`}>
                  {m.title} ({m.durationHours || 4} Hours)
                </option>
              ))}
            </select>
          </div>

          {/* Material Format Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <button
                type="button"
                onClick={() => setMaterialType("video")}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "video"
                    ? "bg-blue-50 border-blue-500 text-blue-900 font-semibold"
                    : "bg-slate-50 border-[#D9E2EC] text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Video className={`w-4 h-4 ${materialType === "video" ? "text-[#1D4ED8]" : "text-slate-400"}`} />
                <span className="text-[11px]">Video Lecture</span>
              </button>

              <button
                type="button"
                onClick={() => setMaterialType("ppt")}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "ppt"
                    ? "bg-amber-50 border-amber-500 text-amber-950 font-semibold"
                    : "bg-slate-50 border-[#D9E2EC] text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Presentation className={`w-4 h-4 ${materialType === "ppt" ? "text-amber-600" : "text-slate-400"}`} />
                <span className="text-[11px]">Presentation</span>
              </button>

              <button
                type="button"
                onClick={() => setMaterialType("pdf")}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "pdf"
                    ? "bg-teal-50 border-teal-500 text-teal-950 font-semibold"
                    : "bg-slate-50 border-[#D9E2EC] text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className={`w-4 h-4 ${materialType === "pdf" ? "text-[#0F766E]" : "text-slate-400"}`} />
                <span className="text-[11px]">Study Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setMaterialType("lab")}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "lab"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold"
                    : "bg-slate-50 border-[#D9E2EC] text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileCode className={`w-4 h-4 ${materialType === "lab" ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-[11px]">Lab Manual</span>
              </button>

            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
            <input
              type="text"
              placeholder="e.g. Lecture 03: Hydrostatic Equation & Geostrophic Balance in NWP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Duration & File Size Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration / Length</label>
              <input
                type="text"
                placeholder="e.g. 45 Mins or 18 Pages"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">File Size</label>
              <input
                type="text"
                placeholder="e.g. 2.4 MB or 14.8 MB"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Resource URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">CDN / Video Stream URL (Optional)</label>
            <input
              type="text"
              placeholder="e.g. https://storage.moes.gov.in/materials/sample_lecture.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Metadata */}
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-md flex items-center justify-between text-blue-950 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Faculty Stamp: <b>{currentUser?.name || "Dr. Amit Sengupta"}</b>
              </span>
            </div>
            <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-md text-xs shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? "Publishing..." : success ? "Published ✓" : "Publish Resource"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
