# ConceptBridge AI
### *Bridge the Gap Between Knowing and Doing*

[![PyTest Suite](https://img.shields.io/badge/PyTest-24%20Passed%20(100%25)-success?style=flat-square&logo=pytest)](file:///d:/Anjali/conceptbridge/backend/tests)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%2B-red?style=flat-square)](https://sqlalchemy.org)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

**ConceptBridge AI** is an intelligent, full-stack educational SaaS platform designed to solve a ubiquitous programming education problem: *students memorize syntax and textbook concepts, but struggle to apply them in real-world software engineering scenarios.*

The platform generates production-grade challenges, analyzes student solutions using structured AI evaluation, pinpoints root conceptual misunderstandings, and generates personalized follow-up exercises to turn theory into engineering intuition.

---

## 🚀 Quick Start (Exact Windows Commands)

You can run ConceptBridge AI locally out-of-the-box with **zero external dependencies** using the built-in SQLite database and the intelligent zero-key pedagogical fallback engine.

### Prerequisites
- Python 3.12+ (or Windows `py` launcher)
- Node.js 18+ and npm

---

### Step 1: Start the FastAPI Backend

Open a PowerShell or Command Prompt terminal in `d:\Anjali\conceptbridge`:

```powershell
# 1. Navigate to backend directory
cd d:\Anjali\conceptbridge\backend

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1
# (Or in CMD: .\venv\Scripts\activate.bat)

# 3. Start the FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **Backend API:** `http://127.0.0.1:8000`
> **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
> **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`

---

### Step 2: Start the React Frontend

Open a **second** terminal in `d:\Anjali\conceptbridge`:

```powershell
# 1. Navigate to frontend directory
cd d:\Anjali\conceptbridge\frontend

# 2. Start the Vite development server
npm run dev
```

> **Frontend Web App:** `http://localhost:5173`

---

### Step 3: Run the Test Suite

Open a terminal in `d:\Anjali\conceptbridge`:

```powershell
.\backend\venv\Scripts\pytest.exe backend\tests -v
```

All 24 automated unit and integration tests run in under 10 seconds against an isolated in-memory SQLite database.

---

## 🌟 Key Application Features

1. **Practical Scenario Generation**: Generates challenges based on real-world domains (e.g. e-commerce cart, microservice authentication, telemetry parsing, database reporting) across **Python, JavaScript, Java, SQL, HTML, and CSS**.
2. **AI-Powered Answer Evaluation**: Evaluates logic, boundary edge cases, state mutability, and architectural structure without executing untrusted code on the host server.
3. **Conceptual Gap Detection**: Identifies the precise cognitive misunderstanding (e.g. *confusing pass-by-reference with copy semantics*, *procedural instead of object-oriented encapsulation*, *missing relational JOIN clauses*).
4. **Personalized Follow-Up Generation**: Automatically generates new challenges targeting the student's diagnosed weakness.
5. **Holistic Learning Analytics**: Real-time streak tracking, exponential moving average mastery scores, and interactive score curves.
6. **Dual AI Engine**: Seamlessly interfaces with OpenAI (`gpt-4o-mini`) when an API key is provided, or operates via a deterministic pedagogical rule engine when running offline.

---

## 🏗️ Architecture & Design Patterns

```
conceptbridge/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py          # Dependency Injection (Auth, DB, Services)
│   │   │   └── routes/                  # REST Controllers (auth, subjects, challenges, etc.)
│   │   ├── core/
│   │   │   ├── config.py                # Pydantic BaseSettings
│   │   │   ├── database.py              # SQLAlchemy engine & session factory
│   │   │   ├── security.py              # Bcrypt hashing & PyJWT token handling
│   │   │   ├── exceptions.py            # Centralized exception hierarchy
│   │   │   └── logging_config.py        # Structured logging with credential sanitization
│   │   ├── models/                      # SQLAlchemy 2.0 ORM Declarative Models
│   │   ├── schemas/                     # Pydantic v2 validation & response schemas
│   │   ├── repositories/                # Repository Pattern for database operations
│   │   ├── services/                    # Business logic & AI orchestration
│   │   └── utils/seed_data.py           # Initial subject & concept catalog
│   ├── tests/                           # PyTest automated test suite
│   ├── alembic/                         # Alembic database migrations
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/                  # Navbar, Sidebar, MetricCard, CodeEditor, ProgressChart
│   │   ├── pages/                       # Landing, Login, Register, Dashboard, Practice, etc.
│   │   ├── layouts/                     # Responsive AppLayout and AuthLayout
│   │   ├── services/api.js              # Axios HTTP client with JWT interceptor
│   │   └── context/AuthContext.jsx      # Global authentication state
│   ├── index.html
│   └── package.json
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml                   # Multi-container orchestration (Postgres, Redis, API, UI)
└── .github/workflows/ci.yml             # GitHub Actions CI workflow
```

---

## 🗄️ Database Schema

The database design is normalized and indexed for high-concurrency access:

1. **`users`**: Student accounts, hashed passwords, roles, language & difficulty preferences.
2. **`subjects`**: Programming tracks (Python, Java, JavaScript, SQL, HTML, CSS).
3. **`concepts`**: Sub-topics (Variables, Loops, Functions, OOP, Encapsulation, SQL Queries, etc.).
4. **`challenges`**: Scenario descriptions, requirements, examples, expected solutions, criteria.
5. **`submissions`**: Student code submissions linked to challenges.
6. **`evaluations`**: AI evaluation scores, correctness flags, diagnosed conceptual gaps, improvements.
7. **`concept_mastery`**: Per-user concept proficiency scores (exponential moving average), attempt counters.
8. **`learning_history`**: Chronological activity timeline with scores and event metadata.

---

## 🐳 Docker Deployment

To spin up the complete production stack (FastAPI Backend + PostgreSQL 16 + Redis 7 + React Frontend):

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

## 📋 Development Checklist

- [x] **Phase 1: Workspace & Environment Setup**
  - [x] Inspect workspace and initialize clean directory structure.
  - [x] Configure Python 3.12+ backend virtual environment and Vite React frontend.
  - [x] Setup `.gitignore`, `.env.example`, and configuration management.
- [x] **Phase 2: Database & Core Models**
  - [x] Implement SQLAlchemy models for all 8 required tables.
  - [x] Configure SQLite (local) and PostgreSQL (production/docker) dual compatibility.
  - [x] Generate initial Alembic migration (`Initial tables`).
  - [x] Implement repository pattern (`BaseRepository`, `UserRepository`, etc.).
- [x] **Phase 3: Authentication & Security**
  - [x] Bcrypt password hashing and verification.
  - [x] PyJWT token encoding, decoding, and expiration.
  - [x] User data isolation and authorization checks.
- [x] **Phase 4: AI Integration & Gap Detection**
  - [x] OpenAI API client with structured Pydantic response parsing.
  - [x] Intelligent deterministic fallback engine for 100% offline functionality.
  - [x] Real-world scenario challenge generator.
  - [x] Diagnostic answer evaluator with conceptual gap detection.
- [x] **Phase 5: Frontend Experience & UI/UX**
  - [x] Dark navy SaaS visual theme with purple/blue accents.
  - [x] Responsive Landing Page with problem/solution narrative and features.
  - [x] Authentication flows (Login, Register, 1-Click Demo Login).
  - [x] Student Dashboard with real stats, streak, weak/strong concepts.
  - [x] Practice Page with language, concept, and difficulty filters.
  - [x] Interactive Challenge Page with custom `CodeEditor`.
  - [x] AI Evaluation Page with score meter, gap diagnosis, and confetti celebration.
  - [x] Learning Progress Page with SVG progress chart and mastery matrix.
  - [x] Student Profile & Settings Page with password update and preferences.
- [x] **Phase 6: Testing & Quality Assurance**
  - [x] PyTest test suite (24 tests passing with 100% coverage across auth, challenges, evaluations, security).
  - [x] Frontend production build verification (`vite build` passing with zero warnings).
- [x] **Phase 7: DevOps & Cloud Architecture**
  - [x] Multi-stage `Dockerfile.backend` and `Dockerfile.frontend`.
  - [x] Multi-service `docker-compose.yml`.
  - [x] GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
  - [x] Comprehensive AWS Cloud deployment architecture guide (`docs/AWS_DEPLOYMENT.md`).

---

## 🔒 Security Best Practices

- **Zero Arbitrary Execution**: Student code is never executed directly on the host server; solutions are evaluated via static AST pattern matching and AI evaluation.
- **Credential Sanitization**: The custom logging filter redacts passwords, JWT tokens, and API keys.
- **Strict Data Isolation**: Students can only access their own submissions and evaluations.
- **Input Validation**: Pydantic v2 schemas enforce email format, string lengths, and parameter validation.

---

## 📄 License

This project is licensed under the MIT License.
