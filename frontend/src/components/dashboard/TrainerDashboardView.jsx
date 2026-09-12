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
  Check,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  TrendingUp
} from "lucide-react";
import { api } from "../../services/api";

export const TrainerDashboardView = ({ 
  currentUser, 
  onOpenAiGenerator, 
  onOpenCourse, 
  onOpenContentLibrary,
  onOpenQuestionBank,
  onNavigatePerformance
}) => {
  const [courses, setCourses] = useState([]);
  const [integrityAlerts, setIntegrityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      const [cRes, alertRes] = await Promise.all([
        api.getCourses(),
        api.getIntegrityAlerts().catch(() => ({ success: false, alerts: [] }))
      ]);

      if (cRes.success) {
        // Filter courses where trainer is lead trainer OR assigned to a subject
        const assignedOnly = cRes.courses.filter(c => {
          if (currentUser?.id && (c.leadTrainerId === currentUser.id || c.trainerId === currentUser.id)) return true;
          if (currentUser?.name && c.leadTrainerName) {
            const cName = c.leadTrainerName.toLowerCase();
            const uName = currentUser.name.toLowerCase();
            if (cName === uName || cName.includes(uName) || uName.includes(cName)) return true;
          }
          if (c.subjects && Array.isArray(c.subjects)) {
            return c.subjects.some(s => {
              if (currentUser?.id && (s.trainerId === currentUser.id || s.facultyId === currentUser.id || s.assignedTrainerId === currentUser.id || s.leadTrainerId === currentUser.id)) return true;
              if (currentUser?.name && (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName)) {
                const sName = (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName).toLowerCase();
                const uName = currentUser.name.toLowerCase();
                if (sName === uName || sName.includes(uName) || uName.includes(sName)) return true;
              }
              return false;
            });
          }
          return false;
        });
        
        const finalCourses = currentUser?.role === "admin" ? cRes.courses : assignedOnly;
        setCourses(finalCourses);
      }

      if (alertRes?.success && Array.isArray(alertRes.alerts)) {
        setIntegrityAlerts(alertRes.alerts);
      }
    } catch (err) {
      console.error("Trainer dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainerData();
  }, [currentUser]);

  const handleGrantRetake = async (quizId, traineeId, traineeName) => {
    try {
      const res = await api.resetDisqualification(quizId, traineeId);
      if (res.success) {
        showToast(`Disqualification revoked for ${traineeName || 'cadet'}. Assessment attempt reopened!`);
        setIntegrityAlerts(prev => prev.filter(a => !(a.quizId === quizId && a.traineeId === traineeId)));
      } else {
        showToast(res.message || "Failed to reset disqualification");
      }
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  // Extract all assigned subjects from the trainer's assigned courses
  const assignedSubjects = [];
  courses.forEach(course => {
    const isLead = (currentUser?.id && (course.leadTrainerId === currentUser.id || course.trainerId === currentUser.id)) || 
      (course.leadTrainerName && currentUser?.name && (course.leadTrainerName.toLowerCase() === currentUser.name.toLowerCase() || course.leadTrainerName.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(course.leadTrainerName.toLowerCase())));

    course.subjects?.forEach((subj, sIdx) => {
      const sTrainerName = subj.trainerName || subj.facultyName || subj.trainer || subj.assignedTrainerName;
      const isSubjTrainer = (currentUser?.id && (subj.trainerId === currentUser.id || subj.facultyId === currentUser.id || subj.assignedTrainerId === currentUser.id)) || 
        (sTrainerName && currentUser?.name && (sTrainerName.toLowerCase() === currentUser.name.toLowerCase() || sTrainerName.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(sTrainerName.toLowerCase())));

      if (isLead || isSubjTrainer || currentUser?.role === "admin") {
        assignedSubjects.push({
          ...subj,
          code: `S${sIdx + 1}`,
          parentCourse: course,
          courseTitle: course.title,
          courseCode: course.code,
          courseDepartment: course.department,
          courseId: course.id
        });
      }
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. HERO BAR & INSTRUCTOR PROFILE (QUIZPORTAL CLEAN THEME) ─── */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0B3475] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#0B3475]" />
              Assigned Faculty & Lead Scientist
            </span>
            <span className="text-xs text-slate-400 font-medium">MoES / IMD Central Training Faculty</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {currentUser?.name || "Faculty Trainer"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Manage your assigned training courses, curriculum syllabi, digital media repositories, and scheduled assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {onNavigatePerformance && (
            <button
              onClick={onNavigatePerformance}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#0B3475]" />
              <span>Learner Performance</span>
            </button>
          )}

          {onOpenQuestionBank && (
            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#0B3475]" />
              <span>Question Bank</span>
            </button>
          )}

          <button
            onClick={onOpenContentLibrary}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-200" />
            <span>Open Content Library</span>
          </button>
        </div>
      </div>

      {/* ─── ASSESSMENT INTEGRITY ALERTS CARD ─── */}
      {integrityAlerts.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-red-950">
                  Assessment Integrity Alerts ({integrityAlerts.length})
                </h3>
                <p className="text-[11px] text-red-700">
                  Real-time proctoring alerts detected during assessment runs. Review and grant re-take permissions where justified.
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-900 uppercase">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {integrityAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-xl border border-red-200 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{alert.traineeName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.status === "DISQUALIFIED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                    }`}>
                      {alert.status || "DISQUALIFIED"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Assessment: <b className="text-slate-900">{alert.quizTitle}</b>
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                    <span>Violations: <b className="text-red-700">{alert.violations}</b></span>
                    <span>•</span>
                    <span>Reason: {alert.reason}</span>
                    <span>•</span>
                    <span className="font-mono">{alert.formattedTime || "Recently"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleGrantRetake(alert.quizId, alert.traineeId, alert.traineeName)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Grant Re-take</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. KPI METRICS CARDS (QUIZPORTAL STYLE) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Assigned Courses</span>
            <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
            <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-700" /> Active Programs
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B3475]">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Subjects Handled</span>
            <div className="text-2xl font-bold text-slate-900">{assignedSubjects.length}</div>
            <span className="text-[11px] text-indigo-700 font-medium">Core Syllabi</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Curriculum Modules</span>
            <div className="text-2xl font-bold text-slate-900">{totalModuleCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published Lectures
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Learning Assets</span>
            <div className="text-2xl font-bold text-slate-900">{totalMaterials}</div>
            <span className="text-[11px] text-slate-500 font-medium">Videos, PDFs & Slides</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── 3. ASSIGNED SUBJECTS & MODULE MANAGEMENT GRID ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Assigned Subject Curricula & Modules</h3>
            <p className="text-xs text-slate-400">Directly inspect course modules and launch training environments</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by course */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">All Assigned Tracks</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects or modules..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#0B3475] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((subject, idx) => (
            <div
              key={subject.id || idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0B3475] border border-blue-200">
                    {subject.courseCode || "NWP-201"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {subject.modules?.length || 0} Modules
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1 hover:text-[#0B3475] transition-colors">
                  {subject.title || subject.name || "Subject Curriculum"}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  Course: <b>{subject.courseTitle}</b>
                </p>

                {/* Modules chip preview */}
                <div className="pt-2.5 flex flex-wrap gap-1.5">
                  {(subject.modules || []).map((m, mIdx) => (
                    <span 
                      key={mIdx}
                      className="px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded text-[10px] text-slate-700 font-medium truncate max-w-[200px]"
                    >
                      {m.title || m.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-medium">
                  {subject.parentCourse?.department || "MoES Directorate"}
                </span>

                <button
                  onClick={() => onOpenCourse(subject.parentCourse)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
                >
                  <span>Open Course Overview</span>
                  <ChevronRight className="w-3 h-3 text-blue-200" />
                </button>
              </div>
            </div>
          ))}

          {filteredSubjects.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3475] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {assignedSubjects.length === 0 ? "No Course Subjects Assigned Yet" : "No Matching Subjects Found"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {assignedSubjects.length === 0 
                  ? "You have not been assigned to any course subjects yet. Once administrative allocation assigns course tracks to your faculty profile, your subjects, modules, and learning media will appear here."
                  : "No subjects match your current search query. Try clearing your filters."}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

