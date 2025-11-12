CREATE TABLE IF NOT EXISTS "mockInterview" (
	"id" serial PRIMARY KEY NOT NULL,
	"jsonMockResp" text NOT NULL,
	"jobPosition" varchar NOT NULL,
	"jobDescription" varchar NOT NULL,
	"jobExperience" varchar NOT NULL,
	"favourite" boolean DEFAULT false NOT NULL,
	"createdBy" varchar NOT NULL,
	"createdAt" varchar,
	"mockId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resume_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"resume_text" text NOT NULL,
	"skills" text,
	"experience" text,
	"education" text,
	"projects" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"is_first_login" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userAnswer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mockId" varchar NOT NULL,
	"question" varchar NOT NULL,
	"correctAns" text,
	"userAns" text,
	"feedback" text,
	"rating" varchar,
	"userEmail" varchar,
	"createdAt" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userDetails" (
	"id" serial PRIMARY KEY NOT NULL,
	"userEmail" varchar NOT NULL,
	"credits" integer DEFAULT 6 NOT NULL,
	"creditsUsed" integer DEFAULT 0 NOT NULL,
	"totalAmountSpent" integer DEFAULT 0 NOT NULL,
	"paymentSecretKey" varchar,
	"createdAt" varchar,
	CONSTRAINT "userDetails_userEmail_unique" UNIQUE("userEmail")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "resume_data" ADD CONSTRAINT "resume_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
