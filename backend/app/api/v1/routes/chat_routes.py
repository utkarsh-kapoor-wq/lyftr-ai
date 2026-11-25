from typing import Optional
from fastapi import APIRouter, Header, Depends, status
from app.api.v1.controllers.chat_controller import chat_controller, ChatController
from app.dto.chat_request_dto import ChatRequestDTO
from app.dto.chat_response_dto import ChatResponseDTO
from app.dto.health_response_dto import HealthResponseDTO
from app.dto.session_history_response_dto import SessionHistoryResponseDTO

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Verify DB is reachable and key pool is loaded."
)
def get_health(
    controller: ChatController = Depends(lambda: chat_controller)
) -> HealthResponseDTO:
    return controller.get_health()


@router.post(
    "/chat",
    response_model=ChatResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Chat completion",
    description="Multi-turn chat completion with failover and caching."
)
def post_chat(
    request: ChatRequestDTO,
    x_simulate_failure: Optional[str] = Header(
        default=None,
        alias="X-Simulate-Failure",
        description="Optional failover simulation header"
    ),
    controller: ChatController = Depends(lambda: chat_controller)
) -> ChatResponseDTO:
    return controller.post_chat(
        request=request,
        simulate_failure_header=x_simulate_failure
    )


@router.get(
    "/sessions/{session_id}/messages",
    response_model=SessionHistoryResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Session messages history",
    description="Retrieve chronological message history for session without system prompt."
)
def get_session_messages(
    session_id: str,
    controller: ChatController = Depends(lambda: chat_controller)
) -> SessionHistoryResponseDTO:
    return controller.get_session_messages(session_id=session_id)
