import { z } from "zod";

// Password complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (@$!%*?&#...)");

// Allowed organizational email domains for government verification
const ALLOWED_EMAIL_DOMAINS = [
  "imd.gov.in",
  "moes.gov.in",
  "gov.in",
  "nic.in",
  "demo.imd.gov.in",
  "tropmet.res.in",
  "incois.gov.in",
  "ncmrwf.gov.in"
];

export const isAllowedGovEmail = (email) => {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase().trim();
  return ALLOWED_EMAIL_DOMAINS.some(allowed => domain === allowed || domain.endsWith("." + allowed));
};

// ─── Registration Schema ───
export const registerSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters").max(100),
  employeeId: z.string().min(3, "Official Employee ID is required (e.g. MOES-MET-2026-4491)").max(50),
  email: z.string().email("Invalid official email address").transform(e => e.toLowerCase().trim()),
  phone: z.string().optional().nullable(),
  organization: z.string().min(2, "Organization name is required").default("India Meteorological Department"),
  department: z.string().min(2, "Department / Centre is required"),
  designation: z.string().min(2, "Official designation is required"),
  role: z.enum(["trainee", "trainer"], {
    errorMap: () => ({ message: "Self-registration is only permitted for Trainee or Trainer roles. Admin accounts cannot be self-registered." })
  }),
  password: passwordSchema,
  confirmPassword: z.string(),
  declarationAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the official verification and service declaration."
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// ─── Login Schema ───
export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address").transform(e => e.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["trainee", "trainer", "admin"]).optional()
});

// ─── Express Middleware Wrapper ───
export const validateBody = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (err) {
    if (err instanceof z.ZodError || (err && err.name === "ZodError")) {
      const issues = err.issues || err.errors || [];
      const messages = issues.map(e => `${(e.path || []).join(".")}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: issues[0]?.message || "Validation error",
        errors: messages
      });
    }
    return res.status(400).json({ success: false, message: err.message || "Invalid request payload" });
  }
};
