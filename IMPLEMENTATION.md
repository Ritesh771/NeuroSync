# NeuroSync - AI Interview Platform

## 🚀 Features Implemented

### ✅ 1. User Authentication
- Sign up / Sign in functionality
- First-time login detection
- Automatic redirect to Resume Upload for new users
- Session management with cookies

### ✅ 2. Resume Upload & Extraction
- PDF/DOCX file upload (≤ 5MB)
- Text extraction from resumes
- NLP-based data extraction (skills, experience, education, projects)
- Database storage in `resume_data` table
- Updates user's first login status

### ✅ 3. Resume-Based Question Generation
- Fetches user's resume data
- Generates personalized questions based on:
  - **Technical questions** → from listed skills
  - **Problem-solving questions** → from project experience
  - **Behavioral/Managerial questions** → from work experience
- Falls back to generic questions if no resume data available

### ✅ 4. AI Interview Session
- Interactive interview with voice/text input
- Webcam recording support
- **Multi-Agent Evaluation System**:
  - 👨‍💼 **Hiring Manager**: Evaluates problem-solving (0-100)
  - 👩‍💻 **Senior Technical Recruiter**: Evaluates technical accuracy (0-100)
  - 🧑‍🏫 **Panel Lead**: Evaluates communication & clarity (0-100)
- Real-time feedback storage

### ✅ 5. Evaluation & Scoring
- Each agent provides:
  - Score (0-100)
  - Detailed feedback
- Overall Performance Score = Average of all three agents
- Stored in `userAnswer` table with multi-agent fields

### ✅ 6. Analytics Dashboard
- **Performance Overview**:
  - Total interviews completed
  - Average overall score
  - Average scores per agent (Problem-Solving, Technical, Communication)
- **Visual Progress Bars** for each evaluation metric
- **Interview History** with detailed breakdowns
- **Strengths & Weaknesses** analysis
- Track improvement over time

### ✅ 7. Continuous Learning / Reattempt
- Users can create unlimited interviews
- Questions adapt based on resume data
- Historical performance tracking
- Ability to retake interviews for different roles

### ✅ 8. Code Editor Integration
- Live collaborative code editor (Monaco Editor)
- Real-time collaboration with SuperViz
- Video conferencing integration
- Code execution with Piston API
- Support for multiple languages (JavaScript, TypeScript, Python, Java, C#, PHP)
- Room-based sessions with shareable links

## 🗂️ Database Schema

### Tables:
- **users**: User authentication data
- **resume_data**: Extracted resume information
- **mockInterview**: Interview sessions
- **userAnswer**: Interview responses with multi-agent scores
- **userDetails**: User credits and payment info

### Multi-Agent Fields in `userAnswer`:
- `hiringManagerScore` (0-100)
- `technicalRecruiterScore` (0-100)
- `panelLeadScore` (0-100)
- `hiringManagerFeedback`
- `technicalRecruiterFeedback`
- `panelLeadFeedback`
- `overallScore` (average)

## 📁 Project Structure

```
/app
  /(auth)
    /sign-in - User login
    /sign-up - User registration
  /dashboard
    /page.jsx - Main dashboard
    /analytics - Analytics dashboard
    /interview/[id] - Interview pages
    /_components - Shared components
  /resume-upload - Resume upload page
  /code-editor - Live code editor
  /api
    /auth - Authentication endpoints
    /resume - Resume processing
    /analytics - Analytics data
    /interviews - Interview management

/components
  /codeplatform - Code editor components
  /ui - Shared UI components

/utils
  /codeplatform - Code editor utilities
  /db.js - Database connection
  /schema.js - Database schema
```

## 🔧 Environment Variables

Required in `.env.local`:
```
DRIZZLE_DB_URL=your_database_url
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT=5
NEXT_PUBLIC_SUPERVIZ_DEVELOPER_KEY=your_superviz_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Push database schema:
```bash
npm run db:push
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📊 User Flow

1. **Sign Up** → New user registration
2. **First Login** → Redirected to Resume Upload
3. **Upload Resume** → System extracts skills, experience, projects
4. **Dashboard** → View/create interviews
5. **Start Interview** → Answer questions with multi-agent evaluation
6. **View Analytics** → Track performance and improvement
7. **Code Editor** → Practice coding with live collaboration
8. **Reattempt** → Take more interviews to improve

## 🎯 Key Features

- **Multi-Agent AI Evaluation**: Three specialized AI agents provide comprehensive feedback
- **Resume-Based Personalization**: Questions tailored to your background
- **Real-Time Analytics**: Track your progress with visual dashboards
- **Live Code Collaboration**: Practice coding with peers in real-time
- **Unlimited Interviews**: No credit system, practice as much as you want

## 🔐 Security

- Password hashing with bcryptjs
- Session-based authentication
- Protected routes with middleware
- Server-side validation

## 📝 Notes

- Database push requires proper `DRIZZLE_DB_URL` configuration
- Multi-agent evaluation currently uses mock responses (replace with actual AI calls in production)
- Resume extraction uses simplified logic (can be enhanced with actual Gemini AI)
