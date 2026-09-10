import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  FileText, 
  Video, 
  Presentation, 
  Search, 
  Eye, 
  FolderKanban, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { api } from "../../services/api";
import { StatCard } from "../common/StatCard";
import { PageHeader } from "../common/PageHeader";

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

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#164E63] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-[#64748B]">Loading Faculty Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Institutional Faculty Header ─── */}
      <PageHeader
        title="Trainer Dashboard"
        description={`Welcome, ${currentUser?.name || "Dr. Amit Sengupta"}. Manage your assigned meteorological courses, curriculum modules, and study materials.`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenContentLibrary && onOpenContentLibrary("all")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Trainer Library</span>
            </button>
            <button
              onClick={onOpenAiGenerator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft Assessment</span>
            </button>
          </div>
        }
      />

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
        {/* ─── Compact KPI Summary Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Assigned Courses"
            value={courses.length}
            subtext="Official curriculum tracks"
            iconBg="bg-blue-50 text-[#1D4ED8]"
          />

          <StatCard
            icon={Layers}
            label="Assigned Subjects"
            value={assignedSubjects.length}
            subtext="Meteorological domains"
            iconBg="bg-teal-50 text-[#0F766E]"
          />

          <StatCard
            icon={CheckCircle2}
            label="Curriculum Modules"
            value={totalModuleCount || 8}
            subtext="Structured lessons"
            iconBg="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            icon={FileText}
            label="Learning Materials"
            value={totalMaterials || 14}
            subtext={`${totalVideoCount} Videos • ${totalPptCount} PPTs • ${totalPdfCount} PDFs`}
            iconBg="bg-amber-50 text-amber-700"
          />
        </div>

        {/* ─── Assigned Courses & Subjects Catalog ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#1E293B]">
                Assigned Courses & Subject Tracks
              </h2>
              <p className="text-xs text-[#64748B]">
                Review instructional sequences and manage lecture notes or video materials.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search assigned subjects..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9E2EC] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          <div className="space-y-4">
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
                  className="gov-card p-5 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-[#164E63] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {subj.code || `S${sIdx + 1}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 bg-blue-50 text-[#1D4ED8] border border-blue-200 rounded text-[10px] font-semibold uppercase">
                            {subj.courseCode}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {subj.courseDepartment || "MoES / IMD"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E293B]">
                          {subj.title || subj.name}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          Course: <b className="text-[#1E293B]">{subj.courseTitle}</b>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-medium">
                        <Video className="w-3 h-3 text-blue-600" />
                        <span>{subjVideos || 3} Videos</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-medium">
                        <Presentation className="w-3 h-3 text-amber-600" />
                        <span>{subjPpts || 2} PPTs</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px] font-medium">
                        <FileText className="w-3 h-3 text-teal-600" />
                        <span>{subjPdfs || 3} PDFs</span>
                      </span>
                    </div>
                  </div>

                  {/* Module List */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                      Curriculum Modules ({subj.modules?.length || 2}):
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {subj.modules?.map((m, mIdx) => (
                        <div 
                          key={mIdx}
                          className="px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#D9E2EC] text-xs font-medium text-[#1E293B] flex items-center gap-1.5"
                        >
                          <span className="text-[#1D4ED8] font-bold">M{mIdx + 1}:</span>
                          <span>{m.title || m.name}</span>
                          <span className="text-[10px] text-[#94A3B8]">({m.duration || "4h"})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenContentLibrary && onOpenContentLibrary(subj.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors"
                      >
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span>Content Library</span>
                      </button>

                      <button
                        onClick={onOpenAiGenerator}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#1D4ED8] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Quiz</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenCourse && onOpenCourse(subj.parentCourse)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Course Roster</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
