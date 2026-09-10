import { db } from "../store/dbStore.js";

// Phase 12 Analytics: Aggregated directly from database records
export const getAdminStats = (req, res) => {
  try {
    const isDeptAdmin = req.user?.adminScope === "DEPARTMENT";
    const userDeptId = req.user?.departmentId;

    let users = db.users;
    let courses = db.courses;
    let submissions = db.quizSubmissions;
    let certificates = db.certificates;

    if (isDeptAdmin && userDeptId) {
      users = users.filter(u => u.departmentId === userDeptId);
      courses = courses.filter(c => c.departmentId === userDeptId);
      const deptUserIds = users.map(u => u.id);
      submissions = submissions.filter(s => deptUserIds.includes(s.traineeId));
      certificates = certificates.filter(c => deptUserIds.includes(c.traineeId));
    }

    const trainees = users.filter(u => u.role === "trainee");
    const trainers = users.filter(u => u.role === "trainer");
    const pendingUsers = users.filter(u => u.status === "pending");
    const pendingCredentials = db.getPendingCredentials(req.user);

    const passedCount = submissions.filter(s => s.passed).length;
    const overallPassRate = submissions.length > 0 ? Math.round((passedCount / submissions.length) * 100) : 0;

    // Real department-level distribution from database
    const deptDistribution = db.departments.map(dept => {
      const deptUsers = db.users.filter(u => u.departmentId === dept.id || u.department === dept.name);
      return {
        name: dept.code,
        fullName: dept.name,
        count: deptUsers.length,
        activeTrainees: deptUsers.filter(u => u.role === "trainee" && u.status === "approved").length
      };
    });

    return res.json({
      success: true,
      stats: {
        totalTrainees: trainees.length,
        totalTrainers: trainers.length,
        pendingApprovalsCount: pendingUsers.length,
        pendingCredentialsCount: pendingCredentials.length,
        totalCourses: courses.length,
        totalQuizzesScheduled: db.quizzes.length,
        totalCertificatesIssued: certificates.length,
        overallPassRate,
        deptDistribution,
        adminScope: req.user?.adminScope || "ORGANIZATION"
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingUsers = (req, res) => {
  try {
    const pending = db.getPendingUsers(req.user);
    return res.json({ success: true, count: pending.length, pendingUsers: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyUser = (req, res) => {
  try {
    const { id } = req.params;
    const { approved, notes } = req.body;
    const user = db.approveUser(id, approved, notes, req.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      message: approved ? `Officer ${user.name} verified and approved successfully!` : `Officer ${user.name} registration rejected.`,
      user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsers = (req, res) => {
  try {
    const { role, status, search, departmentId } = req.query;
    const users = db.getAllUsers({ role, status, search, departmentId }, req.user);
    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    return res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const publishAnnouncement = (req, res) => {
  try {
    const announcement = db.createAnnouncement(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Announcement published successfully to portal circulars.",
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
