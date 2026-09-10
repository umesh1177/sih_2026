// Progress tracking controller for CAPACITY CONNECT
import { db } from "../store/dbStore.js";

export const markModuleComplete = (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }
    const progress = db.markModuleComplete(userId, moduleId);
    return res.json({ success: true, message: "Module marked as complete!", progress });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserProgress = (req, res) => {
  try {
    const { userId } = req.params;
    const progress = db.getModuleProgress(userId);
    return res.json({ success: true, progress });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
