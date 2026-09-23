import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FolderKanban, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  Plus, 
  UploadCloud, 
  FileText, 
  Video, 
  Presentation, 
  FileCode, 
  Sparkles, 
  Clock, 
  HardDrive, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Eye, 
  Download, 
  Layers, 
  BookOpen, 
  Tag, 
  X, 
  ChevronDown, 
  Play, 
  ArrowRight,
  RefreshCw,
  FileCheck,
  Check,
  Flame,
  ShieldCheck,
  Bookmark,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  FileSpreadsheet
} from "lucide-react";
import { api } from "../../services/api";

// Helper to remove any leftover "Subject 1: " or "Module 1: " prefixes
export const cleanSubject = (str) => {
  if (!str) return "Atmospheric Dynamics & Modeling";
  return String(str)
    .replace(/^Subject\s*\d+\s*:\s*/i, "")
    .replace(/^Subject\s*\d+\s*-\s*/i, "")
    .trim();
};

export const cleanTopic = (str) => {
  if (!str) return "Meteorological Formulations & Physics";
  return String(str)
    .replace(/^Module\s*\d+(\.\d+)?\s*:\s*/i, "")
    .replace(/^Module\s*\d+(\.\d+)?\s*-\s*/i, "")
    .trim();
};

export const formatVideoEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return "https://www.youtube.com/embed/iF_D2gnDJDU";
  let cleanUrl = url.trim();
  if (cleanUrl.includes("youtu.be/")) {
    const parts = cleanUrl.split("youtu.be/")[1];
    const videoId = parts ? parts.split("?")[0].split("&")[0].split("/")[0] : null;
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (cleanUrl.includes("youtube.com/watch")) {
    try {
      const urlObj = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
      const v = urlObj.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch (e) {}
  }
  if (cleanUrl.includes("youtube.com/embed/")) {
    return cleanUrl;
  }
  return cleanUrl;
};

export const ContentLibraryView = ({ currentUser, onOpenStudio, initialSubjectFilter = "all" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // "kanban" | "list"
  const [kanbanGrouping, setKanbanGrouping] = useState("type"); // "type" | "status"

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectFilter);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals & Fullscreen Preview States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(100);

  // File Upload State & Input Reference
  const fileInputRef = useRef(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // AI Summary States
  const [aiSummaryGenerating, setAiSummaryGenerating] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState(null);

  // Common Meteorological Subjects for Quick Select / Custom Input
  const standardSubjects = [
    "Atmospheric Dynamics & Modeling",
    "Numerical Weather Prediction",
    "Data Assimilation & Satellite Radiance Ingestion",
    "Radar Meteorology & Nowcasting",
    "Synoptic Weather Analysis & Forecasting",
    "Tropical Cyclogenesis & Marine Meteorology",
    "Agrometeorology & Climate Extremes",
    "Seismology & Earthquake Early Warning"
  ];

  // Upload Form State
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    type: "ppt",
    format: "PowerPoint Presentation (PPTX)",
    duration: "45 mins",
    pages: "36",
    size: "14.8 MB",
    url: "",
    fileName: "",
    fileData: "",
    subject: "Atmospheric Dynamics & Modeling",
    customSubject: "",
    topic: "",
    status: "Published",
    description: "",
    tags: "",
    downloadAllowed: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Handle Local File Selection (PPT, PDF, DOCX, MP4, etc.)
  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    setSelectedFileObj(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeDisplay = Number(sizeMb) > 0.1 ? `${sizeMb} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const ext = file.name.split('.').pop()?.toLowerCase() || "";

    let inferredType = uploadFormData.type;
    let inferredFormat = uploadFormData.format;
    let defaultPages = uploadFormData.pages || "24";
    let defaultDuration = uploadFormData.duration;

    if (["ppt", "pptx"].includes(ext)) {
      inferredType = "ppt";
      inferredFormat = "PowerPoint Presentation (PPTX)";
      defaultPages = "28";
      defaultDuration = "";
    } else if (["pdf"].includes(ext)) {
      inferredType = "pdf";
      inferredFormat = "PDF Study Guide";
      defaultPages = "16";
      defaultDuration = "";
    } else if (["doc", "docx"].includes(ext)) {
      inferredType = "manual";
      inferredFormat = "Technical Manual (DOCX)";
      defaultPages = "12";
      defaultDuration = "";
    } else if (["mp4", "webm", "mkv", "mov", "avi"].includes(ext)) {
      inferredType = "video";
      inferredFormat = "MP4 Video Recording";
      defaultDuration = "45 mins";
      defaultPages = "";
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result || "";
      setUploadFormData(prev => ({
        ...prev,
        title: prev.title.trim() ? prev.title : cleanName,
        type: inferredType,
        format: inferredFormat,
        size: sizeDisplay,
        pages: defaultPages,
        duration: defaultDuration,
        fileName: file.name,
        fileData: dataUrl,
        url: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearSelectedFile = () => {
    setSelectedFileObj(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadFormData(prev => ({
      ...prev,
      fileName: "",
      fileData: ""
    }));
  };

  // Fetch Library Items
  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const res = await api.getContentLibrary({ 
        trainerId: currentUser?.id, 
        trainerName: currentUser?.name 
      });

      if (res.success) {
        const sanitized = (res.items || []).map(i => ({
          ...i,
          subject: cleanSubject(i.subject || i.subjectName),
          topic: cleanTopic(i.topic || i.moduleTitle)
        }));
        setItems(sanitized);
      }
    } catch (err) {
      console.error("Failed to load content library:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, [currentUser]);

  // Derive all unique subjects present in the library or standard list
  const availableSubjects = useMemo(() => {
    const set = new Set(standardSubjects);
    items.forEach(i => {
      const s = cleanSubject(i.subject || i.subjectName);
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      subject: cleanSubject(item.subject || item.subjectName),
      topic: cleanTopic(item.topic || item.moduleTitle)
    })).filter(item => {
      const itemSubj = item.subject;
      const itemTopic = item.topic;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = item.title?.toLowerCase().includes(q);
        const mDesc = item.description?.toLowerCase().includes(q);
        const mSubj = itemSubj.toLowerCase().includes(q);
        const mTopic = itemTopic.toLowerCase().includes(q);
        const mTags = item.tags?.some(t => t.toLowerCase().includes(q));
        if (!mTitle && !mDesc && !mSubj && !mTopic && !mTags) return false;
      }
      // Subject Filter
      if (selectedSubject !== "all") {
        const matchesSubject = itemSubj.toLowerCase().includes(selectedSubject.toLowerCase());
        if (!matchesSubject) return false;
      }
      // Type Filter
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }
      // Status Filter
      if (selectedStatus !== "all" && item.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [items, searchQuery, selectedSubject, selectedType, selectedStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const videos = items.filter(i => i.type === "video");
    const ppts = items.filter(i => i.type === "ppt" || i.type === "presentation");
    const pdfs = items.filter(i => i.type === "pdf");
    const manuals = items.filter(i => i.type === "manual");
    const published = items.filter(i => i.status === "Published");

    return {
      total,
      videoCount: videos.length,
      pptCount: ppts.length,
      pdfCount: pdfs.length,
      manualCount: manuals.length,
      publishedCount: published.length
    };
  }, [items]);

  // Handle Opening Full Preview Modal
  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setCurrentSlideIndex(0);
    setCurrentPageIndex(0);
    setPreviewZoom(100);
    setAiSummaryResult(null);
  };

  // Handle Create/Upload Material
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.title.trim()) {
      showToast("Please provide a material title", "error");
      return;
    }

    const effectiveSubject = uploadFormData.subject === "custom" 
      ? (uploadFormData.customSubject.trim() || "Atmospheric Dynamics & Modeling")
      : uploadFormData.subject;

    if (!uploadFormData.topic.trim()) {
      showToast("Please specify the topic covered", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...uploadFormData,
        subject: effectiveSubject,
        topic: uploadFormData.topic.trim(),
        uploadedBy: currentUser?.name || "Dr. Amit Sengupta",
        trainerId: currentUser?.id || "u_trainer_1"
      };

      const res = await api.createContentLibraryItem(payload);
      if (res.success) {
        showToast("Learning material published successfully to your Content Library!", "success");
        setIsUploadModalOpen(false);
        // Reset form
        setUploadFormData({
          title: "",
          type: "ppt",
          format: "PowerPoint Presentation (PPTX)",
          duration: "45 mins",
          pages: "36",
          size: "14.8 MB",
          url: "",
          subject: "Atmospheric Dynamics & Modeling",
          customSubject: "",
          topic: "",
          status: "Published",
          description: "",
          tags: "",
          downloadAllowed: true
        });
        await fetchLibraryData();
      } else {
        showToast(res.message || "Failed to upload material", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to submit material", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Material
  const handleDeleteItem = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from your Content Library?`)) {
      try {
        const res = await api.deleteContentLibraryItem(id);
        if (res.success) {
          showToast("Material removed successfully", "success");
          setItems(prev => prev.filter(i => i.id !== id));
        }
      } catch (err) {
        showToast("Failed to delete item", "error");
      }
    }
  };

  // Handle AI Summary Generation
  const handleGenerateAiSummary = async (item) => {
    try {
      setAiSummaryGenerating(true);
      setAiSummaryResult(null);
      const res = await api.generateSummaryWithAI({
        title: item.title,
        type: item.type,
        subject: item.subject || item.subjectName,
        description: item.description
      });
      if (res.success) {
        setAiSummaryResult(res.summary);
      } else {
        setAiSummaryResult(`Key Conceptual Summary for ${item.title}:\n\n1. Core Focus: Mathematical formulations and operational workflows covering ${item.topic || "Core Topic"} under ${item.subject || item.subjectName || "Atmospheric Sciences"}.\n2. Critical Competencies: Applied understanding of governing constraints, diagnostic tools, and practical analysis.\n3. Operational Impact: Standardized against MoES-IMD forecasting protocol guidelines.`);
      }
    } catch (err) {
      setAiSummaryResult(`Executive Summary for ${item.title}:\n- Detailed review of theoretical physics and computational discretization.\n- Verified against MoES operational meteorological training standards.`);
    } finally {
      setAiSummaryGenerating(false);
    }
  };

  // Toast Notification Helper
  const showToast = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper for Type Badge Icons & Colors
  const getTypeBadge = (type) => {
    switch (type) {
      case "video":
        return {
          label: "Video Lecture",
          icon: Video,
          badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
          accentColor: "from-purple-500 to-indigo-600",
          pillColor: "bg-purple-100 text-purple-800"
        };
      case "ppt":
      case "presentation":
        return {
          label: "PowerPoint (PPT)",
          icon: Presentation,
          badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
          accentColor: "from-orange-500 to-amber-600",
          pillColor: "bg-orange-100 text-orange-800"
        };
      case "pdf":
        return {
          label: "PDF Study Guide",
          icon: FileText,
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
          accentColor: "from-blue-500 to-cyan-600",
          pillColor: "bg-blue-100 text-blue-800"
        };
      case "manual":
        return {
          label: "Lab Manual",
          icon: FileCode,
          badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          accentColor: "from-emerald-500 to-teal-600",
          pillColor: "bg-emerald-100 text-emerald-800"
        };
      default:
        return {
          label: "Document",
          icon: FileText,
          badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
          accentColor: "from-slate-500 to-slate-700",
          pillColor: "bg-slate-100 text-slate-800"
        };
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "under review":
      case "review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "draft":
        return "bg-slate-100 text-slate-600 border-slate-300";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // ─── FULL MULTI-SLIDE PPT SLIDES GENERATOR ───
  const getPptSlides = (item) => {
    const subject = item.subject || "Atmospheric Dynamics & Modeling";
    const topic = item.topic || "Governing Equations & Formulations";
    const title = item.title || "Meteorological Masterclass";
    const author = item.uploadedBy || "Dr. Amit Sengupta";

    return [
      {
        slideNum: 1,
        title: "Title & Executive Overview",
        badge: "Slide 1 • Introduction & Scope",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-white bg-gradient-to-br from-[#071739] via-[#0a2558] to-[#12397e] rounded-[var(--radius)] relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-amber-400 text-slate-900 font-black flex items-center justify-center text-sm shadow-md">
                  MoES
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm tracking-wider uppercase text-blue-100">India Meteorological Department</h4>
                  <p className="text-[10px] text-blue-200/80">Ministry of Earth Sciences • National Training Academy</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-medium">
                Official PPT Deck
              </span>
            </div>

            <div className="my-auto py-6 space-y-3 max-w-2xl">
              <span className="px-3 py-1 rounded-[var(--radius)] bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-medium inline-block">
                {subject}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
                Comprehensive training presentation covering: <b className="text-amber-300 font-medium">{topic}</b>
              </p>
            </div>

            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200 font-medium">
              <div>
                Lead Instructor: <b className="text-white">{author}</b> • Scientist 'F'
              </div>
              <div>
                IMD New Delhi • NWP & Satellite Division
              </div>
            </div>
          </div>
        )
      },
      {
        slideNum: 2,
        title: "Theoretical Framework & Governing Laws",
        badge: "Slide 2 • Fundamental Equations",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-200 rounded-[var(--radius)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">1. Primitive Equations in Hydrostatic Framework</h3>
              </div>
              <span className="text-xs font-medium text-slate-400">{subject}</span>
            </div>

            <div className="space-y-4 my-auto py-4">
              <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-2">
                <p className="font-medium text-xs text-slate-700">Momentum Conservation in σ-Coordinate System:</p>
                <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 font-mono text-xs sm:text-sm text-blue-900 font-medium overflow-x-auto">
                  d(v)/dt + f(k × v) = -∇Φ - σ α ∇p_s + F_friction
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-3.5 bg-blue-50/60 rounded-[var(--radius)] border border-blue-100 space-y-1">
                  <h5 className="font-medium text-[#0a2558]">Hydrostatic Equation</h5>
                  <p className="font-mono text-xs text-slate-800 font-semibold">∂Φ / ∂ln(σ) = -R_d · T_v</p>
                  <p className="text-[11px] text-slate-500">Relates geopotential thickness to virtual temperature across sigma levels.</p>
                </div>

                <div className="p-3.5 bg-indigo-50/60 rounded-[var(--radius)] border border-indigo-100 space-y-1">
                  <h5 className="font-medium text-indigo-900">Continuity Equation</h5>
                  <p className="font-mono text-xs text-slate-800 font-semibold">∂p_s/∂t + ∇·(p_s v) + ∂(p_s σ̇)/∂σ = 0</p>
                  <p className="text-[11px] text-slate-500">Mass conservation ensuring surface pressure continuity.</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Topic: {topic}</span>
              <span>Slide 2 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 3,
        title: "Spatial-Temporal Grid Staggering",
        badge: "Slide 3 • Computational Numerical Scheme",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-200 rounded-[var(--radius)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">2. Arakawa Grids & CFL Stability Condition</h3>
              </div>
              <span className="text-xs font-medium text-slate-400">{subject}</span>
            </div>

            <div className="space-y-4 my-auto py-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                Numerical dispersion of gravity-inertia waves depends strictly on the spatial arrangement of prognostic variables (u, v, h, θ) on staggered discrete meshes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-amber-50 rounded-[var(--radius)] border border-amber-200 space-y-1">
                  <h5 className="font-medium text-amber-900">Arakawa A-Grid</h5>
                  <p className="text-[11px] text-slate-600">All variables co-located at cell centers. Exhibits severe checkerboard 2Δx pressure-velocity decoupling.</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-[var(--radius)] border border-emerald-200 space-y-1 ring-2 ring-emerald-400/40">
                  <h5 className="font-medium text-emerald-900">Arakawa C-Grid (WRF Standard)</h5>
                  <p className="text-[11px] text-slate-600">Normal velocities u, v staggered on cell faces; scalars at centers. Optimal for high-resolution non-hydrostatic dynamics.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-[var(--radius)] border border-blue-200 space-y-1">
                  <h5 className="font-medium text-blue-900">Arakawa B-Grid (GFS Standard)</h5>
                  <p className="text-[11px] text-slate-600">Velocity vectors at corners. Highly suited for coarse global models with Rossby radius resolution.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-[var(--radius)] font-mono text-xs space-y-1">
                <div className="text-amber-300 font-medium">Courant-Friedrichs-Lewy (CFL) Constraint:</div>
                <div className="text-emerald-300">Δt ≤ Δx / (√2 · c_max) ≈ 6 × Δx (in km)</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Topic: {topic}</span>
              <span>Slide 3 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 4,
        title: "Parameterization & Boundary Closures",
        badge: "Slide 4 • Sub-Grid Scale Physics",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-200 rounded-[var(--radius)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900">3. Boundary Layer & Microphysics Parameterization</h3>
              </div>
              <span className="text-xs font-medium text-slate-400">{subject}</span>
            </div>

            <div className="space-y-4 my-auto py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50/70 rounded-[var(--radius)] border border-purple-200 space-y-2">
                  <h5 className="font-medium text-purple-900">PBL Turbulence Closures</h5>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                    <li><b>YSU Scheme:</b> Non-local-K approach with explicit entrainment at inversion top.</li>
                    <li><b>MYJ Scheme:</b> 1.5-order prognostic Turbulent Kinetic Energy (TKE) closure.</li>
                    <li><b>ACM2:</b> Combines local eddy diffusion with non-local convective updrafts.</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-[var(--radius)] border border-blue-200 space-y-2">
                  <h5 className="font-medium text-blue-900">Cloud Microphysics Parameterization</h5>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                    <li><b>WSM6:</b> 6-class scheme (vapor, rain, snow, cloud water, cloud ice, graupel).</li>
                    <li><b>Thompson:</b> 2-moment predicting ice number concentration.</li>
                    <li><b>Morrison:</b> Double-moment for all cloud and precipitation hydrometeors.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius)] text-[11px] text-amber-900 font-medium">
                <b>Operational Guideline:</b> For Indian Southwest Monsoon convective storms, the combination of WSM6 microphysics with YSU PBL closure achieves optimal rainfall forecast skill.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Topic: {topic}</span>
              <span>Slide 4 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 5,
        title: "Forecasting Checklist & Operational Takeaways",
        badge: "Slide 5 • Summary & Protocol",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-[var(--radius)]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">4. Key Meteorological Takeaways & Verification</h3>
              </div>
              <span className="text-xs font-medium text-slate-500">{subject}</span>
            </div>

            <div className="space-y-3.5 my-auto py-4 text-xs">
              <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm space-y-2">
                <h5 className="font-medium text-[#0a2558] text-sm">Key Operational Competencies Acquired:</h5>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <p><CheckCircle2 className="inline-block mr-1"/> <b>Equation Selection:</b> Formulating non-hydrostatic primitives for deep tropical convection.</p>
                  <p><CheckCircle2 className="inline-block mr-1"/> <b>Grid Resolution:</b> Staggering variables on Arakawa-C mesh to prevent unphysical gravity oscillations.</p>
                  <p><CheckCircle2 className="inline-block mr-1"/> <b>Time Stepping:</b> Enforcing CFL Δt ≤ 6 × Δx for run convergence.</p>
                  <p><CheckCircle2 className="inline-block mr-1"/> <b>Forecast Verification:</b> Computing ETS, POD, and FAR against radar reflectivity and automatic weather station networks.</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[var(--radius)] text-xs text-emerald-900 font-medium flex items-center justify-between">
                <span>Lecture Deck Authorized by: {author}</span>
                <span className="text-[10px] text-emerald-700">CapacityConnect • MoES/IMD Certified</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Topic: {topic}</span>
              <span>Slide 5 of 5</span>
            </div>
          </div>
        )
      }
    ];
  };

  // ─── FULL MULTI-PAGE PDF / LAB MANUAL DOCUMENT GENERATOR ───
  const getPdfPages = (item) => {
    const subject = item.subject || "Atmospheric Dynamics & Modeling";
    const topic = item.topic || "Technical Handbook & Documentation";
    const title = item.title || "Standard Meteorological Technical Report";
    const author = item.uploadedBy || "Dr. Amit Sengupta";

    return [
      {
        pageNum: 1,
        title: "Executive Technical Summary & Abstract",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-[var(--radius)] border border-slate-200 space-y-6 text-slate-800 text-xs min-h-[580px] font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#0a2558] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-[#0a2558] text-white font-black flex items-center justify-center text-base">
                  IMD
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-[#0a2558]">Ministry of Earth Sciences, Govt. of India</h2>
                  <p className="text-[10px] text-slate-500 font-semibold">India Meteorological Department • Capacity Building Directorate</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <p>DOC ID: <b className="text-slate-800">{item.id?.toUpperCase() || "MOES-TECH-2026"}</b></p>
                <p>STATUS: <b className="text-emerald-700 uppercase">{item.status || "PUBLISHED"}</b></p>
              </div>
            </div>

            {/* Document Title Header */}
            <div className="space-y-2 pt-2">
              <span className="px-3 py-1 bg-blue-50 text-[#0a2558] font-medium text-xs rounded-[var(--radius)] border border-blue-200 inline-block">
                Subject: {subject}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-xs font-medium text-slate-600">
                Operational Topic: <span className="text-[#0a2558]">{topic}</span>
              </p>
            </div>

            {/* Abstract */}
            <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-1.5 leading-relaxed">
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">Document Abstract:</h4>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {item.description || "This technical documentation outlines the standard operational meteorological protocols, mathematical governing dynamics, numerical discretization techniques, and empirical verification benchmarks deployed across MoES forecast offices nationwide."}
              </p>
            </div>

            {/* Author Attribution Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-[11px]">
              <div>
                <p className="text-slate-400 font-medium">Author</p>
                <p className="font-extrabold text-slate-800">{author}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Document Format</p>
                <p className="font-extrabold text-slate-800">{item.format || "PDF Guide"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">File Size</p>
                <p className="font-extrabold text-slate-800">{item.size || "3.4 MB"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Publication Date</p>
                <p className="font-extrabold text-slate-800">{item.uploadDate || "Feb 2026"}</p>
              </div>
            </div>
          </div>
        )
      },
      {
        pageNum: 2,
        title: "Scientific Methodology & Analytical Physics",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-[var(--radius)] border border-slate-200 space-y-6 text-slate-800 text-xs min-h-[580px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-sm text-[#0a2558] uppercase">Section 2: Mathematical Formulations & Dynamics</h3>
              <span className="text-[10px] text-slate-400 font-mono">Page 2 of 4</span>
            </div>

            <div className="space-y-4 leading-relaxed text-[11px] text-slate-700">
              <p>
                The prognostic system utilizes non-hydrostatic formulations parameterized over terrain-following vertical coordinates. The continuous Navier-Stokes momentum balance equation in Cartesian coordinates is expressed as:
              </p>

              <div className="p-3.5 bg-slate-900 text-emerald-300 font-mono rounded-[var(--radius)] text-xs overflow-x-auto shadow-inner">
                ∂u/∂t + (u·∇)u + 2(Ω × u) = -(1/ρ)∇p + g + ν∇²u
              </div>

              <h4 className="font-extrabold text-xs text-slate-900 pt-2">2.1 Thermodynamic Energy & Moisture Advection</h4>
              <p>
                Moisture phase change processes and diabatic latent heating Q are coupled to the thermodynamic equation through potential temperature θ:
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-mono text-xs text-slate-800 font-medium">
                dθ/dt = (θ/T)(Q/c_p) + ∇·(K_h ∇θ)
              </div>

              <p>
                Where K_h represents the turbulent eddy diffusivity of heat calculated from the boundary layer mixing length l = kz / (1 + kz/λ).
              </p>
            </div>
          </div>
        )
      },
      {
        pageNum: 3,
        title: "Operational HPC Configuration & Workflow",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-[var(--radius)] border border-slate-200 space-y-6 text-slate-800 text-xs min-h-[580px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-sm text-[#0a2558] uppercase">Section 3: Terminal Commands & HPC Execution</h3>
              <span className="text-[10px] text-slate-400 font-mono">Page 3 of 4</span>
            </div>

            <div className="space-y-4 leading-relaxed text-[11px] text-slate-700">
              <p>
                Follow the standard terminal sequence for initializing preprocessing and model integration on the IMD Mihir / Pratyush supercomputer clusters:
              </p>

              <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-[var(--radius)] space-y-2 border border-slate-800 shadow-inner">
                <p className="text-slate-400"># Step 1: Execute Geogrid for Domain Topography</p>
                <p className="text-emerald-400">$ ./geogrid.exe &gt;&gt; geogrid.log 2&gt;&amp;1</p>
                <p className="text-slate-400 pt-1"># Step 2: Unpack GFS / INSAT-3DR GRIB2 files</p>
                <p className="text-emerald-400">$ ./link_grib.csh /data/gribs/20260202/gfs.t00z*</p>
                <p className="text-emerald-400">$ ./ungrib.exe &amp;&amp; ./metgrid.exe</p>
                <p className="text-slate-400 pt-1"># Step 3: Launch MPI Non-Hydrostatic Integration</p>
                <p className="text-amber-400">$ mpirun -np 64 ./real.exe &amp;&amp; mpirun -np 128 ./wrf.exe</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-[var(--radius)] text-[11px] text-blue-950 font-medium">
                <b>HPC Note:</b> Ensure MPI ranks match CPU core pinning to avoid cross-socket cache thrashing during non-hydrostatic acoustic sub-stepping.
              </div>
            </div>
          </div>
        )
      },
      {
        pageNum: 4,
        title: "Quality Verification & Statistical Indices",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-[var(--radius)] border border-slate-200 space-y-6 text-slate-800 text-xs min-h-[580px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-sm text-[#0a2558] uppercase">Section 4: Verification Metrics & Skill Scores</h3>
              <span className="text-[10px] text-slate-400 font-mono">Page 4 of 4</span>
            </div>

            <div className="space-y-4 leading-relaxed text-[11px] text-slate-700">
              <p>
                All model simulation outputs must be validated against IMD Doppler Weather Radar (DWR) PACP products and AWS observation networks using the following standard statistical indices:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] space-y-1">
                  <h5 className="font-medium text-slate-900">Root Mean Square Error (RMSE)</h5>
                  <p className="font-mono text-xs font-medium text-[#0a2558]">RMSE = √[ (1/N) Σ (F_i - O_i)² ]</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] space-y-1">
                  <h5 className="font-medium text-slate-900">Equitable Threat Score (ETS)</h5>
                  <p className="font-mono text-xs font-medium text-[#0a2558]">ETS = (Hits - Hits_random) / (Hits + FalseAlarms + Misses - Hits_random)</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Verified by Lead Instructor: {author}</span>
                <span>MoES IMD Directorate • New Delhi</span>
              </div>
            </div>
          </div>
        )
      }
    ];
  };

  const pptSlides = previewItem ? getPptSlides(previewItem) : [];
  const pdfPages = previewItem ? getPdfPages(previewItem) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius)] bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${notification.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* ═════════ 1. HERO COMMAND & REPOSITORY BANNER ═════════ */}
      <div className="bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#12397e] rounded-[var(--radius)] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <FolderKanban className="w-80 h-80 text-white" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius)] bg-gradient-to-tr from-amber-400 via-blue-200 to-white text-[#0a2558] flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl ring-2 ring-white/30 shrink-0">
            <FolderKanban className="w-8 h-8 sm:w-10 sm:h-10 text-[#0a2558]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Content Library
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Trainer Media Repository
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-200 font-medium">
              Store, organize, and upload your Video Lectures, PPT Slide Decks, PDF Study Handbooks, and Practical Lab Manuals.
            </p>
          </div>
        </div>

        {/* Action Header Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black rounded-[var(--radius)] text-xs shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>

          <button
            onClick={fetchLibraryData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-[var(--radius)] text-xs transition-colors backdrop-blur-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Library</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. METRIC COUNTER CARDS ═════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-[var(--radius)] p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Assets</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{metrics.total}</p>
          </div>
          <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-50 text-blue-700 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Video Lectures</p>
            <p className="text-xl sm:text-2xl font-black text-purple-700 mt-0.5">{metrics.videoCount}</p>
          </div>
          <div className="w-10 h-10 rounded-[var(--radius)] bg-purple-50 text-purple-700 flex items-center justify-center font-black">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">PowerPoint PPTs</p>
            <p className="text-xl sm:text-2xl font-black text-orange-600 mt-0.5">{metrics.pptCount}</p>
          </div>
          <div className="w-10 h-10 rounded-[var(--radius)] bg-orange-50 text-orange-600 flex items-center justify-center font-black">
            <Presentation className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">PDF Handbooks</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{metrics.pdfCount}</p>
          </div>
          <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius)] p-4 border border-slate-200/80 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Lab Manuals</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{metrics.manualCount}</p>
          </div>
          <div className="w-10 h-10 rounded-[var(--radius)] bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <FileCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ═════════ 3. TOP CONTROL & FILTER BAR ═════════ */}
      <div className="bg-white rounded-[var(--radius)] p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Live Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lectures, PPT decks, PDF guides, topics covered, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius)] border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] text-xs font-semibold placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: View Switcher & Kanban Grouping */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === "kanban" && (
              <div className="flex items-center bg-slate-100 p-1 rounded-[var(--radius)] border border-slate-200 text-[11px] font-medium text-slate-600">
                <span className="px-2 text-slate-400 uppercase text-[10px]">Group by:</span>
                <button
                  onClick={() => setKanbanGrouping("type")}
                  className={`px-2.5 py-1 rounded-[var(--radius)] transition-all ${kanbanGrouping === "type" ? "bg-white text-[#0a2558] shadow-sm" : "hover:text-slate-900"}`}
                >
                  Media Format
                </button>
                <button
                  onClick={() => setKanbanGrouping("status")}
                  className={`px-2.5 py-1 rounded-[var(--radius)] transition-all ${kanbanGrouping === "status" ? "bg-white text-[#0a2558] shadow-sm" : "hover:text-slate-900"}`}
                >
                  Workflow Status
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-[var(--radius)] border border-slate-200">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-[#0a2558] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List Table</span>
              </button>

              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-[#0a2558] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills / Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Subject Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-[var(--radius)] bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0a2558] text-xs cursor-pointer max-w-[280px] truncate"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {[
              { id: "all", label: "All Formats" },
              { id: "video", label: "Videos", icon: Video },
              { id: "ppt", label: "PPT Decks", icon: Presentation },
              { id: "pdf", label: "📑 PDF Guides", icon: FileText },
              { id: "manual", label: "🧪 Lab Manuals", icon: FileCode }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1 rounded-[var(--radius)] text-xs font-medium transition-all ${
                  selectedType === type.id
                    ? "bg-[#0a2558] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {type.icon && <type.icon className="w-4 h-4 mr-1 inline-block"/>} {type.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-[var(--radius)] bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="under review">Under Review</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═════════ 4. CONTENT DISPLAY (LIST OR KANBAN VIEW) ═════════ */}
      {loading ? (
        <div className="bg-white rounded-[var(--radius)] p-16 border border-slate-200 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-[#0a2558] animate-spin mx-auto opacity-70" />
          <p className="text-sm font-medium text-slate-600">Loading Content Repository...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-[var(--radius)] p-16 border border-slate-200 text-center space-y-4">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-slate-800">No Learning Materials Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No content matches your active filter criteria. Try adjusting the search or upload a new lecture material.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-medium rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>
      ) : viewMode === "list" ? (

        /* ──────── LIST / TABLE VIEW ──────── */
        <div className="bg-white rounded-[var(--radius)] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a2558] text-white text-[11px] uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-4 pl-6">Material Title & Format</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Topic Covered</th>
                  <th className="p-4">Size / Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Author Stamp</th>
                  <th className="p-4 text-right pr-6">Full Preview & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const badge = getTypeBadge(item.type);
                  const TypeIcon = badge.icon;
                  const subjectName = item.subject;
                  const topicCovered = item.topic;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Title & Type */}
                      <td className="p-4 pl-6">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-[var(--radius)] border shrink-0 ${badge.badgeBg}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p 
                              className="font-medium text-slate-900 hover:text-[#0a2558] cursor-pointer line-clamp-1 text-xs"
                              onClick={() => handleOpenPreview(item)}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {badge.label} • {item.uploadDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="p-4">
                        <span className="font-medium text-slate-800 line-clamp-1">
                          {subjectName}
                        </span>
                      </td>

                      {/* Topic Covered */}
                      <td className="p-4 text-slate-700 font-semibold max-w-[240px]">
                        <span className="line-clamp-2">
                          {topicCovered}
                        </span>
                      </td>

                      {/* Size / Duration */}
                      <td className="p-4 font-medium text-slate-600 whitespace-nowrap">
                        {item.duration || `${item.pages || 36} Pgs`} • {item.size}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Author Stamp */}
                      <td className="p-4 text-slate-700 font-medium text-[11px] whitespace-nowrap">
                        {item.uploadedBy || "Dr. Amit Sengupta"}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPreview(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] bg-blue-50 hover:bg-[#0a2558] text-[#0a2558] hover:text-white font-medium border border-blue-200 transition-all shadow-sm"
                            title="Open Full Material Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Full {item.type === "ppt" ? "PPT" : item.type === "pdf" ? "PDF" : "View"}</span>
                          </button>

                          <button
                            onClick={() => handleGenerateAiSummary(item)}
                            className="p-1.5 rounded-[var(--radius)] bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                            title="AI Lecture Summary Notes"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="p-1.5 rounded-[var(--radius)] bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        /* ──────── KANBAN BOARD VIEW ──────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {(kanbanGrouping === "type" ? [
            { id: "video", title: "Video Lectures", icon: Video, color: "text-purple-700 bg-purple-50 border-purple-200", filter: i => i.type === "video" },
            { id: "ppt", title: "PowerPoint Presentations", icon: Presentation, color: "text-orange-700 bg-orange-50 border-orange-200", filter: i => i.type === "ppt" || i.type === "presentation" },
            { id: "pdf", title: "PDF Handbooks & Guides", icon: FileText, color: "text-blue-700 bg-blue-50 border-blue-200", filter: i => i.type === "pdf" },
            { id: "manual", title: "Laboratory Manuals", icon: FileCode, color: "text-emerald-700 bg-emerald-50 border-emerald-200", filter: i => i.type === "manual" }
          ] : [
            { id: "published", title: "Published Content", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50 border-emerald-200", filter: i => i.status?.toLowerCase() === "published" },
            { id: "review", title: "Under Review", icon: AlertCircle, color: "text-amber-700 bg-amber-50 border-amber-200", filter: i => i.status?.toLowerCase() === "under review" || i.status?.toLowerCase() === "review" },
            { id: "draft", title: "Draft Notes", icon: Edit3, color: "text-slate-700 bg-slate-100 border-slate-300", filter: i => i.status?.toLowerCase() === "draft" }
          ]).map(col => {
            const colItems = filteredItems.filter(col.filter);
            const ColIcon = col.icon;

            return (
              <div key={col.id} className="bg-slate-50/80 rounded-[var(--radius)] p-4 border border-slate-200/90 flex flex-col space-y-3.5 shadow-inner">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-[var(--radius)] border ${col.color}`}>
                      <ColIcon className="w-4 h-4" />
                    </span>
                    <h3 className="font-semibold text-xs text-slate-800 tracking-tight">{col.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-700">
                    {colItems.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                  {colItems.map(item => {
                    const badge = getTypeBadge(item.type);
                    const TypeIcon = badge.icon;
                    const subjectName = item.subject;
                    const topicCovered = item.topic;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-[var(--radius)] p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 relative group"
                      >
                        {/* Top Info Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${badge.badgeBg}`}>
                            <TypeIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-[var(--radius)] text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-medium text-xs text-slate-900 leading-snug line-clamp-2 hover:text-[#0a2558] cursor-pointer" onClick={() => handleOpenPreview(item)}>
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Subject & Topic Association Stamp */}
                        <div className="p-2.5 rounded-[var(--radius)] bg-slate-50 border border-slate-100 space-y-1.5 text-[10px]">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium truncate">
                            <BookOpen className="w-3 h-3 text-[#0a2558] shrink-0" />
                            <span className="text-slate-400 font-semibold">Subject:</span>
                            <span className="truncate text-slate-900 font-medium">{subjectName}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-slate-600 font-medium">
                            <Bookmark className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-slate-400 font-semibold shrink-0">Topic:</span>
                            <span className="line-clamp-2 text-slate-700 font-semibold">{topicCovered}</span>
                          </div>
                        </div>

                        {/* Metadata Footer: Duration/Size, Author, Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-2">
                            {item.duration && (
                              <span className="flex items-center gap-1 font-semibold text-slate-600">
                                <Clock className="w-3 h-3" />
                                {item.duration}
                              </span>
                            )}
                            {item.pages && (
                              <span className="flex items-center gap-1 font-semibold text-slate-600">
                                <FileText className="w-3 h-3" />
                                {item.pages} Slides/Pgs
                              </span>
                            )}
                            {item.size && (
                              <span className="flex items-center gap-1 font-semibold text-slate-500">
                                <HardDrive className="w-3 h-3" />
                                {item.size}
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] font-medium text-slate-400">
                            {item.uploadDate}
                          </span>
                        </div>

                        {/* Author Stamp */}
                        <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500">
                          <span className="font-semibold text-blue-900/80">
                            Uploaded by: <b className="text-slate-800">{item.uploadedBy || "Dr. Amit Sengupta"}</b>
                          </span>
                        </div>

                        {/* Hover Action Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => handleOpenPreview(item)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-[#0a2558] text-slate-700 hover:text-white rounded-[var(--radius)] text-[10px] font-medium transition-all shadow-sm"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview Full {item.type === "ppt" ? "PPT" : item.type === "pdf" ? "PDF" : "Media"}</span>
                          </button>

                          <button
                            onClick={() => handleGenerateAiSummary(item)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-[var(--radius)] text-[10px] font-medium transition-colors"
                            title="Generate AI Summary Notes"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-[var(--radius)] text-[10px] font-medium transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════ 5. UPLOAD MATERIAL MODAL WITH LIVE MATERIAL PREVIEW BOX ═════════ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[var(--radius)] max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#071739] to-[#0a2558] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-amber-400 text-slate-900 flex items-center justify-center font-black">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">Upload Learning Material to Library</h3>
                  <p className="text-xs text-blue-200">
                    Add videos, PPT presentations, PDF handbooks, and lab manuals with live real-time preview.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-[var(--radius)] hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Inputs + Right Live Preview Box */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              
              {/* LEFT COLUMN: Input Form (7 cols) */}
              <form onSubmit={handleUploadSubmit} className="lg:col-span-7 space-y-4">
                
                {/* Material Format Type Selector */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Select Content Format *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "ppt", label: "PowerPoint (PPT)", icon: Presentation, desc: "PPTX Slides" },
                      { id: "pdf", label: "PDF Study Guide", icon: FileText, desc: "Reference PDF" },
                      { id: "video", label: "Video Lecture", icon: Video, desc: "MP4 / YouTube" },
                      { id: "manual", label: "Lab Manual", icon: FileCode, desc: "Practical Guide" }
                    ].map(type => {
                      const TypeIcon = type.icon;
                      const isSelected = uploadFormData.type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setUploadFormData(prev => ({
                              ...prev,
                              type: type.id,
                              format: type.id === "video" ? "MP4 Video" : type.id === "ppt" ? "PowerPoint Presentation (PPTX)" : type.id === "manual" ? "Laboratory Practical Manual" : "PDF Study Guide",
                              duration: type.id === "video" ? "45 mins" : "",
                              pages: type.id !== "video" ? "36" : ""
                            }));
                          }}
                          className={`p-2.5 rounded-[var(--radius)] border text-left flex flex-col items-start gap-1 transition-all ${
                            isSelected
                              ? "bg-blue-50/80 border-[#0a2558] text-[#0a2558] ring-2 ring-[#0a2558]/20 font-medium"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <TypeIcon className={`w-4 h-4 ${isSelected ? "text-[#0a2558]" : "text-slate-400"}`} />
                          <span className="font-medium text-xs mt-0.5">{type.label}</span>
                          <span className="text-[10px] text-slate-400">{type.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Material Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masterclass: Atmospheric Governing Equations & Primitive Systems"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[var(--radius)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a2558] text-xs font-semibold"
                  />
                </div>

                {/* Subject & Topic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Subject *</label>
                    <select
                      value={uploadFormData.subject}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0a2558] text-xs font-medium"
                    >
                      {availableSubjects.map((s, idx) => (
                        <option key={idx} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="custom">+ Enter Custom Subject</option>
                    </select>

                    {uploadFormData.subject === "custom" && (
                      <input
                        type="text"
                        placeholder="Type custom subject name..."
                        value={uploadFormData.customSubject}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, customSubject: e.target.value })}
                        className="w-full mt-2 px-3 py-1.5 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a2558]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Topic Covered *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Navier-Stokes in Sigma Coordinates"
                      value={uploadFormData.topic}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, topic: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-[var(--radius)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a2558] text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Hidden Real File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept={
                    uploadFormData.type === "ppt"
                      ? ".ppt,.pptx"
                      : uploadFormData.type === "pdf"
                      ? ".pdf"
                      : uploadFormData.type === "video"
                      ? ".mp4,.webm,.mkv,.mov"
                      : ".pdf,.doc,.docx,.ppt,.pptx,.mp4"
                  }
                  className="hidden"
                />

                {/* URL or Upload File Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-slate-700">
                      {uploadFormData.type === "video" ? "Upload Video File or Embed Stream URL" : "Select Local File (PPTX / PDF / DOCX)"} *
                    </label>
                    {uploadFormData.type === "video" && (
                      <span className="text-[10px] text-blue-600 font-medium">Supports MP4 file upload or Web stream</span>
                    )}
                  </div>

                  {/* Dropzone Container */}
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
                    className={`p-4 rounded-[var(--radius)] border-2 border-dashed transition-all cursor-pointer text-center relative ${
                      isDraggingFile
                        ? "border-[#0a2558] bg-blue-50 ring-2 ring-blue-200"
                        : selectedFileObj || uploadFormData.fileName
                        ? "border-emerald-400 bg-emerald-50/50"
                        : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {selectedFileObj || uploadFormData.fileName ? (
                      <div className="flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[var(--radius)] bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-xs truncate max-w-xs">
                              {selectedFileObj?.name || uploadFormData.fileName}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <span>{uploadFormData.size}</span>
                              <span>•</span>
                              <span>File ready for upload & preview</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-[var(--radius)] border border-slate-200 text-[11px] shadow-2xs"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearSelectedFile();
                            }}
                            className="p-1 rounded-[var(--radius)] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-8 h-8 text-[#0a2558] mx-auto mb-1 opacity-80 animate-pulse" />
                        <p className="text-xs font-medium text-slate-700">
                          Click to browse or drop {uploadFormData.type === "ppt" ? "PowerPoint (.ppt, .pptx)" : uploadFormData.type === "pdf" ? "Document (.pdf)" : uploadFormData.type === "video" ? "Video (.mp4, .webm)" : "File"} here
                        </p>
                        <p className="text-[10px] text-slate-400">
                          File verified & instant local preview rendered automatically
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Video Stream URL Option */}
                  {uploadFormData.type === "video" && (
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Or enter Stream / Embed / YouTube URL:
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/embed/... or direct MP4 URL"
                        value={uploadFormData.url.startsWith("data:") ? "" : uploadFormData.url}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, url: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-[var(--radius)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a2558] text-xs font-semibold"
                      />
                    </div>
                  )}
                </div>

                {/* Duration / Pages & File Size */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadFormData.type === "video" ? (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 45 mins"
                        value={uploadFormData.duration}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, duration: e.target.value })}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Pages / Slides</label>
                      <input
                        type="number"
                        placeholder="e.g. 36"
                        value={uploadFormData.pages}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, pages: e.target.value })}
                        className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">File Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 14.8 MB"
                      value={uploadFormData.size}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, size: e.target.value })}
                      className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Workflow Status</label>
                    <select
                      value={uploadFormData.status}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 bg-slate-50 text-xs font-medium"
                    >
                      <option value="Published">Published</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Description & Key Topics</label>
                  <textarea
                    rows="2"
                    placeholder="Outline key learning outcomes, equations, and procedures..."
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[var(--radius)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a2558] text-xs font-semibold resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#0a2558] hover:bg-[#071739] text-white font-semibold rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {isSubmitting ? "Publishing..." : "Publish to Content Library"}
                  </button>
                </div>
              </form>

              {/* RIGHT COLUMN: LIVE REAL-TIME MATERIAL PREVIEW BOX (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Live Material Preview Box</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto Updating
                  </span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-[var(--radius)] border border-slate-200/80 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    
                    {/* Live Badge & Status */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getTypeBadge(uploadFormData.type).badgeBg}`}>
                        {uploadFormData.type === "ppt" ? <Presentation className="w-3 h-3" /> : uploadFormData.type === "video" ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        <span>{uploadFormData.format}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-[var(--radius)] text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(uploadFormData.status)}`}>
                        {uploadFormData.status}
                      </span>
                    </div>

                    {/* Live Title & Description */}
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {uploadFormData.title || "Material Title Preview"}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {uploadFormData.description || "Description and analytical scope will appear here as you type."}
                      </p>
                    </div>

                    {/* Subject & Topic Tagging */}
                    <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium truncate">
                        <BookOpen className="w-3.5 h-3.5 text-[#0a2558] shrink-0" />
                        <span className="text-slate-400 font-medium">Subject:</span>
                        <span className="truncate">{uploadFormData.subject === "custom" ? (uploadFormData.customSubject || "Custom Subject") : uploadFormData.subject}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-slate-400 font-medium">Topic:</span>
                        <span className="truncate">{uploadFormData.topic || "Specified Topic Covered"}</span>
                      </div>
                    </div>

                    {/* Live Miniature Visual Canvas (Slide / Document / Video Mock) */}
                    {uploadFormData.type === "ppt" ? (
                      <div className="aspect-video bg-gradient-to-br from-slate-900 to-[#0a2558] rounded-[var(--radius)] p-3 text-white flex flex-col justify-between shadow-inner">
                        <div className="flex items-center justify-between text-[9px] text-slate-300">
                          <span className="font-medium text-amber-300">IMD PPT DECK</span>
                          <span>Slide 1 of {uploadFormData.pages || 36}</span>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-extrabold text-xs text-white line-clamp-1">{uploadFormData.title || "Lecture Presentation"}</p>
                          <p className="text-[9px] text-blue-200 line-clamp-1">{uploadFormData.topic || "Core Topic"}</p>
                        </div>
                        <div className="flex items-center justify-between text-[8px] text-slate-400">
                          <span>{currentUser?.name || "Dr. Amit Sengupta"}</span>
                          <span>MoES / IMD</span>
                        </div>
                      </div>
                    ) : uploadFormData.type === "video" ? (
                      <div className="aspect-video bg-slate-950 rounded-[var(--radius)] flex items-center justify-center text-white relative shadow-inner">
                        <div className="text-center space-y-1.5">
                          <Play className="w-8 h-8 text-amber-400 mx-auto opacity-90" />
                          <p className="text-[10px] text-slate-300 font-mono">{uploadFormData.duration || "45 mins"} • Ready to Stream</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-[var(--radius)] p-3 border border-slate-200 text-[10px] space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between font-medium text-slate-800 border-b pb-1">
                          <span>TECHNICAL REPORT</span>
                          <span className="text-blue-600">{uploadFormData.pages || 36} Pgs • {uploadFormData.size}</span>
                        </div>
                        <p className="font-semibold text-slate-700 line-clamp-2">{uploadFormData.topic || "Scientific topic index and derivations."}</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata Stamp Footer */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Author: <b className="text-slate-800">{currentUser?.name || "Dr. Amit Sengupta"}</b></span>
                    <span>Verified Format</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ 6. IN-APP FULL MEDIA PREVIEW (PPT & PDF FULL PAGES + FULLSCREEN) ═════════ */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className={`bg-white rounded-[var(--radius)] border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
            isFullscreenPreview 
              ? "w-screen h-screen rounded-none max-w-none max-h-none" 
              : "max-w-5xl w-full max-h-[92vh]"
          }`}>
            
            {/* Top Command Bar */}
            <div className="bg-[#0a2558] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius)] bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  {previewItem.type === "video" ? <Video className="w-5 h-5" /> : previewItem.type === "ppt" ? <Presentation className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold truncate max-w-lg">{previewItem.title}</h3>
                  <p className="text-[11px] text-blue-200">
                    Subject: <b>{previewItem.subject}</b> • Topic: <b>{previewItem.topic}</b>
                  </p>
                </div>
              </div>

              {/* Top Controls: Zoom, Fullscreen, Close */}
              <div className="flex items-center gap-2">
                {/* Fullscreen Toggle Button */}
                <button
                  onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-[var(--radius)] text-xs font-medium border border-white/20 transition-colors"
                  title={isFullscreenPreview ? "Exit Fullscreen" : "Open Full Screen View"}
                >
                  {isFullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFullscreenPreview ? "Exit Fullscreen" : "Full Screen View"}</span>
                </button>

                <button 
                  onClick={() => { setPreviewItem(null); setAiSummaryResult(null); setIsFullscreenPreview(false); }}
                  className="text-white/70 hover:text-white p-1.5 rounded-[var(--radius)] hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs bg-slate-100/70">
              
              {/* ─── 1. FULL PPT SLIDESHOW VIEWER ─── */}
              {previewItem.type === "ppt" ? (
                <div className="space-y-3">
                  
                  {/* Slide Stage Container */}
                  <div className="aspect-video max-h-[540px] w-full mx-auto shadow-2xl rounded-[var(--radius)] overflow-hidden">
                    {pptSlides[currentSlideIndex]?.render || (
                      <div className="h-full bg-slate-900 text-white flex items-center justify-center font-medium">
                        Slide {currentSlideIndex + 1}
                      </div>
                    )}
                  </div>

                  {/* Slide Navigation Toolbar */}
                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-[var(--radius)] text-xs font-medium hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Slide</span>
                      </button>

                      <button
                        onClick={() => setCurrentSlideIndex(Math.min(pptSlides.length - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === pptSlides.length - 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-[var(--radius)] text-xs font-medium hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <span>Next Slide</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Slide Thumbnails & Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-700">
                        Slide <b className="text-blue-900">{currentSlideIndex + 1}</b> of {pptSlides.length}
                      </span>
                      <div className="hidden sm:flex items-center gap-1 ml-3">
                        {pptSlides.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`w-7 h-7 rounded-[var(--radius)] text-xs font-medium transition-all ${
                              currentSlideIndex === idx
                                ? "bg-[#0a2558] text-white shadow-md scale-105"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-semibold hidden md:block">
                      {pptSlides[currentSlideIndex]?.title}
                    </div>
                  </div>
                </div>
              ) : previewItem.type === "video" ? (
                
                /* ─── 2. FULL VIDEO PLAYER VIEWER ─── */
                <div className="space-y-3">
                  <div className="aspect-video max-h-[540px] w-full mx-auto bg-black rounded-[var(--radius)] overflow-hidden shadow-2xl relative">
                    <iframe
                      src={formatVideoEmbedUrl(previewItem.url)}
                      title={previewItem.title || "Lecture Video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      Duration: {previewItem.duration || "48 mins"} • HD 1080p Stream
                    </span>
                    <span className="text-slate-500 font-medium">
                      Subject: {previewItem.subject}
                    </span>
                  </div>
                </div>
              ) : (

                /* ─── 3. FULL MULTI-PAGE PDF & LAB MANUAL VIEWER ─── */
                <div className="space-y-3">
                  
                  {/* Page Navigation & Controls Toolbar */}
                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                        disabled={currentPageIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-[var(--radius)] text-xs font-medium hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Page</span>
                      </button>

                      <button
                        onClick={() => setCurrentPageIndex(Math.min(pdfPages.length - 1, currentPageIndex + 1))}
                        disabled={currentPageIndex === pdfPages.length - 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-[var(--radius)] text-xs font-medium hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <span>Next Page</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-700">
                        Page <b className="text-blue-900">{currentPageIndex + 1}</b> of {pdfPages.length} (Total {previewItem.pages || 36} Pages in Handbook)
                      </span>
                      <div className="hidden sm:flex items-center gap-1 ml-3">
                        {pdfPages.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentPageIndex(idx)}
                            className={`w-7 h-7 rounded-[var(--radius)] text-xs font-medium transition-all ${
                              currentPageIndex === idx
                                ? "bg-[#0a2558] text-white shadow-md scale-105"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-semibold hidden md:block">
                      {pdfPages[currentPageIndex]?.title}
                    </div>
                  </div>

                  {/* Document Page Display Stage */}
                  <div className="w-full max-w-4xl mx-auto shadow-2xl rounded-[var(--radius)] overflow-hidden">
                    {pdfPages[currentPageIndex]?.render}
                  </div>
                </div>
              )}

              {/* ─── 4. AI SUMMARY NOTES DRAWER ─── */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-[var(--radius)] p-4 sm:p-5 border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-extrabold text-slate-900 text-xs">AI Lecture & Summary Notes</span>
                  </div>
                  <button
                    onClick={() => handleGenerateAiSummary(previewItem)}
                    disabled={aiSummaryGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-100 text-[#0a2558] font-medium rounded-[var(--radius)] text-xs border border-blue-200 shadow-sm transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiSummaryGenerating ? "animate-spin" : ""}`} />
                    <span>{aiSummaryGenerating ? "Generating..." : "Generate AI Summary"}</span>
                  </button>
                </div>

                {aiSummaryResult ? (
                  <div className="text-xs text-slate-800 whitespace-pre-line bg-white/90 p-4 rounded-[var(--radius)] border border-blue-100 font-medium leading-relaxed shadow-xs">
                    {aiSummaryResult}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    Click "Generate AI Summary" to automatically extract conceptual highlights, key equations, and meteorological pointers with AI Module Summary.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-inner">
              <div className="text-xs text-slate-500">
                Author: <b className="text-slate-800">{previewItem.uploadedBy || "Dr. Amit Sengupta"}</b> • Published: <b className="text-slate-800">{previewItem.uploadDate}</b>
              </div>
              <button
                onClick={() => { setPreviewItem(null); setAiSummaryResult(null); setIsFullscreenPreview(false); }}
                className="px-6 py-2 bg-[#0a2558] hover:bg-[#071739] text-white font-medium rounded-[var(--radius)] text-xs shadow-md transition-all"
              >
                Close Full Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
