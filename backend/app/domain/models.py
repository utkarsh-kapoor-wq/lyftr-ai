from dataclasses import dataclass
from enum import Enum
from typing import Optional, Dict, Any


class ResolutionSource(str, Enum):
    LIVE_INFERENCE = "LIVE_INFERENCE"
    LLM_CACHE = "LLM_CACHE"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class ChatMessageRecord:
    id: Optional[int]
    session_id: str
    role: str
    content: str
    metadata: Optional[Dict[str, Any]]
    created_at: str


@dataclass
class SessionRecord:
    session_id: str
    system_prompt: Optional[str]
