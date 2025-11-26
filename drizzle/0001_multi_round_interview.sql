-- Add round-based columns to userAnswer table
ALTER TABLE userAnswer ADD COLUMN round_number INTEGER DEFAULT 1;
ALTER TABLE userAnswer ADD COLUMN agent_type TEXT;

-- Create roundReports table
CREATE TABLE IF NOT EXISTS roundReports (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"mockId" TEXT NOT NULL,
	"round_number" INTEGER NOT NULL,
	"agent_type" TEXT NOT NULL,
	"average_score" INTEGER NOT NULL,
	"summary_report" TEXT NOT NULL,
	"recommendation" TEXT NOT NULL,
	"strengths" TEXT,
	"weaknesses" TEXT,
	"createdAt" TEXT NOT NULL
);

-- Create finalInterviewReport table
CREATE TABLE IF NOT EXISTS finalInterviewReport (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"mockId" TEXT NOT NULL,
	"userEmail" TEXT NOT NULL,
	"round1_score" INTEGER,
	"round2_score" INTEGER,
	"round3_score" INTEGER,
	"overall_score" INTEGER NOT NULL,
	"hiring_decision" TEXT NOT NULL,
	"strengths" TEXT,
	"weaknesses" TEXT,
	"improvement_roadmap" TEXT,
	"createdAt" TEXT NOT NULL
);