import { db } from "../store/dbStore.js";

// ─── Question Bank (Accessible ONLY to Trainer & Admin) ───
export const getQuestionBank = (req, res) => {
  try {
    if (req.user.role === "trainee") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Question Bank is restricted to trainers and administrators."
      });
    }

    const { subjectId, type, difficulty, search } = req.query;
    const questions = db.getQuestions({ subjectId, type, difficulty, search }, true);
    return res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuestion = (req, res) => {
  try {
    const question = db.createQuestion(req.body, req.user);
    return res.status(201).json({ success: true, message: "Question created successfully", question });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const duplicateQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const duplicated = db.duplicateQuestion(id);
    if (!duplicated) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    return res.json({ success: true, message: "Question duplicated successfully", question: duplicated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteQuestion(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    return res.json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Quiz & Assessment Schedules ───
export const getQuizzes = (req, res) => {
  try {
    const { courseId, trainerId } = req.query;
    const quizzes = db.getQuizzes({ courseId, trainerId });
    return res.json({ success: true, count: quizzes.length, quizzes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Phase 5 Safe Trainee Assessment DTO: Strips correct answers and explanations for trainees
export const getQuizById = (req, res) => {
  try {
    const { id } = req.params;
    const isTrainee = req.user.role === "trainee";
    const quiz = db.getQuizById(id, isTrainee);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    return res.json({ success: true, quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getQuizAttemptDTO = (req, res) => {
  try {
    const { id } = req.params;
    const quiz = db.getQuizById(id, true); // strictly safe DTO

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    // Verify time window
    const now = new Date();
    const start = new Date(quiz.scheduledStartTime);
    const end = new Date(quiz.deadlineTime);

    if (now < start) {
      return res.status(403).json({
        success: false,
        message: `Assessment is not yet open. Scheduled to start on ${start.toLocaleString()}.`
      });
    }

    if (now > end) {
      return res.status(403).json({
        success: false,
        message: "Assessment deadline has passed. Late submissions are not permitted."
      });
    }

    return res.json({ success: true, assessment: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuiz = (req, res) => {
  try {
    const quiz = db.createQuiz(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Assessment created and scheduled successfully!",
      quiz
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Phase 5 Server-Side Graded Submission: IDOR safe, calculates score on server
export const submitQuiz = (req, res) => {
  try {
    const { quizId, answers, timeTakenSeconds, tabSwitchCount } = req.body;

    if (!quizId) {
      return res.status(400).json({ success: false, message: "Quiz ID is required." });
    }

    const submission = db.submitQuiz({
      quizId,
      traineeUser: req.user,
      answers: answers || {},
      timeTakenSeconds: Number(timeTakenSeconds) || 600,
      tabSwitchCount: Number(tabSwitchCount) || 0
    });

    return res.status(201).json({
      success: true,
      message: submission.passed 
        ? "Assessment successfully submitted! You passed the required competency benchmark." 
        : "Assessment submitted. Score recorded for instructor review.",
      submission
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Analytics & Evaluation ───
export const getQuizAnalytics = (req, res) => {
  try {
    const { id } = req.params;
    const quiz = db.getQuizById(id, false);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const submissions = db.getSubmissionsForQuiz(id);
    const totalSubmissions = submissions.length;

    if (totalSubmissions === 0) {
      return res.json({
        success: true,
        quiz,
        totalSubmissions: 0,
        analytics: {
          averageScore: 0,
          passRate: 0,
          highestScore: 0,
          lowestScore: 0,
          scoreDistribution: [
            { range: "0-40%", count: 0 },
            { range: "41-60%", count: 0 },
            { range: "61-80%", count: 0 },
            { range: "81-100%", count: 0 }
          ],
          traineeRankings: []
        }
      });
    }

    const totalScoreSum = submissions.reduce((acc, s) => acc + s.score, 0);
    const averageScore = Number((totalScoreSum / totalSubmissions).toFixed(1));
    const passedCount = submissions.filter(s => s.passed).length;
    const passRate = Math.round((passedCount / totalSubmissions) * 100);
    const scores = submissions.map(s => s.score);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const dist = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
    submissions.forEach(s => {
      const pct = s.percentage;
      if (pct <= 40) dist["0-40%"]++;
      else if (pct <= 60) dist["41-60%"]++;
      else if (pct <= 80) dist["61-80%"]++;
      else dist["81-100%"]++;
    });

    const scoreDistribution = Object.entries(dist).map(([range, count]) => ({ range, count }));

    const traineeRankings = [...submissions]
      .sort((a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds)
      .map((s, idx) => ({
        rank: idx + 1,
        traineeName: s.traineeName,
        traineeEmail: s.traineeEmail,
        score: s.score,
        totalMarks: s.totalMarks,
        percentage: s.percentage,
        passed: s.passed,
        timeTakenMinutes: Math.round(s.timeTakenSeconds / 60),
        tabSwitchCount: s.tabSwitchCount,
        certificateId: s.certificateId,
        submittedAt: s.submittedAt
      }));

    return res.json({
      success: true,
      quiz,
      totalSubmissions,
      analytics: {
        averageScore,
        passRate,
        highestScore,
        lowestScore,
        scoreDistribution,
        traineeRankings
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTraineeAnalytics = (req, res) => {
  try {
    const traineeId = req.user.role === "trainee" ? req.user.id : req.params.traineeId;
    const submissions = db.getSubmissionsForTrainee(traineeId);
    const courses = db.getCourses().filter(c => (c.enrolledTraineeIds || []).includes(traineeId));
    const certificates = db.getCertificates(traineeId);

    const totalQuizzesAttempted = submissions.length;
    const passedQuizzes = submissions.filter(s => s.passed).length;
    const avgScorePct = totalQuizzesAttempted > 0 
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalQuizzesAttempted) 
      : 0;

    const competencyRadar = [
      { subject: "NWP & Dynamics", score: 92, fullMark: 100 },
      { subject: "Doppler Radar (DWR)", score: 88, fullMark: 100 },
      { subject: "Cyclone Tracking", score: 85, fullMark: 100 },
      { subject: "Satellite Meteorology", score: 90, fullMark: 100 },
      { subject: "Data Assimilation", score: 78, fullMark: 100 },
      { subject: "Agrometeorology", score: 70, fullMark: 100 }
    ];

    return res.json({
      success: true,
      traineeId,
      summary: {
        totalEnrolledCourses: courses.length,
        totalQuizzesAttempted,
        passedQuizzes,
        totalCertificates: certificates.length,
        averageScorePercentage: avgScorePct
      },
      submissions,
      enrolledCourses: courses,
      certificates,
      competencyRadar
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const publishQuizResults = (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body || {};
    const result = db.publishQuizResults(id, feedback);
    if (!result) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }
    return res.json({
      success: true,
      message: `Results published successfully for ${result.updatedCount} cadet submission(s).`,
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const evaluateSubmission = (req, res) => {
  try {
    const { id } = req.params;
    const evaluated = db.evaluateSubmission(id, req.body);
    if (!evaluated) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    return res.json({
      success: true,
      message: "Cadet evaluation updated successfully!",
      submission: evaluated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
