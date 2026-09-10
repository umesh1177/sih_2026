import React, { useState, useEffect } from "react";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  ChevronRight, 
  Megaphone, 
  Plus, 
  Target, 
  History,
  CheckCircle2,
  Clock3,
  BarChart3,
  FileBarChart
} from "lucide-react";
import { api } from "../../services/api";
import { StatCard } from "../common/StatCard";
import { PageHeader } from "../common/PageHeader";

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
    <div className="space-y-6">
      {/* ─── Institutional Header ─── */}
      <PageHeader
        title="Admin Management Dashboard"
        description="Centralized administration over officer registrations, trainer credentials, curriculum programs, competency mapping, and governance audit trails."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAnnouncements}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Publish Circular</span>
            </button>
            <button
              onClick={onOpenCreateCourse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Course</span>
            </button>
          </div>
        }
      />

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
        {/* ─── Primary KPI Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={GraduationCap}
            label="Enrolled Trainees"
            value={loading ? "..." : stats?.totalTrainees || 0}
            subtext="Active learners"
            iconBg="bg-blue-50 text-[#1D4ED8]"
          />

          <StatCard
            icon={Users}
            label="Faculty Trainers"
            value={loading ? "..." : stats?.totalTrainers || 0}
            subtext="Instructors & Lead Forecasters"
            iconBg="bg-teal-50 text-[#0F766E]"
          />

          <StatCard
            icon={Clock3}
            label="Pending Registrations"
            value={loading ? "..." : stats?.pendingApprovalsCount || 0}
            subtext="Awaiting officer verification"
            iconBg="bg-amber-50 text-amber-700"
            onClick={onOpenApprovals}
          />

          <StatCard
            icon={ShieldCheck}
            label="Pending Credentials"
            value={loading ? "..." : stats?.pendingCredentialsCount || 0}
            subtext="Awaiting accreditation"
            iconBg="bg-rose-50 text-rose-700"
            onClick={onOpenCredentialVerification}
          />
        </div>

        {/* ─── Secondary Metrics Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="gov-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Active Courses
              </span>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5">
                {loading ? "..." : stats?.totalCourses || 0} <span className="text-xs font-normal text-[#64748B]">Curricula</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="gov-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Assessments Scheduled
              </span>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5">
                {loading ? "..." : stats?.totalQuizzesScheduled || 0} <span className="text-xs font-normal text-[#64748B]">Exams</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="gov-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Issued Certificates
              </span>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5">
                {loading ? "..." : stats?.totalCertificatesIssued || 0} <span className="text-xs font-normal text-[#64748B]">Verified</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ─── Governance & Department Distribution ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Department Distribution (8 Cols) */}
          <div className="lg:col-span-8 gov-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Departmental Officer Distribution</h2>
                <p className="text-[11px] text-[#64748B]">Registered officer headcount across operational divisions</p>
              </div>
              <button
                onClick={onOpenOrgStructure}
                className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] inline-flex items-center gap-1"
              >
                <span>View Structure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(stats?.deptDistribution || []).map((dept, idx) => (
                <div key={idx} className="p-3 bg-[#F8FAFC] rounded border border-[#D9E2EC] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1E293B]">{dept.fullName || dept.name}</span>
                    <span className="text-[10px] text-[#94A3B8] ml-2 font-mono">[{dept.name}]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]"><b>{dept.count}</b> Officers</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold text-[10px]">
                      {dept.activeTrainees} Trainees
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Shortcuts (4 Cols) */}
          <div className="lg:col-span-4 gov-card p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#1E293B] pb-2 border-b border-[#D9E2EC]">
              Administrative Modules
            </h2>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={onOpenApprovals}
                className="w-full p-2.5 rounded bg-white hover:bg-slate-50 border border-[#D9E2EC] text-[#1E293B] font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Users & Approvals Queue</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              <button
                onClick={onOpenCredentialVerification}
                className="w-full p-2.5 rounded bg-white hover:bg-slate-50 border border-[#D9E2EC] text-[#1E293B] font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                  <span>Credential Verification</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              <button
                onClick={onOpenCompetency}
                className="w-full p-2.5 rounded bg-white hover:bg-slate-50 border border-[#D9E2EC] text-[#1E293B] font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-700" />
                  <span>Competency Matrix Engine</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              <button
                onClick={onOpenOrgStructure}
                className="w-full p-2.5 rounded bg-white hover:bg-slate-50 border border-[#D9E2EC] text-[#1E293B] font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#164E63]" />
                  <span>Organization & Scope</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              <button
                onClick={onOpenAuditLogs}
                className="w-full p-2.5 rounded bg-white hover:bg-slate-50 border border-[#D9E2EC] text-[#1E293B] font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#64748B]" />
                  <span>Governance Audit Log</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
