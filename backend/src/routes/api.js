import express from "express";
import * as authController from "../controllers/authController.js";
import * as courseController from "../controllers/courseController.js";
import * as quizController from "../controllers/quizController.js";
import * as competencyController from "../controllers/competencyController.js";
import * as credentialController from "../controllers/credentialController.js";
import * as organizationController from "../controllers/organizationController.js";
import * as certificateController from "../controllers/certificateController.js";
import * as adminController from "../controllers/adminController.js";
import * as aiController from "../controllers/aiController.js";
import * as progressController from "../controllers/progressController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, registerSchema, loginSchema } from "../middleware/validate.js";

const router = express.Router();

// ─── 1. PUBLIC ENDPOINTS ───
router.post("/auth/login", validateBody(loginSchema), authController.login);
router.post("/auth/register", validateBody(registerSchema), authController.register);

router.get("/announcements", adminController.getAnnouncements);
router.get("/courses", courseController.getCourses);
router.get("/courses/:id", courseController.getCourseById);
router.get("/organizations", organizationController.getOrganizations);
router.get("/departments", organizationController.getDepartments);
router.get("/certificates/verify/:code", certificateController.verifyCertificate);

// ─── 2. PROTECTED: Authenticated Officer Identity & Ownership-Safe Profiles (Phase 4) ───
router.get("/users/me", requireAuth, authController.getMe);
router.put("/users/me", requireAuth, authController.updateMe);
router.get("/progress/me", requireAuth, progressController.getMyProgress);
router.get("/certificates/my", requireAuth, certificateController.getMyCertificates);

router.get("/users/profile/:id", requireAuth, authController.getProfile);
router.put("/users/profile/:id", requireAuth, authController.updateProfile);

// ─── 3. PROTECTED: Course & Progress Management ───
router.post("/courses", requireAuth, requireRole("trainer", "admin"), courseController.createCourse);
router.post("/courses/:id/enroll", requireAuth, courseController.enrollCourse);

router.post("/courses/:courseId/subjects/:subjectId/modules", requireAuth, requireRole("trainer", "admin"), courseController.addModuleToSubject);
router.delete("/courses/:courseId/subjects/:subjectId/modules/:moduleId", requireAuth, requireRole("trainer", "admin"), courseController.deleteModuleFromSubject);
router.post("/courses/:courseId/subjects/:subjectId/modules/:moduleId/materials", requireAuth, requireRole("trainer", "admin"), courseController.uploadLearningMaterial);
router.delete("/courses/:courseId/subjects/:subjectId/modules/:moduleId/materials/:materialId", requireAuth, requireRole("trainer", "admin"), courseController.deleteLearningMaterial);

router.post("/progress/module/:moduleId", requireAuth, progressController.markModuleComplete);
router.get("/progress/:userId", requireAuth, progressController.getUserProgress);

// ─── 4. PROTECTED: Trainer Content Library & Enrolled Cadets ───
router.get("/trainers/enrolled-trainees", requireAuth, requireRole("trainer", "admin"), courseController.getTrainerEnrolledTrainees);
router.get("/trainers/content-library", requireAuth, requireRole("trainer", "admin"), courseController.getContentLibrary);
router.post("/trainers/content-library", requireAuth, requireRole("trainer", "admin"), courseController.createContentLibraryItem);
router.put("/trainers/content-library/:id", requireAuth, requireRole("trainer", "admin"), courseController.updateContentLibraryItem);
router.delete("/trainers/content-library/:id", requireAuth, requireRole("trainer", "admin"), courseController.deleteContentLibraryItem);

router.get("/feedback", requireAuth, courseController.getFeedbacks);
router.post("/feedback", requireAuth, courseController.submitFeedback);

// ─── 5. PROTECTED: Question Bank (Phase 5) ───
router.get("/questions", requireAuth, requireRole("trainer", "admin"), quizController.getQuestionBank);
router.post("/questions", requireAuth, requireRole("trainer", "admin"), quizController.createQuestion);
router.post("/questions/:id/duplicate", requireAuth, requireRole("trainer", "admin"), quizController.duplicateQuestion);
router.delete("/questions/:id", requireAuth, requireRole("trainer", "admin"), quizController.deleteQuestion);

// ─── 6. PROTECTED: Assessments & Kiosk Execution ───
router.get("/quizzes", requireAuth, quizController.getQuizzes);
router.get("/quizzes/:id", requireAuth, quizController.getQuizById);
router.get("/assessments/:id/attempt", requireAuth, quizController.getQuizAttemptDTO);
router.post("/quizzes", requireAuth, requireRole("trainer", "admin"), quizController.createQuiz);
router.post("/quizzes/submit", requireAuth, quizController.submitQuiz);
router.post("/quizzes/:id/publish-results", requireAuth, requireRole("trainer", "admin"), quizController.publishQuizResults);
router.put("/quizzes/submissions/:id/evaluate", requireAuth, requireRole("trainer", "admin"), quizController.evaluateSubmission);
router.get("/quizzes/:id/analytics", requireAuth, requireRole("trainer", "admin"), quizController.getQuizAnalytics);
router.get("/analytics/trainee/:traineeId", requireAuth, quizController.getTraineeAnalytics);

// ─── 7. PROTECTED: Explainable Competency Engine & Credential Verification (Phase 6 & 7) ───
router.get("/competencies", requireAuth, competencyController.getCompetencyMatrix);
router.post("/competencies/suggest-trainers", requireAuth, competencyController.suggestTrainersForSubject);
router.post("/competencies/:competencyId/assign", requireAuth, requireRole("admin"), competencyController.assignTrainerToCompetency);

router.get("/trainers/credentials", requireAuth, requireRole("trainer", "admin"), credentialController.getTrainerCredentials);
router.post("/trainers/credentials", requireAuth, requireRole("trainer"), credentialController.submitCredential);
router.get("/admin/credentials/pending", requireAuth, requireRole("admin"), credentialController.getPendingCredentials);
router.post("/admin/credentials/:id/verify", requireAuth, requireRole("admin"), credentialController.verifyCredential);

// ─── 8. PROTECTED: Admin Scope & Governance (Phase 3 & 12) ───
router.get("/admin/stats", requireAuth, requireRole("admin"), adminController.getAdminStats);
router.get("/admin/users/pending", requireAuth, requireRole("admin"), adminController.getPendingUsers);
router.get("/admin/users", requireAuth, requireRole("admin"), adminController.getAllUsers);
router.post("/admin/users/:id/verify", requireAuth, requireRole("admin"), adminController.verifyUser);
router.get("/admin/org-structure", requireAuth, requireRole("admin"), organizationController.getDepartmentStructure);
router.get("/admin/audit-logs", requireAuth, requireRole("admin"), organizationController.getAuditLogs);
router.post("/announcements", requireAuth, requireRole("admin"), adminController.publishAnnouncement);

// ─── 9. PROTECTED: AI-Assisted Drafting (Phase 11) ───
router.post("/ai/generate-questions", requireAuth, requireRole("trainer", "admin"), aiController.generateQuestionsWithAI);
router.post("/ai/recommend-courses", requireAuth, aiController.recommendCoursesWithAI);
router.post("/ai/generate-summary", requireAuth, aiController.generateMaterialSummaryWithAI);

export default router;
