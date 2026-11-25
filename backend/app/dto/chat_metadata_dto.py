from typing import Optional, Literal
from pydantic import BaseModel, Field


class ChatMetadataDTO(BaseModel):
    resolution_source: Literal["LIVE_INFERENCE", "LLM_CACHE"] = Field(
        ...,
        description="Resolution source indicating cache or live execution"
    )
    model: str = Field(..., description="LiteLLM model identifier")
    latency_ms: int = Field(..., description="Server measured latency in milliseconds")
    input_tokens: int = Field(..., description="Prompt tokens for this request")
    output_tokens: int = Field(..., description="Completion tokens for this reply")
    key_id: Optional[str] = Field(
        default=None,
        description="Active provider key id, null if cached"
    )
    fallback_attempts: int = Field(
        ...,
        description="Count of provider key failures before success"
    )
