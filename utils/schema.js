import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const User = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isFirstLogin: integer("is_first_login", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const ResumeData = sqliteTable("resume_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => User.id).notNull(),
  resumeText: text("resume_text").notNull(),
  skills: text("skills"),
  experience: text("experience"),
  education: text("education"),
  projects: text("projects"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const MOCKInterview = sqliteTable("mockInterview", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: text("jobPosition").notNull(),
  jobDescription: text("jobDescription").notNull(),
  jobExperience: text("jobExperience").notNull(),
  favourite: integer("favourite", { mode: "boolean" }).default(false).notNull(),
  createdBy: text("createdBy").notNull(),
  createdAt: text("createdAt"),
  mockId: text("mockId").notNull(),
});

export const UserAnswer = sqliteTable("userAnswer", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mockIdRef: text("mockId").notNull(),
  question: text("question").notNull(),
  correctAns: text("correctAns"),
  userAns: text("userAns"),
  feedback: text("feedback"),
  rating: text("rating"),
  useEmail: text("userEmail"),
  createdAt: text("createdAt"),
  // Multi-agent feedback fields
  hiringManagerScore: integer("hiring_manager_score"),
  technicalRecruiterScore: integer("technical_recruiter_score"),
  panelLeadScore: integer("panel_lead_score"),
  hiringManagerFeedback: text("hiring_manager_feedback"),
  technicalRecruiterFeedback: text("technical_recruiter_feedback"),
  panelLeadFeedback: text("panel_lead_feedback"),
  overallScore: integer("overall_score"),
  // Round-based fields
  roundNumber: integer("round_number").default(1),
  agentType: text("agent_type"), // 'hiring_manager', 'technical_recruiter', 'panel_lead'
});

export const RoundReport = sqliteTable("roundReports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mockId: text("mockId").notNull(),
  roundNumber: integer("round_number").notNull(),
  agentType: text("agent_type").notNull(), // 'hiring_manager', 'technical_recruiter', 'panel_lead'
  averageScore: integer("average_score").notNull(),
  summaryReport: text("summary_report").notNull(),
  recommendation: text("recommendation").notNull(), // 'proceed', 'needs_improvement', 'reject'
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  createdAt: text("createdAt").notNull(),
});

export const FinalInterviewReport = sqliteTable("finalInterviewReport", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mockId: text("mockId").notNull(),
  userEmail: text("userEmail").notNull(),
  round1Score: integer("round1_score"),
  round2Score: integer("round2_score"),
  round3Score: integer("round3_score"),
  overallScore: integer("overall_score").notNull(),
  hiringDecision: text("hiring_decision").notNull(), // 'hire', 'needs_improvement', 'reject'
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  improvementRoadmap: text("improvement_roadmap"),
  createdAt: text("createdAt").notNull(),
});

export const UserDetails = sqliteTable("userDetails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("userEmail").unique().notNull(),
  credits: integer("credits").default(6).notNull(),
  creditsUsed: integer("creditsUsed").default(0).notNull(),
  totalAmountSpent: integer("totalAmountSpent").default(0).notNull(),
  paymentSecretKey: text("paymentSecretKey"),
  createdAt: text("createdAt"),
});
