import { db } from "../store/dbStore.js";

// Helper: Filter submissions by date range
function filterByDateRange(items, dateField = "submittedAt", dateRange = "all", customStart = null, customEnd = null) {
  if (!Array.isArray(items)) return [];
  if (dateRange === "all" || !dateRange) return items;

  const now = new Date();
  let startTime = null;
  let endTime = now.getTime();

  if (dateRange === "7d") {
    startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  } else if (dateRange === "30d") {
    startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  } else if (dateRange === "90d") {
    startTime = now.getTime() - 90 * 24 * 60 * 60 * 1000;
  } else if (dateRange === "this_year") {
    startTime = new Date(now.getFullYear(), 0, 1).getTime();
  } else if (dateRange === "custom" && customStart) {
    startTime = new Date(customStart).getTime();
    if (customEnd) endTime = new Date(customEnd).getTime() + 24 * 60 * 60 * 1000;
  }

  if (!startTime) return items;

  return items.filter(item => {
    const raw = item[dateField] || item.createdAt || item.timestamp;
    if (!raw) return true;
    const t = new Date(raw).getTime();
    return t >= startTime && t <= endTime;
  });
}

// Helper: Deterministic Rank calculation
function calculateRankAndPercentile(scoreList, targetScore, targetTimeSec = 0) {
  if (!scoreList || scoreList.length === 0) return { rank: 1, percentile: 100, total: 1 };
  
  // Sort descending by score, ascending by timeTaken (faster is better tie-breaker)
  const sorted = [...scoreList].sort((a, b) => (b.score - a.score) || (a.time - b.time));
  const total = sorted.length;
  
  // Find rank
  let rank = 1;
  for (let i = 0; i < total; i++) {
    if (sorted[i].score > targetScore || (sorted[i].score === targetScore && sorted[i].time < targetTimeSec)) {
      rank++;
    }
  }

  // Percentile: (Number of people with score below target) / Total * 100
  const belowCount = sorted.filter(s => s.score < targetScore).length;
  const percentile = total > 1 ? Number(((belowCount / (total - 1)) * 100).toFixed(1)) : 100;

  return { rank, percentile, total };
}

// =========================================================================
// ROLE 1: TRAINEE PERSONAL ASSESSMENT ANALYTICS
// =========================================================================
export const getTraineeAnalytics = (req, res) => {
  try {
    const { traineeId } = req.params;
    const { quizId, dateRange, customStart, customEnd } = req.query;

    const traineeUser = db.findUserById(traineeId);
    if (!traineeUser) {
      return res.status(404).json({ success: false, message: "Trainee not found" });
    }

    // Authorization check: trainees can only see their own analytics
    if (req.user && req.user.role === "trainee" && req.user.id !== traineeId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to trainee analytics" });
    }

    let allSubmissions = (db.quizSubmissions || []).filter(s => 
      s.traineeId === traineeId || 
      s.traineeId === traineeUser.email ||
      s.userId === traineeId ||
      (s.traineeName && traineeUser.name && s.traineeName.toLowerCase() === traineeUser.name.toLowerCase())
    );

    // Apply date range filter
    allSubmissions = filterByDateRange(allSubmissions, "submittedAt", dateRange, customStart, customEnd);

    // For Trainee role: include submissions where resultsPublished === true OR isPractice === true OR evaluated
    const isOwnerTrainee = req.user && req.user.role === "trainee";
    let visibleSubmissions = allSubmissions;
    if (isOwnerTrainee) {
      const publishedOnly = allSubmissions.filter(s => {
        const quiz = db.getQuizById(s.quizId);
        return s.resultsPublished === true || quiz?.resultsPublished === true || quiz?.isPractice === true || s.score !== undefined;
      });
      if (publishedOnly.length > 0) {
        visibleSubmissions = publishedOnly;
      }
    }

    if (visibleSubmissions.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: "No attempts recorded yet",
        trainee: {
          id: traineeUser.id,
          name: traineeUser.name,
          cadreId: traineeUser.cadreId,
          designation: traineeUser.designation,
          station: traineeUser.station
        },
        kpis: null,
        charts: null,
        questionAnalysis: []
      });
    }

    // Selected quiz submission (or latest submission)
    const activeSubm = (quizId && visibleSubmissions.find(s => s.quizId === quizId || s.id === quizId)) || visibleSubmissions[0];
    const activeQuiz = db.getQuizById(activeSubm.quizId) || {
      id: activeSubm.quizId,
      title: activeSubm.quizTitle,
      passMarks: activeSubm.totalMarks ? activeSubm.totalMarks * 0.5 : 10,
      totalMarks: activeSubm.totalMarks || 20,
      questions: []
    };

    // Calculate cohort rank for active quiz
    const allQuizSubmissions = (db.quizSubmissions || []).filter(s => s.quizId === activeSubm.quizId);
    const cohortScores = allQuizSubmissions.map(s => ({
      score: s.score || 0,
      time: s.timeTakenSeconds || 0,
      traineeId: s.traineeId
    }));
    const { rank, percentile, total: cohortSize } = calculateRankAndPercentile(cohortScores, activeSubm.score || 0, activeSubm.timeTakenSeconds || 0);

    // Question-level data reconstruction
    const quizQuestions = activeQuiz.questions || [];
    let attemptedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalMarksEarned = activeSubm.score || 0;
    let totalMaxMarks = activeSubm.totalMarks || activeQuiz.totalMarks || 20;

    const detailedQuestions = [];
    const timePerQuestionData = [];
    const accuracyVsTimeData = [];
    const difficultyMap = {
      Easy: { total: 0, correct: 0 },
      Medium: { total: 0, correct: 0 },
      Hard: { total: 0, correct: 0 }
    };
    const topicMap = {};
    const subjectMap = {};

    const userAnswers = activeSubm.answers || {};
    const questionAnalysisArr = activeSubm.questionAnalysis || [];

    quizQuestions.forEach((q, idx) => {
      const qNum = idx + 1;
      const qTopic = q.topic || q.subjectName || activeQuiz.subjectName || "Atmospheric Dynamics";
      const qSubject = q.subjectName || activeQuiz.subjectName || activeQuiz.courseName || "General Meteorology";
      const qDiff = q.difficulty || "Medium";
      const qMarks = Number(q.marks) || 2;
      const explanation = q.explanation || "Official Meteorological Assessment formulation.";

      let selectedAns = userAnswers[q.id];
      let timeSpent = 0;
      let isCorrect = false;

      // Check questionAnalysis array if present
      const foundQA = questionAnalysisArr.find(qa => qa.questionId === q.id || qa.questionNumber === qNum);
      if (foundQA) {
        if (selectedAns === undefined || selectedAns === null) selectedAns = foundQA.selectedAnswer;
        timeSpent = foundQA.timeSpent || 0;
        isCorrect = !!foundQA.isCorrect;
      }

      if (timeSpent === 0 && activeSubm.timeTakenSeconds && quizQuestions.length > 0) {
        // Average fallback if individual question timing wasn't recorded
        timeSpent = Math.round(activeSubm.timeTakenSeconds / quizQuestions.length);
      }

      const isAnswered = selectedAns !== undefined && selectedAns !== null && selectedAns !== "";
      if (isAnswered) {
        attemptedCount++;
        if (q.type === "one_word" || q.type === "short_answer") {
          const cleanUser = String(selectedAns).trim().toLowerCase();
          const accepted = [
            q.expectedAnswer,
            q.correctAnswer,
            ...(Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : [])
          ].filter(Boolean).map(a => String(a).trim().toLowerCase());
          isCorrect = cleanUser.length > 0 && accepted.includes(cleanUser);
        } else {
          isCorrect = selectedAns === q.correctAnswer;
        }

        if (isCorrect) correctCount++;
        else incorrectCount++;
      } else {
        unansweredCount++;
      }

      // Difficulty aggregation
      if (!difficultyMap[qDiff]) difficultyMap[qDiff] = { total: 0, correct: 0 };
      difficultyMap[qDiff].total++;
      if (isCorrect) difficultyMap[qDiff].correct++;

      // Topic aggregation
      if (!topicMap[qTopic]) topicMap[qTopic] = { topic: qTopic, total: 0, correct: 0, marksTotal: 0, marksEarned: 0 };
      topicMap[qTopic].total++;
      topicMap[qTopic].marksTotal += qMarks;
      if (isCorrect) {
        topicMap[qTopic].correct++;
        topicMap[qTopic].marksEarned += qMarks;
      }

      // Subject aggregation
      if (!subjectMap[qSubject]) subjectMap[qSubject] = { subject: qSubject, total: 0, correct: 0, marksTotal: 0, marksEarned: 0 };
      subjectMap[qSubject].total++;
      subjectMap[qSubject].marksTotal += qMarks;
      if (isCorrect) {
        subjectMap[qSubject].correct++;
        subjectMap[qSubject].marksEarned += qMarks;
      }

      timePerQuestionData.push({
        questionNumber: qNum,
        timeSeconds: timeSpent,
        difficulty: qDiff,
        isCorrect
      });

      accuracyVsTimeData.push({
        questionNumber: qNum,
        timeSeconds: timeSpent,
        scorePercent: isCorrect ? 100 : 0,
        difficulty: qDiff,
        topic: qTopic
      });

      let selectedText = "Unanswered";
      if (isAnswered) {
        if (Array.isArray(q.options) && typeof selectedAns === "number" && q.options[selectedAns]) {
          selectedText = q.options[selectedAns];
        } else {
          selectedText = String(selectedAns);
        }
      }

      let correctText = "";
      if (Array.isArray(q.options) && typeof q.correctAnswer === "number" && q.options[q.correctAnswer]) {
        correctText = q.options[q.correctAnswer];
      } else {
        correctText = String(q.correctAnswer || q.expectedAnswer || "N/A");
      }

      detailedQuestions.push({
        questionNumber: qNum,
        questionId: q.id,
        questionText: q.question,
        topic: qTopic,
        subject: qSubject,
        difficulty: qDiff,
        selectedAnswer: selectedText,
        selectedOptionIndex: selectedAns,
        correctAnswer: correctText,
        correctOptionIndex: q.correctAnswer,
        result: !isAnswered ? "Unanswered" : (isCorrect ? "Correct" : "Incorrect"),
        isCorrect,
        marksEarned: isCorrect ? qMarks : 0,
        totalMarks: qMarks,
        timeSpent,
        explanation
      });
    });

    // Summary KPIs
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
    const percentage = totalMaxMarks > 0 ? Number(((totalMarksEarned / totalMaxMarks) * 100).toFixed(1)) : 0;
    const passed = activeSubm.passed !== undefined ? activeSubm.passed : (totalMarksEarned >= (activeQuiz.passMarks || totalMaxMarks * 0.5));
    const totalTimeSec = activeSubm.timeTakenSeconds || 0;
    const avgTimePerQuestion = quizQuestions.length > 0 ? Math.round(totalTimeSec / quizQuestions.length) : 0;

    // Fast-Slow timing analysis
    const times = detailedQuestions.map(q => q.timeSpent).filter(t => t > 0);
    const fastestTime = times.length > 0 ? Math.min(...times) : 0;
    const slowestTime = times.length > 0 ? Math.max(...times) : 0;
    const correctTimes = detailedQuestions.filter(q => q.isCorrect).map(q => q.timeSpent);
    const incorrectTimes = detailedQuestions.filter(q => !q.isCorrect && q.result !== "Unanswered").map(q => q.timeSpent);
    const avgTimeCorrect = correctTimes.length > 0 ? Math.round(correctTimes.reduce((a, b) => a + b, 0) / correctTimes.length) : 0;
    const avgTimeIncorrect = incorrectTimes.length > 0 ? Math.round(incorrectTimes.reduce((a, b) => a + b, 0) / incorrectTimes.length) : 0;

    // 14 Required Charts Datasets:
    // Chart 1: Score Gauge / Radial Progress
    const scoreGauge = [
      { name: "Score", value: percentage, fill: percentage >= 75 ? "#10B981" : (percentage >= 50 ? "#F59E0B" : "#EF4444") }
    ];

    // Chart 2: Correct vs Incorrect vs Unanswered Donut
    const responseBreakdownDonut = [
      { name: "Correct", value: correctCount, fill: "#10B981" },
      { name: "Incorrect", value: incorrectCount, fill: "#EF4444" },
      { name: "Unanswered", value: unansweredCount, fill: "#94A3B8" }
    ].filter(item => item.value > 0);

    // Chart 3: Score vs Passing Score Horizontal Bar
    const scoreVsPassing = [
      { metric: "Assessment Score", score: totalMarksEarned, max: totalMaxMarks, fill: "#2563EB" },
      { metric: "Passing Threshold", score: activeQuiz.passMarks || Math.round(totalMaxMarks * 0.5), max: totalMaxMarks, fill: "#F59E0B" }
    ];

    // Chart 4: Subject Performance Bar
    const subjectPerformance = Object.values(subjectMap).map(s => ({
      subject: s.subject,
      scorePercent: s.marksTotal > 0 ? Number(((s.marksEarned / s.marksTotal) * 100).toFixed(1)) : 0,
      accuracy: s.total > 0 ? Number(((s.correct / s.total) * 100).toFixed(1)) : 0,
      totalQuestions: s.total
    }));

    // Chart 5: Competency Radar
    const competencyRadar = Object.values(subjectMap).map(s => ({
      competency: s.subject,
      mastery: s.marksTotal > 0 ? Number(((s.marksEarned / s.marksTotal) * 100).toFixed(1)) : 0,
      benchmark: 75,
      fullMark: 100
    }));

    // Chart 6: Topic Mastery Horizontal Bar
    const topicMastery = Object.values(topicMap).map(t => ({
      topic: t.topic,
      masteryPercent: t.marksTotal > 0 ? Number(((t.marksEarned / t.marksTotal) * 100).toFixed(1)) : 0,
      accuracy: t.total > 0 ? Number(((t.correct / t.total) * 100).toFixed(1)) : 0,
      status: (t.correct / (t.total || 1)) >= 0.8 ? "Mastered" : ((t.correct / (t.total || 1)) >= 0.6 ? "Developing" : "Needs Attention")
    }));

    // Chart 7: Difficulty-wise Accuracy Bar
    const difficultyAccuracy = Object.entries(difficultyMap).map(([diff, val]) => ({
      difficulty: diff,
      accuracy: val.total > 0 ? Number(((val.correct / val.total) * 100).toFixed(1)) : 0,
      totalQuestions: val.total,
      correctCount: val.correct
    }));

    // Chart 8: Time per Question Line
    const timePerQuestion = timePerQuestionData;

    // Chart 9: Accuracy vs Time Scatter Plot
    const accuracyVsTime = accuracyVsTimeData;

    // Chart 10: Adaptive Difficulty Journey Step/Line
    let adaptiveJourney = (activeSubm.difficultyHistory || []).map((dh, idx) => ({
      step: idx + 1,
      difficulty: dh.difficulty || "Medium",
      difficultyLevel: dh.difficulty === "Easy" ? 1 : (dh.difficulty === "Hard" ? 3 : 2),
      isCorrect: dh.isCorrect !== undefined ? dh.isCorrect : true,
      time: dh.time || 30
    }));

    if (adaptiveJourney.length === 0 && Array.isArray(activeSubm.adaptiveTrajectory)) {
      adaptiveJourney = activeSubm.adaptiveTrajectory.map((diff, idx) => ({
        step: idx + 1,
        difficulty: diff,
        difficultyLevel: diff === "Easy" ? 1 : (diff === "Hard" ? 3 : 2),
        isCorrect: true,
        time: 30
      }));
    }

    if (adaptiveJourney.length === 0) {
      adaptiveJourney = detailedQuestions.map((q, idx) => ({
        step: idx + 1,
        difficulty: q.difficulty,
        difficultyLevel: q.difficulty === "Easy" ? 1 : (q.difficulty === "Hard" ? 3 : 2),
        isCorrect: q.isCorrect,
        time: q.timeSpent
      }));
    }

    // Chart 11: Assessment Score Progression Line (across all visible submissions over time)
    const scoreProgression = [...visibleSubmissions]
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
      .map((s, idx) => ({
        attempt: idx + 1,
        title: s.quizTitle || `Assessment ${idx + 1}`,
        scorePercent: s.percentage || 0,
        date: new Date(s.submittedAt).toLocaleDateString(),
        passed: s.passed
      }));

    // Chart 12: Pass/Fail Donut across all attempts
    const totalPassedAttempts = visibleSubmissions.filter(s => s.passed).length;
    const totalFailedAttempts = visibleSubmissions.length - totalPassedAttempts;
    const passFailDonut = [
      { name: "Passed", value: totalPassedAttempts, fill: "#10B981" },
      { name: "Failed", value: totalFailedAttempts, fill: "#EF4444" }
    ].filter(item => item.value > 0);

    // Chart 13: Score Distribution Histogram (Cohort benchmark for this quiz)
    const histBins = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
    allQuizSubmissions.forEach(s => {
      const pct = s.percentage || 0;
      if (pct <= 40) histBins["0-40%"]++;
      else if (pct <= 60) histBins["41-60%"]++;
      else if (pct <= 80) histBins["61-80%"]++;
      else histBins["81-100%"]++;
    });
    const scoreHistogram = Object.entries(histBins).map(([range, count]) => ({
      range,
      count,
      isTraineeBucket: percentage <= 40 ? range === "0-40%" : (percentage <= 60 ? range === "41-60%" : (percentage <= 80 ? range === "61-80%" : range === "81-100%"))
    }));

    // Chart 14: Learning Gap Heatmap (Topic-level classification)
    const learningGapHeatmap = Object.values(topicMap).map(t => {
      const acc = t.total > 0 ? (t.correct / t.total) * 100 : 0;
      let status = "Needs Attention";
      let color = "#EF4444";
      if (acc >= 80) {
        status = "Strong (>=80%)";
        color = "#10B981";
      } else if (acc >= 60) {
        status = "Developing (60-79%)";
        color = "#F59E0B";
      }
      return {
        topic: t.topic,
        accuracy: Number(acc.toFixed(1)),
        questionsCount: t.total,
        correctCount: t.correct,
        status,
        color
      };
    });

    return res.json({
      success: true,
      hasData: true,
      trainee: {
        id: traineeUser.id,
        name: traineeUser.name,
        cadreId: traineeUser.cadreId,
        designation: traineeUser.designation,
        station: traineeUser.station,
        department: traineeUser.department
      },
      activeAssessment: {
        id: activeQuiz.id,
        title: activeQuiz.title,
        submissionId: activeSubm.id,
        submittedAt: activeSubm.submittedAt,
        resultsPublished: activeSubm.resultsPublished || false
      },
      availableAssessments: visibleSubmissions.map(s => ({
        id: s.quizId,
        submissionId: s.id,
        title: s.quizTitle,
        score: s.score,
        totalMarks: s.totalMarks,
        percentage: s.percentage,
        submittedAt: s.submittedAt,
        passed: s.passed
      })),
      kpis: {
        score: totalMarksEarned,
        totalMarks: totalMaxMarks,
        percentage,
        passed,
        rank,
        percentile,
        cohortSize,
        questionsAttempted: attemptedCount,
        totalQuestions: quizQuestions.length,
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
        accuracy,
        totalTimeSeconds: totalTimeSec,
        totalTimeText: `${Math.floor(totalTimeSec / 60)}m ${totalTimeSec % 60}s`,
        avgTimePerQuestionSeconds: avgTimePerQuestion,
        avgTimePerQuestionText: `${avgTimePerQuestion}s`,
        fastestTime,
        slowestTime,
        avgTimeCorrect,
        avgTimeIncorrect,
        certificateStatus: activeSubm.certificateGenerated ? "Certified" : (passed ? "Eligible" : "Ineligible"),
        certificateId: activeSubm.certificateId || null
      },
      charts: {
        scoreGauge,
        responseBreakdownDonut,
        scoreVsPassing,
        subjectPerformance,
        competencyRadar,
        topicMastery,
        difficultyAccuracy,
        timePerQuestion,
        accuracyVsTime,
        adaptiveJourney,
        scoreProgression,
        passFailDonut,
        scoreHistogram,
        learningGapHeatmap
      },
      questionAnalysis: detailedQuestions
    });
  } catch (err) {
    console.error("Trainee analytics computation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================================================================
// ROLE 2: INDIVIDUAL TRAINER ASSESSMENT ANALYTICS
// =========================================================================
export const getTrainerAnalytics = (req, res) => {
  try {
    const { trainerId } = req.params;
    const { courseId, subjectId, assessmentId, dateRange, customStart, customEnd } = req.query;

    const trainerUser = db.findUserById(trainerId);
    if (!trainerUser) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    // Restrict scope to trainer's assigned courses, subjects, assessments
    const allCourses = db.getCourses() || [];
    const trainerCourses = allCourses.filter(c => 
      c.leadTrainerId === trainerId || 
      c.trainerId === trainerId || 
      (c.subjects || []).some(s => s.trainerId === trainerId || s.facultyId === trainerId || (s.trainerName && trainerUser.name && s.trainerName.toLowerCase().includes(trainerUser.name.toLowerCase())))
    );

    const trainerCourseIds = new Set(trainerCourses.map(c => c.id));
    const trainerSubjectNames = new Set();
    trainerCourses.forEach(c => {
      (c.subjects || []).forEach(s => {
        if (s.name || s.title) trainerSubjectNames.add((s.name || s.title).toLowerCase().trim());
      });
    });

    let trainerQuizzes = (db.quizzes || []).filter(q => {
      if (q.trainerId === trainerId || q.createdBy === trainerId) return true;
      if (q.courseId && trainerCourseIds.has(q.courseId)) return true;
      if (q.subjectName && trainerSubjectNames.has(q.subjectName.toLowerCase().trim())) return true;
      return false;
    });

    // Cascading filters
    if (courseId && courseId !== "all") {
      trainerQuizzes = trainerQuizzes.filter(q => q.courseId === courseId);
    }
    if (subjectId && subjectId !== "all") {
      trainerQuizzes = trainerQuizzes.filter(q => q.subjectId === subjectId || q.subjectName === subjectId);
    }
    if (assessmentId && assessmentId !== "all") {
      trainerQuizzes = trainerQuizzes.filter(q => q.id === assessmentId);
    }

    const trainerQuizIds = new Set(trainerQuizzes.map(q => q.id));

    // Get submissions for these quizzes
    let submissions = (db.quizSubmissions || []).filter(s => trainerQuizIds.has(s.quizId));
    submissions = filterByDateRange(submissions, "submittedAt", dateRange, customStart, customEnd);

    // Collect enrolled trainees across trainer courses
    const assignedTraineeIdSet = new Set();
    trainerCourses.forEach(c => {
      (c.enrolledTraineeIds || []).forEach(id => assignedTraineeIdSet.add(id));
    });
    submissions.forEach(s => assignedTraineeIdSet.add(s.traineeId));

    const totalAssignedTrainees = assignedTraineeIdSet.size;
    const uniqueAttemptTrainees = new Set(submissions.map(s => s.traineeId));
    const activeTrainees = uniqueAttemptTrainees.size;
    const totalAttempts = submissions.length;

    if (totalAttempts === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: "No attempts recorded yet",
        trainer: { id: trainerUser.id, name: trainerUser.name, department: trainerUser.department },
        kpis: null,
        charts: null,
        atRiskTrainees: []
      });
    }

    // Calculations
    const validSubs = submissions.filter(s => !s.isDisqualified);
    const passedSubs = validSubs.filter(s => s.passed);
    const passRate = validSubs.length > 0 ? Math.round((passedSubs.length / validSubs.length) * 100) : 0;
    const avgScore = validSubs.length > 0 ? Number((validSubs.reduce((a, b) => a + (b.score || 0), 0) / validSubs.length).toFixed(1)) : 0;
    const avgPercentage = validSubs.length > 0 ? Number((validSubs.reduce((a, b) => a + (b.percentage || 0), 0) / validSubs.length).toFixed(1)) : 0;
    const completionRate = totalAssignedTrainees > 0 ? Math.min(100, Math.round((activeTrainees / totalAssignedTrainees) * 100)) : 0;

    const allScores = validSubs.map(s => s.percentage || 0);
    const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
    const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0;

    const totalTime = validSubs.reduce((a, b) => a + (b.timeTakenSeconds || 0), 0);
    const avgTimeSec = validSubs.length > 0 ? Math.round(totalTime / validSubs.length) : 0;
    const avgAssessmentTimeText = `${Math.floor(avgTimeSec / 60)}m ${avgTimeSec % 60}s`;

    const pendingEvaluations = submissions.filter(s => !s.resultsPublished && s.evaluationStatus !== "published").length;

    // -------------------------------------------------------------
    // AT-RISK TRAINEES DYNAMIC CALCULATION (Real Performance Metrics)
    // -------------------------------------------------------------
    const traineeMetricsMap = {};
    submissions.forEach(s => {
      const tid = s.traineeId;
      if (!traineeMetricsMap[tid]) {
        const u = db.findUserById(tid) || {};
        traineeMetricsMap[tid] = {
          traineeId: tid,
          name: s.traineeName || u.name || "Cadet Officer",
          cadreId: u.cadreId || s.cadreId || `MOES-MET-${tid}`,
          department: u.department || s.department || "Meteorology Division",
          scores: [],
          submissions: [],
          passCount: 0,
          failCount: 0,
          subjects: {},
          topics: {}
        };
      }
      const entry = traineeMetricsMap[tid];
      const pct = s.percentage || 0;
      entry.scores.push({ score: pct, date: s.submittedAt });
      entry.submissions.push(s);
      if (s.passed && !s.isDisqualified) entry.passCount++;
      else entry.failCount++;

      const subName = s.subjectName || s.quizTitle || "Atmospheric Dynamics";
      if (!entry.subjects[subName]) entry.subjects[subName] = { total: 0, sum: 0 };
      entry.subjects[subName].total++;
      entry.subjects[subName].sum += pct;

      // Question-level topics if available
      (s.questionAnalysis || []).forEach(qa => {
        const top = qa.topic || "Core Concept";
        if (!entry.topics[top]) entry.topics[top] = { total: 0, correct: 0 };
        entry.topics[top].total++;
        if (qa.isCorrect) entry.topics[top].correct++;
      });
    });

    const atRiskTrainees = Object.values(traineeMetricsMap).map(tm => {
      const count = tm.scores.length;
      const avgTraineeScore = count > 0 ? Math.round(tm.scores.reduce((a, b) => a + b.score, 0) / count) : 0;
      const latestScore = count > 0 ? tm.scores[tm.scores.length - 1].score : 0;
      const traineePassRate = count > 0 ? Math.round((tm.passCount / count) * 100) : 0;

      // Find weakest subject
      let weakestSubject = "N/A";
      let lowestSubAvg = 100;
      Object.entries(tm.subjects).forEach(([sub, val]) => {
        const sAvg = val.total > 0 ? val.sum / val.total : 0;
        if (sAvg <= lowestSubAvg) {
          lowestSubAvg = sAvg;
          weakestSubject = sub;
        }
      });

      // Find weakest topic
      let weakestTopic = "General Synoptic Concepts";
      let lowestTopicAcc = 100;
      Object.entries(tm.topics).forEach(([top, val]) => {
        const tAcc = val.total > 0 ? (val.correct / val.total) * 100 : 0;
        if (tAcc <= lowestTopicAcc) {
          lowestTopicAcc = tAcc;
          weakestTopic = top;
        }
      });

      // Performance trend
      let trend = "Stable";
      if (tm.scores.length >= 2) {
        const firstHalf = tm.scores[0].score;
        const lastHalf = tm.scores[tm.scores.length - 1].score;
        if (lastHalf > firstHalf + 5) trend = "Improving";
        else if (lastHalf < firstHalf - 5) trend = "Declining";
      }

      // Risk level calculation
      let riskLevel = "Low";
      if (avgTraineeScore < 60 || traineePassRate < 50) {
        riskLevel = "High";
      } else if (avgTraineeScore < 75 || traineePassRate < 75) {
        riskLevel = "Moderate";
      }

      return {
        traineeId: tm.traineeId,
        trainee: tm.name,
        cadreId: tm.cadreId,
        department: tm.department,
        averageScore: avgTraineeScore,
        latestScore,
        passRate: traineePassRate,
        weakestSubject,
        weakestTopic,
        assessmentAttempts: count,
        performanceTrend: trend,
        riskLevel
      };
    });

    const atRiskCount = atRiskTrainees.filter(t => t.riskLevel === "High" || t.riskLevel === "Moderate").length;

    // -------------------------------------------------------------
    // CHARTS 15 - 24 (Trainer Assessment Charts)
    // -------------------------------------------------------------
    // Chart 15: Trainee Score Distribution Histogram
    const distBins = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
    validSubs.forEach(s => {
      const p = s.percentage || 0;
      if (p <= 40) distBins["0-40%"]++;
      else if (p <= 60) distBins["41-60%"]++;
      else if (p <= 80) distBins["61-80%"]++;
      else distBins["81-100%"]++;
    });
    const scoreDistribution = Object.entries(distBins).map(([range, count]) => ({ range, count }));

    // Chart 16: Trainee Performance Bar Chart
    const traineePerformance = Object.values(traineeMetricsMap).slice(0, 15).map(tm => ({
      trainee: tm.name.length > 15 ? tm.name.substring(0, 13) + "..." : tm.name,
      fullName: tm.name,
      averageScore: Math.round(tm.scores.reduce((a, b) => a + b.score, 0) / (tm.scores.length || 1)),
      passRate: Math.round((tm.passCount / (tm.scores.length || 1)) * 100),
      attempts: tm.scores.length
    }));

    // Chart 17: Subject Performance Bar Chart
    const subjectMetrics = {};
    trainerQuizzes.forEach(q => {
      const sName = q.subjectName || q.courseName || "General Meteorology";
      if (!subjectMetrics[sName]) subjectMetrics[sName] = { subject: sName, scores: [], attempts: 0, passCount: 0 };
    });
    validSubs.forEach(s => {
      const q = trainerQuizzes.find(tq => tq.id === s.quizId);
      const sName = q?.subjectName || q?.courseName || s.subjectName || "General Meteorology";
      if (!subjectMetrics[sName]) subjectMetrics[sName] = { subject: sName, scores: [], attempts: 0, passCount: 0 };
      subjectMetrics[sName].scores.push(s.percentage || 0);
      subjectMetrics[sName].attempts++;
      if (s.passed) subjectMetrics[sName].passCount++;
    });
    const subjectPerformance = Object.values(subjectMetrics).map(sm => ({
      subject: sm.subject,
      averageScore: sm.scores.length > 0 ? Math.round(sm.scores.reduce((a, b) => a + b, 0) / sm.scores.length) : 0,
      passRate: sm.attempts > 0 ? Math.round((sm.passCount / sm.attempts) * 100) : 0,
      attempts: sm.attempts
    }));

    // Chart 18: Weak Topic Horizontal Bar Chart (Sorted ascending by accuracy)
    const topicAggregate = {};
    const questionAccuracyList = [];
    const questionTimeList = [];
    const optionDistributionList = [];
    const diffAccuracyMap = {
      Easy: { attempts: 0, correct: 0 },
      Medium: { attempts: 0, correct: 0 },
      Hard: { attempts: 0, correct: 0 }
    };

    trainerQuizzes.forEach(q => {
      (q.questions || []).forEach((question, qIdx) => {
        const qId = question.id;
        const topic = question.topic || question.subjectName || q.subjectName || "Core Meteorology";
        const diff = question.difficulty || "Medium";
        const optBreakdown = [0, 0, 0, 0];
        let qAttempts = 0;
        let qCorrect = 0;
        let qTotalTime = 0;

        submissions.forEach(s => {
          let sel = s.answers ? s.answers[qId] : undefined;
          let isCorr = false;
          let tSpent = 0;

          const qa = (s.questionAnalysis || []).find(item => item.questionId === qId);
          if (qa) {
            if (sel === undefined) sel = qa.selectedAnswer;
            isCorr = qa.isCorrect;
            tSpent = qa.timeSpent || 0;
          }

          if (sel !== undefined && sel !== null) {
            qAttempts++;
            if (typeof sel === "number" && sel >= 0 && sel < 4) optBreakdown[sel]++;
            if (sel === question.correctAnswer || isCorr) qCorrect++;
            qTotalTime += tSpent;
          }
        });

        if (qAttempts > 0) {
          const accPct = Math.round((qCorrect / qAttempts) * 100);
          const avgTimeQ = Math.round(qTotalTime / qAttempts) || 35;

          if (!topicAggregate[topic]) topicAggregate[topic] = { topic, total: 0, correct: 0 };
          topicAggregate[topic].total += qAttempts;
          topicAggregate[topic].correct += qCorrect;

          if (diffAccuracyMap[diff]) {
            diffAccuracyMap[diff].attempts += qAttempts;
            diffAccuracyMap[diff].correct += qCorrect;
          }

          questionAccuracyList.push({
            questionId: qId,
            questionNumber: qIdx + 1,
            questionText: question.question.length > 50 ? question.question.substring(0, 47) + "..." : question.question,
            fullText: question.question,
            topic,
            difficulty: diff,
            accuracy: accPct,
            attempts: qAttempts,
            avgTimeSeconds: avgTimeQ
          });

          questionTimeList.push({
            questionNumber: qIdx + 1,
            questionText: question.question.length > 40 ? question.question.substring(0, 37) + "..." : question.question,
            avgTimeSeconds: avgTimeQ,
            difficulty: diff
          });

          optionDistributionList.push({
            questionNumber: qIdx + 1,
            questionText: question.question.length > 30 ? question.question.substring(0, 27) + "..." : question.question,
            OptionA: qAttempts > 0 ? Math.round((optBreakdown[0] / qAttempts) * 100) : 0,
            OptionB: qAttempts > 0 ? Math.round((optBreakdown[1] / qAttempts) * 100) : 0,
            OptionC: qAttempts > 0 ? Math.round((optBreakdown[2] / qAttempts) * 100) : 0,
            OptionD: qAttempts > 0 ? Math.round((optBreakdown[3] / qAttempts) * 100) : 0
          });
        }
      });
    });

    // Chart 18: Weak Topic Bar (Lowest accuracy first)
    const weakTopics = Object.values(topicAggregate)
      .map(t => ({
        topic: t.topic,
        accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
        totalQuestionsAnswered: t.total
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    // Chart 19: Question Accuracy Bar
    const questionAccuracy = questionAccuracyList.slice(0, 15);

    // Chart 20: Option Distribution Stacked Bar
    const optionDistribution = optionDistributionList.slice(0, 10);

    // Chart 21: Average Time per Question Bar
    const averageTimePerQuestion = questionTimeList.slice(0, 15);

    // Chart 22: Difficulty vs Accuracy Grouped Bar
    const difficultyVsAccuracy = Object.entries(diffAccuracyMap).map(([diff, val]) => ({
      difficulty: diff,
      accuracy: val.attempts > 0 ? Math.round((val.correct / val.attempts) * 100) : 0,
      attempts: val.attempts
    }));

    // Chart 23 & 24: Assessment Average Score & Pass Rate Trend Line
    const quizTrendMap = {};
    submissions.forEach(s => {
      const q = trainerQuizzes.find(tq => tq.id === s.quizId);
      const title = q?.title || s.quizTitle || "Assessment";
      if (!quizTrendMap[s.quizId]) {
        quizTrendMap[s.quizId] = {
          quizId: s.quizId,
          title: title.length > 25 ? title.substring(0, 22) + "..." : title,
          scores: [],
          passCount: 0,
          date: s.submittedAt
        };
      }
      quizTrendMap[s.quizId].scores.push(s.percentage || 0);
      if (s.passed) quizTrendMap[s.quizId].passCount++;
    });

    const assessmentScoreTrend = Object.values(quizTrendMap)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(qt => ({
        assessment: qt.title,
        averageScore: qt.scores.length > 0 ? Math.round(qt.scores.reduce((a, b) => a + b, 0) / qt.scores.length) : 0,
        passRate: qt.scores.length > 0 ? Math.round((qt.passCount / qt.scores.length) * 100) : 0,
        attempts: qt.scores.length
      }));

    const passRateTrend = assessmentScoreTrend;

    return res.json({
      success: true,
      hasData: true,
      trainer: {
        id: trainerUser.id,
        name: trainerUser.name,
        department: trainerUser.department,
        designation: trainerUser.designation
      },
      filters: {
        courses: trainerCourses.map(c => ({ id: c.id, title: c.title })),
        quizzes: trainerQuizzes.map(q => ({ id: q.id, title: q.title }))
      },
      kpis: {
        assignedTrainees: totalAssignedTrainees,
        activeTrainees,
        assessments: trainerQuizzes.length,
        attempts: totalAttempts,
        averageScore: avgScore,
        averagePercentage: avgPercentage,
        passRate,
        completionRate,
        highestScore,
        lowestScore,
        averageAssessmentTimeSeconds: avgTimeSec,
        averageAssessmentTimeText: avgAssessmentTimeText,
        atRiskTraineesCount: atRiskCount,
        pendingEvaluations
      },
      charts: {
        scoreDistribution,
        traineePerformance,
        subjectPerformance,
        weakTopics,
        questionAccuracy,
        optionDistribution,
        averageTimePerQuestion,
        difficultyVsAccuracy,
        assessmentScoreTrend,
        passRateTrend
      },
      atRiskTrainees
    });
  } catch (err) {
    console.error("Trainer analytics computation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================================================================
// ROLE 3: ALL TRAINERS / SUBJECT MANAGEMENT (Aggregated Trainer Cohort)
// =========================================================================
export const getAllTrainersAnalytics = (req, res) => {
  try {
    const { dateRange, customStart, customEnd } = req.query;

    const trainers = (db.users || []).filter(u => u.role === "trainer");
    const courses = db.getCourses() || [];
    const quizzes = db.getQuizzes() || [];
    let submissions = db.quizSubmissions || [];
    submissions = filterByDateRange(submissions, "submittedAt", dateRange, customStart, customEnd);

    if (submissions.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: "No attempts recorded yet",
        kpis: null,
        charts: null
      });
    }

    // Collect distinct assigned subjects across all courses
    const allSubjectsSet = new Set();
    courses.forEach(c => {
      (c.subjects || []).forEach(s => {
        if (s.name || s.title) allSubjectsSet.add((s.name || s.title).trim());
      });
    });

    const totalTrainers = trainers.length;
    const totalAssignedSubjects = allSubjectsSet.size;
    const totalTrainees = (db.users || []).filter(u => u.role === "trainee").length;
    const totalAssessments = quizzes.length;
    const totalAttempts = submissions.length;

    const validSubs = submissions.filter(s => !s.isDisqualified);
    const passedSubs = validSubs.filter(s => s.passed);
    const avgScore = validSubs.length > 0 ? Number((validSubs.reduce((a, b) => a + (b.score || 0), 0) / validSubs.length).toFixed(1)) : 0;
    const passRate = validSubs.length > 0 ? Math.round((passedSubs.length / validSubs.length) * 100) : 0;
    const completionRate = totalTrainees > 0 ? Math.min(100, Math.round((new Set(validSubs.map(s => s.traineeId)).size / totalTrainees) * 100)) : 0;

    // At risk trainees across cohort
    const traineeScores = {};
    validSubs.forEach(s => {
      if (!traineeScores[s.traineeId]) traineeScores[s.traineeId] = [];
      traineeScores[s.traineeId].push(s.percentage || 0);
    });
    const atRiskCount = Object.values(traineeScores).filter(arr => {
      const avg = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
      return avg < 60;
    }).length;

    // -------------------------------------------------------------
    // CHARTS 25 - 30 (All Trainers / Subject Management Charts)
    // -------------------------------------------------------------
    // Chart 25: Trainer Cohort Performance Comparison (Neutral Label)
    const trainerCohortPerformance = trainers.map(t => {
      const tCourses = courses.filter(c => c.leadTrainerId === t.id || (c.subjects || []).some(s => s.trainerId === t.id));
      const tQuizzes = quizzes.filter(q => q.trainerId === t.id || q.createdBy === t.id);
      const tQuizIds = new Set(tQuizzes.map(q => q.id));
      const tSubs = validSubs.filter(s => tQuizIds.has(s.quizId));

      const tAvg = tSubs.length > 0 ? Math.round(tSubs.reduce((a, b) => a + (b.percentage || 0), 0) / tSubs.length) : 0;
      const tPass = tSubs.length > 0 ? Math.round((tSubs.filter(s => s.passed).length / tSubs.length) * 100) : 0;

      return {
        trainerName: t.name,
        averageScore: tAvg,
        passRate: tPass,
        activeCourses: tCourses.length,
        assessmentsConducted: tQuizzes.length,
        submissionsEvaluated: tSubs.length
      };
    });

    // Chart 26: Subject Performance Comparison
    const subjectMap = {};
    allSubjectsSet.forEach(s => {
      subjectMap[s] = { subject: s, scores: [], attempts: 0, passCount: 0 };
    });
    validSubs.forEach(s => {
      const q = quizzes.find(item => item.id === s.quizId);
      const sName = q?.subjectName || q?.courseName || s.subjectName || "Atmospheric Dynamics";
      if (!subjectMap[sName]) subjectMap[sName] = { subject: sName, scores: [], attempts: 0, passCount: 0 };
      subjectMap[sName].scores.push(s.percentage || 0);
      subjectMap[sName].attempts++;
      if (s.passed) subjectMap[sName].passCount++;
    });
    const subjectPerformanceComparison = Object.values(subjectMap).map(sm => ({
      subject: sm.subject,
      averageScore: sm.scores.length > 0 ? Math.round(sm.scores.reduce((a, b) => a + b, 0) / sm.scores.length) : 0,
      passRate: sm.attempts > 0 ? Math.round((sm.passCount / sm.attempts) * 100) : 0,
      attempts: sm.attempts
    }));

    // Chart 27: Trainer-Subject Performance Heatmap Matrix
    const heatmapMatrix = [];
    trainers.forEach(t => {
      Array.from(allSubjectsSet).forEach(sub => {
        const matchedQuizzes = quizzes.filter(q => (q.trainerId === t.id || q.createdBy === t.id) && (q.subjectName === sub || q.title?.includes(sub)));
        const qIds = new Set(matchedQuizzes.map(q => q.id));
        const matchedSubs = validSubs.filter(s => qIds.has(s.quizId));
        const avg = matchedSubs.length > 0 ? Math.round(matchedSubs.reduce((a, b) => a + (b.percentage || 0), 0) / matchedSubs.length) : null;
        heatmapMatrix.push({
          trainer: t.name,
          subject: sub,
          averageScore: avg,
          attempts: matchedSubs.length,
          hasData: avg !== null
        });
      });
    });

    // Chart 28: Assessment Performance Trend Line
    const quizDateMap = {};
    validSubs.forEach(s => {
      const date = new Date(s.submittedAt || Date.now()).toLocaleDateString();
      if (!quizDateMap[date]) quizDateMap[date] = { date, scores: [], count: 0 };
      quizDateMap[date].scores.push(s.percentage || 0);
      quizDateMap[date].count++;
    });
    const assessmentPerformanceTrend = Object.values(quizDateMap).map(d => ({
      date: d.date,
      cohortAverageScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
      attemptsCount: d.count
    }));

    // Chart 29: Subject Score Distribution
    const subjectScoreDistribution = Object.values(subjectMap).slice(0, 6).map(sm => {
      const b = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
      sm.scores.forEach(p => {
        if (p <= 40) b["0-40%"]++;
        else if (p <= 60) b["41-60%"]++;
        else if (p <= 80) b["61-80%"]++;
        else b["81-100%"]++;
      });
      return {
        subject: sm.subject,
        ...b
      };
    });

    // Chart 30: Trainer Workload Bar Chart
    const trainerWorkload = trainers.map(t => {
      const assignedC = courses.filter(c => c.leadTrainerId === t.id || (c.subjects || []).some(s => s.trainerId === t.id));
      const assignedQ = quizzes.filter(q => q.trainerId === t.id || q.createdBy === t.id);
      return {
        trainer: t.name,
        coursesCount: assignedC.length,
        assessmentsCount: assignedQ.length,
        workloadScore: assignedC.length * 30 + assignedQ.length * 10
      };
    });

    return res.json({
      success: true,
      hasData: true,
      kpis: {
        totalTrainers,
        totalAssignedSubjects,
        totalTrainees,
        totalAssessments,
        totalAttempts,
        averageScore: avgScore,
        passRate,
        completionRate,
        atRiskTrainees: atRiskCount
      },
      charts: {
        trainerCohortPerformance,
        subjectPerformanceComparison,
        heatmapMatrix,
        assessmentPerformanceTrend,
        subjectScoreDistribution,
        trainerWorkload
      }
    });
  } catch (err) {
    console.error("All trainers analytics computation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================================================================
// ROLE 4: ADMIN ORGANIZATION-WIDE ASSESSMENT ANALYTICS (7-Level Drill-Down)
// =========================================================================
export const getAdminAnalytics = (req, res) => {
  try {
    const { courseId, subjectId, trainerId, assessmentId, department, dateRange, customStart, customEnd } = req.query;

    const allCourses = db.getCourses() || [];
    const allUsers = db.users || [];
    const trainees = allUsers.filter(u => u.role === "trainee");
    const trainers = allUsers.filter(u => u.role === "trainer");
    let quizzes = db.getQuizzes() || [];
    let submissions = db.quizSubmissions || [];
    let integrityAlerts = db.integrityAlerts || [];

    // Date range filter
    submissions = filterByDateRange(submissions, "submittedAt", dateRange, customStart, customEnd);
    integrityAlerts = filterByDateRange(integrityAlerts, "timestamp", dateRange, customStart, customEnd);

    // -------------------------------------------------------------
    // DRILL-DOWN CASCADING FILTER ENGINE:
    // Organization -> Course -> Subject -> Trainer -> Assessment -> Trainee
    // -------------------------------------------------------------
    if (courseId && courseId !== "all") {
      quizzes = quizzes.filter(q => q.courseId === courseId);
    }
    if (subjectId && subjectId !== "all") {
      quizzes = quizzes.filter(q => q.subjectId === subjectId || q.subjectName === subjectId);
    }
    if (trainerId && trainerId !== "all") {
      quizzes = quizzes.filter(q => q.trainerId === trainerId || q.createdBy === trainerId);
    }
    if (assessmentId && assessmentId !== "all") {
      quizzes = quizzes.filter(q => q.id === assessmentId);
    }

    const filteredQuizIds = new Set(quizzes.map(q => q.id));
    submissions = submissions.filter(s => filteredQuizIds.has(s.quizId));

    if (department && department !== "all") {
      submissions = submissions.filter(s => {
        const u = db.findUserById(s.traineeId);
        return (u?.department || s.department) === department;
      });
    }

    // Filter dependent dropdown metadata for cascading UI
    const availableCourses = allCourses.map(c => ({ id: c.id, title: c.title }));
    const availableSubjects = [];
    const subjectSet = new Set();
    allCourses.forEach(c => {
      if (!courseId || courseId === "all" || c.id === courseId) {
        (c.subjects || []).forEach(s => {
          const sName = s.name || s.title;
          if (sName && !subjectSet.has(sName)) {
            subjectSet.add(sName);
            availableSubjects.push({ id: s.id || sName, title: sName });
          }
        });
      }
    });

    const availableTrainers = trainers.map(t => ({ id: t.id, name: t.name }));
    const availableAssessments = quizzes.map(q => ({ id: q.id, title: q.title }));
    const availableDepartments = Array.from(new Set(allUsers.map(u => u.department).filter(Boolean)));

    if (submissions.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: "No sufficient assessment data",
        filters: {
          courses: availableCourses,
          subjects: availableSubjects,
          trainers: availableTrainers,
          assessments: availableAssessments,
          departments: availableDepartments
        },
        kpis: null,
        charts: null
      });
    }

    // -------------------------------------------------------------
    // ADMIN SUMMARY KPIS
    // -------------------------------------------------------------
    const totalTrainees = trainees.length;
    const totalTrainers = trainers.length;
    const totalCourses = allCourses.length;
    const totalSubjects = subjectSet.size || 12;
    const totalAssessments = quizzes.length;
    const totalAttempts = submissions.length;

    const validSubs = submissions.filter(s => !s.isDisqualified);
    const passedSubs = validSubs.filter(s => s.passed);
    const overallAvgScore = validSubs.length > 0 ? Number((validSubs.reduce((a, b) => a + (b.score || 0), 0) / validSubs.length).toFixed(1)) : 0;
    const overallPassRate = validSubs.length > 0 ? Math.round((passedSubs.length / validSubs.length) * 100) : 0;
    const totalCertificatesIssued = submissions.filter(s => s.certificateGenerated).length;
    const activeAssessments = quizzes.filter(q => q.status === "published" || !q.status).length;
    const completionRate = totalTrainees > 0 ? Math.min(100, Math.round((new Set(validSubs.map(s => s.traineeId)).size / totalTrainees) * 100)) : 0;

    // At risk trainees
    const traineeScores = {};
    validSubs.forEach(s => {
      if (!traineeScores[s.traineeId]) traineeScores[s.traineeId] = [];
      traineeScores[s.traineeId].push(s.percentage || 0);
    });
    const atRiskTraineesCount = Object.values(traineeScores).filter(arr => {
      const avg = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
      return avg < 60;
    }).length;

    // -------------------------------------------------------------
    // CHARTS 31 - 44 (Organization-Wide Admin Charts)
    // -------------------------------------------------------------
    // Chart 31: Overall Score Trend Line Chart
    // Chart 32: Pass Rate Trend Line Chart
    const dateAggregation = {};
    validSubs.forEach(s => {
      const date = new Date(s.submittedAt || Date.now()).toLocaleDateString();
      if (!dateAggregation[date]) dateAggregation[date] = { date, scores: [], passCount: 0, attempts: 0 };
      dateAggregation[date].scores.push(s.percentage || 0);
      dateAggregation[date].attempts++;
      if (s.passed) dateAggregation[date].passCount++;
    });

    const scoreTrendData = Object.values(dateAggregation).map(d => ({
      date: d.date,
      averageScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
      passRate: Math.round((d.passCount / d.attempts) * 100),
      attempts: d.attempts
    }));

    // Chart 33: Course Performance Bar Chart
    const courseMap = {};
    allCourses.forEach(c => {
      courseMap[c.id] = { course: c.title.length > 25 ? c.title.substring(0, 22) + "..." : c.title, fullName: c.title, scores: [], attempts: 0, passCount: 0 };
    });
    validSubs.forEach(s => {
      const q = quizzes.find(item => item.id === s.quizId);
      const cId = q?.courseId || s.courseId;
      if (cId && courseMap[cId]) {
        courseMap[cId].scores.push(s.percentage || 0);
        courseMap[cId].attempts++;
        if (s.passed) courseMap[cId].passCount++;
      }
    });
    const coursePerformance = Object.values(courseMap).map(cm => ({
      course: cm.course,
      fullName: cm.fullName,
      averageScore: cm.scores.length > 0 ? Math.round(cm.scores.reduce((a, b) => a + b, 0) / cm.scores.length) : 0,
      passRate: cm.attempts > 0 ? Math.round((cm.passCount / cm.attempts) * 100) : 0,
      attempts: cm.attempts
    }));

    // Chart 34: Subject Performance Bar Chart
    const subjectMap = {};
    validSubs.forEach(s => {
      const q = quizzes.find(item => item.id === s.quizId);
      const sub = q?.subjectName || q?.courseName || s.subjectName || "Atmospheric Dynamics";
      if (!subjectMap[sub]) subjectMap[sub] = { subject: sub, scores: [], attempts: 0, passCount: 0 };
      subjectMap[sub].scores.push(s.percentage || 0);
      subjectMap[sub].attempts++;
      if (s.passed) subjectMap[sub].passCount++;
    });
    const subjectPerformance = Object.values(subjectMap).map(sm => ({
      subject: sm.subject,
      averageScore: sm.scores.length > 0 ? Math.round(sm.scores.reduce((a, b) => a + b, 0) / sm.scores.length) : 0,
      passRate: sm.attempts > 0 ? Math.round((sm.passCount / sm.attempts) * 100) : 0,
      attempts: sm.attempts
    }));

    // Chart 35: Department Performance Bar Chart
    const deptMap = {};
    validSubs.forEach(s => {
      const u = db.findUserById(s.traineeId);
      const dept = u?.department || s.department || "General Meteorology Division";
      if (!deptMap[dept]) deptMap[dept] = { department: dept, scores: [], attempts: 0 };
      deptMap[dept].scores.push(s.percentage || 0);
      deptMap[dept].attempts++;
    });
    const departmentPerformance = Object.values(deptMap).map(dm => ({
      department: dm.department.length > 25 ? dm.department.substring(0, 22) + "..." : dm.department,
      fullDepartment: dm.department,
      averageScore: dm.scores.length > 0 ? Math.round(dm.scores.reduce((a, b) => a + b, 0) / dm.scores.length) : 0,
      attempts: dm.attempts
    }));

    // Chart 36: Organization Score Distribution Histogram
    const orgHistBins = { "0-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 };
    validSubs.forEach(s => {
      const p = s.percentage || 0;
      if (p <= 40) orgHistBins["0-40%"]++;
      else if (p <= 60) orgHistBins["41-60%"]++;
      else if (p <= 80) orgHistBins["61-80%"]++;
      else orgHistBins["81-100%"]++;
    });
    const organizationScoreHistogram = Object.entries(orgHistBins).map(([range, count]) => ({ range, count }));

    // Chart 37: Assessment Attempts Over Time Area Chart
    const attemptsTimeline = scoreTrendData.map(d => ({
      date: d.date,
      attempts: d.attempts
    }));

    // Chart 38: Assessment Completion Funnel
    // Enrolled -> Started Exam -> Completed -> Passed -> Certified
    const totalEnrolled = allCourses.reduce((acc, c) => acc + (c.enrolledTraineeIds?.length || 0), 0) || totalTrainees;
    const startedExam = validSubs.length;
    const completedExam = validSubs.length;
    const passedExam = passedSubs.length;
    const certifiedCount = totalCertificatesIssued;

    const completionFunnel = [
      { stage: "Enrolled Officers", count: Math.max(totalEnrolled, startedExam), fill: "#3B82F6" },
      { stage: "Attempts Initiated", count: startedExam, fill: "#6366F1" },
      { stage: "Valid Submissions", count: completedExam, fill: "#8B5CF6" },
      { stage: "Passed Assessments", count: passedExam, fill: "#10B981" },
      { stage: "Credentials Issued", count: certifiedCount, fill: "#F59E0B" }
    ];

    // Chart 39: Certificate Issuance Trend Line Chart
    const certDateMap = {};
    submissions.filter(s => s.certificateGenerated).forEach(s => {
      const date = new Date(s.submittedAt || Date.now()).toLocaleDateString();
      certDateMap[date] = (certDateMap[date] || 0) + 1;
    });
    const certificateIssuanceTrend = Object.entries(certDateMap).map(([date, count]) => ({ date, certificates: count }));

    // Chart 40: Organization Learning Gap Heatmap
    const orgTopicMap = {};
    quizzes.forEach(q => {
      (q.questions || []).forEach(question => {
        const top = question.topic || question.subjectName || q.subjectName || "Core Concept";
        if (!orgTopicMap[top]) orgTopicMap[top] = { topic: top, totalAttempts: 0, correctCount: 0 };
        submissions.forEach(s => {
          const qa = (s.questionAnalysis || []).find(item => item.questionId === question.id);
          const sel = s.answers ? s.answers[question.id] : undefined;
          if (sel !== undefined || qa) {
            orgTopicMap[top].totalAttempts++;
            if (sel === question.correctAnswer || (qa && qa.isCorrect)) {
              orgTopicMap[top].correctCount++;
            }
          }
        });
      });
    });

    const organizationLearningGaps = Object.values(orgTopicMap).map(ot => {
      const acc = ot.totalAttempts > 0 ? (ot.correctCount / ot.totalAttempts) * 100 : 0;
      let status = "Needs Attention";
      let color = "#EF4444";
      if (acc >= 80) {
        status = "Strong (>=80%)";
        color = "#10B981";
      } else if (acc >= 60) {
        status = "Developing (60-79%)";
        color = "#F59E0B";
      }
      return {
        topic: ot.topic,
        accuracy: Number(acc.toFixed(1)),
        attempts: ot.totalAttempts,
        status,
        color
      };
    });

    // Chart 41: Question Quality Distribution Bar Chart
    // Categorize questions: Potentially Too Easy (>90% acc), Optimal (60-90% acc), Review Required (<60% acc)
    let tooEasyCount = 0;
    let optimalCount = 0;
    let reviewRequiredCount = 0;
    let highTimeLowAccCount = 0;

    quizzes.forEach(q => {
      (q.questions || []).forEach(question => {
        let attempts = 0;
        let correct = 0;
        let totalTimeQ = 0;

        submissions.forEach(s => {
          const sel = s.answers ? s.answers[question.id] : undefined;
          const qa = (s.questionAnalysis || []).find(item => item.questionId === question.id);
          if (sel !== undefined || qa) {
            attempts++;
            if (sel === question.correctAnswer || (qa && qa.isCorrect)) correct++;
            if (qa && qa.timeSpent) totalTimeQ += qa.timeSpent;
          }
        });

        if (attempts > 0) {
          const acc = (correct / attempts) * 100;
          const avgTime = Math.round(totalTimeQ / attempts);
          if (acc > 90) tooEasyCount++;
          else if (acc >= 60) optimalCount++;
          else reviewRequiredCount++;

          if (acc < 60 && avgTime > 45) highTimeLowAccCount++;
        }
      });
    });

    const questionQualityDistribution = [
      { category: "Optimal (60–90% Acc)", count: optimalCount, fill: "#10B981", desc: "Balanced calibration" },
      { category: "Too Easy (>90% Acc)", count: tooEasyCount, fill: "#3B82F6", desc: "Consider increasing difficulty" },
      { category: "Review Required (<60% Acc)", count: reviewRequiredCount, fill: "#EF4444", desc: "Potential concept difficulty" },
      { category: "High Time + Low Acc", count: highTimeLowAccCount, fill: "#F59E0B", desc: "Flagged for conceptual review" }
    ];

    // Chart 42: Integrity Violation Donut Chart
    const cleanAttempts = submissions.filter(s => !s.isDisqualified && (!s.tabSwitchCount || s.tabSwitchCount === 0)).length;
    const warningAttempts = submissions.filter(s => !s.isDisqualified && s.tabSwitchCount === 1).length;
    const disqualifiedAttempts = submissions.filter(s => s.isDisqualified || (s.tabSwitchCount && s.tabSwitchCount >= 2)).length;

    const integrityViolationDonut = [
      { name: "Clean Submissions", value: cleanAttempts, fill: "#10B981" },
      { name: "1-Tab Warning", value: warningAttempts, fill: "#F59E0B" },
      { name: "Disqualified", value: disqualifiedAttempts, fill: "#EF4444" }
    ].filter(item => item.value > 0);

    // Chart 43: Integrity Violations Over Time Line Chart
    const integrityTimeMap = {};
    integrityAlerts.forEach(alert => {
      const date = new Date(alert.timestamp || Date.now()).toLocaleDateString();
      if (!integrityTimeMap[date]) integrityTimeMap[date] = { date, warnings: 0, disqualifications: 0 };
      if (alert.disqualified) integrityTimeMap[date].disqualifications++;
      else integrityTimeMap[date].warnings++;
    });
    const integrityViolationsOverTime = Object.values(integrityTimeMap);

    // Chart 44: Trainer Workload Bar Chart
    const trainerWorkload = trainers.map(t => {
      const assignedC = allCourses.filter(c => c.leadTrainerId === t.id || (c.subjects || []).some(s => s.trainerId === t.id));
      const assignedQ = quizzes.filter(q => q.trainerId === t.id || q.createdBy === t.id);
      return {
        trainer: t.name,
        courses: assignedC.length,
        assessments: assignedQ.length
      };
    });

    return res.json({
      success: true,
      hasData: true,
      filters: {
        courses: availableCourses,
        subjects: availableSubjects,
        trainers: availableTrainers,
        assessments: availableAssessments,
        departments: availableDepartments
      },
      kpis: {
        totalTrainees,
        totalTrainers,
        totalCourses,
        totalSubjects,
        totalAssessments,
        totalAttempts,
        overallAverageScore: overallAvgScore,
        overallPassRate,
        completionRate,
        certificatesIssued: totalCertificatesIssued,
        atRiskTrainees: atRiskTraineesCount,
        activeAssessments
      },
      charts: {
        overallScoreTrend: scoreTrendData,
        passRateTrend: scoreTrendData,
        coursePerformance,
        subjectPerformance,
        departmentPerformance,
        organizationScoreHistogram,
        attemptsTimeline,
        completionFunnel,
        certificateIssuanceTrend,
        organizationLearningGaps,
        questionQualityDistribution,
        integrityViolationDonut,
        integrityViolationsOverTime,
        trainerWorkload
      }
    });
  } catch (err) {
    console.error("Admin assessment analytics error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =========================================================================
// SPECIFIC ASSESSMENT ANALYTICS DEEP DIVE
// =========================================================================
export const getAssessmentAnalytics = (req, res) => {
  try {
    const { assessmentId } = req.params;
    const quiz = db.getQuizById(assessmentId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    const submissions = db.getSubmissionsForQuiz(assessmentId);
    if (submissions.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: "No attempts recorded yet",
        quiz,
        kpis: null,
        questionAccuracy: [],
        traineeRankings: []
      });
    }

    const validSubs = submissions.filter(s => !s.isDisqualified);
    const passedCount = validSubs.filter(s => s.passed).length;
    const avgScore = validSubs.length > 0 ? Number((validSubs.reduce((a, b) => a + (b.score || 0), 0) / validSubs.length).toFixed(1)) : 0;
    const passRate = validSubs.length > 0 ? Math.round((passedCount / validSubs.length) * 100) : 0;

    // Item analysis for questions
    const questionAccuracy = (quiz.questions || []).map((q, idx) => {
      let qAttempts = 0;
      let qCorrect = 0;
      let qTime = 0;
      const optBreakdown = [0, 0, 0, 0];

      submissions.forEach(s => {
        const sel = s.answers ? s.answers[q.id] : undefined;
        const qa = (s.questionAnalysis || []).find(item => item.questionId === q.id);
        if (sel !== undefined || qa) {
          qAttempts++;
          if (typeof sel === "number" && sel >= 0 && sel < 4) optBreakdown[sel]++;
          if (sel === q.correctAnswer || (qa && qa.isCorrect)) qCorrect++;
          if (qa && qa.timeSpent) qTime += qa.timeSpent;
        }
      });

      const acc = qAttempts > 0 ? Math.round((qCorrect / qAttempts) * 100) : 0;
      const avgT = qAttempts > 0 ? Math.round(qTime / qAttempts) : 30;

      return {
        questionId: q.id,
        questionNumber: idx + 1,
        question: q.question,
        topic: q.topic || q.subjectName || quiz.subjectName || "Atmospheric Dynamics",
        difficulty: q.difficulty || "Medium",
        marks: Number(q.marks) || 2,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        accuracy: acc,
        attempts: qAttempts,
        correctCount: qCorrect,
        averageTimeSeconds: avgT,
        optionBreakdown: optBreakdown
      };
    });

    // Trainee rankings
    const traineeRankings = [...submissions]
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0))
      .map((s, idx) => {
        const u = db.findUserById(s.traineeId) || {};
        return {
          rank: idx + 1,
          id: s.id,
          traineeId: s.traineeId,
          traineeName: s.traineeName || u.name || "Cadet Officer",
          cadreId: u.cadreId || s.cadreId || `MOES-MET-${idx + 1}`,
          department: u.department || s.department || "Meteorology Division",
          score: s.score || 0,
          totalMarks: s.totalMarks || quiz.totalMarks || 20,
          percentage: s.percentage || 0,
          passed: s.passed,
          isDisqualified: s.isDisqualified,
          timeTakenSeconds: s.timeTakenSeconds || 0,
          submittedAt: s.submittedAt
        };
      });

    return res.json({
      success: true,
      hasData: true,
      quiz,
      kpis: {
        totalAttempts: submissions.length,
        averageScore: avgScore,
        passRate,
        highestScore: Math.max(...validSubs.map(s => s.percentage || 0), 0),
        lowestScore: Math.min(...validSubs.map(s => s.percentage || 0), 0)
      },
      questionAccuracy,
      traineeRankings
    });
  } catch (err) {
    console.error("Assessment analytics deep dive error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
