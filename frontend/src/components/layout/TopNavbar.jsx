import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Building2, Sparkles, Menu } from "lucide-react";

export const TopNavbar = ({ activeTab, onOpenAnnouncements, onOpenAiCourseAdvisor, onToggleMobileSidebar }) => {
  const { currentUser } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "courses":
        return "Course Catalog";
      case "subjects":
        return "Subject Modules";
      case "questions":
        return "Question Bank";
      case "quizzes":
        return "Assessments";
      case "schedule-assessment":
        return "Schedule Assessments";
      case "content-library":
        return "Learning Resources";
      case "trainee-quizzes":
        return "Assessments";
      case "practice-papers":
        return "Practice";
      case "my-learning":
        return "My Learning";
      case "certificates":
        return "Certificates";
      case "profile":
        return "Professional Profile";
      case "approvals":
        return "User Approvals";
      case "competency":
        return "Competency Passport";
      case "announcements":
        return "Communications";
      case "analytics":
        return "Reports & Analytics";
      case "trainer-matching":
        return "People & Workload";
      case "trainee-performance":
        return "Learner Performance";
      case "learning-gaps":
        return "Learning Gaps";
      case "course-feedback":
        return "Governance & Quality";
      default:
        return "Portal";
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left: Mobile toggle & breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-slate-600 hidden sm:inline">Capacity Connect</span>
            <span className="hidden sm:inline">/</span>
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right controls: AI advisor, status pills, notifications */}
      <div className="flex items-center gap-2.5">
        {currentUser?.role === "trainee" && (
          <button
            onClick={onOpenAiCourseAdvisor}
            title="Get Smart Course Recommendations"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Course Advisor</span>
          </button>
        )}

        {currentUser?.role === "trainee" && currentUser?.status === "pending" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Pending Review</span>
          </div>
        )}

        {currentUser?.status === "approved" && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Verified</span>
          </div>
        )}

        <button
          onClick={onOpenAnnouncements}
          title="Communications & Circulars"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative border border-slate-200 bg-white"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};
