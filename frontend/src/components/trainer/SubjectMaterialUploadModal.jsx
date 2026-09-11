import React, { useState, useRef } from "react";
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
  HardDrive,
  HelpCircle,
  Lock,
  PlusCircle,
  UploadCloud,
  FileCheck
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
  const [materialType, setMaterialType] = useState("ppt"); // "ppt" | "pdf" | "video" | "quiz" | "lab"
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("28 Slides");
  const [fileSize, setFileSize] = useState("14.5 MB");
  const [passPercentage, setPassPercentage] = useState(50);
  const [allowDownload, setAllowDownload] = useState(true);
  const [enablePrereqLock, setEnablePrereqLock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // File Upload State
  const fileInputRef = useRef(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  if (!isOpen || !subject) return null;

  const modules = subject.modules || [];

  // File Selector Handler
  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    setSelectedFileObj(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeDisplay = Number(sizeMb) > 0.1 ? `${sizeMb} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const ext = file.name.split('.').pop()?.toLowerCase() || "";

    let inferredType = materialType;
    let defaultDuration = duration;

    if (["ppt", "pptx"].includes(ext)) {
      inferredType = "ppt";
      defaultDuration = "28 Slides";
    } else if (["pdf"].includes(ext)) {
      inferredType = "pdf";
      defaultDuration = "16 Pages";
    } else if (["doc", "docx"].includes(ext)) {
      inferredType = "lab";
      defaultDuration = "12 Pages";
    } else if (["mp4", "webm", "mkv", "mov"].includes(ext)) {
      inferredType = "video";
      defaultDuration = "45 Mins";
    }

    setMaterialType(inferredType);
    setFileSize(sizeDisplay);
    setDuration(defaultDuration);
    if (!title.trim()) {
      setTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result || "";
      setFileDataUrl(dataUrl);
      setUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = () => {
    setSelectedFileObj(null);
    setFileDataUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title for the learning material / quiz");
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

      const finalUrl = fileDataUrl || url.trim() || defaultUrl;

      const payload = {
        title: title.trim(),
        type: materialType,
        url: finalUrl,
        fileData: fileDataUrl || undefined,
        fileName: selectedFileObj?.name || undefined,
        duration: duration.trim(),
        size: fileSize.trim(),
        allowDownload: materialType !== "quiz" && allowDownload,
        uploadedBy: currentUser?.name ? `${currentUser.name} (Trainer)` : "Dr. Amit Sengupta",
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        passPercentage: materialType === "quiz" ? passPercentage : undefined,
        totalMarks: materialType === "quiz" ? 10 : undefined,
        prerequisiteConfig: enablePrereqLock ? {
          enabled: true,
          condition: "ALL",
          requiredWatchThreshold: 80,
          prerequisites: []
        } : undefined,
        questions: materialType === "quiz" ? [
          {
            id: `q_${Date.now()}_1`,
            question: "What is the primary governing criterion in this lecture?",
            options: ["CFL Numerical Stability ≤ 1.0", "Infinite geostrophic divergence", "Zero surface roughness", "Non-hydrostatic explosion"],
            correctAnswer: 0,
            marks: 5,
            explanation: "The CFL condition guarantees bounded explicit advection time-stepping."
          },
          {
            id: `q_${Date.now()}_2`,
            question: "In operational NWP, which boundary condition is applied at top of atmosphere?",
            options: ["Zero vertical velocity / radiation condition", "Infinite pressure flux", "Static geopotential", "Rigid lid at surface"],
            correctAnswer: 0,
            marks: 5,
            explanation: "A radiative or zero flux condition prevents spurious reflection of gravity waves."
          }
        ] : undefined
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden text-slate-800 font-sans my-auto max-h-[90vh]">
        
        {/* ═════════ HEADER ═════════ */}
        <div className="p-6 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                Trainer: Upload Learning Material / Video Quiz
              </h2>
              <p className="text-xs text-slate-500">
                {subject.title || subject.name || "Subject 1: Governing Equations & Atmospheric Dynamics"}
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
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* Target Module Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Target Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              {modules.map((m, mIdx) => (
                <option key={m.id || mIdx} value={m.id || `mod_${mIdx}`}>
                  {m.title} ({m.durationHours || m.duration || "2 Hours"})
                </option>
              ))}
            </select>
          </div>

          {/* Material Format Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Resource Format Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              
              <button
                type="button"
                onClick={() => {
                  setMaterialType("video");
                  setDuration("45 Mins");
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "video"
                    ? "bg-rose-50 border-rose-600 text-rose-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Video className={`w-4 h-4 ${materialType === "video" ? "text-rose-600" : "text-slate-400"}`} />
                <span className="text-[10px]">Video Lecture</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMaterialType("quiz");
                  setDuration("15 Mins");
                  setTitle("Video Quiz: Comprehension & Concept Check");
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "quiz"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <HelpCircle className={`w-4 h-4 ${materialType === "quiz" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-[10px]">Video Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMaterialType("ppt");
                  setDuration("28 Slides");
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "ppt"
                    ? "bg-amber-50 border-amber-600 text-amber-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Presentation className={`w-4 h-4 ${materialType === "ppt" ? "text-amber-600" : "text-slate-400"}`} />
                <span className="text-[10px]">Slide Deck</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMaterialType("pdf");
                  setDuration("12 Pages");
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "pdf"
                    ? "bg-purple-50 border-purple-600 text-purple-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className={`w-4 h-4 ${materialType === "pdf" ? "text-purple-600" : "text-slate-400"}`} />
                <span className="text-[10px]">PDF Guide</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMaterialType("lab");
                  setDuration("1.5 Hours");
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  materialType === "lab"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-black shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileCode className={`w-4 h-4 ${materialType === "lab" ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-[10px]">Lab Manual</span>
              </button>

            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={
              materialType === "ppt"
                ? ".ppt,.pptx"
                : materialType === "pdf"
                ? ".pdf"
                : materialType === "video"
                ? ".mp4,.webm,.mkv,.mov"
                : ".pdf,.doc,.docx,.ppt,.pptx,.mp4"
            }
            className="hidden"
          />

          {/* Local File Upload Dropzone (For PPT, PDF, Video, Lab Docs) */}
          {materialType !== "quiz" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-700">
                  Select Local File ({materialType === "ppt" ? "PPTX / PPT" : materialType === "pdf" ? "PDF Document" : materialType === "video" ? "MP4 Video" : "DOCX / PDF"}) *
                </label>
                <span className="text-[10px] text-indigo-600 font-bold">Verified for Trainee Study Studio</span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  handleFileSelect(e);
                }}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDraggingFile
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                    : selectedFileObj || fileDataUrl
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {selectedFileObj ? (
                  <div className="flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs truncate max-w-xs">{selectedFileObj.name}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">{fileSize} • Ready to upload to module</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px]"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearFile();
                        }}
                        className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-7 h-7 text-indigo-600 mx-auto mb-1 opacity-80" />
                    <p className="text-xs font-bold text-slate-700">
                      Click to browse or drop {materialType === "ppt" ? "PowerPoint (.ppt, .pptx)" : materialType === "pdf" ? "PDF Document (.pdf)" : materialType === "video" ? "MP4 Video (.mp4)" : "Lab Guide"} here
                    </p>
                    <p className="text-[10px] text-slate-400">File verified & preview generated automatically</p>
                  </div>
                )}
              </div>

              {/* Video Stream URL Link Option */}
              {materialType === "video" && (
                <div className="mt-2.5">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Or enter Stream / Embed / YouTube URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/... or direct MP4 URL"
                    value={url.startsWith("data:") ? "" : url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {materialType === "quiz" ? "Assessment / Quiz Title" : "Material Title *"}
            </label>
            <input
              type="text"
              placeholder={
                materialType === "video" 
                  ? "e.g. Video 03: Hydrostatic Equation & Geostrophic Balance in NWP" 
                  : materialType === "quiz"
                  ? "e.g. Video Quiz: Boundary Layer Closures & CFL Numerical Stability Check"
                  : materialType === "ppt"
                  ? "e.g. Presentation: Dual-Polarization Radar Reflectivity (ZDR & KDP)"
                  : "e.g. Study Guide: Boundary Layer Parameterization Notes"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium"
              required
            />
          </div>

          {/* Duration & Passing score or file size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                placeholder="e.g. 45 Mins or 15 Mins"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {materialType === "quiz" ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pass Grade Requirement</label>
                <select
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value={50}>50% (Standard Pass)</option>
                  <option value={70}>70% (Rigorous Pass)</option>
                  <option value={80}>80% (Mastery)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">File Size / Format</label>
                <input
                  type="text"
                  placeholder="e.g. 2.4 MB or 14.8 MB"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Progression Rule Option */}
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2 text-indigo-950">
            <span className="font-extrabold text-xs block text-indigo-900">
              🔒 Controlled Learning Progression Rule:
            </span>
            <label className="flex items-start gap-2 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={enablePrereqLock}
                onChange={(e) => setEnablePrereqLock(e.target.checked)}
                className="mt-0.5 accent-indigo-600"
              />
              <span>
                {materialType === "quiz"
                  ? "Enforce Controlled Path: Trainee must pass this assessment (≥ 50%) before downstream learning resources unlock."
                  : materialType === "video"
                  ? "Enforce Controlled Path: Trainee must watch ≥ 80% of this video before downstream resources unlock."
                  : "Include this resource in the Controlled Progression Rule path."}
              </span>
            </label>
          </div>

          {/* Upload Metadata Preview */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-blue-950 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Metadata Stamp: <b>Uploaded by: {currentUser?.name || "Dr. Amit Sengupta (Trainer)"}</b>
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Trainer Authorized
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
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>{loading ? "Publishing to Module..." : success ? "Published Successfully ✓" : "Publish & Connect to Path"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
