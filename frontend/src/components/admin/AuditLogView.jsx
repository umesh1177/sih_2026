import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Search, 
  Clock,
  CheckCircle2, 
  UserCheck, 
  Award, 
  FileText,
  Lock
} from "lucide-react";
import { api } from "../../services/api";

export const AuditLogView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({ limit: 100 });
      if (res.success) {
        setLogs(res.auditLogs || []);
      }
    } catch (err) {
      console.error("Failed loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.actorName && l.actorName.toLowerCase().includes(search.toLowerCase())) ||
    l.targetEntity.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes("approve") || lower.includes("verified")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (lower.includes("reject") || lower.includes("delete")) return "bg-red-50 text-red-800 border-red-200";
    if (lower.includes("create") || lower.includes("issue")) return "bg-blue-50 text-blue-800 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="px-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider border border-slate-200">
                Security Audit Trail
              </span>
              <span className="text-xs text-slate-400">Tamper-Evident Governance Log</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Administrative & Governance Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable log of user approvals, role assignments, credential verifications, course creations, and certificate issuances.
            </p>
          </div>
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search action, actor, entity..."
              className="pl-9 pr-4 py-2 border border-[#D9E2EC] rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none w-64 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-[#D9E2EC] p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{logs.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Total Events</p>
          </div>
          <div className="bg-white rounded-lg border border-[#D9E2EC] p-3 text-center">
            <p className="text-xl font-bold text-emerald-700">{logs.filter(l => l.action?.toLowerCase().includes("approve") || l.action?.toLowerCase().includes("verified")).length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Approvals</p>
          </div>
          <div className="bg-white rounded-lg border border-[#D9E2EC] p-3 text-center">
            <p className="text-xl font-bold text-blue-700">{logs.filter(l => l.action?.toLowerCase().includes("create") || l.action?.toLowerCase().includes("issue")).length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Creations</p>
          </div>
          <div className="bg-white rounded-lg border border-[#D9E2EC] p-3 text-center">
            <p className="text-xl font-bold text-red-700">{logs.filter(l => l.action?.toLowerCase().includes("reject")).length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Rejections</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg border border-[#D9E2EC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Action</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actor</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Target Entity</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                      Loading security audit trail...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                      <Lock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getActionBadge(l.action)}`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {l.actorName || l.actorId}
                      </td>
                      <td className="py-3.5 px-4 text-blue-700 font-medium font-mono text-[11px]">
                        {l.targetEntity} #{l.targetId?.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {JSON.stringify(l.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
