FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv from official image
COPY --from=ghcr.io/astral-sh/uv:0.5.21 /uv /uvx /bin/

# Copy dependency specifications
COPY pyproject.toml uv.lock ./

# Install project dependencies into /opt/venv (outside /app to avoid host volume clash)
ENV UV_PROJECT_ENVIRONMENT="/opt/venv"
RUN uv sync --frozen --no-dev

# Final runtime image
FROM python:3.12-slim AS runner

WORKDIR /app

# Install runtime libpq for PostgreSQL connectivity and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (Azim - Security requirement)
RUN addgroup --system --gid 1000 appgroup && \
    adduser --system --uid 1000 --ingroup appgroup appuser

# Copy virtualenv to /opt/venv and application to /app
COPY --from=builder --chown=appuser:appgroup /opt/venv /opt/venv
COPY --chown=appuser:appgroup . /app/

ENV PATH="/opt/venv/bin:$PATH" \
    VIRTUAL_ENV="/opt/venv" \
    PYTHONPATH="/app" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
