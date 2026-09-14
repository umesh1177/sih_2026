import React from "react";

export const HelpdeskView = ({ onBack }) => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-sm text-primary hover:underline mr-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-[#172033]">Helpdesk / Support</h1>
      </div>
      <p className="text-base text-[#475569] mb-4">
        Find answers to common questions, submit a ticket, or contact the Ministry of Earth Sciences support team.
      </p>
      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="border border-[#E2E8F0] rounded-[var(--radius)] p-4">
          <h2 className="text-lg font-medium text-[#172033] mb-2">How do I reset my password?</h2>
          <p className="text-sm text-[#475569]">Use the "Forgot password" link on the login page. An email will be sent with a reset link.</p>
        </div>
        <div className="border border-[#E2E8F0] rounded-[var(--radius)] p-4">
          <h2 className="text-lg font-medium text-[#172033] mb-2">How to request a new course?</h2>
          <p className="text-sm text-[#475569]">Navigate to the Courses tab and click "Create Course" (admin only).</p>
        </div>
      </div>
      {/* Ticket Submission */}
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-primary text-white rounded-[var(--radius)] hover:bg-primary/90 transition-colors"
        >
          Submit a Support Ticket
        </button>
      </div>
    </div>
  );
};
