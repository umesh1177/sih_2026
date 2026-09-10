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
  Sparkles
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab, onOpenLoginPage, onOpenHomePage }) => {
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
        { id: "approvals", label: "Officer Approvals", icon: UserCheck },
        { id: "announcements", label: "National Broadcasts", icon: BellRing },
        { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
      ];
    }

    // Trainee view
    return [
      ...baseItems,
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
    <aside className="w-64 bg-[#0a2558] text-white flex flex-col h-screen select-none shrink-0 shadow-2xl relative z-30 border-r border-white/10">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-b from-white/10 to-transparent">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-blue-200 to-white text-[#0a2558] flex items-center justify-center font-black text-sm tracking-wider shadow-lg shrink-0">
          CC
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-sm tracking-tight text-white uppercase truncate">
              CAPACITY CONNECT
            </h1>
          </div>
          <p className="text-[10px] text-blue-200/80 font-medium tracking-wide truncate">
            MoES / IMD LMS Portal
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {onOpenHomePage && (
          <button
            onClick={onOpenHomePage}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-all text-left mb-2 shadow-sm"
          >
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Public Portal & Verify</span>
          </button>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 text-left ${
                isActive
                  ? "bg-white text-[#0a2558] font-black shadow-lg transform translate-x-1"
                  : "text-blue-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0a2558]" : "text-blue-300"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile Card & Sign Out */}
      <div className="border-t border-white/10 bg-black/20 p-3 space-y-2.5">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt="User"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/20 shrink-0 shadow-sm"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">
              {currentUser?.name || "Institute Officer"}
            </p>
            <p className="text-[10px] text-blue-200/70 truncate capitalize">
              {currentUser?.designation || currentUser?.department || currentUser?.email || "IMD Officer"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 hover:text-red-100 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
