from typing import List, Dict, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    LLM_API_KEYS: str = Field(
        default="test_key_1,test_key_2",
        description="Comma-separated API keys, >=2 keys required."
    )
    LLM_MODEL: str = Field(
        default="gemini/gemini-3.5-flash",
        description="Default LiteLLM model identifier."
    )
    DATABASE_URL: str = Field(
        default="sqlite:///./data/app.db",
        description="SQLite connection URL."
    )
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated CORS allowed origins."
    )
    ENABLE_FAILURE_SIMULATION: bool = Field(
        default=False,
        description="Flag enabling the X-Simulate-Failure header."
    )
    DEFAULT_SYSTEM_PROMPT: Optional[str] = Field(
        default=None,
        description="Default system prompt if none set per session."
    )

    @property
    def key_pool(self) -> Dict[str, str]:
        """Parse LLM_API_KEYS into key_1..key_n mapping."""
        raw_keys = [k.strip().strip('"').strip("'") for k in self.LLM_API_KEYS.split(",") if k.strip()]
        return {f"key_{i + 1}": key for i, key in enumerate(raw_keys)}

    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a list."""
        if self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def sqlite_db_path(self) -> str:
        """Extract filesystem path from sqlite:/// URL."""
        url = self.DATABASE_URL
        if url.startswith("sqlite:////"):
            return "/" + url[11:]
        elif url.startswith("sqlite:///"):
            return url[10:]
        elif url.startswith("sqlite://"):
            return url[9:]
        return url


settings = Settings()
