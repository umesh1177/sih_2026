import { db } from "../store/dbStore.js";

// --- Question Bank Management (Matches Screenshot 1 & 3 UI) ---
export const getQuestionBank = (req, res) => {
  try {
    const { subjectId, type, difficulty, search } = req.query;
    const questions = db.getQuestions({ subjectId, type, difficulty, search });
    return res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuestion = (req, res) => {
  try {
    const question = db.createQuestion(req.body);
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

// --- Quiz Scheduling & Management ---
export const getQuizzes = (req, res) => {
  try {
    const { courseId, trainerId, subjectId, subjectName } = req.query;
    let quizzes = db.getQuizzes();
    if (courseId) {
      quizzes = quizzes.filter(q => q.courseId === courseId);
    }
    if (trainerId) {
      quizzes = quizzes.filter(q => q.trainerId === trainerId);
    }
    if (subjectId) {
      quizzes = quizzes.filter(q => q.subjectId === subjectId || q.subjectId === "all");
    }
    if (subjectName) {
      quizzes = quizzes.filter(q => 
        (q.subjectName && q.subjectName.toLowerCase().includes(subjectName.toLowerCase())) ||
        (q.title && q.title.toLowerCase().includes(subjectName.toLowerCase()))
      );
    }
    return res.json({ success: true, count: quizzes.length, quizzes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getQuizById = (req, res) => {
  try {
    const { id } = req.params;
    const quiz = db.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    return res.json({ success: true, quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuiz = (req, res) => {
  try {
    const quiz = db.createQuiz(req.body);
    return res.status(201).json({
      success: true,
      message: "Quiz created and scheduled successfully! Card will appear on Trainee Dashboard according to scheduled time.",
      quiz
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Submission & Kiosk Mode Exam Execution ---
export const submitQuiz = (req, res) => {
  try {
    const submission = db.submitQuiz(req.body);
    return res.status(201).json({
      success: true,
      message: submission.passed ? "Assessment submitted! Congratulations, you passed!" : "Assessment submitted.",
      submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- 1-Click Result Generation & Batch Analytics ---
export const getQuizAnalytics = (req, res) => {
  try {
    const { id } = req.params;
    const quiz = db.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
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
          questionAccuracy: quiz.questions.map(q => ({
            questionId: q.id,
            questionTitle: q.question.substring(0, 45) + "...",
            accuracy: 0,
            difficulty: q.difficulty || "Medium",
            marks: q.marks
          })),
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

    // Distribution
    const dist = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
    submissions.forEach(s => {
      const pct = s.percentage;
      if (pct <= 40) dist["0-40%"]++;
      else if (pct <= 60) dist["41-60%"]++;
      else if (pct <= 80) dist["61-80%"]++;
      else dist["81-100%"]++;
    });

    const scoreDistribution = Object.entries(dist).map(([range, count]) => ({ range, count }));

    // Question Accuracy
    const questionAccuracy = quiz.questions.map(q => {
      let correctAnswers = 0;
      submissions.forEach(s => {
        if (s.answers && s.answers[q.id] === q.correctAnswer) {
          correctAnswers++;
        }
      });
      const accPct = Math.round((correctAnswers / totalSubmissions) * 100);
      return {
        questionId: q.id,
        questionTitle: q.question.length > 50 ? q.question.substring(0, 47) + "..." : q.question,
        accuracy: accPct,
        difficulty: q.difficulty || "Medium",
        marks: q.marks
      };
    });

    // Trainee rankings sorted by score descending
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
        questionAccuracy,
        traineeRankings
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Personal Trainee Analytics ---
export const getTraineeAnalytics = (req, res) => {
  try {
    const { traineeId } = req.params;
    const submissions = db.getSubmissionsForTrainee(traineeId);
    const courses = db.getCourses().filter(c => (c.enrolledTraineeIds || []).includes(traineeId));

    const totalQuizzesAttempted = submissions.length;
    const passedQuizzes = submissions.filter(s => s.passed).length;
    const totalCertificates = submissions.filter(s => s.certificateGenerated).length;
    const avgScorePct = totalQuizzesAttempted > 0 
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalQuizzesAttempted) 
      : 0;

    // Radar Competency Scores for Trainee
    const competencyRadar = [
      { subject: "NWP & Dynamics", score: 92, fullMark: 100 },
      { subject: "Doppler Radar (DWR)", score: 88, fullMark: 100 },
      { subject: "Cyclone Dvorak Tech", score: 85, fullMark: 100 },
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
        totalCertificates,
        averageScorePercentage: avgScorePct
      },
      submissions,
      enrolledCourses: courses,
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
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    return res.json({
      success: true,
      message: `Results published successfully for ${result.updatedCount} cadet submission(s)! Trainees can now view their scores and answer breakdowns.`,
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
