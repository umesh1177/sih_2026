import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  UserX, 
  Eye, 
  CheckCircle2
} from "lucide-react";
import { api } from "../../services/api";

export const UserApprovalQueue = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectUser, setInspectUser] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingUsers();
      if (res.success && res.pendingUsers) {
        setPendingUsers(res.pendingUsers);
      }
    } catch (err) {
      console.error("Failed loading pending queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id, approved) => {
    try {
      const res = await api.verifyUser(id, approved, reviewNotes);
      if (res.success) {
        alert(res.message);
        setInspectUser(null);
        setReviewNotes("");
        fetchPending();
      }
    } catch (err) {
      alert("Verification action failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider border border-amber-200">
                Admin Governance Queue
              </span>
              <span className="text-xs text-slate-400">MoES Official Concurrence</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Officer Registration & Role Approval Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review qualifications, security clearances, and institute postings before granting active capacity access.
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 bg-white border border-[#D9E2EC] rounded-lg text-xs text-slate-600 font-medium shadow-sm">
            {pendingUsers.length} pending
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Queue Table */}
        <div className="bg-white rounded-lg border border-[#D9E2EC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Officer Details</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Requested Role</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Department / Division</th>
                  <th className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Qualifications</th>
                  <th className="py-3.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
                  <th className="py-3.5 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                      Loading pending verification requests...
                    </td>
                  </tr>
                ) : pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <span>No pending approvals. All registered officers are verified.</span>
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                            alt={user.name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          user.role === "trainer"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-700">{user.department}</p>
                        <p className="text-[10px] text-slate-400">{user.designation}</p>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-slate-700 line-clamp-1">{user.qualifications || "Pending entry"}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{user.experience || "Fresh posting"}</p>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectUser(user)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Inspect Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleVerify(user.id, true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleVerify(user.id, false)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg border border-red-200 transition-colors text-xs"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspect Profile Modal */}
      {inspectUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Officer Verification Dossier — {inspectUser.name}
            </h2>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Department</span>
                  <p className="font-semibold text-slate-800">{inspectUser.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Designation</span>
                  <p className="font-semibold text-slate-800">{inspectUser.designation}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Scientific Qualifications</span>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-medium border border-slate-100">{inspectUser.qualifications || "None specified"}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Prior Experience</span>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-100">{inspectUser.experience || "None specified"}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Skills & Specializations</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(inspectUser.skills || inspectUser.specialization || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Endorsement Notes</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Optional verification concurrence note..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify(inspectUser.id, false)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg font-semibold text-xs transition-colors"
                >
                  Reject Registration
                </button>
                <button
                  onClick={() => handleVerify(inspectUser.id, true)}
                  className="px-5 py-2 bg-[#164E63] hover:bg-[#0f3d4f] text-white rounded-lg font-semibold text-xs shadow-sm transition-colors"
                >
                  Approve Officer Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
