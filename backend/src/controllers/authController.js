import { db } from "../store/dbStore.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    let user = db.findUserByEmail(email);

    // Demo fast-login: if no password provided and user exists, allow (hackathon mode)
    if (!password) {
      if (!user) {
        user = db.createUser({
          name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, c => c.toUpperCase()),
          email,
          role: role || "trainee",
          status: "approved"
        });
      }
      const token = generateToken(user);
      return res.json({ success: true, message: "Login successful", user, token });
    }

    // Password-based login
    if (!user) {
      return res.status(401).json({ success: false, message: "No account found with this email. Please register." });
    }

    // If user has a passwordHash, verify it
    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });
      }
    }
    // If no passwordHash (existing seed users), allow login with any password for demo continuity

    const token = generateToken(user);
    // Don't return passwordHash to client
    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, message: "Login successful", user: safeUser, token });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, qualifications, experience, interests, skills, specialization, certificates, bio } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Name and Email are required" });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "User with this email already exists. Please login." });
    }

    // Hash password if provided
    let passwordHash = null;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const newUser = db.createUser({
      name,
      email,
      passwordHash,
      role: role || "trainee",
      department,
      designation,
      qualifications,
      experience,
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(",").map(s => s.trim()) : []),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []),
      specialization: Array.isArray(specialization) ? specialization : (specialization ? specialization.split(",").map(s => s.trim()) : []),
      certificates: certificates || [],
      bio: bio || "",
      status: role === "admin" ? "approved" : "pending"
    });

    const token = generateToken(newUser);
    const { passwordHash: _ph, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: role === "admin" ? "Admin registered successfully." : "Registration submitted! Your profile is pending administrative approval.",
      user: safeUser,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProfile = (req, res) => {
  try {
    const { id } = req.params;
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
    const updates = req.body;
    // Never allow passwordHash to be updated via profile update
    delete updates.passwordHash;
    delete updates.password;
    const updated = db.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { passwordHash, ...safeUser } = updated;
    return res.json({ success: true, message: "Profile updated successfully", user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitProfileForApproval = (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateUser(id, { status: "pending", submittedAt: new Date().toISOString() });
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const { passwordHash, ...safeUser } = updated;
    return res.json({ success: true, message: "Profile submitted for administrative verification and approval!", user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
