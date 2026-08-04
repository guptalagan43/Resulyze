# Resulyze — AI Resume Screening & Skill Gap Analyzer

An intelligent resume screening platform that uses NLP and ML to match candidates to job descriptions, identify skill gaps, and generate structured PDF reports.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and adjust values
3. Run `docker compose up`
4. Access the application:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - MinIO Console: http://localhost:9001

## Running Tests

```bash
docker compose exec backend pytest
```

## Phase Progress

- [x] Phase 0: Project Scaffolding
- [x] Phase 1: Authentication
- [x] Phase 2: Resume Upload & Parsing
- [x] Phase 3: Job Description Management
- [x] Phase 4: ML Analysis Pipeline
- [x] Phase 5: Skill Gap Analysis
- [x] Phase 6: Analytics Dashboard

## Constraints

- All config from .env only — no hardcoded values
- No Python file > 300 lines
- No React component > 200 lines
- Layer discipline: routes call services, services call models
- All file paths in storage use UUIDs
