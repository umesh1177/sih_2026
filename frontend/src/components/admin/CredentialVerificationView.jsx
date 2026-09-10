import React, { useState, useEffect } from "react";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  UserCheck
} from "lucide-react";
import { api } from "../../services/api";

export const CredentialVerificationView = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCred, setSelectedCred] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingCredentials();
      if (res.success && res.credentials) {
        setCredentials(res.credentials);
      }
    } catch (err) {
      console.error("Failed loading pending credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id, approved) => {
    setActionLoading(true);
    try {
      const res = await api.verifyCredential(id, approved, reviewNotes);
      if (res.success) {
        setNotification({
          type: approved ? "success" : "warning",
          message: res.message || (approved ? "Credential approved!" : "Credential rejected.")
        });
        setSelectedCred(null);
        setReviewNotes("");
        fetchPending();
      }
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
              Phase 7 Governance
            </span>
            <span className="text-xs text-slate-400">Institutional Faculty Credentials</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Trainer Credential Verification & Accreditation Queue ({credentials.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authenticate claimed degrees, WMO certifications, and domain qualifications before factoring them into the Faculty Competency Engine.
          </p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold">Dismiss</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Trainer Officer</th>
                <th className="py-3.5 px-4">Credential Title & Issuer</th>
                <th className="py-3.5 px-4">Credential No.</th>
                <th className="py-3.5 px-4 text-center">Claimed Level</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading pending credential submissions...
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>All submitted trainer credentials have been verified!</span>
                  </td>
                </tr>
              ) : (
                credentials.map(cred => (
                  <tr key={cred.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{cred.trainerName}</p>
                        <p className="text-[10px] text-slate-400">{cred.department}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{cred.title}</p>
                      <p className="text-[10px] text-slate-500">{cred.issuer}</p>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {cred.credentialNumber || "N/A"}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                        Level {cred.claimedLevel}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                        {cred.verificationStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedCred(cred)}
                        className="px-3 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-lg font-bold text-xs shadow-sm"
                      >
                        Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect / Verify Modal */}
      {selectedCred && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Credential Verification Dossier
            </h2>

            <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
              <p><span className="text-slate-400">Trainer:</span> <b className="text-slate-800">{selectedCred.trainerName}</b></p>
              <p><span className="text-slate-400">Title:</span> <b className="text-slate-800">{selectedCred.title}</b></p>
              <p><span className="text-slate-400">Issuer:</span> <b className="text-slate-800">{selectedCred.issuer}</b></p>
              <p><span className="text-slate-400">Credential Number:</span> <b className="text-slate-800 font-mono">{selectedCred.credentialNumber}</b></p>
              <p><span className="text-slate-400">Claimed Level:</span> <b className="text-slate-800">Level {selectedCred.claimedLevel}</b></p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Verification Concurrence Note</label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="e.g. Cross-checked with WMO registry / IMD training records..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedCred(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedCred.id, false)}
                  className="px-4 py-2 bg-rose-100 text-rose-800 font-bold rounded-xl hover:bg-rose-200"
                >
                  Reject Claim
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedCred.id, true)}
                  className="px-5 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl shadow-md"
                >
                  Confirm & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
