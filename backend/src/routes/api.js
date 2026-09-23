import express from "express";
import * as authController from "../controllers/authController.js";
import * as courseController from "../controllers/courseController.js";
import * as quizController from "../controllers/quizController.js";
import * as competencyController from "../controllers/competencyController.js";
import * as adminController from "../controllers/adminController.js";
import * as aiController from "../controllers/aiController.js";
import * as progressController from "../controllers/progressController.js";
import * as analyticsController from "../controllers/analyticsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// --- PUBLIC: Auth & Registration ---
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);

// --- PUBLIC: Homepage data (announcements & courses visible without login) ---
router.get("/announcements", adminController.getAnnouncements);
router.get("/courses", courseController.getCourses);
router.get("/courses/:id", courseController.getCourseById);
router.get("/certificates/verify/:certId", courseController.verifyCertificate);
router.post("/certificates/verify", courseController.verifyCertificate);

// --- PROTECTED: Profile ---
router.get("/users/profile/:id", requireAuth, authController.getProfile);
router.put("/users/profile/:id", requireAuth, authController.updateProfile);
router.post("/users/profile/:id/submit-approval", requireAuth, authController.submitProfileForApproval);

// --- PROTECTED: Course & Trainer management ---
router.post("/courses", requireAuth, requireRole("trainer", "admin"), courseController.createCourse);
router.put("/courses/:id", requireAuth, requireRole("trainer", "admin"), courseController.updateCourse);
router.post("/courses/:id/enroll", requireAuth, courseController.enrollCourse);
router.delete("/courses/:id/trainees/:traineeId", requireAuth, requireRole("admin"), courseController.removeTraineeFromCourse);
router.post("/courses/:id/bulk-certificates", requireAuth, requireRole("admin"), courseController.generateBulkCertificates);
router.get("/trainers/workload", requireAuth, requireRole("admin", "trainer"), courseController.getTrainersWorkload);
router.post("/courses/:courseId/subjects/:subjectId/modules", requireAuth, requireRole("trainer", "admin"), courseController.addModuleToSubject);
router.delete("/courses/:courseId/subjects/:subjectId/modules/:moduleId", requireAuth, requireRole("trainer", "admin"), courseController.deleteModuleFromSubject);
router.post("/courses/:courseId/subjects/:subjectId/modules/:moduleId/materials", requireAuth, requireRole("trainer", "admin"), courseController.uploadLearningMaterial);
router.get("/courses/:id/enrolled-trainees", requireAuth, requireRole("trainer", "admin"), courseController.getCourseEnrolledTrainees);
router.get("/courses/:id/trainer-performance", requireAuth, requireRole("trainer", "admin"), courseController.getCourseTrainerPerformance);
router.get("/trainers/enrolled-trainees", requireAuth, requireRole("trainer", "admin"), courseController.getTrainerEnrolledTrainees);
router.get("/trainers/content-library", requireAuth, requireRole("trainer", "admin"), courseController.getContentLibrary);
router.post("/trainers/content-library", requireAuth, requireRole("trainer", "admin"), courseController.createContentLibraryItem);
router.put("/trainers/content-library/:id", requireAuth, requireRole("trainer", "admin"), courseController.updateContentLibraryItem);
router.delete("/trainers/content-library/:id", requireAuth, requireRole("trainer", "admin"), courseController.deleteContentLibraryItem);
router.post("/trainers/content-library/:id/attach", requireAuth, requireRole("trainer", "admin"), courseController.attachContentLibraryItem);
router.get("/feedback", requireAuth, courseController.getFeedbacks);
router.post("/feedback", requireAuth, courseController.submitFeedback);

// --- PROTECTED: Progress Tracking ---
router.post("/progress/module/:moduleId", requireAuth, progressController.markModuleComplete);
router.get("/progress/:userId", requireAuth, progressController.getUserProgress);

// --- PROTECTED: Question Bank & Quizzes ---
router.get("/questions", requireAuth, quizController.getQuestionBank);
router.post("/questions", requireAuth, quizController.createQuestion);
router.post("/questions/:id/duplicate", requireAuth, requireRole("trainer", "admin"), quizController.duplicateQuestion);
router.delete("/questions/:id", requireAuth, requireRole("trainer", "admin"), quizController.deleteQuestion);

// --- PROTECTED: AI Question Generator, Pattern Cloner & Course Recommendations ---
router.post("/ai/generate-questions", requireAuth, aiController.generateQuestionsWithAI);
router.post("/ai/generate-pattern-questions", requireAuth, aiController.generatePatternQuestionsWithAI);
router.post("/ai/recommend-courses", requireAuth, aiController.recommendCoursesWithAI);
router.post("/ai/generate-summary", requireAuth, aiController.generateMaterialSummaryWithAI);
router.post("/ai/material-summary", requireAuth, aiController.generateMaterialSummaryWithAI);
router.post("/ai/synthesize-paper", requireAuth, aiController.synthesizeAssessmentPaperWithAI);

router.get("/quizzes", requireAuth, quizController.getQuizzes);
router.get("/quizzes/integrity-alerts", requireAuth, quizController.getIntegrityAlerts);
router.get("/quizzes/:id", requireAuth, quizController.getQuizById);
router.get("/quizzes/:id/submissions", requireAuth, quizController.getQuizSubmissions);
router.post("/quizzes", requireAuth, quizController.createQuiz);
router.post("/quizzes/submit", requireAuth, quizController.submitQuiz);
router.post("/quizzes/:id/integrity-violation", requireAuth, quizController.logIntegrityViolation);
router.post("/quizzes/:id/reset-disqualification", requireAuth, requireRole("trainer", "admin"), quizController.resetDisqualification);
router.post("/quizzes/:id/publish-results", requireAuth, requireRole("trainer", "admin"), quizController.publishQuizResults);
router.put("/quizzes/submissions/:id/evaluate", requireAuth, requireRole("trainer", "admin"), quizController.evaluateSubmission);
router.get("/quizzes/:id/analytics", requireAuth, quizController.getQuizAnalytics);

// --- PROTECTED: Role-Based Assessment Analytics Engine ---
router.get("/analytics/trainee/:traineeId", requireAuth, analyticsController.getTraineeAnalytics);
router.get("/analytics/trainer/:trainerId", requireAuth, requireRole("trainer", "admin"), analyticsController.getTrainerAnalytics);
router.get("/analytics/trainers", requireAuth, requireRole("trainer", "admin"), analyticsController.getAllTrainersAnalytics);
router.get("/analytics/admin", requireAuth, requireRole("admin"), analyticsController.getAdminAnalytics);
router.get("/analytics/assessment/:assessmentId", requireAuth, analyticsController.getAssessmentAnalytics);

// --- PROTECTED: Competency Mapping Engine ---
router.get("/competencies", requireAuth, competencyController.getCompetencyMatrix);
router.post("/competencies/suggest-trainers", requireAuth, competencyController.suggestTrainersForSubject);
router.post("/competencies/:competencyId/assign", requireAuth, requireRole("admin"), competencyController.assignTrainerToCompetency);

// --- PROTECTED: Admin Endpoints (admin role only) ---
router.get("/admin/stats", requireAuth, requireRole("admin"), adminController.getAdminStats);
router.get("/admin/analytics", requireAuth, requireRole("admin"), adminController.getPlatformAnalytics);
router.get("/admin/users/pending", requireAuth, requireRole("admin"), adminController.getPendingUsers);
router.get("/admin/users", requireAuth, requireRole("admin"), adminController.getAllUsers);
router.post("/admin/users/:id/verify", requireAuth, requireRole("admin"), adminController.verifyUser);
router.post("/announcements", requireAuth, requireRole("admin"), adminController.publishAnnouncement);
router.delete("/announcements/:id", requireAuth, requireRole("admin"), adminController.deleteAnnouncement);

export default router;
