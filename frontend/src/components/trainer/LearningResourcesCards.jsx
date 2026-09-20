import React from 'react';
import { FileText, ExternalLink, Download, BookOpen, Layers } from 'lucide-react';

export const LearningResourcesCards = ({ resources = [] }) => {
  const defaultResources = [
    {
      id: "res_nwp_01",
      title: "WRF v4.5 Operational Reference Guide",
      description: "Technical handbook covering domain nesting, microphysics options, and 4D-Var data assimilation pipelines.",
      category: "NWP Modeling",
      type: "PDF Document",
      size: "4.8 MB"
    },
    {
      id: "res_dwr_02",
      title: "S-Band Doppler Weather Radar Calibration Standard",
      description: "Standard operating procedures for reflectivity calibration, velocity de-aliasing, and ground clutter filtering.",
      category: "Radar Meteorology",
      type: "Manual",
      size: "2.3 MB"
    },
    {
      id: "res_sat_03",
      title: "INSAT-3DR & 3DS Channel Product Manual",
      description: "Multi-spectral thermal band interpretation and convective storm tracking algorithms.",
      category: "Satellite Meteorology",
      type: "Technical Note",
      size: "6.1 MB"
    }
  ];

  const displayResources = resources && resources.length > 0 ? resources : defaultResources;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayResources.map((res) => (
        <div
          key={res.id || res.title}
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                {res.category || "Resource"}
              </span>
              <span className="text-[11px] font-medium text-slate-400">{res.size || res.type || "PDF"}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1.5 group-hover:text-blue-600 transition-colors">
              {res.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {res.description}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Access Document
            </span>
            <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearningResourcesCards;

