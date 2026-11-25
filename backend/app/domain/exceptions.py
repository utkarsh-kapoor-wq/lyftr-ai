class DomainException(Exception):
    """Base domain exception."""
    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


class AllProvidersUnavailableException(DomainException):
    """Raised when all LLM provider keys fail or quota exceeded."""
    def __init__(self, detail: str = "all providers unavailable"):
        super().__init__(detail=detail)


class SessionNotFoundException(DomainException):
    """Raised when querying history for an unknown session."""
    def __init__(self, detail: str = "session not found"):
        super().__init__(detail=detail)
