const API_BASE_URL = "http://localhost:5000/api";

// --- Token Management ---
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

// --- Fetch helpers ---
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
  // Auth & Profile
  login: async (email, password, role) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
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

  submitProfileForApproval: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/profile/${id}/submit-approval`, {
      method: "POST",
      headers: getHeaders()
    });
    return res.json();
  },

  // Courses & Learning Materials
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

  updateCourse: async (id, courseData) => {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(courseData)
    });
    return res.json();
  },

  enrollCourse: async (courseId, traineeId) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ traineeId })
    });
    return res.json();
  },

  removeTraineeFromCourse: async (courseId, traineeId) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/trainees/${traineeId}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return res.json();
  },

  getTrainersWorkload: async () => {
    const res = await fetch(`${API_BASE_URL}/trainers/workload`, {
      headers: authHeaders()
    });
    return res.json();
  },

  generateBulkCertificates: async (courseId, templateData = {}) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/bulk-certificates`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(templateData)
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

  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },

  getFeedbacks: async (courseId) => {
    const res = await fetch(`${API_BASE_URL}/feedback${courseId ? `?courseId=${courseId}` : ""}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getTrainerEnrolledTrainees: async (trainerName, trainerId) => {
    const params = new URLSearchParams();
    if (trainerName) params.append("trainerName", trainerName);
    if (trainerId) params.append("trainerId", trainerId);
    const res = await fetch(`${API_BASE_URL}/trainers/enrolled-trainees?${params.toString()}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  // Centralized Content Library
  getContentLibrary: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") params.append(key, val);
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

  attachContentLibraryItem: async (id, courseId, subjectId, moduleId) => {
    const res = await fetch(`${API_BASE_URL}/trainers/content-library/${id}/attach`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ courseId, subjectId, moduleId })
    });
    return res.json();
  },

  // Progress Tracking
  markModuleComplete: async (moduleId, userId) => {
    const res = await fetch(`${API_BASE_URL}/progress/module/${moduleId}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  getUserProgress: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/progress/${userId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Question Bank & Assessment Quizzes
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
      headers: getHeaders()
    });
    return res.json();
  },

  deleteQuestion: async (id) => {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return res.json();
  },

  // AI Question & Course Recommendation Engines
  generateAiQuestions: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/ai/generate-questions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  generatePatternQuestionsWithAI: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/ai/generate-pattern-questions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
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
  },

  recommendCoursesWithAI: async (traineeProfile, courses) => {
    const res = await fetch(`${API_BASE_URL}/ai/recommend-courses`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ traineeProfile, courses })
    });
    return res.json();
  },

  synthesizeAssessmentPaperWithAI: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/ai/synthesize-paper`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Quizzes & Submissions
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

  createQuiz: async (quizData) => {
    const res = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(quizData)
    });
    return res.json();
  },

  submitQuiz: async (submissionData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/submit`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(submissionData)
      });
      return await res.json();
    } catch (e) {
      return { 
        success: true, 
        message: "Assessment recorded successfully.",
        submission: submissionData, 
        submissionId: `sub_${Date.now()}` 
      };
    }
  },

  submitQuizResult: async (submissionData) => {
    return api.submitQuiz(submissionData);
  },

  verifyCertificate: async (query) => {
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/verify`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ query })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Verification network error" };
    }
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

  getQuizSubmissions: async (quizId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submissions`, {
        headers: authHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, submissions: [] };
    }
  },

  logIntegrityViolation: async (quizId, payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/integrity-violation`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.warn("Integrity logging network fallback:", err);
      return { success: true, localOnly: true };
    }
  },

  getIntegrityAlerts: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/quizzes/integrity-alerts${query ? `?${query}` : ""}`, {
        headers: authHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, alerts: [] };
    }
  },

  resetDisqualification: async (quizId, traineeId) => {
    const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/reset-disqualification`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ traineeId })
    });
    return await res.json();
  },

  getTraineeSubmissions: async (traineeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/trainee/${traineeId}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      return {
        success: true,
        submissions: data.submissions || []
      };
    } catch (err) {
      return { success: false, submissions: [] };
    }
  },

  getTraineeAnalytics: async (traineeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/trainee/${traineeId}`, {
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, competencyRadar: [], submissions: [] };
    }
  },

  generateSummaryWithAI: async (payload) => {
    return api.generateMaterialSummary(payload);
  },

  // Competency Mapping
  getCompetencies: async () => {
    const res = await fetch(`${API_BASE_URL}/competencies`, {
      headers: authHeaders()
    });
    return res.json();
  },

  suggestTrainers: async (subjectName, requiredSkills) => {
    const res = await fetch(`${API_BASE_URL}/competencies/suggest-trainers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ subjectName, requiredSkills })
    });
    return res.json();
  },

  assignTrainerToCompetency: async (competencyId, trainerId, trainerName) => {
    const res = await fetch(`${API_BASE_URL}/competencies/${competencyId}/assign`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ trainerId, trainerName })
    });
    return res.json();
  },

  // Admin Features
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

  deleteAnnouncement: async (id) => {
    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return res.json();
  },

  // Helpdesk
  getHelpdeskTickets: async () => {
    const res = await fetch(`${API_BASE_URL}/helpdesk/tickets`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createHelpdeskTicket: async (ticketData) => {
    const res = await fetch(`${API_BASE_URL}/helpdesk/tickets`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(ticketData)
    });
    return res.json();
  }
};

