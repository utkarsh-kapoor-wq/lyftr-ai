from pydantic import BaseModel, Field


class HealthResponseDTO(BaseModel):
    status: str = Field(default="ok", description="Health status string")
    keys_configured: int = Field(..., description="Number of configured LLM API keys")
    cache_enabled: bool = Field(default=True, description="Whether cache is enabled")
