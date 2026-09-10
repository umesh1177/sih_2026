import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  Filter, 
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
              Phase 9 Security Audit
            </span>
            <span className="text-xs text-slate-400">Tamper-Evident Governance Trail</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Administrative & Governance Audit Logs ({logs.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of user approvals, role assignments, credential verifications, course creations, and certificate issuances.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search action, actor, entity..."
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20 w-64"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-sans text-xs">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-sans text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">
                        {l.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans font-bold text-slate-800">
                      {l.actorName || l.actorId}
                    </td>

                    <td className="py-3.5 px-4 text-blue-700 font-bold">
                      {l.targetEntity} #{l.targetId.substring(0, 8)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-sans max-w-xs truncate">
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
  );
};
