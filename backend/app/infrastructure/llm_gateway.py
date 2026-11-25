import time
import json
import hashlib
from typing import List, Dict, Any, Optional, Tuple
import litellm
from litellm.caching import Cache
from app.core.config import settings
from app.domain.exceptions import AllProvidersUnavailableException
from app.dto.chat_metadata_dto import ChatMetadataDTO

# Initialize LiteLLM in-memory cache
litellm.cache = Cache(type="local")
litellm.telemetry = False


class LLMGateway:
    def __init__(self):
        self.model = settings.LLM_MODEL
        self.key_pool = settings.key_pool

    def compute_cache_key(self, model: str, messages: List[Dict[str, str]]) -> str:
        """Cache key = model + full message list (role + content only)."""
        normalized = [{"role": m["role"], "content": m["content"]} for m in messages]
        raw = json.dumps({"model": model, "messages": normalized}, sort_keys=True)
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def parse_simulate_failure_header(self, header_val: Optional[str]) -> Dict[str, int]:
        """Parse X-Simulate-Failure into dict of key_id -> status."""
        if not header_val:
            return {}
        result: Dict[str, int] = {}
        for part in header_val.split(","):
            part = part.strip()
            if "=" in part:
                k, v = part.split("=", 1)
                k = k.strip()
                v = v.strip()
                if v.isdigit() and int(v) in (429, 500, 502, 503):
                    result[k] = int(v)
        return result

    def simulate_failure_exception(self, status: int) -> Exception:
        """Construct matching LiteLLM exception for simulated status code."""
        if status == 429:
            return litellm.RateLimitError(
                message="Simulated 429 Rate Limit",
                llm_provider="simulated",
                model=self.model
            )
        elif status == 500:
            return litellm.InternalServerError(
                message="Simulated 500 Internal Server Error",
                llm_provider="simulated",
                model=self.model
            )
        elif status == 502:
            return litellm.APIConnectionError(
                message="Simulated 502 Bad Gateway",
                llm_provider="simulated"
            )
        elif status == 503:
            return litellm.ServiceUnavailableError(
                message="Simulated 503 Service Unavailable",
                llm_provider="simulated"
            )
        return Exception(f"Simulated HTTP {status}")

    def call_chat(
        self,
        messages: List[Dict[str, str]],
        simulate_failure_header: Optional[str] = None
    ) -> Tuple[str, ChatMetadataDTO]:
        start_time = time.perf_counter()
        cache_key = self.compute_cache_key(self.model, messages)

        # Parse failover simulation header if enabled
        sim_map: Dict[str, int] = {}
        skip_cache_read = False
        if settings.ENABLE_FAILURE_SIMULATION and simulate_failure_header:
            sim_map = self.parse_simulate_failure_header(simulate_failure_header)
            if sim_map:
                skip_cache_read = True

        # Check Cache if not skipping cache read
        if not skip_cache_read:
            cached_data = litellm.cache.cache.get_cache(cache_key)
            if cached_data:
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                meta = ChatMetadataDTO(
                    resolution_source="LLM_CACHE",
                    model=self.model,
                    latency_ms=latency_ms,
                    input_tokens=cached_data["input_tokens"],
                    output_tokens=cached_data["output_tokens"],
                    key_id=None,
                    fallback_attempts=0
                )
                return cached_data["reply"], meta

        # Key pool fallback loop
        fallback_attempts = 0
        keys = list(self.key_pool.items())
        if not keys:
            raise AllProvidersUnavailableException("all providers unavailable")

        for key_id, api_key in keys:
            # Check simulated failure for current key or wildcard '*'
            sim_status = sim_map.get(key_id) or sim_map.get("*")
            if sim_status is not None:
                fallback_attempts += 1
                continue

            try:
                response = litellm.completion(
                    model=self.model,
                    messages=messages,
                    api_key=api_key,
                    caching=True,
                    num_retries=0,
                    timeout=30
                )

                # Check if litellm internal cache hit
                is_cache_hit = False
                if hasattr(response, "_hidden_params") and isinstance(response._hidden_params, dict):
                    is_cache_hit = response._hidden_params.get("cache_hit", False)

                reply = response.choices[0].message.content or ""
                input_tokens = response.usage.prompt_tokens if hasattr(response, "usage") and response.usage else 0
                output_tokens = response.usage.completion_tokens if hasattr(response, "usage") and response.usage else 0

                # Cache response for subsequent identical requests
                litellm.cache.cache.set_cache(
                    cache_key,
                    {
                        "reply": reply,
                        "input_tokens": input_tokens,
                        "output_tokens": output_tokens
                    }
                )

                latency_ms = int((time.perf_counter() - start_time) * 1000)
                meta = ChatMetadataDTO(
                    resolution_source="LLM_CACHE" if is_cache_hit else "LIVE_INFERENCE",
                    model=self.model,
                    latency_ms=latency_ms,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    key_id=None if is_cache_hit else key_id,
                    fallback_attempts=0 if is_cache_hit else fallback_attempts
                )
                return reply, meta

            except Exception:
                fallback_attempts += 1
                continue

        # If all keys failed, raise 503 domain exception
        raise AllProvidersUnavailableException("all providers unavailable")


llm_gateway = LLMGateway()
