import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "db.json");

const realisticUsers = [
  {
    id: "u_admin_1",
    name: "Dr. Mrutyunjay Mohapatra",
    email: "admin@imd.gov.in",
    role: "admin",
    department: "Directorate General of Meteorology, New Delhi",
    designation: "Director General & Chief Admin",
    station: "IMD HQ Mausam Bhawan, New Delhi",
    cadreId: "MOES-ADM-2026-0001",
    phone: "+91 11 2461 1068",
    status: "approved",
    bio: "Director General of IMD and Head of capacity building initiative. 28+ years in atmospheric science.",
    qualifications: ["Ph.D. Meteorology (IIT Delhi)", "M.Sc. Physics (IIT Roorkee)"],
    skills: ["Atmospheric Dynamics", "Tropical Cyclone Warning", "Early Warning Policy", "NWP Verification"],
    interests: ["Cyclone Forecasting", "Nowcasting", "Early Warning Systems"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-10T09:00:00.000Z"
  },
  {
    id: "u_trainer_1",
    name: "Dr. Amit Sengupta",
    email: "amit.sengupta@imd.gov.in",
    role: "trainer",
    department: "Numerical Weather Prediction Division, New Delhi",
    designation: "Scientist 'F' & Senior Meteorologist",
    station: "NWFC IMD HQ, New Delhi",
    cadreId: "MOES-FAC-2026-0101",
    phone: "+91 11 2465 4321",
    specialization: ["Numerical Weather Prediction", "WRF / GFS Modeling", "Ensemble Prediction"],
    experienceYears: 18,
    qualifications: ["Ph.D. in Atmospheric Sciences (IIT Delhi)", "M.Sc. Meteorology (Pune University)"],
    skills: ["WRF Modeling", "Data Assimilation 4D-Var", "High Performance Computing", "Boundary Layer Physics"],
    status: "approved",
    bio: "Lead trainer for global and regional NWP models with 18+ years of operational weather forecasting experience.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-12T10:30:00.000Z"
  },
  {
    id: "u_trainer_2",
    name: "Dr. Sunita Kulkarni",
    email: "sunita.k@imd.gov.in",
    role: "trainer",
    department: "Radar & Satellite Meteorology Division, Pune",
    designation: "Scientist 'E' & Radar Specialist",
    station: "Central Training Institute, IMD Pune",
    cadreId: "MOES-FAC-2026-0102",
    phone: "+91 20 2553 5812",
    specialization: ["Doppler Weather Radar", "INSAT-3DR Products", "Nowcasting"],
    experienceYears: 14,
    qualifications: ["Ph.D. in Radar Remote Sensing (IISc Bangalore)", "B.Tech Electronics"],
    skills: ["Dual-Polarization Moments", "TITAN Convective Cell Tracking", "Velocity De-aliasing", "Hydrometeor Classification"],
    status: "approved",
    bio: "Expert in dual-polarization S/X band Doppler radars and convective storm nowcasting algorithms.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-14T11:00:00.000Z"
  },
  {
    id: "u_trainer_3",
    name: "Dr. Rajiv Roy",
    email: "rajiv.roy@imd.gov.in",
    role: "trainer",
    department: "Cyclone Warning Division, Regional Meteorological Centre Kolkata",
    designation: "Scientist 'E' & Marine Forecaster",
    station: "RMC Alipore, Kolkata",
    cadreId: "MOES-FAC-2026-0103",
    phone: "+91 33 2479 3124",
    specialization: ["Tropical Cyclogenesis", "Storm Surge Modeling", "Ocean Meteorology"],
    experienceYears: 12,
    qualifications: ["M.Tech Ocean Engineering (IIT Kharagpur)", "M.Sc. Physics"],
    skills: ["Dvorak Technique", "ADCIRC Surge Modeling", "RSMC Warning Protocols", "Coastal Inundation"],
    status: "approved",
    bio: "Specialized in Bay of Bengal tropical cyclone track prediction and coastal vulnerability assessment.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-15T14:20:00.000Z"
  },
  {
    id: "u_trainee_1",
    name: "Rahul Sharma",
    email: "rahul.sharma@imd.gov.in",
    role: "trainee",
    department: "Meteorological Centre, Jaipur",
    designation: "Scientist 'B' (Trainee)",
    station: "MC Jaipur, Rajasthan",
    cadreId: "MOES-MET-2026-4491",
    phone: "+91 94140 12345",
    status: "approved",
    interests: ["NWP Models", "Satellite Imagery", "Severe Weather Warnings"],
    skills: ["Python for Meteorology", "Synoptic Analysis", "QGIS", "Data Assimilation"],
    qualifications: ["M.Sc. Physics (University of Rajasthan)", "Advanced PG Diploma in Meteorology (IMD Pune)"],
    experience: ["2 years as Trainee Scientific Assistant at IMD Jaipur Field Station."],
    certificates: [
      { id: "CERT-CC-2026-101", title: "Advanced Numerical Weather Prediction (NWP)", issuer: "Capacity Connect", year: "2026", grade: "Distinction (90%)", finalScore: 90, performanceCategory: "Distinction" }
    ],
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-20T10:00:00.000Z"
  },
  {
    id: "u_trainee_2",
    name: "Priya Varma",
    email: "priya.varma@imd.gov.in",
    role: "trainee",
    department: "Cyclone Warning Centre, Visakhapatnam",
    designation: "Scientist 'B' (Probationer)",
    station: "CWC Visakhapatnam, Andhra Pradesh",
    cadreId: "MOES-MET-2026-5512",
    phone: "+91 89123 45678",
    status: "approved",
    interests: ["Cyclone Warning Systems", "Satellite Interpretation", "Marine Forecasts"],
    skills: ["Radar Data Interpretation", "Dvorak Technique", "Weather Chart Analysis"],
    qualifications: ["B.Tech Atmospheric Technology (CUSAT Cochin)"],
    experience: ["3 years in Coastal Weather Observation & Radar Monitoring."],
    certificates: [
      { id: "CERT-CC-2026-102", title: "Doppler Weather Radar (DWR) Operations", issuer: "Capacity Connect", year: "2026", grade: "Distinction (93%)", finalScore: 93, performanceCategory: "Distinction" }
    ],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-22T12:00:00.000Z"
  },
  {
    id: "u_trainee_3",
    name: "Arjun Bose",
    email: "arjun.bose@imd.gov.in",
    role: "trainee",
    department: "Regional Meteorological Centre, Kolkata",
    designation: "Scientist 'B' (Probationer)",
    station: "RMC Alipore, Kolkata",
    cadreId: "MOES-MET-2026-3382",
    phone: "+91 98301 98765",
    status: "approved",
    interests: ["Cyclone Warning Systems", "Bay of Bengal Meteorology", "Storm Surge"],
    skills: ["GIS for Disaster Management", "BHUVAN Portal", "AWS Station Maintenance"],
    qualifications: ["M.Sc. Meteorology (University of Calcutta)", "PGDM (IMD Pune 2024)"],
    experience: ["1.5 years at Alipore Met Office, cyclone watch roster duty."],
    certificates: [
      { id: "CERT-CC-2026-103", title: "Tropical Cyclone Forecasting & Storm Surge", issuer: "Capacity Connect", year: "2026", grade: "Merit (80%)", finalScore: 80, performanceCategory: "Merit" }
    ],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-24T09:30:00.000Z"
  },
  {
    id: "u_trainee_4",
    name: "Vikram Malhotra",
    email: "vikram.m@imd.gov.in",
    role: "trainee",
    department: "Regional Meteorological Centre, Chennai",
    designation: "Scientific Assistant Grade-I",
    station: "RMC Meenambakkam, Chennai",
    cadreId: "MOES-MET-2026-7821",
    phone: "+91 94440 56789",
    status: "approved",
    interests: ["Doppler Radar", "Nowcasting", "Urban Flood Warning"],
    skills: ["DWR Product Analysis", "Python Scripting", "WRF Preprocessing"],
    qualifications: ["M.Sc. Applied Physics (Anna University)", "IMD Radar Certification"],
    experience: ["2 years operating Chennai S-Band Doppler Radar."],
    certificates: [
      { id: "CERT-CC-2026-104", title: "Doppler Weather Radar (DWR) Operations", issuer: "Capacity Connect", year: "2026", grade: "Pass (70%)", finalScore: 70, performanceCategory: "Pass" }
    ],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-25T11:00:00.000Z"
  },
  {
    id: "u_trainee_5",
    name: "Sunita Deshmukh",
    email: "sunita.deshmukh@imd.gov.in",
    role: "trainee",
    department: "Agrimet Division, Pune",
    designation: "Scientist 'B'",
    station: "IMD Agrimet Centre, Pune",
    cadreId: "MOES-MET-2026-6219",
    phone: "+91 98220 11223",
    status: "approved",
    interests: ["Agrometeorology", "Crop Weather Modeling", "Climate Resilience"],
    skills: ["FASAL Advisory Systems", "MEGHDOOT Portal", "Crop Yield Forecasting"],
    qualifications: ["M.Sc. Agrometeorology (MPKV Rahuri)"],
    experience: ["2 years preparing block-level agromet bulletins."],
    certificates: [],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-26T14:15:00.000Z"
  },
  {
    id: "u_trainee_6",
    name: "Meena Reddy",
    email: "meena.reddy@imd.gov.in",
    role: "trainee",
    department: "Meteorological Centre, Hyderabad",
    designation: "Scientific Assistant Grade-I",
    station: "MC Begumpet, Hyderabad",
    cadreId: "MOES-MET-2026-9041",
    phone: "+91 98480 33445",
    status: "approved",
    interests: ["Satellite Meteorology", "INSAT Products", "Urban Flood Forecasting"],
    skills: ["Multi-Spectral RGB", "Sounder Profile Analysis", "QGIS"],
    qualifications: ["M.Sc. Geoinformatics (Osmania University)"],
    experience: ["2 years in satellite data reception and image preprocessing."],
    certificates: [
      { id: "CERT-CC-2026-106", title: "INSAT-3DR Satellite Meteorology", issuer: "Capacity Connect", year: "2026", grade: "Merit (77%)", finalScore: 77, performanceCategory: "Merit" }
    ],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-27T08:45:00.000Z"
  },
  {
    id: "u_trainee_7",
    name: "Tanvi Joshi",
    email: "tanvi.joshi@imd.gov.in",
    role: "trainee",
    department: "Meteorological Centre, Ahmedabad",
    designation: "Scientist 'B'",
    station: "MC Ahmedabad, Gujarat",
    cadreId: "MOES-MET-2026-1184",
    phone: "+91 98790 55667",
    status: "approved",
    interests: ["Heatwave Warnings", "Synoptic Meteorology", "Climate Extremes"],
    skills: ["Extreme Heat Action Planning", "Surface Chart Plotting", "Python"],
    qualifications: ["M.Sc. Physics (Gujarat University)"],
    experience: ["1 year monitoring heatwave thresholds over western India."],
    certificates: [],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-28T10:20:00.000Z"
  },
  {
    id: "u_trainee_8",
    name: "Rajesh Pillai",
    email: "rajesh.pillai@imd.gov.in",
    role: "trainee",
    department: "Meteorological Centre, Thiruvananthapuram",
    designation: "Scientist 'B'",
    station: "MC Observatory Hill, Thiruvananthapuram",
    cadreId: "MOES-MET-2026-7732",
    phone: "+91 94470 99887",
    status: "approved",
    interests: ["Southwest Monsoon Dynamics", "Heavy Rainfall Warnings", "Orography"],
    skills: ["Western Ghats Precipitation Tracking", "AWS Networking", "WRF Validation"],
    qualifications: ["M.Tech Atmospheric Science (CUSAT)"],
    experience: ["2 years tracking monsoon onset over Kerala."],
    certificates: [
      { id: "CERT-CC-2026-108", title: "Indian Summer Monsoon Dynamics", issuer: "Capacity Connect", year: "2026", grade: "Pass (63%)", finalScore: 63, performanceCategory: "Pass" }
    ],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-29T12:00:00.000Z"
  },
  {
    id: "u_trainee_pending",
    name: "Aniket Deshmukh",
    email: "aniket.d@imd.gov.in",
    role: "trainee",
    department: "Regional Meteorological Centre, Mumbai",
    designation: "Scientific Assistant Grade-II",
    station: "RMC Colaba, Mumbai",
    cadreId: "MOES-MET-2026-9921",
    phone: "+91 98200 44556",
    status: "pending",
    interests: ["Urban Flood Forecasting", "Nowcasting", "Doppler Radar"],
    skills: ["Surface Observations", "AWS Data Analysis"],
    qualifications: ["B.Sc. Physics (Mumbai University)"],
    experience: ["1 year field station maintenance."],
    certificates: [],
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-02-01T10:00:00.000Z"
  }
];

// Rich Question Bank across 5 major subject domains
const standardQuestions = [
  // --- NWP & Dynamics (crs_nwp_101) ---
  {
    id: "qb_nwp_101",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    module: "Module 1: Primitive Equations",
    question: "In operational NWP primitive equations, which vertical coordinate transformation is terrain-following?",
    options: [
      "Sigma Coordinate: σ = (p - p_top) / (p_sfc - p_top)",
      "Geometric Height z strictly above mean sea level",
      "Dry Static Energy Coordinate in the troposphere",
      "Geopotential Thickness Coordinate with fixed top"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Atmospheric Dynamics",
    explanation: "Sigma terrain-following coordinates normalize surface pressure variations, mapping complex mountain topography cleanly onto a horizontal computational plane σ = 1."
  },
  {
    id: "qb_nwp_102",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    module: "Module 1: Primitive Equations",
    question: "Why does the Arakawa C-grid staggering yield optimal gravity wave dispersion in hydrostatic atmospheric models?",
    options: [
      "It isolates mass and wind variables on opposite corners",
      "Velocity components u and v are staggered at the respective flux cell faces while mass/pressure h resides at the center",
      "It avoids solving the horizontal pressure gradient term altogether",
      "It forces velocity to zero along closed physical domain boundaries"
    ],
    correctAnswer: 1,
    marks: 3,
    type: "MCQ",
    difficulty: "Hard",
    topic: "Numerical Prediction",
    explanation: "The Arakawa C-grid evaluates divergence and pressure gradients over minimum grid distance Δx, preventing false 2Δx computational checkerboard modes."
  },
  {
    id: "qb_nwp_103",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    module: "Module 2: Boundary Layer Physics",
    question: "What numerical stability condition dictates maximum permissible time step Δt in explicit advection schemes?",
    options: [
      "Boussinesq Incompressibility Criterion",
      "Courant-Friedrichs-Lewy (CFL) Condition: C = u * Δt / Δx ≤ 1",
      "Navier-Stokes Reynolds Limit: Re ≤ 2000",
      "Planck Radiative Equilibrium Balance: F = σT^4"
    ],
    correctAnswer: 1,
    marks: 2,
    type: "MCQ",
    difficulty: "Easy",
    topic: "Numerical Prediction",
    explanation: "The CFL condition requires that the numerical domain of dependence completely contains the physical domain of dependence (C ≤ 1 for explicit stability)."
  },
  {
    id: "qb_nwp_104",
    subjectId: "sub_nwp_02",
    subjectName: "Subject 2: Data Assimilation & Radiance",
    module: "Module 1: Variational Assimilation",
    question: "In 4D-Var Data Assimilation, what is the core role of the Adjoint Model?",
    options: [
      "To extrapolate infrared satellite brightness temperatures over desert surfaces",
      "To integrate sensitivities of the cost function backwards in time to obtain gradient vectors with respect to initial state",
      "To filter high-frequency tidal oscillations in the stratosphere",
      "To perform horizontal bi-linear interpolation on irregular grids"
    ],
    correctAnswer: 1,
    marks: 4,
    type: "MCQ",
    difficulty: "Hard",
    topic: "Numerical Prediction",
    explanation: "The adjoint model integrates backward through the assimilation window, computing exact gradients of the observation misfit cost function for minimization."
  },
  {
    id: "qb_nwp_105",
    subjectId: "sub_nwp_02",
    subjectName: "Subject 2: Data Assimilation & Radiance",
    module: "Module 2: Satellite Radiance Assimilation",
    question: "Why are raw satellite radiances (Level 1B/1C) assimilated directly into NWP via RTTOV/CRTM instead of retrieved Level 2 products?",
    options: [
      "Retrieved Level 2 products contain correlated observational errors and unrepresented prior assumptions",
      "Raw radiances require zero compute power to ingest",
      "Level 2 products only work during daytime solar illumination",
      "Satellite sensors cannot measure radiance over land"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Satellite Data Assimilation",
    explanation: "Direct assimilation of radiances using Fast Radiative Transfer models (RTTOV/CRTM) avoids non-linear retrieval error correlation and ensures consistency with model physics."
  },

  // --- Radar & Polarimetry (crs_dwr_102) ---
  {
    id: "qb_dwr_101",
    subjectId: "sub_dwr_01",
    subjectName: "Subject 1: Radar Hardware & Base Products",
    module: "Module 1: Dual-Polarization Moments",
    question: "What physical hydrometeor property is directly quantified by Differential Reflectivity (ZDR = 10 * log10(Zh / Zv))?",
    options: [
      "Total water vapor column density",
      "Median shape eccentricity/oblateness of falling hydrometeors",
      "Radial Doppler velocity toward the radar transmitter",
      "Surface rainfall accumulation rate strictly in mm/hr"
    ],
    correctAnswer: 1,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Radar Interpretation",
    explanation: "Large raindrops flatten into oblate spheroids due to aerodynamic drag as they fall, causing Zh > Zv and producing positive ZDR values (e.g. +1 to +4 dB)."
  },
  {
    id: "qb_dwr_102",
    subjectId: "sub_dwr_01",
    subjectName: "Subject 1: Radar Hardware & Base Products",
    module: "Module 2: Doppler Dilemma & De-aliasing",
    question: "In pulsed Doppler radars, how are maximum unambiguous range (Rmax) and maximum unambiguous velocity (Vmax) related?",
    options: [
      "Rmax * Vmax = c * λ / 8 (Doppler Dilemma)",
      "Rmax + Vmax = constant frequency",
      "Rmax * Vmax = PRF^2",
      "Velocity is completely independent of maximum range"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Radar Interpretation",
    explanation: "The Doppler Dilemma states that increasing pulse repetition frequency (PRF) extends Vmax but simultaneously reduces unambiguous range Rmax."
  },
  {
    id: "qb_dwr_103",
    subjectId: "sub_dwr_02",
    subjectName: "Subject 2: Severe Storm Signatures",
    module: "Module 1: Convective Signatures",
    question: "Which radar signature on reflectivity and Doppler velocity indicates a high-risk supercell mesocyclone?",
    options: [
      "Stratiform bright band melting layer at 4 km AGL",
      "Hook Echo on Reflectivity paired with a cyclonic Inbound/Outbound Velocity Couplet",
      "Uniform horizontal velocity azimuth display (VAD)",
      "Zero differential phase shift KDP across all elevation scans"
    ],
    correctAnswer: 1,
    marks: 4,
    type: "MCQ",
    difficulty: "Hard",
    topic: "Radar Interpretation",
    explanation: "A hook echo wrapping around the storm rear flank downdraft alongside adjacent inbound and outbound radial velocity maxima confirms strong rotating mesocyclonic updraft."
  },
  {
    id: "qb_dwr_104",
    subjectId: "sub_dwr_02",
    subjectName: "Subject 2: Severe Storm Signatures",
    module: "Module 2: Hail Detection & Microbursts",
    question: "Which dual-pol signature uniquely separates large tumbling hailstones from torrential rain?",
    options: [
      "Very high reflectivity (>55 dBZ) paired with near-zero Differential Reflectivity (ZDR ≈ 0 dB)",
      "Negative reflectivity with high correlation coefficient",
      "Extremely positive ZDR (>5.0 dB) with zero reflectivity",
      "Infinite specific differential phase KDP"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Radar Interpretation",
    explanation: "Tumbling hailstones present no preferred orientation to the radar beam, resulting in isotropic scattering (ZDR ≈ 0 dB) despite extremely high total reflectivity (>55 dBZ)."
  },

  // --- Tropical Cyclones & Storm Surge (crs_cyc_103) ---
  {
    id: "qb_cyc_101",
    subjectId: "sub_cyc_01",
    subjectName: "Subject 1: Cyclogenesis & Dvorak Technique",
    module: "Module 1: Dvorak Satellite Classification",
    question: "In the Dvorak Enhanced Infrared (EIR) technique, what does a persistent cold Central Dense Overcast (CDO) surrounding a distinct warm eye indicate?",
    options: [
      "Rapid extratropical transition with severe dry air entrainment",
      "Strong convective core organization corresponding to a high T-Number (Severe Cyclonic Storm)",
      "Weakening depression with low level circulation center exposed",
      "Subtropical anticyclone subsidence"
    ],
    correctAnswer: 1,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Cyclone Tracking",
    explanation: "A symmetrical cold CDO surrounding a warm eye indicates vigorous eyewall convection, low central pressure, and severe cyclonic intensity (T4.0 - T6.5)."
  },
  {
    id: "qb_cyc_102",
    subjectId: "sub_cyc_01",
    subjectName: "Subject 1: Cyclogenesis & Dvorak Technique",
    module: "Module 2: Storm Surge & Coastal Risk",
    question: "Which quadrant of a northward-moving tropical cyclone in the Northern Hemisphere experiences the maximum storm surge and onshore wind forcing?",
    options: [
      "Rear left quadrant (Southwest)",
      "Right-front quadrant (Northeast)",
      "Rear right quadrant (Southeast)",
      "Left-front quadrant (Northwest)"
    ],
    correctAnswer: 1,
    marks: 2,
    type: "MCQ",
    difficulty: "Easy",
    topic: "Cyclone Tracking",
    explanation: "In the Northern Hemisphere, cyclonic rotation is counter-clockwise. The forward translation speed adds directly to rotational winds in the right-front quadrant, maximizing wind stress and storm surge."
  },
  {
    id: "qb_cyc_103",
    subjectId: "sub_cyc_02",
    subjectName: "Subject 2: Storm Surge Modeling & Coastal Impact",
    module: "Module 3: ADCIRC Storm Surge Model",
    question: "How does shallow coastal bathymetry (such as the northern Bay of Bengal shelf) amplify peak storm surge heights?",
    options: [
      "It prevents sea surface water from returning via deep gravitational undertow, piling water against the coast",
      "It suppresses surface wind stress completely",
      "It eliminates astronomical tide interaction",
      "It converts cyclonic vortex momentum into seismic waves"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Cyclone Tracking",
    explanation: "Shallow continental shelves restrict deep barotropic return flow, forcing wind-driven surface waters to pile up rapidly against the coastline."
  },

  // --- Satellite Meteorology (crs_sat_104) ---
  {
    id: "qb_sat_101",
    subjectId: "sub_sat_01",
    subjectName: "Subject 1: INSAT-3DR Imager Channels & Cloud Classification",
    module: "Module 1: 6-Channel Imager Products",
    question: "Which channel on the INSAT-3DR imager is most effective for distinguishing daytime low-level water fog from snow and ice clouds?",
    options: [
      "Shortwave Infrared (SWIR 1.6 µm)",
      "Thermal Infrared 1 (TIR-1 10.8 µm)",
      "Visible (VIS 0.65 µm)",
      "Water Vapor (WV 6.7 µm)"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Satellite Data",
    explanation: "Ice crystals absorb strongly at 1.6 µm (appearing very dark in SWIR), while liquid water droplets reflect solar SWIR strongly (appearing bright)."
  },
  {
    id: "qb_sat_102",
    subjectId: "sub_sat_02",
    subjectName: "Subject 2: Sounder Products & Derived Parameters",
    module: "Module 2: Sounder Profiles & Lifted Index",
    question: "How does the INSAT-3DR 19-channel sounder derive vertical Convective Available Potential Energy (CAPE)?",
    options: [
      "By integrating the temperature and moisture soundings from surface to equilibrium level",
      "By measuring surface radar backscatter",
      "By direct optical counting of lightning flashes",
      "By calculating ocean surface salinity gradients"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Hard",
    topic: "Satellite Data",
    explanation: "The atmospheric sounder retrieves vertical profiles of temperature T(p) and dewpoint Td(p), allowing numerical integration of buoyant parcel ascent energy (CAPE)."
  },

  // --- Monsoon Dynamics & Climate (crs_cli_106) ---
  {
    id: "qb_cli_101",
    subjectId: "sub_cli_01",
    subjectName: "Subject 1: Monsoon Dynamics & Variability",
    module: "Module 1: ISM Onset & Active-Break Cycles",
    question: "During a 'Break Monsoon' phase over India, where does the main axis of the Monsoon Trough shift?",
    options: [
      "Northward towards the foothills of the Himalayas",
      "Southward into the central Arabian Sea",
      "Eastward over the Andaman Sea",
      "Westward over the Thar Desert"
    ],
    correctAnswer: 0,
    marks: 2,
    type: "MCQ",
    difficulty: "Easy",
    topic: "Hydro Meteorology",
    explanation: "During break spells, the monsoon trough shifts to the Himalayan foothills, causing rainfall suppression over central India and intense orographic precipitation along Himalayan catchments."
  },
  {
    id: "qb_cli_102",
    subjectId: "sub_cli_01",
    subjectName: "Subject 1: Monsoon Dynamics & Variability",
    module: "Module 2: Teleconnections ENSO & IOD",
    question: "What sea surface temperature pattern defines a Positive Indian Ocean Dipole (+IOD)?",
    options: [
      "Anomalously warm SST in the western Indian Ocean and cool SST in the eastern equatorial Indian Ocean",
      "Uniform warming across the entire Bay of Bengal",
      "Cool SST near Madagascar and warm SST off Sumatra",
      "Strong negative thermocline tilt in the eastern Pacific"
    ],
    correctAnswer: 0,
    marks: 3,
    type: "MCQ",
    difficulty: "Medium",
    topic: "Hydro Meteorology",
    explanation: "A positive IOD features warmer waters near the African coast (western pole) and cooler waters near Sumatra/Indonesia, which favors enhanced Indian summer monsoon rainfall."
  }
];

// Standardized Quizzes linked to real course IDs
const standardQuizzes = [
  {
    id: "quiz_nwp_01",
    title: "#30 Atmospheric Dynamics & NWP 4D-Var Assimilation",
    courseId: "crs_nwp_101",
    courseName: "Advanced Numerical Weather Prediction (NWP) & Data Assimilation",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    trainerId: "u_trainer_1",
    trainerName: "Dr. Amit Sengupta",
    department: "Numerical Weather Prediction Division, New Delhi",
    totalMarks: 30,
    passMarks: 15,
    durationMinutes: 30,
    scheduledStartTime: "2026-02-10T10:00:00.000Z",
    deadlineTime: "2026-03-30T18:00:00.000Z",
    status: "published",
    isKioskModeRequired: true,
    resultsPublished: true,
    publishedAt: "2026-02-16T12:00:00.000Z",
    questions: [
      standardQuestions[0],
      standardQuestions[1],
      standardQuestions[2],
      standardQuestions[3],
      standardQuestions[4],
      standardQuestions[5],
      standardQuestions[6],
      standardQuestions[7],
      standardQuestions[9],
      standardQuestions[10]
    ]
  },
  {
    id: "quiz_dwr_02",
    title: "#29 Doppler Weather Radar Polarimetric Classification",
    courseId: "crs_dwr_102",
    courseName: "Doppler Weather Radar (DWR) Operational Data Interpretation & Nowcasting",
    subjectId: "sub_dwr_01",
    subjectName: "Subject 1: Radar Hardware & Base Products",
    trainerId: "u_trainer_2",
    trainerName: "Dr. Sunita Kulkarni",
    department: "Radar & Satellite Meteorology Division, Pune",
    totalMarks: 30,
    passMarks: 15,
    durationMinutes: 30,
    scheduledStartTime: "2026-02-12T11:00:00.000Z",
    deadlineTime: "2026-03-31T18:00:00.000Z",
    status: "published",
    isKioskModeRequired: true,
    resultsPublished: true,
    publishedAt: "2026-02-18T14:00:00.000Z",
    questions: [
      standardQuestions[5],
      standardQuestions[6],
      standardQuestions[7],
      standardQuestions[8],
      standardQuestions[0],
      standardQuestions[1],
      standardQuestions[9],
      standardQuestions[10],
      standardQuestions[2],
      standardQuestions[3]
    ]
  },
  {
    id: "quiz_cyc_03",
    title: "#28 Tropical Cyclone Track Prediction & RSMC Operations",
    courseId: "crs_cyc_103",
    courseName: "Tropical Cyclone Forecasting, Track Prediction & Storm Surge Modeling",
    subjectId: "sub_cyc_01",
    subjectName: "Subject 1: Tropical Cyclone Dynamics & Intensification",
    trainerId: "u_trainer_3",
    trainerName: "Dr. Rajiv Roy",
    department: "Cyclone Warning Division, Regional Meteorological Centre Kolkata",
    totalMarks: 30,
    passMarks: 15,
    durationMinutes: 30,
    scheduledStartTime: "2026-02-15T09:30:00.000Z",
    deadlineTime: "2026-03-31T18:00:00.000Z",
    status: "published",
    isKioskModeRequired: true,
    resultsPublished: true,
    publishedAt: "2026-02-22T10:00:00.000Z",
    questions: [
      standardQuestions[9],
      standardQuestions[10],
      standardQuestions[11],
      standardQuestions[5],
      standardQuestions[7],
      standardQuestions[0],
      standardQuestions[2],
      standardQuestions[3],
      standardQuestions[12],
      standardQuestions[13]
    ]
  },
  {
    id: "quiz_sat_04",
    title: "#27 INSAT-3DR Multispectral Imagery & Sounder Analysis",
    courseId: "crs_sat_104",
    courseName: "INSAT-3DR & INSAT-3DS Satellite Meteorology & Product Interpretation",
    subjectId: "sub_sat_01",
    subjectName: "Subject 1: INSAT-3DR Imager Channels & Cloud Classification",
    trainerId: "u_trainer_2",
    trainerName: "Dr. Sunita Kulkarni",
    department: "Radar & Satellite Meteorology Division, Pune",
    totalMarks: 30,
    passMarks: 15,
    durationMinutes: 30,
    scheduledStartTime: "2026-02-20T10:00:00.000Z",
    deadlineTime: "2026-04-05T18:00:00.000Z",
    status: "published",
    isKioskModeRequired: true,
    resultsPublished: true,
    publishedAt: "2026-02-28T16:00:00.000Z",
    questions: [
      standardQuestions[12],
      standardQuestions[13],
      standardQuestions[0],
      standardQuestions[4],
      standardQuestions[5],
      standardQuestions[9],
      standardQuestions[14],
      standardQuestions[15],
      standardQuestions[1],
      standardQuestions[7]
    ]
  },
  {
    id: "quiz_cli_05",
    title: "#26 Indian Summer Monsoon Dynamics & Climate Indices",
    courseId: "crs_cli_106",
    courseName: "Indian Summer Monsoon Dynamics, Climate Variability & Long-Range Forecasting",
    subjectId: "sub_cli_01",
    subjectName: "Subject 1: Monsoon Dynamics & Variability",
    trainerId: "u_trainer_1",
    trainerName: "Dr. Amit Sengupta",
    department: "Numerical Weather Prediction Division, New Delhi",
    totalMarks: 30,
    passMarks: 15,
    durationMinutes: 30,
    scheduledStartTime: "2026-02-25T11:00:00.000Z",
    deadlineTime: "2026-04-10T18:00:00.000Z",
    status: "published",
    isKioskModeRequired: true,
    resultsPublished: false,
    questions: [
      standardQuestions[14],
      standardQuestions[15],
      standardQuestions[0],
      standardQuestions[2],
      standardQuestions[9],
      standardQuestions[10],
      standardQuestions[12],
      standardQuestions[5],
      standardQuestions[1],
      standardQuestions[3]
    ]
  }
];

const makeSubmission = (quiz, trainee, answersObj, timeSec, tabSwitches = 0, resultsPub = true, fb = "", daysAgo = 10) => {
  let score = 0;
  const questionAnalysis = [];

  quiz.questions.forEach(q => {
    const chosen = answersObj[q.id];
    const isCorrect = chosen === q.correctAnswer;
    if (isCorrect) {
      score += q.marks;
    }
    questionAnalysis.push({
      questionId: q.id,
      topic: q.topic || "Operational Meteorology",
      difficulty: q.difficulty || "Medium",
      marks: q.marks,
      isCorrect,
      selectedAnswer: chosen !== undefined ? chosen : null,
      correctAnswer: q.correctAnswer
    });
  });

  const pct = Math.round((score / quiz.totalMarks) * 100);
  const passed = score >= quiz.passMarks;
  const perfCategory = pct >= 85 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Needs Improvement" : "Poor";

  return {
    id: `sub_${quiz.id}_${trainee.id}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    courseId: quiz.courseId,
    courseName: quiz.courseName,
    subject: quiz.subjectName,
    trainerName: quiz.trainerName,
    traineeId: trainee.id,
    traineeName: trainee.name,
    traineeEmail: trainee.email,
    station: trainee.station,
    cadreId: trainee.cadreId,
    department: trainee.department,
    designation: trainee.designation,
    avatar: trainee.avatar,
    answers: answersObj,
    score,
    totalMarks: quiz.totalMarks,
    percentage: pct,
    passed,
    performanceCategory: perfCategory,
    timeTakenSeconds: timeSec,
    timeTakenText: `${Math.floor(timeSec / 60)}m ${timeSec % 60}s`,
    tabSwitchCount: tabSwitches,
    resultsPublished: resultsPub,
    evaluationStatus: resultsPub ? "published" : "pending_publish",
    trainerFeedback: fb || (passed ? "Commendable operational performance." : "Requires revision of core physics derivations."),
    submittedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    certificateGenerated: passed && resultsPub,
    certificateId: passed && resultsPub ? `CERT-CC-2026-${Math.floor(1000 + Math.random() * 9000)}` : null,
    questionAnalysis
  };
};

const trainees = realisticUsers.filter(u => u.role === "trainee" && u.status === "approved");

// Answer profiles with varied scores:
// Trainee 1: 90%, Trainee 2: 93%, Trainee 3: 80%, Trainee 4: 70%, Trainee 5: 60%, Trainee 6: 77%, Trainee 7: 53%, Trainee 8: 63%
const answerProfiles = {
  u_trainee_1: {
    qb_nwp_101: 0, qb_nwp_102: 1, qb_nwp_103: 1, qb_nwp_104: 1, qb_nwp_105: 0,
    qb_dwr_101: 1, qb_dwr_102: 0, qb_dwr_103: 1, qb_dwr_104: 0,
    qb_cyc_101: 1, qb_cyc_102: 1, qb_cyc_103: 0,
    qb_sat_101: 0, qb_sat_102: 0,
    qb_cli_101: 0, qb_cli_102: 0
  },
  u_trainee_2: {
    qb_nwp_101: 0, qb_nwp_102: 1, qb_nwp_103: 1, qb_nwp_104: 1, qb_nwp_105: 0,
    qb_dwr_101: 1, qb_dwr_102: 0, qb_dwr_103: 1, qb_dwr_104: 0,
    qb_cyc_101: 1, qb_cyc_102: 1, qb_cyc_103: 0,
    qb_sat_101: 0, qb_sat_102: 0,
    qb_cli_101: 0, qb_cli_102: 0
  },
  u_trainee_3: {
    qb_nwp_101: 0, qb_nwp_102: 0, qb_nwp_103: 1, qb_nwp_104: 1, qb_nwp_105: 0,
    qb_dwr_101: 1, qb_dwr_102: 0, qb_dwr_103: 0, qb_dwr_104: 0,
    qb_cyc_101: 1, qb_cyc_102: 1, qb_cyc_103: 0,
    qb_sat_101: 0, qb_sat_102: 1,
    qb_cli_101: 0, qb_cli_102: 0
  },
  u_trainee_4: {
    qb_nwp_101: 0, qb_nwp_102: 1, qb_nwp_103: 1, qb_nwp_104: 0, qb_nwp_105: 0,
    qb_dwr_101: 1, qb_dwr_102: 2, qb_dwr_103: 1, qb_dwr_104: 0,
    qb_cyc_101: 0, qb_cyc_102: 1, qb_cyc_103: 0,
    qb_sat_101: 1, qb_sat_102: 0,
    qb_cli_101: 1, qb_cli_102: 0
  },
  u_trainee_5: {
    qb_nwp_101: 0, qb_nwp_102: 1, qb_nwp_103: 0, qb_nwp_104: 0, qb_nwp_105: 1,
    qb_dwr_101: 0, qb_dwr_102: 0, qb_dwr_103: 0, qb_dwr_104: 1,
    qb_cyc_101: 1, qb_cyc_102: 1, qb_cyc_103: 0,
    qb_sat_101: 0, qb_sat_102: 0,
    qb_cli_101: 0, qb_cli_102: 1
  },
  u_trainee_6: {
    qb_nwp_101: 0, qb_nwp_102: 1, qb_nwp_103: 1, qb_nwp_104: 1, qb_nwp_105: 2,
    qb_dwr_101: 1, qb_dwr_102: 0, qb_dwr_103: 1, qb_dwr_104: 0,
    qb_cyc_101: 1, qb_cyc_102: 0, qb_cyc_103: 0,
    qb_sat_101: 0, qb_sat_102: 0,
    qb_cli_101: 0, qb_cli_102: 0
  },
  u_trainee_7: {
    qb_nwp_101: 1, qb_nwp_102: 0, qb_nwp_103: 1, qb_nwp_104: 0, qb_nwp_105: 1,
    qb_dwr_101: 0, qb_dwr_102: 1, qb_dwr_103: 0, qb_dwr_104: 1,
    qb_cyc_101: 0, qb_cyc_102: 1, qb_cyc_103: 1,
    qb_sat_101: 1, qb_sat_102: 1,
    qb_cli_101: 0, qb_cli_102: 0
  },
  u_trainee_8: {
    qb_nwp_101: 0, qb_nwp_102: 0, qb_nwp_103: 0, qb_nwp_104: 1, qb_nwp_105: 0,
    qb_dwr_101: 0, qb_dwr_102: 0, qb_dwr_103: 1, qb_dwr_104: 0,
    qb_cyc_101: 1, qb_cyc_102: 1, qb_cyc_103: 0,
    qb_sat_101: 0, qb_sat_102: 1,
    qb_cli_101: 0, qb_cli_102: 1
  }
};

const quiz1Submissions = trainees.map((t, idx) => {
  const times = [780, 680, 840, 920, 810, 890, 950, 1020];
  const fbs = [
    "Excellent precision across vertical momentum derivations.",
    "Flawless assessment. Demonstrated mastery across 4D-Var and polarimetric radar.",
    "Very strong understanding of cyclogenesis and Dvorak analysis.",
    "Sound work in radar moments. Revisit adjoint cost gradient minimizations.",
    "Good grasp on primitive equations and boundary layer models.",
    "Proficient in satellite channels. Review Doppler dual-pol moments.",
    "Satisfactory performance. Continue regular practice on sigma coordinates.",
    "Passed successfully. Focus further on velocity de-aliasing and staggered grid physics."
  ];
  return makeSubmission(standardQuizzes[0], t, answerProfiles[t.id] || answerProfiles.u_trainee_1, times[idx % times.length], 0, true, fbs[idx % fbs.length], 30 - idx * 2);
});

const quiz2Submissions = trainees.slice(0, 7).map((t, idx) => {
  return makeSubmission(standardQuizzes[1], t, answerProfiles[t.id] || answerProfiles.u_trainee_1, 750 + idx * 40, 0, true, "Strong polarimetric classification skill.", 24 - idx * 2);
});

const quiz3Submissions = trainees.slice(0, 6).map((t, idx) => {
  return makeSubmission(standardQuizzes[2], t, answerProfiles[t.id] || answerProfiles.u_trainee_1, 800 + idx * 30, 0, true, "Good cyclone track interpretation.", 18 - idx * 2);
});

const quiz4Submissions = trainees.slice(0, 6).map((t, idx) => {
  return makeSubmission(standardQuizzes[3], t, answerProfiles[t.id] || answerProfiles.u_trainee_1, 820 + idx * 25, 0, true, "Solid interpretation of INSAT imager products.", 12 - idx * 2);
});

const quiz5Submissions = trainees.slice(0, 5).map((t, idx) => {
  return makeSubmission(standardQuizzes[4], t, answerProfiles[t.id] || answerProfiles.u_trainee_1, 790 + idx * 35, 0, false, "Pending trainer final review.", 5 - idx);
});

const allSubmissions = [
  ...quiz1Submissions,
  ...quiz2Submissions,
  ...quiz3Submissions,
  ...quiz4Submissions,
  ...quiz5Submissions
];

let existingDb = {};
try {
  existingDb = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
} catch (e) {
  existingDb = {};
}

// Enroll trainees across all courses so courses and quizzes match properly
const updatedCourses = (existingDb.courses || []).map((c, idx) => {
  let enrolled = [];
  if (c.id === "crs_nwp_101") enrolled = ["u_trainee_1", "u_trainee_2", "u_trainee_3", "u_trainee_4", "u_trainee_6", "u_trainee_8"];
  else if (c.id === "crs_dwr_102") enrolled = ["u_trainee_1", "u_trainee_2", "u_trainee_4", "u_trainee_6", "u_trainee_7"];
  else if (c.id === "crs_cyc_103") enrolled = ["u_trainee_1", "u_trainee_2", "u_trainee_3", "u_trainee_5", "u_trainee_8"];
  else if (c.id === "crs_sat_104") enrolled = ["u_trainee_1", "u_trainee_2", "u_trainee_4", "u_trainee_6", "u_trainee_7"];
  else if (c.id === "crs_cli_106") enrolled = ["u_trainee_1", "u_trainee_3", "u_trainee_5", "u_trainee_7", "u_trainee_8"];
  else if (c.id === "crs_agro_105") enrolled = ["u_trainee_1", "u_trainee_5", "u_trainee_7"];
  else enrolled = ["u_trainee_1", "u_trainee_2", "u_trainee_3"];

  return {
    ...c,
    enrolledTraineeIds: enrolled
  };
});

const finalDb = {
  ...existingDb,
  users: realisticUsers,
  questionBank: standardQuestions,
  quizzes: standardQuizzes,
  quizSubmissions: allSubmissions,
  courses: updatedCourses.length > 0 ? updatedCourses : existingDb.courses
};

fs.writeFileSync(dbPath, JSON.stringify(finalDb, null, 2), "utf-8");
console.log("✅ Seed data successfully written to db.json!");
console.log(`- Users: ${realisticUsers.length}`);
console.log(`- Questions: ${standardQuestions.length}`);
console.log(`- Quizzes: ${standardQuizzes.length}`);
console.log(`- Submissions: ${allSubmissions.length}`);
