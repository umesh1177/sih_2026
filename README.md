# 🏛️ CAPACITY CONNECT: Digital Capacity Building & LMS Portal
**Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)**  
**Smart India Hackathon (SIH) — Problem Statement ID: 26075**  
**Theme**: Smart Education | **Category**: Software  

---

## 🚀 Overview

**CAPACITY CONNECT** is a centralized, digital learning management and competency development portal developed for the **India Meteorological Department (IMD)** under the **Ministry of Earth Sciences (MoES)**.

The system addresses organizational training needs across 36 regional meteorological centres, incorporating:
- **Strict Role-Based Access Control (RBAC)**: Trainees (Scientist 'B', Forecasters), Senior Trainers, and Directorate Administrators.
- **Kiosk Mode Assessment Suite**: Timed, proctored fullscreen examination engine with live countdown clocks, question palette navigation, anti-cheat tab-blur monitors, and auto-submission.
- **AI-Powered Meteorological Question Generator**: Synthesizes atmospheric physics, radar moments, numerical weather prediction (NWP), and tropical cyclone analysis questions.
- **1-Click Result & Multi-Chart Analytics**: Class average, pass rates, score distribution histograms, question difficulty accuracy, and trainee rank leaderboards with CSV export.
- **Institutional Competency Mapping Matrix**: Matches trainer specializations to course subjects and suggests optimal faculty.
- **Cryptographic MoES Capacity Certificates**: Dynamic official certificates with gold seal and QR codes.

---

## 👥 Demo Fast-Switch Test Accounts

| Role | Name | Email | Designation / Division | Status |
|------|------|-------|------------------------|--------|
| **Trainer** | Dr. Amit Sengupta | `amit.sengupta@imd.gov.in` | Scientist 'F' & Senior Meteorologist (NWP) | Verified / Approved |
| **Trainee** | Rahul Sharma | `rahul.sharma@imd.gov.in` | Scientist 'B' (Trainee) | Verified / Approved |
| **Trainee (Pending)** | Aniket Deshmukh | `aniket.d@imd.gov.in` | Scientific Assistant Grade-II (RMC Mumbai) | Pending Admin Verification |
| **Admin** | Dr. Mrutyunjay Mohapatra | `admin@imd.gov.in` | Director General of Meteorology | Verified / Approved |

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS, PostCSS, Lucide Icons, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express.js, CORS, RESTful API architecture.
- **Theme**: Deep Navy (`#0a2558`) and MoES Blue government executive design system.

---

## ⚡ Quick Start & Run Locally

### 1. Start Backend API Server
```bash
cd backend
npm install
node src/server.js
```
*Backend runs on `http://localhost:5000`*

### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Generate Project ZIP Package
```bash
npm run zip
```
*Creates `CapacityConnect_MoES_IMD_SIH26075.zip` in root workspace.*

---

## 📸 Key Workflows & Features

1. **Question Bank (Exact UI)**: Search, Subject filtering, Type badges (MCQ / Descriptive / One Word), Labels (Difficulty & Module), and 3-dots action menu (Preview, Edit, Duplicate, Delete).
2. **Kiosk Exam Mode (Exact UI)**: Full-screen timer, 2-column layout with Question Navigator boxes (Answered, Not Answered, Marked For Review, Not Visited), anti-cheat tracker, Prev/Next, and Submit.
3. **AI Question Generator**: Generate tailored questions for NWP, Doppler Radar, Cyclone tracking, and Satellite Meteorology.
4. **1-Click Analytics**: Trainer views histograms, accuracy, and exportable leaderboards.
5. **Admin Competency Mapping**: Intelligent match percentage for trainers and direct allocation.
