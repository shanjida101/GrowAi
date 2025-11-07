# ---- base image ----
FROM python:3.11-slim

# Prevent python from writing .pyc files & buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps (wheel building is rare, but these keep builds smooth)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Install Python deps first (layer cache)
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install -r /app/requirements.txt

# Copy application code
COPY app /app/app

# Expose the application port (Railway sets $PORT, but useful locally)
EXPOSE 8000

# Default start command (Railway will pass $PORT)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
# ---- base image ----
FROM python:3.11-slim

# Prevent python from writing .pyc files & buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps (wheel building is rare, but these keep builds smooth)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Install Python deps first (layer cache)
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install -r /app/requirements.txt

# Copy application code
COPY app /app/app

# Expose the application port (Railway sets $PORT, but useful locally)
EXPOSE 8000

# Default start command (Railway will pass $PORT)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
