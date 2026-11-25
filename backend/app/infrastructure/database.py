import os
import json
import sqlite3
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from app.core.config import settings
from app.domain.models import ChatMessageRecord
from app.domain.exceptions import SessionNotFoundException


class Database:
    def __init__(self, db_path: Optional[str] = None):
        self._db_path = db_path or settings.sqlite_db_path

    @property
    def db_path(self) -> str:
        return self._db_path

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        """Create parent directory and initialize tables if they do not exist."""
        dirname = os.path.dirname(os.path.abspath(self._db_path))
        if dirname and not os.path.exists(dirname):
            os.makedirs(dirname, exist_ok=True)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at TEXT NOT NULL
                );
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id);
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    system_prompt TEXT
                );
            """)
            conn.commit()

    def check_health(self) -> bool:
        """Verify the database is reachable."""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1;")
                return cursor.fetchone() is not None
        except Exception:
            return False

    def get_session_system_prompt(self, session_id: str) -> Optional[str]:
        """Fetch the stored system prompt for a session."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT system_prompt FROM sessions WHERE session_id = ?;",
                (session_id,)
            )
            row = cursor.fetchone()
            if row and row["system_prompt"] is not None:
                return row["system_prompt"]
        return None

    def session_exists(self, session_id: str) -> bool:
        """Check if a session exists in the database."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM sessions WHERE session_id = ? LIMIT 1;", (session_id,))
            if cursor.fetchone() is not None:
                return True
            cursor.execute("SELECT 1 FROM messages WHERE session_id = ? LIMIT 1;", (session_id,))
            return cursor.fetchone() is not None

    def get_messages(self, session_id: str) -> List[ChatMessageRecord]:
        """Fetch chronological messages for a session. Raises SessionNotFoundException if missing."""
        if not self.session_exists(session_id):
            raise SessionNotFoundException(detail="session not found")

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, session_id, role, content, metadata, created_at
                FROM messages
                WHERE session_id = ?
                ORDER BY id ASC;
            """, (session_id,))
            rows = cursor.fetchall()

            results: List[ChatMessageRecord] = []
            for r in rows:
                meta = json.loads(r["metadata"]) if r["metadata"] else None
                results.append(
                    ChatMessageRecord(
                        id=r["id"],
                        session_id=r["session_id"],
                        role=r["role"],
                        content=r["content"],
                        metadata=meta,
                        created_at=r["created_at"],
                    )
                )
            return results

    def save_turn(
        self,
        session_id: str,
        user_content: str,
        assistant_reply: str,
        metadata: Dict[str, Any],
        system_prompt: Optional[str] = None
    ) -> None:
        """Atomically persist user message, assistant reply, and session prompt."""
        now_iso = datetime.now(timezone.utc).isoformat()
        metadata_json = json.dumps(metadata)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Upsert or preserve session system prompt
            if system_prompt is not None:
                cursor.execute("""
                    INSERT INTO sessions (session_id, system_prompt)
                    VALUES (?, ?)
                    ON CONFLICT(session_id) DO UPDATE SET system_prompt = excluded.system_prompt;
                """, (session_id, system_prompt))
            else:
                cursor.execute("""
                    INSERT INTO sessions (session_id, system_prompt)
                    VALUES (?, NULL)
                    ON CONFLICT(session_id) DO NOTHING;
                """, (session_id,))

            # Persist user message
            cursor.execute("""
                INSERT INTO messages (session_id, role, content, metadata, created_at)
                VALUES (?, 'user', ?, NULL, ?);
            """, (session_id, user_content, now_iso))

            # Persist assistant reply
            cursor.execute("""
                INSERT INTO messages (session_id, role, content, metadata, created_at)
                VALUES (?, 'assistant', ?, ?, ?);
            """, (session_id, assistant_reply, metadata_json, now_iso))

            conn.commit()


db = Database()
