import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap,
  Award,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Settings,
  Edit3,
  Users,
  Sparkles,
  BarChart3,
  FileCheck2
} from "lucide-react";
import { CreateCourseModal } from "./CreateCourseModal";
import { CourseManagementHubModal } from "./CourseManagementHubModal";

export const CourseCatalogView = ({ 
  courses = [], 
  currentUser, 
  onSelectCourse, 
  onEnrollClick,
  onOpenCertificate,
  onOpenTrainerStudio,
  onRefreshCourses
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // "All" | "Enrolled" | "Available" | "Recent"

  // Admin Modals state
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

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  // Filter courses strictly assigned to Trainer when logged in as Trainer
  const effectiveBaseCourses = currentUser?.role === "trainer"
    ? courses.filter(c => {
        if (currentUser?.name && c.leadTrainerName) {
          const cName = c.leadTrainerName.toLowerCase();
          const uName = currentUser.name.toLowerCase();
          if (cName.includes(uName) || uName.includes(cName)) return true;
          if (uName.includes("sengupta") && cName.includes("sengupta")) return true;
          if (uName.includes("kulkarni") && cName.includes("kulkarni")) return true;
          if (uName.includes("roy") && cName.includes("roy")) return true;
        }
        if (currentUser?.id && c.leadTrainerId === currentUser.id) return true;
        // Check if assigned to any subject
        if (c.subjects && Array.isArray(c.subjects)) {
          return c.subjects.some(s => s.assignedTrainerId === currentUser?.id || (currentUser?.name && s.assignedTrainerName?.toLowerCase().includes(currentUser.name.toLowerCase())));
        }
        return false;
      })
    : courses;

  const coursesToFilter = (currentUser?.role === "trainer" && effectiveBaseCourses.length > 0)
    ? effectiveBaseCourses
    : (currentUser?.role === "trainer" ? courses.slice(0, 2) : courses);

  // Filter courses
  const filteredCourses = coursesToFilter.filter(course => {
    const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

    // Search query filter
    const matchesSearch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.prerequisites && JSON.stringify(course.prerequisites).toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;

    // Level filter
    const matchesLevel = selectedLevel === "All" || (course.level && course.level.includes(selectedLevel));

    // Status filter
    const matchesStatus = selectedStatus === "All" || 
      (selectedStatus === "Enrolled" && isEnrolled) ||
      (selectedStatus === "Available" && !isEnrolled) ||
      (selectedStatus === "Recent" && (Date.now() - new Date(course.createdAt || 0).getTime() < 14 * 86400000 || course.isRecent));

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const handleCourseCreatedOrUpdated = (updatedCourse) => {
    if (onRefreshCourses) onRefreshCourses();
    // Also if courseToManage was active, update it
    if (courseToManage && courseToManage.id === updatedCourse?.id) {
      setCourseToManage(updatedCourse);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner with Admin Create Course Trigger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-200/90 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0a2558] text-[10px] font-black uppercase tracking-wider">
              MoES / IMD National Curricula
            </span>
            <span className="text-xs text-slate-400 font-medium">• {courses.length} Standardized Programs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Digital Capacity Building Course Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Explore operational training tracks, numerical models, Doppler radar, and satellite meteorology syllabi.
          </p>
        </div>

        {/* Admin Action: Publish New Course */}
        {currentUser?.role === "admin" && (
          <button
            onClick={() => {
              setCourseToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-2xl text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 shrink-0 z-10"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>+ Publish New Operational Course</span>
          </button>
        )}
      </div>

      {/* ─── FILTERS & SEARCH BAR ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by title, topic, radar, NWP, cyclone or prerequisite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
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
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Curricula</option>
                <option value="Recent">Recently Added Courses</option>
              </select>
            )}
          </div>

        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
                selectedCategory === cat
                  ? "bg-[#0a2558] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── COURSE CARDS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);
          const enrolledCount = course.enrolledTraineeIds?.length || 0;
          const maxCap = course.maxEnrollment || 50;

          return (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              <div>
                {/* Thumbnail Header */}
                <div className="h-44 relative overflow-hidden bg-slate-100">
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a2558]/90 text-white shadow backdrop-blur-sm">
                      {course.code}
                    </span>
                    {currentUser?.role === "trainee" ? (
                      isEnrolled ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 shadow">
                          {course.level || "Intermediate"}
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span>{enrolledCount}/{maxCap}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Prerequisites Preview */}
                  <div className="pt-2 flex flex-wrap gap-1">
                    {(course.prerequisites || []).slice(0, 2).map((p, pIdx) => (
                      <span key={pIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                        {p}
                      </span>
                    ))}
                    {(course.prerequisites?.length || 0) > 2 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 font-bold">
                        +{course.prerequisites.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {course.subjects?.length || 2} Subjects
                </span>

                {currentUser?.role === "trainee" ? (
                  isEnrolled ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Resume Learning</span>
                    </button>
                  ) : currentUser?.status === "rejected" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`❌ Enrollment Blocked: Your officer profile verification was rejected by MoES Administrator.\n\nReason: "${currentUser.rejectionReason || 'Incomplete credentials.'}"\n\nPlease visit your Officer Profile tab to update details and resubmit.`);
                      }}
                      className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                      title="Enrollment Locked: Profile Rejected"
                    >
                      <span>🔒 Verification Rejected</span>
                    </button>
                  ) : currentUser?.status === "pending" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("⏳ Enrollment Restricted: Your officer profile is currently awaiting MoES administrative verification. Once approved, you can enroll in this course.");
                      }}
                      className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                      title="Enrollment Restricted: Awaiting Approval"
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
                      className="px-4 py-2 bg-[#1967d2] hover:bg-[#1557b0] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1 transform hover:scale-105"
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
                      className="p-2 hover:bg-slate-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200"
                      title="Edit Course Structure"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCourseToManage(course);
                      }}
                      className="px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-200" />
                      <span>Manage</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourse(course);
                    }}
                    className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <span>View Curricula</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No matching training courses found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or changing your search terms.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedLevel("All");
              setSelectedStatus("All");
            }}
            className="mt-4 px-4 py-2 bg-[#0a2558] text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT COURSE MODAL ─── */}
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

      {/* ─── MODAL: ADMIN COURSE MANAGEMENT HUB ─── */}
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
