# LiteLLM Multi-Turn Chat Application

Developed by **Utkarsh Kapoor** (GitHub: [@utkarsh-kapoor-wq](https://github.com/utkarsh-kapoor-wq) | Email: `kapoorutkarsh17@gmail.com`).

---

## 1. Live URLs

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Health Endpoint**: `http://localhost:8000/health`
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`

---

## 2. Run locally (with Docker and without)

### Prerequisites
- Docker & Docker Compose **OR** Python 3.12+ and Node.js 18+

### Running with Docker (Recommended)
1. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```
2. Insert your LLM API keys in `.env` (at least 2 keys separated by commas):
   ```bash
   LLM_API_KEYS=your_key_1,your_key_2
   ```
3. Build and launch services using the Makefile:
   ```bash
   make up
   ```
   *(Alternatively: `docker compose up --build -d`)*
4. Stop all containers:
   ```bash
   make down
   ```

### Running Locally without Docker

#### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   ```bash
   export LLM_API_KEYS="your_key_1,your_key_2"
   export LLM_MODEL="gemini/gemini-2.0-flash"
   export DATABASE_URL="sqlite:///./data/app.db"
   export ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
   export ENABLE_FAILURE_SIMULATION="true"
   ```
5. Run tests:
   ```bash
   pytest -v
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Access the web app at `http://localhost:3000`.

---

## 3. Design decisions (key fallback, caching, SQLite session storage)

### Sequential Key Fallback
- **Pool Management**: API keys provided via `LLM_API_KEYS` are parsed into sequential keys (`key_1`, `key_2`, ..., `key_n`).
- **Explicit Fallback Loop**: Requests iterate through the key pool in order. If a provider encounters a rate limit (`429`), server error (`500`, `502`, `503`, `504`), connection timeout, or authentication error (`401`, `403`), the loop increments `fallback_attempts` and transparently invokes the next available key.
- **Fail-Safe Exhaustion**: If all keys in the pool fail, the server returns a clean `503 {"detail": "all providers unavailable"}` without crashing or returning stack traces. Real API keys are never leaked in logs or response payloads.

### Prompt Caching Architecture
- **In-Memory Cache**: Built on top of LiteLLM's local cache engine (`Cache(type="local")`).
- **Deterministic Cache Key**: Formed strictly from `model + full message list` (ordered roles and stripped message contents). Session IDs, timestamps, and API keys are deliberately excluded so that an identical query in a new session hits the cache.
- **Cache Hit Telemetry**: Returns identical reply text, preserved token usage, `key_id = null`, `fallback_attempts = 0`, and `resolution_source = "LLM_CACHE"`, executing substantially faster than live provider inference.

### SQLite Multi-Turn Storage & Isolation
- **Automatic Initialization**: SQLite database schema and directories are automatically created on startup.
- **Atomic Turns**: Both the user prompt and assistant response are committed together in a single transaction only after a successful LLM call. Failed requests (422 or 503) never pollute session history.
- **Session Prompts**: System prompts set per session persist across multi-turn interactions in the `sessions` table without cluttering user message history.

---

## 4. Verification (curl commands for cache hit, failover with X-Simulate-Failure, per-message token usage, 422, 503)

### 1. Health Check
```bash
curl -s http://localhost:8000/health
```
**Expected Response:**
```json
{"status":"ok","keys_configured":2,"cache_enabled":true}
```

### 2. Live Inference (First Request)
```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session_demo_1", "message": "Explain quantum computing in one sentence"}'
```
**Expected Response (LIVE_INFERENCE):**
```json
{
  "session_id": "session_demo_1",
  "reply": "Quantum computing harnesses quantum mechanics to process complex data exponentially faster than classical computers.",
  "metadata": {
    "resolution_source": "LIVE_INFERENCE",
    "model": "gemini/gemini-2.0-flash",
    "latency_ms": 780,
    "input_tokens": 16,
    "output_tokens": 19,
    "key_id": "key_1",
    "fallback_attempts": 0
  }
}
```

### 3. Cache Hit (Identical First Message in a NEW Session)
```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session_demo_2", "message": "Explain quantum computing in one sentence"}'
```
**Expected Response (LLM_CACHE):**
```json
{
  "session_id": "session_demo_2",
  "reply": "Quantum computing harnesses quantum mechanics to process complex data exponentially faster than classical computers.",
  "metadata": {
    "resolution_source": "LLM_CACHE",
    "model": "gemini/gemini-2.0-flash",
    "latency_ms": 2,
    "input_tokens": 16,
    "output_tokens": 19,
    "key_id": null,
    "fallback_attempts": 0
  }
}
```

### 4. Failover Simulation with X-Simulate-Failure (`key_1=429`)
```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: key_1=429" \
  -d '{"session_id": "session_failover_demo", "message": "Testing automated failover"}'
```
**Expected Response (Fails over to key_2):**
```json
{
  "session_id": "session_failover_demo",
  "reply": "Automated failover successfully routed to secondary key.",
  "metadata": {
    "resolution_source": "LIVE_INFERENCE",
    "model": "gemini/gemini-2.0-flash",
    "latency_ms": 820,
    "input_tokens": 14,
    "output_tokens": 12,
    "key_id": "key_2",
    "fallback_attempts": 1
  }
}
```

### 5. All Providers Unavailable Simulation (`*=429` -> 503)
```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: *=429" \
  -d '{"session_id": "session_down_demo", "message": "Testing total outage"}'
```
**Expected Response (503):**
```json
{"detail":"all providers unavailable"}
```

### 6. Validation Error (422 Unprocessable Content)
```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "s1", "message": "   "}'
```
**Expected Response (422):**
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "message"],
      "msg": "Value error, message cannot be empty or whitespace only",
      "input": "   "
    }
  ]
}
```

### 7. Session Message History
```bash
curl -s http://localhost:8000/sessions/session_demo_1/messages
```
**Expected Response (200):**
```json
{
  "session_id": "session_demo_1",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing in one sentence"
    },
    {
      "role": "assistant",
      "content": "Quantum computing harnesses quantum mechanics to process complex data exponentially faster than classical computers.",
      "metadata": {
        "resolution_source": "LIVE_INFERENCE",
        "input_tokens": 16,
        "output_tokens": 19
      }
    }
  ]
}
```

---

## 5. Setup Used (editor and AI tools: Gemini)

- **AI Pair Programming Assistant**: Google Gemini 3.8 Flash (Autonomous Deep Thought & Code Generation)
- **Editor / Workspace**: Visual Studio Code & Linux Shell Runtime
- **Backend Framework**: Python FastAPI with Pydantic v2 & LiteLLM
- **Frontend Stack**: Vite, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Database**: SQLite 3 with WAL Mode & thread safety
- **Containerization**: Multi-stage Docker builds with Nginx & Docker Compose

---

## 6. Bonus features

- **Interactive Failover Simulation Panel**: Frontend includes a collapsible debugging panel to inject `X-Simulate-Failure` headers (`key_1=429`, `key_1=500`, `*=429`) directly from the UI.
- **Smart Latency & Resolution Badges**: Color-coded badges visually distinguishing `LLM_CACHE` (green) from `LIVE_INFERENCE` (blue) with exact latency and token consumption metrics.
- **Strict Test-ID Compliance**: Fully instrumented with `data-testid` attributes (`chat-input`, `send-button`, `assistant-message`, `meta-source`, `meta-model`, `meta-latency`, `meta-input-tokens`, `meta-output-tokens`, `system-prompt-input`) for automated end-to-end integration testing.
- **Automatic Multi-Turn Context Pruning & DB Schema Migration**: Automatic directory and table generation ensures zero-config initialization in any Docker or local environment.
