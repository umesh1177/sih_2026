import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CredentialsCard = ({ credentials = [] }) => {
  const defaultCredentials = [
    {
      id: "cred_nwp_01",
      title: "Advanced Operational Meteorologist (NWP)",
      issuer: "IMD Central Training Institute, Pune",
      year: "2025",
      cadre: "MOES-FAC-2026-0101",
      description: "Certified for high-resolution WRF domain management and global ensemble assimilation operations."
    },
    {
      id: "cred_dwr_02",
      title: "Doppler Weather Radar Systems Specialist",
      issuer: "Radar & Satellite Division, MoES",
      year: "2024",
      cadre: "MOES-FAC-2026-0102",
      description: "Authorized for S-band dual-polarization radar maintenance, calibration, and convective nowcasting."
    },
    {
      id: "cred_cyc_03",
      title: "Tropical Cyclone Warning Specialist",
      issuer: "RSMC Tropical Cyclones, New Delhi",
      year: "2024",
      cadre: "MOES-FAC-2026-0103",
      description: "Certified forecaster for Bay of Bengal storm surge modeling and Dvorak intensity estimations."
    }
  ];

  const displayCredentials = credentials && credentials.length > 0 ? credentials : defaultCredentials;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayCredentials.map((cred) => (
        <div
          key={cred.id || cred.title}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Cadre
              </span>
              <span className="text-[11px] font-medium text-slate-400">{cred.year || "2025"}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
              {cred.title}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
              {cred.issuer}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              {cred.description}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>ID: <span className="font-mono text-slate-700 dark:text-slate-300">{cred.cadre || cred.id}</span></span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CredentialsCard;

