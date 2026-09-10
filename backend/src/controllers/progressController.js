import { db } from "../store/dbStore.js";

// Phase 4 IDOR Fix: Derive user identity from req.user.id
export const markModuleComplete = (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id; // strictly from JWT token

    const progress = db.markModuleComplete(userId, moduleId);
    return res.json({
      success: true,
      message: "Module marked as completed.",
      progress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyProgress = (req, res) => {
  try {
    const progress = db.getUserProgress(req.user.id);
    return res.json({
      success: true,
      userId: req.user.id,
      progress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserProgress = (req, res) => {
  try {
    const { userId } = req.params;
    // Ownership check: Trainee can only view their own progress
    if (req.user.role === "trainee" && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied. You can only inspect your own progress." });
    }
    const progress = db.getUserProgress(userId);
    return res.json({
      success: true,
      userId,
      progress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
