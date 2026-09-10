import React, { useState, useEffect } from "react";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  BellRing, 
  Plus, 
  Compass, 
  History,
  CheckCircle2,
  Clock
} from "lucide-react";
import { api } from "../../services/api";

export const AdminDashboardView = ({ 
  onOpenApprovals, 
  onOpenCredentialVerification,
  onOpenOrgStructure,
  onOpenCompetency, 
  onOpenAnnouncements, 
  onOpenCreateCourse, 
  onOpenAuditLogs 
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Executive Welcome & Top Actions */}
      <div className="bg-gradient-to-r from-[#0a2558] via-blue-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              {stats?.adminScope || "ORGANIZATION"}-WIDE GOVERNANCE
            </span>
            <span className="text-xs text-blue-200">MoES / IMD Academic Directorate</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Institutional Capacity Administration Dashboard
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-2xl">
            Real-time administrative control over officer registrations, faculty credential accreditations, multi-department course management, and governance audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onOpenCreateCourse}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#0a2558] hover:bg-blue-50 font-bold rounded-2xl text-xs shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
          <button
            onClick={onOpenAnnouncements}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl text-xs shadow-md"
          >
            <BellRing className="w-4 h-4" />
            <span>Publish Directive</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (Phase 12 Real Database Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0a2558] flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled Trainees</span>
            <b className="text-xl font-black text-slate-900">{loading ? "..." : stats?.totalTrainees || 0}</b>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty Trainers</span>
            <b className="text-xl font-black text-slate-900">{loading ? "..." : stats?.totalTrainers || 0}</b>
          </div>
        </div>

        <div 
          onClick={onOpenApprovals}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Registrations</span>
            <b className="text-xl font-black text-amber-700">{loading ? "..." : stats?.pendingApprovalsCount || 0}</b>
          </div>
        </div>

        <div 
          onClick={onOpenCredentialVerification}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-purple-400 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Credentials</span>
            <b className="text-xl font-black text-emerald-700">{loading ? "..." : stats?.pendingCredentialsCount || 0}</b>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Courses</span>
            <b className="text-lg font-extrabold text-slate-800">{loading ? "..." : stats?.totalCourses || 0} Curricula</b>
          </div>
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Assessments Scheduled</span>
            <b className="text-lg font-extrabold text-slate-800">{loading ? "..." : stats?.totalQuizzesScheduled || 0} Kiosk Exams</b>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Verified Certificates Issued</span>
            <b className="text-lg font-extrabold text-slate-800">{loading ? "..." : stats?.totalCertificatesIssued || 0} Awarded</b>
          </div>
          <Award className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Governance & Quick Modules Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Department Distribution */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Departmental Officer Distribution</h2>
              <p className="text-[11px] text-slate-400">Headcount across operational forecasting divisions</p>
            </div>
            <button
              onClick={onOpenOrgStructure}
              className="text-xs font-bold text-[#0a2558] hover:underline flex items-center gap-1"
            >
              <span>View Structure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(stats?.deptDistribution || []).map((dept, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <b className="text-slate-800 font-bold">{dept.fullName || dept.name}</b>
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">[{dept.name}]</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600"><b>{dept.count}</b> Officers</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px]">
                    {dept.activeTrainees} Active Cadets
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Governance Navigation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Administrative Modules
          </h2>

          <div className="space-y-2 text-xs">
            <button
              onClick={onOpenApprovals}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Officer Registration Queue</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenCredentialVerification}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Trainer Credential Verification</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenCompetency}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Competency Mapping Engine</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenOrgStructure}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Organization & Department Scope</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenAuditLogs}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-slate-600" />
                <span>Governance Security Audit Log</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
