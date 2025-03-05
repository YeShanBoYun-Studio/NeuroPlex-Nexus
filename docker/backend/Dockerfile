# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Runtime stage
FROM python:3.11-slim as runtime

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data/cache /app/data/config /app/logs

# Set environment variables
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    NEURACOLLAB_ENV=production

# Production stage
FROM runtime as production
EXPOSE 8000
CMD ["uvicorn", "neuracollab.server:app", "--host", "0.0.0.0", "--port", "8000"]

# Development stage
FROM runtime as development
RUN pip install debugpy pytest pytest-asyncio pytest-cov black isort mypy
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    NEURACOLLAB_ENV=development
EXPOSE 8000 5678
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "neuracollab.server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
