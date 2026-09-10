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
  Clock, 
  Plus, 
  BarChart3, 
  Users, 
  ChevronRight, 
  GraduationCap,
  SlidersHorizontal,
  Building2,
  Filter,
  Check
} from "lucide-react";
import { api } from "../../services/api";

export const TrainerDashboardView = ({ 
  currentUser, 
  onOpenAiGenerator, 
  onOpenCourse, 
  onOpenContentLibrary,
  onOpenQuestionBank
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  useEffect(() => {
    const loadTrainerData = async () => {
      setLoading(true);
      try {
        const cRes = await api.getCourses();
        if (cRes.success) {
          // Filter courses assigned to this trainer
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
        courseDepartment: course.department,
        courseId: course.id
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

  const filteredSubjects = assignedSubjects.filter(s => {
    const matchesSearch = 
      ((s?.title || s?.name || "")).toLowerCase().includes((subjectSearch || "").toLowerCase()) ||
      ((s?.courseTitle || "")).toLowerCase().includes((subjectSearch || "").toLowerCase()) ||
      s?.modules?.some(m => (m?.title || m?.name || "").toLowerCase().includes((subjectSearch || "").toLowerCase()));

    const matchesCourse = selectedCourseFilter === "all" || s.courseId === selectedCourseFilter;

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ─── 1. HERO BAR & INSTRUCTOR PROFILE (CLEAN LIGHT THEME) ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-50/70 via-blue-50/20 to-transparent pointer-events-none" />

        <div className="space-y-2.5 z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0a2558] text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
              Assigned Faculty & Lead Scientist
            </span>
            <span className="text-xs text-slate-400 font-medium">MoES / IMD Central Training Faculty</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {currentUser?.name || "Dr. Amit Sengupta"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Manage your assigned training courses, curriculum syllabi, digital media repositories, and scheduled assessments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 flex-wrap sm:flex-nowrap">
          {onOpenQuestionBank && (
            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-[#0a2558] font-bold rounded-2xl text-xs shadow-sm transition-all transform hover:scale-105 active:scale-95"
            >
              <Layers className="w-4 h-4 text-[#0a2558]" />
              <span>Question Bank</span>
            </button>
          )}

          <button
            onClick={onOpenContentLibrary}
            className="flex items-center gap-2 px-5 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-2xl text-xs shadow-md transition-all transform hover:scale-105 active:scale-95"
          >
            <FolderKanban className="w-4 h-4 text-blue-200" />
            <span>Open Content Library</span>
          </button>
        </div>
      </div>

      {/* ─── 2. KPI METRICS CARDS (LIGHT, AIRY & MODERN) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Assigned Courses</span>
            <div className="text-2xl font-black text-slate-900">{courses.length}</div>
            <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-700" /> Active Programs
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Subjects Handled</span>
            <div className="text-2xl font-black text-slate-900">{assignedSubjects.length}</div>
            <span className="text-[11px] text-indigo-700 font-bold">Core Syllabi</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Curriculum Modules</span>
            <div className="text-2xl font-black text-slate-900">{totalModuleCount}</div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published Lectures
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Learning Assets</span>
            <div className="text-2xl font-black text-slate-900">{totalMaterials}</div>
            <span className="text-[11px] text-slate-500 font-medium">Videos, PDFs & Slides</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ─── 3. ASSIGNED SUBJECTS & MODULE MANAGEMENT GRID ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <h3 className="text-sm font-black text-slate-900">Your Assigned Subject Curricula & Modules</h3>
            <p className="text-xs text-slate-400">Directly inspect course modules and launch training environments</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by course */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">All Assigned Tracks</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects or modules..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject, idx) => (
            <div
              key={subject.id || idx}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a2558] text-white shadow-2xs">
                    {subject.courseCode || "NWP-201"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {subject.modules?.length || 0} Modules
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base mb-1 hover:text-blue-700 transition-colors">
                  {subject.title || subject.name || "Subject Curriculum"}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Course: <b>{subject.courseTitle}</b>
                </p>

                {/* Modules chip preview */}
                <div className="pt-3 flex flex-wrap gap-1.5">
                  {(subject.modules || []).map((m, mIdx) => (
                    <span 
                      key={mIdx}
                      className="px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[10px] text-slate-700 font-medium truncate max-w-[200px]"
                    >
                      {m.title || m.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-semibold">
                  {subject.parentCourse?.department || "MoES Directorate"}
                </span>

                <button
                  onClick={() => onOpenCourse(subject.parentCourse)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-sm transition-all transform hover:scale-105"
                >
                  <span>Open Course Overview</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
                </button>
              </div>
            </div>
          ))}

          {filteredSubjects.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No matching subjects found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
