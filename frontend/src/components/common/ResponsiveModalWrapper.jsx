import React from "react";
import { X } from "lucide-react";

/**
 * A reusable modal wrapper that provides a consistent full‑screen responsive
 * behavior. The `modal-fullscreen` utility (defined in designSystem.css) makes
 * the modal occupy the entire viewport at the `md` breakpoint (≥ 768 px).
 *
 * Props:
 *   - isOpen: boolean – controls visibility
 *   - onClose: () => void – called when the close button is clicked
 *   - children: ReactNode – modal content
 *   - className: optional additional classes for the inner content container
 */
export const ResponsiveModalWrapper = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div
        className={`bg-white rounded-[var(--radius)] shadow-2xl border border-slate-200 overflow-hidden ${className} modal-fullscreen`}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 rounded-[var(--radius)] hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};
