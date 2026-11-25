from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ChatRequestDTO(BaseModel):
    session_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Session identifier (1-128 characters)"
    )
    message: str = Field(
        ...,
        description="User message content (1-4000 characters after trim)"
    )
    system_prompt: Optional[str] = Field(
        default=None,
        description="Optional system prompt overriding session default"
    )

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed or len(trimmed) > 128:
            raise ValueError("session_id must be between 1 and 128 non-whitespace characters")
        return trimmed

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("message cannot be empty or whitespace only")
        if len(trimmed) > 4000:
            raise ValueError("message must not exceed 4000 characters after trimming")
        return trimmed

    @field_validator("system_prompt")
    @classmethod
    def validate_system_prompt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            return trimmed if trimmed else None
        return None
