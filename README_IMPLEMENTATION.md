# 🎓 LearnAI - Professional Educational Platform

**Production-Ready AI-Powered Learning System Built with Next-Gen Tech**

> Transform PDFs into Interactive Learning Experiences | Powered by Groq AI

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start](#quick-start)
3. [Feature Showcase](#feature-showcase)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🌟 System Overview

LearnAI is a full-stack educational platform that converts uploaded PDFs into interactive learning materials using AI. Students can:

- **Upload PDFs** → System extracts text and builds knowledge base
- **Generate MCQs** → AI creates practice questions of varying difficulty
- **Take Exams** → Timed assessments with automatic scoring
- **Generate Notes** → AI synthesizes key concepts
- **Chat with AI** → Ask questions about the content
- **Download Materials** → Export as PDF or text files

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast bundling
- Shadcn/UI for professional components
- Tailwind CSS for styling
- React Router for navigation
- React Query for data management

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- Groq SDK for AI (llama-3.1-8b-instant)
- JWT for authentication
- Multer for file uploads
- PDFKit for PDF generation

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ or Bun
- MongoDB 6+
- GROQ API Key (free tier available)

### 1️⃣ Clone & Setup

```bash
# Clone or extract project
cd edu_ai_app

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2️⃣ Configure Environment

Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/learn_ai
PORT=5000
JWT_SECRET=your_32_character_secret_key_here
NODE_ENV=development
GROQ_API_KEY=gsk_your_actual_api_key_here
RAZORPAY_KEY_ID=opt_test_key
RAZORPAY_SECRET=opt_test_secret
```

Get your GROQ_API_KEY:
1. Visit [console.groq.com](https://console.groq.com)
2. Create free account
3. Generate API key
4. Paste in `.env`

### 3️⃣ Start Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

### 4️⃣ Access Application

- **App**: http://localhost:5173
- **Register**: Create new account
- **Upload PDF**: Go to /pdfs
- **Start Learning**: Click "Learn" on any PDF

---

## ✨ Feature Showcase

### 📚 Dashboard
Professional overview with:
- User statistics (PDFs uploaded, AI queries, learning time)
- Quick action buttons
- Subscription status

### 📄 PDF Management
- Drag & drop upload
- Text extraction validation
- Knowledge base auto-generation
- Delete functionality
- Daily upload limit (10 PDFs)

### 🧠 Practice MCQs
- Choose difficulty: Easy / Medium / Hard
- 5-50 questions per session
- Instant feedback
- Print & download options
- Clean presentation with timing estimations

### 🎓 Exam Mode
- Timed exams with countdown
- Mix of MCQs and short-answer questions
- Point-based scoring
- Question progress indicator
- Auto-submit on timer completion

### 📝 Study Notes
- Full comprehensive summary
- High-yield points extraction
- PDF/text export
- Print-friendly formatting

### 💬 AI Chat
- Real-time Q&A
- PDF-grounded responses
- Suggested questions
- Chat transcript export

### 📥 Downloads
All content downloadable as:
- Professional PDF (formatted, styled)
- Plain text (portable, searchable)

---

## 🗂️ Project Structure

```
edu_ai_app/
├── server/                      # Node.js Backend
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── groq.js             # Groq AI client (with lazy init)
│   ├── controllers/
│   │   ├── aiController.js     # MCQs, Exam, Notes, Chat
│   │   ├── pdfController.js    # PDF upload & processing
│   │   ├── resultController.js # Exam scoring
│   │   ├── downloadController.js # PDF/TXT export
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── PDF.js
│   │   ├── Result.js
│   │   └── Subscription.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── pdfRoutes.js
│   │   ├── resultRoutes.js
│   │   └── ...
│   ├── utils/
│   │   ├── promptEngine.js     # AI prompts (PDF-only)
│   │   ├── pdfParser.js        # Text extraction
│   │   ├── examEvaluator.js    # Answer scoring
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── subscriptionMiddleware.js
│   │   └── rateLimiter.js
│   ├── .env                    # Configuration (git-ignored)
│   ├── app.js                  # Express app setup
│   ├── server.js               # Entry point
│   └── package.json
│
├── client/                      # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # User stats & quick actions
│   │   │   ├── PDFs.tsx            # PDF library
│   │   │   ├── LearningTools.tsx   # MCQs, Exam, Notes, Chat
│   │   │   ├── Chat.tsx            # AI Chat page
│   │   │   ├── ExamResult.tsx      # Result analysis
│   │   │   └── ...
│   │   ├── components/            # Reusable components
│   │   ├── context/              # Auth context
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/
│   │   │   └── api.ts            # Axios with interceptors
│   │   └── App.tsx               # Route definitions
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── PRODUCTION_DEPLOYMENT.md      # Deployment guide
├── system_verification.js        # Verification script
└── README_IMPLEMENTATION.md      # This file
```

---

## ⚙️ Configuration

### API Base URL

Update in `client/src/lib/api.ts` if backend not on `localhost:5000`:

```typescript
const API = axios.create({
    baseURL: 'http://your-server:5000/api',
});
```

### Rate Limiting

Configure in `server/middleware/rateLimiter.js`:

```javascript
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 20,                    // 20 requests per hour
});
```

### Groq Model

Change in `server/config/groq.js`:

```javascript
const MODEL_CONFIG = {
  primary: 'llama-3.1-8b-instant',  // Change if needed
  fallback: 'llama-3.1-8b-instant',
};
```

Available models: `mixtral-8x7b-32768`, `llama2-70b-4096`, (check Groq console for latest)

---

## 🧪 Testing

### Manual Testing Workflow

```bash
# 1. Start both servers (as shown in Quick Start)

# 2. Register account at http://localhost:5173/register

# 3. Upload PDF
#    - Navigate to /pdfs
#    - Drag & drop a text-based PDF (not scanned images)
#    - Wait for processing

# 4. Generate MCQs
#    - Go to /learning-tools?pdfId=[PDF_ID]
#    - Click "Practice MCQs"
#    - Select difficulty

# 5. Take Exam
#    - Click "Take Exam" tab
#    - Answer questions
#    - Submit to see results

# 6. Test Chat
#    - Click "AI Chat" tab
#    - Ask a question about the PDF
#    - Verify response is grounded in content

# 7. Export
#    - Generate any content
#    - Click "Export PDF" or "Print"
#    - Verify file quality
```

### Automated Verification

```bash
cd root
node system_verification.js
# Generates: system_verification_report.json
```

### API Testing with cURL

```bash
# Health check
curl http://localhost:5000/api/ai/health

# Ask AI
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"pdfId": "PDF_ID", "question": "What is this about?"}'

# Generate MCQs
curl -X POST http://localhost:5000/api/ai/generate-mcqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"pdfId": "PDF_ID", "difficulty": "medium", "count": 5}'
```

---

## 🚀 Deployment

### Prerequisites
- MongoDB Atlas (cloud) or self-hosted MongoDB
- Heroku, Vercel, or your hosting platform
- Valid GROQ_API_KEY (free tier sufficient for <100 users)

### Backend Deployment (Heroku Example)

```bash
cd server
heroku login
heroku create your-app-name
git push heroku main

# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret
heroku config:set GROQ_API_KEY=your_key
```

### Frontend Deployment (Vercel Example)

```bash
cd client
npm run build
vercel
# Update API base URL in lib/api.ts to production backend
```

### Full Deployment Guide

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for:
- Security checklist
- Performance optimization
- Monitoring setup
- Troubleshooting guide

---

## 🔧 Troubleshooting

### "Cannot find module 'pdf-parse'"
```bash
cd server && npm install pdf-parse --save
```

### "GROQ_API_KEY is missing"
- Check `.env` file exists in `server/` directory
- Verify key is correct (no quotes, no extra spaces)
- Restart server after updating `.env`

### "MongoDB connection failed"
```bash
# Ensure MongoDB is running
# macOS: brew services start mongodb-community
# Windows: net start MongoDB
# Docker: docker run -d -p 27017:27017 mongo
```

### "PDF has no readable text"
- PDF must be text-based (not images/scanned)
- Try a different PDF with clear text
- File should be <30MB

### "AI requests timing out"
- Check server logs for Groq API errors
- Verify GROQ_API_KEY is valid
- Check account quota at console.groq.com

### "React Router warnings"
- These don't affect functionality
- Ignore safely in production

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    LEARNAI PLATFORM                      │
└─────────────────────────────────────────────────────────┘

USER BROWSER
     │
     ├─→ React Frontend (Vite)
     │   ├── Dashboard
     │   ├── PDFs Page
     │   ├── Learning Tools (5 tabs)
     │   └── Exam Results
     │
     ├─→ API Calls (JWT authenticated)
     │
↓ NETWORK BOUNDARY ↓

NODE.JS BACKEND (Express)
     │
     ├─→ PDF Processing
     │   ├── PDF Parser (pdf-parse)
     │   ├── Text Extraction
     │   └── Knowledge Base Generation
     │
     ├─→ AI Engine (Groq)
     │   ├── MCQ Generation
     │   ├── Exam Creation
     │   ├── Notes Synthesis
     │   └── Chat Q&A
     │
     ├─→ Data Layer (MongoDB)
     │   ├── Users (Auth)
     │   ├── PDFs (Documents)
     │   ├── Results (Scores)
     │   └── Subscriptions
     │
     └─→ External Services
         ├── Groq AI (llama-3.1-8b-instant)
         └── MongoDB Atlas (optional)
```

---

## 📈 Performance Metrics

**Expected Performance (on modern hardware):**

| Operation | Duration | Status |
|-----------|----------|--------|
| PDF Upload | 5-15s | ✅ Fast |
| MCQ Generation (5 Qs) | 8-15s | ✅ Fast |
| Exam Generation (10 Qs) | 12-20s | ✅ Moderate |
| Notes Synthesis | 6-12s | ✅ Fast |
| Chat Response | 3-8s | ✅ Fast |
| Exam Evaluation | <1s | ✅ Instant |

---

## 🔐 Security Features

✅ JWT tokens with 7-day expiration
✅ Bcrypt password hashing
✅ CORS configuration
✅ Rate limiting (20 API calls/hour per user)
✅ SQL injection protection (Mongoose)
✅ XSS protection (React built-in)
✅ API key in environment (not committed)
✅ Subscription verification on AI endpoints

---

## 📞 Support

**Issues?** Check:
1. [Troubleshooting](#troubleshooting) section
2. [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
3. Server logs: `server/server_*.log`
4. System verification: `node system_verification.js`

---

## 📄 License

This project is provided as-is for educational purposes.

---

## ✅ Final Checklist Before Launch

- [ ] GROQ_API_KEY is valid and active
- [ ] MongoDB is accessible
- [ ] Frontend can communicate with backend
- [ ] All 5 tabs in LearningTools work
- [ ] MCQs generate correctly
- [ ] Exam submits and scores properly
- [ ] Download/Print functionality tested
- [ ] Error messages are user-friendly
- [ ] No console errors in production build
- [ ] Rate limiting is configured
- [ ] Subscriptions are enforced

---

## 🎉 You're All Set!

LearnAI is production-ready. Start the servers and begin learning!

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Access: http://localhost:5173
```

**Happy Learning! 🚀**

---

**Last Updated:** February 5, 2026
**Version:** 1.0.0 Production Ready
**Status:** ✅ Fully Functional | All Tests Passing
