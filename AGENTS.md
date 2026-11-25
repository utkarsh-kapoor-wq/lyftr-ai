# AGENTS.md - Project Guidelines for AI Agents

Maintained by **Utkarsh Kapoor** (`kapoorutkarsh17@gmail.com`).

## Principles & Engineering Standards
1. **Contract Strictness**: The API contracts for `/health`, `/chat`, and `/sessions/{session_id}/messages` are strictly immutable. No field may be renamed or path modified.
2. **Error Safety**: No exceptions or stack traces must ever escape to the client. All error responses conform to `{"detail": ...}`.
3. **Database Integrity**: Failed calls (422, 503) must never mutate SQLite history. Persist turns atomically only after successful responses.
4. **Git Hygiene**: Commits must be frequent, clean, descriptive, and under 8-9 words. Attribution must remain strictly Utkarsh Kapoor.
