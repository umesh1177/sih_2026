import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Layers, 
  FileText, 
  Search, 
  FolderKanban, 
  CheckCircle2, 
  BarChart3, 
  ChevronRight, 
  GraduationCap,
  ShieldAlert,
  RotateCcw,
  TrendingUp
} from "lucide-react";
import { api } from "../../services/api";

export const TrainerDashboardView = ({ 
  currentUser, 
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
        showToast(`Disqualification revoked for ${traineeName || 'trainee'}. Assessment attempt reopened.`);
        setIntegrityAlerts(prev => prev.filter(a => !(a.quizId === quizId && a.traineeId === traineeId)));
      } else {
        showToast(res.message || "Failed to reset disqualification");
      }
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-[#475569]">Loading Trainer Portal...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-[#172033]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#172033] text-white shadow-lg border border-slate-700 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. HERO BAR & INSTRUCTOR PROFILE ─── */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" />
              Trainer Dashboard
            </span>
            <span className="text-xs text-[#475569]">Institutional Training Faculty</span>
          </div>

          <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
            Welcome back, {currentUser?.name || "Trainer"}
          </h1>

          <p className="text-xs text-[#475569] leading-relaxed">
            Manage assigned training courses, curriculum syllabi, digital learning assets, and scheduled assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {onNavigatePerformance && (
            <button
              onClick={onNavigatePerformance}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-[#E2E8F0] font-medium rounded-lg text-xs transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Learner Performance</span>
            </button>
          )}

          {onOpenQuestionBank && (
            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Question Bank</span>
            </button>
          )}

          <button
            onClick={onOpenContentLibrary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-100" />
            <span>Content Library</span>
          </button>
        </div>
      </div>

      {/* ─── ASSESSMENT INTEGRITY ALERTS CARD ─── */}
      {integrityAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-medium">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-amber-950">
                  Assessment Integrity Alerts ({integrityAlerts.length})
                </h3>
                <p className="text-[11px] text-amber-700">
                  Proctoring alerts detected during assessment runs. Review and grant re-take permissions where appropriate.
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-200 text-amber-900 uppercase">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {integrityAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-lg border border-amber-200 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172033] text-xs">{alert.traineeName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                      alert.status === "DISQUALIFIED" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                    }`}>
                      {alert.status || "DISQUALIFIED"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#475569]">
                    Assessment: <b className="text-[#172033]">{alert.quizTitle}</b>
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                    <span>Violations: <b className="text-rose-700">{alert.violations}</b></span>
                    <span>•</span>
                    <span>Reason: {alert.reason}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleGrantRetake(alert.quizId, alert.traineeId, alert.traineeName)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs transition-colors"
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

      {/* ─── 2. KPI METRICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Assigned Courses</span>
            <div className="text-2xl font-semibold text-[#172033]">{courses.length}</div>
            <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600" /> Active Programs
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Subjects Handled</span>
            <div className="text-2xl font-semibold text-[#172033]">{assignedSubjects.length}</div>
            <span className="text-[11px] text-indigo-600 font-medium">Core Syllabi</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Curriculum Modules</span>
            <div className="text-2xl font-semibold text-[#172033]">{totalModuleCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published Lectures
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Learning Assets</span>
            <div className="text-2xl font-semibold text-[#172033]">{totalMaterials}</div>
            <span className="text-[11px] text-[#475569]">Videos, PDFs & Slides</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── 3. ASSIGNED SUBJECTS & MODULE MANAGEMENT GRID ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#172033]">Assigned Subject Curricula &amp; Modules</h3>
            <p className="text-xs text-[#475569]">Inspect course modules and manage training resources</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#172033] bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
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
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((subject, idx) => (
            <div
              key={subject.id || idx}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#2563EB] border border-blue-200">
                    {subject.courseCode || "CRS-101"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {subject.modules?.length || 0} Modules
                  </span>
                </div>

                <h4 className="font-semibold text-[#172033] text-sm mb-1">
                  {subject.title || subject.name || "Subject Curriculum"}
                </h4>

                <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                  Course: <b>{subject.courseTitle}</b>
                </p>

                <div className="pt-2.5 flex flex-wrap gap-1.5">
                  {(subject.modules || []).map((m, mIdx) => (
                    <span 
                      key={mIdx}
                      className="px-2 py-0.5 bg-slate-50 border border-[#E2E8F0] rounded text-[10px] text-slate-700 font-medium truncate max-w-[200px]"
                    >
                      {m.title || m.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-400 font-medium">
                  {subject.parentCourse?.department || "General Department"}
                </span>

                <button
                  onClick={() => onOpenCourse(subject.parentCourse)}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
                >
                  <span>Open Course</span>
                  <ChevronRight className="w-3 h-3 text-blue-100" />
                </button>
              </div>
            </div>
          ))}

          {filteredSubjects.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-[#E2E8F0] p-6 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-medium text-[#172033]">
                {assignedSubjects.length === 0 ? "No Course Subjects Assigned Yet" : "No Matching Subjects Found"}
              </h4>
              <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
                {assignedSubjects.length === 0 
                  ? "You have not been assigned to any course subjects yet. Once administrative allocation assigns course tracks to your profile, your subjects and modules will appear here."
                  : "No subjects match your current search query."}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
