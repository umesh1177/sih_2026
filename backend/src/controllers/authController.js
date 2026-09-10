import { db } from "../store/dbStore.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/auth.js";
import { isAllowedGovEmail } from "../middleware/validate.js";

const SALT_ROUNDS = 10;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      organizationId: user.organizationId,
      status: user.status,
      adminScope: user.adminScope || "DEPARTMENT"
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Official email address is required" });
    }

    if (!password || typeof password !== "string" || password.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Password is mandatory" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.findUserByEmail(normalizedEmail);

    // Rule 1: Login must NEVER auto-create a user
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "No registered account found with this email. Please submit an official registration." 
      });
    }

    // Rule 11: Verify account status
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        status: "pending",
        message: "Your registration is currently PENDING administrative and organizational verification. Access to protected portal features is restricted until approved."
      });
    }

    if (user.status === "rejected" || user.status === "disabled") {
      return res.status(403).json({
        success: false,
        status: user.status,
        message: "Your account has been deactivated or rejected by organization administration."
      });
    }

    // Rule 2 & 3: Mandatory Password Verification with bcrypt
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Account security credentials missing. Please contact portal administration."
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Incorrect password. Please verify your credentials and try again." 
      });
    }

    // Issue signed JWT token
    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      success: true,
      message: "Authentication successful",
      user: safeUser,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Authentication service error: " + err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, employeeId, email, phone, password, role, organization, department, designation, declarationAccepted } = req.body;
    
    // Rule 6: Admin MUST NOT be self-registerable
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrative accounts cannot be self-registered. Admin credentials are provisioned strictly through seed or senior governance channels."
      });
    }

    // Rule 5: Role whitelist
    if (!["trainee", "trainer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type. Self-registration is restricted to 'trainee' and 'trainer' roles."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Duplicate checks
    const existingByEmail = db.findUserByEmail(normalizedEmail);
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this official email already exists. Please sign in or contact administrator."
      });
    }

    const existingByEmpId = db.findUserByEmployeeId(employeeId);
    if (existingByEmpId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' is already registered in the system.`
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Rule 8: Registration creates account with status = PENDING
    const newUser = db.createUser({
      name,
      employeeId,
      email: normalizedEmail,
      phone,
      passwordHash,
      role,
      organization: organization || "India Meteorological Department",
      department,
      designation
    });

    const { passwordHash: _ph, ...safeUser } = newUser;

    // Rule 9 & 10: Registration must NOT issue an authenticated portal token
    return res.status(201).json({
      success: true,
      status: "pending",
      message: "Registration submitted for organizational verification. Your account status is PENDING administrative review.",
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── IDOR-Safe Me Endpoints ───
export const getMe = (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }
    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMe = (req, res) => {
  try {
    const updates = req.body;
    // Derive ID strictly from authenticated token
    const updated = db.updateUser(req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { passwordHash, ...safeUser } = updated;
    return res.json({ success: true, message: "Profile updated successfully", user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProfile = (req, res) => {
  try {
    const { id } = req.params;
    // Ownership or admin check
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own profile." });
    }
    const user = db.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ success: false, message: "Access denied. You can only update your own profile." });
    }
    const updated = db.updateUser(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { passwordHash, ...safeUser } = updated;
    return res.json({ success: true, message: "Profile updated successfully", user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
