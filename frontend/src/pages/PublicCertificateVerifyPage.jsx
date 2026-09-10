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
    <div className="min-h-screen bg-gradient-to-br from-[#050f2c] via-[#0a2558] to-slate-900 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-200/70 hover:text-white text-xs font-semibold mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Portal Home
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a2558] to-blue-900 p-8 text-white text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Official Digital Certificate Verification
            </h1>
            <p className="text-xs text-blue-100/80 mt-1 max-w-md mx-auto">
              Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Search Input */}
            <form onSubmit={handleVerify} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Enter Verification Code (e.g. CC-IMD-2026-8941)"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-2xl text-xs shadow-md transition-all shrink-0 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify Certificate"}
              </button>
            </form>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Verification Failed</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Verification Result */}
            {result && (
              <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-black text-emerald-900 text-xs tracking-wider uppercase">
                      OFFICIALLY ACCREDITED & VERIFIED
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {result.status}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Awarded Officer</span>
                    <p className="text-base font-extrabold text-slate-900">{result.traineeName}</p>
                    <p className="text-slate-500 text-[11px]">{result.department}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Course Curriculum</span>
                    <p className="font-bold text-slate-800 text-sm">{result.courseTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Code</span>
                      <p className="font-mono font-bold text-slate-800">{result.verificationCode}</p>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Certificate Number</span>
                      <p className="font-mono font-bold text-slate-800">{result.certificateNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                    <span>Issued By: <b>{result.issuedBy}</b></span>
                    <span>Date: <b>{new Date(result.issuedAt).toLocaleDateString()}</b></span>
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
