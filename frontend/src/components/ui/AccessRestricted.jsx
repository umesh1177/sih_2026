import React from 'react';

export const AccessRestricted = ({ tab, onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
      <p className="text-gray-600 mb-6">
        You do not have permission to view the <span className="font-medium">{tab}</span> section.
      </p>
      <button
        onClick={onNavigate}
        className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-[var(--radius)] transition-transform hover:scale-105"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default AccessRestricted;
