# Stage 1: Build virtual environment
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Create non-root user and persistent data directory
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    mkdir -p /data && chown -R appuser:appuser /data

# Copy installed venv and application code
COPY --from=builder /opt/venv /opt/venv
COPY app /app/app

ENV PATH="/opt/venv/bin:$PATH"
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

USER appuser

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
