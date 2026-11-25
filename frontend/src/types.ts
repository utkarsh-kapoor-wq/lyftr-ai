export type ResolutionSource = "LIVE_INFERENCE" | "LLM_CACHE";

export interface ChatMetadata {
  resolution_source: ResolutionSource;
  model: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  key_id?: string | null;
  fallback_attempts: number;
}

export interface MessageItem {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  metadata?: ChatMetadata;
  timestamp: string;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  metadata: ChatMetadata;
}
