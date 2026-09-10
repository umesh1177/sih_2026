import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Building2, ChevronRight, UserCircle } from "lucide-react";

export const TopNavbar = ({ activeTab, onOpenAnnouncements, onOpenAiGenerator }) => {
  const { currentUser } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "courses": return "Course Catalog";
      case "my-learning": return "My Learning";
      case "content-library": return "Trainer Library";
      case "schedule-assessment": return "Schedule Assessments";
      case "questions": return "Question Bank";
      case "quizzes": return "Assessments Engine";
      case "trainee-quizzes": return "Assessments";
      case "certificates": return "Certificates";
      case "profile": return "Professional Profile";
      case "approvals": return "Users & Approvals";
      case "credential-verification": return "Credential Verification";
      case "org-structure": return "Organization Structure";
      case "competency": return "Competency Matrix";
      case "announcements": return "Announcements";
      case "audit-logs": return "Audit Logs";
      default: return "Portal";
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#D9E2EC] px-6 flex items-center justify-between z-20 shrink-0">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#64748B]">
          <Building2 className="w-3.5 h-3.5 text-[#164E63]" />
          <span className="font-semibold text-[#164E63]">MoES / IMD</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
        <span className="font-semibold text-[#1E293B] text-xs md:text-sm">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Right Controls & Profile Info */}
      <div className="flex items-center gap-3">
        {/* Verification Status Pill */}
        {currentUser?.status === "pending" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Review</span>
          </div>
        )}

        {currentUser?.status === "approved" && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize">{currentUser.role} Account</span>
          </div>
        )}

        {/* AI Generator Draft Tool */}
        {(currentUser?.role === "trainer" || currentUser?.role === "admin") && onOpenAiGenerator && (
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] rounded text-xs font-medium transition-colors"
          >
            <span>Draft Questions</span>
          </button>
        )}

        {/* Announcements / Notifications Trigger */}
        <button
          onClick={onOpenAnnouncements}
          title="Announcements & Circulars"
          className="p-1.5 rounded text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-colors relative border border-[#D9E2EC]"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#1D4ED8] rounded-full"></span>
        </button>

        {/* User Identity Display */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#D9E2EC] text-xs">
          <UserCircle className="w-5 h-5 text-[#64748B]" />
          <div className="text-left leading-tight">
            <p className="font-semibold text-[#1E293B] text-xs">{currentUser?.name || "Officer"}</p>
            <p className="text-[11px] text-[#64748B] capitalize">{currentUser?.role || "Trainee"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
