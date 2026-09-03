# 🚀 NexusAI - AI-Powered Freelance Marketplace

A complete full-stack web application for an AI-powered freelance marketplace featuring email-based 6-digit OTP verification, AI candidate matching, milestone tracking with mock escrow payments, real-time messaging, and transparent post-project reviews.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript, Vite, Lucide React, Custom High-End Cyber/Fintech CSS Design System
- **Backend**: Python 3.14 + FastAPI + Pydantic v2 + Uvicorn + PyJWT + Bcrypt
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM (with automatic fallback to SQLite for zero-friction local testing)
- **AI Engine**: Multi-factor semantic scoring combining skill vectors, budget compatibility, track records, and keyword similarity

---

## 🌟 Core Features & Highlights

1. **Email-Based 6-Digit OTP Signup Verification**:
   - New client & freelancer signups dispatch a secure 6-digit verification code (10-min validity).
   - Accounts remain unverified (`is_verified = False`) until the OTP is successfully entered.
   - Interactive segmented 6-digit UI with auto-tabbing, clipboard paste support, resend countdown timer, and local dev auto-fill helper.
   - Prominently printed ASCII dispatch box in the backend terminal for immediate inspection.

2. **Built-in AI Recommendation Engine**:
   - Analyzes project titles, descriptions, and required skills against freelancer profiles.
   - Computes a multi-factor score:
     - **Skill Overlap (45%)**: Direct matching and tech synonym mapping (e.g., React ↔ Next.js, FastAPI ↔ Python).
     - **Budget-to-Rate Fit (20%)**: Hourly rate compatibility with project budget expectations.
     - **Track Record (20%)**: Historical client star rating and completed contract count.
     - **Semantic Content Fit (15%)**: Cosine token intersection between project brief and candidate bio.
   - Generates human-readable AI rationales with expandable scoring breakdowns and 1-click invitation.

3. **Milestone Tracking & Mock Secure Escrow Payments**:
   - Projects feature phased milestones (e.g., Phase 1: Architecture, Phase 2: Implementation & Delivery).
   - Clients deposit funds into Mock Escrow (`funded`).
   - Freelancers submit deliverables with notes and live artifact/repository URLs (`submitted`).
   - Clients inspect deliverables and release escrow payments directly to the freelancer's wallet (`released`).

4. **Integrated Messaging System**:
   - Real-time slide-over messenger with project context references, message timestamps, and sender avatars.

5. **Transparent Review & Rating System**:
   - Post-completion 5-star rating selector with collaboration highlight tags and feedback comments.
   - Automatically recalculates recipient aggregate star rating and public reviews tally.

6. **Instant Evaluation Demo Switcher**:
   - Dropdown menu in the navbar allowing 1-click switching between pre-seeded accounts:
     - **Sarah Chen** (VP of Product @ ApexLabs - Client)
     - **Alex Rivera** (Principal AI & Full-Stack Engineer - Freelancer)
     - **Liam Tanaka** (UI/UX & Frontend Architect - Freelancer)

---

## 🏃 Quick Start Guide (Run Locally)

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)

### 1. Start the Backend API Server

Open a terminal in the project root:

```bash
cd backend

# (Optional) Activate virtual environment if desired:
# python -m venv venv
# .\venv\Scripts\Activate.ps1

# Install dependencies (already installed if in this workspace)
pip install -r requirements.txt

# Run the backend server
python run.py
```

- The backend will start on **`http://127.0.0.1:8000`**
- Interactive Swagger API docs are available at **`http://127.0.0.1:8000/docs`**
- PostgreSQL is configured in `.env`. If PostgreSQL is not currently running with those credentials, the server automatically uses local SQLite (`marketplace.db`) so it starts immediately without setup hurdles.

### 2. Start the Frontend Application

Open a second terminal in the project root:

```bash
cd frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev
```

- Open your browser at **`http://127.0.0.1:5173`**

---

## 🧪 Testing the 6-Digit Signup OTP Flow

1. On `http://127.0.0.1:5173`, click **"Create Account"** in the top-right navbar.
2. Choose either **"Hire Talent"** or **"Work as Talent"**.
3. Fill in a name, unique email (e.g. `yourname@test.com`), password, and skills.
4. Click **"Continue & Send 6-Digit OTP"**.
5. The **Verify Your Email** modal will appear with 6 segmented input boxes.
6. Check the terminal where the backend is running to see the dispatched email box:
   ```
   =================================================================
   [EMAIL DISPATCH TO: yourname@test.com]
      Hello yourname,
      Your 6-Digit NexusAI Marketplace Verification Code is:
      >>>  [ 849201 ]  <<<
      This code expires in 10 minutes.
   =================================================================
   ```
7. Enter the 6 digits (or click the convenient **"Autofill"** button in the Dev Demo Helper tray).
8. The modal validates the OTP, issues a JWT token, marks the user verified, and logs you into the marketplace!

---

## 🧪 Running Automated Backend Verification Tests

You can run the end-to-end API test suite at any time:

```bash
cd backend
python test_api_flow.py
```

This verifies:
- Health and status endpoints
- Registration with 6-digit OTP generation
- Rejection of invalid codes and acceptance of valid codes
- JWT authentication (`/api/auth/me`)
- AI Recommendation scoring on project candidate profiles
- Milestone creation, escrow deposit, deliverable submission, and fund release
- 5-star review publishing and rating recalculation

---

## 📂 Project Structure

```
marketplace/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy DB models (User, OTPToken, Project, Milestone, Review, Message)
│   │   ├── schemas/          # Pydantic v2 schemas for request/response validation
│   │   ├── routes/           # FastAPI routers (auth, projects, proposals, ai, milestones, messages, reviews)
│   │   ├── services/
│   │   │   ├── email_service.py # 6-digit OTP generator, verification & logger
│   │   │   └── ai_matcher.py    # Multi-factor AI recommendation engine
│   │   ├── auth_utils.py     # Bcrypt hashing & PyJWT token utilities
│   │   ├── config.py         # Environment configuration
│   │   ├── database.py       # Engine & SessionLocal with PostgreSQL & fallback
│   │   ├── main.py           # Application entry point & CORS
│   │   └── seed_data.py      # Preloaded demo clients, freelancers & contracts
│   ├── requirements.txt
│   ├── run.py                # Server launcher script
│   └── test_api_flow.py      # Automated E2E test suite
├── frontend/
│   ├── src/
│   │   ├── api/              # Typed REST client
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header with Demo switcher & wallet pills
│   │   │   ├── OTPVerifyModal.tsx    # 6-digit segmented input with auto-tabbing
│   │   │   ├── AuthModal.tsx         # Sign in & registration modal
│   │   │   ├── AIMatchCard.tsx       # AI match score meter & factor breakdown
│   │   │   ├── MilestoneTracker.tsx  # Escrow pipeline & mock payments
│   │   │   ├── ChatDrawer.tsx        # Project messenger
│   │   │   ├── ReviewModal.tsx       # 5-star rating & tag feedback
│   │   │   ├── PostProjectModal.tsx  # Job creator with AI skill suggestions
│   │   │   └── ProposalModal.tsx     # Freelancer bid submission dialog
│   │   ├── pages/
│   │   │   ├── MarketplacePage.tsx   # Project postings with search & category filters
│   │   │   ├── ProjectDetailPage.tsx # Project brief, AI matchmaker & proposals
│   │   │   ├── WorkspacePage.tsx     # Active milestone escrow management
│   │   │   └── FreelancersPage.tsx   # Top talent directory
│   │   ├── types/            # TypeScript entity definitions
│   │   ├── App.tsx           # Main application state & routing
│   │   ├── index.css         # High-end cyber/fintech dark theme
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.app.json
│   └── vite.config.ts
└── README.md
```
