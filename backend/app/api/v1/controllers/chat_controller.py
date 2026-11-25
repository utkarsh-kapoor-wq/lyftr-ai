from typing import Optional
from app.services.chat_service import chat_service
from app.dto.chat_request_dto import ChatRequestDTO
from app.dto.chat_response_dto import ChatResponseDTO
from app.dto.health_response_dto import HealthResponseDTO
from app.dto.session_history_response_dto import SessionHistoryResponseDTO


class ChatController:
    def __init__(self):
        self.service = chat_service

    def get_health(self) -> HealthResponseDTO:
        return self.service.get_health()

    def post_chat(
        self,
        request: ChatRequestDTO,
        simulate_failure_header: Optional[str] = None
    ) -> ChatResponseDTO:
        return self.service.process_chat(
            request=request,
            simulate_failure_header=simulate_failure_header
        )

    def get_session_messages(self, session_id: str) -> SessionHistoryResponseDTO:
        return self.service.get_session_history(session_id=session_id)


chat_controller = ChatController()
