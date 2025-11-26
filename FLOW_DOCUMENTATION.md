# 🧠 NeuroSync - Complete Software Flow Documentation

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [User Journey Flow](#user-journey-flow)
4. [Feature Workflows](#feature-workflows)
5. [API Endpoints](#api-endpoints)
6. [Setup Instructions](#setup-instructions)

---

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes (Server Actions)
- **Database**: SQLite (better-sqlite3 + Drizzle ORM)
- **AI**: Google Gemini API (for question generation & evaluation)
- **Code Editor**: Monaco Editor + SuperViz (real-time collaboration)
- **Video**: SuperViz Video Conferencing
- **Authentication**: Session-based with cookies

### Project Structure
```
NeuroSync/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/         # Login page
│   │   └── sign-up/         # Registration page
│   ├── dashboard/
│   │   ├── page.jsx         # Main dashboard
│   │   ├── analytics/       # Performance analytics
│   │   ├── interview/       # Interview sessions
│   │   └── _components/     # Shared components
│   ├── resume-upload/       # Resume upload page
│   ├── code-editor/         # Live code editor
│   └── api/
│       ├── auth/            # Authentication endpoints
│       ├── resume/          # Resume processing
│       ├── analytics/       # Analytics data
│       └── interviews/      # Interview management
├── components/
│   ├── codeplatform/        # Code editor components
│   └── ui/                  # Shared UI components
├── utils/
│   ├── db.js                # SQLite database connection
│   ├── schema.js            # Database schema
│   └── codeplatform/        # Code editor utilities
├── neurosync.db             # SQLite database file
└── scripts/
    └── init-db.mjs          # Database initialization
```

---

## 🗄️ Database Schema

### Tables

#### 1. **users**
Stores user authentication and profile data.
```sql
- id (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- email (TEXT, UNIQUE, NOT NULL)
- password_hash (TEXT, NOT NULL)
- first_name (TEXT, NOT NULL)
- last_name (TEXT, NOT NULL)
- is_first_login (INTEGER/BOOLEAN, DEFAULT 1)
- created_at (INTEGER/TIMESTAMP)
```

#### 2. **resume_data**
Stores extracted resume information.
```sql
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY → users.id)
- resume_text (TEXT, full resume text)
- skills (TEXT, JSON array of skills)
- experience (TEXT, work experience)
- education (TEXT, educational background)
- projects (TEXT, project descriptions)
- uploaded_at (INTEGER/TIMESTAMP)
```

#### 3. **mockInterview**
Stores interview session metadata.
```sql
- id (INTEGER, PRIMARY KEY)
- jsonMockResp (TEXT, JSON array of questions)
- jobPosition (TEXT)
- jobDescription (TEXT)
- jobExperience (TEXT)
- favourite (INTEGER/BOOLEAN, DEFAULT 0)
- createdBy (TEXT, user email)
- createdAt (TEXT)
- mockId (TEXT, unique interview ID)
```

#### 4. **userAnswer**
Stores interview responses with multi-agent evaluation.
```sql
- id (INTEGER, PRIMARY KEY)
- mockId (TEXT, references mockInterview)
- question (TEXT)
- correctAns (TEXT, expected answer)
- userAns (TEXT, user's answer)
- feedback (TEXT, overall feedback)
- rating (TEXT, overall rating)
- userEmail (TEXT)
- createdAt (TEXT)
# Multi-Agent Scores:
- hiring_manager_score (INTEGER, 0-100)
- technical_recruiter_score (INTEGER, 0-100)
- panel_lead_score (INTEGER, 0-100)
- hiring_manager_feedback (TEXT)
- technical_recruiter_feedback (TEXT)
- panel_lead_feedback (TEXT)
- overall_score (INTEGER, average of 3 scores)
```

#### 5. **userDetails**
Stores user credits and payment information.
```sql
- id (INTEGER, PRIMARY KEY)
- userEmail (TEXT, UNIQUE)
- credits (INTEGER, DEFAULT 6)
- creditsUsed (INTEGER, DEFAULT 0)
- totalAmountSpent (INTEGER, DEFAULT 0)
- paymentSecretKey (TEXT)
- createdAt (TEXT)
```

---

## 🚀 User Journey Flow

### Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    1. LANDING PAGE                          │
│                    (localhost:3000)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   New User?                   │
         │   Yes → Sign Up               │
         │   No  → Sign In               │
         └───────────┬───────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              2. AUTHENTICATION                              │
│  • Sign Up: Create account with email/password             │
│  • Sign In: Login with credentials                         │
│  • Session created (cookie stored)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   First Login?                │
         │   (is_first_login = true)     │
         └───────────┬───────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    YES (New User)          NO (Returning)
         │                       │
         ▼                       │
┌─────────────────────┐          │
│  3. RESUME UPLOAD   │          │
│  (/resume-upload)   │          │
│                     │          │
│  • Upload PDF/DOCX  │          │
│  • Extract text     │          │
│  • Parse data:      │          │
│    - Skills         │          │
│    - Experience     │          │
│    - Education      │          │
│    - Projects       │          │
│  • Save to DB       │          │
│  • Set first_login  │          │
│    = false          │          │
└──────────┬──────────┘          │
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  4. DASHBOARD                               │
│              (/dashboard)                                   │
│                                                             │
│  Navigation:                                                │
│  • Dashboard (Home)                                         │
│  • Favourites                                               │
│  • Analytics                                                │
│  • Code Editor                                              │
│                                                             │
│  Actions:                                                   │
│  • View past interviews                                     │
│  • Create new interview                                     │
│  • View analytics                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            5. CREATE NEW INTERVIEW                          │
│                                                             │
│  User Input:                                                │
│  • Job Position (e.g., "Full Stack Developer")             │
│  • Job Description (e.g., "React, Node.js, MongoDB")       │
│  • Years of Experience (e.g., "3")                         │
│                                                             │
│  System Process:                                            │
│  1. Fetch user's resume data from DB                       │
│  2. Build personalized prompt:                             │
│     - Technical questions from skills                      │
│     - Problem-solving from projects                        │
│     - Behavioral from experience                           │
│  3. Generate 5 questions (mock or AI)                      │
│  4. Save interview to mockInterview table                  │
│  5. Redirect to interview page                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              6. INTERVIEW SESSION                           │
│        (/dashboard/interview/[id]/start)                    │
│                                                             │
│  For each question:                                         │
│  1. Display question                                        │
│  2. User answers (voice/text)                              │
│  3. Multi-Agent Evaluation:                                │
│                                                             │
│     ┌─────────────────────────────────────┐                │
│     │  👨‍💼 Hiring Manager Agent           │                │
│     │  Evaluates: Problem-Solving         │                │
│     │  Score: 0-100                       │                │
│     │  Feedback: Analytical thinking      │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│     ┌─────────────────────────────────────┐                │
│     │  👩‍💻 Technical Recruiter Agent      │                │
│     │  Evaluates: Technical Accuracy      │                │
│     │  Score: 0-100                       │                │
│     │  Feedback: Technical depth          │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│     ┌─────────────────────────────────────┐                │
│     │  🧑‍🏫 Panel Lead Agent               │                │
│     │  Evaluates: Communication           │                │
│     │  Score: 0-100                       │                │
│     │  Feedback: Clarity & structure      │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│  4. Calculate overall score (average)                      │
│  5. Save to userAnswer table                               │
│  6. Show feedback to user                                  │
│  7. Next question                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              7. INTERVIEW FEEDBACK                          │
│      (/dashboard/interview/[id]/feedback)                   │
│                                                             │
│  Display:                                                   │
│  • Overall score (average of 3 agents)                     │
│  • Individual scores per question                          │
│  • Detailed feedback from each agent                       │
│  • Strengths & weaknesses                                  │
│  • Comparison with expected answers                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              8. ANALYTICS DASHBOARD                         │
│            (/dashboard/analytics)                           │
│                                                             │
│  Metrics:                                                   │
│  • Total interviews completed                              │
│  • Average overall score                                   │
│  • Average problem-solving score                           │
│  • Average technical accuracy score                        │
│  • Average communication score                             │
│                                                             │
│  Visualizations:                                            │
│  • Progress bars for each metric                           │
│  • Interview history cards                                 │
│  • Strengths & weaknesses analysis                         │
│  • Performance trends over time                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   User Actions:               │
         │   • Retake interview          │
         │   • Try different role        │
         │   • Practice coding           │
         │   • View history              │
         └───────────────────────────────┘
```

---

## 🔄 Feature Workflows

### Workflow 1: Resume-Based Question Generation

```
1. User clicks "Add New Interview"
   ↓
2. User fills form:
   - Job Position
   - Job Description
   - Years of Experience
   ↓
3. System fetches resume data:
   GET /api/resume/data?email=user@example.com
   ↓
4. System builds personalized prompt:
   IF resume exists:
     - Include skills from resume
     - Include projects from resume
     - Include experience from resume
     - Request technical questions based on skills
     - Request problem-solving based on projects
     - Request behavioral based on experience
   ELSE:
     - Generate generic questions
   ↓
5. Generate questions (mock or AI)
   ↓
6. Save to mockInterview table
   ↓
7. Redirect to /dashboard/interview/[mockId]
```

### Workflow 2: Multi-Agent Interview Evaluation

```
1. User answers question (voice/text)
   ↓
2. System receives answer
   ↓
3. Parallel evaluation by 3 agents:

   Agent 1: Hiring Manager
   - Prompt: Evaluate problem-solving
   - Input: Question + Expected Answer + User Answer
   - Output: Score (0-100) + Feedback
   
   Agent 2: Technical Recruiter
   - Prompt: Evaluate technical accuracy
   - Input: Question + Expected Answer + User Answer
   - Output: Score (0-100) + Feedback
   
   Agent 3: Panel Lead
   - Prompt: Evaluate communication
   - Input: Question + Expected Answer + User Answer
   - Output: Score (0-100) + Feedback
   ↓
4. Calculate overall score:
   overall = (agent1 + agent2 + agent3) / 3
   ↓
5. Save to userAnswer table:
   - All 3 individual scores
   - All 3 feedbacks
   - Overall score
   - User answer
   - Question
   ↓
6. Display feedback to user
   ↓
7. Move to next question
```

### Workflow 3: Analytics Calculation

```
1. User visits /dashboard/analytics
   ↓
2. System fetches data:
   GET /api/analytics?email=user@example.com
   ↓
3. Backend queries:
   - All mockInterview records for user
   - All userAnswer records for user
   ↓
4. For each interview:
   - Get all answers for that interview
   - Calculate average scores:
     * Avg problem-solving (hiring_manager_score)
     * Avg technical (technical_recruiter_score)
     * Avg communication (panel_lead_score)
     * Avg overall (overall_score)
   ↓
5. Calculate global statistics:
   - Total interviews
   - Overall avg problem-solving
   - Overall avg technical
   - Overall avg communication
   - Overall avg score
   ↓
6. Determine strengths & weaknesses:
   IF communication >= 75: Strength
   IF technical < 70: Needs improvement
   etc.
   ↓
7. Return JSON to frontend
   ↓
8. Frontend renders:
   - Stat cards
   - Progress bars
   - Interview history
   - Strengths/weaknesses
```

---

## 🔌 API Endpoints

### Authentication
- **POST** `/api/auth/sign-up` - Create new user
- **POST** `/api/auth/sign-in` - Login user
- **GET** `/api/auth/validate-session` - Validate session

### Resume
- **POST** `/api/resume/upload` - Upload & extract resume
- **GET** `/api/resume/data?email=` - Get resume data

### Interviews
- **GET** `/api/interviews?email=` - Get user's interviews
- **GET** `/api/interview-details?mockId=` - Get interview details

### Feedback
- **POST** `/api/feedback` - Save interview answer

### Analytics
- **GET** `/api/analytics?email=` - Get analytics data

### User Info
- **GET** `/api/user-info?email=` - Get user details

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
node scripts/init-db.mjs
```
This creates `neurosync.db` with all required tables.

### 3. Configure Environment
Create `.env.local`:
```env
NODE_ENV=development
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT=5
NEXT_PUBLIC_SUPERVIZ_DEVELOPER_KEY=your_superviz_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Test the Flow

**Step 1: Sign Up**
- Go to `/sign-up`
- Create account with email/password

**Step 2: Upload Resume**
- Automatically redirected to `/resume-upload`
- Upload PDF or DOCX file
- System extracts skills, experience, projects

**Step 3: Create Interview**
- Go to `/dashboard`
- Click "Add New"
- Fill job details
- System generates personalized questions

**Step 4: Take Interview**
- Answer questions (type or speak)
- Get multi-agent evaluation
- See scores and feedback

**Step 5: View Analytics**
- Go to `/dashboard/analytics`
- See performance metrics
- Track improvement

**Step 6: Code Practice**
- Go to `/code-editor`
- Practice coding with live collaboration

---

## 🎯 Key Features Summary

1. ✅ **SQLite Database** - No external DB needed
2. ✅ **Resume-Based Questions** - Personalized to your background
3. ✅ **Multi-Agent Evaluation** - 3 AI agents score each answer
4. ✅ **Analytics Dashboard** - Track performance over time
5. ✅ **Live Code Editor** - Practice with real-time collaboration
6. ✅ **Unlimited Interviews** - No credit system
7. ✅ **Session Management** - Secure authentication
8. ✅ **First-Time Flow** - Guided onboarding

---

## 📊 Data Flow Example

**Example: User takes an interview**

1. **Input**: User answers "What is React?"
2. **Processing**:
   - Hiring Manager: "Good problem-solving" → 85/100
   - Tech Recruiter: "Accurate definition" → 90/100
   - Panel Lead: "Clear explanation" → 88/100
3. **Calculation**: Overall = (85 + 90 + 88) / 3 = 87.67 ≈ 88
4. **Storage** (userAnswer table):
   ```json
   {
     "question": "What is React?",
     "userAns": "React is a JavaScript library...",
     "hiring_manager_score": 85,
     "technical_recruiter_score": 90,
     "panel_lead_score": 88,
     "overall_score": 88,
     "hiring_manager_feedback": "Good problem-solving approach...",
     "technical_recruiter_feedback": "Accurate definition...",
     "panel_lead_feedback": "Clear and concise..."
   }
   ```
5. **Display**: User sees all scores and feedback

---

## 🚀 Ready to Use!

The system is now fully functional with SQLite. No external database configuration needed. Just run `npm run dev` and start interviewing!
