from pydantic import BaseModel, Field
from app.dto.chat_metadata_dto import ChatMetadataDTO


class ChatResponseDTO(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    reply: str = Field(..., min_length=1, description="Non-empty assistant reply")
    metadata: ChatMetadataDTO = Field(..., description="Per-request generation metadata")
