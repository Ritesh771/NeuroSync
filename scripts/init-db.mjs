import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, "..", "neurosync.db");
const db = new Database(dbPath);

console.log("Creating SQLite database at:", dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_first_login INTEGER DEFAULT 1 NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS resume_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    resume_text TEXT NOT NULL,
    skills TEXT,
    experience TEXT,
    education TEXT,
    projects TEXT,
    uploaded_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS mockInterview (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jsonMockResp TEXT NOT NULL,
    jobPosition TEXT NOT NULL,
    jobDescription TEXT NOT NULL,
    jobExperience TEXT NOT NULL,
    favourite INTEGER DEFAULT 0 NOT NULL,
    createdBy TEXT NOT NULL,
    createdAt TEXT,
    mockId TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS userAnswer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mockId TEXT NOT NULL,
    question TEXT NOT NULL,
    correctAns TEXT,
    userAns TEXT,
    feedback TEXT,
    rating TEXT,
    userEmail TEXT,
    createdAt TEXT,
    hiring_manager_score INTEGER,
    technical_recruiter_score INTEGER,
    panel_lead_score INTEGER,
    hiring_manager_feedback TEXT,
    technical_recruiter_feedback TEXT,
    panel_lead_feedback TEXT,
    overall_score INTEGER
  );

  CREATE TABLE IF NOT EXISTS userDetails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userEmail TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 6 NOT NULL,
    creditsUsed INTEGER DEFAULT 0 NOT NULL,
    totalAmountSpent INTEGER DEFAULT 0 NOT NULL,
    paymentSecretKey TEXT,
    createdAt TEXT
  );
`);

console.log("✅ Database tables created successfully!");
db.close();
