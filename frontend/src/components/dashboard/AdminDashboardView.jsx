import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  BarChart3, 
  UserCheck, 
  BellRing, 
  Plus, 
  ArrowRight,
  Building2,
  Megaphone,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Target,
  Zap,
  SlidersHorizontal,
  Check
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid
} from "recharts";
import { api } from "../../services/api";

export const AdminDashboardView = ({ 
  currentUser, 
  onOpenApprovals, 
  onOpenAnalytics, 
  onOpenBroadcastModal,
  onOpenCreateCourse,
  onNavigatePerformance,
  onNavigateTrainerMatching
}) => {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [activeTelemetryTab, setActiveTelemetryTab] = useState("all"); // "all" | "cadre" | "capacity" | "directives"
  const [chartMetric, setChartMetric] = useState("count"); // "count" | "percentage"

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, aRes, pRes, cRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ success: false })),
        api.getAnnouncements().catch(() => ({ success: false })),
        api.getPendingUsers().catch(() => ({ success: false })),
        api.getCourses().catch(() => ({ success: false }))
      ]);

      if (sRes.success) setStats(sRes.stats);
      if (aRes.success) setAnnouncements(aRes.announcements || []);
      if (pRes.success) setPendingUsers(pRes.pendingUsers || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error("Admin stats failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledTraineeIds?.length || 0), 0);
  const totalCap = courses.reduce((acc, c) => acc + (c.maxEnrollment || 50), 0);
  const capacityPct = totalCap > 0 ? Math.round((totalEnrolled / totalCap) * 100) : 74;

  const chartData = (stats?.deptDistribution || []).map(d => ({
    ...d,
    percentage: Math.min(100, Math.round((d.count / (stats?.totalTrainees || 28)) * 100))
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* ─── 1. EXECUTIVE HERO HEADER (QUIZPORTAL CLEAN STYLE) ─── */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0B3475] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0B3475]" />
              Directorate General of Meteorology
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {currentTime} IST • Ministry of Earth Sciences
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Executive Command & Oversight Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Real-time management of national meteorological training tracks, faculty workload balancing, officer verifications, and ministry circulars.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onNavigateTrainerMatching && (
            <button
              onClick={onNavigateTrainerMatching}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold rounded-xl text-xs border border-emerald-200 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Faculty Matching</span>
            </button>
          )}

          {onNavigatePerformance && (
            <button
              onClick={onNavigatePerformance}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold rounded-xl text-xs border border-indigo-200 transition-colors shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-700" />
              <span>Learner Performance</span>
            </button>
          )}

          <button
            onClick={onOpenCreateCourse}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-200" />
            <span>Publish Course</span>
          </button>
          
          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors shadow-xs"
          >
            <BellRing className="w-3.5 h-3.5 text-[#0B3475]" />
            <span>Directives</span>
          </button>

          <button
            onClick={loadAdminData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0B3475]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. DYNAMIC INTERACTIVE TELEMETRY FILTER BAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "National Command Overview", icon: Activity },
            { id: "cadre", label: "Cadre & Faculty Distribution", icon: Users },
            { id: "capacity", label: "Live Platform Capacity", icon: Layers },
            { id: "directives", label: "Active Directives & Circulars", icon: BellRing }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTelemetryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTelemetryTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  active
                    ? "bg-[#0B3475] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-blue-200" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Telemetry Synchronized</span>
        </div>
      </div>

      {/* ─── 3. TOP KPI SUMMARY CARDS (QUIZPORTAL CLEAN METRICS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Trainee Officers */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Trainee Officers</span>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalTrainees || 28}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% active intake
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B3475]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Certified Faculty */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Certified Faculty</span>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalTrainers || 6}</div>
            {onNavigateTrainerMatching ? (
              <button 
                onClick={onNavigateTrainerMatching}
                className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Faculty Workload</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-700" /> 100% Verified
              </span>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pending Approvals</span>
            <div className="text-2xl font-bold text-[#0B3475]">{pendingUsers.length}</div>
            <button 
              onClick={onOpenApprovals}
              className="text-[11px] text-blue-800 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Review Queue ({pendingUsers.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B3475]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Credentials Issued */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Credentials Issued</span>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalCertificatesIssued ?? 0}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Pass Rate: {stats?.overallPassRate ?? 0}%
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── 4. ANALYTICS & CAPACITY CHARTS GRID ─── */}
      {(activeTelemetryTab === "all" || activeTelemetryTab === "cadre") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Department Trainees Chart */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Departmental Cadre Telemetry</h3>
                <p className="text-xs text-slate-400">Total registered and active trainee officers across divisions</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setChartMetric("count")}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                    chartMetric === "count" ? "bg-white text-[#0B3475] shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Headcount
                </button>
                <button
                  onClick={() => setChartMetric("percentage")}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                    chartMetric === "percentage" ? "bg-white text-[#0B3475] shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Cadre Share %
                </button>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value) => [chartMetric === "count" ? `${value} Officers` : `${value}% Share`, "Cadre Size"]}
                  />
                  <Bar dataKey={chartMetric} fill="#0B3475" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Certification Trend */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Monthly Certification Trajectory</h3>
                <p className="text-xs text-slate-400">Issued WMO/MoES Standard Official Certificates</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                +28% YoY Growth
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyCertifications || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="certificates" stroke="#0B3475" strokeWidth={2} fill="#eff6ff" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ─── 5. DIRECTIVES & PLATFORM HUB SHORTCUTS ─── */}
      {(activeTelemetryTab === "all" || activeTelemetryTab === "capacity" || activeTelemetryTab === "directives") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Platform Analytics Shortcut Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0B3475] uppercase tracking-wider border border-blue-100">
                  Governance & Telemetry
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {totalEnrolled} / {totalCap} Seats Filled ({capacityPct}%)
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900">
                National Platform Analytics & Reporting Hub
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect course seat capacity utilization, grade distributions, first-attempt pass rates, and senior faculty workload ratios across all IMD and MoES centers.
              </p>
            </div>

            {/* Quick Metrics Progress */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Overall Platform Capacity Utilization</span>
                <span className="text-[#0B3475] font-bold">{capacityPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0B3475] h-full rounded-full transition-all duration-500"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                <span>Active Courses: {courses.length}</span>
                <span>Max Capacity: {totalCap} Seats</span>
              </div>
            </div>

            <button
              onClick={onOpenAnalytics}
              className="w-full py-2.5 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-200" />
              <span>Launch Platform Analytics Hub</span>
            </button>
          </div>

          {/* Active MoES Circulars Feed */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-[#0B3475]" />
                  <span>Active MoES Announcements & Directives</span>
                </h3>
                <button 
                  onClick={onOpenBroadcastModal} 
                  className="text-[#0B3475] font-semibold text-xs hover:underline flex items-center gap-1"
                >
                  <span>+ View All ({announcements.length})</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {announcements.slice(0, 3).map((ann, idx) => (
                  <div 
                    key={ann.id || idx} 
                    className={`p-3 rounded-xl border transition-colors ${
                      ann.urgent ? "bg-rose-50/70 border-rose-200" : "bg-slate-50 border-slate-200/80 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[280px]">{ann.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No active circulars at this moment.</p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenBroadcastModal}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-xs"
            >
              <Megaphone className="w-3.5 h-3.5 text-[#0B3475]" />
              <span>Manage & Publish National Directives</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};


