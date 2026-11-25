from typing import Optional, List, Dict
from app.core.config import settings
from app.domain.models import ChatMessageRecord
from app.infrastructure.database import db
from app.infrastructure.llm_gateway import llm_gateway
from app.dto.chat_request_dto import ChatRequestDTO
from app.dto.chat_response_dto import ChatResponseDTO
from app.dto.health_response_dto import HealthResponseDTO
from app.dto.session_history_response_dto import SessionHistoryResponseDTO
from app.dto.message_history_item_dto import (
    MessageHistoryItemDTO,
    AssistantHistoryMetadataDTO,
)


class ChatService:
    def __init__(self):
        self.db = db
        self.gateway = llm_gateway

    def get_health(self) -> HealthResponseDTO:
        """Verify DB connectivity and provider key configuration."""
        db_ok = self.db.check_health()
        keys_count = len(settings.key_pool)
        status_text = "ok" if db_ok and keys_count > 0 else "degraded"
        return HealthResponseDTO(
            status=status_text,
            keys_configured=keys_count,
            cache_enabled=True
        )

    def process_chat(
        self,
        request: ChatRequestDTO,
        simulate_failure_header: Optional[str] = None
    ) -> ChatResponseDTO:
        """Process incoming chat request with multi-turn history and failover."""
        session_id = request.session_id
        user_message = request.message

        # Determine effective system prompt
        effective_system_prompt: Optional[str] = None
        if request.system_prompt is not None:
            effective_system_prompt = request.system_prompt
        else:
            persisted_prompt = self.db.get_session_system_prompt(session_id)
            effective_system_prompt = persisted_prompt if persisted_prompt else settings.DEFAULT_SYSTEM_PROMPT

        # Retrieve existing message history (if session exists)
        history_records: List[ChatMessageRecord] = []
        if self.db.session_exists(session_id):
            history_records = self.db.get_messages(session_id)

        # Build message payload for LLM: [system + history + new user message]
        llm_messages: List[Dict[str, str]] = []
        if effective_system_prompt:
            llm_messages.append({"role": "system", "content": effective_system_prompt})

        for msg in history_records:
            llm_messages.append({"role": msg.role, "content": msg.content})

        llm_messages.append({"role": "user", "content": user_message})

        # Execute call via LLM Gateway (with caching and failover)
        reply, metadata = self.gateway.call_chat(
            messages=llm_messages,
            simulate_failure_header=simulate_failure_header
        )

        # Persist turn atomically only AFTER successful LLM response
        self.db.save_turn(
            session_id=session_id,
            user_content=user_message,
            assistant_reply=reply,
            metadata=metadata.model_dump(),
            system_prompt=request.system_prompt if request.system_prompt is not None else None
        )

        return ChatResponseDTO(
            session_id=session_id,
            reply=reply,
            metadata=metadata
        )

    def get_session_history(self, session_id: str) -> SessionHistoryResponseDTO:
        """Retrieve chronological history for session excluding system prompt."""
        records = self.db.get_messages(session_id)
        items: List[MessageHistoryItemDTO] = []
        for r in records:
            meta = None
            if r.role == "assistant" and r.metadata:
                meta = AssistantHistoryMetadataDTO(
                    resolution_source=r.metadata.get("resolution_source", "LIVE_INFERENCE"),
                    input_tokens=r.metadata.get("input_tokens", 0),
                    output_tokens=r.metadata.get("output_tokens", 0)
                )
            items.append(
                MessageHistoryItemDTO(
                    role=r.role,
                    content=r.content,
                    metadata=meta
                )
            )
        return SessionHistoryResponseDTO(
            session_id=session_id,
            messages=items
        )


chat_service = ChatService()
