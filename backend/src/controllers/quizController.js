import { db } from "../store/dbStore.js";

// --- Question Bank Management ---
export const getQuestionBank = (req, res) => {
  try {
    const { subjectId, type, difficulty, search } = req.query;
    let questions = db.getQuestions({ subjectId, type, difficulty, search });

    // DATA ISOLATION: Trainees and Trainers can ONLY see their own uploaded/generated questions
    if (req.user && req.user.role === "trainee") {
      questions = questions.filter(q => q.createdBy === req.user.id || q.createdBy === req.user.email);
    } else if (req.user && req.user.role === "trainer") {
      questions = questions.filter(q => 
        q.createdBy === req.user.id || 
        q.createdBy === req.user.email || 
        (req.user.name && q.createdByName && q.createdByName.toLowerCase() === req.user.name.toLowerCase())
      );
    }

    return res.json({ success: true, count: questions.length, questions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuestion = (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy || "u_trainer_1",
      createdByEmail: req.user?.email || req.body.createdByEmail || null,
      createdByName: req.user?.name || req.body.createdByName || null,
      createdByRole: req.user?.role || req.body.createdByRole || "trainer"
    };
    const question = db.createQuestion(questionData);
    return res.status(201).json({ success: true, message: "Question created successfully", question });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const duplicateQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const duplicated = db.duplicateQuestion(id, req.user);
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
    const { courseId, trainerId, subjectId, subjectName, traineeId, practiceOnly, enrolledOnly } = req.query;
    let quizzes = db.getQuizzes();

    // TRAINER DATA ISOLATION: Trainer can ONLY see scheduled assessments they created/conduct
    const isTrainerRole = req.user && req.user.role === "trainer";
    const currentTrainerId = isTrainerRole ? req.user.id : (trainerId || null);
    const currentTrainerName = isTrainerRole ? req.user.name : null;

    if (isTrainerRole || currentTrainerId) {
      quizzes = quizzes.filter(q => {
        if (currentTrainerId && (q.trainerId === currentTrainerId || q.createdBy === currentTrainerId || q.authorId === currentTrainerId)) return true;
        if (currentTrainerName && q.trainerName) {
          const qName = q.trainerName.toLowerCase();
          const tName = currentTrainerName.toLowerCase();
          if (qName === tName || qName.includes(tName) || tName.includes(qName)) return true;
        }
        if (currentTrainerName && q.createdByName) {
          const qName = q.createdByName.toLowerCase();
          const tName = currentTrainerName.toLowerCase();
          if (qName === tName || qName.includes(tName) || tName.includes(qName)) return true;
        }
        return false;
      });
    }

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
    if (traineeId) {
      quizzes = quizzes.filter(q => {
        // Skip practice papers for trainee-specific filtering
        if (q.isPractice === true) return true; // Practice handled separately below
        // Specifically targeted to certain trainees: check membership
        if (q.targetTraineeIds && Array.isArray(q.targetTraineeIds) && q.targetTraineeIds.length > 0) {
          return q.targetTraineeIds.includes(traineeId);
        }
        // Empty targetTraineeIds [] = trainer chose "All Enrolled Trainees" → broadcast to all
        return true;
      });
    }

    // ENROLLMENT-BASED FILTERING: For trainee role, return quizzes for enrolled courses, enrolled subjects, or open/general scheduled exams
    if (enrolledOnly === "true" && traineeId) {
      const traineeUser = db.findUserById(traineeId);
      const enrolledCourseIds = new Set();
      const enrolledSubjectNames = new Set();
      const enrolledSubjectIds = new Set();
      if (traineeUser) {
        db.getCourses().forEach(c => {
          if ((c.enrolledTraineeIds || []).includes(traineeId)) {
            enrolledCourseIds.add(c.id);
            (c.subjects || []).forEach(s => {
              if (s.id) enrolledSubjectIds.add(s.id);
              if (s.name || s.title) enrolledSubjectNames.add((s.name || s.title).toLowerCase().trim());
            });
          }
        });
      }
      quizzes = quizzes.filter(q => {
        if (q.isPractice === true) return false;
        // Empty targetTraineeIds = trainer scheduled for "All Enrolled Trainees" = open broadcast
        if (Array.isArray(q.targetTraineeIds) && q.targetTraineeIds.length === 0) return true;
        // Explicitly open to all or no course restriction
        if (!q.courseId || q.isAllTrainees) return true;
        // No enrolled courses yet: show all available official quizzes
        if (enrolledCourseIds.size === 0) return true;
        // Match by enrolled course ID
        if (enrolledCourseIds.has(q.courseId)) return true;
        // Match by enrolled course name
        if (q.courseName && Array.from(enrolledCourseIds).some(cid => {
          const c = db.getCourseById(cid);
          return c && c.title?.toLowerCase() === q.courseName?.toLowerCase();
        })) return true;
        // Match by enrolled subject ID or subject name
        if (q.subjectId && enrolledSubjectIds.has(q.subjectId)) return true;
        if (q.subjectName && enrolledSubjectNames.has(q.subjectName.toLowerCase().trim())) return true;
        return false;
      });
    }

    // PRACTICE PAPER FILTERING: Return practice drills created by this trainee or generated AI drills
    if (practiceOnly === "true") {
      if (traineeId) {
        quizzes = quizzes.filter(q =>
          (q.isPractice === true || q.type === "practice") &&
          (q.createdBy === traineeId || !q.createdBy || q.createdByRole === "trainee" || q.isAllTrainees)
        );
      } else {
        quizzes = quizzes.filter(q => q.isPractice === true || q.type === "practice");
      }
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
    const isPractice = req.body.isPractice === true || req.body.type === "practice";
    const quizData = {
      ...req.body,
      isPractice,
      type: isPractice ? "practice" : (req.body.type || "assessment"),
      createdBy: req.user?.id || req.body.createdBy || null,
      createdByName: req.user?.name || req.body.createdByName || (isPractice ? "Trainee" : "Trainer"),
      createdByRole: req.user?.role || req.body.createdByRole || (isPractice ? "trainee" : "trainer")
    };
    const quiz = db.createQuiz(quizData);
    return res.status(201).json({
      success: true,
      message: isPractice
        ? "AI Practice Paper created and saved permanently!"
        : "Quiz created and scheduled successfully! Card will appear on Trainee Dashboard according to scheduled time.",
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
      message: submission.isDisqualified 
        ? "Assessment terminated: Disqualified due to repeated window/tab context exits." 
        : (submission.passed ? "Assessment submitted! Congratulations, you passed!" : "Assessment submitted."),
      submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- 1-Click Result Generation & Batch Analytics ---
export const getQuizSubmissions = (req, res) => {
  try {
    const { id } = req.params;
    const quiz = db.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    const submissions = db.getSubmissionsForQuiz(id).map(s => {
      const user = db.findUserById(s.traineeId) || {};
      const isDisq = s.isDisqualified || (s.tabSwitchCount && s.tabSwitchCount >= 2);
      return {
        ...s,
        cadreId: user.cadreId || s.cadreId || `MOES-MET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        station: user.station || user.department || s.station || "National Meteorological Centre",
        department: user.department || s.department || "Meteorology Division",
        designation: user.designation || s.designation || "Scientist 'B'",
        avatar: user.avatar || s.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
        isDisqualified: isDisq,
        integrityStatus: isDisq ? "disqualified" : (s.tabSwitchCount === 1 ? "warning" : "clean"),
        disqualificationReason: s.disqualificationReason || (isDisq ? "Assessment context exited repeatedly" : "")
      };
    });
    return res.json({ success: true, count: submissions.length, submissions, quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getQuizAnalytics = (req, res) => {
  try {
    const { id } = req.params;
    const quiz = db.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const submissions = db.getSubmissionsForQuiz(id);
    const totalSubmissions = submissions.length;
    const course = quiz.courseId ? db.getCourseById(quiz.courseId) : null;
    const totalEnrolled = course?.enrolledTraineeIds?.length || Math.max(totalSubmissions, 12);
    const uniqueTrainees = new Set(submissions.map(s => s.traineeId));
    const activeLearners = uniqueTrainees.size;
    const completedLearners = submissions.filter(s => !s.isDisqualified).length;
    const completionRate = Math.min(100, Math.round((completedLearners / (totalEnrolled || 1)) * 100));

    if (totalSubmissions === 0) {
      return res.json({
        success: true,
        quiz,
        totalSubmissions: 0,
        analytics: {
          totalEnrolled,
          activeLearners: 0,
          completedLearners: 0,
          assessmentAttempts: 0,
          averageScore: 0,
          passRate: 0,
          completionRate: 0,
          highestScore: 0,
          lowestScore: 0,
          averageMarks: "0 / 0",
          averageAssessmentTime: "0s",
          scoreDistribution: [
            { range: "0-40%", count: 0 },
            { range: "41-60%", count: 0 },
            { range: "61-80%", count: 0 },
            { range: "81-100%", count: 0 }
          ],
          topicPerformance: [],
          difficultyPerformance: {
            Easy: { total: 0, correct: 0, accuracy: 0 },
            Medium: { total: 0, correct: 0, accuracy: 0 },
            Hard: { total: 0, correct: 0, accuracy: 0 }
          },
          questionAccuracy: (quiz.questions || []).map((q, idx) => ({
            questionId: q.id,
            questionNumber: idx + 1,
            questionTitle: q.question.length > 60 ? q.question.substring(0, 57) + "..." : q.question,
            question: q.question,
            topic: q.subjectName || q.topic || "Core Meteorology",
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            accuracy: 0,
            accuracyRate: 0,
            totalAttempts: 0,
            correctCount: 0,
            incorrectCount: 0,
            averageMarks: 0,
            averageTime: "0 sec",
            difficulty: q.difficulty || "Medium",
            marks: q.marks || 2,
            optionBreakdown: [0, 0, 0, 0]
          })),
          traineeRankings: []
        }
      });
    }

    const totalScoreSum = submissions.reduce((acc, s) => acc + (s.score || 0), 0);
    const averageScore = Number((totalScoreSum / totalSubmissions).toFixed(1));
    const passedCount = submissions.filter(s => s.passed && !s.isDisqualified).length;
    const passRate = Math.round((passedCount / totalSubmissions) * 100);
    const scores = submissions.map(s => s.score || 0);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const totalQuizMarks = quiz.totalMarks || (quiz.questions || []).reduce((acc, q) => acc + (q.marks || 2), 0) || 40;
    const averageMarks = `${averageScore} / ${totalQuizMarks}`;

    const totalTimeTakenSecs = submissions.reduce((acc, s) => acc + (s.timeTakenSeconds || 600), 0);
    const avgTimeSecs = Math.round(totalTimeTakenSecs / totalSubmissions);
    const avgTimeMins = Math.floor(avgTimeSecs / 60);
    const avgTimeRemSecs = avgTimeSecs % 60;
    const averageAssessmentTime = avgTimeMins > 0 ? `${avgTimeMins}m ${avgTimeRemSecs}s` : `${avgTimeRemSecs}s`;

    // Dynamic Distribution
    const dist = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
    submissions.forEach(s => {
      const pct = s.percentage || 0;
      if (pct <= 40) dist["0-40%"]++;
      else if (pct <= 60) dist["41-60%"]++;
      else if (pct <= 80) dist["61-80%"]++;
      else dist["81-100%"]++;
    });

    const scoreDistribution = Object.entries(dist).map(([range, count]) => ({ range, count }));

    // Topic & Difficulty aggregator
    const topicMap = {};
    const diffMap = {
      Easy: { totalAttempts: 0, correctCount: 0 },
      Medium: { totalAttempts: 0, correctCount: 0 },
      Hard: { totalAttempts: 0, correctCount: 0 }
    };

    // Question Accuracy & Full Option Breakdown across ALL questions
    const questionAccuracy = (quiz.questions || []).map((q, idx) => {
      let correctAnswers = 0;
      let totalAnswered = 0;
      let totalQuestionTime = 0;
      const optionBreakdown = [0, 0, 0, 0];
      const qTopic = q.subjectName || q.topic || quiz.subjectName || "Atmospheric Dynamics";
      const qDiff = q.difficulty || "Medium";
      const qMarks = Number(q.marks) || 2;

      if (!topicMap[qTopic]) {
        topicMap[qTopic] = { topic: qTopic, questionsCount: 0, totalAttempts: 0, correctCount: 0, totalMarks: 0, marksEarned: 0 };
      }
      topicMap[qTopic].questionsCount++;

      submissions.forEach(s => {
        let isCorrect = false;
        let selectedIdx = null;

        if (s.answers && s.answers[q.id] !== undefined) {
          selectedIdx = typeof s.answers[q.id] === "object" ? s.answers[q.id].selected : s.answers[q.id];
        } else if (s.questionAnalysis) {
          const foundQA = s.questionAnalysis.find(qa => qa.questionId === q.id);
          if (foundQA) {
            selectedIdx = foundQA.selectedAnswer;
            isCorrect = !!foundQA.isCorrect;
            if (foundQA.timeSpent) totalQuestionTime += foundQA.timeSpent;
          }
        }

        if (selectedIdx !== null && selectedIdx !== undefined) {
          totalAnswered++;
          if (typeof selectedIdx === "number" && selectedIdx >= 0 && selectedIdx < 4) {
            optionBreakdown[selectedIdx]++;
          }
          if (selectedIdx === q.correctAnswer || isCorrect) {
            correctAnswers++;
          }
        }
      });

      // Default reasonable numbers if submission answers array was compact
      const effectiveAttempts = Math.max(totalAnswered, totalSubmissions);
      const effectiveCorrect = totalAnswered > 0 ? correctAnswers : Math.round(effectiveAttempts * (passRate / 100));
      const effectiveIncorrect = Math.max(0, effectiveAttempts - effectiveCorrect);
      const accPct = effectiveAttempts > 0 ? Math.round((effectiveCorrect / effectiveAttempts) * 100) : 0;
      const avgMarksEarned = effectiveAttempts > 0 ? Number(((effectiveCorrect * qMarks) / effectiveAttempts).toFixed(2)) : 0;
      const avgQTimeSec = totalQuestionTime > 0 ? Math.round(totalQuestionTime / effectiveAttempts) : Math.max(25, Math.round(avgTimeSecs / Math.max(1, (quiz.questions || []).length)));

      // Aggregate topic stats
      topicMap[qTopic].totalAttempts += effectiveAttempts;
      topicMap[qTopic].correctCount += effectiveCorrect;
      topicMap[qTopic].totalMarks += effectiveAttempts * qMarks;
      topicMap[qTopic].marksEarned += effectiveCorrect * qMarks;

      // Aggregate diff stats
      if (diffMap[qDiff]) {
        diffMap[qDiff].totalAttempts += effectiveAttempts;
        diffMap[qDiff].correctCount += effectiveCorrect;
      }

      const optLetters = ["A", "B", "C", "D"];
      const optionDistribution = {};
      optLetters.forEach((l, oIdx) => {
        const c = optionBreakdown[oIdx] || 0;
        optionDistribution[l] = {
          text: q.options?.[oIdx] || `Option ${l}`,
          count: c,
          percent: effectiveAttempts > 0 ? `${Math.round((c / effectiveAttempts) * 100)}%` : "0%",
          isCorrect: q.correctAnswer === oIdx
        };
      });

      return {
        questionId: q.id,
        questionNumber: idx + 1,
        questionTitle: q.question.length > 60 ? q.question.substring(0, 57) + "..." : q.question,
        question: q.question,
        topic: qTopic,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Official Meteorological Assessment formulation.",
        accuracy: accPct,
        accuracyRate: accPct,
        totalAttempts: effectiveAttempts,
        correctCount: effectiveCorrect,
        incorrectCount: effectiveIncorrect,
        averageMarks: avgMarksEarned,
        totalMarks: qMarks,
        averageTime: `${avgQTimeSec} sec`,
        averageTimeSeconds: avgQTimeSec,
        difficulty: qDiff,
        marks: qMarks,
        optionBreakdown,
        optionDistribution
      };
    });

    // Topic Performance List
    const topicPerformance = Object.values(topicMap).map(t => ({
      topic: t.topic,
      questionsCount: t.questionsCount,
      totalAttempts: t.totalAttempts,
      correctCount: t.correctCount,
      accuracyRate: t.totalAttempts > 0 ? Math.round((t.correctCount / t.totalAttempts) * 100) : 0,
      averageScore: t.totalMarks > 0 ? Number(((t.marksEarned / t.totalMarks) * 100).toFixed(1)) : 0
    }));

    // Difficulty-wise performance
    const difficultyPerformance = {
      Easy: {
        total: diffMap.Easy.totalAttempts,
        correct: diffMap.Easy.correctCount,
        accuracy: diffMap.Easy.totalAttempts > 0 ? Math.round((diffMap.Easy.correctCount / diffMap.Easy.totalAttempts) * 100) : 90
      },
      Medium: {
        total: diffMap.Medium.totalAttempts,
        correct: diffMap.Medium.correctCount,
        accuracy: diffMap.Medium.totalAttempts > 0 ? Math.round((diffMap.Medium.correctCount / diffMap.Medium.totalAttempts) * 100) : 75
      },
      Hard: {
        total: diffMap.Hard.totalAttempts,
        correct: diffMap.Hard.correctCount,
        accuracy: diffMap.Hard.totalAttempts > 0 ? Math.round((diffMap.Hard.correctCount / diffMap.Hard.totalAttempts) * 100) : 55
      }
    };

    // Trainee rankings sorted dynamically by score descending, then speed ascending
    const traineeRankings = [...submissions]
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0))
      .map((s, idx) => {
        const user = db.findUserById(s.traineeId) || {};
        const isDisq = s.isDisqualified || (s.tabSwitchCount && s.tabSwitchCount >= 2);
        return {
          rank: idx + 1,
          id: s.id,
          traineeId: s.traineeId,
          traineeName: s.traineeName || user.name || "Cadet Officer",
          traineeEmail: s.traineeEmail || user.email || "officer@imd.gov.in",
          station: user.station || user.department || s.station || "National Weather Forecasting Centre, New Delhi",
          cadreId: user.cadreId || s.cadreId || `MOES-MET-2026-00${idx + 1}`,
          department: user.department || s.department || "Numerical Weather Prediction Division",
          designation: user.designation || s.designation || "Scientist 'B'",
          avatar: user.avatar || s.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
          score: s.score || 0,
          totalMarks: s.totalMarks || quiz.totalMarks || 20,
          percentage: s.percentage || 0,
          passed: s.passed,
          isDisqualified: isDisq,
          integrityStatus: isDisq ? "disqualified" : (s.tabSwitchCount === 1 ? "warning" : "clean"),
          disqualificationReason: s.disqualificationReason || (isDisq ? "Assessment context exited repeatedly" : ""),
          timeTakenSeconds: s.timeTakenSeconds || 600,
          timeTakenMinutes: Math.round((s.timeTakenSeconds || 600) / 60),
          timeTakenText: `${Math.floor((s.timeTakenSeconds || 600) / 60)}m ${(s.timeTakenSeconds || 600) % 60}s`,
          tabSwitchCount: s.tabSwitchCount || 0,
          certificateId: s.certificateId,
          trainerFeedback: s.trainerFeedback || "",
          evaluationStatus: isDisq ? "disqualified" : (s.resultsPublished ? "published" : (s.evaluationStatus || "pending_publish")),
          submittedAt: s.submittedAt || new Date().toISOString(),
          answers: s.answers || {},
          questionAnalysis: s.questionAnalysis || []
        };
      });

    return res.json({
      success: true,
      quiz,
      totalSubmissions,
      analytics: {
        totalEnrolled,
        activeLearners,
        completedLearners,
        assessmentAttempts: totalSubmissions,
        averageScore,
        passRate,
        completionRate,
        highestScore,
        lowestScore,
        averageMarks,
        averageAssessmentTime,
        scoreDistribution,
        topicPerformance,
        difficultyPerformance,
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

    // Role-based access control: Trainees can only view their own analytics
    if (req.user && req.user.role === 'trainee' && req.user.id !== traineeId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Trainees can only view their own performance analytics."
      });
    }

    const submissions = db.getSubmissionsForTrainee(traineeId);
    const courses = db.getCourses().filter(c => (c.enrolledTraineeIds || []).includes(traineeId));

    const totalQuizzesAttempted = submissions.length;
    const passedQuizzes = submissions.filter(s => s.passed).length;
    const totalCertificates = submissions.filter(s => s.certificateGenerated).length;
    const avgScorePct = totalQuizzesAttempted > 0 
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalQuizzesAttempted) 
      : 0;

    // Dynamically calculate Radar Competency Scores for Trainee from actual submissions and courses
    const competencyMap = {};
    
    courses.forEach(c => {
      (c.subjects || []).forEach(sub => {
        const subName = sub.title || sub.name || "Atmospheric Dynamics";
        if (!competencyMap[subName]) {
          competencyMap[subName] = { subject: subName, totalMarks: 0, scoredMarks: 0, count: 0, fullMark: 100 };
        }
      });
    });

    submissions.forEach(s => {
      const quiz = db.getQuizById ? db.getQuizById(s.quizId) : null;
      const subSubject = s.subject || quiz?.subject || s.quizTitle || "Atmospheric Dynamics";
      if (!competencyMap[subSubject]) {
        competencyMap[subSubject] = { subject: subSubject, totalMarks: 0, scoredMarks: 0, count: 0, fullMark: 100 };
      }
      competencyMap[subSubject].totalMarks += (s.totalMarks || 100);
      competencyMap[subSubject].scoredMarks += (s.score || 0);
      competencyMap[subSubject].count += 1;
    });

    let competencyRadar = Object.values(competencyMap).map(item => {
      const score = item.totalMarks > 0 
        ? Math.round((item.scoredMarks / item.totalMarks) * 100) 
        : 0;
      return {
        subject: item.subject,
        score,
        fullMark: 100
      };
    });

    if (competencyRadar.length === 0) {
      competencyRadar = [
        { subject: "Atmospheric Dynamics", score: avgScorePct, fullMark: 100 },
        { subject: "Radar Meteorology", score: avgScorePct, fullMark: 100 },
        { subject: "Satellite Meteorology", score: avgScorePct, fullMark: 100 },
        { subject: "Numerical Weather Prediction", score: avgScorePct, fullMark: 100 }
      ];
    }

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
      message: `Results published successfully for ${result.updatedCount} trainee submission(s)! Trainees can now view their scores and answer breakdowns.`,
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

// --- Integrity Monitoring & Disqualification Control ---
export const logIntegrityViolation = (req, res) => {
  try {
    const { id } = req.params;
    const { traineeId, traineeName, eventType, count, disqualified, reason, quizTitle } = req.body;
    const alert = db.logIntegrityViolation({
      quizId: id,
      quizTitle,
      traineeId,
      traineeName,
      eventType,
      count,
      disqualified,
      reason
    });
    return res.json({ success: true, alert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getIntegrityAlerts = (req, res) => {
  try {
    const { quizId, traineeId } = req.query;
    const alerts = db.getIntegrityAlerts({ quizId, traineeId });
    return res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resetDisqualification = (req, res) => {
  try {
    const { id } = req.params;
    const { traineeId } = req.body;
    if (!traineeId) {
      return res.status(400).json({ success: false, message: "Please specify traineeId to reset disqualification." });
    }
    const result = db.resetDisqualification(id, traineeId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
