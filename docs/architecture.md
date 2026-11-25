# System Architecture

Author: **Utkarsh Kapoor** (`kapoorutkarsh17@gmail.com`)

## Core Flow
1. Client POSTs to `/chat` with `session_id`, `message`, and optional `system_prompt`.
2. Backend checks whether simulation header `X-Simulate-Failure` is present.
3. If not present, query LiteLLM local cache with key `sha256(model + messages)`.
4. If cached: return immediate cached reply with `resolution_source="LLM_CACHE"`, `key_id=null`, `fallback_attempts=0`.
5. If miss: iterate over `key_1`..`key_n`. On errors (429, 5xx), increment `fallback_attempts` and proceed to next key.
6. Upon success: cache reply and atomically persist user + assistant message to SQLite.
7. Return `200` with comprehensive metadata.
