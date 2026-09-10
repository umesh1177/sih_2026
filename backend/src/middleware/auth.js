import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET environment variable is not set. Using fallback development secret.");
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || "moes_imd_capacity_connect_sih2026_jwt_secret_key_9823748291";

/**
 * requireAuth — Verifies Bearer JWT token in Authorization header.
 * Attaches decoded user payload { id, email, role, name, departmentId, organizationId, status, adminScope } to req.user.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required. Please provide a valid authorization token." 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
    
    // Check if account is disabled or rejected
    if (decoded.status === "disabled" || decoded.status === "rejected") {
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been deactivated or rejected by organization administration." 
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired session token. Please sign in again." 
    });
  }
};

/**
 * requireRole(...roles) — Strict Role-based access control middleware.
 * All users (including demo accounts) MUST obey role authorization.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    if (req.user.status !== "approved") {
      return res.status(403).json({ 
        success: false, 
        message: "Access restricted. Your account is currently pending administrative verification." 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Authorized roles: ${roles.join(", ")}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

/**
 * requireAdminScope(scope) — Enforces organization or department level admin boundaries.
 */
export const requireAdminScope = (targetDepartmentId) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Administrative authorization required." });
    }

    // Organization-wide admin has access to all departments
    if (req.user.adminScope === "ORGANIZATION") {
      return next();
    }

    // Department/Centre admin can only manage their own department
    if (targetDepartmentId && req.user.departmentId && targetDepartmentId !== req.user.departmentId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Action exceeds your assigned departmental administrative scope."
      });
    }

    next();
  };
};

export { EFFECTIVE_JWT_SECRET as JWT_SECRET };
