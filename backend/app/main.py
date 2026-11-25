from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.infrastructure.database import db
from app.domain.exceptions import DomainException
from app.api.v1.routes.chat_routes import router as chat_router
from app.api.middleware.error_handler import (
    domain_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite database schema is initialized
    db.init_db()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title="LiteLLM Multi-turn Chat API",
    description="Production-grade multi-turn chat service with LiteLLM caching and failover.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Exception Handlers
app.add_exception_handler(DomainException, domain_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include Chat Routes (root routes)
app.include_router(chat_router)
