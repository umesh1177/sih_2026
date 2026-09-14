import React from 'react';

export const AssessmentCards = ({ blueprint, onUpdateBlueprint, onDeleteBlueprint }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 card-grid">
      {blueprint.map((bp, idx) => (
        <div key={bp.id || idx} className="card-glass p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm">{bp.topic}</h3>
            <button
              onClick={() => onDeleteBlueprint(idx)}
              className="text-red-500 hover:text-red-700"
              title="Remove Blueprint"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-gray-600 mb-2">Module: {bp.module}</div>
          <div className="text-xs mb-1">
            <span className="font-medium">Type:</span> {bp.type.toUpperCase()}
          </div>
          <div className="text-xs mb-1">
            <span className="font-medium">Questions:</span> {bp.questionCount}
          </div>
          <div className="text-xs mb-1">
            <span className="font-medium">Marks/Q:</span> {bp.marksPerQuestion}
          </div>
          <div className="text-xs mb-1">
            <span className="font-medium">Total:</span> {bp.totalMarks}m
          </div>
          <div className="text-xs mb-1">
            <span className="font-medium">Difficulty:</span> {bp.difficulty}
          </div>
          <div className="text-xs">
            <span className="font-medium">Competency:</span> {bp.competency}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentCards;
