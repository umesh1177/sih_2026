import { db } from "../store/dbStore.js";

export const getAdminStats = (req, res) => {
  try {
    const trainees = db.users.filter(u => u.role === "trainee");
    const trainers = db.users.filter(u => u.role === "trainer");
    const pendingUsers = db.users.filter(u => u.status === "pending");
    const courses = db.getCourses();
    const quizzes = db.getQuizzes();
    const submissions = db.quizSubmissions || [];

    const totalCertificates = submissions.filter(s => s.certificateGenerated).length;
    const passedCount = submissions.filter(s => s.passed).length;
    const overallPassRate = submissions.length > 0 ? Math.round((passedCount / submissions.length) * 100) : 0;
    const avgScore = submissions.length > 0 
      ? Math.round(submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length) 
      : 0;

    // Dynamic department-wise distribution
    const deptMap = {};
    db.users.forEach(u => {
      const d = u.department || "General Meteorology Division";
      if (!deptMap[d]) deptMap[d] = { name: d, count: 0, activeTrainees: 0, totalScore: 0, subCount: 0 };
      deptMap[d].count += 1;
      if (u.role === "trainee") deptMap[d].activeTrainees += 1;
    });

    submissions.forEach(s => {
      const u = db.findUserById(s.traineeId);
      const d = u?.department || "General Meteorology Division";
      if (deptMap[d]) {
        deptMap[d].totalScore += (s.percentage || 0);
        deptMap[d].subCount += 1;
      }
    });

    const deptDistribution = Object.values(deptMap).map(d => ({
      name: d.name,
      count: d.count,
      activeTrainees: d.activeTrainees,
      avgScore: d.subCount > 0 ? Math.round(d.totalScore / d.subCount) : 0
    }));

    // Dynamic Regional Station/Center distribution
    const centerMap = {};
    const totalTraineesCount = trainees.length || 1;
    trainees.forEach(t => {
      const station = t.station || "National Meteorological Centre";
      if (!centerMap[station]) centerMap[station] = 0;
      centerMap[station] += 1;
    });

    const centers = Object.entries(centerMap).map(([center, count]) => ({
      center,
      count,
      participants: `${Math.round((count / totalTraineesCount) * 100)}%`,
      status: count >= 5 ? "Active Lead" : "Operational"
    }));

    // Dynamic Grade Distribution
    const distinctionCount = submissions.filter(s => s.percentage >= 90).length;
    const firstClassCount = submissions.filter(s => s.percentage >= 75 && s.percentage < 90).length;
    const passCount = submissions.filter(s => s.percentage >= 60 && s.percentage < 75).length;
    const remedialCount = submissions.filter(s => s.percentage < 60).length;
    const totalSubs = submissions.length || 1;

    const gradeDistribution = {
      distinction: { count: distinctionCount, percentage: submissions.length > 0 ? ((distinctionCount / totalSubs) * 100).toFixed(1) : "0.0" },
      firstClass: { count: firstClassCount, percentage: submissions.length > 0 ? ((firstClassCount / totalSubs) * 100).toFixed(1) : "0.0" },
      passing: { count: passCount, percentage: submissions.length > 0 ? ((passCount / totalSubs) * 100).toFixed(1) : "0.0" },
      remedial: { count: remedialCount, percentage: submissions.length > 0 ? ((remedialCount / totalSubs) * 100).toFixed(1) : "0.0" }
    };

    // Dynamic monthly certifications aggregated from real submissions
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = {};
    submissions.forEach(s => {
      const date = new Date(s.submittedAt || Date.now());
      const m = months[date.getMonth()];
      if (!monthCounts[m]) monthCounts[m] = { month: m, certificates: 0, enrollments: 0 };
      if (s.certificateGenerated) monthCounts[m].certificates += 1;
      monthCounts[m].enrollments += 1;
    });
    const monthlyCertifications = Object.values(monthCounts).length > 0
      ? Object.values(monthCounts)
      : [
          { month: "Jan", certificates: totalCertificates, enrollments: totalTraineesCount }
        ];

    return res.json({
      success: true,
      stats: {
        totalTrainees: trainees.length,
        totalTrainers: trainers.length,
        pendingApprovalsCount: pendingUsers.length,
        totalCourses: courses.length,
        totalQuizzesScheduled: quizzes.length,
        totalCertificatesIssued: totalCertificates,
        overallPassRate: overallPassRate,
        averageScore: avgScore,
        deptDistribution,
        centers,
        gradeDistribution,
        monthlyCertifications
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlatformAnalytics = (req, res) => {
  return getAdminStats(req, res);
};

export const getPendingUsers = (req, res) => {
  try {
    const pending = db.getPendingUsers();
    return res.json({ success: true, count: pending.length, pendingUsers: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyUser = (req, res) => {
  try {
    const { id } = req.params;
    const { approved, notes, rejectionReason } = req.body;
    const finalNotes = rejectionReason || notes || "";
    const user = db.approveUser(id, approved, finalNotes);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      message: approved 
        ? `Officer ${user.name} profile verified and approved successfully!` 
        : `Officer ${user.name} verification rejected. Notification dispatched with reasons.`,
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsers = (req, res) => {
  try {
    const { role, status, search } = req.query;
    let users = db.users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    if (role && role !== "all") {
      users = users.filter(u => u.role === role);
    }
    if (status && status !== "all") {
      users = users.filter(u => u.status === status);
    }
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.cadreId && u.cadreId.toLowerCase().includes(q)) ||
        (u.station && u.station.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const publishAnnouncement = (req, res) => {
  try {
    const announcement = db.createAnnouncement(req.body);
    return res.status(201).json({
      success: true,
      message: "Announcement published to homepage live ticker & notifications successfully!",
      announcement
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnnouncements = (req, res) => {
  try {
    const list = db.getAnnouncements();
    return res.json({ success: true, count: list.length, announcements: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAnnouncement = (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = db.announcements.length;
    db.announcements = db.announcements.filter(a => a.id !== id);
    if (db.announcements.length === initialLen) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    return res.json({ success: true, message: "Broadcast directive removed successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
