import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Settings,
  Edit3,
  Users
} from "lucide-react";
import { CreateCourseModal } from "./CreateCourseModal";
import { CourseManagementHubModal } from "./CourseManagementHubModal";

export const CourseCatalogView = ({ 
  courses = [], 
  currentUser, 
  activeTab = "courses",
  onNavigateCourses,
  onSelectCourse, 
  onEnrollClick,
  onOpenCertificate,
  onOpenTrainerStudio,
  onRefreshCourses
}) => {
  const isMyLearningMode = activeTab === "my-learning";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseToManage, setCourseToManage] = useState(null);

  const categories = [
    "All",
    "Atmospheric Modeling",
    "Radar & Remote Sensing",
    "Cyclone & Marine Meteorology",
    "Satellite Meteorology",
    "Agrometeorology",
    "Climate Science"
  ];

  const getBaseCourses = () => {
    if (isMyLearningMode) {
      return courses.filter(c => (c.enrolledTraineeIds || []).includes(currentUser?.id));
    }

    if (currentUser?.role === "trainer") {
      const assigned = courses.filter(c => {
        if (currentUser?.name && c.leadTrainerName) {
          const cName = c.leadTrainerName.toLowerCase();
          const uName = currentUser.name.toLowerCase();
          if (cName.includes(uName) || uName.includes(cName)) return true;
          if (uName.includes("sengupta") && cName.includes("sengupta")) return true;
          if (uName.includes("kulkarni") && cName.includes("kulkarni")) return true;
          if (uName.includes("roy") && cName.includes("roy")) return true;
        }
        if (currentUser?.id && c.leadTrainerId === currentUser.id) return true;
        if (c.subjects && Array.isArray(c.subjects)) {
          return c.subjects.some(s => s.assignedTrainerId === currentUser?.id || (currentUser?.name && s.assignedTrainerName?.toLowerCase().includes(currentUser.name.toLowerCase())));
        }
        return false;
      });
      return assigned;
    }

    return courses;
  };

  const coursesToFilter = getBaseCourses();

  const filteredCourses = coursesToFilter.filter(course => {
    const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

    const matchesSearch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.prerequisites && JSON.stringify(course.prerequisites).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || (course.level && course.level.includes(selectedLevel));

    const matchesStatus = isMyLearningMode || selectedStatus === "All" || 
      (selectedStatus === "Enrolled" && isEnrolled) ||
      (selectedStatus === "Available" && !isEnrolled) ||
      (selectedStatus === "Recent" && (Date.now() - new Date(course.createdAt || 0).getTime() < 14 * 86400000 || course.isRecent));

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const handleCourseCreatedOrUpdated = (updatedCourse) => {
    if (onRefreshCourses) onRefreshCourses();
    if (courseToManage && courseToManage.id === updatedCourse?.id) {
      setCourseToManage(updatedCourse);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-[#172033]">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 text-[#172033] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#E2E8F0]">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-semibold uppercase tracking-wider">
              {isMyLearningMode ? "Enrolled Programs" : "Institutional Curricula"}
            </span>
            <span className="text-xs text-[#475569]">
              • {filteredCourses.length} {isMyLearningMode ? "Enrolled Course(s)" : "Programs Available"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#172033]">
            {isMyLearningMode ? "My Learning & Course Tracks" : "Course Catalog"}
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {isMyLearningMode 
              ? "Access your active learning modules, interactive training laboratories, and enrolled subject syllabi."
              : "Explore operational training tracks, numerical models, remote sensing, and specialty course syllabi."}
          </p>
        </div>

        {/* Admin Action: Publish New Course */}
        {currentUser?.role === "admin" && !isMyLearningMode && (
          <button
            onClick={() => {
              setCourseToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 text-blue-100" />
            <span>Publish New Course</span>
          </button>
        )}

        {isMyLearningMode && onNavigateCourses && (
          <button
            onClick={onNavigateCourses}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4 text-blue-100" />
            <span>Browse Full Catalog</span>
          </button>
        )}
      </div>

      {/* ─── FILTERS & SEARCH BAR ─── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by title, code, description, or prerequisite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                ✕
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#172033] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="All">All Proficiency Levels</option>
              <option value="Beginner">Beginner Level</option>
              <option value="Intermediate">Intermediate Level</option>
              <option value="Advanced">Advanced Level</option>
            </select>

            {/* Status Filter for Trainees */}
            {currentUser?.role === "trainee" && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#172033] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="All">All Courses</option>
                <option value="Enrolled">My Enrolled Courses</option>
                <option value="Available">Available to Enroll</option>
              </select>
            )}

            {/* Filter for Admin */}
            {currentUser?.role === "admin" && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#172033] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="All">All Curricula</option>
                <option value="Recent">Recently Added Courses</option>
              </select>
            )}
          </div>

        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[11px] font-medium text-[#475569] uppercase mr-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors text-xs ${
                selectedCategory === cat
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-[#475569]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── COURSE CARDS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);
          const enrolledCount = course.enrolledTraineeIds?.length || 0;
          const maxCap = course.maxEnrollment || 50;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              <div>
                {/* Thumbnail Header */}
                <div className="h-40 relative overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#172033]/90 text-white backdrop-blur-xs">
                      {course.code}
                    </span>
                    {currentUser?.role === "trainee" ? (
                      isEnrolled ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-white/95 text-slate-800">
                          {course.level || "Intermediate"}
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-white/95 text-slate-800 flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#2563EB]" />
                        <span>{enrolledCount}/{maxCap}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#172033] text-sm line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Prerequisites Preview */}
                  <div className="pt-1.5 flex flex-wrap gap-1">
                    {(course.prerequisites || []).slice(0, 2).map((p, pIdx) => (
                      <span key={pIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                        {p}
                      </span>
                    ))}
                    {(course.prerequisites?.length || 0) > 2 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
                        +{course.prerequisites.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-4.5 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-[#475569] font-medium">
                  {course.subjects?.length || 2} Subjects
                </span>

                {currentUser?.role === "trainee" ? (
                  isEnrolled ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Resume Learning</span>
                    </button>
                  ) : currentUser?.status === "rejected" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`❌ Enrollment Blocked: Profile verification pending/rejected.\n\nReason: "${currentUser.rejectionReason || 'Incomplete credentials.'}"\n\nPlease visit your Profile tab to update details.`);
                      }}
                      className="px-3 py-1.5 bg-rose-100 text-rose-800 font-medium rounded-lg text-xs transition-colors"
                      title="Enrollment Locked"
                    >
                      <span>🔒 Verification Rejected</span>
                    </button>
                  ) : currentUser?.status === "pending" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("⏳ Enrollment Restricted: Profile is currently awaiting administrative verification.");
                      }}
                      className="px-3 py-1.5 bg-amber-100 text-amber-900 font-medium rounded-lg text-xs transition-colors"
                      title="Enrollment Restricted"
                    >
                      <span>⏳ Pending Approval</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEnrollClick) onEnrollClick(course);
                        else onSelectCourse(course);
                      }}
                      className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Enroll in Course</span>
                    </button>
                  )
                ) : currentUser?.role === "admin" ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseToEdit(course);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-[#2563EB] rounded-lg transition-colors border border-[#E2E8F0]"
                      title="Edit Course"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseToManage(course);
                      }}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-100" />
                      <span>Manage</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course);
                    }}
                    className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>View Curriculum</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#E2E8F0] p-8 space-y-3">
          {isMyLearningMode ? (
            <>
              <GraduationCap className="w-12 h-12 text-blue-400 mx-auto" />
              <h3 className="text-sm font-semibold text-[#172033]">You are not enrolled in any training tracks yet</h3>
              <p className="text-xs text-[#475569] max-w-md mx-auto">
                Explore the Course Catalog to enroll in training programs and specialized tracks.
              </p>
              {onNavigateCourses && (
                <button
                  onClick={onNavigateCourses}
                  className="mt-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-medium shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-blue-100" />
                  <span>Browse Course Catalog</span>
                </button>
              )}
            </>
          ) : (
            <>
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-[#172033]">No matching training courses found</h3>
              <p className="text-xs text-[#475569] mt-1">Try clearing your filters or changing your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedLevel("All");
                  setSelectedStatus("All");
                }}
                className="mt-3 px-3.5 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-medium"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT COURSE MODAL */}
      {isCreateModalOpen && (
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCourseToEdit(null);
          }}
          courseToEdit={courseToEdit}
          onCourseCreated={handleCourseCreatedOrUpdated}
        />
      )}

      {/* MODAL: ADMIN COURSE MANAGEMENT HUB */}
      {courseToManage && (
        <CourseManagementHubModal
          isOpen={!!courseToManage}
          course={courseToManage}
          onClose={() => setCourseToManage(null)}
          onCourseUpdated={handleCourseCreatedOrUpdated}
          onOpenEditCourse={(c) => {
            setCourseToManage(null);
            setCourseToEdit(c);
            setIsCreateModalOpen(true);
          }}
          onOpenStudio={(course, subjectId) => {
            setCourseToManage(null);
            if (onOpenTrainerStudio) onOpenTrainerStudio(course, subjectId);
          }}
          onOpenCertificate={onOpenCertificate}
        />
      )}

    </div>
  );
};
