from typing import List
from pydantic import BaseModel, Field
from app.dto.message_history_item_dto import MessageHistoryItemDTO


class SessionHistoryResponseDTO(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    messages: List[MessageHistoryItemDTO] = Field(
        ...,
        description="Chronological message history list"
    )
