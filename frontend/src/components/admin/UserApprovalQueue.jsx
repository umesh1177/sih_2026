import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  UserX, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2,
  Award
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
              Admin Governance Queue
            </span>
            <span className="text-xs text-slate-400">MoES Official Concurrence</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Officer Registration & Role Approval Queue ({pendingUsers.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review qualifications, security clearances, and institute postings before granting active capacity access.
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Officer Details</th>
                <th className="py-3.5 px-4">Requested Role</th>
                <th className="py-3.5 px-4">Department / Division</th>
                <th className="py-3.5 px-4">Qualifications & Experience</th>
                <th className="py-3.5 px-4 text-center">Submitted On</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading pending verification requests...
                  </td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>No pending approvals! All registered officers are verified.</span>
                  </td>
                </tr>
              ) : (
                pendingUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                          alt={user.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.role === "trainer" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
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
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="Inspect Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(user.id, true)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-transform hover:scale-105"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleVerify(user.id, false)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg"
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

      {/* Inspect Profile Modal */}
      {inspectUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Officer Verification Dossier: {inspectUser.name}
            </h2>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-semibold text-slate-800">{inspectUser.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Designation</span>
                  <p className="font-semibold text-slate-800">{inspectUser.designation}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Scientific Qualifications</span>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-medium">{inspectUser.qualifications || "None specified"}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Prior Experience</span>
                <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800">{inspectUser.experience || "None specified"}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Skills & Specializations</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(inspectUser.skills || inspectUser.specialization || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setInspectUser(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs">
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify(inspectUser.id, false)}
                  className="px-4 py-2 bg-rose-100 text-rose-800 rounded-lg font-bold text-xs"
                >
                  Reject Registration
                </button>
                <button
                  onClick={() => handleVerify(inspectUser.id, true)}
                  className="px-5 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-lg font-bold text-xs shadow-md"
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
