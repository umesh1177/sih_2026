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
import { PageHeader } from "../common/PageHeader";

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
          message: res.message || (approved ? "Credential verified and recorded." : "Credential claim rejected.")
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
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Trainer Credential Verification & Accreditation Queue"
        description="Authenticate claimed degrees, WMO accreditations, and technical certifications before factoring them into the Faculty Competency Matrix."
        badge={{ text: "Accreditation Governance", variant: "blue" }}
        actions={
          <div className="px-3 py-1.5 bg-white border border-[#D9E2EC] rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
            {credentials.length} Pending Verifications
          </div>
        }
      />

      <div className="px-6 pb-6 space-y-4 max-w-7xl mx-auto">
        {notification && (
          <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="font-semibold ml-4">Dismiss</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#D9E2EC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-[#D9E2EC]">
                <tr>
                  <th className="py-3 px-4">Trainer Officer</th>
                  <th className="py-3 px-4">Credential Title & Issuer</th>
                  <th className="py-3 px-4">Credential No.</th>
                  <th className="py-3 px-4 text-center">Claimed Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                      <span>All submitted trainer credentials have been verified.</span>
                    </td>
                  </tr>
                ) : (
                  credentials.map(cred => (
                    <tr key={cred.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900">{cred.trainerName}</p>
                          <p className="text-[10px] text-slate-500">{cred.department}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{cred.title}</p>
                        <p className="text-[10px] text-slate-500">{cred.issuer}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {cred.credentialNumber || "N/A"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                          Level {cred.claimedLevel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                          {cred.verificationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedCred(cred)}
                          className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors shadow-xs"
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
      </div>

      {/* Inspect / Verify Modal */}
      {selectedCred && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#D9E2EC] text-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-[#D9E2EC]">
              Credential Verification Dossier
            </h2>

            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-[#D9E2EC]">
              <p><span className="text-slate-400">Trainer:</span> <b className="text-slate-800">{selectedCred.trainerName}</b></p>
              <p><span className="text-slate-400">Title:</span> <b className="text-slate-800">{selectedCred.title}</b></p>
              <p><span className="text-slate-400">Issuer:</span> <b className="text-slate-800">{selectedCred.issuer}</b></p>
              <p><span className="text-slate-400">Credential Number:</span> <b className="text-slate-800 font-mono">{selectedCred.credentialNumber}</b></p>
              <p><span className="text-slate-400">Claimed Level:</span> <b className="text-slate-800">Level {selectedCred.claimedLevel}</b></p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Verification Note</label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="e.g. Verified with WMO registry / IMD records..."
                className="w-full p-2.5 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-[#D9E2EC] flex items-center justify-between">
              <button
                onClick={() => setSelectedCred(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedCred.id, false)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-md border border-red-200 transition-colors"
                >
                  Reject Claim
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedCred.id, true)}
                  className="px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs transition-colors"
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
