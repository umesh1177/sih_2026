import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Video, 
  Presentation, 
  FileText, 
  FileCode, 
  Plus, 
  Upload, 
  Eye, 
  Sparkles, 
  BarChart3, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Users, 
  Trash2, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ExternalLink,
  ChevronDown,
  Bookmark
} from "lucide-react";
import { api } from "../../services/api";
import { ContentGalleryPickerModal } from "./ContentGalleryPickerModal";
import { cleanSubject, cleanTopic } from "./ContentLibraryView";

export const TrainerCurriculumStudio = ({
  course,
  initialSubjectId,
  currentUser,
  onBack,
  onOpenContentLibrary,
  onOpenAiGenerator,
  onOpenAnalytics
}) => {
  const [currentCourse, setCurrentCourse] = useState(course);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    initialSubjectId || course?.subjects?.[0]?.id || "subj_01"
  );
  const [loading, setLoading] = useState(false);
  const [galleryPickerModule, setGalleryPickerModule] = useState(null); // module object
  const [previewItem, setPreviewItem] = useState(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [notification, setNotification] = useState(null);

  // New Module Creation State
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    duration: "4 Hours",
    description: ""
  });

  // Sync course state
  useEffect(() => {
    if (course?.id) {
      fetchFreshCourseData();
    }
  }, [course?.id]);

  const fetchFreshCourseData = async () => {
    try {
      const res = await api.getCourseById(course.id);
      if (res.success && res.course) {
        setCurrentCourse(res.course);
        if (!selectedSubjectId && res.course.subjects?.length > 0) {
          setSelectedSubjectId(res.course.subjects[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to refresh course studio:", err);
    }
  };

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const currentSubject = currentCourse?.subjects?.find(
    s => s.id === selectedSubjectId || s.name === selectedSubjectId
  ) || currentCourse?.subjects?.[0] || {
    id: "subj_01",
    name: "Atmospheric Dynamics & Modeling",
    code: "S1",
    modules: []
  };

  // Calculate material totals
  const allModules = currentSubject?.modules || [];
  let totalVideos = 0;
  let totalPpts = 0;
  let totalPdfs = 0;
  let totalManuals = 0;

  allModules.forEach(mod => {
    (mod.materials || []).forEach(mat => {
      const t = (mat.type || "").toLowerCase();
      if (t.includes("video") || t.includes("lecture") || t.includes("mp4")) totalVideos++;
      else if (t.includes("ppt") || t.includes("presentation")) totalPpts++;
      else if (t.includes("manual") || t.includes("lab")) totalManuals++;
      else totalPdfs++;
    });
  });

  const handleRemoveMaterial = async (moduleId, materialId, materialTitle) => {
    if (!window.confirm(`Remove "${materialTitle}" from this curriculum module?`)) return;

    try {
      setLoading(true);
      const res = await api.removeMaterialFromModule(
        currentCourse.id, 
        currentSubject.id, 
        moduleId, 
        materialId
      );

      if (res.success) {
        showToast(`Removed "${materialTitle}" from module.`);
        await fetchFreshCourseData();
      } else {
        showToast(res.message || "Failed to remove material", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialAttachedSuccess = async (moduleId, attachedItems) => {
    showToast(`Attached ${attachedItems.length} material(s) to module!`);
    await fetchFreshCourseData();
  };

  const handleCreateModuleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) {
      showToast("Please enter a module title / topic", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: moduleForm.title.trim(),
        duration: moduleForm.duration.trim() || "4 Hours",
        description: moduleForm.description.trim() || "Operational module guidelines and instructional sessions."
      };
      const res = await api.addModuleToSubject(currentCourse.id, currentSubject.id, payload);
      if (res.success) {
        showToast(`Module "${payload.title}" created successfully!`);
        setIsCreateModuleModalOpen(false);
        setModuleForm({ title: "", duration: "4 Hours", description: "" });
        await fetchFreshCourseData();
        if (res.module) {
          setGalleryPickerModule(res.module);
        }
      } else {
        showToast(res.message || "Failed to create module", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (!window.confirm(`Delete module "${moduleTitle}" and all attached learning resources?`)) return;

    setLoading(true);
    try {
      const res = await api.deleteModuleFromSubject(currentCourse.id, currentSubject.id, moduleId);
      if (res.success) {
        showToast(`Module "${moduleTitle}" removed.`);
        await fetchFreshCourseData();
      } else {
        showToast(res.message || "Failed to delete module", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ─── PPT & PDF PREVIEW DEFINITIONS ───
  const getPptSlides = (item) => {
    const subjName = cleanSubject(currentSubject?.name || "Atmospheric Dynamics & Modeling");
    const topic = cleanTopic(item.topic || item.title || "Atmospheric Primitive Equations");
    const author = item.uploadedBy || currentUser?.name || "Dr. Amit Sengupta";

    return [
      {
        slideNum: 1,
        title: item.title,
        badge: "Slide 1 • Title & Operational Context",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-white bg-gradient-to-br from-[#071739] via-[#0a2558] to-[#12397e] rounded-2xl shadow-inner">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs tracking-wider uppercase">
                <Presentation className="w-4 h-4" />
                <span>IMD / MoES Lecture Masterclass Deck</span>
              </div>
              <span className="text-xs font-mono text-blue-200">CURRICULUM DECK</span>
            </div>
            <div className="space-y-3 my-auto py-6">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 font-extrabold text-xs rounded-lg border border-amber-300/30 inline-block">
                {subjName}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                {item.title}
              </h2>
              <p className="text-xs text-blue-200 font-medium max-w-2xl">
                Topic: <b className="text-white">{topic}</b>
              </p>
            </div>
            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
              <span>Lead Instructor: <b className="text-white">{author}</b></span>
              <span>Slide 1 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 2,
        title: "Primitive Equations & Hydrostatic System",
        badge: "Slide 2 • Governing Mathematical Dynamics",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#0a2558]">1. Primitive Equations in Hydrostatic Framework</h3>
              <span className="text-xs font-bold text-slate-400">{subjName}</span>
            </div>
            <div className="space-y-4 my-auto py-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-xs text-slate-700">Momentum Conservation in σ-Coordinate System:</p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-blue-900 font-bold overflow-x-auto">
                  d(v)/dt + f(k × v) = -∇Φ - σ α ∇p_s + F_friction
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <h5 className="font-bold text-[#0a2558]">Hydrostatic Balance</h5>
                  <p className="font-mono text-xs font-semibold text-slate-800">∂Φ / ∂ln(σ) = -R_d · T_v</p>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <h5 className="font-bold text-indigo-900">Mass Continuity</h5>
                  <p className="font-mono text-xs font-semibold text-slate-800">∂p_s/∂t + ∇·(p_s v) + ∂(p_s σ̇)/∂σ = 0</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Topic: {topic}</span>
              <span>Slide 2 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 3,
        title: "Arakawa Grid Staggering & CFL Condition",
        badge: "Slide 3 • Discrete Numerical Meshes",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#0a2558]">2. Arakawa-C Staggering & CFL Stability</h3>
              <span className="text-xs font-bold text-slate-400">{subjName}</span>
            </div>
            <div className="space-y-4 my-auto py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <h5 className="font-bold text-amber-900">Arakawa A-Grid</h5>
                  <p className="text-[11px] text-slate-600">All variables co-located at cell centers.</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 ring-2 ring-emerald-400/40">
                  <h5 className="font-bold text-emerald-900">Arakawa C-Grid (WRF Standard)</h5>
                  <p className="text-[11px] text-slate-600">Velocities staggered on faces; scalars at center.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <h5 className="font-bold text-blue-900">Arakawa B-Grid (GFS Standard)</h5>
                  <p className="text-[11px] text-slate-600">Velocity vectors staggered at corners.</p>
                </div>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1">
                <span className="text-amber-300 font-bold">CFL Stability Limit:</span>
                <span className="text-emerald-300 ml-2">Δt ≤ Δx / (√2 · c_max) ≈ 6 × Δx (in km)</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Topic: {topic}</span>
              <span>Slide 3 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 4,
        title: "Sub-Grid Scale Physical Parameterizations",
        badge: "Slide 4 • Physics Parameterization",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#0a2558]">3. Boundary Layer & Microphysics Closures</h3>
              <span className="text-xs font-bold text-slate-400">{subjName}</span>
            </div>
            <div className="space-y-3 my-auto py-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                  <h5 className="font-bold text-purple-900">PBL Closures</h5>
                  <p className="text-[11px] text-slate-600">YSU Non-local-K, MYJ 1.5-order TKE, and ACM2 convective schemes.</p>
                </div>
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                  <h5 className="font-bold text-blue-900">Microphysics Schemes</h5>
                  <p className="text-[11px] text-slate-600">WSM6 6-class hydrometeors & Thompson 2-moment ice predictive scheme.</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Topic: {topic}</span>
              <span>Slide 4 of 5</span>
            </div>
          </div>
        )
      },
      {
        slideNum: 5,
        title: "Operational Checklist & Skill Verification",
        badge: "Slide 5 • Protocol & Takeaways",
        render: (
          <div className="h-full flex flex-col justify-between p-6 sm:p-10 text-slate-900 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-[#0a2558]">4. Operational Forecast Verification Takeaways</h3>
              <span className="text-xs font-bold text-slate-500">{subjName}</span>
            </div>
            <div className="space-y-3 my-auto py-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5 text-[11px] text-slate-700">
                <p>✅ Enforce non-hydrostatic primitives for tropical severe convective weather.</p>
                <p>✅ Check Arakawa-C staggered grid coupling to prevent 2Δx pressure checkerboarding.</p>
                <p>✅ Validate numerical predictions against Doppler Radar PACP & AWS observations with ETS & RMSE.</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authorized by: {author}</span>
              <span>Slide 5 of 5</span>
            </div>
          </div>
        )
      }
    ];
  };

  const getPdfPages = (item) => {
    const subjName = cleanSubject(currentSubject?.name || "Atmospheric Dynamics & Modeling");
    const topic = cleanTopic(item.topic || item.title || "Standard Operational Technical Guide");
    const author = item.uploadedBy || currentUser?.name || "Dr. Amit Sengupta";

    return [
      {
        pageNum: 1,
        title: "Executive Summary & Metadata",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-xl border border-slate-200 space-y-6 text-slate-800 text-xs min-h-[560px] font-sans">
            <div className="flex items-center justify-between border-b-2 border-[#0a2558] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0a2558] text-white font-black flex items-center justify-center text-sm">
                  IMD
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase text-[#0a2558]">Ministry of Earth Sciences • Govt. of India</h2>
                  <p className="text-[10px] text-slate-500 font-semibold">India Meteorological Department • Training Directorate</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <p>DOC ID: <b className="text-slate-800">MOES-CURRICULUM-2026</b></p>
                <p>SUBJECT: <b className="text-blue-900">{subjName}</b></p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                {item.title}
              </h1>
              <p className="text-xs font-bold text-slate-600">
                Curriculum Topic: <span className="text-[#0a2558]">{topic}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] leading-relaxed">
              <h4 className="font-black text-slate-900 uppercase">Operational Overview:</h4>
              <p className="text-slate-700">
                This study guide covers standard technical protocols, prognostic modeling formulations, and practical evaluation metrics designed for meteorological officers.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-[11px]">
              <div><p className="text-slate-400 font-bold">Author</p><p className="font-bold text-slate-800">{author}</p></div>
              <div><p className="text-slate-400 font-bold">Format</p><p className="font-bold text-slate-800">{item.type?.toUpperCase() || "PDF"}</p></div>
              <div><p className="text-slate-400 font-bold">Size</p><p className="font-bold text-slate-800">{item.size || "3.2 MB"}</p></div>
              <div><p className="text-slate-400 font-bold">Pages</p><p className="font-bold text-slate-800">{item.pages || "4 Pgs"}</p></div>
            </div>
          </div>
        )
      },
      {
        pageNum: 2,
        title: "Mathematical Formulations & Equations",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-xl border border-slate-200 space-y-5 text-slate-800 text-xs min-h-[560px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-xs text-[#0a2558] uppercase">Section 2: Analytical Governing Physics</h3>
              <span className="text-[10px] text-slate-400 font-mono">Page 2 of 4</span>
            </div>
            <div className="space-y-3 text-[11px] text-slate-700 leading-relaxed">
              <p>Continuous Navier-Stokes momentum balance in Cartesian coordinates:</p>
              <div className="p-3 bg-slate-900 text-emerald-300 font-mono rounded-xl text-xs">
                ∂u/∂t + (u·∇)u + 2(Ω × u) = -(1/ρ)∇p + g + ν∇²u
              </div>
              <p>Thermodynamic moisture advection and diabatic heating equation:</p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 font-bold">
                dθ/dt = (θ/T)(Q/c_p) + ∇·(K_h ∇θ)
              </div>
            </div>
          </div>
        )
      },
      {
        pageNum: 3,
        title: "Supercomputer HPC Execution",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-xl border border-slate-200 space-y-5 text-slate-800 text-xs min-h-[560px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-xs text-[#0a2558] uppercase">Section 3: HPC Terminal Execution Commands</h3>
              <span className="text-[10px] text-slate-400 font-mono">Page 3 of 4</span>
            </div>
            <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-xl space-y-2 border border-slate-800 shadow-inner">
              <p className="text-slate-400"># Step 1: Execute Geogrid</p>
              <p className="text-emerald-400">$ ./geogrid.exe &gt;&gt; geogrid.log 2&gt;&amp;1</p>
              <p className="text-slate-400 pt-1"># Step 2: Unpack GFS GRIB2 files</p>
              <p className="text-emerald-400">$ ./ungrib.exe &amp;&amp; ./metgrid.exe</p>
              <p className="text-slate-400 pt-1"># Step 3: Run MPI Integration</p>
              <p className="text-amber-400">$ mpirun -np 64 ./wrf.exe</p>
            </div>
          </div>
        )
      },
      {
        pageNum: 4,
        title: "Quality Verification & Statistical Indices",
        render: (
          <div className="bg-white p-8 sm:p-12 shadow-sm rounded-xl border border-slate-200 space-y-5 text-slate-800 text-xs min-h-[560px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-xs text-[#0a2558] uppercase">Section 4: Skill Score Verification</h3>
              <span className="text-[10px] text-slate-400 font-mono">Page 4 of 4</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h5 className="font-bold text-slate-900">RMSE</h5>
                <p className="font-mono text-xs font-bold text-[#0a2558]">RMSE = √[ (1/N) Σ (F_i - O_i)² ]</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <h5 className="font-bold text-slate-900">Equitable Threat Score</h5>
                <p className="font-mono text-xs font-bold text-[#0a2558]">ETS = (Hits - Hits_rnd) / (Hits + FA + Miss - Hits_rnd)</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-bold">
              <span>Author: {author}</span>
              <span>MoES IMD Directorate • New Delhi</span>
            </div>
          </div>
        )
      }
    ];
  };

  const pptSlides = previewItem ? getPptSlides(previewItem) : [];
  const pdfPages = previewItem ? getPdfPages(previewItem) : [];

  const getItemIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("video") || t.includes("lecture") || t.includes("mp4")) {
      return <Video className="w-4 h-4 text-blue-600" />;
    }
    if (t.includes("ppt") || t.includes("presentation")) {
      return <Presentation className="w-4 h-4 text-purple-600" />;
    }
    if (t.includes("manual") || t.includes("lab")) {
      return <FileCode className="w-4 h-4 text-amber-600" />;
    }
    return <FileText className="w-4 h-4 text-rose-600" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${notification.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* ═════════ 1. HERO BAR & BACK TO DASHBOARD ═════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-[#0a2558] text-slate-700 hover:text-white rounded-2xl font-bold transition-all shadow-xs flex items-center gap-1.5 text-xs"
            title="Return to Trainer Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Studio</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#0a2558] border border-blue-200 rounded-md font-extrabold text-[10px] uppercase tracking-wider">
                {currentCourse?.code || "MOES-IMD-NWP-2025"}
              </span>
              <span className="text-xs font-bold text-slate-400">Curriculum Management Studio</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {currentCourse?.title || "Advanced Numerical Weather Prediction (NWP) & Data Assimilation"}
            </h1>
          </div>
        </div>

        {/* Global Action Strip */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <button
            onClick={() => onOpenContentLibrary && onOpenContentLibrary(currentSubject?.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-extrabold rounded-xl text-xs transition-colors shadow-2xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Content Library</span>
          </button>

          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 font-extrabold rounded-xl text-xs border border-blue-200 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Generate Subject Quiz</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold rounded-xl text-xs border border-purple-200 transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
            <span>Subject Analytics</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. ASSIGNED SUBJECT TABS & STATS ═════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        
        {/* Subject Header, Badges & Create Module Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0a2558] text-amber-400 font-black text-base flex items-center justify-center shadow-md">
              {currentSubject?.code || "S1"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                  {allModules.length} Modules
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Program: <b>{currentCourse?.title}</b> ({currentCourse?.code})
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {cleanSubject(currentSubject?.name || "Atmospheric Dynamics & Modeling")}
              </h2>
            </div>
          </div>

          {/* Quick Stats Badges & Create New Module Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-extrabold border border-blue-200">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>{totalVideos} Videos</span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 rounded-xl text-xs font-extrabold border border-amber-200">
              <Presentation className="w-3.5 h-3.5 text-amber-600" />
              <span>{totalPpts} PPTs</span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-900 rounded-xl text-xs font-extrabold border border-purple-200">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>{totalPdfs} PDFs</span>
            </span>

            <button
              onClick={() => setIsCreateModuleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95 ml-1"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Upload New Module</span>
            </button>
          </div>
        </div>

        {/* ═════════ 3. MODULE CARDS GRID ═════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allModules.map((moduleItem, modIdx) => {
            const materials = moduleItem.materials || [];
            return (
              <div 
                key={moduleItem.id || modIdx}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                {/* Module Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider font-extrabold">
                      MODULE {modIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{moduleItem.duration || "4 Hours"}</span>
                      </span>
                      <button
                        onClick={() => handleDeleteModule(moduleItem.id, moduleItem.title)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {cleanTopic(moduleItem.title)}
                  </h3>
                  {moduleItem.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {moduleItem.description}
                    </p>
                  )}
                </div>

                {/* Materials List */}
                <div className="space-y-2 flex-1">
                  {materials.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                      <p className="text-xs font-bold text-slate-600">No learning materials attached yet</p>
                      <p className="text-[10px] text-slate-400">Click below to upload from your Content Library</p>
                    </div>
                  ) : (
                    materials.map((mat, matIdx) => (
                      <div
                        key={mat.id || matIdx}
                        className="p-3 bg-slate-50/70 hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
                            {getItemIcon(mat.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-xs">
                              {mat.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {mat.duration || mat.pages ? `${mat.duration || `${mat.pages} Pgs`} • ` : ""}{mat.size || "3.5 MB"}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons on item */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setPreviewItem({
                                ...mat,
                                subject: currentSubject.name,
                                topic: moduleItem.title
                              });
                              setCurrentSlideIndex(0);
                              setCurrentPageIndex(0);
                            }}
                            className="p-1.5 bg-white hover:bg-[#0a2558] text-slate-600 hover:text-white border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                            title="Preview Full Material"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemoveMaterial(moduleItem.id, mat.id, mat.title)}
                            className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs opacity-0 group-hover:opacity-100"
                            title="Remove from Module"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Module Footer & "+ Upload Learning Material" Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Uploaded by: <b className="text-slate-700">{currentUser?.name || "Dr. Amit Sengupta"}</b>
                  </span>

                  <button
                    onClick={() => setGalleryPickerModule(moduleItem)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071739] text-white font-extrabold rounded-xl text-xs shadow-xs transition-all hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Learning Material</span>
                  </button>
                </div>

              </div>
            );
          })}

          {/* Add New Curriculum Module Dashed Card */}
          <div
            onClick={() => setIsCreateModuleModalOpen(true)}
            className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Add New Curriculum Module</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-0.5">
                Define a new lecture topic or practical session for {cleanSubject(currentSubject?.name)}
              </p>
            </div>
            <span className="px-4 py-1.5 bg-white text-blue-900 rounded-xl text-xs font-extrabold border border-blue-200 shadow-2xs group-hover:bg-[#0a2558] group-hover:text-white transition-colors">
              + Upload / Create Module
            </span>
          </div>
        </div>

      </div>

      {/* ═════════ MODAL: CREATE NEW MODULE ═════════ */}
      {isCreateModuleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800 my-auto">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#12397e] text-white flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  CURRICULUM STRUCTURING
                </span>
                <h3 className="text-lg font-black tracking-tight mt-1 text-white">
                  Add New Module in {cleanSubject(currentSubject?.name)}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModuleModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateModuleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">
                  Module Title / Curriculum Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tropical Easterly Jet & Monsoonal Synoptic Dynamics"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    Estimated Duration
                  </label>
                  <select
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                  >
                    <option value="2 Hours">2 Hours</option>
                    <option value="4 Hours">4 Hours</option>
                    <option value="6 Hours">6 Hours</option>
                    <option value="8 Hours">8 Hours</option>
                    <option value="12 Hours">12 Hours</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    Assigned Subject
                  </label>
                  <input
                    type="text"
                    disabled
                    value={cleanSubject(currentSubject?.name)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800">
                  Learning Objectives / Syllabus Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what meteorological concepts or hands-on procedures this module covers..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModuleModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-extrabold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                >
                  {loading ? "Creating..." : "Create Module & Select Materials"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ═════════ 4. CONTENT GALLERY PICKER MODAL ═════════ */}
      {galleryPickerModule && (
        <ContentGalleryPickerModal
          isOpen={!!galleryPickerModule}
          onClose={() => setGalleryPickerModule(null)}
          course={currentCourse}
          subject={currentSubject}
          targetModule={galleryPickerModule}
          currentUser={currentUser}
          onAttachedSuccess={handleMaterialAttachedSuccess}
          onOpenPreview={(item) => {
            setPreviewItem({
              ...item,
              subject: currentSubject.name,
              topic: galleryPickerModule.title
            });
            setCurrentSlideIndex(0);
            setCurrentPageIndex(0);
          }}
        />
      )}

      {/* ═════════ 5. FULL PREVIEW MODAL (PPT / PDF / VIDEO + FULLSCREEN) ═════════ */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
            isFullscreenPreview 
              ? "w-screen h-screen rounded-none max-w-none max-h-none" 
              : "max-w-5xl w-full max-h-[92vh]"
          }`}>
            
            {/* Top Bar */}
            <div className="bg-[#0a2558] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  {getItemIcon(previewItem.type)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold truncate max-w-lg">{previewItem.title}</h3>
                  <p className="text-[11px] text-blue-200">
                    Subject: <b>{cleanSubject(previewItem.subject)}</b> • Topic: <b>{cleanTopic(previewItem.topic)}</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
                  title={isFullscreenPreview ? "Exit Fullscreen" : "Open Full Screen View"}
                >
                  {isFullscreenPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFullscreenPreview ? "Exit Fullscreen" : "Full Screen View"}</span>
                </button>

                <button 
                  onClick={() => { setPreviewItem(null); setIsFullscreenPreview(false); }}
                  className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Stage */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs bg-slate-100/70">
              {previewItem.type === "ppt" || previewItem.type === "presentation" ? (
                <div className="space-y-3">
                  <div className="aspect-video max-h-[540px] w-full mx-auto shadow-2xl rounded-2xl overflow-hidden">
                    {pptSlides[currentSlideIndex]?.render || (
                      <div className="h-full bg-slate-900 text-white flex items-center justify-center font-bold">
                        Slide {currentSlideIndex + 1}
                      </div>
                    )}
                  </div>

                  {/* Slide controls */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-xl text-xs font-bold hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Slide</span>
                      </button>

                      <button
                        onClick={() => setCurrentSlideIndex(Math.min(pptSlides.length - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === pptSlides.length - 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-xl text-xs font-bold hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <span>Next Slide</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        Slide <b className="text-blue-900">{currentSlideIndex + 1}</b> of {pptSlides.length}
                      </span>
                      <div className="hidden sm:flex items-center gap-1 ml-3">
                        {pptSlides.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
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
                <div className="space-y-3">
                  <div className="aspect-video max-h-[540px] w-full mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <iframe
                      src={previewItem.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                      title={previewItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Page controls */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                        disabled={currentPageIndex === 0}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-xl text-xs font-bold hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous Page</span>
                      </button>

                      <button
                        onClick={() => setCurrentPageIndex(Math.min(pdfPages.length - 1, currentPageIndex + 1))}
                        disabled={currentPageIndex === pdfPages.length - 1}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2558] text-white rounded-xl text-xs font-bold hover:bg-[#071c42] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <span>Next Page</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        Page <b className="text-blue-900">{currentPageIndex + 1}</b> of {pdfPages.length}
                      </span>
                      <div className="hidden sm:flex items-center gap-1 ml-3">
                        {pdfPages.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentPageIndex(idx)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
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

                  <div className="w-full max-w-4xl mx-auto shadow-2xl rounded-2xl overflow-hidden">
                    {pdfPages[currentPageIndex]?.render}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Author: <b className="text-slate-800">{previewItem.uploadedBy || "Dr. Amit Sengupta"}</b>
              </span>
              <button
                onClick={() => { setPreviewItem(null); setIsFullscreenPreview(false); }}
                className="px-6 py-2 bg-[#0a2558] hover:bg-[#071739] text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
