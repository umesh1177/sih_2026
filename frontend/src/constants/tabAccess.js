// Tab access control map for Capacity Connect frontend
// Maps tab identifiers to allowed roles. "all" means any logged‑in role can access.
export const TAB_ACCESS = {
  dashboard: ["admin", "trainer", "trainee"],
  approvals: ["admin"],
  announcements: ["admin"],
  "content-library": ["trainer"],
  "schedule-assessment": ["trainer"],
  "trainer-matching": ["admin"],
  "course-feedback": ["admin", "trainer"],
  courses: ["all"],
  subjects: ["all"],
  "my-learning": ["all"],
  questions: ["admin", "trainer", "trainee"],
  "practice-papers": ["trainee"],
  "trainee-performance": ["admin", "trainer", "trainee"],
  "learning-gaps": ["admin", "trainer", "trainee"],
  analytics: ["admin", "trainer", "trainee"],
  certificates: ["admin", "trainer", "trainee"],
  profile: ["all"],
  helpdesk: ["all"], // new helpdesk tab accessible to all logged‑in users
  // Add any additional tabs here as needed
};
