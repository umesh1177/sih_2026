import React, { useState } from "react";
import { 
  ShieldCheck, 
  Award, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  Building2, 
  Calendar, 
  UserCheck,
  QrCode
} from "lucide-react";
import { api } from "../services/api";

export const PublicCertificateVerifyPage = ({ onBack, initialCode = "" }) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.verifyCertificate(code.trim());
      if (res.success && res.certificate) {
        setResult(res.certificate);
      } else {
        setError(res.message || "No valid certificate found matching this verification code.");
      }
    } catch (err) {
      setError("Verification service error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
      <div className="w-full max-w-xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D9E2EC] overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-[#D9E2EC] p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center mx-auto mb-3 border border-blue-200">
              <Award className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Official Digital Certificate Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Search Input */}
            <form onSubmit={handleVerify} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Enter Verification Code (e.g. CC-IMD-2026-8941)"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#D9E2EC] rounded-lg text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors shrink-0 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>

            {/* Error message */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Verification Failed</p>
                  <p className="text-[11px] text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Verification Result */}
            {result && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-xs tracking-wider uppercase">
                      OFFICIALLY VERIFIED & ACTIVE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {result.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Awarded Officer</span>
                    <p className="text-sm font-bold text-slate-900">{result.traineeName}</p>
                    <p className="text-slate-500 text-[11px]">{result.department}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Course Curriculum</span>
                    <p className="font-semibold text-slate-800 text-xs">{result.courseTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-white rounded-md border border-emerald-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Code</span>
                      <p className="font-mono font-semibold text-slate-800 text-xs">{result.verificationCode}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-md border border-emerald-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Certificate Number</span>
                      <p className="font-mono font-semibold text-slate-800 text-xs">{result.certificateNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                    <span>Issued By: <b className="text-slate-700">{result.issuedBy}</b></span>
                    <span>Date: <b className="text-slate-700">{new Date(result.issuedAt).toLocaleDateString()}</b></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
