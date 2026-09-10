import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "moes-imd-capacity-connect-sih-2025-secret-key";

/**
 * requireAuth — Verifies Bearer JWT token in Authorization header.
 * Attaches decoded user payload to req.user.
 * Falls back gracefully for demo fast-switch tokens.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required. Please login." });
  }

  const token = authHeader.split(" ")[1];

  // Support legacy demo tokens for hackathon fast-switch
  if (token && token.startsWith("demo-jwt-token-")) {
    const userId = token.replace("demo-jwt-token-", "");
    req.user = { id: userId, _demo: true };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token. Please login again." });
  }
};

/**
 * requireRole(...roles) — Role-based access control middleware.
 * Must be used AFTER requireAuth.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    if (req.user._demo) {
      // Demo tokens skip role check for hackathon judging
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(" or ")}` 
      });
    }
    next();
  };
};

export { JWT_SECRET };
