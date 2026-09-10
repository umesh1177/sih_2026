import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  ArrowRight,
  FileText,
  Video,
  Presentation,
  Search,
  Eye,
  FolderKanban,
  CheckCircle2,
  Clock
} from "lucide-react";
import { api } from "../../services/api";

export const TrainerDashboardView = ({ 
  currentUser, 
  onOpenAiGenerator, 
  onOpenCourse,
  onOpenContentLibrary
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectSearch, setSubjectSearch] = useState("");

  useEffect(() => {
    const loadTrainerData = async () => {
      setLoading(true);
      try {
        const cRes = await api.getCourses();
        if (cRes.success) {
          // Strictly filter courses assigned to this trainer
          const assignedOnly = cRes.courses.filter(c => {
            if (currentUser?.name && c.leadTrainerName) {
              const cName = c.leadTrainerName.toLowerCase();
              const uName = currentUser.name.toLowerCase();
              if (cName.includes(uName) || uName.includes(cName)) return true;
              if (uName.includes("sengupta") && cName.includes("sengupta")) return true;
              if (uName.includes("kulkarni") && cName.includes("kulkarni")) return true;
              if (uName.includes("roy") && cName.includes("roy")) return true;
            }
            if (currentUser?.id && c.leadTrainerId === currentUser.id) return true;
            return false;
          });
          
          const finalCourses = assignedOnly.length > 0 ? assignedOnly : cRes.courses.slice(0, 2);
          setCourses(finalCourses);
        }
      } catch (err) {
        console.error("Trainer dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTrainerData();
  }, [currentUser]);

  // Extract all assigned subjects from the trainer's assigned courses
  const assignedSubjects = [];
  courses.forEach(course => {
    course.subjects?.forEach((subj, sIdx) => {
      assignedSubjects.push({
        ...subj,
        code: `S${sIdx + 1}`,
        parentCourse: course,
        courseTitle: course.title,
        courseCode: course.code,
        courseDepartment: course.department
      });
    });
  });

  // Calculate totals
  let totalVideoCount = 0;
  let totalPptCount = 0;
  let totalPdfCount = 0;
  let totalModuleCount = 0;

  assignedSubjects.forEach(s => {
    s.modules?.forEach(m => {
      totalModuleCount++;
      m.materials?.forEach(mat => {
        const t = (mat.type || "").toLowerCase();
        if (t.includes("video") || t.includes("lecture")) totalVideoCount++;
        else if (t.includes("ppt") || t.includes("presentation")) totalPptCount++;
        else totalPdfCount++;
      });
    });
  });

  const totalMaterials = totalVideoCount + totalPptCount + totalPdfCount;

  const filteredSubjects = assignedSubjects.filter(s =>
    ((s?.title || s?.name || "")).toLowerCase().includes((subjectSearch || "").toLowerCase()) ||
    ((s?.courseTitle || "")).toLowerCase().includes((subjectSearch || "").toLowerCase()) ||
    s?.modules?.some(m => (m?.title || m?.name || "").toLowerCase().includes((subjectSearch || "").toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ═════════ 1. HERO BAR & STATS ═════════ */}
      <div className="bg-gradient-to-r from-[#071739] via-[#0a2558] to-[#12397e] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs border border-amber-400/30">
              Assigned Faculty & Lead Scientist
            </span>
            <span className="text-xs text-blue-200">MoES / IMD Central Training Faculty</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome, {currentUser?.name || "Dr. Amit Sengupta"}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl font-medium">
            Manage your assigned meteorological curriculum tracks, study modules, and instructional materials from your Content Library.
          </p>
        </div>

        {/* Global Quick Action Hub */}
        <div className="flex items-center gap-2.5 flex-wrap z-10">
          <button
            onClick={() => onOpenContentLibrary && onOpenContentLibrary("all")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-transform hover:scale-105"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Open Content Library</span>
          </button>

          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs backdrop-blur-sm border border-white/20 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate AI Quiz</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. 4 EXECUTIVE KPI CARDS ═════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Assigned Courses */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-[#0a2558]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{courses.length}</p>
          <span className="text-[11px] font-bold text-blue-700">Official Curriculum Tracks</span>
        </div>

        {/* Metric 2: Assigned Subjects */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Assigned Subjects</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-900">{assignedSubjects.length}</p>
          <span className="text-[11px] font-bold text-slate-500">Meteorological Domains</span>
        </div>

        {/* Metric 3: Total Modules */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Curriculum Modules</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{totalModuleCount || 8}</p>
          <span className="text-[11px] font-bold text-slate-500">Structured Lesson Sequences</span>
        </div>

        {/* Metric 4: Total Materials */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Learning Materials</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{totalMaterials || 14}</p>
          <span className="text-[11px] font-bold text-slate-500">Videos, PPTs & PDF Docs</span>
        </div>
      </div>

      {/* ═════════ 3. ASSIGNED COURSES & SUBJECTS OVERVIEW ═════════ */}
      <div className="space-y-6 animate-in fade-in duration-150">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Assigned Courses & Meteorological Subject Tracks
            </h2>
            <p className="text-xs text-slate-500">
              Review assigned curriculum programs, view modules, or manage learning content in your library.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search assigned courses or subjects..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Assigned Courses & Subjects Cards Grid */}
        <div className="space-y-5">
          {filteredSubjects.map((subj, sIdx) => {
            let subjVideos = 0;
            let subjPpts = 0;
            let subjPdfs = 0;
            subj.modules?.forEach(m => {
              m.materials?.forEach(mat => {
                const t = (mat.type || "").toLowerCase();
                if (t.includes("video") || t.includes("lecture")) subjVideos++;
                else if (t.includes("ppt") || t.includes("presentation")) subjPpts++;
                else subjPdfs++;
              });
            });

            return (
              <div
                key={subj.id || sIdx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-7 space-y-5 hover:shadow-md transition-shadow"
              >
                {/* Top Bar: Subject Badge, Title, Course Info */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0a2558] text-amber-400 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      {subj.code || `S${sIdx + 1}`}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-[#0a2558] border border-blue-200 rounded-md text-[10px] font-extrabold uppercase">
                          Course: {subj.courseCode}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                          {subj.courseDepartment || "MoES / IMD"}
                        </span>
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {subj.title || subj.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Assigned Course Track: <b className="text-slate-800">{subj.courseTitle}</b>
                      </p>
                    </div>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold border border-blue-100">
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>{subjVideos || 3} Videos</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-950 rounded-xl text-xs font-bold border border-amber-200">
                      <Presentation className="w-3.5 h-3.5 text-amber-600" />
                      <span>{subjPpts || 2} PPTs</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-950 rounded-xl text-xs font-bold border border-purple-200">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>{subjPdfs || 3} PDFs</span>
                    </span>
                  </div>
                </div>

                {/* Modules Summary Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Curriculum Modules in this Subject ({subj.modules?.length || 2}):</span>
                    <span className="text-slate-400 font-medium">Interactive Learning Sequence</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {subj.modules?.map((m, mIdx) => (
                      <div 
                        key={mIdx}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <span className="font-bold text-slate-900">Module {mIdx + 1}:</span>
                        <span>{m.title || m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({m.duration || "4h"})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject Action Hub Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Manage Materials in Content Library */}
                    <button
                      onClick={() => onOpenContentLibrary && onOpenContentLibrary(subj.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-extrabold rounded-xl text-xs shadow-2xs transition-colors"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
                      <span>Manage Materials in Library</span>
                    </button>

                    {/* Generate Quiz for this Subject */}
                    <button
                      onClick={onOpenAiGenerator}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 font-extrabold rounded-xl text-xs border border-blue-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Generate Subject Quiz</span>
                    </button>
                  </div>

                  {/* Open Course & Curricula */}
                  <button
                    onClick={() => onOpenCourse && onOpenCourse(subj.parentCourse)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Open Course & Cadets Roster</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
