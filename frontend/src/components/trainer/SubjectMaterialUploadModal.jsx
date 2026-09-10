import React, { useState } from "react";
import { 
  X, 
  Upload, 
  Video, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileCode, 
  Presentation, 
  Sparkles, 
  BookOpen, 
  ShieldCheck,
  Building2,
  HardDrive
} from "lucide-react";
import { api } from "../../services/api";

export const SubjectMaterialUploadModal = ({ 
  isOpen, 
  onClose, 
  subject, 
  course, 
  currentUser, 
  onMaterialUploaded 
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState(subject?.modules?.[0]?.id || "");
  const [materialType, setMaterialType] = useState("pdf"); // "video" | "ppt" | "pdf" | "lab"
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("45 Mins");
  const [fileSize, setFileSize] = useState("2.4 MB");
  const [allowDownload, setAllowDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !subject) return null;

  const modules = subject.modules || [];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title for the learning material");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const targetModuleId = selectedModuleId || modules[0]?.id || "mod_01";
      const defaultUrl = materialType === "video" 
        ? "https://storage.moes.gov.in/lectures/weather_radar_sample.mp4" 
        : materialType === "ppt" 
        ? "https://storage.moes.gov.in/slides/atmospheric_dynamics.pptx"
        : "https://storage.moes.gov.in/notes/boundary_layer_notes.pdf";

      const payload = {
        title: title.trim(),
        type: materialType,
        url: url.trim() || defaultUrl,
        duration: duration.trim(),
        size: fileSize.trim(),
        allowDownload,
        uploadedBy: currentUser?.name || "Dr. Amit Sengupta",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      };

      const res = await api.uploadMaterial(course.id, subject.id, targetModuleId, payload);
      
      setSuccess(true);
      if (onMaterialUploaded) {
        onMaterialUploaded(subject.id, targetModuleId, res?.material || payload);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      alert("Failed uploading material: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden text-slate-800 font-sans my-auto">
        
        {/* ═════════ HEADER ═════════ */}
        {/* ═════════ HEADER ═════════ */}
        <div className="p-6 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                Upload Learning Material to Subject
              </h2>
              <p className="text-xs text-slate-500">
                {subject.title || "Subject 1: Governing Equations & Atmospheric Dynamics"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═════════ FORM BODY ═════════ */}
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Target Module Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Target Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {modules.map((m, mIdx) => (
                <option key={m.id || mIdx} value={m.id || `mod_${mIdx}`}>
                  {m.title} ({m.durationHours || 4} Hours)
                </option>
              ))}
            </select>
          </div>

          {/* Material Format Type Selector (Video / PPT / PDF / Lab Manual) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Resource Format Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              <button
                type="button"
                onClick={() => setMaterialType("video")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  materialType === "video"
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Video className={`w-5 h-5 ${materialType === "video" ? "text-blue-600" : "text-slate-400"}`} />
                <span className="text-[11px]">Video Lecture</span>
              </button>

              <button
                type="button"
                onClick={() => setMaterialType("ppt")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  materialType === "ppt"
                    ? "bg-amber-50 border-amber-600 text-amber-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Presentation className={`w-5 h-5 ${materialType === "ppt" ? "text-amber-600" : "text-slate-400"}`} />
                <span className="text-[11px]">PPT Presentation</span>
              </button>

              <button
                type="button"
                onClick={() => setMaterialType("pdf")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  materialType === "pdf"
                    ? "bg-purple-50 border-purple-600 text-purple-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className={`w-5 h-5 ${materialType === "pdf" ? "text-purple-600" : "text-slate-400"}`} />
                <span className="text-[11px]">PDF Study Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setMaterialType("lab")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  materialType === "lab"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileCode className={`w-5 h-5 ${materialType === "lab" ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-[11px]">Lab Manual</span>
              </button>

            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Material / Lecture Title</label>
            <input
              type="text"
              placeholder={
                materialType === "video" 
                  ? "e.g. Lecture 03: Hydrostatic Equation & Geostrophic Balance in NWP" 
                  : materialType === "ppt"
                  ? "e.g. Presentation: Dual-Polarization Radar Reflectivity (ZDR & KDP)"
                  : "e.g. Study Guide: Boundary Layer Parameterization Notes"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              required
            />
          </div>

          {/* Duration & File Size Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Duration / Pages</label>
              <input
                type="text"
                placeholder="e.g. 45 Mins or 18 Pages"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">File Size</label>
              <input
                type="text"
                placeholder="e.g. 2.4 MB or 14.8 MB"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Resource URL / File Endpoint */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">CDN / Video Stream URL (Optional)</label>
            <input
              type="text"
              placeholder="e.g. https://storage.moes.gov.in/materials/sample_lecture.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Upload Metadata Preview (Matching Screenshot: "Uploaded by: Dr. Amit Sengupta") */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-950 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Metadata Stamp: <b>Uploaded by: {currentUser?.name || "Dr. Amit Sengupta"}</b>
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              SOP Verified
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>{loading ? "Publishing to Module..." : success ? "Published Successfully ✓" : "Publish Material"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
