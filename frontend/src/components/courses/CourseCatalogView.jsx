import React, { useState } from "react";
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Clock3, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  SlidersHorizontal,
  GraduationCap
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { EmptyState } from "../common/EmptyState";

export const CourseCatalogView = ({ 
  courses, 
  currentUser, 
  onSelectCourse, 
  onEnrollClick,
  onOpenAiAdvisor
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

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
        return false;
      })
    : courses;

  const coursesToFilter = (currentUser?.role === "trainer" && effectiveBaseCourses.length > 0)
    ? effectiveBaseCourses
    : (currentUser?.role === "trainer" ? courses.slice(0, 2) : courses);

  const filteredCourses = coursesToFilter.filter(course => {
    const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

    const matchesSearch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.prerequisites && JSON.stringify(course.prerequisites).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || (course.level && course.level.includes(selectedLevel));
    const matchesStatus = selectedStatus === "All" || 
      (selectedStatus === "Enrolled" && isEnrolled) ||
      (selectedStatus === "Available" && !isEnrolled);

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ─── Institutional Header ─── */}
      <PageHeader
        title="Course Catalog"
        description="Standardized capacity building curricula for atmospheric scientists, Doppler radar analysts, and operational meteorologists."
        actions={
          currentUser?.role !== "trainer" && onOpenAiAdvisor && (
            <button
              onClick={onOpenAiAdvisor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Course Advisor</span>
            </button>
          )
        }
      />

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
        {/* ─── Filters & Search Bar ─── */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by course title, code, NWP, Radar, Satellite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded border border-[#D9E2EC] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#1E293B]"
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
                className="px-2.5 py-1.5 rounded border border-[#D9E2EC] text-xs font-medium text-[#1E293B] bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
              >
                <option value="All">All Proficiency Levels</option>
                <option value="Beginner">Beginner Level</option>
                <option value="Intermediate">Intermediate Level</option>
                <option value="Advanced">Advanced Level</option>
              </select>

              {currentUser?.role === "trainee" && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-[#D9E2EC] text-xs font-medium text-[#1E293B] bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Enrolled">My Enrolled Courses</option>
                  <option value="Available">Available to Enroll</option>
                </select>
              )}
            </div>

          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pt-1 text-xs">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase mr-1 shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#94A3B8]" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#164E63] text-white font-semibold"
                    : "bg-[#F1F5F9] text-[#475569] hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Institutional Course Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

            return (
              <div
                key={course.id}
                className="gov-card-interactive flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => onSelectCourse(course)}
              >
                <div>
                  {/* Card Header Info */}
                  <div className="p-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#1D4ED8] border border-blue-200 uppercase tracking-wider">
                      {course.code}
                    </span>
                    {isEnrolled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {course.level || "Intermediate"}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-semibold text-[#0F766E] uppercase tracking-wider block">
                      {course.category}
                    </span>

                    <h3 className="font-bold text-sm text-[#1E293B] line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Metadata & Prerequisites */}
                    <div className="pt-2 flex items-center justify-between text-xs text-[#64748B]">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock3 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        {course.duration}
                      </span>
                      <span className="text-[11px]">
                        {course.subjects?.length || 2} Subjects
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-3 border-t border-[#D9E2EC] bg-[#F8FAFC] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    Lead: <b>{course.leadTrainerName?.split(" ")[1] || "Senior Faculty"}</b>
                  </span>

                  {currentUser?.role === "trainee" ? (
                    isEnrolled ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCourse(course);
                        }}
                        className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white font-semibold rounded text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Continue</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEnrollClick) onEnrollClick(course);
                          else onSelectCourse(course);
                        }}
                        className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Enroll</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#1D4ED8] border border-[#D9E2EC] font-semibold rounded text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>View Program</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No matching courses found"
            description="No training curricula match your selected search terms or filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedLevel("All");
              setSelectedStatus("All");
            }}
          />
        )}
      </div>
    </div>
  );
};
