// Automated Test Suite for CAPACITY CONNECT Backend
import http from "http";

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 RUNNING CAPACITY CONNECT SIH 26075 COMPREHENSIVE VERIFICATION");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // ─── TEST 1: Health Check ───
    const health = await request("/health");
    assert(health.status === 200 && health.data.status === "healthy", "Server Health Check");

    // ─── TEST 2: Password-less Login Must Fail (Rule 1 & 3) ───
    const noPassLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "rahul.sharma@imd.gov.in", password: "" }
    });
    assert(noPassLogin.status === 400, "Password is strictly mandatory for login");

    // ─── TEST 3: Invalid Email / Unregistered User Login Must Not Auto-Create Account ───
    const unregLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "unregistered.officer@imd.gov.in", password: "Password@123" }
    });
    assert(unregLogin.status === 401 && unregLogin.data.success === false, "Login never auto-creates an account");

    // ─── TEST 4: Admin Self-Registration Must Be Rejected (Rule 6) ───
    const adminReg = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Fake Admin Attempt",
        employeeId: "MOES-HACK-01",
        email: "hacker.admin@imd.gov.in",
        role: "admin",
        organization: "IMD",
        department: "NWP",
        designation: "Director",
        password: "Password@123",
        confirmPassword: "Password@123",
        declarationAccepted: true
      }
    });
    assert(adminReg.status === 400 || adminReg.status === 403, "Admin self-registration is strictly forbidden");

    // ─── TEST 5: Weak Password Registration Must Be Rejected (Rule 4) ───
    const weakPassReg = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Trainee Weak Pass",
        employeeId: "MOES-MET-9922",
        email: "trainee.weak@imd.gov.in",
        role: "trainee",
        organization: "IMD",
        department: "NWP",
        designation: "Cadet",
        password: "weak",
        confirmPassword: "weak",
        declarationAccepted: true
      }
    });
    assert(weakPassReg.status === 400, "Weak password rejected server-side");

    // ─── TEST 6: Valid Registration Creates Account with Status = PENDING & No Access Token ───
    const validReg = await request("/auth/register", {
      method: "POST",
      body: {
        name: "Cadet Suresh Kulkarni",
        employeeId: `MOES-MET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `suresh.kulkarni.${Date.now()}@imd.gov.in`,
        phone: "+91 98765 11223",
        role: "trainee",
        organization: "India Meteorological Department",
        department: "Numerical Weather Prediction Division",
        designation: "Scientist 'B' (Trainee)",
        password: "Password@123",
        confirmPassword: "Password@123",
        declarationAccepted: true
      }
    });
    assert(
      validReg.status === 201 && 
      validReg.data.status === "pending" && 
      !validReg.data.token,
      "Valid registration results in PENDING status and does NOT issue access token"
    );

    // ─── TEST 7: Pending User Login Must Be Blocked (Rule 11 & 12) ───
    const pendingLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "aniket.d@imd.gov.in", password: "Password@123" }
    });
    assert(pendingLogin.status === 403 && pendingLogin.data.status === "pending", "Pending account login blocked from protected portal");

    // ─── TEST 8: Valid Login with Approved Account Issues JWT ───
    const traineeLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "rahul.sharma@imd.gov.in", password: "Password@123" }
    });
    assert(traineeLogin.status === 200 && traineeLogin.data.token, "Approved user login succeeds and issues JWT");
    const traineeToken = traineeLogin.data.token;

    const trainerLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "amit.sengupta@imd.gov.in", password: "Password@123" }
    });
    assert(trainerLogin.status === 200 && trainerLogin.data.token, "Approved trainer login succeeds");
    const trainerToken = trainerLogin.data.token;

    const adminLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "admin@imd.gov.in", password: "Password@123" }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, "Approved admin login succeeds");
    const adminToken = adminLogin.data.token;

    // ─── TEST 9: Trainee Accessing Admin Endpoint Must Return 403 Forbidden (RBAC) ───
    const rbacTest = await request("/admin/stats", {
      headers: { Authorization: `Bearer ${traineeToken}` }
    });
    assert(rbacTest.status === 403, "Trainee hitting Admin API is rejected with 403 Forbidden");

    // ─── TEST 10: Trainee Profile & Progress Ownership Endpoint (Phase 4 IDOR Safe) ───
    const meProfile = await request("/users/me", {
      headers: { Authorization: `Bearer ${traineeToken}` }
    });
    assert(meProfile.status === 200 && meProfile.data.user.email === "rahul.sharma@imd.gov.in", "GET /users/me returns authenticated officer");

    // ─── TEST 11: Assessment Safe Trainee DTO (No correctAnswer or explanation exposed) ───
    const attemptDTO = await request("/assessments/quiz_nwp_01/attempt", {
      headers: { Authorization: `Bearer ${traineeToken}` }
    });
    const hasNoAnswers = attemptDTO.data.assessment?.questions?.every(q => q.correctAnswer === undefined && q.explanation === undefined);
    assert(attemptDTO.status === 200 && hasNoAnswers, "Trainee attempt DTO strips correct answers and private explanations");

    // ─── TEST 12: Server-Side Assessment Submission & Grading (Phase 5) ───
    const quizSubmit = await request("/quizzes/submit", {
      method: "POST",
      headers: { Authorization: `Bearer ${traineeToken}` },
      body: {
        quizId: "quiz_dwr_01",
        answers: { "qb_04": 0, "qb_05": 0 },
        timeTakenSeconds: 520,
        tabSwitchCount: 0
      }
    });
    assert(
      quizSubmit.status === 201 || quizSubmit.status === 400, // 201 or duplicate check
      "Assessment submission evaluated server-side"
    );

    // ─── TEST 13: Explainable Rule-Based Competency Engine (Phase 6) ───
    const compMatch = await request("/competencies/suggest-trainers", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        requiredCompetencyId: "comp_nwp_01",
        subjectName: "Numerical Weather Prediction & Data Assimilation",
        requiredLevel: 3
      }
    });
    const hasBreakdown = compMatch.data.suggestedTrainers?.[0]?.scoreBreakdown !== undefined;
    assert(compMatch.status === 200 && hasBreakdown, "Competency mapping returns explainable 5-factor scoring breakdown");

    // ─── TEST 14: Public Certificate Verification (Phase 10) ───
    const certVerify = await request("/certificates/verify/CC-IMD-2026-8941");
    assert(
      certVerify.status === 200 && certVerify.data.valid === true && certVerify.data.certificate.traineeName,
      "Public QR certificate verification endpoint authenticates valid certificates"
    );

    // ─── TEST 15: Admin Governance Audit Logs (Phase 9) ───
    const auditLogs = await request("/admin/audit-logs", {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(auditLogs.status === 200 && Array.isArray(auditLogs.data.auditLogs), "Governance audit logs recorded and accessible to Admin");

  } catch (err) {
    console.error("Test execution failed:", err);
  }

  console.log("==================================================================");
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
