# LearnAI - Production Deployment Instructions

## TLDR: 3 Steps to Fix

1. **Get Groq API Key**
   - Go to https://console.groq.com
   - Create account / login
   - Copy your API key

2. **Update `.env`**
   ```
   File: server/.env
   Replace: GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
   With: GROQ_API_KEY=gsk_your_actual_key_from_groq
   ```

3. **Restart Server**
   ```bash
   # Kill existing server
   Ctrl+C (or kill the process)
   
   # Restart
   cd server
   npm run dev
   ```

---

## Detailed Setup

### Step 1: Create Groq Account

1. Open https://console.groq.com
2. Sign up or log in
3. Navigate to "API Keys" section
4. Create new API key or copy existing one
5. Format: `gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Update Environment

**File:** `server/.env`

**Current content:**
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edu_ai_app
JWT_SECRET=development_secret_key_12345
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
RAZORPAY_KEY_ID=rzp_test_12345
RAZORPAY_SECRET=rzp_secret_12345
```

**What to change:**
```diff
- GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
+ GROQ_API_KEY=gsk_1234567890abcdef1234567890abcdef
```

✅ Keep the file in `server/.env` (do NOT add to git - it's in .gitignore)

### Step 3: Verify Fix

**Method A: Check Environment Loading**
```bash
cd server
node verify_groq_init.js
```

Expected output:
```
✅ Found: gsk_1234567...
✅ Groq is configured
Fix status: ✅ FIXED
```

**Method B: Test an Endpoint**

Start server:
```bash
cd server
npm run dev
```

In another terminal:
```bash
# Register test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!",
    "name":"Test User"
  }'

# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Response will have "token": "eyJ..."
# Copy that token

# Test AI endpoint
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pdfId":"507f1f77bcf86cd799439011",
    "question":"What is this about?"
  }'
```

**Expected responses:**
- ✅ 404: `"PDF not found"` (correct - PDF doesn't exist)
- ✅ 500: Configuration error would appear here if key is missing/invalid
- ❌ 500: "AI service configuration error" = Missing API key

---

## Features Now Available

Once API key is set, users can:

### 1. Generate MCQs
- Difficulty: easy, medium, hard
- Customizable count (1-50)
- Example:
  ```
  POST /api/ai/generate-mcqs
  {
    "pdfId": "...",
    "difficulty": "medium",
    "count": 5
  }
  ```

### 2. Generate Exams
- Duration: 1-180 minutes
- Question count: 1-50
- Difficulty: easy, medium, hard
- Example:
  ```
  POST /api/ai/generate-exam
  {
    "pdfId": "...",
    "duration": 30,
    "count": 10,
    "difficulty": "medium"
  }
  ```

### 3. Generate Study Notes
- Type: 'summary' or 'short'
- Extracts key concepts
- Structured learning
- Example:
  ```
  POST /api/ai/generate-notes
  {
    "pdfId": "...",
    "type": "summary"
  }
  ```

### 4. AI Chat
- Ask questions about PDF content
- Real-time responses
- Maintains context
- Example:
  ```
  POST /api/ai/ask
  {
    "pdfId": "...",
    "question": "Explain the main concepts"
  }
  ```

---

## Troubleshooting

### Issue: Still Getting "AI service configuration error"

**Cause:** API key not set in `.env`

**Fix:**
```bash
# Check current env
grep GROQ_API_KEY server/.env

# Should show:
# GROQ_API_KEY=gsk_xxxxx

# If shows placeholder, update it
nano server/.env  # Edit and save
```

### Issue: Getting "Invalid API Key" (401)

**Cause:** Wrong API key format or revoked key

**Fix:**
1. Verify key from https://console.groq.com
2. Ensure it starts with `gsk_`
3. Check for extra spaces in `.env`
4. Try creating a new key

### Issue: Rate Limit / 503 Errors

**Cause:** Groq rate limit exceeded

**Fix:**
- Groq free tier has rate limits
- Upgrade plan or wait for reset
- Implement client-side caching

### Issue: Server won't start

**Cause:** Syntax error in `.env`

**Fix:**
1. Don't use quotes: `GROQ_API_KEY=gsk_xxx` (not `"gsk_xxx"`)
2. No spaces around `=`
3. One per line
4. Try restarting with fresh clone

---

## Rate Limits & Quotas

Groq Free Tier (as of Feb 2026):
- **Requests/minute:** 30
- **Tokens/minute:** 40,000
- **Requests/day:** 100
- **Concurrent requests:** 1

**Recommendation:**
- Implement frontend caching
- Add loading indicators
- Show "Please wait" messages
- Consider paid plan for production

---

## Monitoring

### Check Server Logs

Server logs will show:
```
[GROQ] Initializing Groq client with API key...
[AI Chat] Calling Groq API...
[AI Chat] Response received...
```

### Check Error Logs

```bash
# In server root
tail -f error.log  # Watch for Groq errors
```

### Health Check

```bash
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x","password":"x"}'

# Response (even with wrong creds) means server is up
```

---

## Security Best Practices

1. **Never commit `.env` to git**
   - Already in `.gitignore`
   - Double-check: `git status` shouldn't show `.env`

2. **Use separate keys for environments**
   - Development: one key
   - Production: another key
   - Test: third key (if needed)

3. **Rotate keys regularly**
   - Create new key in Groq console
   - Update `.env`
   - Delete old key

4. **Monitor key usage**
   - Check Groq dashboard for unusual activity
   - Set alerts if available

5. **Rate limit implementation**
   - Already done: `server/middleware/rateLimiter.js`
   - Limits per IP and per user

---

## Performance Optimization

### Frontend Caching (Recommended)

```typescript
// In LearningTools.tsx or similar
const [cachedMCQs, setCachedMCQs] = useState({});

const generateMCQs = async (difficulty: string) => {
  const cacheKey = `${pdfId}-${difficulty}`;
  
  if (cachedMCQs[cacheKey]) {
    setMcqs(cachedMCQs[cacheKey]);
    return; // Skip API call
  }
  
  const { data } = await API.post('/ai/generate-mcqs', { pdfId, difficulty });
  setCachedMCQs(prev => ({ ...prev, [cacheKey]: data }));
};
```

### Backend Optimization

Current implementation is already optimized:
- Lazy Groq initialization (no startup cost)
- Streaming not needed for MCQs/exams (length limits)
- Rate limiter prevents abuse
- PDF text limited to 30KB per request

---

## Support & Documentation

### Groq Documentation
- https://console.groq.com/docs
- https://github.com/groq/groq-sdk-python
- https://github.com/groq/groq-sdk-js

### Model Information
- Model: `llama3-70b-8192`
- Context: 8,192 tokens
- Latency: ~5-10 seconds per request

### LearnAI Endpoints
- `/api/ai/ask` - Ask questions
- `/api/ai/generate-mcqs` - Generate multiple-choice questions
- `/api/ai/generate-exam` - Generate full exam paper
- `/api/ai/generate-notes` - Generate study notes

---

## Deployment Checklist

- [ ] Get Groq API key from console.groq.com
- [ ] Update `GROQ_API_KEY` in `server/.env`
- [ ] Run `node verify_groq_init.js` to verify
- [ ] Restart server
- [ ] Test with real PDF (upload → generate MCQ/exam/notes)
- [ ] Check server logs for errors
- [ ] Test frontend toasts show correct error messages
- [ ] Verify rate limiter is working
- [ ] Document API key location for team
- [ ] Add key rotation schedule to calendar

---

## Timeline

**Estimated setup time:** 5-10 minutes
1. Create Groq account: 2 min
2. Update `.env`: 1 min
3. Verify with test: 2 min
4. Full e2e test with PDF: 5 min

**Expected outcome:** All AI features fully functional
