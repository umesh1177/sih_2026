import React from "react";
import { X, Award, Download, Printer, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";

export const CertificateModal = ({ isOpen, onClose, submission, courseTitle, traineeName }) => {
  if (!isOpen) return null;

  const certId = submission?.certificateId || submission?.credentialId || submission?.id || `MOES-IMD-${Date.now().toString(36).toUpperCase()}`;
  const name = traineeName || submission?.traineeName || submission?.recipientName || "Trainee";
  const course = courseTitle || submission?.title || submission?.quizTitle || "Operational Meteorology Capacity Building Program";
  
  const pct = submission?.percentage ?? submission?.finalScore ?? submission?.score;
  const gradeDisplay = submission?.performanceCategory 
    ? `${submission.performanceCategory} (${pct ? `${pct}%` : "Verified"})`
    : submission?.grade 
      ? submission.grade 
      : pct !== undefined 
        ? (pct >= 90 ? `Distinction (${pct}%)` : pct >= 75 ? `Merit (${pct}%)` : `Pass (${pct}%)`)
        : "Distinction (Verified)";

  const date = submission?.submittedAt 
    ? new Date(submission.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : submission?.issuedAt 
      ? new Date(submission.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : (submission?.year || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));

  const designation = submission?.designation || "Scientist / Operational Weather Forecaster";
  const issuer = submission?.issuer || submission?.division || "Ministry of Earth Sciences / IMD Training Directorate";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-[var(--radius)] max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-slate-800 text-sm">Official MoES Digital Capacity Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-[var(--radius)] text-xs font-semibold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-[var(--radius)] text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div id="certificate-print-area" className="p-8 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/40 rounded-[var(--radius)] border-4 border-double border-amber-500/50 shadow-inner relative text-center overflow-hidden">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Building2 className="w-96 h-96 text-[#0a2558]" />
          </div>

          {/* MoES / IMD Header */}
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#0a2558] text-white flex items-center justify-center font-black text-xl mb-2 shadow-md">
              🏛️
            </div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              Government of India • Ministry of Earth Sciences
            </h3>
            <h2 className="text-lg font-black text-[#0a2558] tracking-tight mt-0.5">
              INDIA METEOROLOGICAL DEPARTMENT
            </h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
              CAPACITY CONNECT • DIGITAL CAPACITY BUILDING PORTAL
            </p>
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-3"></div>

          {/* Certificate Title */}
          <h1 className="text-xl md:text-2xl font-serif italic text-slate-900 font-semibold mb-2">
            Certificate of Competency Mastery
          </h1>

          <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
            This is to officially certify that the designated meteorological officer
          </p>

          {/* Recipient Name */}
          <div className="py-2 mb-3">
            <h2 className="text-2xl font-semibold text-[#0a2558] tracking-wide underline decoration-amber-400 decoration-2 underline-offset-8">
              {name}
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-2">
              {designation}
            </p>
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed mb-4">
            has successfully completed all required modules, operational simulations, and secured competency verification in
          </p>

          {/* Course Name */}
          <div className="p-3 bg-white/80 border border-slate-200 rounded-[var(--radius)] max-w-lg mx-auto mb-6 shadow-sm">
            <p className="text-sm font-medium text-slate-900">{course}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Grade: {gradeDisplay} • Tab Integrity Verified
            </p>
            {submission?.score !== undefined && submission?.totalMarks !== undefined && (
              <p className="text-[10px] text-slate-500 font-medium">
                Assessment Score: {submission.score} / {submission.totalMarks} Marks
              </p>
            )}
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-4 items-end pt-4 border-t border-slate-200 max-w-lg mx-auto text-xs text-slate-600">
            <div className="text-center">
              <div className="h-8 flex items-end justify-center font-serif italic text-slate-700 font-medium text-sm">
                Training Cell
              </div>
              <div className="border-t border-slate-400 pt-1 text-[10px] font-semibold text-slate-500">
                Course Coordinator
              </div>
            </div>

            {/* Official MoES Gold Seal */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-300">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-[7px] font-black uppercase tracking-tighter">VERIFIED</span>
              </div>
            </div>

            <div className="text-center">
              <div className="h-8 flex items-end justify-center font-serif italic text-slate-700 font-medium text-sm">
                Dr. M. Mohapatra
              </div>
              <div className="border-t border-slate-400 pt-1 text-[10px] font-semibold text-slate-500">
                Director General of Meteorology
              </div>
            </div>
          </div>

          {/* Bottom ID & Date Bar */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Certificate ID: <b className="font-mono text-slate-700">{certId}</b></span>
            <span>Date of Concurrence: <b className="text-slate-700">{date}</b></span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Digital QR Cryptographic Seal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
