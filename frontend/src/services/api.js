const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Token Management ───
export const setToken = (token) => {
  if (token) localStorage.setItem("cc_token", token);
};

export const getToken = () => localStorage.getItem("cc_token");

export const clearToken = () => localStorage.removeItem("cc_token");

export const setStoredUser = (user) => {
  if (user) localStorage.setItem("cc_user", JSON.stringify(user));
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("cc_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearStoredUser = () => localStorage.removeItem("cc_user");

// ─── Header Helpers ───
const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // ─── Authentication & Profile ───
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateMe: async (data) => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getProfile: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateProfile: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ─── Organization & Departments ───
  getOrganizations: async () => {
    const res = await fetch(`${API_BASE_URL}/organizations`);
    return res.json();
  },

  getDepartments: async (orgId) => {
    const res = await fetch(`${API_BASE_URL}/departments${orgId ? `?organizationId=${orgId}` : ""}`);
    return res.json();
  },

  getDepartmentStructure: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/org-structure`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs${query ? `?${query}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // ─── Courses & Curriculum ───
  getCourses: async () => {
    const res = await fetch(`${API_BASE_URL}/courses`);
    return res.json();
  },

  getCourseById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`);
    return res.json();
  },

  createCourse: async (courseData) => {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(courseData)
    });
    return res.json();
  },

  enrollCourse: async (courseId) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({}) // Identity derived on server via req.user.id
    });
    return res.json();
  },

  addModuleToSubject: async (courseId, subjectId, moduleData) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/subjects/${subjectId}/modules`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(moduleData)
    });
    return res.json();
  },

  deleteModuleFromSubject: async (courseId, subjectId, moduleId) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return res.json();
  },

  uploadMaterial: async (courseId, subjectId, moduleId, materialData) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/materials`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(materialData)
    });
    return res.json();
  },

  removeMaterialFromModule: async (courseId, subjectId, moduleId, materialId) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/subjects/${subjectId}/modules/${moduleId}/materials/${materialId}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return res.json();
  },

  // ─── Progress Tracking ───
  markModuleComplete: async (moduleId) => {
    const res = await fetch(`${API_BASE_URL}/progress/module/${moduleId}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({})
    });
    return res.json();
  },

  getMyProgress: async () => {
    const res = await fetch(`${API_BASE_URL}/progress/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getUserProgress: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/progress/${userId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // ─── Trainer Content Library ───
  getContentLibrary: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, v);
    });
    const res = await fetch(`${API_BASE_URL}/trainers/content-library?${params.toString()}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  createContentLibraryItem: async (itemData) => {
    const res = await fetch(`${API_BASE_URL}/trainers/content-library`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(itemData)
    });
    return res.json();
  },

  updateContentLibraryItem: async (id, itemData) => {
    const res = await fetch(`${API_BASE_URL}/trainers/content-library/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(itemData)
    });
    return res.json();
  },

  deleteContentLibraryItem: async (id) => {
    const res = await fetch(`${API_BASE_URL}/trainers/content-library/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return res.json();
  },

  getTrainerEnrolledTrainees: async () => {
    const res = await fetch(`${API_BASE_URL}/trainers/enrolled-trainees`, {
      headers: authHeaders()
    });
    return res.json();
  },

  // ─── Question Bank & Assessments ───
  getQuestions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/questions${query ? `?${query}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createQuestion: async (questionData) => {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(questionData)
    });
    return res.json();
  },

  duplicateQuestion: async (id) => {
    const res = await fetch(`${API_BASE_URL}/questions/${id}/duplicate`, {
      method: "POST",
      headers: authHeaders()
    });
    return res.json();
  },

  deleteQuestion: async (id) => {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return res.json();
  },

  getQuizzes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/quizzes${query ? `?${query}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getQuizById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getQuizAttemptDTO: async (id) => {
    const res = await fetch(`${API_BASE_URL}/assessments/${id}/attempt`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createQuiz: async (quizData) => {
    const res = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(quizData)
    });
    return res.json();
  },

  submitQuiz: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/quizzes/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getQuizAnalytics: async (quizId) => {
    const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/analytics`, {
      headers: getHeaders()
    });
    return res.json();
  },

  publishQuizResults: async (quizId, feedback = "") => {
    const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/publish-results`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ feedback })
    });
    return res.json();
  },

  evaluateSubmission: async (submissionId, updates = {}) => {
    const res = await fetch(`${API_BASE_URL}/quizzes/submissions/${submissionId}/evaluate`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  getTraineeAnalytics: async (traineeId) => {
    const res = await fetch(`${API_BASE_URL}/analytics/trainee/${traineeId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // ─── Explainable Competency Engine ───
  getCompetencies: async () => {
    const res = await fetch(`${API_BASE_URL}/competencies`, {
      headers: getHeaders()
    });
    return res.json();
  },

  suggestTrainers: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/competencies/suggest-trainers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  assignTrainerToCompetency: async (competencyId, trainerId, courseId) => {
    const res = await fetch(`${API_BASE_URL}/competencies/${competencyId}/assign`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ trainerId, courseId })
    });
    return res.json();
  },

  // ─── Credential Verification ───
  getPendingCredentials: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/credentials/pending`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getTrainerCredentials: async (trainerId) => {
    const res = await fetch(`${API_BASE_URL}/trainers/credentials${trainerId ? `?trainerId=${trainerId}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  submitCredential: async (credData) => {
    const res = await fetch(`${API_BASE_URL}/trainers/credentials`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(credData)
    });
    return res.json();
  },

  verifyCredential: async (id, approved, notes) => {
    const res = await fetch(`${API_BASE_URL}/admin/credentials/${id}/verify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ approved, notes })
    });
    return res.json();
  },

  // ─── Certificate Verification ───
  verifyCertificate: async (code) => {
    const res = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(code)}`);
    return res.json();
  },

  getMyCertificates: async () => {
    const res = await fetch(`${API_BASE_URL}/certificates/my`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // ─── Admin Management ───
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getPendingUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users/pending`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/users${query ? `?${query}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  verifyUser: async (id, approved, notes) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/verify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ approved, notes })
    });
    return res.json();
  },

  getAnnouncements: async () => {
    const res = await fetch(`${API_BASE_URL}/announcements`);
    return res.json();
  },

  publishAnnouncement: async (annData) => {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(annData)
    });
    return res.json();
  },

  // ─── Feedbacks ───
  getFeedbacks: async (courseId) => {
    const res = await fetch(`${API_BASE_URL}/feedback${courseId ? `?courseId=${courseId}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },

  // ─── AI Assistance ───
  generateAiQuestions: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/ai/generate-questions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  recommendCoursesWithAI: async (traineeProfile, courses) => {
    const res = await fetch(`${API_BASE_URL}/ai/recommend-courses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ traineeProfile, courses })
    });
    return res.json();
  },

  generateMaterialSummary: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/ai/generate-summary`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
