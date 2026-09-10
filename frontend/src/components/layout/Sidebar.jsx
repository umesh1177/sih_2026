import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  Award, 
  Target, 
  UsersRound, 
  FolderKanban, 
  HelpCircle, 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  FileBarChart, 
  History, 
  LogOut,
  UserCircle,
  Megaphone
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab, onOpenLoginPage }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onOpenLoginPage) onOpenLoginPage();
  };

  // Grouped Navigation based on Role
  const getNavSections = () => {
    const role = currentUser?.role || "trainee";

    if (role === "admin") {
      return [
        {
          title: "OVERVIEW",
          items: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          ]
        },
        {
          title: "LEARNING",
          items: [
            { id: "courses", label: "Course Catalog", icon: BookOpen },
            { id: "quizzes", label: "Assessments Engine", icon: ClipboardCheck },
            { id: "questions", label: "Question Bank", icon: HelpCircle },
            { id: "certificates", label: "Certificates", icon: Award },
          ]
        },
        {
          title: "CAPABILITY",
          items: [
            { id: "competency", label: "Competency Matrix", icon: Target },
          ]
        },
        {
          title: "ADMINISTRATION",
          items: [
            { id: "approvals", label: "Users & Approvals", icon: UserCheck },
            { id: "credential-verification", label: "Credential Verification", icon: ShieldCheck },
            { id: "org-structure", label: "Organization Structure", icon: Building2 },
            { id: "audit-logs", label: "Audit Logs", icon: History },
          ]
        }
      ];
    }

    if (role === "trainer") {
      return [
        {
          title: "OVERVIEW",
          items: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          ]
        },
        {
          title: "LEARNING & TEACHING",
          items: [
            { id: "courses", label: "Course Catalog", icon: BookOpen },
            { id: "schedule-assessment", label: "Schedule Assessments", icon: ClipboardCheck },
            { id: "questions", label: "Question Bank", icon: HelpCircle },
            { id: "certificates", label: "Certificates", icon: Award },
          ]
        },
        {
          title: "RESOURCES",
          items: [
            { id: "content-library", label: "Trainer Library", icon: FolderKanban },
          ]
        },
        {
          title: "ACCOUNT",
          items: [
            { id: "profile", label: "Professional Profile", icon: UserCircle },
          ]
        }
      ];
    }

    // Default Trainee view
    return [
      {
        title: "OVERVIEW",
        items: [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        ]
      },
      {
        title: "LEARNING",
        items: [
          { id: "courses", label: "Course Catalog", icon: BookOpen },
          { id: "my-learning", label: "My Learning", icon: GraduationCap },
          { id: "trainee-quizzes", label: "Assessments", icon: ClipboardCheck },
          { id: "certificates", label: "Certificates", icon: Award },
        ]
      },
      {
        title: "CAPABILITY",
        items: [
          { id: "profile", label: "Competency & Profile", icon: Target },
        ]
      }
    ];
  };

  const navSections = getNavSections();

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col h-screen select-none shrink-0 border-r border-[#D9E2EC] z-30">
      {/* Institutional Brand Header */}
      <div className="p-4 border-b border-[#D9E2EC] bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#164E63] text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs">
            CC
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-xs tracking-tight text-[#164E63] uppercase truncate">
              CAPACITY CONNECT
            </h1>
            <p className="text-[11px] font-medium text-[#64748B] tracking-wide truncate">
              MoES • IMD Digital Portal
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                      isActive
                        ? "bg-blue-50/90 text-[#1D4ED8] font-semibold border-l-3 border-[#1D4ED8]"
                        : "text-[#475569] hover:bg-slate-100 hover:text-[#1E293B]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1D4ED8]" : "text-[#64748B]"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Institutional Profile Footer */}
      <div className="border-t border-[#D9E2EC] bg-[#F8FAFC] p-3 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded bg-white border border-[#D9E2EC]">
          <div className="w-8 h-8 rounded bg-slate-100 text-[#164E63] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
            {currentUser?.name?.charAt(0) || "O"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-[#1E293B] truncate">
              {currentUser?.name || "Officer"}
            </p>
            <p className="text-[11px] text-[#64748B] truncate capitalize">
              {currentUser?.designation || currentUser?.department || currentUser?.role || "IMD Officer"}
            </p>
          </div>
        </div>

        {/* Clean Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-rose-50 text-[#B91C1C] border border-[#D9E2EC] hover:border-rose-200 rounded text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
