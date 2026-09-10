import { db } from "../store/dbStore.js";

export const getPendingCredentials = (req, res) => {
  try {
    const pending = db.getPendingCredentials(req.user);
    // Enrich with trainer details
    const enriched = pending.map(cred => {
      const trainer = db.findUserById(cred.trainerId);
      return {
        ...cred,
        trainerName: trainer?.name || "Senior Scientist",
        trainerEmail: trainer?.email || "",
        department: trainer?.department || "India Meteorological Department",
        designation: trainer?.designation || "Officer"
      };
    });
    return res.json({ success: true, count: enriched.length, credentials: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTrainerCredentials = (req, res) => {
  try {
    const trainerId = req.user.role === "trainer" ? req.user.id : req.query.trainerId;
    const credentials = db.getCredentials({ trainerId });
    return res.json({ success: true, count: credentials.length, credentials });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitCredential = (req, res) => {
  try {
    const cred = db.addCredential(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: "Credential submitted successfully for administrative verification!",
      credential: cred
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyCredential = (req, res) => {
  try {
    const { id } = req.params;
    const { approved, notes } = req.body;
    const cred = db.verifyCredential(id, approved, notes, req.user);
    if (!cred) {
      return res.status(404).json({ success: false, message: "Credential not found" });
    }
    return res.json({
      success: true,
      message: approved ? "Credential successfully verified!" : "Credential claim rejected.",
      credential: cred
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
