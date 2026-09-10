import { db } from "../store/dbStore.js";

export const getAdminStats = (req, res) => {
  try {
    const trainees = db.users.filter(u => u.role === "trainee");
    const trainers = db.users.filter(u => u.role === "trainer");
    const pendingUsers = db.users.filter(u => u.status === "pending");
    const courses = db.getCourses();
    const quizzes = db.getQuizzes();
    const submissions = db.quizSubmissions;

    const totalCertificates = submissions.filter(s => s.certificateGenerated).length;
    const passedCount = submissions.filter(s => s.passed).length;
    const overallPassRate = submissions.length > 0 ? Math.round((passedCount / submissions.length) * 100) : 0;

    // Dynamic department-wise distribution
    const deptMap = {};
    db.users.forEach(u => {
      const d = u.department || "General Division";
      if (!deptMap[d]) deptMap[d] = { name: d, count: 0, activeTrainees: 0 };
      deptMap[d].count += 1;
      if (u.role === "trainee") deptMap[d].activeTrainees += 1;
    });
    const deptDistribution = Object.values(deptMap);

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
          { month: "Jan", certificates: 0, enrollments: 0 },
          { month: "Feb", certificates: 0, enrollments: 0 }
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
        deptDistribution,
        monthlyCertifications
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
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
