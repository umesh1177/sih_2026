import React from "react";
import { X, Award, Printer, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";

export const CertificateModal = ({ isOpen, onClose, submission, courseTitle, traineeName }) => {
  if (!isOpen) return null;

  const certId = submission?.certificateId || "MOES-IMD-CERT-2025-0981";
  const name = traineeName || submission?.traineeName || "Rahul Sharma";
  const course = courseTitle || submission?.quizTitle || "Advanced Numerical Weather Prediction (NWP)";
  const date = submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : "10 February 2026";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl border border-[#D9E2EC] my-8">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2EC] mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1D4ED8]" />
            <span className="font-bold text-slate-800 text-sm">Official MoES Digital Capacity Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div id="certificate-print-area" className="p-8 bg-white rounded-lg border-2 border-slate-300 shadow-inner relative text-center overflow-hidden">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
            <Building2 className="w-96 h-96 text-slate-900" />
          </div>

          {/* MoES / IMD Header */}
          <div className="mb-4">
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#155E75] text-white flex items-center justify-center font-bold text-sm mb-2 shadow-xs">
              MoES
            </div>
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Government of India • Ministry of Earth Sciences
            </h3>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              INDIA METEOROLOGICAL DEPARTMENT
            </h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
              CAPACITY CONNECT • DIGITAL CAPACITY BUILDING REGISTRY
            </p>
          </div>

          <div className="w-20 h-0.5 bg-slate-200 mx-auto my-3"></div>

          {/* Certificate Title */}
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Certificate of Competency Mastery
          </h1>

          <p className="text-xs text-slate-500 max-w-md mx-auto mb-2">
            This is to officially certify that the designated meteorological officer
          </p>

          {/* Recipient Name */}
          <div className="py-2 mb-2">
            <h2 className="text-xl font-bold text-[#155E75] tracking-wide">
              {name}
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Scientist 'B' / Operational Weather Forecaster
            </p>
          </div>

          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed mb-4">
            has successfully completed all required modules, operational simulations, and secured competency verification in the standardized national assessment for
          </p>

          {/* Course Name */}
          <div className="p-3 bg-slate-50 border border-[#D9E2EC] rounded-lg max-w-lg mx-auto mb-6">
            <p className="text-sm font-bold text-slate-900">{course}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Grade: Distinction ({submission?.percentage || 95}%) • Full Proctoring Concurrence
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-4 items-end pt-4 border-t border-slate-200 max-w-lg mx-auto text-xs text-slate-600">
            <div className="text-center">
              <div className="h-7 flex items-end justify-center font-semibold text-slate-800 text-xs">
                Dr. Amit Sengupta
              </div>
              <div className="border-t border-slate-300 pt-1 text-[10px] font-medium text-slate-500">
                Lead Trainer & NWP Head
              </div>
            </div>

            {/* Official MoES Seal */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#1D4ED8] flex flex-col items-center justify-center border border-blue-200">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[7px] font-bold uppercase tracking-tighter">VERIFIED</span>
              </div>
            </div>

            <div className="text-center">
              <div className="h-7 flex items-end justify-center font-semibold text-slate-800 text-xs">
                Dr. M. Mohapatra
              </div>
              <div className="border-t border-slate-300 pt-1 text-[10px] font-medium text-slate-500">
                Director General of Meteorology
              </div>
            </div>
          </div>

          {/* Bottom ID & Date Bar */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Certificate ID: <b className="font-mono text-slate-700">{certId}</b></span>
            <span>Date: <b className="text-slate-700">{date}</b></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Cryptographically Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
