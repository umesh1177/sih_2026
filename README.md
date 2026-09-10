# CAPACITY CONNECT — MoES / IMD Capacity Building & LMS Portal
**Problem Statement ID:** 26075 | **Theme:** Smart Education  
**Ministry / Organization:** Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)

---

## 🏛️ Executive Overview

**CAPACITY CONNECT** is an organization-aware, role-based Capacity Building and Learning Management System (LMS) specifically engineered for the **Ministry of Earth Sciences (MoES)** and the **India Meteorological Department (IMD)**. It delivers a verifiable training ecosystem for meteorological scientists, forecasters, and operational cadets across atmospheric dynamics, Doppler Weather Radar (DWR), Numerical Weather Prediction (NWP), satellite radiance data assimilation, and tropical cyclone forecasting.

---

## 🏗️ Technical Architecture

```
                                  [ React 19 + Vite + Tailwind CSS ]
                                        (Deep Navy MoES UI)
                                                 │
                                                 │ HTTP / REST API + JWT Bearer
                                                 ▼
                             [ Node.js + Express 4 Backend API ]
    ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
    │                                            │                                            │
[Authentication & RBAC]             [Course & Content Library]                  [Controlled Kiosk Exam]
• bcrypt password verification       • Modular curricula & subjects               • Server-side attempt grading
• Whitelisted self-registration      • Video/PPT/PDF materials                    • Anti-cheat tab monitoring
• Pending status governance          • Trainee progress tracking                  • Safe Trainee DTO (No leak)
    │                                            │                                            │
[Explainable Competency Engine]     [Credential Verification]                   [Accredited Certificates]
• 5-Factor weighted ranking          • Self-declared -> Verified                  • Full course completion check
• Mandatory level eligibility        • Administrative concurrence                 • Public QR verification code
    │                                            │                                            │
    └────────────────────────────────────────────┼────────────────────────────────────────────┘
                                                 │
                                     [ Prisma ORM Layer ]
                                                 │
                                    [ PostgreSQL Database ]
                                                 │
                            [ Google Gemini 1.5 Flash (Optional) ]
                               (AI-Assisted Question Drafting)
```

---

## 🔐 Role-Based Access Control (RBAC) Permission Matrix

The application strictly enforces **Three Primary Roles**: `trainee`, `trainer`, and `admin`. Admin governance supports scoped authorization (`ORGANIZATION`, `DEPARTMENT`, `CENTRE`).

| Module / Endpoint | Trainee (Cadet) | Trainer (Faculty) | Admin (Directorate) | Scope Enforced |
|:---|:---:|:---:|:---:|:---:|
| **Public Catalog & Home** | ✓ | ✓ | ✓ | Global Public |
| **Self-Registration** | ✓ (Pending) | ✓ (Pending) | ✗ (Seed Only) | Whitelisted Roles |
| **Login Verification** | ✓ (Approved) | ✓ (Approved) | ✓ (Approved) | Status Check |
| **Own Profile (`/users/me`)** | ✓ | ✓ | ✓ | JWT IDOR Safe |
| **Course Enrollment** | ✓ | ✗ | ✗ | Trainee Only |
| **Curriculum Studio & Materials** | Read Only | Manage (Assigned) | Manage (All) | Scoped |
| **Trainer Content Library** | ✗ | Manage | Manage | Trainer Own/Admin |
| **Question Bank Management** | ✗ | Full Access | Full Access | Faculty Restricted |
| **Take Kiosk Assessment** | ✓ (Safe DTO) | ✗ | ✗ | Trainee Only |
| **Grade / Publish Quiz Results** | ✗ | ✓ | ✓ | Course Owner |
| **Competency Matrix View** | ✗ | ✗ | ✓ | Admin Scoped |
| **Trainer Match Recommender** | ✗ | ✗ | ✓ | Explainable Engine |
| **Credential Verification** | ✗ | ✗ | ✓ | Admin Scoped |
| **User Approvals Queue** | ✗ | ✗ | ✓ | Department Scope |
| **Governance Audit Logs** | ✗ | ✗ | ✓ | Immutable Trail |
| **Public QR Certificate Verification**| ✓ (Public) | ✓ (Public) | ✓ (Public) | Global Public |

---

## 🧮 Explainable Competency Scoring Formula

Faculty recommendation for specialized meteorological courses is determined by an **Explainable 5-Factor Rule-Based Algorithm** operating solely on verified credentials:

$$\text{Total Match Score} = S_{\text{comp}} + S_{\text{cert}} + S_{\text{exp}} + S_{\text{perf}} + S_{\text{avail}}$$

1. **Mandatory Competency Level Check (Eligibility Gate):**  
   If $\text{Verified Level} < \text{Required Level}$, the trainer is marked `INELIGIBLE` and disqualified from lead instructor ranking.
2. **Competency Match ($S_{\text{comp}} = 40\%$ Max):**  
   $$S_{\text{comp}} = \min\left(40, \left(\frac{\text{Verified Level}}{\max(\text{Required Level}, 4)}\right) \times 40\right)$$
3. **Verified Certification Relevance ($S_{\text{cert}} = 25\%$ Max):**  
   Calculated based on accredited WMO / IMD certifications and advanced doctoral degrees.
4. **Relevant Verified Operational Experience ($S_{\text{exp}} = 20\%$ Max):**  
   Calculated strictly from verified work dates ($\approx 2.0\text{ pts/year}$, capped at $20\text{ pts}$ for $10+\text{ years}$).
5. **Past Training Feedback & Performance ($S_{\text{perf}} = 10\%$ Max):**  
   $$S_{\text{perf}} = \left(\frac{\text{Average Trainee Rating}}{5.0}\right) \times 10$$
6. **Workload Availability ($S_{\text{avail}} = 5\%$ Max):**  
   $5\text{ pts}$ awarded if active in requested training window.

---

## 🗄️ Database ER Relationship Summary (Prisma Models)

- **`Organization` (1) ── (N) `Department` (1) ── (N) `User`**
- **`User` (1) ── (1) `TrainerProfile` / `TraineeProfile`**
- **`TrainerProfile` (1) ── (N) `TrainerCompetency` ── (N) `Competency`**
- **`TrainerProfile` (1) ── (N) `Credential`** (Statuses: `SELF_DECLARED`, `PENDING`, `VERIFIED`, `REJECTED`)
- **`TrainerProfile` (1) ── (N) `WorkExperience`**
- **`Course` (1) ── (N) `Subject` (1) ── (N) `Module` (1) ── (N) `LearningMaterial`**
- **`Course` (1) ── (N) `CourseCompetencyRequirement` ── (N) `Competency`**
- **`Course` (1) ── (N) `Enrollment` ── (1) `User`**
- **`Course` (1) ── (N) `Assessment` (1) ── (N) `AssessmentQuestion` ── (1) `Question`**
- **`Assessment` (1) ── (N) `AssessmentAttempt` (1) ── (N) `AssessmentAnswer`**
- **`Course` (1) ── (N) `Certificate` (1) ── (1) `User`** (Unique Verification Code)
- **`AuditLog`** (Immutable record of approvals, role changes, and certificate issuances)

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=moes_imd_capacity_connect_sih2026_jwt_secret_key_9823748291
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/capacity_connect_db?schema=public"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
ENABLE_DEMO_ACCOUNTS=true
GEMINI_API_KEY="" # Optional for AI-assisted question drafting
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL="http://localhost:5000/api"
VITE_ENABLE_DEMO_ACCOUNTS="true"
```

---

## 🚀 Installation, Seed & Execution Guide

### Prerequisites
- Node.js v20+ / v22+
- npm v10+

### 1. Backend Setup & Run
```bash
cd backend
npm install
node src/server.js
```
*The backend automatically initializes and synchronizes the verified dataset upon startup.*

### 2. Run Comprehensive Automated Test Suite
```bash
cd backend
node src/scripts/testEndpoints.js
```

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 SIH Prototype Demonstration Accounts

All predefined demo accounts use the standard password: **`Password@123`**

| Role | Officer Name | Official Email | Scope / Department |
|:---|:---|:---|:---|
| **Administrator** | Dr. R. K. Bhattacharya | `admin@imd.gov.in` | Organization-Wide (DG Admin) |
| **Senior Trainer** | Dr. Amit Sengupta | `amit.sengupta@imd.gov.in` | NWP & Atmospheric Dynamics |
| **Senior Trainer** | Dr. Sunita Rao | `sunita.rao@imd.gov.in` | Radar & Satellite Meteorology |
| **Trainee Cadet** | Cadet Rahul Sharma | `rahul.sharma@imd.gov.in` | NWP Operational Cadet |
| **Trainee Cadet** | Cadet Priya Nair | `priya.nair@imd.gov.in` | Cyclone Warning & Marine |
| **Pending Applicant** | Aniket Deshmukh | `aniket.d@imd.gov.in` | Agrometeorology (Pending Verification) |

---

## 🛡️ Production Recommendations
1. Deploy PostgreSQL on managed cloud instances (e.g. AWS RDS / Google Cloud SQL) and execute `npx prisma migrate deploy`.
2. Configure HTTP-only, `Secure`, `SameSite=Strict` cookies over TLS/HTTPS for web browser JWT sessions.
3. Integrate S3 / Cloudinary for document evidence and video masterclasses storage.
