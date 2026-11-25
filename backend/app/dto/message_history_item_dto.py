from typing import Optional, Literal
from pydantic import BaseModel, Field


class AssistantHistoryMetadataDTO(BaseModel):
    resolution_source: str = Field(..., description="Resolution source")
    input_tokens: int = Field(..., description="Input prompt tokens")
    output_tokens: int = Field(..., description="Output completion tokens")


class MessageHistoryItemDTO(BaseModel):
    role: Literal["user", "assistant"] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    metadata: Optional[AssistantHistoryMetadataDTO] = Field(
        default=None,
        description="Metadata present only on assistant messages"
    )
