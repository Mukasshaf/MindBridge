# TeenCare Project Tasks

- [x] **Phase 1: Project Initialization**
    - [x] Create project directory structure (frontend, backend, scripts)
    - [x] Initialize FastAPI backend (poetry/pip, basic app structure)
    - [x] Initialize React frontend (Vite, Tailwind)

- [x] **Phase 2: Backend Development**
    - [ ] Define Data Models (SQLModel/Pydantic for Session, Quiz, Chat)
    - [ ] Setup SQLite Database connection and migrations (if needed)
    - [ ] Implement `POST /api/session` (Create Session)
    - [ ] Implement `POST /api/session/{id}/complete` (Trigger Scoring)
    - [ ] Implement `GET /api/sessions` and `GET /api/session/{id}`
    - [ ] Implement `POST /api/llm` (Proxy/Simulator)
    - [ ] Implement PDF Export endpoint

- [x] **Phase 3: Scoring Engine & Logic**
    - [ ] Implement Quiz Scoring Logic (Reaction, Decision, Emotion)
    - [ ] Implement Rule-based Session Summary Generator
    - [ ] Create LLM System Prompt & Parsing Logic

- [/] **Phase 4: Frontend Integration**
    - [x] Clone Lovable frontend repo
    - [x] Apply user requested changes to frontend
        - [x] Landing: Shadcn Card & Logo
        - [x] Home: Logout button
        - [x] Dashboard: Add Mood & Detailed Stats Table
        - [x] Chat: Title, Expand button, ChatGPT-style UI
    - [ ] Connect Frontend to Backend API

- [ ] **Phase 5: Integration & Polish**
    - [ ] Connect Frontend to Backend API (localhost:8000)
    - [ ] Verify end-to-end flow (Quiz -> Submit -> Dashboard)
    - [ ] Verify end-to-end flow (Chat -> Submit -> Dashboard)
    - [ ] Final Polish
    - [ ] Documentation (README)
