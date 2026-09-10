import { db } from "../store/dbStore.js";

// Phase 10: Public QR & Verification Code Lookup
export const verifyCertificate = (req, res) => {
  try {
    const { code } = req.params;
    const cert = db.getCertificateByVerificationCode(code);

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "No official certificate found matching this verification code. Please check the code."
      });
    }

    const trainee = db.findUserById(cert.traineeId);
    const course = db.getCourseById(cert.courseId);

    return res.json({
      success: true,
      valid: cert.status === "VALID",
      certificate: {
        certificateNumber: cert.certificateNumber,
        verificationCode: cert.verificationCode,
        traineeName: cert.traineeName || trainee?.name,
        traineeEmail: trainee?.email,
        courseTitle: cert.courseTitle || course?.title,
        courseCode: course?.code || "MOES-IMD",
        department: trainee?.department || "India Meteorological Department",
        issuedAt: cert.issuedAt,
        issuedBy: cert.issuedBy || "Director General of Meteorology",
        status: cert.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyCertificates = (req, res) => {
  try {
    const certs = db.getCertificates(req.user.id);
    return res.json({ success: true, count: certs.length, certificates: certs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
