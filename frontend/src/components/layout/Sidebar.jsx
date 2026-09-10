import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  Layers, 
  BarChart3, 
  BellRing, 
  UserCheck, 
  GraduationCap,
  Award,
  LogOut,
  Building2,
  FolderKanban,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Star
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab, onOpenLoginPage, onOpenHomePage, onOpenAiAdvisor }) => {
  const { currentUser, logout } = useAuth();

  // Role based navigation links
  const getNavItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
      { id: "courses", label: "Course Catalog", icon: BookOpen },
    ];

    if (currentUser?.role === "trainer") {
      return [
        ...baseItems,
        { id: "trainee-performance", label: "Learner Performance", icon: TrendingUp },
        { id: "course-feedback", label: "Course Feedback & Quality", icon: Star },
        { id: "learning-gaps", label: "Learning Gap Detection", icon: ShieldAlert },
        { id: "schedule-assessment", label: "Schedule Assessments", icon: ClipboardList },
        { id: "questions", label: "Question Bank", icon: Layers },
        { id: "content-library", label: "Content Library", icon: FolderKanban },
        { id: "certificates", label: "Certified Credentials", icon: Award },
        { id: "profile", label: "Officer Profile", icon: FileText },
      ];
    }

    if (currentUser?.role === "admin") {
      return [
        ...baseItems,
        { id: "trainee-performance", label: "Learner Performance", icon: TrendingUp },
        { id: "course-feedback", label: "Course Feedback & Quality", icon: Star },
        { id: "learning-gaps", label: "Learning Gap Detection", icon: ShieldAlert },
        { id: "approvals", label: "Officer Approvals", icon: UserCheck },
        { id: "announcements", label: "National Broadcasts", icon: BellRing },
        { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
      ];
    }

    // Trainee view
    return [
      ...baseItems,
      { id: "learning-gaps", label: "Learning Gap Detection", icon: ShieldAlert },
      { id: "ai-course-advisor", label: "AI Course Advisor", icon: Sparkles, isModalTrigger: true },
      { id: "my-learning", label: "My Enrolled Courses", icon: GraduationCap },
      { id: "trainee-quizzes", label: "Scheduled Assessments", icon: ClipboardList },
      { id: "practice-papers", label: "AI Practice Papers", icon: Sparkles },
      { id: "questions", label: "Question Bank", icon: Layers },
      { id: "certificates", label: "Certified Credentials", icon: Award },
      { id: "profile", label: "Officer Profile", icon: FileText },
      { id: "analytics", label: "Competency Radar", icon: BarChart3 },
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    if (onOpenLoginPage) onOpenLoginPage();
  };

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col h-screen select-none shrink-0 shadow-sm relative z-30 border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm shrink-0">
          CC
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase truncate">
              CAPACITY CONNECT
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide truncate">
            MoES / IMD LMS Portal
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {onOpenHomePage && (
          <button
            onClick={onOpenHomePage}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 transition-all text-left mb-2 shadow-xs"
          >
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Public Portal & Verify</span>
          </button>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdvisor = item.id === "ai-course-advisor";

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isModalTrigger || isAdvisor) {
                  if (onOpenAiAdvisor) onOpenAiAdvisor();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 text-left ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-xs"
                  : isAdvisor
                  ? "bg-amber-50/80 text-amber-900 hover:bg-amber-100/80 border border-amber-200/80 font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : isAdvisor ? "text-amber-600" : "text-slate-500"}`} />
              <span className="truncate">{item.label}</span>
              {isAdvisor && (
                <span className="ml-auto px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-800 text-[9px] font-black uppercase tracking-wider">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile Card & Sign Out */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-3 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt="User"
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentUser?.name || "Institute Officer"}
            </p>
            <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
              {currentUser?.designation || currentUser?.department || currentUser?.email || "IMD Officer"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-98"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
