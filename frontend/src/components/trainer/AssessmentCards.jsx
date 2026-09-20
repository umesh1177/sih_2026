import React from 'react';
import { Trash2, HelpCircle, CheckSquare, Layers, Award } from 'lucide-react';

export const AssessmentCards = ({ blueprint = [], onUpdateBlueprint, onDeleteBlueprint }) => {
  if (!blueprint || blueprint.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No blueprint items generated yet.</p>
        <p className="text-xs text-slate-400 mt-1">Configure topics and click generate blueprint above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {blueprint.map((bp, idx) => (
        <div
          key={bp.id || idx}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">{bp.topic}</h3>
              {onDeleteBlueprint && (
                <button
                  onClick={() => onDeleteBlueprint(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  title="Remove Blueprint Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1">
              <Layers className="w-3 h-3" /> {bp.module || "General Module"}
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Question Type</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 uppercase">{bp.type}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Questions Count</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{bp.questionCount}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Total Marks</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">{bp.totalMarks}m</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400">Difficulty Level</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {bp.difficulty}
                </span>
              </div>
            </div>
          </div>
          {bp.competency && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{bp.competency}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssessmentCards;

